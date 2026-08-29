import type { Calculator } from '../engine/types'
import { fmt } from '../engine/types'

const CAT = 'Hemodinámica y fluidos'
const ANES = ['Anestesiología']

export const hemodinamica: Calculator[] = [
  {
    id: 'pam',
    name: 'Presión arterial media (PAM)',
    shortName: 'PAM',
    description: 'Calcula la presión de perfusión media a partir de la PA sistólica y diastólica.',
    category: CAT,
    specialty: ANES,
    inputs: [
      { id: 'pas', type: 'number', label: 'Presión arterial sistólica', unit: 'mmHg', min: 0, max: 300 },
      { id: 'pad', type: 'number', label: 'Presión arterial diastólica', unit: 'mmHg', min: 0, max: 200 },
    ],
    compute: (v) => {
      const pas = v.pas!
      const pad = v.pad!
      if (pad > pas)
        return {
          main: '—',
          interpretation: 'La presión diastólica no puede ser mayor que la sistólica.',
          level: 'warn',
        }
      const pam = (pas + 2 * pad) / 3
      return {
        main: fmt(pam, 0),
        mainUnit: 'mmHg',
        interpretation:
          pam < 65
            ? 'PAM < 65 mmHg: riesgo de hipoperfusión tisular; objetivo habitual en shock ≥ 65 mmHg.'
            : pam <= 110
              ? 'PAM dentro del rango habitual (aprox. 70–100 mmHg).'
              : 'PAM elevada.',
        level: pam < 65 ? 'danger' : pam <= 110 ? 'ok' : 'warn',
        details: ['PAM = (PAS + 2 × PAD) / 3.'],
      }
    },
    notes: [
      'La fórmula asume una frecuencia cardíaca normal; con taquicardia importante infraestima la PAM real.',
    ],
  },
  {
    id: 'mabl',
    name: 'Pérdida máxima de sangre permitida (PMSP)',
    shortName: 'PMSP / MABL',
    description:
      'Estima cuánta sangre puede perderse durante la cirugía antes de plantear una transfusión.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'poblacion',
        type: 'select',
        label: 'Grupo de edad / sexo',
        description: 'Determina la volemia estimada por kg.',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Neonato prematuro (≈ 96 mL/kg)', value: 96 },
          { label: 'Neonato a término (≈ 85 mL/kg)', value: 85 },
          { label: 'Lactante (≈ 80 mL/kg)', value: 80 },
          { label: 'Niño (≈ 70 mL/kg)', value: 70 },
          { label: 'Varón adulto (≈ 75 mL/kg)', value: 75 },
          { label: 'Mujer adulta (≈ 65 mL/kg)', value: 65 },
        ],
        default: 75,
      },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 0.3, max: 300 },
      { id: 'hi', type: 'number', label: 'Hematocrito inicial', unit: '%', min: 10, max: 70 },
      { id: 'hf', type: 'number', label: 'Hematocrito mínimo aceptable', unit: '%', min: 10, max: 60 },
    ],
    compute: (v) => {
      const ebv = (v.poblacion ?? 75) * v.peso!
      if (v.hf! >= v.hi!)
        return {
          main: '—',
          interpretation: 'El hematocrito inicial debe ser mayor que el mínimo aceptable.',
          level: 'warn',
        }
      const mabl = (ebv * (v.hi! - v.hf!)) / v.hi!
      return {
        main: fmt(mabl, 0),
        mainUnit: 'mL',
        interpretation:
          'Pérdida sanguínea estimada a partir de la cual se debe valorar la transfusión, junto con la clínica y la monitorización.',
        level: 'info',
        details: [
          `Volemia estimada: ${fmt(ebv, 0)} mL.`,
          'Fórmula: PMSP = volemia × (Hto inicial − Hto mínimo) / Hto inicial.',
        ],
      }
    },
    notes: [
      'Puede calcularse igualmente con hemoglobina en lugar de hematocrito.',
      'Algunas variantes usan el hematocrito medio en el denominador; la diferencia es pequeña.',
      'Es una estimación estática: la decisión de transfundir debe basarse también en la situación hemodinámica y las pérdidas en curso.',
    ],
  },
  {
    id: 'fluidos-intraoperatorios',
    name: 'Dosificación de líquidos intraoperatorios (adultos)',
    shortName: 'Fluidos intraoperatorios',
    description:
      'Calcula el mantenimiento (regla 4-2-1), el déficit por ayuno y las pérdidas por trauma quirúrgico.',
    category: CAT,
    specialty: ANES,
    inputs: [
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 3, max: 300 },
      { id: 'ayuno', type: 'number', label: 'Horas de ayuno', unit: 'h', min: 0, max: 48 },
      {
        id: 'trauma',
        type: 'select',
        label: 'Magnitud del trauma quirúrgico',
        noPoints: true,
        options: [
          { label: 'Leve (p. ej., hernia): ≈ 2–4 mL/kg/h', value: 3 },
          { label: 'Moderado (p. ej., colecistectomía abierta): ≈ 4–6 mL/kg/h', value: 5 },
          { label: 'Grave (p. ej., resección intestinal): ≈ 6–8 mL/kg/h', value: 7 },
        ],
      },
    ],
    compute: (v) => {
      const w = v.peso!
      const maint = w <= 10 ? 4 * w : w <= 20 ? 40 + 2 * (w - 10) : 60 + (w - 20)
      const deficit = maint * v.ayuno!
      const trauma = (v.trauma ?? 3) * w
      const h1 = maint + deficit / 2 + trauma
      const h23 = maint + deficit / 4 + trauma
      const after = maint + trauma
      return {
        main: fmt(h1, 0),
        mainUnit: 'mL en la 1.ª hora',
        interpretation:
          'Pauta clásica: en la 1.ª hora se repone la mitad del déficit de ayuno; en la 2.ª y 3.ª, un cuarto en cada una, siempre sumando mantenimiento y pérdidas por trauma.',
        level: 'info',
        details: [
          `Mantenimiento (4-2-1): ${fmt(maint, 0)} mL/h.`,
          `Déficit por ayuno: ${fmt(deficit, 0)} mL.`,
          `2.ª y 3.ª hora: ${fmt(h23, 0)} mL/h cada una.`,
          `A partir de la 4.ª hora: ${fmt(after, 0)} mL/h (mantenimiento + trauma).`,
        ],
      }
    },
    notes: [
      'Es la aproximación clásica docente: la práctica actual tiende a estrategias más restrictivas o guiadas por objetivos (GDT), especialmente en cirugía mayor.',
      'No aplicable a grandes quemados, pediatría compleja ni reposición de hemorragia.',
    ],
  },
  {
    id: 'vexus',
    name: 'Puntuación ecográfica de congestión venosa (VExUS)',
    shortName: 'VExUS',
    description:
      'Gradúa la congestión venosa sistémica mediante ecografía (VCI y Doppler hepático, portal e intrarrenal) y estima el riesgo de lesión renal aguda congestiva.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'vci',
        type: 'select',
        label: 'Vena cava inferior',
        noPoints: true,
        options: [
          { label: '< 2 cm de diámetro', value: 0 },
          { label: '≥ 2 cm de diámetro', value: 1 },
        ],
      },
      {
        id: 'hepatica',
        type: 'select',
        label: 'Doppler de venas suprahepáticas',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Normal — onda S mayor que la D (S > D), ambas anterógradas', value: 0 },
          { label: 'Alteración leve-moderada — S menor que D (S < D), ambas anterógradas', value: 1 },
          { label: 'Alteración grave — onda S invertida (flujo retrógrado sistólico)', value: 2 },
        ],
      },
      {
        id: 'porta',
        type: 'select',
        label: 'Doppler de vena porta',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Normal — pulsatilidad < 30 %', value: 0 },
          { label: 'Alteración leve-moderada — pulsatilidad 30–49 %', value: 1 },
          { label: 'Alteración grave — pulsatilidad ≥ 50 %', value: 2 },
        ],
      },
      {
        id: 'renal',
        type: 'select',
        label: 'Doppler venoso intrarrenal',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Normal — flujo continuo', value: 0 },
          { label: 'Alteración leve-moderada — flujo discontinuo bifásico (sistólico y diastólico)', value: 1 },
          { label: 'Alteración grave — flujo discontinuo monofásico (solo diastólico)', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      let grade: number
      if ((v.vci ?? 0) === 0) grade = 0
      else {
        const severos = [v.hepatica, v.porta, v.renal].filter((x) => x === 2).length
        grade = severos === 0 ? 1 : severos === 1 ? 2 : 3
      }
      const texto = [
        'Sin congestión significativa (VCI < 2 cm).',
        'Congestión leve: VCI dilatada sin patrones graves.',
        'Congestión moderada: un patrón Doppler gravemente alterado.',
        'Congestión grave: dos o más patrones gravemente alterados. Riesgo elevado de lesión renal aguda congestiva; valorar descongestión (diuréticos/ultrafiltración) y tratar la causa.',
      ][grade]
      return {
        main: `Grado ${grade}`,
        interpretation: texto,
        level: grade === 0 ? 'ok' : grade === 1 ? 'info' : grade === 2 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Grado 0: VCI < 2 cm · Grado 1: VCI ≥ 2 cm sin patrones graves · Grado 2: un patrón grave · Grado 3: ≥ 2 patrones graves.',
      'El grado 3 se asoció de forma independiente con lesión renal aguda en pacientes tras cirugía cardíaca.',
    ],
    references: [
      'Beaubien-Souligny W, et al. Quantifying systemic congestion with point-of-care ultrasound: development of the venous excess ultrasound grading system. Ultrasound J. 2020;12(1):16.',
    ],
  },
]
