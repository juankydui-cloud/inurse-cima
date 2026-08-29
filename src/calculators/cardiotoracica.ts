import type { Calculator, Option } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT_CT = 'Cirugía cardiotorácica y perioperatorio'
const CAT_TEV = 'Tromboembolismo venoso'
const CAT_PLE = 'Enfermedad pleural'
const CAT_ECMO = 'Soporte extracorpóreo'
const CAT_AORTA = 'Aorta y grandes vasos'
const CT = ['Cirugía Cardiotorácica']

const escala = (items: [number, string][]): Option[] =>
  items.map(([value, label]) => ({ label: `${value} — ${label}`, value }))

export const cardiotoracica: Calculator[] = [
  {
    id: 'caprini',
    name: 'Puntuación Caprini para riesgo de TEV en el paciente quirúrgico',
    shortName: 'Caprini',
    description:
      'Estratifica el riesgo de tromboembolismo venoso y orienta la profilaxis en pacientes quirúrgicos.',
    category: CAT_TEV,
    specialty: CT,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 41 años', value: 0 },
          { label: '41–60 años', value: 1 },
          { label: '61–74 años', value: 2 },
          { label: '≥ 75 años', value: 3 },
        ],
      },
      {
        id: 'cirugia',
        type: 'select',
        label: 'Tipo de cirugía',
        options: [
          { label: 'Menor (< 45 min)', value: 1 },
          { label: 'Laparoscópica (> 45 min)', value: 2 },
          { label: 'Mayor abierta o electiva de artroplastia (> 45 min)', value: 2.0001 },
          { label: 'Ninguna cirugía', value: 0 },
        ],
      },
      { id: 'imc', type: 'boolean', label: 'IMC > 25 kg/m²' },
      { id: 'edema', type: 'boolean', label: 'Edema en miembros inferiores' },
      { id: 'varices', type: 'boolean', label: 'Varices' },
      { id: 'sepsis', type: 'boolean', label: 'Sepsis (en el último mes)' },
      { id: 'pulmonar', type: 'boolean', label: 'Enfermedad pulmonar grave (neumonía < 1 mes)' },
      { id: 'epoc', type: 'boolean', label: 'Función pulmonar anormal (EPOC)' },
      { id: 'iam', type: 'boolean', label: 'Infarto de miocardio (agudo)' },
      { id: 'iccPuntos', type: 'boolean', label: 'Insuficiencia cardíaca congestiva' },
      { id: 'confinamiento', type: 'boolean', label: 'Confinamiento en cama > 72 h' },
      { id: 'yeso', type: 'boolean', label: 'Inmovilización con yeso' },
      { id: 'catetercentral', type: 'boolean', label: 'Acceso venoso central' },
      { id: 'anticonceptivos', type: 'boolean', label: 'Anticonceptivos orales o terapia hormonal' },
      { id: 'embarazoPuerperio', type: 'boolean', label: 'Embarazo o puerperio (< 1 mes)' },
      { id: 'historia', type: 'boolean', label: 'Antecedente de abortos de repetición o pérdidas fetales' },
      { id: 'edadAvanzada', type: 'boolean', label: 'Edad > 75 años' },
      { id: 'artroplastia', type: 'boolean', label: 'Artroplastia de cadera o rodilla', points: 5 },
      { id: 'fracturaGrande', type: 'boolean', label: 'Fractura de cadera, pelvis o pierna en < 1 mes', points: 5 },
      { id: 'ictusRec', type: 'boolean', label: 'Ictus en el último mes', points: 5 },
      { id: 'medular', type: 'boolean', label: 'Lesión medular aguda (parálisis) en el último mes', points: 5 },
      { id: 'multiTrauma', type: 'boolean', label: 'Politraumatismo en el último mes', points: 5 },
      { id: 'tevPrevio', type: 'boolean', label: 'Antecedente personal de TVP o EP', points: 3 },
      { id: 'familiarTev', type: 'boolean', label: 'Antecedente familiar de TEV', points: 3 },
      { id: 'trombofilia', type: 'boolean', label: 'Trombofilia (factor V Leiden, protrombina, anticardiolipina...)', points: 3 },
      { id: 'trombopeniaHIT', type: 'boolean', label: 'Trombopenia inducida por heparina previa', points: 3 },
      { id: 'cancer', type: 'boolean', label: 'Neoplasia activa o previa', points: 2 },
    ],
    compute: (v) => {
      const score = Math.round(
        sum(v, [
          'edad', 'cirugia', 'imc', 'edema', 'varices', 'sepsis', 'pulmonar', 'epoc',
          'iam', 'iccPuntos', 'confinamiento', 'yeso', 'catetercentral', 'anticonceptivos',
          'embarazoPuerperio', 'historia', 'edadAvanzada', 'artroplastia', 'fracturaGrande',
          'ictusRec', 'medular', 'multiTrauma', 'tevPrevio', 'familiarTev', 'trombofilia',
          'trombopeniaHIT', 'cancer',
        ]),
      )
      const banda =
        score === 0 ? 'muy bajo' : score <= 1 ? 'bajo' : score <= 4 ? 'moderado' : 'alto'
      const rec =
        banda === 'muy bajo'
          ? 'Deambulación temprana; sin profilaxis específica.'
          : banda === 'bajo'
            ? 'Medidas mecánicas (compresión neumática intermitente).'
            : banda === 'moderado'
              ? 'Profilaxis farmacológica (HBPM o heparina no fraccionada) o mecánica si contraindicación.'
              : 'Profilaxis farmacológica y mecánica combinadas; prolongar hasta 30 días en cirugía oncológica abdominopélvica.'
      return {
        main: String(score),
        mainUnit: 'puntos',
        secondary: `Riesgo ${banda}`,
        interpretation: rec,
        level: banda === 'muy bajo' || banda === 'bajo' ? 'ok' : banda === 'moderado' ? 'warn' : 'danger',
      }
    },
    references: [
      'Caprini JA. Thrombosis risk assessment as a guide to quality patient care. Dis Mon. 2005;51(2-3):70-8.',
      'Gould MK, et al. Prevention of VTE in Nonorthopedic Surgical Patients (ACCP CHEST 2012). Chest. 2012;141(2 Suppl):e227S-e277S.',
    ],
  },
  {
    id: 'add-rs',
    name: 'ADD-RS (Aortic Dissection Detection Risk Score)',
    shortName: 'ADD-RS',
    description:
      'Estratifica la probabilidad clínica de disección aórtica aguda.',
    category: CAT_AORTA,
    specialty: CT,
    inputs: [
      {
        id: 'marfan',
        type: 'boolean',
        label: 'Condiciones predisponentes',
        description: 'Marfan u otra enfermedad del tejido conectivo, antecedente familiar de aneurisma/disección aórtica, valvulopatía aórtica, manipulación aórtica reciente, aneurisma aórtico torácico conocido.',
      },
      {
        id: 'dolor',
        type: 'boolean',
        label: 'Características del dolor',
        description: 'Dolor de aparición súbita, intenso, o descrito como desgarrador/lacerante en tórax, espalda o abdomen.',
      },
      {
        id: 'examen',
        type: 'boolean',
        label: 'Hallazgos en la exploración',
        description: 'Déficit de pulsos, asimetría de tensiones sistólicas > 20 mmHg, déficit neurológico focal con dolor o soplo diastólico de nueva aparición con dolor y/o hipotensión/shock.',
      },
    ],
    compute: (v) => {
      const score = sum(v, ['marfan', 'dolor', 'examen'])
      const banda =
        score === 0 ? 'muy bajo' : score === 1 ? 'bajo' : 'alto'
      return {
        main: String(score),
        mainUnit: 'de 3 categorías',
        secondary: `Riesgo ${banda}`,
        interpretation:
          score === 0
            ? 'Riesgo muy bajo: si D-dímero < 500 ng/mL, la disección aórtica queda razonablemente descartada.'
            : score === 1
              ? 'Riesgo bajo-intermedio: combinar con D-dímero para descartar; si es positivo o dudoso, angio-TC.'
              : 'Riesgo alto (≥ 2 categorías): angio-TC toracoabdominal urgente.',
        level: score === 0 ? 'ok' : score === 1 ? 'warn' : 'danger',
      }
    },
    references: [
      'Rogers AM, et al. Sensitivity of the aortic dissection detection risk score, a novel guideline-based tool. Circulation. 2011;123(20):2213-8.',
    ],
  },
  {
    id: 'acef2',
    name: 'Puntuación ACEF II para cirugía cardíaca',
    shortName: 'ACEF II',
    description: 'Predice la mortalidad a 30 días tras cirugía cardíaca electiva o urgente.',
    category: CAT_CT,
    specialty: CT,
    inputs: [
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 18, max: 100 },
      { id: 'fevi', type: 'number', label: 'Fracción de eyección del VI', unit: '%', min: 10, max: 80, step: 1 },
      { id: 'creatinina', type: 'number', label: 'Creatinina sérica', unit: 'mg/dL', min: 0.3, max: 15, step: 0.01 },
      { id: 'urgente', type: 'boolean', label: 'Cirugía de urgencia' },
      { id: 'anemia', type: 'boolean', label: 'Hematocrito < 36 %' },
    ],
    compute: (v) => {
      const base = v.edad! / v.fevi! + (v.creatinina! > 2 ? 2 : 0) + (v.urgente === 1 ? 3 : 0) + (v.anemia === 1 ? 0.2 * (36 - Math.max(20, 36 - 10)) : 0)
      // Nota: la fórmula original añade 0,2 puntos por cada punto de hematocrito por debajo de 36; aquí no pedimos el valor exacto de hematocrito.
      const banda = base < 1 ? 'bajo' : base < 2 ? 'intermedio' : 'alto'
      const mort = base < 1 ? '< 1 %' : base < 2 ? '≈ 3 %' : '≥ 8 %'
      return {
        main: fmt(base, 2),
        mainUnit: 'puntos ACEF II',
        secondary: mort,
        secondaryLabel: 'mortalidad a 30 días',
        interpretation: `Riesgo ${banda} de mortalidad tras la cirugía cardíaca.`,
        level: banda === 'bajo' ? 'ok' : banda === 'intermedio' ? 'warn' : 'danger',
        details: [
          'Fórmula ACEF II = edad/FEVI + 2 (si creatinina > 2 mg/dL) + 3 (si urgencia) + 0,2 × (36 − hematocrito) si Hto < 36 %.',
          'Como no pedimos el hematocrito exacto, la penalización por anemia se calcula solo por presencia/ausencia como aproximación (compruebe el valor real para casos límite).',
        ],
      }
    },
    references: [
      'Ranucci M, et al. The multicenter external validation of ACEF II. J Thorac Cardiovasc Surg. 2018;155(4):1461-9.',
    ],
  },
  {
    id: 'aub-has2',
    name: 'AUB-HAS2 — Riesgo cardiovascular perioperatorio no cardíaco',
    shortName: 'AUB-HAS2',
    description:
      'Estratifica el riesgo cardiovascular perioperatorio en cirugía no cardíaca (alternativa simplificada a RCRI).',
    category: CAT_CT,
    specialty: CT,
    inputs: [
      { id: 'hta', type: 'boolean', label: 'Historia de hipertensión (H)' },
      { id: 'angina', type: 'boolean', label: 'Historia de angina (A)' },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 75 años (A)' },
      { id: 'sintomas', type: 'boolean', label: 'Síntomas de insuficiencia cardíaca o disnea (S)' },
      { id: 'quirurgico', type: 'boolean', label: 'Tipo de cirugía de alto riesgo (S)' },
    ],
    compute: (v) => {
      const score = sum(v, ['hta', 'angina', 'edad', 'sintomas', 'quirurgico'])
      const eventos = ['0,3 %', '0,3 %', '1,5 %', '4,4 %', '8 %', '13 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–5)',
        secondary: eventos,
        secondaryLabel: 'eventos cardiovasculares graves a 30 días',
        interpretation:
          score <= 1
            ? 'Riesgo bajo.'
            : score <= 2
              ? 'Riesgo intermedio: optimización preoperatoria y vigilancia postoperatoria.'
              : 'Riesgo alto: consulta cardiológica preoperatoria y considerar monitorización de troponina postoperatoria.',
        level: score <= 1 ? 'ok' : score <= 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Dakik HA, et al. AUB-HAS2 Cardiovascular Risk Index: Performance in Surgical Subpopulations and Comparison to the Revised Cardiac Risk Index. J Am Heart Assoc. 2019;8(9):e011477.',
    ],
  },
  {
    id: 'euromacs-rhf',
    name: 'EUROMACS-RHF — Riesgo de insuficiencia cardíaca derecha tras LVAD',
    shortName: 'EUROMACS-RHF',
    description:
      'Estima el riesgo de fallo del ventrículo derecho tras el implante de un dispositivo de asistencia ventricular izquierda.',
    category: CAT_CT,
    specialty: CT,
    inputs: [
      { id: 'intermacs', type: 'boolean', label: 'Perfil INTERMACS 1–3', points: 2 },
      { id: 'multiInotrop', type: 'boolean', label: 'Uso de ≥ 3 inotrópicos preoperatorios', points: 2.5 },
      { id: 'gradiente', type: 'boolean', label: 'RA/PCWP > 0,54', points: 2 },
      { id: 'hemoglobina', type: 'boolean', label: 'Hemoglobina ≤ 10 g/dL', points: 1 },
      { id: 'disfuncionVD', type: 'boolean', label: 'Disfunción moderada-grave del ventrículo derecho en ecocardiograma', points: 2 },
    ],
    compute: (v) => {
      const score = sum(v, ['intermacs', 'multiInotrop', 'gradiente', 'hemoglobina', 'disfuncionVD'])
      const riesgo = score <= 2 ? 'bajo (11 %)' : score <= 4 ? 'intermedio (37 %)' : 'alto (43–58 %)'
      return {
        main: fmt(score, 1),
        mainUnit: 'puntos (0–9,5)',
        secondary: riesgo,
        secondaryLabel: 'riesgo de insuficiencia cardíaca derecha post-LVAD',
        interpretation:
          score <= 2
            ? 'Riesgo bajo de insuficiencia cardíaca derecha tras el implante.'
            : score <= 4
              ? 'Riesgo intermedio: valorar biventricular temporal, vigilancia estrecha.'
              : 'Riesgo alto: considerar soporte biventricular o trasplante como estrategia alternativa.',
        level: score <= 2 ? 'ok' : score <= 4 ? 'warn' : 'danger',
      }
    },
    references: [
      'Soliman OII, et al. Derivation and Validation of a Novel Right-Sided Heart Failure Model After Implantation of Continuous Flow LVADs. Circulation. 2018;137(9):891-906.',
    ],
  },
  {
    id: 'thakar',
    name: 'Puntuación de Thakar para lesión renal aguda tras cirugía cardíaca',
    shortName: 'Thakar',
    description:
      'Predice el riesgo de insuficiencia renal aguda que requiere diálisis tras cirugía cardíaca.',
    category: CAT_CT,
    specialty: CT,
    inputs: [
      { id: 'mujer', type: 'boolean', label: 'Sexo femenino' },
      { id: 'icc', type: 'boolean', label: 'Insuficiencia cardíaca congestiva' },
      { id: 'fevi', type: 'boolean', label: 'FEVI < 35 %' },
      { id: 'biac', type: 'boolean', label: 'Balón de contrapulsación intraaórtico preoperatorio', points: 2 },
      { id: 'epoc', type: 'boolean', label: 'EPOC' },
      { id: 'diabetesInsul', type: 'boolean', label: 'Diabetes en tratamiento con insulina' },
      { id: 'cardiacaPrevia', type: 'boolean', label: 'Cirugía cardíaca previa' },
      { id: 'urgencia', type: 'boolean', label: 'Cirugía urgente', points: 2 },
      {
        id: 'tipo',
        type: 'select',
        label: 'Tipo de cirugía',
        options: [
          { label: 'Solo revascularización coronaria', value: 0 },
          { label: 'Solo valvular', value: 1 },
          { label: 'Combinada (revascularización + valvular u otra)', value: 2 },
        ],
      },
      {
        id: 'creatinina',
        type: 'select',
        label: 'Creatinina preoperatoria (mg/dL)',
        options: [
          { label: '< 1,2', value: 0 },
          { label: '1,2–2,1', value: 2 },
          { label: '> 2,1', value: 5 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['mujer', 'icc', 'fevi', 'biac', 'epoc', 'diabetesInsul', 'cardiacaPrevia', 'urgencia', 'tipo', 'creatinina'])
      const riesgo =
        score <= 2 ? '0,5 %' : score <= 5 ? '1,8 %' : score <= 8 ? '7,7 %' : '21 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–17)',
        secondary: riesgo,
        secondaryLabel: 'riesgo de diálisis post-cirugía',
        interpretation:
          score <= 2
            ? 'Riesgo bajo.'
            : score <= 5
              ? 'Riesgo intermedio.'
              : score <= 8
                ? 'Riesgo alto.'
                : 'Riesgo muy alto: intensificar profilaxis renal (evitar nefrotóxicos, mantener perfusión, ajustar contraste, valoración por nefrología).',
        level: score <= 2 ? 'ok' : score <= 5 ? 'warn' : 'danger',
      }
    },
    references: [
      'Thakar CV, et al. A clinical score to predict acute renal failure after cardiac surgery. J Am Soc Nephrol. 2005;16(1):162-8.',
    ],
  },
  {
    id: 'lent',
    name: 'Puntuación LENT para derrame pleural maligno',
    shortName: 'LENT',
    description: 'Estima la supervivencia en pacientes con derrame pleural maligno.',
    category: CAT_PLE,
    specialty: CT,
    inputs: [
      {
        id: 'ldh',
        type: 'select',
        label: 'LDH del líquido pleural',
        options: [
          { label: '< 1.500 U/L', value: 0 },
          { label: '≥ 1.500 U/L', value: 1 },
        ],
      },
      {
        id: 'ecog',
        type: 'select',
        label: 'ECOG performance status',
        options: [
          { label: '0', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3–4', value: 3 },
        ],
      },
      {
        id: 'nlr',
        type: 'select',
        label: 'Cociente neutrófilos/linfocitos',
        options: [
          { label: '< 9', value: 0 },
          { label: '≥ 9', value: 1 },
        ],
      },
      {
        id: 'tumor',
        type: 'select',
        label: 'Tipo de tumor',
        dropdown: true,
        options: [
          { label: 'Mesotelioma / hematológico', value: 0 },
          { label: 'Mama / ginecológico / renal', value: 1 },
          { label: 'Pulmón / otros', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['ldh', 'ecog', 'nlr', 'tumor'])
      const riesgo = score <= 1 ? 'bajo' : score <= 4 ? 'moderado' : 'alto'
      const superv = score <= 1 ? '319 días' : score <= 4 ? '130 días' : '44 días'
      return {
        main: String(score),
        mainUnit: 'puntos (0–7)',
        secondary: superv,
        secondaryLabel: 'mediana de supervivencia',
        interpretation: `Riesgo ${riesgo} de mortalidad. Ayuda a decidir entre pleurodesis o catéter pleural tunelizado.`,
        level: riesgo === 'bajo' ? 'ok' : riesgo === 'moderado' ? 'warn' : 'danger',
      }
    },
    references: [
      'Clive AO, et al. Predicting survival in malignant pleural effusion: development and validation of the LENT prognostic score. Thorax. 2014;69(12):1098-104.',
    ],
  },
  {
    id: 'rapid-pleural',
    name: 'Puntuación RAPID para infección pleural',
    shortName: 'RAPID (pleural)',
    description: 'Estima la mortalidad a 3 meses en pacientes con infección pleural.',
    category: CAT_PLE,
    specialty: CT,
    inputs: [
      {
        id: 'urea',
        type: 'select',
        label: 'Urea sérica (BUN)',
        options: [
          { label: '< 14 mg/dL', value: 0 },
          { label: '14–22 mg/dL', value: 1 },
          { label: '> 22 mg/dL', value: 2 },
        ],
      },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 50 años', value: 0 },
          { label: '50–70 años', value: 1 },
          { label: '> 70 años', value: 2 },
        ],
      },
      {
        id: 'pus',
        type: 'select',
        label: 'Aspecto del líquido pleural',
        options: [
          { label: 'No purulento', value: 0 },
          { label: 'Purulento', value: 1 },
        ],
      },
      {
        id: 'infeccion',
        type: 'select',
        label: 'Origen de la infección',
        options: [
          { label: 'Comunitario', value: 0 },
          { label: 'Nosocomial', value: 1 },
        ],
      },
      {
        id: 'albumina',
        type: 'select',
        label: 'Albúmina sérica',
        options: [
          { label: '≥ 2,7 g/dL', value: 0 },
          { label: '< 2,7 g/dL', value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['urea', 'edad', 'pus', 'infeccion', 'albumina'])
      const banda = score <= 2 ? 'bajo (< 5 %)' : score <= 4 ? 'intermedio (17 %)' : 'alto (48 %)'
      return {
        main: String(score),
        mainUnit: 'puntos (0–7)',
        secondary: banda,
        secondaryLabel: 'mortalidad a 3 meses',
        interpretation:
          score <= 2
            ? 'Riesgo bajo: buen pronóstico con tratamiento convencional (drenaje + antibioterapia).'
            : score <= 4
              ? 'Riesgo intermedio: vigilancia estrecha; considerar activación de vía quirúrgica temprana.'
              : 'Riesgo alto: mortalidad significativa; valoración por cirugía torácica precoz y cuidados intermedios.',
        level: score <= 2 ? 'ok' : score <= 4 ? 'warn' : 'danger',
      }
    },
    references: [
      'Rahman NM, et al. A clinical score (RAPID) to identify those at risk for poor outcome at presentation with pleural infection. Chest. 2014;145(4):848-55.',
    ],
  },
  {
    id: 'save',
    name: 'Puntuación SAVE para supervivencia tras ECMO venoarterial',
    shortName: 'SAVE',
    description:
      'Predice la supervivencia intrahospitalaria en adultos con shock cardiogénico refractario tratados con ECMO VA.',
    category: CAT_ECMO,
    specialty: CT,
    inputs: [
      {
        id: 'diagnostico',
        type: 'select',
        label: 'Grupo diagnóstico',
        dropdown: true,
        options: [
          { label: 'Miocarditis', value: 3 },
          { label: 'Rechazo de trasplante refractario', value: 3.0001 },
          { label: 'FV/TV refractaria', value: 2 },
          { label: 'Post-trasplante cardíaco / pulmonar', value: 3.0002 },
          { label: 'Miocardiopatía congénita', value: -3 },
          { label: 'Otros', value: 0 },
        ],
      },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        dropdown: true,
        options: [
          { label: '18–38', value: 7 },
          { label: '39–52', value: 4 },
          { label: '53–62', value: 3 },
          { label: '≥ 63', value: 0 },
        ],
      },
      {
        id: 'peso',
        type: 'select',
        label: 'Peso',
        options: [
          { label: '≤ 65 kg', value: 1 },
          { label: '65–89 kg', value: 2 },
          { label: '> 89 kg', value: 0 },
        ],
      },
      {
        id: 'organos',
        type: 'select',
        label: 'Fallo orgánico agudo previo a la ECMO',
        options: [
          { label: 'Renal (creatinina > 1,5 o diálisis)', value: -3 },
          { label: 'Hepático (bilirrubina > 2 o transaminasas > 70)', value: -3.0001 },
          { label: 'Neurológico', value: -3.0002 },
          { label: 'Sin fallo orgánico', value: 0 },
        ],
      },
      { id: 'ventilacion', type: 'boolean', label: 'Ventilación mecánica > 10 días', points: -1 },
      { id: 'presionInspiratoria', type: 'boolean', label: 'Presión inspiratoria pico ≥ 20 cmH₂O', points: -3 },
      { id: 'pcr', type: 'boolean', label: 'Parada cardíaca antes de la ECMO', points: -2 },
      { id: 'pas', type: 'boolean', label: 'PA sistólica ≤ 90 mmHg pre-ECMO', points: -2 },
      { id: 'ph', type: 'boolean', label: 'pH < 7,25 pre-ECMO', points: -3 },
    ],
    compute: (v) => {
      const score = Math.round(
        sum(v, ['diagnostico', 'edad', 'peso', 'organos', 'ventilacion', 'presionInspiratoria', 'pcr', 'pas', 'ph']) + 6,
      )
      const banda = score > 5 ? 'I (75 %)' : score >= 1 ? 'II (58 %)' : score >= -4 ? 'III (42 %)' : score >= -9 ? 'IV (30 %)' : 'V (18 %)'
      return {
        main: String(score),
        mainUnit: 'puntos SAVE',
        secondary: `Clase ${banda}`,
        secondaryLabel: 'supervivencia hospitalaria',
        interpretation:
          'Herramienta de apoyo para decidir sobre la indicación de ECMO VA y las expectativas realistas. La decisión final integra el juicio clínico y la disponibilidad de recursos.',
        level: score >= 1 ? 'ok' : score >= -4 ? 'warn' : 'danger',
      }
    },
    references: [
      'Schmidt M, et al. Predicting survival after ECMO for refractory cardiogenic shock: the SAVE-score. Eur Heart J. 2015;36(33):2246-56.',
    ],
  },
  {
    id: 'resp',
    name: 'Puntuación RESP para supervivencia tras ECMO respiratoria',
    shortName: 'RESP',
    description:
      'Predice la supervivencia hospitalaria en pacientes con insuficiencia respiratoria aguda tratados con ECMO.',
    category: CAT_ECMO,
    specialty: CT,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        dropdown: true,
        options: [
          { label: '18–49 años', value: 0 },
          { label: '50–59 años', value: -2 },
          { label: '≥ 60 años', value: -3 },
        ],
      },
      {
        id: 'inmunocomp',
        type: 'select',
        label: 'Inmunodepresión',
        options: [
          { label: 'No', value: 0 },
          { label: 'Sí (tumor sólido, hematológico, cirrosis, VIH…)', value: -2 },
        ],
      },
      {
        id: 'ventilacion',
        type: 'select',
        label: 'Duración de la ventilación mecánica antes de la ECMO',
        dropdown: true,
        options: [
          { label: '< 48 h', value: 3 },
          { label: '48 h – 7 días', value: 1 },
          { label: '> 7 días', value: 0 },
        ],
      },
      {
        id: 'diagnostico',
        type: 'select',
        label: 'Diagnóstico agudo',
        dropdown: true,
        options: [
          { label: 'Neumonía viral', value: 3 },
          { label: 'Neumonía bacteriana', value: 3.0001 },
          { label: 'Asma', value: 11 },
          { label: 'Traumatismo o quemadura', value: 3.0002 },
          { label: 'Aspiración', value: 5 },
          { label: 'Otras causas', value: 1 },
        ],
      },
      { id: 'snc', type: 'boolean', label: 'Disfunción del sistema nervioso central', points: -7 },
      { id: 'infeccion', type: 'boolean', label: 'Infección bacteriana aguda no pulmonar', points: -3 },
      { id: 'bnm', type: 'boolean', label: 'Uso de bloqueantes neuromusculares' },
      { id: 'no', type: 'boolean', label: 'Uso de óxido nítrico inhalado', points: -1 },
      { id: 'bicarbonato', type: 'boolean', label: 'Uso de bicarbonato', points: -2 },
      { id: 'pcr', type: 'boolean', label: 'Parada cardíaca previa a la ECMO', points: -2 },
      {
        id: 'paco2',
        type: 'select',
        label: 'PaCO₂',
        options: [
          { label: '< 75 mmHg', value: 0 },
          { label: '≥ 75 mmHg', value: -1 },
        ],
      },
      {
        id: 'presion',
        type: 'select',
        label: 'Presión pico inspiratoria',
        options: [
          { label: '< 42 cmH₂O', value: 0 },
          { label: '≥ 42 cmH₂O', value: -1 },
        ],
      },
    ],
    compute: (v) => {
      const score = Math.round(sum(v, ['edad', 'inmunocomp', 'ventilacion', 'diagnostico', 'snc', 'infeccion', 'bnm', 'no', 'bicarbonato', 'pcr', 'paco2', 'presion']))
      const banda =
        score >= 6 ? 'I (92 %)' : score >= 3 ? 'II (76 %)' : score >= -1 ? 'III (57 %)' : score >= -5 ? 'IV (33 %)' : 'V (18 %)'
      return {
        main: String(score),
        mainUnit: 'puntos RESP',
        secondary: `Clase ${banda}`,
        secondaryLabel: 'supervivencia hospitalaria',
        interpretation:
          'Herramienta de apoyo para decidir sobre la indicación de ECMO respiratoria y anticipar expectativas.',
        level: score >= 3 ? 'ok' : score >= -1 ? 'warn' : 'danger',
      }
    },
    references: [
      'Schmidt M, et al. Predicting survival after ECMO for severe acute respiratory failure. The Respiratory ECMO Survival Prediction (RESP) score. Am J Respir Crit Care Med. 2014;189(11):1374-82.',
    ],
  },
  {
    id: 'pons',
    name: 'PONS — Perioperative Nutrition Screen',
    shortName: 'PONS',
    description:
      'Cribado nutricional preoperatorio en cirugía electiva; identifica pacientes que se beneficiarán de optimización nutricional.',
    category: CAT_CT,
    specialty: CT,
    inputs: [
      {
        id: 'imc',
        type: 'boolean',
        label: 'IMC < 18,5 (o < 20 si ≥ 65 años)',
      },
      {
        id: 'perdida',
        type: 'boolean',
        label: 'Pérdida de peso no intencionada > 10 % en 6 meses',
      },
      {
        id: 'ingesta',
        type: 'boolean',
        label: 'Ingesta oral reducida en la última semana',
      },
      {
        id: 'albumina',
        type: 'boolean',
        label: 'Albúmina preoperatoria < 3,0 g/dL',
      },
    ],
    compute: (v) => {
      const score = sum(v, ['imc', 'perdida', 'ingesta', 'albumina'])
      return {
        main: String(score),
        mainUnit: 'criterios (0–4)',
        interpretation:
          score === 0
            ? 'Riesgo nutricional bajo: no requiere intervención específica preoperatoria.'
            : 'Al menos un criterio positivo: derivar a nutrición para optimización preoperatoria (suplementos orales, retraso de cirugía electiva si es posible 7–14 días).',
        level: score === 0 ? 'ok' : 'warn',
      }
    },
    references: [
      'Wischmeyer PE, et al. American Society for Enhanced Recovery and Perioperative Quality Initiative Joint Consensus Statement on Nutrition Screening. Anesth Analg. 2018;126(6):1883-95.',
    ],
  },
  {
    id: 'bridge-anticoagulacion',
    name: 'Algoritmo de puentes de anticoagulación perioperatoria',
    shortName: 'Puente anticoagulación',
    description:
      'Orienta la necesidad de puente con HBPM durante la suspensión perioperatoria de la anticoagulación oral.',
    category: CAT_CT,
    specialty: CT,
    inputs: [
      {
        id: 'indicacion',
        type: 'select',
        label: 'Motivo de la anticoagulación',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Prótesis valvular mecánica', value: 1 },
          { label: 'Fibrilación auricular', value: 2 },
          { label: 'Tromboembolismo venoso', value: 3 },
        ],
        default: 2,
      },
      {
        id: 'riesgo',
        type: 'select',
        label: 'Riesgo tromboembólico específico',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Alto — prótesis mitral, prótesis aórtica antigua, CHA₂DS₂-VASc ≥ 7, ictus/AIT en los últimos 3 meses, TEV en los últimos 3 meses, trombofilia grave', value: 'alto' as unknown as number },
          { label: 'Intermedio — prótesis aórtica bicúspide moderna con factores de riesgo, CHA₂DS₂-VASc 5–6, TEV en los últimos 3–12 meses, trombofilia leve o TEV recurrente', value: 'intermedio' as unknown as number },
          { label: 'Bajo — prótesis aórtica bicúspide moderna sin factores, CHA₂DS₂-VASc 1–4 sin ictus previo, TEV único > 12 meses', value: 'bajo' as unknown as number },
        ],
        default: 'intermedio' as unknown as number,
      },
      {
        id: 'sangrado',
        type: 'select',
        label: 'Riesgo hemorrágico del procedimiento',
        noPoints: true,
        options: [
          { label: 'Bajo (cataratas, endoscopia diagnóstica, extracción dental)', value: 'bajo' as unknown as number },
          { label: 'Intermedio (mayoría de cirugías generales)', value: 'intermedio' as unknown as number },
          { label: 'Alto (neurocirugía, cardíaca mayor, resecciones oncológicas)', value: 'alto' as unknown as number },
        ],
        default: 'intermedio' as unknown as number,
      },
    ],
    compute: (v) => {
      const r = v.riesgo as unknown as string
      const s = v.sangrado as unknown as string
      const puente = r === 'alto' || (r === 'intermedio' && s !== 'alto')
      const guiaAcod = r === 'alto'
        ? 'Alto riesgo tromboembólico: se recomienda puente con HBPM a dosis terapéutica.'
        : r === 'intermedio'
          ? 'Riesgo intermedio: valorar puente individualizando; en fibrilación auricular sin ictus previo el ensayo BRIDGE mostró que la mayoría no se benefician.'
          : 'Riesgo bajo: en general no se recomienda puente.'
      return {
        main: puente ? 'Puente indicado' : 'Puente no recomendado',
        interpretation:
          `${guiaAcod} ${
            s === 'alto'
              ? 'Sangrado alto: reanudar anticoagulación a las 48–72 h; en pacientes con riesgo tromboembólico muy alto, priorizar el control de la hemorragia.'
              : s === 'intermedio'
                ? 'Sangrado intermedio: reanudar anticoagulación en 24 h si hemostasia adecuada.'
                : 'Sangrado bajo: puede no ser necesario suspender la anticoagulación (procedimientos menores).'
          }`,
        level: puente ? 'warn' : 'ok',
        details: [
          'En pacientes con anticoagulantes orales directos, en general NO se hace puente: se suspenden 24–48 h antes según función renal.',
          'La warfarina se suspende 5 días antes; el INR debe ser < 1,5 el día de la cirugía.',
          'Reanudar la HBPM 24 h después de la cirugía de bajo-intermedio riesgo o 48–72 h si el riesgo hemorrágico es alto.',
        ],
      }
    },
    notes: [
      'El ensayo BRIDGE (NEJM 2015) demostró que no hacer puente en fibrilación auricular sin ictus previo es no inferior en tromboembolismo y reduce las hemorragias.',
    ],
    references: [
      'Douketis JD, et al. Perioperative Management of Antithrombotic Therapy: An American College of Chest Physicians Clinical Practice Guideline. Chest. 2022;162(5):e207-e243.',
    ],
  },
  {
    id: 'duke-iscvid-2023',
    name: 'Criterios Duke-ISCVID 2023 para endocarditis infecciosa',
    shortName: 'Duke-ISCVID 2023',
    description:
      'Criterios diagnósticos actualizados de endocarditis infecciosa (Sociedad Internacional de ISCVID, 2023).',
    category: 'Criterios diagnósticos',
    specialty: CT,
    inputs: [
      {
        id: 'mayores',
        type: 'select',
        label: 'Criterios mayores presentes',
        dropdown: true,
        options: escala([
          [0, '0'],
          [1, '1'],
          [2, '2'],
        ]),
      },
      {
        id: 'menores',
        type: 'select',
        label: 'Criterios menores presentes',
        dropdown: true,
        options: escala([
          [0, '0'],
          [1, '1'],
          [2, '2'],
          [3, '3'],
          [4, '4'],
          [5, '5'],
        ]),
      },
      { id: 'confirmadaAP', type: 'boolean', label: 'Endocarditis confirmada por anatomía patológica o cultivo de válvula/vegetación', noPoints: true },
    ],
    compute: (v) => {
      if (v.confirmadaAP === 1)
        return {
          main: 'Endocarditis definitiva',
          interpretation: 'Criterio anatomopatológico: la demostración de microorganismos o inflamación activa en válvula o vegetación establece el diagnóstico definitivo.',
          level: 'danger',
        }
      const mayor = v.mayores ?? 0
      const menor = v.menores ?? 0
      let categoria: 'Definitiva' | 'Posible' | 'Rechazada'
      if (mayor >= 2 || (mayor === 1 && menor >= 3) || menor >= 5) categoria = 'Definitiva'
      else if ((mayor === 1 && menor >= 1) || menor >= 3) categoria = 'Posible'
      else categoria = 'Rechazada'
      return {
        main: `Endocarditis ${categoria.toLowerCase()}`,
        interpretation:
          categoria === 'Definitiva'
            ? 'Diagnóstico definitivo por criterios clínicos: iniciar antibioterapia dirigida y valoración por equipo multidisciplinar de endocarditis.'
            : categoria === 'Posible'
              ? 'Diagnóstico posible: completar estudio (hemocultivos seriados, ecocardiograma transesofágico, imagen avanzada: PET-TC en prótesis, angio-TC).'
              : 'Diagnóstico rechazado: buscar diagnósticos alternativos.',
        level: categoria === 'Definitiva' ? 'danger' : categoria === 'Posible' ? 'warn' : 'ok',
        details: [
          'Los criterios mayores incluyen ahora hemocultivos con nuevos microorganismos típicos, PCR positiva en tejido/serología, y hallazgos en PET-TC.',
          'Los criterios menores incluyen fenómenos vasculares/inmunológicos, catéter venoso central, drogadicción intravenosa reciente, y hallazgos ecográficos sugestivos.',
        ],
      }
    },
    notes: [
      'Los criterios ISCVID 2023 amplían y actualizan los Duke modificados clásicos, integrando técnicas de imagen (PET-TC, angio-TC cardíaca) y microbiología molecular.',
    ],
    references: [
      'Fowler VG, et al. The 2023 Duke-International Society for Cardiovascular Infectious Diseases Criteria for Infective Endocarditis. Clin Infect Dis. 2023;77(4):518-26.',
    ],
  },
]
