import type { Calculator } from '../engine/types'
import { sum } from '../engine/types'

const CAT_DX = 'Criterios diagnósticos'
const CAT_GRAV = 'Gravedad y pronóstico'
const CARD = ['Cardiología']

export const cardioVarios: Calculator[] = [
  {
    id: 'duke-endocarditis',
    name: 'Criterios de Duke modificados para la endocarditis infecciosa',
    shortName: 'Duke',
    description: 'Criterios diagnósticos de endocarditis infecciosa (versión modificada de Li).',
    category: CAT_DX,
    specialty: CARD,
    inputs: [
      {
        id: 'hemocultivos',
        type: 'boolean',
        label: 'Mayor: hemocultivos positivos típicos',
        description:
          'Microorganismos típicos en 2 hemocultivos separados, hemocultivos persistentemente positivos o Coxiella burnetii (título IgG > 1:800).',
        noPoints: true,
      },
      {
        id: 'imagen',
        type: 'boolean',
        label: 'Mayor: evidencia de afectación endocárdica',
        description: 'Vegetación, absceso, dehiscencia de prótesis o nueva insuficiencia valvular.',
        noPoints: true,
      },
      { id: 'predisposicion', type: 'boolean', label: 'Menor: cardiopatía predisponente o uso de drogas por vía parenteral', noPoints: true },
      { id: 'fiebre', type: 'boolean', label: 'Menor: fiebre > 38 °C', noPoints: true },
      {
        id: 'vascular',
        type: 'boolean',
        label: 'Menor: fenómenos vasculares',
        description: 'Embolias arteriales, infartos pulmonares sépticos, aneurisma micótico, hemorragia intracraneal o conjuntival, lesiones de Janeway.',
        noPoints: true,
      },
      {
        id: 'inmunologico',
        type: 'boolean',
        label: 'Menor: fenómenos inmunológicos',
        description: 'Glomerulonefritis, nódulos de Osler, manchas de Roth o factor reumatoide.',
        noPoints: true,
      },
      { id: 'microbiologico', type: 'boolean', label: 'Menor: evidencia microbiológica que no cumple criterio mayor', noPoints: true },
    ],
    compute: (v) => {
      const mayores = sum(v, ['hemocultivos', 'imagen'])
      const menores = sum(v, ['predisposicion', 'fiebre', 'vascular', 'inmunologico', 'microbiologico'])
      const definida = mayores === 2 || (mayores === 1 && menores >= 3) || menores >= 5
      const posible = !definida && ((mayores === 1 && menores >= 1) || menores >= 3)
      return {
        main: definida ? 'Endocarditis definida' : posible ? 'Endocarditis posible' : 'Criterios no cumplidos',
        secondary: `${mayores} mayores · ${menores} menores`,
        interpretation: definida
          ? 'Criterios clínicos de endocarditis definida (2 mayores, o 1 mayor + 3 menores, o 5 menores). Iniciar tratamiento y valoración por el equipo de endocarditis.'
          : posible
            ? 'Endocarditis posible (1 mayor + 1 menor, o 3 menores): mantener alta sospecha, repetir hemocultivos e imagen (ecocardiograma transesofágico, PET-TC si procede).'
            : 'No se cumplen criterios: considerar diagnósticos alternativos, sin olvidar que un tratamiento antibiótico previo puede negativizar los hemocultivos.',
        level: definida ? 'danger' : posible ? 'warn' : 'ok',
      }
    },
    notes: [
      'El diagnóstico también es definido con criterios patológicos (microorganismos o lesiones en la anatomía patológica de la vegetación o del absceso).',
      'La lista de MDCalc incluye además los criterios ISCVID 2023, pendientes de incorporar.',
    ],
    references: [
      'Li JS, et al. Proposed modifications to the Duke criteria for the diagnosis of infective endocarditis. Clin Infect Dis. 2000;30(4):633-8.',
    ],
  },
  {
    id: 'isth-cid',
    name: 'Criterios de la ISTH para la coagulación intravascular diseminada',
    shortName: 'CID (ISTH)',
    description: 'Diagnostica la coagulación intravascular diseminada manifiesta.',
    category: CAT_DX,
    specialty: CARD,
    inputs: [
      {
        id: 'plaquetas',
        type: 'select',
        label: 'Plaquetas (×10³/µL)',
        options: [
          { label: '≥ 100', value: 0 },
          { label: '50–99', value: 1 },
          { label: '< 50', value: 2 },
        ],
      },
      {
        id: 'dimero',
        type: 'select',
        label: 'Marcadores de fibrina (dímero D, PDF)',
        options: [
          { label: 'Sin elevación', value: 0 },
          { label: 'Elevación moderada', value: 2 },
          { label: 'Elevación intensa', value: 3 },
        ],
      },
      {
        id: 'tp',
        type: 'select',
        label: 'Prolongación del tiempo de protrombina',
        options: [
          { label: '< 3 s', value: 0 },
          { label: '3–6 s', value: 1 },
          { label: '> 6 s', value: 2 },
        ],
      },
      {
        id: 'fibrinogeno',
        type: 'select',
        label: 'Fibrinógeno',
        options: [
          { label: '≥ 100 mg/dL', value: 0 },
          { label: '< 100 mg/dL', value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['plaquetas', 'dimero', 'tp', 'fibrinogeno'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–8)',
        interpretation:
          score >= 5
            ? 'Compatible con CID manifiesta (≥ 5 puntos): repetir a diario, tratar la causa subyacente y dar soporte hemostático según sangrado.'
            : 'No sugiere CID manifiesta (< 5 puntos): si la sospecha clínica persiste, repetir en 1–2 días.',
        level: score >= 5 ? 'danger' : 'ok',
      }
    },
    notes: ['El algoritmo solo debe aplicarse en pacientes con una enfermedad de base conocida asociada a CID (sepsis, trauma, neoplasia, complicaciones obstétricas…).'],
    references: [
      'Taylor FB Jr, et al. Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation. Thromb Haemost. 2001;86(5):1327-30.',
    ],
  },
  {
    id: 'jones',
    name: 'Criterios de Jones para la fiebre reumática aguda',
    shortName: 'Jones',
    description: 'Diagnostica la fiebre reumática aguda (revisión de 2015 de la AHA).',
    category: CAT_DX,
    specialty: CARD,
    inputs: [
      {
        id: 'poblacion',
        type: 'select',
        label: 'Población',
        noPoints: true,
        options: [
          { label: 'Riesgo bajo', value: 0 },
          { label: 'Riesgo moderado-alto', value: 1 },
        ],
      },
      {
        id: 'estreptococo',
        type: 'boolean',
        label: 'Evidencia de infección estreptocócica previa',
        description: 'Cultivo, test rápido o ascenso de antiestreptolisina O.',
        noPoints: true,
      },
      { id: 'carditis', type: 'boolean', label: 'Mayor: carditis (clínica o subclínica por eco)', noPoints: true },
      { id: 'artritis', type: 'boolean', label: 'Mayor: artritis', description: 'Poliartritis en riesgo bajo; también monoartritis o poliartralgia en riesgo moderado-alto.', noPoints: true },
      { id: 'corea', type: 'boolean', label: 'Mayor: corea de Sydenham', noPoints: true },
      { id: 'eritema', type: 'boolean', label: 'Mayor: eritema marginado', noPoints: true },
      { id: 'nodulos', type: 'boolean', label: 'Mayor: nódulos subcutáneos', noPoints: true },
      { id: 'fiebre', type: 'boolean', label: 'Menor: fiebre (≥ 38,5 °C en riesgo bajo; ≥ 38 °C en riesgo moderado-alto)', noPoints: true },
      { id: 'artralgia', type: 'boolean', label: 'Menor: poliartralgia (riesgo bajo) o monoartralgia (riesgo moderado-alto)', noPoints: true },
      { id: 'reactantes', type: 'boolean', label: 'Menor: VSG o PCR elevadas', noPoints: true },
      { id: 'pr', type: 'boolean', label: 'Menor: intervalo PR prolongado', noPoints: true },
    ],
    compute: (v) => {
      const mayores = sum(v, ['carditis', 'artritis', 'corea', 'eritema', 'nodulos'])
      const menores = sum(v, ['fiebre', 'artralgia', 'reactantes', 'pr'])
      const cumple = mayores >= 2 || (mayores === 1 && menores >= 2)
      const conEstrepto = cumple && v.estreptococo === 1
      return {
        main: conEstrepto ? 'Fiebre reumática probable' : cumple ? 'Criterios clínicos cumplidos' : 'Criterios no cumplidos',
        secondary: `${mayores} mayores · ${menores} menores`,
        interpretation: conEstrepto
          ? 'Se cumplen los criterios (2 mayores o 1 mayor + 2 menores) junto con evidencia de infección estreptocócica previa: diagnóstico de fiebre reumática aguda. Iniciar tratamiento y profilaxis secundaria.'
          : cumple
            ? 'Se cumplen los criterios clínicos, pero falta evidencia de infección estreptocócica previa: necesaria para el diagnóstico (salvo corea o carditis indolente).'
            : 'No se cumplen los criterios de Jones en este momento.',
        level: conEstrepto ? 'danger' : cumple ? 'warn' : 'ok',
      }
    },
    notes: ['La corea de Sydenham y la carditis indolente pueden diagnosticar por sí solas, sin evidencia de infección estreptocócica previa.'],
    references: [
      'Gewitz MH, et al. Revision of the Jones Criteria for the diagnosis of acute rheumatic fever in the era of Doppler echocardiography. Circulation. 2015;131(20):1806-18.',
    ],
  },
  {
    id: 'kawasaki',
    name: 'Criterios diagnósticos de la enfermedad de Kawasaki',
    shortName: 'Kawasaki',
    description: 'Diagnostica la enfermedad de Kawasaki clásica e identifica formas incompletas.',
    category: CAT_DX,
    specialty: CARD,
    inputs: [
      { id: 'fiebre', type: 'boolean', label: 'Fiebre ≥ 5 días', noPoints: true },
      { id: 'conjuntivitis', type: 'boolean', label: 'Conjuntivitis bilateral no exudativa', noPoints: true },
      { id: 'oral', type: 'boolean', label: 'Cambios orofaríngeos', description: 'Labios agrietados, lengua aframbuesada o eritema faríngeo.', noPoints: true },
      { id: 'extremidades', type: 'boolean', label: 'Cambios en las extremidades', description: 'Eritema o edema de palmas y plantas; descamación periungueal en la fase subaguda.', noPoints: true },
      { id: 'exantema', type: 'boolean', label: 'Exantema polimorfo', noPoints: true },
      { id: 'adenopatia', type: 'boolean', label: 'Adenopatía cervical ≥ 1,5 cm (habitualmente unilateral)', noPoints: true },
    ],
    compute: (v) => {
      const criterios = sum(v, ['conjuntivitis', 'oral', 'extremidades', 'exantema', 'adenopatia'])
      const fiebre = v.fiebre === 1
      const clasica = fiebre && criterios >= 4
      const incompleta = fiebre && criterios >= 2 && criterios < 4
      return {
        main: clasica ? 'Kawasaki clásica' : incompleta ? 'Posible Kawasaki incompleta' : 'Criterios no cumplidos',
        secondary: `${criterios}/5`,
        secondaryLabel: 'criterios clínicos principales',
        interpretation: clasica
          ? 'Fiebre ≥ 5 días con ≥ 4 criterios principales: enfermedad de Kawasaki clásica. Tratamiento con inmunoglobulina intravenosa y AAS, y ecocardiograma precoz.'
          : incompleta
            ? 'Fiebre ≥ 5 días con 2–3 criterios: valorar Kawasaki incompleta con analítica (PCR, VSG, anemia, plaquetas, transaminasas, albúmina, piuria estéril) y ecocardiograma.'
            : 'No se cumplen los criterios; reevaluar si la fiebre persiste y descartar otras causas.',
        level: clasica ? 'danger' : incompleta ? 'warn' : 'ok',
      }
    },
    notes: ['Con ≥ 4 criterios principales (especialmente con afectación de extremidades) puede diagnosticarse al 4.º día de fiebre.'],
    references: [
      'McCrindle BW, et al. Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease. Circulation. 2017;135(17):e927-e999.',
    ],
  },
  {
    id: 'rope',
    name: 'Puntuación RoPE de embolia paradójica',
    shortName: 'RoPE',
    description:
      'Estima la probabilidad de que un foramen oval permeable sea la causa del ictus criptogénico.',
    category: CAT_GRAV,
    specialty: CARD,
    inputs: [
      { id: 'noHta', type: 'boolean', label: 'Sin antecedente de hipertensión arterial' },
      { id: 'noDm', type: 'boolean', label: 'Sin antecedente de diabetes mellitus' },
      { id: 'noIctus', type: 'boolean', label: 'Sin ictus ni AIT previos' },
      { id: 'noFumador', type: 'boolean', label: 'No fumador' },
      { id: 'cortical', type: 'boolean', label: 'Infarto cortical en la neuroimagen' },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        dropdown: true,
        options: [
          { label: '18–29 años', value: 5 },
          { label: '30–39 años', value: 4 },
          { label: '40–49 años', value: 3 },
          { label: '50–59 años', value: 2 },
          { label: '60–69 años', value: 1 },
          { label: '≥ 70 años', value: 0 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['noHta', 'noDm', 'noIctus', 'noFumador', 'cortical', 'edad'])
      const atribuible =
        score <= 3 ? '≈ 0 %' : score === 4 ? '38 %' : score === 5 ? '34 %' : score === 6 ? '62 %' : score === 7 ? '72 %' : score === 8 ? '84 %' : '88 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        secondary: atribuible,
        secondaryLabel: 'fracción atribuible al FOP',
        interpretation:
          score >= 7
            ? 'Puntuación alta: es probable que el foramen oval permeable sea causal del ictus; valorar cierre percutáneo junto con las características anatómicas de alto riesgo.'
            : score >= 5
              ? 'Puntuación intermedia: la relación causal es incierta; decisión individualizada en equipo multidisciplinar.'
              : 'Puntuación baja: el FOP probablemente sea un hallazgo incidental; buscar otras causas del ictus.',
        level: score >= 7 ? 'info' : score >= 5 ? 'warn' : 'ok',
      }
    },
    references: [
      'Kent DM, et al. An index to identify stroke-related vs incidental patent foramen ovale in cryptogenic stroke. Neurology. 2013;81(7):619-25.',
    ],
  },
  {
    id: 'mews',
    name: 'Puntuación de alerta temprana modificada (MEWS)',
    shortName: 'MEWS',
    description: 'Detecta el deterioro clínico del paciente hospitalizado a partir de las constantes vitales.',
    category: CAT_GRAV,
    specialty: CARD,
    inputs: [
      {
        id: 'pas',
        type: 'select',
        label: 'Presión arterial sistólica (mmHg)',
        dropdown: true,
        options: [
          { label: '≤ 70', value: 3 },
          { label: '71–80', value: 2 },
          { label: '81–100', value: 1 },
          { label: '101–199', value: 0 },
          { label: '≥ 200', value: 2 },
        ],
        default: 0,
      },
      {
        id: 'fc',
        type: 'select',
        label: 'Frecuencia cardíaca (lpm)',
        dropdown: true,
        options: [
          { label: '< 40', value: 2 },
          { label: '41–50', value: 1 },
          { label: '51–100', value: 0 },
          { label: '101–110', value: 1 },
          { label: '111–129', value: 2 },
          { label: '≥ 130', value: 3 },
        ],
        default: 0,
      },
      {
        id: 'fr',
        type: 'select',
        label: 'Frecuencia respiratoria (rpm)',
        dropdown: true,
        options: [
          { label: '< 9', value: 2 },
          { label: '9–14', value: 0 },
          { label: '15–20', value: 1 },
          { label: '21–29', value: 2 },
          { label: '≥ 30', value: 3 },
        ],
        default: 0,
      },
      {
        id: 'temp',
        type: 'select',
        label: 'Temperatura (°C)',
        dropdown: true,
        options: [
          { label: '< 35', value: 2 },
          { label: '35–38,4', value: 0 },
          { label: '≥ 38,5', value: 2 },
        ],
        default: 0,
      },
      {
        id: 'conciencia',
        type: 'select',
        label: 'Nivel de conciencia (AVDN)',
        dropdown: true,
        options: [
          { label: 'Alerta', value: 0 },
          { label: 'Responde a la voz', value: 1 },
          { label: 'Responde al dolor', value: 2 },
          { label: 'No responde', value: 3 },
        ],
        default: 0,
      },
    ],
    compute: (v) => {
      const score = sum(v, ['pas', 'fc', 'fr', 'temp', 'conciencia'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–14)',
        interpretation:
          score >= 5
            ? 'MEWS ≥ 5: riesgo elevado de deterioro, ingreso en cuidados intensivos o muerte. Avisar al equipo médico de forma urgente.'
            : score >= 3
              ? 'MEWS 3–4: aumentar la frecuencia de controles y avisar al equipo responsable.'
              : 'MEWS bajo: continuar la monitorización habitual.',
        level: score >= 5 ? 'danger' : score >= 3 ? 'warn' : 'ok',
      }
    },
    references: [
      'Subbe CP, et al. Validation of a modified Early Warning Score in medical admissions. QJM. 2001;94(10):521-6.',
    ],
  },
  {
    id: 'mmrc',
    name: 'Escala de disnea mMRC',
    shortName: 'mMRC',
    description: 'Clasifica la disnea según la limitación que produce en la actividad diaria.',
    category: CAT_GRAV,
    specialty: CARD,
    inputs: [
      {
        id: 'grado',
        type: 'select',
        label: 'Grado de disnea',
        dropdown: true,
        noPoints: true,
        options: [
          { label: '0 — Disnea solo con ejercicio intenso', value: 0 },
          { label: '1 — Disnea al andar deprisa en llano o subir una cuesta ligera', value: 1 },
          { label: '2 — Anda más despacio que las personas de su edad, o debe parar al andar a su paso en llano', value: 2 },
          { label: '3 — Para a descansar tras andar unos 100 m o pocos minutos en llano', value: 3 },
          { label: '4 — No puede salir de casa, o presenta disnea al vestirse o desvestirse', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const g = v.grado ?? 0
      return {
        main: `mMRC ${g}`,
        interpretation:
          g <= 1
            ? 'Disnea leve. En EPOC, un mMRC < 2 corresponde a los grupos de menor carga sintomática.'
            : 'Disnea significativa (mMRC ≥ 2): mayor carga sintomática; en EPOC indica tratamiento broncodilatador optimizado y rehabilitación respiratoria.',
        level: g <= 1 ? 'ok' : g === 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Bestall JC, et al. Usefulness of the Medical Research Council (MRC) dyspnoea scale as a measure of disability in patients with chronic obstructive pulmonary disease. Thorax. 1999;54(7):581-6.',
    ],
  },
  {
    id: 'lace',
    name: 'Índice LACE de riesgo de reingreso',
    shortName: 'LACE',
    description: 'Predice el riesgo de reingreso no programado o muerte a 30 días tras el alta hospitalaria.',
    category: CAT_GRAV,
    specialty: CARD,
    inputs: [
      {
        id: 'estancia',
        type: 'select',
        label: 'Duración del ingreso (L)',
        dropdown: true,
        options: [
          { label: '< 1 día', value: 1 },
          { label: '1 día', value: 1 },
          { label: '2 días', value: 2 },
          { label: '3 días', value: 3 },
          { label: '4–6 días', value: 4 },
          { label: '7–13 días', value: 5 },
          { label: '≥ 14 días', value: 7 },
        ],
      },
      { id: 'agudo', type: 'boolean', label: 'Ingreso urgente/agudo (A)', points: 3 },
      {
        id: 'charlson',
        type: 'select',
        label: 'Índice de comorbilidad de Charlson (C)',
        dropdown: true,
        options: [
          { label: '0', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '≥ 4', value: 5 },
        ],
      },
      {
        id: 'urgencias',
        type: 'select',
        label: 'Visitas a urgencias en los 6 meses previos (E)',
        dropdown: true,
        options: [
          { label: 'Ninguna', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '≥ 4', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['estancia', 'agudo', 'charlson', 'urgencias'])
      const banda = score <= 4 ? 'bajo' : score <= 9 ? 'moderado' : 'alto'
      return {
        main: String(score),
        mainUnit: 'puntos (0–19)',
        interpretation:
          banda === 'bajo'
            ? 'Riesgo bajo de reingreso o muerte a 30 días.'
            : banda === 'moderado'
              ? 'Riesgo moderado: reforzar la conciliación de la medicación y el seguimiento tras el alta.'
              : 'Riesgo alto (≥ 10): planificar el alta con seguimiento precoz, educación al paciente y coordinación con atención primaria.',
        level: banda === 'bajo' ? 'ok' : banda === 'moderado' ? 'warn' : 'danger',
      }
    },
    references: [
      'van Walraven C, et al. Derivation and validation of an index to predict early death or unplanned readmission after discharge from hospital to the community. CMAJ. 2010;182(6):551-7.',
    ],
  },
]
