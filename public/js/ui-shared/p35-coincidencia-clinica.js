/* ═══════════════════════════════════════════════════════════════════════════
   P3.5 · Qué palabra identifica un tema clínico, y cómo se decide que casa
   ---------------------------------------------------------------------------
   Las tres recuperaciones internas de Enferix (guías + vademécum en el chat y
   la portada, biblioteca virtual, y el índice propio de Javny Live) puntuaban
   igual todas las palabras de la pregunta y las buscaban como subcadena. Eso
   producía dos fallos distintos, los dos medidos sobre el corpus real:

   1 · La palabra de proceso gana a la palabra clínica. "Cuidados", "manejo" o
       "protocolo" aparecen en decenas de títulos y no dicen NADA del tema, pero
       puntuaban lo mismo que el término que sí lo identifica:

         "qué cuidados lleva una sonda vesical permanente"
              → Cuidados post-resucitación | Cuidados post-parada cardíaca
         "manejo de la hiperpotasemia"
              → EPOC: diagnóstico y manejo | Manejo prehospitalario del shock

   2 · La subcadena engancha palabras que no están. Buscar por `indexOf` hace
       que "presion" case dentro de "inmunoSUPRESION" y "st" (del síndrome
       coronario, que la tabla de sinónimos usaba como clave) dentro de
       "traqueoSTomia" — de ahí salía el infarto en una pregunta sobre
       traqueostomía:

         "cuidados del paciente con traqueostomía"
              → Dolor torácico y síndrome coronario agudo
         "protocolo de úlceras por presión"
              → Inmunosupresión después de trasplante cardíaco

       Aparte, cada recuperación llevaba su propia lista de palabras vacías, y
       la de la Biblioteca no incluía "con", "del" ni "una": entraban como
       término de búsqueda y devolvían "Cinco elementos del CONsentimiento
       informado" o "Clasificación de la profundidad de UNA quemadura".

   Aquí viven las dos decisiones, UNA sola vez. Si cada recuperación llevara su
   copia acabarían discrepando, y Javny serviría en el chat la ficha que la
   portada descarta.

   `casa()` exige que la coincidencia empiece en un principio de palabra, no en
   cualquier posición: sigue cubriendo la morfología ("cuidado" casa
   "cuidados", "hiperpotasemia" casa "hiperpotasémica") sin cazar palabras
   ajenas por su final. Ojo: al ser por principio de palabra y no por palabra
   entera, un término corto sigue casando dentro de otro más largo que empiece
   igual ("con" casa "consentimiento"); de eso se ocupa la lista de palabras
   vacías, que ahora es una sola para las tres recuperaciones.

   Los índices se preparan con `indice()`, que convierte todo lo que no sea
   letra o dígito en separador — así "post-parada" sigue casando con "parada".

   No se inventa contenido ni se traduce nada: sólo cambia qué peso tiene cada
   palabra y cómo se decide que aparece.

   Carga: este archivo debe ir ANTES que inline-script-4931.js,
   inurse21-master-js.js e inurse-v26-live-js.js, que lo usan para construir
   sus índices.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* Palabras vacías del castellano. Una sola lista: las tres recuperaciones
     llevaban la suya y ninguna las cubría todas. */
  var STOP = {};
  ('de la el los las un una unos unas y o u en con por para del al que se su sus ' +
   'es son ser esta este esto estos estas ese esa eso aquel aquella como cual ' +
   'cuales cuando donde sobre entre desde hasta ante tras sin segun mas menos muy ' +
   'todo toda todos todas otro otra otros otras cada cualquier hay tiene tengo ' +
   'tienen debo debe deben puede pueden hacer hago haces lleva llevan poner pone ' +
   'me mi te tu lo le les nos que qué cómo cuál cuándo dónde por qué'
  ).split(' ').forEach(function(w){ if(w) STOP[w] = 1; });

  /* Palabras que describen el PROCESO, no el tema. Están en el título de media
     biblioteca y por eso no pueden decidir qué ficha gana. No se descartan: se
     quedan como desempate, por detrás de cualquier término clínico.

     El orquestador mantiene su propia lista (sources/orchestrator.mjs,
     PALABRAS_DE_PROCESO) para un trabajo distinto: filtrar la literatura de
     las fuentes generalistas. Comparten idea, no corpus ni consecuencias. */
  var PROCESO = {};
  ('manejo manejos tratamiento tratamientos abordaje abordajes protocolo ' +
   'protocolos guia guias cuidado cuidados atencion valoracion control ' +
   'seguimiento diagnostico paciente pacientes adulto adultos adulta adultas ' +
   'clinica clinico clinicas clinicos hospitalario hospitalaria general ' +
   'generales enfermeria actuacion procedimiento procedimientos tecnica ' +
   'tecnicas indicaciones recomendaciones criterios pautas plan planes ' +
   'prevencion prevenciones prevenir'
  ).split(' ').forEach(function(w){ if(w) PROCESO[w] = 1; });

  /* Texto normalizado: sin acentos, en minúsculas y con todo lo que no sea
     letra o dígito convertido en separador. */
  function normalizar(s){
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* Índice listo para `casa()`: normalizado y con separadores en los bordes,
     para que la primera y la última palabra se comporten como las demás. */
  function indice(texto){
    return ' ' + normalizar(texto) + ' ';
  }

  /* ¿Aparece el término en el índice, empezando palabra? */
  function casa(idx, termino){
    if (!idx || !termino) return false;
    return idx.indexOf(' ' + termino) >= 0;
  }

  /* Cuando la palabra de la calle no es la palabra del corpus. Mismo problema
     que P3.4 resuelve para las urgencias contadas en lenguaje natural, aquí
     para la consulta tranquila: se pregunta por "úlceras por presión" y las
     fichas están escritas como "lesiones por presión" (el cambio de
     nomenclatura de EPUAP/NPIAP), así que ganaba cualquier ficha con la
     palabra "presión" —la presión arterial del ictus, la del balón de
     neumotaponamiento, la intracraneal— y ninguna del tema.

     No se sustituye el término: se AÑADE el del corpus, para que la ficha que
     usa las dos formas siga puntuando por ambas.

     Regla para añadir una entrada: comprobar que engancha un título real de
     guias.js o de la Biblioteca, no suponerlo. Si no engancha ninguna ficha,
     no se añade. */
  var VOCABULARIO = [
    /* "Prevención de lesiones por presión", "Prevención de contracturas y
       lesiones por presión" (Biblioteca virtual). */
    { cuando: /\bulceras?\s+por\s+presion\b|\bupp\b|\bescaras?\b/, anade: 'lesiones por presion' }
  ];

  /* Reparto de la pregunta en términos clínicos y palabras de proceso.

     Si la pregunta es SÓLO proceso ("qué cuidados generales lleva"), no queda
     nada con lo que buscar: en ese caso los de proceso hacen de clínicos, que
     es exactamente el comportamiento anterior, y `hayClinicos` lo advierte para
     que quien filtre por coherencia no se quede sin nada que ofrecer. */
  function terminos(texto){
    var base = normalizar(texto);
    VOCABULARIO.forEach(function(v){ if (v.cuando.test(base)) base += ' ' + v.anade; });
    var vistos = {}, todos = [];
    base.split(' ').forEach(function(w){
      if (w.length > 2 && !STOP[w] && !vistos[w]) { vistos[w] = 1; todos.push(w); }
    });
    var clinicos = todos.filter(function(w){ return !PROCESO[w]; });
    var proceso  = todos.filter(function(w){ return !!PROCESO[w]; });
    return {
      todos: todos,
      clinicos: clinicos.length ? clinicos : todos.slice(),
      proceso: clinicos.length ? proceso : [],
      hayClinicos: clinicos.length > 0
    };
  }

  function esProceso(palabra){ return !!PROCESO[normalizar(palabra)]; }

  window.EnferixCoincidencia = {
    normalizar: normalizar,
    indice: indice,
    casa: casa,
    terminos: terminos,
    esProceso: esProceso
  };
})();
