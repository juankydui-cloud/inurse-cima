import type { Calculator } from '../engine/types'
import { sum } from '../engine/types'

const CAT = 'Vía aérea'
const ANES = ['Anestesiología']

export const viaAerea: Calculator[] = [
  {
    id: 'mallampati',
    name: 'Clasificación de Mallampati modificada',
    shortName: 'Mallampati',
    description:
      'Clasifica la dificultad prevista de la intubación endotraqueal según las estructuras orofaríngeas visibles.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'clase',
        type: 'select',
        label: 'Estructuras visibles con la boca abierta y la lengua fuera (sin fonar)',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Clase I — Paladar blando, fauces, úvula y pilares visibles', value: 1 },
          { label: 'Clase II — Paladar blando, fauces y úvula visibles (pilares ocultos)', value: 2 },
          { label: 'Clase III — Paladar blando y base de la úvula visibles', value: 3 },
          { label: 'Clase IV — Solo paladar duro visible', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const c = v.clase ?? 1
      return {
        main: `Clase ${['', 'I', 'II', 'III', 'IV'][c]}`,
        interpretation:
          c <= 2
            ? 'Predice, en general, una laringoscopia sin dificultad especial.'
            : 'Las clases III–IV se asocian a mayor probabilidad de laringoscopia e intubación difíciles: preparar plan alternativo (videolaringoscopio, dispositivos supraglóticos, fibroscopio).',
        level: c <= 2 ? 'ok' : c === 3 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Evaluar con el paciente sentado, cabeza neutra, boca abierta al máximo y lengua protruida sin fonación.',
      'De forma aislada tiene sensibilidad limitada: combinar con otros predictores (apertura oral, distancia tiromentoniana, movilidad cervical…).',
    ],
    references: [
      'Mallampati SR, et al. A clinical sign to predict difficult tracheal intubation: a prospective study. Can Anaesth Soc J. 1985;32(4):429-34.',
      'Samsoon GL, Young JR. Difficult tracheal intubation: a retrospective study. Anaesthesia. 1987;42(5):487-90.',
    ],
  },
  {
    id: 'el-ganzouri',
    name: 'Índice de riesgo de El-Ganzouri (EGRI) para vía aérea difícil',
    shortName: 'El-Ganzouri',
    description:
      'Predice el riesgo de laringoscopia e intubación difíciles combinando siete variables preoperatorias.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'apertura',
        type: 'select',
        label: 'Apertura oral',
        options: [
          { label: '≥ 4 cm', value: 0 },
          { label: '< 4 cm', value: 1 },
        ],
      },
      {
        id: 'tiromentoniana',
        type: 'select',
        label: 'Distancia tiromentoniana',
        options: [
          { label: '> 6,5 cm', value: 0 },
          { label: '6–6,5 cm', value: 1 },
          { label: '< 6 cm', value: 2 },
        ],
      },
      {
        id: 'mallampati',
        type: 'select',
        label: 'Clase de Mallampati',
        options: [
          { label: 'I', value: 0 },
          { label: 'II', value: 1 },
          { label: 'III o IV', value: 2 },
        ],
      },
      {
        id: 'cuello',
        type: 'select',
        label: 'Movilidad cervical',
        options: [
          { label: '> 90°', value: 0 },
          { label: '80–90°', value: 1 },
          { label: '< 80°', value: 2 },
        ],
      },
      {
        id: 'prognatismo',
        type: 'select',
        label: '¿Puede adelantar la mandíbula (prognatismo)?',
        options: [
          { label: 'Sí', value: 0 },
          { label: 'No', value: 1 },
        ],
      },
      {
        id: 'peso',
        type: 'select',
        label: 'Peso corporal',
        options: [
          { label: '< 90 kg', value: 0 },
          { label: '90–110 kg', value: 1 },
          { label: '> 110 kg', value: 2 },
        ],
      },
      {
        id: 'antecedente',
        type: 'select',
        label: 'Antecedente de intubación difícil',
        options: [
          { label: 'No', value: 0 },
          { label: 'Dudoso', value: 1 },
          { label: 'Confirmado', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['apertura', 'tiromentoniana', 'mallampati', 'cuello', 'prognatismo', 'peso', 'antecedente'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–12)',
        interpretation:
          score < 4
            ? 'Riesgo bajo de laringoscopia difícil; mantener siempre un plan alternativo disponible.'
            : 'EGRI ≥ 4: riesgo elevado de laringoscopia/intubación difícil. Planificar de entrada técnica alternativa (videolaringoscopia, intubación despierto con fibroscopio según contexto).',
        level: score < 4 ? 'ok' : 'danger',
      }
    },
    references: [
      'El-Ganzouri AR, et al. Preoperative airway assessment: predictive value of a multivariate risk index. Anesth Analg. 1996;82(6):1197-204.',
    ],
  },
  {
    id: 'heaven',
    name: 'Criterios HEAVEN para vía aérea difícil en intubación de emergencia',
    shortName: 'HEAVEN',
    description:
      'Identifica atributos asociados a intubación difícil en la secuencia rápida de emergencia.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'h',
        type: 'boolean',
        label: 'Hipoxemia (Hypoxaemia)',
        description: 'SpO₂ ≤ 93 % en el momento de la laringoscopia inicial.',
      },
      {
        id: 'e1',
        type: 'boolean',
        label: 'Extremos de tamaño (Extremes of size)',
        description: 'Paciente pediátrico (< 8 años) u obesidad clínica.',
      },
      {
        id: 'a',
        type: 'boolean',
        label: 'Reto anatómico (Anatomic challenge)',
        description:
          'Traumatismo, masas, hinchazón, cuerpo extraño u otra anomalía estructural que limite la visión laringoscópica.',
      },
      {
        id: 'v',
        type: 'boolean',
        label: 'Vómito / sangre / líquido (Vomit, blood, fluid)',
        description: 'Presentes clínicamente en la faringe o hipofaringe.',
      },
      {
        id: 'e2',
        type: 'boolean',
        label: 'Exanguinación / anemia (Exsanguination)',
        description: 'Sospecha de anemia grave que acelera la desaturación durante la apnea.',
      },
      {
        id: 'n',
        type: 'boolean',
        label: 'Cuello (Neck)',
        description: 'Movilidad cervical limitada (artrosis grave, inmovilización, collarín…).',
      },
    ],
    compute: (v) => {
      const score = sum(v, ['h', 'e1', 'a', 'v', 'e2', 'n'])
      return {
        main: String(score),
        mainUnit: score === 1 ? 'criterio' : 'criterios',
        interpretation:
          score === 0
            ? 'Sin criterios HEAVEN: se prevé menor dificultad para la intubación de secuencia rápida.'
            : 'Presencia de criterios HEAVEN: anticipar vía aérea difícil; a más criterios, menor probabilidad de éxito al primer intento. Optimizar preoxigenación, posición, dispositivo y plan de rescate.',
        level: score === 0 ? 'ok' : score <= 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Kuzmack E, et al. A novel difficult-airway prediction tool for emergency airway management: validation of the HEAVEN criteria in a large air medical cohort. J Emerg Med. 2018;54(4):395-401.',
    ],
  },
]
