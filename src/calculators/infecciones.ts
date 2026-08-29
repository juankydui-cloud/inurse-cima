import type { Calculator } from '../engine/types'
import { sum } from '../engine/types'

const CAT = 'Infecciones'
const ANES = ['Anestesiología']

export const infecciones: Calculator[] = [
  {
    id: 'drip',
    name: 'Puntuación DRIP de neumonía por patógenos resistentes',
    shortName: 'DRIP',
    description:
      'Predice el riesgo de neumonía adquirida en la comunidad causada por patógenos resistentes a los antibióticos habituales.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'antibiotico',
        type: 'boolean',
        label: 'Uso de antibióticos en los últimos 60 días',
        points: 2,
      },
      {
        id: 'residencia',
        type: 'boolean',
        label: 'Residente en centro de cuidados de larga estancia',
        points: 2,
      },
      {
        id: 'sonda',
        type: 'boolean',
        label: 'Alimentación por sonda',
        points: 2,
      },
      {
        id: 'previa',
        type: 'boolean',
        label: 'Infección previa por patógeno resistente (último año)',
        points: 2,
      },
      {
        id: 'hospitalizacion',
        type: 'boolean',
        label: 'Hospitalización en los últimos 60 días',
      },
      {
        id: 'pulmonar',
        type: 'boolean',
        label: 'Enfermedad pulmonar crónica',
        description: 'EPOC, bronquiectasias, fibrosis…',
      },
      {
        id: 'funcional',
        type: 'boolean',
        label: 'Mal estado funcional',
        description: 'Dependencia para las actividades básicas.',
      },
      {
        id: 'antiacidos',
        type: 'boolean',
        label: 'Supresión ácida gástrica',
        description: 'IBP o anti-H2.',
      },
      {
        id: 'heridas',
        type: 'boolean',
        label: 'Cuidado de heridas crónicas',
      },
      {
        id: 'mrsa',
        type: 'boolean',
        label: 'Colonización por SARM en el último año',
        description: 'Staphylococcus aureus resistente a meticilina (MRSA).',
      },
    ],
    compute: (v) => {
      const score = sum(v, [
        'antibiotico', 'residencia', 'sonda', 'previa',
        'hospitalizacion', 'pulmonar', 'funcional', 'antiacidos', 'heridas', 'mrsa',
      ])
      return {
        main: String(score),
        mainUnit: 'puntos (0–14)',
        interpretation:
          score < 4
            ? 'Riesgo bajo de patógenos resistentes: el tratamiento empírico habitual de la NAC suele ser suficiente.'
            : 'DRIP ≥ 4: riesgo elevado de patógenos resistentes; valorar cobertura empírica ampliada (p. ej., frente a SARM y Pseudomonas) según protocolo local y cultivos.',
        level: score < 4 ? 'ok' : 'danger',
      }
    },
    notes: [
      'Factores mayores (2 puntos): antibióticos, residencia de larga estancia, sonda de alimentación e infección resistente previa.',
      'Factores menores (1 punto): hospitalización reciente, enfermedad pulmonar crónica, mal estado funcional, supresión ácida, heridas crónicas y colonización por SARM.',
    ],
    references: [
      'Webb BJ, et al. Derivation and multicenter validation of the drug resistance in pneumonia clinical prediction score. Antimicrob Agents Chemother. 2016;60(5):2652-63.',
    ],
  },
]
