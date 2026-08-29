import type { Calculator } from '../engine/types'
import { fmt } from '../engine/types'

const S = (arr: (number | undefined | boolean)[]): number => arr.reduce<number>((a, b) => a + Number(b || 0), 0)

const CAT_SALUD_MENTAL = 'Geriatría, fragilidad y salud mental'
const CAT_URG = 'Urgencias y decisión clínica'
const CAT_MED = 'Medicina interna y familiar'
const CAT_INFEC = 'Infecciones'
const CAT_DOLOR = 'Dolor'
const CAT_TOX = 'Endocrino y tóxicos'
const CAT_FORM = 'Fórmulas y cálculos clínicos'
const CAT_HEMAT = 'Hematología y oncología'
const CAT_TEV = 'Tromboembolismo venoso'
const CAT_GO = 'Obstetricia y ginecología'
const CAT_NEO = 'Neonatología y pediatría'

const MED = ['Medicina Familiar']
const URG = ['Emergencias']
const PED = ['Pediatría']

// ------- helpers de escalas frecuentes (0-3) ---------
const OPC03 = [
  { label: '0 — Nunca', value: 0 },
  { label: '1 — Varios días', value: 1 },
  { label: '2 — Más de la mitad de los días', value: 2 },
  { label: '3 — Casi todos los días', value: 3 },
]

export const primaryCare: Calculator[] = [
  // -------- PHQ-9 --------
  {
    id: 'phq-9',
    name: 'PHQ-9 — cribado de depresión',
    shortName: 'PHQ-9',
    description:
      'Frecuencia de nueve síntomas depresivos en las últimas 2 semanas (DSM-5). Cribado y seguimiento.',
    category: CAT_SALUD_MENTAL,
    specialty: MED,
    inputs: [
      { id: 'anhedonia', type: 'select', label: '1. Poco interés o placer en hacer cosas', options: OPC03 },
      { id: 'depresion', type: 'select', label: '2. Sensación de estar decaído/a, deprimido/a o sin esperanza', options: OPC03 },
      { id: 'sueno', type: 'select', label: '3. Problemas para dormir o dormir en exceso', options: OPC03 },
      { id: 'cansancio', type: 'select', label: '4. Cansancio o poca energía', options: OPC03 },
      { id: 'apetito', type: 'select', label: '5. Poco apetito o comer en exceso', options: OPC03 },
      { id: 'fracaso', type: 'select', label: '6. Sentirse mal consigo mismo/a, fracasado/a o culpable', options: OPC03 },
      { id: 'concentracion', type: 'select', label: '7. Dificultad para concentrarse (leer, ver TV)', options: OPC03 },
      { id: 'psicomotor', type: 'select', label: '8. Lentitud o inquietud psicomotora percibidas por los demás', options: OPC03 },
      { id: 'ideacion', type: 'select', label: '9. Ideas de muerte, autolesión o «estaría mejor muerto/a»', options: OPC03 },
    ],
    compute: (v) => {
      const total = S([v.anhedonia, v.depresion, v.sueno, v.cansancio, v.apetito, v.fracaso, v.concentracion, v.psicomotor, v.ideacion])
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Sin depresión (0–4).'
      if (total >= 20) { level = 'danger'; sub = 'Depresión grave (≥ 20): iniciar tratamiento activo y valoración especializada.' }
      else if (total >= 15) { level = 'warn'; sub = 'Depresión moderadamente grave (15–19): tratamiento activo.' }
      else if (total >= 10) { level = 'warn'; sub = 'Depresión moderada (10–14): considerar tratamiento activo.' }
      else if (total >= 5) { level = 'info'; sub = 'Depresión leve (5–9): vigilancia y apoyo.' }
      const ideacion = Number(v.ideacion) > 0
      return {
        main: fmt(total),
        mainUnit: 'puntos (0–27)',
        interpretation: (ideacion ? '⚠ Ítem 9 positivo: valorar riesgo de suicidio con entrevista dirigida. ' : '') + sub, level: ideacion ? 'danger' : level,
      }
    },
    notes: ['Kroenke K, Spitzer RL, Williams JB. J Gen Intern Med 2001. Punto de corte ≥ 10 sensibilidad ~88 %, especificidad ~88 %. Ítem 9 obliga a valorar riesgo suicida.'],
  },

  // -------- GAD-7 --------
  {
    id: 'gad-7',
    name: 'GAD-7 — cribado de ansiedad generalizada',
    shortName: 'GAD-7',
    description: 'Frecuencia de 7 síntomas de ansiedad en las últimas 2 semanas.',
    category: CAT_SALUD_MENTAL,
    specialty: MED,
    inputs: [
      { id: 'nervios', type: 'select', label: '1. Sentirse nervioso/a, ansioso/a o con los nervios de punta', options: OPC03 },
      { id: 'preocuparse', type: 'select', label: '2. No poder dejar de preocuparse o controlar la preocupación', options: OPC03 },
      { id: 'diversas', type: 'select', label: '3. Preocuparse demasiado por diferentes cosas', options: OPC03 },
      { id: 'relajarse', type: 'select', label: '4. Dificultad para relajarse', options: OPC03 },
      { id: 'inquieto', type: 'select', label: '5. Estar tan inquieto/a que resulta difícil quedarse sentado/a', options: OPC03 },
      { id: 'irritable', type: 'select', label: '6. Enfadarse o irritarse fácilmente', options: OPC03 },
      { id: 'miedo', type: 'select', label: '7. Sentir miedo como si algo horrible fuese a suceder', options: OPC03 },
    ],
    compute: (v) => {
      const total = S([v.nervios, v.preocuparse, v.diversas, v.relajarse, v.inquieto, v.irritable, v.miedo])
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Ansiedad mínima (0–4).'
      if (total >= 15) { level = 'danger'; sub = 'Ansiedad grave (≥ 15): considerar tratamiento activo y derivación.' }
      else if (total >= 10) { level = 'warn'; sub = 'Ansiedad moderada (10–14): valorar tratamiento.' }
      else if (total >= 5) { level = 'info'; sub = 'Ansiedad leve (5–9): vigilar evolución.' }
      return { main: fmt(total), mainUnit: 'puntos (0–21)', interpretation: sub, level }
    },
    notes: ['Spitzer RL. Arch Intern Med 2006. Punto de corte ≥ 10 para TAG: sensibilidad 89 %, especificidad 82 %.'],
  },

  // -------- AUDIT-C --------
  {
    id: 'audit-c',
    name: 'AUDIT-C — cribado de consumo de riesgo de alcohol',
    shortName: 'AUDIT-C',
    description: 'Tres primeras preguntas del AUDIT: frecuencia y cantidad de consumo.',
    category: CAT_SALUD_MENTAL,
    specialty: MED,
    inputs: [
      {
        id: 'frecuencia',
        type: 'select',
        label: '¿Con qué frecuencia consume alguna bebida alcohólica?',
        options: [
          { label: '0 — Nunca', value: 0 },
          { label: '1 — Una vez al mes o menos', value: 1 },
          { label: '2 — 2–4 veces al mes', value: 2 },
          { label: '3 — 2–3 veces por semana', value: 3 },
          { label: '4 — 4 o más veces por semana', value: 4 },
        ],
      },
      {
        id: 'unidades',
        type: 'select',
        label: '¿Cuántas consumiciones de bebida alcohólica toma un día normal?',
        options: [
          { label: '0 — 1 o 2', value: 0 },
          { label: '1 — 3 o 4', value: 1 },
          { label: '2 — 5 o 6', value: 2 },
          { label: '3 — 7 a 9', value: 3 },
          { label: '4 — 10 o más', value: 4 },
        ],
      },
      {
        id: 'atracon',
        type: 'select',
        label: '¿Con qué frecuencia toma 6 o más bebidas en una sola ocasión?',
        options: [
          { label: '0 — Nunca', value: 0 },
          { label: '1 — Menos de una vez al mes', value: 1 },
          { label: '2 — Mensualmente', value: 2 },
          { label: '3 — Semanalmente', value: 3 },
          { label: '4 — A diario o casi a diario', value: 4 },
        ],
      },
      { id: 'sexo', type: 'select', label: 'Sexo', noPoints: true, options: [
        { label: 'Hombre', value: 0 }, { label: 'Mujer', value: 1 },
      ]},
    ],
    compute: (v) => {
      const total = S([v.frecuencia, v.unidades, v.atracon])
      const umbral = v.sexo === 1 ? 3 : 4
      const positivo = total >= umbral
      return {
        main: fmt(total),
        mainUnit: `puntos (umbral ≥ ${umbral})`,
        interpretation: positivo
          ? `Cribado positivo (≥ ${umbral}): consumo de riesgo. Completar el AUDIT-10 y ofrecer intervención breve.`
          : 'Cribado negativo.',
        level: positivo ? 'warn' : 'ok',
      }
    },
    notes: ['Bush K. Arch Intern Med 1998. Puntos de corte 4 en hombres y 3 en mujeres. Cualquier respuesta ≥ 4 en la pregunta 3 sugiere consumo perjudicial.'],
  },

  // -------- DAST-10 --------
  {
    id: 'dast-10',
    name: 'DAST-10 — consumo problemático de drogas',
    shortName: 'DAST-10',
    description: 'Diez preguntas Sí/No sobre uso de drogas (no incluye alcohol) en los últimos 12 meses.',
    category: CAT_SALUD_MENTAL,
    specialty: MED,
    inputs: [
      { id: 'noMedica', type: 'boolean', label: '1. ¿Ha consumido drogas distintas a las que precisa por razones médicas?' },
      { id: 'masDeUna', type: 'boolean', label: '2. ¿Abusa de más de una droga a la vez?' },
      { id: 'parar', type: 'boolean', label: '3. ¿Es incapaz de parar el consumo cuando quiere?' },
      { id: 'lagunas', type: 'boolean', label: '4. ¿Ha tenido pérdidas de memoria (blackouts) o flashbacks por el consumo?' },
      { id: 'culpa', type: 'boolean', label: '5. ¿Se siente mal o culpable por consumir?' },
      { id: 'familia', type: 'boolean', label: '6. ¿Su familia se queja por su consumo?' },
      { id: 'problemas', type: 'boolean', label: '7. ¿Ha descuidado a su familia por el consumo?' },
      { id: 'ilegal', type: 'boolean', label: '8. ¿Ha realizado actividades ilegales para conseguir drogas?' },
      { id: 'abstinencia', type: 'boolean', label: '9. ¿Ha tenido síntomas de abstinencia al parar?' },
      { id: 'medico', type: 'boolean', label: '10. ¿Ha tenido problemas médicos por el consumo (memoria, hepatitis, hemorragias, convulsiones)?' },
    ],
    compute: (v) => {
      const total = S([v.noMedica, v.masDeUna, v.parar, v.lagunas, v.culpa, v.familia, v.problemas, v.ilegal, v.abstinencia, v.medico])
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Sin problemas relacionados con drogas (0).'
      if (total >= 9) { level = 'danger'; sub = 'Nivel grave (9–10): tratamiento intensivo.' }
      else if (total >= 6) { level = 'warn'; sub = 'Nivel sustancial (6–8): evaluación e intervención.' }
      else if (total >= 3) { level = 'warn'; sub = 'Nivel moderado (3–5): evaluación adicional y consejo.' }
      else if (total >= 1) { level = 'info'; sub = 'Nivel bajo (1–2): consejo motivacional breve.' }
      return { main: fmt(total), mainUnit: 'puntos (0–10)', interpretation: sub, level }
    },
    notes: ['Skinner HA. Addict Behav 1982. Punto de corte ≥ 3 para intervención breve, ≥ 6 evaluación intensiva.'],
  },

  // -------- 4AT delirio --------
  {
    id: '4at',
    name: '4AT — cribado rápido de delirio',
    shortName: '4AT',
    description: 'Herramienta de 4 ítems en <2 min para cribar delirio y deterioro cognitivo.',
    category: CAT_SALUD_MENTAL,
    specialty: MED,
    inputs: [
      { id: 'alerta', type: 'select', label: 'Alerta (observar 10 s)', options: [
        { label: '0 — Normal', value: 0 },
        { label: '0 — Levemente somnoliento < 10 s pero luego normal', value: 0 },
        { label: '4 — Claramente anormal (agitación, hipoactividad marcada)', value: 4 },
      ]},
      { id: 'amt4', type: 'select', label: 'AMT-4 (edad, fecha de nacimiento, lugar, año)', options: [
        { label: '0 — Sin errores', value: 0 },
        { label: '1 — 1 error', value: 1 },
        { label: '2 — 2 o más errores / no evaluable', value: 2 },
      ]},
      { id: 'atencion', type: 'select', label: 'Atención: meses del año hacia atrás desde diciembre', options: [
        { label: '0 — Consigue ≥ 7 correctos', value: 0 },
        { label: '1 — Empieza pero < 7 o se niega', value: 1 },
        { label: '2 — No evaluable (somnolencia, mala salud)', value: 2 },
      ]},
      { id: 'curso', type: 'select', label: 'Curso agudo o fluctuante (en las últimas 2 semanas y todavía presente en 24 h)', options: [
        { label: '0 — No', value: 0 },
        { label: '4 — Sí', value: 4 },
      ]},
    ],
    compute: (v) => {
      const total = S([v.alerta, v.amt4, v.atencion, v.curso])
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Delirio o deterioro cognitivo grave improbables (0).'
      if (total >= 4) { level = 'danger'; sub = 'Posible delirio ± deterioro cognitivo (≥ 4): valorar causa, entorno y medicación.' }
      else if (total >= 1) { level = 'warn'; sub = 'Posible deterioro cognitivo (1–3): valorar en profundidad.' }
      return { main: fmt(total), mainUnit: 'puntos (0–12)', interpretation: sub, level }
    },
    notes: ['MacLullich A. Age Ageing 2014. Validado en urgencias, hospitalización y geriatría. Sensibilidad ~90 %, especificidad ~85 % para delirio.'],
  },

  // -------- AMT-4 --------
  {
    id: 'amt-4',
    name: 'AMT-4 — Abbreviated Mental Test',
    shortName: 'AMT-4',
    description: 'Cribado ultrabreve de orientación con 4 preguntas.',
    category: CAT_SALUD_MENTAL,
    specialty: MED,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad correcta' },
      { id: 'nacimiento', type: 'boolean', label: 'Fecha de nacimiento correcta' },
      { id: 'lugar', type: 'boolean', label: 'Lugar donde está correcto' },
      { id: 'anio', type: 'boolean', label: 'Año actual correcto' },
    ],
    compute: (v) => {
      const total = S([v.edad, v.nacimiento, v.lugar, v.anio])
      let level: 'ok' | 'info' | 'warn' = 'ok'
      let sub = 'Orientación conservada (4/4).'
      if (total <= 2) { level = 'warn'; sub = 'Probable deterioro cognitivo (≤ 2/4): completar valoración.' }
      else if (total === 3) { level = 'info'; sub = 'Rendimiento reducido (3/4): repetir en evolución.' }
      return { main: `${total}/4`, interpretation: sub, level }
    },
    notes: ['Swain DG, Nightingale PG. Age Ageing 1997. Rendimiento comparable al AMT-10 para orientación básica.'],
  },

  // -------- PAINAD --------
  {
    id: 'painad',
    name: 'PAINAD — dolor en demencia avanzada',
    shortName: 'PAINAD',
    description: 'Evaluación del dolor por observación (5 dimensiones) en pacientes con demencia moderada-grave.',
    category: CAT_DOLOR,
    specialty: MED,
    inputs: [
      { id: 'respiracion', type: 'select', label: 'Respiración independiente de la vocalización', options: [
        { label: '0 — Normal', value: 0 },
        { label: '1 — Respiración con dificultad ocasional o corta hiperventilación', value: 1 },
        { label: '2 — Respiración ruidosa, hiperventilación prolongada, Cheyne-Stokes', value: 2 },
      ]},
      { id: 'vocalizacion', type: 'select', label: 'Vocalización negativa', options: [
        { label: '0 — Ausente', value: 0 },
        { label: '1 — Gemidos, quejas ocasionales; habla en tono bajo/negativo', value: 1 },
        { label: '2 — Llamadas repetidas, gemidos fuertes o llanto', value: 2 },
      ]},
      { id: 'facial', type: 'select', label: 'Expresión facial', options: [
        { label: '0 — Sonriente o inexpresiva', value: 0 },
        { label: '1 — Triste, atemorizada, ceño fruncido', value: 1 },
        { label: '2 — Muecas', value: 2 },
      ]},
      { id: 'corporal', type: 'select', label: 'Lenguaje corporal', options: [
        { label: '0 — Relajado', value: 0 },
        { label: '1 — Tenso, deambulación afligida, inquietud', value: 1 },
        { label: '2 — Rigidez, puños cerrados, rodillas flexionadas, apartar/golpear', value: 2 },
      ]},
      { id: 'consuelo', type: 'select', label: 'Consolabilidad', options: [
        { label: '0 — Sin necesidad de consuelo', value: 0 },
        { label: '1 — Se distrae o tranquiliza con voz o toque', value: 1 },
        { label: '2 — Imposible consolar, distraer o tranquilizar', value: 2 },
      ]},
    ],
    compute: (v) => {
      const total = S([v.respiracion, v.vocalizacion, v.facial, v.corporal, v.consuelo])
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Sin dolor observado (0).'
      if (total >= 7) { level = 'danger'; sub = 'Dolor intenso (7–10): tratamiento y reevaluación tras 30–60 min.' }
      else if (total >= 4) { level = 'warn'; sub = 'Dolor moderado (4–6): iniciar tratamiento analgésico.' }
      else if (total >= 1) { level = 'info'; sub = 'Dolor leve (1–3): valorar causa y medidas no farmacológicas.' }
      return { main: fmt(total), mainUnit: 'puntos (0–10)', interpretation: sub, level }
    },
    notes: ['Warden V. J Am Med Dir Assoc 2003. Correlación con escalas verbales; recomendada en geriatría y cuidados paliativos.'],
  },

  // -------- MIDAS --------
  {
    id: 'midas',
    name: 'MIDAS — discapacidad por migraña',
    shortName: 'MIDAS',
    description: 'Días perdidos por cefalea en los últimos 3 meses en 5 áreas.',
    category: CAT_MED,
    specialty: MED,
    inputs: [
      { id: 'trabajo', type: 'number', label: '1. Días de trabajo/estudio perdidos (últimos 3 meses)' },
      { id: 'rendimiento', type: 'number', label: '2. Días con rendimiento reducido ≥ 50 % en trabajo/estudio' },
      { id: 'casa', type: 'number', label: '3. Días de tareas del hogar perdidas' },
      { id: 'casaReducido', type: 'number', label: '4. Días con rendimiento reducido ≥ 50 % en tareas del hogar' },
      { id: 'ocio', type: 'number', label: '5. Días de actividades familiares/sociales/ocio perdidas' },
    ],
    compute: (v) => {
      const total = Number(v.trabajo || 0) + Number(v.rendimiento || 0) + Number(v.casa || 0) + Number(v.casaReducido || 0) + Number(v.ocio || 0)
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let grado = 'Grado I: discapacidad mínima (0–5).'
      if (total >= 21) { level = 'danger'; grado = 'Grado IV: discapacidad grave (≥ 21). Profilaxis y valoración especializada.' }
      else if (total >= 11) { level = 'warn'; grado = 'Grado III: discapacidad moderada (11–20). Considerar profilaxis.' }
      else if (total >= 6) { level = 'info'; grado = 'Grado II: discapacidad leve (6–10).' }
      return { main: fmt(total), mainUnit: 'días', interpretation: grado, level }
    },
    notes: ['Stewart WF. Cephalalgia 1999. Se acompaña siempre de dos preguntas adicionales (días con cefalea y su intensidad) que no puntúan.'],
  },

  // -------- NDI --------
  {
    id: 'ndi',
    name: 'NDI — Neck Disability Index',
    shortName: 'NDI',
    description: 'Discapacidad por cervicalgia en 10 áreas (0-5 cada una).',
    category: CAT_MED,
    specialty: MED,
    inputs: Array.from({ length: 10 }).map((_, i) => ({
      id: `q${i + 1}`,
      type: 'select' as const,
      label: [
        '1. Intensidad del dolor',
        '2. Cuidado personal (lavarse, vestirse)',
        '3. Levantar pesos',
        '4. Leer',
        '5. Cefalea',
        '6. Concentración',
        '7. Trabajo',
        '8. Conducir',
        '9. Sueño',
        '10. Ocio',
      ][i],
      options: [
        { label: '0 — Sin problemas', value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
        { label: '5 — Peor imaginable / imposible', value: 5 },
      ],
    })),
    compute: (v) => {
      const total = S([v.q1, v.q2, v.q3, v.q4, v.q5, v.q6, v.q7, v.q8, v.q9, v.q10])
      const pct = (total / 50) * 100
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Sin discapacidad (0–4 puntos, < 10 %).'
      if (total >= 35) { level = 'danger'; sub = 'Discapacidad completa (≥ 70 %): reevaluar diagnóstico.' }
      else if (total >= 25) { level = 'danger'; sub = 'Discapacidad grave (50–68 %).' }
      else if (total >= 15) { level = 'warn'; sub = 'Discapacidad moderada (30–48 %).' }
      else if (total >= 5) { level = 'info'; sub = 'Discapacidad leve (10–28 %).' }
      return { main: `${fmt(total)} (${fmt(pct, 0)} %)`, mainUnit: 'de 50', interpretation: sub, level }
    },
    notes: ['Vernon H. J Manipulative Physiol Ther 1991. Diferencia mínima clínicamente relevante ≈ 5 puntos o 10 %.'],
  },

  // -------- PUQE --------
  {
    id: 'puqe',
    name: 'PUQE — náuseas y vómitos del embarazo',
    shortName: 'PUQE',
    description: 'Suma la duración de las náuseas, el número de vómitos y de arcadas en las últimas 24 h.',
    category: CAT_GO,
    specialty: MED,
    inputs: [
      { id: 'nausea', type: 'select', label: 'Horas con náuseas en 24 h', options: [
        { label: '1 — No', value: 1 },
        { label: '2 — ≤ 1 h', value: 2 },
        { label: '3 — 2–3 h', value: 3 },
        { label: '4 — 4–6 h', value: 4 },
        { label: '5 — > 6 h', value: 5 },
      ]},
      { id: 'vomitos', type: 'select', label: 'Episodios de vómito en 24 h', options: [
        { label: '1 — Ninguno', value: 1 },
        { label: '2 — 1–2', value: 2 },
        { label: '3 — 3–4', value: 3 },
        { label: '4 — 5–6', value: 4 },
        { label: '5 — ≥ 7', value: 5 },
      ]},
      { id: 'arcadas', type: 'select', label: 'Arcadas (sin expulsión) en 24 h', options: [
        { label: '1 — Ninguna', value: 1 },
        { label: '2 — 1–2', value: 2 },
        { label: '3 — 3–4', value: 3 },
        { label: '4 — 5–6', value: 4 },
        { label: '5 — ≥ 7', value: 5 },
      ]},
    ],
    compute: (v) => {
      const total = S([v.nausea, v.vomitos, v.arcadas])
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Náuseas y vómitos leves (≤ 6): antieméticos orales y medidas dietéticas.'
      if (total >= 13) { level = 'danger'; sub = 'Grave (≥ 13): considerar hospitalización, líquidos IV y antieméticos.' }
      else if (total >= 7) { level = 'warn'; sub = 'Moderado (7–12): antieméticos, valorar hidratación y controles.' }
      return { main: fmt(total), mainUnit: 'puntos (3–15)', interpretation: sub, level }
    },
    notes: ['Koren G. Am J Obstet Gynecol 2002 (PUQE-24, modificado en 2005). Alta correlación con calidad de vida y con hospitalización.'],
  },

  // -------- Marburg heart score --------
  {
    id: 'marburg',
    name: 'Puntuación cardíaca de Marburgo — dolor torácico en Primaria',
    shortName: 'Marburgo',
    description: 'Descarta enfermedad coronaria en pacientes con dolor torácico en Atención Primaria.',
    category: CAT_URG,
    specialty: MED,
    inputs: [
      { id: 'edadSexo', type: 'boolean', label: 'Edad y sexo (mujer ≥ 65 años o varón ≥ 55 años)' },
      { id: 'ecvConocida', type: 'boolean', label: 'Enfermedad cardiovascular conocida (coronaria, arteriopatía, ictus)' },
      { id: 'esfuerzo', type: 'boolean', label: 'El dolor empeora con el esfuerzo' },
      { id: 'noPalpacion', type: 'boolean', label: 'El dolor NO se reproduce con la palpación' },
      { id: 'pacienteCardiaco', type: 'boolean', label: 'El paciente cree que es un dolor de origen cardíaco' },
    ],
    compute: (v) => {
      const total = S([v.edadSexo, v.ecvConocida, v.esfuerzo, v.noPalpacion, v.pacienteCardiaco])
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Bajo riesgo (0–2): enfermedad coronaria improbable.'
      if (total >= 4) { level = 'danger'; sub = 'Riesgo alto (4–5): probabilidad ~ 63 %, derivar para valoración cardiológica.' }
      else if (total >= 3) { level = 'warn'; sub = 'Riesgo intermedio (3): probabilidad ~ 17 %, ampliar pruebas.' }
      return { main: fmt(total), mainUnit: 'puntos (0–5)', interpretation: sub, level }
    },
    notes: ['Bösner S. CMAJ 2010. Sensibilidad 87 %, especificidad 81 % con corte ≥ 3. Uso exclusivo en Atención Primaria, no en urgencias.'],
  },

  // -------- INTERCHEST --------
  {
    id: 'interchest',
    name: 'INTERCHEST — dolor torácico en Primaria',
    shortName: 'INTERCHEST',
    description: 'Alternativa a Marburg. Descarta coronariopatía en Atención Primaria.',
    category: CAT_URG,
    specialty: MED,
    inputs: [
      { id: 'edadSexo', type: 'boolean', label: 'Mujer ≥ 65 años o varón ≥ 55 años' },
      { id: 'ecvHistoria', type: 'boolean', label: 'Antecedentes de enfermedad coronaria' },
      { id: 'esfuerzo', type: 'boolean', label: 'Dolor relacionado con esfuerzo' },
      { id: 'pacienteCardiaco', type: 'boolean', label: 'El paciente asume que es cardíaco' },
      { id: 'presion', type: 'boolean', label: 'Sensación de presión' },
      { id: 'palpacionNo', type: 'boolean', label: 'NO reproducible con la palpación' },
    ],
    compute: (v) => {
      // Puntuación: cada positivo suma; palpación NO reproducible = 1, esfuerzo=1, edad-sexo=1, historia=1, presión=1, paciente=1 (rango 0-6)
      const total = S([v.edadSexo, v.ecvHistoria, v.esfuerzo, v.pacienteCardiaco, v.presion, v.palpacionNo])
      const alto = total >= 2
      return {
        main: fmt(total),
        mainUnit: 'puntos (0–6)',
        interpretation: alto
          ? 'Riesgo aumentado (≥ 2): valorar derivación / pruebas complementarias.'
          : 'Bajo riesgo (0–1): valor predictivo negativo ~ 98 %. Coronariopatía muy improbable.',
        level: alto ? 'warn' : 'ok',
      }
    },
    notes: ['Aerts M. Fam Pract 2017. Punto de corte ≥ 2 con sensibilidad ~ 90 %.'],
  },

  // -------- Pittsburgh knee --------
  {
    id: 'pittsburgh-rodilla',
    name: 'Reglas de rodilla de Pittsburgh',
    shortName: 'Pittsburgh rodilla',
    description: 'Necesidad de radiografía tras traumatismo de rodilla.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      { id: 'mecanismo', type: 'boolean', label: 'Mecanismo: caída o traumatismo con choque directo' },
      { id: 'edad', type: 'select', label: 'Edad', options: [
        { label: '12–50 años', value: 0 },
        { label: '< 12 años', value: 1 },
        { label: '> 50 años', value: 1 },
      ]},
      { id: 'noCarga', type: 'boolean', label: 'Incapaz de caminar 4 pasos con carga en urgencias' },
    ],
    compute: (v) => {
      if (!v.mecanismo) {
        return { main: 'Sin indicación de radiografía', interpretation: 'Falta el criterio de mecanismo traumático (contusión o caída).', level: 'ok' }
      }
      const indicada = v.edad === 1 || v.noCarga === 1
      return {
        main: indicada ? 'Radiografía indicada' : 'Radiografía NO necesaria',
        interpretation: indicada
          ? 'Cumple mecanismo + edad de riesgo o incapacidad para cargar peso: solicitar Rx.'
          : 'Puede evitarse la radiografía si la exploración es normal.',
        level: indicada ? 'warn' : 'ok',
      }
    },
    notes: ['Seaberg DC. Ann Emerg Med 1998. Sensibilidad 99 % para fractura clínicamente significativa.'],
  },

  // -------- PECARN c-spine --------
  {
    id: 'pecarn-cspine',
    name: 'PECARN cervical — lesión de columna cervical pediátrica',
    shortName: 'PECARN cervical',
    description: 'Identifica niños < 18 años con TCE-trauma cervical que requieren imagen.',
    category: CAT_NEO,
    specialty: PED,
    inputs: [
      { id: 'gcs', type: 'boolean', label: 'Alteración de conciencia (GCS < 15, alterado)' },
      { id: 'focal', type: 'boolean', label: 'Déficit neurológico focal' },
      { id: 'dolorCuello', type: 'boolean', label: 'Dolor cervical o dolor a la palpación de línea media' },
      { id: 'torticolis', type: 'boolean', label: 'Torticolis' },
      { id: 'traumaTronco', type: 'boolean', label: 'Traumatismo torácico significativo' },
      { id: 'condicionAlto', type: 'boolean', label: 'Condición predisponente (Down, artritis reumatoide, EDS, otros)' },
      { id: 'buceoAlto', type: 'boolean', label: 'Buceo o mecanismo de alto riesgo (accidente vehículo > 60 km/h, atropello, caída > 3 m)' },
    ],
    compute: (v) => {
      const alto = S([v.gcs, v.focal, v.dolorCuello, v.torticolis, v.traumaTronco, v.condicionAlto, v.buceoAlto])
      if (alto === 0) {
        return {
          main: 'Imagen NO necesaria',
          interpretation: 'Sin factores de riesgo: valor predictivo negativo alto. Retirar collarín tras exploración.',
          level: 'ok',
        }
      }
      return {
        main: 'Considerar imagen cervical',
        interpretation: `${alto} factor(es) presente(s): TC cervical o Rx AP/lateral/odontoides según protocolo local.`,
        level: 'warn',
      }
    },
    notes: ['Leonard JC. Ann Emerg Med 2011. Estudio original: 8 factores con sensibilidad 98 %. La regla PECARN 2024 (Leonard JC. Lancet Child Adolesc Health) simplifica; usar la versión clásica hasta validación local.'],
  },

  // -------- ATLAS C. difficile --------
  {
    id: 'atlas-cdiff',
    name: 'ATLAS — pronóstico de C. difficile',
    shortName: 'ATLAS',
    description: 'Predice la respuesta al tratamiento en infección por Clostridioides difficile.',
    category: CAT_INFEC,
    specialty: MED,
    inputs: [
      { id: 'edad', type: 'select', label: 'Edad', options: [
        { label: '0 — < 60 años', value: 0 },
        { label: '1 — 60–79 años', value: 1 },
        { label: '2 — ≥ 80 años', value: 2 },
      ]},
      { id: 'tempC', type: 'select', label: 'Temperatura', options: [
        { label: '0 — ≤ 37,5 °C', value: 0 },
        { label: '1 — 37,6–38,5 °C', value: 1 },
        { label: '2 — > 38,5 °C', value: 2 },
      ]},
      { id: 'leucos', type: 'select', label: 'Leucocitos (×10⁹/L)', options: [
        { label: '0 — < 16', value: 0 },
        { label: '1 — 16–25', value: 1 },
        { label: '2 — > 25', value: 2 },
      ]},
      { id: 'albumina', type: 'select', label: 'Albúmina (g/dL)', options: [
        { label: '0 — > 3,5', value: 0 },
        { label: '1 — 2,6–3,5', value: 1 },
        { label: '2 — < 2,6', value: 2 },
      ]},
      { id: 'antibiotico', type: 'boolean', label: 'Antibiótico sistémico concomitante' },
    ],
    compute: (v) => {
      const total = S([v.edad, v.tempC, v.leucos, v.albumina, v.antibiotico ? 2 : 0])
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Buen pronóstico (0–3): curación esperada.'
      if (total >= 8) { level = 'danger'; sub = 'Muy mal pronóstico (≥ 8): considerar tratamiento intensivo y valoración quirúrgica.' }
      else if (total >= 6) { level = 'warn'; sub = 'Mal pronóstico (6–7): vigilancia estrecha.' }
      else if (total >= 4) { level = 'info'; sub = 'Riesgo intermedio (4–5).' }
      return { main: fmt(total), mainUnit: 'puntos (0–10)', interpretation: sub, level }
    },
    notes: ['Miller MA. BMC Infect Dis 2013. Correlaciona con curación al día 10 y recaída.'],
  },

  // -------- Martin LDL --------
  {
    id: 'martin-ldl',
    name: 'LDL de Martin-Hopkins',
    shortName: 'LDL Martin',
    description: 'Alternativa a Friedewald: usa relación TG/VLDL ajustada por franja de triglicéridos.',
    category: CAT_FORM,
    specialty: MED,
    inputs: [
      { id: 'colTotal', type: 'number', label: 'Colesterol total (mg/dL)' },
      { id: 'hdl', type: 'number', label: 'HDL (mg/dL)' },
      { id: 'trigliceridos', type: 'number', label: 'Triglicéridos (mg/dL)' },
    ],
    compute: (v) => {
      const ct = Number(v.colTotal)
      const hdl = Number(v.hdl)
      const tg = Number(v.trigliceridos)
      if (!ct || !hdl || !tg) return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' }
      if (tg >= 400) return { main: '—', interpretation: 'Con TG ≥ 400 mg/dL no se recomienda estimar el LDL: solicitar LDL directo.', level: 'warn' }
      // Tabla 180-celdas de Martin: aproximación por franjas
      const noHDL = ct - hdl
      const franjas: Array<[number, number, number[]]> = [
        // [minTG, maxTG, ratios por bandas de no-HDL: <100, 100-129, 130-159, 160-189, 190-219, ≥220]
        [0, 49, [3.5, 3.4, 3.3, 3.3, 3.2, 3.1]],
        [50, 69, [4.0, 3.9, 3.7, 3.6, 3.5, 3.4]],
        [70, 99, [4.3, 4.2, 4.0, 3.9, 3.8, 3.7]],
        [100, 129, [4.9, 4.6, 4.4, 4.2, 4.1, 4.0]],
        [130, 159, [5.4, 5.0, 4.8, 4.6, 4.5, 4.4]],
        [160, 199, [6.2, 5.5, 5.2, 5.0, 4.8, 4.7]],
        [200, 249, [7.2, 6.2, 5.7, 5.5, 5.3, 5.2]],
        [250, 299, [8.5, 6.8, 6.3, 6.0, 5.8, 5.6]],
        [300, 399, [10.6, 8.0, 7.2, 6.8, 6.5, 6.4]],
      ]
      const banda = noHDL < 100 ? 0 : noHDL < 130 ? 1 : noHDL < 160 ? 2 : noHDL < 190 ? 3 : noHDL < 220 ? 4 : 5
      const franja = franjas.find(([lo, hi]) => tg >= lo && tg <= hi) || franjas[franjas.length - 1]
      const ratio = franja[2][banda]
      const ldl = ct - hdl - tg / ratio
      return {
        main: fmt(ldl, 0),
        mainUnit: 'mg/dL',
        interpretation: `no-HDL ${fmt(noHDL, 0)} · TG/VLDL ratio ${ratio}. Más preciso que Friedewald cuando TG 150–400 mg/dL.`,
        level: 'ok',
      }
    },
    notes: ['Martin SS. JAMA 2013 (180-cell table). Recomendado por AHA/ACC 2018 sobre Friedewald.'],
  },

  // -------- Mentzer --------
  {
    id: 'mentzer',
    name: 'Índice de Mentzer',
    shortName: 'Mentzer',
    description: 'Distingue β-talasemia menor de ferropenia en microcitosis.',
    category: CAT_HEMAT,
    specialty: MED,
    inputs: [
      { id: 'vcm', type: 'number', label: 'VCM (fL)' },
      { id: 'hematies', type: 'number', label: 'Hematíes (×10¹²/L)' },
    ],
    compute: (v) => {
      const vcm = Number(v.vcm)
      const rbc = Number(v.hematies)
      if (!vcm || !rbc) return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' }
      const idx = vcm / rbc
      const tal = idx < 13
      return {
        main: fmt(idx, 1),
        mainUnit: 'VCM/RBC',
        interpretation: tal
          ? 'Índice < 13: sugiere β-talasemia menor (hematíes conservados). Solicitar Hb A₂.'
          : 'Índice > 13: sugiere ferropenia. Completar perfil férrico.',
        level: 'info',
      }
    },
    notes: ['Mentzer WC. Lancet 1973. Sensibilidad ~ 80 % — no sustituye a la HPLC en talasemia.'],
  },

  // -------- RFM --------
  {
    id: 'rfm',
    name: 'RFM — Relative Fat Mass',
    shortName: 'RFM',
    description: 'Estima el % de grasa corporal a partir de la relación altura/perímetro de cintura.',
    category: CAT_MED,
    specialty: MED,
    inputs: [
      { id: 'altura', type: 'number', label: 'Altura (cm)' },
      { id: 'cintura', type: 'number', label: 'Perímetro abdominal (cm)' },
      { id: 'sexo', type: 'select', label: 'Sexo', options: [
        { label: 'Hombre', value: 0 }, { label: 'Mujer', value: 1 },
      ]},
    ],
    compute: (v) => {
      const h = Number(v.altura)
      const c = Number(v.cintura)
      if (!h || !c) return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' }
      const base = v.sexo === 1 ? 76 : 64
      const rfm = base - 20 * (h / c)
      const obesidad = v.sexo === 1 ? rfm >= 35 : rfm >= 25
      return {
        main: fmt(rfm, 1),
        mainUnit: '% grasa',
        interpretation: obesidad
          ? 'Compatible con obesidad según % grasa (≥ 25 % en hombres, ≥ 35 % en mujeres).'
          : 'Dentro del rango no-obeso por % de grasa.',
        level: obesidad ? 'warn' : 'ok',
      }
    },
    notes: ['Woolcott OO. Sci Rep 2018. Menos sesgo que el IMC para estimar grasa corporal.'],
  },

  // -------- IMPEDE-VTE --------
  {
    id: 'impede-vte',
    name: 'IMPEDE-VTE — TEV en mieloma múltiple',
    shortName: 'IMPEDE-VTE',
    description: 'Riesgo de tromboembolismo venoso en pacientes con mieloma múltiple.',
    category: CAT_TEV,
    specialty: MED,
    inputs: [
      { id: 'imid', type: 'select', label: 'IMID (talidomida/lenalidomida/pomalidomida)', options: [
        { label: '0 — No', value: 0 },
        { label: '4 — Sí', value: 4 },
      ]},
      { id: 'imcAlto', type: 'boolean', label: 'IMC ≥ 25 kg/m² (+1)' },
      { id: 'fracturaPelvis', type: 'boolean', label: 'Fractura pélvica, cadera o fémur (+4)' },
      { id: 'epo', type: 'boolean', label: 'Uso de eritropoyetina (+1)' },
      { id: 'doxo', type: 'boolean', label: 'Doxorrubicina (+3)' },
      { id: 'dexoAlta', type: 'select', label: 'Dexametasona semanal', options: [
        { label: '0 — No', value: 0 },
        { label: '2 — Dosis estándar', value: 2 },
        { label: '4 — Dosis alta (> 160 mg/mes)', value: 4 },
      ]},
      { id: 'tevPrevio', type: 'boolean', label: 'Antecedente de TEV (+5)' },
      { id: 'trombofilia', type: 'boolean', label: 'Trombofilia conocida (+3)' },
      { id: 'cvc', type: 'boolean', label: 'Catéter venoso central o vía tunelizada (+2)' },
      { id: 'profilaxis', type: 'select', label: 'Profilaxis antitrombótica', options: [
        { label: '0 — Sin profilaxis', value: 0 },
        { label: '-3 — AAS profiláctico', value: -3 },
        { label: '-4 — HBPM o anticoagulación completa', value: -4 },
      ]},
    ],
    compute: (v) => {
      const total = S([
        v.imid, v.imcAlto, v.fracturaPelvis ? 4 : 0, v.epo, v.doxo ? 3 : 0, v.dexoAlta,
        v.tevPrevio ? 5 : 0, v.trombofilia ? 3 : 0, v.cvc ? 2 : 0, v.profilaxis,
      ])
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Riesgo bajo (≤ 3): sin profilaxis específica.'
      if (total >= 8) { level = 'danger'; sub = 'Alto riesgo (≥ 8): profilaxis con HBPM o DOAC durante el ciclo.' }
      else if (total >= 4) { level = 'warn'; sub = 'Riesgo intermedio (4–7): profilaxis con AAS o HBPM según guías.' }
      return { main: fmt(total), mainUnit: 'puntos', interpretation: sub, level }
    },
    notes: ['Sanfilippo KM. Am J Hematol 2019. IMWG y NCCN recomiendan profilaxis desde riesgo intermedio.'],
  },

  // -------- ORT-OUD --------
  {
    id: 'ort-oud',
    name: 'ORT-OUD — riesgo de trastorno por opioides',
    shortName: 'ORT-OUD',
    description: 'Versión actualizada del Opioid Risk Tool. Predice trastorno por uso de opioides antes de prescripciones prolongadas.',
    category: CAT_TOX,
    specialty: MED,
    inputs: [
      { id: 'afAlcohol', type: 'boolean', label: 'Antecedente familiar de abuso de alcohol' },
      { id: 'afIlegal', type: 'boolean', label: 'Antecedente familiar de abuso de drogas ilegales' },
      { id: 'apAlcohol', type: 'boolean', label: 'Antecedente personal de abuso de alcohol' },
      { id: 'apIlegal', type: 'boolean', label: 'Antecedente personal de abuso de drogas ilegales' },
      { id: 'apReceta', type: 'boolean', label: 'Antecedente personal de abuso de fármacos con receta' },
      { id: 'edadJoven', type: 'boolean', label: 'Edad 16–45 años' },
      { id: 'psq', type: 'boolean', label: 'Trastorno psiquiátrico (depresión, TDAH, TOC, bipolar, esquizofrenia)' },
    ],
    compute: (v) => {
      const total = S([v.afAlcohol, v.afIlegal, v.apAlcohol, v.apIlegal, v.apReceta, v.edadJoven, v.psq])
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Riesgo bajo (0–2).'
      if (total >= 4) { level = 'danger'; sub = 'Riesgo alto (≥ 4): considerar alternativas no opioides y consultar con especialista en dolor/adicciones.' }
      else if (total === 3) { level = 'warn'; sub = 'Riesgo moderado (3): consentimiento, monitorización con acuerdo terapéutico y análisis de orina.' }
      return { main: fmt(total), mainUnit: 'puntos (0–7)', interpretation: sub, level }
    },
    notes: ['Cheatle MD. J Pain 2019 (ORT-OUD, versión revisada sin sesgo de sexo). Instrumento de cribado, no diagnóstico.'],
  },

  // -------- MDQ bipolar --------
  {
    id: 'mdq',
    name: 'MDQ — cribado de trastorno bipolar',
    shortName: 'MDQ',
    description: 'Mood Disorder Questionnaire para episodios hipomaníacos/maniacos previos.',
    category: CAT_SALUD_MENTAL,
    specialty: MED,
    inputs: [
      { id: 'sintomas', type: 'select', label: '¿Cuántos de los 13 síntomas típicos ha presentado alguna vez?', options: Array.from({ length: 14 }, (_, i) => ({ label: `${i} síntomas`, value: i })) },
      { id: 'simultaneo', type: 'boolean', label: '¿Varios de esos síntomas ocurrieron al mismo tiempo?' },
      { id: 'problemas', type: 'select', label: 'Grado de problemas que le causaron', options: [
        { label: 'Sin problemas', value: 0 },
        { label: 'Menores', value: 0 },
        { label: 'Moderados', value: 1 },
        { label: 'Graves', value: 1 },
      ]},
    ],
    compute: (v) => {
      const sint = Number(v.sintomas || 0)
      const positivo = sint >= 7 && v.simultaneo === 1 && v.problemas === 1
      return {
        main: positivo ? 'MDQ positivo' : 'MDQ negativo',
        interpretation: positivo
          ? '≥ 7 síntomas + simultáneos + problemas moderados/graves: valoración por psiquiatría para descartar bipolaridad.'
          : 'No cumple criterios para cribado positivo.',
        level: positivo ? 'warn' : 'ok',
      }
    },
    notes: ['Hirschfeld RM. Am J Psychiatry 2000. Sensibilidad ~ 73 %, especificidad 90 %. Complementar con entrevista clínica.'],
  },

  // -------- Paxlovid --------
  {
    id: 'paxlovid',
    name: 'Indicación de Paxlovid (nirmatrelvir/ritonavir)',
    shortName: 'Paxlovid',
    description: 'Elegibilidad de nirmatrelvir/ritonavir para COVID-19 en adultos no hospitalizados.',
    category: CAT_INFEC,
    specialty: MED,
    inputs: [
      { id: 'sintomas', type: 'boolean', label: 'Inicio de síntomas hace ≤ 5 días' },
      { id: 'noHosp', type: 'boolean', label: 'No requiere hospitalización por COVID-19' },
      { id: 'riesgo', type: 'boolean', label: 'Al menos un factor de riesgo (edad ≥ 60, obesidad, diabetes, ERC, EPOC, cardiopatía, inmunodepresión)' },
      { id: 'tfg', type: 'number', label: 'TFG estimada (mL/min/1,73 m²)' },
      { id: 'child', type: 'select', label: 'Función hepática', options: [
        { label: 'Normal o Child-Pugh A', value: 0 },
        { label: 'Child-Pugh B', value: 1 },
        { label: 'Child-Pugh C', value: 2 },
      ]},
      { id: 'interacciones', type: 'boolean', label: 'Fármacos contraindicados: rifampicina, carbamazepina, fenobarbital, hierba de San Juan, dronedarona, midazolam oral, alfuzosina, etc.' },
    ],
    compute: (v) => {
      if (v.interacciones === 1) return { main: 'CONTRAINDICADO', interpretation: 'Interacciones graves con inhibición de CYP3A. Elegir alternativa (remdesivir).', level: 'danger' }
      if (v.child === 2) return { main: 'CONTRAINDICADO', interpretation: 'Child-Pugh C: no usar.', level: 'danger' }
      const tfg = Number(v.tfg)
      if (tfg && tfg < 30) return { main: 'No recomendado', interpretation: 'TFG < 30 mL/min/1,73 m²: no usar Paxlovid. Considerar remdesivir.', level: 'danger' }
      if (!v.sintomas || !v.noHosp || !v.riesgo) return { main: 'No indicado', interpretation: 'No cumple los tres criterios: síntomas ≤ 5 días, ambulatorio y factor de riesgo.', level: 'info' }
      const ajuste = tfg && tfg < 60
      return {
        main: 'Indicado',
        interpretation: ajuste
          ? 'Ajuste de dosis (TFG 30–60): nirmatrelvir 150 mg + ritonavir 100 mg/12 h × 5 días.'
          : 'Dosis estándar: nirmatrelvir 300 mg + ritonavir 100 mg/12 h × 5 días. Revisar interacciones.',
        level: ajuste ? 'warn' : 'ok',
      }
    },
    notes: ['FDA/AEMPS ficha técnica 2024. Iniciar en ≤ 5 días desde el inicio de síntomas. Consultar Liverpool COVID-19 Drug Interactions.'],
  },

  // -------- NAC Rumack-Matthew --------
  {
    id: 'nac-paracetamol',
    name: 'N-acetilcisteína en intoxicación por paracetamol',
    shortName: 'NAC paracetamol',
    description: 'Necesidad y dosificación de N-acetilcisteína (Prescott) según niveles y horas.',
    category: CAT_TOX,
    specialty: URG,
    inputs: [
      { id: 'horas', type: 'number', label: 'Horas desde la ingesta' },
      { id: 'paracetamol', type: 'number', label: 'Paracetamol sérico (µg/mL)' },
      { id: 'peso', type: 'number', label: 'Peso (kg)' },
      { id: 'liberacionSostenida', type: 'boolean', label: 'Formulación de liberación sostenida o ingesta múltiple' },
    ],
    compute: (v) => {
      const h = Number(v.horas)
      const p = Number(v.paracetamol)
      const kg = Number(v.peso)
      if (!h || !p || !kg) return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' }
      if (h < 4) return { main: 'Repetir nivel a las 4 h', interpretation: 'La nomograma no es aplicable antes de las 4 h.', level: 'info' }
      // Rumack-Matthew: línea de tratamiento = 150 µg/mL a las 4 h, semivida 4 h → nivel_umbral = 150 * 0.5^((h-4)/4)
      const umbral = 150 * Math.pow(0.5, (h - 4) / 4)
      const tratar = p >= umbral || v.liberacionSostenida === 1 || h > 24
      const carga = Math.min(kg, 100) * 150
      const dosis2 = Math.min(kg, 100) * 50
      const dosis3 = Math.min(kg, 100) * 100
      return {
        main: tratar ? 'Iniciar NAC IV' : 'NAC NO indicada',
        mainUnit: `umbral ${fmt(umbral, 0)} µg/mL`,
        interpretation: tratar
          ? `Régimen Prescott 21 h (peso máx. 100 kg): ${fmt(carga, 0)} mg en 200 mL en 60 min → ${fmt(dosis2, 0)} mg en 500 mL en 4 h → ${fmt(dosis3, 0)} mg en 1 000 mL en 16 h.`
          : `Nivel ${p} µg/mL < línea de tratamiento (${fmt(umbral, 0)}). Reevaluar clínica y transaminasas.`,
        level: tratar ? 'danger' : 'ok',
      }
    },
    notes: ['Prescott LF 1979; Rumack BH 1975. En Reino Unido se usa una línea única a 100 µg/mL (SNAP 12 h). Iniciar sin esperar niveles si ingesta > 150 mg/kg o desconocida.'],
    references: ['AEMPS: N-acetilcisteína, ficha técnica · https://cima.aemps.es'],
  },
]
