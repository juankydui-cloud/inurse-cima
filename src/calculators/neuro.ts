import type { Calculator } from '../engine/types'
import { sum } from '../engine/types'

const CAT = 'Neurológico, sedación y gravedad'
const ANES = ['Anestesiología']

export const neuro: Calculator[] = [
  {
    id: 'sms',
    name: 'Puntuación motora simplificada (SMS)',
    shortName: 'SMS',
    description:
      'Simplifica la valoración del traumatismo craneoencefálico frente a la escala de coma de Glasgow.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'motor',
        type: 'select',
        label: 'Mejor respuesta motora',
        options: [
          { label: 'Obedece órdenes', value: 2 },
          { label: 'Localiza el dolor', value: 1 },
          { label: 'Retirada al dolor o respuesta menor', value: 0 },
        ],
      },
    ],
    compute: (v) => {
      const s = v.motor ?? 2
      return {
        main: String(s),
        mainUnit: 'puntos (0–2)',
        interpretation:
          s === 2
            ? 'Obedece órdenes: menor probabilidad de lesión cerebral grave (equivalente aproximado a GCS alto).'
            : s === 1
              ? 'Localiza el dolor: riesgo intermedio; vigilancia estrecha y TC según protocolo.'
              : 'Retirada o menos: se asocia a lesión grave (aprox. GCS ≤ 8); valorar aislamiento precoz de la vía aérea.',
        level: s === 2 ? 'ok' : s === 1 ? 'warn' : 'danger',
      }
    },
    notes: [
      'SMS < 2 identifica a los pacientes con mayor riesgo de lesión cerebral traumática significativa, necesidad de intubación y mortalidad, con rendimiento similar a la GCS completa.',
    ],
    references: [
      'Gill M, et al. A comparison of the Glasgow Coma Scale score to simplified alternative scores for the prediction of traumatic brain injury outcomes. Ann Emerg Med. 2005;45(1):37-42.',
    ],
  },
  {
    id: 'sofa',
    name: 'Escala SOFA de disfunción orgánica secuencial',
    shortName: 'SOFA',
    description:
      'Evalúa la gravedad de la disfunción orgánica aguda en pacientes críticos mediante seis sistemas.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'resp',
        type: 'select',
        label: 'Respiratorio — PaO₂/FiO₂ (mmHg)',
        dropdown: true,
        options: [
          { label: '≥ 400', value: 0 },
          { label: '300–399', value: 1 },
          { label: '200–299', value: 2 },
          { label: '100–199 con soporte respiratorio', value: 3 },
          { label: '< 100 con soporte respiratorio', value: 4 },
        ],
      },
      {
        id: 'coag',
        type: 'select',
        label: 'Coagulación — plaquetas (×10³/µL)',
        dropdown: true,
        options: [
          { label: '≥ 150', value: 0 },
          { label: '100–149', value: 1 },
          { label: '50–99', value: 2 },
          { label: '20–49', value: 3 },
          { label: '< 20', value: 4 },
        ],
      },
      {
        id: 'higado',
        type: 'select',
        label: 'Hígado — bilirrubina (mg/dL)',
        dropdown: true,
        options: [
          { label: '< 1,2', value: 0 },
          { label: '1,2–1,9', value: 1 },
          { label: '2,0–5,9', value: 2 },
          { label: '6,0–11,9', value: 3 },
          { label: '≥ 12', value: 4 },
        ],
      },
      {
        id: 'cardio',
        type: 'select',
        label: 'Cardiovascular',
        dropdown: true,
        options: [
          { label: 'PAM ≥ 70 mmHg sin vasoactivos', value: 0 },
          { label: 'PAM < 70 mmHg sin vasoactivos', value: 1 },
          { label: 'Dopamina ≤ 5 µg/kg/min o dobutamina (cualquier dosis)', value: 2 },
          { label: 'Dopamina > 5, o adrenalina/noradrenalina ≤ 0,1 µg/kg/min', value: 3 },
          { label: 'Dopamina > 15, o adrenalina/noradrenalina > 0,1 µg/kg/min', value: 4 },
        ],
      },
      {
        id: 'snc',
        type: 'select',
        label: 'Neurológico — escala de coma de Glasgow',
        dropdown: true,
        options: [
          { label: '15', value: 0 },
          { label: '13–14', value: 1 },
          { label: '10–12', value: 2 },
          { label: '6–9', value: 3 },
          { label: '< 6', value: 4 },
        ],
      },
      {
        id: 'renal',
        type: 'select',
        label: 'Renal — creatinina (mg/dL) o diuresis',
        dropdown: true,
        options: [
          { label: '< 1,2', value: 0 },
          { label: '1,2–1,9', value: 1 },
          { label: '2,0–3,4', value: 2 },
          { label: '3,5–4,9 o diuresis < 500 mL/día', value: 3 },
          { label: '≥ 5,0 o diuresis < 200 mL/día', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['resp', 'coag', 'higado', 'cardio', 'snc', 'renal'])
      const mort =
        score <= 6 ? '< 10 %' : score <= 9 ? '≈ 15–20 %' : score <= 12 ? '≈ 40–50 %' : score <= 14 ? '≈ 50–60 %' : '> 80 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–24)',
        secondary: mort,
        secondaryLabel: 'mortalidad orientativa',
        interpretation:
          'A mayor puntuación, mayor disfunción orgánica y mortalidad. Un aumento ≥ 2 puntos respecto a la basal en un paciente con infección define sepsis (criterios Sepsis-3). La evolución del SOFA en el tiempo es más informativa que un valor aislado.',
        level: score <= 6 ? (score === 0 ? 'ok' : 'info') : score <= 9 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Versión clásica de la escala SOFA (1996). La lista de MDCalc incluye la revisión «SOFA-2» (2025), pendiente de incorporar en una próxima versión.',
      'Los porcentajes de mortalidad son orientativos y varían según la población estudiada.',
    ],
    references: [
      'Vincent JL, et al. The SOFA (Sepsis-related Organ Failure Assessment) score to describe organ dysfunction/failure. Intensive Care Med. 1996;22(7):707-10.',
      'Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-10.',
    ],
  },
  {
    id: 'stanford',
    name: 'Escala de somnolencia de Stanford',
    shortName: 'Stanford',
    description: 'Cuantifica el grado subjetivo de somnolencia en el momento actual.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'grado',
        type: 'select',
        label: '¿Cómo se siente ahora mismo?',
        dropdown: true,
        noPoints: true,
        options: [
          { label: '1 — Activo, vital, alerta, completamente despierto', value: 1 },
          { label: '2 — Rendimiento alto aunque no máximo; capaz de concentrarse', value: 2 },
          { label: '3 — Despierto y relajado; responde, pero no del todo alerta', value: 3 },
          { label: '4 — Algo apagado, decaído', value: 4 },
          { label: '5 — Apagado, pierde el interés; enlentecido', value: 5 },
          { label: '6 — Somnoliento, prefiere tumbarse; lucha contra el sueño; aturdido', value: 6 },
          { label: '7 — Casi dormido; inicio del sueño inminente; incapaz de mantenerse despierto', value: 7 },
        ],
      },
    ],
    compute: (v) => {
      const g = v.grado ?? 1
      return {
        main: String(g),
        mainUnit: 'de 7',
        interpretation:
          g <= 3
            ? 'Nivel de alerta dentro de lo esperable durante la vigilia.'
            : 'Somnolencia significativa: si aparece en momentos en que debería estar alerta, sugiere deuda de sueño o un trastorno del sueño; valorar estudio y precaución con actividades de riesgo.',
        level: g <= 3 ? 'ok' : g <= 5 ? 'warn' : 'danger',
      }
    },
    references: [
      'Hoddes E, et al. Quantification of sleepiness: a new approach. Psychophysiology. 1973;10(4):431-6.',
    ],
  },
]
