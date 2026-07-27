const CALCS = {

  /* ---------- Escalas de valoración enfermera ---------- */

  norton: {
    title: "Norton (riesgo de UPP)", icon: "🛏️", tag: "Enfermería / UPP",
    fields: [
      { id:"fis", label:"Estado físico general", options:[
        {v:4,l:"4 — Bueno"},{v:3,l:"3 — Mediano"},{v:2,l:"2 — Regular"},{v:1,l:"1 — Muy malo"}]},
      { id:"men", label:"Estado mental", options:[
        {v:4,l:"4 — Alerta"},{v:3,l:"3 — Apático"},{v:2,l:"2 — Confuso"},{v:1,l:"1 — Estuporoso o comatoso"}]},
      { id:"act", label:"Actividad", options:[
        {v:4,l:"4 — Ambulante"},{v:3,l:"3 — Camina con ayuda"},{v:2,l:"2 — Sentado"},{v:1,l:"1 — Encamado"}]},
      { id:"mov", label:"Movilidad", options:[
        {v:4,l:"4 — Total"},{v:3,l:"3 — Disminuida"},{v:2,l:"2 — Muy limitada"},{v:1,l:"1 — Inmóvil"}]},
      { id:"inc", label:"Incontinencia", options:[
        {v:4,l:"4 — Ninguna"},{v:3,l:"3 — Ocasional"},{v:2,l:"2 — Urinaria o fecal"},{v:1,l:"1 — Doble incontinencia"}]}
    ],
    compute(v){
      const t = v.fis+v.men+v.act+v.mov+v.inc;
      let i;
      if(t<=12) i="🔴 Riesgo alto — superficie especial de manejo de presión, cambios posturales y revisión diaria de la piel";
      else if(t<=14) i="🟠 Riesgo medio — pauta de cambios posturales y protección de prominencias óseas";
      else i="🟢 Riesgo mínimo — mantener vigilancia y reevaluar si cambia la situación";
      return { main:"Norton "+t+" / 20", detail:"Físico "+v.fis+" · Mental "+v.men+" · Actividad "+v.act+" · Movilidad "+v.mov+" · Incontinencia "+v.inc, interp:i };
    }
  },

  braden: {
    title: "Braden (riesgo de UPP)", icon: "🛏️", tag: "Enfermería / UPP",
    fields: [
      { id:"sens", label:"Percepción sensorial", options:[
        {v:4,l:"4 — Sin limitación"},{v:3,l:"3 — Ligeramente limitada"},
        {v:2,l:"2 — Muy limitada"},{v:1,l:"1 — Completamente limitada"}]},
      { id:"hum", label:"Exposición a la humedad", options:[
        {v:4,l:"4 — Raramente húmeda"},{v:3,l:"3 — Ocasionalmente húmeda"},
        {v:2,l:"2 — A menudo húmeda"},{v:1,l:"1 — Constantemente húmeda"}]},
      { id:"act", label:"Actividad", options:[
        {v:4,l:"4 — Deambula con frecuencia"},{v:3,l:"3 — Deambula ocasionalmente"},
        {v:2,l:"2 — En silla"},{v:1,l:"1 — Encamado"}]},
      { id:"mov", label:"Movilidad", options:[
        {v:4,l:"4 — Sin limitaciones"},{v:3,l:"3 — Ligeramente limitada"},
        {v:2,l:"2 — Muy limitada"},{v:1,l:"1 — Completamente inmóvil"}]},
      { id:"nut", label:"Nutrición", options:[
        {v:4,l:"4 — Excelente"},{v:3,l:"3 — Adecuada"},
        {v:2,l:"2 — Probablemente inadecuada"},{v:1,l:"1 — Muy pobre"}]},
      { id:"roce", label:"Roce y peligro de lesiones", options:[
        {v:3,l:"3 — Sin problema aparente"},{v:2,l:"2 — Problema potencial"},{v:1,l:"1 — Problema"}]}
    ],
    compute(v){
      const t = v.sens+v.hum+v.act+v.mov+v.nut+v.roce;
      let i;
      if(t<=9) i="🔴 Riesgo muy alto — superficie especial, cambios posturales frecuentes y control de humedad y nutrición";
      else if(t<=12) i="🔴 Riesgo alto — plan de prevención completo de UPP";
      else if(t<=14) i="🟠 Riesgo moderado — cambios posturales pautados y protección de prominencias";
      else if(t<=18) i="🟡 Riesgo bajo — medidas preventivas básicas y reevaluación";
      else i="🟢 Sin riesgo aparente — reevaluar si cambia la situación clínica";
      return { main:"Braden "+t+" / 23", detail:"Sensorial "+v.sens+" · Humedad "+v.hum+" · Actividad "+v.act+" · Movilidad "+v.mov+" · Nutrición "+v.nut+" · Roce "+v.roce, interp:i };
    }
  },

  barthel: {
    title: "Barthel (autonomía en AVD)", icon: "🚶", tag: "Enfermería / Funcional",
    fields: [
      { id:"com", label:"Comer", options:[
        {v:10,l:"10 — Independiente"},{v:5,l:"5 — Necesita ayuda"},{v:0,l:"0 — Dependiente"}]},
      { id:"lav", label:"Lavarse o bañarse", options:[
        {v:5,l:"5 — Independiente"},{v:0,l:"0 — Dependiente"}]},
      { id:"ves", label:"Vestirse", options:[
        {v:10,l:"10 — Independiente"},{v:5,l:"5 — Necesita ayuda"},{v:0,l:"0 — Dependiente"}]},
      { id:"arr", label:"Arreglarse", options:[
        {v:5,l:"5 — Independiente"},{v:0,l:"0 — Dependiente"}]},
      { id:"dep", label:"Deposición", options:[
        {v:10,l:"10 — Continente"},{v:5,l:"5 — Accidente ocasional"},{v:0,l:"0 — Incontinente"}]},
      { id:"mic", label:"Micción", options:[
        {v:10,l:"10 — Continente"},{v:5,l:"5 — Accidente ocasional"},{v:0,l:"0 — Incontinente"}]},
      { id:"ret", label:"Uso del retrete", options:[
        {v:10,l:"10 — Independiente"},{v:5,l:"5 — Necesita ayuda"},{v:0,l:"0 — Dependiente"}]},
      { id:"tra", label:"Traslado sillón y cama", options:[
        {v:15,l:"15 — Independiente"},{v:10,l:"10 — Mínima ayuda"},
        {v:5,l:"5 — Gran ayuda"},{v:0,l:"0 — Dependiente"}]},
      { id:"dea", label:"Deambulación", options:[
        {v:15,l:"15 — Independiente"},{v:10,l:"10 — Necesita ayuda"},
        {v:5,l:"5 — Independiente en silla de ruedas"},{v:0,l:"0 — Dependiente"}]},
      { id:"esc", label:"Subir y bajar escaleras", options:[
        {v:10,l:"10 — Independiente"},{v:5,l:"5 — Necesita ayuda"},{v:0,l:"0 — Dependiente"}]}
    ],
    compute(v){
      const t = v.com+v.lav+v.ves+v.arr+v.dep+v.mic+v.ret+v.tra+v.dea+v.esc;
      let i;
      if(t<20) i="🔴 Dependencia total — precisa ayuda en prácticamente todas las actividades";
      else if(t<=35) i="🟠 Dependencia grave";
      else if(t<=55) i="🟡 Dependencia moderada";
      else if(t<100) i="🟢 Dependencia leve";
      else i="🟢 Independiente para las actividades básicas";
      return { main:"Barthel "+t+" / 100", detail:"Suma de las diez actividades básicas de la vida diaria", interp:i };
    }
  },

  aldrete: {
    title: "Aldrete (recuperación postanestésica)", icon: "🏥", tag: "Enfermería / URPA",
    fields: [
      { id:"act", label:"Actividad motora", options:[
        {v:2,l:"2 — Mueve las cuatro extremidades"},{v:1,l:"1 — Mueve dos extremidades"},
        {v:0,l:"0 — No mueve ninguna"}]},
      { id:"res", label:"Respiración", options:[
        {v:2,l:"2 — Respira profundo y tose"},{v:1,l:"1 — Disnea o respiración limitada"},
        {v:0,l:"0 — Apnea"}]},
      { id:"cir", label:"Circulación (TA respecto a la basal)", options:[
        {v:2,l:"2 — Variación menor del 20 por ciento"},{v:1,l:"1 — Variación del 20 al 49 por ciento"},
        {v:0,l:"0 — Variación del 50 por ciento o mayor"}]},
      { id:"con", label:"Nivel de consciencia", options:[
        {v:2,l:"2 — Despierto y orientado"},{v:1,l:"1 — Despierta al llamarlo"},
        {v:0,l:"0 — No responde"}]},
      { id:"sat", label:"Saturación de oxígeno", options:[
        {v:2,l:"2 — Mayor del 92 por ciento con aire ambiente"},
        {v:1,l:"1 — Necesita oxígeno para mantener más del 90 por ciento"},
        {v:0,l:"0 — Menor del 90 por ciento incluso con oxígeno"}]}
    ],
    compute(v){
      const t = v.act+v.res+v.cir+v.con+v.sat;
      let i;
      if(t>=9) i="🟢 Cumple criterios de alta de la URPA — confirmar con el protocolo de la unidad";
      else if(t>=8) i="🟠 Próximo al alta — reevaluar en breve";
      else i="🔴 No cumple criterios de alta — mantener vigilancia estrecha";
      return { main:"Aldrete "+t+" / 10", detail:"Actividad "+v.act+" · Respiración "+v.res+" · Circulación "+v.cir+" · Consciencia "+v.con+" · SatO2 "+v.sat, interp:i };
    }
  },

  mews: {
    title: "MEWS (deterioro clínico)", icon: "📈", tag: "Enfermería / Deterioro",
    fields: [
      { id:"fr", label:"Frecuencia respiratoria (rpm)", options:[
        {v:0,l:"0 — 9 a 14"},{v:1,l:"1 — 15 a 20"},{v:2,l:"2 — 21 a 29, o menos de 9"},{v:3,l:"3 — 30 o más"}]},
      { id:"fc", label:"Frecuencia cardiaca (lpm)", options:[
        {v:0,l:"0 — 51 a 100"},{v:1,l:"1 — 41 a 50, o 101 a 110"},
        {v:2,l:"2 — Menos de 40, o 111 a 129"},{v:3,l:"3 — 130 o más"}]},
      { id:"tas", label:"Tensión arterial sistólica (mmHg)", options:[
        {v:0,l:"0 — 101 a 199"},{v:1,l:"1 — 81 a 100"},
        {v:2,l:"2 — 71 a 80, o 200 o más"},{v:3,l:"3 — 70 o menos"}]},
      { id:"tem", label:"Temperatura (grados C)", options:[
        {v:0,l:"0 — 35 a 38,4"},{v:2,l:"2 — Menos de 35, o 38,5 o más"}]},
      { id:"con", label:"Nivel de consciencia (AVDN)", options:[
        {v:0,l:"0 — Alerta"},{v:1,l:"1 — Responde a la voz"},
        {v:2,l:"2 — Responde al dolor"},{v:3,l:"3 — No responde"}]}
    ],
    compute(v){
      const t = v.fr+v.fc+v.tas+v.tem+v.con;
      let i;
      if(t>=5) i="🔴 Riesgo alto de deterioro — avisar al médico y valorar cuidados intensivos";
      else if(t>=3) i="🟠 Riesgo intermedio — aumentar la frecuencia de controles y comunicar";
      else i="🟢 Riesgo bajo — mantener la monitorización habitual";
      return { main:"MEWS "+t, detail:"FR "+v.fr+" · FC "+v.fc+" · TAS "+v.tas+" · Temperatura "+v.tem+" · Consciencia "+v.con, interp:i };
    }
  },

  news2: {
    title: "NEWS2 (deterioro clínico)", icon: "📊", tag: "Enfermería / Deterioro",
    fields: [
      { id:"fr", label:"Frecuencia respiratoria (rpm)", options:[
        {v:0,l:"0 — 12 a 20"},{v:1,l:"1 — 9 a 11"},{v:2,l:"2 — 21 a 24"},{v:3,l:"3 — 8 o menos, o 25 o más"}]},
      { id:"spo2", label:"Saturación de oxígeno (por ciento)", options:[
        {v:0,l:"0 — 96 o más"},{v:1,l:"1 — 94 a 95"},{v:2,l:"2 — 92 a 93"},{v:3,l:"3 — 91 o menos"}]},
      { id:"o2", label:"Oxigenoterapia", options:[
        {v:0,l:"0 — Aire ambiente"},{v:2,l:"2 — Oxígeno suplementario"}]},
      { id:"tas", label:"Tensión arterial sistólica (mmHg)", options:[
        {v:0,l:"0 — 111 a 219"},{v:1,l:"1 — 101 a 110"},{v:2,l:"2 — 91 a 100"},
        {v:3,l:"3 — 90 o menos, o 220 o más"}]},
      { id:"fc", label:"Frecuencia cardiaca (lpm)", options:[
        {v:0,l:"0 — 51 a 90"},{v:1,l:"1 — 41 a 50, o 91 a 110"},
        {v:2,l:"2 — 111 a 130"},{v:3,l:"3 — 40 o menos, o 131 o más"}]},
      { id:"tem", label:"Temperatura (grados C)", options:[
        {v:0,l:"0 — 36,1 a 38"},{v:1,l:"1 — 35,1 a 36, o 38,1 a 39"},
        {v:2,l:"2 — 39,1 o más"},{v:3,l:"3 — 35 o menos"}]},
      { id:"con", label:"Consciencia (ACVDN)", options:[
        {v:0,l:"0 — Alerta"},{v:3,l:"3 — Confusión nueva, responde a voz o dolor, o no responde"}]}
    ],
    compute(v){
      const t = v.fr+v.spo2+v.o2+v.tas+v.fc+v.tem+v.con;
      const mx = Math.max(v.fr,v.spo2,v.o2,v.tas,v.fc,v.tem,v.con);
      let i;
      if(t>=7) i="🔴 Riesgo alto — respuesta de emergencia y valoración por cuidados críticos";
      else if(t>=5) i="🟠 Riesgo medio — respuesta urgente del equipo médico";
      else if(mx>=3) i="🟠 Un solo parámetro con 3 puntos — valoración urgente aunque el total sea bajo";
      else if(t>=1) i="🟡 Riesgo bajo — reevaluar según protocolo";
      else i="🟢 Sin alteración — monitorización rutinaria";
      return { main:"NEWS2 "+t, detail:"FR "+v.fr+" · SatO2 "+v.spo2+" · O2 "+v.o2+" · TAS "+v.tas+" · FC "+v.fc+" · Temperatura "+v.tem+" · Consciencia "+v.con, interp:i };
    }
  },

  rass: {
    title: "RASS (sedación y agitación)", icon: "😴", tag: "Enfermería / Intensiva",
    fields: [
      { id:"r", label:"Nivel observado", options:[
        {v:4,l:"+4 — Combativo"},{v:3,l:"+3 — Muy agitado"},
        {v:2,l:"+2 — Agitado"},{v:1,l:"+1 — Inquieto"},
        {v:0,l:"0 — Alerta y tranquilo"},
        {v:-1,l:"-1 — Somnoliento, mantiene la mirada más de 10 segundos"},
        {v:-2,l:"-2 — Sedación leve, mantiene la mirada menos de 10 segundos"},
        {v:-3,l:"-3 — Sedación moderada, se mueve pero no fija la mirada"},
        {v:-4,l:"-4 — Sedación profunda, responde al estímulo físico"},
        {v:-5,l:"-5 — No despertable"}]}
    ],
    compute(v){
      const t = v.r;
      let i;
      if(t>=2) i="🔴 Agitación — descartar dolor, delirio, hipoxia o abstinencia antes de aumentar la sedación";
      else if(t===1) i="🟠 Inquietud — vigilar y valorar la causa";
      else if(t>=-2) i="🟢 Objetivo habitual de sedación ligera en el paciente crítico";
      else if(t>=-4) i="🟠 Sedación profunda — revisar si el objetivo pautado lo justifica";
      else i="🔴 No despertable — reevaluar la pauta de sedación y descartar causa neurológica";
      return { main:"RASS "+(t>0?"+"+t:t), detail:"Escala de agitación y sedación de Richmond, de -5 a +4", interp:i };
    }
  },

  morse: {
    title: "Morse (riesgo de caídas)", icon: "⚠️", tag: "Enfermería / Seguridad",
    fields: [
      { id:"ant", label:"Antecedente de caídas recientes", options:[
        {v:0,l:"0 — No"},{v:25,l:"25 — Sí"}]},
      { id:"dx", label:"Más de un diagnóstico médico", options:[
        {v:0,l:"0 — No"},{v:15,l:"15 — Sí"}]},
      { id:"ayu", label:"Ayuda para deambular", options:[
        {v:0,l:"0 — Ninguna, reposo en cama o ayuda de enfermería"},
        {v:15,l:"15 — Muletas, bastón o andador"},
        {v:30,l:"30 — Se apoya en el mobiliario"}]},
      { id:"iv", label:"Terapia intravenosa o vía heparinizada", options:[
        {v:0,l:"0 — No"},{v:20,l:"20 — Sí"}]},
      { id:"mar", label:"Marcha", options:[
        {v:0,l:"0 — Normal, reposo en cama o inmovilidad"},
        {v:10,l:"10 — Débil"},{v:20,l:"20 — Alterada o inestable"}]},
      { id:"men", label:"Estado mental", options:[
        {v:0,l:"0 — Consciente de sus limitaciones"},
        {v:15,l:"15 — Olvida o sobreestima sus limitaciones"}]}
    ],
    compute(v){
      const t = v.ant+v.dx+v.ayu+v.iv+v.mar+v.men;
      let i;
      if(t>=45) i="🔴 Riesgo alto — medidas específicas de prevención de caídas y registro en el plan de cuidados";
      else if(t>=25) i="🟠 Riesgo medio — medidas preventivas estándar";
      else i="🟢 Riesgo bajo — medidas básicas de seguridad";
      return { main:"Morse "+t+" / 125", detail:"Antecedente "+v.ant+" · Diagnósticos "+v.dx+" · Ayuda "+v.ayu+" · Vía IV "+v.iv+" · Marcha "+v.mar+" · Mental "+v.men, interp:i };
    }
  },

  dolor: {
    title: "Dolor (EVA y escala numérica)", icon: "🤕", tag: "Enfermería / Dolor",
    fields: [
      { id:"d", label:"Intensidad referida por el paciente", options:[
        {v:0,l:"0 — Sin dolor"},{v:1,l:"1"},{v:2,l:"2"},{v:3,l:"3"},{v:4,l:"4"},{v:5,l:"5"},
        {v:6,l:"6"},{v:7,l:"7"},{v:8,l:"8"},{v:9,l:"9"},{v:10,l:"10 — El peor dolor imaginable"}]}
    ],
    compute(v){
      const t = v.d;
      let i;
      if(t===0) i="🟢 Sin dolor — mantener la reevaluación pautada";
      else if(t<=3) i="🟡 Dolor leve — medidas no farmacológicas y analgesia de primer escalón si procede";
      else if(t<=6) i="🟠 Dolor moderado — revisar la pauta analgésica y reevaluar tras administrarla";
      else i="🔴 Dolor intenso — analgesia de rescate y reevaluación precoz";
      return { main:"Dolor "+t+" / 10", detail:"Escala visual analógica o escala numérica verbal", interp:i };
    }
  },

  gcs: {
    title: "Glasgow (GCS)", icon: "🧠", tag: "Neuro / Trauma",
    fields: [
      { id:"O", label:"Apertura ocular", options:[
        {v:4,l:"4 — Espontánea"},{v:3,l:"3 — A la voz"},
        {v:2,l:"2 — Al dolor"},{v:1,l:"1 — Ninguna"}
      ]},
      { id:"V", label:"Respuesta verbal", options:[
        {v:5,l:"5 — Orientada"},{v:4,l:"4 — Confusa"},
        {v:3,l:"3 — Palabras inapropiadas"},{v:2,l:"2 — Sonidos"},
        {v:1,l:"1 — Ninguna"}
      ]},
      { id:"M", label:"Respuesta motora", options:[
        {v:6,l:"6 — Obedece órdenes"},{v:5,l:"5 — Localiza el dolor"},
        {v:4,l:"4 — Retirada al dolor"},{v:3,l:"3 — Flexión (decorticación)"},
        {v:2,l:"2 — Extensión (descerebración)"},{v:1,l:"1 — Ninguna"}
      ]}
    ],
    compute(v){
      const t = v.O + v.V + v.M;
      let sev; if(t<=8) sev="🔴 Grave — considerar IOT si ≤8";
      else if(t<=12) sev="🟠 Moderado"; else sev="🟢 Leve";
      return { main:`GCS ${t} / 15`, detail:`O${v.O} V${v.V} M${v.M}`, interp:sev };
    }
  },

  nihss: {
    title: "NIHSS (Ictus)", icon: "🧠", tag: "Neuro",
    fields: [
      { id:"a1", label:"1a. Nivel de conciencia", options:[
        {v:0,l:"0 — Alerta"},{v:1,l:"1 — Somnolencia"},
        {v:2,l:"2 — Obnubilación"},{v:3,l:"3 — Coma"}]},
      { id:"a2", label:"1b. Preguntas (mes y edad)", options:[
        {v:0,l:"0 — Ambas correctas"},{v:1,l:"1 — Una"},{v:2,l:"2 — Ninguna"}]},
      { id:"a3", label:"1c. Órdenes (abrir/cerrar ojo y mano)", options:[
        {v:0,l:"0 — Ambas"},{v:1,l:"1 — Una"},{v:2,l:"2 — Ninguna"}]},
      { id:"a4", label:"2. Mirada conjugada", options:[
        {v:0,l:"0 — Normal"},{v:1,l:"1 — Paresia parcial"},{v:2,l:"2 — Desviación forzada"}]},
      { id:"a5", label:"3. Campos visuales", options:[
        {v:0,l:"0 — Normal"},{v:1,l:"1 — Cuadrantopsia"},
        {v:2,l:"2 — Hemianopsia"},{v:3,l:"3 — Bilateral"}]},
      { id:"a6", label:"4. Parálisis facial", options:[
        {v:0,l:"0 — Normal"},{v:1,l:"1 — Menor"},
        {v:2,l:"2 — Parcial"},{v:3,l:"3 — Completa"}]},
      { id:"a7", label:"5a. Motor brazo IZQ", options:[
        {v:0,l:"0 — Mantiene 10s"},{v:1,l:"1 — Cae antes de 10s"},
        {v:2,l:"2 — No vence gravedad"},{v:3,l:"3 — Sin movimiento contra gravedad"},
        {v:4,l:"4 — Ningún movimiento"}]},
      { id:"a8", label:"5b. Motor brazo DCH", options:[
        {v:0,l:"0 — Mantiene 10s"},{v:1,l:"1 — Cae antes de 10s"},
        {v:2,l:"2 — No vence gravedad"},{v:3,l:"3 — Sin movimiento contra gravedad"},
        {v:4,l:"4 — Ningún movimiento"}]},
      { id:"a9", label:"6a. Motor pierna IZQ", options:[
        {v:0,l:"0 — Mantiene 5s"},{v:1,l:"1 — Cae antes de 5s"},
        {v:2,l:"2 — No vence gravedad"},{v:3,l:"3 — Sin movimiento contra gravedad"},
        {v:4,l:"4 — Ningún movimiento"}]},
      { id:"a10", label:"6b. Motor pierna DCH", options:[
        {v:0,l:"0 — Mantiene 5s"},{v:1,l:"1 — Cae antes de 5s"},
        {v:2,l:"2 — No vence gravedad"},{v:3,l:"3 — Sin movimiento contra gravedad"},
        {v:4,l:"4 — Ningún movimiento"}]},
      { id:"a11", label:"7. Ataxia de miembros", options:[
        {v:0,l:"0 — Ausente"},{v:1,l:"1 — En 1 miembro"},{v:2,l:"2 — En 2 miembros"}]},
      { id:"a12", label:"8. Sensibilidad", options:[
        {v:0,l:"0 — Normal"},{v:1,l:"1 — Leve/moderada"},{v:2,l:"2 — Grave/anestesia"}]},
      { id:"a13", label:"9. Lenguaje", options:[
        {v:0,l:"0 — Normal"},{v:1,l:"1 — Afasia leve"},
        {v:2,l:"2 — Afasia grave"},{v:3,l:"3 — Mutismo/global"}]},
      { id:"a14", label:"10. Disartria", options:[
        {v:0,l:"0 — Normal"},{v:1,l:"1 — Leve"},{v:2,l:"2 — Grave/anartria"}]},
      { id:"a15", label:"11. Extinción / negligencia", options:[
        {v:0,l:"0 — Ausente"},{v:1,l:"1 — Parcial (1 modalidad)"},
        {v:2,l:"2 — Profunda (>1 modalidad)"}]}
    ],
    compute(v){
      const t = Object.values(v).reduce((a,b)=>a+b,0);
      let sev;
      if(t<5) sev="🟢 Leve";
      else if(t<=15) sev="🟠 Moderado";
      else if(t<=20) sev="🔴 Grave";
      else sev="🔴 Muy grave";
      return { main:`NIHSS ${t} / 42`, detail:``, interp:sev };
    }
  },

  wellsTvp: {
    title: "Wells TVP", icon: "🦵", tag: "Vascular",
    fields: [
      { id:"c1", label:"Cáncer activo (últimos 6 meses)", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"c2", label:"Parálisis / paresia / inmovilización de MMII", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"c3", label:"Encamado ≥3 días o cirugía mayor <12 sem", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"c4", label:"Dolor a la palpación del trayecto venoso", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"c5", label:"Aumento de todo el miembro inferior", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"c6", label:"Aumento >3 cm circunferencia pantorrilla", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"c7", label:"Edema con fóvea unilateral", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"c8", label:"Venas colaterales superficiales (no varicosas)", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"c9", label:"Antecedente de TVP", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"c10", label:"Diagnóstico alternativo MÁS probable", options:[{v:0,l:"No"},{v:-2,l:"Sí (−2)"}]}
    ],
    compute(v){
      const t = Object.values(v).reduce((a,b)=>a+b,0);
      let sev;
      if(t<=0) sev="🟢 Baja probabilidad (~5%)";
      else if(t<=2) sev="🟠 Moderada (~17%)";
      else sev="🔴 Alta (~53%) — eco Doppler urgente";
      return { main:`Wells TVP: ${t}`, detail:``, interp:sev };
    }
  },

  wellsTep: {
    title: "Wells TEP", icon: "🫁", tag: "Vascular",
    fields: [
      { id:"c1", label:"Signos/síntomas clínicos de TVP", options:[{v:0,l:"No"},{v:3,l:"Sí (+3)"}]},
      { id:"c2", label:"Diagnóstico alternativo MENOS probable que TEP", options:[{v:0,l:"No"},{v:3,l:"Sí (+3)"}]},
      { id:"c3", label:"Frecuencia cardíaca >100 lpm", options:[{v:0,l:"No"},{v:1.5,l:"Sí (+1.5)"}]},
      { id:"c4", label:"Inmovilización ≥3 días o cirugía <4 sem", options:[{v:0,l:"No"},{v:1.5,l:"Sí (+1.5)"}]},
      { id:"c5", label:"Antecedente de TVP/TEP", options:[{v:0,l:"No"},{v:1.5,l:"Sí (+1.5)"}]},
      { id:"c6", label:"Hemoptisis", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"c7", label:"Cáncer activo", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]}
    ],
    compute(v){
      const t = Object.values(v).reduce((a,b)=>a+b,0);
      let sev, dic;
      if(t<2) { sev="🟢 Baja (~3%)"; }
      else if(t<=6) { sev="🟠 Moderada (~28%)"; }
      else { sev="🔴 Alta (~78%) — Angio-TC urgente"; }
      dic = t>4 ? "Dicotomizado: TEP PROBABLE (>4)" : "Dicotomizado: TEP IMPROBABLE (≤4) — considerar dímero-D";
      return { main:`Wells TEP: ${t}`, detail:dic, interp:sev };
    }
  },

  parkland: {
    title: "Parkland (quemados)", icon: "🔥", tag: "Trauma",
    fields: [
      { id:"peso", label:"Peso (kg)", type:"number", min:1, max:200, def:70, step:1 },
      { id:"scq", label:"Superficie corporal quemada (%)", type:"number", min:1, max:100, def:20, step:1 }
    ],
    compute(v){
      const total = 4 * v.peso * v.scq;
      const primeras8 = total/2;
      const siguientes16 = total/2;
      const mlH_1 = primeras8/8;
      const mlH_2 = siguientes16/16;
      return {
        main: `Total 24 h: ${Math.round(total)} mL de Ringer Lactato`,
        detail: `Primeras 8 h: <b>${Math.round(primeras8)} mL</b> (${Math.round(mlH_1)} mL/h)<br>Siguientes 16 h: <b>${Math.round(siguientes16)} mL</b> (${Math.round(mlH_2)} mL/h)`,
        interp: `⚠️ Ajustar según diuresis (objetivo 0.5-1 mL/kg/h adulto, 1 mL/kg/h niños). Contar desde el momento de la quemadura.`
      };
    }
  },

  pafi: {
    title: "PaFi / SDRA", icon: "🫁", tag: "Respiratorio",
    fields: [
      { id:"pao2", label:"PaO₂ (mmHg)", type:"number", min:20, max:600, def:80, step:1 },
      { id:"fio2", label:"FiO₂ (%)", type:"number", min:21, max:100, def:40, step:1 }
    ],
    compute(v){
      const pafi = v.pao2 / (v.fio2/100);
      let sev, kirby;
      if(pafi>300) { sev="🟢 Normal / sin SDRA"; }
      else if(pafi>200) { sev="🟡 SDRA LEVE (Berlín)"; }
      else if(pafi>100) { sev="🟠 SDRA MODERADO (Berlín) — valorar prono, PEEP alta"; }
      else { sev="🔴 SDRA GRAVE (Berlín) — decúbito prono, ECMO?"; }
      return {
        main: `PaFi = ${Math.round(pafi)} mmHg`,
        detail: `PaO₂ ${v.pao2} / FiO₂ ${(v.fio2/100).toFixed(2)}`,
        interp: sev
      };
    }
  },

  dosisPed: {
    title: "Dosis pediátricas", icon: "👶", tag: "Pediatría",
    fields: [
      { id:"peso", label:"Peso (kg)", type:"number", min:1, max:80, def:15, step:0.5 },
      { id:"farm", label:"Fármaco", options:[
        {v:"adr",   l:"Adrenalina IV/IO 0.01 mg/kg (1:10 000)"},
        {v:"adrIM", l:"Adrenalina IM 0.01 mg/kg (1:1000) — anafilaxia"},
        {v:"atro",  l:"Atropina 0.02 mg/kg (mín 0.1 mg)"},
        {v:"amio",  l:"Amiodarona 5 mg/kg IV (parada)"},
        {v:"midaz", l:"Midazolam 0.1-0.2 mg/kg IV/IN"},
        {v:"prop",  l:"Propofol 2-3 mg/kg IV inducción"},
        {v:"keta",  l:"Ketamina 1-2 mg/kg IV / 4-5 IM"},
        {v:"fent",  l:"Fentanilo 1-2 mcg/kg IV"},
        {v:"morf",  l:"Morfina 0.1 mg/kg IV"},
        {v:"succi", l:"Succinilcolina 1-2 mg/kg IV"},
        {v:"rocu",  l:"Rocuronio 0.6-1 mg/kg IV (RSI 1.2)"},
        {v:"dexa",  l:"Dexametasona 0.6 mg/kg VO/IV (máx 16 mg)"},
        {v:"lora",  l:"Lorazepam 0.1 mg/kg IV (máx 4 mg)"},
        {v:"lev",   l:"Levetiracetam 40-60 mg/kg IV (status)"},
        {v:"sf20",  l:"Bolus SF/RL 20 mL/kg"},
        {v:"glu",   l:"Glucosa 25% 2 mL/kg IV (hipoglucemia)"},
        {v:"bica",  l:"Bicarbonato 1M 1 mEq/kg IV"},
        {v:"cef",   l:"Cefotaxima 50 mg/kg IV (máx 2 g)"},
        {v:"cefme", l:"Ceftriaxona 50-100 mg/kg IV (máx 4 g)"},
        {v:"vanco", l:"Vancomicina 15 mg/kg IV"},
        {v:"paraIV",l:"Paracetamol IV 15 mg/kg (máx 1 g)"},
        {v:"ibu",   l:"Ibuprofeno 10 mg/kg VO"}
      ]}
    ],
    compute(v){
      const p = v.peso;
      const dosis = {
        adr:   { d: (p*0.01).toFixed(2)+" mg IV/IO (=" + (p*0.1).toFixed(1) + " mL de 1:10 000)", max: "máx 1 mg" },
        adrIM: { d: (p*0.01).toFixed(2)+" mg IM (=" + (p*0.01).toFixed(2) + " mL de 1:1000)", max: "máx 0.5 mg" },
        atro:  { d: Math.max(0.1, p*0.02).toFixed(2)+" mg IV", max: "máx 1 mg (0.5 en niños)" },
        amio:  { d: (p*5).toFixed(0)+" mg IV en bolo (parada)", max: "máx 300 mg" },
        midaz: { d: (p*0.1).toFixed(1)+" - "+(p*0.2).toFixed(1)+" mg IV/IN", max: "máx 10 mg" },
        prop:  { d: (p*2).toFixed(0)+" - "+(p*3).toFixed(0)+" mg IV inducción", max: "" },
        keta:  { d: (p*1).toFixed(0)+" - "+(p*2).toFixed(0)+" mg IV / "+(p*4).toFixed(0)+"-"+(p*5).toFixed(0)+" mg IM", max: "" },
        fent:  { d: (p*1).toFixed(0)+" - "+(p*2).toFixed(0)+" mcg IV", max: "" },
        morf:  { d: (p*0.1).toFixed(1)+" mg IV", max: "máx 10 mg" },
        succi: { d: (p*1).toFixed(0)+" - "+(p*2).toFixed(0)+" mg IV", max: "" },
        rocu:  { d: "Estándar: "+(p*0.6).toFixed(0)+" mg / RSI: "+(p*1.2).toFixed(0)+" mg IV", max: "" },
        dexa:  { d: Math.min(16, p*0.6).toFixed(1)+" mg VO/IV", max: "máx 16 mg" },
        lora:  { d: Math.min(4, p*0.1).toFixed(1)+" mg IV", max: "máx 4 mg" },
        lev:   { d: (p*40).toFixed(0)+" - "+(p*60).toFixed(0)+" mg IV (diluir)", max: "máx 4500 mg" },
        sf20:  { d: (p*20).toFixed(0)+" mL de SF/RL en 10-15 min", max: "reevaluar tras cada bolus" },
        glu:   { d: (p*2).toFixed(0)+" mL de glucosa 25%", max: "" },
        bica:  { d: (p*1).toFixed(0)+" mEq (= "+(p*1).toFixed(0)+" mL de 1M)", max: "" },
        cef:   { d: Math.min(2000, p*50).toFixed(0)+" mg IV cada 6-8 h", max: "máx 2 g/dosis" },
        cefme: { d: Math.min(4000, p*80).toFixed(0)+" mg IV cada 12-24 h", max: "máx 4 g/dosis" },
        vanco: { d: (p*15).toFixed(0)+" mg IV cada 6 h", max: "máx 1 g/dosis" },
        paraIV:{ d: Math.min(1000, p*15).toFixed(0)+" mg IV cada 6-8 h", max: "máx 1 g/dosis" },
        ibu:   { d: (p*10).toFixed(0)+" mg VO cada 6-8 h", max: "máx 400 mg/dosis" }
      };
      const r = dosis[v.farm] || { d:"—", max:"" };
      return {
        main: r.d,
        detail: r.max,
        interp: `Peso: ${p} kg. Verifica la dosis con la ficha del fármaco antes de administrar.`
      };
    }
  },

  qsofa: {
    title: "qSOFA (Sepsis)", icon: "🚨", tag: "UCI / Urgencias",
    fields: [
      { id:"fr", label:"Frecuencia respiratoria ≥22 rpm", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"ec", label:"Alteración del estado mental (GCS <15)", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"pas", label:"Presión arterial sistólica ≤100 mmHg", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]}
    ],
    compute(v){
      const t = v.fr + v.ec + v.pas;
      let sev, det;
      if(t>=2){
        sev="🔴 qSOFA ≥2: Alta sospecha de sepsis";
        det="Evaluar disfunción orgánica con SOFA completo y valorar ingreso en UCI";
      } else {
        sev=t===1?"🟡 qSOFA 1: Baja sospecha — reevaluar si empeora":"🟢 qSOFA 0: Baja sospecha de sepsis";
        det="No excluye sepsis. Reevaluar ante evolución clínica adversa.";
      }
      return { main:`qSOFA ${t} / 3`, detail:det, interp:sev };
    }
  },

  sofa: {
    title: "SOFA (Sepsis)", icon: "🏥", tag: "UCI / Sepsis",
    fields: [
      { id:"resp", label:"Respiratorio — PaFi (mmHg)", options:[
        {v:0,l:"0 — PaFi ≥400"},{v:1,l:"1 — PaFi 300-399"},
        {v:2,l:"2 — PaFi 200-299"},{v:3,l:"3 — PaFi 100-199 + VM"},
        {v:4,l:"4 — PaFi <100 + VM"}
      ]},
      { id:"neuro", label:"Neurológico — GCS", options:[
        {v:0,l:"0 — GCS 15"},{v:1,l:"1 — GCS 13-14"},
        {v:2,l:"2 — GCS 10-12"},{v:3,l:"3 — GCS 6-9"},
        {v:4,l:"4 — GCS <6"}
      ]},
      { id:"cardio", label:"Cardiovascular — PAM / vasopresores", options:[
        {v:0,l:"0 — PAM ≥70 mmHg sin vasopresores"},
        {v:1,l:"1 — PAM <70 mmHg sin vasopresores"},
        {v:2,l:"2 — Dopamina ≤5 o Dobutamina (cualquier dosis)"},
        {v:3,l:"3 — Dopamina >5 o NA/adrenalina ≤0.1 mcg/kg/min"},
        {v:4,l:"4 — Dopamina >15 o NA/adrenalina >0.1 mcg/kg/min"}
      ]},
      { id:"hepa", label:"Hepático — Bilirrubina (mg/dL)", options:[
        {v:0,l:"0 — <1.2"},{v:1,l:"1 — 1.2-1.9"},
        {v:2,l:"2 — 2.0-5.9"},{v:3,l:"3 — 6.0-11.9"},
        {v:4,l:"4 — ≥12.0"}
      ]},
      { id:"coag", label:"Coagulación — Plaquetas (×10³/µL)", options:[
        {v:0,l:"0 — ≥150"},{v:1,l:"1 — 100-149"},
        {v:2,l:"2 — 50-99"},{v:3,l:"3 — 20-49"},
        {v:4,l:"4 — <20"}
      ]},
      { id:"renal", label:"Renal — Creatinina (mg/dL) o diuresis", options:[
        {v:0,l:"0 — <1.2"},{v:1,l:"1 — 1.2-1.9"},
        {v:2,l:"2 — 2.0-3.4"},{v:3,l:"3 — 3.5-4.9 o <500 mL/día"},
        {v:4,l:"4 — ≥5.0 o <200 mL/día"}
      ]}
    ],
    compute(v){
      const t = Object.values(v).reduce((a,b)=>a+b,0);
      let sev;
      if(t<=1) sev="🟢 Mortalidad estimada <10%";
      else if(t<=5) sev="🟡 Mortalidad ~15-20%";
      else if(t<=8) sev="🟠 Mortalidad ~20-40%";
      else if(t<=11) sev="🔴 Mortalidad >40-60%";
      else sev="🔴 Mortalidad >80%";
      return {
        main:`SOFA ${t} / 24`,
        detail:"⚠️ Aumento de SOFA ≥2 = criterio de disfunción orgánica por sepsis (Sepsis-3)",
        interp:sev
      };
    }
  },

  cha2ds2: {
    title: "CHA₂DS₂-VASc (FA)", icon: "❤️", tag: "Cardiología",
    fields: [
      { id:"c",  label:"IC congestiva / Disfunción sistólica VI", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"h",  label:"Hipertensión arterial", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"a2", label:"Edad ≥75 años", options:[{v:0,l:"No"},{v:2,l:"Sí (+2)"}]},
      { id:"d",  label:"Diabetes mellitus", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"s2", label:"ACV / TIA / Tromboembolismo previo", options:[{v:0,l:"No"},{v:2,l:"Sí (+2)"}]},
      { id:"v",  label:"Enfermedad vascular (IAM previo, AOP, placa aórtica)", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"a1", label:"Edad 65-74 años", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"sc", label:"Sexo femenino", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]}
    ],
    compute(v){
      const t = Object.values(v).reduce((a,b)=>a+b,0);
      const isFemale = v.sc===1;
      const clinScore = isFemale ? t-1 : t;
      let sev, rec;
      if(clinScore<=0){
        sev="🟢 Riesgo bajo"; rec="No se recomienda anticoagulación";
      } else if(clinScore===1 && !isFemale){
        sev="🟡 Riesgo intermedio"; rec="Considerar ACO (valoración individual, preferir NACO)";
      } else {
        sev="🔴 Riesgo elevado"; rec="Anticoagulación oral recomendada — NACO de elección (Guía ESC 2023)";
      }
      return { main:`CHA₂DS₂-VASc: ${t}`, detail:rec, interp:sev };
    }
  },

  hasbled: {
    title: "HAS-BLED (sangrado)", icon: "💊", tag: "Cardiología",
    fields: [
      { id:"h", label:"H — Hipertensión (PAS >160 mmHg)", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"a", label:"A — Disfunción renal o hepática", options:[
        {v:0,l:"Ninguna (0)"},{v:1,l:"Una anormal (+1)"},{v:2,l:"Ambas anormales (+2)"}
      ]},
      { id:"s", label:"S — ACV previo", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"b", label:"B — Sangrado previo o predisposición hemorrágica", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"l", label:"L — INR lábil / TTR <60% (si en AVK)", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"e", label:"E — Edad >65 años", options:[{v:0,l:"No"},{v:1,l:"Sí (+1)"}]},
      { id:"d", label:"D — Fármacos (antiagregantes/AINEs) o alcohol", options:[
        {v:0,l:"Ninguno (0)"},{v:1,l:"Uno (+1)"},{v:2,l:"Ambos (+2)"}
      ]}
    ],
    compute(v){
      const t = Object.values(v).reduce((a,b)=>a+b,0);
      let sev;
      if(t<=1) sev="🟢 Riesgo bajo de sangrado";
      else if(t===2) sev="🟡 Riesgo intermedio";
      else sev="🔴 Riesgo alto (≥3) — Revisar factores modificables";
      return {
        main:`HAS-BLED: ${t}`,
        detail:"⚠️ Score ≥3 no contraindica ACO pero requiere revisar factores corregibles (HTA, fármacos, alcohol, INR lábil)",
        interp:sev
      };
    }
  }
};
