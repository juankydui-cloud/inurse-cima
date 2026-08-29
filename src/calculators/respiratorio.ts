import type { Calculator } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Respiratorio y ventilación'
const ANES = ['Anestesiología']

export const respiratorio: Calculator[] = [
  {
    id: 'spo2-fio2',
    name: 'Relación SpO₂/FiO₂ (índice S/F)',
    shortName: 'SpO₂/FiO₂',
    description:
      'Evalúa la oxigenación de forma no invasiva; se correlaciona con la relación PaO₂/FiO₂.',
    category: CAT,
    specialty: ANES,
    inputs: [
      { id: 'spo2', type: 'number', label: 'SpO₂', unit: '%', min: 50, max: 100 },
      { id: 'fio2', type: 'number', label: 'FiO₂', unit: '%', min: 21, max: 100 },
    ],
    compute: (v) => {
      const ratio = v.spo2! / (v.fio2! / 100)
      return {
        main: fmt(ratio, 0),
        interpretation:
          ratio <= 235
            ? 'S/F ≤ 235 ≈ PaO₂/FiO₂ ≤ 200: hipoxemia moderada-grave (rango de SDRA moderado).'
            : ratio <= 315
              ? 'S/F ≤ 315 ≈ PaO₂/FiO₂ ≤ 300: hipoxemia compatible con SDRA leve / insuficiencia respiratoria aguda.'
              : 'Oxigenación conservada según el índice S/F.',
        level: ratio <= 235 ? 'danger' : ratio <= 315 ? 'warn' : 'ok',
        details: ['Correlación de Rice: S/F 235 ≈ P/F 200; S/F 315 ≈ P/F 300.'],
      }
    },
    notes: [
      'Menos fiable con SpO₂ > 97 % (zona plana de la curva de disociación de la hemoglobina).',
      'La medición debe hacerse con una señal de pulsioximetría de buena calidad.',
    ],
    references: [
      'Rice TW, et al. Comparison of the SpO2/FiO2 ratio and the PaO2/FiO2 ratio in patients with acute lung injury or ARDS. Chest. 2007;132(2):410-7.',
    ],
  },
  {
    id: 'rdos',
    name: 'Escala de observación de dificultad respiratoria (RDOS)',
    shortName: 'RDOS',
    description:
      'Cuantifica la dificultad respiratoria en pacientes que no pueden comunicar su disnea.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'fc',
        type: 'select',
        label: 'Frecuencia cardíaca (lpm)',
        options: [
          { label: '< 90', value: 0 },
          { label: '90–109', value: 1 },
          { label: '≥ 110', value: 2 },
        ],
      },
      {
        id: 'fr',
        type: 'select',
        label: 'Frecuencia respiratoria (rpm)',
        options: [
          { label: '≤ 18', value: 0 },
          { label: '19–30', value: 1 },
          { label: '> 30', value: 2 },
        ],
      },
      {
        id: 'inquietud',
        type: 'select',
        label: 'Inquietud: movimientos no intencionados',
        options: [
          { label: 'No', value: 0 },
          { label: 'Ocasionales', value: 1 },
          { label: 'Frecuentes', value: 2 },
        ],
      },
      {
        id: 'paradojica',
        type: 'select',
        label: 'Respiración paradójica abdominal',
        description: 'El abdomen se hunde en la inspiración.',
        options: [
          { label: 'No', value: 0 },
          { label: 'Sí', value: 2 },
        ],
      },
      {
        id: 'accesoria',
        type: 'select',
        label: 'Uso de musculatura accesoria',
        description: 'Elevación de la clavícula en la inspiración.',
        options: [
          { label: 'No', value: 0 },
          { label: 'Elevación leve', value: 1 },
          { label: 'Elevación pronunciada', value: 2 },
        ],
      },
      {
        id: 'quejido',
        type: 'select',
        label: 'Quejido al final de la espiración',
        description: 'Sonido gutural.',
        options: [
          { label: 'No', value: 0 },
          { label: 'Sí', value: 2 },
        ],
      },
      {
        id: 'aleteo',
        type: 'select',
        label: 'Aleteo nasal',
        description: 'Movimiento involuntario de las alas nasales.',
        options: [
          { label: 'No', value: 0 },
          { label: 'Sí', value: 2 },
        ],
      },
      {
        id: 'miedo',
        type: 'select',
        label: 'Expresión facial de miedo o angustia',
        description: 'Ojos muy abiertos, musculatura facial tensa, ceño fruncido, boca abierta.',
        options: [
          { label: 'No', value: 0 },
          { label: 'Sí', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['fc', 'fr', 'inquietud', 'paradojica', 'accesoria', 'quejido', 'aleteo', 'miedo'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–16)',
        interpretation:
          score <= 2
            ? 'Dificultad respiratoria escasa o ausente.'
            : score <= 6
              ? 'Dificultad respiratoria moderada: valorar tratamiento sintomático y de la causa.'
              : 'Dificultad respiratoria grave: tratamiento paliativo/etiológico urgente.',
        level: score <= 2 ? 'ok' : score <= 6 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Diseñada y validada sobre todo en cuidados paliativos y pacientes incapaces de autoinformar la disnea.',
      'Un valor ≥ 3 indica presencia de distrés respiratorio clínicamente relevante.',
    ],
    references: [
      'Campbell ML, et al. A Respiratory Distress Observation Scale for patients unable to self-report dyspnea. J Palliat Med. 2008;11(1):44-50.',
    ],
  },
]
