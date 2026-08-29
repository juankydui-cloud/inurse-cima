import type { Calculator } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Fórmulas y cálculos clínicos'
const CARD = ['Cardiología']

export const formulas: Calculator[] = [
  {
    id: 'qtc',
    name: 'Intervalo QT corregido (QTc)',
    shortName: 'QTc',
    description:
      'Corrige el intervalo QT según la frecuencia cardíaca (fórmulas de Bazett, Fridericia, Framingham, Hodges y Rautaharju).',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'qt', type: 'number', label: 'Intervalo QT medido', unit: 'ms', min: 100, max: 900 },
      { id: 'fc', type: 'number', label: 'Frecuencia cardíaca', unit: 'lpm', min: 20, max: 250 },
      {
        id: 'formula',
        type: 'select',
        label: 'Fórmula de corrección',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Bazett — QT / √RR (la más usada)', value: 0 },
          { label: 'Fridericia — QT / RR^(1/3)', value: 1 },
          { label: 'Framingham — QT + 154 × (1 − RR)', value: 2 },
          { label: 'Hodges — QT + 1,75 × (FC − 60)', value: 3 },
          { label: 'Rautaharju — QT × (120 + FC) / 180', value: 4 },
        ],
      },
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
    ],
    compute: (v) => {
      const rr = 60 / v.fc!
      const qt = v.qt!
      const f = v.formula ?? 0
      const qtc = [
        qt / Math.sqrt(rr),
        qt / Math.cbrt(rr),
        qt + 154 * (1 - rr),
        qt + 1.75 * (v.fc! - 60),
        (qt * (120 + v.fc!)) / 180,
      ][f]
      const nombre = ['Bazett', 'Fridericia', 'Framingham', 'Hodges', 'Rautaharju'][f]
      const mujer = v.sexo === 1
      const limite = mujer ? 460 : 450
      const prolongado = qtc > limite
      const muyProlongado = qtc >= 500
      return {
        main: fmt(qtc, 0),
        mainUnit: `ms (${nombre})`,
        secondary: fmt(rr, 2),
        secondaryLabel: 'intervalo RR (s)',
        interpretation: muyProlongado
          ? 'QTc ≥ 500 ms: riesgo elevado de torsade de pointes. Revisar fármacos que prolongan el QT, corregir potasio y magnesio y monitorizar.'
          : prolongado
            ? `QTc prolongado para el límite habitual (${limite} ms en ${mujer ? 'mujeres' : 'varones'}): revisar fármacos y electrolitos.`
            : 'QTc dentro del rango normal.',
        level: muyProlongado ? 'danger' : prolongado ? 'warn' : 'ok',
        details: [
          'Bazett sobrecorrige con taquicardia e infracorrige con bradicardia; con frecuencias extremas se prefieren Fridericia o Framingham.',
        ],
      }
    },
    notes: ['Límites habituales de normalidad: ≤ 450 ms en varones y ≤ 460 ms en mujeres; ≥ 500 ms se considera de alto riesgo.'],
  },
  {
    id: 'tisdale',
    name: 'Puntuación de riesgo de Tisdale para la prolongación del QT',
    shortName: 'Tisdale',
    description:
      'Predice el riesgo de prolongación del QTc por encima de 500 ms en pacientes hospitalizados.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 68 años' },
      { id: 'mujer', type: 'boolean', label: 'Sexo femenino' },
      { id: 'asa', type: 'boolean', label: 'Tratamiento con diuréticos de asa' },
      { id: 'potasio', type: 'boolean', label: 'Potasio sérico ≤ 3,5 mEq/L' },
      { id: 'qtcIngreso', type: 'boolean', label: 'QTc al ingreso ≥ 450 ms', points: 2 },
      { id: 'iamAgudo', type: 'boolean', label: 'Infarto agudo de miocardio', points: 2 },
      { id: 'unQt', type: 'boolean', label: 'Un fármaco que prolonga el QT', points: 3 },
      { id: 'dosQt', type: 'boolean', label: '≥ 2 fármacos que prolongan el QT', points: 3 },
      { id: 'sepsis', type: 'boolean', label: 'Sepsis', points: 3 },
      { id: 'icc', type: 'boolean', label: 'Insuficiencia cardíaca', points: 3 },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'mujer', 'asa', 'potasio', 'qtcIngreso', 'iamAgudo', 'unQt', 'dosQt', 'sepsis', 'icc'])
      const banda = score <= 6 ? 'bajo' : score <= 10 ? 'moderado' : 'alto'
      return {
        main: String(score),
        mainUnit: 'puntos (0–21)',
        interpretation:
          banda === 'bajo'
            ? 'Riesgo bajo de prolongación del QTc > 500 ms (≈ 15 %).'
            : banda === 'moderado'
              ? 'Riesgo moderado (≈ 37 %): monitorización electrocardiográfica y control de electrolitos.'
              : 'Riesgo alto (≈ 73 %): evitar en lo posible fármacos que prolonguen el QT, monitorización continua y corrección de potasio y magnesio.',
        level: banda === 'bajo' ? 'ok' : banda === 'moderado' ? 'warn' : 'danger',
      }
    },
    notes: ['Si se toman ≥ 2 fármacos que prolongan el QT, deben marcarse ambas casillas (3 + 3 puntos).'],
    references: [
      'Tisdale JE, et al. Development and validation of a risk score to predict QT interval prolongation in hospitalized patients. Circ Cardiovasc Qual Outcomes. 2013;6(4):479-87.',
    ],
  },
  {
    id: 'cockcroft-gault',
    name: 'Aclaramiento de creatinina (Cockcroft-Gault)',
    shortName: 'Cockcroft-Gault',
    description: 'Estima el aclaramiento de creatinina para el ajuste de dosis de fármacos.',
    category: CAT,
    specialty: CARD,
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
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 18, max: 110 },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 20, max: 300 },
      { id: 'creatinina', type: 'number', label: 'Creatinina sérica', unit: 'mg/dL', min: 0.1, max: 20, step: 0.01 },
    ],
    compute: (v) => {
      const crcl =
        (((140 - v.edad!) * v.peso!) / (72 * v.creatinina!)) * (v.sexo === 1 ? 0.85 : 1)
      return {
        main: fmt(crcl, 1),
        mainUnit: 'mL/min',
        interpretation:
          crcl >= 90
            ? 'Aclaramiento normal.'
            : crcl >= 60
              ? 'Reducción leve del aclaramiento: revisar fármacos de eliminación renal.'
              : crcl >= 30
                ? 'Reducción moderada: ajuste de dosis necesario en muchos fármacos (incluidos los anticoagulantes directos).'
                : crcl >= 15
                  ? 'Reducción grave: ajuste estricto y evitar nefrotóxicos.'
                  : 'Fallo renal: valorar contraindicaciones farmacológicas y necesidad de terapia renal sustitutiva.',
        level: crcl >= 60 ? 'ok' : crcl >= 30 ? 'warn' : 'danger',
        details: ['CrCl = [(140 − edad) × peso] / (72 × creatinina) × 0,85 si mujer.'],
      }
    },
    notes: [
      'En obesidad conviene usar el peso ideal o ajustado; la fórmula sobreestima con peso elevado.',
      'Es la fórmula usada en las fichas técnicas de muchos fármacos (p. ej., anticoagulantes de acción directa), aunque el CKD-EPI estime mejor el filtrado glomerular.',
    ],
    references: [
      'Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41.',
    ],
  },
  {
    id: 'friedewald',
    name: 'Colesterol LDL (ecuación de Friedewald)',
    shortName: 'LDL Friedewald',
    description: 'Calcula el colesterol LDL a partir del perfil lipídico estándar.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'total', type: 'number', label: 'Colesterol total', unit: 'mg/dL', min: 50, max: 800 },
      { id: 'hdl', type: 'number', label: 'Colesterol HDL', unit: 'mg/dL', min: 5, max: 200 },
      { id: 'tg', type: 'number', label: 'Triglicéridos', unit: 'mg/dL', min: 10, max: 2000 },
    ],
    compute: (v) => {
      if (v.tg! > 400)
        return {
          main: 'No válido',
          interpretation:
            'Con triglicéridos > 400 mg/dL la ecuación de Friedewald no es fiable: usar LDL directo o las ecuaciones de Martin-Hopkins o Sampson.',
          level: 'warn',
        }
      const ldl = v.total! - v.hdl! - v.tg! / 5
      return {
        main: fmt(ldl, 0),
        mainUnit: 'mg/dL de LDL',
        secondary: fmt(v.total! - v.hdl!, 0),
        secondaryLabel: 'colesterol no-HDL (mg/dL)',
        interpretation:
          ldl < 55
            ? 'LDL < 55 mg/dL: objetivo de muy alto riesgo cardiovascular alcanzado.'
            : ldl < 70
              ? 'LDL < 70 mg/dL: objetivo de alto riesgo alcanzado.'
              : ldl < 100
                ? 'LDL < 100 mg/dL: objetivo de riesgo moderado alcanzado.'
                : 'LDL elevado respecto a los objetivos habituales: valorar tratamiento hipolipemiante según el riesgo cardiovascular.',
        level: ldl < 70 ? 'ok' : ldl < 100 ? 'info' : ldl < 190 ? 'warn' : 'danger',
        details: ['LDL = colesterol total − HDL − triglicéridos/5 (mg/dL).'],
      }
    },
    notes: ['Requiere ayuno y no es válida con triglicéridos > 400 mg/dL ni con LDL muy bajo.'],
    references: [
      'Friedewald WT, et al. Estimation of the concentration of low-density lipoprotein cholesterol in plasma, without use of the preparative ultracentrifuge. Clin Chem. 1972;18(6):499-502.',
    ],
  },
  {
    id: 'calcio-corregido',
    name: 'Calcio corregido por albúmina',
    shortName: 'Calcio corregido',
    description: 'Corrige la calcemia total según la concentración de albúmina sérica.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'calcio', type: 'number', label: 'Calcio sérico total', unit: 'mg/dL', min: 2, max: 20, step: 0.1 },
      { id: 'albumina', type: 'number', label: 'Albúmina sérica', unit: 'g/dL', min: 0.5, max: 7, step: 0.1 },
    ],
    compute: (v) => {
      const corr = v.calcio! + 0.8 * (4 - v.albumina!)
      return {
        main: fmt(corr, 2),
        mainUnit: 'mg/dL (calcio corregido)',
        interpretation:
          corr < 8.5
            ? 'Hipocalcemia: valorar causas (déficit de vitamina D, hipoparatiroidismo, hipomagnesemia) y prolongación del QT.'
            : corr <= 10.5
              ? 'Calcio corregido dentro del rango normal (8,5–10,5 mg/dL).'
              : 'Hipercalcemia: valorar hiperparatiroidismo, neoplasia y otras causas; vigilar acortamiento del QT.',
        level: corr < 8.5 || corr > 10.5 ? 'warn' : 'ok',
        details: ['Calcio corregido = calcio medido + 0,8 × (4 − albúmina).'],
      }
    },
    notes: ['Ante dudas o situaciones críticas, medir el calcio iónico directamente.'],
  },
  {
    id: 'fick',
    name: 'Gasto cardíaco (fórmula de Fick)',
    shortName: 'Fick',
    description: 'Calcula el gasto cardíaco, el índice cardíaco y el volumen sistólico.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'hb', type: 'number', label: 'Hemoglobina', unit: 'g/dL', min: 3, max: 25, step: 0.1 },
      { id: 'sao2', type: 'number', label: 'Saturación arterial de O₂', unit: '%', min: 40, max: 100 },
      { id: 'svo2', type: 'number', label: 'Saturación venosa mixta de O₂', unit: '%', min: 10, max: 100 },
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 18, max: 110 },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 20, max: 300 },
      { id: 'talla', type: 'number', label: 'Talla', unit: 'cm', min: 100, max: 230 },
      { id: 'fc', type: 'number', label: 'Frecuencia cardíaca', unit: 'lpm', min: 20, max: 250 },
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
    ],
    compute: (v) => {
      const bsa = Math.sqrt((v.talla! * v.peso!) / 3600)
      // Consumo de oxígeno estimado (LaFarge y Miettinen), en mL/min/m² × superficie corporal.
      const coefEdad = v.sexo === 1 ? 17.04 : 11.49
      const vo2 = (138.1 - coefEdad * Math.log(v.edad!) + 0.378 * v.fc!) * bsa
      const dif = 13.4 * v.hb! * ((v.sao2! - v.svo2!) / 100)
      if (dif <= 0)
        return {
          main: '—',
          interpretation: 'La saturación arterial debe ser mayor que la venosa mixta.',
          level: 'warn',
        }
      const co = vo2 / dif
      const ci = co / bsa
      const sv = (co * 1000) / v.fc!
      return {
        main: fmt(co, 2),
        mainUnit: 'L/min (gasto cardíaco)',
        secondary: fmt(ci, 2),
        secondaryLabel: 'índice cardíaco (L/min/m²)',
        interpretation:
          ci < 2.2
            ? 'Índice cardíaco < 2,2 L/min/m²: bajo gasto; valorar soporte inotrópico o mecánico según el contexto.'
            : ci <= 4
              ? 'Índice cardíaco dentro del rango habitual (2,2–4,0 L/min/m²).'
              : 'Índice cardíaco elevado: valorar estados hiperdinámicos (sepsis, anemia, tirotoxicosis).',
        level: ci < 2.2 ? 'danger' : ci <= 4 ? 'ok' : 'warn',
        details: [
          `Superficie corporal (Mosteller): ${fmt(bsa, 2)} m².`,
          `VO₂ estimado (LaFarge): ${fmt(vo2, 0)} mL/min.`,
          `Volumen sistólico: ${fmt(sv, 0)} mL.`,
        ],
      }
    },
    notes: [
      'Usa el consumo de oxígeno estimado con la ecuación de LaFarge y Miettinen (Fick indirecto), no medido.',
      'En insuficiencia cardíaca con fracción de eyección reducida, las ecuaciones de estimación tienen límites de concordancia amplios: LaFarge fue la más ajustada de las tres estudiadas, pero con un error ≥ 25 % en el 11 % de los pacientes y una clasificación errónea del índice cardíaco en torno al 20 %. Ante decisiones críticas, medir el VO₂ directamente.',
      'Requiere saturación venosa mixta obtenida de arteria pulmonar (no venosa central).',
    ],
    references: [
      'LaFarge CG, Miettinen OS. The estimation of oxygen consumption. Cardiovasc Res. 1970;4(1):23-30.',
      'Chase PJ, et al. Comparison of estimations versus measured oxygen consumption at rest in patients with heart failure and reduced ejection fraction who underwent right-sided heart catheterization. Am J Cardiol. 2015;116(11):1724-30. doi:10.1016/j.amjcard.2015.08.051',
    ],
  },
  {
    id: 'cpo',
    name: 'Potencia cardíaca (CPO)',
    shortName: 'CPO',
    description:
      'Calcula la potencia desarrollada por el corazón; predictor pronóstico en el shock cardiogénico.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'pam', type: 'number', label: 'Presión arterial media', unit: 'mmHg', min: 20, max: 200 },
      { id: 'co', type: 'number', label: 'Gasto cardíaco', unit: 'L/min', min: 0.5, max: 15, step: 0.1 },
    ],
    compute: (v) => {
      const cpo = (v.pam! * v.co!) / 451
      return {
        main: fmt(cpo, 2),
        mainUnit: 'W',
        interpretation:
          cpo < 0.6
            ? 'CPO < 0,6 W: se asocia a mortalidad elevada en el shock cardiogénico; considerar soporte inotrópico o circulatorio mecánico.'
            : 'CPO ≥ 0,6 W: mejor pronóstico hemodinámico.',
        level: cpo < 0.6 ? 'danger' : 'ok',
        details: ['CPO = PAM × gasto cardíaco / 451.'],
      }
    },
    references: [
      'Fincke R, et al. Cardiac power is the strongest hemodynamic correlate of mortality in cardiogenic shock (SHOCK trial registry). J Am Coll Cardiol. 2004;44(2):340-8.',
    ],
  },
  {
    id: 'papi',
    name: 'Índice de pulsatilidad de la arteria pulmonar (PAPi)',
    shortName: 'PAPi',
    description:
      'Evalúa el riesgo de disfunción del ventrículo derecho (infarto inferior, implante de asistencia ventricular izquierda).',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'pasp', type: 'number', label: 'Presión sistólica en arteria pulmonar', unit: 'mmHg', min: 5, max: 150 },
      { id: 'padp', type: 'number', label: 'Presión diastólica en arteria pulmonar', unit: 'mmHg', min: 0, max: 100 },
      { id: 'pad', type: 'number', label: 'Presión auricular derecha media', unit: 'mmHg', min: 0.5, max: 40, step: 0.5 },
    ],
    compute: (v) => {
      const papi = (v.pasp! - v.padp!) / v.pad!
      return {
        main: fmt(papi, 2),
        interpretation:
          papi < 1
            ? 'PAPi < 1,0: disfunción grave del ventrículo derecho; asociado a mal pronóstico y a necesidad de soporte del VD.'
            : papi < 1.85
              ? 'PAPi entre 1,0 y 1,85: riesgo aumentado de fallo del ventrículo derecho, especialmente tras implante de asistencia ventricular izquierda.'
              : 'PAPi ≥ 1,85: función del ventrículo derecho conservada en términos hemodinámicos.',
        level: papi < 1 ? 'danger' : papi < 1.85 ? 'warn' : 'ok',
        details: ['PAPi = (PAP sistólica − PAP diastólica) / presión auricular derecha.'],
      }
    },
    references: [
      'Korabathina R, et al. The pulmonary artery pulsatility index identifies severe right ventricular dysfunction in acute inferior myocardial infarction. Catheter Cardiovasc Interv. 2012;80(4):593-600.',
    ],
  },
  {
    id: 'light',
    name: 'Criterios de Light para el derrame pleural',
    shortName: 'Light',
    description: 'Determina si un derrame pleural es exudado o trasudado.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'protPleural', type: 'number', label: 'Proteínas en líquido pleural', unit: 'g/dL', min: 0, max: 10, step: 0.1 },
      { id: 'protSuero', type: 'number', label: 'Proteínas séricas', unit: 'g/dL', min: 1, max: 12, step: 0.1 },
      { id: 'ldhPleural', type: 'number', label: 'LDH en líquido pleural', unit: 'U/L', min: 0, max: 5000 },
      { id: 'ldhSuero', type: 'number', label: 'LDH sérica', unit: 'U/L', min: 10, max: 5000 },
      { id: 'ldhLimite', type: 'number', label: 'Límite superior de LDH del laboratorio', unit: 'U/L', min: 50, max: 1000 },
    ],
    compute: (v) => {
      const rProt = v.protPleural! / v.protSuero!
      const rLdh = v.ldhPleural! / v.ldhSuero!
      const c1 = rProt > 0.5
      const c2 = rLdh > 0.6
      const c3 = v.ldhPleural! > (2 / 3) * v.ldhLimite!
      const exudado = c1 || c2 || c3
      return {
        main: exudado ? 'Exudado' : 'Trasudado',
        secondary: `${[c1, c2, c3].filter(Boolean).length}/3`,
        secondaryLabel: 'criterios cumplidos',
        interpretation: exudado
          ? 'Cumple al menos un criterio de Light: exudado. Estudiar causas (infección, neoplasia, embolia pulmonar, enfermedades del tejido conectivo).'
          : 'No cumple ningún criterio: trasudado. Causas habituales: insuficiencia cardíaca, cirrosis, síndrome nefrótico.',
        level: exudado ? 'warn' : 'info',
        details: [
          `Proteínas pleural/suero: ${fmt(rProt, 2)} (criterio > 0,5) ${c1 ? '✓' : '✗'}`,
          `LDH pleural/suero: ${fmt(rLdh, 2)} (criterio > 0,6) ${c2 ? '✓' : '✗'}`,
          `LDH pleural > 2/3 del límite superior (${fmt((2 / 3) * v.ldhLimite!, 0)} U/L) ${c3 ? '✓' : '✗'}`,
        ],
      }
    },
    notes: [
      'En pacientes con insuficiencia cardíaca en tratamiento diurético, los criterios pueden clasificar erróneamente un trasudado como exudado: valorar el gradiente de albúmina suero-líquido (> 1,2 g/dL sugiere trasudado).',
    ],
    references: [
      'Light RW, et al. Pleural effusions: the diagnostic separation of transudates and exudates. Ann Intern Med. 1972;77(4):507-13.',
    ],
  },
  {
    id: 'fluidos-mantenimiento',
    name: 'Fluidos de mantenimiento (regla 4-2-1 / Holliday-Segar)',
    shortName: 'Fluidos de mantenimiento',
    description: 'Calcula las necesidades basales de líquidos según el peso.',
    category: CAT,
    specialty: CARD,
    inputs: [{ id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 0.5, max: 300, step: 0.1 }],
    compute: (v) => {
      const w = v.peso!
      const hora = w <= 10 ? 4 * w : w <= 20 ? 40 + 2 * (w - 10) : 60 + (w - 20)
      const dia = w <= 10 ? 100 * w : w <= 20 ? 1000 + 50 * (w - 10) : 1500 + 20 * (w - 20)
      return {
        main: fmt(hora, 0),
        mainUnit: 'mL/h',
        secondary: fmt(dia, 0),
        secondaryLabel: 'mL/día',
        interpretation:
          'Necesidades basales de mantenimiento. Ajustar según pérdidas, estado de volemia, función renal y cardíaca; en insuficiencia cardíaca o renal suele requerirse restricción.',
        level: 'info',
        details: ['Regla 4-2-1: 4 mL/kg/h los primeros 10 kg, 2 mL/kg/h los siguientes 10 kg y 1 mL/kg/h el resto.'],
      }
    },
    references: [
      'Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957;19(5):823-32.',
    ],
  },
  {
    id: 'diuresis',
    name: 'Diuresis y balance hídrico',
    shortName: 'Diuresis',
    description: 'Calcula la diuresis horaria y el balance de líquidos en 24 horas.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 0.5, max: 300, step: 0.1 },
      { id: 'orina', type: 'number', label: 'Volumen de orina recogido', unit: 'mL', min: 0, max: 20000 },
      { id: 'horas', type: 'number', label: 'Tiempo de recogida', unit: 'h', min: 0.5, max: 72, step: 0.5 },
      { id: 'aportes', type: 'number', label: 'Aportes totales en ese período (opcional)', unit: 'mL', min: 0, max: 30000 },
    ],
    compute: (v) => {
      const mlKgH = v.orina! / v.peso! / v.horas!
      const balance = v.aportes! - v.orina!
      return {
        main: fmt(mlKgH, 2),
        mainUnit: 'mL/kg/h',
        secondary: `${balance >= 0 ? '+' : ''}${fmt(balance, 0)} mL`,
        secondaryLabel: 'balance en el período',
        interpretation:
          mlKgH < 0.3
            ? 'Oliguria grave / anuria (< 0,3 mL/kg/h): criterio de lesión renal aguda; valorar causa prerrenal, renal u obstructiva de forma urgente.'
            : mlKgH < 0.5
              ? 'Oliguria (< 0,5 mL/kg/h): si persiste ≥ 6 h cumple criterio KDIGO de lesión renal aguda.'
              : 'Diuresis dentro del rango habitual (≥ 0,5 mL/kg/h).',
        level: mlKgH < 0.3 ? 'danger' : mlKgH < 0.5 ? 'warn' : 'ok',
        details: [`Diuresis extrapolada a 24 h: ${fmt((v.orina! / v.horas!) * 24, 0)} mL/día.`],
      }
    },
    notes: ['El balance no incluye las pérdidas insensibles (aprox. 500–800 mL/día en un adulto, más con fiebre o taquipnea).'],
  },
  {
    id: 'reticulocitos',
    name: 'Índice de producción reticulocitaria (IPR)',
    shortName: 'IPR / reticulocitos',
    description:
      'Evalúa la respuesta de la médula ósea a la anemia corrigiendo el porcentaje de reticulocitos.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'retis', type: 'number', label: 'Reticulocitos', unit: '%', min: 0, max: 60, step: 0.1 },
      { id: 'hto', type: 'number', label: 'Hematocrito del paciente', unit: '%', min: 5, max: 65, step: 0.1 },
      { id: 'htoNormal', type: 'number', label: 'Hematocrito normal de referencia', unit: '%', min: 30, max: 55, step: 0.5 },
    ],
    compute: (v) => {
      const corregido = v.retis! * (v.hto! / v.htoNormal!)
      const madur = v.hto! >= 35 ? 1 : v.hto! >= 25 ? 1.5 : v.hto! >= 20 ? 2 : 2.5
      const ipr = corregido / madur
      return {
        main: fmt(ipr, 2),
        mainUnit: 'IPR',
        secondary: `${fmt(corregido, 2)} %`,
        secondaryLabel: 'reticulocitos corregidos',
        interpretation:
          ipr < 2
            ? 'IPR < 2: respuesta medular inadecuada (anemia hipoproliferativa: ferropenia, enfermedad crónica, aplasia, infiltración medular).'
            : 'IPR ≥ 2: respuesta medular adecuada, sugestiva de hemólisis o sangrado con médula competente.',
        level: ipr < 2 ? 'warn' : 'ok',
        details: [`Factor de maduración aplicado: ${madur}.`],
      }
    },
  },
  {
    id: 'marcha-6min',
    name: 'Prueba de la marcha de 6 minutos (valores de referencia)',
    shortName: 'Marcha 6 min',
    description:
      'Calcula la distancia teórica esperada en la prueba de los 6 minutos como medida del estado funcional.',
    category: CAT,
    specialty: CARD,
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
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 18, max: 100 },
      { id: 'talla', type: 'number', label: 'Talla', unit: 'cm', min: 120, max: 220 },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 25, max: 250 },
      { id: 'recorrida', type: 'number', label: 'Distancia recorrida (opcional)', unit: 'm', min: 0, max: 1000 },
    ],
    compute: (v) => {
      const teorica =
        v.sexo === 0
          ? 7.57 * v.talla! - 5.02 * v.edad! - 1.76 * v.peso! - 309
          : 2.11 * v.talla! - 2.29 * v.peso! - 5.78 * v.edad! + 667
      const li = v.sexo === 0 ? teorica - 153 : teorica - 139
      const pct = v.recorrida! > 0 ? (v.recorrida! / teorica) * 100 : null
      return {
        main: fmt(teorica, 0),
        mainUnit: 'm (distancia teórica)',
        secondary: pct !== null ? `${fmt(pct, 0)} %` : undefined,
        secondaryLabel: pct !== null ? 'del valor teórico' : undefined,
        interpretation:
          pct === null
            ? `Límite inferior de la normalidad: ${fmt(li, 0)} m (ecuaciones de Enright y Sherrill).`
            : v.recorrida! < li
              ? `Distancia por debajo del límite inferior de la normalidad (${fmt(li, 0)} m): capacidad funcional reducida.`
              : 'Distancia dentro del rango esperado para edad, sexo, talla y peso.',
        level: pct === null ? 'info' : v.recorrida! < li ? 'warn' : 'ok',
      }
    },
    notes: [
      'Una diferencia de 30–50 m se considera clínicamente relevante en el seguimiento individual.',
      'Registrar además la SpO₂, la disnea (Borg) y los motivos de interrupción.',
    ],
    references: [
      'Enright PL, Sherrill DL. Reference equations for the six-minute walk in healthy adults. Am J Respir Crit Care Med. 1998;158(5):1384-7.',
    ],
  },
  {
    id: 'trombolisis-ictus',
    name: 'Dosificación de trombolíticos en el ictus isquémico',
    shortName: 'Dosis alteplasa / tenecteplasa',
    description:
      'Calcula la dosis de alteplasa (0,9 mg/kg) o tenecteplasa (0,25 mg/kg) para el ictus isquémico agudo.',
    category: CAT,
    specialty: CARD,
    inputs: [
      {
        id: 'farmaco',
        type: 'select',
        label: 'Fármaco',
        noPoints: true,
        options: [
          { label: 'Alteplasa (rtPA) 0,9 mg/kg — máximo 90 mg', value: 0 },
          { label: 'Tenecteplasa (TNK) 0,25 mg/kg — máximo 25 mg', value: 1 },
        ],
      },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 20, max: 250, step: 0.5 },
    ],
    compute: (v) => {
      const tnk = v.farmaco === 1
      const total = tnk ? Math.min(0.25 * v.peso!, 25) : Math.min(0.9 * v.peso!, 90)
      const bolo = tnk ? total : total * 0.1
      const infusion = tnk ? 0 : total - bolo
      return {
        main: fmt(total, 1),
        mainUnit: 'mg (dosis total)',
        secondary: fmt(bolo, 1),
        secondaryLabel: tnk ? 'mg en bolo único (5 s)' : 'mg en bolo (1 min)',
        interpretation: tnk
          ? 'Tenecteplasa: dosis única en bolo intravenoso de 5 segundos (0,25 mg/kg, máximo 25 mg).'
          : `Alteplasa: 10 % en bolo durante 1 minuto y el 90 % restante (${fmt(infusion, 1)} mg) en infusión de 60 minutos.`,
        level: 'info',
        details: [
          'Verificar ventana terapéutica, criterios de inclusión/exclusión y control estricto de la presión arterial (< 185/110 mmHg antes de tratar).',
          'Monitorización neurológica y de la presión arterial según protocolo durante y tras la infusión.',
        ],
      }
    },
    notes: ['Comprobar siempre la dosis con el protocolo de tu centro y la ficha técnica antes de administrarla.'],
    references: [
      'Powers WJ, et al. Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update. Stroke. 2019;50(12):e344-e418.',
    ],
  },
]
