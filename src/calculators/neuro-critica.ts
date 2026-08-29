import type { Calculator, Option } from '../engine/types'
import { sum } from '../engine/types'

const CAT = 'Neurología crítica e ictus'
const NEURO = ['Neurología crítica', 'Medicina Intensiva']

const escala = (items: [number, string][]): Option[] =>
  items.map(([value, label]) => ({ label: `${value} — ${label}`, value }))

export const neuroCritica: Calculator[] = [
  {
    id: 'rass',
    name: 'Escala de agitación-sedación de Richmond (RASS)',
    shortName: 'RASS',
    description:
      'Cuantifica de forma objetiva el nivel de agitación o sedación del paciente crítico.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      {
        id: 'nivel',
        type: 'select',
        label: 'Nivel de agitación / sedación',
        dropdown: true,
        noPoints: true,
        options: [
          { label: '+4 — Combativo: violento, peligro inmediato para el personal', value: 4 },
          { label: '+3 — Muy agitado: tira o retira tubos y catéteres, agresivo', value: 3 },
          { label: '+2 — Agitado: movimientos frecuentes sin propósito, lucha con el ventilador', value: 2 },
          { label: '+1 — Inquieto: ansioso pero sin movimientos agresivos', value: 1 },
          { label: '0 — Alerta y tranquilo', value: 0 },
          { label: '−1 — Somnoliento: no plenamente alerta pero mantiene los ojos abiertos > 10 s al hablar', value: -1 },
          { label: '−2 — Sedación ligera: abre los ojos brevemente al hablar (< 10 s)', value: -2 },
          { label: '−3 — Sedación moderada: mueve los ojos o los abre al hablar (sin contacto visual)', value: -3 },
          { label: '−4 — Sedación profunda: sin respuesta a la voz, responde al estímulo físico', value: -4 },
          { label: '−5 — No despertable: sin respuesta a la voz ni al estímulo físico', value: -5 },
        ],
        default: 0,
      },
    ],
    compute: (v) => {
      const n = v.nivel ?? 0
      let interp: string, level: 'ok' | 'info' | 'warn' | 'danger'
      if (n === 0) {
        interp = 'Nivel deseable en la mayoría de los pacientes críticos despiertos.'
        level = 'ok'
      } else if (n > 0) {
        interp =
          n === 1
            ? 'Agitación leve: valorar causas (dolor, delirio, ansiedad, retirada de sedación, hipoxia, retención urinaria) antes de sedar.'
            : n <= 2
              ? 'Agitación moderada: buscar y tratar la causa; valorar apoyo farmacológico si es necesario.'
              : 'Agitación grave: riesgo inmediato de autoextubación y de daño; sedación de rescate y tratamiento etiológico.'
        level = n === 1 ? 'warn' : 'danger'
      } else {
        interp =
          n >= -2
            ? 'Sedación ligera: nivel adecuado para la mayoría de pacientes en ventilación mecánica según la campaña de sedación ligera (PADIS).'
            : n === -3
              ? 'Sedación moderada: valorar si es necesaria esta profundidad; sedación diaria intermitente favorece el destete.'
              : n === -4
                ? 'Sedación profunda: reservada a situaciones específicas (hipertensión intracraneal, SDRA grave con bloqueo neuromuscular, estatus refractario).'
                : 'No despertable: valorar profundidad excesiva o causa neurológica; despertar diario si no está contraindicado.'
        level = n >= -2 ? 'ok' : n === -3 ? 'warn' : 'danger'
      }
      return {
        main: (n > 0 ? '+' : '') + String(n),
        mainUnit: 'RASS',
        interpretation: interp,
        level,
      }
    },
    notes: [
      'Objetivo habitual del paciente crítico en ventilación mecánica: RASS entre 0 y −2.',
      'Con RASS ≥ +2 o ≤ −4, evaluar delirio con CAM-ICU no es fiable: reevaluar cuando la sedación mejore.',
    ],
    references: [
      'Sessler CN, et al. The Richmond Agitation-Sedation Scale: validity and reliability in adult intensive care unit patients. Am J Respir Crit Care Med. 2002;166(10):1338-44.',
    ],
  },
  {
    id: 'aspects',
    name: 'ASPECTS — Alberta Stroke Program Early CT Score',
    shortName: 'ASPECTS',
    description:
      'Cuantifica la extensión de la isquemia precoz en la arteria cerebral media en la tomografía sin contraste.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      { id: 'c', type: 'boolean', label: 'Caudado afectado', labels: ['Normal', 'Isquemia'] },
      { id: 'l', type: 'boolean', label: 'Núcleo lenticular afectado', labels: ['Normal', 'Isquemia'] },
      { id: 'i', type: 'boolean', label: 'Cápsula interna afectada', labels: ['Normal', 'Isquemia'] },
      { id: 'ic', type: 'boolean', label: 'Cinta insular afectada', labels: ['Normal', 'Isquemia'] },
      { id: 'm1', type: 'boolean', label: 'M1 (corteza anterior de la ACM) afectada', labels: ['Normal', 'Isquemia'] },
      { id: 'm2', type: 'boolean', label: 'M2 (corteza lateral al ribete insular) afectada', labels: ['Normal', 'Isquemia'] },
      { id: 'm3', type: 'boolean', label: 'M3 (corteza posterior de la ACM) afectada', labels: ['Normal', 'Isquemia'] },
      { id: 'm4', type: 'boolean', label: 'M4 (territorio ACM anterior superior) afectado', labels: ['Normal', 'Isquemia'] },
      { id: 'm5', type: 'boolean', label: 'M5 (territorio ACM lateral superior) afectado', labels: ['Normal', 'Isquemia'] },
      { id: 'm6', type: 'boolean', label: 'M6 (territorio ACM posterior superior) afectado', labels: ['Normal', 'Isquemia'] },
    ],
    compute: (v) => {
      const afectados = sum(v, ['c', 'l', 'i', 'ic', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'])
      const score = 10 - afectados
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        interpretation:
          score >= 7
            ? 'ASPECTS ≥ 7: rango en el que la trombectomía mecánica es especialmente beneficiosa (junto con NIHSS ≥ 6 y ventana temporal apropiada).'
            : score >= 4
              ? 'ASPECTS 4–6: valorar de forma individualizada la trombectomía; los estudios SELECT2 y ANGEL-ASPECT muestran beneficio en ictus con núcleo más amplio.'
              : 'ASPECTS < 4: infarto extenso ya establecido; el beneficio de reperfusión es menor y el riesgo hemorrágico es mayor.',
        level: score >= 7 ? 'ok' : score >= 4 ? 'warn' : 'danger',
        details: ['Se resta un punto por cada una de las 10 regiones ASPECTS con signos de isquemia precoz.'],
      }
    },
    references: [
      'Barber PA, et al. Validity and reliability of a quantitative computed tomography score in predicting outcome of hyperacute stroke. Lancet. 2000;355(9216):1670-4.',
    ],
  },
  {
    id: 'ottawa-sah',
    name: 'Regla de Ottawa para la hemorragia subaracnoidea',
    shortName: 'Ottawa HSA',
    description:
      'Descarta la hemorragia subaracnoidea en pacientes con cefalea aguda de máxima intensidad.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 40 años' },
      { id: 'rigidez', type: 'boolean', label: 'Rigidez de nuca' },
      { id: 'conciencia', type: 'boolean', label: 'Alteración testificada del nivel de conciencia' },
      { id: 'esfuerzo', type: 'boolean', label: 'Inicio durante el esfuerzo' },
      { id: 'trueno', type: 'boolean', label: 'Cefalea explosiva («en trueno», máxima en segundos)' },
      { id: 'limitacion', type: 'boolean', label: 'Limitación a la flexión cervical' },
    ],
    compute: (v) => {
      const criterios = sum(v, ['edad', 'rigidez', 'conciencia', 'esfuerzo', 'trueno', 'limitacion'])
      return {
        main: criterios === 0 ? 'HSA razonablemente descartada' : 'No se puede descartar HSA',
        secondary: String(criterios),
        secondaryLabel: 'criterios positivos',
        interpretation:
          criterios === 0
            ? 'Regla negativa: sensibilidad ≈ 100 % para HSA en pacientes con cefalea de nueva aparición que alcanzó su intensidad máxima en menos de 1 h y sin déficits focales. No se requieren estudios adicionales por sospecha de HSA (siempre juicio clínico).'
            : 'Al menos un criterio positivo: no puede descartarse HSA por la regla. Estudio con tomografía sin contraste; si es negativa dentro de 6 h del inicio, valor predictivo negativo muy alto en el paciente neurológicamente intacto.',
        level: criterios === 0 ? 'ok' : 'danger',
      }
    },
    notes: [
      'Solo aplicable a pacientes ≥ 15 años con cefalea de nueva aparición no traumática, no déficits focales y no antecedente de aneurisma, HSA previa, tumor cerebral o cefaleas similares recurrentes.',
    ],
    references: [
      'Perry JJ, et al. Clinical decision rules to rule out subarachnoid hemorrhage for acute headache. JAMA. 2013;310(12):1248-55.',
    ],
  },
  {
    id: 'mbig',
    name: 'Brain Injury Guidelines modificado (mBIG)',
    shortName: 'mBIG',
    description:
      'Estratifica el traumatismo craneoencefálico leve con hallazgos en tomografía para orientar el manejo.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      {
        id: 'gcs',
        type: 'select',
        label: 'GCS al ingreso',
        options: [
          { label: '15', value: 0 },
          { label: '13–14', value: 1 },
          { label: '≤ 12', value: 2 },
        ],
      },
      { id: 'anticoagulacion', type: 'boolean', label: 'Anticoagulación o antiagregación (excepto AAS profiláctica)' },
      { id: 'intoxicacion', type: 'boolean', label: 'Intoxicación evidente' },
      { id: 'focal', type: 'boolean', label: 'Déficit neurológico focal' },
      { id: 'fracturaDesplazada', type: 'boolean', label: 'Fractura craneal desplazada o abierta' },
      {
        id: 'sdh',
        type: 'select',
        label: 'Hematoma subdural (SDH)',
        dropdown: true,
        options: [
          { label: 'Ausente', value: 0 },
          { label: '≤ 4 mm', value: 1 },
          { label: '5–7 mm', value: 2 },
          { label: '> 7 mm', value: 3 },
        ],
      },
      {
        id: 'edh',
        type: 'select',
        label: 'Hematoma epidural (EDH)',
        dropdown: true,
        options: [
          { label: 'Ausente', value: 0 },
          { label: '≤ 4 mm', value: 1 },
          { label: '5–7 mm', value: 2 },
          { label: '> 7 mm', value: 3 },
        ],
      },
      {
        id: 'contusion',
        type: 'select',
        label: 'Contusión intraparenquimatosa',
        dropdown: true,
        options: [
          { label: 'Ausente', value: 0 },
          { label: '≤ 4 mm, única', value: 1 },
          { label: '5–7 mm o múltiple', value: 2 },
          { label: '> 7 mm', value: 3 },
        ],
      },
      { id: 'hemoventricular', type: 'boolean', label: 'Hemorragia intraventricular o subaracnoidea' },
    ],
    compute: (v) => {
      const grave =
        v.anticoagulacion === 1 ||
        v.intoxicacion === 1 ||
        v.focal === 1 ||
        v.fracturaDesplazada === 1 ||
        (v.gcs ?? 0) === 2 ||
        (v.sdh ?? 0) === 3 ||
        (v.edh ?? 0) === 3 ||
        (v.contusion ?? 0) === 3 ||
        v.hemoventricular === 1
      const intermedio =
        !grave &&
        ((v.gcs ?? 0) === 1 ||
          (v.sdh ?? 0) === 2 ||
          (v.edh ?? 0) === 2 ||
          (v.contusion ?? 0) === 2)
      const leve =
        !grave && !intermedio && ((v.sdh ?? 0) === 1 || (v.edh ?? 0) === 1 || (v.contusion ?? 0) === 1)
      const categoria = grave ? 'mBIG 3' : intermedio ? 'mBIG 2' : leve ? 'mBIG 1' : 'Sin criterios'
      return {
        main: categoria,
        interpretation: grave
          ? 'mBIG 3: manejo hospitalario con neurocirugía, tomografía de control, ingreso (a menudo en cuidados intermedios/UCI) y valoración quirúrgica.'
          : intermedio
            ? 'mBIG 2: observación hospitalaria, tomografía de control en 6 h, valoración neuroquirúrgica; puede evitarse ingreso en UCI si la evolución es favorable.'
            : leve
              ? 'mBIG 1: puede manejarse en observación sin tomografía de control ni ingreso en cuidados intensivos, si el paciente está estable y hay red de apoyo.'
              : 'No se cumplen criterios de lesión: si el TC es normal y el paciente está estable, alta con recomendaciones.',
        level: grave ? 'danger' : intermedio ? 'warn' : leve ? 'info' : 'ok',
      }
    },
    notes: [
      'Aplicable a traumatismos craneoencefálicos leves con GCS 13–15 y hallazgos en tomografía.',
      'Requiere disponibilidad rápida de neurocirugía; validaciones locales antes de aplicar de forma sistemática.',
    ],
    references: [
      'Joseph B, et al. The BIG (Brain Injury Guidelines) project: defining the management of TBI by acute care surgeons. J Trauma Acute Care Surg. 2014;76(4):965-9.',
    ],
  },
  {
    id: 'fisher-modificado',
    name: 'Escala de Fisher modificada para el vasoespasmo',
    shortName: 'Fisher modificado',
    description:
      'Predice el riesgo de vasoespasmo en la hemorragia subaracnoidea aneurismática según la tomografía inicial.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      {
        id: 'grado',
        type: 'select',
        label: 'Hallazgos en la tomografía',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Grado 0 — Sin sangre en cisternas ni hemorragia intraventricular', value: 0 },
          { label: 'Grado 1 — Sangre subaracnoidea fina sin hemorragia intraventricular', value: 1 },
          { label: 'Grado 2 — Sangre subaracnoidea fina con hemorragia intraventricular', value: 2 },
          { label: 'Grado 3 — Sangre subaracnoidea gruesa (> 1 mm) sin hemorragia intraventricular', value: 3 },
          { label: 'Grado 4 — Sangre subaracnoidea gruesa con hemorragia intraventricular', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const g = v.grado ?? 0
      const riesgo = ['0 %', '24 %', '33 %', '33 %', '40 %'][g]
      return {
        main: `Grado ${g}`,
        secondary: riesgo,
        secondaryLabel: 'riesgo de vasoespasmo sintomático',
        interpretation:
          g <= 1
            ? 'Riesgo bajo de vasoespasmo sintomático.'
            : g <= 2
              ? 'Riesgo moderado: vigilancia con Doppler transcraneal y clínica.'
              : 'Riesgo alto: profilaxis con nimodipino, mantener euvolemia y normotensión, y vigilancia estrecha (Doppler transcraneal, exploraciones neurológicas frecuentes).',
        level: g <= 1 ? 'ok' : g <= 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Frontera JA, et al. Prediction of symptomatic vasospasm after subarachnoid hemorrhage: the modified Fisher scale. Neurosurgery. 2006;59(1):21-7.',
    ],
  },
  {
    id: 'func',
    name: 'Puntuación FUNC para hemorragia intracerebral',
    shortName: 'FUNC',
    description:
      'Predice la probabilidad de independencia funcional a los 90 días tras una hemorragia intracerebral espontánea.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      {
        id: 'volumen',
        type: 'select',
        label: 'Volumen del hematoma',
        options: [
          { label: '< 30 cm³', value: 4 },
          { label: '30–60 cm³', value: 2 },
          { label: '> 60 cm³', value: 0 },
        ],
      },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 70 años', value: 2 },
          { label: '70–79 años', value: 1 },
          { label: '≥ 80 años', value: 0 },
        ],
      },
      {
        id: 'localizacion',
        type: 'select',
        label: 'Localización',
        options: [
          { label: 'Lobar', value: 2 },
          { label: 'Profunda (ganglios basales, tálamo)', value: 1 },
          { label: 'Infratentorial', value: 0 },
        ],
      },
      {
        id: 'gcs',
        type: 'select',
        label: 'GCS al ingreso',
        options: [
          { label: '≥ 9', value: 2 },
          { label: '≤ 8', value: 0 },
        ],
      },
      {
        id: 'deterioro',
        type: 'select',
        label: 'Deterioro cognitivo previo',
        options: [
          { label: 'Ausente', value: 1 },
          { label: 'Presente', value: 0 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['volumen', 'edad', 'localizacion', 'gcs', 'deterioro'])
      const funcional = ['0 %', '0 %', '0 %', '13 %', '20 %', '42 %', '66 %', '82 %', '82 %', '95 %', '95 %', '95 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–11)',
        secondary: funcional,
        secondaryLabel: 'independencia funcional a 90 días',
        interpretation:
          score >= 8
            ? 'Alta probabilidad de recuperación funcional: apostar por un manejo agresivo y rehabilitación precoz.'
            : score >= 5
              ? 'Probabilidad intermedia: manejo activo con reevaluación clínica y de imagen.'
              : 'Probabilidad baja de independencia funcional. No usar la puntuación como único criterio para limitar el esfuerzo terapéutico en las primeras 24–48 h.',
        level: score >= 8 ? 'ok' : score >= 5 ? 'warn' : 'danger',
      }
    },
    references: [
      'Rost NS, et al. Prediction of functional outcome in patients with primary intracerebral hemorrhage: the FUNC score. Stroke. 2008;39(8):2304-9.',
    ],
  },
  {
    id: 'hat',
    name: 'Puntuación HAT — riesgo de hemorragia tras tPA',
    shortName: 'HAT',
    description:
      'Estima el riesgo de hemorragia intracraneal sintomática tras la administración de trombolítico en el ictus isquémico.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      {
        id: 'diabetes',
        type: 'select',
        label: 'Diabetes o glucemia > 200 mg/dL al ingreso',
        options: [
          { label: 'No', value: 0 },
          { label: 'Sí', value: 1 },
        ],
      },
      {
        id: 'nihss',
        type: 'select',
        label: 'NIHSS pretratamiento',
        options: [
          { label: '< 15', value: 0 },
          { label: '15–20', value: 1 },
          { label: '≥ 20', value: 2 },
        ],
      },
      {
        id: 'tc',
        type: 'select',
        label: 'Hipodensidad en la tomografía',
        options: [
          { label: 'Ausente', value: 0 },
          { label: '< 1/3 del territorio ACM', value: 1 },
          { label: '≥ 1/3 del territorio ACM', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['diabetes', 'nihss', 'tc'])
      const total = ['2 %', '5 %', '10 %', '15 %', '44 %', '44 %'][score]
      const sintom = ['6 %', '16 %', '23 %', '36 %', '78 %', '78 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–5)',
        secondary: sintom,
        secondaryLabel: 'riesgo de hemorragia sintomática',
        interpretation:
          score <= 1
            ? 'Riesgo bajo de hemorragia intracraneal sintomática.'
            : score <= 2
              ? 'Riesgo moderado.'
              : 'Riesgo alto: individualizar la decisión y vigilancia neurológica estrecha tras el tratamiento.',
        level: score <= 1 ? 'ok' : score <= 2 ? 'warn' : 'danger',
        details: [`Riesgo de cualquier hemorragia intracraneal en la TC de control: ${total}.`],
      }
    },
    references: [
      'Lou M, et al. The HAT score: a simple grading scale for predicting hemorrhage after thrombolysis. Neurology. 2008;71(18):1417-23.',
    ],
  },
  {
    id: 'sedan',
    name: 'Puntuación SEDAN — hemorragia sintomática tras tPA',
    shortName: 'SEDAN',
    description:
      'Predice el riesgo de hemorragia intracerebral sintomática tras trombolisis intravenosa en el ictus isquémico.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      {
        id: 'glucemia',
        type: 'select',
        label: 'Glucemia sérica al ingreso',
        options: [
          { label: '< 144 mg/dL', value: 0 },
          { label: '145–216 mg/dL', value: 1 },
          { label: '> 216 mg/dL', value: 2 },
        ],
      },
      {
        id: 'aspects',
        type: 'select',
        label: 'ASPECTS pretratamiento',
        options: [
          { label: '≥ 10', value: 0 },
          { label: '< 10', value: 1 },
        ],
      },
      {
        id: 'hiperdensidad',
        type: 'select',
        label: 'Signo hiperdenso de la arteria cerebral en la TC',
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Presente', value: 1 },
        ],
      },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '≤ 75 años', value: 0 },
          { label: '> 75 años', value: 1 },
        ],
      },
      {
        id: 'nihss',
        type: 'select',
        label: 'NIHSS al ingreso',
        options: [
          { label: '≤ 9', value: 0 },
          { label: '≥ 10', value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['glucemia', 'aspects', 'hiperdensidad', 'edad', 'nihss'])
      const riesgo = ['1,6 %', '2,4 %', '3,5 %', '4,8 %', '9,3 %', '16,9 %', '27,8 %'][Math.min(score, 6)]
      return {
        main: String(score),
        mainUnit: 'puntos (0–6)',
        secondary: riesgo,
        secondaryLabel: 'riesgo de hemorragia intracraneal sintomática',
        interpretation:
          score <= 1
            ? 'Riesgo bajo.'
            : score <= 3
              ? 'Riesgo moderado.'
              : 'Riesgo alto: valorar de forma individualizada el balance riesgo-beneficio del tratamiento y la vigilancia postratamiento.',
        level: score <= 1 ? 'ok' : score <= 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Strbian D, et al. Symptomatic intracranial hemorrhage after stroke thrombolysis: the SEDAN score. Ann Neurol. 2012;71(5):634-41.',
    ],
  },
  {
    id: 'thrive',
    name: 'Puntuación THRIVE tras el ictus',
    shortName: 'THRIVE',
    description:
      'Estima la probabilidad de resultado funcional y de mortalidad tras un ictus isquémico agudo tratado.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      {
        id: 'nihss',
        type: 'select',
        label: 'NIHSS al ingreso',
        options: [
          { label: '≤ 10', value: 0 },
          { label: '11–20', value: 2 },
          { label: '≥ 21', value: 4 },
        ],
      },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '≤ 59 años', value: 0 },
          { label: '60–79 años', value: 1 },
          { label: '≥ 80 años', value: 2 },
        ],
      },
      { id: 'hta', type: 'boolean', label: 'Hipertensión' },
      { id: 'dm', type: 'boolean', label: 'Diabetes mellitus' },
      { id: 'fa', type: 'boolean', label: 'Fibrilación auricular' },
    ],
    compute: (v) => {
      const score = sum(v, ['nihss', 'edad', 'hta', 'dm', 'fa'])
      const bueno = ['65 %', '58 %', '52 %', '42 %', '35 %', '27 %', '20 %', '14 %', '10 %', '10 %'][score]
      const mort = ['12 %', '14 %', '16 %', '22 %', '28 %', '35 %', '42 %', '50 %', '58 %', '58 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–9)',
        secondary: bueno,
        secondaryLabel: 'probabilidad de buen resultado (mRS 0–2) a 90 días',
        interpretation: `Mortalidad estimada a 90 días: ${mort}. Herramienta pronóstica; no debe usarse aisladamente para negar la reperfusión.`,
        level: score <= 3 ? 'ok' : score <= 5 ? 'warn' : 'danger',
      }
    },
    references: [
      'Flint AC, et al. THRIVE score predicts ischemic stroke outcomes and thrombolytic hemorrhage risk in VISTA. Stroke. 2013;44(12):3365-9.',
    ],
  },
  {
    id: 'lams',
    name: 'LAMS — Los Angeles Motor Scale',
    shortName: 'LAMS',
    description:
      'Escala prehospitalaria de tres ítems para identificar rápidamente ictus por oclusión de gran vaso.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      {
        id: 'facial',
        type: 'select',
        label: 'Paresia facial',
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Presente', value: 1 },
        ],
      },
      {
        id: 'brazo',
        type: 'select',
        label: 'Debilidad del brazo',
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Deriva', value: 1 },
          { label: 'Cae', value: 2 },
        ],
      },
      {
        id: 'mano',
        type: 'select',
        label: 'Fuerza de la mano',
        options: [
          { label: 'Normal', value: 0 },
          { label: 'Debilidad de la prensión', value: 1 },
          { label: 'Sin prensión', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['facial', 'brazo', 'mano'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–5)',
        interpretation:
          score >= 4
            ? 'LAMS ≥ 4: alta probabilidad de oclusión de gran vaso. Considerar traslado directo a centro con capacidad de trombectomía mecánica.'
            : 'LAMS < 4: menor probabilidad de oclusión de gran vaso; traslado según protocolo habitual de ictus.',
        level: score >= 4 ? 'danger' : 'warn',
      }
    },
    references: [
      'Nazliel B, et al. A brief prehospital stroke severity scale identifies ischemic stroke patients harboring persisting large arterial occlusions. Stroke. 2008;39(8):2264-7.',
    ],
  },
  {
    id: 'barthel',
    name: 'Índice de Barthel',
    shortName: 'Barthel',
    description: 'Mide el grado de independencia en las actividades básicas de la vida diaria.',
    category: CAT,
    specialty: NEURO,
    inputs: [
      {
        id: 'comer',
        type: 'select',
        label: 'Comer',
        dropdown: true,
        options: escala([
          [0, 'Dependiente'],
          [5, 'Necesita ayuda'],
          [10, 'Independiente'],
        ]),
      },
      {
        id: 'lavarse',
        type: 'select',
        label: 'Lavarse (baño/ducha)',
        options: escala([
          [0, 'Dependiente'],
          [5, 'Independiente'],
        ]),
      },
      {
        id: 'vestirse',
        type: 'select',
        label: 'Vestirse',
        dropdown: true,
        options: escala([
          [0, 'Dependiente'],
          [5, 'Necesita ayuda'],
          [10, 'Independiente'],
        ]),
      },
      {
        id: 'arreglarse',
        type: 'select',
        label: 'Arreglarse (aseo personal)',
        options: escala([
          [0, 'Dependiente'],
          [5, 'Independiente'],
        ]),
      },
      {
        id: 'deposicion',
        type: 'select',
        label: 'Deposición',
        dropdown: true,
        options: escala([
          [0, 'Incontinente'],
          [5, 'Accidente ocasional'],
          [10, 'Continente'],
        ]),
      },
      {
        id: 'miccion',
        type: 'select',
        label: 'Micción',
        dropdown: true,
        options: escala([
          [0, 'Incontinente o sondado'],
          [5, 'Accidente ocasional'],
          [10, 'Continente'],
        ]),
      },
      {
        id: 'wc',
        type: 'select',
        label: 'Uso del retrete',
        dropdown: true,
        options: escala([
          [0, 'Dependiente'],
          [5, 'Necesita ayuda'],
          [10, 'Independiente'],
        ]),
      },
      {
        id: 'traslado',
        type: 'select',
        label: 'Traslado (cama–sillón)',
        dropdown: true,
        options: escala([
          [0, 'Dependiente'],
          [5, 'Gran ayuda (una persona)'],
          [10, 'Mínima ayuda'],
          [15, 'Independiente'],
        ]),
      },
      {
        id: 'deambulacion',
        type: 'select',
        label: 'Deambulación',
        dropdown: true,
        options: escala([
          [0, 'Dependiente'],
          [5, 'Independiente en silla de ruedas'],
          [10, 'Camina con ayuda'],
          [15, 'Independiente'],
        ]),
      },
      {
        id: 'escaleras',
        type: 'select',
        label: 'Subir y bajar escaleras',
        dropdown: true,
        options: escala([
          [0, 'Dependiente'],
          [5, 'Necesita ayuda'],
          [10, 'Independiente'],
        ]),
      },
    ],
    compute: (v) => {
      const score = sum(v, ['comer', 'lavarse', 'vestirse', 'arreglarse', 'deposicion', 'miccion', 'wc', 'traslado', 'deambulacion', 'escaleras'])
      const banda =
        score < 20 ? 'total' : score < 60 ? 'grave' : score < 90 ? 'moderada' : score < 100 ? 'leve' : 'independiente'
      return {
        main: String(score),
        mainUnit: 'puntos (0–100)',
        secondary: `Dependencia ${banda}`,
        interpretation:
          score === 100
            ? 'Independencia total para las actividades básicas de la vida diaria.'
            : score >= 60
              ? 'Dependencia leve o moderada: valorar apoyos y rehabilitación.'
              : 'Dependencia grave o total: planificar cuidados, ayudas técnicas y apoyo sociosanitario.',
        level: score >= 90 ? 'ok' : score >= 60 ? 'warn' : 'danger',
      }
    },
    references: [
      'Mahoney FI, Barthel DW. Functional evaluation: the Barthel Index. Md State Med J. 1965;14:61-5.',
    ],
  },
]
