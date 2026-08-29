import type { Calculator } from '../engine/types'
import { fmt } from '../engine/types'

const CAT = 'Renal, iones y equilibrio ácido-base'
const UCI = ['Medicina Intensiva']

export const renalMetabolico: Calculator[] = [
  {
    id: 'gasometria',
    name: 'Analizador de gasometría arterial',
    shortName: 'Gasometría',
    description:
      'Interpreta el trastorno ácido-base primario, la compensación esperada y el anión gap.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'ph', type: 'number', label: 'pH', min: 6.5, max: 8, step: 0.01 },
      { id: 'paco2', type: 'number', label: 'PaCO₂', unit: 'mmHg', min: 5, max: 150, step: 0.1 },
      { id: 'hco3', type: 'number', label: 'Bicarbonato (HCO₃⁻)', unit: 'mEq/L', min: 1, max: 60, step: 0.1 },
      { id: 'na', type: 'number', label: 'Sodio', unit: 'mEq/L', min: 90, max: 200, step: 0.1 },
      { id: 'cl', type: 'number', label: 'Cloro', unit: 'mEq/L', min: 50, max: 160, step: 0.1 },
      { id: 'albumina', type: 'number', label: 'Albúmina', unit: 'g/dL', min: 0.5, max: 7, step: 0.1 },
    ],
    compute: (v) => {
      const ph = v.ph!
      const paco2 = v.paco2!
      const hco3 = v.hco3!
      const ag = v.na! - v.cl! - hco3
      const agCorr = ag + 2.5 * (4 - v.albumina!)
      const detalles: string[] = []

      let primario: string
      let level: 'ok' | 'info' | 'warn' | 'danger' = 'warn'
      const acidemia = ph < 7.35
      const alcalemia = ph > 7.45

      if (!acidemia && !alcalemia) {
        primario =
          Math.abs(paco2 - 40) > 8 || Math.abs(hco3 - 24) > 4
            ? 'pH normal con alteraciones de PaCO₂ o bicarbonato: sugiere un trastorno mixto o completamente compensado'
            : 'Equilibrio ácido-base normal'
        level = Math.abs(paco2 - 40) > 8 || Math.abs(hco3 - 24) > 4 ? 'warn' : 'ok'
      } else if (acidemia) {
        if (hco3 < 22) {
          primario = 'Acidosis metabólica'
          const esperado = 1.5 * hco3 + 8
          detalles.push(
            `Compensación esperada (Winter): PaCO₂ = ${fmt(esperado - 2, 0)}–${fmt(esperado + 2, 0)} mmHg. Medida: ${fmt(paco2, 0)}.`,
          )
          if (paco2 > esperado + 2) detalles.push('PaCO₂ mayor de lo esperado: acidosis respiratoria añadida.')
          else if (paco2 < esperado - 2) detalles.push('PaCO₂ menor de lo esperado: alcalosis respiratoria añadida.')
          else detalles.push('Compensación respiratoria adecuada.')
        } else {
          primario = 'Acidosis respiratoria'
          const agudo = 24 + (paco2 - 40) / 10
          const cronico = 24 + (3.5 * (paco2 - 40)) / 10
          detalles.push(
            `Bicarbonato esperado: ${fmt(agudo, 1)} mEq/L si es aguda y ${fmt(cronico, 1)} si es crónica. Medido: ${fmt(hco3, 1)}.`,
          )
        }
        level = ph < 7.2 ? 'danger' : 'warn'
      } else {
        if (hco3 > 26) {
          primario = 'Alcalosis metabólica'
          const esperado = 40 + 0.7 * (hco3 - 24)
          detalles.push(`PaCO₂ esperada: ≈ ${fmt(esperado, 0)} mmHg. Medida: ${fmt(paco2, 0)}.`)
        } else {
          primario = 'Alcalosis respiratoria'
          const agudo = 24 - (2 * (40 - paco2)) / 10
          const cronico = 24 - (5 * (40 - paco2)) / 10
          detalles.push(
            `Bicarbonato esperado: ${fmt(agudo, 1)} mEq/L si es aguda y ${fmt(cronico, 1)} si es crónica. Medido: ${fmt(hco3, 1)}.`,
          )
        }
        level = ph > 7.6 ? 'danger' : 'warn'
      }

      detalles.push(`Anión gap: ${fmt(ag, 1)} mEq/L · corregido por albúmina: ${fmt(agCorr, 1)} mEq/L (normal 8–12).`)
      if (agCorr > 12) {
        detalles.push(
          'Anión gap elevado: valorar cetoacidosis, acidosis láctica, insuficiencia renal o tóxicos (metanol, etilenglicol, salicilatos).',
        )
        if (hco3 < 22) {
          const delta = (agCorr - 12) / (24 - hco3)
          detalles.push(
            `Cociente delta-delta: ${fmt(delta, 2)} — ${
              delta < 0.4
                ? 'sugiere acidosis metabólica hiperclorémica pura'
                : delta < 1
                  ? 'sugiere acidosis con anión gap elevado y acidosis hiperclorémica asociadas'
                  : delta <= 2
                    ? 'acidosis con anión gap elevado aislada'
                    : 'sugiere alcalosis metabólica concomitante o acidosis respiratoria crónica previa'
            }.`,
          )
        }
      } else if (hco3 < 22 && ph < 7.35) {
        detalles.push('Anión gap normal: valorar pérdidas digestivas de bicarbonato, acidosis tubular renal o exceso de suero salino.')
      }

      return {
        main: primario,
        secondary: fmt(ph, 2),
        secondaryLabel: 'pH',
        interpretation:
          'Interpretación automática orientativa: confirmar siempre con la situación clínica, el lactato y el resto de la analítica.',
        level,
        details: detalles,
      }
    },
    notes: [
      'El anión gap debe corregirse por la albúmina: por cada 1 g/dL de descenso, sumar 2,5 mEq/L.',
      'La fórmula de Winter estima la compensación respiratoria en la acidosis metabólica.',
    ],
  },
  {
    id: 'mdrd',
    name: 'Filtrado glomerular estimado (MDRD)',
    shortName: 'MDRD',
    description: 'Estima el filtrado glomerular en la enfermedad renal crónica.',
    category: CAT,
    specialty: UCI,
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
      const fge =
        175 *
        Math.pow(v.creatinina!, -1.154) *
        Math.pow(v.edad!, -0.203) *
        (v.sexo === 1 ? 0.742 : 1)
      const estadio =
        fge >= 90 ? 'G1' : fge >= 60 ? 'G2' : fge >= 45 ? 'G3a' : fge >= 30 ? 'G3b' : fge >= 15 ? 'G4' : 'G5'
      return {
        main: fmt(fge, 1),
        mainUnit: 'mL/min/1,73 m²',
        secondary: estadio,
        secondaryLabel: 'estadio KDIGO',
        interpretation:
          fge >= 60
            ? 'Filtrado conservado o levemente reducido. El estadio G1–G2 solo indica enfermedad renal crónica si hay además daño renal (albuminuria, alteraciones estructurales).'
            : fge >= 30
              ? 'Reducción moderada del filtrado: ajustar fármacos, evitar nefrotóxicos y controlar las complicaciones.'
              : fge >= 15
                ? 'Reducción grave: preparar el tratamiento sustitutivo y seguimiento por nefrología.'
                : 'Fallo renal: valorar terapia renal sustitutiva.',
        level: fge >= 60 ? 'ok' : fge >= 30 ? 'warn' : 'danger',
        details: ['Ecuación MDRD-4 IDMS. Las guías actuales prefieren CKD-EPI, más precisa con filtrados altos.'],
      }
    },
    notes: [
      'No es válida en la insuficiencia renal aguda, en el embarazo ni en situaciones de masa muscular extrema.',
      'Se ha eliminado el coeficiente por raza de las ecuaciones actuales.',
    ],
    references: [
      'Levey AS, et al. A more accurate method to estimate glomerular filtration rate from serum creatinine. Ann Intern Med. 1999;130(6):461-70.',
    ],
  },
  {
    id: 'fena',
    name: 'Excreción fraccionada de sodio (FENa)',
    shortName: 'FENa',
    description: 'Diferencia la insuficiencia renal prerrenal de la lesión renal intrínseca.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'naOrina', type: 'number', label: 'Sodio en orina', unit: 'mEq/L', min: 0.1, max: 300, step: 0.1 },
      { id: 'naPlasma', type: 'number', label: 'Sodio plasmático', unit: 'mEq/L', min: 90, max: 200, step: 0.1 },
      { id: 'crOrina', type: 'number', label: 'Creatinina en orina', unit: 'mg/dL', min: 1, max: 500, step: 0.1 },
      { id: 'crPlasma', type: 'number', label: 'Creatinina plasmática', unit: 'mg/dL', min: 0.1, max: 20, step: 0.01 },
    ],
    compute: (v) => {
      const fena = ((v.naOrina! * v.crPlasma!) / (v.naPlasma! * v.crOrina!)) * 100
      return {
        main: fmt(fena, 2),
        mainUnit: '%',
        interpretation:
          fena < 1
            ? 'FENa < 1 %: sugiere causa prerrenal (hipovolemia, bajo gasto, síndrome hepatorrenal). También puede verse en la glomerulonefritis aguda, la nefropatía por contraste y la obstrucción precoz.'
            : fena > 2
              ? 'FENa > 2 %: sugiere lesión renal intrínseca, típicamente necrosis tubular aguda.'
              : 'FENa entre 1 y 2 %: zona indeterminada; interpretar con la clínica y la respuesta a fluidos.',
        level: fena < 1 ? 'info' : fena > 2 ? 'warn' : 'warn',
        details: ['FENa = (Na orina × creatinina plasma) / (Na plasma × creatinina orina) × 100.'],
      }
    },
    notes: ['No es interpretable si el paciente ha recibido diuréticos: en ese caso usar la excreción fraccionada de urea.'],
  },
  {
    id: 'feurea',
    name: 'Excreción fraccionada de urea (FEUrea)',
    shortName: 'FEUrea',
    description:
      'Diferencia la azotemia prerrenal de la necrosis tubular aguda; utilizable en pacientes que reciben diuréticos.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'ureaOrina', type: 'number', label: 'Urea en orina', unit: 'mg/dL', min: 1, max: 5000, step: 1 },
      { id: 'ureaPlasma', type: 'number', label: 'Urea plasmática', unit: 'mg/dL', min: 1, max: 500, step: 0.1 },
      { id: 'crOrina', type: 'number', label: 'Creatinina en orina', unit: 'mg/dL', min: 1, max: 500, step: 0.1 },
      { id: 'crPlasma', type: 'number', label: 'Creatinina plasmática', unit: 'mg/dL', min: 0.1, max: 20, step: 0.01 },
    ],
    compute: (v) => {
      const fe = ((v.ureaOrina! * v.crPlasma!) / (v.ureaPlasma! * v.crOrina!)) * 100
      return {
        main: fmt(fe, 1),
        mainUnit: '%',
        interpretation:
          fe < 35
            ? 'FEUrea < 35 %: sugiere azotemia prerrenal.'
            : fe > 50
              ? 'FEUrea > 50 %: sugiere necrosis tubular aguda.'
              : 'Zona intermedia (35–50 %): interpretar junto con la clínica y la respuesta al tratamiento.',
        level: fe < 35 ? 'info' : fe > 50 ? 'warn' : 'warn',
        details: ['FEUrea = (urea orina × creatinina plasma) / (urea plasma × creatinina orina) × 100.'],
      }
    },
    notes: ['Si el laboratorio informa BUN en lugar de urea, puede usarse indistintamente siempre que ambas cifras estén en la misma unidad.'],
  },
  {
    id: 'akin',
    name: 'Clasificación AKIN de la lesión renal aguda',
    shortName: 'AKIN',
    description: 'Gradúa la gravedad de la lesión renal aguda.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'creatinina',
        type: 'select',
        label: 'Criterio de creatinina (en 48 h)',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Sin aumento significativo', value: 0 },
          { label: 'Aumento ≥ 0,3 mg/dL o de 1,5–2 veces el valor basal', value: 1 },
          { label: 'Aumento de más de 2 a 3 veces el valor basal', value: 2 },
          { label: 'Aumento de más de 3 veces, o creatinina ≥ 4 mg/dL con ascenso agudo ≥ 0,5, o necesidad de diálisis', value: 3 },
        ],
      },
      {
        id: 'diuresis',
        type: 'select',
        label: 'Criterio de diuresis',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'Diuresis conservada', value: 0 },
          { label: '< 0,5 mL/kg/h durante más de 6 h', value: 1 },
          { label: '< 0,5 mL/kg/h durante más de 12 h', value: 2 },
          { label: '< 0,3 mL/kg/h durante 24 h, o anuria durante 12 h', value: 3 },
        ],
      },
    ],
    compute: (v) => {
      const estadio = Math.max(v.creatinina ?? 0, v.diuresis ?? 0)
      if (estadio === 0)
        return {
          main: 'Sin lesión renal aguda',
          interpretation: 'No se cumplen criterios AKIN en este momento. Reevaluar si cambia la situación clínica.',
          level: 'ok',
        }
      return {
        main: `Estadio ${estadio}`,
        interpretation:
          estadio === 1
            ? 'Lesión renal aguda estadio 1: revisar la volemia, retirar nefrotóxicos, ajustar fármacos y monitorizar diuresis y creatinina.'
            : estadio === 2
              ? 'Estadio 2: además de lo anterior, valoración por nefrología y vigilancia de complicaciones.'
              : 'Estadio 3: valorar terapia renal sustitutiva, especialmente ante hiperpotasemia refractaria, acidosis grave, sobrecarga de volumen o uremia sintomática.',
        level: estadio === 1 ? 'warn' : 'danger',
        details: ['Se asigna el estadio más alto de los dos criterios (creatinina o diuresis).'],
      }
    },
    notes: ['Los criterios exigen que el diagnóstico se haga en las primeras 48 h y tras optimizar el estado de volemia.'],
    references: [
      'Mehta RL, et al. Acute Kidney Injury Network: report of an initiative to improve outcomes in acute kidney injury. Crit Care. 2007;11(2):R31.',
    ],
  },
  {
    id: 'bun-creatinina',
    name: 'Cociente BUN/creatinina',
    shortName: 'BUN/creatinina',
    description: 'Ayuda a orientar la causa de la insuficiencia renal y a detectar hemorragia digestiva alta.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'bun', type: 'number', label: 'BUN (nitrógeno ureico)', unit: 'mg/dL', min: 1, max: 250, step: 0.1 },
      { id: 'creatinina', type: 'number', label: 'Creatinina sérica', unit: 'mg/dL', min: 0.1, max: 20, step: 0.01 },
    ],
    compute: (v) => {
      const ratio = v.bun! / v.creatinina!
      return {
        main: fmt(ratio, 1),
        interpretation:
          ratio > 20
            ? 'Cociente > 20: sugiere causa prerrenal (hipovolemia, bajo gasto), hemorragia digestiva alta, dieta hiperproteica o corticoides.'
            : ratio < 10
              ? 'Cociente < 10: sugiere lesión renal intrínseca, malnutrición, hepatopatía o rabdomiólisis.'
              : 'Cociente en rango habitual (10–20).',
        level: ratio > 20 || ratio < 10 ? 'warn' : 'ok',
        details: ['Si el laboratorio informa urea en lugar de BUN: BUN = urea / 2,14.'],
      }
    },
  },
  {
    id: 'deficit-agua-libre',
    name: 'Déficit de agua libre en la hipernatremia',
    shortName: 'Déficit de agua libre',
    description: 'Calcula el agua libre necesaria para corregir la hipernatremia o la deshidratación.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'poblacion',
        type: 'select',
        label: 'Grupo de paciente (fracción de agua corporal)',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Varón adulto (0,6)', value: 0.6 },
          { label: 'Mujer adulta (0,5)', value: 0.5 },
          { label: 'Varón anciano (0,5)', value: 0.5001 },
          { label: 'Mujer anciana (0,45)', value: 0.45 },
          { label: 'Niño (0,6)', value: 0.6001 },
        ],
        default: 0.6,
      },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 3, max: 300, step: 0.5 },
      { id: 'naActual', type: 'number', label: 'Sodio actual', unit: 'mEq/L', min: 120, max: 200, step: 0.1 },
      { id: 'naObjetivo', type: 'number', label: 'Sodio objetivo', unit: 'mEq/L', min: 120, max: 160, step: 0.1 },
    ],
    compute: (v) => {
      const acT = (v.poblacion ?? 0.6) * v.peso!
      if (v.naActual! <= v.naObjetivo!)
        return {
          main: '—',
          interpretation: 'El sodio actual debe ser mayor que el objetivo para calcular un déficit de agua libre.',
          level: 'warn',
        }
      const deficit = acT * (v.naActual! / v.naObjetivo! - 1)
      const horas24 = (v.naActual! - v.naObjetivo!) / 0.5
      return {
        main: fmt(deficit * 1000, 0),
        mainUnit: 'mL de agua libre',
        secondary: fmt(acT, 1),
        secondaryLabel: 'agua corporal total (L)',
        interpretation:
          'Reponer de forma gradual, sin bajar el sodio más de 10–12 mEq/L al día (0,5 mEq/L por hora) para evitar el edema cerebral. Añadir a este déficit las pérdidas insensibles y las pérdidas en curso.',
        level: 'info',
        details: [
          `Tiempo mínimo de corrección recomendado: ${fmt(horas24, 0)} h a un ritmo de 0,5 mEq/L por hora.`,
          'Déficit = agua corporal total × (sodio actual / sodio objetivo − 1).',
        ],
      }
    },
    notes: ['En la hipernatremia de instauración aguda (< 48 h) puede corregirse más rápido; en la crónica, nunca más de 10 mEq/L al día.'],
  },
  {
    id: 'deficit-bicarbonato',
    name: 'Déficit de bicarbonato',
    shortName: 'Déficit de bicarbonato',
    description: 'Calcula el déficit corporal total de bicarbonato en la acidosis metabólica.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 3, max: 300, step: 0.5 },
      { id: 'actual', type: 'number', label: 'Bicarbonato actual', unit: 'mEq/L', min: 1, max: 40, step: 0.1 },
      { id: 'objetivo', type: 'number', label: 'Bicarbonato objetivo', unit: 'mEq/L', min: 5, max: 30, step: 0.1 },
      {
        id: 'distribucion',
        type: 'select',
        label: 'Volumen de distribución',
        noPoints: true,
        options: [
          { label: '0,4 × peso (habitual)', value: 0.4 },
          { label: '0,5 × peso (acidosis grave)', value: 0.5 },
          { label: '0,6 × peso (acidosis muy grave)', value: 0.6 },
        ],
        default: 0.4,
      },
    ],
    compute: (v) => {
      if (v.objetivo! <= v.actual!)
        return {
          main: '—',
          interpretation: 'El bicarbonato objetivo debe ser mayor que el actual.',
          level: 'warn',
        }
      const deficit = (v.distribucion ?? 0.4) * v.peso! * (v.objetivo! - v.actual!)
      return {
        main: fmt(deficit, 0),
        mainUnit: 'mEq de bicarbonato',
        secondary: fmt(deficit / 2, 0),
        secondaryLabel: 'mEq de la mitad de la dosis',
        interpretation:
          'Administrar como máximo la mitad del déficit calculado y reevaluar la gasometría: la corrección rápida puede provocar hipopotasemia, hipocalcemia, hipernatremia, sobrecarga de volumen, acidosis intracelular paradójica y desplazamiento de la curva de disociación de la hemoglobina.',
        level: 'warn',
        details: [
          'Déficit = volumen de distribución × peso × (bicarbonato objetivo − actual).',
          'El bicarbonato no está indicado de forma sistemática en la acidosis láctica ni en la cetoacidosis diabética; lo prioritario es tratar la causa.',
        ],
      }
    },
  },
  {
    id: 'kt-v',
    name: 'Kt/V para la adecuación de la hemodiálisis (Daugirdas)',
    shortName: 'Kt/V',
    description: 'Cuantifica la dosis de diálisis administrada en una sesión de hemodiálisis.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'preUrea', type: 'number', label: 'Urea (o BUN) antes de la sesión', unit: 'mg/dL', min: 5, max: 400, step: 0.1 },
      { id: 'postUrea', type: 'number', label: 'Urea (o BUN) después de la sesión', unit: 'mg/dL', min: 1, max: 400, step: 0.1 },
      { id: 'horas', type: 'number', label: 'Duración de la sesión', unit: 'h', min: 0.5, max: 12, step: 0.25 },
      { id: 'ufv', type: 'number', label: 'Volumen de ultrafiltración', unit: 'L', min: 0, max: 10, step: 0.1 },
      { id: 'peso', type: 'number', label: 'Peso posdiálisis', unit: 'kg', min: 20, max: 250, step: 0.1 },
    ],
    compute: (v) => {
      const r = v.postUrea! / v.preUrea!
      if (r >= 1)
        return {
          main: '—',
          interpretation: 'La urea posdiálisis debe ser menor que la predialítica.',
          level: 'warn',
        }
      const ktv =
        -Math.log(r - 0.008 * v.horas!) + (4 - 3.5 * r) * (v.ufv! / v.peso!)
      const urr = (1 - r) * 100
      return {
        main: fmt(ktv, 2),
        mainUnit: 'Kt/V',
        secondary: `${fmt(urr, 0)} %`,
        secondaryLabel: 'tasa de reducción de urea (URR)',
        interpretation:
          ktv >= 1.2
            ? 'Dosis de diálisis adecuada (Kt/V ≥ 1,2 por sesión en pauta de tres sesiones semanales; objetivo habitual ≥ 1,4).'
            : 'Dosis de diálisis insuficiente (< 1,2): revisar el tiempo de sesión, el flujo sanguíneo, el acceso vascular y el dializador.',
        level: ktv >= 1.2 ? 'ok' : 'danger',
        details: ['Fórmula de Daugirdas de segunda generación.', 'La URR objetivo equivalente es ≥ 65 %.'],
      }
    },
    references: [
      'Daugirdas JT. Second generation logarithmic estimates of single-pool variable volume Kt/V. J Am Soc Nephrol. 1993;4(5):1205-13.',
    ],
  },
]
