import type { Calculator } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Tromboembolismo venoso'
const CARD = ['Cardiología']

export const cardioTEV: Calculator[] = [
  {
    id: 'wells-ep',
    name: 'Criterios de Wells para la embolia pulmonar',
    shortName: 'Wells EP',
    description:
      'Calcula la probabilidad clínica (pretest) de embolia pulmonar para decidir los siguientes pasos diagnósticos.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'tvp', type: 'boolean', label: 'Signos clínicos de TVP', description: 'Edema y dolor a la palpación de la pierna.', points: 3 },
      { id: 'primera', type: 'boolean', label: 'La EP es el diagnóstico más probable (o igual de probable)', points: 3 },
      { id: 'fc', type: 'boolean', label: 'Frecuencia cardíaca > 100 lpm', points: 1.5 },
      { id: 'inmovilizacion', type: 'boolean', label: 'Inmovilización ≥ 3 días o cirugía en las últimas 4 semanas', points: 1.5 },
      { id: 'previo', type: 'boolean', label: 'TVP o EP previas', points: 1.5 },
      { id: 'hemoptisis', type: 'boolean', label: 'Hemoptisis' },
      { id: 'cancer', type: 'boolean', label: 'Neoplasia activa', description: 'En tratamiento, tratada en los últimos 6 meses o paliativa.' },
    ],
    compute: (v) => {
      const score = sum(v, ['tvp', 'primera', 'fc', 'inmovilizacion', 'previo', 'hemoptisis', 'cancer'])
      const tres = score < 2 ? 'baja' : score <= 6 ? 'intermedia' : 'alta'
      const dos = score <= 4 ? 'EP improbable' : 'EP probable'
      return {
        main: fmt(score, 1),
        mainUnit: 'puntos',
        secondary: dos,
        secondaryLabel: 'modelo de dos niveles',
        interpretation:
          score <= 4
            ? `Probabilidad ${tres} (tres niveles). Con «EP improbable» (≤ 4): dímero D; si es negativo, la EP queda razonablemente excluida.`
            : `Probabilidad ${tres} (tres niveles). Con «EP probable» (> 4): angio-TC pulmonar directamente (el dímero D no basta para excluir).`,
        level: score < 2 ? 'ok' : score <= 4 ? 'info' : score <= 6 ? 'warn' : 'danger',
      }
    },
    references: [
      'Wells PS, et al. Derivation of a simple clinical model to categorize patients probability of pulmonary embolism. Thromb Haemost. 2000;83(3):416-20.',
    ],
  },
  {
    id: 'wells-tvp',
    name: 'Criterios de Wells para la trombosis venosa profunda',
    shortName: 'Wells TVP',
    description: 'Calcula la probabilidad clínica de trombosis venosa profunda.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'cancer', type: 'boolean', label: 'Neoplasia activa', description: 'En tratamiento actual, en los últimos 6 meses o paliativa.' },
      { id: 'paralisis', type: 'boolean', label: 'Parálisis, paresia o inmovilización reciente con yeso de una pierna' },
      { id: 'encamado', type: 'boolean', label: 'Encamado ≥ 3 días o cirugía mayor en las últimas 12 semanas' },
      { id: 'dolor', type: 'boolean', label: 'Dolor a la palpación del trayecto venoso profundo' },
      { id: 'edemaPierna', type: 'boolean', label: 'Edema de toda la pierna' },
      { id: 'pantorrilla', type: 'boolean', label: 'Perímetro de la pantorrilla > 3 cm mayor que el contralateral', description: 'Medido 10 cm bajo la tuberosidad tibial.' },
      { id: 'fovea', type: 'boolean', label: 'Edema con fóvea limitado a la pierna sintomática' },
      { id: 'colaterales', type: 'boolean', label: 'Venas superficiales colaterales (no varicosas)' },
      { id: 'previa', type: 'boolean', label: 'TVP previa documentada' },
      { id: 'alternativo', type: 'boolean', label: 'Diagnóstico alternativo al menos igual de probable', points: -2 },
    ],
    compute: (v) => {
      const score = sum(v, ['cancer', 'paralisis', 'encamado', 'dolor', 'edemaPierna', 'pantorrilla', 'fovea', 'colaterales', 'previa', 'alternativo'])
      const banda = score <= 0 ? 'baja (≈ 5 %)' : score <= 2 ? 'moderada (≈ 17 %)' : 'alta (≈ 17–53 %)'
      return {
        main: String(score),
        mainUnit: 'puntos',
        secondary: score >= 2 ? 'TVP probable' : 'TVP improbable',
        secondaryLabel: 'modelo de dos niveles',
        interpretation:
          score >= 2
            ? `Probabilidad ${banda}. Con «TVP probable» (≥ 2): ecografía de compresión; el dímero D negativo no excluye por sí solo.`
            : `Probabilidad ${banda}. Con «TVP improbable» (< 2): dímero D; si es negativo, la TVP queda razonablemente excluida.`,
        level: score <= 0 ? 'ok' : score <= 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Wells PS, et al. Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med. 2003;349(13):1227-35.',
    ],
  },
  {
    id: 'perc',
    name: 'Regla PERC para la embolia pulmonar',
    shortName: 'PERC',
    description:
      'Descarta la embolia pulmonar sin más pruebas cuando la probabilidad clínica es baja (< 15 %) y no se cumple ningún criterio.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 50 años' },
      { id: 'fc', type: 'boolean', label: 'Frecuencia cardíaca ≥ 100 lpm' },
      { id: 'spo2', type: 'boolean', label: 'SpO₂ < 95 % (aire ambiente)' },
      { id: 'edema', type: 'boolean', label: 'Edema unilateral de una pierna' },
      { id: 'hemoptisis', type: 'boolean', label: 'Hemoptisis' },
      { id: 'cirugia', type: 'boolean', label: 'Cirugía o traumatismo en las últimas 4 semanas' },
      { id: 'previo', type: 'boolean', label: 'TVP o EP previas' },
      { id: 'hormonas', type: 'boolean', label: 'Uso de estrógenos', description: 'Anticonceptivos, terapia hormonal.' },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'fc', 'spo2', 'edema', 'hemoptisis', 'cirugia', 'previo', 'hormonas'])
      return {
        main: String(score),
        mainUnit: score === 1 ? 'criterio' : 'criterios',
        interpretation:
          score === 0
            ? 'PERC negativa: en pacientes con probabilidad clínica baja (< 15 %), la EP queda descartada sin necesidad de dímero D (riesgo residual < 2 %).'
            : 'PERC positiva: no permite descartar la EP; continuar con dímero D o imagen según la probabilidad clínica.',
        level: score === 0 ? 'ok' : 'warn',
      }
    },
    notes: ['Solo aplicable si la impresión clínica previa es de probabilidad baja; no usar en pacientes de probabilidad intermedia o alta.'],
    references: [
      'Kline JA, et al. Clinical criteria to prevent unnecessary diagnostic testing in emergency department patients with suspected pulmonary embolism. J Thromb Haemost. 2004;2(8):1247-55.',
    ],
  },
  {
    id: 'ginebra',
    name: 'Puntuación de Ginebra revisada para la embolia pulmonar',
    shortName: 'Ginebra revisada',
    description: 'Objetiva la probabilidad clínica de embolia pulmonar (alternativa a los criterios de Wells).',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad > 65 años' },
      { id: 'previo', type: 'boolean', label: 'TVP o EP previas', points: 3 },
      { id: 'cirugia', type: 'boolean', label: 'Cirugía o fractura en el último mes', points: 2 },
      { id: 'cancer', type: 'boolean', label: 'Neoplasia activa', points: 2 },
      { id: 'dolorUnilateral', type: 'boolean', label: 'Dolor unilateral en una pierna', points: 3 },
      { id: 'hemoptisis', type: 'boolean', label: 'Hemoptisis', points: 2 },
      {
        id: 'fc',
        type: 'select',
        label: 'Frecuencia cardíaca',
        options: [
          { label: '< 75 lpm', value: 0 },
          { label: '75–94 lpm', value: 3 },
          { label: '≥ 95 lpm', value: 5 },
        ],
      },
      {
        id: 'palpacion',
        type: 'boolean',
        label: 'Dolor a la palpación venosa profunda y edema unilateral',
        points: 4,
      },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'previo', 'cirugia', 'cancer', 'dolorUnilateral', 'hemoptisis', 'fc', 'palpacion'])
      const banda = score <= 3 ? 'baja (≈ 8 %)' : score <= 10 ? 'intermedia (≈ 28 %)' : 'alta (≈ 74 %)'
      return {
        main: String(score),
        mainUnit: 'puntos (0–25)',
        interpretation: `Probabilidad clínica ${banda} de embolia pulmonar. Probabilidad baja-intermedia: dímero D; probabilidad alta: imagen directamente.`,
        level: score <= 3 ? 'ok' : score <= 10 ? 'warn' : 'danger',
      }
    },
    references: [
      'Le Gal G, et al. Prediction of pulmonary embolism in the emergency department: the revised Geneva score. Ann Intern Med. 2006;144(3):165-71.',
    ],
  },
  {
    id: 'pesi',
    name: 'Índice de gravedad de la embolia pulmonar (PESI)',
    shortName: 'PESI',
    description: 'Predice la mortalidad a 30 días en pacientes con embolia pulmonar confirmada.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'edad', type: 'number', label: 'Edad (suma 1 punto por año)', unit: 'años', min: 18, max: 110 },
      { id: 'varon', type: 'boolean', label: 'Sexo masculino', points: 10 },
      { id: 'cancer', type: 'boolean', label: 'Neoplasia', points: 30 },
      { id: 'icc', type: 'boolean', label: 'Insuficiencia cardíaca crónica', points: 10 },
      { id: 'epoc', type: 'boolean', label: 'Enfermedad pulmonar crónica', points: 10 },
      { id: 'fc', type: 'boolean', label: 'Frecuencia cardíaca ≥ 110 lpm', points: 20 },
      { id: 'pas', type: 'boolean', label: 'PA sistólica < 100 mmHg', points: 30 },
      { id: 'fr', type: 'boolean', label: 'Frecuencia respiratoria ≥ 30 rpm', points: 20 },
      { id: 'temp', type: 'boolean', label: 'Temperatura < 36 °C', points: 20 },
      { id: 'mental', type: 'boolean', label: 'Alteración del estado mental', description: 'Desorientación, letargo, estupor o coma.', points: 60 },
      { id: 'spo2', type: 'boolean', label: 'SpO₂ < 90 %', points: 20 },
    ],
    compute: (v) => {
      const score =
        v.edad! + sum(v, ['varon', 'cancer', 'icc', 'epoc', 'fc', 'pas', 'fr', 'temp', 'mental', 'spo2'])
      const clase = score <= 65 ? 1 : score <= 85 ? 2 : score <= 105 ? 3 : score <= 125 ? 4 : 5
      const mort = ['', '0–1,6 %', '1,7–3,5 %', '3,2–7,1 %', '4,0–11,4 %', '10–24,5 %'][clase]
      return {
        main: String(score),
        mainUnit: `puntos — clase ${['', 'I', 'II', 'III', 'IV', 'V'][clase]}`,
        secondary: mort,
        secondaryLabel: 'mortalidad a 30 días',
        interpretation:
          clase <= 2
            ? 'Clases I–II (riesgo bajo): candidato a tratamiento ambulatorio o alta precoz si no hay otros motivos de ingreso.'
            : clase === 3
              ? 'Clase III (riesgo intermedio): ingreso y vigilancia.'
              : 'Clases IV–V (riesgo alto): ingreso, considerar unidad de intermedios/UCI y evaluar disfunción del ventrículo derecho.',
        level: clase <= 2 ? 'ok' : clase === 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Aujesky D, et al. Derivation and validation of a prognostic model for pulmonary embolism. Am J Respir Crit Care Med. 2005;172(8):1041-6.',
    ],
  },
  {
    id: 'spesi',
    name: 'PESI simplificado (sPESI)',
    shortName: 'sPESI',
    description: 'Predice la mortalidad a 30 días en la embolia pulmonar con solo seis criterios.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad > 80 años' },
      { id: 'cancer', type: 'boolean', label: 'Neoplasia' },
      { id: 'cardiopulmonar', type: 'boolean', label: 'Enfermedad cardiopulmonar crónica', description: 'Insuficiencia cardíaca o enfermedad pulmonar crónica.' },
      { id: 'fc', type: 'boolean', label: 'Frecuencia cardíaca ≥ 110 lpm' },
      { id: 'pas', type: 'boolean', label: 'PA sistólica < 100 mmHg' },
      { id: 'spo2', type: 'boolean', label: 'SpO₂ < 90 %' },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'cancer', 'cardiopulmonar', 'fc', 'pas', 'spo2'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–6)',
        secondary: score === 0 ? '≈ 1,0 %' : '≈ 10,9 %',
        secondaryLabel: 'mortalidad a 30 días',
        interpretation:
          score === 0
            ? 'sPESI = 0: riesgo bajo; candidato a tratamiento ambulatorio o alta precoz si el resto del contexto lo permite.'
            : 'sPESI ≥ 1: riesgo no bajo; ingreso y estratificación adicional (biomarcadores, función del ventrículo derecho).',
        level: score === 0 ? 'ok' : 'danger',
      }
    },
    references: [
      'Jiménez D, et al. Simplification of the Pulmonary Embolism Severity Index for prognostication in patients with acute symptomatic pulmonary embolism. Arch Intern Med. 2010;170(15):1383-9.',
    ],
  },
  {
    id: 'hestia',
    name: 'Criterios de Hestia para el tratamiento ambulatorio de la EP',
    shortName: 'Hestia',
    description:
      'Identifica a los pacientes con embolia pulmonar aguda que pueden tratarse de forma ambulatoria.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'inestable', type: 'boolean', label: 'Inestabilidad hemodinámica', description: 'PAS < 100 mmHg con FC > 100 lpm; o necesidad de UCI/vasoactivos.' },
      { id: 'trombolisis', type: 'boolean', label: 'Necesidad de trombólisis o embolectomía' },
      { id: 'sangradoActivo', type: 'boolean', label: 'Hemorragia activa o riesgo hemorrágico alto' },
      { id: 'oxigeno', type: 'boolean', label: 'Necesidad de oxígeno para mantener SpO₂ > 90 % durante más de 24 h' },
      { id: 'anticoagulado', type: 'boolean', label: 'EP diagnosticada estando ya anticoagulado' },
      { id: 'dolor', type: 'boolean', label: 'Dolor intenso que requiere analgesia intravenosa > 24 h' },
      { id: 'social', type: 'boolean', label: 'Motivo médico o social que exige ingreso > 24 h' },
      { id: 'renal', type: 'boolean', label: 'Aclaramiento de creatinina < 30 mL/min' },
      { id: 'hepatica', type: 'boolean', label: 'Insuficiencia hepática grave' },
      { id: 'embarazo', type: 'boolean', label: 'Embarazo' },
      { id: 'tih', type: 'boolean', label: 'Antecedente documentado de trombopenia inducida por heparina' },
    ],
    compute: (v) => {
      const score = sum(v, ['inestable', 'trombolisis', 'sangradoActivo', 'oxigeno', 'anticoagulado', 'dolor', 'social', 'renal', 'hepatica', 'embarazo', 'tih'])
      return {
        main: String(score),
        mainUnit: score === 1 ? 'criterio' : 'criterios',
        interpretation:
          score === 0
            ? 'Ningún criterio de Hestia: candidato a tratamiento ambulatorio de la EP (mortalidad y recurrencias bajas en las cohortes de validación).'
            : 'Uno o más criterios presentes: se recomienda tratamiento hospitalario.',
        level: score === 0 ? 'ok' : 'danger',
      }
    },
    references: [
      'Zondag W, et al. Outpatient treatment in patients with acute pulmonary embolism: the Hestia Study. J Thromb Haemost. 2011;9(8):1500-7.',
    ],
  },
  {
    id: 'padua',
    name: 'Puntuación de Padua para el riesgo de TEV en pacientes hospitalizados',
    shortName: 'Padua',
    description:
      'Determina la necesidad de tromboprofilaxis en pacientes médicos hospitalizados según su riesgo de tromboembolismo venoso.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'cancer', type: 'boolean', label: 'Cáncer activo', description: 'Metástasis o quimioterapia/radioterapia en los últimos 6 meses.', points: 3 },
      { id: 'previo', type: 'boolean', label: 'TEV previo (excluida la trombosis superficial)', points: 3 },
      { id: 'movilidad', type: 'boolean', label: 'Movilidad reducida', description: 'Encamamiento ≥ 3 días (con permiso para el baño).', points: 3 },
      { id: 'trombofilia', type: 'boolean', label: 'Trombofilia conocida', points: 3 },
      { id: 'trauma', type: 'boolean', label: 'Traumatismo o cirugía en el último mes', points: 2 },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 70 años' },
      { id: 'cardioresp', type: 'boolean', label: 'Insuficiencia cardíaca o respiratoria' },
      { id: 'iamIctus', type: 'boolean', label: 'IAM o ictus isquémico agudos' },
      { id: 'infeccion', type: 'boolean', label: 'Infección aguda o enfermedad reumatológica' },
      { id: 'obesidad', type: 'boolean', label: 'Obesidad (IMC ≥ 30)' },
      { id: 'hormonal', type: 'boolean', label: 'Tratamiento hormonal en curso' },
    ],
    compute: (v) => {
      const score = sum(v, ['cancer', 'previo', 'movilidad', 'trombofilia', 'trauma', 'edad', 'cardioresp', 'iamIctus', 'infeccion', 'obesidad', 'hormonal'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–20)',
        interpretation:
          score >= 4
            ? 'Riesgo alto de TEV (≥ 4): indicada la tromboprofilaxis farmacológica si no hay contraindicación (si el riesgo hemorrágico es alto, profilaxis mecánica).'
            : 'Riesgo bajo de TEV (< 4): en general no requiere profilaxis farmacológica; fomentar la movilización precoz.',
        level: score >= 4 ? 'danger' : 'ok',
      }
    },
    references: [
      'Barbar S, et al. A risk assessment model for the identification of hospitalized medical patients at risk for venous thromboembolism: the Padua Prediction Score. J Thromb Haemost. 2010;8(11):2450-7.',
    ],
  },
  {
    id: 'improve-tev',
    name: 'Puntuación IMPROVE de riesgo de TEV',
    shortName: 'IMPROVE',
    description:
      'Predice el riesgo de tromboembolismo venoso a 3 meses en pacientes médicos hospitalizados.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'previo', type: 'boolean', label: 'TEV previo', points: 3 },
      { id: 'trombofilia', type: 'boolean', label: 'Trombofilia conocida', points: 2 },
      { id: 'paralisis', type: 'boolean', label: 'Parálisis de miembros inferiores actual', points: 2 },
      { id: 'cancer', type: 'boolean', label: 'Cáncer activo', points: 2 },
      { id: 'inmovilizacion', type: 'boolean', label: 'Inmovilización ≥ 7 días', description: 'Inmediatamente antes y durante el ingreso.' },
      { id: 'uci', type: 'boolean', label: 'Estancia en UCI o unidad coronaria' },
      { id: 'edad', type: 'boolean', label: 'Edad > 60 años' },
    ],
    compute: (v) => {
      const score = sum(v, ['previo', 'trombofilia', 'paralisis', 'cancer', 'inmovilizacion', 'uci', 'edad'])
      const riesgo =
        score === 0 ? '0,4 %' : score === 1 ? '0,6 %' : score === 2 ? '1,0 %' : score === 3 ? '1,7 %' : score === 4 ? '2,9 %' : '≥ 5 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–12)',
        secondary: riesgo,
        secondaryLabel: 'TEV sintomático a 3 meses',
        interpretation:
          score < 2
            ? 'Riesgo bajo (< 2): la profilaxis farmacológica aporta poco beneficio en la mayoría de los casos.'
            : 'Riesgo aumentado (≥ 2): valorar tromboprofilaxis farmacológica si no hay contraindicación.',
        level: score < 2 ? 'ok' : score <= 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Spyropoulos AC, et al. Predictive and associative models to identify hospitalized medical patients at risk for VTE (IMPROVE). Chest. 2011;140(3):706-14.',
    ],
  },
  {
    id: 'dash',
    name: 'Puntuación DASH para la recurrencia del TEV',
    shortName: 'DASH',
    description:
      'Predice la probabilidad de recurrencia tras un primer episodio de TEV no provocado, para orientar la duración de la anticoagulación.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'dimero', type: 'boolean', label: 'Dímero D anormal tras suspender la anticoagulación (D)', points: 2 },
      { id: 'edad', type: 'boolean', label: 'Edad < 50 años (A)' },
      { id: 'varon', type: 'boolean', label: 'Sexo masculino (S)' },
      { id: 'hormonal', type: 'boolean', label: 'TEV asociado a tratamiento hormonal (H)', description: 'En mujeres.', points: -2 },
    ],
    compute: (v) => {
      const score = sum(v, ['dimero', 'edad', 'varon', 'hormonal'])
      const anual = score <= 1 ? '≈ 3,1 %' : score === 2 ? '≈ 6,4 %' : '≈ 12,3 %'
      return {
        main: String(score),
        mainUnit: 'puntos (−2 a 4)',
        secondary: anual,
        secondaryLabel: 'recurrencia anual',
        interpretation:
          score <= 1
            ? 'Riesgo de recurrencia bajo: puede plantearse suspender la anticoagulación tras 3–6 meses, individualizando.'
            : 'Riesgo de recurrencia no bajo: valorar anticoagulación prolongada si el riesgo hemorrágico lo permite.',
        level: score <= 1 ? 'ok' : score === 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Tosetto A, et al. Predicting disease recurrence in patients with previous unprovoked venous thromboembolism: the DASH prediction score. J Thromb Haemost. 2012;10(6):1019-25.',
    ],
  },
  {
    id: 'riete',
    name: 'Puntuación RIETE de riesgo hemorrágico en el TEV',
    shortName: 'RIETE',
    description:
      'Estima el riesgo de hemorragia mayor durante los primeros 3 meses de anticoagulación por tromboembolismo venoso.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'sangrado', type: 'boolean', label: 'Hemorragia mayor reciente (último mes)', points: 2 },
      { id: 'creatinina', type: 'boolean', label: 'Creatinina > 1,2 mg/dL', points: 1.5 },
      { id: 'anemia', type: 'boolean', label: 'Anemia', description: 'Hb < 13 g/dL en varones o < 12 g/dL en mujeres.', points: 1.5 },
      { id: 'cancer', type: 'boolean', label: 'Neoplasia' },
      { id: 'ep', type: 'boolean', label: 'Presentación como EP sintomática (frente a TVP aislada)' },
      { id: 'edad', type: 'boolean', label: 'Edad > 75 años' },
    ],
    compute: (v) => {
      const score = sum(v, ['sangrado', 'creatinina', 'anemia', 'cancer', 'ep', 'edad'])
      const banda = score === 0 ? 'bajo (≈ 0,1 %)' : score <= 4 ? 'intermedio (≈ 2,8 %)' : 'alto (≈ 6,2 %)'
      return {
        main: fmt(score, 1),
        mainUnit: 'puntos (0–8)',
        interpretation: `Riesgo ${banda} de hemorragia mayor en los primeros 3 meses de anticoagulación. En riesgo alto: extremar la vigilancia y corregir factores modificables.`,
        level: score === 0 ? 'ok' : score <= 4 ? 'warn' : 'danger',
      }
    },
    references: [
      'Ruíz-Giménez N, et al. Predictive variables for major bleeding events in patients presenting with documented acute venous thromboembolism (RIETE). Thromb Haemost. 2008;100(1):26-31.',
    ],
  },
  {
    id: 'dimero-edad',
    name: 'Dímero D ajustado por edad',
    shortName: 'Dímero D por edad',
    description:
      'Ajusta el umbral del dímero D en mayores de 50 años para descartar el tromboembolismo venoso con menos falsos positivos.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 18, max: 110 },
      { id: 'dimero', type: 'number', label: 'Dímero D medido', unit: 'µg/L FEU', min: 0, max: 100000 },
    ],
    compute: (v) => {
      const umbral = v.edad! > 50 ? v.edad! * 10 : 500
      const negativo = v.dimero! < umbral
      return {
        main: `${fmt(umbral, 0)} µg/L`,
        mainUnit: 'umbral ajustado',
        secondary: negativo ? 'Negativo' : 'Positivo',
        secondaryLabel: 'resultado frente al umbral',
        interpretation: negativo
          ? 'Dímero D por debajo del umbral ajustado por edad: en pacientes con probabilidad clínica no alta, el TEV queda razonablemente excluido.'
          : 'Dímero D por encima del umbral ajustado: continuar el algoritmo diagnóstico con imagen.',
        level: negativo ? 'ok' : 'warn',
        details: ['Umbral = edad × 10 µg/L FEU en mayores de 50 años; 500 µg/L en ≤ 50 años.'],
      }
    },
    notes: [
      'Verifica las unidades de tu laboratorio: la regla está validada para unidades FEU (equivalentes de fibrinógeno); con unidades DDU el umbral convencional es 250 µg/L y el ajuste sería edad × 5.',
      'No aplicar con probabilidad clínica alta.',
    ],
    references: [
      'Righini M, et al. Age-adjusted D-dimer cutoff levels to rule out pulmonary embolism: the ADJUST-PE study. JAMA. 2014;311(11):1117-24.',
    ],
  },
  {
    id: 'villalta',
    name: 'Escala de Villalta para el síndrome postrombótico',
    shortName: 'Villalta',
    description:
      'Diagnostica y clasifica la gravedad del síndrome postrombótico tras una TVP de miembros inferiores.',
    category: CAT,
    specialty: CARD,
    inputs: [
      ...[
        ['dolorS', 'Síntoma: dolor'],
        ['calambres', 'Síntoma: calambres'],
        ['pesadez', 'Síntoma: pesadez'],
        ['parestesias', 'Síntoma: parestesias'],
        ['prurito', 'Síntoma: prurito'],
        ['edema', 'Signo: edema pretibial'],
        ['induracion', 'Signo: induración cutánea'],
        ['hiperpigmentacion', 'Signo: hiperpigmentación'],
        ['enrojecimiento', 'Signo: enrojecimiento'],
        ['ectasia', 'Signo: ectasia venosa'],
        ['dolorPantorrilla', 'Signo: dolor a la compresión de la pantorrilla'],
      ].map(([id, label]) => ({
        id,
        type: 'select' as const,
        label,
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Leve', value: 1 },
          { label: 'Moderado', value: 2 },
          { label: 'Grave', value: 3 },
        ],
      })),
      { id: 'ulcera', type: 'boolean', label: 'Úlcera venosa presente', noPoints: true },
    ],
    compute: (v) => {
      const score = sum(v, ['dolorS', 'calambres', 'pesadez', 'parestesias', 'prurito', 'edema', 'induracion', 'hiperpigmentacion', 'enrojecimiento', 'ectasia', 'dolorPantorrilla'])
      const ulcera = v.ulcera === 1
      const banda = ulcera || score >= 15 ? 'grave' : score >= 10 ? 'moderado' : score >= 5 ? 'leve' : 'sin SPT'
      return {
        main: String(score),
        mainUnit: 'puntos (0–33)',
        interpretation:
          banda === 'sin SPT'
            ? 'Puntuación < 5 sin úlcera: no hay síndrome postrombótico.'
            : `Síndrome postrombótico ${banda}${ulcera ? ' (la úlcera venosa clasifica automáticamente como grave)' : ''}. Optimizar la compresión y el seguimiento vascular.`,
        level: banda === 'sin SPT' ? 'ok' : banda === 'leve' ? 'info' : banda === 'moderado' ? 'warn' : 'danger',
      }
    },
    notes: ['5–9: leve · 10–14: moderado · ≥ 15 o úlcera venosa: grave. Evaluar preferiblemente tras ≥ 3–6 meses de la TVP aguda.'],
    references: [
      'Villalta S, et al. Assessment of validity and reproducibility of a clinical scale for the post-thrombotic syndrome. Haemostasis. 1994;24(Suppl 1):158a.',
      'Kahn SR. Measurement properties of the Villalta scale to define and classify the severity of the post-thrombotic syndrome. J Thromb Haemost. 2009;7(5):884-8.',
    ],
  },
]
