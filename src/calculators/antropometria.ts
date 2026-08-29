import type { Calculator } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Antropometría y metabolismo'
const CAT_ENDO = 'Endocrino y tóxicos'
const UCI = ['Medicina Intensiva']

export const antropometria: Calculator[] = [
  {
    id: 'imc-sc',
    name: 'Índice de masa corporal y superficie corporal',
    shortName: 'IMC / SC',
    description: 'Calcula el índice de masa corporal y la superficie corporal.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 1, max: 400, step: 0.1 },
      { id: 'talla', type: 'number', label: 'Talla', unit: 'cm', min: 30, max: 250, step: 0.5 },
    ],
    compute: (v) => {
      const hM = v.talla! / 100
      const imc = v.peso! / (hM * hM)
      const mosteller = Math.sqrt((v.talla! * v.peso!) / 3600)
      const dubois = 0.007184 * Math.pow(v.talla!, 0.725) * Math.pow(v.peso!, 0.425)
      const clas =
        imc < 16
          ? 'Delgadez grave'
          : imc < 17
            ? 'Delgadez moderada'
            : imc < 18.5
              ? 'Bajo peso'
              : imc < 25
                ? 'Normopeso'
                : imc < 30
                  ? 'Sobrepeso'
                  : imc < 35
                    ? 'Obesidad grado I'
                    : imc < 40
                      ? 'Obesidad grado II'
                      : 'Obesidad grado III (mórbida)'
      return {
        main: fmt(imc, 1),
        mainUnit: 'kg/m² (IMC)',
        secondary: fmt(mosteller, 2),
        secondaryLabel: 'superficie corporal (m², Mosteller)',
        interpretation: `${clas} según la clasificación de la Organización Mundial de la Salud.`,
        level: imc < 18.5 ? 'warn' : imc < 25 ? 'ok' : imc < 30 ? 'warn' : 'danger',
        details: [
          `Superficie corporal (Du Bois): ${fmt(dubois, 2)} m².`,
          'El IMC no distingue masa grasa de masa magra ni valora la distribución de la grasa.',
        ],
      }
    },
  },
  {
    id: 'peso-ideal',
    name: 'Peso corporal ideal, predicho y ajustado',
    shortName: 'Peso ideal',
    description:
      'Calcula el peso ideal (fórmula de Devine), el peso predicho para la ventilación y el peso ajustado para dosificar fármacos.',
    category: CAT,
    specialty: UCI,
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
      { id: 'talla', type: 'number', label: 'Talla', unit: 'cm', min: 100, max: 230, step: 0.5 },
      { id: 'peso', type: 'number', label: 'Peso real', unit: 'kg', min: 20, max: 400, step: 0.1 },
    ],
    compute: (v) => {
      const pulgadas = v.talla! / 2.54
      const sobre60 = Math.max(pulgadas - 60, 0)
      const ideal = v.sexo === 1 ? 45.5 + 2.3 * sobre60 : 50 + 2.3 * sobre60
      const predicho = v.sexo === 1 ? 45.5 + 2.3 * (pulgadas - 60) : 50 + 2.3 * (pulgadas - 60)
      const ajustado = ideal + 0.4 * (v.peso! - ideal)
      const exceso = (v.peso! / ideal) * 100
      return {
        main: fmt(ideal, 1),
        mainUnit: 'kg (peso ideal, Devine)',
        secondary: fmt(ajustado, 1),
        secondaryLabel: 'kg (peso ajustado)',
        interpretation:
          v.peso! > ideal * 1.3
            ? 'El peso real supera en más del 30 % al ideal: para muchos fármacos hidrófilos conviene dosificar por peso ideal o ajustado, no por peso real.'
            : 'El peso real está próximo al ideal.',
        level: 'info',
        details: [
          `Peso corporal predicho (para volumen corriente en ventilación): ${fmt(predicho, 1)} kg.`,
          `Peso real respecto al ideal: ${fmt(exceso, 0)} %.`,
          'Peso ajustado = peso ideal + 0,4 × (peso real − peso ideal).',
          'Volumen corriente protector (6 mL/kg de peso predicho): ' + fmt(predicho * 6, 0) + ' mL.',
        ],
      }
    },
    notes: [
      'La fórmula de Devine se diseñó para dosificar fármacos y solo es fiable a partir de 152 cm de talla.',
      'El peso predicho puede ser negativo o muy bajo en tallas muy pequeñas: en ese caso usar tablas pediátricas.',
    ],
  },
  {
    id: 'gasto-energetico',
    name: 'Gasto energético basal (Harris-Benedict)',
    shortName: 'Gasto energético',
    description: 'Calcula las necesidades energéticas diarias.',
    category: CAT,
    specialty: UCI,
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
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 20, max: 300, step: 0.1 },
      { id: 'talla', type: 'number', label: 'Talla', unit: 'cm', min: 100, max: 230, step: 0.5 },
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 15, max: 110 },
      {
        id: 'actividad',
        type: 'select',
        label: 'Factor de actividad o estrés',
        noPoints: true,
        dropdown: true,
        options: [
          { label: 'Reposo en cama (1,2)', value: 1.2 },
          { label: 'Actividad ligera (1,375)', value: 1.375 },
          { label: 'Actividad moderada (1,55)', value: 1.55 },
          { label: 'Actividad intensa (1,725)', value: 1.725 },
          { label: 'Cirugía menor (1,2)', value: 1.2001 },
          { label: 'Sepsis o traumatismo (1,3–1,5)', value: 1.4 },
          { label: 'Quemadura extensa (1,5–2,0)', value: 1.75 },
        ],
        default: 1.2,
      },
    ],
    compute: (v) => {
      const geb =
        v.sexo === 1
          ? 655.1 + 9.563 * v.peso! + 1.85 * v.talla! - 4.676 * v.edad!
          : 66.5 + 13.75 * v.peso! + 5.003 * v.talla! - 6.775 * v.edad!
      const total = geb * (v.actividad ?? 1.2)
      const porKg = total / v.peso!
      return {
        main: fmt(total, 0),
        mainUnit: 'kcal/día',
        secondary: fmt(geb, 0),
        secondaryLabel: 'kcal/día en reposo (basal)',
        interpretation:
          'Estimación orientativa. En el paciente crítico, las guías recomiendan 20–25 kcal/kg/día en la fase aguda y 25–30 kcal/kg/día en la fase de recuperación, con 1,2–2,0 g/kg/día de proteínas.',
        level: 'info',
        details: [
          `Equivale a ${fmt(porKg, 1)} kcal/kg/día.`,
          'La calorimetría indirecta sigue siendo el patrón de referencia; las fórmulas pueden errar de forma considerable en el paciente crítico.',
        ],
      }
    },
    references: [
      'Harris JA, Benedict FG. A Biometric Study of Human Basal Metabolism. Proc Natl Acad Sci USA. 1918;4(12):370-3.',
    ],
  },
  {
    id: 'ritmo-goteo',
    name: 'Velocidad de goteo intravenoso',
    shortName: 'Goteo intravenoso',
    description:
      'Calcula las gotas por minuto cuando no se dispone de bomba de infusión.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'volumen', type: 'number', label: 'Volumen a infundir', unit: 'mL', min: 1, max: 10000, step: 1 },
      { id: 'tiempo', type: 'number', label: 'Tiempo de infusión', unit: 'min', min: 1, max: 2880, step: 1 },
      {
        id: 'factor',
        type: 'select',
        label: 'Factor de goteo del equipo',
        noPoints: true,
        options: [
          { label: 'Macrogotero 10 gotas/mL', value: 10 },
          { label: 'Macrogotero 15 gotas/mL', value: 15 },
          { label: 'Macrogotero 20 gotas/mL', value: 20 },
          { label: 'Microgotero 60 gotas/mL', value: 60 },
        ],
        default: 20,
      },
    ],
    compute: (v) => {
      const gotasMin = (v.volumen! * (v.factor ?? 20)) / v.tiempo!
      const mlHora = (v.volumen! / v.tiempo!) * 60
      return {
        main: fmt(gotasMin, 0),
        mainUnit: 'gotas/min',
        secondary: fmt(mlHora, 1),
        secondaryLabel: 'mL/h equivalentes',
        interpretation:
          'Contar las gotas durante 15 segundos y multiplicar por 4 para comprobar el ritmo; revisar periódicamente, ya que la gravedad hace que el ritmo varíe con el tiempo.',
        level: 'info',
        details: [`Equivale a una gota cada ${fmt(60 / gotasMin, 1)} segundos.`],
      }
    },
  },
  {
    id: 'etanol-estimado',
    name: 'Concentración estimada de etanol y alcoholes tóxicos',
    shortName: 'Etanol estimado',
    description:
      'Estima la concentración sanguínea de alcohol a partir de la cantidad ingerida.',
    category: CAT_ENDO,
    specialty: UCI,
    inputs: [
      {
        id: 'sexo',
        type: 'select',
        label: 'Sexo (volumen de distribución)',
        noPoints: true,
        options: [
          { label: 'Varón (0,68 L/kg)', value: 0.68 },
          { label: 'Mujer (0,55 L/kg)', value: 0.55 },
        ],
      },
      { id: 'peso', type: 'number', label: 'Peso', unit: 'kg', min: 10, max: 250, step: 0.5 },
      { id: 'volumen', type: 'number', label: 'Volumen ingerido', unit: 'mL', min: 1, max: 5000, step: 1 },
      { id: 'concentracion', type: 'number', label: 'Graduación de la bebida', unit: '% vol', min: 0.5, max: 100, step: 0.5 },
      { id: 'horas', type: 'number', label: 'Horas transcurridas desde la ingesta', unit: 'h', min: 0, max: 48, step: 0.5 },
    ],
    compute: (v) => {
      const gramos = v.volumen! * (v.concentracion! / 100) * 0.789
      const vd = (v.sexo ?? 0.68) * v.peso!
      const pico = (gramos / vd) * 100
      const eliminado = 20 * v.horas!
      const actual = Math.max(pico - eliminado, 0)
      return {
        main: fmt(actual, 0),
        mainUnit: 'mg/dL estimados',
        secondary: fmt(pico, 0),
        secondaryLabel: 'mg/dL de pico teórico',
        interpretation:
          actual >= 300
            ? 'Concentración potencialmente grave (≥ 300 mg/dL): riesgo de depresión respiratoria y coma; vigilar vía aérea.'
            : actual >= 80
              ? 'Concentración en rango de intoxicación clínica evidente.'
              : actual > 0
                ? 'Concentración estimada baja.'
                : 'Alcohol teóricamente eliminado según la estimación.',
        level: actual >= 300 ? 'danger' : actual >= 80 ? 'warn' : 'ok',
        details: [
          `Alcohol ingerido: ${fmt(gramos, 1)} g (${fmt(gramos / 10, 1)} unidades de bebida estándar).`,
          'Se asume una eliminación de 20 mg/dL por hora (rango real 15–25; mayor en bebedores crónicos).',
          'Es una estimación teórica: no sustituye la determinación analítica ni la valoración clínica.',
        ],
      }
    },
    notes: [
      'La fórmula de Widmark asume absorción completa y no considera el vaciamiento gástrico ni la ingesta simultánea de comida.',
      'Ante sospecha de metanol o etilenglicol, calcular el hiato osmolar y contactar con toxicología: la ausencia de etanol no descarta otros alcoholes.',
    ],
  },
  {
    id: 'burch-wartofsky',
    name: 'Escala de Burch-Wartofsky para la crisis tirotóxica',
    shortName: 'Burch-Wartofsky',
    description: 'Estima la probabilidad de que una tirotoxicosis sea una crisis tiroidea.',
    category: CAT_ENDO,
    specialty: UCI,
    inputs: [
      {
        id: 'temperatura',
        type: 'select',
        label: 'Temperatura (°C)',
        dropdown: true,
        options: [
          { label: '< 37,2', value: 0 },
          { label: '37,2–37,7', value: 5 },
          { label: '37,8–38,2', value: 10 },
          { label: '38,3–38,8', value: 15 },
          { label: '38,9–39,4', value: 20 },
          { label: '39,4–39,9', value: 25 },
          { label: '≥ 40', value: 30 },
        ],
      },
      {
        id: 'snc',
        type: 'select',
        label: 'Efectos sobre el sistema nervioso central',
        dropdown: true,
        options: [
          { label: 'Ausentes', value: 0 },
          { label: 'Leves (agitación)', value: 10 },
          { label: 'Moderados (delirio, psicosis, letargia extrema)', value: 20 },
          { label: 'Graves (convulsiones, coma)', value: 30 },
        ],
      },
      {
        id: 'digestivo',
        type: 'select',
        label: 'Disfunción digestiva o hepática',
        dropdown: true,
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Moderada (diarrea, náuseas, vómitos, dolor abdominal)', value: 10 },
          { label: 'Grave (ictericia inexplicada)', value: 20 },
        ],
      },
      {
        id: 'fc',
        type: 'select',
        label: 'Frecuencia cardíaca (lpm)',
        dropdown: true,
        options: [
          { label: '< 90', value: 0 },
          { label: '90–109', value: 5 },
          { label: '110–119', value: 10 },
          { label: '120–129', value: 15 },
          { label: '130–139', value: 20 },
          { label: '≥ 140', value: 25 },
        ],
      },
      {
        id: 'icc',
        type: 'select',
        label: 'Insuficiencia cardíaca congestiva',
        dropdown: true,
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Leve (edema maleolar)', value: 5 },
          { label: 'Moderada (crepitantes bibasales)', value: 10 },
          { label: 'Grave (edema agudo de pulmón)', value: 15 },
        ],
      },
      {
        id: 'fa',
        type: 'select',
        label: 'Fibrilación auricular',
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Presente', value: 10 },
        ],
      },
      {
        id: 'desencadenante',
        type: 'select',
        label: 'Antecedente desencadenante',
        description: 'Infección, cirugía, contraste yodado, parto, suspensión de antitiroideos.',
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Presente', value: 10 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['temperatura', 'snc', 'digestivo', 'fc', 'icc', 'fa', 'desencadenante'])
      return {
        main: String(score),
        mainUnit: 'puntos',
        interpretation:
          score >= 45
            ? 'Puntuación ≥ 45: altamente sugestiva de crisis tirotóxica. Tratamiento urgente en cuidados intensivos: betabloqueantes, tionamidas, yodo (al menos 1 hora después de la tionamida), corticoides y tratamiento del desencadenante.'
            : score >= 25
              ? 'Puntuación 25–44: crisis tirotóxica inminente o probable; iniciar tratamiento y vigilancia estrecha.'
              : 'Puntuación < 25: crisis tirotóxica poco probable.',
        level: score >= 45 ? 'danger' : score >= 25 ? 'warn' : 'ok',
      }
    },
    notes: ['La crisis tirotóxica es un diagnóstico clínico: esta escala apoya la decisión, pero no debe retrasar el tratamiento ante una sospecha alta.'],
    references: [
      'Burch HB, Wartofsky L. Life-threatening thyrotoxicosis: thyroid storm. Endocrinol Metab Clin North Am. 1993;22(2):263-77.',
    ],
  },
  {
    id: 'coma-mixedematoso',
    name: 'Puntuación diagnóstica del coma mixedematoso',
    shortName: 'Coma mixedematoso',
    description: 'Apoya el diagnóstico del coma mixedematoso (hipotiroidismo descompensado).',
    category: CAT_ENDO,
    specialty: UCI,
    inputs: [
      {
        id: 'temperatura',
        type: 'select',
        label: 'Temperatura (°C)',
        dropdown: true,
        options: [
          { label: '> 35', value: 0 },
          { label: '32–35', value: 10 },
          { label: '< 32', value: 20 },
        ],
      },
      {
        id: 'snc',
        type: 'select',
        label: 'Efectos sobre el sistema nervioso central',
        dropdown: true,
        options: [
          { label: 'Ausentes', value: 0 },
          { label: 'Somnolencia o letargia', value: 10 },
          { label: 'Obnubilación', value: 15 },
          { label: 'Estupor', value: 20 },
          { label: 'Coma o convulsiones', value: 30 },
        ],
      },
      {
        id: 'digestivo',
        type: 'select',
        label: 'Síntomas digestivos',
        dropdown: true,
        options: [
          { label: 'Ausentes', value: 0 },
          { label: 'Anorexia, dolor abdominal o estreñimiento', value: 5 },
          { label: 'Disminución del peristaltismo', value: 15 },
          { label: 'Íleo paralítico o megacolon', value: 20 },
        ],
      },
      {
        id: 'precipitante',
        type: 'select',
        label: 'Factor precipitante',
        options: [
          { label: 'Ausente', value: 0 },
          { label: 'Presente', value: 10 },
        ],
      },
      {
        id: 'cardiaco',
        type: 'select',
        label: 'Alteraciones cardíacas',
        dropdown: true,
        options: [
          { label: 'Ausentes', value: 0 },
          { label: 'Bradicardia 50–59 lpm', value: 10 },
          { label: 'Bradicardia 40–49 lpm', value: 20 },
          { label: 'Bradicardia < 40 lpm, cambios en el ECG, derrame pericárdico o edema pulmonar', value: 30 },
        ],
      },
      {
        id: 'metabolico',
        type: 'select',
        label: 'Alteraciones metabólicas',
        description: 'Hiponatremia, hipoglucemia, hipoxemia, hipercapnia o descenso del filtrado glomerular.',
        dropdown: true,
        options: [
          { label: 'Ninguna', value: 0 },
          { label: 'Una', value: 10 },
          { label: 'Dos', value: 15 },
          { label: 'Tres o más', value: 20 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['temperatura', 'snc', 'digestivo', 'precipitante', 'cardiaco', 'metabolico'])
      return {
        main: String(score),
        mainUnit: 'puntos',
        interpretation:
          score >= 60
            ? 'Puntuación ≥ 60: altamente sugestiva de coma mixedematoso. Tratamiento urgente con levotiroxina intravenosa, hidrocortisona (antes que la hormona tiroidea, hasta descartar insuficiencia suprarrenal), recalentamiento pasivo y soporte en cuidados intensivos.'
            : score >= 45
              ? 'Puntuación 45–59: sugestiva; iniciar tratamiento y confirmar con la función tiroidea.'
              : 'Puntuación < 45: coma mixedematoso poco probable.',
        level: score >= 60 ? 'danger' : score >= 45 ? 'warn' : 'ok',
      }
    },
    notes: ['Administrar siempre corticoides antes que la levotiroxina: la hormona tiroidea puede precipitar una crisis suprarrenal.'],
    references: [
      'Popoveniuc G, et al. A diagnostic scoring system for myxedema coma. Endocr Pract. 2014;20(8):808-17.',
    ],
  },
  {
    id: 'katz',
    name: 'Índice de Katz de independencia en las actividades básicas',
    shortName: 'Katz',
    description: 'Evalúa el estado funcional basal en las actividades básicas de la vida diaria.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'bano', type: 'boolean', label: 'Baño — independiente', labels: ['Dependiente', 'Independiente'] },
      { id: 'vestido', type: 'boolean', label: 'Vestido — independiente', labels: ['Dependiente', 'Independiente'] },
      { id: 'aseo', type: 'boolean', label: 'Uso del retrete — independiente', labels: ['Dependiente', 'Independiente'] },
      { id: 'movilidad', type: 'boolean', label: 'Movilidad / transferencias — independiente', labels: ['Dependiente', 'Independiente'] },
      { id: 'continencia', type: 'boolean', label: 'Continencia — continente', labels: ['Incontinente', 'Continente'] },
      { id: 'alimentacion', type: 'boolean', label: 'Alimentación — independiente', labels: ['Dependiente', 'Independiente'] },
    ],
    compute: (v) => {
      const score = sum(v, ['bano', 'vestido', 'aseo', 'movilidad', 'continencia', 'alimentacion'])
      return {
        main: String(score),
        mainUnit: 'de 6 actividades',
        interpretation:
          score === 6
            ? 'Independiente para todas las actividades básicas.'
            : score >= 4
              ? 'Dependencia leve-moderada: valorar apoyos y rehabilitación.'
              : 'Dependencia grave: planificar cuidados y apoyo sociosanitario; es un dato pronóstico relevante en el paciente crítico y en la toma de decisiones sobre la intensidad terapéutica.',
        level: score === 6 ? 'ok' : score >= 4 ? 'warn' : 'danger',
      }
    },
    references: [
      'Katz S, et al. Studies of illness in the aged. The index of ADL. JAMA. 1963;185:914-9.',
    ],
  },
]
