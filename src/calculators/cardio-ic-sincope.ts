import type { Calculator } from '../engine/types'
import { sum } from '../engine/types'

const CAT_IC = 'Insuficiencia cardíaca'
const CAT_SINCOPE = 'Síncope'
const CARD = ['Cardiología']

export const cardioICSincope: Calculator[] = [
  {
    id: 'nyha',
    name: 'Clasificación funcional NYHA de la insuficiencia cardíaca',
    shortName: 'NYHA',
    description: 'Clasifica la gravedad de la insuficiencia cardíaca según la limitación funcional.',
    category: CAT_IC,
    specialty: CARD,
    inputs: [
      {
        id: 'clase',
        type: 'select',
        label: 'Clase funcional',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'I — Sin limitación: la actividad física ordinaria no causa síntomas', value: 1 },
          { label: 'II — Limitación ligera: cómodo en reposo; la actividad ordinaria causa disnea, fatiga o palpitaciones', value: 2 },
          { label: 'III — Limitación marcada: cómodo en reposo; actividades menores causan síntomas', value: 3 },
          { label: 'IV — Síntomas en reposo o con cualquier actividad', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const c = v.clase ?? 1
      return {
        main: `NYHA ${['', 'I', 'II', 'III', 'IV'][c]}`,
        interpretation:
          c === 1
            ? 'Sin limitación funcional. Optimizar el tratamiento de base y los factores de riesgo.'
            : c === 2
              ? 'Limitación ligera. Revisar y titular el tratamiento recomendado por las guías.'
              : c === 3
                ? 'Limitación marcada. Optimización intensiva del tratamiento; valorar dispositivos según FEVI y criterios de las guías.'
                : 'Síntomas en reposo. Valorar terapias avanzadas (unidad de IC, dispositivos, trasplante) y cuidados paliativos si procede.',
        level: c === 1 ? 'ok' : c === 2 ? 'info' : c === 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'The Criteria Committee of the New York Heart Association. Nomenclature and Criteria for Diagnosis of Diseases of the Heart and Great Vessels. 9.ª ed. 1994.',
    ],
  },
  {
    id: 'acc-aha-ic',
    name: 'Estadios ACC/AHA de la insuficiencia cardíaca',
    shortName: 'Estadios ACC/AHA',
    description:
      'Describe las etapas evolutivas de la insuficiencia cardíaca, desde el riesgo hasta la enfermedad avanzada.',
    category: CAT_IC,
    specialty: CARD,
    inputs: [
      {
        id: 'estadio',
        type: 'select',
        label: 'Estadio',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'A — En riesgo: HTA, diabetes, obesidad, cardiotóxicos…, sin cardiopatía estructural ni síntomas', value: 1 },
          { label: 'B — Pre-insuficiencia cardíaca: cardiopatía estructural, biomarcadores elevados o FEVI reducida, sin síntomas', value: 2 },
          { label: 'C — Insuficiencia cardíaca sintomática (actual o previa)', value: 3 },
          { label: 'D — Insuficiencia cardíaca avanzada: síntomas que interfieren con la vida diaria y hospitalizaciones recurrentes pese a tratamiento óptimo', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const e = v.estadio ?? 1
      return {
        main: `Estadio ${['', 'A', 'B', 'C', 'D'][e]}`,
        interpretation: [
          '',
          'Prevención: control de los factores de riesgo (HTA, diabetes, lípidos), estilos de vida; considerar iSGLT2 en diabetes con riesgo cardiovascular.',
          'Prevenir la progresión: IECA/ARA-II y betabloqueantes si FEVI reducida o IAM previo; tratar la cardiopatía de base.',
          'Tratamiento según fenotipo y FEVI (cuádruple terapia en FEVI reducida), manejo de la congestión y de las comorbilidades.',
          'Terapias avanzadas: unidad especializada, soporte circulatorio mecánico, trasplante, o cuidados paliativos según objetivos del paciente.',
        ][e],
        level: e === 1 ? 'ok' : e === 2 ? 'info' : e === 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Heidenreich PA, et al. 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. Circulation. 2022;145(18):e895-e1032.',
    ],
  },
  {
    id: 'framingham-ic',
    name: 'Criterios de Framingham para el diagnóstico de insuficiencia cardíaca',
    shortName: 'Framingham IC',
    description:
      'Diagnostica la insuficiencia cardíaca congestiva mediante criterios clínicos mayores y menores.',
    category: CAT_IC,
    specialty: CARD,
    inputs: [
      { id: 'dpn', type: 'boolean', label: 'Mayor: disnea paroxística nocturna', noPoints: true },
      { id: 'yugular', type: 'boolean', label: 'Mayor: ingurgitación yugular', noPoints: true },
      { id: 'crepitantes', type: 'boolean', label: 'Mayor: crepitantes pulmonares', noPoints: true },
      { id: 'cardiomegalia', type: 'boolean', label: 'Mayor: cardiomegalia radiológica', noPoints: true },
      { id: 'eap', type: 'boolean', label: 'Mayor: edema agudo de pulmón', noPoints: true },
      { id: 's3', type: 'boolean', label: 'Mayor: galope por tercer ruido (S3)', noPoints: true },
      { id: 'pvc', type: 'boolean', label: 'Mayor: presión venosa central > 16 cmH₂O', noPoints: true },
      { id: 'reflujo', type: 'boolean', label: 'Mayor: reflujo hepatoyugular', noPoints: true },
      { id: 'perdidaPeso', type: 'boolean', label: 'Mayor: pérdida de > 4,5 kg en 5 días con el tratamiento', noPoints: true },
      { id: 'edemas', type: 'boolean', label: 'Menor: edemas bilaterales de tobillos', noPoints: true },
      { id: 'tos', type: 'boolean', label: 'Menor: tos nocturna', noPoints: true },
      { id: 'disnea', type: 'boolean', label: 'Menor: disnea de esfuerzo', noPoints: true },
      { id: 'hepatomegalia', type: 'boolean', label: 'Menor: hepatomegalia', noPoints: true },
      { id: 'derrame', type: 'boolean', label: 'Menor: derrame pleural', noPoints: true },
      { id: 'taquicardia', type: 'boolean', label: 'Menor: frecuencia cardíaca > 120 lpm', noPoints: true },
    ],
    compute: (v) => {
      const mayores = sum(v, ['dpn', 'yugular', 'crepitantes', 'cardiomegalia', 'eap', 's3', 'pvc', 'reflujo', 'perdidaPeso'])
      const menores = sum(v, ['edemas', 'tos', 'disnea', 'hepatomegalia', 'derrame', 'taquicardia'])
      const positivo = mayores >= 2 || (mayores >= 1 && menores >= 2)
      return {
        main: `${mayores} mayores · ${menores} menores`,
        interpretation: positivo
          ? 'Criterios de Framingham cumplidos (≥ 2 mayores, o 1 mayor + 2 menores): diagnóstico clínico de insuficiencia cardíaca. Confirmar con ecocardiograma y péptidos natriuréticos.'
          : 'Criterios no cumplidos: el diagnóstico clínico de insuficiencia cardíaca es poco probable por estos criterios; valorar otras causas y completar estudio si la sospecha persiste.',
        level: positivo ? 'danger' : 'ok',
      }
    },
    notes: ['Los criterios menores solo puntúan si no se explican por otra enfermedad.'],
    references: [
      'McKee PA, et al. The natural history of congestive heart failure: the Framingham study. N Engl J Med. 1971;285(26):1441-6.',
    ],
  },
  {
    id: 'h2fpef',
    name: 'Puntuación H₂FPEF para IC con fracción de eyección preservada',
    shortName: 'H₂FPEF',
    description:
      'Estima la probabilidad de que la disnea de un paciente con FEVI conservada se deba a insuficiencia cardíaca con FE preservada.',
    category: CAT_IC,
    specialty: CARD,
    inputs: [
      { id: 'obesidad', type: 'boolean', label: 'Obesidad (IMC > 30 kg/m²) — H (Heavy)', points: 2 },
      { id: 'hta', type: 'boolean', label: 'Tratamiento con ≥ 2 antihipertensivos — H (Hypertensive)' },
      { id: 'fa', type: 'boolean', label: 'Fibrilación auricular (paroxística o persistente) — F', points: 3 },
      { id: 'hp', type: 'boolean', label: 'Hipertensión pulmonar (PSAP > 35 mmHg en eco) — P' },
      { id: 'edad', type: 'boolean', label: 'Edad > 60 años — E (Elder)' },
      { id: 'ee', type: 'boolean', label: 'Presiones de llenado elevadas (E/e′ > 9) — F (Filling)' },
    ],
    compute: (v) => {
      const score = sum(v, ['obesidad', 'hta', 'fa', 'hp', 'edad', 'ee'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–9)',
        interpretation:
          score <= 1
            ? 'Probabilidad baja de ICFEp: buscar causas alternativas de la disnea.'
            : score <= 5
              ? 'Probabilidad intermedia: se recomienda estudio adicional (péptidos natriuréticos, eco de esfuerzo o cateterismo con ejercicio).'
              : 'Probabilidad alta de insuficiencia cardíaca con FE preservada: tratar y completar el estudio etiológico.',
        level: score <= 1 ? 'ok' : score <= 5 ? 'warn' : 'danger',
      }
    },
    references: [
      'Reddy YNV, et al. A simple, evidence-based approach to help guide diagnosis of heart failure with preserved ejection fraction (H2FPEF). Circulation. 2018;138(9):861-70.',
    ],
  },
  {
    id: 'ccs-angina',
    name: 'Clasificación de la angina de la Sociedad Cardiovascular Canadiense (CCS)',
    shortName: 'CCS',
    description: 'Gradúa la gravedad de la angina de esfuerzo.',
    category: CAT_IC,
    specialty: CARD,
    inputs: [
      {
        id: 'grado',
        type: 'select',
        label: 'Grado de angina',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'I — Solo con esfuerzos extenuantes, rápidos o prolongados; no con la actividad ordinaria', value: 1 },
          { label: 'II — Limitación ligera: al caminar deprisa, subir cuestas, tras las comidas, con frío o estrés', value: 2 },
          { label: 'III — Limitación marcada: al caminar 1–2 manzanas en llano o subir un piso a paso normal', value: 3 },
          { label: 'IV — Incapacidad para cualquier actividad sin angina; puede aparecer en reposo', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const g = v.grado ?? 1
      return {
        main: `CCS ${['', 'I', 'II', 'III', 'IV'][g]}`,
        interpretation:
          g <= 2
            ? 'Angina estable con limitación ausente o ligera: optimizar tratamiento antianginoso y control de factores de riesgo.'
            : 'Angina limitante (CCS III–IV): intensificar tratamiento y valorar coronariografía/revascularización según las guías.',
        level: g === 1 ? 'ok' : g === 2 ? 'info' : g === 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Campeau L. Grading of angina pectoris. Circulation. 1976;54(3):522-3.',
    ],
  },
  {
    id: 'sfsr',
    name: 'Regla de síncope de San Francisco',
    shortName: 'San Francisco',
    description:
      'Predice el riesgo de eventos graves a 7 días en pacientes con síncope o presíncope (regla CHESS).',
    category: CAT_SINCOPE,
    specialty: CARD,
    inputs: [
      { id: 'icc', type: 'boolean', label: 'Antecedente de insuficiencia cardíaca congestiva (C)' },
      { id: 'hto', type: 'boolean', label: 'Hematocrito < 30 % (H)' },
      { id: 'ecg', type: 'boolean', label: 'ECG anormal (E)', description: 'Cualquier cambio nuevo o ritmo no sinusal.' },
      { id: 'disnea', type: 'boolean', label: 'Disnea referida (S — Shortness of breath)' },
      { id: 'pas', type: 'boolean', label: 'PA sistólica < 90 mmHg en el triaje (S)' },
    ],
    compute: (v) => {
      const score = sum(v, ['icc', 'hto', 'ecg', 'disnea', 'pas'])
      return {
        main: String(score),
        mainUnit: score === 1 ? 'criterio' : 'criterios',
        interpretation:
          score === 0
            ? 'Regla negativa: riesgo bajo de evento grave a 7 días (sensibilidad ≈ 96 % en la derivación; menor en validaciones externas — integrar con el juicio clínico).'
            : 'Regla positiva: riesgo aumentado de evento grave (muerte, arritmia, IAM, embolia pulmonar, hemorragia…); se recomienda observación/ingreso y estudio.',
        level: score === 0 ? 'ok' : 'danger',
      }
    },
    references: [
      'Quinn JV, et al. Derivation of the San Francisco Syncope Rule to predict patients with short-term serious outcomes. Ann Emerg Med. 2004;43(2):224-32.',
    ],
  },
  {
    id: 'egsys',
    name: 'Puntuación EGSYS para el síncope de origen cardíaco',
    shortName: 'EGSYS',
    description: 'Estima la probabilidad de que un síncope sea de causa cardíaca.',
    category: CAT_SINCOPE,
    specialty: CARD,
    inputs: [
      { id: 'palpitaciones', type: 'boolean', label: 'Palpitaciones antes del síncope', points: 4 },
      { id: 'cardiopatia', type: 'boolean', label: 'Cardiopatía conocida o ECG anormal', points: 3 },
      { id: 'esfuerzo', type: 'boolean', label: 'Síncope durante el esfuerzo', points: 3 },
      { id: 'supino', type: 'boolean', label: 'Síncope en decúbito supino', points: 2 },
      { id: 'prodromos', type: 'boolean', label: 'Pródromos autonómicos', description: 'Náuseas o vómitos previos.', points: -1 },
      {
        id: 'precipitantes',
        type: 'boolean',
        label: 'Factores predisponentes o precipitantes',
        description: 'Lugar caluroso o concurrido, ortostatismo prolongado, miedo, dolor o emoción intensa.',
        points: -1,
      },
    ],
    compute: (v) => {
      const score = sum(v, ['palpitaciones', 'cardiopatia', 'esfuerzo', 'supino', 'prodromos', 'precipitantes'])
      return {
        main: String(score),
        mainUnit: 'puntos (−2 a 12)',
        interpretation:
          score >= 3
            ? 'EGSYS ≥ 3: síncope probablemente cardíaco (sensibilidad ≈ 95 %); ingreso o estudio cardiológico preferente. La mortalidad a 2 años es mayor en este grupo.'
            : 'EGSYS < 3: origen cardíaco poco probable; valorar causas reflejas/ortostáticas y completar la evaluación básica.',
        level: score >= 3 ? 'danger' : 'ok',
      }
    },
    references: [
      'Del Rosso A, et al. Clinical predictors of cardiac syncope at initial evaluation in patients referred urgently to a general hospital: the EGSYS score. Heart. 2008;94(12):1620-6.',
    ],
  },
  {
    id: 'oesil',
    name: 'Puntuación OESIL para el síncope',
    shortName: 'OESIL',
    description: 'Estima la mortalidad a 12 meses tras un episodio de síncope.',
    category: CAT_SINCOPE,
    specialty: CARD,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad > 65 años' },
      { id: 'cardiovascular', type: 'boolean', label: 'Enfermedad cardiovascular previa' },
      { id: 'prodromos', type: 'boolean', label: 'Síncope sin pródromos' },
      { id: 'ecg', type: 'boolean', label: 'ECG anormal' },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'cardiovascular', 'prodromos', 'ecg'])
      const mort = ['0 %', '0,6 %', '14 %', '29 %', '53 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–4)',
        secondary: mort,
        secondaryLabel: 'mortalidad a 12 meses (cohorte original)',
        interpretation:
          score <= 1
            ? 'Riesgo bajo: puede completarse el estudio de forma ambulatoria en la mayoría de los casos.'
            : 'Riesgo elevado (≥ 2): se recomienda ingreso u observación con estudio cardiológico.',
        level: score <= 1 ? 'ok' : score === 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Colivicchi F, et al. Development and prospective validation of a risk stratification system for patients with syncope in the emergency department: the OESIL risk score. Eur Heart J. 2003;24(9):811-9.',
    ],
  },
  {
    id: 'sincope-canadiense',
    name: 'Puntuación canadiense de riesgo en el síncope (CSRS)',
    shortName: 'Síncope canadiense',
    description:
      'Predice eventos adversos graves a 30 días en pacientes evaluados en urgencias por síncope.',
    category: CAT_SINCOPE,
    specialty: CARD,
    inputs: [
      { id: 'vasovagal', type: 'boolean', label: 'Predisposición vasovagal', description: 'Desencadenado por ortostatismo prolongado, lugar caluroso, emoción, miedo o dolor.', points: -1 },
      { id: 'cardiopatia', type: 'boolean', label: 'Antecedente de cardiopatía', description: 'EAC, FA/flutter, IC, valvulopatía.' },
      { id: 'pas', type: 'boolean', label: 'PA sistólica < 90 o > 180 mmHg en algún momento en urgencias', points: 2 },
      { id: 'troponina', type: 'boolean', label: 'Troponina elevada (> percentil 99)', points: 2 },
      { id: 'eje', type: 'boolean', label: 'Eje QRS anormal', description: '< −30° o > 100°.' },
      { id: 'qrs', type: 'boolean', label: 'Duración del QRS > 130 ms' },
      { id: 'qtc', type: 'boolean', label: 'QTc > 480 ms', points: 2 },
      { id: 'dxVasovagal', type: 'boolean', label: 'Diagnóstico en urgencias: síncope vasovagal', points: -2 },
      { id: 'dxCardiaco', type: 'boolean', label: 'Diagnóstico en urgencias: síncope cardíaco', points: 2 },
    ],
    compute: (v) => {
      const score = sum(v, ['vasovagal', 'cardiopatia', 'pas', 'troponina', 'eje', 'qrs', 'qtc', 'dxVasovagal', 'dxCardiaco'])
      const banda =
        score <= -2 ? 'muy bajo (≈ 0,4 %)' : score <= 0 ? 'bajo (≈ 1–2 %)' : score <= 3 ? 'intermedio (≈ 3–8 %)' : score <= 5 ? 'alto (≈ 13–20 %)' : 'muy alto (> 25 %)'
      return {
        main: String(score),
        mainUnit: 'puntos (−3 a 11)',
        interpretation: `Riesgo ${banda} de evento grave a 30 días (arritmia, IAM, muerte, hemorragia grave…). En riesgo intermedio o superior, valorar observación con monitorización y estudio dirigido.`,
        level: score <= 0 ? 'ok' : score <= 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Thiruganasambandamoorthy V, et al. Development of the Canadian Syncope Risk Score to predict serious adverse events after emergency department assessment of syncope. CMAJ. 2016;188(12):E289-E298.',
    ],
  },
]
