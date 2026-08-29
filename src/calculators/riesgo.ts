import type { Calculator } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Riesgo perioperatorio'
const ANES = ['Anestesiología']

export const riesgo: Calculator[] = [
  {
    id: 'rcri',
    name: 'Índice de riesgo cardíaco revisado (RCRI)',
    shortName: 'RCRI · Lee',
    description:
      'Estima el riesgo de complicaciones cardíacas mayores tras una cirugía no cardíaca.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'altoRiesgo',
        type: 'boolean',
        label: 'Cirugía de alto riesgo',
        description: 'Intraperitoneal, intratorácica o vascular suprainguinal.',
      },
      {
        id: 'cardiopatia',
        type: 'boolean',
        label: 'Antecedentes de cardiopatía isquémica',
        description:
          'Infarto de miocardio previo, prueba de esfuerzo positiva, dolor torácico de origen isquémico, tratamiento con nitratos o ECG con ondas Q patológicas.',
      },
      {
        id: 'icc',
        type: 'boolean',
        label: 'Antecedentes de insuficiencia cardíaca congestiva',
        description:
          'Edema pulmonar, crepitantes bilaterales o galope S3, disnea paroxística nocturna o radiografía con redistribución vascular.',
      },
      {
        id: 'acv',
        type: 'boolean',
        label: 'Antecedentes de enfermedad cerebrovascular',
        description: 'Ictus o accidente isquémico transitorio (AIT) previos.',
      },
      {
        id: 'insulina',
        type: 'boolean',
        label: 'Diabetes en tratamiento con insulina preoperatoria',
      },
      {
        id: 'creatinina',
        type: 'boolean',
        label: 'Creatinina preoperatoria > 2 mg/dL (177 µmol/L)',
      },
    ],
    compute: (v) => {
      const score = sum(v, ['altoRiesgo', 'cardiopatia', 'icc', 'acv', 'insulina', 'creatinina'])
      const pct = [0.5, 1.3, 3.6, 9.1][Math.min(score, 3)]
      const clase = ['I', 'II', 'III', 'IV'][Math.min(score, 3)]
      return {
        main: String(score),
        mainUnit: score === 1 ? 'punto' : 'puntos',
        secondary: `${fmt(pct, 1)} %`,
        secondaryLabel: 'riesgo de evento cardíaco mayor',
        interpretation: `Clase ${clase} de Lee. Riesgo estimado de infarto, edema pulmonar, fibrilación ventricular, parada cardíaca o bloqueo AV completo en el perioperatorio.`,
        level: score === 0 ? 'ok' : score === 1 ? 'info' : score === 2 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Porcentajes de la cohorte original de Lee (clases I–IV: 0,5 / 1,3 / 3,6 / 9,1 %).',
      'Validaciones contemporáneas con vigilancia sistemática de troponinas estiman riesgos mayores (aprox. 3,9 / 6,0 / 10,1 / 15 % para 0, 1, 2 y ≥3 puntos).',
      'Con ≥1 punto y cirugía de riesgo, valorar optimización y vigilancia postoperatoria de troponinas según guías.',
    ],
    references: [
      'Lee TH, et al. Derivation and prospective validation of a simple index for prediction of cardiac risk of major noncardiac surgery. Circulation. 1999;100(10):1043-9.',
      'Duceppe E, et al. Canadian Cardiovascular Society Guidelines on Perioperative Cardiac Risk Assessment. Can J Cardiol. 2017;33(1):17-32.',
    ],
  },
  {
    id: 'stop-bang',
    name: 'Puntuación STOP-BANG para apnea obstructiva del sueño',
    shortName: 'STOP-BANG',
    description: 'Cribado del síndrome de apnea-hipopnea obstructiva del sueño (SAHOS).',
    category: CAT,
    specialty: ANES,
    inputs: [
      { id: 's', type: 'boolean', label: 'Ronquidos fuertes (Snoring)', description: 'Más fuertes que una conversación o audibles a través de una puerta cerrada.' },
      { id: 't', type: 'boolean', label: 'Cansancio diurno (Tiredness)', description: 'Fatiga o somnolencia diurna frecuente.' },
      { id: 'o', type: 'boolean', label: 'Apneas observadas (Observed)', description: 'Alguien ha observado pausas respiratorias durante el sueño.' },
      { id: 'p', type: 'boolean', label: 'Hipertensión arterial (Pressure)', description: 'En tratamiento o diagnosticada.' },
      { id: 'b', type: 'boolean', label: 'IMC > 35 kg/m² (BMI)' },
      { id: 'a', type: 'boolean', label: 'Edad > 50 años (Age)' },
      { id: 'n', type: 'boolean', label: 'Circunferencia del cuello > 40 cm (Neck)' },
      { id: 'g', type: 'boolean', label: 'Sexo masculino (Gender)' },
    ],
    compute: (v) => {
      const score = sum(v, ['s', 't', 'o', 'p', 'b', 'a', 'n', 'g'])
      const stop = sum(v, ['s', 't', 'o', 'p'])
      const altRisk = stop >= 2 && (v.g === 1 || v.b === 1 || v.n === 1)
      const high = score >= 5 || altRisk
      const band = high ? 'alto' : score >= 3 ? 'intermedio' : 'bajo'
      return {
        main: String(score),
        mainUnit: 'puntos',
        interpretation: `Riesgo ${band} de apnea obstructiva del sueño.${
          altRisk && score < 5
            ? ' (≥2 criterios STOP junto con sexo masculino, IMC >35 o cuello >40 cm también clasifica como riesgo alto).'
            : ''
        }`,
        level: high ? 'danger' : score >= 3 ? 'warn' : 'ok',
      }
    },
    notes: [
      '0–2: riesgo bajo · 3–4: riesgo intermedio · 5–8: riesgo alto.',
      'Riesgo alto alternativo: ≥2 ítems STOP + sexo masculino, o IMC >35, o cuello >40 cm.',
      'En riesgo alto, considerar estudio de sueño y precauciones perioperatorias (vía aérea, opioides, monitorización).',
    ],
    references: [
      'Chung F, et al. STOP questionnaire: a tool to screen patients for obstructive sleep apnea. Anesthesiology. 2008;108(5):812-21.',
      'Chung F, et al. STOP-Bang Questionnaire: a practical approach to screen for obstructive sleep apnea. Chest. 2016;149(3):631-8.',
    ],
  },
  {
    id: 'ariscat',
    name: 'Puntuación ARISCAT de complicaciones pulmonares postoperatorias',
    shortName: 'ARISCAT',
    description:
      'Predice el riesgo de complicaciones pulmonares postoperatorias, incluida la insuficiencia respiratoria.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '≤ 50 años', value: 0 },
          { label: '51–80 años', value: 3 },
          { label: '> 80 años', value: 16 },
        ],
      },
      {
        id: 'spo2',
        type: 'select',
        label: 'SpO₂ preoperatoria (aire ambiente, sedestación)',
        options: [
          { label: '≥ 96 %', value: 0 },
          { label: '91–95 %', value: 8 },
          { label: '≤ 90 %', value: 24 },
        ],
      },
      {
        id: 'infeccion',
        type: 'boolean',
        label: 'Infección respiratoria en el último mes',
        description: 'Con fiebre y tratamiento antibiótico.',
        points: 17,
      },
      {
        id: 'anemia',
        type: 'boolean',
        label: 'Anemia preoperatoria (Hb ≤ 10 g/dL)',
        points: 11,
      },
      {
        id: 'incision',
        type: 'select',
        label: 'Localización de la incisión quirúrgica',
        options: [
          { label: 'Periférica', value: 0 },
          { label: 'Abdominal superior', value: 15 },
          { label: 'Intratorácica', value: 24 },
        ],
      },
      {
        id: 'duracion',
        type: 'select',
        label: 'Duración prevista de la cirugía',
        options: [
          { label: '≤ 2 h', value: 0 },
          { label: '> 2–3 h', value: 16 },
          { label: '> 3 h', value: 23 },
        ],
      },
      { id: 'urgente', type: 'boolean', label: 'Cirugía urgente', points: 8 },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'spo2', 'infeccion', 'anemia', 'incision', 'duracion', 'urgente'])
      let band: string, pct: string, level: 'ok' | 'warn' | 'danger'
      if (score < 26) {
        band = 'bajo'
        pct = '1,6 %'
        level = 'ok'
      } else if (score <= 44) {
        band = 'intermedio'
        pct = '13,3 %'
        level = 'warn'
      } else {
        band = 'alto'
        pct = '42,1 %'
        level = 'danger'
      }
      return {
        main: String(score),
        mainUnit: 'puntos',
        secondary: pct,
        secondaryLabel: 'incidencia de complicaciones pulmonares',
        interpretation: `Riesgo ${band} de complicaciones pulmonares postoperatorias (insuficiencia respiratoria, infección, derrame, atelectasia, neumotórax, broncoespasmo o neumonitis por aspiración).`,
        level,
      }
    },
    notes: [
      '< 26 puntos: riesgo bajo (1,6 %) · 26–44: intermedio (13,3 %) · ≥ 45: alto (42,1 %).',
      'En riesgo intermedio-alto: optimización preoperatoria, fisioterapia respiratoria, ventilación protectora y analgesia eficaz.',
    ],
    references: [
      'Canet J, et al. Prediction of postoperative pulmonary complications in a population-based surgical cohort (ARISCAT). Anesthesiology. 2010;113(6):1338-50.',
    ],
  },
  {
    id: 'apfel',
    name: 'Escala de Apfel para náuseas y vómitos postoperatorios',
    shortName: 'Apfel · NVPO',
    description: 'Predice el riesgo de náuseas y vómitos postoperatorios (NVPO) en las primeras 24 h.',
    category: CAT,
    specialty: ANES,
    inputs: [
      { id: 'mujer', type: 'boolean', label: 'Sexo femenino' },
      { id: 'noFumador', type: 'boolean', label: 'No fumador/a' },
      {
        id: 'antecedentes',
        type: 'boolean',
        label: 'Antecedentes de NVPO o cinetosis',
        description: 'NVPO en cirugías previas o mareo por movimiento.',
      },
      {
        id: 'opioides',
        type: 'boolean',
        label: 'Uso previsto de opioides postoperatorios',
      },
    ],
    compute: (v) => {
      const score = sum(v, ['mujer', 'noFumador', 'antecedentes', 'opioides'])
      const pct = [10, 21, 39, 61, 79][score]
      return {
        main: String(score),
        mainUnit: 'puntos',
        secondary: `${pct} %`,
        secondaryLabel: 'riesgo de NVPO en 24 h',
        interpretation:
          score <= 1
            ? 'Riesgo bajo: profilaxis según contexto quirúrgico.'
            : score === 2
              ? 'Riesgo moderado: se recomienda profilaxis con 1–2 antieméticos.'
              : 'Riesgo alto: profilaxis multimodal (≥2 antieméticos) y considerar anestesia total intravenosa.',
        level: score <= 1 ? 'ok' : score === 2 ? 'warn' : 'danger',
      }
    },
    notes: ['Riesgo aproximado: 0 → 10 %, 1 → 21 %, 2 → 39 %, 3 → 61 %, 4 → 79 %.'],
    references: [
      'Apfel CC, et al. A simplified risk score for predicting postoperative nausea and vomiting. Anesthesiology. 1999;91(3):693-700.',
      'Gan TJ, et al. Fourth Consensus Guidelines for the Management of Postoperative Nausea and Vomiting. Anesth Analg. 2020;131(2):411-48.',
    ],
  },
  {
    id: 'asa',
    name: 'Clasificación del estado físico ASA',
    shortName: 'ASA',
    description:
      'Clasifica el estado de salud del paciente antes de la cirugía según la American Society of Anesthesiologists.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'clase',
        type: 'select',
        label: 'Clase ASA',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'ASA I — Paciente sano', value: 1 },
          { label: 'ASA II — Enfermedad sistémica leve', value: 2 },
          { label: 'ASA III — Enfermedad sistémica grave', value: 3 },
          { label: 'ASA IV — Enfermedad sistémica grave con amenaza constante para la vida', value: 4 },
          { label: 'ASA V — Paciente moribundo; no se espera que sobreviva sin la cirugía', value: 5 },
          { label: 'ASA VI — Muerte cerebral declarada; donante de órganos', value: 6 },
        ],
      },
      {
        id: 'urgencia',
        type: 'boolean',
        label: 'Cirugía urgente (añadir sufijo «E»)',
        noPoints: true,
        description: 'El retraso del tratamiento supondría un aumento significativo del riesgo.',
      },
    ],
    compute: (v) => {
      const c = v.clase ?? 1
      const desc = [
        '',
        'Sano, sin enfermedad sistémica; no fumador, consumo de alcohol nulo o mínimo.',
        'Enfermedad sistémica leve sin limitación funcional (p. ej., fumador, embarazo, obesidad 30–40, DM o HTA bien controladas, EPOC leve).',
        'Enfermedad sistémica grave con limitación funcional (p. ej., DM o HTA mal controladas, EPOC, obesidad ≥40, hepatitis activa, marcapasos, FEVI reducida, IAM/ACV/AIT/stents hace >3 meses, ERC en diálisis programada).',
        'Enfermedad grave con amenaza constante para la vida (p. ej., IAM/ACV/AIT/stents hace <3 meses, isquemia miocárdica en curso, disfunción valvular grave, sepsis, CID, SDRA, ERC terminal sin diálisis programada).',
        'Paciente moribundo que no se espera que sobreviva sin la intervención (p. ej., rotura de aneurisma, traumatismo masivo, isquemia intestinal con fallo multiorgánico).',
        'Paciente con muerte cerebral declarada para extracción de órganos.',
      ][c]
      return {
        main: `ASA ${['', 'I', 'II', 'III', 'IV', 'V', 'VI'][c]}${v.urgencia ? ' E' : ''}`,
        interpretation: desc + (v.urgencia ? ' Cirugía de carácter urgente («E»).' : ''),
        level: c <= 2 ? 'ok' : c === 3 ? 'warn' : 'danger',
      }
    },
    notes: [
      'La clasificación ASA por sí sola no predice el riesgo perioperatorio: debe interpretarse junto con el tipo de cirugía y la optimización del paciente.',
    ],
    references: [
      'ASA Physical Status Classification System. American Society of Anesthesiologists (última actualización 2020).',
    ],
  },
  {
    id: 'apgar-quirurgico',
    name: 'Puntuación de Apgar quirúrgica (SAS)',
    shortName: 'Apgar quirúrgico',
    description:
      'Predice el riesgo de complicaciones mayores o muerte en los 30 días posteriores a la cirugía a partir de datos intraoperatorios.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'sangrado',
        type: 'select',
        label: 'Pérdida sanguínea estimada',
        options: [
          { label: '≤ 100 mL', value: 3 },
          { label: '101–600 mL', value: 2 },
          { label: '601–1000 mL', value: 1 },
          { label: '> 1000 mL', value: 0 },
        ],
      },
      {
        id: 'pam',
        type: 'select',
        label: 'PAM más baja durante la cirugía',
        options: [
          { label: '≥ 70 mmHg', value: 3 },
          { label: '55–69 mmHg', value: 2 },
          { label: '40–54 mmHg', value: 1 },
          { label: '< 40 mmHg', value: 0 },
        ],
      },
      {
        id: 'fc',
        type: 'select',
        label: 'Frecuencia cardíaca más baja durante la cirugía',
        options: [
          { label: '≤ 55 lpm', value: 4 },
          { label: '56–65 lpm', value: 3 },
          { label: '66–75 lpm', value: 2 },
          { label: '76–85 lpm', value: 1 },
          { label: '> 85 lpm', value: 0 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['sangrado', 'pam', 'fc'])
      const band =
        score >= 7 ? 'bajo' : score >= 5 ? 'intermedio' : 'alto'
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        interpretation:
          band === 'bajo'
            ? 'Riesgo bajo de complicación mayor o muerte a 30 días.'
            : band === 'intermedio'
              ? 'Riesgo intermedio: valorar vigilancia postoperatoria estrecha.'
              : 'Riesgo alto de complicación mayor o muerte a 30 días: considerar cuidados intensivos/intermedios.',
        level: band === 'bajo' ? 'ok' : band === 'intermedio' ? 'warn' : 'danger',
      }
    },
    notes: [
      'Puntuaciones más bajas indican mayor riesgo; ≤ 4 identifica al grupo de mayor riesgo.',
      'En caso de ritmos anómalos (p. ej., bradiarritmias por bloqueo), usar la FC sinusal más baja registrada.',
    ],
    references: [
      'Gawande AA, et al. An Apgar score for surgery. J Am Coll Surg. 2007;204(2):201-8.',
    ],
  },
  {
    id: 'care',
    name: 'Puntuación CARE de riesgo en anestesia cardíaca',
    shortName: 'CARE',
    description:
      'Clasificación ordinal sencilla que predice morbimortalidad tras cirugía cardíaca.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'clase',
        type: 'select',
        label: 'Categoría CARE',
        dropdown: true,
        noPoints: true,
        options: [
          {
            label: 'CARE 1 — Cardiopatía estable, sin otros problemas médicos; cirugía no compleja',
            value: 1,
          },
          {
            label: 'CARE 2 — Cardiopatía estable con uno o más problemas médicos controlados; cirugía no compleja',
            value: 2,
          },
          {
            label: 'CARE 3 — Cualquier problema médico no controlado O cirugía compleja',
            value: 3,
          },
          {
            label: 'CARE 4 — Problema médico no controlado Y cirugía compleja',
            value: 4,
          },
          {
            label: 'CARE 5 — Cardiopatía crónica o avanzada; cirugía como última esperanza de salvar o mejorar la vida',
            value: 5,
          },
        ],
      },
      {
        id: 'urgencia',
        type: 'boolean',
        label: 'Cirugía de urgencia (añadir sufijo «E»)',
        noPoints: true,
        description: 'Debe operarse tan pronto como el diagnóstico y el quirófano lo permitan.',
      },
    ],
    compute: (v) => {
      const c = v.clase ?? 1
      const ejemplos = [
        '',
        'Ejemplos de problemas no controlados: angina inestable, insuficiencia cardíaca descompensada, HTA grave, insuficiencia renal aguda.',
        'Ejemplos de problemas controlados: HTA, diabetes, EPOC, enfermedades sistémicas controladas.',
        'Cirugía compleja: reintervención, cirugía combinada, cirugía de aorta, FEVI < 0,35, etc.',
        'Combina enfermedad no controlada y cirugía compleja: riesgo elevado.',
        'Riesgo muy elevado de mortalidad y morbilidad.',
      ][c]
      return {
        main: `CARE ${c}${v.urgencia ? ' E' : ''}`,
        interpretation: `A mayor categoría, mayor mortalidad y morbilidad hospitalarias; la urgencia («E») incrementa el riesgo dentro de cada categoría. ${ejemplos}`,
        level: c <= 2 ? 'ok' : c === 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Dupuis JY, et al. The Cardiac Anesthesia Risk Evaluation score: a clinically useful predictor of mortality and morbidity after cardiac surgery. Anesthesiology. 2001;94(2):194-204.',
    ],
  },
  {
    id: 'nhfs',
    name: 'Puntuación de fractura de cadera de Nottingham (NHFS)',
    shortName: 'NHFS',
    description: 'Predice la mortalidad a 30 días tras la cirugía de fractura de cadera.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 66 años', value: 0 },
          { label: '66–85 años', value: 3 },
          { label: '≥ 86 años', value: 4 },
        ],
      },
      { id: 'varon', type: 'boolean', label: 'Sexo masculino' },
      {
        id: 'hb',
        type: 'boolean',
        label: 'Hemoglobina ≤ 10 g/dL al ingreso',
      },
      {
        id: 'amts',
        type: 'boolean',
        label: 'Deterioro cognitivo (AMTS ≤ 6/10)',
        description: 'Abbreviated Mental Test Score al ingreso.',
      },
      {
        id: 'residencia',
        type: 'boolean',
        label: 'Vive en una institución',
        description: 'Residencia o centro sociosanitario.',
      },
      {
        id: 'comorbilidades',
        type: 'boolean',
        label: '≥ 2 comorbilidades',
        description:
          'Entre: cardiopatía, enfermedad cerebrovascular, EPOC/enfermedad respiratoria, enfermedad renal y diabetes.',
      },
      {
        id: 'cancer',
        type: 'boolean',
        label: 'Neoplasia activa en los últimos 20 años',
      },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'varon', 'hb', 'amts', 'residencia', 'comorbilidades', 'cancer'])
      const band = score <= 4 ? 'bajo' : score === 5 ? 'intermedio' : 'alto'
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        interpretation:
          band === 'bajo'
            ? 'Riesgo bajo de mortalidad a 30 días (orientativamente < 7 %).'
            : band === 'intermedio'
              ? 'Riesgo intermedio de mortalidad a 30 días (orientativamente ≈ 10 %).'
              : 'Riesgo alto de mortalidad a 30 días (orientativamente > 15 %): optimización y planificación multidisciplinar precoces.',
        level: band === 'bajo' ? 'ok' : band === 'intermedio' ? 'warn' : 'danger',
      }
    },
    notes: [
      'Los porcentajes son orientativos; la mortalidad exacta por punto varía entre cohortes de validación.',
      'Útil para informar a pacientes y familias y para priorizar la valoración ortogeriátrica.',
    ],
    references: [
      'Maxwell MJ, et al. Development and validation of a preoperative scoring system to predict 30 day mortality in patients undergoing hip fracture surgery. Br J Anaesth. 2008;101(4):511-7.',
      'Wiles MD, et al. Nottingham Hip Fracture Score as a predictor of one year mortality. Br J Anaesth. 2011;106(4):501-4.',
    ],
  },
  {
    id: 'charlson',
    name: 'Índice de comorbilidad de Charlson (CCI)',
    shortName: 'Charlson',
    description:
      'Predice la supervivencia a 10 años en pacientes con múltiples comorbilidades.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 50 años', value: 0 },
          { label: '50–59 años', value: 1 },
          { label: '60–69 años', value: 2 },
          { label: '70–79 años', value: 3 },
          { label: '≥ 80 años', value: 4 },
        ],
      },
      { id: 'iam', type: 'boolean', label: 'Infarto de miocardio', description: 'Antecedente de IAM (no solo cambios ECG).' },
      { id: 'icc', type: 'boolean', label: 'Insuficiencia cardíaca congestiva' },
      { id: 'evp', type: 'boolean', label: 'Enfermedad vascular periférica', description: 'Incluye claudicación, cirugía o aneurisma aórtico ≥ 6 cm.' },
      { id: 'acv', type: 'boolean', label: 'Enfermedad cerebrovascular (ACV o AIT)', description: 'Con secuelas leves o sin secuelas. La hemiplejía puntúa aparte.' },
      { id: 'demencia', type: 'boolean', label: 'Demencia' },
      { id: 'epoc', type: 'boolean', label: 'Enfermedad pulmonar crónica' },
      { id: 'conectivo', type: 'boolean', label: 'Enfermedad del tejido conectivo' },
      { id: 'ulcera', type: 'boolean', label: 'Enfermedad ulcerosa péptica' },
      {
        id: 'higado',
        type: 'select',
        label: 'Hepatopatía',
        options: [
          { label: 'Ninguna', value: 0 },
          { label: 'Leve (hepatitis crónica o cirrosis sin hipertensión portal)', value: 1 },
          { label: 'Moderada-grave (hipertensión portal, varices)', value: 3 },
        ],
      },
      {
        id: 'diabetes',
        type: 'select',
        label: 'Diabetes mellitus',
        options: [
          { label: 'No o controlada con dieta', value: 0 },
          { label: 'Sin lesión de órgano diana', value: 1 },
          { label: 'Con lesión de órgano diana (retinopatía, nefropatía, neuropatía)', value: 2 },
        ],
      },
      { id: 'hemiplejia', type: 'boolean', label: 'Hemiplejía', points: 2 },
      {
        id: 'renal',
        type: 'boolean',
        label: 'Enfermedad renal moderada-grave',
        description: 'Creatinina > 3 mg/dL, diálisis, trasplante o uremia.',
        points: 2,
      },
      {
        id: 'tumor',
        type: 'select',
        label: 'Tumor sólido',
        options: [
          { label: 'No', value: 0 },
          { label: 'Localizado (en los últimos 5 años)', value: 2 },
          { label: 'Metastásico', value: 6 },
        ],
      },
      { id: 'leucemia', type: 'boolean', label: 'Leucemia', points: 2 },
      { id: 'linfoma', type: 'boolean', label: 'Linfoma', points: 2 },
      {
        id: 'sida',
        type: 'boolean',
        label: 'SIDA',
        description: 'Enfermedad definitoria de SIDA (no solo infección por VIH).',
        points: 6,
      },
    ],
    compute: (v) => {
      const score = sum(v, [
        'edad', 'iam', 'icc', 'evp', 'acv', 'demencia', 'epoc', 'conectivo', 'ulcera',
        'higado', 'diabetes', 'hemiplejia', 'renal', 'tumor', 'leucemia', 'linfoma', 'sida',
      ])
      const surv = Math.pow(0.983, Math.exp(0.9 * score)) * 100
      return {
        main: String(score),
        mainUnit: 'puntos',
        secondary: `${fmt(Math.max(surv, 0), surv < 1 ? 1 : 0)} %`,
        secondaryLabel: 'supervivencia estimada a 10 años',
        interpretation:
          score <= 2
            ? 'Carga de comorbilidad baja.'
            : score <= 4
              ? 'Carga de comorbilidad moderada.'
              : 'Carga de comorbilidad alta: pronóstico vital significativamente limitado.',
        level: score <= 2 ? 'ok' : score <= 4 ? 'warn' : 'danger',
        details: [`Supervivencia a 10 años = 0,983^e^(0,9 × ${score}) (fórmula original de Charlson).`],
      }
    },
    notes: [
      'Versión combinada edad-comorbilidad (Charlson-Deyo con puntos por década a partir de los 50 años).',
      'Si coexisten dos grados de la misma enfermedad (p. ej., tumor localizado y metastásico), puntúa solo el más grave.',
    ],
    references: [
      'Charlson ME, et al. A new method of classifying prognostic comorbidity in longitudinal studies. J Chronic Dis. 1987;40(5):373-83.',
      'Charlson ME, et al. Validation of a combined comorbidity index. J Clin Epidemiol. 1994;47(11):1245-51.',
    ],
  },
  {
    id: 'dasi',
    name: 'Índice de estado de actividad de Duke (DASI)',
    shortName: 'DASI',
    description:
      'Estima la capacidad funcional (VO₂ pico y METs) a partir de 12 actividades de la vida diaria.',
    category: CAT,
    specialty: ANES,
    inputs: [
      { id: 'q1', type: 'boolean', label: '¿Puede cuidar de sí mismo/a?', description: 'Comer, vestirse, bañarse o ir al baño.', points: 2.75 },
      { id: 'q2', type: 'boolean', label: '¿Caminar dentro de casa?', points: 1.75 },
      { id: 'q3', type: 'boolean', label: '¿Caminar 1–2 manzanas en llano?', points: 2.75 },
      { id: 'q4', type: 'boolean', label: '¿Subir un tramo de escaleras o una cuesta?', points: 5.5 },
      { id: 'q5', type: 'boolean', label: '¿Correr una distancia corta?', points: 8 },
      { id: 'q6', type: 'boolean', label: '¿Tareas domésticas ligeras?', description: 'Quitar el polvo, fregar los platos.', points: 2.7 },
      { id: 'q7', type: 'boolean', label: '¿Tareas domésticas moderadas?', description: 'Pasar la aspiradora, barrer, llevar la compra.', points: 3.5 },
      { id: 'q8', type: 'boolean', label: '¿Tareas domésticas pesadas?', description: 'Fregar suelos, levantar o mover muebles.', points: 8 },
      { id: 'q9', type: 'boolean', label: '¿Trabajo de jardinería?', description: 'Rastrillar hojas, quitar malas hierbas, cortar el césped.', points: 4.5 },
      { id: 'q10', type: 'boolean', label: '¿Mantener relaciones sexuales?', points: 5.25 },
      { id: 'q11', type: 'boolean', label: '¿Actividades recreativas moderadas?', description: 'Golf, bolos, baile, tenis en dobles.', points: 6 },
      { id: 'q12', type: 'boolean', label: '¿Deportes extenuantes?', description: 'Natación, tenis individual, fútbol, baloncesto, esquí.', points: 7.5 },
    ],
    compute: (v) => {
      const score = sum(v, ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12'])
      const vo2 = 0.43 * score + 9.6
      const mets = vo2 / 3.5
      return {
        main: fmt(score, 2),
        mainUnit: 'puntos (0–58,2)',
        secondary: `${fmt(mets, 1)} METs`,
        secondaryLabel: 'capacidad funcional estimada',
        interpretation:
          score >= 34
            ? 'DASI ≥ 34: buena capacidad funcional, asociada a menor riesgo de complicaciones perioperatorias.'
            : 'DASI < 34: capacidad funcional reducida, asociada a mayor riesgo de eventos cardíacos y complicaciones tras cirugía no cardíaca.',
        level: score >= 34 ? 'ok' : 'warn',
        details: [`VO₂ pico estimado = 0,43 × DASI + 9,6 = ${fmt(vo2, 1)} mL/kg/min.`],
      }
    },
    notes: [
      'Cada actividad que el paciente puede realizar suma su peso; las que no puede realizar suman 0.',
      'El umbral DASI < 34 se asoció a mayor riesgo de lesión miocárdica y complicaciones en el estudio METS (2018).',
    ],
    references: [
      'Hlatky MA, et al. A brief self-administered questionnaire to determine functional capacity (the Duke Activity Status Index). Am J Cardiol. 1989;64(10):651-4.',
      'Wijeysundera DN, et al. Assessment of functional capacity before major non-cardiac surgery (METS study). Lancet. 2018;391(10140):2631-40.',
    ],
  },
]
