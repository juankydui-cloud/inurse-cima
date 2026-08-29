import type { Calculator, Option } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Neurocrítico e ictus'
const UCI = ['Medicina Intensiva']

const escala = (items: [number, string][]): Option[] =>
  items.map(([value, label]) => ({ label: `${value} — ${label}`, value }))

export const neurocritico: Calculator[] = [
  {
    id: 'glasgow',
    name: 'Escala de coma de Glasgow (GCS)',
    shortName: 'Glasgow',
    description:
      'Cuantifica el nivel de conciencia mediante la respuesta ocular, verbal y motora.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'ocular',
        type: 'select',
        label: 'Apertura ocular',
        dropdown: true,
        options: escala([
          [4, 'Espontánea'],
          [3, 'A la orden verbal'],
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
          [5, 'Orientada'],
          [4, 'Confusa'],
          [3, 'Palabras inapropiadas'],
          [2, 'Sonidos incomprensibles'],
          [1, 'Ninguna (o intubado)'],
        ]),
        default: 5,
      },
      {
        id: 'motora',
        type: 'select',
        label: 'Respuesta motora',
        dropdown: true,
        options: escala([
          [6, 'Obedece órdenes'],
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
        secondaryLabel: 'desglose',
        interpretation:
          score >= 13
            ? 'Traumatismo craneoencefálico leve (13–15).'
            : score >= 9
              ? 'Traumatismo craneoencefálico moderado (9–12): vigilancia estrecha y neuroimagen.'
              : 'Traumatismo craneoencefálico grave (≤ 8): considerar aislamiento de la vía aérea y monitorización neurocrítica.',
        level: score >= 13 ? 'ok' : score >= 9 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Registrar siempre el desglose por componentes: es más informativo que la suma.',
      'En pacientes intubados, la respuesta verbal se anota como 1 con el sufijo «T»; en ese caso la puntuación máxima es 10T.',
      'Puntuar la mejor respuesta obtenida.',
    ],
    references: [
      'Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81-4.',
    ],
  },
  {
    id: 'gcs-p',
    name: 'Escala de Glasgow con reactividad pupilar (GCS-P)',
    shortName: 'GCS-P',
    description:
      'Combina la escala de Glasgow con la reactividad pupilar para afinar el pronóstico en puntuaciones bajas.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'gcs', type: 'number', label: 'Puntuación total de Glasgow', unit: 'puntos', min: 3, max: 15, step: 1 },
      {
        id: 'pupilas',
        type: 'select',
        label: 'Pupilas que no reaccionan a la luz',
        options: [
          { label: 'Ninguna (ambas reactivas)', value: 0 },
          { label: 'Una', value: 1 },
          { label: 'Ambas', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const gcsp = v.gcs! - (v.pupilas ?? 0)
      const mort = gcsp <= 2 ? '≈ 74 %' : gcsp <= 4 ? '≈ 40–50 %' : gcsp <= 8 ? '≈ 20–30 %' : '< 15 %'
      return {
        main: String(gcsp),
        mainUnit: 'puntos (1–15)',
        secondary: mort,
        secondaryLabel: 'mortalidad orientativa a 6 meses',
        interpretation:
          gcsp <= 4
            ? 'Puntuación muy baja: pronóstico desfavorable. La escala amplía el rango inferior de la GCS al restar la falta de reactividad pupilar.'
            : gcsp <= 8
              ? 'Daño cerebral grave: monitorización neurocrítica.'
              : 'Rango de mejor pronóstico.',
        level: gcsp <= 4 ? 'danger' : gcsp <= 8 ? 'warn' : 'ok',
        details: ['GCS-P = GCS total − puntuación de reactividad pupilar (0, 1 o 2).'],
      }
    },
    references: [
      'Brennan PM, Murray GD, Teasdale GM. Simplifying the use of prognostic information in traumatic brain injury. Part 1: The GCS-Pupils score. J Neurosurg. 2018;128(6):1612-20.',
    ],
  },
  {
    id: 'four',
    name: 'Puntuación FOUR (Full Outline of UnResponsiveness)',
    shortName: 'FOUR',
    description:
      'Gradúa la profundidad del coma; aplicable a pacientes intubados, donde la escala de Glasgow pierde el componente verbal.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'ocular',
        type: 'select',
        label: 'Respuesta ocular',
        dropdown: true,
        options: escala([
          [4, 'Ojos abiertos, sigue con la mirada o parpadea a la orden'],
          [3, 'Ojos abiertos pero no sigue con la mirada'],
          [2, 'Ojos cerrados; los abre con voz fuerte'],
          [1, 'Ojos cerrados; los abre con el dolor'],
          [0, 'Ojos permanecen cerrados con el dolor'],
        ]),
        default: 4,
      },
      {
        id: 'motora',
        type: 'select',
        label: 'Respuesta motora',
        dropdown: true,
        options: escala([
          [4, 'Hace el signo de victoria, el puño o el pulgar a la orden'],
          [3, 'Localiza el dolor'],
          [2, 'Respuesta en flexión al dolor'],
          [1, 'Respuesta en extensión al dolor'],
          [0, 'Sin respuesta al dolor o estado mioclónico generalizado'],
        ]),
        default: 4,
      },
      {
        id: 'tronco',
        type: 'select',
        label: 'Reflejos del tronco encefálico',
        dropdown: true,
        options: escala([
          [4, 'Reflejos pupilar y corneal presentes'],
          [3, 'Una pupila midriática y fija'],
          [2, 'Reflejo pupilar o corneal ausente'],
          [1, 'Reflejos pupilar y corneal ausentes'],
          [0, 'Reflejos pupilar, corneal y tusígeno ausentes'],
        ]),
        default: 4,
      },
      {
        id: 'respiracion',
        type: 'select',
        label: 'Patrón respiratorio',
        dropdown: true,
        options: escala([
          [4, 'No intubado, patrón respiratorio regular'],
          [3, 'No intubado, respiración de Cheyne-Stokes'],
          [2, 'No intubado, respiración irregular'],
          [1, 'Respira por encima de la frecuencia del ventilador'],
          [0, 'Respira a la frecuencia del ventilador o apnea'],
        ]),
        default: 4,
      },
    ],
    compute: (v) => {
      const score = sum(v, ['ocular', 'motora', 'tronco', 'respiracion'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–16)',
        secondary: `O${v.ocular} M${v.motora} T${v.tronco} R${v.respiracion}`,
        secondaryLabel: 'desglose',
        interpretation:
          score === 0
            ? 'Puntuación 0: ausencia completa de respuesta y de reflejos de tronco; valorar protocolo de muerte encefálica.'
            : score <= 4
              ? 'Coma muy profundo: pronóstico desfavorable.'
              : score <= 11
                ? 'Alteración importante del nivel de conciencia: monitorización neurocrítica.'
                : 'Alteración leve-moderada del nivel de conciencia.',
        level: score <= 4 ? 'danger' : score <= 11 ? 'warn' : 'ok',
      }
    },
    notes: [
      'Ventaja sobre la GCS: valora reflejos de tronco y patrón respiratorio, y es aplicable a pacientes intubados.',
      'Detecta el síndrome de cautiverio (locked-in) y los estados vegetativos que la GCS no distingue.',
    ],
    references: [
      'Wijdicks EF, et al. Validation of a new coma scale: the FOUR score. Ann Neurol. 2005;58(4):585-93.',
    ],
  },
  {
    id: 'nihss',
    name: 'Escala de ictus del NIH (NIHSS)',
    shortName: 'NIHSS',
    description:
      'Cuantifica la gravedad del ictus y permite monitorizar los cambios neurológicos en el tiempo.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'i1a',
        type: 'select',
        label: '1a. Nivel de conciencia',
        dropdown: true,
        options: escala([
          [0, 'Alerta, respuestas normales'],
          [1, 'Somnoliento, despierta con estímulo mínimo'],
          [2, 'Estuporoso, requiere estímulo repetido o doloroso'],
          [3, 'Coma, solo respuestas reflejas o ninguna'],
        ]),
      },
      {
        id: 'i1b',
        type: 'select',
        label: '1b. Preguntas (mes actual y edad)',
        dropdown: true,
        options: escala([
          [0, 'Responde correctamente a ambas'],
          [1, 'Responde correctamente a una'],
          [2, 'No responde correctamente a ninguna'],
        ]),
      },
      {
        id: 'i1c',
        type: 'select',
        label: '1c. Órdenes (abrir/cerrar los ojos, abrir/cerrar la mano)',
        dropdown: true,
        options: escala([
          [0, 'Realiza ambas correctamente'],
          [1, 'Realiza una correctamente'],
          [2, 'No realiza ninguna'],
        ]),
      },
      {
        id: 'i2',
        type: 'select',
        label: '2. Mirada conjugada',
        dropdown: true,
        options: escala([
          [0, 'Normal'],
          [1, 'Paresia parcial de la mirada'],
          [2, 'Desviación forzada o paresia total'],
        ]),
      },
      {
        id: 'i3',
        type: 'select',
        label: '3. Campos visuales',
        dropdown: true,
        options: escala([
          [0, 'Sin defectos'],
          [1, 'Hemianopsia parcial'],
          [2, 'Hemianopsia completa'],
          [3, 'Hemianopsia bilateral o ceguera cortical'],
        ]),
      },
      {
        id: 'i4',
        type: 'select',
        label: '4. Paresia facial',
        dropdown: true,
        options: escala([
          [0, 'Movimientos normales y simétricos'],
          [1, 'Paresia leve (asimetría al sonreír)'],
          [2, 'Parálisis parcial (facial inferior)'],
          [3, 'Parálisis completa (superior e inferior)'],
        ]),
      },
      {
        id: 'i5a',
        type: 'select',
        label: '5a. Motor — brazo izquierdo',
        dropdown: true,
        options: escala([
          [0, 'Mantiene la posición 10 s sin claudicar'],
          [1, 'Claudica antes de 10 s, sin llegar a tocar la cama'],
          [2, 'Esfuerzo contra gravedad, cae a la cama'],
          [3, 'Movimiento sin vencer la gravedad'],
          [4, 'Ausencia de movimiento'],
        ]),
      },
      {
        id: 'i5b',
        type: 'select',
        label: '5b. Motor — brazo derecho',
        dropdown: true,
        options: escala([
          [0, 'Mantiene la posición 10 s sin claudicar'],
          [1, 'Claudica antes de 10 s, sin llegar a tocar la cama'],
          [2, 'Esfuerzo contra gravedad, cae a la cama'],
          [3, 'Movimiento sin vencer la gravedad'],
          [4, 'Ausencia de movimiento'],
        ]),
      },
      {
        id: 'i6a',
        type: 'select',
        label: '6a. Motor — pierna izquierda',
        dropdown: true,
        options: escala([
          [0, 'Mantiene la posición 5 s sin claudicar'],
          [1, 'Claudica antes de 5 s, sin llegar a tocar la cama'],
          [2, 'Esfuerzo contra gravedad, cae a la cama'],
          [3, 'Movimiento sin vencer la gravedad'],
          [4, 'Ausencia de movimiento'],
        ]),
      },
      {
        id: 'i6b',
        type: 'select',
        label: '6b. Motor — pierna derecha',
        dropdown: true,
        options: escala([
          [0, 'Mantiene la posición 5 s sin claudicar'],
          [1, 'Claudica antes de 5 s, sin llegar a tocar la cama'],
          [2, 'Esfuerzo contra gravedad, cae a la cama'],
          [3, 'Movimiento sin vencer la gravedad'],
          [4, 'Ausencia de movimiento'],
        ]),
      },
      {
        id: 'i7',
        type: 'select',
        label: '7. Ataxia de las extremidades',
        dropdown: true,
        options: escala([
          [0, 'Ausente'],
          [1, 'Presente en una extremidad'],
          [2, 'Presente en dos o más extremidades'],
        ]),
      },
      {
        id: 'i8',
        type: 'select',
        label: '8. Sensibilidad',
        dropdown: true,
        options: escala([
          [0, 'Normal'],
          [1, 'Hipoestesia leve-moderada'],
          [2, 'Anestesia grave o total'],
        ]),
      },
      {
        id: 'i9',
        type: 'select',
        label: '9. Lenguaje',
        dropdown: true,
        options: escala([
          [0, 'Normal'],
          [1, 'Afasia leve-moderada'],
          [2, 'Afasia grave'],
          [3, 'Mutismo o afasia global'],
        ]),
      },
      {
        id: 'i10',
        type: 'select',
        label: '10. Disartria',
        dropdown: true,
        options: escala([
          [0, 'Articulación normal'],
          [1, 'Disartria leve-moderada'],
          [2, 'Disartria grave, ininteligible o anartria'],
        ]),
      },
      {
        id: 'i11',
        type: 'select',
        label: '11. Extinción / inatención',
        dropdown: true,
        options: escala([
          [0, 'Sin alteraciones'],
          [1, 'Inatención en una modalidad sensorial'],
          [2, 'Hemi-inatención grave o en más de una modalidad'],
        ]),
      },
    ],
    compute: (v) => {
      const ids = ['i1a', 'i1b', 'i1c', 'i2', 'i3', 'i4', 'i5a', 'i5b', 'i6a', 'i6b', 'i7', 'i8', 'i9', 'i10', 'i11']
      const score = sum(v, ids)
      const banda =
        score === 0 ? 'Sin déficit medible' : score <= 4 ? 'Ictus leve' : score <= 15 ? 'Ictus moderado' : score <= 20 ? 'Ictus moderado-grave' : 'Ictus grave'
      return {
        main: String(score),
        mainUnit: 'puntos (0–42)',
        interpretation: `${banda}. A mayor puntuación, mayor volumen de lesión y peor pronóstico funcional. Una NIHSS ≥ 6 con clínica compatible sugiere oclusión de gran vaso: valorar trombectomía además de la trombólisis.`,
        level: score === 0 ? 'ok' : score <= 4 ? 'info' : score <= 15 ? 'warn' : 'danger',
      }
    },
    notes: [
      'Puntuar lo que el paciente hace, no lo que se cree que puede hacer; no ayudar ni repetir instrucciones más de lo indicado.',
      'Realizar los ítems en orden y no volver atrás para modificar puntuaciones.',
      'En la circulación posterior la NIHSS infraestima la gravedad.',
    ],
    references: [
      'Brott T, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864-70.',
    ],
  },
  {
    id: 'rankin',
    name: 'Escala de Rankin modificada (mRS)',
    shortName: 'Rankin',
    description:
      'Mide el grado de discapacidad o dependencia tras un ictus u otra causa de daño neurológico.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'grado',
        type: 'select',
        label: 'Grado de discapacidad',
        dropdown: true,
        noPoints: true,
        options: escala([
          [0, 'Sin síntomas'],
          [1, 'Sin discapacidad significativa: realiza sus actividades habituales pese a algún síntoma'],
          [2, 'Discapacidad leve: no puede hacer todo lo que hacía antes, pero se vale por sí mismo'],
          [3, 'Discapacidad moderada: requiere alguna ayuda, pero camina sin asistencia'],
          [4, 'Discapacidad moderada-grave: no camina ni atiende sus necesidades sin ayuda'],
          [5, 'Discapacidad grave: encamado, incontinente, requiere cuidados constantes'],
          [6, 'Fallecido'],
        ]),
      },
    ],
    compute: (v) => {
      const g = v.grado ?? 0
      return {
        main: `mRS ${g}`,
        interpretation:
          g <= 2
            ? 'mRS 0–2: independencia funcional; es el resultado favorable habitual en los ensayos de trombólisis y trombectomía.'
            : g <= 5
              ? 'mRS 3–5: dependencia funcional en grado creciente; planificar rehabilitación y apoyo sociosanitario.'
              : 'Fallecimiento.',
        level: g <= 2 ? 'ok' : g <= 4 ? 'warn' : 'danger',
      }
    },
    references: [
      'van Swieten JC, et al. Interobserver agreement for the assessment of handicap in stroke patients. Stroke. 1988;19(5):604-7.',
    ],
  },
  {
    id: 'abc2-volumen',
    name: 'Fórmula ABC/2 para el volumen de la hemorragia intracerebral',
    shortName: 'ABC/2',
    description: 'Estima el volumen del hematoma intracraneal a partir de la tomografía computarizada.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'a', type: 'number', label: 'A — diámetro mayor del hematoma', unit: 'cm', min: 0.1, max: 30, step: 0.1 },
      { id: 'b', type: 'number', label: 'B — diámetro perpendicular al anterior', unit: 'cm', min: 0.1, max: 30, step: 0.1 },
      { id: 'cortes', type: 'number', label: 'Número de cortes con hemorragia', unit: 'cortes', min: 1, max: 100, step: 1 },
      { id: 'grosor', type: 'number', label: 'Grosor de corte', unit: 'cm', min: 0.1, max: 2, step: 0.1 },
    ],
    compute: (v) => {
      const c = v.cortes! * v.grosor!
      const vol = (v.a! * v.b! * c) / 2
      return {
        main: fmt(vol, 1),
        mainUnit: 'cm³ (mL)',
        interpretation:
          vol >= 30
            ? 'Volumen ≥ 30 cm³: se asocia a peor pronóstico y puntúa en la escala ICH; valoración neuroquirúrgica.'
            : 'Volumen < 30 cm³.',
        level: vol >= 30 ? 'danger' : 'warn',
        details: [
          `C (extensión craneocaudal) = ${fmt(c, 1)} cm.`,
          'Volumen = A × B × C / 2 (aproximación elipsoidal).',
        ],
      }
    },
    notes: [
      'Para contar los cortes, se toman como completos los que tienen ≥ 75 % del área del corte mayor y como medios los que tienen entre el 25 y el 75 %.',
      'La fórmula sobrestima el volumen en hematomas de forma irregular o lobares.',
    ],
    references: [
      'Kothari RU, et al. The ABCs of measuring intracerebral hemorrhage volumes. Stroke. 1996;27(8):1304-5.',
    ],
  },
  {
    id: 'ich-score',
    name: 'Puntuación ICH de hemorragia intracerebral',
    shortName: 'ICH',
    description: 'Estima la mortalidad a 30 días en la hemorragia intracerebral espontánea.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'gcs',
        type: 'select',
        label: 'Escala de coma de Glasgow',
        options: [
          { label: '13–15', value: 0 },
          { label: '5–12', value: 1 },
          { label: '3–4', value: 2 },
        ],
      },
      { id: 'volumen', type: 'boolean', label: 'Volumen del hematoma ≥ 30 cm³' },
      { id: 'intraventricular', type: 'boolean', label: 'Hemorragia intraventricular' },
      { id: 'infratentorial', type: 'boolean', label: 'Origen infratentorial' },
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 80 años' },
    ],
    compute: (v) => {
      const score = sum(v, ['gcs', 'volumen', 'intraventricular', 'infratentorial', 'edad'])
      const mort = ['0 %', '13 %', '26 %', '72 %', '97 %', '100 %', '100 %'][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–6)',
        secondary: mort,
        secondaryLabel: 'mortalidad a 30 días (cohorte original)',
        interpretation:
          score <= 1
            ? 'Riesgo bajo de mortalidad a 30 días.'
            : score === 2
              ? 'Riesgo intermedio.'
              : 'Riesgo alto de mortalidad. Evitar decisiones de limitación del esfuerzo terapéutico basadas solo en esta escala en las primeras 24–48 h: constituyen una profecía autocumplida.',
        level: score <= 1 ? 'warn' : 'danger',
      }
    },
    notes: [
      'La cohorte de derivación fue pequeña; las cifras son orientativas.',
      'Las guías desaconsejan usar escalas pronósticas para limitar tratamientos de forma precoz.',
    ],
    references: [
      'Hemphill JC 3rd, et al. The ICH score: a simple, reliable grading scale for intracerebral hemorrhage. Stroke. 2001;32(4):891-7.',
    ],
  },
  {
    id: 'hunt-hess',
    name: 'Clasificación de Hunt y Hess de la hemorragia subaracnoidea',
    shortName: 'Hunt-Hess',
    description: 'Gradúa la gravedad clínica de la hemorragia subaracnoidea aneurismática.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'grado',
        type: 'select',
        label: 'Grado clínico',
        dropdown: true,
        noPoints: true,
        options: escala([
          [1, 'Asintomático o cefalea leve y ligera rigidez de nuca'],
          [2, 'Cefalea moderada-intensa, rigidez de nuca, sin déficit salvo parálisis de pares craneales'],
          [3, 'Somnolencia, confusión o déficit focal leve'],
          [4, 'Estupor, hemiparesia moderada-grave, rigidez de descerebración precoz'],
          [5, 'Coma profundo, rigidez de descerebración, aspecto moribundo'],
        ]),
      },
    ],
    compute: (v) => {
      const g = v.grado ?? 1
      const superv = ['', '≈ 70 %', '≈ 60 %', '≈ 50 %', '≈ 20 %', '≈ 10 %'][g]
      return {
        main: `Grado ${['', 'I', 'II', 'III', 'IV', 'V'][g]}`,
        secondary: superv,
        secondaryLabel: 'supervivencia orientativa',
        interpretation:
          g <= 2
            ? 'Buen grado clínico: candidato a tratamiento precoz del aneurisma con buen pronóstico esperado.'
            : g === 3
              ? 'Grado intermedio: tratamiento precoz e ingreso en unidad neurocrítica.'
              : 'Mal grado clínico: alta mortalidad; manejo neurocrítico intensivo y valoración individualizada.',
        level: g <= 2 ? 'ok' : g === 3 ? 'warn' : 'danger',
      }
    },
    notes: ['Sumar un grado si existe enfermedad sistémica grave (HTA, diabetes, arteriosclerosis, EPOC) o vasoespasmo grave en la arteriografía.'],
    references: [
      'Hunt WE, Hess RM. Surgical risk as related to time of intervention in the repair of intracranial aneurysms. J Neurosurg. 1968;28(1):14-20.',
    ],
  },
  {
    id: 'abcd2',
    name: 'Puntuación ABCD² para el accidente isquémico transitorio',
    shortName: 'ABCD²',
    description: 'Estima el riesgo de ictus tras un accidente isquémico transitorio.',
    category: CAT,
    specialty: UCI,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 60 años (A)' },
      { id: 'pa', type: 'boolean', label: 'Presión arterial ≥ 140/90 mmHg (B)' },
      {
        id: 'clinica',
        type: 'select',
        label: 'Características clínicas (C)',
        options: [
          { label: 'Otros síntomas', value: 0 },
          { label: 'Alteración del habla sin debilidad', value: 1 },
          { label: 'Debilidad unilateral', value: 2 },
        ],
      },
      {
        id: 'duracion',
        type: 'select',
        label: 'Duración de los síntomas (D)',
        options: [
          { label: '< 10 min', value: 0 },
          { label: '10–59 min', value: 1 },
          { label: '≥ 60 min', value: 2 },
        ],
      },
      { id: 'diabetes', type: 'boolean', label: 'Diabetes mellitus (D)' },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'pa', 'clinica', 'duracion', 'diabetes'])
      const r2 = score <= 3 ? '1,0 %' : score <= 5 ? '4,1 %' : '8,1 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–7)',
        secondary: r2,
        secondaryLabel: 'riesgo de ictus a 2 días',
        interpretation:
          score <= 3
            ? 'Riesgo bajo. Aun así, las guías actuales recomiendan estudio urgente de todo AIT (imagen vascular y cerebral, ECG) sin apoyarse solo en esta escala.'
            : score <= 5
              ? 'Riesgo moderado: estudio urgente e inicio precoz de prevención secundaria.'
              : 'Riesgo alto: valoración e ingreso urgentes.',
        level: score <= 3 ? 'warn' : score <= 5 ? 'warn' : 'danger',
      }
    },
    notes: [
      'La escala no debe usarse aisladamente para decidir el alta: no identifica de forma fiable causas tratables como la estenosis carotídea o la fibrilación auricular.',
    ],
    references: [
      'Johnston SC, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet. 2007;369(9558):283-92.',
    ],
  },
  {
    id: '2helps2b',
    name: 'Puntuación 2HELPS2B de riesgo de crisis en el EEG continuo',
    shortName: '2HELPS2B',
    description:
      'Estima el riesgo de crisis epilépticas en pacientes críticos monitorizados con electroencefalograma continuo.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'frecuencia',
        type: 'boolean',
        label: 'Patrón periódico o rítmico con frecuencia > 2 Hz',
      },
      { id: 'esporadicas', type: 'boolean', label: 'Descargas epileptiformes esporádicas' },
      {
        id: 'patrones',
        type: 'boolean',
        label: 'Descargas periódicas lateralizadas (LPD), actividad delta rítmica lateralizada (LRDA) o descargas periódicas bilaterales independientes (BIPD)',
      },
      {
        id: 'plus',
        type: 'boolean',
        label: 'Características «plus»',
        description: 'Actividad rápida, rítmica o aguda superpuesta al patrón.',
      },
      { id: 'crisis', type: 'boolean', label: 'Crisis epiléptica previa (clínica o electrográfica)' },
      {
        id: 'birds',
        type: 'boolean',
        label: 'BIRDs (descargas rítmicas breves potencialmente ictales)',
        points: 2,
      },
    ],
    compute: (v) => {
      const score = sum(v, ['frecuencia', 'esporadicas', 'patrones', 'plus', 'crisis', 'birds'])
      const riesgo = ['5 %', '12 %', '27 %', '50 %', '73 %', '> 80 %', '> 80 %', '> 80 %'][Math.min(score, 7)]
      return {
        main: String(score),
        mainUnit: 'puntos (0–7)',
        secondary: riesgo,
        secondaryLabel: 'riesgo de crisis',
        interpretation:
          score === 0
            ? 'Riesgo bajo (≈ 5 %): puede bastar con 1 hora de EEG si no hay otros motivos de sospecha.'
            : score === 1
              ? 'Riesgo intermedio: se recomienda al menos 12–24 h de monitorización.'
              : 'Riesgo alto (≥ 2 puntos): se recomienda monitorización con EEG continuo durante al menos 24–48 h.',
        level: score === 0 ? 'ok' : score === 1 ? 'warn' : 'danger',
      }
    },
    references: [
      'Struck AF, et al. Association of an electroencephalography-based risk score with seizure probability in hospitalized patients. JAMA Neurol. 2017;74(12):1419-24.',
    ],
  },
  {
    id: 'cam-icu',
    name: 'Método de evaluación de la confusión en la UCI (CAM-ICU)',
    shortName: 'CAM-ICU',
    description: 'Detecta el delirio en pacientes críticos, incluidos los que están intubados.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'rass',
        type: 'select',
        label: 'Nivel de sedación (RASS)',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'RASS −5 o −4 (no despierta): no evaluable, reevaluar más tarde', value: 0 },
          { label: 'RASS −3 a +4 (despierta a la voz): puede evaluarse', value: 1 },
        ],
        default: 1,
      },
      {
        id: 'agudo',
        type: 'boolean',
        label: '1. Inicio agudo o curso fluctuante',
        description: '¿Hay un cambio agudo respecto al estado mental basal, o el estado mental ha fluctuado en las últimas 24 h?',
        noPoints: true,
      },
      {
        id: 'inatencion',
        type: 'boolean',
        label: '2. Inatención',
        description: 'Menos de 8 aciertos de 10 en la prueba de letras (apretar la mano con la letra «A») o de imágenes.',
        noPoints: true,
      },
      {
        id: 'conciencia',
        type: 'boolean',
        label: '3. Nivel de conciencia alterado',
        description: 'RASS distinto de 0 en el momento de la evaluación.',
        noPoints: true,
      },
      {
        id: 'pensamiento',
        type: 'boolean',
        label: '4. Pensamiento desorganizado',
        description: 'Errores en las preguntas lógicas o incapacidad para seguir la orden de mostrar dedos.',
        noPoints: true,
      },
    ],
    compute: (v) => {
      if (v.rass === 0)
        return {
          main: 'No evaluable',
          interpretation: 'Con RASS −4 o −5 el paciente está demasiado sedado para valorar el delirio: reevaluar cuando el nivel de sedación mejore.',
          level: 'info',
        }
      const positivo =
        v.agudo === 1 && v.inatencion === 1 && (v.conciencia === 1 || v.pensamiento === 1)
      return {
        main: positivo ? 'CAM-ICU positivo' : 'CAM-ICU negativo',
        interpretation: positivo
          ? 'Delirio presente: buscar y corregir causas (dolor, fármacos, infección, hipoxia, abstinencia, retención urinaria), favorecer la movilización precoz, el sueño y la reorientación, y reservar los antipsicóticos para la agitación con riesgo.'
          : 'Sin delirio en este momento. Reevaluar al menos una vez por turno.',
        level: positivo ? 'danger' : 'ok',
        details: [
          'Se requieren los criterios 1 y 2, más el 3 o el 4.',
        ],
      }
    },
    references: [
      'Ely EW, et al. Delirium in mechanically ventilated patients: validity and reliability of the confusion assessment method for the intensive care unit (CAM-ICU). JAMA. 2001;286(21):2703-10.',
    ],
  },
  {
    id: 'cpot',
    name: 'Herramienta de observación del dolor en cuidados intensivos (CPOT)',
    shortName: 'CPOT',
    description: 'Evalúa el dolor del paciente crítico que no puede comunicarlo, mediante observación.',
    category: CAT,
    specialty: UCI,
    inputs: [
      {
        id: 'facial',
        type: 'select',
        label: 'Expresión facial',
        dropdown: true,
        options: escala([
          [0, 'Relajada, neutra'],
          [1, 'Tensa (ceño fruncido, cejas bajas, contracción periorbitaria)'],
          [2, 'Muecas de dolor (además, párpados fuertemente cerrados)'],
        ]),
      },
      {
        id: 'movimientos',
        type: 'select',
        label: 'Movimientos corporales',
        dropdown: true,
        options: escala([
          [0, 'Ausencia de movimientos o posición normal'],
          [1, 'Protección (movimientos lentos y cautelosos, se toca la zona dolorosa)'],
          [2, 'Inquietud (intenta sentarse, mueve las extremidades, no obedece órdenes, intenta retirar dispositivos)'],
        ]),
      },
      {
        id: 'muscular',
        type: 'select',
        label: 'Tensión muscular (flexión-extensión pasiva del brazo)',
        dropdown: true,
        options: escala([
          [0, 'Relajado, sin resistencia'],
          [1, 'Tenso, rígido; resistencia a los movimientos pasivos'],
          [2, 'Muy tenso o rígido; imposible completar los movimientos pasivos'],
        ]),
      },
      {
        id: 'ventilador',
        type: 'select',
        label: 'Adaptación al ventilador (intubados) o vocalización (extubados)',
        dropdown: true,
        options: escala([
          [0, 'Tolera el ventilador / habla en tono normal o está en silencio'],
          [1, 'Tose pero tolera / suspira, gime'],
          [2, 'Lucha contra el ventilador / llora, grita'],
        ]),
      },
    ],
    compute: (v) => {
      const score = sum(v, ['facial', 'movimientos', 'muscular', 'ventilador'])
      return {
        main: String(score),
        mainUnit: 'puntos (0–8)',
        interpretation:
          score > 2
            ? 'CPOT > 2: dolor significativo. Administrar analgesia y reevaluar tras la intervención.'
            : 'CPOT ≤ 2: dolor mínimo o ausente. Continuar la vigilancia y reevaluar tras los procedimientos.',
        level: score > 2 ? 'danger' : 'ok',
      }
    },
    notes: ['Evaluar en reposo y durante los procedimientos dolorosos (movilización, aspiración, curas).'],
    references: [
      'Gélinas C, et al. Validation of the critical-care pain observation tool in adult patients. Am J Crit Care. 2006;15(4):420-7.',
    ],
  },
]
