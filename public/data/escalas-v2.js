/* Escalas clínicas · segunda tanda
   ────────────────────────────────────────────────────────────────────────────
   Se añaden al catálogo CALCS que define /data/escalas.js en vez de editarlo:
   así el fichero original —34 KB ya— no se vuelve inmanejable y se ve de un
   vistazo qué entró en esta tanda.

   Criterios que sigue todo lo de aquí:

   · Ítems y puntos de corte tal como están publicados. Donde los autores no
     coinciden se dice en la interpretación, en vez de elegir uno en silencio.
   · Ninguna escala afirma un diagnóstico: dan puntuación y el rango en que
     cae, que es lo que hace la escala de papel.
   · No se incluye el Mini-Mental (MMSE): es propiedad de PAR Inc. y se
     licencia, así que reproducirlo aquí sería un problema de derechos.
     Pfeiffer cubre el mismo cribado y es de uso libre. */
(function(){
  "use strict";
  if(typeof CALCS === "undefined") return;

  function rango(t, cortes){
    for(var i=0;i<cortes.length;i++){ if(t<=cortes[i][0]) return cortes[i][1]; }
    return cortes[cortes.length-1][1];
  }
  // Sí/no en formato de opciones, que es lo único que sabe pintar el
  // renderizador de calculadoras.
  function sino(p){ return [{v:0,l:"No"},{v:(p==null?1:p),l:"Sí"}]; }

  var NUEVAS = {

  /* ══════════════ Piel y úlceras por presión ══════════════ */

  emina: {
    title:"EMINA (riesgo de UPP)", icon:"🛏️", tag:"Enfermería / UPP",
    fields:[
      { id:"men", label:"Estado mental", options:[
        {v:0,l:"0 — Orientado"},{v:1,l:"1 — Desorientado, apático o pasivo"},
        {v:2,l:"2 — Letárgico o hipercinético"},{v:3,l:"3 — Comatoso"}]},
      { id:"mov", label:"Movilidad", options:[
        {v:0,l:"0 — Completa"},{v:1,l:"1 — Ligeramente limitada"},
        {v:2,l:"2 — Limitación importante"},{v:3,l:"3 — Inmóvil"}]},
      { id:"inc", label:"Incontinencia", options:[
        {v:0,l:"0 — No / sondaje vesical"},{v:1,l:"1 — Urinaria o fecal ocasional"},
        {v:2,l:"2 — Urinaria o fecal habitual"},{v:3,l:"3 — Urinaria y fecal"}]},
      { id:"nut", label:"Nutrición", options:[
        {v:0,l:"0 — Correcta"},{v:1,l:"1 — Ocasionalmente incompleta"},
        {v:2,l:"2 — Incompleta"},{v:3,l:"3 — No ingesta o desnutrición"}]},
      { id:"act", label:"Actividad", options:[
        {v:0,l:"0 — Deambula"},{v:1,l:"1 — Deambula con ayuda"},
        {v:2,l:"2 — Siempre precisa ayuda"},{v:3,l:"3 — No deambula"}]}
    ],
    compute:function(v){
      var t=v.men+v.mov+v.inc+v.nut+v.act;
      var i = t===0 ? "🟢 Sin riesgo — mantener vigilancia y reevaluar si cambia la situación"
        : t<=3 ? "🟡 Riesgo bajo — vigilancia de la piel y cambios posturales según protocolo"
        : t<=7 ? "🟠 Riesgo medio — pauta de cambios posturales y protección de prominencias óseas"
        : "🔴 Riesgo alto — superficie especial de manejo de presión y revisión diaria de la piel";
      return { main:"EMINA "+t+" / 15", detail:"A mayor puntuación, mayor riesgo.", interp:i };
    }
  },

  bradenQ: {
    title:"Braden Q (UPP pediátrica)", icon:"🧸", tag:"Pediatría / UPP",
    fields:[
      { id:"mov", label:"Movilidad", options:[
        {v:1,l:"1 — Completamente inmóvil"},{v:2,l:"2 — Muy limitada"},
        {v:3,l:"3 — Ligeramente limitada"},{v:4,l:"4 — Sin limitaciones"}]},
      { id:"act", label:"Actividad", options:[
        {v:1,l:"1 — Encamado"},{v:2,l:"2 — En silla"},
        {v:3,l:"3 — Deambula ocasionalmente"},{v:4,l:"4 — Todos los niños muy pequeños o deambula con frecuencia"}]},
      { id:"sen", label:"Percepción sensorial", options:[
        {v:1,l:"1 — Completamente limitada"},{v:2,l:"2 — Muy limitada"},
        {v:3,l:"3 — Ligeramente limitada"},{v:4,l:"4 — Sin alteraciones"}]},
      { id:"hum", label:"Humedad", options:[
        {v:1,l:"1 — Piel constantemente húmeda"},{v:2,l:"2 — Muy húmeda"},
        {v:3,l:"3 — Ocasionalmente húmeda"},{v:4,l:"4 — Raramente húmeda"}]},
      { id:"fri", label:"Fricción y cizallamiento", options:[
        {v:1,l:"1 — Problema significativo"},{v:2,l:"2 — Problema"},
        {v:3,l:"3 — Problema potencial"},{v:4,l:"4 — Sin problema aparente"}]},
      { id:"nut", label:"Nutrición", options:[
        {v:1,l:"1 — Muy pobre"},{v:2,l:"2 — Inadecuada"},
        {v:3,l:"3 — Adecuada"},{v:4,l:"4 — Excelente"}]},
      { id:"per", label:"Perfusión tisular y oxigenación", options:[
        {v:1,l:"1 — Extremadamente comprometida"},{v:2,l:"2 — Comprometida"},
        {v:3,l:"3 — Adecuada"},{v:4,l:"4 — Excelente"}]}
    ],
    compute:function(v){
      var t=v.mov+v.act+v.sen+v.hum+v.fri+v.nut+v.per;
      var i = t<=16 ? "🔴 Riesgo de UPP — medidas de prevención activas"
        : t<=22 ? "🟠 Riesgo moderado — reforzar prevención y reevaluar"
        : "🟢 Riesgo bajo — mantener vigilancia";
      return { main:"Braden Q "+t+" / 28",
        detail:"Aquí, a menor puntuación mayor riesgo (al revés que EMINA o Norton).",
        interp:i+"<br><small>El corte más difundido es ≤16; algunos centros usan ≤22 para no perder casos.</small>" };
    }
  },

  /* ══════════════ Caídas ══════════════ */

  downton: {
    title:"Downton (riesgo de caídas)", icon:"⚠️", tag:"Enfermería / Seguridad",
    fields:[
      { id:"cai", label:"Caídas previas", options:sino() },
      { id:"m1",  label:"Toma tranquilizantes o sedantes", options:sino() },
      { id:"m2",  label:"Toma diuréticos", options:sino() },
      { id:"m3",  label:"Toma hipotensores (no diuréticos)", options:sino() },
      { id:"m4",  label:"Toma antiparkinsonianos", options:sino() },
      { id:"m5",  label:"Toma antidepresivos", options:sino() },
      { id:"m6",  label:"Otros medicamentos", options:sino() },
      { id:"s1",  label:"Déficit visual", options:sino() },
      { id:"s2",  label:"Déficit auditivo", options:sino() },
      { id:"s3",  label:"Afectación de extremidades (ictus, amputación…)", options:sino() },
      { id:"men", label:"Estado mental", options:[
        {v:0,l:"0 — Orientado"},{v:1,l:"1 — Confuso"}]},
      { id:"dea", label:"Deambulación", options:[
        {v:0,l:"0 — Normal"},{v:0,l:"0 — Segura con ayuda"},
        {v:1,l:"1 — Insegura con ayuda"},{v:1,l:"1 — Imposible"}]}
    ],
    compute:function(v){
      var t=v.cai+v.m1+v.m2+v.m3+v.m4+v.m5+v.m6+v.s1+v.s2+v.s3+v.men+v.dea;
      var i = t>=3
        ? "🔴 Alto riesgo de caída — activar medidas de prevención según protocolo del centro"
        : "🟢 Bajo riesgo — mantener vigilancia habitual y reevaluar si cambia la medicación o la movilidad";
      return { main:"Downton "+t+" puntos",
        detail:"Cada factor presente suma un punto.",
        interp:i+"<br><small>Punto de corte de referencia: 3 o más puntos = alto riesgo.</small>" };
    }
  },

  tinetti: {
    title:"Tinetti (equilibrio y marcha)", icon:"🚶", tag:"Geriatría / Caídas",
    fields:[
      { id:"e1", label:"Equilibrio sentado", options:[
        {v:0,l:"0 — Se inclina o desliza"},{v:1,l:"1 — Firme y seguro"}]},
      { id:"e2", label:"Levantarse", options:[
        {v:0,l:"0 — Incapaz sin ayuda"},{v:1,l:"1 — Capaz usando los brazos"},{v:2,l:"2 — Capaz sin usar los brazos"}]},
      { id:"e3", label:"Intentos de levantarse", options:[
        {v:0,l:"0 — Incapaz sin ayuda"},{v:1,l:"1 — Capaz en más de un intento"},{v:2,l:"2 — Capaz a la primera"}]},
      { id:"e4", label:"Equilibrio inmediato de pie (primeros 5 s)", options:[
        {v:0,l:"0 — Inestable"},{v:1,l:"1 — Estable con apoyo"},{v:2,l:"2 — Estable sin apoyo"}]},
      { id:"e5", label:"Equilibrio de pie", options:[
        {v:0,l:"0 — Inestable"},{v:1,l:"1 — Estable con base amplia o apoyo"},{v:2,l:"2 — Base estrecha sin apoyo"}]},
      { id:"e6", label:"Empujón (esternón, 3 veces)", options:[
        {v:0,l:"0 — Empieza a caerse"},{v:1,l:"1 — Se tambalea, se agarra"},{v:2,l:"2 — Firme"}]},
      { id:"e7", label:"Ojos cerrados", options:[
        {v:0,l:"0 — Inestable"},{v:1,l:"1 — Estable"}]},
      { id:"e8", label:"Giro de 360°", options:[
        {v:0,l:"0 — Pasos discontinuos e inestable"},{v:1,l:"1 — Pasos continuos o estable"},{v:2,l:"2 — Continuos y estable"}]},
      { id:"e9", label:"Sentarse", options:[
        {v:0,l:"0 — Inseguro, calcula mal la distancia"},{v:1,l:"1 — Usa los brazos o movimiento brusco"},{v:2,l:"2 — Seguro y suave"}]},
      { id:"m1", label:"Inicio de la marcha", options:[
        {v:0,l:"0 — Duda o titubea"},{v:1,l:"1 — Sin titubeo"}]},
      // La sección de marcha vale 12 puntos y este ítem aporta 4: son cuatro
      // observaciones distintas (dos por pie), no una sola. Agrupadas en un
      // único sí/no la escala se quedaba en 25 y clasificaba de más.
      { id:"m2a", label:"Pie derecho: sobrepasa al izquierdo en el balanceo", options:sino() },
      { id:"m2b", label:"Pie derecho: se despega completamente del suelo", options:sino() },
      { id:"m2c", label:"Pie izquierdo: sobrepasa al derecho en el balanceo", options:sino() },
      { id:"m2d", label:"Pie izquierdo: se despega completamente del suelo", options:sino() },
      { id:"m3", label:"Simetría del paso", options:[
        {v:0,l:"0 — Longitud desigual"},{v:1,l:"1 — Simétrica"}]},
      { id:"m4", label:"Continuidad de los pasos", options:[
        {v:0,l:"0 — Paradas o discontinuidad"},{v:1,l:"1 — Continuos"}]},
      { id:"m5", label:"Trayectoria", options:[
        {v:0,l:"0 — Desviación marcada"},{v:1,l:"1 — Desviación leve o usa ayuda"},{v:2,l:"2 — Recta sin ayuda"}]},
      { id:"m6", label:"Tronco", options:[
        {v:0,l:"0 — Balanceo marcado o usa ayuda"},{v:1,l:"1 — Flexiona rodillas o abre brazos"},{v:2,l:"2 — Sin balanceo ni ayuda"}]},
      { id:"m7", label:"Postura al caminar", options:[
        {v:0,l:"0 — Talones separados"},{v:1,l:"1 — Talones casi se tocan"}]}
    ],
    compute:function(v){
      var eq=v.e1+v.e2+v.e3+v.e4+v.e5+v.e6+v.e7+v.e8+v.e9;
      var ma=v.m1+v.m2a+v.m2b+v.m2c+v.m2d+v.m3+v.m4+v.m5+v.m6+v.m7;
      var t=eq+ma;
      var i = t<19 ? "🔴 Riesgo alto de caídas"
        : t<=23 ? "🟠 Riesgo moderado de caídas"
        : "🟢 Riesgo bajo de caídas";
      return { main:"Tinetti "+t+" / 28",
        detail:"Equilibrio "+eq+" / 16 · Marcha "+ma+" / 12",
        interp:i+"<br><small>&lt;19 alto · 19-23 moderado · ≥24 bajo.</small>" };
    }
  },

  /* ══════════════ Cognitivo y delirio ══════════════ */

  pfeiffer: {
    title:"Pfeiffer (SPMSQ, cribado cognitivo)", icon:"🧩", tag:"Geriatría / Cognitivo",
    fields:[
      { id:"p1",  label:"1. ¿Qué día es hoy? (día, mes, año)", options:sino() },
      { id:"p2",  label:"2. ¿Qué día de la semana es hoy?", options:sino() },
      { id:"p3",  label:"3. ¿Dónde estamos ahora?", options:sino() },
      { id:"p4",  label:"4. ¿Cuál es su número de teléfono o dirección?", options:sino() },
      { id:"p5",  label:"5. ¿Cuántos años tiene?", options:sino() },
      { id:"p6",  label:"6. ¿Dónde nació?", options:sino() },
      { id:"p7",  label:"7. ¿Cómo se llama el rey / presidente actual?", options:sino() },
      { id:"p8",  label:"8. ¿Cómo se llamaba el anterior?", options:sino() },
      { id:"p9",  label:"9. Dígame el primer apellido de su madre", options:sino() },
      { id:"p10", label:"10. Reste de 3 en 3 desde 20", options:sino() },
      { id:"esc", label:"Nivel de estudios (ajuste)", options:[
        {v:0,l:"Estudios primarios / medios (sin ajuste)"},
        {v:-1,l:"Baja escolarización (se permite 1 error más)"},
        {v:1,l:"Estudios superiores (se permite 1 error menos)"}]}
    ],
    compute:function(v){
      // Se marca "Sí" cuando la respuesta es ERRÓNEA: la escala cuenta errores.
      var e=v.p1+v.p2+v.p3+v.p4+v.p5+v.p6+v.p7+v.p8+v.p9+v.p10;
      var aj=e+v.esc;
      var i = aj<=2 ? "🟢 Función intelectual normal"
        : aj<=4 ? "🟡 Deterioro cognitivo leve"
        : aj<=7 ? "🟠 Deterioro cognitivo moderado"
        : "🔴 Deterioro cognitivo severo";
      return { main:e+" errores / 10",
        detail:(v.esc!==0?"Ajustado por escolarización: "+aj+" errores.":"Sin ajuste por escolarización."),
        interp:i+"<br><small>Marca «Sí» en cada pregunta que el paciente falle. Es un cribado, no un diagnóstico.</small>" };
    }
  },

  camicu: {
    title:"CAM-ICU (delirio en el paciente crítico)", icon:"🌀", tag:"Intensiva / Delirio",
    fields:[
      { id:"rass", label:"RASS actual", options:[
        {v:1,l:"Entre −3 y +4 (valorable)"},{v:0,l:"−4 o −5 (no valorable: parar y reevaluar)"}]},
      { id:"r1", label:"Rasgo 1 · Inicio agudo o curso fluctuante", options:sino() },
      { id:"r2", label:"Rasgo 2 · Inatención (≥3 errores en la secuencia de letras)", options:sino() },
      { id:"r3", label:"Rasgo 3 · Nivel de conciencia alterado (RASS distinto de 0)", options:sino() },
      { id:"r4", label:"Rasgo 4 · Pensamiento desorganizado (>1 error en preguntas y órdenes)", options:sino() }
    ],
    compute:function(v){
      if(!v.rass){
        return { main:"No valorable",
          detail:"Con RASS −4 o −5 el paciente está demasiado sedado para explorar el delirio.",
          interp:"⏸️ Suspender la valoración y repetirla más adelante." };
      }
      var pos = (v.r1 && v.r2) && (v.r3 || v.r4);
      return { main: pos ? "CAM-ICU POSITIVO" : "CAM-ICU negativo",
        detail:"Requiere rasgo 1 <b>y</b> rasgo 2, más el rasgo 3 <b>o</b> el 4.",
        interp: pos
          ? "🔴 Delirio presente — buscar causas tratables (dolor, fármacos, infección, retirada, hipoxia) y revisar sedación."
          : "🟢 Sin delirio en este momento — reevaluar cada turno, el curso es fluctuante." };
    }
  },

  /* ══════════════ Situación funcional ══════════════ */

  lawton: {
    title:"Lawton-Brody (AIVD)", icon:"🏠", tag:"Geriatría / Funcional",
    fields:[
      { id:"sex", label:"Sexo (afecta a los ítems que puntúan)", options:[
        {v:1,l:"Mujer — se puntúan los 8 ítems"},
        {v:0,l:"Hombre — versión clásica de 5 ítems"}]},
      { id:"tel", label:"Usar el teléfono", options:sino() },
      { id:"com", label:"Hacer la compra", options:sino() },
      { id:"cui", label:"Preparar la comida", options:sino() },
      { id:"cas", label:"Cuidar la casa", options:sino() },
      { id:"rop", label:"Lavar la ropa", options:sino() },
      { id:"tra", label:"Usar transportes", options:sino() },
      { id:"med", label:"Manejar su medicación", options:sino() },
      { id:"din", label:"Manejar el dinero", options:sino() }
    ],
    compute:function(v){
      var mujer = v.sex===1;
      // La versión original excluye en hombres cocinar, cuidar la casa y lavar
      // la ropa. Se respeta porque así se validó, aunque hoy se discuta.
      var t = mujer
        ? v.tel+v.com+v.cui+v.cas+v.rop+v.tra+v.med+v.din
        : v.tel+v.com+v.tra+v.med+v.din;
      var max = mujer ? 8 : 5;
      var pct = t/max;
      var i = pct>=1 ? "🟢 Independiente para las actividades instrumentales"
        : pct>=0.75 ? "🟡 Dependencia ligera"
        : pct>=0.5 ? "🟠 Dependencia moderada"
        : pct>=0.25 ? "🔴 Dependencia severa"
        : "🔴 Dependencia total";
      return { main:"Lawton-Brody "+t+" / "+max,
        detail:"Marca «Sí» en cada actividad que realice de forma autónoma.",
        interp:i+(mujer?"":"<br><small>Versión masculina clásica: no puntúan cocinar, cuidar la casa ni lavar la ropa. Es un criterio de los años 60 y hoy se discute; si en tu centro se puntúan los 8, usa la opción «Mujer».</small>") };
    }
  },

  karnofsky: {
    title:"Karnofsky (estado funcional)", icon:"📉", tag:"Oncología / Funcional",
    fields:[
      { id:"k", label:"Situación del paciente", options:[
        {v:100,l:"100 — Normal, sin quejas ni evidencia de enfermedad"},
        {v:90,l:"90 — Actividad normal, signos o síntomas leves"},
        {v:80,l:"80 — Actividad normal con esfuerzo"},
        {v:70,l:"70 — Se cuida a sí mismo, incapaz de actividad normal o trabajo"},
        {v:60,l:"60 — Requiere asistencia ocasional; se cuida en lo esencial"},
        {v:50,l:"50 — Requiere asistencia considerable y cuidados médicos frecuentes"},
        {v:40,l:"40 — Incapacitado; requiere cuidados y asistencia especiales"},
        {v:30,l:"30 — Gravemente incapacitado; indicado el ingreso"},
        {v:20,l:"20 — Muy enfermo; ingreso y tratamiento de soporte activo"},
        {v:10,l:"10 — Moribundo"},
        {v:0,l:"0 — Fallecido"}]}
    ],
    compute:function(v){
      var i = v.k>=80 ? "🟢 Capaz de actividad normal; no precisa cuidados especiales"
        : v.k>=50 ? "🟠 Incapaz de trabajar; vive en casa con asistencia variable"
        : "🔴 Incapaz de autocuidado; precisa cuidados institucionales o equivalentes";
      return { main:"Karnofsky "+v.k+" / 100", detail:"", interp:i };
    }
  },

  ecog: {
    title:"ECOG (estado funcional)", icon:"📋", tag:"Oncología / Funcional",
    fields:[
      { id:"e", label:"Grado", options:[
        {v:0,l:"0 — Actividad normal, sin restricciones"},
        {v:1,l:"1 — Restringido para actividad intensa; ambulante y capaz de trabajo ligero"},
        {v:2,l:"2 — Ambulante y autosuficiente; incapaz de trabajar; levantado >50 % del día"},
        {v:3,l:"3 — Autocuidado limitado; en cama o silla >50 % del día"},
        {v:4,l:"4 — Completamente incapacitado; encamado el 100 % del día"},
        {v:5,l:"5 — Fallecido"}]}
    ],
    compute:function(v){
      var i = v.e<=1 ? "🟢 Buen estado funcional"
        : v.e===2 ? "🟠 Estado funcional intermedio"
        : "🔴 Estado funcional deteriorado";
      return { main:"ECOG "+v.e, detail:"Equivalencia orientativa con Karnofsky: 0≈100-90, 1≈80-70, 2≈60-50, 3≈40-30, 4≈20-10.", interp:i };
    }
  },

  /* ══════════════ Nutrición ══════════════ */

  mnasf: {
    title:"MNA-SF (cribado nutricional)", icon:"🍽️", tag:"Geriatría / Nutrición",
    fields:[
      { id:"a", label:"A · Ha comido menos por falta de apetito, digestión, masticación o deglución (3 meses)", options:[
        {v:0,l:"0 — Anorexia grave"},{v:1,l:"1 — Anorexia moderada"},{v:2,l:"2 — Sin anorexia"}]},
      { id:"b", label:"B · Pérdida reciente de peso (3 meses)", options:[
        {v:0,l:"0 — Más de 3 kg"},{v:1,l:"1 — No lo sabe"},
        {v:2,l:"2 — Entre 1 y 3 kg"},{v:3,l:"3 — Sin pérdida de peso"}]},
      { id:"c", label:"C · Movilidad", options:[
        {v:0,l:"0 — De la cama al sillón"},{v:1,l:"1 — Autonomía en el interior"},{v:2,l:"2 — Sale del domicilio"}]},
      { id:"d", label:"D · Enfermedad aguda o estrés psicológico (3 meses)", options:[
        {v:0,l:"0 — Sí"},{v:2,l:"2 — No"}]},
      { id:"e", label:"E · Problemas neuropsicológicos", options:[
        {v:0,l:"0 — Demencia o depresión grave"},{v:1,l:"1 — Demencia leve"},{v:2,l:"2 — Sin problemas"}]},
      { id:"f", label:"F · Índice de masa corporal (o perímetro de pantorrilla si no hay IMC)", options:[
        {v:0,l:"0 — IMC < 19  (o pantorrilla < 31 cm)"},
        {v:1,l:"1 — IMC 19 a < 21"},
        {v:2,l:"2 — IMC 21 a < 23"},
        {v:3,l:"3 — IMC ≥ 23  (o pantorrilla ≥ 31 cm)"}]}
    ],
    compute:function(v){
      var t=v.a+v.b+v.c+v.d+v.e+v.f;
      var i = t>=12 ? "🟢 Estado nutricional normal — no precisa continuar"
        : t>=8 ? "🟠 Riesgo de desnutrición — valorar intervención y completar el MNA largo"
        : "🔴 Desnutrición — valoración nutricional completa y tratamiento";
      return { main:"MNA-SF "+t+" / 14",
        detail:"Si no se dispone de IMC, el ítem F se puntúa con el perímetro de pantorrilla.",
        interp:i+"<br><small>Mini Nutritional Assessment® — Société des Produits Nestlé S.A. Uso clínico.</small>" };
    }
  },

  must: {
    title:"MUST (cribado de desnutrición)", icon:"⚖️", tag:"Nutrición",
    fields:[
      { id:"imc", label:"Paso 1 · Índice de masa corporal", options:[
        {v:0,l:"0 — IMC > 20"},{v:1,l:"1 — IMC 18,5 a 20"},{v:2,l:"2 — IMC < 18,5"}]},
      { id:"per", label:"Paso 2 · Pérdida de peso no intencionada (3-6 meses)", options:[
        {v:0,l:"0 — Menos del 5 %"},{v:1,l:"1 — Entre el 5 y el 10 %"},{v:2,l:"2 — Más del 10 %"}]},
      { id:"agu", label:"Paso 3 · Enfermedad aguda con ausencia de ingesta > 5 días (prevista o real)", options:[
        {v:0,l:"0 — No"},{v:2,l:"2 — Sí"}]}
    ],
    compute:function(v){
      var t=v.imc+v.per+v.agu;
      var i = t===0 ? "🟢 Riesgo bajo — repetir el cribado según protocolo del centro"
        : t===1 ? "🟠 Riesgo medio — registrar la ingesta 3 días y reevaluar"
        : "🔴 Riesgo alto — derivar a nutrición e iniciar soporte";
      return { main:"MUST "+t+" puntos", detail:"Suma de los tres pasos.", interp:i };
    }
  },

  /* ══════════════ Sedación y dolor ══════════════ */

  ramsay: {
    title:"Ramsay (nivel de sedación)", icon:"😴", tag:"Intensiva / Sedación",
    fields:[
      { id:"r", label:"Nivel", options:[
        {v:1,l:"1 — Ansioso, agitado o inquieto"},
        {v:2,l:"2 — Colaborador, orientado y tranquilo"},
        {v:3,l:"3 — Dormido, responde solo a órdenes"},
        {v:4,l:"4 — Dormido, respuesta rápida a estímulo glabelar o auditivo intenso"},
        {v:5,l:"5 — Dormido, respuesta perezosa a estímulo glabelar o auditivo intenso"},
        {v:6,l:"6 — Sin respuesta"}]}
    ],
    compute:function(v){
      var i = v.r===1 ? "🟠 Sedación insuficiente"
        : v.r<=3 ? "🟢 Nivel de sedación adecuado para la mayoría de situaciones"
        : v.r<=5 ? "🟠 Sedación profunda — revisar si está indicada"
        : "🔴 Sedación excesiva — replantear la pauta";
      return { main:"Ramsay "+v.r+" / 6", detail:"", interp:i };
    }
  },

  escid: {
    title:"ESCID (dolor en paciente no comunicativo)", icon:"🤐", tag:"Intensiva / Dolor",
    fields:[
      { id:"fac", label:"Musculatura facial", options:[
        {v:0,l:"0 — Relajada"},{v:1,l:"1 — En tensión, ceño fruncido"},{v:2,l:"2 — Ceño fruncido de forma habitual, dientes apretados"}]},
      { id:"tra", label:"Tranquilidad", options:[
        {v:0,l:"0 — Tranquilo, relajado, movimientos normales"},{v:1,l:"1 — Movimientos ocasionales de inquietud o posición"},{v:2,l:"2 — Movimientos frecuentes, incluida cabeza o extremidades"}]},
      { id:"ton", label:"Tono muscular", options:[
        {v:0,l:"0 — Normal"},{v:1,l:"1 — Aumentado, flexión de dedos de manos o pies"},{v:2,l:"2 — Rígido"}]},
      { id:"vm",  label:"Adaptación a la ventilación mecánica", options:[
        {v:0,l:"0 — Tolera la ventilación"},{v:1,l:"1 — Tose, pero tolera"},{v:2,l:"2 — Lucha contra el respirador"}]},
      { id:"con", label:"Confortabilidad", options:[
        {v:0,l:"0 — Confortable, tranquilo"},{v:1,l:"1 — Se tranquiliza al tacto o la voz, fácil de distraer"},{v:2,l:"2 — Difícil de confortar con el tacto o hablándole"}]}
    ],
    compute:function(v){
      var t=v.fac+v.tra+v.ton+v.vm+v.con;
      var i = t===0 ? "🟢 Sin dolor"
        : t<=3 ? "🟡 Dolor leve"
        : t<=6 ? "🟠 Dolor moderado — valorar analgesia"
        : "🔴 Dolor intenso — analgesia y reevaluar";
      return { main:"ESCID "+t+" / 10", detail:"Adaptación de la escala de Campbell para pacientes con ventilación mecánica.", interp:i };
    }
  },

  campbell: {
    title:"Campbell (dolor en paciente no comunicativo)", icon:"🤕", tag:"Dolor",
    fields:[
      { id:"fac", label:"Musculatura facial", options:[
        {v:0,l:"0 — Relajada"},{v:1,l:"1 — En tensión, ceño fruncido"},{v:2,l:"2 — Ceño fruncido de forma habitual, dientes apretados"}]},
      { id:"tra", label:"Tranquilidad", options:[
        {v:0,l:"0 — Tranquilo, relajado, movimientos normales"},{v:1,l:"1 — Movimientos ocasionales de inquietud o posición"},{v:2,l:"2 — Movimientos frecuentes, incluida cabeza o extremidades"}]},
      { id:"ton", label:"Tono muscular", options:[
        {v:0,l:"0 — Normal"},{v:1,l:"1 — Aumentado, flexión de dedos de manos o pies"},{v:2,l:"2 — Rígido"}]},
      { id:"ver", label:"Respuesta verbal", options:[
        {v:0,l:"0 — Normal o sin ruidos"},{v:1,l:"1 — Quejidos, lloros, quejas o gruñidos ocasionales"},{v:2,l:"2 — Quejidos, lloros o gruñidos frecuentes"}]},
      { id:"con", label:"Confortabilidad", options:[
        {v:0,l:"0 — Confortable, tranquilo"},{v:1,l:"1 — Se tranquiliza al tacto o la voz, fácil de distraer"},{v:2,l:"2 — Difícil de confortar con el tacto o hablándole"}]}
    ],
    compute:function(v){
      var t=v.fac+v.tra+v.ton+v.ver+v.con;
      var i = t===0 ? "🟢 Sin dolor"
        : t<=3 ? "🟡 Dolor leve"
        : t<=6 ? "🟠 Dolor moderado — valorar analgesia"
        : "🔴 Dolor intenso — analgesia y reevaluar";
      return { main:"Campbell "+t+" / 10", detail:"En paciente con ventilación mecánica se usa la ESCID, que sustituye la respuesta verbal por la adaptación al respirador.", interp:i };
    }
  },

  /* ══════════════ Deglución ══════════════ */

  eat10: {
    title:"EAT-10 (cribado de disfagia)", icon:"🥄", tag:"Deglución",
    fields:(function(){
      var preguntas=[
        "1. Mi problema para tragar me ha llevado a perder peso",
        "2. Mi problema para tragar interfiere con mi capacidad para comer fuera de casa",
        "3. Tragar líquidos me supone un esfuerzo extra",
        "4. Tragar sólidos me supone un esfuerzo extra",
        "5. Tragar pastillas me supone un esfuerzo extra",
        "6. Tragar es doloroso",
        "7. El placer de comer se ve afectado por mi problema para tragar",
        "8. Cuando trago, la comida se pega en mi garganta",
        "9. Toso cuando como",
        "10. Tragar es estresante"
      ];
      return preguntas.map(function(p,i){
        return { id:"q"+(i+1), label:p, options:[
          {v:0,l:"0 — Ningún problema"},{v:1,l:"1"},{v:2,l:"2"},{v:3,l:"3"},{v:4,l:"4 — Problema serio"}]};
      });
    })(),
    compute:function(v){
      var t=0; for(var i=1;i<=10;i++) t+=v["q"+i];
      var i2 = t>=3
        ? "🔴 Posible alteración de la deglución — valorar con una exploración clínica (MECV-V) o derivar"
        : "🟢 Sin datos de disfagia en el cribado";
      return { main:"EAT-10 "+t+" / 40",
        detail:"Lo responde el propio paciente.",
        interp:i2+"<br><small>Punto de corte: 3 o más puntos. Es un cribado; no sustituye a la exploración.</small>" };
    }
  }

,

  /* ══════════════ Anestesiología ══════════════ */

  asa: {
    title:"ASA (estado físico preanestésico)", icon:"💤", tag:"Anestesia / Preoperatorio",
    fields:[
      { id:"a", label:"Clase", options:[
        {v:1,l:"I — Paciente sano"},
        {v:2,l:"II — Enfermedad sistémica leve, sin limitación funcional"},
        {v:3,l:"III — Enfermedad sistémica grave, con limitación funcional"},
        {v:4,l:"IV — Enfermedad sistémica grave que amenaza la vida de forma constante"},
        {v:5,l:"V — Moribundo; no se espera que sobreviva sin la intervención"},
        {v:6,l:"VI — Donante de órganos en muerte encefálica"}]},
      { id:"e", label:"Cirugía urgente (sufijo E)", options:[{v:0,l:"No"},{v:1,l:"Sí"}]}
    ],
    compute:function(v){
      var rom=["","I","II","III","IV","V","VI"][v.a];
      var i = v.a<=2 ? "🟢 Riesgo anestésico bajo"
        : v.a===3 ? "🟠 Riesgo intermedio — optimizar comorbilidad antes de la cirugía si es posible"
        : "🔴 Riesgo alto — valoración anestésica detallada y plan de cuidados postoperatorios";
      return { main:"ASA "+rom+(v.e?" E":""),
        detail:v.e?"El sufijo E indica cirugía urgente, que añade riesgo por sí misma.":"Cirugía programada.",
        interp:i+"<br><small>Es una clasificación del estado físico, no una predicción individual de mortalidad.</small>" };
    }
  },

  mallampati: {
    title:"Mallampati (valoración de vía aérea)", icon:"👄", tag:"Anestesia / Vía aérea",
    fields:[
      { id:"m", label:"Estructuras visibles con la boca abierta y la lengua fuera", options:[
        {v:1,l:"I — Paladar blando, úvula, fauces y pilares"},
        {v:2,l:"II — Paladar blando, úvula y fauces"},
        {v:3,l:"III — Paladar blando y base de la úvula"},
        {v:4,l:"IV — Solo paladar duro"}]}
    ],
    compute:function(v){
      var rom=["","I","II","III","IV"][v.m];
      var i = v.m<=2 ? "🟢 Predicción de intubación habitualmente fácil"
        : "🟠 Predice mayor dificultad — preparar plan de vía aérea difícil";
      return { main:"Mallampati "+rom,
        detail:"Paciente sentado, cabeza neutra, boca abierta y lengua fuera sin fonar.",
        interp:i+"<br><small>Por sí solo tiene sensibilidad limitada: se valora junto a apertura bucal, distancia tiromentoniana, movilidad cervical y antecedentes.</small>" };
    }
  },

  cormack: {
    title:"Cormack-Lehane (visión laringoscópica)", icon:"🔦", tag:"Anestesia / Vía aérea",
    fields:[
      { id:"c", label:"Grado observado en la laringoscopia", options:[
        {v:1,l:"I — Se ve toda la glotis"},
        {v:2,l:"II — Se ve la parte posterior de la glotis o solo aritenoides"},
        {v:3,l:"III — Solo se ve la epiglotis"},
        {v:4,l:"IV — No se ve la epiglotis ni la glotis"}]}
    ],
    compute:function(v){
      var rom=["","I","II","III","IV"][v.c];
      var i = v.c<=2 ? "🟢 Intubación habitualmente sin dificultad"
        : v.c===3 ? "🟠 Intubación difícil — considerar guía, videolaringoscopio o cambio de dispositivo"
        : "🔴 Intubación muy difícil — algoritmo de vía aérea difícil y pedir ayuda";
      return { main:"Cormack-Lehane "+rom,
        detail:"Es un hallazgo de la laringoscopia directa, no una predicción previa.",
        interp:i };
    }
  },

  stopbang: {
    title:"STOP-BANG (riesgo de apnea del sueño)", icon:"😪", tag:"Anestesia / Preoperatorio",
    fields:[
      { id:"s", label:"S · Ronca fuerte (se oye a través de una puerta cerrada)", options:sino() },
      { id:"t", label:"T · Cansancio o somnolencia diurna frecuente", options:sino() },
      { id:"o", label:"O · Alguien ha observado que deja de respirar mientras duerme", options:sino() },
      { id:"p", label:"P · Hipertensión arterial (o en tratamiento)", options:sino() },
      { id:"b", label:"B · IMC > 35 kg/m²", options:sino() },
      { id:"a", label:"A · Edad > 50 años", options:sino() },
      { id:"n", label:"N · Perímetro del cuello > 40 cm", options:sino() },
      { id:"g", label:"G · Sexo masculino", options:sino() }
    ],
    compute:function(v){
      var t=v.s+v.t+v.o+v.p+v.b+v.a+v.n+v.g;
      var i = t<=2 ? "🟢 Riesgo bajo de apnea obstructiva del sueño"
        : t<=4 ? "🟠 Riesgo intermedio — extremar la vigilancia respiratoria postoperatoria"
        : "🔴 Riesgo alto — plan de vía aérea, cautela con opioides y sedantes, y monitorización postoperatoria";
      return { main:"STOP-BANG "+t+" / 8", detail:"", interp:i };
    }
  },

  apfel: {
    title:"Apfel (náuseas y vómitos postoperatorios)", icon:"🤢", tag:"Anestesia / Postoperatorio",
    fields:[
      { id:"muj", label:"Sexo femenino", options:sino() },
      { id:"nof", label:"No fumador", options:sino() },
      { id:"ant", label:"Antecedentes de NVPO o de cinetosis", options:sino() },
      { id:"opi", label:"Previsión de opioides postoperatorios", options:sino() }
    ],
    compute:function(v){
      var t=v.muj+v.nof+v.ant+v.opi;
      var riesgo=["≈10 %","≈20 %","≈40 %","≈60 %","≈80 %"][t];
      var i = t<=1 ? "🟢 Riesgo bajo — puede bastar con no dar profilaxis o dar un solo fármaco"
        : t===2 ? "🟠 Riesgo moderado — considerar profilaxis con uno o dos fármacos"
        : "🔴 Riesgo alto — profilaxis multimodal y estrategia anestésica que lo reduzca";
      return { main:"Apfel "+t+" / 4",
        detail:"Riesgo aproximado de náuseas o vómitos en las primeras 24 h: <b>"+riesgo+"</b>.",
        interp:i };
    }
  },

  rcri: {
    title:"RCRI / Lee (riesgo cardiaco perioperatorio)", icon:"🫀", tag:"Anestesia / Cardio",
    fields:[
      { id:"cir", label:"Cirugía de alto riesgo (intraperitoneal, intratorácica o vascular suprainguinal)", options:sino() },
      { id:"isq", label:"Cardiopatía isquémica", options:sino() },
      { id:"ic",  label:"Insuficiencia cardiaca", options:sino() },
      { id:"acv", label:"Enfermedad cerebrovascular (ictus o AIT)", options:sino() },
      { id:"dm",  label:"Diabetes en tratamiento con insulina", options:sino() },
      { id:"cre", label:"Creatinina > 2 mg/dL", options:sino() }
    ],
    compute:function(v){
      var t=v.cir+v.isq+v.ic+v.acv+v.dm+v.cre;
      var r=["≈0,4 %","≈0,9 %","≈6,6 %","≈11 %"][Math.min(t,3)];
      var i = t===0 ? "🟢 Riesgo bajo"
        : t===1 ? "🟡 Riesgo bajo-intermedio"
        : t===2 ? "🟠 Riesgo intermedio — valorar optimización y monitorización"
        : "🔴 Riesgo alto — valoración cardiológica y plan de cuidados postoperatorios";
      return { main:"RCRI "+t+" / 6",
        detail:"Riesgo estimado de evento cardiaco mayor perioperatorio: <b>"+r+"</b>"+(t>=3?" (3 o más factores).":"."),
        interp:i };
    }
  },

  /* ══════════════ Cardiología ══════════════ */

  nyha: {
    title:"NYHA (clase funcional)", icon:"❤️", tag:"Cardiología",
    fields:[
      { id:"n", label:"Clase", options:[
        {v:1,l:"I — Sin limitación; la actividad ordinaria no causa síntomas"},
        {v:2,l:"II — Ligera limitación; síntomas con actividad ordinaria"},
        {v:3,l:"III — Limitación marcada; síntomas con actividad menor que la ordinaria"},
        {v:4,l:"IV — Síntomas en reposo; cualquier actividad los aumenta"}]}
    ],
    compute:function(v){
      var rom=["","I","II","III","IV"][v.n];
      var i = v.n<=2 ? "🟢 Limitación funcional leve o ausente"
        : v.n===3 ? "🟠 Limitación marcada — revisar tratamiento y adherencia"
        : "🔴 Síntomas en reposo — valoración urgente y ajuste de tratamiento";
      return { main:"NYHA "+rom, detail:"Clasificación sintomática; se reevalúa en cada visita porque puede cambiar con el tratamiento.", interp:i };
    }
  },

  killip: {
    title:"Killip-Kimball (IAM)", icon:"🫁", tag:"Cardiología / SCA",
    fields:[
      { id:"k", label:"Clase", options:[
        {v:1,l:"I — Sin signos de insuficiencia cardiaca"},
        {v:2,l:"II — Crepitantes en menos de la mitad de los campos, ingurgitación yugular o tercer ruido"},
        {v:3,l:"III — Edema agudo de pulmón"},
        {v:4,l:"IV — Shock cardiogénico"}]}
    ],
    compute:function(v){
      var rom=["","I","II","III","IV"][v.k];
      var mort=["","≈6 %","≈17 %","≈38 %","≈81 %"][v.k];
      var i = v.k===1 ? "🟢 Sin insuficiencia cardiaca clínica"
        : v.k===2 ? "🟠 Insuficiencia cardiaca leve-moderada"
        : v.k===3 ? "🔴 Edema agudo de pulmón — tratamiento inmediato"
        : "🔴 Shock cardiogénico — soporte hemodinámico y reperfusión urgente";
      return { main:"Killip "+rom,
        detail:"Mortalidad de la serie original de Killip y Kimball (1967): <b>"+mort+"</b>. Con la reperfusión actual es considerablemente menor.",
        interp:i };
    }
  },

  heart: {
    title:"HEART (dolor torácico en urgencias)", icon:"💗", tag:"Urgencias / Cardio",
    fields:[
      { id:"h", label:"History · Anamnesis", options:[
        {v:0,l:"0 — Poco sospechosa"},{v:1,l:"1 — Moderadamente sospechosa"},{v:2,l:"2 — Muy sospechosa"}]},
      { id:"e", label:"ECG", options:[
        {v:0,l:"0 — Normal"},{v:1,l:"1 — Alteración inespecífica de la repolarización"},{v:2,l:"2 — Descenso significativo del ST"}]},
      { id:"a", label:"Age · Edad", options:[
        {v:0,l:"0 — Menos de 45 años"},{v:1,l:"1 — De 45 a 64 años"},{v:2,l:"2 — 65 años o más"}]},
      { id:"r", label:"Risk factors · Factores de riesgo (HTA, dislipemia, DM, obesidad, tabaco, antecedentes familiares, ateroesclerosis conocida)", options:[
        {v:0,l:"0 — Ninguno"},{v:1,l:"1 — Uno o dos"},{v:2,l:"2 — Tres o más, o ateroesclerosis conocida"}]},
      { id:"t", label:"Troponin · Troponina", options:[
        {v:0,l:"0 — Normal"},{v:1,l:"1 — Entre 1 y 3 veces el límite"},{v:2,l:"2 — Más de 3 veces el límite"}]}
    ],
    compute:function(v){
      var t=v.h+v.e+v.a+v.r+v.t;
      var i = t<=3 ? "🟢 Riesgo bajo — habitualmente permite alta precoz con seriación según protocolo"
        : t<=6 ? "🟠 Riesgo moderado — observación y seriación de troponina"
        : "🔴 Riesgo alto — manejo invasivo precoz y valoración por cardiología";
      var r=["≈1,7 %","","","","≈16,6 %","","","≈50,1 %"];
      return { main:"HEART "+t+" / 10",
        detail:"Riesgo de evento cardiaco mayor a 6 semanas: 0-3 ≈1,7 % · 4-6 ≈16,6 % · 7-10 ≈50,1 %.",
        interp:i+"<br><small>Se aplica sobre el protocolo del centro, no en su lugar.</small>" };
    }
  },

  timiScasest: {
    title:"TIMI (SCA sin elevación del ST)", icon:"📉", tag:"Cardiología / SCA",
    fields:[
      { id:"edad", label:"Edad de 65 años o más", options:sino() },
      { id:"fr",   label:"Tres o más factores de riesgo coronario", options:sino() },
      { id:"est",  label:"Estenosis coronaria conocida ≥ 50 %", options:sino() },
      { id:"st",   label:"Desviación del ST en el ECG de ingreso", options:sino() },
      { id:"ang",  label:"Dos o más episodios de angina en las últimas 24 h", options:sino() },
      { id:"aas",  label:"Uso de aspirina en los 7 días previos", options:sino() },
      { id:"mar",  label:"Marcadores de necrosis miocárdica elevados", options:sino() }
    ],
    compute:function(v){
      var t=v.edad+v.fr+v.est+v.st+v.ang+v.aas+v.mar;
      var r=["≈4,7 %","≈4,7 %","≈8,3 %","≈13,2 %","≈19,9 %","≈26,2 %","≈40,9 %","≈40,9 %"][t];
      var i = t<=2 ? "🟢 Riesgo bajo"
        : t<=4 ? "🟠 Riesgo intermedio — estrategia invasiva según evolución y protocolo"
        : "🔴 Riesgo alto — estrategia invasiva precoz";
      return { main:"TIMI "+t+" / 7",
        detail:"Riesgo de muerte, infarto o revascularización urgente a 14 días: <b>"+r+"</b>.",
        interp:i };
    }
  },

  /* ══════════════ Intensiva ══════════════ */

  indiceShock: {
    title:"Índice de shock", icon:"🚨", tag:"Intensiva / Urgencias",
    fields:[
      { id:"fc",  label:"Frecuencia cardiaca (lpm)", type:"number", min:20, max:250, step:1, def:80 },
      { id:"pas", label:"Presión arterial sistólica (mmHg)", type:"number", min:40, max:260, step:1, def:120 }
    ],
    compute:function(v){
      if(!v.pas || v.pas<=0){
        return { main:"—", detail:"Introduce una presión sistólica válida.", interp:"" };
      }
      var is=v.fc/v.pas;
      var t=Math.round(is*100)/100;
      var i = is<0.5 ? "🟡 Por debajo del rango habitual — comprobar los valores introducidos"
        : is<=0.7 ? "🟢 Dentro del rango normal (0,5 a 0,7)"
        : is<0.9 ? "🟠 Elevado — vigilar, puede preceder al deterioro"
        : "🔴 Igual o mayor de 0,9 — sugiere compromiso hemodinámico; valorar hipovolemia, sepsis o sangrado";
      return { main:"Índice de shock "+String(t).replace(".",","),
        detail:"FC "+v.fc+" lpm ÷ PAS "+v.pas+" mmHg. Rango normal: 0,5 a 0,7.",
        interp:i+"<br><small>Marcador de alerta, no diagnóstico: pierde valor con betabloqueantes, marcapasos o arritmias.</small>" };
    }
  }

  };

  Object.keys(NUEVAS).forEach(function(k){ CALCS[k]=NUEVAS[k]; });
})();
