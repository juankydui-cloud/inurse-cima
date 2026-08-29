import type { Calculator } from '../engine/types'
import { fmt } from '../engine/types'

const CAT = 'Farmacología y dosificación'
const ANES = ['Anestesiología']

interface AnestesicoLocal {
  nombre: string
  mgKg: number
  mgKgEpi: number
  capMg: number
  capMgEpi: number
}

const ANESTESICOS: AnestesicoLocal[] = [
  { nombre: 'Lidocaína', mgKg: 4.5, mgKgEpi: 7, capMg: 300, capMgEpi: 500 },
  { nombre: 'Mepivacaína', mgKg: 4.4, mgKgEpi: 7, capMg: 400, capMgEpi: 550 },
  { nombre: 'Bupivacaína', mgKg: 2.5, mgKgEpi: 3, capMg: 175, capMgEpi: 225 },
  { nombre: 'Ropivacaína', mgKg: 3, mgKgEpi: 3, capMg: 225, capMgEpi: 225 },
]

export const farmacologia: Calculator[] = [
  {
    id: 'anestesicos-locales',
    name: 'Dosis máxima de anestésicos locales',
    shortName: 'Anestésicos locales',
    description:
      'Calcula la dosis máxima recomendada (mg y volumen) de los anestésicos locales más habituales según el peso.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'farmaco',
        type: 'select',
        label: 'Anestésico local',
        noPoints: true,
        options: ANESTESICOS.map((a, i) => ({ label: a.nombre, value: i })),
      },
      {
        id: 'epinefrina',
        type: 'boolean',
        label: 'Con vasoconstrictor (epinefrina)',
        noPoints: true,
      },
      {
        id: 'concentracion',
        type: 'select',
        label: 'Concentración de la solución',
        noPoints: true,
        dropdown: true,
        options: [
          { label: '0,25 % (2,5 mg/mL)', value: 0.25 },
          { label: '0,5 % (5 mg/mL)', value: 0.5 },
          { label: '0,75 % (7,5 mg/mL)', value: 0.75 },
          { label: '1 % (10 mg/mL)', value: 1 },
          { label: '1,5 % (15 mg/mL)', value: 1.5 },
          { label: '2 % (20 mg/mL)', value: 2 },
        ],
        default: 1,
      },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 1, max: 250 },
    ],
    compute: (v) => {
      const drug = ANESTESICOS[v.farmaco ?? 0]
      const epi = (v.epinefrina ?? 0) === 1
      const mgKg = epi ? drug.mgKgEpi : drug.mgKg
      const cap = epi ? drug.capMgEpi : drug.capMg
      const porPeso = mgKg * v.peso!
      const dosis = Math.min(porPeso, cap)
      const mgMl = (v.concentracion ?? 1) * 10
      const vol = dosis / mgMl
      return {
        main: fmt(dosis, 0),
        mainUnit: 'mg (dosis máxima)',
        secondary: `${fmt(vol, 1)} mL`,
        secondaryLabel: `volumen máximo al ${fmt(v.concentracion ?? 1, 2)} %`,
        interpretation: `${drug.nombre} ${epi ? 'con' : 'sin'} epinefrina: máximo ${fmt(mgKg, 1)} mg/kg${
          porPeso > cap ? `, limitado por el techo absoluto de ${cap} mg` : ''
        }. Aspirar antes de inyectar, fraccionar la dosis y vigilar signos de toxicidad sistémica (LAST).`,
        level: 'info',
        details: [
          `Dosis por peso: ${fmt(porPeso, 0)} mg · techo absoluto: ${cap} mg.`,
          'En obesidad, calcular sobre el peso corporal ideal o magro.',
          'Si se combinan varios anestésicos, la toxicidad es aditiva.',
        ],
      }
    },
    notes: [
      'Las dosis máximas «clásicas» varían entre fuentes y fichas técnicas; se muestran los valores de referencia más habituales.',
      'La dosis tóxica depende también del lugar de inyección (intercostal > epidural > plexo > subcutáneo).',
      'Ante sospecha de toxicidad sistémica (LAST): parar la inyección, soporte vital y emulsión lipídica al 20 % según protocolo.',
    ],
    references: [
      'Neal JM, et al. The Third American Society of Regional Anesthesia and Pain Medicine Practice Advisory on Local Anesthetic Systemic Toxicity. Reg Anesth Pain Med. 2018;43(2):113-23.',
    ],
  },
  {
    id: 'masa-libre-grasa',
    name: 'Masa libre de grasa (MLG)',
    shortName: 'MLG / FFM',
    description:
      'Estima la masa libre de grasa a partir del peso y el IMC (fórmula de Janmahasatian); útil para dosificar fármacos.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'sexo',
        type: 'select',
        label: 'Sexo',
        noPoints: true,
        options: [
          { label: 'Varón', value: 0 },
          { label: 'Mujer', value: 1 },
        ],
      },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 20, max: 300 },
      { id: 'talla', type: 'number', label: 'Talla', unit: 'cm', min: 100, max: 230 },
    ],
    compute: (v) => {
      const w = v.peso!
      const hM = v.talla! / 100
      const bmi = w / (hM * hM)
      const ffm =
        (v.sexo ?? 0) === 0
          ? (9270 * w) / (6680 + 216 * bmi)
          : (9270 * w) / (8780 + 244 * bmi)
      const pct = (ffm / w) * 100
      return {
        main: fmt(ffm, 1),
        mainUnit: 'kg de masa libre de grasa',
        secondary: `${fmt(pct, 0)} %`,
        secondaryLabel: 'del peso corporal total',
        interpretation:
          'La masa libre de grasa es un tamaño corporal útil para dosificar fármacos hidrófilos y para escalar la inducción en pacientes con obesidad (p. ej., propofol de inducción, remifentanilo).',
        level: 'info',
        details: [`IMC: ${fmt(bmi, 1)} kg/m².`, 'Fórmula de Janmahasatian (2005).'],
      }
    },
    references: [
      'Janmahasatian S, et al. Quantification of lean bodyweight. Clin Pharmacokinet. 2005;44(10):1051-65.',
    ],
  },
]
