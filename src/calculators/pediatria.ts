import type { Calculator, Option } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Neonatología y pediatría'
const PED = ['Cuidados Críticos Neonatales', 'Pediatría']

const escala = (items: [number, string][]): Option[] =>
  items.map(([value, label]) => ({ label: `${value} — ${label}`, value }))

export const pediatria: Calculator[] = [
  {
    id: 'apgar',
    name: 'Puntuación de Apgar del recién nacido',
    shortName: 'Apgar',
    description:
      'Evalúa la adaptación del recién nacido al minuto 1, 5 (y si procede al 10) de vida.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'aspecto',
        type: 'select',
        label: 'Aspecto (color)',
        dropdown: true,
        options: escala([
          [0, 'Azul o pálido'],
          [1, 'Cuerpo rosado, extremidades azules (acrocianosis)'],
          [2, 'Rosado en todo el cuerpo'],
        ]),
      },
      {
        id: 'pulso',
        type: 'select',
        label: 'Pulso (frecuencia cardíaca)',
        dropdown: true,
        options: escala([
          [0, 'Ausente'],
          [1, '< 100 lpm'],
          [2, '≥ 100 lpm'],
        ]),
      },
      {
        id: 'gesto',
        type: 'select',
        label: 'Gesto (respuesta al estímulo)',
        dropdown: true,
        options: escala([
          [0, 'Sin respuesta'],
          [1, 'Muecas'],
          [2, 'Llora vigorosamente, tose o estornuda'],
        ]),
      },
      {
        id: 'actividad',
        type: 'select',
        label: 'Actividad (tono muscular)',
        dropdown: true,
        options: escala([
          [0, 'Flácido'],
          [1, 'Cierta flexión de extremidades'],
          [2, 'Movimientos activos, buena flexión'],
        ]),
      },
      {
        id: 'respiracion',
        type: 'select',
        label: 'Respiración',
        dropdown: true,
        options: escala([
          [0, 'Ausente'],
          [1, 'Débil, irregular o boqueo'],
          [2, 'Buena, llanto vigoroso'],
        ]),
      },
    ],
    compute: (v) => {
      const score = sum(v, ['aspecto', 'pulso', 'gesto', 'actividad', 'respiracion'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        interpretation:
          score >= 7
            ? 'Adaptación adecuada (7–10). Cuidados habituales.'
            : score >= 4
              ? 'Adaptación moderadamente deprimida (4–6): reevaluar y valorar apoyo respiratorio.'
              : 'Adaptación gravemente deprimida (0–3): iniciar reanimación neonatal.',
        level: score >= 7 ? 'ok' : score >= 4 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Se registra al minuto 1 y a los 5 minutos; si a los 5 minutos es < 7, repetir cada 5 minutos hasta 20 minutos.',
      'La Academia Americana de Pediatría desaconseja usar el Apgar como único criterio para diagnóstico de asfixia perinatal o para decisiones sobre reanimación (que debe iniciarse ya en el minuto 0 según necesidad).',
    ],
    references: [
      'Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-7.',
      'American Academy of Pediatrics; ACOG. The Apgar Score. Pediatrics. 2015;136(4):819-22.',
    ],
  },
  {
    id: 'finnegan',
    name: 'Puntuación de Finnegan modificada para abstinencia neonatal (NAS)',
    shortName: 'Finnegan (NAS)',
    description:
      'Cuantifica la gravedad del síndrome de abstinencia neonatal por opioides y guía el tratamiento farmacológico.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'llanto',
        type: 'select',
        label: 'Llanto',
        dropdown: true,
        options: escala([
          [0, 'Normal'],
          [2, 'Agudo, excesivo'],
          [3, 'Agudo continuo'],
        ]),
      },
      {
        id: 'sueno',
        type: 'select',
        label: 'Sueño tras la toma',
        dropdown: true,
        options: escala([
          [0, 'Duerme > 3 h'],
          [1, 'Duerme < 3 h'],
          [2, 'Duerme < 2 h'],
          [3, 'Duerme < 1 h'],
        ]),
      },
      {
        id: 'moro',
        type: 'select',
        label: 'Reflejo de Moro',
        dropdown: true,
        options: escala([
          [0, 'Normal'],
          [2, 'Hiperactivo'],
          [3, 'Muy hiperactivo'],
        ]),
      },
      {
        id: 'temblor',
        type: 'select',
        label: 'Temblor',
        dropdown: true,
        options: escala([
          [0, 'Ausente'],
          [1, 'Leve al estímulo'],
          [2, 'Moderado-intenso al estímulo'],
          [3, 'Moderado-intenso en reposo'],
          [4, 'Intenso continuo en reposo'],
        ]),
      },
      { id: 'tono', type: 'boolean', label: 'Aumento del tono muscular', points: 2 },
      { id: 'erosiones', type: 'boolean', label: 'Erosiones/excoriaciones cutáneas', points: 1 },
      { id: 'mioclonias', type: 'boolean', label: 'Mioclonías', points: 3 },
      { id: 'convulsiones', type: 'boolean', label: 'Convulsiones generalizadas', points: 5 },
      {
        id: 'sudoracion',
        type: 'boolean',
        label: 'Sudoración',
      },
      {
        id: 'temperatura',
        type: 'select',
        label: 'Temperatura',
        dropdown: true,
        options: escala([
          [0, 'Normal'],
          [1, '37,2–38,3 °C'],
          [2, '> 38,3 °C'],
        ]),
      },
      { id: 'bostezos', type: 'boolean', label: 'Bostezos frecuentes (> 3–4 en el intervalo)' },
      { id: 'aleteo', type: 'boolean', label: 'Aleteo nasal', points: 2 },
      {
        id: 'estornudos',
        type: 'boolean',
        label: 'Estornudos frecuentes (> 3–4 en el intervalo)',
      },
      {
        id: 'respiracion',
        type: 'select',
        label: 'Frecuencia respiratoria',
        dropdown: true,
        options: escala([
          [0, '< 60 rpm'],
          [1, '> 60 rpm'],
          [2, '> 60 rpm con tiraje'],
        ]),
      },
      { id: 'succion', type: 'boolean', label: 'Succión excesiva o desorganizada' },
      { id: 'alimentacion', type: 'boolean', label: 'Toma deficiente (< 15 min o toma escasa)', points: 2 },
      { id: 'regurgitacion', type: 'boolean', label: 'Regurgitación / vómitos en escopetazo', points: 2 },
      {
        id: 'deposiciones',
        type: 'select',
        label: 'Deposiciones',
        dropdown: true,
        options: escala([
          [0, 'Normales'],
          [2, 'Blandas'],
          [3, 'Líquidas o explosivas'],
        ]),
      },
    ],
    compute: (v) => {
      const score = sum(v, [
        'llanto', 'sueno', 'moro', 'temblor', 'tono', 'erosiones', 'mioclonias', 'convulsiones',
        'sudoracion', 'temperatura', 'bostezos', 'aleteo', 'estornudos', 'respiracion',
        'succion', 'alimentacion', 'regurgitacion', 'deposiciones',
      ])
      return {
        main: String(score),
        mainUnit: 'puntos',
        interpretation:
          score < 8
            ? 'Abstinencia leve: continuar cuidados no farmacológicos (contacto piel con piel, lactancia materna, ambiente tranquilo, agrupación de cuidados).'
            : score <= 11
              ? 'Abstinencia moderada: si se repite ≥ 8 en dos evaluaciones consecutivas (o ≥ 12 en una), iniciar tratamiento farmacológico (morfina oral 0,04 mg/kg/dosis cada 3–4 h suele ser el fármaco de primera línea).'
              : 'Abstinencia intensa: tratamiento farmacológico y valoración por neonatología. Ajustar dosis según puntuación cada 3–4 h.',
        level: score < 8 ? 'ok' : score <= 11 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Evaluar cada 3–4 h coincidiendo con las tomas; nunca despertar al niño para valorar.',
      'La AAP recomienda desde 2020 priorizar los cuidados no farmacológicos y usar herramientas más simples como Eat-Sleep-Console cuando sea posible; Finnegan sigue vigente donde no se haya adoptado el nuevo enfoque.',
      'Un umbral de tratamiento farmacológico habitual es puntuación ≥ 8 en dos evaluaciones consecutivas o ≥ 12 en una.',
    ],
    references: [
      'Finnegan LP, et al. Neonatal abstinence syndrome: assessment and management. Addict Dis. 1975;2(1-2):141-58.',
    ],
  },
  {
    id: 'esc',
    name: 'Enfoque «Eat, Sleep, Console» (ESC) para el síndrome de abstinencia neonatal',
    shortName: 'ESC',
    description:
      'Guía funcional para el manejo del síndrome de abstinencia neonatal: alimentación, sueño y consolabilidad.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'comer',
        type: 'select',
        label: 'Alimentación (Eat)',
        options: [
          { label: 'Toma ≥ 1 oz (30 mL) o al pecho ≥ 10 min sin dificultad', value: 0 },
          { label: 'Toma comprometida por síntomas de abstinencia', value: 1 },
        ],
      },
      {
        id: 'dormir',
        type: 'select',
        label: 'Sueño (Sleep)',
        options: [
          { label: 'Duerme ≥ 1 hora seguida sin ser molestado', value: 0 },
          { label: 'Sueño limitado a menos de 1 hora por síntomas', value: 1 },
        ],
      },
      {
        id: 'consolar',
        type: 'select',
        label: 'Consolabilidad (Console)',
        options: [
          { label: 'Se consuela en ≤ 10 minutos con intervención de los cuidadores', value: 0 },
          { label: 'No se consuela en 10 minutos con intervenciones adecuadas', value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const puntos = sum(v, ['comer', 'dormir', 'consolar'])
      return {
        main: puntos === 0 ? 'Manejo no farmacológico' : `${puntos}/3 dominios afectados`,
        interpretation:
          puntos === 0
            ? 'El neonato come, duerme y se consuela adecuadamente: continuar con cuidados no farmacológicos (contacto piel con piel, agrupación de cuidados, lactancia materna, ambiente tranquilo, alojamiento conjunto).'
            : 'Uno o más dominios afectados: optimizar los cuidados no farmacológicos y reevaluar tras 30–60 minutos con intervenciones. Si persiste el fallo, valorar iniciar/aumentar tratamiento farmacológico.',
        level: puntos === 0 ? 'ok' : puntos === 1 ? 'warn' : 'danger',
      }
    },
    notes: [
      'ESC no sustituye a Finnegan: es un enfoque funcional distinto que ha demostrado reducir la duración de la hospitalización y la exposición a opioides en el neonato.',
      'Los padres son coprotagonistas del cuidado: el alojamiento conjunto y su implicación son parte esencial del abordaje.',
    ],
    references: [
      'Grossman MR, et al. An Initiative to Improve the Quality of Care of Infants With Neonatal Abstinence Syndrome. Pediatrics. 2017;139(6):e20163360.',
      'Young LW, et al. Eat, Sleep, Console Approach or Usual Care for Neonatal Opioid Withdrawal. N Engl J Med. 2023;388(25):2326-37.',
    ],
  },
  {
    id: 'bhutani',
    name: 'Nomograma de Bhutani para el riesgo de hiperbilirrubinemia',
    shortName: 'Bhutani',
    description:
      'Clasifica el riesgo de hiperbilirrubinemia significativa en recién nacidos ≥ 35 semanas a partir de la bilirrubina por horas de vida.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'horas', type: 'number', label: 'Edad postnatal', unit: 'horas', min: 12, max: 168, step: 1 },
      { id: 'bilirrubina', type: 'number', label: 'Bilirrubina total sérica', unit: 'mg/dL', min: 0, max: 40, step: 0.1 },
    ],
    compute: (v) => {
      const h = v.horas!
      // Percentiles orientativos del nomograma de Bhutani (mg/dL)
      const p40 =
        h < 24 ? 4 + (h / 24) * 1.5
          : h < 48 ? 5.5 + ((h - 24) / 24) * 2
          : h < 72 ? 7.5 + ((h - 48) / 24) * 1.5
          : h < 96 ? 9 + ((h - 72) / 24) * 0.5
          : 9.5
      const p75 =
        h < 24 ? 5 + (h / 24) * 2
          : h < 48 ? 7 + ((h - 24) / 24) * 2.5
          : h < 72 ? 9.5 + ((h - 48) / 24) * 1.5
          : h < 96 ? 11 + ((h - 72) / 24) * 0.5
          : 11.5
      const p95 =
        h < 24 ? 6 + (h / 24) * 2
          : h < 48 ? 8 + ((h - 24) / 24) * 3
          : h < 72 ? 11 + ((h - 48) / 24) * 2
          : h < 96 ? 13 + ((h - 72) / 24) * 1
          : 14
      const b = v.bilirrubina!
      let zona: string, level: 'ok' | 'info' | 'warn' | 'danger'
      if (b < p40) {
        zona = 'Riesgo bajo (bajo percentil 40)'
        level = 'ok'
      } else if (b < p75) {
        zona = 'Riesgo intermedio-bajo (percentil 40–75)'
        level = 'info'
      } else if (b < p95) {
        zona = 'Riesgo intermedio-alto (percentil 75–95)'
        level = 'warn'
      } else {
        zona = 'Riesgo alto (≥ percentil 95)'
        level = 'danger'
      }
      return {
        main: fmt(b, 1),
        mainUnit: 'mg/dL',
        secondary: zona,
        interpretation:
          level === 'ok'
            ? 'Riesgo bajo de hiperbilirrubinemia significativa: seguimiento clínico habitual.'
            : level === 'info'
              ? 'Riesgo intermedio-bajo: nueva medición en 24–48 h según juicio clínico y factores de riesgo.'
              : level === 'warn'
                ? 'Riesgo intermedio-alto: repetir bilirrubina en 12–24 h y valorar factores de riesgo.'
                : 'Riesgo alto: bilirrubina cercana o superior al percentil 95; comparar con el umbral de fototerapia según horas de vida, edad gestacional y factores de riesgo (guía AAP 2022) y actuar sin demora.',
        level,
        details: [
          `Percentiles aproximados a las ${h} h: P40 ≈ ${fmt(p40, 1)}, P75 ≈ ${fmt(p75, 1)}, P95 ≈ ${fmt(p95, 1)} mg/dL.`,
          'La decisión de fototerapia se toma con el nomograma AAP 2022 según edad gestacional y factores de riesgo, no solo con el percentil de Bhutani.',
        ],
      }
    },
    notes: [
      'Aplicable a recién nacidos de ≥ 35 semanas de edad gestacional, sanos, sin enfermedad hemolítica.',
      'Los percentiles mostrados son una aproximación del nomograma original.',
      'Factores de riesgo adicionales: edad gestacional < 38 semanas, ictericia en las primeras 24 h, incompatibilidad ABO/Rh, hermano con fototerapia, lactancia materna exclusiva mal establecida, cefalohematoma, sexo masculino.',
    ],
    references: [
      'Bhutani VK, et al. Predictive ability of a predischarge hour-specific serum bilirubin for subsequent significant hyperbilirubinemia. Pediatrics. 1999;103(1):6-14.',
      'AAP. Clinical Practice Guideline Revision: Management of Hyperbilirubinemia in the Newborn Infant 35 or More Weeks of Gestation. Pediatrics. 2022;150(3):e2022058859.',
    ],
  },
  {
    id: 'rochester',
    name: 'Criterios de Rochester para lactantes febriles',
    shortName: 'Rochester',
    description:
      'Identifica a los lactantes ≤ 60 días con fiebre que tienen bajo riesgo de infección bacteriana grave.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'aspecto', type: 'boolean', label: 'Aspecto clínico bueno' },
      { id: 'termino', type: 'boolean', label: 'Recién nacido a término, sin complicaciones perinatales' },
      { id: 'antibioticos', type: 'boolean', label: 'Sin antibioterapia perinatal ni actual' },
      { id: 'hospital', type: 'boolean', label: 'Sin hospitalizaciones previas ni enfermedad crónica' },
      { id: 'foco', type: 'boolean', label: 'Sin foco infeccioso al examen físico (piel, tejidos blandos, huesos, oídos)' },
      { id: 'leucos', type: 'boolean', label: 'Leucocitos 5.000–15.000/mm³' },
      { id: 'cayados', type: 'boolean', label: 'Cayados < 1.500/mm³' },
      { id: 'orina', type: 'boolean', label: 'Sedimento urinario < 10 leucocitos/campo o tira de orina negativa' },
      { id: 'heces', type: 'boolean', label: 'Si hay diarrea: < 5 leucocitos/campo en heces' },
    ],
    compute: (v) => {
      const ids = ['aspecto', 'termino', 'antibioticos', 'hospital', 'foco', 'leucos', 'cayados', 'orina', 'heces']
      const cumplidos = sum(v, ids)
      const bajoRiesgo = cumplidos === ids.length
      return {
        main: bajoRiesgo ? 'Bajo riesgo' : 'No cumple criterios',
        secondary: `${cumplidos}/${ids.length}`,
        secondaryLabel: 'criterios positivos',
        interpretation: bajoRiesgo
          ? 'Todos los criterios cumplidos: riesgo bajo de infección bacteriana grave (VPN ≈ 98,9 %). Puede plantearse manejo ambulatorio con seguimiento en 24 h, según protocolo local.'
          : 'No cumple todos los criterios: no puede clasificarse como bajo riesgo; completar estudio de sepsis y valorar ingreso con antibioterapia empírica.',
        level: bajoRiesgo ? 'ok' : 'danger',
      }
    },
    notes: [
      'Aplicable a lactantes ≤ 60 días con temperatura rectal ≥ 38 °C.',
      'Las guías actuales (AAP 2021, Step-by-Step europeo, PECARN 2019) han refinado el abordaje: usar la escala que cada centro tenga protocolizada.',
    ],
    references: [
      'Jaskiewicz JA, et al. Febrile infants at low risk for serious bacterial infection: an appraisal of the Rochester criteria. Pediatrics. 1994;94(3):390-6.',
    ],
  },
  {
    id: 'step-by-step',
    name: 'Enfoque paso a paso (Step-by-step) para lactantes febriles',
    shortName: 'Step-by-step',
    description:
      'Algoritmo europeo secuencial para identificar lactantes ≤ 90 días con fiebre y bajo riesgo de infección bacteriana grave.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'malAspecto', type: 'boolean', label: '¿Mal aspecto clínico?', noPoints: true },
      { id: 'menor21', type: 'boolean', label: '¿Edad ≤ 21 días?', noPoints: true },
      { id: 'orinaAlt', type: 'boolean', label: '¿Tira reactiva de orina alterada?', description: 'Leucocituria o nitritos positivos.', noPoints: true },
      { id: 'pct', type: 'boolean', label: '¿Procalcitonina ≥ 0,5 ng/mL?', noPoints: true },
      { id: 'pcr', type: 'boolean', label: '¿PCR > 20 mg/L?', noPoints: true },
      { id: 'nan', type: 'boolean', label: '¿Neutrófilos absolutos > 10.000/mm³?', noPoints: true },
    ],
    compute: (v) => {
      if (v.malAspecto === 1)
        return {
          main: 'Alto riesgo',
          interpretation: 'Mal aspecto clínico: ingreso, estudio completo (hemocultivo, urocultivo, LCR) y antibioterapia empírica.',
          level: 'danger',
        }
      if (v.menor21 === 1)
        return {
          main: 'Alto riesgo',
          interpretation: 'Edad ≤ 21 días: por edad, se recomienda ingreso, estudio completo (incluida punción lumbar) y antibioterapia empírica independientemente del resto de parámetros.',
          level: 'danger',
        }
      if (v.orinaAlt === 1)
        return {
          main: 'Riesgo intermedio',
          interpretation: 'Tira de orina alterada: probable infección urinaria. Sedimento y urocultivo; ingreso o manejo ambulatorio según protocolo local.',
          level: 'warn',
        }
      if (v.pct === 1)
        return {
          main: 'Alto riesgo',
          interpretation: 'Procalcitonina ≥ 0,5 ng/mL: riesgo elevado de infección bacteriana invasiva; estudio completo, ingreso y antibioterapia empírica.',
          level: 'danger',
        }
      if (v.pcr === 1 || v.nan === 1)
        return {
          main: 'Riesgo intermedio',
          interpretation: 'PCR > 20 mg/L o neutrófilos > 10.000/mm³ con procalcitonina normal: observación hospitalaria durante 24 h; individualizar necesidad de antibioterapia.',
          level: 'warn',
        }
      return {
        main: 'Bajo riesgo',
        interpretation:
          'Bien aspecto, > 21 días, tira de orina normal, procalcitonina < 0,5, PCR ≤ 20 y neutrófilos ≤ 10.000: bajo riesgo de infección bacteriana invasiva (VPN ≈ 99,3 %). Puede considerarse manejo ambulatorio en > 21 días con adecuado seguimiento, según protocolo local.',
        level: 'ok',
      }
    },
    notes: [
      'Aplicable a lactantes ≤ 90 días con fiebre sin foco.',
      'Rendimiento superior a Rochester y Filadelfia para detectar meningitis bacteriana en menores de 90 días.',
    ],
    references: [
      'Gómez B, et al. Validation of the "Step-by-Step" approach in the management of young febrile infants. Pediatrics. 2016;138(2):e20154381.',
    ],
  },
  {
    id: 'pecarn-lactantes',
    name: 'PECARN para lactantes febriles de 8–60 días',
    shortName: 'PECARN 8–60 d',
    description:
      'Regla de decisión para identificar lactantes de 8 a 60 días con fiebre y bajo riesgo de infección bacteriana grave.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'orinaAlt',
        type: 'boolean',
        label: '¿Análisis de orina alterado?',
        description: 'Cualquiera: leucoesterasa positiva, nitritos positivos o > 5 leucocitos por campo.',
        noPoints: true,
      },
      { id: 'nan', type: 'boolean', label: '¿Neutrófilos absolutos > 4.090/mm³?', noPoints: true },
      { id: 'pct', type: 'boolean', label: '¿Procalcitonina > 1,71 ng/mL?', noPoints: true },
    ],
    compute: (v) => {
      const bajo = v.orinaAlt === 0 && v.nan === 0 && v.pct === 0
      return {
        main: bajo ? 'Bajo riesgo' : 'No bajo riesgo',
        interpretation: bajo
          ? 'Los tres marcadores dentro de rango: sensibilidad 97,7 % para infección bacteriana grave y 100 % para infección bacteriana invasiva. Puede considerarse manejo sin punción lumbar y observación (individualizar según edad y protocolo local).'
          : 'Al menos un marcador alterado: no se cumple la regla de bajo riesgo. Ampliar estudio (incluida punción lumbar en < 28 días o si otros signos) e iniciar antibioterapia empírica según protocolo.',
        level: bajo ? 'ok' : 'danger',
      }
    },
    notes: [
      'Aplicable a lactantes de 29 a 60 días con fiebre ≥ 38 °C y buen aspecto. En menores de 28 días se recomienda estudio completo y antibioterapia empírica independientemente de la regla.',
      'La procalcitonina puede no estar disponible en todos los centros; su ausencia limita la aplicabilidad de la regla.',
    ],
    references: [
      'Kuppermann N, et al. A Clinical Prediction Rule to Identify Febrile Infants 60 Days and Younger at Low Risk for Serious Bacterial Infections. JAMA Pediatr. 2019;173(4):342-51.',
    ],
  },
  {
    id: 'sirs-pediatrico',
    name: 'SIRS pediátrico (criterios de Goldstein)',
    shortName: 'SIRS pediátrico',
    description:
      'Criterios del International Pediatric Sepsis Consensus para el síndrome de respuesta inflamatoria sistémica en niños.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'temp',
        type: 'boolean',
        label: 'Temperatura central > 38,5 °C o < 36 °C',
      },
      {
        id: 'leucos',
        type: 'boolean',
        label: 'Leucocitos alterados para la edad o > 10 % de cayados',
      },
      {
        id: 'fc',
        type: 'boolean',
        label: 'Taquicardia (> 2 DE sobre la media para la edad) o bradicardia (< 1 año)',
      },
      {
        id: 'fr',
        type: 'boolean',
        label: 'Taquipnea (> 2 DE sobre la media) o necesidad de ventilación mecánica',
      },
      {
        id: 'infeccion',
        type: 'boolean',
        label: 'Infección confirmada o sospechada',
        noPoints: true,
      },
      {
        id: 'disfuncion',
        type: 'boolean',
        label: 'Disfunción cardiovascular o respiratoria aguda, o ≥ 2 disfunciones orgánicas',
        noPoints: true,
      },
    ],
    compute: (v) => {
      const criteriosSIRS = sum(v, ['temp', 'leucos', 'fc', 'fr'])
      const cumpleSIRS = criteriosSIRS >= 2 && (v.temp === 1 || v.leucos === 1)
      const sepsis = cumpleSIRS && v.infeccion === 1
      const grave = sepsis && v.disfuncion === 1
      return {
        main: grave
          ? 'Sepsis grave o shock séptico'
          : sepsis
            ? 'Sepsis'
            : cumpleSIRS
              ? 'SIRS'
              : 'No cumple SIRS',
        secondary: `${criteriosSIRS}/4 criterios`,
        interpretation: grave
          ? 'Sepsis grave / shock séptico: reanimación con fluidos, antibioterapia precoz (idealmente en la primera hora) y valoración por cuidados intensivos pediátricos.'
          : sepsis
            ? 'Sepsis pediátrica: activar bundle de sepsis (identificación, cultivos, antibioterapia empírica en la primera hora, reanimación con fluidos).'
            : cumpleSIRS
              ? 'SIRS sin infección demostrada: buscar causa (traumatismo, quemados, cirugía, pancreatitis…).'
              : 'No cumple criterios de SIRS: reevaluar la clínica y las tendencias.',
        level: grave ? 'danger' : sepsis ? 'danger' : cumpleSIRS ? 'warn' : 'ok',
        details: [
          'SIRS = ≥ 2 de los 4 criterios, siendo obligatorio uno de ellos temperatura o leucocitos alterados.',
        ],
      }
    },
    notes: [
      'Los umbrales de FC, FR y leucocitos varían por edad; usar los valores de referencia pediátricos del centro.',
      'La consensuada Phoenix Sepsis Score (2024) sustituye progresivamente a los criterios de Goldstein para la definición de sepsis pediátrica.',
    ],
    references: [
      'Goldstein B, et al. International pediatric sepsis consensus conference: Definitions for sepsis and organ dysfunction in pediatrics. Pediatr Crit Care Med. 2005;6(1):2-8.',
    ],
  },
  {
    id: 'phoenix-sepsis',
    name: 'Puntuación de sepsis Phoenix (2024)',
    shortName: 'Phoenix Sepsis',
    description:
      'Definición actualizada de sepsis pediátrica: identifica disfunción orgánica en niños con sospecha de infección.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'respiratorio',
        type: 'select',
        label: 'Respiratorio',
        dropdown: true,
        options: [
          { label: 'PaO₂/FiO₂ ≥ 400 o SpO₂/FiO₂ ≥ 292', value: 0 },
          { label: 'PaO₂/FiO₂ < 400 o SpO₂/FiO₂ < 292 con oxígeno', value: 1 },
          { label: 'PaO₂/FiO₂ 100–200 con soporte respiratorio invasivo, o 148–220 con ventilación no invasiva', value: 2 },
          { label: 'PaO₂/FiO₂ < 100 con soporte respiratorio invasivo, o SpO₂/FiO₂ < 148 con soporte', value: 3 },
        ],
      },
      {
        id: 'cardiovascular',
        type: 'select',
        label: 'Cardiovascular — vasoactivos',
        dropdown: true,
        options: [
          { label: 'Sin vasoactivos', value: 0 },
          { label: '1 vasoactivo', value: 1 },
          { label: '2 o más vasoactivos', value: 2 },
        ],
      },
      {
        id: 'lactato',
        type: 'select',
        label: 'Cardiovascular — lactato',
        dropdown: true,
        options: [
          { label: '< 5 mmol/L', value: 0 },
          { label: '5–10,9 mmol/L', value: 1 },
          { label: '≥ 11 mmol/L', value: 2 },
        ],
      },
      {
        id: 'pam',
        type: 'select',
        label: 'Cardiovascular — PAM por edad',
        dropdown: true,
        options: [
          { label: 'PAM en rango normal para la edad', value: 0 },
          { label: 'PAM entre 1 y 2 DE por debajo de lo normal', value: 1 },
          { label: 'PAM > 2 DE por debajo de lo normal', value: 2 },
        ],
      },
      {
        id: 'coagulacion',
        type: 'select',
        label: 'Coagulación',
        dropdown: true,
        options: [
          { label: 'Sin alteraciones', value: 0 },
          { label: 'Una alteración: plaquetas < 100.000, INR > 1,3, D-dímero > 2 mg/L o fibrinógeno < 100 mg/dL', value: 1 },
          { label: 'Dos o más alteraciones', value: 2 },
        ],
      },
      {
        id: 'neurologico',
        type: 'select',
        label: 'Neurológico',
        dropdown: true,
        options: [
          { label: 'GCS > 10 y pupilas reactivas', value: 0 },
          { label: 'GCS ≤ 10', value: 1 },
          { label: 'Pupilas fijas bilateralmente', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['respiratorio', 'cardiovascular', 'lactato', 'pam', 'coagulacion', 'neurologico'])
      const sepsis = score >= 2
      const shock = (v.cardiovascular ?? 0) + (v.lactato ?? 0) + (v.pam ?? 0) >= 1 && sepsis
      return {
        main: String(score),
        mainUnit: 'puntos',
        secondary: shock ? 'Shock séptico' : sepsis ? 'Sepsis' : 'Sin sepsis',
        interpretation: shock
          ? 'Sepsis pediátrica con disfunción cardiovascular: shock séptico. Reanimación con fluidos, vasoactivos precoces, antibioterapia empírica en la primera hora y traslado a cuidados intensivos.'
          : sepsis
            ? 'Sepsis pediátrica según criterios Phoenix (≥ 2 puntos con sospecha de infección). Activar bundle de sepsis pediátrica.'
            : 'No cumple criterios Phoenix de sepsis: reevaluar y considerar otras causas.',
        level: shock ? 'danger' : sepsis ? 'warn' : 'ok',
      }
    },
    notes: [
      'La sepsis pediátrica se define por sospecha de infección + Phoenix ≥ 2.',
      'El shock séptico requiere además ≥ 1 punto en el dominio cardiovascular.',
      'Los umbrales de PAM por edad y de FR/FC deben tomarse de las tablas de referencia pediátricas.',
    ],
    references: [
      'Schlapbach LJ, et al. International Consensus Criteria for Pediatric Sepsis and Septic Shock. JAMA. 2024;331(8):665-74.',
    ],
  },
  {
    id: 'fluidos-pediatricos',
    name: 'Fluidos de mantenimiento pediátricos (regla 4-2-1)',
    shortName: 'Fluidos pediátricos',
    description: 'Calcula las necesidades diarias de fluidos y el ritmo horario en pacientes pediátricos.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 1, max: 100, step: 0.1 },
    ],
    compute: (v) => {
      const w = v.peso!
      const ritmo = w <= 10 ? 4 * w : w <= 20 ? 40 + 2 * (w - 10) : 60 + (w - 20)
      const dia = ritmo * 24
      return {
        main: fmt(ritmo, 1),
        mainUnit: 'mL/h de mantenimiento',
        secondary: fmt(dia, 0),
        secondaryLabel: 'mL en 24 h',
        interpretation:
          'Ritmo de mantenimiento habitual (regla 4-2-1). Añadir a este cálculo el déficit por deshidratación y las pérdidas continuas si las hay.',
        level: 'info',
        details: [
          '4 mL/kg/h para los primeros 10 kg + 2 mL/kg/h para los kg 11–20 + 1 mL/kg/h para el resto.',
          'Usar suero isotónico (0,9 % NaCl) con glucosa al 5 %: las guías desaconsejan el uso rutinario de hipotónicos por riesgo de hiponatremia hospitalaria.',
        ],
      }
    },
    references: [
      'Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957;19(5):823-32.',
      'Feld LG, et al. Clinical Practice Guideline: Maintenance Intravenous Fluids in Children. Pediatrics. 2018;142(6):e20183083.',
    ],
  },
  {
    id: 'tet-pediatrico',
    name: 'Tamaño del tubo endotraqueal pediátrico',
    shortName: 'TET pediátrico',
    description:
      'Estima el diámetro interno y la profundidad de fijación del tubo endotraqueal según la edad.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 0, max: 18, step: 0.1 },
      {
        id: 'balon',
        type: 'select',
        label: 'Tubo con o sin balón',
        noPoints: true,
        options: [
          { label: 'Sin balón (cuffed = no)', value: 0 },
          { label: 'Con balón (cuffed = sí)', value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const edad = v.edad!
      let diametro: number, profundidad: number
      if (edad < 1) {
        diametro = v.balon === 1 ? 3 : 3.5
        profundidad = edad < 0.08 ? 6 : 7
      } else {
        diametro = v.balon === 1 ? 3.5 + edad / 4 : 4 + edad / 4
        profundidad = 3 * diametro
      }
      return {
        main: fmt(diametro, 1),
        mainUnit: 'mm (diámetro interno)',
        secondary: fmt(profundidad, 1),
        secondaryLabel: 'cm de profundidad en la comisura labial',
        interpretation:
          'Estimación orientativa. Confirmar la posición del tubo con auscultación bilateral, capnografía y radiografía de tórax (punta 1–2 cm sobre la carina).',
        level: 'info',
        details: [
          `Fórmulas: sin balón → diámetro = 4 + edad/4; con balón → diámetro = 3,5 + edad/4.`,
          `Profundidad ≈ 3 × diámetro interno del tubo.`,
          'En neonatos usar el peso al nacer: < 1 kg → TET 2,5; 1–2 kg → 3,0; 2–3 kg → 3,0–3,5; > 3 kg → 3,5.',
          'Preparar también un tubo 0,5 mm más grande y otro más pequeño.',
        ],
      }
    },
    references: [
      'Khine HH, et al. Comparison of cuffed and uncuffed endotracheal tubes in young children during general anesthesia. Anesthesiology. 1997;86(3):627-31.',
    ],
  },
  {
    id: 'rebote-bilirrubina',
    name: 'Riesgo de hiperbilirrubinemia de rebote tras fototerapia',
    shortName: 'Rebote bilirrubina',
    description:
      'Estima el riesgo de que la bilirrubina vuelva a elevarse por encima del umbral de fototerapia tras suspenderla.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad gestacional',
        options: [
          { label: '≥ 38 semanas', value: 0 },
          { label: '< 38 semanas', value: 1 },
        ],
      },
      {
        id: 'inicio',
        type: 'select',
        label: 'Edad al inicio de la fototerapia',
        options: [
          { label: '≥ 72 horas de vida', value: 0 },
          { label: '< 72 horas de vida', value: 1 },
        ],
      },
      {
        id: 'diferencia',
        type: 'number',
        label: 'Diferencia entre umbral de fototerapia y bilirrubina al suspenderla',
        unit: 'mg/dL',
        min: -5,
        max: 15,
        step: 0.1,
      },
    ],
    compute: (v) => {
      const puntos = (v.edad ?? 0) * 3 + (v.inicio ?? 0) * 4 + Math.max(0, 8 - v.diferencia!) * 0.4
      const banda =
        puntos < 3 ? 'bajo (< 5 %)' : puntos < 5 ? 'intermedio (≈ 15 %)' : 'alto (≈ 40 %)'
      return {
        main: fmt(puntos, 1),
        mainUnit: 'puntos orientativos',
        secondary: banda,
        secondaryLabel: 'riesgo de rebote',
        interpretation:
          puntos < 3
            ? 'Bajo riesgo de rebote: control clínico habitual sin necesidad de bilirrubina de control precoz.'
            : puntos < 5
              ? 'Riesgo intermedio: repetir bilirrubina a las 24 h de suspender la fototerapia.'
              : 'Alto riesgo de rebote: mantener fototerapia hasta un margen mayor bajo el umbral, o repetir bilirrubina en 12–24 h tras suspenderla.',
        level: puntos < 3 ? 'ok' : puntos < 5 ? 'warn' : 'danger',
        details: [
          'Estimación orientativa basada en Chang 2017; la decisión final se toma con la clínica y el nomograma AAP 2022 vigente.',
        ],
      }
    },
    notes: [
      'Los factores que más aumentan el riesgo de rebote son: edad gestacional < 38 semanas, inicio de fototerapia < 72 h de vida, y bilirrubina al suspender cercana al umbral.',
    ],
    references: [
      'Chang PW, et al. A Clinical Prediction Rule for Rebound Hyperbilirubinemia Following Inpatient Phototherapy. Pediatrics. 2017;139(3):e20162896.',
    ],
  },
]
