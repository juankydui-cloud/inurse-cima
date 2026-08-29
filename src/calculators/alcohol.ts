import type { Calculator, Option } from '../engine/types'
import { sum } from '../engine/types'

const CAT = 'Alcohol y abstinencia'
const ANES = ['Anestesiología']

const escala07 = (anchors: Record<number, string>): Option[] =>
  Array.from({ length: 8 }, (_, i) => ({
    label: anchors[i] ? `${i} — ${anchors[i]}` : `${i} — (intensidad intermedia)`,
    value: i,
  }))

export const alcohol: Calculator[] = [
  {
    id: 'ciwa-ar',
    name: 'CIWA-Ar para la abstinencia de alcohol',
    shortName: 'CIWA-Ar',
    description:
      'Objetiva la gravedad del síndrome de abstinencia alcohólica y guía el tratamiento pautado por síntomas.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'nauseas',
        type: 'select',
        label: 'Náuseas y vómitos',
        description: '«¿Tiene el estómago revuelto? ¿Ha vomitado?»',
        dropdown: true,
        options: escala07({
          0: 'Sin náuseas ni vómitos',
          1: 'Náuseas leves sin vómitos',
          4: 'Náuseas intermitentes con arcadas secas',
          7: 'Náuseas constantes, arcadas frecuentes y vómitos',
        }),
      },
      {
        id: 'temblor',
        type: 'select',
        label: 'Temblor',
        description: 'Con los brazos extendidos y los dedos separados.',
        dropdown: true,
        options: escala07({
          0: 'Sin temblor',
          1: 'No visible, pero se percibe en los dedos',
          4: 'Moderado con los brazos extendidos',
          7: 'Intenso, incluso sin extender los brazos',
        }),
      },
      {
        id: 'sudoracion',
        type: 'select',
        label: 'Sudoración paroxística',
        dropdown: true,
        options: escala07({
          0: 'Sin sudoración visible',
          1: 'Sudoración apenas perceptible, palmas húmedas',
          4: 'Gotas de sudor evidentes en la frente',
          7: 'Sudoración profusa que empapa',
        }),
      },
      {
        id: 'ansiedad',
        type: 'select',
        label: 'Ansiedad',
        description: '«¿Se siente nervioso/a?»',
        dropdown: true,
        options: escala07({
          0: 'Tranquilo, sin ansiedad',
          1: 'Ligeramente ansioso',
          4: 'Moderadamente ansioso o en guardia',
          7: 'Equivalente a un estado de pánico agudo',
        }),
      },
      {
        id: 'agitacion',
        type: 'select',
        label: 'Agitación',
        dropdown: true,
        options: escala07({
          0: 'Actividad normal',
          1: 'Algo más inquieto de lo normal',
          4: 'Moderadamente inquieto, no puede estarse quieto',
          7: 'Camina de un lado a otro o forcejea constantemente',
        }),
      },
      {
        id: 'tactiles',
        type: 'select',
        label: 'Alteraciones táctiles',
        description: 'Picores, pinchazos, quemazón, entumecimiento o sensación de bichos bajo la piel.',
        dropdown: true,
        options: escala07({
          0: 'Ninguna',
          1: 'Muy leves',
          2: 'Leves',
          3: 'Moderadas',
          4: 'Alucinaciones moderadas',
          5: 'Alucinaciones graves',
          6: 'Alucinaciones extremas',
          7: 'Alucinaciones continuas',
        }),
      },
      {
        id: 'auditivas',
        type: 'select',
        label: 'Alteraciones auditivas',
        description: 'Sonidos molestos, que asustan o que no existen.',
        dropdown: true,
        options: escala07({
          0: 'Ninguna',
          1: 'Muy leves (sonidos ásperos o que sobresaltan)',
          2: 'Leves',
          3: 'Moderadas',
          4: 'Alucinaciones moderadas',
          5: 'Alucinaciones graves',
          6: 'Alucinaciones extremas',
          7: 'Alucinaciones continuas',
        }),
      },
      {
        id: 'visuales',
        type: 'select',
        label: 'Alteraciones visuales',
        description: 'Molestia con la luz, colores extraños o cosas que no existen.',
        dropdown: true,
        options: escala07({
          0: 'Ninguna',
          1: 'Muy leves (fotosensibilidad)',
          2: 'Leves',
          3: 'Moderadas',
          4: 'Alucinaciones moderadas',
          5: 'Alucinaciones graves',
          6: 'Alucinaciones extremas',
          7: 'Alucinaciones continuas',
        }),
      },
      {
        id: 'cefalea',
        type: 'select',
        label: 'Cefalea / pesadez de cabeza',
        description: 'No valorar mareo ni aturdimiento.',
        dropdown: true,
        options: escala07({
          0: 'Ausente',
          1: 'Muy leve',
          2: 'Leve',
          3: 'Moderada',
          4: 'Moderadamente intensa',
          5: 'Intensa',
          6: 'Muy intensa',
          7: 'Extremadamente intensa',
        }),
      },
      {
        id: 'orientacion',
        type: 'select',
        label: 'Orientación y funciones superiores',
        description: '«¿Qué día es hoy? ¿Dónde está? ¿Quién soy yo?»',
        dropdown: true,
        options: [
          { label: '0 — Orientado; puede hacer sumas seriadas', value: 0 },
          { label: '1 — No puede hacer sumas seriadas o duda sobre la fecha', value: 1 },
          { label: '2 — Desorientado en fecha (≤ 2 días de error)', value: 2 },
          { label: '3 — Desorientado en fecha (> 2 días de error)', value: 3 },
          { label: '4 — Desorientado en lugar y/o persona', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, [
        'nauseas', 'temblor', 'sudoracion', 'ansiedad', 'agitacion',
        'tactiles', 'auditivas', 'visuales', 'cefalea', 'orientacion',
      ])
      return {
        main: String(score),
        mainUnit: 'puntos (0–67)',
        interpretation:
          score <= 8
            ? 'Abstinencia ausente o leve: habitualmente no requiere medicación adicional; reevaluar de forma periódica.'
            : score <= 15
              ? 'Abstinencia moderada: se recomienda tratamiento farmacológico (benzodiacepinas pautadas por síntomas) y reevaluación frecuente.'
              : 'Abstinencia grave: tratamiento inmediato; riesgo elevado de convulsiones y delirium tremens.',
        level: score <= 8 ? 'ok' : score <= 15 ? 'warn' : 'danger',
      }
    },
    notes: [
      '≤ 8: leve · 9–15: moderada · > 15: grave (umbral habitual de tratamiento ≥ 8–10).',
      'Requiere que el paciente pueda comunicarse; en pacientes que no colaboran, valorar escalas alternativas (p. ej., BAWS, protocolos de sedación).',
    ],
    references: [
      'Sullivan JT, et al. Assessment of alcohol withdrawal: the revised Clinical Institute Withdrawal Assessment for Alcohol scale (CIWA-Ar). Br J Addict. 1989;84(11):1353-7.',
    ],
  },
  {
    id: 'baws',
    name: 'Escala breve de abstinencia de alcohol (BAWS)',
    shortName: 'BAWS',
    description:
      'Evalúa los síntomas de abstinencia alcohólica con cinco ítems rápidos; alternativa abreviada a la CIWA-Ar.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'temblor',
        type: 'select',
        label: 'Temblor',
        dropdown: true,
        options: [
          { label: '0 — Ausente', value: 0 },
          { label: '1 — No visible, pero el paciente lo nota / se palpa', value: 1 },
          { label: '2 — Moderado, visible con los brazos extendidos', value: 2 },
          { label: '3 — Intenso, visible sin extender los brazos', value: 3 },
        ],
      },
      {
        id: 'sudor',
        type: 'select',
        label: 'Sudoración',
        dropdown: true,
        options: [
          { label: '0 — Ausente', value: 0 },
          { label: '1 — Apenas perceptible, palmas húmedas', value: 1 },
          { label: '2 — Gotas de sudor visibles', value: 2 },
          { label: '3 — Sudoración profusa que empapa', value: 3 },
        ],
      },
      {
        id: 'agitacion',
        type: 'select',
        label: 'Agitación',
        dropdown: true,
        options: [
          { label: '0 — Actividad normal', value: 0 },
          { label: '1 — Algo inquieto', value: 1 },
          { label: '2 — Moderadamente inquieto; se mueve constantemente', value: 2 },
          { label: '3 — Camina de un lado a otro o forcejea', value: 3 },
        ],
      },
      {
        id: 'orientacion',
        type: 'select',
        label: 'Orientación',
        dropdown: true,
        options: [
          { label: '0 — Orientado en fecha, lugar y persona', value: 0 },
          { label: '1 — Desorientado en fecha o en lugar', value: 1 },
          { label: '2 — Desorientado en fecha y lugar', value: 2 },
          { label: '3 — Desorientado también en persona', value: 3 },
        ],
      },
      {
        id: 'alucinaciones',
        type: 'select',
        label: 'Alucinaciones',
        dropdown: true,
        options: [
          { label: '0 — Ninguna', value: 0 },
          { label: '1 — Leves (el paciente sabe que no son reales)', value: 1 },
          { label: '2 — Moderadas (a veces las cree reales)', value: 2 },
          { label: '3 — Graves (las cree reales y responde a ellas)', value: 3 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['temblor', 'sudor', 'agitacion', 'orientacion', 'alucinaciones'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–15)',
        interpretation:
          score <= 2
            ? 'Abstinencia leve: vigilancia y reevaluación periódica.'
            : score <= 5
              ? 'BAWS ≥ 3 (≈ CIWA-Ar ≥ 8): abstinencia moderada; se recomienda iniciar o ajustar tratamiento según protocolo.'
              : 'Abstinencia grave: tratamiento inmediato y vigilancia estrecha (riesgo de delirium tremens).',
        level: score <= 2 ? 'ok' : score <= 5 ? 'warn' : 'danger',
      }
    },
    notes: ['Un BAWS ≥ 3 se corresponde aproximadamente con un CIWA-Ar ≥ 8.'],
    references: [
      'Rastegar DA, et al. Development and implementation of an alcohol withdrawal protocol using a 5-item scale (BAWS). Subst Abus. 2017;38(4):394-400.',
    ],
  },
  {
    id: 'cage',
    name: 'Cuestionario CAGE sobre el consumo de alcohol',
    shortName: 'CAGE',
    description: 'Cribado rápido del consumo problemático de alcohol y de la dependencia alcohólica.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'c',
        type: 'boolean',
        label: '¿Ha sentido alguna vez que debería beber menos? (Cut down)',
      },
      {
        id: 'a',
        type: 'boolean',
        label: '¿Le ha molestado que la gente critique su forma de beber? (Annoyed)',
      },
      {
        id: 'g',
        type: 'boolean',
        label: '¿Se ha sentido alguna vez mal o culpable por su forma de beber? (Guilty)',
      },
      {
        id: 'e',
        type: 'boolean',
        label: '¿Ha bebido alguna vez a primera hora de la mañana para calmar los nervios o la resaca? (Eye-opener)',
      },
    ],
    compute: (v) => {
      const score = sum(v, ['c', 'a', 'g', 'e'])
      return {
        main: String(score),
        mainUnit: 'de 4',
        interpretation:
          score >= 2
            ? 'Cribado positivo (≥ 2): alta sospecha de consumo problemático o dependencia; ampliar la evaluación (p. ej., AUDIT, historia clínica dirigida) y valorar riesgo de abstinencia perioperatoria.'
            : score === 1
              ? 'Una respuesta positiva: valorar ampliar la anamnesis sobre el consumo.'
              : 'Cribado negativo.',
        level: score >= 2 ? 'danger' : score === 1 ? 'warn' : 'ok',
      }
    },
    notes: [
      'La respuesta afirmativa a la última pregunta («eye-opener») es especialmente sugestiva de dependencia.',
      'El CAGE no cuantifica el consumo actual: complementar con unidades de bebida estándar por semana.',
    ],
    references: ['Ewing JA. Detecting alcoholism: the CAGE questionnaire. JAMA. 1984;252(14):1905-7.'],
  },
]
