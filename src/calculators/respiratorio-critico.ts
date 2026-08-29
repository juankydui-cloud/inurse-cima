import type { Calculator, Option } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Respiratorio crítico y ventilación'
const UCI = ['Medicina Intensiva']

const escala = (items: [number, string][]): Option[] =>
  items.map(([value, label]) => ({ label: `${value} — ${label}`, value }))

export const respiratorioCritico: Calculator[] = [
  {
    id: 'horowitz',
    name: 'Índice de Horowitz (relación PaO₂/FiO₂)',
    shortName: 'PaO₂/FiO₂',
    description: 'Evalúa la oxigenación y gradúa la gravedad de la insuficiencia respiratoria.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'pao2', type: 'number', label: 'PaO₂ arterial', unit: 'mmHg', min: 20, max: 700 },
      { id: 'fio2', type: 'number', label: 'FiO₂', unit: '%', min: 21, max: 100 },
    ],
    compute: (v) => {
      const pf = v.pao2! / (v.fio2! / 100)
      return {
        main: fmt(pf, 0),
        mainUnit: 'mmHg',
        interpretation:
          pf > 300
            ? 'Oxigenación conservada (> 300).'
            : pf > 200
              ? 'Rango de SDRA leve (201–300) si se cumplen el resto de criterios de Berlín.'
              : pf > 100
                ? 'Rango de SDRA moderado (101–200): considerar ventilación protectora y valorar decúbito prono.'
                : 'Rango de SDRA grave (≤ 100): ventilación protectora, decúbito prono y valorar bloqueo neuromuscular u oxigenación extracorpórea.',
        level: pf > 300 ? 'ok' : pf > 200 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Para clasificar el SDRA, la medición debe hacerse con PEEP o CPAP ≥ 5 cmH₂O.',
      'La relación depende de la PEEP y de la altitud; a gran altitud debe corregirse por la presión barométrica.',
    ],
  },
  {
    id: 'gradiente-aa',
    name: 'Gradiente alveolo-arterial de oxígeno (A-a)',
    shortName: 'Gradiente A-a',
    description:
      'Evalúa el grado de cortocircuito y de desequilibrio ventilación/perfusión en la hipoxemia.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 1, max: 110 },
      { id: 'fio2', type: 'number', label: 'FiO₂', unit: '%', min: 21, max: 100 },
      { id: 'pao2', type: 'number', label: 'PaO₂ arterial', unit: 'mmHg', min: 20, max: 700 },
      { id: 'paco2', type: 'number', label: 'PaCO₂ arterial', unit: 'mmHg', min: 10, max: 150 },
      { id: 'patm', type: 'number', label: 'Presión atmosférica', unit: 'mmHg', min: 400, max: 800, step: 1 },
    ],
    compute: (v) => {
      const pAO2 = (v.fio2! / 100) * (v.patm! - 47) - v.paco2! / 0.8
      const gradiente = pAO2 - v.pao2!
      const esperado = v.edad! / 4 + 4
      const elevado = gradiente > esperado
      return {
        main: fmt(gradiente, 1),
        mainUnit: 'mmHg',
        secondary: fmt(esperado, 1),
        secondaryLabel: 'gradiente esperado para la edad',
        interpretation: elevado
          ? 'Gradiente A-a elevado para la edad: sugiere alteración del intercambio gaseoso — desequilibrio ventilación/perfusión (neumonía, EPOC, atelectasia), cortocircuito (SDRA, edema pulmonar) o alteración de la difusión. La embolia pulmonar también lo eleva.'
          : 'Gradiente A-a normal para la edad: si hay hipoxemia, orienta a hipoventilación (fármacos, enfermedad neuromuscular) o a baja presión inspirada de oxígeno (altitud).',
        level: elevado ? 'warn' : 'ok',
        details: [
          `PAO₂ (alveolar) = FiO₂ × (Patm − 47) − PaCO₂/0,8 = ${fmt(pAO2, 1)} mmHg.`,
          'Gradiente esperado ≈ (edad/4) + 4 respirando aire ambiente.',
        ],
      }
    },
    notes: ['La estimación del gradiente esperado por la edad solo es válida respirando aire ambiente.'],
  },
  {
    id: 'berlin',
    name: 'Criterios de Berlín para el síndrome de distrés respiratorio agudo',
    shortName: 'Berlín (SDRA)',
    description: 'Define y gradúa el síndrome de distrés respiratorio agudo.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'tiempo',
        type: 'boolean',
        label: 'Inicio en la última semana',
        description: 'Aparición o empeoramiento de los síntomas respiratorios en los 7 días previos.',
        noPoints: true,
      },
      {
        id: 'imagen',
        type: 'boolean',
        label: 'Infiltrados bilaterales en la imagen torácica',
        description: 'No explicables por derrame, atelectasia lobar/pulmonar o nódulos.',
        noPoints: true,
      },
      {
        id: 'origen',
        type: 'boolean',
        label: 'No explicable por insuficiencia cardíaca ni sobrecarga de volumen',
        description: 'Si no hay factor de riesgo, se requiere una valoración objetiva (ecocardiograma) para excluir el edema hidrostático.',
        noPoints: true,
      },
      {
        id: 'peep',
        type: 'boolean',
        label: 'PEEP o CPAP ≥ 5 cmH₂O',
        noPoints: true,
      },
      { id: 'pao2', type: 'number', label: 'PaO₂', unit: 'mmHg', min: 20, max: 700 },
      { id: 'fio2', type: 'number', label: 'FiO₂', unit: '%', min: 21, max: 100 },
    ],
    compute: (v) => {
      const pf = v.pao2! / (v.fio2! / 100)
      const criterios = [v.tiempo, v.imagen, v.origen, v.peep].filter((x) => x === 1).length
      const cumple = criterios === 4 && pf <= 300
      const grado = pf <= 100 ? 'grave' : pf <= 200 ? 'moderado' : 'leve'
      const mort = pf <= 100 ? '≈ 45 %' : pf <= 200 ? '≈ 32 %' : '≈ 27 %'
      if (!cumple)
        return {
          main: 'No cumple criterios',
          secondary: fmt(pf, 0),
          secondaryLabel: 'PaO₂/FiO₂',
          interpretation:
            pf > 300
              ? `Faltan criterios: la relación PaO₂/FiO₂ (${fmt(pf, 0)}) es mayor de 300.`
              : `Faltan criterios clínicos (${criterios}/4 marcados). Los cuatro son necesarios además de la hipoxemia.`,
          level: 'info',
        }
      return {
        main: `SDRA ${grado}`,
        mainUnit: `PaO₂/FiO₂ ${fmt(pf, 0)}`,
        secondary: mort,
        secondaryLabel: 'mortalidad orientativa',
        interpretation: `Se cumplen los cuatro criterios de Berlín con hipoxemia en rango ${grado}. Ventilación protectora (volumen corriente 4–8 mL/kg de peso predicho, presión meseta < 30 cmH₂O), y en el SDRA moderado-grave valorar decúbito prono, bloqueo neuromuscular y, en casos refractarios, oxigenación por membrana extracorpórea.`,
        level: grado === 'leve' ? 'warn' : 'danger',
      }
    },
    references: [
      'ARDS Definition Task Force; Ranieri VM, et al. Acute respiratory distress syndrome: the Berlin Definition. JAMA. 2012;307(23):2526-33.',
    ],
  },
  {
    id: 'indice-oxigenacion',
    name: 'Índice de oxigenación (IO)',
    shortName: 'Índice de oxigenación',
    description:
      'Gradúa la gravedad de la insuficiencia respiratoria teniendo en cuenta el soporte ventilatorio; ayuda a decidir la indicación de ECMO, sobre todo en pediatría.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'map', type: 'number', label: 'Presión media de la vía aérea', unit: 'cmH₂O', min: 1, max: 60, step: 0.5 },
      { id: 'fio2', type: 'number', label: 'FiO₂', unit: '%', min: 21, max: 100 },
      { id: 'pao2', type: 'number', label: 'PaO₂', unit: 'mmHg', min: 10, max: 700 },
    ],
    compute: (v) => {
      const io = (v.map! * v.fio2!) / v.pao2!
      return {
        main: fmt(io, 1),
        interpretation:
          io < 4
            ? 'Índice bajo: insuficiencia respiratoria leve.'
            : io < 8
              ? 'Insuficiencia respiratoria moderada.'
              : io < 16
                ? 'Insuficiencia respiratoria grave: optimizar el soporte y valorar terapias de rescate.'
                : 'Insuficiencia respiratoria muy grave: en pediatría, un índice ≥ 16 mantenido suele considerarse criterio de valoración para ECMO (≥ 40 en los criterios clásicos neonatales).',
        level: io < 4 ? 'ok' : io < 8 ? 'warn' : 'danger',
        details: ['IO = (presión media de la vía aérea × FiO₂ × 100) / PaO₂, con la FiO₂ expresada en porcentaje.'],
      }
    },
    notes: ['Un índice más alto indica peor situación, a diferencia de la relación PaO₂/FiO₂.'],
  },
  {
    id: 'murray',
    name: 'Puntuación de Murray de lesión pulmonar aguda',
    shortName: 'Murray',
    description:
      'Estratifica la gravedad de la lesión pulmonar aguda; se usa en la selección de pacientes para ECMO.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'radiografia',
        type: 'select',
        label: 'Radiografía de tórax — cuadrantes con infiltrados alveolares',
        dropdown: true,
        options: escala([
          [0, 'Sin consolidación alveolar'],
          [1, 'Consolidación en 1 cuadrante'],
          [2, 'Consolidación en 2 cuadrantes'],
          [3, 'Consolidación en 3 cuadrantes'],
          [4, 'Consolidación en 4 cuadrantes'],
        ]),
      },
      {
        id: 'hipoxemia',
        type: 'select',
        label: 'Hipoxemia (PaO₂/FiO₂)',
        dropdown: true,
        options: escala([
          [0, '≥ 300'],
          [1, '225–299'],
          [2, '175–224'],
          [3, '100–174'],
          [4, '< 100'],
        ]),
      },
      {
        id: 'peep',
        type: 'select',
        label: 'PEEP (cmH₂O)',
        dropdown: true,
        options: escala([
          [0, '≤ 5'],
          [1, '6–8'],
          [2, '9–11'],
          [3, '12–14'],
          [4, '≥ 15'],
        ]),
      },
      {
        id: 'compliance',
        type: 'select',
        label: 'Distensibilidad pulmonar (mL/cmH₂O)',
        dropdown: true,
        options: escala([
          [0, '≥ 80'],
          [1, '60–79'],
          [2, '40–59'],
          [3, '20–39'],
          [4, '≤ 19'],
        ]),
      },
    ],
    compute: (v) => {
      const score = sum(v, ['radiografia', 'hipoxemia', 'peep', 'compliance']) / 4
      return {
        main: fmt(score, 2),
        mainUnit: 'puntos (0–4)',
        interpretation:
          score === 0
            ? 'Sin lesión pulmonar.'
            : score <= 2.5
              ? 'Lesión pulmonar leve-moderada.'
              : 'Lesión pulmonar grave (> 2,5): en el ensayo CESAR, una puntuación > 3 fue criterio de derivación para valorar ECMO.',
        level: score === 0 ? 'ok' : score <= 2.5 ? 'warn' : 'danger',
        details: ['Se calcula como la media de los cuatro componentes puntuados.'],
      }
    },
    references: [
      'Murray JF, et al. An expanded definition of the adult respiratory distress syndrome. Am Rev Respir Dis. 1988;138(3):720-3.',
    ],
  },
  {
    id: 'macocha',
    name: 'Puntuación MACOCHA de intubación difícil en la UCI',
    shortName: 'MACOCHA',
    description: 'Predice la dificultad de intubación en el paciente crítico.',
    category: CAT,
    specialty: [...UCI, 'Anestesiología'],
    inputs: [
      { id: 'mallampati', type: 'boolean', label: 'Mallampati III o IV (M)', points: 5 },
      { id: 'apnea', type: 'boolean', label: 'Síndrome de apnea obstructiva del sueño (A)', points: 2 },
      { id: 'cervical', type: 'boolean', label: 'Movilidad cervical reducida (C)', points: 1 },
      { id: 'apertura', type: 'boolean', label: 'Apertura bucal < 3 cm (O)', points: 1 },
      { id: 'coma', type: 'boolean', label: 'Coma (C)', points: 1 },
      { id: 'hipoxemia', type: 'boolean', label: 'Hipoxemia grave, SpO₂ < 80 % (H)', points: 1 },
      { id: 'noAnestesista', type: 'boolean', label: 'Operador no anestesiólogo (A)', points: 1 },
    ],
    compute: (v) => {
      const score = sum(v, ['mallampati', 'apnea', 'cervical', 'apertura', 'coma', 'hipoxemia', 'noAnestesista'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–12)',
        interpretation:
          score >= 3
            ? 'MACOCHA ≥ 3: riesgo elevado de intubación difícil. Preparar plan alternativo, preoxigenación optimizada (ventilación no invasiva u oxígeno de alto flujo), presencia del operador más experto y material de rescate disponible.'
            : 'MACOCHA < 3: baja probabilidad de intubación difícil, aunque el paciente crítico siempre exige preparación completa (valor predictivo negativo alto, positivo bajo).',
        level: score >= 3 ? 'danger' : 'ok',
      }
    },
    references: [
      'De Jong A, et al. Early identification of patients at risk for difficult intubation in the intensive care unit: development and validation of the MACOCHA score. Am J Respir Crit Care Med. 2013;187(8):832-9.',
    ],
  },
  {
    id: 'tet-profundidad',
    name: 'Profundidad del tubo endotraqueal y volumen corriente objetivo',
    shortName: 'Tubo endotraqueal',
    description:
      'Estima la profundidad de fijación del tubo endotraqueal y el volumen corriente según el peso corporal predicho.',
    category: CAT,
    specialty: [...UCI, 'Anestesiología'],
    inputs: [
      {
        id: 'sexo',
        type: 'select',
        label: 'Sexo',
        noPoints: true,
        options: [
          { label: 'Varón', value: 0 },
          { label: 'Mujer', value: 1 },
        ],
      },
      { id: 'talla', type: 'number', label: 'Talla', unit: 'cm', min: 100, max: 230 },
      {
        id: 'mlkg',
        type: 'select',
        label: 'Volumen corriente objetivo',
        noPoints: true,
        options: [
          { label: '4 mL/kg (SDRA grave)', value: 4 },
          { label: '6 mL/kg (ventilación protectora)', value: 6 },
          { label: '8 mL/kg (pulmón sano)', value: 8 },
        ],
        default: 6,
      },
    ],
    compute: (v) => {
      const pulgadas = v.talla! / 2.54
      const pcp =
        v.sexo === 1 ? 45.5 + 2.3 * (pulgadas - 60) : 50 + 2.3 * (pulgadas - 60)
      const vt = pcp * (v.mlkg ?? 6)
      const profundidad = v.sexo === 1 ? 21 : 23
      return {
        main: fmt(vt, 0),
        mainUnit: 'mL de volumen corriente',
        secondary: `${profundidad} cm`,
        secondaryLabel: 'profundidad orientativa en la comisura labial',
        interpretation:
          'El volumen corriente debe calcularse siempre sobre el peso corporal predicho (que depende solo de talla y sexo), nunca sobre el peso real.',
        level: 'info',
        details: [
          `Peso corporal predicho: ${fmt(pcp, 1)} kg.`,
          'Profundidad orientativa: 23 cm en varones y 21 cm en mujeres; también puede estimarse como 3 × el diámetro interno del tubo.',
          'Confirmar siempre la posición con auscultación, capnografía y radiografía de tórax (punta 3–5 cm sobre la carina).',
        ],
      }
    },
    references: [
      'The Acute Respiratory Distress Syndrome Network. Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury and ARDS. N Engl J Med. 2000;342(18):1301-8.',
    ],
  },
  {
    id: 'curb65',
    name: 'Puntuación CURB-65 para la neumonía adquirida en la comunidad',
    shortName: 'CURB-65',
    description:
      'Estima la mortalidad de la neumonía adquirida en la comunidad y orienta la decisión de ingreso.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'confusion', type: 'boolean', label: 'Confusión (C)', description: 'Desorientación en tiempo, espacio o persona, de nueva aparición.' },
      { id: 'urea', type: 'boolean', label: 'Urea > 42 mg/dL (BUN > 19 mg/dL) (U)' },
      { id: 'fr', type: 'boolean', label: 'Frecuencia respiratoria ≥ 30 rpm (R)' },
      { id: 'pa', type: 'boolean', label: 'PA sistólica < 90 mmHg o diastólica ≤ 60 mmHg (B)' },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 65 años' },
    ],
    compute: (v) => {
      const score = sum(v, ['confusion', 'urea', 'fr', 'pa', 'edad'])
      const mort = ['0,6 %', '2,7 %', '6,8 %', '14 %', '27,8 %', '27,8 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–5)',
        secondary: mort,
        secondaryLabel: 'mortalidad a 30 días',
        interpretation:
          score <= 1
            ? 'Riesgo bajo: habitualmente tratamiento ambulatorio.'
            : score === 2
              ? 'Riesgo intermedio: valorar ingreso hospitalario o unidad de corta estancia.'
              : 'Riesgo alto (≥ 3): ingreso hospitalario; con 4–5 puntos, valorar unidad de cuidados intensivos.',
        level: score <= 1 ? 'ok' : score === 2 ? 'warn' : 'danger',
      }
    },
    notes: ['La decisión de ingreso debe integrar también la comorbilidad, la oxigenación y el contexto social.'],
    references: [
      'Lim WS, et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study. Thorax. 2003;58(5):377-82.',
    ],
  },
  {
    id: 'crb65',
    name: 'Puntuación CRB-65 para la neumonía adquirida en la comunidad',
    shortName: 'CRB-65',
    description:
      'Clasifica la gravedad de la neumonía sin necesidad de pruebas de laboratorio (útil en atención primaria).',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'confusion', type: 'boolean', label: 'Confusión (C)' },
      { id: 'fr', type: 'boolean', label: 'Frecuencia respiratoria ≥ 30 rpm (R)' },
      { id: 'pa', type: 'boolean', label: 'PA sistólica < 90 mmHg o diastólica ≤ 60 mmHg (B)' },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 65 años' },
    ],
    compute: (v) => {
      const score = sum(v, ['confusion', 'fr', 'pa', 'edad'])
      const mort = ['0,9 %', '5,2 %', '12 %', '31,2 %', '31,2 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–4)',
        secondary: mort,
        secondaryLabel: 'mortalidad a 30 días',
        interpretation:
          score === 0
            ? 'Riesgo bajo: tratamiento ambulatorio razonable.'
            : score <= 2
              ? 'Riesgo intermedio: valorar derivación hospitalaria.'
              : 'Riesgo alto: derivación hospitalaria urgente.',
        level: score === 0 ? 'ok' : score <= 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Lim WS, et al. Defining community acquired pneumonia severity on presentation to hospital. Thorax. 2003;58(5):377-82.',
    ],
  },
  {
    id: 'bap65',
    name: 'Puntuación BAP-65 para la exacerbación aguda de la EPOC',
    shortName: 'BAP-65',
    description: 'Predice la mortalidad y la necesidad de ventilación mecánica en la exacerbación de la EPOC.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'bun', type: 'boolean', label: 'BUN ≥ 25 mg/dL (urea ≥ 53 mg/dL) (B)' },
      { id: 'mental', type: 'boolean', label: 'Alteración del estado mental (A)' },
      { id: 'pulso', type: 'boolean', label: 'Frecuencia cardíaca ≥ 109 lpm (P)' },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 65 años', value: 0 },
          { label: '≥ 65 años', value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const puntos = sum(v, ['bun', 'mental', 'pulso'])
      const mayor65 = v.edad === 1
      let clase: number
      if (puntos === 0) clase = mayor65 ? 2 : 1
      else if (puntos === 1) clase = 3
      else if (puntos === 2) clase = 4
      else clase = 5
      const mort = ['', '≈ 0,3 %', '≈ 1,0 %', '≈ 2,2 %', '≈ 6,4 %', '≈ 14,1 %'][clase]
      const vm = ['', '≈ 0,9 %', '≈ 1,9 %', '≈ 4,7 %', '≈ 14,3 %', '≈ 29,4 %'][clase]
      return {
        main: `Clase ${clase}`,
        mainUnit: `${puntos} de 3 criterios`,
        secondary: mort,
        secondaryLabel: 'mortalidad hospitalaria',
        interpretation:
          clase <= 2
            ? 'Riesgo bajo: manejo en planta convencional.'
            : clase === 3
              ? 'Riesgo intermedio: vigilancia estrecha.'
              : `Riesgo alto: valorar unidad de cuidados intermedios o intensivos. Necesidad de ventilación mecánica ${vm}.`,
        level: clase <= 2 ? 'ok' : clase === 3 ? 'warn' : 'danger',
      }
    },
    notes: ['La clase 1 corresponde a menores de 65 años sin ningún criterio; la clase 2, a mayores de 65 sin criterios.'],
    references: [
      'Shorr AF, et al. Validation of a novel risk score for severity of illness in acute exacerbations of COPD. Chest. 2011;140(5):1177-83.',
    ],
  },
  {
    id: 'decaf',
    name: 'Puntuación DECAF para la exacerbación aguda de la EPOC',
    shortName: 'DECAF',
    description: 'Predice la mortalidad hospitalaria en la exacerbación aguda de la EPOC.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'disnea',
        type: 'select',
        label: 'Disnea basal (eMRCD) (D)',
        dropdown: true,
        options: [
          { label: 'eMRCD 1–4 (no limitado a domicilio)', value: 0 },
          { label: 'eMRCD 5a: limitado a domicilio, autónomo para lavarse y vestirse', value: 1 },
          { label: 'eMRCD 5b: limitado a domicilio, no autónomo para lavarse ni vestirse', value: 2 },
        ],
      },
      { id: 'eosinopenia', type: 'boolean', label: 'Eosinopenia < 0,05 ×10⁹/L (E)' },
      { id: 'consolidacion', type: 'boolean', label: 'Consolidación radiológica (C)' },
      { id: 'acidemia', type: 'boolean', label: 'Acidemia (pH < 7,30) (A)' },
      { id: 'fibrilacion', type: 'boolean', label: 'Fibrilación auricular (F)' },
    ],
    compute: (v) => {
      const score = sum(v, ['disnea', 'eosinopenia', 'consolidacion', 'acidemia', 'fibrilacion'])
      const mort = ['1,0 %', '1,4 %', '5,4 %', '15,3 %', '31,0 %', '40,5 %', '50,0 %'][Math.min(score, 6)]
      return {
        main: String(score),
        mainUnit: 'puntos (0–6)',
        secondary: mort,
        secondaryLabel: 'mortalidad hospitalaria',
        interpretation:
          score <= 1
            ? 'Riesgo bajo: puede valorarse el manejo ambulatorio u hospitalización domiciliaria en casos seleccionados.'
            : score === 2
              ? 'Riesgo intermedio: ingreso convencional con vigilancia.'
              : 'Riesgo alto (≥ 3): considerar cuidados intermedios o intensivos y anticipar decisiones sobre el techo terapéutico.',
        level: score <= 1 ? 'ok' : score === 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Steer J, et al. The DECAF Score: predicting hospital mortality in exacerbations of chronic obstructive pulmonary disease. Thorax. 2012;67(11):970-6.',
    ],
  },
  {
    id: 'bode',
    name: 'Índice BODE para la supervivencia en la EPOC',
    shortName: 'BODE',
    description: 'Predice la supervivencia a 4 años en pacientes con EPOC.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'imc',
        type: 'select',
        label: 'Índice de masa corporal (B)',
        options: [
          { label: '> 21 kg/m²', value: 0 },
          { label: '≤ 21 kg/m²', value: 1 },
        ],
      },
      {
        id: 'fev1',
        type: 'select',
        label: 'FEV₁ posbroncodilatador (% del teórico) (O)',
        dropdown: true,
        options: [
          { label: '≥ 65 %', value: 0 },
          { label: '50–64 %', value: 1 },
          { label: '36–49 %', value: 2 },
          { label: '≤ 35 %', value: 3 },
        ],
      },
      {
        id: 'disnea',
        type: 'select',
        label: 'Disnea (escala mMRC) (D)',
        dropdown: true,
        options: [
          { label: 'mMRC 0–1', value: 0 },
          { label: 'mMRC 2', value: 1 },
          { label: 'mMRC 3', value: 2 },
          { label: 'mMRC 4', value: 3 },
        ],
      },
      {
        id: 'marcha',
        type: 'select',
        label: 'Prueba de la marcha de 6 minutos (E)',
        dropdown: true,
        options: [
          { label: '≥ 350 m', value: 0 },
          { label: '250–349 m', value: 1 },
          { label: '150–249 m', value: 2 },
          { label: '≤ 149 m', value: 3 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['imc', 'fev1', 'disnea', 'marcha'])
      const cuartil = score <= 2 ? 1 : score <= 4 ? 2 : score <= 6 ? 3 : 4
      const superv = ['', '80 %', '67 %', '57 %', '18 %'][cuartil]
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        secondary: superv,
        secondaryLabel: 'supervivencia aproximada a 4 años',
        interpretation: `Cuartil ${cuartil}. ${
          cuartil >= 3
            ? 'Mortalidad elevada: optimizar el tratamiento, la rehabilitación respiratoria y la planificación anticipada de cuidados; valorar trasplante en casos seleccionados.'
            : 'Pronóstico relativamente favorable; mantener el tratamiento optimizado y la rehabilitación.'
        }`,
        level: cuartil <= 2 ? 'ok' : cuartil === 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Celli BR, et al. The body-mass index, airflow obstruction, dyspnea, and exercise capacity index in chronic obstructive pulmonary disease. N Engl J Med. 2004;350(10):1005-12.',
    ],
  },
  {
    id: 'cat-epoc',
    name: 'Prueba de evaluación de la EPOC (CAT)',
    shortName: 'CAT',
    description: 'Cuantifica el impacto de los síntomas de la EPOC en la calidad de vida.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'tos', type: 'number', label: 'Tos (0 = nunca toso · 5 = toso siempre)', min: 0, max: 5, step: 1 },
      { id: 'flema', type: 'number', label: 'Flema (0 = sin flemas · 5 = lleno de flemas)', min: 0, max: 5, step: 1 },
      { id: 'opresion', type: 'number', label: 'Opresión torácica (0 = ninguna · 5 = mucha)', min: 0, max: 5, step: 1 },
      { id: 'cuesta', type: 'number', label: 'Disnea al subir una cuesta o un piso (0 = ninguna · 5 = mucha)', min: 0, max: 5, step: 1 },
      { id: 'actividades', type: 'number', label: 'Limitación de actividades domésticas (0 = ninguna · 5 = mucha)', min: 0, max: 5, step: 1 },
      { id: 'salir', type: 'number', label: 'Seguridad al salir de casa (0 = total · 5 = ninguna)', min: 0, max: 5, step: 1 },
      { id: 'dormir', type: 'number', label: 'Sueño (0 = duermo bien · 5 = no duermo bien)', min: 0, max: 5, step: 1 },
      { id: 'energia', type: 'number', label: 'Energía (0 = mucha · 5 = ninguna)', min: 0, max: 5, step: 1 },
    ],
    compute: (v) => {
      const ids = ['tos', 'flema', 'opresion', 'cuesta', 'actividades', 'salir', 'dormir', 'energia']
      if (ids.some((id) => (v[id] ?? 0) < 0 || (v[id] ?? 0) > 5))
        return { main: '—', interpretation: 'Cada ítem debe puntuarse entre 0 y 5.', level: 'warn' }
      const score = sum(v, ids)
      const impacto = score < 10 ? 'bajo' : score < 20 ? 'medio' : score < 30 ? 'alto' : 'muy alto'
      return {
        main: String(score),
        mainUnit: 'puntos (0–40)',
        secondary: `Impacto ${impacto}`,
        interpretation:
          score < 10
            ? 'Impacto bajo: la EPOC apenas limita la vida diaria.'
            : score < 20
              ? 'Impacto medio: la EPOC es uno de los problemas más importantes del paciente.'
              : 'Impacto alto o muy alto: la EPOC condiciona de forma importante la vida diaria; optimizar el tratamiento y valorar rehabilitación respiratoria.',
        level: score < 10 ? 'ok' : score < 20 ? 'warn' : 'danger',
        details: ['Un CAT ≥ 10 se usa como umbral de «más síntomas» en la clasificación GOLD.', 'Una diferencia de 2 puntos se considera clínicamente relevante.'],
      }
    },
    references: [
      'Jones PW, et al. Development and first validation of the COPD Assessment Test. Eur Respir J. 2009;34(3):648-54.',
    ],
  },
  {
    id: 'gold',
    name: 'Clasificación GOLD de la EPOC',
    shortName: 'GOLD',
    description:
      'Clasifica la EPOC por grado de obstrucción y por grupo de síntomas y exacerbaciones (revisión GOLD 2023).',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'fev1',
        type: 'select',
        label: 'FEV₁ posbroncodilatador (% del teórico)',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'GOLD 1 — leve: FEV₁ ≥ 80 %', value: 1 },
          { label: 'GOLD 2 — moderada: FEV₁ 50–79 %', value: 2 },
          { label: 'GOLD 3 — grave: FEV₁ 30–49 %', value: 3 },
          { label: 'GOLD 4 — muy grave: FEV₁ < 30 %', value: 4 },
        ],
      },
      {
        id: 'sintomas',
        type: 'select',
        label: 'Carga sintomática',
        noPoints: true,
        options: [
          { label: 'Pocos síntomas (mMRC 0–1 o CAT < 10)', value: 0 },
          { label: 'Más síntomas (mMRC ≥ 2 o CAT ≥ 10)', value: 1 },
        ],
      },
      {
        id: 'exacerbaciones',
        type: 'select',
        label: 'Exacerbaciones en el último año',
        noPoints: true,
        options: [
          { label: '0 o 1 sin ingreso', value: 0 },
          { label: '≥ 2 moderadas, o ≥ 1 con ingreso hospitalario', value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const grupo = v.exacerbaciones === 1 ? 'E' : v.sintomas === 1 ? 'B' : 'A'
      const tratamiento =
        grupo === 'A'
          ? 'Un broncodilatador (de acción corta o larga según los síntomas).'
          : grupo === 'B'
            ? 'Doble broncodilatación LABA + LAMA.'
            : 'LABA + LAMA; añadir corticoide inhalado si los eosinófilos son ≥ 300/µL (o ≥ 100/µL con exacerbaciones frecuentes).'
      return {
        main: `GOLD ${v.fev1 ?? 1} · Grupo ${grupo}`,
        interpretation: `Obstrucción de grado ${v.fev1 ?? 1} y grupo ${grupo} por síntomas y exacerbaciones. Tratamiento inicial recomendado: ${tratamiento} Añadir siempre deshabituación tabáquica, vacunación, rehabilitación respiratoria y revisión de la técnica inhalatoria.`,
        level: grupo === 'E' ? 'danger' : grupo === 'B' ? 'warn' : 'ok',
      }
    },
    notes: [
      'Desde GOLD 2023 los antiguos grupos C y D se fusionan en el grupo E (exacerbadores), independientemente de la carga sintomática.',
      'El diagnóstico requiere una relación FEV₁/FVC posbroncodilatador < 0,70.',
    ],
    references: [
      'Global Initiative for Chronic Obstructive Lung Disease. Global Strategy for the Diagnosis, Management, and Prevention of COPD, informe 2023.',
    ],
  },
]
