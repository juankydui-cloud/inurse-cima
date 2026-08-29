import type { Calculator } from '../engine/types'
import { fmt } from '../engine/types'

const CAT = 'Opioides, benzodiacepinas y controlados'
const FARM = ['Farmacia']

/**
 * Equivalencias diarias de morfina oral (MME) según los factores publicados por
 * los CDC (2022) y las guías más ampliamente utilizadas.
 * Todos los valores están expresados en mg de morfina oral por mg del fármaco.
 */
const MME_FACTORS: { label: string; via: string; factor: number; nota?: string }[] = [
  { label: 'Morfina', via: 'oral', factor: 1 },
  { label: 'Morfina', via: 'IV o SC', factor: 3 },
  { label: 'Codeína', via: 'oral', factor: 0.15 },
  { label: 'Tramadol', via: 'oral', factor: 0.1 },
  { label: 'Hidrocodona', via: 'oral', factor: 1 },
  { label: 'Oxicodona', via: 'oral', factor: 1.5 },
  { label: 'Oxicodona', via: 'IV', factor: 3 },
  { label: 'Hidromorfona', via: 'oral', factor: 4 },
  { label: 'Hidromorfona', via: 'IV o SC', factor: 20 },
  { label: 'Tapentadol', via: 'oral', factor: 0.4 },
  { label: 'Fentanilo parche', via: 'transdérmico (µg/h)', factor: 2.4, nota: 'Multiplica los µg/h del parche por 2,4 para obtener MME/día' },
  { label: 'Meperidina (petidina)', via: 'oral', factor: 0.1 },
  { label: 'Metadona', via: 'oral (≤ 20 mg/día)', factor: 4 },
  { label: 'Metadona', via: 'oral (21–40 mg/día)', factor: 8 },
  { label: 'Metadona', via: 'oral (41–60 mg/día)', factor: 10 },
  { label: 'Metadona', via: 'oral (> 60 mg/día)', factor: 12 },
  { label: 'Buprenorfina', via: 'transdérmica (µg/h)', factor: 12.6, nota: 'µg/h × 12,6 = MME/día (aproximación)' },
  { label: 'Buprenorfina', via: 'sublingual (mg)', factor: 30, nota: 'Aproximación; hay controversia sobre su MME por efecto techo' },
]

const BENZO_EQUIV: { label: string; factor: number }[] = [
  { label: 'Diazepam', factor: 10 },
  { label: 'Alprazolam', factor: 0.5 },
  { label: 'Lorazepam', factor: 1 },
  { label: 'Clonazepam', factor: 0.5 },
  { label: 'Midazolam (oral)', factor: 7.5 },
  { label: 'Oxazepam', factor: 20 },
  { label: 'Temazepam', factor: 20 },
  { label: 'Bromazepam', factor: 5 },
  { label: 'Clobazam', factor: 20 },
  { label: 'Cloracepato', factor: 15 },
  { label: 'Ketazolam', factor: 15 },
  { label: 'Flunitrazepam', factor: 1 },
]

export const farmaciaOpioides: Calculator[] = [
  {
    id: 'mme',
    name: 'Miligramos equivalentes de morfina al día (MME)',
    shortName: 'MME diario',
    description:
      'Convierte una dosis diaria de opioide a miligramos equivalentes de morfina oral usando los factores de los CDC.',
    category: CAT,
    specialty: FARM,
    inputs: [
      {
        id: 'farmaco',
        type: 'select',
        label: 'Opioide y vía',
        noPoints: true,
        dropdown: true,
        options: MME_FACTORS.map((m, i) => ({
          label: `${m.label} (${m.via})`,
          value: i,
        })),
      },
      { id: 'dosis', type: 'number', label: 'Dosis diaria total', unit: 'mg (o µg/h en parches)', min: 0, max: 5000, step: 0.5 },
    ],
    compute: (v) => {
      const m = MME_FACTORS[v.farmaco ?? 0]
      const mme = v.dosis! * m.factor
      const banda =
        mme < 50 ? 'baja' : mme < 90 ? 'moderada' : mme < 200 ? 'alta' : 'muy alta'
      const level =
        mme < 50 ? 'ok' : mme < 90 ? 'warn' : 'danger'
      return {
        main: fmt(mme, 1),
        mainUnit: 'MME/día',
        secondary: `Dosis ${banda}`,
        interpretation:
          mme < 50
            ? 'Dosis diaria baja según los umbrales de los CDC.'
            : mme < 90
              ? 'A partir de 50 MME/día, los CDC recomiendan reevaluar riesgos y beneficios, considerar naloxona domiciliaria y revisar comorbilidades.'
              : mme < 200
                ? 'Dosis alta (≥ 90 MME/día): valorar consulta a unidad del dolor, evitar aumentos y aportar naloxona.'
                : 'Dosis muy alta (≥ 200 MME/día): riesgo significativo de sobredosis. Revisar indicación y estrategia de deshabituación.',
        level,
        details: [
          `Factor de conversión: 1 mg de ${m.label} (${m.via}) = ${fmt(m.factor, 2)} MME.`,
          m.nota ?? 'La conversión es solo orientativa: cada paciente puede tener sensibilidad muy distinta.',
          'La metadona no es lineal: usar la tabla por tramo de dosis y ajustar con especial precaución.',
        ],
      }
    },
    notes: [
      'Estos factores no son dosis clínicamente equivalentes ni deben usarse para rotar un opioide a otro sin reducir la dosis calculada al menos un 25–50 % por tolerancia cruzada incompleta.',
      'Los CDC recomiendan revaluar cuidadosamente cualquier paciente con ≥ 50 MME/día y evitar en general los ≥ 90 MME/día para dolor crónico no oncológico.',
      'La buprenorfina tiene efecto techo y su conversión a MME es controvertida; interprétala solo como orientación.',
    ],
    references: [
      'Dowell D, et al. CDC Clinical Practice Guideline for Prescribing Opioids for Pain — United States, 2022. MMWR Recomm Rep. 2022;71(3):1-95.',
    ],
  },
  {
    id: 'rotacion-opioides',
    name: 'Rotación de opioides',
    shortName: 'Rotación de opioides',
    description:
      'Convierte una dosis de un opioide a otro usando los factores de MME y aplica una reducción de seguridad por tolerancia cruzada incompleta.',
    category: CAT,
    specialty: FARM,
    inputs: [
      {
        id: 'origen',
        type: 'select',
        label: 'Opioide y vía de partida',
        noPoints: true,
        dropdown: true,
        options: MME_FACTORS.map((m, i) => ({
          label: `${m.label} (${m.via})`,
          value: i,
        })),
      },
      { id: 'dosis', type: 'number', label: 'Dosis diaria de partida', unit: 'mg (o µg/h)', min: 0, max: 5000, step: 0.5 },
      {
        id: 'destino',
        type: 'select',
        label: 'Opioide y vía de destino',
        noPoints: true,
        dropdown: true,
        options: MME_FACTORS.map((m, i) => ({
          label: `${m.label} (${m.via})`,
          value: i,
        })),
      },
      {
        id: 'reduccion',
        type: 'select',
        label: 'Reducción de seguridad por tolerancia cruzada',
        noPoints: true,
        options: [
          { label: '25 % (dolor bien controlado, paciente estable)', value: 0.75 },
          { label: '33 % (habitual)', value: 0.67 },
          { label: '50 % (rotación a metadona, ancianos, comorbilidad)', value: 0.5 },
          { label: 'Sin reducción', value: 1 },
        ],
        default: 0.67,
      },
    ],
    compute: (v) => {
      const o = MME_FACTORS[v.origen ?? 0]
      const d = MME_FACTORS[v.destino ?? 0]
      if (!d.factor)
        return { main: '—', interpretation: 'El opioide de destino no tiene factor definido.', level: 'warn' }
      const mme = v.dosis! * o.factor
      const equivalente = mme / d.factor
      const ajustada = equivalente * (v.reduccion ?? 0.67)
      const rescate = ajustada * 0.1
      return {
        main: fmt(ajustada, 1),
        mainUnit: `mg/día de ${d.label} (${d.via})`,
        secondary: fmt(mme, 1),
        secondaryLabel: 'MME/día equivalentes',
        interpretation: `Dosis inicial recomendada tras la rotación. Repartir en las tomas habituales del opioide de destino y ajustar según respuesta y efectos adversos. Prever pauta de rescate (aprox. 10 % de la dosis diaria).`,
        level: 'warn',
        details: [
          `Equivalente sin reducción: ${fmt(equivalente, 1)} mg/día.`,
          `Rescate orientativo: ${fmt(rescate, 1)} mg cada 4 h a demanda.`,
          'La rotación a metadona requiere consulta con especialista: la relación de conversión no es lineal y su vida media prolongada aumenta el riesgo de acumulación.',
          'En rotación a parche transdérmico, mantener la analgesia previa 12–24 h tras la aplicación mientras se alcanza el estado estacionario.',
        ],
      }
    },
    notes: [
      'Herramienta de apoyo: la rotación exige valoración clínica individual y monitorización estrecha en las primeras 24–72 h.',
      'Reduce la dosis calculada si el paciente presenta ancianidad, insuficiencia renal o hepática, comorbilidad respiratoria o síndrome de apnea.',
    ],
    references: [
      'Fine PG, Portenoy RK. Establishing "best practices" for opioid rotation. J Pain Symptom Manage. 2009;38(3):418-25.',
    ],
  },
  {
    id: 'conversion-benzodiacepinas',
    name: 'Conversión de benzodiacepinas',
    shortName: 'Benzodiacepinas',
    description: 'Proporciona equivalencias orientativas entre benzodiacepinas usando el diazepam como referencia.',
    category: CAT,
    specialty: FARM,
    inputs: [
      {
        id: 'origen',
        type: 'select',
        label: 'Benzodiacepina de partida',
        noPoints: true,
        dropdown: true,
        options: BENZO_EQUIV.map((b, i) => ({ label: b.label, value: i })),
      },
      { id: 'dosis', type: 'number', label: 'Dosis diaria total', unit: 'mg', min: 0.05, max: 500, step: 0.05 },
      {
        id: 'destino',
        type: 'select',
        label: 'Benzodiacepina equivalente',
        noPoints: true,
        dropdown: true,
        options: BENZO_EQUIV.map((b, i) => ({ label: b.label, value: i })),
      },
    ],
    compute: (v) => {
      const o = BENZO_EQUIV[v.origen ?? 0]
      const d = BENZO_EQUIV[v.destino ?? 0]
      const diazepamEq = (v.dosis! / o.factor) * 10
      const equivalente = (diazepamEq * d.factor) / 10
      return {
        main: fmt(equivalente, 2),
        mainUnit: `mg/día de ${d.label}`,
        secondary: fmt(diazepamEq, 1),
        secondaryLabel: 'mg/día equivalentes de diazepam',
        interpretation:
          'La conversión entre benzodiacepinas es aproximada y la variabilidad interindividual es alta. Vida media, potencia y ansiedad rebote difieren de una molécula a otra.',
        level: 'warn',
        details: [
          `Equivalencia de referencia: 10 mg de diazepam ≡ ${fmt(o.factor, 2)} mg de ${o.label} ≡ ${fmt(d.factor, 2)} mg de ${d.label}.`,
          'Al pasar a diazepam para deshabituación se aprovecha su vida media larga; hacerlo de forma gradual (5–10 % de reducción cada 2–4 semanas).',
          'La retirada brusca puede precipitar convulsiones y delirio: nunca suspender abruptamente en tratamiento crónico.',
        ],
      }
    },
    notes: ['Los factores de equivalencia proceden del manual clásico de Ashton; la comunidad clínica los utiliza como referencia orientativa.'],
    references: [
      'Ashton CH. Benzodiazepines: How they work and how to withdraw. Universidad de Newcastle, 2002 (rev. 2007).',
    ],
  },
  {
    id: 'ciwa-b',
    name: 'CIWA-B para la abstinencia de benzodiacepinas',
    shortName: 'CIWA-B',
    description: 'Evalúa la gravedad del síndrome de abstinencia de benzodiacepinas.',
    category: CAT,
    specialty: FARM,
    inputs: [
      ...[
        ['irritabilidad', 'Irritabilidad'],
        ['fatiga', 'Fatiga'],
        ['tension', 'Tensión muscular'],
        ['dificultadConcentracion', 'Dificultad para concentrarse'],
        ['perdidaApetito', 'Pérdida de apetito'],
        ['entumecimiento', 'Entumecimiento u hormigueos'],
        ['tinnitus', 'Zumbidos de oídos'],
        ['confusion', 'Confusión'],
        ['fotofobia', 'Molestia con la luz'],
        ['fonofobia', 'Molestia con el ruido'],
        ['pesadillas', 'Pesadillas'],
        ['nauseas', 'Náuseas'],
        ['temblor', 'Temblor'],
        ['sudoracion', 'Sudoración'],
        ['ansiedad', 'Ansiedad'],
        ['agitacion', 'Agitación'],
        ['alucinacionesV', 'Alucinaciones visuales'],
        ['alucinacionesA', 'Alucinaciones auditivas'],
        ['alucinacionesT', 'Alucinaciones táctiles'],
      ].map(([id, label]) => ({
        id,
        type: 'select' as const,
        label,
        options: [
          { label: '0 — Nada', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4 — Muy intenso', value: 4 },
        ],
      })),
      {
        id: 'sueno',
        type: 'select',
        label: 'Alteración del sueño',
        options: [
          { label: '0 — Normal', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4 — Insomnio grave', value: 4 },
        ],
      },
      {
        id: 'debilidad',
        type: 'select',
        label: 'Debilidad muscular',
        options: [
          { label: '0 — Ninguna', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4 — Grave', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const ids = [
        'irritabilidad','fatiga','tension','dificultadConcentracion','perdidaApetito',
        'entumecimiento','tinnitus','confusion','fotofobia','fonofobia','pesadillas',
        'nauseas','temblor','sudoracion','ansiedad','agitacion',
        'alucinacionesV','alucinacionesA','alucinacionesT','sueno','debilidad',
      ]
      const score = ids.reduce((acc, id) => acc + (v[id] ?? 0), 0)
      return {
        main: String(score),
        mainUnit: 'puntos (0–84)',
        interpretation:
          score < 20
            ? 'Abstinencia leve: continuar reducción gradual y vigilar.'
            : score < 40
              ? 'Abstinencia moderada: enlentecer o parar la reducción y valorar apoyo farmacológico.'
              : 'Abstinencia intensa: riesgo de convulsiones y delirio; ingreso y tratamiento activo.',
        level: score < 20 ? 'ok' : score < 40 ? 'warn' : 'danger',
      }
    },
    notes: ['Los umbrales son orientativos; la CIWA-B se usa junto a la clínica para modular el ritmo de deshabituación.'],
    references: [
      'Busto UE, et al. Clinical Institute Withdrawal Assessment for Benzodiazepines (CIWA-B). J Clin Psychopharmacol. 1989;9(6):412-6.',
    ],
  },
]
