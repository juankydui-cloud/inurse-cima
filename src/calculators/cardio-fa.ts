import type { Calculator } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Fibrilación auricular y anticoagulación'
const CARD = ['Cardiología']

export const cardioFA: Calculator[] = [
  {
    id: 'cha2ds2-vasc',
    name: 'Puntuación CHA₂DS₂-VASc para el riesgo de ictus en fibrilación auricular',
    shortName: 'CHA₂DS₂-VASc',
    description:
      'Estima el riesgo anual de ictus en pacientes con fibrilación auricular no valvular para decidir la anticoagulación.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'icc', type: 'boolean', label: 'Insuficiencia cardíaca congestiva (C)', description: 'Signos/síntomas de IC o FEVI reducida.' },
      { id: 'hta', type: 'boolean', label: 'Hipertensión arterial (H)', description: 'En tratamiento o PA en reposo > 140/90 mmHg.' },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad (A₂ / A)',
        options: [
          { label: '< 65 años', value: 0 },
          { label: '65–74 años', value: 1 },
          { label: '≥ 75 años', value: 2 },
        ],
      },
      { id: 'dm', type: 'boolean', label: 'Diabetes mellitus (D)' },
      { id: 'ictus', type: 'boolean', label: 'Ictus, AIT o embolia sistémica previos (S₂)', points: 2 },
      { id: 'vascular', type: 'boolean', label: 'Enfermedad vascular (V)', description: 'IAM previo, arteriopatía periférica o placa aórtica.' },
      { id: 'sexo', type: 'boolean', label: 'Sexo femenino (Sc)' },
    ],
    compute: (v) => {
      const score = sum(v, ['icc', 'hta', 'edad', 'dm', 'ictus', 'vascular', 'sexo'])
      const riesgo = [0.2, 0.6, 2.2, 3.2, 4.8, 7.2, 9.7, 11.2, 10.8, 12.2][Math.min(score, 9)]
      const mujer = v.sexo === 1
      const umbralAlto = mujer ? 3 : 2
      const umbralConsiderar = mujer ? 2 : 1
      return {
        main: String(score),
        mainUnit: 'puntos (0–9)',
        secondary: `${fmt(riesgo, 1)} %`,
        secondaryLabel: 'riesgo anual de ictus/AIT/embolia',
        interpretation:
          score >= umbralAlto
            ? 'Riesgo elevado: se recomienda anticoagulación oral salvo contraindicación.'
            : score >= umbralConsiderar
              ? 'Riesgo intermedio: considerar anticoagulación oral valorando riesgo hemorrágico y preferencias del paciente.'
              : 'Riesgo bajo: en general no se recomienda tratamiento antitrombótico.',
        level: score >= umbralAlto ? 'danger' : score >= umbralConsiderar ? 'warn' : 'ok',
      }
    },
    notes: [
      'El sexo femenino es un modificador de riesgo: puntúa, pero de forma aislada (mujer sin otros factores) no indica anticoagulación.',
      'Porcentajes anuales de la cohorte de validación de Friberg 2012.',
      'Valorar siempre junto al riesgo hemorrágico (HAS-BLED u ORBIT).',
    ],
    references: [
      'Lip GY, et al. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation (Euro Heart Survey). Chest. 2010;137(2):263-72.',
      'Friberg L, et al. Evaluation of risk stratification schemes for ischaemic stroke and bleeding in 182 678 patients with atrial fibrillation. Eur Heart J. 2012;33(12):1500-10.',
    ],
  },
  {
    id: 'cha2ds2-va',
    name: 'Puntuación CHA₂DS₂-VA para el riesgo de ictus en fibrilación auricular',
    shortName: 'CHA₂DS₂-VA',
    description:
      'Versión sin el criterio de sexo recomendada por la guía ESC 2024 para decidir la anticoagulación en fibrilación auricular.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'icc', type: 'boolean', label: 'Insuficiencia cardíaca congestiva (C)' },
      { id: 'hta', type: 'boolean', label: 'Hipertensión arterial (H)' },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad (A₂ / A)',
        options: [
          { label: '< 65 años', value: 0 },
          { label: '65–74 años', value: 1 },
          { label: '≥ 75 años', value: 2 },
        ],
      },
      { id: 'dm', type: 'boolean', label: 'Diabetes mellitus (D)' },
      { id: 'ictus', type: 'boolean', label: 'Ictus, AIT o embolia sistémica previos (S₂)', points: 2 },
      { id: 'vascular', type: 'boolean', label: 'Enfermedad vascular (V)', description: 'IAM previo, arteriopatía periférica o placa aórtica.' },
    ],
    compute: (v) => {
      const score = sum(v, ['icc', 'hta', 'edad', 'dm', 'ictus', 'vascular'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–8)',
        interpretation:
          score >= 2
            ? 'CHA₂DS₂-VA ≥ 2: se recomienda anticoagulación oral (guía ESC 2024).'
            : score === 1
              ? 'CHA₂DS₂-VA = 1: debe considerarse la anticoagulación oral, individualizando.'
              : 'Riesgo bajo: en general no se recomienda anticoagulación.',
        level: score >= 2 ? 'danger' : score === 1 ? 'warn' : 'ok',
      }
    },
    references: [
      'Van Gelder IC, et al. 2024 ESC Guidelines for the management of atrial fibrillation. Eur Heart J. 2024;45(36):3314-414.',
    ],
  },
  {
    id: 'chads2',
    name: 'Puntuación CHADS₂ para el riesgo de ictus en fibrilación auricular',
    shortName: 'CHADS₂',
    description:
      'Estima el riesgo anual de ictus en fibrilación auricular (escala clásica, hoy en general sustituida por CHA₂DS₂-VASc).',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'icc', type: 'boolean', label: 'Insuficiencia cardíaca congestiva (C)' },
      { id: 'hta', type: 'boolean', label: 'Hipertensión arterial (H)' },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 75 años (A)' },
      { id: 'dm', type: 'boolean', label: 'Diabetes mellitus (D)' },
      { id: 'ictus', type: 'boolean', label: 'Ictus o AIT previos (S₂)', points: 2 },
    ],
    compute: (v) => {
      const score = sum(v, ['icc', 'hta', 'edad', 'dm', 'ictus'])
      const riesgo = [1.9, 2.8, 4.0, 5.9, 8.5, 12.5, 18.2][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–6)',
        secondary: `${fmt(riesgo, 1)} %`,
        secondaryLabel: 'riesgo anual de ictus',
        interpretation:
          score >= 2
            ? 'Riesgo moderado-alto: anticoagulación oral recomendada.'
            : score === 1
              ? 'Riesgo intermedio: valorar anticoagulación (las guías actuales recomiendan reevaluar con CHA₂DS₂-VASc).'
              : 'Riesgo bajo según CHADS₂; conviene refinar con CHA₂DS₂-VASc antes de descartar la anticoagulación.',
        level: score >= 2 ? 'danger' : score === 1 ? 'warn' : 'ok',
      }
    },
    references: [
      'Gage BF, et al. Validation of clinical classification schemes for predicting stroke (CHADS2). JAMA. 2001;285(22):2864-70.',
    ],
  },
  {
    id: 'has-bled',
    name: 'Puntuación HAS-BLED de riesgo hemorrágico',
    shortName: 'HAS-BLED',
    description:
      'Estima el riesgo de hemorragia mayor en pacientes anticoagulados por fibrilación auricular.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'hta', type: 'boolean', label: 'Hipertensión no controlada (H)', description: 'PA sistólica > 160 mmHg.' },
      { id: 'renal', type: 'boolean', label: 'Función renal alterada (A)', description: 'Diálisis, trasplante o creatinina > 2,26 mg/dL.' },
      { id: 'hepatica', type: 'boolean', label: 'Función hepática alterada (A)', description: 'Cirrosis, bilirrubina > 2× o transaminasas > 3× el límite superior.' },
      { id: 'ictus', type: 'boolean', label: 'Ictus previo (S)' },
      { id: 'sangrado', type: 'boolean', label: 'Antecedente o predisposición a hemorragia (B)', description: 'Hemorragia mayor previa, anemia o diátesis hemorrágica.' },
      { id: 'inr', type: 'boolean', label: 'INR lábil (L)', description: 'Tiempo en rango terapéutico < 60 % (solo si toma antivitamina K).' },
      { id: 'edad', type: 'boolean', label: 'Edad > 65 años (E)' },
      { id: 'farmacos', type: 'boolean', label: 'Fármacos que favorecen el sangrado (D)', description: 'Antiagregantes o AINE.' },
      { id: 'alcohol', type: 'boolean', label: 'Consumo de alcohol (D)', description: '≥ 8 unidades a la semana.' },
    ],
    compute: (v) => {
      const score = sum(v, ['hta', 'renal', 'hepatica', 'ictus', 'sangrado', 'inr', 'edad', 'farmacos', 'alcohol'])
      const tasas = [1.13, 1.02, 1.88, 3.74, 8.7, 12.5]
      const tasa = score <= 5 ? tasas[score] : 12.5
      return {
        main: String(score),
        mainUnit: 'puntos (0–9)',
        secondary: `≈ ${fmt(tasa, 1)}`,
        secondaryLabel: 'hemorragias mayores / 100 pacientes-año',
        interpretation:
          score >= 3
            ? 'Riesgo hemorrágico alto: no contraindica por sí solo la anticoagulación; corregir los factores modificables (HTA, INR lábil, fármacos, alcohol) y programar controles más frecuentes.'
            : 'Riesgo hemorrágico bajo-moderado con las precauciones habituales.',
        level: score >= 3 ? 'danger' : score >= 2 ? 'warn' : 'ok',
      }
    },
    notes: [
      'HAS-BLED sirve para identificar y corregir factores de riesgo modificables, no para negar la anticoagulación.',
      'Tasas orientativas de la cohorte original (puntuaciones ≥ 5 con pocos pacientes).',
    ],
    references: [
      'Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation. Chest. 2010;138(5):1093-100.',
    ],
  },
  {
    id: 'orbit',
    name: 'Puntuación ORBIT de riesgo hemorrágico en fibrilación auricular',
    shortName: 'ORBIT',
    description:
      'Predice el riesgo de hemorragia mayor en pacientes con fibrilación auricular anticoagulados.',
    category: CAT,
    specialty: CARD,
    inputs: [
      {
        id: 'anemia',
        type: 'boolean',
        label: 'Hemoglobina reducida o anemia',
        description: 'Hb < 13 g/dL en varones o < 12 g/dL en mujeres, o hematocrito < 40/36 %.',
        points: 2,
      },
      { id: 'edad', type: 'boolean', label: 'Edad > 74 años' },
      { id: 'sangrado', type: 'boolean', label: 'Antecedente de sangrado', description: 'Hemorragia digestiva, intracraneal o ictus hemorrágico previos.', points: 2 },
      { id: 'renal', type: 'boolean', label: 'Insuficiencia renal (FGe < 60 mL/min/1,73 m²)' },
      { id: 'antiagregante', type: 'boolean', label: 'Tratamiento antiagregante concomitante' },
    ],
    compute: (v) => {
      const score = sum(v, ['anemia', 'edad', 'sangrado', 'renal', 'antiagregante'])
      const banda = score <= 2 ? 'bajo' : score === 3 ? 'intermedio' : 'alto'
      const tasa = score <= 2 ? 2.4 : score === 3 ? 4.7 : 8.1
      return {
        main: String(score),
        mainUnit: 'puntos (0–7)',
        secondary: `≈ ${fmt(tasa, 1)}`,
        secondaryLabel: 'hemorragias mayores / 100 pacientes-año',
        interpretation: `Riesgo hemorrágico ${banda}. Igual que HAS-BLED, orienta a corregir factores modificables y a intensificar el seguimiento, no a suspender la anticoagulación de forma automática.`,
        level: score <= 2 ? 'ok' : score === 3 ? 'warn' : 'danger',
      }
    },
    references: [
      "O'Brien EC, et al. The ORBIT bleeding score: a simple bedside score to assess bleeding risk in atrial fibrillation. Eur Heart J. 2015;36(46):3258-64.",
    ],
  },
  {
    id: 'atria-hemorragia',
    name: 'Puntuación ATRIA de riesgo hemorrágico',
    shortName: 'ATRIA (hemorragia)',
    description: 'Determina el riesgo de hemorragia mayor en pacientes anticoagulados con warfarina.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'anemia', type: 'boolean', label: 'Anemia', description: 'Hb < 13 g/dL en varones o < 12 g/dL en mujeres.', points: 3 },
      { id: 'renal', type: 'boolean', label: 'Enfermedad renal grave', description: 'FGe < 30 mL/min o diálisis.', points: 3 },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 75 años', points: 2 },
      { id: 'sangrado', type: 'boolean', label: 'Hemorragia previa' },
      { id: 'hta', type: 'boolean', label: 'Hipertensión arterial' },
    ],
    compute: (v) => {
      const score = sum(v, ['anemia', 'renal', 'edad', 'sangrado', 'hta'])
      const banda = score <= 3 ? 'bajo' : score === 4 ? 'intermedio' : 'alto'
      const tasa = score <= 3 ? 0.8 : score === 4 ? 2.6 : 5.8
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        secondary: `≈ ${fmt(tasa, 1)} %`,
        secondaryLabel: 'hemorragias mayores al año',
        interpretation: `Riesgo hemorrágico ${banda} con warfarina.`,
        level: score <= 3 ? 'ok' : score === 4 ? 'warn' : 'danger',
      }
    },
    references: [
      'Fang MC, et al. A new risk scheme to predict warfarin-associated hemorrhage (ATRIA). J Am Coll Cardiol. 2011;58(4):395-401.',
    ],
  },
  {
    id: 'hemorr2hages',
    name: 'Puntuación HEMORR₂HAGES de riesgo hemorrágico',
    shortName: 'HEMORR₂HAGES',
    description:
      'Cuantifica el riesgo hemorrágico en pacientes (sobre todo ancianos) con fibrilación auricular anticoagulados.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'hepatorenal', type: 'boolean', label: 'Enfermedad hepática o renal (H)' },
      { id: 'etanol', type: 'boolean', label: 'Abuso de alcohol (E)' },
      { id: 'cancer', type: 'boolean', label: 'Neoplasia (M)' },
      { id: 'edad', type: 'boolean', label: 'Edad > 75 años (O)' },
      { id: 'plaquetas', type: 'boolean', label: 'Cifra o función plaquetaria reducidas (R)', description: 'Trombopenia o antiagregación.' },
      { id: 'resangrado', type: 'boolean', label: 'Hemorragia previa (R₂)', points: 2 },
      { id: 'hta', type: 'boolean', label: 'Hipertensión no controlada (H)' },
      { id: 'anemia', type: 'boolean', label: 'Anemia (A)' },
      { id: 'genetico', type: 'boolean', label: 'Factores genéticos (G)', description: 'Polimorfismos de CYP2C9, si se conocen.' },
      { id: 'caidas', type: 'boolean', label: 'Riesgo elevado de caídas (E)' },
      { id: 'ictus', type: 'boolean', label: 'Ictus previo (S)' },
    ],
    compute: (v) => {
      const score = sum(v, ['hepatorenal', 'etanol', 'cancer', 'edad', 'plaquetas', 'resangrado', 'hta', 'anemia', 'genetico', 'caidas', 'ictus'])
      const banda = score <= 1 ? 'bajo' : score <= 3 ? 'intermedio' : 'alto'
      return {
        main: String(score),
        mainUnit: 'puntos (0–12)',
        interpretation: `Riesgo hemorrágico ${banda} (orientativo: de ≈ 1,9 hemorragias/100 pacientes-año con 0 puntos a > 12 con ≥ 5). En riesgo alto, intensificar la vigilancia y corregir factores modificables.`,
        level: score <= 1 ? 'ok' : score <= 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Gage BF, et al. Clinical classification schemes for predicting hemorrhage (HEMORR2HAGES). Am Heart J. 2006;151(3):713-9.',
    ],
  },
  {
    id: 'dapt',
    name: 'Puntuación DAPT (doble antiagregación prolongada)',
    shortName: 'DAPT',
    description:
      'Identifica a los pacientes que se beneficiarían de prolongar la doble antiagregación más allá de 12 meses tras el implante de un stent coronario.',
    category: CAT,
    specialty: CARD,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 65 años', value: 0 },
          { label: '65–74 años', value: -1 },
          { label: '≥ 75 años', value: -2 },
        ],
      },
      { id: 'tabaco', type: 'boolean', label: 'Fumador actual' },
      { id: 'dm', type: 'boolean', label: 'Diabetes mellitus' },
      { id: 'iamActual', type: 'boolean', label: 'Infarto de miocardio en la presentación' },
      { id: 'previo', type: 'boolean', label: 'IAM o ICP previos' },
      { id: 'paclitaxel', type: 'boolean', label: 'Stent liberador de paclitaxel' },
      { id: 'diametro', type: 'boolean', label: 'Diámetro del stent < 3 mm' },
      { id: 'icc', type: 'boolean', label: 'Insuficiencia cardíaca o FEVI < 30 %', points: 2 },
      { id: 'safena', type: 'boolean', label: 'Stent en injerto de vena safena', points: 2 },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'tabaco', 'dm', 'iamActual', 'previo', 'paclitaxel', 'diametro', 'icc', 'safena'])
      return {
        main: String(score),
        mainUnit: 'puntos (−2 a 10)',
        interpretation:
          score >= 2
            ? 'Puntuación ≥ 2: relación beneficio/riesgo favorable a prolongar la doble antiagregación (menos eventos isquémicos que hemorragias añadidas).'
            : 'Puntuación < 2: la prolongación de la doble antiagregación aporta poco beneficio isquémico con más riesgo hemorrágico; en general, no prolongar.',
        level: score >= 2 ? 'info' : 'warn',
      }
    },
    notes: ['Aplicable a pacientes que han completado 12 meses de doble antiagregación sin eventos isquémicos ni hemorrágicos mayores.'],
    references: [
      'Yeh RW, et al. Development and validation of a prediction rule for benefit and harm of dual antiplatelet therapy beyond 1 year after percutaneous coronary intervention. JAMA. 2016;315(16):1735-49.',
    ],
  },
]
