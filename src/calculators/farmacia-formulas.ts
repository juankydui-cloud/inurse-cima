import type { Calculator } from '../engine/types'
import { fmt } from '../engine/types'

const CAT_RENAL = 'Función renal y ajuste de dosis'
const CAT_FLUIDOS = 'Fluidos, electrolitos e infusiones'
const CAT_FARMACO = 'Farmacología y dosificación'
const FARM = ['Farmacia']

export const farmaciaFormulas: Calculator[] = [
  {
    id: 'ckd-epi',
    name: 'Ecuación CKD-EPI 2021 (sin raza)',
    shortName: 'CKD-EPI',
    description:
      'Estima el filtrado glomerular en adultos mayores de 18 años; recomendada por las guías KDIGO actuales.',
    category: CAT_RENAL,
    specialty: FARM,
    inputs: [
      { id: 'creatinina', type: 'number', label: 'Creatinina sérica', unit: 'mg/dL', min: 0.1, max: 20, step: 0.01 },
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 18, max: 110 },
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
      const mujer = v.sexo === 1
      const k = mujer ? 0.7 : 0.9
      const alpha = mujer ? -0.241 : -0.302
      const min = Math.min(v.creatinina! / k, 1)
      const max = Math.max(v.creatinina! / k, 1)
      const fge =
        142 *
        Math.pow(min, alpha) *
        Math.pow(max, -1.2) *
        Math.pow(0.9938, v.edad!) *
        (mujer ? 1.012 : 1)
      const estadio =
        fge >= 90 ? 'G1' : fge >= 60 ? 'G2' : fge >= 45 ? 'G3a' : fge >= 30 ? 'G3b' : fge >= 15 ? 'G4' : 'G5'
      return {
        main: fmt(fge, 1),
        mainUnit: 'mL/min/1,73 m²',
        secondary: estadio,
        secondaryLabel: 'estadio KDIGO',
        interpretation:
          fge >= 60
            ? 'Filtrado conservado o levemente reducido. Solo hay enfermedad renal crónica si hay además daño renal (albuminuria, alteraciones estructurales) durante ≥ 3 meses.'
            : fge >= 30
              ? 'Reducción moderada del filtrado: ajustar fármacos, evitar nefrotóxicos.'
              : fge >= 15
                ? 'Reducción grave: seguimiento por nefrología y preparación del tratamiento sustitutivo.'
                : 'Fallo renal: valorar terapia renal sustitutiva.',
        level: fge >= 60 ? 'ok' : fge >= 30 ? 'warn' : 'danger',
        details: [
          'CKD-EPI 2021 sin coeficiente racial (recomendado por NKF y ASN desde 2021).',
          'Para ajustar dosis de fármacos, muchas fichas técnicas todavía se basan en Cockcroft-Gault: verificar cada caso.',
        ],
      }
    },
    notes: [
      'La ecuación devuelve el filtrado indexado por 1,73 m² de superficie corporal. Para pesos extremos, usar la versión no indexada.',
      'No aplicable en la insuficiencia renal aguda ni en el embarazo.',
    ],
    references: [
      'Inker LA, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. N Engl J Med. 2021;385(19):1737-49.',
    ],
  },
  {
    id: 'schwartz-2009',
    name: 'Ecuación de Schwartz revisada pediátrica (2009)',
    shortName: 'Schwartz',
    description: 'Estima el filtrado glomerular en pacientes pediátricos.',
    category: CAT_RENAL,
    specialty: FARM,
    inputs: [
      { id: 'talla', type: 'number', label: 'Talla', unit: 'cm', min: 30, max: 200, step: 0.5 },
      { id: 'creatinina', type: 'number', label: 'Creatinina sérica', unit: 'mg/dL', min: 0.05, max: 15, step: 0.01 },
    ],
    compute: (v) => {
      const fge = (0.413 * v.talla!) / v.creatinina!
      return {
        main: fmt(fge, 1),
        mainUnit: 'mL/min/1,73 m²',
        interpretation:
          fge >= 90
            ? 'Filtrado glomerular estimado normal para la edad pediátrica.'
            : fge >= 60
              ? 'Reducción leve.'
              : 'Reducción significativa: valorar por nefrología pediátrica.',
        level: fge >= 90 ? 'ok' : fge >= 60 ? 'warn' : 'danger',
        details: ['FGe = 0,413 × talla (cm) / creatinina (mg/dL).'],
      }
    },
    notes: [
      'Validada en niños y adolescentes con enfermedad renal crónica y filtrado 15–75 mL/min/1,73 m².',
      'En neonatos, prematuros y lactantes pequeños la ecuación pierde exactitud.',
    ],
    references: [
      'Schwartz GJ, et al. New equations to estimate GFR in children with CKD. J Am Soc Nephrol. 2009;20(3):629-37.',
    ],
  },
  {
    id: 'fenitoina-corregida',
    name: 'Fenitoína corregida por albúmina e insuficiencia renal',
    shortName: 'Fenitoína corregida',
    description:
      'Corrige la concentración total de fenitoína en pacientes con hipoalbuminemia o insuficiencia renal (fórmula de Sheiner-Tozer).',
    category: CAT_RENAL,
    specialty: FARM,
    inputs: [
      { id: 'nivel', type: 'number', label: 'Fenitoína total medida', unit: 'µg/mL', min: 0, max: 100, step: 0.1 },
      { id: 'albumina', type: 'number', label: 'Albúmina sérica', unit: 'g/dL', min: 0.5, max: 6, step: 0.1 },
      {
        id: 'renal',
        type: 'select',
        label: 'Función renal',
        noPoints: true,
        options: [
          { label: 'Conservada (aclaramiento ≥ 20 mL/min)', value: 0 },
          { label: 'Insuficiencia renal grave (aclaramiento < 20 mL/min)', value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const factor = v.renal === 1 ? 0.1 : 0.2
      const corregida = v.nivel! / (factor * v.albumina! + 0.1)
      return {
        main: fmt(corregida, 1),
        mainUnit: 'µg/mL corregida',
        interpretation:
          corregida < 10
            ? 'Rango infraterapéutico: valorar aumento de dosis según la clínica.'
            : corregida <= 20
              ? 'Rango terapéutico (10–20 µg/mL).'
              : 'Rango tóxico (> 20 µg/mL): valorar suspender o reducir la dosis y buscar signos de toxicidad (nistagmo, ataxia, disartria, alteración del nivel de conciencia).',
        level: corregida < 10 ? 'warn' : corregida <= 20 ? 'ok' : 'danger',
        details: [
          `Fórmula: nivel medido / (${factor} × albúmina + 0,1).`,
          v.renal === 1
            ? 'Usa la fórmula modificada para pacientes con insuficiencia renal grave (factor 0,1 en lugar de 0,2).'
            : 'Factor 0,2 (fórmula estándar).',
        ],
      }
    },
    notes: [
      'Si dispone de fenitoína libre, es preferible medirla directamente (rango terapéutico 1–2 µg/mL).',
      'La fórmula estima; los rangos son orientativos y deben integrarse con la respuesta clínica.',
    ],
    references: [
      'Winter ME. Basic Clinical Pharmacokinetics. 5.ª ed. Lippincott, 2010.',
    ],
  },
  {
    id: 'gir',
    name: 'Tasa de infusión de glucosa (GIR)',
    shortName: 'GIR',
    description:
      'Cuantifica la velocidad a la que se administra glucosa por vía intravenosa (útil en neonatología y pediatría).',
    category: CAT_FLUIDOS,
    specialty: FARM,
    inputs: [
      { id: 'ritmo', type: 'number', label: 'Ritmo de infusión', unit: 'mL/h', min: 0.1, max: 500, step: 0.1 },
      { id: 'concentracion', type: 'number', label: 'Concentración de glucosa', unit: '%', min: 1, max: 70, step: 0.5 },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 0.3, max: 200, step: 0.1 },
    ],
    compute: (v) => {
      const gir = (v.ritmo! * v.concentracion! * 10) / (60 * v.peso!)
      return {
        main: fmt(gir, 1),
        mainUnit: 'mg/kg/min',
        interpretation:
          gir < 4
            ? 'GIR baja: puede ser insuficiente para prevenir la hipoglucemia en el neonato (objetivo habitual 4–8 mg/kg/min).'
            : gir <= 8
              ? 'GIR habitual de mantenimiento neonatal (4–8 mg/kg/min).'
              : gir <= 12
                ? 'GIR alta: vigilar hiperglucemia y la osmolaridad de la solución.'
                : 'GIR muy alta (> 12 mg/kg/min): riesgo de hiperglucemia y de esteatosis hepática; revisar la indicación y considerar insulina.',
        level: gir < 4 ? 'warn' : gir <= 8 ? 'ok' : gir <= 12 ? 'warn' : 'danger',
        details: [
          'Fórmula: GIR = (mL/h × % glucosa × 10) / (60 × peso).',
          `Aporte total de glucosa: ${fmt((v.ritmo! * v.concentracion!) / 100 * 24, 1)} g/día.`,
          'Con GIR > 6 mg/kg/min por vía periférica se recomienda vía central si la osmolaridad supera 900 mOsm/L.',
        ],
      }
    },
    references: [
      'Adamkin DH. Clinical Report—Postnatal Glucose Homeostasis in Late-Preterm and Term Infants. Pediatrics. 2011;127(3):575-9.',
    ],
  },
  {
    id: 'correccion-sodio',
    name: 'Tasa de corrección de sodio (Adrogué-Madias)',
    shortName: 'Corrección de sodio',
    description:
      'Estima el cambio de sodio sérico que produce 1 litro de la solución elegida y el volumen necesario para alcanzar un objetivo.',
    category: CAT_FLUIDOS,
    specialty: FARM,
    inputs: [
      {
        id: 'poblacion',
        type: 'select',
        label: 'Grupo (fracción de agua corporal)',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Varón adulto (0,6)', value: 0.6 },
          { label: 'Mujer adulta (0,5)', value: 0.5 },
          { label: 'Varón anciano (0,5)', value: 0.5001 },
          { label: 'Mujer anciana (0,45)', value: 0.45 },
          { label: 'Niño (0,6)', value: 0.6002 },
        ],
        default: 0.6,
      },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 3, max: 250, step: 0.5 },
      { id: 'naActual', type: 'number', label: 'Sodio sérico actual', unit: 'mEq/L', min: 100, max: 180, step: 0.1 },
      { id: 'naObjetivo', type: 'number', label: 'Sodio sérico objetivo', unit: 'mEq/L', min: 100, max: 180, step: 0.1 },
      {
        id: 'solucion',
        type: 'select',
        label: 'Solución de infusión (Na⁺ infundido, mEq/L)',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Suero fisiológico 0,9 % (154)', value: 154 },
          { label: 'Ringer lactato (130)', value: 130 },
          { label: 'Suero salino hipertónico 3 % (513)', value: 513 },
          { label: 'Suero salino hipertónico 2 % (342)', value: 342 },
          { label: 'Suero salino 0,45 % (77)', value: 77 },
          { label: 'Suero glucosado 5 % (0)', value: 0 },
        ],
        default: 154,
      },
      {
        id: 'horas',
        type: 'number',
        label: 'Tiempo previsto de corrección',
        unit: 'h',
        min: 1,
        max: 96,
        step: 1,
      },
    ],
    compute: (v) => {
      const acT = (v.poblacion ?? 0.6) * v.peso!
      const cambio = ((v.solucion ?? 154) - v.naActual!) / (acT + 1)
      const objetivo = v.naObjetivo! - v.naActual!
      const litros = cambio === 0 ? Infinity : objetivo / cambio
      const ritmo = litros === Infinity ? 0 : (litros * 1000) / v.horas!
      const seguro =
        Math.abs(objetivo) / (v.horas! / 24) <= (v.naActual! < v.naObjetivo! ? 10 : 10)
      return {
        main: fmt(cambio, 2),
        mainUnit: 'mEq/L por cada litro infundido',
        secondary: litros === Infinity ? '—' : `${fmt(litros * 1000, 0)} mL`,
        secondaryLabel: 'volumen total para alcanzar el objetivo',
        interpretation:
          litros === Infinity
            ? 'La solución elegida tiene la misma concentración que el sodio del paciente: no modificará la natremia.'
            : (v.naActual! < v.naObjetivo!
                ? 'Hiponatremia: no superar 10 mEq/L al día (8 mEq/L en pacientes con riesgo alto de mielinolisis: alcohólicos, malnutridos, hipopotasémicos, hepatopatía). En hiponatremia grave sintomática, aportar bolo de 100–150 mL de salino al 3 % y reevaluar.'
                : 'Hipernatremia: no bajar más de 10 mEq/L al día para evitar el edema cerebral.') +
              (seguro ? '' : ' Atención: el ritmo previsto supera el límite recomendado.'),
        level: !seguro ? 'danger' : 'warn',
        details: [
          `Ritmo aproximado: ${fmt(ritmo, 0)} mL/h.`,
          'Fórmula: ΔNa por litro = (Na infundido − Na sérico) / (agua corporal total + 1).',
          'Reevaluar sodio cada 2–4 h; no basar decisiones únicamente en el cálculo.',
        ],
      }
    },
    notes: [
      'En la hiponatremia crónica, corregir de forma lenta (máx. 8–10 mEq/L en 24 h) para prevenir el síndrome de desmielinización osmótica.',
      'En la hipernatremia crónica, corregir a razón máxima de 10 mEq/L al día.',
      'Añadir el aporte de potasio de la solución al cálculo si es significativo.',
    ],
    references: [
      'Adrogué HJ, Madias NE. Hyponatremia. N Engl J Med. 2000;342(21):1581-9.',
    ],
  },
  {
    id: 'balance-fluidos',
    name: 'Balance de fluidos por entradas y salidas',
    shortName: 'Balance de fluidos',
    description:
      'Calcula el balance hídrico diario y estima el sodio administrado y las pérdidas insensibles.',
    category: CAT_FLUIDOS,
    specialty: FARM,
    inputs: [
      { id: 'iv', type: 'number', label: 'Fluidos intravenosos administrados', unit: 'mL', min: 0, max: 20000, step: 10 },
      { id: 'oral', type: 'number', label: 'Ingesta oral / enteral', unit: 'mL', min: 0, max: 10000, step: 10 },
      { id: 'diuresis', type: 'number', label: 'Diuresis', unit: 'mL', min: 0, max: 20000, step: 10 },
      { id: 'perdidas', type: 'number', label: 'Otras pérdidas (SNG, drenajes, heces líquidas)', unit: 'mL', min: 0, max: 20000, step: 10 },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 1, max: 250, step: 0.5 },
      { id: 'temp', type: 'number', label: 'Temperatura máxima', unit: '°C', min: 34, max: 42, step: 0.1 },
      { id: 'horas', type: 'number', label: 'Horas del período', unit: 'h', min: 1, max: 72, step: 1 },
    ],
    compute: (v) => {
      const insensibles = 0.5 * v.peso! * v.horas!
      const extraFiebre = Math.max(0, v.temp! - 37) * 0.5 * v.peso!
      const salidas = v.diuresis! + v.perdidas! + insensibles + extraFiebre
      const balance = v.iv! + v.oral! - salidas
      return {
        main: fmt(balance, 0),
        mainUnit: 'mL de balance',
        secondary: fmt(salidas, 0),
        secondaryLabel: 'mL de salidas totales',
        interpretation:
          balance > 500
            ? 'Balance positivo: valorar riesgo de sobrecarga (crepitantes, edema, presión venosa).'
            : balance < -500
              ? 'Balance negativo: valorar hipoperfusión y ajustar el aporte.'
              : 'Balance dentro de un rango habitual.',
        level: balance > 1000 || balance < -1000 ? 'warn' : 'ok',
        details: [
          `Pérdidas insensibles estimadas: ${fmt(insensibles, 0)} mL (0,5 mL/kg/h).`,
          `Pérdidas adicionales por fiebre: ${fmt(extraFiebre, 0)} mL (0,5 mL/kg por cada °C sobre 37).`,
          'Sumar sudoración profusa y taquipnea marcadas si son significativas.',
        ],
      }
    },
  },
  {
    id: 'conversion-esteroides',
    name: 'Conversión de esteroides',
    shortName: 'Esteroides',
    description:
      'Convierte dosis de corticoides sistémicos entre sí usando la potencia glucocorticoide relativa.',
    category: CAT_FARMACO,
    specialty: FARM,
    inputs: [
      {
        id: 'origen',
        type: 'select',
        label: 'Corticoide de partida',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Cortisona', value: 25 },
          { label: 'Hidrocortisona', value: 20 },
          { label: 'Prednisona', value: 5 },
          { label: 'Prednisolona', value: 5.0001 },
          { label: 'Metilprednisolona', value: 4 },
          { label: 'Triamcinolona', value: 4.0001 },
          { label: 'Deflazacort', value: 6 },
          { label: 'Dexametasona', value: 0.75 },
          { label: 'Betametasona', value: 0.6 },
        ],
      },
      { id: 'dosis', type: 'number', label: 'Dosis de partida', unit: 'mg', min: 0.1, max: 2000, step: 0.5 },
      {
        id: 'destino',
        type: 'select',
        label: 'Corticoide equivalente',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Cortisona', value: 25 },
          { label: 'Hidrocortisona', value: 20 },
          { label: 'Prednisona', value: 5 },
          { label: 'Prednisolona', value: 5.0001 },
          { label: 'Metilprednisolona', value: 4 },
          { label: 'Triamcinolona', value: 4.0001 },
          { label: 'Deflazacort', value: 6 },
          { label: 'Dexametasona', value: 0.75 },
          { label: 'Betametasona', value: 0.6 },
        ],
      },
    ],
    compute: (v) => {
      const equiv = (v.dosis! * (v.destino ?? 4)) / (v.origen ?? 5)
      return {
        main: fmt(equiv, 2),
        mainUnit: 'mg equivalentes',
        interpretation:
          'Equivalencia glucocorticoide orientativa. Los corticoides difieren también en potencia mineralocorticoide y duración de acción; adaptar la pauta al escenario clínico.',
        level: 'info',
        details: [
          'Potencia mineralocorticoide: cortisona e hidrocortisona alta; prednisona/prednisolona intermedia; metilprednisolona/triamcinolona baja; dexametasona/betametasona nula.',
          'Duración de acción: cortisona/hidrocortisona corta (8–12 h); prednisona/prednisolona/metilprednisolona/triamcinolona/deflazacort intermedia (12–36 h); dexametasona/betametasona larga (36–72 h).',
        ],
      }
    },
    notes: [
      'La conversión de fluticasona, budesonida u otros inhalados o tópicos no es equivalente a la sistémica: no usar esta calculadora para ellos.',
      'En dosis > 40 mg/día de equivalentes de prednisona, valorar profilaxis gástrica y ósea, y cribado del riesgo cardiometabólico.',
    ],
    references: [
      'Liu D, et al. A practical guide to the monitoring and management of the complications of systemic corticosteroid therapy. Allergy Asthma Clin Immunol. 2013;9(1):30.',
    ],
  },
  {
    id: 'levotiroxina',
    name: 'Dosis inicial de levotiroxina para el hipotiroidismo',
    shortName: 'Levotiroxina',
    description: 'Estima la dosis diaria de levotiroxina en función del peso y del contexto clínico.',
    category: CAT_FARMACO,
    specialty: FARM,
    inputs: [
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 30, max: 200, step: 0.5 },
      {
        id: 'contexto',
        type: 'select',
        label: 'Contexto clínico',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Hipotiroidismo primario en paciente joven sano (1,6 µg/kg/día)', value: 1.6 },
          { label: 'Anciano o cardiopatía (0,3–0,5 µg/kg/día, comenzar bajo)', value: 0.4 },
          { label: 'Post-tiroidectomía por cáncer (2,0 µg/kg/día)', value: 2 },
          { label: 'Post-tiroidectomía benigna (1,7 µg/kg/día)', value: 1.7 },
          { label: 'Embarazo (2,0–2,4 µg/kg/día)', value: 2.2 },
        ],
        default: 1.6,
      },
    ],
    compute: (v) => {
      const dosis = v.peso! * (v.contexto ?? 1.6)
      const dosisRedondeada = Math.round(dosis / 12.5) * 12.5
      return {
        main: fmt(dosisRedondeada, 1),
        mainUnit: 'µg/día',
        secondary: fmt(dosis, 0),
        secondaryLabel: 'µg/día calculados sin redondear',
        interpretation:
          'Administrar en ayunas, 30–60 min antes del desayuno. Reevaluar TSH a las 6–8 semanas y ajustar la dosis en incrementos de 12,5–25 µg. En ancianos y cardiópatas, iniciar con 12,5–25 µg/día e ir subiendo.',
        level: 'info',
        details: ['Presentaciones habituales: 25, 50, 75, 88, 100, 112, 125, 137, 150, 175, 200 µg.'],
      }
    },
    references: [
      'Jonklaas J, et al. Guidelines for the Treatment of Hypothyroidism (American Thyroid Association). Thyroid. 2014;24(12):1670-751.',
    ],
  },
  {
    id: 'hidroxicloroquina',
    name: 'Dosis máxima segura de hidroxicloroquina',
    shortName: 'Hidroxicloroquina',
    description:
      'Calcula la dosis máxima diaria de hidroxicloroquina que minimiza el riesgo de retinopatía (guía AAO 2016).',
    category: CAT_FARMACO,
    specialty: FARM,
    inputs: [
      { id: 'peso', type: 'number', label: 'Peso corporal real', unit: 'kg', min: 30, max: 200, step: 0.5 },
    ],
    compute: (v) => {
      const dosis = 5 * v.peso!
      const dosisRedondeada = Math.min(Math.round(dosis / 100) * 100, 400)
      return {
        main: fmt(dosisRedondeada, 0),
        mainUnit: 'mg/día (máximo)',
        secondary: fmt(dosis, 0),
        secondaryLabel: 'mg/día calculados',
        interpretation:
          'Dosis diaria máxima: 5 mg/kg de peso real, sin superar 400 mg/día. Cribado oftalmológico basal y anual a partir del quinto año (antes si hay factores de riesgo).',
        level: 'info',
        details: [
          'La guía anterior (6,5 mg/kg de peso ideal) infraestimaba el riesgo en pacientes con sobrepeso.',
          'Factores de riesgo de retinopatía: dosis > 5 mg/kg/día, duración > 5 años, insuficiencia renal, uso concomitante de tamoxifeno, patología macular preexistente.',
        ],
      }
    },
    references: [
      'Marmor MF, et al. Recommendations on Screening for Chloroquine and Hydroxychloroquine Retinopathy. Ophthalmology. 2016;123(6):1386-94.',
    ],
  },
]
