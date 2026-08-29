import type { Calculator } from '../engine/types'
import { fmt, sum } from '../engine/types'

const CAT = 'Síndrome coronario agudo y dolor torácico'
const CARD = ['Cardiología']

export const cardioSCA: Calculator[] = [
  {
    id: 'heart',
    name: 'Puntuación HEART para eventos cardíacos mayores',
    shortName: 'HEART',
    description:
      'Predice el riesgo a 6 semanas de eventos cardíacos adversos mayores (MACE) en pacientes con dolor torácico en urgencias.',
    category: CAT,
    specialty: CARD,
    inputs: [
      {
        id: 'historia',
        type: 'select',
        label: 'Historia clínica (History)',
        options: [
          { label: 'Poco sospechosa', value: 0 },
          { label: 'Moderadamente sospechosa', value: 1 },
          { label: 'Altamente sospechosa', value: 2 },
        ],
      },
      {
        id: 'ecg',
        type: 'select',
        label: 'ECG',
        options: [
          { label: 'Normal', value: 0 },
          { label: 'Alteraciones inespecíficas de la repolarización', value: 1 },
          { label: 'Descenso significativo del ST', value: 2 },
        ],
      },
      {
        id: 'edad',
        type: 'select',
        label: 'Edad (Age)',
        options: [
          { label: '< 45 años', value: 0 },
          { label: '45–64 años', value: 1 },
          { label: '≥ 65 años', value: 2 },
        ],
      },
      {
        id: 'factores',
        type: 'select',
        label: 'Factores de riesgo (Risk factors)',
        description:
          'HTA, hipercolesterolemia, diabetes, obesidad (IMC > 30), tabaquismo, historia familiar de cardiopatía precoz o enfermedad aterosclerótica conocida.',
        options: [
          { label: 'Ninguno', value: 0 },
          { label: '1–2 factores', value: 1 },
          { label: '≥ 3 factores o enfermedad aterosclerótica conocida', value: 2 },
        ],
      },
      {
        id: 'troponina',
        type: 'select',
        label: 'Troponina (Troponin)',
        options: [
          { label: '≤ límite normal', value: 0 },
          { label: '1–3 × el límite normal', value: 1 },
          { label: '> 3 × el límite normal', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = sum(v, ['historia', 'ecg', 'edad', 'factores', 'troponina'])
      const banda = score <= 3 ? 'bajo' : score <= 6 ? 'intermedio' : 'alto'
      const pct = score <= 3 ? '≈ 1–2 %' : score <= 6 ? '≈ 12–17 %' : '≈ 50–65 %'
      return {
        main: String(score),
        mainUnit: 'puntos (0–10)',
        secondary: pct,
        secondaryLabel: 'MACE a 6 semanas',
        interpretation:
          banda === 'bajo'
            ? 'Riesgo bajo: candidato a alta precoz con seguimiento ambulatorio (según protocolo HEART Pathway con troponinas seriadas negativas).'
            : banda === 'intermedio'
              ? 'Riesgo intermedio: observación e ingreso para estudio (troponinas seriadas, pruebas de isquemia).'
              : 'Riesgo alto: manejo agresivo precoz, valorar estrategia invasiva.',
        level: banda === 'bajo' ? 'ok' : banda === 'intermedio' ? 'warn' : 'danger',
      }
    },
    references: [
      'Six AJ, Backus BE, Kelder JC. Chest pain in the emergency room: value of the HEART score. Neth Heart J. 2008;16(6):191-6.',
      'Backus BE, et al. A prospective validation of the HEART score for chest pain patients at the emergency department. Int J Cardiol. 2013;168(3):2153-8.',
    ],
  },
  {
    id: 'edacs',
    name: 'Escala EDACS de dolor torácico en urgencias',
    shortName: 'EDACS',
    description:
      'Identifica a los pacientes con dolor torácico de bajo riesgo de evento coronario adverso mayor a 30 días.',
    category: CAT,
    specialty: CARD,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        dropdown: true,
        options: [
          { label: '18–45 años', value: 2 },
          { label: '46–50 años', value: 4 },
          { label: '51–55 años', value: 6 },
          { label: '56–60 años', value: 8 },
          { label: '61–65 años', value: 10 },
          { label: '66–70 años', value: 12 },
          { label: '71–75 años', value: 14 },
          { label: '76–80 años', value: 16 },
          { label: '81–85 años', value: 18 },
          { label: '≥ 86 años', value: 20 },
        ],
      },
      { id: 'varon', type: 'boolean', label: 'Sexo masculino', points: 6 },
      {
        id: 'riesgo',
        type: 'boolean',
        label: 'EAC conocida o ≥ 3 factores de riesgo (solo si tiene 18–50 años)',
        description: 'Factores: HTA, dislipemia, diabetes, tabaquismo, historia familiar de cardiopatía precoz.',
        points: 4,
      },
      { id: 'sudor', type: 'boolean', label: 'Diaforesis', points: 3 },
      { id: 'irradiacion', type: 'boolean', label: 'Dolor irradiado a brazo, hombro, cuello o mandíbula', points: 5 },
      { id: 'inspiracion', type: 'boolean', label: 'El dolor empeora con la inspiración', points: -4 },
      { id: 'palpacion', type: 'boolean', label: 'El dolor se reproduce con la palpación', points: -6 },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'varon', 'riesgo', 'sudor', 'irradiacion', 'inspiracion', 'palpacion'])
      return {
        main: String(score),
        mainUnit: 'puntos',
        interpretation:
          score < 16
            ? 'EDACS < 16: riesgo bajo si además el ECG no muestra isquemia aguda y las troponinas a las 0 y 2 h son negativas — candidato a alta precoz con seguimiento.'
            : 'EDACS ≥ 16: no es de bajo riesgo; continuar la evaluación habitual del síndrome coronario agudo.',
        level: score < 16 ? 'ok' : 'warn',
      }
    },
    notes: ['La regla completa (EDACS-ADP) exige, además de la puntuación < 16, un ECG sin isquemia y troponinas seriadas negativas.'],
    references: [
      'Than M, et al. Development and validation of the Emergency Department Assessment of Chest pain Score and 2 h accelerated diagnostic protocol. Emerg Med Australas. 2014;26(1):34-44.',
    ],
  },
  {
    id: 'timi-nstemi',
    name: 'Puntuación TIMI para angina inestable / IAMSEST',
    shortName: 'TIMI UA/NSTEMI',
    description:
      'Estima el riesgo de muerte, infarto o revascularización urgente a 14 días en angina inestable o infarto sin elevación del ST.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'edad', type: 'boolean', label: 'Edad ≥ 65 años' },
      { id: 'factores', type: 'boolean', label: '≥ 3 factores de riesgo de EAC', description: 'HTA, hipercolesterolemia, diabetes, tabaquismo, historia familiar.' },
      { id: 'eac', type: 'boolean', label: 'EAC conocida (estenosis ≥ 50 %)' },
      { id: 'aas', type: 'boolean', label: 'Uso de AAS en los últimos 7 días' },
      { id: 'angina', type: 'boolean', label: 'Angina grave reciente (≥ 2 episodios en 24 h)' },
      { id: 'st', type: 'boolean', label: 'Desviación del ST ≥ 0,5 mm en el ECG' },
      { id: 'marcadores', type: 'boolean', label: 'Marcadores cardíacos elevados' },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'factores', 'eac', 'aas', 'angina', 'st', 'marcadores'])
      const riesgo = [4.7, 4.7, 8.3, 13.2, 19.9, 26.2, 40.9, 40.9][score]
      return {
        main: String(score),
        mainUnit: 'puntos (0–7)',
        secondary: `${fmt(riesgo, 1)} %`,
        secondaryLabel: 'eventos a 14 días',
        interpretation:
          score <= 2
            ? 'Riesgo bajo de muerte, IAM o revascularización urgente a 14 días.'
            : score <= 4
              ? 'Riesgo intermedio: se beneficia de tratamiento antitrombótico intensivo y estrategia invasiva precoz.'
              : 'Riesgo alto: estrategia invasiva precoz recomendada.',
        level: score <= 2 ? 'ok' : score <= 4 ? 'warn' : 'danger',
      }
    },
    references: [
      'Antman EM, et al. The TIMI risk score for unstable angina/non-ST elevation MI. JAMA. 2000;284(7):835-42.',
    ],
  },
  {
    id: 'timi-stemi',
    name: 'Puntuación TIMI para STEMI',
    shortName: 'TIMI STEMI',
    description: 'Estima la mortalidad a 30 días en el infarto agudo de miocardio con elevación del ST.',
    category: CAT,
    specialty: CARD,
    inputs: [
      {
        id: 'edad',
        type: 'select',
        label: 'Edad',
        options: [
          { label: '< 65 años', value: 0 },
          { label: '65–74 años', value: 2 },
          { label: '≥ 75 años', value: 3 },
        ],
      },
      { id: 'dmHtaAngina', type: 'boolean', label: 'Diabetes, hipertensión o angina previa' },
      { id: 'pas', type: 'boolean', label: 'PA sistólica < 100 mmHg', points: 3 },
      { id: 'fc', type: 'boolean', label: 'Frecuencia cardíaca > 100 lpm', points: 2 },
      { id: 'killip', type: 'boolean', label: 'Clase Killip II–IV', points: 2 },
      { id: 'peso', type: 'boolean', label: 'Peso < 67 kg' },
      { id: 'anterior', type: 'boolean', label: 'Elevación del ST anterior o bloqueo de rama izquierda' },
      { id: 'tiempo', type: 'boolean', label: 'Tiempo hasta el tratamiento > 4 horas' },
    ],
    compute: (v) => {
      const score = sum(v, ['edad', 'dmHtaAngina', 'pas', 'fc', 'killip', 'peso', 'anterior', 'tiempo'])
      const tabla = [0.8, 1.6, 2.2, 4.4, 7.3, 12.4, 16.1, 23.4, 26.8]
      const riesgo = score <= 8 ? tabla[score] : 35.9
      return {
        main: String(score),
        mainUnit: 'puntos (0–14)',
        secondary: `${fmt(riesgo, 1)} %`,
        secondaryLabel: 'mortalidad a 30 días',
        interpretation:
          score <= 3
            ? 'Riesgo bajo-moderado de mortalidad a 30 días.'
            : score <= 6
              ? 'Riesgo elevado: vigilancia intensiva tras la reperfusión.'
              : 'Riesgo muy elevado: considerar soporte avanzado y vigilancia en unidad coronaria.',
        level: score <= 3 ? 'ok' : score <= 6 ? 'warn' : 'danger',
      }
    },
    references: [
      'Morrow DA, et al. TIMI risk score for ST-elevation myocardial infarction. Circulation. 2000;102(17):2031-7.',
    ],
  },
  {
    id: 'timi-indice',
    name: 'Índice de riesgo TIMI',
    shortName: 'Índice TIMI',
    description:
      'Estimación rápida de la mortalidad en el síndrome coronario agudo usando solo edad, frecuencia cardíaca y presión arterial.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'fc', type: 'number', label: 'Frecuencia cardíaca', unit: 'lpm', min: 20, max: 250 },
      { id: 'edad', type: 'number', label: 'Edad', unit: 'años', min: 18, max: 110 },
      { id: 'pas', type: 'number', label: 'Presión arterial sistólica', unit: 'mmHg', min: 40, max: 260 },
    ],
    compute: (v) => {
      const indice = (v.fc! * Math.pow(v.edad! / 10, 2)) / v.pas!
      const banda =
        indice < 12.5 ? 'muy bajo' : indice < 17.5 ? 'bajo' : indice < 22.5 ? 'intermedio' : indice < 30 ? 'alto' : 'muy alto'
      return {
        main: fmt(indice, 1),
        interpretation: `Riesgo ${banda} de mortalidad a 30 días (quintiles orientativos: < 12,5 ≈ < 1 %; > 30 ≈ ≥ 8 %). Útil como triaje rápido inicial; no sustituye a las escalas completas.`,
        level: indice < 17.5 ? 'ok' : indice < 22.5 ? 'info' : indice < 30 ? 'warn' : 'danger',
        details: ['Índice = FC × (edad/10)² / PAS.'],
      }
    },
    references: [
      'Morrow DA, et al. A simple risk index for rapid initial triage of patients with ST-elevation myocardial infarction (InTIME II). Lancet. 2001;358(9293):1571-5.',
    ],
  },
  {
    id: 'sgarbossa',
    name: 'Criterios de Sgarbossa (originales y modificados)',
    shortName: 'Sgarbossa',
    description:
      'Diagnostica el infarto agudo de miocardio en presencia de bloqueo de rama izquierda o ritmo de marcapasos.',
    category: CAT,
    specialty: CARD,
    inputs: [
      {
        id: 'concordanteSt',
        type: 'boolean',
        label: 'Elevación del ST ≥ 1 mm concordante con el QRS',
        description: 'En cualquier derivación.',
        points: 5,
      },
      {
        id: 'descensoV1V3',
        type: 'boolean',
        label: 'Descenso del ST ≥ 1 mm en V1–V3',
        points: 3,
      },
      {
        id: 'discordante',
        type: 'boolean',
        label: 'Elevación del ST ≥ 5 mm discordante con el QRS',
        points: 2,
      },
      {
        id: 'ratio',
        type: 'boolean',
        label: 'Criterio modificado (Smith): elevación discordante del ST con relación ST/S ≥ 0,25',
        description: 'Elevación del ST ≥ 1 mm y ST/S ≥ 25 % en cualquier derivación.',
        noPoints: true,
      },
    ],
    compute: (v) => {
      const score = sum(v, ['concordanteSt', 'descensoV1V3', 'discordante'])
      const originalPositivo = score >= 3
      const modificadoPositivo = v.concordanteSt === 5 || v.descensoV1V3 === 3 || v.ratio === 1
      return {
        main: String(score),
        mainUnit: 'puntos (criterios originales)',
        secondary: modificadoPositivo ? 'Positivos' : 'Negativos',
        secondaryLabel: 'criterios modificados (Smith)',
        interpretation: originalPositivo
          ? 'Criterios originales ≥ 3 puntos: alta especificidad para infarto agudo de miocardio — activar el protocolo de reperfusión.'
          : modificadoPositivo
            ? 'Criterios modificados positivos: sugieren IAM con mayor sensibilidad que los originales — correlacionar con clínica y troponinas y valorar reperfusión.'
            : 'Criterios negativos: no descartan el infarto (sensibilidad limitada); seriar ECG y troponinas si la sospecha persiste.',
        level: originalPositivo || modificadoPositivo ? 'danger' : 'info',
      }
    },
    references: [
      'Sgarbossa EB, et al. Electrocardiographic diagnosis of evolving acute myocardial infarction in the presence of left bundle-branch block. N Engl J Med. 1996;334(8):481-7.',
      'Smith SW, et al. Diagnosis of ST-elevation myocardial infarction in the presence of left bundle branch block with the ST-elevation to S-wave ratio in a modified Sgarbossa rule. Ann Emerg Med. 2012;60(6):766-76.',
    ],
  },
  {
    id: 'killip',
    name: 'Clasificación de Killip para la insuficiencia cardíaca en el SCA',
    shortName: 'Killip',
    description:
      'Cuantifica la gravedad de la insuficiencia cardíaca en el síndrome coronario agudo y estima la mortalidad.',
    category: CAT,
    specialty: CARD,
    inputs: [
      {
        id: 'clase',
        type: 'select',
        label: 'Clase Killip',
        dropdown: true,
        noPoints: true,
        options: [
          { label: 'I — Sin signos de insuficiencia cardíaca', value: 1 },
          { label: 'II — Crepitantes basales, galope S3 o ingurgitación yugular', value: 2 },
          { label: 'III — Edema agudo de pulmón', value: 3 },
          { label: 'IV — Shock cardiogénico (hipotensión, hipoperfusión)', value: 4 },
        ],
      },
    ],
    compute: (v) => {
      const c = v.clase ?? 1
      const mort = ['', '≈ 6 %', '≈ 17 %', '≈ 38 %', '≈ 67–81 %'][c]
      return {
        main: `Killip ${['', 'I', 'II', 'III', 'IV'][c]}`,
        secondary: mort,
        secondaryLabel: 'mortalidad histórica a 30 días',
        interpretation:
          c === 1
            ? 'Sin insuficiencia cardíaca: pronóstico favorable.'
            : c === 2
              ? 'Insuficiencia cardíaca leve-moderada: vigilancia estrecha y tratamiento descongestivo.'
              : c === 3
                ? 'Edema agudo de pulmón: tratamiento intensivo inmediato.'
                : 'Shock cardiogénico: soporte hemodinámico y revascularización urgente.',
        level: c === 1 ? 'ok' : c === 2 ? 'info' : c === 3 ? 'warn' : 'danger',
      }
    },
    notes: ['Las mortalidades proceden de la serie original (1967); con la reperfusión actual son menores, pero el gradiente pronóstico se mantiene.'],
    references: [
      'Killip T, Kimball JT. Treatment of myocardial infarction in a coronary care unit. Am J Cardiol. 1967;20(4):457-64.',
    ],
  },
  {
    id: 'duke-treadmill',
    name: 'Puntuación de la cinta de correr de Duke',
    shortName: 'Duke Treadmill',
    description:
      'Estratifica el pronóstico de la enfermedad coronaria sospechada a partir de la ergometría (protocolo de Bruce).',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'minutos', type: 'number', label: 'Duración del ejercicio (protocolo de Bruce)', unit: 'min', min: 0, max: 30 },
      { id: 'st', type: 'number', label: 'Desviación máxima del ST', unit: 'mm', min: 0, max: 10, step: 0.5 },
      {
        id: 'angina',
        type: 'select',
        label: 'Angina durante la prueba',
        options: [
          { label: 'Sin angina', value: 0 },
          { label: 'Angina que no limita la prueba', value: 1 },
          { label: 'Angina que obliga a parar', value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const dts = v.minutos! - 5 * v.st! - 4 * (v.angina ?? 0)
      const banda = dts >= 5 ? 'bajo' : dts >= -10 ? 'intermedio' : 'alto'
      return {
        main: fmt(dts, 1),
        mainUnit: 'puntos',
        interpretation:
          banda === 'bajo'
            ? 'Riesgo bajo (≥ +5): supervivencia a 4 años ≈ 99 %; en general no requiere estudios invasivos.'
            : banda === 'intermedio'
              ? 'Riesgo intermedio (−10 a +4): valorar prueba de imagen o coronariografía según el contexto clínico.'
              : 'Riesgo alto (≤ −11): mortalidad anual ≈ 5 %; considerar coronariografía.',
        level: banda === 'bajo' ? 'ok' : banda === 'intermedio' ? 'warn' : 'danger',
        details: ['DTS = minutos de ejercicio − 5 × desviación del ST (mm) − 4 × índice de angina.'],
      }
    },
    references: [
      'Mark DB, et al. Exercise treadmill score for predicting prognosis in coronary artery disease. Ann Intern Med. 1987;106(6):793-800.',
    ],
  },
  {
    id: 'brugada-tv',
    name: 'Criterios de Brugada para taquicardia ventricular',
    shortName: 'Brugada TV',
    description:
      'Algoritmo secuencial para distinguir la taquicardia ventricular de la supraventricular con aberrancia en la taquicardia regular de QRS ancho.',
    category: CAT,
    specialty: CARD,
    inputs: [
      {
        id: 'rs',
        type: 'boolean',
        label: 'Paso 1 — Ausencia de complejo RS en todas las derivaciones precordiales',
        noPoints: true,
      },
      {
        id: 'rsLargo',
        type: 'boolean',
        label: 'Paso 2 — Intervalo R–S > 100 ms en alguna precordial',
        description: 'Del inicio de la R al nadir de la S.',
        noPoints: true,
      },
      {
        id: 'disociacion',
        type: 'boolean',
        label: 'Paso 3 — Disociación auriculoventricular',
        noPoints: true,
      },
      {
        id: 'morfologia',
        type: 'boolean',
        label: 'Paso 4 — Criterios morfológicos de TV en V1–V2 y V6',
        noPoints: true,
      },
    ],
    compute: (v) => {
      const tv = v.rs === 1 || v.rsLargo === 1 || v.disociacion === 1 || v.morfologia === 1
      return {
        main: tv ? 'TV' : 'TSV con aberrancia',
        interpretation: tv
          ? 'Si cualquiera de los pasos es positivo, el algoritmo diagnostica taquicardia ventricular (especificidad alta). Tratar como TV.'
          : 'Con los cuatro pasos negativos, el algoritmo sugiere taquicardia supraventricular con conducción aberrante. Ante la duda, tratar siempre como TV.',
        level: tv ? 'danger' : 'info',
      }
    },
    notes: [
      'En pacientes inestables no aplicar algoritmos: cardioversión inmediata.',
      'Ante la duda, toda taquicardia regular de QRS ancho se trata como TV.',
    ],
    references: [
      'Brugada P, et al. A new approach to the differential diagnosis of a regular tachycardia with a wide QRS complex. Circulation. 1991;83(5):1649-59.',
    ],
  },
  {
    id: 'mehran',
    name: 'Puntuación de Mehran para nefropatía por contraste tras ICP',
    shortName: 'Mehran',
    description:
      'Predice el riesgo de nefropatía inducida por contraste tras una intervención coronaria percutánea.',
    category: CAT,
    specialty: CARD,
    inputs: [
      { id: 'hipotension', type: 'boolean', label: 'Hipotensión', description: 'PAS < 80 mmHg ≥ 1 h que requiere soporte.', points: 5 },
      { id: 'biac', type: 'boolean', label: 'Balón de contrapulsación intraaórtico', points: 5 },
      { id: 'icc', type: 'boolean', label: 'Insuficiencia cardíaca (NYHA III–IV o edema pulmonar)', points: 5 },
      { id: 'edad', type: 'boolean', label: 'Edad > 75 años', points: 4 },
      { id: 'anemia', type: 'boolean', label: 'Anemia', description: 'Hto < 39 % en varones o < 36 % en mujeres.', points: 3 },
      { id: 'dm', type: 'boolean', label: 'Diabetes mellitus', points: 3 },
      {
        id: 'fge',
        type: 'select',
        label: 'Filtrado glomerular estimado',
        options: [
          { label: '≥ 60 mL/min/1,73 m²', value: 0 },
          { label: '40–59', value: 2 },
          { label: '20–39', value: 4 },
          { label: '< 20', value: 6 },
        ],
      },
      { id: 'contraste', type: 'number', label: 'Volumen de contraste', unit: 'mL', min: 0, max: 1000 },
    ],
    compute: (v) => {
      const score =
        sum(v, ['hipotension', 'biac', 'icc', 'edad', 'anemia', 'dm', 'fge']) + Math.floor(v.contraste! / 100)
      const banda = score <= 5 ? 'bajo' : score <= 10 ? 'moderado' : score <= 15 ? 'alto' : 'muy alto'
      const nic = score <= 5 ? '7,5 %' : score <= 10 ? '14 %' : score <= 15 ? '26 %' : '57 %'
      const dialisis = score <= 5 ? '0,04 %' : score <= 10 ? '0,12 %' : score <= 15 ? '1,1 %' : '12,6 %'
      return {
        main: String(score),
        mainUnit: 'puntos',
        secondary: nic,
        secondaryLabel: 'riesgo de nefropatía por contraste',
        interpretation: `Riesgo ${banda}. Riesgo de diálisis: ${dialisis}. En riesgo moderado-alto: hidratación pautada, minimizar contraste y evitar nefrotóxicos.`,
        level: score <= 5 ? 'ok' : score <= 10 ? 'info' : score <= 15 ? 'warn' : 'danger',
        details: ['El volumen de contraste añade 1 punto por cada 100 mL.'],
      }
    },
    references: [
      'Mehran R, et al. A simple risk score for prediction of contrast-induced nephropathy after percutaneous coronary intervention. J Am Coll Cardiol. 2004;44(7):1393-9.',
    ],
  },
]
