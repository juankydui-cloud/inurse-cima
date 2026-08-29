import type { Calculator } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT_URG = 'Urgencias y decisión clínica'
const CAT_TOX = 'Endocrino y tóxicos'
const URG = ['Emergencias']

export const urgencias: Calculator[] = [
  {
    id: 'alvarado',
    name: 'Puntuación de Alvarado para la apendicitis',
    shortName: 'Alvarado',
    description: 'Estima la probabilidad de apendicitis aguda en pacientes con dolor abdominal.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      { id: 'migracion', type: 'boolean', label: 'Migración del dolor a fosa ilíaca derecha' },
      { id: 'anorexia', type: 'boolean', label: 'Anorexia' },
      { id: 'nauseas', type: 'boolean', label: 'Náuseas o vómitos' },
      { id: 'sensibilidad', type: 'boolean', label: 'Dolor a la palpación en fosa ilíaca derecha', points: 2 },
      { id: 'rebote', type: 'boolean', label: 'Signo de rebote (Blumberg)' },
      { id: 'fiebre', type: 'boolean', label: 'Temperatura > 37,3 °C' },
      { id: 'leucocitosis', type: 'boolean', label: 'Leucocitos > 10.000/mm³', points: 2 },
      { id: 'neutrofilia', type: 'boolean', label: 'Desviación izquierda (>75 % neutrófilos)' },
    ],
    compute: (v) => {
      const score = sum(v, ['migracion', 'anorexia', 'nauseas', 'sensibilidad', 'rebote', 'fiebre', 'leucocitosis', 'neutrofilia'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        interpretation:
          score <= 3
            ? 'Baja probabilidad de apendicitis: valorar alta con reevaluación.'
            : score <= 6
              ? 'Probabilidad intermedia: observación y prueba de imagen (ecografía o TC).'
              : 'Alta probabilidad de apendicitis: valoración quirúrgica.',
        level: score <= 3 ? 'ok' : score <= 6 ? 'warn' : 'danger',
      }
    },
    references: [
      'Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med. 1986;15(5):557-64.',
    ],
  },
  {
    id: 'air',
    name: 'Puntuación AIR (Appendicitis Inflammatory Response)',
    shortName: 'AIR',
    description: 'Alternativa a Alvarado con mayor peso a los reactantes de fase aguda.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      { id: 'vomitos', type: 'boolean', label: 'Vómitos' },
      { id: 'fid', type: 'boolean', label: 'Dolor en fosa ilíaca derecha' },
      { id: 'rebote', type: 'boolean', label: 'Defensa/rebote leve' },
      {
        id: 'reboteM',
        type: 'select',
        label: 'Defensa/rebote — intensidad',
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Leve', value: 1 },
          { label: 'Moderado', value: 2 },
          { label: 'Intenso', value: 3 },
        ],
      },
      {
        id: 'temp',
        type: 'select',
        label: 'Temperatura',
        options: [
          { label: '< 38,5 °C', value: 0 },
          { label: '≥ 38,5 °C', value: 1 },
        ],
      },
      {
        id: 'neutro',
        type: 'select',
        label: 'Polimorfonucleares (%)',
        options: [
          { label: '< 70', value: 0 },
          { label: '70–84', value: 1 },
          { label: '≥ 85', value: 2 },
        ],
      },
      {
        id: 'leucos',
        type: 'select',
        label: 'Leucocitos (×10⁹/L)',
        options: [
          { label: '< 10', value: 0 },
          { label: '10–14,9', value: 1 },
          { label: '≥ 15', value: 2 },
        ],
      },
      {
        id: 'pcr',
        type: 'select',
        label: 'Proteína C reactiva (mg/L)',
        options: [
          { label: '< 10', value: 0 },
          { label: '10–49', value: 1 },
          { label: '≥ 50', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['vomitos', 'fid', 'rebote', 'reboteM', 'temp', 'neutro', 'leucos', 'pcr'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–12)',
        interpretation:
          score <= 4
            ? 'Baja probabilidad: apendicitis poco probable; valorar alta con reevaluación.'
            : score <= 8
              ? 'Probabilidad intermedia: observación e imagen; usar AIR para reducir imágenes innecesarias en adultos y niños.'
              : 'Alta probabilidad: valoración quirúrgica; puede evitarse imagen si la clínica es clara.',
        level: score <= 4 ? 'ok' : score <= 8 ? 'warn' : 'danger',
      }
    },
    references: [
      'Andersson M, Andersson RE. The appendicitis inflammatory response score: a tool for the diagnosis of acute appendicitis. World J Surg. 2008;32(8):1843-9.',
    ],
  },
  {
    id: 'centor-mcisaac',
    name: 'Puntuación Centor / McIsaac para faringitis estreptocócica',
    shortName: 'Centor-McIsaac',
    description:
      'Estima la probabilidad de faringitis por estreptococo del grupo A y guía la decisión de test rápido o antibiótico.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '3–14 años', value: 1 },
          { label: '15–44 años', value: 0 },
          { label: '≥ 45 años', value: -1 },
        ],
      },
      { id: 'exudado', type: 'boolean', label: 'Exudado o hipertrofia amigdalar' },
      { id: 'adenopatia', type: 'boolean', label: 'Adenopatía cervical anterior dolorosa' },
      { id: 'fiebre', type: 'boolean', label: 'Fiebre > 38 °C' },
      { id: 'tos', type: 'boolean', label: 'Ausencia de tos' },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'exudado', 'adenopatia', 'fiebre', 'tos'])
      const prob = score <= 0 ? '1–2 %' : score === 1 ? '5–10 %' : score === 2 ? '11–17 %' : score === 3 ? '28–35 %' : '51–53 %'
      return {
        main: String(score),
        mainUnit: 'puntos',
        secondary: prob,
        secondaryLabel: 'probabilidad de estreptococo',
        interpretation:
          score <= 0
            ? 'Muy baja probabilidad: no test, no antibiótico.'
            : score <= 1
              ? 'Baja: no test ni antibiótico rutinarios.'
              : score <= 3
                ? 'Intermedia: test rápido o cultivo. Tratar solo si resulta positivo.'
                : 'Alta: puede plantearse tratamiento empírico, aunque las guías actuales recomiendan confirmar con test rápido para evitar antibioterapia innecesaria.',
        level: score <= 1 ? 'ok' : score <= 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'McIsaac WJ, et al. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ. 1998;158(1):75-83.',
    ],
  },
  {
    id: 'feverpain',
    name: 'Puntuación FeverPAIN para faringitis',
    shortName: 'FeverPAIN',
    description: 'Alternativa británica a Centor para orientar el uso de antibióticos en la faringitis aguda.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      { id: 'fiebre', type: 'boolean', label: 'Fiebre en las últimas 24 h' },
      { id: 'exudado', type: 'boolean', label: 'Exudado purulento amigdalar' },
      { id: 'rapido', type: 'boolean', label: 'Consulta rápida (≤ 3 días desde el inicio)' },
      { id: 'inflamacion', type: 'boolean', label: 'Amígdalas muy inflamadas' },
      { id: 'noTos', type: 'boolean', label: 'Ausencia de tos y de coriza' },
    ],
    compute: (v) => {
      const score = sum(v, ['fiebre', 'exudado', 'rapido', 'inflamacion', 'noTos'])
      const prob = ['13–18 %', '13–18 %', '30–35 %', '30–35 %', '45–65 %', '62–65 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–5)',
        secondary: prob,
        secondaryLabel: 'probabilidad de estreptococo',
        interpretation:
          score <= 1
            ? 'Baja probabilidad: manejo sintomático.'
            : score <= 3
              ? 'Probabilidad intermedia: valorar «wait and see» (prescripción diferida a las 48 h si no mejora).'
              : 'Alta probabilidad: valorar antibiótico o test rápido.',
        level: score <= 1 ? 'ok' : score <= 3 ? 'warn' : 'danger',
      }
    },
    references: [
      'Little P, et al. Clinical score and rapid antigen detection test to guide antibiotic use for sore throats (PRISM). BMJ. 2013;347:f5806.',
    ],
  },
  {
    id: 'kocher',
    name: 'Criterios de Kocher para artritis séptica de cadera pediátrica',
    shortName: 'Kocher',
    description:
      'Ayuda a diferenciar la artritis séptica de la sinovitis transitoria en niños con cadera dolorosa.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      { id: 'noPeso', type: 'boolean', label: 'No apoya el peso sobre la pierna afectada' },
      { id: 'fiebre', type: 'boolean', label: 'Fiebre > 38,5 °C' },
      { id: 'leucos', type: 'boolean', label: 'Leucocitos > 12.000/mm³' },
      { id: 'esr', type: 'boolean', label: 'VSG > 40 mm/h' },
    ],
    compute: (v) => {
      const score = sum(v, ['noPeso', 'fiebre', 'leucos', 'esr'])
      const prob = ['0,2 %', '3 %', '40 %', '93 %', '99 %'][score]
      return {
        main: String(score),
        mainUnit: 'criterios (0–4)',
        secondary: prob,
        secondaryLabel: 'probabilidad de artritis séptica',
        interpretation:
          score <= 1
            ? 'Baja probabilidad: sugiere sinovitis transitoria; valorar seguimiento.'
            : score <= 2
              ? 'Probabilidad intermedia: valorar artrocentesis diagnóstica.'
              : 'Alta probabilidad de artritis séptica: valoración por traumatología pediátrica, artrocentesis y antibioterapia empírica.',
        level: score <= 1 ? 'ok' : score <= 2 ? 'warn' : 'danger',
      }
    },
    references: [
      'Kocher MS, et al. Differentiating between septic arthritis and transient synovitis of the hip in children: an evidence-based clinical prediction algorithm. J Bone Joint Surg Am. 1999;81(12):1662-70.',
    ],
  },
  {
    id: 'meningitis-bacteriana',
    name: 'Escala de meningitis bacteriana pediátrica (Nigrovic)',
    shortName: 'BMS pediátrica',
    description:
      'Estima el riesgo de meningitis bacteriana en niños con pleocitosis en el líquido cefalorraquídeo.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      { id: 'tincion', type: 'boolean', label: 'Tinción de Gram del LCR positiva' },
      { id: 'convulsion', type: 'boolean', label: 'Convulsión al inicio o antes de la consulta' },
      { id: 'proteinas', type: 'boolean', label: 'Proteínas en LCR ≥ 80 mg/dL' },
      { id: 'neutrofilosLCR', type: 'boolean', label: 'Neutrófilos absolutos en LCR ≥ 1.000/mm³' },
      { id: 'neutrofilosSangre', type: 'boolean', label: 'Neutrófilos absolutos en sangre ≥ 10.000/mm³' },
    ],
    compute: (v) => {
      const score = sum(v, ['tincion', 'convulsion', 'proteinas', 'neutrofilosLCR', 'neutrofilosSangre'])
      return {
        main: String(score),
        mainUnit: 'criterios (0–5)',
        interpretation:
          score === 0
            ? 'Riesgo muy bajo de meningitis bacteriana: en niños de 29 días a 19 años con LCR pleocitario, un puntaje 0 tiene sensibilidad ≈ 100 % y valor predictivo negativo próximo al 100 %. Puede plantearse observación sin antibioterapia empírica.'
            : 'Al menos un criterio positivo: iniciar antibioterapia empírica y considerar ingreso.',
        level: score === 0 ? 'ok' : 'danger',
      }
    },
    notes: [
      'Solo aplicable a niños ≥ 29 días con al menos 10 leucocitos/mm³ en LCR y buen aspecto.',
      'No aplicable si el paciente ha recibido antibióticos previos, tiene inmunodepresión, ha sido sometido a neurocirugía reciente o presenta un shunt del sistema nervioso central.',
    ],
    references: [
      'Nigrovic LE, et al. Clinical prediction rule for identifying children with cerebrospinal fluid pleocytosis at very low risk of bacterial meningitis. JAMA. 2007;297(1):52-60.',
    ],
  },
  {
    id: 'ottawa-tobillo',
    name: 'Reglas de Ottawa para tobillo y pie',
    shortName: 'Ottawa tobillo/pie',
    description:
      'Identifica qué pacientes con lesión aguda de tobillo necesitan radiografía.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      { id: 'malolar', type: 'boolean', label: 'Dolor a la palpación en los últimos 6 cm del maléolo lateral o medial' },
      { id: 'quinto', type: 'boolean', label: 'Dolor a la palpación en la base del 5.º metatarsiano' },
      { id: 'navicular', type: 'boolean', label: 'Dolor a la palpación en el hueso navicular' },
      { id: 'apoyo', type: 'boolean', label: 'Incapacidad para dar 4 pasos (dos con cada pie) al llegar y en urgencias' },
    ],
    compute: (v) => {
      const tobillo = v.malolar === 1 || v.apoyo === 1
      const pie = v.quinto === 1 || v.navicular === 1 || v.apoyo === 1
      const rx = tobillo || pie
      return {
        main: rx ? 'Radiografía indicada' : 'Radiografía no necesaria',
        interpretation: rx
          ? `Indicada radiografía de ${tobillo ? 'tobillo' : ''}${tobillo && pie ? ' y ' : ''}${pie ? 'pie' : ''}.`
          : 'Ningún criterio positivo: puede omitirse la radiografía con seguridad razonable (sensibilidad ≈ 100 % para fractura clínicamente significativa).',
        level: rx ? 'warn' : 'ok',
      }
    },
    references: [
      'Stiell IG, et al. Implementation of the Ottawa ankle rules. JAMA. 1994;271(11):827-32.',
    ],
  },
  {
    id: 'ottawa-rodilla',
    name: 'Regla de Ottawa para rodilla',
    shortName: 'Ottawa rodilla',
    description:
      'Identifica qué pacientes con traumatismo agudo de rodilla necesitan radiografía.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 55 años' },
      { id: 'peronea', type: 'boolean', label: 'Dolor a la palpación en la cabeza del peroné' },
      { id: 'rotula', type: 'boolean', label: 'Dolor aislado a la palpación de la rótula' },
      { id: 'flexion', type: 'boolean', label: 'Incapacidad para flexionar 90°' },
      { id: 'apoyo', type: 'boolean', label: 'Incapacidad para caminar 4 pasos inmediatamente y en urgencias' },
    ],
    compute: (v) => {
      const rx = sum(v, ['edad', 'peronea', 'rotula', 'flexion', 'apoyo']) >= 1
      return {
        main: rx ? 'Radiografía indicada' : 'Radiografía no necesaria',
        interpretation: rx
          ? 'Al menos un criterio positivo: indicada radiografía de rodilla.'
          : 'Ningún criterio positivo: puede omitirse la radiografía (sensibilidad ≈ 98–100 %).',
        level: rx ? 'warn' : 'ok',
      }
    },
    references: [
      'Stiell IG, et al. Prospective validation of a decision rule for the use of radiography in acute knee injuries. JAMA. 1996;275(8):611-5.',
    ],
  },
  {
    id: 'ccr',
    name: 'Regla canadiense de la columna cervical (CCR)',
    shortName: 'CCR',
    description: 'Regla de decisión para indicar imagen cervical en pacientes traumatizados alerta y estables.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      {
        id: 'altoRiesgo',
        type: 'boolean',
        label: 'Factor de alto riesgo',
        description: '≥ 65 años, mecanismo peligroso (caída ≥ 1 m/5 escalones, carga axial, colisión de alta energía, vuelco, atropello, deportes con impacto), o parestesias en extremidades.',
        noPoints: true,
      },
      {
        id: 'bajoRiesgo',
        type: 'boolean',
        label: '¿Cumple algún factor de bajo riesgo que permita valorar la movilidad?',
        description: 'Colisión posterior simple, sedestación en urgencias, deambulación en cualquier momento, dolor cervical de inicio diferido o ausencia de dolor a la palpación línea media.',
        noPoints: true,
      },
      {
        id: 'rotacion',
        type: 'boolean',
        label: '¿Puede rotar activamente el cuello 45° a cada lado?',
        noPoints: true,
      },
    ],
    compute: (v) => {
      if (v.altoRiesgo === 1)
        return {
          main: 'Imagen indicada',
          interpretation: 'Factor de alto riesgo presente: imagen cervical (TC preferente).',
          level: 'danger',
        }
      if (v.bajoRiesgo !== 1)
        return {
          main: 'Imagen indicada',
          interpretation: 'Sin factor de bajo riesgo que permita valorar la movilidad: imagen cervical.',
          level: 'danger',
        }
      if (v.rotacion !== 1)
        return {
          main: 'Imagen indicada',
          interpretation: 'No puede rotar activamente 45° a cada lado: imagen cervical.',
          level: 'danger',
        }
      return {
        main: 'Imagen no necesaria',
        interpretation:
          'Sin factores de alto riesgo, con al menos un factor de bajo riesgo y rotación cervical 45° a cada lado: puede retirarse la inmovilización cervical con seguridad (sensibilidad ≈ 100 %).',
        level: 'ok',
      }
    },
    notes: ['Aplicable a pacientes ≥ 16 años, alerta (GCS 15), estables y no intoxicados, con traumatismo cervical cerrado en las últimas 48 h.'],
    references: [
      'Stiell IG, et al. The Canadian C-Spine Rule for radiography in alert and stable trauma patients. JAMA. 2001;286(15):1841-8.',
    ],
  },
  {
    id: 'cchr',
    name: 'Canadian CT Head Rule (CCHR)',
    shortName: 'CCHR',
    description: 'Regla para indicar tomografía craneal en el traumatismo craneoencefálico leve.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      { id: 'gcs2h', type: 'boolean', label: 'GCS < 15 a las 2 h del traumatismo', noPoints: true },
      { id: 'fracturaAbierta', type: 'boolean', label: 'Sospecha de fractura craneal abierta o deprimida', noPoints: true },
      { id: 'baseCraneo', type: 'boolean', label: 'Signos de fractura de base de cráneo (hemotímpano, ojos de mapache, otorrea/rinorrea de LCR, signo de Battle)', noPoints: true },
      { id: 'vomitos', type: 'boolean', label: '≥ 2 episodios de vómitos', noPoints: true },
      { id: 'edad65', type: 'boolean', label: 'Edad ≥ 65 años', noPoints: true },
      { id: 'amnesia', type: 'boolean', label: 'Amnesia retrógrada > 30 min', noPoints: true },
      { id: 'peligroso', type: 'boolean', label: 'Mecanismo peligroso (peatón atropellado, salir despedido de un vehículo, caída > 1 m / 5 escalones)', noPoints: true },
    ],
    compute: (v) => {
      const alto = v.gcs2h === 1 || v.fracturaAbierta === 1 || v.baseCraneo === 1 || v.vomitos === 1 || v.edad65 === 1
      const medio = !alto && (v.amnesia === 1 || v.peligroso === 1)
      return {
        main: alto ? 'TC obligada' : medio ? 'TC recomendada' : 'TC no necesaria',
        interpretation: alto
          ? 'Al menos un factor de alto riesgo: tomografía craneal obligada.'
          : medio
            ? 'Factor de riesgo medio: tomografía craneal recomendada para descartar lesión clínicamente significativa.'
            : 'Ningún factor: puede evitarse la tomografía (regla con sensibilidad ≈ 100 % para lesión que requiera intervención neuroquirúrgica).',
        level: alto ? 'danger' : medio ? 'warn' : 'ok',
      }
    },
    notes: ['Aplicable a traumatismo craneoencefálico cerrado con GCS 13–15 y pérdida de conciencia testificada, amnesia o desorientación tras el traumatismo.'],
    references: [
      'Stiell IG, et al. The Canadian CT Head Rule for patients with minor head injury. Lancet. 2001;357(9266):1391-6.',
    ],
  },
  {
    id: 'rosier',
    name: 'Escala ROSIER (Recognition of Stroke in the Emergency Room)',
    shortName: 'ROSIER',
    description: 'Reconocimiento del ictus agudo en urgencias.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      { id: 'sincope', type: 'boolean', label: 'Pérdida de conciencia o síncope', points: -1 },
      { id: 'convulsion', type: 'boolean', label: 'Actividad convulsiva', points: -1 },
      { id: 'facial', type: 'boolean', label: 'Debilidad facial de nueva aparición' },
      { id: 'brazo', type: 'boolean', label: 'Debilidad asimétrica del brazo de nueva aparición' },
      { id: 'pierna', type: 'boolean', label: 'Debilidad asimétrica de la pierna de nueva aparición' },
      { id: 'habla', type: 'boolean', label: 'Alteración del habla de nueva aparición' },
      { id: 'visual', type: 'boolean', label: 'Defecto de campo visual de nueva aparición' },
    ],
    compute: (v) => {
      const score = sum(v, ['sincope', 'convulsion', 'facial', 'brazo', 'pierna', 'habla', 'visual'])
      return {
        main: String(score),
        mainUnit: 'puntos (−2 a +5)',
        interpretation:
          score > 0
            ? 'ROSIER > 0: alta probabilidad de ictus. Activar código ictus y traslado a centro adecuado.'
            : 'ROSIER ≤ 0: ictus poco probable. Considerar diagnósticos alternativos (hipoglucemia, migraña, síncope, convulsión, mareo periférico).',
        level: score > 0 ? 'danger' : 'ok',
      }
    },
    notes: ['Descartar previamente hipoglucemia (glucemia capilar).'],
    references: [
      'Nor AM, et al. The Recognition of Stroke in the Emergency Room (ROSIER) scale. Lancet Neurol. 2005;4(11):727-34.',
    ],
  },
  {
    id: 'rems',
    name: 'Puntuación REMS (Rapid Emergency Medicine Score)',
    shortName: 'REMS',
    description: 'Predice la mortalidad intrahospitalaria en pacientes que acuden a urgencias.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        dropdown: true,
        options: [
          { label: '< 45 años', value: 0 },
          { label: '45–54', value: 2 },
          { label: '55–64', value: 3 },
          { label: '65–74', value: 5 },
          { label: '≥ 75', value: 6 },
        ],
      },
      {
        id: 'pam',
        type: 'select',
        label: 'Presión arterial media (mmHg)',
        dropdown: true,
        options: [
          { label: '70–109', value: 0 },
          { label: '50–69 o 110–129', value: 2 },
          { label: '≥ 160', value: 3 },
          { label: '130–159', value: 3.0001 },
          { label: '< 50', value: 4 },
        ],
      },
      {
        id: 'fc',
        type: 'select',
        label: 'Frecuencia cardíaca',
        dropdown: true,
        options: [
          { label: '70–109 lpm', value: 0 },
          { label: '110–139 o 55–69', value: 2 },
          { label: '140–179 o 40–54', value: 3 },
          { label: '≥ 180 o ≤ 39', value: 4 },
        ],
      },
      {
        id: 'fr',
        type: 'select',
        label: 'Frecuencia respiratoria',
        dropdown: true,
        options: [
          { label: '12–24 rpm', value: 0 },
          { label: '10–11 o 25–34', value: 1 },
          { label: '6–9', value: 2 },
          { label: '35–49', value: 3 },
          { label: '≥ 50 o ≤ 5', value: 4 },
        ],
      },
      {
        id: 'spo2',
        type: 'select',
        label: 'SpO₂',
        dropdown: true,
        options: [
          { label: '> 89 %', value: 0 },
          { label: '86–89 %', value: 1 },
          { label: '75–85 %', value: 3 },
          { label: '< 75 %', value: 4 },
        ],
      },
      {
        id: 'gcs',
        type: 'select',
        label: 'Escala de coma de Glasgow',
        dropdown: true,
        options: [
          { label: '> 13', value: 0 },
          { label: '11–13', value: 1 },
          { label: '8–10', value: 2 },
          { label: '5–7', value: 3 },
          { label: '< 5', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const score = Math.round(sum(v, ['edad', 'pam', 'fc', 'fr', 'spo2', 'gcs']))
      const mort = score <= 2 ? '0,3 %' : score <= 5 ? '2 %' : score <= 9 ? '9 %' : score <= 11 ? '17 %' : score <= 15 ? '38 %' : '75 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–26)',
        secondary: mort,
        secondaryLabel: 'mortalidad intrahospitalaria',
        interpretation:
          score <= 5
            ? 'Riesgo bajo de mortalidad.'
            : score <= 11
              ? 'Riesgo intermedio: vigilancia estrecha.'
              : 'Riesgo alto: ingreso en cuidados intermedios o intensivos.',
        level: score <= 5 ? 'ok' : score <= 11 ? 'warn' : 'danger',
      }
    },
    references: [
      'Olsson T, et al. Rapid Emergency Medicine Score: a new prognostic tool for in-hospital mortality in nonsurgical emergency department patients. J Intern Med. 2004;255(5):579-87.',
    ],
  },
  {
    id: 'cows',
    name: 'Escala COWS (Clinical Opiate Withdrawal Scale)',
    shortName: 'COWS',
    description: 'Cuantifica la gravedad del síndrome de abstinencia de opioides.',
    category: 'Alcohol y abstinencia',
    specialty: URG,
    inputs: [
      { id: 'fc', type: 'select', label: 'Frecuencia cardíaca (lpm)', options: [
        { label: '≤ 80', value: 0 }, { label: '81–100', value: 1 }, { label: '101–120', value: 2 }, { label: '> 120', value: 4 },
      ]},
      { id: 'sudoracion', type: 'select', label: 'Sudoración', options: [
        { label: 'Ausente', value: 0 }, { label: 'Escalofríos o rubor', value: 1 }, { label: 'Sudor visible en cara', value: 2 }, { label: 'Sudor corriendo por la cara', value: 3 }, { label: 'Sudor empapando la ropa', value: 4 },
      ]},
      { id: 'inquietud', type: 'select', label: 'Inquietud', options: [
        { label: 'Puede estarse quieto', value: 0 }, { label: 'Movimientos ocasionales', value: 1 }, { label: 'Cambia de postura frecuentemente', value: 3 }, { label: 'Incapaz de estarse quieto', value: 5 },
      ]},
      { id: 'pupilas', type: 'select', label: 'Pupilas', options: [
        { label: 'Normales o mióticas', value: 0 }, { label: 'Posiblemente mayores de lo normal', value: 1 }, { label: 'Moderadamente dilatadas', value: 2 }, { label: 'Muy dilatadas', value: 5 },
      ]},
      { id: 'huesos', type: 'select', label: 'Dolor óseo o articular', options: [
        { label: 'Ausente', value: 0 }, { label: 'Molestia leve', value: 1 }, { label: 'Dolor difuso', value: 2 }, { label: 'Frota articulaciones, no soporta el dolor', value: 4 },
      ]},
      { id: 'rinorrea', type: 'select', label: 'Rinorrea o lagrimeo', options: [
        { label: 'Ausente', value: 0 }, { label: 'Congestión nasal o lagrimeo leve', value: 1 }, { label: 'Rinorrea o lagrimeo', value: 2 }, { label: 'Rinorrea y lagrimeo continuos', value: 4 },
      ]},
      { id: 'gi', type: 'select', label: 'Molestias gastrointestinales', options: [
        { label: 'Sin síntomas', value: 0 }, { label: 'Retortijones', value: 1 }, { label: 'Náuseas o heces blandas', value: 2 }, { label: 'Vómitos o diarrea', value: 3 }, { label: 'Vómitos y diarrea múltiples', value: 5 },
      ]},
      { id: 'temblor', type: 'select', label: 'Temblor (manos extendidas)', options: [
        { label: 'Sin temblor', value: 0 }, { label: 'Palpable, no visible', value: 1 }, { label: 'Fasciculaciones leves visibles', value: 2 }, { label: 'Temblor grueso extenso', value: 4 },
      ]},
      { id: 'bostezos', type: 'select', label: 'Bostezos', options: [
        { label: 'Ausentes', value: 0 }, { label: '1–2 veces durante la evaluación', value: 1 }, { label: '≥ 3 veces', value: 2 }, { label: '≥ 3 veces por minuto', value: 4 },
      ]},
      { id: 'ansiedad', type: 'select', label: 'Ansiedad o irritabilidad', options: [
        { label: 'Ausente', value: 0 }, { label: 'Levemente ansioso', value: 1 }, { label: 'Moderadamente ansioso', value: 2 }, { label: 'Tan ansioso que dificulta la evaluación', value: 4 },
      ]},
      { id: 'piloereccion', type: 'select', label: 'Piloerección', options: [
        { label: 'Piel lisa', value: 0 }, { label: 'Cutis anserina en brazos', value: 3 }, { label: 'Piloerección evidente', value: 5 },
      ]},
    ],
    compute: (v) => {
      const score = sum(v, ['fc', 'sudoracion', 'inquietud', 'pupilas', 'huesos', 'rinorrea', 'gi', 'temblor', 'bostezos', 'ansiedad', 'piloereccion'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–48)',
        interpretation:
          score < 5
            ? 'Sin abstinencia significativa.'
            : score < 13
              ? 'Abstinencia leve (5–12): valorar iniciar tratamiento con buprenorfina si procede.'
              : score < 25
                ? 'Abstinencia moderada (13–24): apto para iniciar buprenorfina.'
                : score < 37
                  ? 'Abstinencia moderadamente intensa (25–36): tratamiento activo.'
                  : 'Abstinencia intensa (≥ 37): tratamiento activo y vigilancia estrecha.',
        level: score < 5 ? 'ok' : score < 13 ? 'info' : score < 25 ? 'warn' : 'danger',
      }
    },
    notes: ['Un COWS ≥ 8 indica abstinencia objetiva mínima suficiente para iniciar la inducción con buprenorfina de forma segura.'],
    references: [
      'Wesson DR, Ling W. The Clinical Opiate Withdrawal Scale (COWS). J Psychoactive Drugs. 2003;35(2):253-9.',
    ],
  },
  {
    id: 'mcmahon',
    name: 'Puntuación de McMahon para la rabdomiólisis',
    shortName: 'McMahon',
    description: 'Predice la mortalidad o la necesidad de terapia renal sustitutiva en la rabdomiólisis.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 51 años', value: 0 },
          { label: '51–70 años', value: 1.5 },
          { label: '71–80 años', value: 2.5 },
          { label: '> 80 años', value: 3 },
        ],
      },
      {
        id: 'sexo',
        type: 'select',
        label: 'Sexo',
        options: [
          { label: 'Varón', value: 0 },
          { label: 'Mujer', value: 1 },
        ],
      },
      {
        id: 'etiologia',
        type: 'boolean',
        label: 'Etiología distinta de convulsión, síncope, ejercicio, estatinas o mioaflibrada',
        points: 3,
      },
      { id: 'creatinina', type: 'boolean', label: 'Creatinina > 1,4 mg/dL', points: 1.5 },
      { id: 'calcio', type: 'boolean', label: 'Calcio inicial < 7,5 mg/dL', points: 2 },
      { id: 'ck', type: 'boolean', label: 'CK inicial > 40.000 U/L', points: 2 },
      { id: 'fosfato', type: 'boolean', label: 'Fósforo inicial > 4,0 mg/dL', points: 1.5 },
      { id: 'bicarbonato', type: 'boolean', label: 'Bicarbonato < 19 mmol/L', points: 2 },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'sexo', 'etiologia', 'creatinina', 'calcio', 'ck', 'fosfato', 'bicarbonato'])
      return {
        main: fmt(score, 1),
        mainUnit: 'puntos',
        interpretation:
          score < 5
            ? 'Riesgo bajo (probabilidad de diálisis o muerte ≈ 3 %): puede manejarse fuera de cuidados intensivos con hidratación y vigilancia.'
            : score <= 10
              ? 'Riesgo intermedio (≈ 20 %): vigilancia estrecha y valoración por nefrología.'
              : 'Riesgo alto (> 50 %): considerar ingreso en cuidados intermedios o intensivos y preparación para terapia renal sustitutiva.',
        level: score < 5 ? 'ok' : score <= 10 ? 'warn' : 'danger',
      }
    },
    references: [
      'McMahon GM, et al. A risk prediction score for kidney failure or mortality in rhabdomyolysis. JAMA Intern Med. 2013;173(19):1821-8.',
    ],
  },
  {
    id: 'bishop',
    name: 'Puntuación de Bishop para la maduración cervical',
    shortName: 'Bishop',
    description: 'Estima la favorabilidad del cuello uterino para la inducción del parto.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      {
        id: 'dilatacion',
        type: 'select',
        label: 'Dilatación',
        options: [
          { label: '0 cm', value: 0 },
          { label: '1–2 cm', value: 1 },
          { label: '3–4 cm', value: 2 },
          { label: '≥ 5 cm', value: 3 },
        ],
      },
      {
        id: 'borramiento',
        type: 'select',
        label: 'Borramiento',
        options: [
          { label: '0–30 %', value: 0 },
          { label: '40–50 %', value: 1 },
          { label: '60–70 %', value: 2 },
          { label: '≥ 80 %', value: 3 },
        ],
      },
      {
        id: 'estacion',
        type: 'select',
        label: 'Estación (planos de Hodge)',
        options: [
          { label: '−3', value: 0 },
          { label: '−2', value: 1 },
          { label: '−1 / 0', value: 2 },
          { label: '+1 / +2', value: 3 },
        ],
      },
      {
        id: 'consistencia',
        type: 'select',
        label: 'Consistencia',
        options: [
          { label: 'Firme', value: 0 },
          { label: 'Intermedia', value: 1 },
          { label: 'Blanda', value: 2 },
        ],
      },
      {
        id: 'posicion',
        type: 'select',
        label: 'Posición del cuello',
        options: [
          { label: 'Posterior', value: 0 },
          { label: 'Intermedia', value: 1 },
          { label: 'Anterior', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['dilatacion', 'borramiento', 'estacion', 'consistencia', 'posicion'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–13)',
        interpretation:
          score <= 5
            ? 'Cuello desfavorable: la inducción probablemente requerirá maduración cervical previa (prostaglandinas o balón).'
            : score <= 8
              ? 'Favorabilidad intermedia: valorar inducción con oxitocina y amniotomía según protocolo.'
              : 'Cuello favorable (≥ 9): la inducción con oxitocina tiene alta probabilidad de éxito.',
        level: score <= 5 ? 'warn' : score <= 8 ? 'info' : 'ok',
      }
    },
    references: [
      'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964;24:266-8.',
    ],
  },
  {
    id: 'homa-ir',
    name: 'HOMA-IR (resistencia a la insulina)',
    shortName: 'HOMA-IR',
    description: 'Estima la resistencia a la insulina en ayunas.',
    category: CAT_TOX,
    specialty: URG,
    inputs: [
      { id: 'glucemia', type: 'number', label: 'Glucemia en ayunas', unit: 'mg/dL', min: 30, max: 500, step: 1 },
      { id: 'insulina', type: 'number', label: 'Insulina en ayunas', unit: 'µU/mL', min: 0, max: 500, step: 0.1 },
    ],
    compute: (v) => {
      const glucoseMmol = v.glucemia! / 18
      const homa = (v.insulina! * glucoseMmol) / 22.5
      return {
        main: fmt(homa, 2),
        mainUnit: 'HOMA-IR',
        interpretation:
          homa < 2.5
            ? 'HOMA-IR < 2,5: sensibilidad a la insulina en rango habitual.'
            : homa < 3.8
              ? 'Resistencia leve-moderada: valorar estilo de vida y factores de riesgo cardiometabólico.'
              : 'Resistencia significativa: alto riesgo de diabetes tipo 2 y síndrome metabólico. Intervención sobre estilo de vida y valoración de tratamiento.',
        level: homa < 2.5 ? 'ok' : homa < 3.8 ? 'warn' : 'danger',
        details: ['Fórmula: HOMA-IR = insulina × glucosa (mmol/L) / 22,5.'],
      }
    },
    notes: ['Los puntos de corte varían por población; usar los del laboratorio de referencia.'],
    references: [
      'Matthews DR, et al. Homeostasis model assessment: insulin resistance and beta-cell function from fasting plasma glucose and insulin concentrations in man. Diabetologia. 1985;28(7):412-9.',
    ],
  },
  {
    id: 'hba1c-glucosa',
    name: 'Glucosa promedio estimada a partir de la HbA1c',
    shortName: 'eAG',
    description: 'Convierte la hemoglobina glucosilada en glucemia media estimada.',
    category: CAT_TOX,
    specialty: URG,
    inputs: [
      { id: 'hba1c', type: 'number', label: 'HbA1c', unit: '%', min: 4, max: 20, step: 0.1 },
    ],
    compute: (v) => {
      const eag = 28.7 * v.hba1c! - 46.7
      return {
        main: fmt(eag, 0),
        mainUnit: 'mg/dL (glucosa media estimada)',
        interpretation:
          v.hba1c! < 5.7
            ? 'HbA1c normal (< 5,7 %).'
            : v.hba1c! < 6.5
              ? 'Prediabetes (5,7–6,4 %): recomendar cambios de estilo de vida.'
              : 'Rango de diabetes (≥ 6,5 %): valorar objetivos individualizados de control (habitualmente HbA1c < 7 %, más estricto o menos según el paciente).',
        level: v.hba1c! < 5.7 ? 'ok' : v.hba1c! < 6.5 ? 'warn' : 'danger',
        details: ['Fórmula: eAG (mg/dL) = 28,7 × HbA1c − 46,7 (Nathan 2008).'],
      }
    },
    references: [
      'Nathan DM, et al. Translating the A1C assay into estimated average glucose values. Diabetes Care. 2008;31(8):1473-8.',
    ],
  },
  {
    id: 'forrest',
    name: 'Clasificación de Forrest para la hemorragia digestiva alta',
    shortName: 'Forrest',
    description:
      'Estratifica el riesgo de resangrado y mortalidad en la úlcera péptica sangrante según los hallazgos endoscópicos.',
    category: CAT_URG,
    specialty: URG,
    inputs: [
      {
        id: 'grado',
        type: 'select',
        label: 'Hallazgo endoscópico',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Ia — Sangrado arterial pulsátil', value: 1 },
          { label: 'Ib — Sangrado en sábana (venoso)', value: 2 },
          { label: 'IIa — Vaso visible no sangrante', value: 3 },
          { label: 'IIb — Coágulo adherido', value: 4 },
          { label: 'IIc — Mancha plana pigmentada (hematina)', value: 5 },
          { label: 'III — Base limpia sin estigmas', value: 6 },
        ],
      },
    ],
    compute: (v) => {
      const g = v.grado ?? 6
      const info = [
        '',
        { r: '55 %', m: '11 %', a: 'Alto riesgo — tratamiento endoscópico obligado', level: 'danger' as const },
        { r: '55 %', m: '11 %', a: 'Alto riesgo — tratamiento endoscópico obligado', level: 'danger' as const },
        { r: '43 %', m: '11 %', a: 'Alto riesgo — tratamiento endoscópico', level: 'danger' as const },
        { r: '22 %', m: '7 %', a: 'Riesgo intermedio — tratamiento endoscópico', level: 'warn' as const },
        { r: '10 %', m: '3 %', a: 'Riesgo bajo — no requiere terapia endoscópica', level: 'ok' as const },
        { r: '5 %', m: '2 %', a: 'Riesgo muy bajo — alta precoz posible', level: 'ok' as const },
      ][g] as { r: string; m: string; a: string; level: 'ok' | 'warn' | 'danger' }
      const labels = ['', 'Ia', 'Ib', 'IIa', 'IIb', 'IIc', 'III']
      return {
        main: `Forrest ${labels[g]}`,
        secondary: info.r,
        secondaryLabel: 'riesgo de resangrado',
        interpretation: `${info.a}. Mortalidad ≈ ${info.m}. En Forrest I y IIa se recomienda tratamiento endoscópico (inyección + método térmico o clip) e IBP intravenoso en perfusión.`,
        level: info.level,
      }
    },
    references: [
      'Forrest JA, et al. Endoscopy in gastrointestinal bleeding. Lancet. 1974;2(7877):394-7.',
    ],
  },
]
