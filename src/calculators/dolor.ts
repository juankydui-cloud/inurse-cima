import type { Calculator } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Dolor'
const ANES = ['Anestesiología']

export const dolor: Calculator[] = [
  {
    id: 'flacc',
    name: 'Escala FLACC (cara, piernas, actividad, llanto, consolabilidad)',
    shortName: 'FLACC',
    description:
      'Evalúa el dolor postoperatorio en niños pequeños (2 meses – 7 años) y en pacientes que no pueden comunicarlo.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'cara',
        type: 'select',
        label: 'Cara',
        dropdown: true,
        options: [
          { label: '0 — Sin expresión particular o sonríe', value: 0 },
          { label: '1 — Muecas o ceño fruncido ocasionales; retraído, desinteresado', value: 1 },
          { label: '2 — Ceño fruncido frecuente o constante, mandíbula apretada, temblor de mentón', value: 2 },
        ],
      },
      {
        id: 'piernas',
        type: 'select',
        label: 'Piernas',
        dropdown: true,
        options: [
          { label: '0 — Posición normal o relajadas', value: 0 },
          { label: '1 — Inquietas, intranquilas, tensas', value: 1 },
          { label: '2 — Patalea o piernas encogidas', value: 2 },
        ],
      },
      {
        id: 'actividad',
        type: 'select',
        label: 'Actividad',
        dropdown: true,
        options: [
          { label: '0 — Tumbado tranquilo, posición normal, se mueve con facilidad', value: 0 },
          { label: '1 — Se retuerce, se balancea, tenso', value: 1 },
          { label: '2 — Arqueado, rígido o con sacudidas', value: 2 },
        ],
      },
      {
        id: 'llanto',
        type: 'select',
        label: 'Llanto',
        dropdown: true,
        options: [
          { label: '0 — Sin llanto (despierto o dormido)', value: 0 },
          { label: '1 — Gemidos o lloriqueos; quejas ocasionales', value: 1 },
          { label: '2 — Llanto mantenido, gritos o sollozos; quejas frecuentes', value: 2 },
        ],
      },
      {
        id: 'consolabilidad',
        type: 'select',
        label: 'Consolabilidad',
        dropdown: true,
        options: [
          { label: '0 — Contento, relajado', value: 0 },
          { label: '1 — Se tranquiliza al tocarlo, abrazarlo o hablarle; distraíble', value: 1 },
          { label: '2 — Difícil de consolar o reconfortar', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['cara', 'piernas', 'actividad', 'llanto', 'consolabilidad'])
      const band =
        score === 0 ? 'Relajado y cómodo' : score <= 3 ? 'Malestar leve' : score <= 6 ? 'Dolor moderado' : 'Dolor intenso o malestar importante'
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        interpretation: `${band}.${score >= 4 ? ' Valorar analgesia y reevaluar tras la intervención.' : ''}`,
        level: score === 0 ? 'ok' : score <= 3 ? 'info' : score <= 6 ? 'warn' : 'danger',
      }
    },
    notes: [
      '0: relajado · 1–3: malestar leve · 4–6: dolor moderado · 7–10: dolor intenso.',
      'Observar 1–5 minutos con el paciente descubierto; recolocar o observar durante la movilización si está dormido.',
    ],
    references: [
      'Merkel SI, et al. The FLACC: a behavioral scale for scoring postoperative pain in young children. Pediatr Nurs. 1997;23(3):293-7.',
    ],
  },
  {
    id: 'bps',
    name: 'Escala de dolor conductual (BPS) para pacientes intubados',
    shortName: 'BPS',
    description:
      'Cuantifica el dolor en pacientes críticos intubados y sedados mediante tres indicadores conductuales.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'facial',
        type: 'select',
        label: 'Expresión facial',
        dropdown: true,
        options: [
          { label: '1 — Relajada', value: 1 },
          { label: '2 — Parcialmente tensa (p. ej., ceño fruncido)', value: 2 },
          { label: '3 — Totalmente tensa (p. ej., párpados apretados)', value: 3 },
          { label: '4 — Muecas de dolor', value: 4 },
        ],
      },
      {
        id: 'miembros',
        type: 'select',
        label: 'Miembros superiores',
        dropdown: true,
        options: [
          { label: '1 — Sin movimiento', value: 1 },
          { label: '2 — Parcialmente flexionados', value: 2 },
          { label: '3 — Muy flexionados con flexión de los dedos', value: 3 },
          { label: '4 — Retracción permanente', value: 4 },
        ],
      },
      {
        id: 'ventilacion',
        type: 'select',
        label: 'Adaptación a la ventilación mecánica',
        dropdown: true,
        options: [
          { label: '1 — Tolera la ventilación', value: 1 },
          { label: '2 — Tose, pero tolera la ventilación la mayor parte del tiempo', value: 2 },
          { label: '3 — Lucha contra el ventilador', value: 3 },
          { label: '4 — Imposible controlar la ventilación', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['facial', 'miembros', 'ventilacion'])
      return {
        main: String(score),
        mainUnit: 'puntos (3–12)',
        interpretation:
          score === 3
            ? 'Sin dolor aparente.'
            : score <= 5
              ? 'Dolor leve: vigilar y reevaluar.'
              : score <= 8
                ? 'Dolor significativo (BPS ≥ 6): se recomienda tratar y reevaluar.'
                : 'Dolor intenso: tratamiento analgésico inmediato y reevaluación.',
        level: score === 3 ? 'ok' : score <= 5 ? 'info' : score <= 8 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Un BPS ≥ 6 se considera dolor significativo que requiere tratamiento.',
      'Existe la variante BPS-NI (no intubados) que sustituye el ítem ventilatorio por la vocalización.',
    ],
    references: [
      'Payen JF, et al. Assessing pain in critically ill sedated patients by using a behavioral pain scale. Crit Care Med. 2001;29(12):2258-63.',
    ],
  },
  {
    id: 'nvps',
    name: 'Escala de dolor no verbal (NVPS)',
    shortName: 'NVPS',
    description:
      'Cuantifica el dolor en pacientes que no pueden comunicarse (intubación, sedación, demencia…).',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'cara',
        type: 'select',
        label: 'Cara',
        dropdown: true,
        options: [
          { label: '0 — Sin expresión particular o sonrisa', value: 0 },
          { label: '1 — Muecas, ceño fruncido o gesto de dolor ocasionales', value: 1 },
          { label: '2 — Muecas o gesto de dolor frecuentes', value: 2 },
        ],
      },
      {
        id: 'actividad',
        type: 'select',
        label: 'Actividad (movimiento)',
        dropdown: true,
        options: [
          { label: '0 — Tumbado tranquilo, posición normal', value: 0 },
          { label: '1 — Movimientos lentos y cautelosos; se toca o señala la zona dolorida', value: 1 },
          { label: '2 — Inquieto, actividad excesiva o rituales de protección', value: 2 },
        ],
      },
      {
        id: 'defensa',
        type: 'select',
        label: 'Defensa (guarding)',
        dropdown: true,
        options: [
          { label: '0 — Tumbado tranquilo, sin posición protectora', value: 0 },
          { label: '1 — Protege zonas del cuerpo o adopta postura antiálgica', value: 1 },
          { label: '2 — Rígido, tenso', value: 2 },
        ],
      },
      {
        id: 'fisio1',
        type: 'select',
        label: 'Fisiológico I (constantes vitales)',
        dropdown: true,
        options: [
          { label: '0 — Constantes estables, sin cambios en las últimas 4 h', value: 0 },
          { label: '1 — Cambio en las últimas 4 h: PAS > 20 mmHg o FC > 20 lpm sobre la basal', value: 1 },
          { label: '2 — Cambio en las últimas 4 h: PAS > 30 mmHg o FC > 25 lpm sobre la basal', value: 2 },
        ],
      },
      {
        id: 'fisio2',
        type: 'select',
        label: 'Fisiológico II (respiratorio)',
        dropdown: true,
        options: [
          { label: '0 — FR basal / SpO₂ basal; adaptado al ventilador', value: 0 },
          { label: '1 — FR > 10 rpm sobre la basal, o descenso de SpO₂ del 5 %; asincronía leve', value: 1 },
          { label: '2 — FR > 20 rpm sobre la basal, o descenso de SpO₂ del 10 %; lucha con el ventilador', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['cara', 'actividad', 'defensa', 'fisio1', 'fisio2'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        interpretation:
          score <= 2
            ? 'Ausencia de dolor o dolor leve.'
            : score <= 6
              ? 'Dolor moderado: se recomienda intervención analgésica y reevaluación.'
              : 'Dolor intenso: tratamiento analgésico inmediato.',
        level: score <= 2 ? 'ok' : score <= 6 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Los puntos de corte no están tan estandarizados como en otras escalas: usar como tendencia y reevaluar tras cada intervención.',
    ],
    references: [
      'Odhner M, et al. Assessing pain control in nonverbal critically ill adults. Dimens Crit Care Nurs. 2003;22(6):260-7.',
    ],
  },
  {
    id: 'cheops',
    name: 'Escala CHEOPS de dolor pediátrico postoperatorio',
    shortName: 'CHEOPS',
    description:
      'Cuantifica el dolor postoperatorio en pacientes pediátricos de 1 a 5 años.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'llanto',
        type: 'select',
        label: 'Llanto',
        dropdown: true,
        options: [
          { label: '1 — No llora', value: 1 },
          { label: '2 — Gime o llora', value: 2 },
          { label: '3 — Grita o solloza', value: 3 },
        ],
      },
      {
        id: 'facial',
        type: 'select',
        label: 'Expresión facial',
        dropdown: true,
        options: [
          { label: '0 — Sonriente', value: 0 },
          { label: '1 — Serena, neutra', value: 1 },
          { label: '2 — Muecas de dolor', value: 2 },
        ],
      },
      {
        id: 'verbal',
        type: 'select',
        label: 'Expresión verbal',
        dropdown: true,
        options: [
          { label: '0 — Habla de otras cosas en positivo, sin quejas', value: 0 },
          { label: '1 — No habla, o se queja de otras cosas', value: 1 },
          { label: '2 — Se queja de dolor', value: 2 },
        ],
      },
      {
        id: 'torso',
        type: 'select',
        label: 'Torso',
        dropdown: true,
        options: [
          { label: '1 — Posición neutra, cuerpo en reposo', value: 1 },
          { label: '2 — Cambia de postura, tenso, erguido, tiritando o sujeto', value: 2 },
        ],
      },
      {
        id: 'tacto',
        type: 'select',
        label: 'Tacto (herida)',
        dropdown: true,
        options: [
          { label: '1 — No toca la herida', value: 1 },
          { label: '2 — Alcanza, toca o agarra la herida, o tiene los brazos sujetos', value: 2 },
        ],
      },
      {
        id: 'piernas',
        type: 'select',
        label: 'Piernas',
        dropdown: true,
        options: [
          { label: '1 — Posición neutra', value: 1 },
          { label: '2 — Se retuerce, patalea, piernas encogidas, de pie o sujetas', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['llanto', 'facial', 'verbal', 'torso', 'tacto', 'piernas'])
      return {
        main: String(score),
        mainUnit: 'puntos (4–13)',
        interpretation:
          score === 4
            ? 'Sin dolor aparente.'
            : score <= 7
              ? 'Dolor leve-moderado: vigilar, medidas de confort y valorar analgesia.'
              : 'Dolor intenso (≥ 8): se recomienda administrar analgesia y reevaluar.',
        level: score === 4 ? 'ok' : score <= 7 ? 'warn' : 'danger',
      }
    },
    notes: ['La puntuación mínima es 4. Un valor ≥ 8 se usa habitualmente como umbral para tratar.'],
    references: [
      'McGrath PJ, et al. CHEOPS: a behavioral scale for rating postoperative pain in children. Adv Pain Res Ther. 1985;9:395-402.',
    ],
  },
  {
    id: 'bops',
    name: 'Escala de dolor observacional conductual (BOPS)',
    shortName: 'BOPS',
    description: 'Cuantifica el dolor postoperatorio en niños de 1 a 7 años.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'facial',
        type: 'select',
        label: 'Expresión facial',
        dropdown: true,
        options: [
          { label: '0 — Neutra o positiva', value: 0 },
          { label: '1 — Expresión negativa (ceño, muecas ocasionales)', value: 1 },
          { label: '2 — Expresión claramente negativa y mantenida', value: 2 },
        ],
      },
      {
        id: 'verbal',
        type: 'select',
        label: 'Verbalización',
        dropdown: true,
        options: [
          { label: '0 — Tranquilo, no se queja', value: 0 },
          { label: '1 — Se queja o gime, se distrae con facilidad', value: 1 },
          { label: '2 — Llanto o quejas de dolor persistentes', value: 2 },
        ],
      },
      {
        id: 'postura',
        type: 'select',
        label: 'Posición corporal',
        dropdown: true,
        options: [
          { label: '0 — Neutra, relajada', value: 0 },
          { label: '1 — Inquieto, tenso, cambia de postura', value: 1 },
          { label: '2 — Rígido o protege/señala la zona dolorida', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['facial', 'verbal', 'postura'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–6)',
        interpretation:
          score < 3
            ? 'Dolor leve o ausente: continuar con medidas de confort y reevaluación periódica.'
            : 'BOPS ≥ 3: se recomienda administrar analgesia y reevaluar (a los 15–20 min si es IV; a los 30–45 min si es oral o rectal).',
        level: score < 3 ? 'ok' : 'warn',
      }
    },
    notes: ['Reevaluar cada 3 horas y tras cada intervención analgésica.'],
    references: [
      'Hesselgard K, et al. Validity and reliability of the Behavioural Observational Pain Scale for postoperative pain measurement in children 1–7 years of age. Pediatr Crit Care Med. 2007;8(2):102-8.',
    ],
  },
  {
    id: 'abbey',
    name: 'Escala de dolor de Abbey para pacientes con demencia',
    shortName: 'Abbey',
    description:
      'Evalúa el dolor en pacientes con demencia avanzada que no pueden verbalizarlo.',
    category: CAT,
    specialty: ANES,
    inputs: [
      {
        id: 'voz',
        type: 'select',
        label: 'Vocalización',
        description: 'Gimoteos, quejidos, llanto.',
        dropdown: true,
        options: [
          { label: '0 — Ausente', value: 0 },
          { label: '1 — Leve', value: 1 },
          { label: '2 — Moderada', value: 2 },
          { label: '3 — Grave', value: 3 },
        ],
      },
      {
        id: 'facial',
        type: 'select',
        label: 'Expresión facial',
        description: 'Tensión, ceño fruncido, muecas, aspecto asustado.',
        dropdown: true,
        options: [
          { label: '0 — Ausente', value: 0 },
          { label: '1 — Leve', value: 1 },
          { label: '2 — Moderada', value: 2 },
          { label: '3 — Grave', value: 3 },
        ],
      },
      {
        id: 'corporal',
        type: 'select',
        label: 'Cambios en el lenguaje corporal',
        description: 'Inquietud, balanceo, protege una parte del cuerpo, retraimiento.',
        dropdown: true,
        options: [
          { label: '0 — Ausentes', value: 0 },
          { label: '1 — Leves', value: 1 },
          { label: '2 — Moderados', value: 2 },
          { label: '3 — Graves', value: 3 },
        ],
      },
      {
        id: 'conducta',
        type: 'select',
        label: 'Cambios de conducta',
        description: 'Mayor confusión, rechazo de la comida, alteración de patrones habituales.',
        dropdown: true,
        options: [
          { label: '0 — Ausentes', value: 0 },
          { label: '1 — Leves', value: 1 },
          { label: '2 — Moderados', value: 2 },
          { label: '3 — Graves', value: 3 },
        ],
      },
      {
        id: 'fisio',
        type: 'select',
        label: 'Cambios fisiológicos',
        description: 'Temperatura, pulso o presión arterial fuera de rango; sudoración, rubor o palidez.',
        dropdown: true,
        options: [
          { label: '0 — Ausentes', value: 0 },
          { label: '1 — Leves', value: 1 },
          { label: '2 — Moderados', value: 2 },
          { label: '3 — Graves', value: 3 },
        ],
      },
      {
        id: 'fisicos',
        type: 'select',
        label: 'Cambios físicos',
        description: 'Lesiones cutáneas, zonas de presión, artritis, contracturas, lesiones previas.',
        dropdown: true,
        options: [
          { label: '0 — Ausentes', value: 0 },
          { label: '1 — Leves', value: 1 },
          { label: '2 — Moderados', value: 2 },
          { label: '3 — Graves', value: 3 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['voz', 'facial', 'corporal', 'conducta', 'fisio', 'fisicos'])
      const band =
        score <= 2 ? 'Sin dolor' : score <= 7 ? 'Dolor leve' : score <= 13 ? 'Dolor moderado' : 'Dolor intenso'
      return {
        main: String(score),
        mainUnit: 'puntos (0–18)',
        interpretation: `${band}.${score >= 3 ? ' Tratar según intensidad y reevaluar 1 hora después de la intervención.' : ''}`,
        level: score <= 2 ? 'ok' : score <= 7 ? 'info' : score <= 13 ? 'warn' : 'danger',
      }
    },
    notes: [
      '0–2: sin dolor · 3–7: leve · 8–13: moderado · ≥14: intenso.',
      'Registrar también si el dolor parece crónico, agudo o agudo sobre crónico.',
      'Evaluar durante la movilización si es posible.',
    ],
    references: [
      'Abbey J, et al. The Abbey pain scale: a 1-minute numerical indicator for people with end-stage dementia. Int J Palliat Nurs. 2004;10(1):6-13.',
    ],
  },
  {
    id: 'nps',
    name: 'Escala de dolor neuropático (NPS)',
    shortName: 'NPS',
    description:
      'Cuantifica la gravedad y las cualidades del dolor neuropático; útil para seguir la respuesta al tratamiento.',
    category: CAT,
    specialty: ANES,
    inputs: [
      { id: 'i1', type: 'number', label: 'Intensidad del dolor', description: '0 = sin dolor; 10 = el dolor más intenso imaginable.', min: 0, max: 10, step: 1 },
      { id: 'i2', type: 'number', label: 'Dolor agudo / punzante', description: '«Como un cuchillo o agujas». 0–10.', min: 0, max: 10, step: 1 },
      { id: 'i3', type: 'number', label: 'Dolor caliente / quemante', description: '«Como si quemara». 0–10.', min: 0, max: 10, step: 1 },
      { id: 'i4', type: 'number', label: 'Dolor sordo / opresivo', description: '«Dolor profundo y continuo». 0–10.', min: 0, max: 10, step: 1 },
      { id: 'i5', type: 'number', label: 'Dolor frío / helado', description: '«Como congelación». 0–10.', min: 0, max: 10, step: 1 },
      { id: 'i6', type: 'number', label: 'Sensibilidad al tacto', description: 'Dolor con el roce o la ropa (alodinia). 0–10.', min: 0, max: 10, step: 1 },
      { id: 'i7', type: 'number', label: 'Picor', description: '0–10.', min: 0, max: 10, step: 1 },
      { id: 'i8', type: 'number', label: 'Desagrado', description: 'Cuán desagradable resulta el dolor. 0–10.', min: 0, max: 10, step: 1 },
      { id: 'i9', type: 'number', label: 'Intensidad del dolor profundo', description: '0–10.', min: 0, max: 10, step: 1 },
      { id: 'i10', type: 'number', label: 'Intensidad del dolor superficial', description: '0–10.', min: 0, max: 10, step: 1 },
    ],
    compute: (v) => {
      const ids = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10']
      const bad = ids.some((id) => (v[id] ?? 0) < 0 || (v[id] ?? 0) > 10)
      if (bad)
        return {
          main: '—',
          interpretation: 'Cada ítem debe puntuarse entre 0 y 10.',
          level: 'warn',
        }
      const score = sum(v, ids)
      return {
        main: fmt(score),
        mainUnit: 'puntos (0–100)',
        interpretation:
          'No existen puntos de corte diagnósticos: la NPS sirve para caracterizar las cualidades del dolor neuropático y monitorizar la respuesta al tratamiento comparando puntuaciones sucesivas.',
        level: 'info',
      }
    },
    notes: [
      'También se pueden analizar los ítems por separado (p. ej., mejora del componente quemante frente al punzante).',
      'Para diagnóstico de dolor neuropático se recomiendan herramientas específicas (DN4, LANSS).',
    ],
    references: [
      'Galer BS, Jensen MP. Development and preliminary validation of a pain measure specific to neuropathic pain: the Neuropathic Pain Scale. Neurology. 1997;48(2):332-8.',
    ],
  },
]
