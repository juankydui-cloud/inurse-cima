import type { Calculator, Option } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT_GENERAL = 'Medicina interna y familiar'
const CAT_GERIA = 'Geriatría, fragilidad y salud mental'
const CAT_DIABETES = 'Endocrino, obesidad y diabetes'
const CAT_GASTRO = 'Hepato-digestivo y nutrición'
const CAT_HEMATO = 'Hematología y oncología'
const CAT_CARDIO = 'Síndrome coronario agudo y dolor torácico'
const CAT_TEV = 'Tromboembolismo venoso'
const CAT_RESPI = 'Respiratorio crítico y ventilación'
const FAM = ['Medicina Familiar']

const escala = (items: [number, string][]): Option[] =>
  items.map(([value, label]) => ({ label: `${value} — ${label}`, value }))

export const medicinaFamilia: Calculator[] = [
  {
    id: 'bristol',
    name: 'Escala de heces de Bristol',
    shortName: 'Bristol',
    description:
      'Clasifica la consistencia de las heces en siete tipos; útil en estreñimiento, diarrea y síndrome del intestino irritable.',
    category: CAT_GASTRO,
    specialty: FAM,
    inputs: [
      {
        id: 'tipo',
        type: 'select',
        label: 'Tipo de heces',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Tipo 1 — Bolas duras separadas, como nueces', value: 1 },
          { label: 'Tipo 2 — Salchicha compuesta de fragmentos', value: 2 },
          { label: 'Tipo 3 — Salchicha con grietas en la superficie', value: 3 },
          { label: 'Tipo 4 — Salchicha lisa y blanda', value: 4 },
          { label: 'Tipo 5 — Fragmentos blandos con bordes definidos', value: 5 },
          { label: 'Tipo 6 — Fragmentos blandos y esponjosos', value: 6 },
          { label: 'Tipo 7 — Líquido sin fragmentos sólidos', value: 7 },
        ],
      },
    ],
    compute: (v) => {
      const t = v.tipo ?? 4
      const banda =
        t <= 2 ? 'Estreñimiento' : t <= 5 ? 'Normal' : 'Diarrea'
      const detalle =
        t <= 2
          ? 'Sugiere estreñimiento: aumentar fibra, líquidos y actividad física; valorar laxantes si es persistente.'
          : t <= 4
            ? 'Tránsito y consistencia normales.'
            : t === 5
              ? 'Blandas: puede indicar tránsito ligeramente acelerado; valorar dieta.'
              : t === 6
                ? 'Sugiere diarrea: valorar hidratación, dieta y factores desencadenantes.'
                : 'Diarrea líquida: reposición hidroelectrolítica; buscar causa infecciosa, medicamentosa o funcional.'
      return {
        main: `Tipo ${t}`,
        secondary: banda,
        interpretation: detalle,
        level: t <= 2 ? 'warn' : t <= 5 ? 'ok' : t === 6 ? 'warn' : 'danger',
      }
    },
    references: [
      'Lewis SJ, Heaton KW. Stool form scale as a useful guide to intestinal transit time. Scand J Gastroenterol. 1997;32(9):920-4.',
    ],
  },
  {
    id: 'clinical-frailty',
    name: 'Escala de fragilidad clínica (Rockwood CFS)',
    shortName: 'Rockwood CFS',
    description: 'Cuantifica el grado de fragilidad clínica en pacientes ≥ 65 años.',
    category: CAT_GERIA,
    specialty: FAM,
    inputs: [
      {
        id: 'nivel',
        type: 'select',
        label: 'Grado de fragilidad',
        dropdown: true,
        noPoints: true,
        options: [
          { label: '1 — Muy en forma: robusto, activo, motivado', value: 1 },
          { label: '2 — En forma: sin enfermedad activa; ejercicio ocasional', value: 2 },
          { label: '3 — Se mantiene bien: enfermedades controladas; no realiza ejercicio regular', value: 3 },
          { label: '4 — Vulnerable: no depende de otros, pero los síntomas limitan la actividad', value: 4 },
          { label: '5 — Fragilidad leve: dependencia parcial en actividades instrumentales', value: 5 },
          { label: '6 — Fragilidad moderada: necesita ayuda en actividades exteriores y algunas del hogar', value: 6 },
          { label: '7 — Fragilidad grave: dependencia total para el autocuidado; estable', value: 7 },
          { label: '8 — Fragilidad muy grave: dependencia total; enfermedad terminal probable en < 6 meses', value: 8 },
          { label: '9 — Enfermedad terminal: expectativa de vida < 6 meses', value: 9 },
        ],
      },
    ],
    compute: (v) => {
      const n = v.nivel ?? 1
      return {
        main: `CFS ${n}`,
        interpretation:
          n <= 3
            ? 'No frágil: buen pronóstico funcional; expectativa de recuperación tras enfermedad aguda.'
            : n === 4
              ? 'Vulnerable: mayor riesgo de deterioro con enfermedad aguda; anticipar apoyo.'
              : n <= 6
                ? 'Fragilidad leve-moderada: mayor riesgo de deterioro funcional, delirium y mortalidad. Valorar intensidad del tratamiento y objetivos con el paciente y la familia.'
                : n <= 8
                  ? 'Fragilidad grave o muy grave: enfoque paliativo y confortable; los tratamientos invasivos ofrecen escaso beneficio.'
                  : 'Enfermedad terminal: cuidados paliativos y planificación del final de vida.',
        level: n <= 3 ? 'ok' : n <= 5 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Aplicable a pacientes ≥ 65 años; el juicio clínico prevalece.',
      'Muy usada durante la pandemia COVID-19 para orientar la toma de decisiones sobre soporte vital avanzado.',
    ],
    references: [
      'Rockwood K, et al. A global clinical measure of fitness and frailty in elderly people. CMAJ. 2005;173(5):489-95.',
    ],
  },
  {
    id: 'cdr',
    name: 'Escala clínica de demencia (CDR)',
    shortName: 'CDR',
    description: 'Estadifica la gravedad clínica de la demencia mediante seis dominios.',
    category: CAT_GERIA,
    specialty: FAM,
    inputs: [
      ...([
        ['memoria', 'Memoria'],
        ['orientacion', 'Orientación'],
        ['juicio', 'Juicio y resolución de problemas'],
        ['asuntos', 'Asuntos comunitarios'],
        ['hogar', 'Hogar y aficiones'],
        ['cuidado', 'Cuidado personal'],
      ] as [string, string][]).map(([id, label]) => ({
        id,
        type: 'select' as const,
        label,
        dropdown: true,
        options: [
          { label: '0 — Sin alteración', value: 0 },
          { label: '0,5 — Cuestionable', value: 0.5 },
          { label: '1 — Leve', value: 1 },
          { label: '2 — Moderada', value: 2 },
          { label: '3 — Grave', value: 3 },
        ],
      })),
    ],
    compute: (v) => {
      const memoria = v.memoria ?? 0
      const secundarios = ['orientacion', 'juicio', 'asuntos', 'hogar', 'cuidado'].map((k) => v[k] ?? 0)
      const cdr = memoria
      const acuerdo = secundarios.filter((x) => x === memoria).length
      const global = acuerdo >= 3 ? cdr : (memoria + secundarios.reduce((a, b) => a + b, 0)) / 6
      const round = (x: number) => {
        if (x <= 0.25) return 0
        if (x <= 0.75) return 0.5
        if (x <= 1.5) return 1
        if (x <= 2.5) return 2
        return 3
      }
      const g = round(global)
      const etiqueta = { 0: 'Sin demencia', 0.5: 'Deterioro cognitivo cuestionable', 1: 'Demencia leve', 2: 'Demencia moderada', 3: 'Demencia grave' }[g]
      return {
        main: `CDR ${g}`,
        secondary: etiqueta,
        interpretation:
          g === 0
            ? 'Sin demencia clínica.'
            : g === 0.5
              ? 'Deterioro cognitivo leve o cuestionable: seguimiento y evaluación neuropsicológica.'
              : g === 1
                ? 'Demencia leve: apoyo a la persona y a la familia, valoración de tratamiento específico.'
                : g === 2
                  ? 'Demencia moderada: dependencia creciente; planificar cuidados y decisiones anticipadas.'
                  : 'Demencia grave: cuidados de apoyo intensivos; valorar cuidados paliativos.',
        level: g === 0 ? 'ok' : g <= 1 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Se usa el algoritmo estándar: la memoria es el dominio principal; si 3 o más secundarios coinciden con el valor de memoria, el CDR global es ese valor.',
    ],
    references: [
      'Morris JC. The Clinical Dementia Rating (CDR): current version and scoring rules. Neurology. 1993;43(11):2412-4.',
    ],
  },
  {
    id: 'gds-15',
    name: 'Escala de depresión geriátrica de Yesavage (GDS-15)',
    shortName: 'GDS-15',
    description:
      'Cribado de depresión en personas mayores mediante 15 preguntas de respuesta sí/no.',
    category: CAT_GERIA,
    specialty: FAM,
    inputs: [
      { id: 'q1', type: 'boolean', label: '¿Está satisfecho/a con su vida?', labels: ['Sí', 'No'] },
      { id: 'q2', type: 'boolean', label: '¿Ha renunciado a muchas actividades e intereses?', labels: ['No', 'Sí'] },
      { id: 'q3', type: 'boolean', label: '¿Siente que su vida está vacía?', labels: ['No', 'Sí'] },
      { id: 'q4', type: 'boolean', label: '¿Se aburre a menudo?', labels: ['No', 'Sí'] },
      { id: 'q5', type: 'boolean', label: '¿Está de buen humor la mayor parte del tiempo?', labels: ['Sí', 'No'] },
      { id: 'q6', type: 'boolean', label: '¿Tiene miedo de que le suceda algo malo?', labels: ['No', 'Sí'] },
      { id: 'q7', type: 'boolean', label: '¿Se siente feliz la mayor parte del tiempo?', labels: ['Sí', 'No'] },
      { id: 'q8', type: 'boolean', label: '¿Se siente a menudo indefenso/a?', labels: ['No', 'Sí'] },
      { id: 'q9', type: 'boolean', label: '¿Prefiere quedarse en casa a salir a hacer cosas nuevas?', labels: ['No', 'Sí'] },
      { id: 'q10', type: 'boolean', label: '¿Cree que tiene más problemas de memoria que los demás?', labels: ['No', 'Sí'] },
      { id: 'q11', type: 'boolean', label: '¿Cree que es maravilloso estar vivo/a?', labels: ['Sí', 'No'] },
      { id: 'q12', type: 'boolean', label: '¿Se siente inútil tal como está ahora?', labels: ['No', 'Sí'] },
      { id: 'q13', type: 'boolean', label: '¿Se siente lleno/a de energía?', labels: ['Sí', 'No'] },
      { id: 'q14', type: 'boolean', label: '¿Cree que su situación es desesperada?', labels: ['No', 'Sí'] },
      { id: 'q15', type: 'boolean', label: '¿Cree que la mayoría de la gente está mejor que usted?', labels: ['No', 'Sí'] },
    ],
    compute: (v) => {
      const score = sum(v, Array.from({ length: 15 }, (_, i) => `q${i + 1}`))
      return {
        main: String(score),
        mainUnit: 'puntos (0–15)',
        interpretation:
          score <= 4
            ? 'Sin depresión: puntuación en rango normal.'
            : score <= 8
              ? 'Depresión leve o probable: valorar entrevista clínica estructurada y seguimiento.'
              : score <= 11
                ? 'Depresión moderada: evaluación diagnóstica y valorar tratamiento.'
                : 'Depresión grave: iniciar tratamiento y valorar riesgo autolítico.',
        level: score <= 4 ? 'ok' : score <= 8 ? 'warn' : 'danger',
      }
    },
    references: [
      'Sheikh JI, Yesavage JA. Geriatric Depression Scale (GDS): recent evidence and development of a shorter version. Clin Gerontol. 1986;5:165-73.',
    ],
  },
  {
    id: 'ham-a',
    name: 'Escala de ansiedad de Hamilton (HAM-A)',
    shortName: 'HAM-A',
    description: 'Cuantifica la gravedad de los síntomas de ansiedad mediante 14 dimensiones.',
    category: CAT_GERIA,
    specialty: FAM,
    inputs: (
      [
        'Estado de ánimo ansioso',
        'Tensión',
        'Miedos',
        'Insomnio',
        'Función intelectual (concentración)',
        'Ánimo depresivo',
        'Síntomas somáticos musculares',
        'Síntomas somáticos sensoriales',
        'Síntomas cardiovasculares',
        'Síntomas respiratorios',
        'Síntomas gastrointestinales',
        'Síntomas genitourinarios',
        'Síntomas autonómicos',
        'Comportamiento en la entrevista',
      ] as string[]
    ).map((label, i) => ({
      id: `d${i + 1}`,
      type: 'select' as const,
      label,
      dropdown: true,
      options: escala([
        [0, 'Ausente'],
        [1, 'Leve'],
        [2, 'Moderado'],
        [3, 'Grave'],
        [4, 'Muy grave / incapacitante'],
      ]),
    })),
    compute: (v) => {
      const score = sum(v, Array.from({ length: 14 }, (_, i) => `d${i + 1}`))
      return {
        main: String(score),
        mainUnit: 'puntos (0–56)',
        interpretation:
          score < 8
            ? 'Sin ansiedad clínicamente significativa.'
            : score <= 14
              ? 'Ansiedad leve.'
              : score <= 23
                ? 'Ansiedad moderada.'
                : 'Ansiedad grave: valorar tratamiento farmacológico y derivación.',
        level: score < 8 ? 'ok' : score <= 14 ? 'info' : score <= 23 ? 'warn' : 'danger',
      }
    },
    references: [
      'Hamilton M. The assessment of anxiety states by rating. Br J Med Psychol. 1959;32(1):50-5.',
    ],
  },
  {
    id: 'bri',
    name: 'Índice de redondez corporal (BRI)',
    shortName: 'BRI',
    description:
      'Estima el porcentaje de grasa corporal y grasa visceral a partir del perímetro abdominal y la talla.',
    category: CAT_DIABETES,
    specialty: FAM,
    inputs: [
      { id: 'talla', type: 'number', label: 'Talla', unit: 'cm', min: 100, max: 220, step: 0.5 },
      { id: 'cintura', type: 'number', label: 'Perímetro abdominal (a la altura del ombligo)', unit: 'cm', min: 40, max: 200, step: 0.5 },
    ],
    compute: (v) => {
      const talla_m = v.talla! / 100
      const cintura_m = v.cintura! / 100
      const excentricidad2 = 1 - Math.pow(cintura_m / (2 * Math.PI * (talla_m / 2)), 2)
      const bri = 364.2 - 365.5 * Math.sqrt(Math.max(0, excentricidad2))
      const banda =
        bri < 3.41 ? 'muy bajo' : bri < 4.45 ? 'bajo' : bri < 5.46 ? 'medio' : bri < 6.91 ? 'alto' : 'muy alto'
      return {
        main: fmt(bri, 2),
        mainUnit: 'BRI',
        secondary: banda,
        secondaryLabel: 'quintil de riesgo cardiometabólico',
        interpretation:
          banda === 'muy bajo' || banda === 'bajo'
            ? 'Riesgo cardiometabólico bajo según distribución corporal.'
            : banda === 'medio'
              ? 'Riesgo cardiometabólico intermedio.'
              : 'Distribución corporal asociada a mayor riesgo cardiometabólico: valorar intervención sobre hábitos.',
        level: banda === 'muy bajo' || banda === 'bajo' ? 'ok' : banda === 'medio' ? 'warn' : 'danger',
      }
    },
    references: [
      'Thomas DM, et al. Relationships between body roundness with body fat and visceral adipose tissue emerging from a new geometrical model. Obesity (Silver Spring). 2013;21(11):2264-71.',
    ],
  },
  {
    id: 'findrisc',
    name: 'FINDRISC — Riesgo de diabetes tipo 2 a 10 años',
    shortName: 'FINDRISC',
    description: 'Cribado del riesgo de diabetes tipo 2 en 10 años basado en factores clínicos.',
    category: CAT_DIABETES,
    specialty: FAM,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 45 años', value: 0 },
          { label: '45–54 años', value: 2 },
          { label: '55–64 años', value: 3 },
          { label: '> 64 años', value: 4 },
        ],
      },
      {
        id: 'imc',
        type: 'select',
        label: 'Índice de masa corporal',
        options: [
          { label: '< 25 kg/m²', value: 0 },
          { label: '25–30 kg/m²', value: 1 },
          { label: '> 30 kg/m²', value: 3 },
        ],
      },
      {
        id: 'cintura',
        type: 'select',
        label: 'Perímetro abdominal',
        dropdown: true,
        options: [
          { label: 'Varón < 94 cm o mujer < 80 cm', value: 0 },
          { label: 'Varón 94–102 cm o mujer 80–88 cm', value: 3 },
          { label: 'Varón > 102 cm o mujer > 88 cm', value: 4 },
        ],
      },
      { id: 'actividad', type: 'boolean', label: 'Actividad física < 30 min al día', points: 2 },
      {
        id: 'dieta',
        type: 'select',
        label: 'Consumo diario de verduras, frutas u hortalizas',
        options: [
          { label: 'Todos los días', value: 0 },
          { label: 'No todos los días', value: 1 },
        ],
      },
      { id: 'medicacion', type: 'boolean', label: 'Toma medicación para la hipertensión', points: 2 },
      { id: 'glucemia', type: 'boolean', label: 'Antecedente de glucemia alta (embarazo, chequeo, enfermedad)', points: 5 },
      {
        id: 'familia',
        type: 'select',
        label: 'Familiares con diabetes',
        options: [
          { label: 'No', value: 0 },
          { label: 'Abuelos, tíos o primos', value: 3 },
          { label: 'Padres, hermanos o hijos', value: 5 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'imc', 'cintura', 'actividad', 'dieta', 'medicacion', 'glucemia', 'familia'])
      const riesgo =
        score < 7
          ? 'bajo (≈ 1 %)'
          : score < 12
            ? 'ligeramente elevado (≈ 4 %)'
            : score < 15
              ? 'moderado (≈ 17 %)'
              : score < 21
                ? 'alto (≈ 33 %)'
                : 'muy alto (≈ 50 %)'
      return {
        main: String(score),
        mainUnit: 'puntos (0–26)',
        secondary: riesgo,
        secondaryLabel: 'riesgo de diabetes en 10 años',
        interpretation:
          score < 12
            ? 'Riesgo bajo o ligeramente elevado: mantener estilo de vida saludable y reevaluar en 3–5 años.'
            : score < 15
              ? 'Riesgo moderado: intervención sobre estilo de vida y valorar glucemia basal.'
              : 'Riesgo alto o muy alto: glucemia basal y/o HbA1c, intervención intensiva sobre estilo de vida.',
        level: score < 12 ? 'ok' : score < 15 ? 'warn' : 'danger',
      }
    },
    references: [
      'Lindström J, Tuomilehto J. The diabetes risk score. Diabetes Care. 2003;26(3):725-31.',
    ],
  },
  {
    id: 'fli',
    name: 'Fatty Liver Index (FLI)',
    shortName: 'FLI',
    description:
      'Predice la presencia de esteatosis hepática por criterios ecográficos.',
    category: CAT_GASTRO,
    specialty: FAM,
    inputs: [
      { id: 'tg', type: 'number', label: 'Triglicéridos', unit: 'mg/dL', min: 30, max: 1000, step: 1 },
      { id: 'imc', type: 'number', label: 'IMC', unit: 'kg/m²', min: 15, max: 60, step: 0.1 },
      { id: 'ggt', type: 'number', label: 'GGT', unit: 'U/L', min: 5, max: 1500, step: 1 },
      { id: 'cintura', type: 'number', label: 'Perímetro abdominal', unit: 'cm', min: 40, max: 200, step: 0.5 },
    ],
    compute: (v) => {
      const L =
        0.953 * Math.log(v.tg!) +
        0.139 * v.imc! +
        0.718 * Math.log(v.ggt!) +
        0.053 * v.cintura! -
        15.745
      const fli = (Math.exp(L) / (1 + Math.exp(L))) * 100
      return {
        main: fmt(fli, 0),
        mainUnit: 'FLI (0–100)',
        interpretation:
          fli < 30
            ? 'FLI < 30: hígado graso razonablemente descartado (sensibilidad ≈ 87 %).'
            : fli < 60
              ? 'FLI 30–59: no concluyente; interpretar con la clínica y los factores de riesgo metabólicos.'
              : 'FLI ≥ 60: esteatosis hepática altamente probable (especificidad ≈ 86 %). Valorar estudio adicional (elastografía, control metabólico).',
        level: fli < 30 ? 'ok' : fli < 60 ? 'warn' : 'danger',
      }
    },
    references: [
      'Bedogni G, et al. The Fatty Liver Index: a simple and accurate predictor of hepatic steatosis in the general population. BMC Gastroenterol. 2006;6:33.',
    ],
  },
  {
    id: 'cdai',
    name: 'CDAI — Índice de actividad de la enfermedad de Crohn',
    shortName: 'CDAI',
    description: 'Cuantifica la actividad de la enfermedad de Crohn.',
    category: CAT_GASTRO,
    specialty: FAM,
    inputs: [
      { id: 'deposiciones', type: 'number', label: 'Número de deposiciones líquidas o pastosas en 7 días', min: 0, max: 200, step: 1 },
      {
        id: 'dolor',
        type: 'number',
        label: 'Dolor abdominal (suma diaria 0–3, 7 días)',
        description: '0 ninguno · 1 leve · 2 moderado · 3 grave',
        min: 0,
        max: 21,
        step: 1,
      },
      {
        id: 'bienestar',
        type: 'number',
        label: 'Bienestar general (suma diaria 0–4, 7 días)',
        description: '0 bien · 1 regular · 2 mal · 3 muy mal · 4 terrible',
        min: 0,
        max: 28,
        step: 1,
      },
      {
        id: 'complicaciones',
        type: 'number',
        label: 'Número de complicaciones (artritis, iritis/uveítis, eritema/aftas, fisura/fístula, fiebre)',
        min: 0,
        max: 6,
        step: 1,
      },
      { id: 'antidiarreicos', type: 'boolean', label: 'Uso de antidiarreicos' },
      {
        id: 'masa',
        type: 'select',
        label: 'Masa abdominal',
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Dudosa', value: 2 },
          { label: 'Presente', value: 5 },
        ],
      },
      { id: 'hto', type: 'number', label: 'Diferencia del hematocrito respecto al esperado', unit: 'puntos %', min: -20, max: 20, step: 1 },
      { id: 'pesoDif', type: 'number', label: 'Porcentaje de desviación del peso respecto al estándar', unit: '%', min: -50, max: 50, step: 1 },
    ],
    compute: (v) => {
      const score =
        2 * v.deposiciones! +
        5 * v.dolor! +
        7 * v.bienestar! +
        20 * v.complicaciones! +
        30 * (v.antidiarreicos ?? 0) +
        10 * (v.masa ?? 0) +
        6 * v.hto! +
        v.pesoDif!
      return {
        main: fmt(score, 0),
        mainUnit: 'CDAI',
        interpretation:
          score < 150
            ? 'Enfermedad en remisión (< 150).'
            : score < 220
              ? 'Actividad leve (150–219).'
              : score < 450
                ? 'Actividad moderada (220–449).'
                : 'Actividad grave (≥ 450): valorar hospitalización.',
        level: score < 150 ? 'ok' : score < 220 ? 'info' : score < 450 ? 'warn' : 'danger',
      }
    },
    references: [
      'Best WR, et al. Development of a Crohn\'s disease activity index. Gastroenterology. 1976;70(3):439-44.',
    ],
  },
  {
    id: 'ecog',
    name: 'Estado funcional ECOG',
    shortName: 'ECOG',
    description:
      'Cuantifica el estado funcional del paciente oncológico; guía la tolerancia a tratamientos.',
    category: CAT_HEMATO,
    specialty: FAM,
    inputs: [
      {
        id: 'grado',
        type: 'select',
        label: 'Grado ECOG',
        dropdown: true,
        noPoints: true,
        options: [
          { label: '0 — Totalmente activo, sin restricciones', value: 0 },
          { label: '1 — Restringido para actividad física extenuante, ambulatorio', value: 1 },
          { label: '2 — Ambulatorio, autocuidado; no puede trabajar; en pie > 50 % del día', value: 2 },
          { label: '3 — Autocuidado limitado; encamado o en silla > 50 % del día', value: 3 },
          { label: '4 — Completamente incapacitado; encamado o en silla', value: 4 },
          { label: '5 — Fallecido', value: 5 },
        ],
      },
    ],
    compute: (v) => {
      const g = v.grado ?? 0
      return {
        main: `ECOG ${g}`,
        interpretation:
          g <= 1
            ? 'Estado funcional preservado: apto para tratamientos oncológicos habituales.'
            : g === 2
              ? 'Estado funcional intermedio: valorar caso a caso la intensidad del tratamiento.'
              : g === 3
                ? 'Estado funcional muy limitado: en general no se toleran los tratamientos oncológicos activos; priorizar control sintomático.'
                : g === 4
                  ? 'Encamado: tratamiento paliativo y confortable.'
                  : 'Fallecido.',
        level: g <= 1 ? 'ok' : g === 2 ? 'warn' : 'danger',
      }
    },
    notes: ['Equivalencias aproximadas con Karnofsky: ECOG 0 ≈ KPS 100, 1 ≈ 80–90, 2 ≈ 60–70, 3 ≈ 40–50, 4 ≈ 10–30.'],
    references: [
      'Oken MM, et al. Toxicity and response criteria of the Eastern Cooperative Oncology Group. Am J Clin Oncol. 1982;5(6):649-55.',
    ],
  },
  {
    id: 'ganzoni',
    name: 'Ecuación de Ganzoni para el déficit de hierro',
    shortName: 'Ganzoni',
    description: 'Calcula el déficit total de hierro para reposición intravenosa en la anemia ferropénica.',
    category: CAT_HEMATO,
    specialty: FAM,
    inputs: [
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 5, max: 250, step: 0.5 },
      { id: 'hbActual', type: 'number', label: 'Hemoglobina actual', unit: 'g/dL', min: 3, max: 18, step: 0.1 },
      { id: 'hbObjetivo', type: 'number', label: 'Hemoglobina objetivo', unit: 'g/dL', min: 8, max: 16, step: 0.1 },
      {
        id: 'reservas',
        type: 'number',
        label: 'Hierro para reservas',
        unit: 'mg',
        description: '≥ 35 kg: 500 mg. 5–34 kg: 15 mg/kg.',
        min: 0,
        max: 1000,
        step: 10,
      },
    ],
    compute: (v) => {
      if (v.hbObjetivo! <= v.hbActual!)
        return {
          main: '—',
          interpretation: 'La hemoglobina objetivo debe ser mayor que la actual.',
          level: 'warn',
        }
      const deficit = 2.4 * v.peso! * (v.hbObjetivo! - v.hbActual!) + v.reservas!
      return {
        main: fmt(deficit, 0),
        mainUnit: 'mg de hierro',
        interpretation:
          'Dosis total a reponer por vía intravenosa. Repartir según la preparación (carboximaltosa férrica hasta 1.000 mg por sesión; hierro sacarosa 100–200 mg por sesión).',
        level: 'info',
        details: [
          'Fórmula: déficit (mg) = 2,4 × peso (kg) × (Hb objetivo − Hb actual) + hierro para reservas.',
          'En pacientes con peso ≥ 35 kg y hemoglobina objetivo 15 g/dL, reservas = 500 mg. En menor peso, 15 mg/kg.',
        ],
      }
    },
    references: [
      'Ganzoni AM. Intravenous iron-dextran: therapeutic and experimental possibilities. Schweiz Med Wochenschr. 1970;100(7):301-3.',
    ],
  },
  {
    id: 'bova',
    name: 'Puntuación de Bova para embolia pulmonar hemodinámicamente estable',
    shortName: 'Bova',
    description:
      'Estratifica el riesgo de complicaciones a 30 días en pacientes normotensos con embolia pulmonar aguda.',
    category: CAT_TEV,
    specialty: FAM,
    inputs: [
      {
        id: 'pas',
        type: 'select',
        label: 'PA sistólica',
        options: [
          { label: '≥ 110 mmHg', value: 0 },
          { label: '90–109 mmHg', value: 2 },
        ],
      },
      { id: 'fc', type: 'boolean', label: 'Frecuencia cardíaca ≥ 110 lpm' },
      { id: 'troponina', type: 'boolean', label: 'Troponina elevada', points: 2 },
      { id: 'disfuncionVD', type: 'boolean', label: 'Disfunción del ventrículo derecho', points: 2 },
    ],
    compute: (v) => {
      const score = sum(v, ['pas', 'fc', 'troponina', 'disfuncionVD'])
      const stage = score <= 2 ? 'I' : score <= 4 ? 'II' : 'III'
      const riesgo = score <= 2 ? '< 5 %' : score <= 4 ? '≈ 18 %' : '≈ 42 %'
      return {
        main: `Estadio ${stage}`,
        secondary: riesgo,
        secondaryLabel: 'complicaciones a 30 días',
        interpretation:
          stage === 'I'
            ? 'Riesgo bajo: manejo habitual con anticoagulación.'
            : stage === 'II'
              ? 'Riesgo intermedio: vigilancia estrecha, considerar ingreso en cuidados intermedios.'
              : 'Riesgo alto: vigilancia en cuidados intensivos; monitorización de la evolución hemodinámica y considerar reperfusión si aparece inestabilidad.',
        level: stage === 'I' ? 'ok' : stage === 'II' ? 'warn' : 'danger',
      }
    },
    notes: ['Solo aplicable a pacientes con embolia pulmonar aguda y presión arterial sistólica ≥ 90 mmHg al ingreso.'],
    references: [
      'Bova C, et al. Identification of intermediate-risk patients with acute symptomatic pulmonary embolism. Eur Respir J. 2014;44(3):694-703.',
    ],
  },
  {
    id: 'cpis',
    name: 'CPIS — Escala clínica de infección pulmonar (Pugin)',
    shortName: 'CPIS',
    description:
      'Ayuda a diagnosticar la neumonía asociada a la ventilación mecánica.',
    category: CAT_RESPI,
    specialty: FAM,
    inputs: [
      {
        id: 'temperatura',
        type: 'select',
        label: 'Temperatura',
        options: [
          { label: '36,5–38,4 °C', value: 0 },
          { label: '38,5–38,9 °C', value: 1 },
          { label: '≥ 39 o ≤ 36 °C', value: 2 },
        ],
      },
      {
        id: 'leucos',
        type: 'select',
        label: 'Leucocitos (×10³/mm³)',
        options: [
          { label: '4–11', value: 0 },
          { label: '< 4 o > 11', value: 1 },
          { label: '< 4 o > 11 con ≥ 50 % cayados', value: 2 },
        ],
      },
      {
        id: 'secreciones',
        type: 'select',
        label: 'Secreciones traqueales',
        options: [
          { label: 'Ausentes o escasas', value: 0 },
          { label: 'Abundantes no purulentas', value: 1 },
          { label: 'Abundantes purulentas', value: 2 },
        ],
      },
      {
        id: 'pf',
        type: 'select',
        label: 'Oxigenación (PaO₂/FiO₂)',
        options: [
          { label: '> 240 o SDRA presente', value: 0 },
          { label: '≤ 240 sin SDRA', value: 2 },
        ],
      },
      {
        id: 'radiografia',
        type: 'select',
        label: 'Radiografía de tórax',
        options: [
          { label: 'Sin infiltrados', value: 0 },
          { label: 'Infiltrado difuso o parcheado', value: 1 },
          { label: 'Infiltrado localizado', value: 2 },
        ],
      },
      {
        id: 'progresion',
        type: 'select',
        label: 'Progresión del infiltrado',
        options: [
          { label: 'Sin progresión', value: 0 },
          { label: 'Progresión radiológica (excluidos SDRA e ICC)', value: 2 },
        ],
      },
      {
        id: 'cultivo',
        type: 'select',
        label: 'Cultivo de aspirado traqueal',
        options: [
          { label: 'Sin crecimiento significativo', value: 0 },
          { label: 'Crecimiento significativo (positivo)', value: 1 },
          { label: 'Mismo patógeno en tinción de Gram', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['temperatura', 'leucos', 'secreciones', 'pf', 'radiografia', 'progresion', 'cultivo'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–12)',
        interpretation:
          score > 6
            ? 'CPIS > 6: alta probabilidad de neumonía asociada a la ventilación mecánica. Iniciar o mantener antibioterapia empírica y ajustar según cultivos.'
            : 'CPIS ≤ 6: baja probabilidad de neumonía asociada a la ventilación mecánica; reevaluar en 48–72 h.',
        level: score > 6 ? 'danger' : 'ok',
      }
    },
    references: [
      'Pugin J, et al. Diagnosis of ventilator-associated pneumonia by bacteriologic analysis of bronchoscopic and nonbronchoscopic "blind" bronchoalveolar lavage fluid. Am Rev Respir Dis. 1991;143(5):1121-9.',
    ],
  },
  {
    id: 'caspar',
    name: 'Criterios CASPAR para artritis psoriásica',
    shortName: 'CASPAR',
    description: 'Clasifica la artritis psoriásica en pacientes con enfermedad inflamatoria articular.',
    category: CAT_GENERAL,
    specialty: FAM,
    inputs: [
      { id: 'enfermedad', type: 'boolean', label: '¿Presenta enfermedad articular inflamatoria confirmada?', noPoints: true },
      {
        id: 'psoriasis',
        type: 'select',
        label: 'Psoriasis',
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Antecedente personal o familiar (primer o segundo grado)', value: 1 },
          { label: 'Actual', value: 2 },
        ],
      },
      { id: 'ungueal', type: 'boolean', label: 'Alteración ungueal (onicólisis, pitting, hiperqueratosis)' },
      { id: 'fr', type: 'boolean', label: 'Factor reumatoide negativo' },
      { id: 'dactilitis', type: 'boolean', label: 'Dactilitis actual o pasada' },
      { id: 'radiologico', type: 'boolean', label: 'Neoformación ósea yuxtaarticular en la radiografía' },
    ],
    compute: (v) => {
      if (v.enfermedad !== 1)
        return {
          main: 'No aplicable',
          interpretation: 'CASPAR se aplica solo en pacientes con enfermedad articular inflamatoria establecida.',
          level: 'warn',
        }
      const score = sum(v, ['psoriasis', 'ungueal', 'fr', 'dactilitis', 'radiologico'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–6)',
        interpretation:
          score >= 3
            ? 'Cumple criterios CASPAR (≥ 3 puntos): clasifica como artritis psoriásica (sensibilidad ≈ 91 %, especificidad ≈ 99 %).'
            : 'No cumple criterios CASPAR: valorar otros diagnósticos.',
        level: score >= 3 ? 'danger' : 'ok',
      }
    },
    references: [
      'Taylor W, et al. Classification criteria for psoriatic arthritis: development of new criteria from a large international study (CASPAR). Arthritis Rheum. 2006;54(8):2665-73.',
    ],
  },
  {
    id: 'dlcn',
    name: 'Criterios holandeses (DLCN) de hipercolesterolemia familiar',
    shortName: 'DLCN',
    description: 'Diagnostica clínicamente la hipercolesterolemia familiar heterocigota.',
    category: CAT_CARDIO,
    specialty: FAM,
    inputs: [
      {
        id: 'familia',
        type: 'select',
        label: 'Historia familiar',
        dropdown: true,
        options: [
          { label: 'Sin datos relevantes', value: 0 },
          { label: 'Familiar de primer grado con enfermedad coronaria o vascular precoz (< 55 años en varones, < 60 en mujeres) o LDL > 210 mg/dL en adultos, o presencia de xantomas o arco corneal en < 45 años', value: 1 },
          { label: 'Familiar de primer grado < 18 años con LDL > 155 mg/dL', value: 2 },
        ],
      },
      {
        id: 'personal',
        type: 'select',
        label: 'Historia personal',
        options: [
          { label: 'Sin datos relevantes', value: 0 },
          { label: 'Enfermedad coronaria prematura', value: 2 },
          { label: 'Enfermedad vascular prematura (cerebral o periférica)', value: 1 },
        ],
      },
      {
        id: 'examen',
        type: 'select',
        label: 'Exploración física',
        options: [
          { label: 'Sin hallazgos', value: 0 },
          { label: 'Arco corneal < 45 años', value: 4 },
          { label: 'Xantomas tendinosos', value: 6 },
        ],
      },
      {
        id: 'ldl',
        type: 'select',
        label: 'LDL colesterol',
        dropdown: true,
        options: [
          { label: '< 155 mg/dL', value: 0 },
          { label: '155–189 mg/dL', value: 1 },
          { label: '190–249 mg/dL', value: 3 },
          { label: '250–329 mg/dL', value: 5 },
          { label: '≥ 330 mg/dL', value: 8 },
        ],
      },
      { id: 'genetico', type: 'boolean', label: 'Mutación funcional confirmada (LDLR, APOB, PCSK9)', points: 8 },
    ],
    compute: (v) => {
      const score = sum(v, ['familia', 'personal', 'examen', 'ldl', 'genetico'])
      const dx =
        score < 3 ? 'improbable' : score <= 5 ? 'posible' : score <= 8 ? 'probable' : 'definitiva'
      return {
        main: String(score),
        mainUnit: 'puntos',
        secondary: `Hipercolesterolemia familiar ${dx}`,
        interpretation:
          dx === 'improbable'
            ? 'Hipercolesterolemia familiar improbable: control lipídico habitual.'
            : dx === 'posible'
              ? 'Hipercolesterolemia familiar posible: valorar estudio genético y cribado familiar.'
              : 'Diagnóstico probable o definitivo: iniciar estatinas de alta potencia (objetivo LDL < 100 mg/dL o < 70 con enfermedad cardiovascular), estudio genético y cribado familiar en cascada.',
        level: dx === 'improbable' ? 'ok' : dx === 'posible' ? 'warn' : 'danger',
      }
    },
    references: [
      'World Health Organization. Familial hypercholesterolemia: report of a WHO consultation. Ginebra, 1999.',
    ],
  },
  {
    id: 'fleischner',
    name: 'Guías de Fleischner para nódulos pulmonares sólidos (2017)',
    shortName: 'Fleischner',
    description:
      'Recomienda el seguimiento de nódulos pulmonares sólidos hallados incidentalmente en tomografía.',
    category: CAT_RESPI,
    specialty: FAM,
    inputs: [
      {
        id: 'riesgo',
        type: 'select',
        label: 'Riesgo del paciente',
        noPoints: true,
        options: [
          { label: 'Bajo (no fumador, sin factores)', value: 0 },
          { label: 'Alto (fumador, EPOC, exposición asbesto, historia familiar)', value: 1 },
        ],
      },
      {
        id: 'numero',
        type: 'select',
        label: 'Número de nódulos',
        noPoints: true,
        options: [
          { label: 'Único', value: 0 },
          { label: 'Múltiples', value: 1 },
        ],
      },
      { id: 'tamano', type: 'number', label: 'Tamaño del nódulo mayor', unit: 'mm', min: 1, max: 30, step: 0.1 },
    ],
    compute: (v) => {
      const alto = v.riesgo === 1
      const multi = v.numero === 1
      const t = v.tamano!
      let rec: string
      if (t < 6) {
        rec = alto
          ? 'Nódulo < 6 mm en paciente de alto riesgo: TC de control opcional a los 12 meses.'
          : 'Nódulo < 6 mm en paciente de bajo riesgo: no se recomienda seguimiento rutinario.'
      } else if (t <= 8) {
        rec = alto
          ? 'Nódulo 6–8 mm en paciente de alto riesgo: TC de control a los 6–12 meses y considerar a los 18–24 meses.'
          : 'Nódulo 6–8 mm en paciente de bajo riesgo: TC de control a los 6–12 meses y considerar a los 18–24 meses.'
      } else {
        rec = 'Nódulo > 8 mm: considerar TC de control a los 3 meses, PET-TC o biopsia según sospecha clínica.'
      }
      if (multi) rec += ' (Nódulos múltiples: usar el nódulo más sospechoso para orientar el seguimiento.)'
      const level: 'ok' | 'warn' | 'danger' = t < 6 ? 'ok' : t <= 8 ? 'warn' : 'danger'
      return {
        main: `${fmt(t, 1)} mm`,
        interpretation: rec,
        level,
      }
    },
    notes: [
      'Solo para nódulos sólidos ≥ 6 mm de forma sistemática; los subsólidos tienen su propio algoritmo.',
      'No aplicable a pacientes < 35 años ni a pacientes inmunodeprimidos u oncológicos, en los que la conducta es individualizada.',
    ],
    references: [
      'MacMahon H, et al. Guidelines for Management of Incidental Pulmonary Nodules Detected on CT Images: From the Fleischner Society 2017. Radiology. 2017;284(1):228-43.',
    ],
  },
  {
    id: 'ottawa-tia',
    name: 'Ottawa TIA — Riesgo de ictus tras AIT',
    shortName: 'Ottawa TIA',
    description: 'Regla canadiense de decisión para estimar el riesgo de ictus a 7 días tras un AIT.',
    category: 'Neurología crítica e ictus',
    specialty: FAM,
    inputs: [
      { id: 'primer', type: 'boolean', label: 'Primer episodio de AIT en la vida', points: 2 },
      { id: 'sintomas', type: 'boolean', label: 'Síntomas > 10 minutos', points: 2 },
      { id: 'aterotrombosis', type: 'boolean', label: 'Antecedente de arteriopatía carotídea', points: 2 },
      { id: 'antiagregante', type: 'boolean', label: 'Ya recibía antiagregante en el momento del AIT', points: 3 },
      { id: 'debilidad', type: 'boolean', label: 'Debilidad focal', points: 2 },
      { id: 'lenguaje', type: 'boolean', label: 'Alteración del lenguaje', points: 1 },
      {
        id: 'duracion',
        type: 'select',
        label: 'Duración de los síntomas',
        options: [
          { label: '< 10 min', value: 0 },
          { label: '10–59 min', value: 1 },
          { label: '≥ 60 min', value: 2 },
        ],
      },
      { id: 'fa', type: 'boolean', label: 'Fibrilación auricular en el ECG', points: 2 },
      { id: 'isquemia', type: 'boolean', label: 'Signos de isquemia en el ECG', points: 2 },
      {
        id: 'glucosa',
        type: 'boolean',
        label: 'Glucemia ≥ 265 mg/dL',
        points: 3,
      },
      { id: 'plaquetas', type: 'boolean', label: 'Plaquetas ≥ 400 ×10⁹/L', points: 2 },
      { id: 'leucocitos', type: 'boolean', label: 'Leucocitos ≥ 10 ×10⁹/L', points: 2 },
    ],
    compute: (v) => {
      const score = sum(v, ['primer', 'sintomas', 'aterotrombosis', 'antiagregante', 'debilidad', 'lenguaje', 'duracion', 'fa', 'isquemia', 'glucosa', 'plaquetas', 'leucocitos'])
      const riesgo = score <= 3 ? 'bajo (< 1 %)' : score <= 8 ? 'intermedio (≈ 4 %)' : 'alto (≈ 10 %)'
      return {
        main: String(score),
        mainUnit: 'puntos (0–23)',
        secondary: riesgo,
        secondaryLabel: 'riesgo de ictus a 7 días',
        interpretation:
          score <= 3
            ? 'Riesgo bajo: estudio ambulatorio urgente en las primeras 48 h con neuroimagen, estudio vascular, ECG y ecocardiograma según protocolo.'
            : score <= 8
              ? 'Riesgo intermedio: valoración rápida; algunos centros ingresan para estudio si no hay unidad ambulatorio urgente.'
              : 'Riesgo alto: ingreso hospitalario para estudio completo y tratamiento antiagregante precoz.',
        level: score <= 3 ? 'ok' : score <= 8 ? 'warn' : 'danger',
      }
    },
    notes: ['Todos los pacientes con AIT deben iniciar antiagregación (AAS o clopidogrel) y prevención secundaria intensiva.'],
    references: [
      'Perry JJ, et al. A prospective cohort study of patients with transient ischemic attack to identify high-risk clinical characteristics. Stroke. 2014;45(1):92-100.',
    ],
  },
  {
    id: 'peptido-c',
    name: 'Cociente péptido C / glucosa',
    shortName: 'Péptido C / glucosa',
    description:
      'Evalúa la función residual de las células beta pancreáticas; útil para diferenciar diabetes tipo 1 de tipo 2.',
    category: CAT_DIABETES,
    specialty: FAM,
    inputs: [
      { id: 'peptido', type: 'number', label: 'Péptido C sérico', unit: 'ng/mL', min: 0, max: 20, step: 0.01 },
      { id: 'glucemia', type: 'number', label: 'Glucemia simultánea', unit: 'mg/dL', min: 30, max: 800, step: 1 },
    ],
    compute: (v) => {
      const glucoseMmol = v.glucemia! / 18
      const peptidoNmol = v.peptido! * 0.331
      const cociente = peptidoNmol / glucoseMmol
      return {
        main: fmt(cociente, 3),
        mainUnit: 'nmol/mmol',
        interpretation:
          cociente < 0.2
            ? 'Función beta muy reducida (< 0,2): compatible con diabetes tipo 1 o insulinodependencia establecida.'
            : cociente < 0.6
              ? 'Función beta intermedia (0,2–0,6): posible LADA o diabetes tipo 2 avanzada.'
              : 'Función beta preservada (≥ 0,6): sugiere diabetes tipo 2, MODY o alteración de la sensibilidad a la insulina.',
        level: cociente < 0.2 ? 'danger' : cociente < 0.6 ? 'warn' : 'ok',
        details: ['Conversión: péptido C 1 ng/mL ≈ 0,331 nmol/L; glucemia 1 mmol/L = 18 mg/dL.'],
      }
    },
    notes: ['Ideal en muestra postprandial o tras estímulo con comida mixta; los valores en ayunas pueden infraestimar la reserva beta.'],
    references: [
      'Jones AG, Hattersley AT. The clinical utility of C-peptide measurement in the care of patients with diabetes. Diabet Med. 2013;30(7):803-17.',
    ],
  },
  {
    id: 'delta-p',
    name: 'Puntuación DELTA-P para Lambert-Eaton',
    shortName: 'DELTA-P',
    description:
      'Estima el riesgo de cáncer de pulmón microcítico en pacientes con síndrome miasténico de Lambert-Eaton.',
    category: CAT_HEMATO,
    specialty: FAM,
    inputs: [
      { id: 'perdidaPeso', type: 'boolean', label: 'Pérdida de peso reciente' },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 50 años al inicio de los síntomas' },
      { id: 'tabaco', type: 'boolean', label: 'Tabaquismo (activo o significativo previo)' },
      { id: 'disfuncion', type: 'boolean', label: 'Disfunción bulbar' },
      { id: 'ereccion', type: 'boolean', label: 'Disfunción eréctil (en varones)' },
      { id: 'karnofsky', type: 'boolean', label: 'Karnofsky < 70 al inicio' },
    ],
    compute: (v) => {
      const score = sum(v, ['perdidaPeso', 'edad', 'tabaco', 'disfuncion', 'ereccion', 'karnofsky'])
      const riesgo = ['2,6 %', '4,7 %', '8,3 %', '18,2 %', '46,1 %', '83,9 %', '96,6 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–6)',
        secondary: riesgo,
        secondaryLabel: 'probabilidad de carcinoma microcítico',
        interpretation:
          score <= 1
            ? 'Riesgo bajo: seguimiento habitual con tomografía de tórax.'
            : score <= 3
              ? 'Riesgo intermedio: intensificar el cribado (TC y PET-TC).'
              : 'Riesgo alto: cribado oncológico intensivo (PET-TC) y repetir en 3–6 meses si es negativo.',
        level: score <= 1 ? 'ok' : score <= 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Titulaer MJ, et al. Screening for tumours in paraneoplastic syndromes: report of an EFNS task force. Eur J Neurol. 2011;18(1):19-e3.',
    ],
  },
]
