import type { Calculator, Option } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT_HEM = 'Hematología y oncología'
const CAT_TRAUMA = 'Trauma y quemados'
const UCI = ['Medicina Intensiva']

const escala = (items: [number, string][]): Option[] =>
  items.map(([value, label]) => ({ label: `${value} — ${label}`, value }))

export const hematoTrauma: Calculator[] = [
  {
    id: '4ts',
    name: 'Puntuación 4T para la trombopenia inducida por heparina',
    shortName: '4Ts',
    description:
      'Estima la probabilidad de que una trombopenia esté causada por heparina antes de las pruebas de laboratorio.',
    category: CAT_HEM,
    specialty: UCI,
    inputs: [
      {
        id: 'trombopenia',
        type: 'select',
        label: 'Trombopenia (magnitud)',
        dropdown: true,
        options: escala([
          [2, 'Descenso > 50 % y nadir ≥ 20 ×10⁹/L'],
          [1, 'Descenso del 30–50 %, o nadir de 10–19 ×10⁹/L'],
          [0, 'Descenso < 30 %, o nadir < 10 ×10⁹/L'],
        ]),
      },
      {
        id: 'tiempo',
        type: 'select',
        label: 'Momento de aparición',
        dropdown: true,
        options: escala([
          [2, 'Días 5–10 tras el inicio, o ≤ 1 día si hubo exposición a heparina en los últimos 30 días'],
          [1, 'Compatible con días 5–10 pero no documentado, o inicio tras el día 10, o ≤ 1 día con exposición hace 30–100 días'],
          [0, 'Descenso antes del día 4 sin exposición reciente'],
        ]),
      },
      {
        id: 'trombosis',
        type: 'select',
        label: 'Trombosis u otras secuelas',
        dropdown: true,
        options: escala([
          [2, 'Trombosis confirmada nueva, necrosis cutánea o reacción sistémica aguda tras un bolo de heparina'],
          [1, 'Trombosis recurrente o progresiva, lesiones cutáneas no necrosantes, o sospecha de trombosis no confirmada'],
          [0, 'Ninguna'],
        ]),
      },
      {
        id: 'otras',
        type: 'select',
        label: 'Otras causas de trombopenia',
        dropdown: true,
        options: escala([
          [2, 'Ninguna aparente'],
          [1, 'Posible otra causa'],
          [0, 'Otra causa evidente'],
        ]),
      },
    ],
    compute: (v) => {
      const score = sum(v, ['trombopenia', 'tiempo', 'trombosis', 'otras'])
      const banda = score <= 3 ? 'baja' : score <= 5 ? 'intermedia' : 'alta'
      const prob = score <= 3 ? '< 5 %' : score <= 5 ? '≈ 14 %' : '≈ 64 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–8)',
        secondary: prob,
        secondaryLabel: 'probabilidad de trombopenia por heparina',
        interpretation:
          banda === 'baja'
            ? 'Probabilidad baja: el valor predictivo negativo es muy alto; en general no se requieren pruebas de anticuerpos ni suspender la heparina.'
            : 'Probabilidad intermedia o alta: suspender toda heparina (incluidos los lavados de catéter), iniciar un anticoagulante alternativo no heparínico y solicitar anticuerpos anti-PF4 con prueba funcional confirmatoria. No transfundir plaquetas de forma profiláctica ni iniciar warfarina hasta la recuperación plaquetaria.',
        level: banda === 'baja' ? 'ok' : banda === 'intermedia' ? 'warn' : 'danger',
      }
    },
    references: [
      'Lo GK, et al. Evaluation of pretest clinical score (4 T’s) for the diagnosis of heparin-induced thrombocytopenia. J Thromb Haemost. 2006;4(4):759-65.',
    ],
  },
  {
    id: 'neutrofilos-linfocitos',
    name: 'Recuento absoluto de neutrófilos, linfocitos e índice neutrófilos/linfocitos',
    shortName: 'RAN / RAL / NLR',
    description:
      'Calcula el recuento absoluto de neutrófilos y linfocitos y el índice neutrófilos/linfocitos.',
    category: CAT_HEM,
    specialty: UCI,
    inputs: [
      { id: 'leucocitos', type: 'number', label: 'Leucocitos totales', unit: '×10³/µL', min: 0.01, max: 200, step: 0.01 },
      { id: 'neutrofilos', type: 'number', label: 'Neutrófilos segmentados', unit: '%', min: 0, max: 100, step: 0.1 },
      { id: 'cayados', type: 'number', label: 'Cayados (bandas)', unit: '%', min: 0, max: 100, step: 0.1 },
      { id: 'linfocitos', type: 'number', label: 'Linfocitos', unit: '%', min: 0, max: 100, step: 0.1 },
    ],
    compute: (v) => {
      const ran = v.leucocitos! * ((v.neutrofilos! + v.cayados!) / 100) * 1000
      const ral = v.leucocitos! * (v.linfocitos! / 100) * 1000
      const nlr = ral > 0 ? ran / ral : 0
      const cd4 = ral > 2000 ? '> 500 (probable)' : ral < 1000 ? '< 200 (posible)' : 'indeterminado'
      return {
        main: fmt(ran, 0),
        mainUnit: 'neutrófilos/µL',
        secondary: fmt(nlr, 2),
        secondaryLabel: 'índice neutrófilos/linfocitos',
        interpretation:
          ran < 500
            ? 'Neutropenia grave (< 500/µL): riesgo alto de infección. Ante fiebre, antibioterapia empírica de amplio espectro sin demora.'
            : ran < 1000
              ? 'Neutropenia moderada (500–1.000/µL): precaución ante la fiebre.'
              : ran < 1500
                ? 'Neutropenia leve (1.000–1.500/µL).'
                : 'Recuento de neutrófilos dentro del rango habitual.',
        level: ran < 500 ? 'danger' : ran < 1500 ? 'warn' : 'ok',
        details: [
          `Linfocitos absolutos: ${fmt(ral, 0)}/µL (predicción de CD4: ${cd4}).`,
          'Un índice neutrófilos/linfocitos elevado (> 3–5) se asocia a inflamación sistémica y peor pronóstico en múltiples enfermedades, pero no es específico.',
        ],
      }
    },
    notes: ['RAN = leucocitos × (neutrófilos % + cayados %) / 100.'],
  },
  {
    id: 'mascc',
    name: 'Índice MASCC para la neutropenia febril',
    shortName: 'MASCC',
    description:
      'Identifica a los pacientes con neutropenia febril de bajo riesgo de complicaciones graves.',
    category: CAT_HEM,
    specialty: UCI,
    inputs: [
      {
        id: 'sintomas',
        type: 'select',
        label: 'Gravedad de los síntomas',
        dropdown: true,
        options: [
          { label: 'Sin síntomas o síntomas leves', value: 5 },
          { label: 'Síntomas moderados', value: 3 },
          { label: 'Síntomas graves o moribundo', value: 0 },
        ],
      },
      { id: 'hipotension', type: 'boolean', label: 'Sin hipotensión (PA sistólica > 90 mmHg)', points: 5 },
      { id: 'epoc', type: 'boolean', label: 'Sin enfermedad pulmonar obstructiva crónica', points: 4 },
      {
        id: 'tumor',
        type: 'boolean',
        label: 'Tumor sólido, o neoplasia hematológica sin infección fúngica previa',
        points: 4,
      },
      { id: 'deshidratacion', type: 'boolean', label: 'Sin deshidratación que requiera fluidos intravenosos', points: 3 },
      { id: 'ambulatorio', type: 'boolean', label: 'Paciente ambulatorio al inicio de la fiebre', points: 3 },
      { id: 'edad', type: 'boolean', label: 'Edad < 60 años', points: 2 },
    ],
    compute: (v) => {
      const score = sum(v, ['sintomas', 'hipotension', 'epoc', 'tumor', 'deshidratacion', 'ambulatorio', 'edad'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–26)',
        interpretation:
          score >= 21
            ? 'MASCC ≥ 21: bajo riesgo de complicaciones graves. Puede valorarse tratamiento oral o ambulatorio en pacientes seleccionados, con acceso rápido al hospital y buen soporte social.'
            : 'MASCC < 21: alto riesgo de complicaciones. Ingreso hospitalario con antibioterapia intravenosa de amplio espectro.',
        level: score >= 21 ? 'ok' : 'danger',
      }
    },
    notes: ['Los puntos por «síntomas moderados» y «leves» no se suman entre sí: solo se elige una categoría.'],
    references: [
      'Klastersky J, et al. The Multinational Association for Supportive Care in Cancer risk index. J Clin Oncol. 2000;18(16):3038-51.',
    ],
  },
  {
    id: 'cisne',
    name: 'Índice CISNE para la neutropenia febril estable',
    shortName: 'CISNE',
    description:
      'Identifica a los pacientes con neutropenia febril clínicamente estable y tumor sólido que tienen bajo riesgo de complicaciones.',
    category: CAT_HEM,
    specialty: UCI,
    inputs: [
      { id: 'ecog', type: 'boolean', label: 'ECOG ≥ 2', points: 2 },
      { id: 'epoc', type: 'boolean', label: 'Enfermedad pulmonar obstructiva crónica' },
      { id: 'cardiovascular', type: 'boolean', label: 'Enfermedad cardiovascular crónica' },
      { id: 'mucositis', type: 'boolean', label: 'Mucositis de grado ≥ 2 (NCI)' },
      { id: 'monocitos', type: 'boolean', label: 'Monocitos < 200/µL' },
      { id: 'hiperglucemia', type: 'boolean', label: 'Hiperglucemia por estrés (> 121 mg/dL)', points: 2 },
    ],
    compute: (v) => {
      const score = sum(v, ['ecog', 'epoc', 'cardiovascular', 'mucositis', 'monocitos', 'hiperglucemia'])
      const banda = score === 0 ? 'bajo' : score <= 2 ? 'intermedio' : 'alto'
      const comp = score === 0 ? '1,1 %' : score <= 2 ? '6,2 %' : '36 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–8)',
        secondary: comp,
        secondaryLabel: 'riesgo de complicaciones',
        interpretation:
          banda === 'bajo'
            ? 'Riesgo bajo (0 puntos): puede valorarse el manejo ambulatorio con antibioterapia oral.'
            : banda === 'intermedio'
              ? 'Riesgo intermedio (1–2): se recomienda observación hospitalaria inicial.'
              : 'Riesgo alto (≥ 3): ingreso con antibioterapia intravenosa y vigilancia estrecha.',
        level: banda === 'bajo' ? 'ok' : banda === 'intermedio' ? 'warn' : 'danger',
      }
    },
    notes: ['Solo aplicable a pacientes con tumores sólidos y aparentemente estables; no usar en neoplasias hematológicas ni en pacientes inestables.'],
    references: [
      'Carmona-Bayonas A, et al. Prediction of serious complications in patients with seemingly stable febrile neutropenia: validation of the Clinical Index of Stable Febrile Neutropenia. J Clin Oncol. 2015;33(5):465-71.',
    ],
  },
  {
    id: 'crs',
    name: 'Clasificación del síndrome de liberación de citocinas (ASTCT)',
    shortName: 'CRS',
    description:
      'Gradúa la gravedad del síndrome de liberación de citocinas en pacientes tratados con inmunoterapia celular.',
    category: CAT_HEM,
    specialty: UCI,
    inputs: [
      { id: 'fiebre', type: 'boolean', label: 'Temperatura ≥ 38 °C', noPoints: true },
      {
        id: 'hipotension',
        type: 'select',
        label: 'Hipotensión',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Responde a fluidos, sin vasopresores', value: 1 },
          { label: 'Requiere un vasopresor (con o sin vasopresina)', value: 2 },
          { label: 'Requiere varios vasopresores (excluida la vasopresina)', value: 3 },
        ],
      },
      {
        id: 'hipoxia',
        type: 'select',
        label: 'Hipoxia',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Requiere gafas nasales de bajo flujo (≤ 6 L/min) o mascarilla', value: 1 },
          { label: 'Requiere alto flujo (> 6 L/min), mascarilla con reservorio o Venturi', value: 2 },
          { label: 'Requiere presión positiva (CPAP, BiPAP o intubación)', value: 3 },
        ],
      },
    ],
    compute: (v) => {
      if (v.fiebre !== 1)
        return {
          main: 'Sin CRS',
          interpretation: 'La fiebre ≥ 38 °C es requisito para el grado 1. Sin fiebre no se clasifica como síndrome de liberación de citocinas (salvo si ya recibe antipiréticos o tratamiento específico).',
          level: 'ok',
        }
      const hipo = v.hipotension ?? 0
      const hipox = v.hipoxia ?? 0
      const grado = Math.max(1, hipo === 3 || hipox === 3 ? 4 : hipo === 2 || hipox === 2 ? 3 : hipo === 1 || hipox === 1 ? 2 : 1)
      return {
        main: `Grado ${grado}`,
        interpretation: [
          '',
          'Grado 1: solo fiebre. Tratamiento sintomático, cultivos y vigilancia; valorar antibioterapia empírica por la dificultad para distinguirlo de la sepsis.',
          'Grado 2: fiebre con hipotensión que responde a fluidos o hipoxia con oxígeno de bajo flujo. Se recomienda tocilizumab, con o sin corticoides.',
          'Grado 3: requiere un vasopresor o alto flujo de oxígeno. Tocilizumab y corticoides; traslado a cuidados intensivos.',
          'Grado 4: requiere varios vasopresores o soporte ventilatorio con presión positiva. Manejo en cuidados intensivos con corticoides a dosis altas y tocilizumab.',
        ][grado],
        level: grado <= 1 ? 'warn' : 'danger',
        details: ['El grado lo determina el componente (hipotensión o hipoxia) más grave.'],
      }
    },
    references: [
      'Lee DW, et al. ASTCT Consensus Grading for Cytokine Release Syndrome and Neurologic Toxicity Associated with Immune Effector Cells. Biol Blood Marrow Transplant. 2019;25(4):625-38.',
    ],
  },
  {
    id: 'ice-icans',
    name: 'Puntuación ICE y clasificación ICANS',
    shortName: 'ICE / ICANS',
    description:
      'Evalúa la neurotoxicidad asociada a las terapias con células efectoras inmunitarias (células CAR-T).',
    category: CAT_HEM,
    specialty: UCI,
    inputs: [
      {
        id: 'orientacion',
        type: 'select',
        label: 'Orientación (año, mes, ciudad, hospital)',
        options: escala([
          [4, '4 aciertos'],
          [3, '3 aciertos'],
          [2, '2 aciertos'],
          [1, '1 acierto'],
          [0, 'Ninguno'],
        ]),
        default: 4,
      },
      {
        id: 'denominacion',
        type: 'select',
        label: 'Denominación de 3 objetos',
        options: escala([
          [3, '3 objetos'],
          [2, '2 objetos'],
          [1, '1 objeto'],
          [0, 'Ninguno'],
        ]),
        default: 3,
      },
      {
        id: 'ordenes',
        type: 'select',
        label: 'Seguir órdenes sencillas',
        options: escala([
          [1, 'Capaz'],
          [0, 'Incapaz'],
        ]),
        default: 1,
      },
      {
        id: 'escritura',
        type: 'select',
        label: 'Escribir una frase estándar',
        options: escala([
          [1, 'Capaz'],
          [0, 'Incapaz'],
        ]),
        default: 1,
      },
      {
        id: 'atencion',
        type: 'select',
        label: 'Atención (contar hacia atrás de 10 en 10 desde 100)',
        options: escala([
          [1, 'Capaz'],
          [0, 'Incapaz'],
        ]),
        default: 1,
      },
      {
        id: 'conciencia',
        type: 'select',
        label: 'Nivel de conciencia',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Despierto y alerta', value: 0 },
          { label: 'Despierta espontáneamente', value: 1 },
          { label: 'Despierta solo con estímulo táctil', value: 2 },
          { label: 'Despierta solo con estímulo intenso o repetido', value: 3 },
          { label: 'No despierta o requiere estímulo vigoroso', value: 4 },
        ],
      },
      {
        id: 'convulsiones',
        type: 'select',
        label: 'Convulsiones',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Ninguna', value: 0 },
          { label: 'Crisis focal o generalizada que resuelve rápidamente, o actividad no convulsiva en el EEG que responde al tratamiento', value: 3 },
          { label: 'Crisis prolongada (> 5 min) o crisis repetidas sin recuperación entre ellas', value: 4 },
        ],
      },
      {
        id: 'motor',
        type: 'select',
        label: 'Hallazgos motores',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Ninguno', value: 0 },
          { label: 'Debilidad motora focal profunda (hemiparesia o paraparesia)', value: 4 },
        ],
      },
      {
        id: 'edema',
        type: 'select',
        label: 'Edema cerebral / hipertensión intracraneal',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Edema cerebral focal o local en la neuroimagen', value: 3 },
          { label: 'Edema cerebral difuso, postura de descerebración o decorticación, parálisis del VI par o papiledema', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const ice = sum(v, ['orientacion', 'denominacion', 'ordenes', 'escritura', 'atencion'])
      const porIce = ice === 10 ? 0 : ice >= 7 ? 1 : ice >= 3 ? 2 : ice >= 1 ? 3 : 4
      const grado = Math.max(porIce, v.conciencia ?? 0, v.convulsiones ?? 0, v.motor ?? 0, v.edema ?? 0)
      return {
        main: grado === 0 ? 'Sin ICANS' : `ICANS grado ${grado}`,
        secondary: String(ice),
        secondaryLabel: 'puntuación ICE (0–10)',
        interpretation: [
          'Sin datos de neurotoxicidad en este momento; repetir la evaluación al menos dos veces al día durante el período de riesgo.',
          'Grado 1: neurotoxicidad leve. Vigilancia estrecha, evitar sedantes, valorar EEG y neuroimagen.',
          'Grado 2: se recomienda dexametasona y monitorización continua; valorar traslado a cuidados intensivos.',
          'Grado 3: corticoides a dosis altas, ingreso en cuidados intensivos, EEG y neuroimagen.',
          'Grado 4: soporte vital avanzado, corticoides a dosis altas y manejo de la hipertensión intracraneal.',
        ][grado],
        level: grado === 0 ? 'ok' : grado <= 2 ? 'warn' : 'danger',
        details: [
          `Grado derivado de la puntuación ICE: ${porIce}.`,
          'El grado final es el más alto de todos los dominios evaluados.',
          'Un paciente que no despierta y no puede realizar la evaluación ICE tiene 0 puntos y corresponde a grado 3 o 4 según el nivel de conciencia.',
        ],
      }
    },
    references: [
      'Lee DW, et al. ASTCT Consensus Grading for Cytokine Release Syndrome and Neurologic Toxicity Associated with Immune Effector Cells. Biol Blood Marrow Transplant. 2019;25(4):625-38.',
    ],
  },
  {
    id: 'hscore',
    name: 'HScore para el síndrome hemofagocítico reactivo',
    shortName: 'HScore',
    description: 'Estima la probabilidad de linfohistiocitosis hemofagocítica secundaria.',
    category: CAT_HEM,
    specialty: UCI,
    inputs: [
      {
        id: 'inmunodepresion',
        type: 'select',
        label: 'Inmunodepresión conocida',
        description: 'VIH o tratamiento inmunosupresor prolongado.',
        options: [
          { label: 'No', value: 0 },
          { label: 'Sí', value: 18 },
        ],
      },
      {
        id: 'temperatura',
        type: 'select',
        label: 'Temperatura máxima',
        dropdown: true,
        options: [
          { label: '< 38,4 °C', value: 0 },
          { label: '38,4–39,4 °C', value: 33 },
          { label: '> 39,4 °C', value: 49 },
        ],
      },
      {
        id: 'organomegalia',
        type: 'select',
        label: 'Organomegalia',
        dropdown: true,
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Hepatomegalia o esplenomegalia', value: 23 },
          { label: 'Hepatomegalia y esplenomegalia', value: 38 },
        ],
      },
      {
        id: 'citopenias',
        type: 'select',
        label: 'Número de citopenias',
        description: 'Hb ≤ 9,2 g/dL, leucocitos ≤ 5.000/mm³, plaquetas ≤ 110.000/mm³.',
        dropdown: true,
        options: [
          { label: 'Una línea', value: 0 },
          { label: 'Dos líneas', value: 24 },
          { label: 'Tres líneas', value: 34 },
        ],
      },
      {
        id: 'ferritina',
        type: 'select',
        label: 'Ferritina',
        dropdown: true,
        options: [
          { label: '< 2.000 ng/mL', value: 0 },
          { label: '2.000–6.000 ng/mL', value: 35 },
          { label: '> 6.000 ng/mL', value: 50 },
        ],
      },
      {
        id: 'trigliceridos',
        type: 'select',
        label: 'Triglicéridos',
        dropdown: true,
        options: [
          { label: '< 132,7 mg/dL', value: 0 },
          { label: '132,7–354 mg/dL', value: 44 },
          { label: '> 354 mg/dL', value: 64 },
        ],
      },
      {
        id: 'fibrinogeno',
        type: 'select',
        label: 'Fibrinógeno',
        options: [
          { label: '> 250 mg/dL', value: 0 },
          { label: '≤ 250 mg/dL', value: 30 },
        ],
      },
      {
        id: 'ast',
        type: 'select',
        label: 'AST (GOT)',
        options: [
          { label: '< 30 U/L', value: 0 },
          { label: '≥ 30 U/L', value: 19 },
        ],
      },
      {
        id: 'hemofagocitosis',
        type: 'select',
        label: 'Hemofagocitosis en el aspirado medular',
        options: [
          { label: 'No', value: 0 },
          { label: 'Sí', value: 35 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['inmunodepresion', 'temperatura', 'organomegalia', 'citopenias', 'ferritina', 'trigliceridos', 'fibrinogeno', 'ast', 'hemofagocitosis'])
      const prob = score < 90 ? '< 1 %' : score < 169 ? 'intermedia' : '> 99 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–337)',
        secondary: prob,
        secondaryLabel: 'probabilidad de síndrome hemofagocítico',
        interpretation:
          score >= 169
            ? 'HScore ≥ 169: alta probabilidad de linfohistiocitosis hemofagocítica (sensibilidad 93 %, especificidad 86 %). Iniciar estudio y tratamiento urgentes junto con hematología.'
            : score < 90
              ? 'Probabilidad muy baja.'
              : 'Probabilidad intermedia: repetir determinaciones (ferritina, triglicéridos, fibrinógeno) y valorar aspirado medular.',
        level: score >= 169 ? 'danger' : score < 90 ? 'ok' : 'warn',
      }
    },
    references: [
      'Fardet L, et al. Development and validation of the HScore, a score for the diagnosis of reactive hemophagocytic syndrome. Arthritis Rheumatol. 2014;66(9):2613-20.',
    ],
  },
  {
    id: 'volumen-sanguineo',
    name: 'Volumen sanguíneo total, eritrocitario y plasmático',
    shortName: 'Volumen sanguíneo',
    description: 'Calcula el volumen sanguíneo total y sus componentes.',
    category: CAT_HEM,
    specialty: UCI,
    inputs: [
      {
        id: 'poblacion',
        type: 'select',
        label: 'Grupo de paciente',
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
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 0.3, max: 300, step: 0.1 },
      { id: 'hto', type: 'number', label: 'Hematocrito', unit: '%', min: 5, max: 70, step: 0.1 },
    ],
    compute: (v) => {
      const total = (v.poblacion ?? 75) * v.peso!
      const eritro = total * (v.hto! / 100)
      const plasma = total - eritro
      return {
        main: fmt(total, 0),
        mainUnit: 'mL de volumen sanguíneo total',
        secondary: fmt(eritro, 0),
        secondaryLabel: 'mL de volumen eritrocitario',
        interpretation:
          'Útil para calcular pérdidas admisibles, dosis de transfusión y volúmenes de recambio plasmático.',
        level: 'info',
        details: [`Volumen plasmático: ${fmt(plasma, 0)} mL.`],
      }
    },
  },
  {
    id: 'crioprecipitado',
    name: 'Dosis de crioprecipitado para reponer fibrinógeno',
    shortName: 'Crioprecipitado',
    description: 'Estima las unidades de crioprecipitado necesarias para alcanzar un fibrinógeno objetivo.',
    category: CAT_HEM,
    specialty: UCI,
    inputs: [
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 1, max: 250, step: 0.5 },
      { id: 'hto', type: 'number', label: 'Hematocrito', unit: '%', min: 5, max: 70, step: 0.1 },
      { id: 'actual', type: 'number', label: 'Fibrinógeno actual', unit: 'mg/dL', min: 0, max: 800, step: 1 },
      { id: 'objetivo', type: 'number', label: 'Fibrinógeno objetivo', unit: 'mg/dL', min: 50, max: 800, step: 1 },
      { id: 'contenido', type: 'number', label: 'Fibrinógeno por unidad', unit: 'mg', min: 100, max: 500, step: 10 },
    ],
    compute: (v) => {
      if (v.objetivo! <= v.actual!)
        return {
          main: '—',
          interpretation: 'El fibrinógeno objetivo debe ser mayor que el actual.',
          level: 'warn',
        }
      const volumenSangre = 70 * v.peso!
      const volumenPlasma = volumenSangre * (1 - v.hto! / 100)
      const mgNecesarios = ((v.objetivo! - v.actual!) * volumenPlasma) / 100
      const unidades = Math.ceil(mgNecesarios / v.contenido!)
      return {
        main: String(unidades),
        mainUnit: unidades === 1 ? 'unidad' : 'unidades',
        secondary: fmt(mgNecesarios, 0),
        secondaryLabel: 'mg de fibrinógeno necesarios',
        interpretation:
          'Dosis orientativa. En la hemorragia masiva se prefiere con frecuencia el concentrado de fibrinógeno, guiado por tromboelastografía o tromboelastometría cuando se dispone de ellas. Objetivo habitual: > 150–200 mg/dL (> 200 en la hemorragia obstétrica).',
        level: 'info',
        details: [
          `Volumen plasmático estimado: ${fmt(volumenPlasma, 0)} mL.`,
          'El contenido real por unidad varía; consultar la ficha del banco de sangre (habitualmente 150–250 mg).',
        ],
      }
    },
  },
  {
    id: 'iss',
    name: 'Puntuación de gravedad de las lesiones (ISS)',
    shortName: 'ISS',
    description:
      'Estandariza la gravedad del politraumatismo a partir de la escala abreviada de lesiones (AIS) por regiones corporales.',
    category: CAT_TRAUMA,
    specialty: UCI,
    inputs: (
      [
        ['cabeza', 'Cabeza y cuello'],
        ['cara', 'Cara'],
        ['torax', 'Tórax'],
        ['abdomen', 'Abdomen y contenido pélvico'],
        ['extremidades', 'Extremidades y cintura pélvica'],
        ['externa', 'Superficie externa (piel)'],
      ] as [string, string][]
    ).map(([id, label]) => ({
      id,
      type: 'select' as const,
      label,
      dropdown: true,
      options: escala([
        [0, 'Sin lesión'],
        [1, 'AIS 1 — leve'],
        [2, 'AIS 2 — moderada'],
        [3, 'AIS 3 — grave, no amenaza la vida'],
        [4, 'AIS 4 — grave, amenaza la vida'],
        [5, 'AIS 5 — crítica, supervivencia incierta'],
        [6, 'AIS 6 — máxima, lesión no superviviente'],
      ]),
    })),
    compute: (v) => {
      const ids = ['cabeza', 'cara', 'torax', 'abdomen', 'extremidades', 'externa']
      const valores = ids.map((id) => v[id] ?? 0)
      if (valores.some((x) => x === 6))
        return {
          main: '75',
          mainUnit: 'puntos (máximo)',
          interpretation:
            'Una lesión AIS 6 (no superviviente) asigna automáticamente el ISS máximo de 75.',
          level: 'danger',
        }
      const top3 = [...valores].sort((a, b) => b - a).slice(0, 3)
      const score = top3.reduce((acc, x) => acc + x * x, 0)
      return {
        main: String(score),
        mainUnit: 'puntos (0–75)',
        secondary: top3.join(' · '),
        secondaryLabel: 'las tres regiones más graves',
        interpretation:
          score >= 16
            ? 'ISS ≥ 16: politraumatismo grave según la definición habitual; manejo en centro de trauma con equipo multidisciplinar.'
            : score >= 9
              ? 'Traumatismo moderado.'
              : 'Traumatismo leve.',
        level: score >= 25 ? 'danger' : score >= 16 ? 'warn' : 'ok',
        details: ['ISS = suma de los cuadrados de los tres valores AIS más altos de regiones distintas.'],
      }
    },
    references: [
      'Baker SP, et al. The injury severity score: a method for describing patients with multiple injuries. J Trauma. 1974;14(3):187-96.',
    ],
  },
  {
    id: 'abc-transfusion',
    name: 'Puntuación ABC para la transfusión masiva',
    shortName: 'ABC',
    description:
      'Predice la necesidad de protocolo de transfusión masiva en el paciente traumatizado.',
    category: CAT_TRAUMA,
    specialty: UCI,
    inputs: [
      { id: 'penetrante', type: 'boolean', label: 'Mecanismo penetrante' },
      { id: 'pas', type: 'boolean', label: 'PA sistólica ≤ 90 mmHg al llegar' },
      { id: 'fc', type: 'boolean', label: 'Frecuencia cardíaca ≥ 120 lpm al llegar' },
      { id: 'fast', type: 'boolean', label: 'Ecografía FAST positiva' },
    ],
    compute: (v) => {
      const score = sum(v, ['penetrante', 'pas', 'fc', 'fast'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–4)',
        interpretation:
          score >= 2
            ? 'ABC ≥ 2: alta probabilidad de requerir transfusión masiva. Activar el protocolo de hemorragia masiva con hemoderivados en proporción equilibrada y ácido tranexámico si está indicado.'
            : 'ABC < 2: baja probabilidad de transfusión masiva, aunque no la excluye; reevaluar de forma continua.',
        level: score >= 2 ? 'danger' : 'ok',
      }
    },
    references: [
      'Nunez TC, et al. Early prediction of massive transfusion in trauma: simple as ABC? J Trauma. 2009;66(2):346-52.',
    ],
  },
  {
    id: 'parkland',
    name: 'Fórmula de Parkland para quemados',
    shortName: 'Parkland',
    description: 'Calcula la reposición de líquidos en las primeras 24 horas del paciente quemado.',
    category: CAT_TRAUMA,
    specialty: UCI,
    inputs: [
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 1, max: 300, step: 0.5 },
      {
        id: 'sctq',
        type: 'number',
        label: 'Superficie corporal quemada (2.º y 3.er grado)',
        unit: '%',
        min: 1,
        max: 100,
        step: 1,
      },
      {
        id: 'mlkg',
        type: 'select',
        label: 'Fórmula',
        noPoints: true,
        options: [
          { label: 'Parkland clásica: 4 mL/kg/%', value: 4 },
          { label: 'ABLS / consenso actual: 2 mL/kg/%', value: 2 },
          { label: 'Quemadura eléctrica de alto voltaje: 4 mL/kg/%', value: 4.0001 },
        ],
        default: 2,
      },
    ],
    compute: (v) => {
      const factor = v.mlkg ?? 2
      const total = factor * v.peso! * v.sctq!
      const primeras8 = total / 2
      const ritmo8 = primeras8 / 8
      const ritmo16 = (total / 2) / 16
      return {
        main: fmt(total, 0),
        mainUnit: 'mL en 24 h',
        secondary: fmt(ritmo8, 0),
        secondaryLabel: 'mL/h en las primeras 8 horas',
        interpretation:
          'La mitad del volumen se administra en las primeras 8 horas desde el momento de la quemadura (no desde la llegada) y la otra mitad en las 16 horas siguientes, con Ringer lactato.',
        level: 'info',
        details: [
          `Primeras 8 h: ${fmt(primeras8, 0)} mL (${fmt(ritmo8, 0)} mL/h).`,
          `Siguientes 16 h: ${fmt(total / 2, 0)} mL (${fmt(ritmo16, 0)} mL/h).`,
          'Ajustar el ritmo según la diuresis objetivo: 0,5 mL/kg/h en adultos y 1 mL/kg/h en niños.',
          'Las guías actuales recomiendan iniciar con 2 mL/kg/% para evitar la sobrerreanimación («fluid creep»).',
        ],
      }
    },
    notes: [
      'No incluir las quemaduras de primer grado en el cálculo de la superficie.',
      'Los niños necesitan además fluidos de mantenimiento con glucosa.',
    ],
    references: [
      'Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci. 1968;150(3):874-94.',
    ],
  },
  {
    id: 'lrinec',
    name: 'Puntuación LRINEC para la fascitis necrosante',
    shortName: 'LRINEC',
    description: 'Ayuda a distinguir la infección necrosante de tejidos blandos de una celulitis grave.',
    category: CAT_TRAUMA,
    specialty: UCI,
    inputs: [
      {
        id: 'pcr',
        type: 'select',
        label: 'Proteína C reactiva (mg/L)',
        options: [
          { label: '< 150', value: 0 },
          { label: '≥ 150', value: 4 },
        ],
      },
      {
        id: 'leucocitos',
        type: 'select',
        label: 'Leucocitos (×10³/µL)',
        dropdown: true,
        options: [
          { label: '< 15', value: 0 },
          { label: '15–25', value: 1 },
          { label: '> 25', value: 2 },
        ],
      },
      {
        id: 'hb',
        type: 'select',
        label: 'Hemoglobina (g/dL)',
        dropdown: true,
        options: [
          { label: '> 13,5', value: 0 },
          { label: '11–13,5', value: 1 },
          { label: '< 11', value: 2 },
        ],
      },
      {
        id: 'sodio',
        type: 'select',
        label: 'Sodio (mEq/L)',
        options: [
          { label: '≥ 135', value: 0 },
          { label: '< 135', value: 2 },
        ],
      },
      {
        id: 'creatinina',
        type: 'select',
        label: 'Creatinina (mg/dL)',
        options: [
          { label: '≤ 1,6', value: 0 },
          { label: '> 1,6', value: 2 },
        ],
      },
      {
        id: 'glucosa',
        type: 'select',
        label: 'Glucosa (mg/dL)',
        options: [
          { label: '≤ 180', value: 0 },
          { label: '> 180', value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['pcr', 'leucocitos', 'hb', 'sodio', 'creatinina', 'glucosa'])
      const banda = score <= 5 ? 'bajo' : score <= 7 ? 'intermedio' : 'alto'
      return {
        main: String(score),
        mainUnit: 'puntos (0–13)',
        interpretation:
          banda === 'bajo'
            ? 'Riesgo bajo según la escala (< 50 % de probabilidad), pero una puntuación baja NO descarta la fascitis necrosante: si la clínica es sugestiva (dolor desproporcionado, crepitación, lesiones ampollosas, rápida progresión, toxicidad sistémica), la exploración quirúrgica no debe retrasarse.'
            : banda === 'intermedio'
              ? 'Riesgo intermedio (50–75 %): valoración quirúrgica urgente.'
              : 'Riesgo alto (> 75 %): exploración quirúrgica urgente, antibioterapia de amplio espectro y soporte en cuidados intensivos.',
        level: banda === 'bajo' ? 'warn' : 'danger',
      }
    },
    notes: [
      'Validaciones posteriores han mostrado una sensibilidad menor que la del estudio original: es una herramienta de apoyo, nunca de exclusión.',
    ],
    references: [
      'Wong CH, et al. The LRINEC (Laboratory Risk Indicator for Necrotizing Fasciitis) score. Crit Care Med. 2004;32(7):1535-41.',
    ],
  },
  {
    id: 'nexus-cabeza',
    name: 'Criterios NEXUS II para la tomografía craneal',
    shortName: 'NEXUS craneal',
    description:
      'Identifica a los pacientes con traumatismo craneal cerrado que requieren tomografía computarizada.',
    category: CAT_TRAUMA,
    specialty: UCI,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 65 años' },
      { id: 'craneo', type: 'boolean', label: 'Signos de fractura craneal (incluida la fractura de base)' },
      { id: 'cuero', type: 'boolean', label: 'Hematoma significativo del cuero cabelludo' },
      { id: 'neurologico', type: 'boolean', label: 'Déficit neurológico focal' },
      { id: 'conciencia', type: 'boolean', label: 'Nivel de conciencia alterado' },
      { id: 'conducta', type: 'boolean', label: 'Conducta anormal' },
      { id: 'coagulopatia', type: 'boolean', label: 'Coagulopatía' },
      { id: 'vomitos', type: 'boolean', label: 'Vómitos persistentes' },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'craneo', 'cuero', 'neurologico', 'conciencia', 'conducta', 'coagulopatia', 'vomitos'])
      return {
        main: score === 0 ? 'Bajo riesgo' : 'Riesgo no bajo',
        secondary: String(score),
        secondaryLabel: score === 1 ? 'criterio presente' : 'criterios presentes',
        interpretation:
          score === 0
            ? 'Ningún criterio presente: riesgo bajo de lesión intracraneal significativa; la tomografía puede evitarse con seguridad razonable (sensibilidad ≈ 98–100 %).'
            : 'Al menos un criterio presente: está indicada la tomografía craneal.',
        level: score === 0 ? 'ok' : 'danger',
      }
    },
    references: [
      'Mower WR, et al. Developing a decision instrument to guide computed tomographic imaging of blunt head injury patients. J Trauma. 2005;59(4):954-9.',
    ],
  },
  {
    id: 'nexus-torax',
    name: 'Criterios NEXUS para la tomografía torácica',
    shortName: 'NEXUS torácico',
    description:
      'Identifica a los pacientes con traumatismo torácico cerrado que requieren tomografía computarizada.',
    category: CAT_TRAUMA,
    specialty: UCI,
    inputs: [
      { id: 'mecanismo', type: 'boolean', label: 'Mecanismo de alta energía' },
      { id: 'radiografia', type: 'boolean', label: 'Radiografía de tórax anormal' },
      { id: 'esternon', type: 'boolean', label: 'Dolor a la palpación del esternón' },
      { id: 'escapula', type: 'boolean', label: 'Dolor a la palpación de la escápula' },
      { id: 'columna', type: 'boolean', label: 'Dolor a la palpación de la columna torácica' },
      { id: 'costal', type: 'boolean', label: 'Dolor a la palpación de la parrilla costal' },
      { id: 'edad', type: 'boolean', label: 'Edad > 60 años' },
      { id: 'intoxicacion', type: 'boolean', label: 'Intoxicación' },
      { id: 'distraccion', type: 'boolean', label: 'Lesión distractora dolorosa' },
      { id: 'alerta', type: 'boolean', label: 'Alteración del nivel de alerta o del juicio' },
    ],
    compute: (v) => {
      const score = sum(v, ['mecanismo', 'radiografia', 'esternon', 'escapula', 'columna', 'costal', 'edad', 'intoxicacion', 'distraccion', 'alerta'])
      return {
        main: score === 0 ? 'Bajo riesgo' : 'Riesgo no bajo',
        secondary: String(score),
        secondaryLabel: score === 1 ? 'criterio presente' : 'criterios presentes',
        interpretation:
          score === 0
            ? 'Ningún criterio presente: puede evitarse la tomografía torácica (sensibilidad ≈ 99 % para lesiones torácicas significativas).'
            : 'Al menos un criterio presente: valorar tomografía torácica según el contexto clínico.',
        level: score === 0 ? 'ok' : 'warn',
      }
    },
    references: [
      'Rodriguez RM, et al. Derivation and validation of two decision instruments for selective chest CT in blunt trauma. PLoS Med. 2015;12(10):e1001883.',
    ],
  },
]
