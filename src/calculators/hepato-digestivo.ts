import type { Calculator, Option } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Hepatología y digestivo'
const UCI = ['Medicina Intensiva']

const escala = (items: [number, string][]): Option[] =>
  items.map(([value, label]) => ({ label: `${value} — ${label}`, value }))

export const hepatoDigestivo: Calculator[] = [
  {
    id: 'child-pugh',
    name: 'Puntuación de Child-Pugh para la cirrosis',
    shortName: 'Child-Pugh',
    description: 'Estima la gravedad y el pronóstico de la cirrosis hepática.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'bilirrubina',
        type: 'select',
        label: 'Bilirrubina total (mg/dL)',
        options: [
          { label: '< 2', value: 1 },
          { label: '2–3', value: 2 },
          { label: '> 3', value: 3 },
        ],
      },
      {
        id: 'albumina',
        type: 'select',
        label: 'Albúmina (g/dL)',
        options: [
          { label: '> 3,5', value: 1 },
          { label: '2,8–3,5', value: 2 },
          { label: '< 2,8', value: 3 },
        ],
      },
      {
        id: 'inr',
        type: 'select',
        label: 'INR',
        options: [
          { label: '< 1,7', value: 1 },
          { label: '1,7–2,3', value: 2 },
          { label: '> 2,3', value: 3 },
        ],
      },
      {
        id: 'ascitis',
        type: 'select',
        label: 'Ascitis',
        options: [
          { label: 'Ausente', value: 1 },
          { label: 'Leve, controlada con diuréticos', value: 2 },
          { label: 'Moderada-grave, refractaria', value: 3 },
        ],
      },
      {
        id: 'encefalopatia',
        type: 'select',
        label: 'Encefalopatía hepática',
        options: [
          { label: 'Ausente', value: 1 },
          { label: 'Grado I–II (o controlada con tratamiento)', value: 2 },
          { label: 'Grado III–IV (o refractaria)', value: 3 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['bilirrubina', 'albumina', 'inr', 'ascitis', 'encefalopatia'])
      const clase = score <= 6 ? 'A' : score <= 9 ? 'B' : 'C'
      const superv =
        clase === 'A' ? '100 % / 85 %' : clase === 'B' ? '81 % / 57 %' : '45 % / 35 %'
      return {
        main: String(score),
        mainUnit: `puntos (5–15) — clase ${clase}`,
        secondary: superv,
        secondaryLabel: 'supervivencia a 1 y 2 años',
        interpretation:
          clase === 'A'
            ? 'Cirrosis compensada (clase A): buen pronóstico a corto plazo; cribado de varices y de hepatocarcinoma.'
            : clase === 'B'
              ? 'Deterioro funcional significativo (clase B): valorar remisión a una unidad de trasplante y control estrecho de las complicaciones.'
              : 'Enfermedad hepática descompensada (clase C): pronóstico grave; valoración de trasplante y manejo intensivo de las complicaciones.',
        level: clase === 'A' ? 'ok' : clase === 'B' ? 'warn' : 'danger',
      }
    },
    notes: [
      'La clase de Child-Pugh también predice el riesgo quirúrgico: la mortalidad perioperatoria en cirugía abdominal es aproximadamente del 10 % en la clase A, del 30 % en la B y del 70–80 % en la C.',
      'En la colangitis biliar primaria, los puntos de corte de bilirrubina son distintos (< 4, 4–10 y > 10 mg/dL).',
    ],
    references: [
      'Pugh RN, et al. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg. 1973;60(8):646-9.',
    ],
  },
  {
    id: 'meld',
    name: 'Puntuación MELD y MELD-Na',
    shortName: 'MELD / MELD-Na',
    description:
      'Cuantifica la gravedad de la hepatopatía terminal y prioriza en las listas de trasplante.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'bilirrubina', type: 'number', label: 'Bilirrubina total', unit: 'mg/dL', min: 0.1, max: 60, step: 0.1 },
      { id: 'inr', type: 'number', label: 'INR', min: 0.5, max: 20, step: 0.01 },
      { id: 'creatinina', type: 'number', label: 'Creatinina sérica', unit: 'mg/dL', min: 0.1, max: 20, step: 0.01 },
      { id: 'sodio', type: 'number', label: 'Sodio sérico', unit: 'mEq/L', min: 100, max: 175, step: 0.1 },
      {
        id: 'dialisis',
        type: 'boolean',
        label: 'Diálisis ≥ 2 veces en la última semana o hemofiltración ≥ 24 h',
        description: 'En ese caso, la creatinina se fija en 4,0 mg/dL.',
        noPoints: true,
      },
    ],
    compute: (v) => {
      const acotar = (x: number, min: number, max: number) => Math.min(Math.max(x, min), max)
      const bili = acotar(v.bilirrubina!, 1, 99)
      const inr = acotar(v.inr!, 1, 99)
      const crea = v.dialisis === 1 ? 4 : acotar(v.creatinina!, 1, 4)
      const meldRaw =
        0.957 * Math.log(crea) + 0.378 * Math.log(bili) + 1.12 * Math.log(inr) + 0.643
      let meld = Math.round(meldRaw * 10)
      meld = acotar(meld, 6, 40)
      const na = acotar(v.sodio!, 125, 137)
      let meldNa = meld
      if (meld > 11) {
        meldNa = Math.round(meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na))
        meldNa = acotar(meldNa, 6, 40)
      }
      const mort =
        meldNa <= 9 ? '1,9 %' : meldNa <= 19 ? '6,0 %' : meldNa <= 29 ? '19,6 %' : meldNa <= 39 ? '52,6 %' : '71,3 %'
      return {
        main: String(meldNa),
        mainUnit: 'MELD-Na (6–40)',
        secondary: String(meld),
        secondaryLabel: 'MELD sin sodio',
        interpretation: `Mortalidad estimada a 3 meses: ${mort}. ${
          meldNa >= 15
            ? 'Un MELD ≥ 15 es el umbral habitual a partir del cual el trasplante hepático aporta beneficio en supervivencia: remitir a una unidad de trasplante.'
            : 'Por debajo de 15, el riesgo del trasplante suele superar al beneficio; seguimiento y tratamiento de las complicaciones.'
        }`,
        level: meldNa <= 9 ? 'ok' : meldNa <= 19 ? 'warn' : 'danger',
        details: [
          'Todos los valores menores de 1,0 se elevan a 1,0; la creatinina se limita a un máximo de 4,0 mg/dL.',
          'La corrección por sodio solo se aplica si el MELD es mayor de 11.',
        ],
      }
    },
    notes: [
      'Desde 2023 la UNOS emplea el MELD 3.0, que incorpora el sexo y la albúmina; aquí se muestra el MELD-Na clásico, todavía muy utilizado.',
      'No aplicable a menores de 12 años (usar PELD).',
    ],
    references: [
      'Kamath PS, et al. A model to predict survival in patients with end-stage liver disease. Hepatology. 2001;33(2):464-70.',
      'Kim WR, et al. Hyponatremia and mortality among patients on the liver-transplant waiting list. N Engl J Med. 2008;359(10):1018-26.',
    ],
  },
  {
    id: 'maddrey',
    name: 'Función discriminante de Maddrey para la hepatitis alcohólica',
    shortName: 'Maddrey',
    description:
      'Predice el pronóstico de la hepatitis alcohólica y orienta la indicación de corticoides.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'tp', type: 'number', label: 'Tiempo de protrombina del paciente', unit: 's', min: 5, max: 120, step: 0.1 },
      { id: 'control', type: 'number', label: 'Tiempo de protrombina control', unit: 's', min: 5, max: 30, step: 0.1 },
      { id: 'bilirrubina', type: 'number', label: 'Bilirrubina total', unit: 'mg/dL', min: 0.1, max: 60, step: 0.1 },
    ],
    compute: (v) => {
      const df = 4.6 * (v.tp! - v.control!) + v.bilirrubina!
      return {
        main: fmt(df, 1),
        interpretation:
          df >= 32
            ? 'Función discriminante ≥ 32: hepatitis alcohólica grave, con mortalidad a corto plazo del 30–50 % sin tratamiento. Se considera la indicación de corticoides (prednisolona 40 mg/día durante 28 días) si no hay contraindicación (infección activa, hemorragia digestiva, insuficiencia renal, pancreatitis).'
            : 'Función discriminante < 32: hepatitis alcohólica no grave; no está indicado el tratamiento con corticoides. Abstinencia, soporte nutricional y tratamiento del síndrome de abstinencia.',
        level: df >= 32 ? 'danger' : 'ok',
        details: ['Función discriminante = 4,6 × (TP paciente − TP control) + bilirrubina.'],
      }
    },
    references: [
      'Maddrey WC, et al. Corticosteroid therapy of alcoholic hepatitis. Gastroenterology. 1978;75(2):193-9.',
    ],
  },
  {
    id: 'glasgow-hepatitis',
    name: 'Puntuación de Glasgow para la hepatitis alcohólica (GAHS)',
    shortName: 'GAHS',
    description: 'Predice la mortalidad en la hepatitis alcohólica.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 50 años', value: 1 },
          { label: '≥ 50 años', value: 2 },
        ],
      },
      {
        id: 'leucocitos',
        type: 'select',
        label: 'Leucocitos (×10⁹/L)',
        options: [
          { label: '< 15', value: 1 },
          { label: '≥ 15', value: 2 },
        ],
      },
      {
        id: 'urea',
        type: 'select',
        label: 'Urea (mg/dL)',
        options: [
          { label: '< 42 (BUN < 19,6)', value: 1 },
          { label: '≥ 42', value: 2 },
        ],
      },
      {
        id: 'inr',
        type: 'select',
        label: 'INR',
        options: [
          { label: '< 1,5', value: 1 },
          { label: '1,5–2,0', value: 2 },
          { label: '> 2,0', value: 3 },
        ],
      },
      {
        id: 'bilirrubina',
        type: 'select',
        label: 'Bilirrubina (mg/dL)',
        options: [
          { label: '< 7,3', value: 1 },
          { label: '7,3–14,6', value: 2 },
          { label: '> 14,6', value: 3 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'leucocitos', 'urea', 'inr', 'bilirrubina'])
      return {
        main: String(score),
        mainUnit: 'puntos (5–12)',
        interpretation:
          score >= 9
            ? 'GAHS ≥ 9: mortalidad elevada (supervivencia a 28 días ≈ 46 % sin tratamiento). Es el subgrupo que más se beneficia de los corticoides cuando la función discriminante de Maddrey también es ≥ 32.'
            : 'GAHS < 9: mejor pronóstico (supervivencia a 28 días ≈ 87 %); el beneficio de los corticoides es dudoso en este grupo.',
        level: score >= 9 ? 'danger' : 'ok',
      }
    },
    references: [
      'Forrest EH, et al. Analysis of factors predictive of mortality in alcoholic hepatitis and derivation and validation of the Glasgow alcoholic hepatitis score. Gut. 2005;54(8):1174-9.',
    ],
  },
  {
    id: 'lille',
    name: 'Modelo de Lille para la hepatitis alcohólica',
    shortName: 'Lille',
    description:
      'Evalúa a los 7 días la respuesta al tratamiento con corticoides en la hepatitis alcohólica.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 18, max: 100 },
      { id: 'albumina', type: 'number', label: 'Albúmina al ingreso', unit: 'g/L', min: 5, max: 60, step: 0.1 },
      { id: 'bili0', type: 'number', label: 'Bilirrubina al ingreso', unit: 'mg/dL', min: 0.1, max: 60, step: 0.1 },
      { id: 'bili7', type: 'number', label: 'Bilirrubina el día 7', unit: 'mg/dL', min: 0.1, max: 60, step: 0.1 },
      { id: 'creatinina', type: 'number', label: 'Creatinina', unit: 'mg/dL', min: 0.1, max: 15, step: 0.01 },
      { id: 'tp', type: 'number', label: 'Tiempo de protrombina', unit: 's', min: 5, max: 120, step: 0.1 },
    ],
    compute: (v) => {
      const bili0 = v.bili0! * 17.1
      const bili7 = v.bili7! * 17.1
      const insufRenal = v.creatinina! > 1.3 ? 1 : 0
      const R =
        3.19 -
        0.101 * v.edad! +
        0.0147 * v.albumina! +
        0.0165 * (bili0 - bili7) -
        0.206 * insufRenal -
        0.0065 * bili0 -
        0.0096 * v.tp!
      const lille = Math.exp(-R) / (1 + Math.exp(-R))
      const noRespondedor = lille >= 0.45
      return {
        main: fmt(lille, 3),
        mainUnit: 'índice de Lille (0–1)',
        secondary: noRespondedor ? 'No respondedor' : 'Respondedor',
        interpretation: noRespondedor
          ? 'Índice ≥ 0,45: no respondedor a los corticoides (supervivencia a 6 meses ≈ 25 %). Se recomienda suspender el tratamiento y valorar alternativas, incluido el trasplante en casos muy seleccionados.'
          : 'Índice < 0,45: respondedor a los corticoides (supervivencia a 6 meses ≈ 85 %). Completar el ciclo de 28 días.',
        level: noRespondedor ? 'danger' : 'ok',
        details: [
          `Insuficiencia renal (creatinina > 1,3 mg/dL): ${insufRenal ? 'sí' : 'no'}.`,
          'Las bilirrubinas se convierten internamente a µmol/L (× 17,1).',
        ],
      }
    },
    notes: ['Se calcula tras 7 días de tratamiento con corticoides; no es aplicable antes.'],
    references: [
      'Louvet A, et al. The Lille model: a new tool for therapeutic strategy in patients with severe alcoholic hepatitis treated with steroids. Hepatology. 2007;45(6):1348-54.',
    ],
  },
  {
    id: 'kings-college',
    name: "Criterios del King's College para la insuficiencia hepática aguda",
    shortName: "King's College",
    description:
      'Identifica a los pacientes con insuficiencia hepática aguda que deben remitirse con urgencia para trasplante.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'etiologia',
        type: 'select',
        label: 'Etiología',
        noPoints: true,
        options: [
          { label: 'Paracetamol', value: 0 },
          { label: 'No paracetamol', value: 1 },
        ],
      },
      { id: 'ph', type: 'boolean', label: 'Paracetamol: pH arterial < 7,30 tras la reanimación con fluidos', noPoints: true },
      { id: 'lactato', type: 'boolean', label: 'Paracetamol: lactato > 3,0 mmol/L tras reanimación', noPoints: true },
      { id: 'triada', type: 'boolean', label: 'Paracetamol: INR > 6,5 Y creatinina > 3,4 mg/dL Y encefalopatía grado III–IV, en 24 h', noPoints: true },
      { id: 'inrAlto', type: 'boolean', label: 'No paracetamol: INR > 6,5 (tiempo de protrombina > 100 s)', noPoints: true },
      {
        id: 'menores',
        type: 'select',
        label: 'No paracetamol: número de criterios menores presentes',
        description:
          'Edad < 10 o > 40 años; etiología desfavorable (hepatitis no A no B, halotano, reacción idiosincrásica); ictericia > 7 días antes de la encefalopatía; INR > 3,5; bilirrubina > 17,5 mg/dL.',
        dropdown: true,
        noPoints: true,
        options: escala([
          [0, 'Ninguno'],
          [1, 'Uno'],
          [2, 'Dos'],
          [3, 'Tres'],
          [4, 'Cuatro'],
          [5, 'Cinco'],
        ]),
      },
    ],
    compute: (v) => {
      const paracetamol = v.etiologia === 0
      const cumple = paracetamol
        ? v.ph === 1 || v.lactato === 1 || v.triada === 1
        : v.inrAlto === 1 || (v.menores ?? 0) >= 3
      return {
        main: cumple ? 'Criterios cumplidos' : 'Criterios no cumplidos',
        interpretation: cumple
          ? 'Se cumplen los criterios del King\'s College: mal pronóstico sin trasplante. Contactar de forma urgente con una unidad de trasplante hepático.'
          : 'No se cumplen los criterios en este momento, lo que no descarta la progresión: reevaluar de forma seriada y contactar precozmente con la unidad de trasplante si hay deterioro.',
        level: cumple ? 'danger' : 'warn',
        details: [
          paracetamol
            ? 'Vía paracetamol: basta el pH < 7,30, o el lactato > 3,0 tras reanimación, o la tríada completa de INR, creatinina y encefalopatía.'
            : 'Vía no paracetamol: basta el INR > 6,5, o tres o más criterios menores.',
        ],
      }
    },
    notes: ['Estos criterios tienen alta especificidad pero sensibilidad limitada: no deben retrasar la derivación de un paciente que empeora.'],
    references: [
      "O'Grady JG, et al. Early indicators of prognosis in fulminant hepatic failure. Gastroenterology. 1989;97(2):439-45.",
    ],
  },
  {
    id: 'bisap',
    name: 'Puntuación BISAP para la pancreatitis aguda',
    shortName: 'BISAP',
    description: 'Predice la mortalidad en la pancreatitis aguda en las primeras 24 horas.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'bun', type: 'boolean', label: 'BUN > 25 mg/dL (urea > 53 mg/dL) (B)' },
      { id: 'mental', type: 'boolean', label: 'Alteración del estado mental (I)' },
      {
        id: 'sirs',
        type: 'boolean',
        label: 'Síndrome de respuesta inflamatoria sistémica (S)',
        description: '≥ 2 de: temperatura < 36 o > 38 °C; FC > 90 lpm; FR > 20 rpm o PaCO₂ < 32 mmHg; leucocitos < 4.000 o > 12.000 o > 10 % de cayados.',
      },
      { id: 'edad', type: 'boolean', label: 'Edad > 60 años (A)' },
      { id: 'derrame', type: 'boolean', label: 'Derrame pleural en la imagen (P)' },
    ],
    compute: (v) => {
      const score = sum(v, ['bun', 'mental', 'sirs', 'edad', 'derrame'])
      const mort = ['< 1 %', '< 1 %', '1,6 %', '3,6 %', '7,4 %', '9,5 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–5)',
        secondary: mort,
        secondaryLabel: 'mortalidad hospitalaria',
        interpretation:
          score <= 2
            ? 'Riesgo bajo de mortalidad: manejo convencional con hidratación, analgesia y nutrición precoz.'
            : 'Riesgo elevado (≥ 3): pancreatitis grave probable; valorar cuidados intermedios o intensivos, monitorización estrecha y reevaluación frecuente.',
        level: score <= 2 ? 'ok' : 'danger',
      }
    },
    references: [
      'Wu BU, et al. The early prediction of mortality in acute pancreatitis: a large population-based study. Gut. 2008;57(12):1698-703.',
    ],
  },
  {
    id: 'haps',
    name: 'Puntuación HAPS de pancreatitis aguda leve',
    shortName: 'HAPS',
    description:
      'Identifica en las primeras horas a los pacientes con pancreatitis aguda que tendrán un curso leve.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'peritoneo', type: 'boolean', label: 'Signos de irritación peritoneal (defensa o rebote)' },
      { id: 'creatinina', type: 'boolean', label: 'Creatinina ≥ 2 mg/dL' },
      { id: 'hematocrito', type: 'boolean', label: 'Hematocrito elevado (≥ 43 % en varones o ≥ 39,6 % en mujeres)' },
    ],
    compute: (v) => {
      const score = sum(v, ['peritoneo', 'creatinina', 'hematocrito'])
      return {
        main: String(score),
        mainUnit: score === 1 ? 'criterio' : 'criterios',
        interpretation:
          score === 0
            ? 'Ningún criterio presente: curso leve muy probable (valor predictivo positivo ≈ 98 % para pancreatitis no grave). Puede manejarse fuera de cuidados intensivos.'
            : 'Al menos un criterio presente: no puede predecirse un curso leve; mantener la monitorización habitual y estratificar con otras escalas (BISAP, criterios de Atlanta).',
        level: score === 0 ? 'ok' : 'warn',
      }
    },
    notes: ['Se evalúa en los primeros 30–60 minutos desde el ingreso.'],
    references: [
      'Lankisch PG, et al. The harmless acute pancreatitis score: a clinical algorithm for rapid initial stratification of nonsevere disease. Clin Gastroenterol Hepatol. 2009;7(6):702-5.',
    ],
  },
  {
    id: 'glasgow-blatchford',
    name: 'Puntuación de Glasgow-Blatchford para la hemorragia digestiva alta',
    shortName: 'Glasgow-Blatchford',
    description:
      'Identifica a los pacientes con hemorragia digestiva alta de bajo riesgo que pueden manejarse de forma ambulatoria.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'urea',
        type: 'select',
        label: 'Urea sérica (mg/dL)',
        dropdown: true,
        options: [
          { label: '< 39', value: 0 },
          { label: '39–48', value: 2 },
          { label: '48–60', value: 3 },
          { label: '60–150', value: 4 },
          { label: '≥ 150', value: 6 },
        ],
      },
      {
        id: 'hb',
        type: 'select',
        label: 'Hemoglobina',
        dropdown: true,
        options: [
          { label: 'Varón ≥ 13 o mujer ≥ 12 g/dL', value: 0 },
          { label: 'Varón 12–13 g/dL', value: 1 },
          { label: 'Mujer 10–12 g/dL', value: 1.0001 },
          { label: 'Varón 10–12 g/dL', value: 3 },
          { label: '< 10 g/dL (cualquier sexo)', value: 6 },
        ],
      },
      {
        id: 'pas',
        type: 'select',
        label: 'Presión arterial sistólica (mmHg)',
        dropdown: true,
        options: [
          { label: '≥ 110', value: 0 },
          { label: '100–109', value: 1 },
          { label: '90–99', value: 2 },
          { label: '< 90', value: 3 },
        ],
      },
      { id: 'fc', type: 'boolean', label: 'Frecuencia cardíaca ≥ 100 lpm' },
      { id: 'melenas', type: 'boolean', label: 'Melenas' },
      { id: 'sincope', type: 'boolean', label: 'Síncope', points: 2 },
      { id: 'hepatopatia', type: 'boolean', label: 'Hepatopatía', points: 2 },
      { id: 'cardiaca', type: 'boolean', label: 'Insuficiencia cardíaca', points: 2 },
    ],
    compute: (v) => {
      const score = Math.round(
        sum(v, ['urea', 'hb', 'pas', 'fc', 'melenas', 'sincope', 'hepatopatia', 'cardiaca']),
      )
      return {
        main: String(score),
        mainUnit: 'puntos (0–23)',
        interpretation:
          score === 0
            ? 'Puntuación 0: riesgo muy bajo de necesitar intervención (transfusión, endoscopia terapéutica o cirugía) o de fallecer. Candidato a manejo ambulatorio con endoscopia preferente.'
            : score <= 1
              ? 'Puntuación ≤ 1: riesgo bajo; algunos protocolos admiten el manejo ambulatorio con este umbral.'
              : 'Puntuación ≥ 2: riesgo aumentado de precisar intervención; se recomienda ingreso y endoscopia en las primeras 24 h.',
        level: score <= 1 ? 'ok' : score <= 6 ? 'warn' : 'danger',
      }
    },
    notes: ['A diferencia de la escala de Rockall, no requiere datos endoscópicos, por lo que puede aplicarse en el primer contacto.'],
    references: [
      'Blatchford O, et al. A risk score to predict need for treatment for upper-gastrointestinal haemorrhage. Lancet. 2000;356(9238):1318-21.',
    ],
  },
  {
    id: 'aims65',
    name: 'Puntuación AIMS65 para la hemorragia digestiva alta',
    shortName: 'AIMS65',
    description: 'Predice la mortalidad hospitalaria en la hemorragia digestiva alta.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'albumina', type: 'boolean', label: 'Albúmina < 3 g/dL (A)' },
      { id: 'inr', type: 'boolean', label: 'INR > 1,5 (I)' },
      { id: 'mental', type: 'boolean', label: 'Alteración del estado mental (M)' },
      { id: 'pas', type: 'boolean', label: 'PA sistólica ≤ 90 mmHg (S)' },
      { id: 'edad', type: 'boolean', label: 'Edad > 65 años (65)' },
    ],
    compute: (v) => {
      const score = sum(v, ['albumina', 'inr', 'mental', 'pas', 'edad'])
      const mort = ['0,3 %', '1 %', '3 %', '9 %', '15 %', '25 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–5)',
        secondary: mort,
        secondaryLabel: 'mortalidad hospitalaria',
        interpretation:
          score <= 1
            ? 'Riesgo bajo de mortalidad.'
            : 'Riesgo elevado (≥ 2): ingreso, reanimación y endoscopia precoz; valorar el nivel de cuidados.',
        level: score <= 1 ? 'ok' : score === 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Saltzman JR, et al. A simple risk score accurately predicts in-hospital mortality, length of stay, and cost in acute upper GI bleeding. Gastrointest Endosc. 2011;74(6):1215-24.',
    ],
  },
  {
    id: 'oakland',
    name: 'Puntuación de Oakland para la hemorragia digestiva baja',
    shortName: 'Oakland',
    description:
      'Identifica a los pacientes con hemorragia digestiva baja que pueden recibir el alta de forma segura.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        dropdown: true,
        options: [
          { label: '< 40 años', value: 0 },
          { label: '40–69 años', value: 1 },
          { label: '≥ 70 años', value: 2 },
        ],
      },
      { id: 'varon', type: 'boolean', label: 'Sexo masculino' },
      { id: 'ingresoPrevio', type: 'boolean', label: 'Ingreso previo por hemorragia digestiva baja' },
      { id: 'tacto', type: 'boolean', label: 'Sangre en el tacto rectal' },
      {
        id: 'fc',
        type: 'select',
        label: 'Frecuencia cardíaca (lpm)',
        dropdown: true,
        options: [
          { label: '< 70', value: 0 },
          { label: '70–89', value: 1 },
          { label: '90–109', value: 2 },
          { label: '≥ 110', value: 3 },
        ],
      },
      {
        id: 'pas',
        type: 'select',
        label: 'Presión arterial sistólica (mmHg)',
        dropdown: true,
        options: [
          { label: '≥ 160', value: 0 },
          { label: '130–159', value: 2 },
          { label: '120–129', value: 3 },
          { label: '110–119', value: 4 },
          { label: '< 110', value: 5 },
        ],
      },
      {
        id: 'hb',
        type: 'select',
        label: 'Hemoglobina (g/dL)',
        dropdown: true,
        options: [
          { label: '≥ 16', value: 0 },
          { label: '14,0–15,9', value: 4 },
          { label: '12,0–13,9', value: 8 },
          { label: '10,0–11,9', value: 14 },
          { label: '7,0–9,9', value: 22 },
          { label: '< 7,0', value: 21 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'varon', 'ingresoPrevio', 'tacto', 'fc', 'pas', 'hb'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–35)',
        interpretation:
          score <= 8
            ? 'Puntuación ≤ 8: riesgo bajo (probabilidad ≈ 95 % de alta segura sin transfusión, hemostasia ni muerte). Candidato a manejo ambulatorio.'
            : 'Puntuación > 8: riesgo aumentado de eventos adversos; se recomienda ingreso y estudio.',
        level: score <= 8 ? 'ok' : 'warn',
      }
    },
    references: [
      'Oakland K, et al. Derivation and validation of a novel risk score for safe discharge after acute lower gastrointestinal bleeding. Lancet Gastroenterol Hepatol. 2017;2(9):635-43.',
    ],
  },
  {
    id: 'bard',
    name: 'Puntuación BARD de fibrosis en la esteatosis hepática no alcohólica',
    shortName: 'BARD',
    description: 'Predice el riesgo de fibrosis avanzada en el hígado graso no alcohólico.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'imc', type: 'boolean', label: 'IMC ≥ 28 kg/m² (B)' },
      {
        id: 'ast',
        type: 'boolean',
        label: 'Cociente AST/ALT ≥ 0,8 (A)',
        points: 2,
      },
      { id: 'diabetes', type: 'boolean', label: 'Diabetes mellitus (D)' },
    ],
    compute: (v) => {
      const score = sum(v, ['imc', 'ast', 'diabetes'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–4)',
        interpretation:
          score >= 2
            ? 'BARD ≥ 2: riesgo aumentado de fibrosis avanzada (odds ratio ≈ 17); completar el estudio con elastografía u otros marcadores no invasivos.'
            : 'BARD 0–1: fibrosis avanzada poco probable (valor predictivo negativo ≈ 96 %).',
        level: score >= 2 ? 'warn' : 'ok',
      }
    },
    references: [
      'Harrison SA, et al. Development and validation of a simple NAFLD clinical scoring system for identifying patients without advanced disease. Gut. 2008;57(10):1441-7.',
    ],
  },
]
