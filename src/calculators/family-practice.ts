import type { Calculator } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT_SM = 'Geriatría, fragilidad y salud mental'
const CAT_MED = 'Medicina interna y familiar'
const CAT_GO = 'Obstetricia y ginecología'
const CAT_TEV = 'Tromboembolismo venoso'
const CAT_ENDO = 'Endocrino, obesidad y diabetes'
const CAT_RIESGO = 'Riesgo perioperatorio'
const CAT_SCA = 'Síndrome coronario agudo y dolor torácico'
const CAT_SINCOPE = 'Síncope'
const CAT_FORM = 'Fórmulas y cálculos clínicos'

const MED = ['Medicina Familiar']

export const familyPractice: Calculator[] = [
  // -------- EPDS --------
  {
    id: 'epds',
    name: 'EPDS — Escala de Depresión Posnatal de Edimburgo',
    shortName: 'EPDS',
    description: 'Cribado de depresión posparto y del embarazo (10 ítems, últimos 7 días).',
    category: CAT_GO,
    specialty: MED,
    inputs: [
      { id: 'q1', type: 'select', label: '1. He sido capaz de reírme y ver el lado divertido de las cosas', options: [
        { label: '0 — Tanto como siempre', value: 0 },
        { label: '1 — No tanto ahora', value: 1 },
        { label: '2 — Mucho menos ahora', value: 2 },
        { label: '3 — Nada en absoluto', value: 3 },
      ]},
      { id: 'q2', type: 'select', label: '2. He mirado el futuro con ilusión', options: [
        { label: '0 — Tanto como siempre', value: 0 },
        { label: '1 — Menos que antes', value: 1 },
        { label: '2 — Mucho menos que antes', value: 2 },
        { label: '3 — Casi nada', value: 3 },
      ]},
      { id: 'q3', type: 'select', label: '3. Me he culpado innecesariamente cuando las cosas iban mal', options: [
        { label: '0 — Nunca', value: 0 },
        { label: '1 — Casi nunca', value: 1 },
        { label: '2 — Sí, algunas veces', value: 2 },
        { label: '3 — Sí, la mayor parte del tiempo', value: 3 },
      ]},
      { id: 'q4', type: 'select', label: '4. He estado ansiosa o preocupada sin motivo', options: [
        { label: '0 — Nunca', value: 0 },
        { label: '1 — Casi nunca', value: 1 },
        { label: '2 — Sí, a veces', value: 2 },
        { label: '3 — Sí, muy a menudo', value: 3 },
      ]},
      { id: 'q5', type: 'select', label: '5. He sentido miedo o pánico sin motivo', options: [
        { label: '0 — Nunca', value: 0 },
        { label: '1 — No, no mucho', value: 1 },
        { label: '2 — Sí, a veces', value: 2 },
        { label: '3 — Sí, con bastante frecuencia', value: 3 },
      ]},
      { id: 'q6', type: 'select', label: '6. Las cosas me han estado abrumando', options: [
        { label: '0 — Nunca; he manejado todo bien', value: 0 },
        { label: '1 — Casi nunca', value: 1 },
        { label: '2 — Sí, a veces no he podido manejar tan bien como siempre', value: 2 },
        { label: '3 — Sí, la mayor parte del tiempo no he podido manejar nada', value: 3 },
      ]},
      { id: 'q7', type: 'select', label: '7. He estado tan infeliz que he tenido dificultad para dormir', options: [
        { label: '0 — Nunca', value: 0 },
        { label: '1 — Casi nunca', value: 1 },
        { label: '2 — Sí, a veces', value: 2 },
        { label: '3 — Sí, la mayor parte del tiempo', value: 3 },
      ]},
      { id: 'q8', type: 'select', label: '8. Me he sentido triste o desgraciada', options: [
        { label: '0 — Nunca', value: 0 },
        { label: '1 — Casi nunca', value: 1 },
        { label: '2 — Sí, a veces', value: 2 },
        { label: '3 — Sí, la mayor parte del tiempo', value: 3 },
      ]},
      { id: 'q9', type: 'select', label: '9. He estado tan infeliz que he estado llorando', options: [
        { label: '0 — Nunca', value: 0 },
        { label: '1 — Solo ocasionalmente', value: 1 },
        { label: '2 — Sí, con bastante frecuencia', value: 2 },
        { label: '3 — Sí, la mayor parte del tiempo', value: 3 },
      ]},
      { id: 'q10', type: 'select', label: '10. Se me ha ocurrido la idea de hacerme daño', options: [
        { label: '0 — Nunca', value: 0 },
        { label: '1 — Casi nunca', value: 1 },
        { label: '2 — A veces', value: 2 },
        { label: '3 — Sí, con bastante frecuencia', value: 3 },
      ]},
    ],
    compute: (v) => {
      const total = sum(v, ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'])
      const ideacion = (v.q10 ?? 0) > 0
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Cribado negativo (< 10).'
      if (total >= 13) { level = 'danger'; sub = 'Probable depresión posparto (≥ 13): valoración especializada.' }
      else if (total >= 10) { level = 'warn'; sub = 'Posible depresión posparto (10–12): repetir en 2 semanas y valorar.' }
      return {
        main: fmt(total),
        mainUnit: 'puntos (0–30)',
        interpretation: (ideacion ? '⚠ Ítem 10 positivo: valorar riesgo suicida siempre. ' : '') + sub,
        level: ideacion ? 'danger' : level,
      }
    },
    notes: ['Cox JL, Holden JM, Sagovsky R. Br J Psychiatry 1987. Cribado en cualquier momento del embarazo o hasta 12 meses posparto.'],
  },

  // -------- MADRS --------
  {
    id: 'madrs',
    name: 'MADRS — Montgomery-Åsberg Depression Rating Scale',
    shortName: 'MADRS',
    description: 'Gravedad de la depresión en adultos (10 ítems, 0-6 cada uno).',
    category: CAT_SM,
    specialty: MED,
    inputs: [
      'Tristeza aparente','Tristeza referida','Tensión interna','Sueño reducido','Apetito reducido','Dificultad de concentración','Lasitud','Incapacidad para sentir','Pensamientos pesimistas','Pensamientos suicidas'
    ].map((lab, i) => ({
      id: `m${i + 1}`,
      type: 'select' as const,
      label: `${i + 1}. ${lab}`,
      options: [0, 1, 2, 3, 4, 5, 6].map((n) => ({ label: `${n}`, value: n })),
    })),
    compute: (v) => {
      const ids = Array.from({ length: 10 }, (_, i) => `m${i + 1}`)
      const total = sum(v, ids)
      const ideacion = (v.m10 ?? 0) >= 3
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Sin depresión o mínima (0–6).'
      if (total >= 35) { level = 'danger'; sub = 'Depresión grave (≥ 35).' }
      else if (total >= 20) { level = 'warn'; sub = 'Depresión moderada (20–34).' }
      else if (total >= 7) { level = 'info'; sub = 'Depresión leve (7–19).' }
      return {
        main: fmt(total),
        mainUnit: 'puntos (0–60)',
        interpretation: (ideacion ? '⚠ Ítem 10 ≥ 3: valorar riesgo suicida. ' : '') + sub,
        level: ideacion ? 'danger' : level,
      }
    },
    notes: ['Montgomery SA, Åsberg M. Br J Psychiatry 1979. Escala de referencia en ensayos clínicos de depresión mayor.'],
  },

  // -------- C-SSRS simplificado --------
  {
    id: 'c-ssrs',
    name: 'C-SSRS — cribado de ideación y conducta suicida',
    shortName: 'C-SSRS',
    description: 'Versión de cribado (últimos 30 días para ideación; siempre para conducta).',
    category: CAT_SM,
    specialty: MED,
    inputs: [
      { id: 'i1', type: 'boolean', label: '1. ¿Ha deseado estar muerto/a o poder dormirse y no despertar?' },
      { id: 'i2', type: 'boolean', label: '2. ¿Ha tenido pensamientos reales de suicidarse?' },
      { id: 'i3', type: 'boolean', label: '3. ¿Ha pensado en cómo hacerlo (método)?' },
      { id: 'i4', type: 'boolean', label: '4. ¿Ha tenido alguna intención de actuar según estos pensamientos?' },
      { id: 'i5', type: 'boolean', label: '5. ¿Ha comenzado a elaborar un plan específico o lo tiene?' },
      { id: 'c', type: 'boolean', label: '6. En su vida, ¿alguna vez ha hecho algo o preparado algo para acabar con su vida?' },
      { id: 'c3m', type: 'boolean', label: '   ¿Ha ocurrido en los últimos 3 meses?' },
    ],
    compute: (v) => {
      let nivel = 'Sin riesgo detectable'
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Todos los ítems negativos: no se requiere derivación por conducta suicida.'
      if (v.i1 || v.i2) { level = 'info'; nivel = 'Riesgo bajo'; sub = 'Ideación pasiva o activa sin plan: evaluar factores de riesgo y proteger acceso a medios.' }
      if (v.i3) { level = 'warn'; nivel = 'Riesgo moderado'; sub = 'Ideación con método considerado: valoración por salud mental de forma preferente.' }
      if (v.i4 || v.i5) { level = 'danger'; nivel = 'Riesgo alto'; sub = 'Intención o plan específico: derivación urgente y seguridad activa (retirar medios, acompañamiento).' }
      if (v.c && v.c3m) { level = 'danger'; nivel = 'Riesgo alto (conducta reciente)'; sub = 'Conducta suicida en los últimos 3 meses: derivación urgente y valoración de ingreso.' }
      return { main: nivel, interpretation: sub, level }
    },
    notes: ['Posner K. Am J Psychiatry 2011. La respuesta positiva a los ítems 4, 5 o a la conducta reciente exige actuación urgente.'],
  },

  // -------- HITS --------
  {
    id: 'hits',
    name: 'HITS — cribado de violencia de pareja',
    shortName: 'HITS',
    description: 'Cuatro preguntas sobre golpes, insultos, amenazas y gritos en el último año.',
    category: CAT_MED,
    specialty: MED,
    inputs: [
      { id: 'h', type: 'select', label: 'Su pareja le ha pegado físicamente (H)', options: [
        { label: '1 — Nunca', value: 1 },
        { label: '2 — Raras veces', value: 2 },
        { label: '3 — A veces', value: 3 },
        { label: '4 — Con frecuencia', value: 4 },
        { label: '5 — Muy a menudo', value: 5 },
      ]},
      { id: 'i', type: 'select', label: 'Le ha insultado o hablado despectivamente (I)', options: [
        { label: '1 — Nunca', value: 1 },
        { label: '2 — Raras veces', value: 2 },
        { label: '3 — A veces', value: 3 },
        { label: '4 — Con frecuencia', value: 4 },
        { label: '5 — Muy a menudo', value: 5 },
      ]},
      { id: 't', type: 'select', label: 'La ha amenazado con hacerle daño (T)', options: [
        { label: '1 — Nunca', value: 1 },
        { label: '2 — Raras veces', value: 2 },
        { label: '3 — A veces', value: 3 },
        { label: '4 — Con frecuencia', value: 4 },
        { label: '5 — Muy a menudo', value: 5 },
      ]},
      { id: 's', type: 'select', label: 'Le ha gritado o maldecido (S)', options: [
        { label: '1 — Nunca', value: 1 },
        { label: '2 — Raras veces', value: 2 },
        { label: '3 — A veces', value: 3 },
        { label: '4 — Con frecuencia', value: 4 },
        { label: '5 — Muy a menudo', value: 5 },
      ]},
    ],
    compute: (v) => {
      const total = sum(v, ['h', 'i', 't', 's'])
      const positivo = total >= 11
      return {
        main: fmt(total),
        mainUnit: 'puntos (4–20)',
        interpretation: positivo
          ? 'Cribado positivo (≥ 11): valorar violencia de pareja, seguridad y ofrecer recursos.'
          : 'Cribado negativo.',
        level: positivo ? 'warn' : 'ok',
      }
    },
    notes: ['Sherin KM. Fam Med 1998. Punto de corte ≥ 11 con sensibilidad 96 % y especificidad 91 %.'],
  },

  // -------- AAS --------
  {
    id: 'aas',
    name: 'AAS — Abuse Assessment Screen',
    shortName: 'AAS',
    description: 'Cribado de violencia doméstica, especialmente durante el embarazo.',
    category: CAT_MED,
    specialty: MED,
    inputs: [
      { id: 'ultimoAno', type: 'boolean', label: '¿En el último año ha sido golpeada, abofeteada, pateada o agredida físicamente por alguien?' },
      { id: 'embarazo', type: 'boolean', label: 'Durante el embarazo actual, ¿ha sufrido agresiones físicas?' },
      { id: 'sexual', type: 'boolean', label: '¿En el último año ha sido forzada a mantener relaciones sexuales?' },
      { id: 'miedo', type: 'boolean', label: '¿Tiene miedo de su pareja o de alguien de su entorno?' },
    ],
    compute: (v) => {
      const positivo = v.ultimoAno || v.embarazo || v.sexual || v.miedo
      return {
        main: positivo ? 'AAS positivo' : 'AAS negativo',
        interpretation: positivo
          ? 'Cualquier respuesta afirmativa activa: valorar seguridad, red de apoyo y recursos legales/sociales.'
          : 'Sin evidencia actual de violencia doméstica en el cribado.',
        level: positivo ? 'warn' : 'ok',
      }
    },
    notes: ['McFarlane J. JAMA 1992. Instrumento breve validado; combinar con espacio seguro para preguntar.'],
  },

  // -------- Pack-years --------
  {
    id: 'pack-years',
    name: 'Paquetes-año de tabaco',
    shortName: 'Paquetes-año',
    description: 'Cuantifica el consumo acumulado de tabaco.',
    category: CAT_FORM,
    specialty: MED,
    inputs: [
      { id: 'cigarros', type: 'number', label: 'Cigarrillos por día' },
      { id: 'anios', type: 'number', label: 'Años fumando' },
    ],
    compute: (v) => {
      const c = Number(v.cigarros)
      const a = Number(v.anios)
      if (!c || !a) return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' }
      const pky = (c / 20) * a
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'info'
      let sub = 'Consumo cuantificado. Consejo estructurado de deshabituación.'
      if (pky >= 20) { level = 'warn'; sub = 'Consumo ≥ 20 paquetes-año: indicación de cribado de cáncer de pulmón con TC de baja dosis (según edad y estado clínico).' }
      if (pky >= 30) { level = 'danger'; sub = 'Consumo ≥ 30 paquetes-año: cribado firmemente indicado en adultos 50–80 años activos o exfumadores de < 15 años.' }
      return { main: fmt(pky, 1), mainUnit: 'paquetes-año', interpretation: sub, level }
    },
    notes: ['USPSTF 2021: cribado de CP con TCBD en 50–80 años, ≥ 20 paquetes-año, fumadores actuales o exfumadores de < 15 años.'],
  },

  // -------- IPSS / AUA-SI --------
  {
    id: 'ipss',
    name: 'IPSS / AUA-SI — síntomas prostáticos',
    shortName: 'IPSS',
    description: 'Siete síntomas urinarios + una pregunta de calidad de vida.',
    category: CAT_MED,
    specialty: MED,
    inputs: [
      'Sensación de vaciado incompleto','Frecuencia (< 2 h)','Intermitencia','Urgencia','Chorro débil','Esfuerzo para orinar','Nocturia (n.º de veces al día)'
    ].map((lab, i) => ({
      id: `q${i + 1}`,
      type: 'select' as const,
      label: `${i + 1}. ${lab}`,
      options: [
        { label: '0 — Ninguna vez', value: 0 },
        { label: '1 — Menos de 1 de cada 5', value: 1 },
        { label: '2 — Menos de la mitad', value: 2 },
        { label: '3 — La mitad', value: 3 },
        { label: '4 — Más de la mitad', value: 4 },
        { label: '5 — Casi siempre', value: 5 },
      ],
    })),
    compute: (v) => {
      const ids = Array.from({ length: 7 }, (_, i) => `q${i + 1}`)
      const total = sum(v, ids)
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Síntomas leves (0–7).'
      if (total >= 20) { level = 'danger'; sub = 'Síntomas graves (20–35): valorar tratamiento y derivación a urología.' }
      else if (total >= 8) { level = 'warn'; sub = 'Síntomas moderados (8–19): iniciar tratamiento médico.' }
      return { main: fmt(total), mainUnit: 'puntos (0–35)', interpretation: sub, level }
    },
    notes: ['Barry MJ. J Urol 1992. Se acompaña de una octava pregunta (calidad de vida 0–6) que no puntúa pero orienta la decisión terapéutica.'],
  },

  // -------- HERDOO2 --------
  {
    id: 'herdoo2',
    name: 'HERDOO2 — suspender anticoagulación tras TEV no provocado (mujeres)',
    shortName: 'HERDOO2',
    description: 'Identifica mujeres con TEV no provocado que pueden suspender la anticoagulación tras la fase inicial.',
    category: CAT_TEV,
    specialty: MED,
    inputs: [
      { id: 'hiperpig', type: 'boolean', label: 'Hiperpigmentación, edema o eritema de la pierna afectada' },
      { id: 'dimero', type: 'boolean', label: 'Dímero-D ≥ 250 µg/L (con anticoagulación activa)' },
      { id: 'imc', type: 'boolean', label: 'IMC ≥ 30 kg/m²' },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 65 años' },
    ],
    compute: (v) => {
      const total = sum(v, ['hiperpig', 'dimero', 'imc', 'edad'])
      const suspender = total <= 1
      return {
        main: fmt(total),
        mainUnit: 'puntos (0–4)',
        interpretation: suspender
          ? 'Riesgo bajo (≤ 1): puede considerarse suspender anticoagulación (recurrencia anual ~ 3 %).'
          : 'Riesgo alto (≥ 2): mantener anticoagulación (recurrencia anual ~ 8 %).',
        level: suspender ? 'ok' : 'warn',
      }
    },
    notes: ['Rodger MA. BMJ 2017 (validación REVERSE II). Solo aplicable en mujeres tras 5–12 meses de anticoagulación por TEV no provocado.'],
  },

  // -------- Dutch FH --------
  {
    id: 'dutch-fh',
    name: 'Criterios Dutch Lipid Clinic (hipercolesterolemia familiar)',
    shortName: 'Dutch FH',
    description: 'Diagnóstico clínico de hipercolesterolemia familiar (HF) en adultos.',
    category: CAT_MED,
    specialty: MED,
    inputs: [
      { id: 'af1', type: 'boolean', label: 'Familiar de 1er grado con enfermedad coronaria/vascular prematura o LDL > percentil 95', points: 1 },
      { id: 'af2', type: 'boolean', label: 'Familiar de 1er grado con xantomas tendinosos o arco corneal o LDL > percentil 95 (edad < 18 años)', points: 2 },
      { id: 'ap1', type: 'boolean', label: 'Paciente con enfermedad coronaria prematura (< 55 años H / < 60 años M)', points: 2 },
      { id: 'ap2', type: 'boolean', label: 'Paciente con enfermedad vascular cerebral/periférica prematura', points: 1 },
      { id: 'xantoma', type: 'boolean', label: 'Xantomas tendinosos', points: 6 },
      { id: 'arco', type: 'boolean', label: 'Arco corneal antes de los 45 años', points: 4 },
      { id: 'ldl', type: 'select', label: 'LDL colesterol (mg/dL)', options: [
        { label: '0 — < 155', value: 0 },
        { label: '1 — 155–189', value: 1 },
        { label: '3 — 190–249', value: 3 },
        { label: '5 — 250–329', value: 5 },
        { label: '8 — ≥ 330', value: 8 },
      ]},
      { id: 'mutacion', type: 'boolean', label: 'Mutación funcional documentada (LDLR, ApoB, PCSK9)', points: 8 },
    ],
    compute: (v) => {
      const total = sum(v, ['af1','af2','ap1','ap2','xantoma','arco','ldl','mutacion'])
      let dx = 'Diagnóstico improbable (< 3).'
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      if (total > 8) { dx = 'Diagnóstico definitivo (> 8): manejo especializado de HF.'; level = 'danger' }
      else if (total >= 6) { dx = 'Diagnóstico probable (6–8): tratamiento con estatinas de alta intensidad y estudio familiar.'; level = 'warn' }
      else if (total >= 3) { dx = 'Diagnóstico posible (3–5): valorar cribado familiar.'; level = 'info' }
      return { main: fmt(total), mainUnit: 'puntos', interpretation: dx, level }
    },
    notes: ['Dutch Lipid Clinic Network 1999. Criterios recomendados por ESC/EAS para el diagnóstico clínico de HF.'],
  },

  // -------- Gupta neumonía --------
  {
    id: 'gupta-neumonia',
    name: 'Gupta — riesgo de neumonía postoperatoria',
    shortName: 'Gupta neumonía',
    description: 'Predice el riesgo de neumonía en los 30 días tras cirugía no cardíaca.',
    category: CAT_RIESGO,
    specialty: MED,
    inputs: [
      { id: 'edad', type: 'number', label: 'Edad (años)' },
      { id: 'copd', type: 'boolean', label: 'EPOC' },
      { id: 'tabaco', type: 'boolean', label: 'Fumador activo' },
      { id: 'sepsis', type: 'select', label: 'Estado séptico preoperatorio', options: [
        { label: '−0,72 — Ninguno', value: -0.72 },
        { label: '0 — SIRS', value: 0 },
        { label: '+0,42 — Sepsis', value: 0.42 },
        { label: '+1,25 — Shock séptico', value: 1.25 },
      ]},
      { id: 'clase', type: 'select', label: 'Clase funcional', options: [
        { label: '−0,29 — Independiente', value: -0.29 },
        { label: '+0,49 — Parcialmente dependiente', value: 0.49 },
        { label: '+1,26 — Totalmente dependiente', value: 1.26 },
      ]},
      { id: 'asa', type: 'select', label: 'Clasificación ASA', options: [
        { label: '−3 — ASA I', value: -3 },
        { label: '−1,8 — ASA II', value: -1.8 },
        { label: '−0,9 — ASA III', value: -0.9 },
        { label: '0 — ASA IV', value: 0 },
        { label: '+0,65 — ASA V', value: 0.65 },
      ]},
      { id: 'cirugia', type: 'select', label: 'Tipo de cirugía (riesgo)', options: [
        { label: '−1,3 — Piel/anorrectal/mama/ginecológica', value: -1.3 },
        { label: '−0,7 — Otros de riesgo bajo', value: -0.7 },
        { label: '0 — Neurocirugía / abdominal', value: 0 },
        { label: '+0,6 — Vascular / ORL', value: 0.6 },
        { label: '+1 — Torácica / esofágica', value: 1 },
      ]},
    ],
    compute: (v) => {
      const edad = Number(v.edad) || 0
      const x = -2.8977 + 0.0144 * edad + 0.7241 * (v.copd ? 1 : 0) + 0.3225 * (v.tabaco ? 1 : 0) + Number(v.sepsis || 0) + Number(v.clase || 0) + Number(v.asa || 0) + Number(v.cirugia || 0)
      const p = 100 / (1 + Math.exp(-x))
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      if (p >= 5) level = 'danger'
      else if (p >= 2) level = 'warn'
      else if (p >= 1) level = 'info'
      return {
        main: fmt(p, 2),
        mainUnit: '% neumonía a 30 días',
        interpretation: 'Optimizar función pulmonar, cesación tabáquica, fisioterapia respiratoria si riesgo elevado.',
        level,
      }
    },
    notes: ['Gupta H. Chest 2013 (base ACS-NSQIP). Riesgo global < 1 % en cirugía electiva ambulatoria.'],
  },

  // -------- Gupta insuficiencia respiratoria --------
  {
    id: 'gupta-insufresp',
    name: 'Gupta — riesgo de insuficiencia respiratoria postoperatoria',
    shortName: 'Gupta IRA',
    description: 'Predice ventilación mecánica > 48 h o reintubación en los 30 días.',
    category: CAT_RIESGO,
    specialty: MED,
    inputs: [
      { id: 'clase', type: 'select', label: 'Clase funcional', options: [
        { label: '−0,45 — Independiente', value: -0.45 },
        { label: '+0,77 — Parcial', value: 0.77 },
        { label: '+1,26 — Total', value: 1.26 },
      ]},
      { id: 'asa', type: 'select', label: 'ASA', options: [
        { label: '−3,7 — I', value: -3.7 },
        { label: '−2,42 — II', value: -2.42 },
        { label: '−1,56 — III', value: -1.56 },
        { label: '−0,71 — IV', value: -0.71 },
        { label: '0 — V', value: 0 },
      ]},
      { id: 'sepsis', type: 'select', label: 'Estado séptico preoperatorio', options: [
        { label: '−0,55 — Ninguno', value: -0.55 },
        { label: '0 — SIRS', value: 0 },
        { label: '+0,26 — Sepsis', value: 0.26 },
        { label: '+1,3 — Shock séptico', value: 1.3 },
      ]},
      { id: 'emergencia', type: 'boolean', label: 'Cirugía urgente/emergente', points: 0 },
      { id: 'cirugia', type: 'select', label: 'Tipo de cirugía', options: [
        { label: '−1,2 — Piel/anorrectal/mama', value: -1.2 },
        { label: '−0,4 — Otros de riesgo bajo', value: -0.4 },
        { label: '0 — Neurocirugía/abdominal', value: 0 },
        { label: '+0,5 — Vascular/ORL', value: 0.5 },
        { label: '+1,5 — Torácica/esofágica/aórtica', value: 1.5 },
      ]},
    ],
    compute: (v) => {
      const x = -1.7397 + Number(v.clase || 0) + Number(v.asa || 0) + Number(v.sepsis || 0) + (v.emergencia ? 0.535 : 0) + Number(v.cirugia || 0)
      const p = 100 / (1 + Math.exp(-x))
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      if (p >= 5) level = 'danger'
      else if (p >= 2) level = 'warn'
      else if (p >= 1) level = 'info'
      return {
        main: fmt(p, 2),
        mainUnit: '% IRA postoperatoria',
        interpretation: 'Considerar VMNI, fisioterapia y protocolos de extubación segura si riesgo elevado.',
        level,
      }
    },
    notes: ['Gupta H. Mayo Clin Proc 2011.'],
  },

  // -------- Duke treadmill --------
  {
    id: 'duke-treadmill',
    name: 'Puntuación de Duke en ergometría',
    shortName: 'Duke treadmill',
    description: 'Pronóstico coronario tras prueba de esfuerzo estándar (Bruce).',
    category: CAT_SCA,
    specialty: MED,
    inputs: [
      { id: 'minutos', type: 'number', label: 'Duración del ejercicio (minutos)' },
      { id: 'st', type: 'number', label: 'Máxima desviación del ST durante el ejercicio (mm)' },
      { id: 'angina', type: 'select', label: 'Angina durante el ejercicio', options: [
        { label: '0 — Sin angina', value: 0 },
        { label: '1 — Angina no limitante', value: 1 },
        { label: '2 — Angina que obliga a parar', value: 2 },
      ]},
    ],
    compute: (v) => {
      const t = Number(v.minutos)
      const s = Number(v.st)
      if (isNaN(t) || isNaN(s)) return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' }
      const score = t - 5 * s - 4 * Number(v.angina || 0)
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Riesgo bajo (≥ 5): mortalidad anual < 1 %.'
      if (score <= -11) { level = 'danger'; sub = 'Riesgo alto (≤ −11): mortalidad anual > 5 %. Coronariografía.' }
      else if (score < 5) { level = 'warn'; sub = 'Riesgo intermedio (−10 a 4): mortalidad anual ≈ 2–3 %. Considerar imagen funcional.' }
      return { main: fmt(score, 0), mainUnit: 'puntos', interpretation: sub, level }
    },
    notes: ['Mark DB. N Engl J Med 1991. Fórmula: minutos − 5×ST − 4×angina.'],
  },

  // -------- Boston syncope --------
  {
    id: 'boston-sincope',
    name: 'Criterios de síncope de Boston',
    shortName: 'Boston síncope',
    description: 'Identifica pacientes con síncope que requieren ingreso o estudio.',
    category: CAT_SINCOPE,
    specialty: MED,
    inputs: [
      { id: 'sca', type: 'boolean', label: 'Síntomas o signos de síndrome coronario agudo' },
      { id: 'cardio', type: 'boolean', label: 'Antecedente de cardiopatía significativa' },
      { id: 'familia', type: 'boolean', label: 'Antecedentes familiares de muerte súbita' },
      { id: 'ecg', type: 'boolean', label: 'ECG con hallazgos relevantes (BAV, isquemia, QT largo, Brugada, Delta, HVI)' },
      { id: 'esfuerzo', type: 'boolean', label: 'Síncope durante el ejercicio' },
      { id: 'palpit', type: 'boolean', label: 'Palpitaciones antes del síncope' },
      { id: 'hipovol', type: 'boolean', label: 'Signos de hipovolemia o hemorragia (Hb < 9 g/dL, sangrado activo)' },
      { id: 'valvular', type: 'boolean', label: 'Soplo o valvulopatía significativa' },
      { id: 'constantes', type: 'boolean', label: 'Alteración persistente de constantes (bradi < 50, taqui > 100 tras reposo)' },
    ],
    compute: (v) => {
      const ids = ['sca','cardio','familia','ecg','esfuerzo','palpit','hipovol','valvular','constantes']
      const total = sum(v, ids)
      const ingreso = total >= 1
      return {
        main: ingreso ? 'Ingreso recomendado' : 'Alta segura',
        interpretation: ingreso
          ? `${total} criterio(s) positivo(s): monitorización y estudio hospitalario.`
          : 'Ningún criterio de alto riesgo: síncope de bajo riesgo, alta con seguimiento ambulatorio.',
        level: ingreso ? 'warn' : 'ok',
      }
    },
    notes: ['Grossman SA. Ann Emerg Med 2007. Sensibilidad 97 % para eventos adversos a 30 días.'],
  },

  // -------- Karter hipoglucemia --------
  {
    id: 'karter-hipoglucemia',
    name: 'Riesgo de hipoglucemia grave (Karter)',
    shortName: 'Karter',
    description: 'Predice hipoglucemia grave en pacientes con diabetes tipo 2 con hospitalización o visita a urgencias en el último año.',
    category: CAT_ENDO,
    specialty: MED,
    inputs: [
      { id: 'hipoPrevia', type: 'select', label: 'Episodios previos de hipoglucemia en el último año', options: [
        { label: '0', value: 0 },
        { label: '1–2', value: 1 },
        { label: '≥ 3', value: 2 },
      ]},
      { id: 'insulina', type: 'boolean', label: 'Tratamiento con insulina' },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 77 años' },
      { id: 'erc', type: 'boolean', label: 'ERC (TFG < 60)' },
      { id: 'sulfonilurea', type: 'boolean', label: 'Uso de sulfonilurea' },
      { id: 'urgencias', type: 'boolean', label: 'Visita a urgencias en el último año' },
    ],
    compute: (v) => {
      // Simplificación: cada factor pondera 1; hipoPrevia 0/1/2
      const total = Number(v.hipoPrevia || 0) + sum(v, ['insulina','edad','erc','sulfonilurea','urgencias'])
      let categoria = 'Bajo (< 1 %/año).'
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      if (total >= 5) { categoria = 'Alto (> 5 %/año).'; level = 'danger' }
      else if (total >= 3) { categoria = 'Intermedio (~ 1–5 %/año).'; level = 'warn' }
      return { main: fmt(total), mainUnit: 'puntos', interpretation: `Riesgo estimado a 12 meses: ${categoria} Ajustar objetivos de HbA1c y priorizar fármacos con bajo riesgo (metformina, iSGLT2, GLP-1).`, level }
    },
    notes: ['Karter AJ. JAMA Intern Med 2017 (modelo original 6 variables). Herramienta simplificada: use la versión completa para decisiones críticas.'],
  },

  // -------- Cambridge diabetes risk --------
  {
    id: 'cambridge-diabetes',
    name: 'Cambridge Diabetes Risk Score',
    shortName: 'Cambridge',
    description: 'Riesgo de diabetes tipo 2 no diagnosticada en adultos.',
    category: CAT_ENDO,
    specialty: MED,
    inputs: [
      { id: 'edad', type: 'number', label: 'Edad (años)' },
      { id: 'sexo', type: 'select', label: 'Sexo', options: [
        { label: 'Mujer', value: 0 }, { label: 'Hombre', value: 1 },
      ]},
      { id: 'imc', type: 'number', label: 'IMC (kg/m²)' },
      { id: 'familia', type: 'boolean', label: 'Antecedente familiar de diabetes (padres/hermanos)' },
      { id: 'esteroides', type: 'boolean', label: 'Tratamiento con corticoides orales' },
      { id: 'antihta', type: 'boolean', label: 'Tratamiento antihipertensivo actual' },
      { id: 'fumador', type: 'select', label: 'Tabaco', options: [
        { label: 'No fumador', value: 0 },
        { label: 'Exfumador', value: 1 },
        { label: 'Fumador activo', value: 2 },
      ]},
    ],
    compute: (v) => {
      const edad = Number(v.edad)
      const imc = Number(v.imc)
      if (!edad || !imc) return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' }
      const beta = -6.322 + 0.063 * edad + 0.573 * (v.sexo === 1 ? 1 : 0) + 0.116 * imc + 0.728 * (v.familia ? 1 : 0) + 2.191 * (v.esteroides ? 1 : 0) + 1.222 * (v.antihta ? 1 : 0) + 0.855 * (v.fumador === 2 ? 1 : 0) + 0.221 * (v.fumador === 1 ? 1 : 0)
      const p = 100 / (1 + Math.exp(-beta))
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'ok'
      let sub = 'Riesgo bajo (< 3 %).'
      if (p >= 15) { level = 'danger'; sub = 'Riesgo muy alto (≥ 15 %): glucemia/HbA1c ahora.' }
      else if (p >= 8) { level = 'warn'; sub = 'Riesgo alto (8–15 %): cribado y consejo intensivo.' }
      else if (p >= 3) { level = 'info'; sub = 'Riesgo intermedio (3–8 %).' }
      return { main: fmt(p, 1), mainUnit: '% probabilidad', interpretation: sub, level }
    },
    notes: ['Griffin SJ. Diabetes Metab Res Rev 2000. Diseñada como cribado no invasivo.'],
  },
]
