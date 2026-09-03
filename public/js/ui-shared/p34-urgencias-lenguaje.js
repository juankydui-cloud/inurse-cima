/* ═══════════════════════════════════════════════════════════════════════════
   P3.4 · Urgencias descritas en lenguaje natural
   ---------------------------------------------------------------------------
   Quien tiene una urgencia delante no escribe "parada cardiorrespiratoria":
   escribe "no responde y no respira". La recuperación de fichas puntúa por
   solapamiento de palabras con el título, las etiquetas y el cuerpo, así que
   esas frases no enganchaban NADA de soporte vital.

   Y no fallaban en silencio, que habría sido menos grave: al puntuar palabras
   sueltas como "paciente" o "está", devolvían fichas ajenas con aspecto de
   acierto. Medido antes de este arreglo:

     "se ha desmayado y no reacciona" → MAGALDRATO | CITARABINA | MESNA
     "está sangrando mucho"           → Estatus epiléptico | EHH | Estatus asmático

   Eso metía ruido clínico en el contexto del modelo, que es peor que no
   recuperar nada.

   Aquí se traduce el lenguaje coloquial de urgencia a los términos con los que
   están escritas las fichas, ANTES de buscar. No se inventa contenido: sólo se
   cambia con qué palabras se busca.

   La misma detección decide si la respuesta es de emergencia, para que el
   panel no pinte bibliografía en mitad de una reanimación. Una sola definición
   de "esto es una urgencia" para las dos cosas: si hubiera dos, acabarían
   discrepando.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  function nrm(s){
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* Cada entrada: cómo lo dice la gente → con qué palabras están escritas las
     fichas. Los términos de la derecha se han comprobado contra los títulos
     reales de public/data/guias.js; si se añade una entrada nueva, hay que
     comprobar que engancha una ficha existente, no suponerlo. */
  var URGENCIAS = [
    {
      clave: 'parada',
      // "no respira" y "sin pulso" mandan aunque también se diga que no responde
      re: /\bno\s+(respira|ventila)\b|\bsin\s+(pulso|respiracion|signos\s+de\s+vida)\b|\bno\s+tiene\s+pulso\b|\bparada\b|\bpcr\b|\bse\s+ha\s+parado\b|\bno\s+le\s+noto\s+el\s+pulso\b/,
      // Sin "desfibrilacion": en una parada recién presenciada lo primero es el
      // soporte vital básico, y ese término hacía ganar a "Ritmos NO
      // desfibrilables". La desfibrilación entra por su propia clave, cuando se
      // menciona el ritmo o el aparato.
      terminos: 'soporte vital basico RCP parada cardiorrespiratoria reanimacion cardiopulmonar compresiones'
    },
    {
      clave: 'atragantamiento',
      re: /\batragant/,
      terminos: 'atragantamiento obstruccion de la via aerea por cuerpo extrano Heimlich soporte vital basico'
    },
    {
      clave: 'atragantamiento',
      re: /\bse\s+(esta\s+)?ahoga(ndo)?\b|\bse\s+le\s+ha\s+ido\s+por\s+otro\s+lado\b|\bno\s+puede\s+(respirar|tragar)\b.*\b(comi|trag|bocado|comida)/,
      terminos: 'atragantamiento obstruccion de la via aerea cuerpo extrano soporte vital basico'
    },
    {
      clave: 'inconsciencia',
      re: /\bno\s+(responde|reacciona|contesta)\b|\binconsciente\b|\bse\s+ha\s+desmayado\b|\bse\s+ha\s+desvanecido\b|\bse\s+ha\s+desplomado\b|\bno\s+se\s+despierta\b|\bno\s+abre\s+los\s+ojos\b/,
      terminos: 'paciente en coma inconsciencia soporte vital basico RCP valoracion nivel de consciencia Glasgow'
    },
    {
      clave: 'parada',
      // Turnos de seguimiento DENTRO de una parada: el ritmo que marca el
      // monitor. Términos comprobados contra "RCP avanzado — Algoritmo universal
      // con dosis", "Ritmos NO desfibrilables (Asistolia / AESP)" y
      // "Desfibrilación y cardioversión".
      re: /\bfibrilacion\s+ventricular\b|\btaquicardia\s+ventricular\s+sin\s+pulso\b|\bdesfibril|\basistolia\b|\baesp\b|\bactividad\s+electrica\s+sin\s+pulso\b|\bdea\b/,
      terminos: 'RCP avanzado algoritmo desfibrilacion ritmos desfibrilables asistolia soporte vital'
    },
    {
      clave: 'hemorragia',
      re: /\bsangra(ndo)?\b|\bsangre\b|\bhemorragia\b|\bse\s+desangra\b|\bno\s+para\s+de\s+sangrar\b/,
      terminos: 'hemorragia shock hipovolemico control de la hemorragia transfusion masiva'
    },
    {
      clave: 'convulsion',
      re: /\bconvulsion(a|ando)?\b|\bconvulsiones\b|\bataque\s+epileptico\b|\ble\s+ha\s+dado\s+un\s+ataque\b|\bespasmos\b/,
      terminos: 'convulsiones epilepsia estatus epileptico crisis comicial'
    },
    {
      clave: 'anafilaxia',
      re: /\banafilaxi/,
      terminos: 'anafilaxia adrenalina intramuscular reaccion alergica grave'
    },
    {
      clave: 'anafilaxia',
      re: /\b(se\s+le\s+)?(hincha|ha\s+hinchado|esta\s+hinchando)\b.*\b(garganta|cara|labios|lengua)\b|\breaccion\s+alergica\s+grave\b/,
      terminos: 'anafilaxia adrenalina intramuscular reaccion alergica grave'
    }
  ];

  /* ── Números de emergencia dictados por voz ────────────────────────────────
     El reconocimiento de voz transcribió "112" como "alumno uno dos": oye los
     dígitos sueltos y los encaja en la palabra más probable de su vocabulario
     general. Si eso llega al modelo, la indicación de avisar al 112 se pierde
     o se convierte en ruido. Se normaliza ANTES de pasar el texto al modelo.

     Se cubren las tres formas en que puede llegar cada número: la cifra, los
     dígitos deletreados, y el número dicho entero. */
  var NUMEROS_EMERGENCIA = [
    { numero: '112', re: /\b(alumno\s+uno\s+dos|a\s*uno\s*uno\s*dos|uno\s+uno\s+dos|ciento\s+doce|cien\s+doce|112)\b/g },
    { numero: '061', re: /\b(cero\s+sesenta\s+y\s+uno|cero\s+seis\s+uno|cero\s+sesenta\s*y?\s*uno|061)\b/g }
  ];

  function normalizarEmergencias(texto){
    var t = String(texto || '');
    for (var i = 0; i < NUMEROS_EMERGENCIA.length; i++){
      // Se compara sin tildes pero se sustituye sobre el texto original, para no
      // devolver al modelo un texto desacentuado.
      var re = NUMEROS_EMERGENCIA[i].re;
      var num = NUMEROS_EMERGENCIA[i].numero;
      t = t.replace(new RegExp(re.source, 'gi'), num);
    }
    return t;
  }

  /* ── Ámbito de la ficha: ¿asistencia a pie de cama, o gestión? ──────────────
     En una parada extrahospitalaria se coló la ficha de donación en asistolia
     controlada (Maastricht III). No es un error de puntuación: esa ficha lleva
     "soporte vital" en sus etiquetas —por la limitación del tratamiento de
     soporte vital— y comparte vocabulario con la parada. Compite legítimamente
     por léxico; lo que no tiene es aplicabilidad durante una reanimación.

     El criterio NO es una lista de títulos prohibidos, que envejecería con el
     catálogo: es el DOMINIO al que pertenece la ficha, leído en los campos que
     declaran su identidad (título, etiquetas y fuente). Una ficha cuya identidad
     se define por donación y trasplantes, coordinación, trámites, legislación o
     gestión de la calidad es de ámbito organizativo, se llame como se llame, y
     una ficha nueva del mismo dominio queda cubierta sin tocar nada.

     Se exigen DOS marcadores distintos: con uno solo, una ficha clínica que
     mencione de pasada "protocolo del centro" quedaría fuera sin merecerlo.

     Esto NO borra nada del catálogo. La ficha se sigue encontrando al buscarla,
     y en modo consulta compite como siempre. Sólo deja de competir cuando hay
     una urgencia en curso. */
  var GESTION = [
    /\bdonacion(es)?\b|\bdonante(s)?\b/,
    /\btrasplante(s)?\b|\breceptor(es)?\b|\bont\b/,
    /\bcoordinacion\b|\bcoordinador(a|es)?\b/,
    /\bcomite(s)?\b|\bcomision(es)?\b/,
    /\blegislacion\b|\bnormativa\b|\bley(es)?\b|\bjuridic|\bjudicial\b|\bforense\b/,
    /\btramite(s)?\b|\bgestion\b|\bacreditacion\b|\bauditoria\b|\bfacturacion\b/,
    /\blista(s)?\s+de\s+espera\b|\blogistica\b|\bcircuito\s+administrativo\b/,
    /\bdocencia\b|\bformacion\s+continuada\b|\binvestigacion\s+clinica\b/,
    /\blimitacion\s+(del\s+)?(tratamiento|esfuerzo)\b|\bltsv\b|\badecuacion\s+del\s+esfuerzo\b/
  ];

  function esGestion(textoIdentidad){
    var t = nrm(textoIdentidad);
    var n = 0;
    for (var i = 0; i < GESTION.length; i++) if (GESTION[i].test(t)) n++;
    return n >= 2;
  }

  /* Devuelve { urgencia, claves, terminos } — claves en plural porque una frase
     puede tocar dos cuadros a la vez ("no responde y no respira" es
     inconsciencia + parada, y las dos fichas vienen bien). */
  function detectar(texto){
    var t = nrm(texto);
    var claves = [], terminos = [];
    for (var i = 0; i < URGENCIAS.length; i++){
      if (URGENCIAS[i].re.test(t)){
        if (claves.indexOf(URGENCIAS[i].clave) < 0) claves.push(URGENCIAS[i].clave);
        terminos.push(URGENCIAS[i].terminos);
      }
    }
    return { urgencia: claves.length > 0, claves: claves, terminos: terminos.join(' ') };
  }

  /* Detectar el cuadro clínico y detectar que está PASANDO son dos cosas
     distintas, y confundirlas rompe una de las dos:
       - "cómo se maneja un atragantamiento" → hay que buscar la ficha de
         atragantamiento (expandir SÍ), pero es una consulta de estudio y su
         respuesta lleva bibliografía como cualquier otra.
       - "se está atragantando" → lo mismo para buscar, pero además es una
         urgencia en curso, y ahí la bibliografía estorba.
     Estas marcas delatan la pregunta teórica: quien tiene la urgencia delante
     no escribe "en qué consiste". */
  var TEORICA = /^\s*(como|que|cual(es)?|cuando|cuanto|por\s+que|para\s+que|en\s+que)\b|\bmanejo\s+de\b|\bprotocolo\b|\balgoritmo\b|\bdosis\s+de\b|\bexplica\b|\bdiferencia\b|\bdefinicion\b|\bcuidados\s+de\b|\bsignos\s+de\b|\bsintomas\s+de\b|\bindicaciones\b|\btratamiento\s+de\b/;

  /* ¿Está ocurriendo ahora? Sólo entonces la respuesta es de emergencia. */
  function enCurso(texto){
    var d = detectar(texto);
    if (!d.urgencia) return false;
    return !TEORICA.test(nrm(texto));
  }

  /* Texto con el que buscar: el original más los términos clínicos. Se
     conserva el original porque puede llevar datos que importan (la edad, el
     fármaco implicado), y esos también deben pesar en la búsqueda. */
  function expandir(texto){
    var d = detectar(texto);
    return d.urgencia ? (String(texto || '') + ' ' + d.terminos) : String(texto || '');
  }

  window.EnferixUrgencias = { detectar: detectar, expandir: expandir, enCurso: enCurso, esGestion: esGestion, normalizarEmergencias: normalizarEmergencias };
})();
