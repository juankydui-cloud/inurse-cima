import type { Calculator, Option } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Gravedad en UCI y sepsis'
const UCI = ['Medicina Intensiva']

const escala = (items: [number, string][]): Option[] =>
  items.map(([value, label]) => ({ label: `${value} — ${label}`, value }))

export const uciGravedad: Calculator[] = [
  {
    id: 'qsofa',
    name: 'Puntuación qSOFA (SOFA rápido) para la sepsis',
    shortName: 'qSOFA',
    description:
      'Identifica, fuera de la UCI, a los pacientes con sospecha de infección y mayor riesgo de mala evolución.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'fr', type: 'boolean', label: 'Frecuencia respiratoria ≥ 22 rpm' },
      { id: 'mental', type: 'boolean', label: 'Alteración del estado mental (Glasgow < 15)' },
      { id: 'pas', type: 'boolean', label: 'Presión arterial sistólica ≤ 100 mmHg' },
    ],
    compute: (v) => {
      const score = sum(v, ['fr', 'mental', 'pas'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–3)',
        interpretation:
          score >= 2
            ? 'qSOFA ≥ 2: mayor riesgo de mortalidad y estancia prolongada. Investigar disfunción orgánica, iniciar tratamiento precoz y valorar el nivel de cuidados.'
            : 'qSOFA < 2: no descarta la sepsis. Si la sospecha clínica persiste, continuar la evaluación y reevaluar con frecuencia.',
        level: score >= 2 ? 'danger' : 'warn',
      }
    },
    notes: [
      'La campaña Sobrevivir a la Sepsis 2021 desaconseja usar el qSOFA como herramienta única de cribado por su baja sensibilidad; se prefieren sistemas como NEWS o los criterios de SIRS para el cribado inicial.',
      'Un qSOFA positivo debe motivar la búsqueda activa de disfunción orgánica (SOFA completo, lactato).',
    ],
    references: [
      'Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-10.',
      'Evans L, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Crit Care Med. 2021;49(11):e1063-e1143.',
    ],
  },
  {
    id: 'msofa',
    name: 'Puntuación SOFA modificada (mSOFA)',
    shortName: 'mSOFA',
    description:
      'Predice la mortalidad en la UCI usando principalmente variables clínicas y menos pruebas de laboratorio que la SOFA original.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'resp',
        type: 'select',
        label: 'Respiratorio — SpO₂/FiO₂',
        dropdown: true,
        options: [
          { label: '> 400', value: 0 },
          { label: '316–400', value: 1 },
          { label: '235–315', value: 2 },
          { label: '150–234 con soporte respiratorio', value: 3 },
          { label: '< 150 con soporte respiratorio', value: 4 },
        ],
      },
      {
        id: 'hepatico',
        type: 'select',
        label: 'Hígado — ictericia clínica',
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Presente', value: 3 },
        ],
      },
      {
        id: 'cardio',
        type: 'select',
        label: 'Cardiovascular',
        dropdown: true,
        options: [
          { label: 'PAM ≥ 70 mmHg sin vasoactivos', value: 0 },
          { label: 'PAM < 70 mmHg sin vasoactivos', value: 1 },
          { label: 'Dopamina ≤ 5 µg/kg/min o dobutamina (cualquier dosis)', value: 2 },
          { label: 'Dopamina > 5, o adrenalina/noradrenalina ≤ 0,1 µg/kg/min', value: 3 },
          { label: 'Dopamina > 15, o adrenalina/noradrenalina > 0,1 µg/kg/min', value: 4 },
        ],
      },
      {
        id: 'snc',
        type: 'select',
        label: 'Neurológico — escala de coma de Glasgow',
        dropdown: true,
        options: [
          { label: '15', value: 0 },
          { label: '13–14', value: 1 },
          { label: '10–12', value: 2 },
          { label: '6–9', value: 3 },
          { label: '< 6', value: 4 },
        ],
      },
      {
        id: 'renal',
        type: 'select',
        label: 'Renal — creatinina (mg/dL)',
        dropdown: true,
        options: [
          { label: '< 1,2', value: 0 },
          { label: '1,2–1,9', value: 1 },
          { label: '2,0–3,4', value: 2 },
          { label: '3,5–4,9', value: 3 },
          { label: '≥ 5,0', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['resp', 'hepatico', 'cardio', 'snc', 'renal'])
      const mort = score <= 7 ? '≈ 4 %' : score <= 11 ? '≈ 31 %' : '≈ 68 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–20)',
        secondary: mort,
        secondaryLabel: 'mortalidad hospitalaria orientativa',
        interpretation:
          score <= 7
            ? 'Disfunción orgánica leve.'
            : score <= 11
              ? 'Disfunción orgánica moderada: vigilancia intensiva.'
              : 'Disfunción orgánica grave con mortalidad elevada.',
        level: score <= 7 ? 'ok' : score <= 11 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Sustituye la PaO₂ por la SpO₂, la bilirrubina por la ictericia clínica y prescinde de las plaquetas: pensada para entornos con recursos limitados o situaciones de catástrofe.',
    ],
    references: [
      'Grissom CK, et al. A modified sequential organ failure assessment score for critical care triage. Disaster Med Public Health Prep. 2010;4(4):277-84.',
    ],
  },
  {
    id: 'apache2',
    name: 'Puntuación APACHE II',
    shortName: 'APACHE II',
    description:
      'Estima la mortalidad hospitalaria del paciente crítico a partir de las peores variables de las primeras 24 horas de ingreso en la UCI.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'temp',
        type: 'select',
        label: 'Temperatura rectal (°C)',
        dropdown: true,
        options: [
          { label: '≥ 41 o ≤ 29,9', value: 4 },
          { label: '39–40,9 o 30–31,9', value: 3 },
          { label: '32–33,9', value: 2 },
          { label: '38,5–38,9 o 34–35,9', value: 1 },
          { label: '36–38,4', value: 0 },
        ],
        default: 0,
      },
      {
        id: 'pam',
        type: 'select',
        label: 'Presión arterial media (mmHg)',
        dropdown: true,
        options: [
          { label: '≥ 160 o ≤ 49', value: 4 },
          { label: '130–159', value: 3 },
          { label: '110–129 o 50–69', value: 2 },
          { label: '70–109', value: 0 },
        ],
        default: 0,
      },
      {
        id: 'fc',
        type: 'select',
        label: 'Frecuencia cardíaca (lpm)',
        dropdown: true,
        options: [
          { label: '≥ 180 o ≤ 39', value: 4 },
          { label: '140–179 o 40–54', value: 3 },
          { label: '110–139 o 55–69', value: 2 },
          { label: '70–109', value: 0 },
        ],
        default: 0,
      },
      {
        id: 'fr',
        type: 'select',
        label: 'Frecuencia respiratoria (rpm)',
        dropdown: true,
        options: [
          { label: '≥ 50 o ≤ 5', value: 4 },
          { label: '35–49', value: 3 },
          { label: '6–9', value: 2 },
          { label: '25–34 o 10–11', value: 1 },
          { label: '12–24', value: 0 },
        ],
        default: 0,
      },
      {
        id: 'oxigenacion',
        type: 'select',
        label: 'Oxigenación',
        description: 'Con FiO₂ ≥ 0,5 usar el gradiente alveolo-arterial; con FiO₂ < 0,5 usar la PaO₂.',
        dropdown: true,
        options: [
          { label: 'A-a ≥ 500 (FiO₂ ≥ 0,5)', value: 4 },
          { label: 'A-a 350–499 (FiO₂ ≥ 0,5)', value: 3 },
          { label: 'A-a 200–349 (FiO₂ ≥ 0,5)', value: 2 },
          { label: 'A-a < 200 (FiO₂ ≥ 0,5) o PaO₂ > 70 (FiO₂ < 0,5)', value: 0 },
          { label: 'PaO₂ 61–70 (FiO₂ < 0,5)', value: 1 },
          { label: 'PaO₂ 55–60 (FiO₂ < 0,5)', value: 3 },
          { label: 'PaO₂ < 55 (FiO₂ < 0,5)', value: 4 },
        ],
        default: 0,
      },
      {
        id: 'ph',
        type: 'select',
        label: 'pH arterial',
        dropdown: true,
        options: [
          { label: '≥ 7,7 o < 7,15', value: 4 },
          { label: '7,6–7,69 o 7,15–7,24', value: 3 },
          { label: '7,25–7,32', value: 2 },
          { label: '7,5–7,59', value: 1 },
          { label: '7,33–7,49', value: 0 },
        ],
        default: 0,
      },
      {
        id: 'sodio',
        type: 'select',
        label: 'Sodio sérico (mEq/L)',
        dropdown: true,
        options: [
          { label: '≥ 180 o ≤ 110', value: 4 },
          { label: '160–179 o 111–119', value: 3 },
          { label: '155–159 o 120–129', value: 2 },
          { label: '150–154', value: 1 },
          { label: '130–149', value: 0 },
        ],
        default: 0,
      },
      {
        id: 'potasio',
        type: 'select',
        label: 'Potasio sérico (mEq/L)',
        dropdown: true,
        options: [
          { label: '≥ 7 o < 2,5', value: 4 },
          { label: '6–6,9', value: 3 },
          { label: '2,5–2,9', value: 2 },
          { label: '5,5–5,9 o 3–3,4', value: 1 },
          { label: '3,5–5,4', value: 0 },
        ],
        default: 0,
      },
      {
        id: 'creatinina',
        type: 'select',
        label: 'Creatinina sérica (mg/dL)',
        description: 'Duplicar la puntuación si hay insuficiencia renal aguda.',
        dropdown: true,
        options: [
          { label: '≥ 3,5', value: 4 },
          { label: '2–3,4', value: 3 },
          { label: '1,5–1,9 o < 0,6', value: 2 },
          { label: '0,6–1,4', value: 0 },
        ],
        default: 0,
      },
      { id: 'renalAguda', type: 'boolean', label: 'Insuficiencia renal aguda (duplica los puntos de creatinina)', noPoints: true },
      {
        id: 'hematocrito',
        type: 'select',
        label: 'Hematocrito (%)',
        dropdown: true,
        options: [
          { label: '≥ 60 o < 20', value: 4 },
          { label: '50–59,9 o 20–29,9', value: 2 },
          { label: '46–49,9', value: 1 },
          { label: '30–45,9', value: 0 },
        ],
        default: 0,
      },
      {
        id: 'leucocitos',
        type: 'select',
        label: 'Leucocitos (×10³/mm³)',
        dropdown: true,
        options: [
          { label: '≥ 40 o < 1', value: 4 },
          { label: '20–39,9 o 1–2,9', value: 2 },
          { label: '15–19,9', value: 1 },
          { label: '3–14,9', value: 0 },
        ],
        default: 0,
      },
      { id: 'gcs', type: 'number', label: 'Escala de coma de Glasgow', unit: 'puntos', min: 3, max: 15, step: 1 },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        dropdown: true,
        options: [
          { label: '≤ 44 años', value: 0 },
          { label: '45–54 años', value: 2 },
          { label: '55–64 años', value: 3 },
          { label: '65–74 años', value: 5 },
          { label: '≥ 75 años', value: 6 },
        ],
      },
      {
        id: 'cronico',
        type: 'select',
        label: 'Enfermedad crónica grave',
        description:
          'Cirrosis con hipertensión portal, insuficiencia cardíaca clase IV, enfermedad respiratoria crónica grave, diálisis crónica o inmunodepresión.',
        dropdown: true,
        options: [
          { label: 'Ninguna', value: 0 },
          { label: 'Presente — postoperatorio programado', value: 2 },
          { label: 'Presente — no quirúrgico o postoperatorio urgente', value: 5 },
        ],
      },
    ],
    compute: (v) => {
      const crea = (v.creatinina ?? 0) * (v.renalAguda === 1 ? 2 : 1)
      const gcsPuntos = 15 - v.gcs!
      const score =
        sum(v, ['temp', 'pam', 'fc', 'fr', 'oxigenacion', 'ph', 'sodio', 'potasio', 'hematocrito', 'leucocitos', 'edad', 'cronico']) +
        crea +
        gcsPuntos
      const mort =
        score <= 4 ? '≈ 4 %' : score <= 9 ? '≈ 8 %' : score <= 14 ? '≈ 15 %' : score <= 19 ? '≈ 25 %' : score <= 24 ? '≈ 40 %' : score <= 29 ? '≈ 55 %' : score <= 34 ? '≈ 73 %' : '≈ 85 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–71)',
        secondary: mort,
        secondaryLabel: 'mortalidad hospitalaria orientativa',
        interpretation:
          score <= 9
            ? 'Gravedad baja.'
            : score <= 19
              ? 'Gravedad moderada.'
              : score <= 29
                ? 'Gravedad alta.'
                : 'Gravedad muy alta.',
        level: score <= 9 ? 'ok' : score <= 19 ? 'warn' : 'danger',
        details: [
          `Puntos por Glasgow: ${gcsPuntos} (15 − GCS).`,
          `Puntos por creatinina: ${crea}${v.renalAguda === 1 ? ' (duplicados por insuficiencia renal aguda)' : ''}.`,
        ],
      }
    },
    notes: [
      'Usar los peores valores de las primeras 24 horas de ingreso en la UCI.',
      'La mortalidad exacta depende además del diagnóstico de ingreso mediante coeficientes específicos; las cifras mostradas son orientativas por tramos.',
      'Los porcentajes proceden de cohortes de los años ochenta y sobreestiman la mortalidad actual.',
    ],
    references: [
      'Knaus WA, et al. APACHE II: a severity of disease classification system. Crit Care Med. 1985;13(10):818-29.',
    ],
  },
  {
    id: 'news2',
    name: 'Puntuación nacional de alerta temprana 2 (NEWS2)',
    shortName: 'NEWS2',
    description:
      'Detecta el deterioro clínico agudo y gradúa la respuesta asistencial (versión recomendada por el NHS).',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'fr',
        type: 'select',
        label: 'Frecuencia respiratoria (rpm)',
        dropdown: true,
        options: [
          { label: '≤ 8', value: 3 },
          { label: '9–11', value: 1 },
          { label: '12–20', value: 0 },
          { label: '21–24', value: 2 },
          { label: '≥ 25', value: 3 },
        ],
        default: 0,
      },
      {
        id: 'escala',
        type: 'select',
        label: 'Escala de saturación',
        noPoints: true,
        options: [
          { label: 'Escala 1 (habitual)', value: 0 },
          { label: 'Escala 2 (riesgo de insuficiencia respiratoria hipercápnica)', value: 1 },
        ],
      },
      {
        id: 'spo2a',
        type: 'select',
        label: 'SpO₂ — escala 1',
        dropdown: true,
        options: [
          { label: '≤ 91 %', value: 3 },
          { label: '92–93 %', value: 2 },
          { label: '94–95 %', value: 1 },
          { label: '≥ 96 %', value: 0 },
        ],
        default: 0,
      },
      {
        id: 'spo2b',
        type: 'select',
        label: 'SpO₂ — escala 2 (objetivo 88–92 %)',
        dropdown: true,
        options: [
          { label: '≤ 83 %', value: 3 },
          { label: '84–85 %', value: 2 },
          { label: '86–87 %', value: 1 },
          { label: '88–92 % sin oxígeno, o ≥ 93 % sin oxígeno', value: 0 },
          { label: '93–94 % con oxígeno', value: 1 },
          { label: '95–96 % con oxígeno', value: 2 },
          { label: '≥ 97 % con oxígeno', value: 3 },
        ],
        default: 0,
      },
      {
        id: 'oxigeno',
        type: 'select',
        label: 'Oxigenoterapia',
        options: [
          { label: 'Aire ambiente', value: 0 },
          { label: 'Oxígeno suplementario', value: 2 },
        ],
      },
      {
        id: 'pas',
        type: 'select',
        label: 'Presión arterial sistólica (mmHg)',
        dropdown: true,
        options: [
          { label: '≤ 90', value: 3 },
          { label: '91–100', value: 2 },
          { label: '101–110', value: 1 },
          { label: '111–219', value: 0 },
          { label: '≥ 220', value: 3 },
        ],
        default: 0,
      },
      {
        id: 'fc',
        type: 'select',
        label: 'Frecuencia cardíaca (lpm)',
        dropdown: true,
        options: [
          { label: '≤ 40', value: 3 },
          { label: '41–50', value: 1 },
          { label: '51–90', value: 0 },
          { label: '91–110', value: 1 },
          { label: '111–130', value: 2 },
          { label: '≥ 131', value: 3 },
        ],
        default: 0,
      },
      {
        id: 'conciencia',
        type: 'select',
        label: 'Nivel de conciencia',
        options: [
          { label: 'Alerta', value: 0 },
          { label: 'Confusión nueva, responde a voz o dolor, o no responde', value: 3 },
        ],
      },
      {
        id: 'temp',
        type: 'select',
        label: 'Temperatura (°C)',
        dropdown: true,
        options: [
          { label: '≤ 35', value: 3 },
          { label: '35,1–36', value: 1 },
          { label: '36,1–38', value: 0 },
          { label: '38,1–39', value: 1 },
          { label: '≥ 39,1', value: 2 },
        ],
        default: 0,
      },
    ],
    compute: (v) => {
      const esc2 = v.escala === 1
      const spo2 = esc2 ? (v.spo2b ?? 0) : (v.spo2a ?? 0)
      const score = sum(v, ['fr', 'oxigeno', 'pas', 'fc', 'conciencia', 'temp']) + spo2
      const parametros = [v.fr, v.oxigeno, v.pas, v.fc, v.conciencia, v.temp, spo2]
      const algunoTres = parametros.some((p) => p === 3)
      const banda =
        score >= 7 ? 'alto' : score >= 5 || algunoTres ? 'medio' : score >= 1 ? 'bajo' : 'muy bajo'
      return {
        main: String(score),
        mainUnit: 'puntos (0–20)',
        secondary: `Riesgo ${banda}`,
        interpretation:
          banda === 'alto'
            ? 'Riesgo alto (≥ 7): valoración urgente por el equipo de cuidados críticos, monitorización continua y traslado a un nivel de cuidados superior.'
            : banda === 'medio'
              ? 'Riesgo medio (5–6, o 3 puntos en un solo parámetro): valoración urgente por el médico responsable y monitorización al menos horaria.'
              : banda === 'bajo'
                ? 'Riesgo bajo (1–4): valoración por enfermería y control de constantes cada 4–6 h.'
                : 'Riesgo muy bajo: control rutinario cada 12 h.',
        level: banda === 'alto' ? 'danger' : banda === 'medio' ? 'warn' : banda === 'bajo' ? 'info' : 'ok',
        details: [
          esc2
            ? 'Escala 2: solo para pacientes con insuficiencia respiratoria hipercápnica confirmada y objetivo de saturación 88–92 % prescrito.'
            : 'Escala 1: objetivo de saturación habitual.',
          algunoTres && score < 5 ? 'Alerta: hay un parámetro con 3 puntos, lo que eleva la respuesta a riesgo medio.' : '',
        ].filter(Boolean),
      }
    },
    notes: [
      'NEWS2 no está validada en embarazadas, pacientes pediátricos ni en pacientes con limitación del esfuerzo terapéutico.',
      'La confusión de nueva aparición puntúa igual que la respuesta solo a la voz o al dolor.',
    ],
    references: [
      'Royal College of Physicians. National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS. Londres, 2017.',
    ],
  },
  {
    id: 'braden',
    name: 'Escala de Braden para el riesgo de úlceras por presión',
    shortName: 'Braden',
    description: 'Identifica a los pacientes con riesgo de desarrollar úlceras por presión.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'sensorial',
        type: 'select',
        label: 'Percepción sensorial',
        dropdown: true,
        options: escala([
          [1, 'Completamente limitada: no responde a estímulos dolorosos'],
          [2, 'Muy limitada: solo responde a estímulos dolorosos'],
          [3, 'Ligeramente limitada: responde a órdenes verbales, con alguna limitación'],
          [4, 'Sin limitaciones: responde a órdenes verbales, sin déficit sensorial'],
        ]),
        default: 4,
      },
      {
        id: 'humedad',
        type: 'select',
        label: 'Exposición a la humedad',
        dropdown: true,
        options: escala([
          [1, 'Constantemente húmeda'],
          [2, 'A menudo húmeda'],
          [3, 'Ocasionalmente húmeda'],
          [4, 'Raramente húmeda'],
        ]),
        default: 4,
      },
      {
        id: 'actividad',
        type: 'select',
        label: 'Actividad',
        dropdown: true,
        options: escala([
          [1, 'Encamado'],
          [2, 'En silla'],
          [3, 'Deambula ocasionalmente'],
          [4, 'Deambula con frecuencia'],
        ]),
        default: 4,
      },
      {
        id: 'movilidad',
        type: 'select',
        label: 'Movilidad',
        dropdown: true,
        options: escala([
          [1, 'Completamente inmóvil'],
          [2, 'Muy limitada'],
          [3, 'Ligeramente limitada'],
          [4, 'Sin limitaciones'],
        ]),
        default: 4,
      },
      {
        id: 'nutricion',
        type: 'select',
        label: 'Nutrición',
        dropdown: true,
        options: escala([
          [1, 'Muy pobre'],
          [2, 'Probablemente inadecuada'],
          [3, 'Adecuada'],
          [4, 'Excelente'],
        ]),
        default: 4,
      },
      {
        id: 'roce',
        type: 'select',
        label: 'Roce y peligro de lesiones',
        dropdown: true,
        options: escala([
          [1, 'Problema: requiere ayuda importante para moverse; se desliza con frecuencia'],
          [2, 'Problema potencial: se mueve con dificultad o requiere ayuda mínima'],
          [3, 'Sin problema aparente: se mueve solo en la cama y en la silla'],
        ]),
        default: 3,
      },
    ],
    compute: (v) => {
      const score = sum(v, ['sensorial', 'humedad', 'actividad', 'movilidad', 'nutricion', 'roce'])
      const banda =
        score <= 9 ? 'muy alto' : score <= 12 ? 'alto' : score <= 14 ? 'moderado' : score <= 18 ? 'leve' : 'sin riesgo'
      return {
        main: String(score),
        mainUnit: 'puntos (6–23)',
        secondary: `Riesgo ${banda}`,
        interpretation:
          score <= 18
            ? `Riesgo ${banda} de úlceras por presión: protocolo de prevención con cambios posturales programados, superficies especiales de manejo de la presión, cuidado de la piel y soporte nutricional.`
            : 'Sin riesgo según la escala; reevaluar si cambia la situación clínica.',
        level: score <= 12 ? 'danger' : score <= 14 ? 'warn' : score <= 18 ? 'info' : 'ok',
      }
    },
    notes: [
      '≤ 9: riesgo muy alto · 10–12: alto · 13–14: moderado · 15–18: leve · ≥ 19: sin riesgo.',
      'En pacientes críticos suele adoptarse un umbral más conservador (≤ 16) por la mayor incidencia de lesiones.',
    ],
    references: [
      'Bergstrom N, et al. The Braden Scale for Predicting Pressure Sore Risk. Nurs Res. 1987;36(4):205-10.',
    ],
  },
  {
    id: 'indice-choque-diastolico',
    name: 'Índice de choque diastólico (DSI)',
    shortName: 'DSI',
    description:
      'Evalúa el riesgo de shock séptico en pacientes con sepsis o sospecha de infección.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'fc', type: 'number', label: 'Frecuencia cardíaca', unit: 'lpm', min: 20, max: 250 },
      { id: 'pad', type: 'number', label: 'Presión arterial diastólica', unit: 'mmHg', min: 10, max: 150 },
    ],
    compute: (v) => {
      const dsi = v.fc! / v.pad!
      return {
        main: fmt(dsi, 2),
        interpretation:
          dsi >= 2.5
            ? 'DSI ≥ 2,5: se asocia a mayor mortalidad y a mayor probabilidad de necesitar vasopresores. Reevaluar la perfusión, el lactato y la respuesta a fluidos.'
            : 'DSI < 2,5: menor riesgo según este índice; continuar la reevaluación clínica.',
        level: dsi >= 2.5 ? 'danger' : 'ok',
        details: ['DSI = frecuencia cardíaca / presión arterial diastólica.'],
      }
    },
    notes: ['La presión diastólica refleja el tono vascular; su descenso con taquicardia sugiere vasoplejia precoz.'],
    references: [
      'Ospina-Tascón GA, et al. Diastolic shock index and clinical outcomes in patients with septic shock. Ann Intensive Care. 2020;10(1):41.',
    ],
  },
  {
    id: 'nutric',
    name: 'Puntuación NUTRIC modificada (riesgo nutricional en el paciente crítico)',
    shortName: 'NUTRIC',
    description:
      'Identifica a los pacientes críticos que más se benefician de una terapia nutricional intensiva.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 50 años', value: 0 },
          { label: '50–74 años', value: 1 },
          { label: '≥ 75 años', value: 2 },
        ],
      },
      {
        id: 'apache',
        type: 'select',
        label: 'APACHE II',
        dropdown: true,
        options: [
          { label: '< 15', value: 0 },
          { label: '15–19', value: 1 },
          { label: '20–27', value: 2 },
          { label: '≥ 28', value: 3 },
        ],
      },
      {
        id: 'sofa',
        type: 'select',
        label: 'SOFA',
        options: [
          { label: '< 6', value: 0 },
          { label: '6–9', value: 1 },
          { label: '≥ 10', value: 2 },
        ],
      },
      {
        id: 'comorbilidades',
        type: 'select',
        label: 'Número de comorbilidades',
        options: [
          { label: '0–1', value: 0 },
          { label: '≥ 2', value: 1 },
        ],
      },
      {
        id: 'dias',
        type: 'select',
        label: 'Días de hospitalización antes del ingreso en UCI',
        options: [
          { label: '0–< 1 día', value: 0 },
          { label: '≥ 1 día', value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'apache', 'sofa', 'comorbilidades', 'dias'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–9)',
        interpretation:
          score >= 5
            ? 'Riesgo nutricional alto (≥ 5): se benefician de una terapia nutricional precoz y agresiva, con vigilancia estrecha del aporte proteico-calórico.'
            : 'Riesgo nutricional bajo (0–4): menor probabilidad de beneficio de la nutrición agresiva; aplicar el soporte nutricional habitual.',
        level: score >= 5 ? 'danger' : 'ok',
      }
    },
    notes: ['Versión modificada (sin interleucina 6), que es la utilizada habitualmente en la práctica clínica.'],
    references: [
      'Heyland DK, et al. Identifying critically ill patients who benefit the most from nutrition therapy: the development and initial validation of a novel risk assessment tool. Crit Care. 2011;15(6):R268.',
    ],
  },
  {
    id: 'must',
    name: 'Herramienta universal de cribado de desnutrición (MUST)',
    shortName: 'MUST',
    description: 'Identifica a los adultos desnutridos o en riesgo de desnutrición.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'imc',
        type: 'select',
        label: 'Índice de masa corporal',
        options: [
          { label: '> 20 kg/m² (> 30 en obesidad)', value: 0 },
          { label: '18,5–20 kg/m²', value: 1 },
          { label: '< 18,5 kg/m²', value: 2 },
        ],
      },
      {
        id: 'perdida',
        type: 'select',
        label: 'Pérdida de peso no intencionada en 3–6 meses',
        options: [
          { label: '< 5 %', value: 0 },
          { label: '5–10 %', value: 1 },
          { label: '> 10 %', value: 2 },
        ],
      },
      {
        id: 'agudo',
        type: 'boolean',
        label: 'Enfermedad aguda con ausencia de ingesta prevista > 5 días',
        points: 2,
      },
    ],
    compute: (v) => {
      const score = sum(v, ['imc', 'perdida', 'agudo'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–6)',
        interpretation:
          score >= 2
            ? 'Riesgo alto de desnutrición: valoración por nutrición, plan de tratamiento nutricional y monitorización de la ingesta.'
            : score === 1
              ? 'Riesgo medio: registrar la ingesta durante 3 días y repetir el cribado.'
              : 'Riesgo bajo: repetir el cribado de forma periódica según el ámbito asistencial.',
        level: score >= 2 ? 'danger' : score === 1 ? 'warn' : 'ok',
      }
    },
    references: [
      'Elia M (ed.). The MUST Report. Nutritional screening of adults: a multidisciplinary responsibility. BAPEN, 2003.',
    ],
  },
  {
    id: 'nrs-2002',
    name: 'Cribado de riesgo nutricional NRS-2002',
    shortName: 'NRS-2002',
    description: 'Predice el riesgo de desnutrición en pacientes hospitalizados.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'nutricional',
        type: 'select',
        label: 'Deterioro del estado nutricional',
        dropdown: true,
        options: escala([
          [0, 'Normal'],
          [1, 'Leve: pérdida > 5 % en 3 meses, o ingesta del 50–75 % de lo habitual en la última semana'],
          [2, 'Moderado: pérdida > 5 % en 2 meses, IMC 18,5–20,5 con estado general afectado, o ingesta del 25–50 %'],
          [3, 'Grave: pérdida > 5 % en 1 mes (> 15 % en 3 meses), IMC < 18,5 con estado general afectado, o ingesta del 0–25 %'],
        ]),
      },
      {
        id: 'severidad',
        type: 'select',
        label: 'Gravedad de la enfermedad (aumento de los requerimientos)',
        dropdown: true,
        options: escala([
          [0, 'Requerimientos normales'],
          [1, 'Leve: fractura de cadera, enfermedad crónica con complicaciones, cirrosis, EPOC, diálisis, oncológico'],
          [2, 'Moderada: cirugía abdominal mayor, ictus, neumonía grave, neoplasia hematológica'],
          [3, 'Grave: traumatismo craneal, trasplante de médula ósea, paciente crítico con APACHE II > 10'],
        ]),
      },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 70 años' },
    ],
    compute: (v) => {
      const score = sum(v, ['nutricional', 'severidad', 'edad'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–7)',
        interpretation:
          score >= 3
            ? 'Riesgo nutricional presente (≥ 3): iniciar un plan de soporte nutricional.'
            : 'Sin riesgo nutricional en este momento: repetir el cribado semanalmente durante el ingreso.',
        level: score >= 3 ? 'danger' : 'ok',
      }
    },
    notes: ['Todo paciente crítico ingresado en UCI tiene, por definición, una gravedad de al menos 3 puntos, por lo que suele considerarse en riesgo.'],
    references: [
      'Kondrup J, et al. Nutritional risk screening (NRS 2002): a new method based on an analysis of controlled clinical trials. Clin Nutr. 2003;22(3):321-36.',
    ],
  },
  {
    id: 'aldrete',
    name: 'Puntuación de Aldrete modificada',
    shortName: 'Aldrete',
    description:
      'Evalúa si el paciente está en condiciones de recibir el alta de la unidad de recuperación postanestésica.',
    category: CAT,
    specialty: [...UCI, 'Anestesiología'],
    inputs: [
      {
        id: 'actividad',
        type: 'select',
        label: 'Actividad (mueve las extremidades voluntariamente o a la orden)',
        dropdown: true,
        options: escala([
          [2, 'Mueve las cuatro extremidades'],
          [1, 'Mueve dos extremidades'],
          [0, 'No mueve ninguna extremidad'],
        ]),
        default: 2,
      },
      {
        id: 'respiracion',
        type: 'select',
        label: 'Respiración',
        dropdown: true,
        options: escala([
          [2, 'Respira profundamente y tose con facilidad'],
          [1, 'Disnea o respiración limitada'],
          [0, 'Apnea'],
        ]),
        default: 2,
      },
      {
        id: 'circulacion',
        type: 'select',
        label: 'Circulación',
        dropdown: true,
        options: escala([
          [2, 'Presión arterial ± 20 % del valor preanestésico'],
          [1, 'Presión arterial ± 20–49 % del valor preanestésico'],
          [0, 'Presión arterial ± 50 % o más del valor preanestésico'],
        ]),
        default: 2,
      },
      {
        id: 'conciencia',
        type: 'select',
        label: 'Conciencia',
        dropdown: true,
        options: escala([
          [2, 'Completamente despierto'],
          [1, 'Despierta al llamarlo'],
          [0, 'No responde'],
        ]),
        default: 2,
      },
      {
        id: 'saturacion',
        type: 'select',
        label: 'Saturación de oxígeno',
        dropdown: true,
        options: escala([
          [2, 'SpO₂ > 92 % respirando aire ambiente'],
          [1, 'Necesita oxígeno para mantener SpO₂ > 90 %'],
          [0, 'SpO₂ < 90 % incluso con oxígeno'],
        ]),
        default: 2,
      },
    ],
    compute: (v) => {
      const score = sum(v, ['actividad', 'respiracion', 'circulacion', 'conciencia', 'saturacion'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        interpretation:
          score >= 9
            ? 'Puntuación ≥ 9: criterios de alta de la unidad de recuperación postanestésica cumplidos, siempre que no haya otros problemas (dolor no controlado, náuseas, sangrado, bloqueo residual).'
            : 'Puntuación < 9: mantener en la unidad de recuperación con vigilancia y tratar la causa del déficit.',
        level: score >= 9 ? 'ok' : 'warn',
      }
    },
    references: [
      'Aldrete JA. The post-anesthesia recovery score revisited. J Clin Anesth. 1995;7(1):89-91.',
    ],
  },
]
