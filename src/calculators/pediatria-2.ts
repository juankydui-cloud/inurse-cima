import type { Calculator, Option } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Neonatología y pediatría'
const CAT_GO = 'Obstetricia y ginecología'
const PED = ['Pediatría']
const OBS = ['Obstetricia']

const escala = (items: [number, string][]): Option[] =>
  items.map(([value, label]) => ({ label: `${value} — ${label}`, value }))

export const pediatria2: Calculator[] = [
  {
    id: 'pecarn-head',
    name: 'PECARN para traumatismo craneoencefálico pediátrico',
    shortName: 'PECARN cabeza',
    description:
      'Regla de decisión para identificar niños con TCE leve que no necesitan tomografía craneal.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad del paciente',
        noPoints: true,
        options: [
          { label: '< 2 años', value: 0 },
          { label: '≥ 2 años', value: 1 },
        ],
      },
      { id: 'gcs', type: 'boolean', label: 'GCS ≤ 14 o alteración del estado mental (agitación, somnolencia, respuestas lentas, preguntas repetidas)', noPoints: true },
      { id: 'palpableInfant', type: 'boolean', label: '< 2 años: fractura craneal palpable', noPoints: true },
      { id: 'baseCraneo', type: 'boolean', label: '≥ 2 años: signos de fractura de base de cráneo (hemotímpano, ojos de mapache, otorrea o rinorrea de LCR, signo de Battle)', noPoints: true },
      { id: 'hematomaCuero', type: 'boolean', label: '< 2 años: hematoma en cuero cabelludo no frontal', noPoints: true },
      { id: 'perdidaConciencia', type: 'boolean', label: '< 2 años: pérdida de conciencia ≥ 5 s   |   ≥ 2 años: pérdida de conciencia', noPoints: true },
      { id: 'comportamiento', type: 'boolean', label: '< 2 años: cambio de comportamiento según los padres', noPoints: true },
      { id: 'mecanismo', type: 'boolean', label: 'Mecanismo grave de lesión (accidente vehículo, muerte de otro pasajero, atropello, caída > 0,9 m si < 2 años o > 1,5 m si ≥ 2 años, impacto por objeto de alta energía)', noPoints: true },
      { id: 'vomitos', type: 'boolean', label: '≥ 2 años: vómitos', noPoints: true },
      { id: 'cefalea', type: 'boolean', label: '≥ 2 años: cefalea intensa', noPoints: true },
    ],
    compute: (v) => {
      const menor2 = v.edad === 0
      const factorAlto = v.gcs === 1 || (menor2 ? v.palpableInfant === 1 : v.baseCraneo === 1)
      const factorIntermedio = menor2
        ? v.hematomaCuero === 1 || v.perdidaConciencia === 1 || v.comportamiento === 1 || v.mecanismo === 1
        : v.perdidaConciencia === 1 || v.vomitos === 1 || v.cefalea === 1 || v.mecanismo === 1
      if (factorAlto)
        return {
          main: 'TC craneal recomendada',
          interpretation: 'Factor de alto riesgo: riesgo de lesión cerebral traumática clínicamente significativa ≈ 4,4 % en < 2 años y 4,3 % en ≥ 2 años. Se recomienda tomografía craneal.',
          level: 'danger',
        }
      if (factorIntermedio)
        return {
          main: 'Observación o TC',
          interpretation: 'Factores intermedios: riesgo ≈ 0,9 % en < 2 años y 0,8 % en ≥ 2 años. Decisión compartida con la familia: observación 4–6 h en centro con TC disponible o tomografía. Factores que inclinan hacia TC: síntomas o hallazgos empeoran, mecanismo grave, edad < 3 meses, preferencia parental.',
          level: 'warn',
        }
      return {
        main: 'TC no necesaria',
        interpretation: 'Sin factores de riesgo: riesgo de lesión cerebral traumática clínicamente significativa < 0,05 %. Puede evitarse la tomografía y dar alta con recomendaciones de observación domiciliaria.',
        level: 'ok',
      }
    },
    notes: [
      'Aplicable a niños con GCS 14–15 en las primeras 24 h tras un traumatismo craneal cerrado no penetrante.',
      'Regla más validada en pediatría; sensibilidad prácticamente del 100 % para lesión que requiere neurocirugía.',
    ],
    references: [
      'Kuppermann N, et al. Identification of children at very low risk of clinically-important brain injuries after head trauma: a prospective cohort study. Lancet. 2009;374(9696):1160-70.',
    ],
  },
  {
    id: 'catch',
    name: 'Regla CATCH — traumatismo craneal pediátrico',
    shortName: 'CATCH',
    description: 'Regla canadiense de decisión para tomografía tras traumatismo craneal en niños.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'gcs', type: 'boolean', label: 'GCS < 15 a las 2 horas del traumatismo', noPoints: true },
      { id: 'fracturaAbierta', type: 'boolean', label: 'Sospecha de fractura craneal abierta o deprimida', noPoints: true },
      { id: 'cefalea', type: 'boolean', label: 'Historia de cefalea que empeora', noPoints: true },
      { id: 'irritabilidad', type: 'boolean', label: 'Irritabilidad al examen', noPoints: true },
      { id: 'baseCraneo', type: 'boolean', label: 'Signos de fractura de base de cráneo', noPoints: true },
      { id: 'hematoma', type: 'boolean', label: 'Hematoma extenso, blando y con crepitación en el cuero cabelludo', noPoints: true },
      { id: 'mecanismo', type: 'boolean', label: 'Mecanismo peligroso (accidente vehículo, caída > 0,9 m o de 5 escalones, caída desde bicicleta sin casco)', noPoints: true },
    ],
    compute: (v) => {
      const alto = v.gcs === 1 || v.fracturaAbierta === 1 || v.cefalea === 1 || v.irritabilidad === 1
      const medio = !alto && (v.baseCraneo === 1 || v.hematoma === 1 || v.mecanismo === 1)
      return {
        main: alto ? 'TC obligada' : medio ? 'TC recomendada' : 'TC no necesaria',
        interpretation: alto
          ? 'Factor de riesgo alto: tomografía obligada por riesgo de necesidad de intervención neuroquirúrgica.'
          : medio
            ? 'Factor de riesgo medio: tomografía recomendada por riesgo de lesión cerebral en la imagen.'
            : 'Sin factores de riesgo: puede evitarse la tomografía.',
        level: alto ? 'danger' : medio ? 'warn' : 'ok',
      }
    },
    notes: ['Aplicable a niños de 0–16 años con GCS 13–15 tras un traumatismo craneal menor con pérdida de conciencia testificada, amnesia o vómitos.'],
    references: [
      'Osmond MH, et al. CATCH: a clinical decision rule for the use of computed tomography in children with minor head injury. CMAJ. 2010;182(4):341-8.',
    ],
  },
  {
    id: 'chalice',
    name: 'Regla CHALICE — traumatismo craneal pediátrico',
    shortName: 'CHALICE',
    description:
      'Regla británica de decisión para tomografía tras traumatismo craneal en niños < 16 años.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'perdida', type: 'boolean', label: 'Pérdida de conciencia > 5 minutos', noPoints: true },
      { id: 'amnesia', type: 'boolean', label: 'Amnesia > 5 minutos', noPoints: true },
      { id: 'somnolencia', type: 'boolean', label: 'Somnolencia anormal', noPoints: true },
      { id: 'vomitos', type: 'boolean', label: '≥ 3 vómitos tras el traumatismo', noPoints: true },
      { id: 'sospechaMaltrato', type: 'boolean', label: 'Sospecha de maltrato no accidental', noPoints: true },
      { id: 'convulsion', type: 'boolean', label: 'Convulsión postraumática (sin epilepsia previa)', noPoints: true },
      { id: 'gcs', type: 'boolean', label: 'GCS < 14 (o < 15 si < 1 año)', noPoints: true },
      { id: 'fractura', type: 'boolean', label: 'Sospecha de fractura craneal penetrante o deprimida, o fontanela abombada tensa', noPoints: true },
      { id: 'baseCraneo', type: 'boolean', label: 'Signos de fractura de base de cráneo', noPoints: true },
      { id: 'focal', type: 'boolean', label: 'Déficit neurológico focal', noPoints: true },
      { id: 'hematomaInfant', type: 'boolean', label: '< 1 año: hematoma, tumefacción o laceración > 5 cm en cuero cabelludo', noPoints: true },
      { id: 'mecanismo', type: 'boolean', label: 'Mecanismo peligroso (accidente vehículo alta velocidad, caída > 3 m, impacto por objeto de alta velocidad)', noPoints: true },
    ],
    compute: (v) => {
      const positivo = ['perdida', 'amnesia', 'somnolencia', 'vomitos', 'sospechaMaltrato', 'convulsion', 'gcs', 'fractura', 'baseCraneo', 'focal', 'hematomaInfant', 'mecanismo'].some((k) => v[k] === 1)
      return {
        main: positivo ? 'TC indicada' : 'TC no necesaria',
        interpretation: positivo
          ? 'Al menos un criterio positivo: se recomienda tomografía craneal.'
          : 'Ningún criterio positivo: puede evitarse la tomografía (sensibilidad ≈ 98 % para lesión cerebral clínicamente significativa).',
        level: positivo ? 'danger' : 'ok',
      }
    },
    references: [
      'Dunning J, et al. Derivation of the children\'s head injury algorithm for the prediction of important clinical events decision rule for head injury in children. Arch Dis Child. 2006;91(11):885-91.',
    ],
  },
  {
    id: 'pas-samuel',
    name: 'Puntuación de apendicitis pediátrica de Samuel (PAS)',
    shortName: 'PAS',
    description: 'Estima la probabilidad de apendicitis aguda en niños con dolor abdominal.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'tos', type: 'boolean', label: 'Dolor con tos, salto o percusión', points: 2 },
      { id: 'anorexia', type: 'boolean', label: 'Anorexia' },
      { id: 'fiebre', type: 'boolean', label: 'Fiebre > 38 °C' },
      { id: 'nauseas', type: 'boolean', label: 'Náuseas o vómitos' },
      { id: 'fid', type: 'boolean', label: 'Dolor a la palpación en fosa ilíaca derecha', points: 2 },
      { id: 'leucocitosis', type: 'boolean', label: 'Leucocitos > 10.000/mm³' },
      { id: 'neutrofilia', type: 'boolean', label: 'Neutrófilos > 7.500/mm³' },
      { id: 'migracion', type: 'boolean', label: 'Migración del dolor a fosa ilíaca derecha' },
    ],
    compute: (v) => {
      const score = sum(v, ['tos', 'anorexia', 'fiebre', 'nauseas', 'fid', 'leucocitosis', 'neutrofilia', 'migracion'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        interpretation:
          score <= 3
            ? 'Baja probabilidad de apendicitis: valorar alta con reevaluación.'
            : score <= 6
              ? 'Probabilidad intermedia: observación y prueba de imagen (ecografía).'
              : 'Alta probabilidad de apendicitis: valoración quirúrgica.',
        level: score <= 3 ? 'ok' : score <= 6 ? 'warn' : 'danger',
      }
    },
    references: [
      'Samuel M. Pediatric appendicitis score. J Pediatr Surg. 2002;37(6):877-81.',
    ],
  },
  {
    id: 'pgcs',
    name: 'Escala de coma de Glasgow pediátrica',
    shortName: 'GCS pediátrica',
    description: 'Valora el nivel de conciencia en pacientes pediátricos preverbales o verbales.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'ocular',
        type: 'select',
        label: 'Respuesta ocular',
        dropdown: true,
        options: escala([
          [4, 'Espontánea'],
          [3, 'A la voz'],
          [2, 'Al dolor'],
          [1, 'Ninguna'],
        ]),
        default: 4,
      },
      {
        id: 'verbal',
        type: 'select',
        label: 'Respuesta verbal',
        dropdown: true,
        options: escala([
          [5, 'Sonríe/balbucea (< 2 a) o orientado (≥ 2 a)'],
          [4, 'Llanto consolable (< 2 a) o confuso (≥ 2 a)'],
          [3, 'Llanto inconsolable (< 2 a) o palabras inapropiadas (≥ 2 a)'],
          [2, 'Gemidos (< 2 a) o sonidos incomprensibles (≥ 2 a)'],
          [1, 'Ninguna'],
        ]),
        default: 5,
      },
      {
        id: 'motora',
        type: 'select',
        label: 'Respuesta motora',
        dropdown: true,
        options: escala([
          [6, 'Movimientos espontáneos con propósito'],
          [5, 'Localiza el dolor'],
          [4, 'Retirada al dolor'],
          [3, 'Flexión anormal (decorticación)'],
          [2, 'Extensión anormal (descerebración)'],
          [1, 'Ninguna'],
        ]),
        default: 6,
      },
    ],
    compute: (v) => {
      const score = sum(v, ['ocular', 'verbal', 'motora'])
      return {
        main: String(score),
        mainUnit: 'puntos (3–15)',
        secondary: `O${v.ocular} V${v.verbal} M${v.motora}`,
        interpretation:
          score >= 13
            ? 'Alteración leve del nivel de conciencia.'
            : score >= 9
              ? 'Alteración moderada: vigilancia estrecha, neuroimagen.'
              : 'Alteración grave (≤ 8): valorar aislamiento de la vía aérea.',
        level: score >= 13 ? 'ok' : score >= 9 ? 'warn' : 'danger',
      }
    },
  },
  {
    id: 'pts',
    name: 'Puntuación de trauma pediátrica (PTS)',
    shortName: 'PTS',
    description: 'Valora la gravedad del traumatismo en niños para orientar el triage.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'peso',
        type: 'select',
        label: 'Peso',
        options: escala([
          [2, '> 20 kg'],
          [1, '10–20 kg'],
          [-1, '< 10 kg'],
        ]),
      },
      {
        id: 'aerea',
        type: 'select',
        label: 'Vía aérea',
        options: escala([
          [2, 'Normal'],
          [1, 'Mantenible (oxígeno, cánula)'],
          [-1, 'Precisa intubación'],
        ]),
      },
      {
        id: 'pas',
        type: 'select',
        label: 'Presión arterial sistólica',
        options: escala([
          [2, '> 90 mmHg (o pulso periférico palpable)'],
          [1, '50–90 mmHg (o pulso central palpable)'],
          [-1, '< 50 mmHg (o sin pulso)'],
        ]),
      },
      {
        id: 'conciencia',
        type: 'select',
        label: 'Nivel de conciencia',
        options: escala([
          [2, 'Despierto'],
          [1, 'Somnoliento o pérdida de conciencia'],
          [-1, 'Coma o descerebración'],
        ]),
      },
      {
        id: 'abierta',
        type: 'select',
        label: 'Heridas abiertas',
        options: escala([
          [2, 'Ninguna'],
          [1, 'Menores'],
          [-1, 'Múltiples o penetrantes'],
        ]),
      },
      {
        id: 'esqueleto',
        type: 'select',
        label: 'Lesiones esqueléticas',
        options: escala([
          [2, 'Ninguna'],
          [1, 'Fractura cerrada única'],
          [-1, 'Fractura abierta o múltiple'],
        ]),
      },
    ],
    compute: (v) => {
      const score = sum(v, ['peso', 'aerea', 'pas', 'conciencia', 'abierta', 'esqueleto'])
      return {
        main: String(score),
        mainUnit: 'puntos (−6 a +12)',
        interpretation:
          score >= 9
            ? 'Trauma leve: manejo habitual en urgencias.'
            : score >= 6
              ? 'Trauma moderado: traslado a hospital con capacidad pediátrica.'
              : 'Trauma grave (≤ 5): traslado a centro de referencia de trauma pediátrico.',
        level: score >= 9 ? 'ok' : score >= 6 ? 'warn' : 'danger',
      }
    },
    references: [
      'Tepas JJ, et al. The Pediatric Trauma Score as a predictor of injury severity: an objective assessment. J Trauma. 1988;28(4):425-9.',
    ],
  },
  {
    id: 'westley-croup',
    name: 'Puntuación de Westley para crup',
    shortName: 'Westley (crup)',
    description: 'Cuantifica la gravedad del crup viral (laringotraqueítis aguda).',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'estridor',
        type: 'select',
        label: 'Estridor inspiratorio',
        options: escala([
          [0, 'Ausente'],
          [1, 'Con la agitación'],
          [2, 'En reposo'],
        ]),
      },
      {
        id: 'tiraje',
        type: 'select',
        label: 'Tiraje',
        options: escala([
          [0, 'Ausente'],
          [1, 'Leve'],
          [2, 'Moderado'],
          [3, 'Intenso'],
        ]),
      },
      {
        id: 'aire',
        type: 'select',
        label: 'Entrada de aire',
        options: escala([
          [0, 'Normal'],
          [1, 'Disminuida'],
          [2, 'Muy disminuida'],
        ]),
      },
      {
        id: 'cianosis',
        type: 'select',
        label: 'Cianosis',
        options: escala([
          [0, 'Ausente'],
          [4, 'Con la agitación'],
          [5, 'En reposo'],
        ]),
      },
      {
        id: 'conciencia',
        type: 'select',
        label: 'Nivel de conciencia',
        options: escala([
          [0, 'Normal'],
          [5, 'Alterado'],
        ]),
      },
    ],
    compute: (v) => {
      const score = sum(v, ['estridor', 'tiraje', 'aire', 'cianosis', 'conciencia'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–17)',
        interpretation:
          score <= 2
            ? 'Crup leve: dexametasona 0,15–0,6 mg/kg oral en dosis única, observación.'
            : score <= 5
              ? 'Crup moderado: dexametasona y valorar adrenalina nebulizada.'
              : score <= 11
                ? 'Crup grave: adrenalina nebulizada, dexametasona, oxígeno, observación estrecha.'
                : 'Insuficiencia respiratoria inminente: preparar vía aérea avanzada.',
        level: score <= 2 ? 'ok' : score <= 5 ? 'warn' : 'danger',
      }
    },
    references: [
      'Westley CR, Cotton EK, Brooks JG. Nebulized racemic epinephrine by IPPB for the treatment of croup. Am J Dis Child. 1978;132(5):484-7.',
    ],
  },
  {
    id: 'peld',
    name: 'PELD — Model for End-Stage Liver Disease pediátrico',
    shortName: 'PELD',
    description: 'Cuantifica la gravedad de la hepatopatía crónica en niños < 12 años en lista de trasplante hepático.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'bilirrubina', type: 'number', label: 'Bilirrubina total', unit: 'mg/dL', min: 0.1, max: 40, step: 0.1 },
      { id: 'inr', type: 'number', label: 'INR', min: 0.5, max: 10, step: 0.01 },
      { id: 'albumina', type: 'number', label: 'Albúmina', unit: 'g/dL', min: 1, max: 6, step: 0.1 },
      { id: 'menor1', type: 'boolean', label: 'Edad < 1 año en el momento de la inclusión en lista' },
      { id: 'crecimiento', type: 'boolean', label: 'Fallo de crecimiento (< −2 DE en talla o peso)' },
    ],
    compute: (v) => {
      const acotar = (x: number, min: number) => Math.max(x, min)
      const bili = acotar(v.bilirrubina!, 1)
      const inr = acotar(v.inr!, 1)
      const alb = acotar(v.albumina!, 1)
      const raw =
        4.80 * Math.log(bili) +
        18.57 * Math.log(inr) -
        6.87 * Math.log(alb) +
        (v.menor1 === 1 ? 4.36 : 0) +
        (v.crecimiento === 1 ? 6.67 : 0)
      const peld = Math.max(0, Math.round(raw))
      return {
        main: String(peld),
        mainUnit: 'PELD',
        interpretation:
          peld < 10
            ? 'Enfermedad hepática compensada; seguimiento habitual.'
            : peld < 20
              ? 'Deterioro moderado: valoración por hepatología pediátrica.'
              : 'Deterioro grave: prioridad en lista de trasplante.',
        level: peld < 10 ? 'ok' : peld < 20 ? 'warn' : 'danger',
      }
    },
    notes: ['Aplicable a menores de 12 años; a partir de 12 años se usa el MELD del adulto.'],
    references: [
      'McDiarmid SV, et al. Development of a pediatric end-stage liver disease score. Transplantation. 2002;74(2):173-81.',
    ],
  },
  {
    id: 'pucai',
    name: 'PUCAI — Índice de actividad de la colitis ulcerosa pediátrica',
    shortName: 'PUCAI',
    description: 'Cuantifica la actividad de la colitis ulcerosa en niños sin necesidad de endoscopia.',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'dolor',
        type: 'select',
        label: 'Dolor abdominal',
        options: escala([
          [0, 'Ausente'],
          [5, 'Puede ignorarlo'],
          [10, 'No puede ignorarlo'],
        ]),
      },
      {
        id: 'sangrado',
        type: 'select',
        label: 'Sangrado rectal',
        dropdown: true,
        options: escala([
          [0, 'Ausente'],
          [10, 'Pequeña cantidad, < 50 % de las deposiciones'],
          [20, 'Pequeña cantidad, en la mayoría'],
          [30, 'Gran cantidad (> 50 % del contenido)'],
        ]),
      },
      {
        id: 'consistencia',
        type: 'select',
        label: 'Consistencia de las heces',
        options: escala([
          [0, 'Formadas'],
          [5, 'Parcialmente formadas'],
          [10, 'Completamente no formadas'],
        ]),
      },
      {
        id: 'deposiciones',
        type: 'select',
        label: 'Número de deposiciones en 24 h',
        dropdown: true,
        options: escala([
          [0, '0–2'],
          [5, '3–5'],
          [10, '6–8'],
          [15, '> 8'],
        ]),
      },
      {
        id: 'nocturnas',
        type: 'select',
        label: 'Deposiciones nocturnas (que despiertan)',
        options: escala([
          [0, 'No'],
          [10, 'Sí'],
        ]),
      },
      {
        id: 'actividad',
        type: 'select',
        label: 'Nivel de actividad',
        options: escala([
          [0, 'Sin limitación'],
          [5, 'Actividad ocasionalmente limitada'],
          [10, 'Muy limitada'],
        ]),
      },
    ],
    compute: (v) => {
      const score = sum(v, ['dolor', 'sangrado', 'consistencia', 'deposiciones', 'nocturnas', 'actividad'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–85)',
        interpretation:
          score < 10
            ? 'Remisión (< 10): mantener tratamiento actual y controles.'
            : score < 35
              ? 'Actividad leve (10–34).'
              : score < 65
                ? 'Actividad moderada (35–64): considerar intensificación del tratamiento.'
                : 'Actividad grave (≥ 65): hospitalización con corticoides intravenosos; PUCAI ≥ 45 al día 3 y ≥ 65 al día 5 predice fracaso a corticoides y necesita rescate.',
        level: score < 10 ? 'ok' : score < 35 ? 'info' : score < 65 ? 'warn' : 'danger',
      }
    },
    references: [
      'Turner D, et al. Development, validation, and evaluation of a pediatric ulcerative colitis activity index: a prospective multicenter study. Gastroenterology. 2007;133(2):423-32.',
    ],
  },
  {
    id: 'kawasaki',
    name: 'Criterios de la enfermedad de Kawasaki',
    shortName: 'Kawasaki',
    description: 'Diagnóstico de la enfermedad de Kawasaki en niños.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'fiebre', type: 'boolean', label: 'Fiebre ≥ 5 días (o < 5 días si se cumplen suficientes criterios)', noPoints: true },
      { id: 'conjuntivitis', type: 'boolean', label: 'Conjuntivitis bilateral no exudativa', noPoints: true },
      { id: 'oral', type: 'boolean', label: 'Alteraciones oro-faríngeas (labios agrietados, lengua aframbuesada, faringe hiperémica)', noPoints: true },
      { id: 'extremidades', type: 'boolean', label: 'Cambios en manos y pies (eritema/edema palmoplantar o descamación periungueal en fase subaguda)', noPoints: true },
      { id: 'exantema', type: 'boolean', label: 'Exantema polimorfo', noPoints: true },
      { id: 'adenopatia', type: 'boolean', label: 'Adenopatía cervical ≥ 1,5 cm, generalmente unilateral', noPoints: true },
    ],
    compute: (v) => {
      const criterios = sum(v, ['conjuntivitis', 'oral', 'extremidades', 'exantema', 'adenopatia'])
      if (v.fiebre !== 1)
        return {
          main: 'No cumple criterios',
          interpretation: 'La fiebre ≥ 5 días es un criterio obligatorio (o < 5 días con ≥ 4 criterios adicionales si se sospecha fuertemente).',
          level: 'ok',
        }
      if (criterios >= 4)
        return {
          main: 'Kawasaki clásica',
          interpretation: 'Fiebre ≥ 5 días + ≥ 4 criterios principales: se diagnostica enfermedad de Kawasaki. Iniciar inmunoglobulina intravenosa 2 g/kg en 12 h y AAS a dosis antiinflamatoria en las primeras 10 días de fiebre.',
          level: 'danger',
        }
      if (criterios >= 2)
        return {
          main: 'Kawasaki incompleta posible',
          interpretation:
            'Fiebre ≥ 5 días + 2–3 criterios: valorar Kawasaki incompleta. Solicitar PCR, VSG, hemograma, transaminasas, orina y ecocardiograma. Consultar criterios de laboratorio y de imagen de la AHA 2017.',
          level: 'warn',
        }
      return {
        main: 'Kawasaki improbable',
        interpretation: 'Menos de 2 criterios adicionales: buscar otros diagnósticos. Si persiste la fiebre sin foco, reevaluar.',
        level: 'ok',
      }
    },
    notes: [
      'La ecocardiografía es indispensable en todo caso sospechado para valorar aneurismas coronarios.',
      'En Kawasaki incompleta, seguir el algoritmo de la AHA con laboratorio y ecocardiograma.',
    ],
    references: [
      'McCrindle BW, et al. Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease. AHA Scientific Statement. Circulation. 2017;135(17):e927-e999.',
    ],
  },
  {
    id: 'crafft',
    name: 'CRAFFT — Cribado de consumo de sustancias en adolescentes',
    shortName: 'CRAFFT',
    description: 'Cribado del consumo problemático de alcohol y drogas en adolescentes.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'car', type: 'boolean', label: '¿Has viajado en un coche conducido por alguien (incluido tú) que había consumido alcohol o drogas? (C)' },
      { id: 'relax', type: 'boolean', label: '¿Consumes alcohol o drogas para relajarte, sentirte mejor o encajar? (R)' },
      { id: 'alone', type: 'boolean', label: '¿Consumes alcohol o drogas cuando estás solo/a? (A)' },
      { id: 'forget', type: 'boolean', label: '¿Olvidas cosas que has hecho estando bajo los efectos? (F)' },
      { id: 'family', type: 'boolean', label: '¿Tu familia o amigos te han dicho que reduzcas el consumo? (F)' },
      { id: 'trouble', type: 'boolean', label: '¿Te has metido en problemas estando bajo los efectos? (T)' },
    ],
    compute: (v) => {
      const score = sum(v, ['car', 'relax', 'alone', 'forget', 'family', 'trouble'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–6)',
        interpretation:
          score >= 2
            ? 'CRAFFT ≥ 2: alta sospecha de consumo problemático o trastorno por consumo. Entrevista motivacional y valorar derivación a salud mental.'
            : score === 1
              ? 'Una respuesta positiva: consejo breve, refuerzo y reevaluar.'
              : 'Cribado negativo: refuerzo positivo.',
        level: score >= 2 ? 'danger' : score === 1 ? 'warn' : 'ok',
      }
    },
    notes: ['Aplicable a adolescentes de 12 a 21 años. Una respuesta afirmativa a «coche» siempre exige consejo específico aunque el resto sea negativo.'],
    references: [
      'Knight JR, et al. Validity of the CRAFFT substance abuse screening test among adolescent clinic patients. Arch Pediatr Adolesc Med. 2002;156(6):607-14.',
    ],
  },
  {
    id: 'heads-ed',
    name: 'HEADS-ED — Cribado psicosocial pediátrico en urgencias',
    shortName: 'HEADS-ED',
    description:
      'Herramienta rápida de cribado psicosocial para adolescentes que acuden a urgencias por motivos de salud mental.',
    category: CAT,
    specialty: PED,
    inputs: [
      ...([
        ['home', 'Home (hogar)'],
        ['education', 'Educación / empleo'],
        ['activities', 'Actividades y pares'],
        ['drugs', 'Alcohol y drogas'],
        ['suicidalidad', 'Suicidalidad'],
        ['emociones', 'Emociones y comportamiento (ansiedad, depresión…)'],
        ['descargador', 'Recursos de apoyo (professionals/discharge)'],
      ] as [string, string][]).map(([id, label]) => ({
        id,
        type: 'select' as const,
        label,
        options: escala([
          [0, 'Sin problemas'],
          [1, 'Problemas leves-moderados'],
          [2, 'Problemas graves o urgentes'],
        ]),
      })),
    ],
    compute: (v) => {
      const ids = ['home', 'education', 'activities', 'drugs', 'suicidalidad', 'emociones', 'descargador']
      const score = sum(v, ids)
      const suic = (v.suicidalidad ?? 0) === 2
      const consulta = score >= 8 || suic
      return {
        main: String(score),
        mainUnit: 'puntos (0–14)',
        interpretation: consulta
          ? 'Se recomienda consulta con psiquiatría o salud mental (HEADS-ED ≥ 8 o suicidalidad grave).'
          : 'Puntuación baja: seguir con evaluación clínica habitual y valorar apoyo comunitario.',
        level: consulta ? 'danger' : 'warn',
      }
    },
    references: [
      'Cappelli M, et al. The HEADS-ED: a rapid mental health screening tool for pediatric patients in the emergency department. Pediatrics. 2012;130(2):e321-7.',
    ],
  },
  {
    id: 'lansky',
    name: 'Escala de Lansky (equivalente pediátrico de Karnofsky)',
    shortName: 'Lansky',
    description: 'Evalúa el nivel de actividad funcional en niños con enfermedad grave (oncología pediátrica).',
    category: CAT,
    specialty: PED,
    inputs: [
      {
        id: 'nivel',
        type: 'select',
        label: 'Nivel de actividad',
        dropdown: true,
        noPoints: true,
        options: [
          { label: '100 — Totalmente activo, normal', value: 100 },
          { label: '90 — Restricciones menores en actividades físicas intensas', value: 90 },
          { label: '80 — Activo pero se cansa antes', value: 80 },
          { label: '70 — Actividad limitada; se cansa con juegos activos', value: 70 },
          { label: '60 — Levantado y con juegos tranquilos; pocos juegos activos', value: 60 },
          { label: '50 — Se levanta y se viste; sin juegos activos; puede participar en juegos tranquilos', value: 50 },
          { label: '40 — Principalmente en cama; participa en actividades tranquilas', value: 40 },
          { label: '30 — En cama; necesita ayuda incluso para juegos tranquilos', value: 30 },
          { label: '20 — Duerme mucho; juego totalmente limitado a actividades muy pasivas', value: 20 },
          { label: '10 — No juega; no se levanta de la cama', value: 10 },
          { label: '0 — No responde', value: 0 },
        ],
      },
    ],
    compute: (v) => {
      const g = v.nivel ?? 100
      return {
        main: String(g),
        mainUnit: '/100',
        interpretation:
          g >= 70
            ? 'Estado funcional preservado: tolerará razonablemente los tratamientos.'
            : g >= 40
              ? 'Estado funcional intermedio: valorar caso a caso.'
              : 'Estado funcional muy reducido: en general no se toleran los tratamientos oncológicos activos; priorizar control sintomático.',
        level: g >= 70 ? 'ok' : g >= 40 ? 'warn' : 'danger',
      }
    },
    references: [
      'Lansky SB, et al. The measurement of performance in childhood cancer patients. Cancer. 1987;60(7):1651-6.',
    ],
  },
  {
    id: 'wat-1',
    name: 'WAT-1 — Escala de abstinencia pediátrica',
    shortName: 'WAT-1',
    description:
      'Cuantifica el síndrome de abstinencia de opioides y benzodiacepinas en pacientes pediátricos críticos.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'deposiciones', type: 'boolean', label: 'Deposiciones blandas o líquidas en las últimas 12 h' },
      { id: 'vomitos', type: 'boolean', label: 'Vómitos, arcadas o babeo en las últimas 12 h' },
      { id: 'temperatura', type: 'boolean', label: 'Temperatura > 37,8 °C en las últimas 12 h' },
      {
        id: 'estado',
        type: 'select',
        label: 'Estado tras estímulo (nuevo)',
        options: [
          { label: 'Calmado o tranquilo', value: 0 },
          { label: 'Inquieto o distraído', value: 1 },
          { label: 'Muy agitado', value: 2 },
        ],
      },
      { id: 'temblor', type: 'boolean', label: 'Temblor con o sin estímulo' },
      { id: 'sudoracion', type: 'boolean', label: 'Sudoración' },
      { id: 'movimientos', type: 'boolean', label: 'Movimientos no coordinados o repetitivos' },
      { id: 'bostezos', type: 'boolean', label: 'Bostezos o estornudos ≥ 3 veces en 1 h' },
      { id: 'sobresalto', type: 'boolean', label: 'Sobresalto exagerado al ruido' },
      { id: 'tonoMus', type: 'boolean', label: 'Hipertonía muscular' },
      { id: 'tiempoConsuelo', type: 'boolean', label: 'Tiempo hasta el consuelo > 5 minutos' },
    ],
    compute: (v) => {
      const score = sum(v, ['deposiciones', 'vomitos', 'temperatura', 'estado', 'temblor', 'sudoracion', 'movimientos', 'bostezos', 'sobresalto', 'tonoMus', 'tiempoConsuelo'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–12)',
        interpretation:
          score < 3
            ? 'Sin síntomas de abstinencia significativos: mantener plan de destete.'
            : 'WAT-1 ≥ 3: síndrome de abstinencia significativo. Ralentizar el destete o administrar dosis de rescate.',
        level: score < 3 ? 'ok' : 'warn',
      }
    },
    references: [
      'Franck LS, et al. The Withdrawal Assessment Tool-1 (WAT-1): an assessment instrument for monitoring opioid and benzodiazepine withdrawal symptoms in pediatric patients. Pediatr Crit Care Med. 2008;9(6):573-80.',
    ],
  },
  {
    id: 'sodio-hiperglucemia',
    name: 'Corrección de sodio por hiperglucemia',
    shortName: 'Na corregido (glucosa)',
    description:
      'Estima el sodio sérico real en pacientes con hiperglucemia significativa.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'sodio', type: 'number', label: 'Sodio medido', unit: 'mEq/L', min: 100, max: 180, step: 0.1 },
      { id: 'glucemia', type: 'number', label: 'Glucemia', unit: 'mg/dL', min: 100, max: 2000, step: 1 },
    ],
    compute: (v) => {
      const na = v.sodio! + 1.6 * ((v.glucemia! - 100) / 100)
      const naHillier = v.sodio! + 2.4 * ((v.glucemia! - 100) / 100)
      return {
        main: fmt(na, 1),
        mainUnit: 'mEq/L (Katz 1,6)',
        secondary: fmt(naHillier, 1),
        secondaryLabel: 'mEq/L (Hillier 2,4)',
        interpretation:
          'La fórmula clásica (Katz, 1,6 mEq/L por cada 100 mg/dL de glucosa por encima de 100) infraestima el sodio real; la fórmula de Hillier (2,4) es más exacta con glucemias muy altas.',
        level: 'info',
      }
    },
    references: [
      'Hillier TA, et al. Hyponatremia: evaluating the correction factor for hyperglycemia. Am J Med. 1999;106(4):399-403.',
    ],
  },
  {
    id: 'fecha-parto',
    name: 'Fecha probable de parto y edad gestacional',
    shortName: 'Fecha del parto',
    description:
      'Calcula la fecha probable de parto (regla de Naegele) y la edad gestacional actual a partir de la fecha de la última menstruación.',
    category: CAT_GO,
    specialty: OBS,
    inputs: [
      {
        id: 'metodo',
        type: 'select',
        label: 'Base de cálculo',
        noPoints: true,
        options: [
          { label: 'Última menstruación (FUR)', value: 0 },
          { label: 'Fecha de concepción', value: 1 },
        ],
      },
      { id: 'dia', type: 'number', label: 'Día (1–31)', min: 1, max: 31, step: 1 },
      { id: 'mes', type: 'number', label: 'Mes (1–12)', min: 1, max: 12, step: 1 },
      { id: 'anio', type: 'number', label: 'Año', min: 2020, max: 2030, step: 1 },
      { id: 'hoyDia', type: 'number', label: 'Hoy — día', min: 1, max: 31, step: 1 },
      { id: 'hoyMes', type: 'number', label: 'Hoy — mes', min: 1, max: 12, step: 1 },
      { id: 'hoyAnio', type: 'number', label: 'Hoy — año', min: 2020, max: 2030, step: 1 },
    ],
    compute: (v) => {
      const base = new Date(v.anio!, v.mes! - 1, v.dia!)
      if (isNaN(base.getTime()))
        return { main: '—', interpretation: 'Fecha no válida.', level: 'warn' }
      const inicio = v.metodo === 1 ? new Date(base.getTime() - 14 * 86400000) : base
      const parto = new Date(inicio.getTime() + 280 * 86400000)
      const hoy = new Date(v.hoyAnio!, v.hoyMes! - 1, v.hoyDia!)
      if (isNaN(hoy.getTime()))
        return { main: '—', interpretation: 'La fecha de hoy no es válida.', level: 'warn' }
      const dias = Math.floor((hoy.getTime() - inicio.getTime()) / 86400000)
      const semanas = Math.floor(dias / 7)
      const restoDias = dias % 7
      const fmtDate = (d: Date) =>
        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
      return {
        main: fmtDate(parto),
        mainUnit: 'fecha probable de parto',
        secondary: `${semanas} sem + ${restoDias} d`,
        secondaryLabel: 'edad gestacional actual',
        interpretation:
          dias < 0
            ? 'La fecha base es posterior a hoy; revisa las fechas.'
            : semanas < 22
              ? 'Primer o segundo trimestre.'
              : semanas < 37
                ? 'Pretérmino: si nace ahora, requiere atención neonatal especializada.'
                : semanas < 42
                  ? 'A término.'
                  : 'Postérmino: valorar inducción según protocolo.',
        level: semanas < 37 ? 'warn' : semanas < 42 ? 'ok' : 'warn',
        details: [
          `Fecha de inicio calculada: ${fmtDate(inicio)}.`,
          'Regla de Naegele: FUR + 280 días (o + 40 semanas).',
        ],
      }
    },
  },
  {
    id: 'mapi',
    name: 'Índice predictivo del asma modificado (mAPI)',
    shortName: 'mAPI',
    description:
      'Predice el riesgo de asma persistente en preescolares con episodios recurrentes de sibilancias.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'episodios', type: 'boolean', label: '≥ 4 episodios de sibilancias en el último año (al menos uno confirmado por un médico)', noPoints: true },
      { id: 'padres', type: 'boolean', label: 'Criterio mayor: asma diagnosticada en padres', noPoints: true },
      { id: 'atopia', type: 'boolean', label: 'Criterio mayor: dermatitis atópica personal', noPoints: true },
      { id: 'sensibAero', type: 'boolean', label: 'Criterio mayor: sensibilización a ≥ 1 aeroalérgeno', noPoints: true },
      { id: 'sensibAlim', type: 'boolean', label: 'Criterio menor: sensibilización a leche, huevo o frutos secos', noPoints: true },
      { id: 'sibsSinCatarro', type: 'boolean', label: 'Criterio menor: sibilancias no relacionadas con resfriados', noPoints: true },
      { id: 'eosinofilia', type: 'boolean', label: 'Criterio menor: eosinofilia ≥ 4 %', noPoints: true },
    ],
    compute: (v) => {
      if (v.episodios !== 1)
        return {
          main: 'No aplicable',
          interpretation: 'La regla se aplica a preescolares con ≥ 4 episodios de sibilancias en el último año.',
          level: 'info',
        }
      const mayores = sum(v, ['padres', 'atopia', 'sensibAero'])
      const menores = sum(v, ['sensibAlim', 'sibsSinCatarro', 'eosinofilia'])
      const positivo = mayores >= 1 || menores >= 2
      return {
        main: positivo ? 'mAPI positivo' : 'mAPI negativo',
        secondary: `${mayores} mayor + ${menores} menor`,
        interpretation: positivo
          ? 'mAPI positivo: alto valor predictivo positivo para el diagnóstico de asma en edad escolar. Reforzar seguimiento y tratamiento preventivo.'
          : 'mAPI negativo: valor predictivo negativo muy alto; probable evolución favorable con la edad.',
        level: positivo ? 'warn' : 'ok',
      }
    },
    references: [
      'Guilbert TW, et al. Atopic characteristics of children with recurrent wheezing at high risk for the development of childhood asthma. J Allergy Clin Immunol. 2004;114(6):1282-7.',
    ],
  },
  {
    id: 'regla-7-lyme',
    name: 'Regla de los 7 para la meningitis de Lyme',
    shortName: 'Regla de 7 (Lyme)',
    description:
      'Diferencia la meningitis de Lyme de la meningitis aséptica viral en niños de áreas endémicas.',
    category: CAT,
    specialty: PED,
    inputs: [
      { id: 'sintomas', type: 'boolean', label: '≥ 7 días de síntomas', noPoints: true },
      { id: 'parCraneal', type: 'boolean', label: 'Parálisis de un par craneal (especialmente el VII)', noPoints: true },
      { id: 'mononuclear', type: 'boolean', label: '≥ 70 % de mononucleares en el LCR', noPoints: true },
    ],
    compute: (v) => {
      const criterios = ['sintomas', 'parCraneal', 'mononuclear'].filter((k) => v[k] === 1).length
      return {
        main: criterios === 0 ? 'Riesgo bajo' : 'No de bajo riesgo',
        secondary: `${criterios}/3 criterios positivos`,
        interpretation:
          criterios === 0
            ? 'Ningún criterio positivo: riesgo muy bajo de meningitis de Lyme (probabilidad < 10 %). Puede tratarse como meningitis viral inicialmente y esperar a la serología.'
            : 'Uno o más criterios positivos: se recomienda iniciar antibioterapia empírica cubriendo Borrelia (ceftriaxona) mientras se completa la serología.',
        level: criterios === 0 ? 'ok' : 'warn',
      }
    },
    notes: ['Aplicable en niños de áreas endémicas con meningitis linfocitaria confirmada.'],
    references: [
      'Cohn KA, et al. Validation of a clinical prediction rule to distinguish Lyme meningitis from aseptic meningitis. Pediatrics. 2012;129(1):e46-53.',
    ],
  },
  {
    id: 'flamm-vbac',
    name: 'Puntuación de Flamm — parto vaginal tras cesárea (VBAC)',
    shortName: 'Flamm VBAC',
    description: 'Estima la probabilidad de éxito de un parto vaginal en una gestante con cesárea previa.',
    category: CAT_GO,
    specialty: OBS,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad materna',
        options: [
          { label: '< 40 años', value: 2 },
          { label: '≥ 40 años', value: 0 },
        ],
      },
      { id: 'partoPrevio', type: 'boolean', label: 'Parto vaginal previo', points: 4 },
      { id: 'partoDespuesCesarea', type: 'boolean', label: 'Parto vaginal después de la cesárea previa', points: 1 },
      { id: 'indicacion', type: 'boolean', label: 'La cesárea previa NO fue por falta de progresión' },
      {
        id: 'borramiento',
        type: 'select',
        label: 'Borramiento cervical al ingreso',
        dropdown: true,
        options: [
          { label: '≥ 75 %', value: 2 },
          { label: '25–74 %', value: 1 },
          { label: '< 25 %', value: 0 },
        ],
      },
      {
        id: 'dilatacion',
        type: 'select',
        label: 'Dilatación cervical al ingreso',
        options: [
          { label: '≥ 4 cm', value: 1 },
          { label: '< 4 cm', value: 0 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'partoPrevio', 'partoDespuesCesarea', 'indicacion', 'borramiento', 'dilatacion'])
      const exito = ['49 %', '60 %', '67 %', '75 %', '82 %', '85 %', '89 %', '93 %', '95 %', '95 %', '95 %'][Math.min(score, 10)]
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        secondary: exito,
        secondaryLabel: 'probabilidad de VBAC exitoso',
        interpretation:
          score >= 8
            ? 'Alta probabilidad de éxito: candidata a intento de parto vaginal.'
            : score >= 4
              ? 'Probabilidad moderada: informar riesgos-beneficios y decidir con la paciente.'
              : 'Probabilidad baja: valorar cesárea electiva salvo preferencia informada de la paciente.',
        level: score >= 8 ? 'ok' : score >= 4 ? 'warn' : 'danger',
      }
    },
    notes: ['Contraindicaciones absolutas de VBAC: cesárea previa clásica, cirugía uterina previa con entrada en cavidad, dos o más cesáreas previas en la mayoría de guías, ruptura uterina previa.'],
    references: [
      'Flamm BL, Geiger AM. Vaginal birth after cesarean delivery: an admission scoring system. Obstet Gynecol. 1997;90(6):907-10.',
    ],
  },
]
