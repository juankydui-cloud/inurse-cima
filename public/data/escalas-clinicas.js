/* =========================================================================
   Enferix · Índices y escalas clínicas
   Bundle generado automáticamente por scripts/build-escalas.mjs desde las
   fuentes TypeScript modulares en src/calculators/. NO EDITAR A MANO:
   los cambios se pierden en la próxima compilación. Para modificar una
   calculadora, edita su fichero .ts y ejecuta `npm run build:escalas`.
   Contrato de runtime: define
     window.ENFERIX_ESCALAS_DATA = { CATEGORIES, SPECIALTIES, CALCULATORS }
   consumido por /public/js/calculadoras/inurse-escalas-clinicas-js.js.
   ========================================================================= */
"use strict";
var __enferix_escalas = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/calculators/index.ts
  var index_exports = {};
  __export(index_exports, {
    CALCULATORS: () => CALCULATORS,
    CATEGORIES: () => CATEGORIES,
    SPECIALTIES: () => SPECIALTIES
  });

  // src/engine/types.ts
  var sum = (v, ids) => ids.reduce((acc, id) => acc + (v[id] ?? 0), 0);
  var fmt = (n, dec = 0) => n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: dec });

  // src/calculators/riesgo.ts
  var CAT = "Riesgo perioperatorio";
  var ANES = ["Anestesiolog\xEDa"];
  var riesgo = [
    {
      id: "rcri",
      name: "\xCDndice de riesgo card\xEDaco revisado (RCRI)",
      shortName: "RCRI \xB7 Lee",
      description: "Estima el riesgo de complicaciones card\xEDacas mayores tras una cirug\xEDa no card\xEDaca.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "altoRiesgo",
          type: "boolean",
          label: "Cirug\xEDa de alto riesgo",
          description: "Intraperitoneal, intrator\xE1cica o vascular suprainguinal."
        },
        {
          id: "cardiopatia",
          type: "boolean",
          label: "Antecedentes de cardiopat\xEDa isqu\xE9mica",
          description: "Infarto de miocardio previo, prueba de esfuerzo positiva, dolor tor\xE1cico de origen isqu\xE9mico, tratamiento con nitratos o ECG con ondas Q patol\xF3gicas."
        },
        {
          id: "icc",
          type: "boolean",
          label: "Antecedentes de insuficiencia card\xEDaca congestiva",
          description: "Edema pulmonar, crepitantes bilaterales o galope S3, disnea parox\xEDstica nocturna o radiograf\xEDa con redistribuci\xF3n vascular."
        },
        {
          id: "acv",
          type: "boolean",
          label: "Antecedentes de enfermedad cerebrovascular",
          description: "Ictus o accidente isqu\xE9mico transitorio (AIT) previos."
        },
        {
          id: "insulina",
          type: "boolean",
          label: "Diabetes en tratamiento con insulina preoperatoria"
        },
        {
          id: "creatinina",
          type: "boolean",
          label: "Creatinina preoperatoria > 2 mg/dL (177 \xB5mol/L)"
        }
      ],
      compute: (v) => {
        const score = sum(v, ["altoRiesgo", "cardiopatia", "icc", "acv", "insulina", "creatinina"]);
        const pct = [0.5, 1.3, 3.6, 9.1][Math.min(score, 3)];
        const clase = ["I", "II", "III", "IV"][Math.min(score, 3)];
        return {
          main: String(score),
          mainUnit: score === 1 ? "punto" : "puntos",
          secondary: `${fmt(pct, 1)} %`,
          secondaryLabel: "riesgo de evento card\xEDaco mayor",
          interpretation: `Clase ${clase} de Lee. Riesgo estimado de infarto, edema pulmonar, fibrilaci\xF3n ventricular, parada card\xEDaca o bloqueo AV completo en el perioperatorio.`,
          level: score === 0 ? "ok" : score === 1 ? "info" : score === 2 ? "warn" : "danger"
        };
      },
      notes: [
        "Porcentajes de la cohorte original de Lee (clases I\u2013IV: 0,5 / 1,3 / 3,6 / 9,1 %).",
        "Validaciones contempor\xE1neas con vigilancia sistem\xE1tica de troponinas estiman riesgos mayores (aprox. 3,9 / 6,0 / 10,1 / 15 % para 0, 1, 2 y \u22653 puntos).",
        "Con \u22651 punto y cirug\xEDa de riesgo, valorar optimizaci\xF3n y vigilancia postoperatoria de troponinas seg\xFAn gu\xEDas."
      ],
      references: [
        "Lee TH, et al. Derivation and prospective validation of a simple index for prediction of cardiac risk of major noncardiac surgery. Circulation. 1999;100(10):1043-9.",
        "Duceppe E, et al. Canadian Cardiovascular Society Guidelines on Perioperative Cardiac Risk Assessment. Can J Cardiol. 2017;33(1):17-32."
      ]
    },
    {
      id: "stop-bang",
      name: "Puntuaci\xF3n STOP-BANG para apnea obstructiva del sue\xF1o",
      shortName: "STOP-BANG",
      description: "Cribado del s\xEDndrome de apnea-hipopnea obstructiva del sue\xF1o (SAHOS).",
      category: CAT,
      specialty: ANES,
      inputs: [
        { id: "s", type: "boolean", label: "Ronquidos fuertes (Snoring)", description: "M\xE1s fuertes que una conversaci\xF3n o audibles a trav\xE9s de una puerta cerrada." },
        { id: "t", type: "boolean", label: "Cansancio diurno (Tiredness)", description: "Fatiga o somnolencia diurna frecuente." },
        { id: "o", type: "boolean", label: "Apneas observadas (Observed)", description: "Alguien ha observado pausas respiratorias durante el sue\xF1o." },
        { id: "p", type: "boolean", label: "Hipertensi\xF3n arterial (Pressure)", description: "En tratamiento o diagnosticada." },
        { id: "b", type: "boolean", label: "IMC > 35 kg/m\xB2 (BMI)" },
        { id: "a", type: "boolean", label: "Edad > 50 a\xF1os (Age)" },
        { id: "n", type: "boolean", label: "Circunferencia del cuello > 40 cm (Neck)" },
        { id: "g", type: "boolean", label: "Sexo masculino (Gender)" }
      ],
      compute: (v) => {
        const score = sum(v, ["s", "t", "o", "p", "b", "a", "n", "g"]);
        const stop = sum(v, ["s", "t", "o", "p"]);
        const altRisk = stop >= 2 && (v.g === 1 || v.b === 1 || v.n === 1);
        const high = score >= 5 || altRisk;
        const band = high ? "alto" : score >= 3 ? "intermedio" : "bajo";
        return {
          main: String(score),
          mainUnit: "puntos",
          interpretation: `Riesgo ${band} de apnea obstructiva del sue\xF1o.${altRisk && score < 5 ? " (\u22652 criterios STOP junto con sexo masculino, IMC >35 o cuello >40 cm tambi\xE9n clasifica como riesgo alto)." : ""}`,
          level: high ? "danger" : score >= 3 ? "warn" : "ok"
        };
      },
      notes: [
        "0\u20132: riesgo bajo \xB7 3\u20134: riesgo intermedio \xB7 5\u20138: riesgo alto.",
        "Riesgo alto alternativo: \u22652 \xEDtems STOP + sexo masculino, o IMC >35, o cuello >40 cm.",
        "En riesgo alto, considerar estudio de sue\xF1o y precauciones perioperatorias (v\xEDa a\xE9rea, opioides, monitorizaci\xF3n)."
      ],
      references: [
        "Chung F, et al. STOP questionnaire: a tool to screen patients for obstructive sleep apnea. Anesthesiology. 2008;108(5):812-21.",
        "Chung F, et al. STOP-Bang Questionnaire: a practical approach to screen for obstructive sleep apnea. Chest. 2016;149(3):631-8."
      ]
    },
    {
      id: "ariscat",
      name: "Puntuaci\xF3n ARISCAT de complicaciones pulmonares postoperatorias",
      shortName: "ARISCAT",
      description: "Predice el riesgo de complicaciones pulmonares postoperatorias, incluida la insuficiencia respiratoria.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "\u2264 50 a\xF1os", value: 0 },
            { label: "51\u201380 a\xF1os", value: 3 },
            { label: "> 80 a\xF1os", value: 16 }
          ]
        },
        {
          id: "spo2",
          type: "select",
          label: "SpO\u2082 preoperatoria (aire ambiente, sedestaci\xF3n)",
          options: [
            { label: "\u2265 96 %", value: 0 },
            { label: "91\u201395 %", value: 8 },
            { label: "\u2264 90 %", value: 24 }
          ]
        },
        {
          id: "infeccion",
          type: "boolean",
          label: "Infecci\xF3n respiratoria en el \xFAltimo mes",
          description: "Con fiebre y tratamiento antibi\xF3tico.",
          points: 17
        },
        {
          id: "anemia",
          type: "boolean",
          label: "Anemia preoperatoria (Hb \u2264 10 g/dL)",
          points: 11
        },
        {
          id: "incision",
          type: "select",
          label: "Localizaci\xF3n de la incisi\xF3n quir\xFArgica",
          options: [
            { label: "Perif\xE9rica", value: 0 },
            { label: "Abdominal superior", value: 15 },
            { label: "Intrator\xE1cica", value: 24 }
          ]
        },
        {
          id: "duracion",
          type: "select",
          label: "Duraci\xF3n prevista de la cirug\xEDa",
          options: [
            { label: "\u2264 2 h", value: 0 },
            { label: "> 2\u20133 h", value: 16 },
            { label: "> 3 h", value: 23 }
          ]
        },
        { id: "urgente", type: "boolean", label: "Cirug\xEDa urgente", points: 8 }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "spo2", "infeccion", "anemia", "incision", "duracion", "urgente"]);
        let band, pct, level;
        if (score < 26) {
          band = "bajo";
          pct = "1,6 %";
          level = "ok";
        } else if (score <= 44) {
          band = "intermedio";
          pct = "13,3 %";
          level = "warn";
        } else {
          band = "alto";
          pct = "42,1 %";
          level = "danger";
        }
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: pct,
          secondaryLabel: "incidencia de complicaciones pulmonares",
          interpretation: `Riesgo ${band} de complicaciones pulmonares postoperatorias (insuficiencia respiratoria, infecci\xF3n, derrame, atelectasia, neumot\xF3rax, broncoespasmo o neumonitis por aspiraci\xF3n).`,
          level
        };
      },
      notes: [
        "< 26 puntos: riesgo bajo (1,6 %) \xB7 26\u201344: intermedio (13,3 %) \xB7 \u2265 45: alto (42,1 %).",
        "En riesgo intermedio-alto: optimizaci\xF3n preoperatoria, fisioterapia respiratoria, ventilaci\xF3n protectora y analgesia eficaz."
      ],
      references: [
        "Canet J, et al. Prediction of postoperative pulmonary complications in a population-based surgical cohort (ARISCAT). Anesthesiology. 2010;113(6):1338-50."
      ]
    },
    {
      id: "apfel",
      name: "Escala de Apfel para n\xE1useas y v\xF3mitos postoperatorios",
      shortName: "Apfel \xB7 NVPO",
      description: "Predice el riesgo de n\xE1useas y v\xF3mitos postoperatorios (NVPO) en las primeras 24 h.",
      category: CAT,
      specialty: ANES,
      inputs: [
        { id: "mujer", type: "boolean", label: "Sexo femenino" },
        { id: "noFumador", type: "boolean", label: "No fumador/a" },
        {
          id: "antecedentes",
          type: "boolean",
          label: "Antecedentes de NVPO o cinetosis",
          description: "NVPO en cirug\xEDas previas o mareo por movimiento."
        },
        {
          id: "opioides",
          type: "boolean",
          label: "Uso previsto de opioides postoperatorios"
        }
      ],
      compute: (v) => {
        const score = sum(v, ["mujer", "noFumador", "antecedentes", "opioides"]);
        const pct = [10, 21, 39, 61, 79][score];
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: `${pct} %`,
          secondaryLabel: "riesgo de NVPO en 24 h",
          interpretation: score <= 1 ? "Riesgo bajo: profilaxis seg\xFAn contexto quir\xFArgico." : score === 2 ? "Riesgo moderado: se recomienda profilaxis con 1\u20132 antiem\xE9ticos." : "Riesgo alto: profilaxis multimodal (\u22652 antiem\xE9ticos) y considerar anestesia total intravenosa.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      notes: ["Riesgo aproximado: 0 \u2192 10 %, 1 \u2192 21 %, 2 \u2192 39 %, 3 \u2192 61 %, 4 \u2192 79 %."],
      references: [
        "Apfel CC, et al. A simplified risk score for predicting postoperative nausea and vomiting. Anesthesiology. 1999;91(3):693-700.",
        "Gan TJ, et al. Fourth Consensus Guidelines for the Management of Postoperative Nausea and Vomiting. Anesth Analg. 2020;131(2):411-48."
      ]
    },
    {
      id: "asa",
      name: "Clasificaci\xF3n del estado f\xEDsico ASA",
      shortName: "ASA",
      description: "Clasifica el estado de salud del paciente antes de la cirug\xEDa seg\xFAn la American Society of Anesthesiologists.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "clase",
          type: "select",
          label: "Clase ASA",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "ASA I \u2014 Paciente sano", value: 1 },
            { label: "ASA II \u2014 Enfermedad sist\xE9mica leve", value: 2 },
            { label: "ASA III \u2014 Enfermedad sist\xE9mica grave", value: 3 },
            { label: "ASA IV \u2014 Enfermedad sist\xE9mica grave con amenaza constante para la vida", value: 4 },
            { label: "ASA V \u2014 Paciente moribundo; no se espera que sobreviva sin la cirug\xEDa", value: 5 },
            { label: "ASA VI \u2014 Muerte cerebral declarada; donante de \xF3rganos", value: 6 }
          ]
        },
        {
          id: "urgencia",
          type: "boolean",
          label: "Cirug\xEDa urgente (a\xF1adir sufijo \xABE\xBB)",
          noPoints: true,
          description: "El retraso del tratamiento supondr\xEDa un aumento significativo del riesgo."
        }
      ],
      compute: (v) => {
        const c = v.clase ?? 1;
        const desc = [
          "",
          "Sano, sin enfermedad sist\xE9mica; no fumador, consumo de alcohol nulo o m\xEDnimo.",
          "Enfermedad sist\xE9mica leve sin limitaci\xF3n funcional (p. ej., fumador, embarazo, obesidad 30\u201340, DM o HTA bien controladas, EPOC leve).",
          "Enfermedad sist\xE9mica grave con limitaci\xF3n funcional (p. ej., DM o HTA mal controladas, EPOC, obesidad \u226540, hepatitis activa, marcapasos, FEVI reducida, IAM/ACV/AIT/stents hace >3 meses, ERC en di\xE1lisis programada).",
          "Enfermedad grave con amenaza constante para la vida (p. ej., IAM/ACV/AIT/stents hace <3 meses, isquemia mioc\xE1rdica en curso, disfunci\xF3n valvular grave, sepsis, CID, SDRA, ERC terminal sin di\xE1lisis programada).",
          "Paciente moribundo que no se espera que sobreviva sin la intervenci\xF3n (p. ej., rotura de aneurisma, traumatismo masivo, isquemia intestinal con fallo multiorg\xE1nico).",
          "Paciente con muerte cerebral declarada para extracci\xF3n de \xF3rganos."
        ][c];
        return {
          main: `ASA ${["", "I", "II", "III", "IV", "V", "VI"][c]}${v.urgencia ? " E" : ""}`,
          interpretation: desc + (v.urgencia ? " Cirug\xEDa de car\xE1cter urgente (\xABE\xBB)." : ""),
          level: c <= 2 ? "ok" : c === 3 ? "warn" : "danger"
        };
      },
      notes: [
        "La clasificaci\xF3n ASA por s\xED sola no predice el riesgo perioperatorio: debe interpretarse junto con el tipo de cirug\xEDa y la optimizaci\xF3n del paciente."
      ],
      references: [
        "ASA Physical Status Classification System. American Society of Anesthesiologists (\xFAltima actualizaci\xF3n 2020)."
      ]
    },
    {
      id: "apgar-quirurgico",
      name: "Puntuaci\xF3n de Apgar quir\xFArgica (SAS)",
      shortName: "Apgar quir\xFArgico",
      description: "Predice el riesgo de complicaciones mayores o muerte en los 30 d\xEDas posteriores a la cirug\xEDa a partir de datos intraoperatorios.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "sangrado",
          type: "select",
          label: "P\xE9rdida sangu\xEDnea estimada",
          options: [
            { label: "\u2264 100 mL", value: 3 },
            { label: "101\u2013600 mL", value: 2 },
            { label: "601\u20131000 mL", value: 1 },
            { label: "> 1000 mL", value: 0 }
          ]
        },
        {
          id: "pam",
          type: "select",
          label: "PAM m\xE1s baja durante la cirug\xEDa",
          options: [
            { label: "\u2265 70 mmHg", value: 3 },
            { label: "55\u201369 mmHg", value: 2 },
            { label: "40\u201354 mmHg", value: 1 },
            { label: "< 40 mmHg", value: 0 }
          ]
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia card\xEDaca m\xE1s baja durante la cirug\xEDa",
          options: [
            { label: "\u2264 55 lpm", value: 4 },
            { label: "56\u201365 lpm", value: 3 },
            { label: "66\u201375 lpm", value: 2 },
            { label: "76\u201385 lpm", value: 1 },
            { label: "> 85 lpm", value: 0 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["sangrado", "pam", "fc"]);
        const band = score >= 7 ? "bajo" : score >= 5 ? "intermedio" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          interpretation: band === "bajo" ? "Riesgo bajo de complicaci\xF3n mayor o muerte a 30 d\xEDas." : band === "intermedio" ? "Riesgo intermedio: valorar vigilancia postoperatoria estrecha." : "Riesgo alto de complicaci\xF3n mayor o muerte a 30 d\xEDas: considerar cuidados intensivos/intermedios.",
          level: band === "bajo" ? "ok" : band === "intermedio" ? "warn" : "danger"
        };
      },
      notes: [
        "Puntuaciones m\xE1s bajas indican mayor riesgo; \u2264 4 identifica al grupo de mayor riesgo.",
        "En caso de ritmos an\xF3malos (p. ej., bradiarritmias por bloqueo), usar la FC sinusal m\xE1s baja registrada."
      ],
      references: [
        "Gawande AA, et al. An Apgar score for surgery. J Am Coll Surg. 2007;204(2):201-8."
      ]
    },
    {
      id: "care",
      name: "Puntuaci\xF3n CARE de riesgo en anestesia card\xEDaca",
      shortName: "CARE",
      description: "Clasificaci\xF3n ordinal sencilla que predice morbimortalidad tras cirug\xEDa card\xEDaca.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "clase",
          type: "select",
          label: "Categor\xEDa CARE",
          dropdown: true,
          noPoints: true,
          options: [
            {
              label: "CARE 1 \u2014 Cardiopat\xEDa estable, sin otros problemas m\xE9dicos; cirug\xEDa no compleja",
              value: 1
            },
            {
              label: "CARE 2 \u2014 Cardiopat\xEDa estable con uno o m\xE1s problemas m\xE9dicos controlados; cirug\xEDa no compleja",
              value: 2
            },
            {
              label: "CARE 3 \u2014 Cualquier problema m\xE9dico no controlado O cirug\xEDa compleja",
              value: 3
            },
            {
              label: "CARE 4 \u2014 Problema m\xE9dico no controlado Y cirug\xEDa compleja",
              value: 4
            },
            {
              label: "CARE 5 \u2014 Cardiopat\xEDa cr\xF3nica o avanzada; cirug\xEDa como \xFAltima esperanza de salvar o mejorar la vida",
              value: 5
            }
          ]
        },
        {
          id: "urgencia",
          type: "boolean",
          label: "Cirug\xEDa de urgencia (a\xF1adir sufijo \xABE\xBB)",
          noPoints: true,
          description: "Debe operarse tan pronto como el diagn\xF3stico y el quir\xF3fano lo permitan."
        }
      ],
      compute: (v) => {
        const c = v.clase ?? 1;
        const ejemplos = [
          "",
          "Ejemplos de problemas no controlados: angina inestable, insuficiencia card\xEDaca descompensada, HTA grave, insuficiencia renal aguda.",
          "Ejemplos de problemas controlados: HTA, diabetes, EPOC, enfermedades sist\xE9micas controladas.",
          "Cirug\xEDa compleja: reintervenci\xF3n, cirug\xEDa combinada, cirug\xEDa de aorta, FEVI < 0,35, etc.",
          "Combina enfermedad no controlada y cirug\xEDa compleja: riesgo elevado.",
          "Riesgo muy elevado de mortalidad y morbilidad."
        ][c];
        return {
          main: `CARE ${c}${v.urgencia ? " E" : ""}`,
          interpretation: `A mayor categor\xEDa, mayor mortalidad y morbilidad hospitalarias; la urgencia (\xABE\xBB) incrementa el riesgo dentro de cada categor\xEDa. ${ejemplos}`,
          level: c <= 2 ? "ok" : c === 3 ? "warn" : "danger"
        };
      },
      references: [
        "Dupuis JY, et al. The Cardiac Anesthesia Risk Evaluation score: a clinically useful predictor of mortality and morbidity after cardiac surgery. Anesthesiology. 2001;94(2):194-204."
      ]
    },
    {
      id: "nhfs",
      name: "Puntuaci\xF3n de fractura de cadera de Nottingham (NHFS)",
      shortName: "NHFS",
      description: "Predice la mortalidad a 30 d\xEDas tras la cirug\xEDa de fractura de cadera.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 66 a\xF1os", value: 0 },
            { label: "66\u201385 a\xF1os", value: 3 },
            { label: "\u2265 86 a\xF1os", value: 4 }
          ]
        },
        { id: "varon", type: "boolean", label: "Sexo masculino" },
        {
          id: "hb",
          type: "boolean",
          label: "Hemoglobina \u2264 10 g/dL al ingreso"
        },
        {
          id: "amts",
          type: "boolean",
          label: "Deterioro cognitivo (AMTS \u2264 6/10)",
          description: "Abbreviated Mental Test Score al ingreso."
        },
        {
          id: "residencia",
          type: "boolean",
          label: "Vive en una instituci\xF3n",
          description: "Residencia o centro sociosanitario."
        },
        {
          id: "comorbilidades",
          type: "boolean",
          label: "\u2265 2 comorbilidades",
          description: "Entre: cardiopat\xEDa, enfermedad cerebrovascular, EPOC/enfermedad respiratoria, enfermedad renal y diabetes."
        },
        {
          id: "cancer",
          type: "boolean",
          label: "Neoplasia activa en los \xFAltimos 20 a\xF1os"
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "varon", "hb", "amts", "residencia", "comorbilidades", "cancer"]);
        const band = score <= 4 ? "bajo" : score === 5 ? "intermedio" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          interpretation: band === "bajo" ? "Riesgo bajo de mortalidad a 30 d\xEDas (orientativamente < 7 %)." : band === "intermedio" ? "Riesgo intermedio de mortalidad a 30 d\xEDas (orientativamente \u2248 10 %)." : "Riesgo alto de mortalidad a 30 d\xEDas (orientativamente > 15 %): optimizaci\xF3n y planificaci\xF3n multidisciplinar precoces.",
          level: band === "bajo" ? "ok" : band === "intermedio" ? "warn" : "danger"
        };
      },
      notes: [
        "Los porcentajes son orientativos; la mortalidad exacta por punto var\xEDa entre cohortes de validaci\xF3n.",
        "\xDAtil para informar a pacientes y familias y para priorizar la valoraci\xF3n ortogeri\xE1trica."
      ],
      references: [
        "Maxwell MJ, et al. Development and validation of a preoperative scoring system to predict 30 day mortality in patients undergoing hip fracture surgery. Br J Anaesth. 2008;101(4):511-7.",
        "Wiles MD, et al. Nottingham Hip Fracture Score as a predictor of one year mortality. Br J Anaesth. 2011;106(4):501-4."
      ]
    },
    {
      id: "charlson",
      name: "\xCDndice de comorbilidad de Charlson (CCI)",
      shortName: "Charlson",
      description: "Predice la supervivencia a 10 a\xF1os en pacientes con m\xFAltiples comorbilidades.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 50 a\xF1os", value: 0 },
            { label: "50\u201359 a\xF1os", value: 1 },
            { label: "60\u201369 a\xF1os", value: 2 },
            { label: "70\u201379 a\xF1os", value: 3 },
            { label: "\u2265 80 a\xF1os", value: 4 }
          ]
        },
        { id: "iam", type: "boolean", label: "Infarto de miocardio", description: "Antecedente de IAM (no solo cambios ECG)." },
        { id: "icc", type: "boolean", label: "Insuficiencia card\xEDaca congestiva" },
        { id: "evp", type: "boolean", label: "Enfermedad vascular perif\xE9rica", description: "Incluye claudicaci\xF3n, cirug\xEDa o aneurisma a\xF3rtico \u2265 6 cm." },
        { id: "acv", type: "boolean", label: "Enfermedad cerebrovascular (ACV o AIT)", description: "Con secuelas leves o sin secuelas. La hemiplej\xEDa punt\xFAa aparte." },
        { id: "demencia", type: "boolean", label: "Demencia" },
        { id: "epoc", type: "boolean", label: "Enfermedad pulmonar cr\xF3nica" },
        { id: "conectivo", type: "boolean", label: "Enfermedad del tejido conectivo" },
        { id: "ulcera", type: "boolean", label: "Enfermedad ulcerosa p\xE9ptica" },
        {
          id: "higado",
          type: "select",
          label: "Hepatopat\xEDa",
          options: [
            { label: "Ninguna", value: 0 },
            { label: "Leve (hepatitis cr\xF3nica o cirrosis sin hipertensi\xF3n portal)", value: 1 },
            { label: "Moderada-grave (hipertensi\xF3n portal, varices)", value: 3 }
          ]
        },
        {
          id: "diabetes",
          type: "select",
          label: "Diabetes mellitus",
          options: [
            { label: "No o controlada con dieta", value: 0 },
            { label: "Sin lesi\xF3n de \xF3rgano diana", value: 1 },
            { label: "Con lesi\xF3n de \xF3rgano diana (retinopat\xEDa, nefropat\xEDa, neuropat\xEDa)", value: 2 }
          ]
        },
        { id: "hemiplejia", type: "boolean", label: "Hemiplej\xEDa", points: 2 },
        {
          id: "renal",
          type: "boolean",
          label: "Enfermedad renal moderada-grave",
          description: "Creatinina > 3 mg/dL, di\xE1lisis, trasplante o uremia.",
          points: 2
        },
        {
          id: "tumor",
          type: "select",
          label: "Tumor s\xF3lido",
          options: [
            { label: "No", value: 0 },
            { label: "Localizado (en los \xFAltimos 5 a\xF1os)", value: 2 },
            { label: "Metast\xE1sico", value: 6 }
          ]
        },
        { id: "leucemia", type: "boolean", label: "Leucemia", points: 2 },
        { id: "linfoma", type: "boolean", label: "Linfoma", points: 2 },
        {
          id: "sida",
          type: "boolean",
          label: "SIDA",
          description: "Enfermedad definitoria de SIDA (no solo infecci\xF3n por VIH).",
          points: 6
        }
      ],
      compute: (v) => {
        const score = sum(v, [
          "edad",
          "iam",
          "icc",
          "evp",
          "acv",
          "demencia",
          "epoc",
          "conectivo",
          "ulcera",
          "higado",
          "diabetes",
          "hemiplejia",
          "renal",
          "tumor",
          "leucemia",
          "linfoma",
          "sida"
        ]);
        const surv = Math.pow(0.983, Math.exp(0.9 * score)) * 100;
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: `${fmt(Math.max(surv, 0), surv < 1 ? 1 : 0)} %`,
          secondaryLabel: "supervivencia estimada a 10 a\xF1os",
          interpretation: score <= 2 ? "Carga de comorbilidad baja." : score <= 4 ? "Carga de comorbilidad moderada." : "Carga de comorbilidad alta: pron\xF3stico vital significativamente limitado.",
          level: score <= 2 ? "ok" : score <= 4 ? "warn" : "danger",
          details: [`Supervivencia a 10 a\xF1os = 0,983^e^(0,9 \xD7 ${score}) (f\xF3rmula original de Charlson).`]
        };
      },
      notes: [
        "Versi\xF3n combinada edad-comorbilidad (Charlson-Deyo con puntos por d\xE9cada a partir de los 50 a\xF1os).",
        "Si coexisten dos grados de la misma enfermedad (p. ej., tumor localizado y metast\xE1sico), punt\xFAa solo el m\xE1s grave."
      ],
      references: [
        "Charlson ME, et al. A new method of classifying prognostic comorbidity in longitudinal studies. J Chronic Dis. 1987;40(5):373-83.",
        "Charlson ME, et al. Validation of a combined comorbidity index. J Clin Epidemiol. 1994;47(11):1245-51."
      ]
    },
    {
      id: "dasi",
      name: "\xCDndice de estado de actividad de Duke (DASI)",
      shortName: "DASI",
      description: "Estima la capacidad funcional (VO\u2082 pico y METs) a partir de 12 actividades de la vida diaria.",
      category: CAT,
      specialty: ANES,
      inputs: [
        { id: "q1", type: "boolean", label: "\xBFPuede cuidar de s\xED mismo/a?", description: "Comer, vestirse, ba\xF1arse o ir al ba\xF1o.", points: 2.75 },
        { id: "q2", type: "boolean", label: "\xBFCaminar dentro de casa?", points: 1.75 },
        { id: "q3", type: "boolean", label: "\xBFCaminar 1\u20132 manzanas en llano?", points: 2.75 },
        { id: "q4", type: "boolean", label: "\xBFSubir un tramo de escaleras o una cuesta?", points: 5.5 },
        { id: "q5", type: "boolean", label: "\xBFCorrer una distancia corta?", points: 8 },
        { id: "q6", type: "boolean", label: "\xBFTareas dom\xE9sticas ligeras?", description: "Quitar el polvo, fregar los platos.", points: 2.7 },
        { id: "q7", type: "boolean", label: "\xBFTareas dom\xE9sticas moderadas?", description: "Pasar la aspiradora, barrer, llevar la compra.", points: 3.5 },
        { id: "q8", type: "boolean", label: "\xBFTareas dom\xE9sticas pesadas?", description: "Fregar suelos, levantar o mover muebles.", points: 8 },
        { id: "q9", type: "boolean", label: "\xBFTrabajo de jardiner\xEDa?", description: "Rastrillar hojas, quitar malas hierbas, cortar el c\xE9sped.", points: 4.5 },
        { id: "q10", type: "boolean", label: "\xBFMantener relaciones sexuales?", points: 5.25 },
        { id: "q11", type: "boolean", label: "\xBFActividades recreativas moderadas?", description: "Golf, bolos, baile, tenis en dobles.", points: 6 },
        { id: "q12", type: "boolean", label: "\xBFDeportes extenuantes?", description: "Nataci\xF3n, tenis individual, f\xFAtbol, baloncesto, esqu\xED.", points: 7.5 }
      ],
      compute: (v) => {
        const score = sum(v, ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12"]);
        const vo2 = 0.43 * score + 9.6;
        const mets = vo2 / 3.5;
        return {
          main: fmt(score, 2),
          mainUnit: "puntos (0\u201358,2)",
          secondary: `${fmt(mets, 1)} METs`,
          secondaryLabel: "capacidad funcional estimada",
          interpretation: score >= 34 ? "DASI \u2265 34: buena capacidad funcional, asociada a menor riesgo de complicaciones perioperatorias." : "DASI < 34: capacidad funcional reducida, asociada a mayor riesgo de eventos card\xEDacos y complicaciones tras cirug\xEDa no card\xEDaca.",
          level: score >= 34 ? "ok" : "warn",
          details: [`VO\u2082 pico estimado = 0,43 \xD7 DASI + 9,6 = ${fmt(vo2, 1)} mL/kg/min.`]
        };
      },
      notes: [
        "Cada actividad que el paciente puede realizar suma su peso; las que no puede realizar suman 0.",
        "El umbral DASI < 34 se asoci\xF3 a mayor riesgo de lesi\xF3n mioc\xE1rdica y complicaciones en el estudio METS (2018)."
      ],
      references: [
        "Hlatky MA, et al. A brief self-administered questionnaire to determine functional capacity (the Duke Activity Status Index). Am J Cardiol. 1989;64(10):651-4.",
        "Wijeysundera DN, et al. Assessment of functional capacity before major non-cardiac surgery (METS study). Lancet. 2018;391(10140):2631-40."
      ]
    }
  ];

  // src/calculators/dolor.ts
  var CAT2 = "Dolor";
  var ANES2 = ["Anestesiolog\xEDa"];
  var dolor = [
    {
      id: "flacc",
      name: "Escala FLACC (cara, piernas, actividad, llanto, consolabilidad)",
      shortName: "FLACC",
      description: "Eval\xFAa el dolor postoperatorio en ni\xF1os peque\xF1os (2 meses \u2013 7 a\xF1os) y en pacientes que no pueden comunicarlo.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "cara",
          type: "select",
          label: "Cara",
          dropdown: true,
          options: [
            { label: "0 \u2014 Sin expresi\xF3n particular o sonr\xEDe", value: 0 },
            { label: "1 \u2014 Muecas o ce\xF1o fruncido ocasionales; retra\xEDdo, desinteresado", value: 1 },
            { label: "2 \u2014 Ce\xF1o fruncido frecuente o constante, mand\xEDbula apretada, temblor de ment\xF3n", value: 2 }
          ]
        },
        {
          id: "piernas",
          type: "select",
          label: "Piernas",
          dropdown: true,
          options: [
            { label: "0 \u2014 Posici\xF3n normal o relajadas", value: 0 },
            { label: "1 \u2014 Inquietas, intranquilas, tensas", value: 1 },
            { label: "2 \u2014 Patalea o piernas encogidas", value: 2 }
          ]
        },
        {
          id: "actividad",
          type: "select",
          label: "Actividad",
          dropdown: true,
          options: [
            { label: "0 \u2014 Tumbado tranquilo, posici\xF3n normal, se mueve con facilidad", value: 0 },
            { label: "1 \u2014 Se retuerce, se balancea, tenso", value: 1 },
            { label: "2 \u2014 Arqueado, r\xEDgido o con sacudidas", value: 2 }
          ]
        },
        {
          id: "llanto",
          type: "select",
          label: "Llanto",
          dropdown: true,
          options: [
            { label: "0 \u2014 Sin llanto (despierto o dormido)", value: 0 },
            { label: "1 \u2014 Gemidos o lloriqueos; quejas ocasionales", value: 1 },
            { label: "2 \u2014 Llanto mantenido, gritos o sollozos; quejas frecuentes", value: 2 }
          ]
        },
        {
          id: "consolabilidad",
          type: "select",
          label: "Consolabilidad",
          dropdown: true,
          options: [
            { label: "0 \u2014 Contento, relajado", value: 0 },
            { label: "1 \u2014 Se tranquiliza al tocarlo, abrazarlo o hablarle; distra\xEDble", value: 1 },
            { label: "2 \u2014 Dif\xEDcil de consolar o reconfortar", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["cara", "piernas", "actividad", "llanto", "consolabilidad"]);
        const band = score === 0 ? "Relajado y c\xF3modo" : score <= 3 ? "Malestar leve" : score <= 6 ? "Dolor moderado" : "Dolor intenso o malestar importante";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          interpretation: `${band}.${score >= 4 ? " Valorar analgesia y reevaluar tras la intervenci\xF3n." : ""}`,
          level: score === 0 ? "ok" : score <= 3 ? "info" : score <= 6 ? "warn" : "danger"
        };
      },
      notes: [
        "0: relajado \xB7 1\u20133: malestar leve \xB7 4\u20136: dolor moderado \xB7 7\u201310: dolor intenso.",
        "Observar 1\u20135 minutos con el paciente descubierto; recolocar o observar durante la movilizaci\xF3n si est\xE1 dormido."
      ],
      references: [
        "Merkel SI, et al. The FLACC: a behavioral scale for scoring postoperative pain in young children. Pediatr Nurs. 1997;23(3):293-7."
      ]
    },
    {
      id: "bps",
      name: "Escala de dolor conductual (BPS) para pacientes intubados",
      shortName: "BPS",
      description: "Cuantifica el dolor en pacientes cr\xEDticos intubados y sedados mediante tres indicadores conductuales.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "facial",
          type: "select",
          label: "Expresi\xF3n facial",
          dropdown: true,
          options: [
            { label: "1 \u2014 Relajada", value: 1 },
            { label: "2 \u2014 Parcialmente tensa (p. ej., ce\xF1o fruncido)", value: 2 },
            { label: "3 \u2014 Totalmente tensa (p. ej., p\xE1rpados apretados)", value: 3 },
            { label: "4 \u2014 Muecas de dolor", value: 4 }
          ]
        },
        {
          id: "miembros",
          type: "select",
          label: "Miembros superiores",
          dropdown: true,
          options: [
            { label: "1 \u2014 Sin movimiento", value: 1 },
            { label: "2 \u2014 Parcialmente flexionados", value: 2 },
            { label: "3 \u2014 Muy flexionados con flexi\xF3n de los dedos", value: 3 },
            { label: "4 \u2014 Retracci\xF3n permanente", value: 4 }
          ]
        },
        {
          id: "ventilacion",
          type: "select",
          label: "Adaptaci\xF3n a la ventilaci\xF3n mec\xE1nica",
          dropdown: true,
          options: [
            { label: "1 \u2014 Tolera la ventilaci\xF3n", value: 1 },
            { label: "2 \u2014 Tose, pero tolera la ventilaci\xF3n la mayor parte del tiempo", value: 2 },
            { label: "3 \u2014 Lucha contra el ventilador", value: 3 },
            { label: "4 \u2014 Imposible controlar la ventilaci\xF3n", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["facial", "miembros", "ventilacion"]);
        return {
          main: String(score),
          mainUnit: "puntos (3\u201312)",
          interpretation: score === 3 ? "Sin dolor aparente." : score <= 5 ? "Dolor leve: vigilar y reevaluar." : score <= 8 ? "Dolor significativo (BPS \u2265 6): se recomienda tratar y reevaluar." : "Dolor intenso: tratamiento analg\xE9sico inmediato y reevaluaci\xF3n.",
          level: score === 3 ? "ok" : score <= 5 ? "info" : score <= 8 ? "warn" : "danger"
        };
      },
      notes: [
        "Un BPS \u2265 6 se considera dolor significativo que requiere tratamiento.",
        "Existe la variante BPS-NI (no intubados) que sustituye el \xEDtem ventilatorio por la vocalizaci\xF3n."
      ],
      references: [
        "Payen JF, et al. Assessing pain in critically ill sedated patients by using a behavioral pain scale. Crit Care Med. 2001;29(12):2258-63."
      ]
    },
    {
      id: "nvps",
      name: "Escala de dolor no verbal (NVPS)",
      shortName: "NVPS",
      description: "Cuantifica el dolor en pacientes que no pueden comunicarse (intubaci\xF3n, sedaci\xF3n, demencia\u2026).",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "cara",
          type: "select",
          label: "Cara",
          dropdown: true,
          options: [
            { label: "0 \u2014 Sin expresi\xF3n particular o sonrisa", value: 0 },
            { label: "1 \u2014 Muecas, ce\xF1o fruncido o gesto de dolor ocasionales", value: 1 },
            { label: "2 \u2014 Muecas o gesto de dolor frecuentes", value: 2 }
          ]
        },
        {
          id: "actividad",
          type: "select",
          label: "Actividad (movimiento)",
          dropdown: true,
          options: [
            { label: "0 \u2014 Tumbado tranquilo, posici\xF3n normal", value: 0 },
            { label: "1 \u2014 Movimientos lentos y cautelosos; se toca o se\xF1ala la zona dolorida", value: 1 },
            { label: "2 \u2014 Inquieto, actividad excesiva o rituales de protecci\xF3n", value: 2 }
          ]
        },
        {
          id: "defensa",
          type: "select",
          label: "Defensa (guarding)",
          dropdown: true,
          options: [
            { label: "0 \u2014 Tumbado tranquilo, sin posici\xF3n protectora", value: 0 },
            { label: "1 \u2014 Protege zonas del cuerpo o adopta postura anti\xE1lgica", value: 1 },
            { label: "2 \u2014 R\xEDgido, tenso", value: 2 }
          ]
        },
        {
          id: "fisio1",
          type: "select",
          label: "Fisiol\xF3gico I (constantes vitales)",
          dropdown: true,
          options: [
            { label: "0 \u2014 Constantes estables, sin cambios en las \xFAltimas 4 h", value: 0 },
            { label: "1 \u2014 Cambio en las \xFAltimas 4 h: PAS > 20 mmHg o FC > 20 lpm sobre la basal", value: 1 },
            { label: "2 \u2014 Cambio en las \xFAltimas 4 h: PAS > 30 mmHg o FC > 25 lpm sobre la basal", value: 2 }
          ]
        },
        {
          id: "fisio2",
          type: "select",
          label: "Fisiol\xF3gico II (respiratorio)",
          dropdown: true,
          options: [
            { label: "0 \u2014 FR basal / SpO\u2082 basal; adaptado al ventilador", value: 0 },
            { label: "1 \u2014 FR > 10 rpm sobre la basal, o descenso de SpO\u2082 del 5 %; asincron\xEDa leve", value: 1 },
            { label: "2 \u2014 FR > 20 rpm sobre la basal, o descenso de SpO\u2082 del 10 %; lucha con el ventilador", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["cara", "actividad", "defensa", "fisio1", "fisio2"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          interpretation: score <= 2 ? "Ausencia de dolor o dolor leve." : score <= 6 ? "Dolor moderado: se recomienda intervenci\xF3n analg\xE9sica y reevaluaci\xF3n." : "Dolor intenso: tratamiento analg\xE9sico inmediato.",
          level: score <= 2 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      notes: [
        "Los puntos de corte no est\xE1n tan estandarizados como en otras escalas: usar como tendencia y reevaluar tras cada intervenci\xF3n."
      ],
      references: [
        "Odhner M, et al. Assessing pain control in nonverbal critically ill adults. Dimens Crit Care Nurs. 2003;22(6):260-7."
      ]
    },
    {
      id: "cheops",
      name: "Escala CHEOPS de dolor pedi\xE1trico postoperatorio",
      shortName: "CHEOPS",
      description: "Cuantifica el dolor postoperatorio en pacientes pedi\xE1tricos de 1 a 5 a\xF1os.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "llanto",
          type: "select",
          label: "Llanto",
          dropdown: true,
          options: [
            { label: "1 \u2014 No llora", value: 1 },
            { label: "2 \u2014 Gime o llora", value: 2 },
            { label: "3 \u2014 Grita o solloza", value: 3 }
          ]
        },
        {
          id: "facial",
          type: "select",
          label: "Expresi\xF3n facial",
          dropdown: true,
          options: [
            { label: "0 \u2014 Sonriente", value: 0 },
            { label: "1 \u2014 Serena, neutra", value: 1 },
            { label: "2 \u2014 Muecas de dolor", value: 2 }
          ]
        },
        {
          id: "verbal",
          type: "select",
          label: "Expresi\xF3n verbal",
          dropdown: true,
          options: [
            { label: "0 \u2014 Habla de otras cosas en positivo, sin quejas", value: 0 },
            { label: "1 \u2014 No habla, o se queja de otras cosas", value: 1 },
            { label: "2 \u2014 Se queja de dolor", value: 2 }
          ]
        },
        {
          id: "torso",
          type: "select",
          label: "Torso",
          dropdown: true,
          options: [
            { label: "1 \u2014 Posici\xF3n neutra, cuerpo en reposo", value: 1 },
            { label: "2 \u2014 Cambia de postura, tenso, erguido, tiritando o sujeto", value: 2 }
          ]
        },
        {
          id: "tacto",
          type: "select",
          label: "Tacto (herida)",
          dropdown: true,
          options: [
            { label: "1 \u2014 No toca la herida", value: 1 },
            { label: "2 \u2014 Alcanza, toca o agarra la herida, o tiene los brazos sujetos", value: 2 }
          ]
        },
        {
          id: "piernas",
          type: "select",
          label: "Piernas",
          dropdown: true,
          options: [
            { label: "1 \u2014 Posici\xF3n neutra", value: 1 },
            { label: "2 \u2014 Se retuerce, patalea, piernas encogidas, de pie o sujetas", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["llanto", "facial", "verbal", "torso", "tacto", "piernas"]);
        return {
          main: String(score),
          mainUnit: "puntos (4\u201313)",
          interpretation: score === 4 ? "Sin dolor aparente." : score <= 7 ? "Dolor leve-moderado: vigilar, medidas de confort y valorar analgesia." : "Dolor intenso (\u2265 8): se recomienda administrar analgesia y reevaluar.",
          level: score === 4 ? "ok" : score <= 7 ? "warn" : "danger"
        };
      },
      notes: ["La puntuaci\xF3n m\xEDnima es 4. Un valor \u2265 8 se usa habitualmente como umbral para tratar."],
      references: [
        "McGrath PJ, et al. CHEOPS: a behavioral scale for rating postoperative pain in children. Adv Pain Res Ther. 1985;9:395-402."
      ]
    },
    {
      id: "bops",
      name: "Escala de dolor observacional conductual (BOPS)",
      shortName: "BOPS",
      description: "Cuantifica el dolor postoperatorio en ni\xF1os de 1 a 7 a\xF1os.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "facial",
          type: "select",
          label: "Expresi\xF3n facial",
          dropdown: true,
          options: [
            { label: "0 \u2014 Neutra o positiva", value: 0 },
            { label: "1 \u2014 Expresi\xF3n negativa (ce\xF1o, muecas ocasionales)", value: 1 },
            { label: "2 \u2014 Expresi\xF3n claramente negativa y mantenida", value: 2 }
          ]
        },
        {
          id: "verbal",
          type: "select",
          label: "Verbalizaci\xF3n",
          dropdown: true,
          options: [
            { label: "0 \u2014 Tranquilo, no se queja", value: 0 },
            { label: "1 \u2014 Se queja o gime, se distrae con facilidad", value: 1 },
            { label: "2 \u2014 Llanto o quejas de dolor persistentes", value: 2 }
          ]
        },
        {
          id: "postura",
          type: "select",
          label: "Posici\xF3n corporal",
          dropdown: true,
          options: [
            { label: "0 \u2014 Neutra, relajada", value: 0 },
            { label: "1 \u2014 Inquieto, tenso, cambia de postura", value: 1 },
            { label: "2 \u2014 R\xEDgido o protege/se\xF1ala la zona dolorida", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["facial", "verbal", "postura"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20136)",
          interpretation: score < 3 ? "Dolor leve o ausente: continuar con medidas de confort y reevaluaci\xF3n peri\xF3dica." : "BOPS \u2265 3: se recomienda administrar analgesia y reevaluar (a los 15\u201320 min si es IV; a los 30\u201345 min si es oral o rectal).",
          level: score < 3 ? "ok" : "warn"
        };
      },
      notes: ["Reevaluar cada 3 horas y tras cada intervenci\xF3n analg\xE9sica."],
      references: [
        "Hesselgard K, et al. Validity and reliability of the Behavioural Observational Pain Scale for postoperative pain measurement in children 1\u20137 years of age. Pediatr Crit Care Med. 2007;8(2):102-8."
      ]
    },
    {
      id: "abbey",
      name: "Escala de dolor de Abbey para pacientes con demencia",
      shortName: "Abbey",
      description: "Eval\xFAa el dolor en pacientes con demencia avanzada que no pueden verbalizarlo.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "voz",
          type: "select",
          label: "Vocalizaci\xF3n",
          description: "Gimoteos, quejidos, llanto.",
          dropdown: true,
          options: [
            { label: "0 \u2014 Ausente", value: 0 },
            { label: "1 \u2014 Leve", value: 1 },
            { label: "2 \u2014 Moderada", value: 2 },
            { label: "3 \u2014 Grave", value: 3 }
          ]
        },
        {
          id: "facial",
          type: "select",
          label: "Expresi\xF3n facial",
          description: "Tensi\xF3n, ce\xF1o fruncido, muecas, aspecto asustado.",
          dropdown: true,
          options: [
            { label: "0 \u2014 Ausente", value: 0 },
            { label: "1 \u2014 Leve", value: 1 },
            { label: "2 \u2014 Moderada", value: 2 },
            { label: "3 \u2014 Grave", value: 3 }
          ]
        },
        {
          id: "corporal",
          type: "select",
          label: "Cambios en el lenguaje corporal",
          description: "Inquietud, balanceo, protege una parte del cuerpo, retraimiento.",
          dropdown: true,
          options: [
            { label: "0 \u2014 Ausentes", value: 0 },
            { label: "1 \u2014 Leves", value: 1 },
            { label: "2 \u2014 Moderados", value: 2 },
            { label: "3 \u2014 Graves", value: 3 }
          ]
        },
        {
          id: "conducta",
          type: "select",
          label: "Cambios de conducta",
          description: "Mayor confusi\xF3n, rechazo de la comida, alteraci\xF3n de patrones habituales.",
          dropdown: true,
          options: [
            { label: "0 \u2014 Ausentes", value: 0 },
            { label: "1 \u2014 Leves", value: 1 },
            { label: "2 \u2014 Moderados", value: 2 },
            { label: "3 \u2014 Graves", value: 3 }
          ]
        },
        {
          id: "fisio",
          type: "select",
          label: "Cambios fisiol\xF3gicos",
          description: "Temperatura, pulso o presi\xF3n arterial fuera de rango; sudoraci\xF3n, rubor o palidez.",
          dropdown: true,
          options: [
            { label: "0 \u2014 Ausentes", value: 0 },
            { label: "1 \u2014 Leves", value: 1 },
            { label: "2 \u2014 Moderados", value: 2 },
            { label: "3 \u2014 Graves", value: 3 }
          ]
        },
        {
          id: "fisicos",
          type: "select",
          label: "Cambios f\xEDsicos",
          description: "Lesiones cut\xE1neas, zonas de presi\xF3n, artritis, contracturas, lesiones previas.",
          dropdown: true,
          options: [
            { label: "0 \u2014 Ausentes", value: 0 },
            { label: "1 \u2014 Leves", value: 1 },
            { label: "2 \u2014 Moderados", value: 2 },
            { label: "3 \u2014 Graves", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["voz", "facial", "corporal", "conducta", "fisio", "fisicos"]);
        const band = score <= 2 ? "Sin dolor" : score <= 7 ? "Dolor leve" : score <= 13 ? "Dolor moderado" : "Dolor intenso";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201318)",
          interpretation: `${band}.${score >= 3 ? " Tratar seg\xFAn intensidad y reevaluar 1 hora despu\xE9s de la intervenci\xF3n." : ""}`,
          level: score <= 2 ? "ok" : score <= 7 ? "info" : score <= 13 ? "warn" : "danger"
        };
      },
      notes: [
        "0\u20132: sin dolor \xB7 3\u20137: leve \xB7 8\u201313: moderado \xB7 \u226514: intenso.",
        "Registrar tambi\xE9n si el dolor parece cr\xF3nico, agudo o agudo sobre cr\xF3nico.",
        "Evaluar durante la movilizaci\xF3n si es posible."
      ],
      references: [
        "Abbey J, et al. The Abbey pain scale: a 1-minute numerical indicator for people with end-stage dementia. Int J Palliat Nurs. 2004;10(1):6-13."
      ]
    },
    {
      id: "nps",
      name: "Escala de dolor neurop\xE1tico (NPS)",
      shortName: "NPS",
      description: "Cuantifica la gravedad y las cualidades del dolor neurop\xE1tico; \xFAtil para seguir la respuesta al tratamiento.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        { id: "i1", type: "number", label: "Intensidad del dolor", description: "0 = sin dolor; 10 = el dolor m\xE1s intenso imaginable.", min: 0, max: 10, step: 1 },
        { id: "i2", type: "number", label: "Dolor agudo / punzante", description: "\xABComo un cuchillo o agujas\xBB. 0\u201310.", min: 0, max: 10, step: 1 },
        { id: "i3", type: "number", label: "Dolor caliente / quemante", description: "\xABComo si quemara\xBB. 0\u201310.", min: 0, max: 10, step: 1 },
        { id: "i4", type: "number", label: "Dolor sordo / opresivo", description: "\xABDolor profundo y continuo\xBB. 0\u201310.", min: 0, max: 10, step: 1 },
        { id: "i5", type: "number", label: "Dolor fr\xEDo / helado", description: "\xABComo congelaci\xF3n\xBB. 0\u201310.", min: 0, max: 10, step: 1 },
        { id: "i6", type: "number", label: "Sensibilidad al tacto", description: "Dolor con el roce o la ropa (alodinia). 0\u201310.", min: 0, max: 10, step: 1 },
        { id: "i7", type: "number", label: "Picor", description: "0\u201310.", min: 0, max: 10, step: 1 },
        { id: "i8", type: "number", label: "Desagrado", description: "Cu\xE1n desagradable resulta el dolor. 0\u201310.", min: 0, max: 10, step: 1 },
        { id: "i9", type: "number", label: "Intensidad del dolor profundo", description: "0\u201310.", min: 0, max: 10, step: 1 },
        { id: "i10", type: "number", label: "Intensidad del dolor superficial", description: "0\u201310.", min: 0, max: 10, step: 1 }
      ],
      compute: (v) => {
        const ids = ["i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8", "i9", "i10"];
        const bad = ids.some((id) => (v[id] ?? 0) < 0 || (v[id] ?? 0) > 10);
        if (bad)
          return {
            main: "\u2014",
            interpretation: "Cada \xEDtem debe puntuarse entre 0 y 10.",
            level: "warn"
          };
        const score = sum(v, ids);
        return {
          main: fmt(score),
          mainUnit: "puntos (0\u2013100)",
          interpretation: "No existen puntos de corte diagn\xF3sticos: la NPS sirve para caracterizar las cualidades del dolor neurop\xE1tico y monitorizar la respuesta al tratamiento comparando puntuaciones sucesivas.",
          level: "info"
        };
      },
      notes: [
        "Tambi\xE9n se pueden analizar los \xEDtems por separado (p. ej., mejora del componente quemante frente al punzante).",
        "Para diagn\xF3stico de dolor neurop\xE1tico se recomiendan herramientas espec\xEDficas (DN4, LANSS)."
      ],
      references: [
        "Galer BS, Jensen MP. Development and preliminary validation of a pain measure specific to neuropathic pain: the Neuropathic Pain Scale. Neurology. 1997;48(2):332-8."
      ]
    }
  ];

  // src/calculators/viaaerea.ts
  var CAT3 = "V\xEDa a\xE9rea";
  var ANES3 = ["Anestesiolog\xEDa"];
  var viaAerea = [
    {
      id: "mallampati",
      name: "Clasificaci\xF3n de Mallampati modificada",
      shortName: "Mallampati",
      description: "Clasifica la dificultad prevista de la intubaci\xF3n endotraqueal seg\xFAn las estructuras orofar\xEDngeas visibles.",
      category: CAT3,
      specialty: ANES3,
      inputs: [
        {
          id: "clase",
          type: "select",
          label: "Estructuras visibles con la boca abierta y la lengua fuera (sin fonar)",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Clase I \u2014 Paladar blando, fauces, \xFAvula y pilares visibles", value: 1 },
            { label: "Clase II \u2014 Paladar blando, fauces y \xFAvula visibles (pilares ocultos)", value: 2 },
            { label: "Clase III \u2014 Paladar blando y base de la \xFAvula visibles", value: 3 },
            { label: "Clase IV \u2014 Solo paladar duro visible", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const c = v.clase ?? 1;
        return {
          main: `Clase ${["", "I", "II", "III", "IV"][c]}`,
          interpretation: c <= 2 ? "Predice, en general, una laringoscopia sin dificultad especial." : "Las clases III\u2013IV se asocian a mayor probabilidad de laringoscopia e intubaci\xF3n dif\xEDciles: preparar plan alternativo (videolaringoscopio, dispositivos supragl\xF3ticos, fibroscopio).",
          level: c <= 2 ? "ok" : c === 3 ? "warn" : "danger"
        };
      },
      notes: [
        "Evaluar con el paciente sentado, cabeza neutra, boca abierta al m\xE1ximo y lengua protruida sin fonaci\xF3n.",
        "De forma aislada tiene sensibilidad limitada: combinar con otros predictores (apertura oral, distancia tiromentoniana, movilidad cervical\u2026)."
      ],
      references: [
        "Mallampati SR, et al. A clinical sign to predict difficult tracheal intubation: a prospective study. Can Anaesth Soc J. 1985;32(4):429-34.",
        "Samsoon GL, Young JR. Difficult tracheal intubation: a retrospective study. Anaesthesia. 1987;42(5):487-90."
      ]
    },
    {
      id: "el-ganzouri",
      name: "\xCDndice de riesgo de El-Ganzouri (EGRI) para v\xEDa a\xE9rea dif\xEDcil",
      shortName: "El-Ganzouri",
      description: "Predice el riesgo de laringoscopia e intubaci\xF3n dif\xEDciles combinando siete variables preoperatorias.",
      category: CAT3,
      specialty: ANES3,
      inputs: [
        {
          id: "apertura",
          type: "select",
          label: "Apertura oral",
          options: [
            { label: "\u2265 4 cm", value: 0 },
            { label: "< 4 cm", value: 1 }
          ]
        },
        {
          id: "tiromentoniana",
          type: "select",
          label: "Distancia tiromentoniana",
          options: [
            { label: "> 6,5 cm", value: 0 },
            { label: "6\u20136,5 cm", value: 1 },
            { label: "< 6 cm", value: 2 }
          ]
        },
        {
          id: "mallampati",
          type: "select",
          label: "Clase de Mallampati",
          options: [
            { label: "I", value: 0 },
            { label: "II", value: 1 },
            { label: "III o IV", value: 2 }
          ]
        },
        {
          id: "cuello",
          type: "select",
          label: "Movilidad cervical",
          options: [
            { label: "> 90\xB0", value: 0 },
            { label: "80\u201390\xB0", value: 1 },
            { label: "< 80\xB0", value: 2 }
          ]
        },
        {
          id: "prognatismo",
          type: "select",
          label: "\xBFPuede adelantar la mand\xEDbula (prognatismo)?",
          options: [
            { label: "S\xED", value: 0 },
            { label: "No", value: 1 }
          ]
        },
        {
          id: "peso",
          type: "select",
          label: "Peso corporal",
          options: [
            { label: "< 90 kg", value: 0 },
            { label: "90\u2013110 kg", value: 1 },
            { label: "> 110 kg", value: 2 }
          ]
        },
        {
          id: "antecedente",
          type: "select",
          label: "Antecedente de intubaci\xF3n dif\xEDcil",
          options: [
            { label: "No", value: 0 },
            { label: "Dudoso", value: 1 },
            { label: "Confirmado", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["apertura", "tiromentoniana", "mallampati", "cuello", "prognatismo", "peso", "antecedente"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201312)",
          interpretation: score < 4 ? "Riesgo bajo de laringoscopia dif\xEDcil; mantener siempre un plan alternativo disponible." : "EGRI \u2265 4: riesgo elevado de laringoscopia/intubaci\xF3n dif\xEDcil. Planificar de entrada t\xE9cnica alternativa (videolaringoscopia, intubaci\xF3n despierto con fibroscopio seg\xFAn contexto).",
          level: score < 4 ? "ok" : "danger"
        };
      },
      references: [
        "El-Ganzouri AR, et al. Preoperative airway assessment: predictive value of a multivariate risk index. Anesth Analg. 1996;82(6):1197-204."
      ]
    },
    {
      id: "heaven",
      name: "Criterios HEAVEN para v\xEDa a\xE9rea dif\xEDcil en intubaci\xF3n de emergencia",
      shortName: "HEAVEN",
      description: "Identifica atributos asociados a intubaci\xF3n dif\xEDcil en la secuencia r\xE1pida de emergencia.",
      category: CAT3,
      specialty: ANES3,
      inputs: [
        {
          id: "h",
          type: "boolean",
          label: "Hipoxemia (Hypoxaemia)",
          description: "SpO\u2082 \u2264 93 % en el momento de la laringoscopia inicial."
        },
        {
          id: "e1",
          type: "boolean",
          label: "Extremos de tama\xF1o (Extremes of size)",
          description: "Paciente pedi\xE1trico (< 8 a\xF1os) u obesidad cl\xEDnica."
        },
        {
          id: "a",
          type: "boolean",
          label: "Reto anat\xF3mico (Anatomic challenge)",
          description: "Traumatismo, masas, hinchaz\xF3n, cuerpo extra\xF1o u otra anomal\xEDa estructural que limite la visi\xF3n laringosc\xF3pica."
        },
        {
          id: "v",
          type: "boolean",
          label: "V\xF3mito / sangre / l\xEDquido (Vomit, blood, fluid)",
          description: "Presentes cl\xEDnicamente en la faringe o hipofaringe."
        },
        {
          id: "e2",
          type: "boolean",
          label: "Exanguinaci\xF3n / anemia (Exsanguination)",
          description: "Sospecha de anemia grave que acelera la desaturaci\xF3n durante la apnea."
        },
        {
          id: "n",
          type: "boolean",
          label: "Cuello (Neck)",
          description: "Movilidad cervical limitada (artrosis grave, inmovilizaci\xF3n, collar\xEDn\u2026)."
        }
      ],
      compute: (v) => {
        const score = sum(v, ["h", "e1", "a", "v", "e2", "n"]);
        return {
          main: String(score),
          mainUnit: score === 1 ? "criterio" : "criterios",
          interpretation: score === 0 ? "Sin criterios HEAVEN: se prev\xE9 menor dificultad para la intubaci\xF3n de secuencia r\xE1pida." : "Presencia de criterios HEAVEN: anticipar v\xEDa a\xE9rea dif\xEDcil; a m\xE1s criterios, menor probabilidad de \xE9xito al primer intento. Optimizar preoxigenaci\xF3n, posici\xF3n, dispositivo y plan de rescate.",
          level: score === 0 ? "ok" : score <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Kuzmack E, et al. A novel difficult-airway prediction tool for emergency airway management: validation of the HEAVEN criteria in a large air medical cohort. J Emerg Med. 2018;54(4):395-401."
      ]
    }
  ];

  // src/calculators/respiratorio.ts
  var CAT4 = "Respiratorio y ventilaci\xF3n";
  var ANES4 = ["Anestesiolog\xEDa"];
  var respiratorio = [
    {
      id: "spo2-fio2",
      name: "Relaci\xF3n SpO\u2082/FiO\u2082 (\xEDndice S/F)",
      shortName: "SpO\u2082/FiO\u2082",
      description: "Eval\xFAa la oxigenaci\xF3n de forma no invasiva; se correlaciona con la relaci\xF3n PaO\u2082/FiO\u2082.",
      category: CAT4,
      specialty: ANES4,
      inputs: [
        { id: "spo2", type: "number", label: "SpO\u2082", unit: "%", min: 50, max: 100 },
        { id: "fio2", type: "number", label: "FiO\u2082", unit: "%", min: 21, max: 100 }
      ],
      compute: (v) => {
        const ratio = v.spo2 / (v.fio2 / 100);
        return {
          main: fmt(ratio, 0),
          interpretation: ratio <= 235 ? "S/F \u2264 235 \u2248 PaO\u2082/FiO\u2082 \u2264 200: hipoxemia moderada-grave (rango de SDRA moderado)." : ratio <= 315 ? "S/F \u2264 315 \u2248 PaO\u2082/FiO\u2082 \u2264 300: hipoxemia compatible con SDRA leve / insuficiencia respiratoria aguda." : "Oxigenaci\xF3n conservada seg\xFAn el \xEDndice S/F.",
          level: ratio <= 235 ? "danger" : ratio <= 315 ? "warn" : "ok",
          details: ["Correlaci\xF3n de Rice: S/F 235 \u2248 P/F 200; S/F 315 \u2248 P/F 300."]
        };
      },
      notes: [
        "Menos fiable con SpO\u2082 > 97 % (zona plana de la curva de disociaci\xF3n de la hemoglobina).",
        "La medici\xF3n debe hacerse con una se\xF1al de pulsioximetr\xEDa de buena calidad."
      ],
      references: [
        "Rice TW, et al. Comparison of the SpO2/FiO2 ratio and the PaO2/FiO2 ratio in patients with acute lung injury or ARDS. Chest. 2007;132(2):410-7."
      ]
    },
    {
      id: "rdos",
      name: "Escala de observaci\xF3n de dificultad respiratoria (RDOS)",
      shortName: "RDOS",
      description: "Cuantifica la dificultad respiratoria en pacientes que no pueden comunicar su disnea.",
      category: CAT4,
      specialty: ANES4,
      inputs: [
        {
          id: "fc",
          type: "select",
          label: "Frecuencia card\xEDaca (lpm)",
          options: [
            { label: "< 90", value: 0 },
            { label: "90\u2013109", value: 1 },
            { label: "\u2265 110", value: 2 }
          ]
        },
        {
          id: "fr",
          type: "select",
          label: "Frecuencia respiratoria (rpm)",
          options: [
            { label: "\u2264 18", value: 0 },
            { label: "19\u201330", value: 1 },
            { label: "> 30", value: 2 }
          ]
        },
        {
          id: "inquietud",
          type: "select",
          label: "Inquietud: movimientos no intencionados",
          options: [
            { label: "No", value: 0 },
            { label: "Ocasionales", value: 1 },
            { label: "Frecuentes", value: 2 }
          ]
        },
        {
          id: "paradojica",
          type: "select",
          label: "Respiraci\xF3n parad\xF3jica abdominal",
          description: "El abdomen se hunde en la inspiraci\xF3n.",
          options: [
            { label: "No", value: 0 },
            { label: "S\xED", value: 2 }
          ]
        },
        {
          id: "accesoria",
          type: "select",
          label: "Uso de musculatura accesoria",
          description: "Elevaci\xF3n de la clav\xEDcula en la inspiraci\xF3n.",
          options: [
            { label: "No", value: 0 },
            { label: "Elevaci\xF3n leve", value: 1 },
            { label: "Elevaci\xF3n pronunciada", value: 2 }
          ]
        },
        {
          id: "quejido",
          type: "select",
          label: "Quejido al final de la espiraci\xF3n",
          description: "Sonido gutural.",
          options: [
            { label: "No", value: 0 },
            { label: "S\xED", value: 2 }
          ]
        },
        {
          id: "aleteo",
          type: "select",
          label: "Aleteo nasal",
          description: "Movimiento involuntario de las alas nasales.",
          options: [
            { label: "No", value: 0 },
            { label: "S\xED", value: 2 }
          ]
        },
        {
          id: "miedo",
          type: "select",
          label: "Expresi\xF3n facial de miedo o angustia",
          description: "Ojos muy abiertos, musculatura facial tensa, ce\xF1o fruncido, boca abierta.",
          options: [
            { label: "No", value: 0 },
            { label: "S\xED", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["fc", "fr", "inquietud", "paradojica", "accesoria", "quejido", "aleteo", "miedo"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201316)",
          interpretation: score <= 2 ? "Dificultad respiratoria escasa o ausente." : score <= 6 ? "Dificultad respiratoria moderada: valorar tratamiento sintom\xE1tico y de la causa." : "Dificultad respiratoria grave: tratamiento paliativo/etiol\xF3gico urgente.",
          level: score <= 2 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      notes: [
        "Dise\xF1ada y validada sobre todo en cuidados paliativos y pacientes incapaces de autoinformar la disnea.",
        "Un valor \u2265 3 indica presencia de distr\xE9s respiratorio cl\xEDnicamente relevante."
      ],
      references: [
        "Campbell ML, et al. A Respiratory Distress Observation Scale for patients unable to self-report dyspnea. J Palliat Med. 2008;11(1):44-50."
      ]
    }
  ];

  // src/calculators/hemodinamica.ts
  var CAT5 = "Hemodin\xE1mica y fluidos";
  var ANES5 = ["Anestesiolog\xEDa"];
  var hemodinamica = [
    {
      id: "pam",
      name: "Presi\xF3n arterial media (PAM)",
      shortName: "PAM",
      description: "Calcula la presi\xF3n de perfusi\xF3n media a partir de la PA sist\xF3lica y diast\xF3lica.",
      category: CAT5,
      specialty: ANES5,
      inputs: [
        { id: "pas", type: "number", label: "Presi\xF3n arterial sist\xF3lica", unit: "mmHg", min: 0, max: 300 },
        { id: "pad", type: "number", label: "Presi\xF3n arterial diast\xF3lica", unit: "mmHg", min: 0, max: 200 }
      ],
      compute: (v) => {
        const pas = v.pas;
        const pad = v.pad;
        if (pad > pas)
          return {
            main: "\u2014",
            interpretation: "La presi\xF3n diast\xF3lica no puede ser mayor que la sist\xF3lica.",
            level: "warn"
          };
        const pam = (pas + 2 * pad) / 3;
        return {
          main: fmt(pam, 0),
          mainUnit: "mmHg",
          interpretation: pam < 65 ? "PAM < 65 mmHg: riesgo de hipoperfusi\xF3n tisular; objetivo habitual en shock \u2265 65 mmHg." : pam <= 110 ? "PAM dentro del rango habitual (aprox. 70\u2013100 mmHg)." : "PAM elevada.",
          level: pam < 65 ? "danger" : pam <= 110 ? "ok" : "warn",
          details: ["PAM = (PAS + 2 \xD7 PAD) / 3."]
        };
      },
      notes: [
        "La f\xF3rmula asume una frecuencia card\xEDaca normal; con taquicardia importante infraestima la PAM real."
      ]
    },
    {
      id: "mabl",
      name: "P\xE9rdida m\xE1xima de sangre permitida (PMSP)",
      shortName: "PMSP / MABL",
      description: "Estima cu\xE1nta sangre puede perderse durante la cirug\xEDa antes de plantear una transfusi\xF3n.",
      category: CAT5,
      specialty: ANES5,
      inputs: [
        {
          id: "poblacion",
          type: "select",
          label: "Grupo de edad / sexo",
          description: "Determina la volemia estimada por kg.",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Neonato prematuro (\u2248 96 mL/kg)", value: 96 },
            { label: "Neonato a t\xE9rmino (\u2248 85 mL/kg)", value: 85 },
            { label: "Lactante (\u2248 80 mL/kg)", value: 80 },
            { label: "Ni\xF1o (\u2248 70 mL/kg)", value: 70 },
            { label: "Var\xF3n adulto (\u2248 75 mL/kg)", value: 75 },
            { label: "Mujer adulta (\u2248 65 mL/kg)", value: 65 }
          ],
          default: 75
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 0.3, max: 300 },
        { id: "hi", type: "number", label: "Hematocrito inicial", unit: "%", min: 10, max: 70 },
        { id: "hf", type: "number", label: "Hematocrito m\xEDnimo aceptable", unit: "%", min: 10, max: 60 }
      ],
      compute: (v) => {
        const ebv = (v.poblacion ?? 75) * v.peso;
        if (v.hf >= v.hi)
          return {
            main: "\u2014",
            interpretation: "El hematocrito inicial debe ser mayor que el m\xEDnimo aceptable.",
            level: "warn"
          };
        const mabl = ebv * (v.hi - v.hf) / v.hi;
        return {
          main: fmt(mabl, 0),
          mainUnit: "mL",
          interpretation: "P\xE9rdida sangu\xEDnea estimada a partir de la cual se debe valorar la transfusi\xF3n, junto con la cl\xEDnica y la monitorizaci\xF3n.",
          level: "info",
          details: [
            `Volemia estimada: ${fmt(ebv, 0)} mL.`,
            "F\xF3rmula: PMSP = volemia \xD7 (Hto inicial \u2212 Hto m\xEDnimo) / Hto inicial."
          ]
        };
      },
      notes: [
        "Puede calcularse igualmente con hemoglobina en lugar de hematocrito.",
        "Algunas variantes usan el hematocrito medio en el denominador; la diferencia es peque\xF1a.",
        "Es una estimaci\xF3n est\xE1tica: la decisi\xF3n de transfundir debe basarse tambi\xE9n en la situaci\xF3n hemodin\xE1mica y las p\xE9rdidas en curso."
      ]
    },
    {
      id: "fluidos-intraoperatorios",
      name: "Dosificaci\xF3n de l\xEDquidos intraoperatorios (adultos)",
      shortName: "Fluidos intraoperatorios",
      description: "Calcula el mantenimiento (regla 4-2-1), el d\xE9ficit por ayuno y las p\xE9rdidas por trauma quir\xFArgico.",
      category: CAT5,
      specialty: ANES5,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 3, max: 300 },
        { id: "ayuno", type: "number", label: "Horas de ayuno", unit: "h", min: 0, max: 48 },
        {
          id: "trauma",
          type: "select",
          label: "Magnitud del trauma quir\xFArgico",
          noPoints: true,
          options: [
            { label: "Leve (p. ej., hernia): \u2248 2\u20134 mL/kg/h", value: 3 },
            { label: "Moderado (p. ej., colecistectom\xEDa abierta): \u2248 4\u20136 mL/kg/h", value: 5 },
            { label: "Grave (p. ej., resecci\xF3n intestinal): \u2248 6\u20138 mL/kg/h", value: 7 }
          ]
        }
      ],
      compute: (v) => {
        const w = v.peso;
        const maint = w <= 10 ? 4 * w : w <= 20 ? 40 + 2 * (w - 10) : 60 + (w - 20);
        const deficit = maint * v.ayuno;
        const trauma = (v.trauma ?? 3) * w;
        const h1 = maint + deficit / 2 + trauma;
        const h23 = maint + deficit / 4 + trauma;
        const after = maint + trauma;
        return {
          main: fmt(h1, 0),
          mainUnit: "mL en la 1.\xAA hora",
          interpretation: "Pauta cl\xE1sica: en la 1.\xAA hora se repone la mitad del d\xE9ficit de ayuno; en la 2.\xAA y 3.\xAA, un cuarto en cada una, siempre sumando mantenimiento y p\xE9rdidas por trauma.",
          level: "info",
          details: [
            `Mantenimiento (4-2-1): ${fmt(maint, 0)} mL/h.`,
            `D\xE9ficit por ayuno: ${fmt(deficit, 0)} mL.`,
            `2.\xAA y 3.\xAA hora: ${fmt(h23, 0)} mL/h cada una.`,
            `A partir de la 4.\xAA hora: ${fmt(after, 0)} mL/h (mantenimiento + trauma).`
          ]
        };
      },
      notes: [
        "Es la aproximaci\xF3n cl\xE1sica docente: la pr\xE1ctica actual tiende a estrategias m\xE1s restrictivas o guiadas por objetivos (GDT), especialmente en cirug\xEDa mayor.",
        "No aplicable a grandes quemados, pediatr\xEDa compleja ni reposici\xF3n de hemorragia."
      ]
    },
    {
      id: "vexus",
      name: "Puntuaci\xF3n ecogr\xE1fica de congesti\xF3n venosa (VExUS)",
      shortName: "VExUS",
      description: "Grad\xFAa la congesti\xF3n venosa sist\xE9mica mediante ecograf\xEDa (VCI y Doppler hep\xE1tico, portal e intrarrenal) y estima el riesgo de lesi\xF3n renal aguda congestiva.",
      category: CAT5,
      specialty: ANES5,
      inputs: [
        {
          id: "vci",
          type: "select",
          label: "Vena cava inferior",
          noPoints: true,
          options: [
            { label: "< 2 cm de di\xE1metro", value: 0 },
            { label: "\u2265 2 cm de di\xE1metro", value: 1 }
          ]
        },
        {
          id: "hepatica",
          type: "select",
          label: "Doppler de venas suprahep\xE1ticas",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Normal \u2014 onda S mayor que la D (S > D), ambas anter\xF3gradas", value: 0 },
            { label: "Alteraci\xF3n leve-moderada \u2014 S menor que D (S < D), ambas anter\xF3gradas", value: 1 },
            { label: "Alteraci\xF3n grave \u2014 onda S invertida (flujo retr\xF3grado sist\xF3lico)", value: 2 }
          ]
        },
        {
          id: "porta",
          type: "select",
          label: "Doppler de vena porta",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Normal \u2014 pulsatilidad < 30 %", value: 0 },
            { label: "Alteraci\xF3n leve-moderada \u2014 pulsatilidad 30\u201349 %", value: 1 },
            { label: "Alteraci\xF3n grave \u2014 pulsatilidad \u2265 50 %", value: 2 }
          ]
        },
        {
          id: "renal",
          type: "select",
          label: "Doppler venoso intrarrenal",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Normal \u2014 flujo continuo", value: 0 },
            { label: "Alteraci\xF3n leve-moderada \u2014 flujo discontinuo bif\xE1sico (sist\xF3lico y diast\xF3lico)", value: 1 },
            { label: "Alteraci\xF3n grave \u2014 flujo discontinuo monof\xE1sico (solo diast\xF3lico)", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        let grade;
        if ((v.vci ?? 0) === 0) grade = 0;
        else {
          const severos = [v.hepatica, v.porta, v.renal].filter((x) => x === 2).length;
          grade = severos === 0 ? 1 : severos === 1 ? 2 : 3;
        }
        const texto = [
          "Sin congesti\xF3n significativa (VCI < 2 cm).",
          "Congesti\xF3n leve: VCI dilatada sin patrones graves.",
          "Congesti\xF3n moderada: un patr\xF3n Doppler gravemente alterado.",
          "Congesti\xF3n grave: dos o m\xE1s patrones gravemente alterados. Riesgo elevado de lesi\xF3n renal aguda congestiva; valorar descongesti\xF3n (diur\xE9ticos/ultrafiltraci\xF3n) y tratar la causa."
        ][grade];
        return {
          main: `Grado ${grade}`,
          interpretation: texto,
          level: grade === 0 ? "ok" : grade === 1 ? "info" : grade === 2 ? "warn" : "danger"
        };
      },
      notes: [
        "Grado 0: VCI < 2 cm \xB7 Grado 1: VCI \u2265 2 cm sin patrones graves \xB7 Grado 2: un patr\xF3n grave \xB7 Grado 3: \u2265 2 patrones graves.",
        "El grado 3 se asoci\xF3 de forma independiente con lesi\xF3n renal aguda en pacientes tras cirug\xEDa card\xEDaca."
      ],
      references: [
        "Beaubien-Souligny W, et al. Quantifying systemic congestion with point-of-care ultrasound: development of the venous excess ultrasound grading system. Ultrasound J. 2020;12(1):16."
      ]
    }
  ];

  // src/calculators/neuro.ts
  var CAT6 = "Neurol\xF3gico, sedaci\xF3n y gravedad";
  var ANES6 = ["Anestesiolog\xEDa"];
  var neuro = [
    {
      id: "sms",
      name: "Puntuaci\xF3n motora simplificada (SMS)",
      shortName: "SMS",
      description: "Simplifica la valoraci\xF3n del traumatismo craneoencef\xE1lico frente a la escala de coma de Glasgow.",
      category: CAT6,
      specialty: ANES6,
      inputs: [
        {
          id: "motor",
          type: "select",
          label: "Mejor respuesta motora",
          options: [
            { label: "Obedece \xF3rdenes", value: 2 },
            { label: "Localiza el dolor", value: 1 },
            { label: "Retirada al dolor o respuesta menor", value: 0 }
          ]
        }
      ],
      compute: (v) => {
        const s = v.motor ?? 2;
        return {
          main: String(s),
          mainUnit: "puntos (0\u20132)",
          interpretation: s === 2 ? "Obedece \xF3rdenes: menor probabilidad de lesi\xF3n cerebral grave (equivalente aproximado a GCS alto)." : s === 1 ? "Localiza el dolor: riesgo intermedio; vigilancia estrecha y TC seg\xFAn protocolo." : "Retirada o menos: se asocia a lesi\xF3n grave (aprox. GCS \u2264 8); valorar aislamiento precoz de la v\xEDa a\xE9rea.",
          level: s === 2 ? "ok" : s === 1 ? "warn" : "danger"
        };
      },
      notes: [
        "SMS < 2 identifica a los pacientes con mayor riesgo de lesi\xF3n cerebral traum\xE1tica significativa, necesidad de intubaci\xF3n y mortalidad, con rendimiento similar a la GCS completa."
      ],
      references: [
        "Gill M, et al. A comparison of the Glasgow Coma Scale score to simplified alternative scores for the prediction of traumatic brain injury outcomes. Ann Emerg Med. 2005;45(1):37-42."
      ]
    },
    {
      id: "sofa",
      name: "Escala SOFA de disfunci\xF3n org\xE1nica secuencial",
      shortName: "SOFA",
      description: "Eval\xFAa la gravedad de la disfunci\xF3n org\xE1nica aguda en pacientes cr\xEDticos mediante seis sistemas.",
      category: CAT6,
      specialty: ANES6,
      inputs: [
        {
          id: "resp",
          type: "select",
          label: "Respiratorio \u2014 PaO\u2082/FiO\u2082 (mmHg)",
          dropdown: true,
          options: [
            { label: "\u2265 400", value: 0 },
            { label: "300\u2013399", value: 1 },
            { label: "200\u2013299", value: 2 },
            { label: "100\u2013199 con soporte respiratorio", value: 3 },
            { label: "< 100 con soporte respiratorio", value: 4 }
          ]
        },
        {
          id: "coag",
          type: "select",
          label: "Coagulaci\xF3n \u2014 plaquetas (\xD710\xB3/\xB5L)",
          dropdown: true,
          options: [
            { label: "\u2265 150", value: 0 },
            { label: "100\u2013149", value: 1 },
            { label: "50\u201399", value: 2 },
            { label: "20\u201349", value: 3 },
            { label: "< 20", value: 4 }
          ]
        },
        {
          id: "higado",
          type: "select",
          label: "H\xEDgado \u2014 bilirrubina (mg/dL)",
          dropdown: true,
          options: [
            { label: "< 1,2", value: 0 },
            { label: "1,2\u20131,9", value: 1 },
            { label: "2,0\u20135,9", value: 2 },
            { label: "6,0\u201311,9", value: 3 },
            { label: "\u2265 12", value: 4 }
          ]
        },
        {
          id: "cardio",
          type: "select",
          label: "Cardiovascular",
          dropdown: true,
          options: [
            { label: "PAM \u2265 70 mmHg sin vasoactivos", value: 0 },
            { label: "PAM < 70 mmHg sin vasoactivos", value: 1 },
            { label: "Dopamina \u2264 5 \xB5g/kg/min o dobutamina (cualquier dosis)", value: 2 },
            { label: "Dopamina > 5, o adrenalina/noradrenalina \u2264 0,1 \xB5g/kg/min", value: 3 },
            { label: "Dopamina > 15, o adrenalina/noradrenalina > 0,1 \xB5g/kg/min", value: 4 }
          ]
        },
        {
          id: "snc",
          type: "select",
          label: "Neurol\xF3gico \u2014 escala de coma de Glasgow",
          dropdown: true,
          options: [
            { label: "15", value: 0 },
            { label: "13\u201314", value: 1 },
            { label: "10\u201312", value: 2 },
            { label: "6\u20139", value: 3 },
            { label: "< 6", value: 4 }
          ]
        },
        {
          id: "renal",
          type: "select",
          label: "Renal \u2014 creatinina (mg/dL) o diuresis",
          dropdown: true,
          options: [
            { label: "< 1,2", value: 0 },
            { label: "1,2\u20131,9", value: 1 },
            { label: "2,0\u20133,4", value: 2 },
            { label: "3,5\u20134,9 o diuresis < 500 mL/d\xEDa", value: 3 },
            { label: "\u2265 5,0 o diuresis < 200 mL/d\xEDa", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["resp", "coag", "higado", "cardio", "snc", "renal"]);
        const mort = score <= 6 ? "< 10 %" : score <= 9 ? "\u2248 15\u201320 %" : score <= 12 ? "\u2248 40\u201350 %" : score <= 14 ? "\u2248 50\u201360 %" : "> 80 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201324)",
          secondary: mort,
          secondaryLabel: "mortalidad orientativa",
          interpretation: "A mayor puntuaci\xF3n, mayor disfunci\xF3n org\xE1nica y mortalidad. Un aumento \u2265 2 puntos respecto a la basal en un paciente con infecci\xF3n define sepsis (criterios Sepsis-3). La evoluci\xF3n del SOFA en el tiempo es m\xE1s informativa que un valor aislado.",
          level: score <= 6 ? score === 0 ? "ok" : "info" : score <= 9 ? "warn" : "danger"
        };
      },
      notes: [
        "Versi\xF3n cl\xE1sica de la escala SOFA (1996). La lista de MDCalc incluye la revisi\xF3n \xABSOFA-2\xBB (2025), pendiente de incorporar en una pr\xF3xima versi\xF3n.",
        "Los porcentajes de mortalidad son orientativos y var\xEDan seg\xFAn la poblaci\xF3n estudiada."
      ],
      references: [
        "Vincent JL, et al. The SOFA (Sepsis-related Organ Failure Assessment) score to describe organ dysfunction/failure. Intensive Care Med. 1996;22(7):707-10.",
        "Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-10."
      ]
    },
    {
      id: "stanford",
      name: "Escala de somnolencia de Stanford",
      shortName: "Stanford",
      description: "Cuantifica el grado subjetivo de somnolencia en el momento actual.",
      category: CAT6,
      specialty: ANES6,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "\xBFC\xF3mo se siente ahora mismo?",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "1 \u2014 Activo, vital, alerta, completamente despierto", value: 1 },
            { label: "2 \u2014 Rendimiento alto aunque no m\xE1ximo; capaz de concentrarse", value: 2 },
            { label: "3 \u2014 Despierto y relajado; responde, pero no del todo alerta", value: 3 },
            { label: "4 \u2014 Algo apagado, deca\xEDdo", value: 4 },
            { label: "5 \u2014 Apagado, pierde el inter\xE9s; enlentecido", value: 5 },
            { label: "6 \u2014 Somnoliento, prefiere tumbarse; lucha contra el sue\xF1o; aturdido", value: 6 },
            { label: "7 \u2014 Casi dormido; inicio del sue\xF1o inminente; incapaz de mantenerse despierto", value: 7 }
          ]
        }
      ],
      compute: (v) => {
        const g = v.grado ?? 1;
        return {
          main: String(g),
          mainUnit: "de 7",
          interpretation: g <= 3 ? "Nivel de alerta dentro de lo esperable durante la vigilia." : "Somnolencia significativa: si aparece en momentos en que deber\xEDa estar alerta, sugiere deuda de sue\xF1o o un trastorno del sue\xF1o; valorar estudio y precauci\xF3n con actividades de riesgo.",
          level: g <= 3 ? "ok" : g <= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Hoddes E, et al. Quantification of sleepiness: a new approach. Psychophysiology. 1973;10(4):431-6."
      ]
    }
  ];

  // src/calculators/alcohol.ts
  var CAT7 = "Alcohol y abstinencia";
  var ANES7 = ["Anestesiolog\xEDa"];
  var escala07 = (anchors) => Array.from({ length: 8 }, (_, i) => ({
    label: anchors[i] ? `${i} \u2014 ${anchors[i]}` : `${i} \u2014 (intensidad intermedia)`,
    value: i
  }));
  var alcohol = [
    {
      id: "ciwa-ar",
      name: "CIWA-Ar para la abstinencia de alcohol",
      shortName: "CIWA-Ar",
      description: "Objetiva la gravedad del s\xEDndrome de abstinencia alcoh\xF3lica y gu\xEDa el tratamiento pautado por s\xEDntomas.",
      category: CAT7,
      specialty: ANES7,
      inputs: [
        {
          id: "nauseas",
          type: "select",
          label: "N\xE1useas y v\xF3mitos",
          description: "\xAB\xBFTiene el est\xF3mago revuelto? \xBFHa vomitado?\xBB",
          dropdown: true,
          options: escala07({
            0: "Sin n\xE1useas ni v\xF3mitos",
            1: "N\xE1useas leves sin v\xF3mitos",
            4: "N\xE1useas intermitentes con arcadas secas",
            7: "N\xE1useas constantes, arcadas frecuentes y v\xF3mitos"
          })
        },
        {
          id: "temblor",
          type: "select",
          label: "Temblor",
          description: "Con los brazos extendidos y los dedos separados.",
          dropdown: true,
          options: escala07({
            0: "Sin temblor",
            1: "No visible, pero se percibe en los dedos",
            4: "Moderado con los brazos extendidos",
            7: "Intenso, incluso sin extender los brazos"
          })
        },
        {
          id: "sudoracion",
          type: "select",
          label: "Sudoraci\xF3n parox\xEDstica",
          dropdown: true,
          options: escala07({
            0: "Sin sudoraci\xF3n visible",
            1: "Sudoraci\xF3n apenas perceptible, palmas h\xFAmedas",
            4: "Gotas de sudor evidentes en la frente",
            7: "Sudoraci\xF3n profusa que empapa"
          })
        },
        {
          id: "ansiedad",
          type: "select",
          label: "Ansiedad",
          description: "\xAB\xBFSe siente nervioso/a?\xBB",
          dropdown: true,
          options: escala07({
            0: "Tranquilo, sin ansiedad",
            1: "Ligeramente ansioso",
            4: "Moderadamente ansioso o en guardia",
            7: "Equivalente a un estado de p\xE1nico agudo"
          })
        },
        {
          id: "agitacion",
          type: "select",
          label: "Agitaci\xF3n",
          dropdown: true,
          options: escala07({
            0: "Actividad normal",
            1: "Algo m\xE1s inquieto de lo normal",
            4: "Moderadamente inquieto, no puede estarse quieto",
            7: "Camina de un lado a otro o forcejea constantemente"
          })
        },
        {
          id: "tactiles",
          type: "select",
          label: "Alteraciones t\xE1ctiles",
          description: "Picores, pinchazos, quemaz\xF3n, entumecimiento o sensaci\xF3n de bichos bajo la piel.",
          dropdown: true,
          options: escala07({
            0: "Ninguna",
            1: "Muy leves",
            2: "Leves",
            3: "Moderadas",
            4: "Alucinaciones moderadas",
            5: "Alucinaciones graves",
            6: "Alucinaciones extremas",
            7: "Alucinaciones continuas"
          })
        },
        {
          id: "auditivas",
          type: "select",
          label: "Alteraciones auditivas",
          description: "Sonidos molestos, que asustan o que no existen.",
          dropdown: true,
          options: escala07({
            0: "Ninguna",
            1: "Muy leves (sonidos \xE1speros o que sobresaltan)",
            2: "Leves",
            3: "Moderadas",
            4: "Alucinaciones moderadas",
            5: "Alucinaciones graves",
            6: "Alucinaciones extremas",
            7: "Alucinaciones continuas"
          })
        },
        {
          id: "visuales",
          type: "select",
          label: "Alteraciones visuales",
          description: "Molestia con la luz, colores extra\xF1os o cosas que no existen.",
          dropdown: true,
          options: escala07({
            0: "Ninguna",
            1: "Muy leves (fotosensibilidad)",
            2: "Leves",
            3: "Moderadas",
            4: "Alucinaciones moderadas",
            5: "Alucinaciones graves",
            6: "Alucinaciones extremas",
            7: "Alucinaciones continuas"
          })
        },
        {
          id: "cefalea",
          type: "select",
          label: "Cefalea / pesadez de cabeza",
          description: "No valorar mareo ni aturdimiento.",
          dropdown: true,
          options: escala07({
            0: "Ausente",
            1: "Muy leve",
            2: "Leve",
            3: "Moderada",
            4: "Moderadamente intensa",
            5: "Intensa",
            6: "Muy intensa",
            7: "Extremadamente intensa"
          })
        },
        {
          id: "orientacion",
          type: "select",
          label: "Orientaci\xF3n y funciones superiores",
          description: "\xAB\xBFQu\xE9 d\xEDa es hoy? \xBFD\xF3nde est\xE1? \xBFQui\xE9n soy yo?\xBB",
          dropdown: true,
          options: [
            { label: "0 \u2014 Orientado; puede hacer sumas seriadas", value: 0 },
            { label: "1 \u2014 No puede hacer sumas seriadas o duda sobre la fecha", value: 1 },
            { label: "2 \u2014 Desorientado en fecha (\u2264 2 d\xEDas de error)", value: 2 },
            { label: "3 \u2014 Desorientado en fecha (> 2 d\xEDas de error)", value: 3 },
            { label: "4 \u2014 Desorientado en lugar y/o persona", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, [
          "nauseas",
          "temblor",
          "sudoracion",
          "ansiedad",
          "agitacion",
          "tactiles",
          "auditivas",
          "visuales",
          "cefalea",
          "orientacion"
        ]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201367)",
          interpretation: score <= 8 ? "Abstinencia ausente o leve: habitualmente no requiere medicaci\xF3n adicional; reevaluar de forma peri\xF3dica." : score <= 15 ? "Abstinencia moderada: se recomienda tratamiento farmacol\xF3gico (benzodiacepinas pautadas por s\xEDntomas) y reevaluaci\xF3n frecuente." : "Abstinencia grave: tratamiento inmediato; riesgo elevado de convulsiones y delirium tremens.",
          level: score <= 8 ? "ok" : score <= 15 ? "warn" : "danger"
        };
      },
      notes: [
        "\u2264 8: leve \xB7 9\u201315: moderada \xB7 > 15: grave (umbral habitual de tratamiento \u2265 8\u201310).",
        "Requiere que el paciente pueda comunicarse; en pacientes que no colaboran, valorar escalas alternativas (p. ej., BAWS, protocolos de sedaci\xF3n)."
      ],
      references: [
        "Sullivan JT, et al. Assessment of alcohol withdrawal: the revised Clinical Institute Withdrawal Assessment for Alcohol scale (CIWA-Ar). Br J Addict. 1989;84(11):1353-7."
      ]
    },
    {
      id: "baws",
      name: "Escala breve de abstinencia de alcohol (BAWS)",
      shortName: "BAWS",
      description: "Eval\xFAa los s\xEDntomas de abstinencia alcoh\xF3lica con cinco \xEDtems r\xE1pidos; alternativa abreviada a la CIWA-Ar.",
      category: CAT7,
      specialty: ANES7,
      inputs: [
        {
          id: "temblor",
          type: "select",
          label: "Temblor",
          dropdown: true,
          options: [
            { label: "0 \u2014 Ausente", value: 0 },
            { label: "1 \u2014 No visible, pero el paciente lo nota / se palpa", value: 1 },
            { label: "2 \u2014 Moderado, visible con los brazos extendidos", value: 2 },
            { label: "3 \u2014 Intenso, visible sin extender los brazos", value: 3 }
          ]
        },
        {
          id: "sudor",
          type: "select",
          label: "Sudoraci\xF3n",
          dropdown: true,
          options: [
            { label: "0 \u2014 Ausente", value: 0 },
            { label: "1 \u2014 Apenas perceptible, palmas h\xFAmedas", value: 1 },
            { label: "2 \u2014 Gotas de sudor visibles", value: 2 },
            { label: "3 \u2014 Sudoraci\xF3n profusa que empapa", value: 3 }
          ]
        },
        {
          id: "agitacion",
          type: "select",
          label: "Agitaci\xF3n",
          dropdown: true,
          options: [
            { label: "0 \u2014 Actividad normal", value: 0 },
            { label: "1 \u2014 Algo inquieto", value: 1 },
            { label: "2 \u2014 Moderadamente inquieto; se mueve constantemente", value: 2 },
            { label: "3 \u2014 Camina de un lado a otro o forcejea", value: 3 }
          ]
        },
        {
          id: "orientacion",
          type: "select",
          label: "Orientaci\xF3n",
          dropdown: true,
          options: [
            { label: "0 \u2014 Orientado en fecha, lugar y persona", value: 0 },
            { label: "1 \u2014 Desorientado en fecha o en lugar", value: 1 },
            { label: "2 \u2014 Desorientado en fecha y lugar", value: 2 },
            { label: "3 \u2014 Desorientado tambi\xE9n en persona", value: 3 }
          ]
        },
        {
          id: "alucinaciones",
          type: "select",
          label: "Alucinaciones",
          dropdown: true,
          options: [
            { label: "0 \u2014 Ninguna", value: 0 },
            { label: "1 \u2014 Leves (el paciente sabe que no son reales)", value: 1 },
            { label: "2 \u2014 Moderadas (a veces las cree reales)", value: 2 },
            { label: "3 \u2014 Graves (las cree reales y responde a ellas)", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["temblor", "sudor", "agitacion", "orientacion", "alucinaciones"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201315)",
          interpretation: score <= 2 ? "Abstinencia leve: vigilancia y reevaluaci\xF3n peri\xF3dica." : score <= 5 ? "BAWS \u2265 3 (\u2248 CIWA-Ar \u2265 8): abstinencia moderada; se recomienda iniciar o ajustar tratamiento seg\xFAn protocolo." : "Abstinencia grave: tratamiento inmediato y vigilancia estrecha (riesgo de delirium tremens).",
          level: score <= 2 ? "ok" : score <= 5 ? "warn" : "danger"
        };
      },
      notes: ["Un BAWS \u2265 3 se corresponde aproximadamente con un CIWA-Ar \u2265 8."],
      references: [
        "Rastegar DA, et al. Development and implementation of an alcohol withdrawal protocol using a 5-item scale (BAWS). Subst Abus. 2017;38(4):394-400."
      ]
    },
    {
      id: "cage",
      name: "Cuestionario CAGE sobre el consumo de alcohol",
      shortName: "CAGE",
      description: "Cribado r\xE1pido del consumo problem\xE1tico de alcohol y de la dependencia alcoh\xF3lica.",
      category: CAT7,
      specialty: ANES7,
      inputs: [
        {
          id: "c",
          type: "boolean",
          label: "\xBFHa sentido alguna vez que deber\xEDa beber menos? (Cut down)"
        },
        {
          id: "a",
          type: "boolean",
          label: "\xBFLe ha molestado que la gente critique su forma de beber? (Annoyed)"
        },
        {
          id: "g",
          type: "boolean",
          label: "\xBFSe ha sentido alguna vez mal o culpable por su forma de beber? (Guilty)"
        },
        {
          id: "e",
          type: "boolean",
          label: "\xBFHa bebido alguna vez a primera hora de la ma\xF1ana para calmar los nervios o la resaca? (Eye-opener)"
        }
      ],
      compute: (v) => {
        const score = sum(v, ["c", "a", "g", "e"]);
        return {
          main: String(score),
          mainUnit: "de 4",
          interpretation: score >= 2 ? "Cribado positivo (\u2265 2): alta sospecha de consumo problem\xE1tico o dependencia; ampliar la evaluaci\xF3n (p. ej., AUDIT, historia cl\xEDnica dirigida) y valorar riesgo de abstinencia perioperatoria." : score === 1 ? "Una respuesta positiva: valorar ampliar la anamnesis sobre el consumo." : "Cribado negativo.",
          level: score >= 2 ? "danger" : score === 1 ? "warn" : "ok"
        };
      },
      notes: [
        "La respuesta afirmativa a la \xFAltima pregunta (\xABeye-opener\xBB) es especialmente sugestiva de dependencia.",
        "El CAGE no cuantifica el consumo actual: complementar con unidades de bebida est\xE1ndar por semana."
      ],
      references: ["Ewing JA. Detecting alcoholism: the CAGE questionnaire. JAMA. 1984;252(14):1905-7."]
    }
  ];

  // src/calculators/infecciones.ts
  var CAT8 = "Infecciones";
  var ANES8 = ["Anestesiolog\xEDa"];
  var infecciones = [
    {
      id: "drip",
      name: "Puntuaci\xF3n DRIP de neumon\xEDa por pat\xF3genos resistentes",
      shortName: "DRIP",
      description: "Predice el riesgo de neumon\xEDa adquirida en la comunidad causada por pat\xF3genos resistentes a los antibi\xF3ticos habituales.",
      category: CAT8,
      specialty: ANES8,
      inputs: [
        {
          id: "antibiotico",
          type: "boolean",
          label: "Uso de antibi\xF3ticos en los \xFAltimos 60 d\xEDas",
          points: 2
        },
        {
          id: "residencia",
          type: "boolean",
          label: "Residente en centro de cuidados de larga estancia",
          points: 2
        },
        {
          id: "sonda",
          type: "boolean",
          label: "Alimentaci\xF3n por sonda",
          points: 2
        },
        {
          id: "previa",
          type: "boolean",
          label: "Infecci\xF3n previa por pat\xF3geno resistente (\xFAltimo a\xF1o)",
          points: 2
        },
        {
          id: "hospitalizacion",
          type: "boolean",
          label: "Hospitalizaci\xF3n en los \xFAltimos 60 d\xEDas"
        },
        {
          id: "pulmonar",
          type: "boolean",
          label: "Enfermedad pulmonar cr\xF3nica",
          description: "EPOC, bronquiectasias, fibrosis\u2026"
        },
        {
          id: "funcional",
          type: "boolean",
          label: "Mal estado funcional",
          description: "Dependencia para las actividades b\xE1sicas."
        },
        {
          id: "antiacidos",
          type: "boolean",
          label: "Supresi\xF3n \xE1cida g\xE1strica",
          description: "IBP o anti-H2."
        },
        {
          id: "heridas",
          type: "boolean",
          label: "Cuidado de heridas cr\xF3nicas"
        },
        {
          id: "mrsa",
          type: "boolean",
          label: "Colonizaci\xF3n por SARM en el \xFAltimo a\xF1o",
          description: "Staphylococcus aureus resistente a meticilina (MRSA)."
        }
      ],
      compute: (v) => {
        const score = sum(v, [
          "antibiotico",
          "residencia",
          "sonda",
          "previa",
          "hospitalizacion",
          "pulmonar",
          "funcional",
          "antiacidos",
          "heridas",
          "mrsa"
        ]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201314)",
          interpretation: score < 4 ? "Riesgo bajo de pat\xF3genos resistentes: el tratamiento emp\xEDrico habitual de la NAC suele ser suficiente." : "DRIP \u2265 4: riesgo elevado de pat\xF3genos resistentes; valorar cobertura emp\xEDrica ampliada (p. ej., frente a SARM y Pseudomonas) seg\xFAn protocolo local y cultivos.",
          level: score < 4 ? "ok" : "danger"
        };
      },
      notes: [
        "Factores mayores (2 puntos): antibi\xF3ticos, residencia de larga estancia, sonda de alimentaci\xF3n e infecci\xF3n resistente previa.",
        "Factores menores (1 punto): hospitalizaci\xF3n reciente, enfermedad pulmonar cr\xF3nica, mal estado funcional, supresi\xF3n \xE1cida, heridas cr\xF3nicas y colonizaci\xF3n por SARM."
      ],
      references: [
        "Webb BJ, et al. Derivation and multicenter validation of the drug resistance in pneumonia clinical prediction score. Antimicrob Agents Chemother. 2016;60(5):2652-63."
      ]
    }
  ];

  // src/calculators/farmacologia.ts
  var CAT9 = "Farmacolog\xEDa y dosificaci\xF3n";
  var ANES9 = ["Anestesiolog\xEDa"];
  var ANESTESICOS = [
    { nombre: "Lidoca\xEDna", mgKg: 4.5, mgKgEpi: 7, capMg: 300, capMgEpi: 500 },
    { nombre: "Mepivaca\xEDna", mgKg: 4.4, mgKgEpi: 7, capMg: 400, capMgEpi: 550 },
    { nombre: "Bupivaca\xEDna", mgKg: 2.5, mgKgEpi: 3, capMg: 175, capMgEpi: 225 },
    { nombre: "Ropivaca\xEDna", mgKg: 3, mgKgEpi: 3, capMg: 225, capMgEpi: 225 }
  ];
  var farmacologia = [
    {
      id: "anestesicos-locales",
      name: "Dosis m\xE1xima de anest\xE9sicos locales",
      shortName: "Anest\xE9sicos locales",
      description: "Calcula la dosis m\xE1xima recomendada (mg y volumen) de los anest\xE9sicos locales m\xE1s habituales seg\xFAn el peso.",
      category: CAT9,
      specialty: ANES9,
      inputs: [
        {
          id: "farmaco",
          type: "select",
          label: "Anest\xE9sico local",
          noPoints: true,
          options: ANESTESICOS.map((a, i) => ({ label: a.nombre, value: i }))
        },
        {
          id: "epinefrina",
          type: "boolean",
          label: "Con vasoconstrictor (epinefrina)",
          noPoints: true
        },
        {
          id: "concentracion",
          type: "select",
          label: "Concentraci\xF3n de la soluci\xF3n",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "0,25 % (2,5 mg/mL)", value: 0.25 },
            { label: "0,5 % (5 mg/mL)", value: 0.5 },
            { label: "0,75 % (7,5 mg/mL)", value: 0.75 },
            { label: "1 % (10 mg/mL)", value: 1 },
            { label: "1,5 % (15 mg/mL)", value: 1.5 },
            { label: "2 % (20 mg/mL)", value: 2 }
          ],
          default: 1
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 1, max: 250 }
      ],
      compute: (v) => {
        const drug = ANESTESICOS[v.farmaco ?? 0];
        const epi = (v.epinefrina ?? 0) === 1;
        const mgKg = epi ? drug.mgKgEpi : drug.mgKg;
        const cap = epi ? drug.capMgEpi : drug.capMg;
        const porPeso = mgKg * v.peso;
        const dosis = Math.min(porPeso, cap);
        const mgMl = (v.concentracion ?? 1) * 10;
        const vol = dosis / mgMl;
        return {
          main: fmt(dosis, 0),
          mainUnit: "mg (dosis m\xE1xima)",
          secondary: `${fmt(vol, 1)} mL`,
          secondaryLabel: `volumen m\xE1ximo al ${fmt(v.concentracion ?? 1, 2)} %`,
          interpretation: `${drug.nombre} ${epi ? "con" : "sin"} epinefrina: m\xE1ximo ${fmt(mgKg, 1)} mg/kg${porPeso > cap ? `, limitado por el techo absoluto de ${cap} mg` : ""}. Aspirar antes de inyectar, fraccionar la dosis y vigilar signos de toxicidad sist\xE9mica (LAST).`,
          level: "info",
          details: [
            `Dosis por peso: ${fmt(porPeso, 0)} mg \xB7 techo absoluto: ${cap} mg.`,
            "En obesidad, calcular sobre el peso corporal ideal o magro.",
            "Si se combinan varios anest\xE9sicos, la toxicidad es aditiva."
          ]
        };
      },
      notes: [
        "Las dosis m\xE1ximas \xABcl\xE1sicas\xBB var\xEDan entre fuentes y fichas t\xE9cnicas; se muestran los valores de referencia m\xE1s habituales.",
        "La dosis t\xF3xica depende tambi\xE9n del lugar de inyecci\xF3n (intercostal > epidural > plexo > subcut\xE1neo).",
        "Ante sospecha de toxicidad sist\xE9mica (LAST): parar la inyecci\xF3n, soporte vital y emulsi\xF3n lip\xEDdica al 20 % seg\xFAn protocolo."
      ],
      references: [
        "Neal JM, et al. The Third American Society of Regional Anesthesia and Pain Medicine Practice Advisory on Local Anesthetic Systemic Toxicity. Reg Anesth Pain Med. 2018;43(2):113-23."
      ]
    },
    {
      id: "masa-libre-grasa",
      name: "Masa libre de grasa (MLG)",
      shortName: "MLG / FFM",
      description: "Estima la masa libre de grasa a partir del peso y el IMC (f\xF3rmula de Janmahasatian); \xFAtil para dosificar f\xE1rmacos.",
      category: CAT9,
      specialty: ANES9,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 20, max: 300 },
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 100, max: 230 }
      ],
      compute: (v) => {
        const w = v.peso;
        const hM = v.talla / 100;
        const bmi = w / (hM * hM);
        const ffm = (v.sexo ?? 0) === 0 ? 9270 * w / (6680 + 216 * bmi) : 9270 * w / (8780 + 244 * bmi);
        const pct = ffm / w * 100;
        return {
          main: fmt(ffm, 1),
          mainUnit: "kg de masa libre de grasa",
          secondary: `${fmt(pct, 0)} %`,
          secondaryLabel: "del peso corporal total",
          interpretation: "La masa libre de grasa es un tama\xF1o corporal \xFAtil para dosificar f\xE1rmacos hidr\xF3filos y para escalar la inducci\xF3n en pacientes con obesidad (p. ej., propofol de inducci\xF3n, remifentanilo).",
          level: "info",
          details: [`IMC: ${fmt(bmi, 1)} kg/m\xB2.`, "F\xF3rmula de Janmahasatian (2005)."]
        };
      },
      references: [
        "Janmahasatian S, et al. Quantification of lean bodyweight. Clin Pharmacokinet. 2005;44(10):1051-65."
      ]
    }
  ];

  // src/calculators/cardio-fa.ts
  var CAT10 = "Fibrilaci\xF3n auricular y anticoagulaci\xF3n";
  var CARD = ["Cardiolog\xEDa"];
  var cardioFA = [
    {
      id: "cha2ds2-vasc",
      name: "Puntuaci\xF3n CHA\u2082DS\u2082-VASc para el riesgo de ictus en fibrilaci\xF3n auricular",
      shortName: "CHA\u2082DS\u2082-VASc",
      description: "Estima el riesgo anual de ictus en pacientes con fibrilaci\xF3n auricular no valvular para decidir la anticoagulaci\xF3n.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "icc", type: "boolean", label: "Insuficiencia card\xEDaca congestiva (C)", description: "Signos/s\xEDntomas de IC o FEVI reducida." },
        { id: "hta", type: "boolean", label: "Hipertensi\xF3n arterial (H)", description: "En tratamiento o PA en reposo > 140/90 mmHg." },
        {
          id: "edad",
          type: "select",
          label: "Edad (A\u2082 / A)",
          options: [
            { label: "< 65 a\xF1os", value: 0 },
            { label: "65\u201374 a\xF1os", value: 1 },
            { label: "\u2265 75 a\xF1os", value: 2 }
          ]
        },
        { id: "dm", type: "boolean", label: "Diabetes mellitus (D)" },
        { id: "ictus", type: "boolean", label: "Ictus, AIT o embolia sist\xE9mica previos (S\u2082)", points: 2 },
        { id: "vascular", type: "boolean", label: "Enfermedad vascular (V)", description: "IAM previo, arteriopat\xEDa perif\xE9rica o placa a\xF3rtica." },
        { id: "sexo", type: "boolean", label: "Sexo femenino (Sc)" }
      ],
      compute: (v) => {
        const score = sum(v, ["icc", "hta", "edad", "dm", "ictus", "vascular", "sexo"]);
        const riesgo2 = [0.2, 0.6, 2.2, 3.2, 4.8, 7.2, 9.7, 11.2, 10.8, 12.2][Math.min(score, 9)];
        const mujer = v.sexo === 1;
        const umbralAlto = mujer ? 3 : 2;
        const umbralConsiderar = mujer ? 2 : 1;
        return {
          main: String(score),
          mainUnit: "puntos (0\u20139)",
          secondary: `${fmt(riesgo2, 1)} %`,
          secondaryLabel: "riesgo anual de ictus/AIT/embolia",
          interpretation: score >= umbralAlto ? "Riesgo elevado: se recomienda anticoagulaci\xF3n oral salvo contraindicaci\xF3n." : score >= umbralConsiderar ? "Riesgo intermedio: considerar anticoagulaci\xF3n oral valorando riesgo hemorr\xE1gico y preferencias del paciente." : "Riesgo bajo: en general no se recomienda tratamiento antitromb\xF3tico.",
          level: score >= umbralAlto ? "danger" : score >= umbralConsiderar ? "warn" : "ok"
        };
      },
      notes: [
        "El sexo femenino es un modificador de riesgo: punt\xFAa, pero de forma aislada (mujer sin otros factores) no indica anticoagulaci\xF3n.",
        "Porcentajes anuales de la cohorte de validaci\xF3n de Friberg 2012.",
        "Valorar siempre junto al riesgo hemorr\xE1gico (HAS-BLED u ORBIT)."
      ],
      references: [
        "Lip GY, et al. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation (Euro Heart Survey). Chest. 2010;137(2):263-72.",
        "Friberg L, et al. Evaluation of risk stratification schemes for ischaemic stroke and bleeding in 182 678 patients with atrial fibrillation. Eur Heart J. 2012;33(12):1500-10."
      ]
    },
    {
      id: "cha2ds2-va",
      name: "Puntuaci\xF3n CHA\u2082DS\u2082-VA para el riesgo de ictus en fibrilaci\xF3n auricular",
      shortName: "CHA\u2082DS\u2082-VA",
      description: "Versi\xF3n sin el criterio de sexo recomendada por la gu\xEDa ESC 2024 para decidir la anticoagulaci\xF3n en fibrilaci\xF3n auricular.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "icc", type: "boolean", label: "Insuficiencia card\xEDaca congestiva (C)" },
        { id: "hta", type: "boolean", label: "Hipertensi\xF3n arterial (H)" },
        {
          id: "edad",
          type: "select",
          label: "Edad (A\u2082 / A)",
          options: [
            { label: "< 65 a\xF1os", value: 0 },
            { label: "65\u201374 a\xF1os", value: 1 },
            { label: "\u2265 75 a\xF1os", value: 2 }
          ]
        },
        { id: "dm", type: "boolean", label: "Diabetes mellitus (D)" },
        { id: "ictus", type: "boolean", label: "Ictus, AIT o embolia sist\xE9mica previos (S\u2082)", points: 2 },
        { id: "vascular", type: "boolean", label: "Enfermedad vascular (V)", description: "IAM previo, arteriopat\xEDa perif\xE9rica o placa a\xF3rtica." }
      ],
      compute: (v) => {
        const score = sum(v, ["icc", "hta", "edad", "dm", "ictus", "vascular"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20138)",
          interpretation: score >= 2 ? "CHA\u2082DS\u2082-VA \u2265 2: se recomienda anticoagulaci\xF3n oral (gu\xEDa ESC 2024)." : score === 1 ? "CHA\u2082DS\u2082-VA = 1: debe considerarse la anticoagulaci\xF3n oral, individualizando." : "Riesgo bajo: en general no se recomienda anticoagulaci\xF3n.",
          level: score >= 2 ? "danger" : score === 1 ? "warn" : "ok"
        };
      },
      references: [
        "Van Gelder IC, et al. 2024 ESC Guidelines for the management of atrial fibrillation. Eur Heart J. 2024;45(36):3314-414."
      ]
    },
    {
      id: "chads2",
      name: "Puntuaci\xF3n CHADS\u2082 para el riesgo de ictus en fibrilaci\xF3n auricular",
      shortName: "CHADS\u2082",
      description: "Estima el riesgo anual de ictus en fibrilaci\xF3n auricular (escala cl\xE1sica, hoy en general sustituida por CHA\u2082DS\u2082-VASc).",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "icc", type: "boolean", label: "Insuficiencia card\xEDaca congestiva (C)" },
        { id: "hta", type: "boolean", label: "Hipertensi\xF3n arterial (H)" },
        { id: "edad", type: "boolean", label: "Edad \u2265 75 a\xF1os (A)" },
        { id: "dm", type: "boolean", label: "Diabetes mellitus (D)" },
        { id: "ictus", type: "boolean", label: "Ictus o AIT previos (S\u2082)", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["icc", "hta", "edad", "dm", "ictus"]);
        const riesgo2 = [1.9, 2.8, 4, 5.9, 8.5, 12.5, 18.2][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20136)",
          secondary: `${fmt(riesgo2, 1)} %`,
          secondaryLabel: "riesgo anual de ictus",
          interpretation: score >= 2 ? "Riesgo moderado-alto: anticoagulaci\xF3n oral recomendada." : score === 1 ? "Riesgo intermedio: valorar anticoagulaci\xF3n (las gu\xEDas actuales recomiendan reevaluar con CHA\u2082DS\u2082-VASc)." : "Riesgo bajo seg\xFAn CHADS\u2082; conviene refinar con CHA\u2082DS\u2082-VASc antes de descartar la anticoagulaci\xF3n.",
          level: score >= 2 ? "danger" : score === 1 ? "warn" : "ok"
        };
      },
      references: [
        "Gage BF, et al. Validation of clinical classification schemes for predicting stroke (CHADS2). JAMA. 2001;285(22):2864-70."
      ]
    },
    {
      id: "has-bled",
      name: "Puntuaci\xF3n HAS-BLED de riesgo hemorr\xE1gico",
      shortName: "HAS-BLED",
      description: "Estima el riesgo de hemorragia mayor en pacientes anticoagulados por fibrilaci\xF3n auricular.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "hta", type: "boolean", label: "Hipertensi\xF3n no controlada (H)", description: "PA sist\xF3lica > 160 mmHg." },
        { id: "renal", type: "boolean", label: "Funci\xF3n renal alterada (A)", description: "Di\xE1lisis, trasplante o creatinina > 2,26 mg/dL." },
        { id: "hepatica", type: "boolean", label: "Funci\xF3n hep\xE1tica alterada (A)", description: "Cirrosis, bilirrubina > 2\xD7 o transaminasas > 3\xD7 el l\xEDmite superior." },
        { id: "ictus", type: "boolean", label: "Ictus previo (S)" },
        { id: "sangrado", type: "boolean", label: "Antecedente o predisposici\xF3n a hemorragia (B)", description: "Hemorragia mayor previa, anemia o di\xE1tesis hemorr\xE1gica." },
        { id: "inr", type: "boolean", label: "INR l\xE1bil (L)", description: "Tiempo en rango terap\xE9utico < 60 % (solo si toma antivitamina K)." },
        { id: "edad", type: "boolean", label: "Edad > 65 a\xF1os (E)" },
        { id: "farmacos", type: "boolean", label: "F\xE1rmacos que favorecen el sangrado (D)", description: "Antiagregantes o AINE." },
        { id: "alcohol", type: "boolean", label: "Consumo de alcohol (D)", description: "\u2265 8 unidades a la semana." }
      ],
      compute: (v) => {
        const score = sum(v, ["hta", "renal", "hepatica", "ictus", "sangrado", "inr", "edad", "farmacos", "alcohol"]);
        const tasas = [1.13, 1.02, 1.88, 3.74, 8.7, 12.5];
        const tasa = score <= 5 ? tasas[score] : 12.5;
        return {
          main: String(score),
          mainUnit: "puntos (0\u20139)",
          secondary: `\u2248 ${fmt(tasa, 1)}`,
          secondaryLabel: "hemorragias mayores / 100 pacientes-a\xF1o",
          interpretation: score >= 3 ? "Riesgo hemorr\xE1gico alto: no contraindica por s\xED solo la anticoagulaci\xF3n; corregir los factores modificables (HTA, INR l\xE1bil, f\xE1rmacos, alcohol) y programar controles m\xE1s frecuentes." : "Riesgo hemorr\xE1gico bajo-moderado con las precauciones habituales.",
          level: score >= 3 ? "danger" : score >= 2 ? "warn" : "ok"
        };
      },
      notes: [
        "HAS-BLED sirve para identificar y corregir factores de riesgo modificables, no para negar la anticoagulaci\xF3n.",
        "Tasas orientativas de la cohorte original (puntuaciones \u2265 5 con pocos pacientes)."
      ],
      references: [
        "Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation. Chest. 2010;138(5):1093-100."
      ]
    },
    {
      id: "orbit",
      name: "Puntuaci\xF3n ORBIT de riesgo hemorr\xE1gico en fibrilaci\xF3n auricular",
      shortName: "ORBIT",
      description: "Predice el riesgo de hemorragia mayor en pacientes con fibrilaci\xF3n auricular anticoagulados.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        {
          id: "anemia",
          type: "boolean",
          label: "Hemoglobina reducida o anemia",
          description: "Hb < 13 g/dL en varones o < 12 g/dL en mujeres, o hematocrito < 40/36 %.",
          points: 2
        },
        { id: "edad", type: "boolean", label: "Edad > 74 a\xF1os" },
        { id: "sangrado", type: "boolean", label: "Antecedente de sangrado", description: "Hemorragia digestiva, intracraneal o ictus hemorr\xE1gico previos.", points: 2 },
        { id: "renal", type: "boolean", label: "Insuficiencia renal (FGe < 60 mL/min/1,73 m\xB2)" },
        { id: "antiagregante", type: "boolean", label: "Tratamiento antiagregante concomitante" }
      ],
      compute: (v) => {
        const score = sum(v, ["anemia", "edad", "sangrado", "renal", "antiagregante"]);
        const banda = score <= 2 ? "bajo" : score === 3 ? "intermedio" : "alto";
        const tasa = score <= 2 ? 2.4 : score === 3 ? 4.7 : 8.1;
        return {
          main: String(score),
          mainUnit: "puntos (0\u20137)",
          secondary: `\u2248 ${fmt(tasa, 1)}`,
          secondaryLabel: "hemorragias mayores / 100 pacientes-a\xF1o",
          interpretation: `Riesgo hemorr\xE1gico ${banda}. Igual que HAS-BLED, orienta a corregir factores modificables y a intensificar el seguimiento, no a suspender la anticoagulaci\xF3n de forma autom\xE1tica.`,
          level: score <= 2 ? "ok" : score === 3 ? "warn" : "danger"
        };
      },
      references: [
        "O'Brien EC, et al. The ORBIT bleeding score: a simple bedside score to assess bleeding risk in atrial fibrillation. Eur Heart J. 2015;36(46):3258-64."
      ]
    },
    {
      id: "atria-hemorragia",
      name: "Puntuaci\xF3n ATRIA de riesgo hemorr\xE1gico",
      shortName: "ATRIA (hemorragia)",
      description: "Determina el riesgo de hemorragia mayor en pacientes anticoagulados con warfarina.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "anemia", type: "boolean", label: "Anemia", description: "Hb < 13 g/dL en varones o < 12 g/dL en mujeres.", points: 3 },
        { id: "renal", type: "boolean", label: "Enfermedad renal grave", description: "FGe < 30 mL/min o di\xE1lisis.", points: 3 },
        { id: "edad", type: "boolean", label: "Edad \u2265 75 a\xF1os", points: 2 },
        { id: "sangrado", type: "boolean", label: "Hemorragia previa" },
        { id: "hta", type: "boolean", label: "Hipertensi\xF3n arterial" }
      ],
      compute: (v) => {
        const score = sum(v, ["anemia", "renal", "edad", "sangrado", "hta"]);
        const banda = score <= 3 ? "bajo" : score === 4 ? "intermedio" : "alto";
        const tasa = score <= 3 ? 0.8 : score === 4 ? 2.6 : 5.8;
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          secondary: `\u2248 ${fmt(tasa, 1)} %`,
          secondaryLabel: "hemorragias mayores al a\xF1o",
          interpretation: `Riesgo hemorr\xE1gico ${banda} con warfarina.`,
          level: score <= 3 ? "ok" : score === 4 ? "warn" : "danger"
        };
      },
      references: [
        "Fang MC, et al. A new risk scheme to predict warfarin-associated hemorrhage (ATRIA). J Am Coll Cardiol. 2011;58(4):395-401."
      ]
    },
    {
      id: "hemorr2hages",
      name: "Puntuaci\xF3n HEMORR\u2082HAGES de riesgo hemorr\xE1gico",
      shortName: "HEMORR\u2082HAGES",
      description: "Cuantifica el riesgo hemorr\xE1gico en pacientes (sobre todo ancianos) con fibrilaci\xF3n auricular anticoagulados.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "hepatorenal", type: "boolean", label: "Enfermedad hep\xE1tica o renal (H)" },
        { id: "etanol", type: "boolean", label: "Abuso de alcohol (E)" },
        { id: "cancer", type: "boolean", label: "Neoplasia (M)" },
        { id: "edad", type: "boolean", label: "Edad > 75 a\xF1os (O)" },
        { id: "plaquetas", type: "boolean", label: "Cifra o funci\xF3n plaquetaria reducidas (R)", description: "Trombopenia o antiagregaci\xF3n." },
        { id: "resangrado", type: "boolean", label: "Hemorragia previa (R\u2082)", points: 2 },
        { id: "hta", type: "boolean", label: "Hipertensi\xF3n no controlada (H)" },
        { id: "anemia", type: "boolean", label: "Anemia (A)" },
        { id: "genetico", type: "boolean", label: "Factores gen\xE9ticos (G)", description: "Polimorfismos de CYP2C9, si se conocen." },
        { id: "caidas", type: "boolean", label: "Riesgo elevado de ca\xEDdas (E)" },
        { id: "ictus", type: "boolean", label: "Ictus previo (S)" }
      ],
      compute: (v) => {
        const score = sum(v, ["hepatorenal", "etanol", "cancer", "edad", "plaquetas", "resangrado", "hta", "anemia", "genetico", "caidas", "ictus"]);
        const banda = score <= 1 ? "bajo" : score <= 3 ? "intermedio" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201312)",
          interpretation: `Riesgo hemorr\xE1gico ${banda} (orientativo: de \u2248 1,9 hemorragias/100 pacientes-a\xF1o con 0 puntos a > 12 con \u2265 5). En riesgo alto, intensificar la vigilancia y corregir factores modificables.`,
          level: score <= 1 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Gage BF, et al. Clinical classification schemes for predicting hemorrhage (HEMORR2HAGES). Am Heart J. 2006;151(3):713-9."
      ]
    },
    {
      id: "dapt",
      name: "Puntuaci\xF3n DAPT (doble antiagregaci\xF3n prolongada)",
      shortName: "DAPT",
      description: "Identifica a los pacientes que se beneficiar\xEDan de prolongar la doble antiagregaci\xF3n m\xE1s all\xE1 de 12 meses tras el implante de un stent coronario.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 65 a\xF1os", value: 0 },
            { label: "65\u201374 a\xF1os", value: -1 },
            { label: "\u2265 75 a\xF1os", value: -2 }
          ]
        },
        { id: "tabaco", type: "boolean", label: "Fumador actual" },
        { id: "dm", type: "boolean", label: "Diabetes mellitus" },
        { id: "iamActual", type: "boolean", label: "Infarto de miocardio en la presentaci\xF3n" },
        { id: "previo", type: "boolean", label: "IAM o ICP previos" },
        { id: "paclitaxel", type: "boolean", label: "Stent liberador de paclitaxel" },
        { id: "diametro", type: "boolean", label: "Di\xE1metro del stent < 3 mm" },
        { id: "icc", type: "boolean", label: "Insuficiencia card\xEDaca o FEVI < 30 %", points: 2 },
        { id: "safena", type: "boolean", label: "Stent en injerto de vena safena", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "tabaco", "dm", "iamActual", "previo", "paclitaxel", "diametro", "icc", "safena"]);
        return {
          main: String(score),
          mainUnit: "puntos (\u22122 a 10)",
          interpretation: score >= 2 ? "Puntuaci\xF3n \u2265 2: relaci\xF3n beneficio/riesgo favorable a prolongar la doble antiagregaci\xF3n (menos eventos isqu\xE9micos que hemorragias a\xF1adidas)." : "Puntuaci\xF3n < 2: la prolongaci\xF3n de la doble antiagregaci\xF3n aporta poco beneficio isqu\xE9mico con m\xE1s riesgo hemorr\xE1gico; en general, no prolongar.",
          level: score >= 2 ? "info" : "warn"
        };
      },
      notes: ["Aplicable a pacientes que han completado 12 meses de doble antiagregaci\xF3n sin eventos isqu\xE9micos ni hemorr\xE1gicos mayores."],
      references: [
        "Yeh RW, et al. Development and validation of a prediction rule for benefit and harm of dual antiplatelet therapy beyond 1 year after percutaneous coronary intervention. JAMA. 2016;315(16):1735-49."
      ]
    }
  ];

  // src/calculators/cardio-sca.ts
  var CAT11 = "S\xEDndrome coronario agudo y dolor tor\xE1cico";
  var CARD2 = ["Cardiolog\xEDa"];
  var cardioSCA = [
    {
      id: "heart",
      name: "Puntuaci\xF3n HEART para eventos card\xEDacos mayores",
      shortName: "HEART",
      description: "Predice el riesgo a 6 semanas de eventos card\xEDacos adversos mayores (MACE) en pacientes con dolor tor\xE1cico en urgencias.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        {
          id: "historia",
          type: "select",
          label: "Historia cl\xEDnica (History)",
          options: [
            { label: "Poco sospechosa", value: 0 },
            { label: "Moderadamente sospechosa", value: 1 },
            { label: "Altamente sospechosa", value: 2 }
          ]
        },
        {
          id: "ecg",
          type: "select",
          label: "ECG",
          options: [
            { label: "Normal", value: 0 },
            { label: "Alteraciones inespec\xEDficas de la repolarizaci\xF3n", value: 1 },
            { label: "Descenso significativo del ST", value: 2 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad (Age)",
          options: [
            { label: "< 45 a\xF1os", value: 0 },
            { label: "45\u201364 a\xF1os", value: 1 },
            { label: "\u2265 65 a\xF1os", value: 2 }
          ]
        },
        {
          id: "factores",
          type: "select",
          label: "Factores de riesgo (Risk factors)",
          description: "HTA, hipercolesterolemia, diabetes, obesidad (IMC > 30), tabaquismo, historia familiar de cardiopat\xEDa precoz o enfermedad ateroscler\xF3tica conocida.",
          options: [
            { label: "Ninguno", value: 0 },
            { label: "1\u20132 factores", value: 1 },
            { label: "\u2265 3 factores o enfermedad ateroscler\xF3tica conocida", value: 2 }
          ]
        },
        {
          id: "troponina",
          type: "select",
          label: "Troponina (Troponin)",
          options: [
            { label: "\u2264 l\xEDmite normal", value: 0 },
            { label: "1\u20133 \xD7 el l\xEDmite normal", value: 1 },
            { label: "> 3 \xD7 el l\xEDmite normal", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["historia", "ecg", "edad", "factores", "troponina"]);
        const banda = score <= 3 ? "bajo" : score <= 6 ? "intermedio" : "alto";
        const pct = score <= 3 ? "\u2248 1\u20132 %" : score <= 6 ? "\u2248 12\u201317 %" : "\u2248 50\u201365 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          secondary: pct,
          secondaryLabel: "MACE a 6 semanas",
          interpretation: banda === "bajo" ? "Riesgo bajo: candidato a alta precoz con seguimiento ambulatorio (seg\xFAn protocolo HEART Pathway con troponinas seriadas negativas)." : banda === "intermedio" ? "Riesgo intermedio: observaci\xF3n e ingreso para estudio (troponinas seriadas, pruebas de isquemia)." : "Riesgo alto: manejo agresivo precoz, valorar estrategia invasiva.",
          level: banda === "bajo" ? "ok" : banda === "intermedio" ? "warn" : "danger"
        };
      },
      references: [
        "Six AJ, Backus BE, Kelder JC. Chest pain in the emergency room: value of the HEART score. Neth Heart J. 2008;16(6):191-6.",
        "Backus BE, et al. A prospective validation of the HEART score for chest pain patients at the emergency department. Int J Cardiol. 2013;168(3):2153-8."
      ]
    },
    {
      id: "edacs",
      name: "Escala EDACS de dolor tor\xE1cico en urgencias",
      shortName: "EDACS",
      description: "Identifica a los pacientes con dolor tor\xE1cico de bajo riesgo de evento coronario adverso mayor a 30 d\xEDas.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          dropdown: true,
          options: [
            { label: "18\u201345 a\xF1os", value: 2 },
            { label: "46\u201350 a\xF1os", value: 4 },
            { label: "51\u201355 a\xF1os", value: 6 },
            { label: "56\u201360 a\xF1os", value: 8 },
            { label: "61\u201365 a\xF1os", value: 10 },
            { label: "66\u201370 a\xF1os", value: 12 },
            { label: "71\u201375 a\xF1os", value: 14 },
            { label: "76\u201380 a\xF1os", value: 16 },
            { label: "81\u201385 a\xF1os", value: 18 },
            { label: "\u2265 86 a\xF1os", value: 20 }
          ]
        },
        { id: "varon", type: "boolean", label: "Sexo masculino", points: 6 },
        {
          id: "riesgo",
          type: "boolean",
          label: "EAC conocida o \u2265 3 factores de riesgo (solo si tiene 18\u201350 a\xF1os)",
          description: "Factores: HTA, dislipemia, diabetes, tabaquismo, historia familiar de cardiopat\xEDa precoz.",
          points: 4
        },
        { id: "sudor", type: "boolean", label: "Diaforesis", points: 3 },
        { id: "irradiacion", type: "boolean", label: "Dolor irradiado a brazo, hombro, cuello o mand\xEDbula", points: 5 },
        { id: "inspiracion", type: "boolean", label: "El dolor empeora con la inspiraci\xF3n", points: -4 },
        { id: "palpacion", type: "boolean", label: "El dolor se reproduce con la palpaci\xF3n", points: -6 }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "varon", "riesgo", "sudor", "irradiacion", "inspiracion", "palpacion"]);
        return {
          main: String(score),
          mainUnit: "puntos",
          interpretation: score < 16 ? "EDACS < 16: riesgo bajo si adem\xE1s el ECG no muestra isquemia aguda y las troponinas a las 0 y 2 h son negativas \u2014 candidato a alta precoz con seguimiento." : "EDACS \u2265 16: no es de bajo riesgo; continuar la evaluaci\xF3n habitual del s\xEDndrome coronario agudo.",
          level: score < 16 ? "ok" : "warn"
        };
      },
      notes: ["La regla completa (EDACS-ADP) exige, adem\xE1s de la puntuaci\xF3n < 16, un ECG sin isquemia y troponinas seriadas negativas."],
      references: [
        "Than M, et al. Development and validation of the Emergency Department Assessment of Chest pain Score and 2 h accelerated diagnostic protocol. Emerg Med Australas. 2014;26(1):34-44."
      ]
    },
    {
      id: "timi-nstemi",
      name: "Puntuaci\xF3n TIMI para angina inestable / IAMSEST",
      shortName: "TIMI UA/NSTEMI",
      description: "Estima el riesgo de muerte, infarto o revascularizaci\xF3n urgente a 14 d\xEDas en angina inestable o infarto sin elevaci\xF3n del ST.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad \u2265 65 a\xF1os" },
        { id: "factores", type: "boolean", label: "\u2265 3 factores de riesgo de EAC", description: "HTA, hipercolesterolemia, diabetes, tabaquismo, historia familiar." },
        { id: "eac", type: "boolean", label: "EAC conocida (estenosis \u2265 50 %)" },
        { id: "aas", type: "boolean", label: "Uso de AAS en los \xFAltimos 7 d\xEDas" },
        { id: "angina", type: "boolean", label: "Angina grave reciente (\u2265 2 episodios en 24 h)" },
        { id: "st", type: "boolean", label: "Desviaci\xF3n del ST \u2265 0,5 mm en el ECG" },
        { id: "marcadores", type: "boolean", label: "Marcadores card\xEDacos elevados" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "factores", "eac", "aas", "angina", "st", "marcadores"]);
        const riesgo2 = [4.7, 4.7, 8.3, 13.2, 19.9, 26.2, 40.9, 40.9][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20137)",
          secondary: `${fmt(riesgo2, 1)} %`,
          secondaryLabel: "eventos a 14 d\xEDas",
          interpretation: score <= 2 ? "Riesgo bajo de muerte, IAM o revascularizaci\xF3n urgente a 14 d\xEDas." : score <= 4 ? "Riesgo intermedio: se beneficia de tratamiento antitromb\xF3tico intensivo y estrategia invasiva precoz." : "Riesgo alto: estrategia invasiva precoz recomendada.",
          level: score <= 2 ? "ok" : score <= 4 ? "warn" : "danger"
        };
      },
      references: [
        "Antman EM, et al. The TIMI risk score for unstable angina/non-ST elevation MI. JAMA. 2000;284(7):835-42."
      ]
    },
    {
      id: "timi-stemi",
      name: "Puntuaci\xF3n TIMI para STEMI",
      shortName: "TIMI STEMI",
      description: "Estima la mortalidad a 30 d\xEDas en el infarto agudo de miocardio con elevaci\xF3n del ST.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 65 a\xF1os", value: 0 },
            { label: "65\u201374 a\xF1os", value: 2 },
            { label: "\u2265 75 a\xF1os", value: 3 }
          ]
        },
        { id: "dmHtaAngina", type: "boolean", label: "Diabetes, hipertensi\xF3n o angina previa" },
        { id: "pas", type: "boolean", label: "PA sist\xF3lica < 100 mmHg", points: 3 },
        { id: "fc", type: "boolean", label: "Frecuencia card\xEDaca > 100 lpm", points: 2 },
        { id: "killip", type: "boolean", label: "Clase Killip II\u2013IV", points: 2 },
        { id: "peso", type: "boolean", label: "Peso < 67 kg" },
        { id: "anterior", type: "boolean", label: "Elevaci\xF3n del ST anterior o bloqueo de rama izquierda" },
        { id: "tiempo", type: "boolean", label: "Tiempo hasta el tratamiento > 4 horas" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "dmHtaAngina", "pas", "fc", "killip", "peso", "anterior", "tiempo"]);
        const tabla = [0.8, 1.6, 2.2, 4.4, 7.3, 12.4, 16.1, 23.4, 26.8];
        const riesgo2 = score <= 8 ? tabla[score] : 35.9;
        return {
          main: String(score),
          mainUnit: "puntos (0\u201314)",
          secondary: `${fmt(riesgo2, 1)} %`,
          secondaryLabel: "mortalidad a 30 d\xEDas",
          interpretation: score <= 3 ? "Riesgo bajo-moderado de mortalidad a 30 d\xEDas." : score <= 6 ? "Riesgo elevado: vigilancia intensiva tras la reperfusi\xF3n." : "Riesgo muy elevado: considerar soporte avanzado y vigilancia en unidad coronaria.",
          level: score <= 3 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      references: [
        "Morrow DA, et al. TIMI risk score for ST-elevation myocardial infarction. Circulation. 2000;102(17):2031-7."
      ]
    },
    {
      id: "timi-indice",
      name: "\xCDndice de riesgo TIMI",
      shortName: "\xCDndice TIMI",
      description: "Estimaci\xF3n r\xE1pida de la mortalidad en el s\xEDndrome coronario agudo usando solo edad, frecuencia card\xEDaca y presi\xF3n arterial.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        { id: "fc", type: "number", label: "Frecuencia card\xEDaca", unit: "lpm", min: 20, max: 250 },
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 18, max: 110 },
        { id: "pas", type: "number", label: "Presi\xF3n arterial sist\xF3lica", unit: "mmHg", min: 40, max: 260 }
      ],
      compute: (v) => {
        const indice = v.fc * Math.pow(v.edad / 10, 2) / v.pas;
        const banda = indice < 12.5 ? "muy bajo" : indice < 17.5 ? "bajo" : indice < 22.5 ? "intermedio" : indice < 30 ? "alto" : "muy alto";
        return {
          main: fmt(indice, 1),
          interpretation: `Riesgo ${banda} de mortalidad a 30 d\xEDas (quintiles orientativos: < 12,5 \u2248 < 1 %; > 30 \u2248 \u2265 8 %). \xDAtil como triaje r\xE1pido inicial; no sustituye a las escalas completas.`,
          level: indice < 17.5 ? "ok" : indice < 22.5 ? "info" : indice < 30 ? "warn" : "danger",
          details: ["\xCDndice = FC \xD7 (edad/10)\xB2 / PAS."]
        };
      },
      references: [
        "Morrow DA, et al. A simple risk index for rapid initial triage of patients with ST-elevation myocardial infarction (InTIME II). Lancet. 2001;358(9293):1571-5."
      ]
    },
    {
      id: "sgarbossa",
      name: "Criterios de Sgarbossa (originales y modificados)",
      shortName: "Sgarbossa",
      description: "Diagnostica el infarto agudo de miocardio en presencia de bloqueo de rama izquierda o ritmo de marcapasos.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        {
          id: "concordanteSt",
          type: "boolean",
          label: "Elevaci\xF3n del ST \u2265 1 mm concordante con el QRS",
          description: "En cualquier derivaci\xF3n.",
          points: 5
        },
        {
          id: "descensoV1V3",
          type: "boolean",
          label: "Descenso del ST \u2265 1 mm en V1\u2013V3",
          points: 3
        },
        {
          id: "discordante",
          type: "boolean",
          label: "Elevaci\xF3n del ST \u2265 5 mm discordante con el QRS",
          points: 2
        },
        {
          id: "ratio",
          type: "boolean",
          label: "Criterio modificado (Smith): elevaci\xF3n discordante del ST con relaci\xF3n ST/S \u2265 0,25",
          description: "Elevaci\xF3n del ST \u2265 1 mm y ST/S \u2265 25 % en cualquier derivaci\xF3n.",
          noPoints: true
        }
      ],
      compute: (v) => {
        const score = sum(v, ["concordanteSt", "descensoV1V3", "discordante"]);
        const originalPositivo = score >= 3;
        const modificadoPositivo = v.concordanteSt === 5 || v.descensoV1V3 === 3 || v.ratio === 1;
        return {
          main: String(score),
          mainUnit: "puntos (criterios originales)",
          secondary: modificadoPositivo ? "Positivos" : "Negativos",
          secondaryLabel: "criterios modificados (Smith)",
          interpretation: originalPositivo ? "Criterios originales \u2265 3 puntos: alta especificidad para infarto agudo de miocardio \u2014 activar el protocolo de reperfusi\xF3n." : modificadoPositivo ? "Criterios modificados positivos: sugieren IAM con mayor sensibilidad que los originales \u2014 correlacionar con cl\xEDnica y troponinas y valorar reperfusi\xF3n." : "Criterios negativos: no descartan el infarto (sensibilidad limitada); seriar ECG y troponinas si la sospecha persiste.",
          level: originalPositivo || modificadoPositivo ? "danger" : "info"
        };
      },
      references: [
        "Sgarbossa EB, et al. Electrocardiographic diagnosis of evolving acute myocardial infarction in the presence of left bundle-branch block. N Engl J Med. 1996;334(8):481-7.",
        "Smith SW, et al. Diagnosis of ST-elevation myocardial infarction in the presence of left bundle branch block with the ST-elevation to S-wave ratio in a modified Sgarbossa rule. Ann Emerg Med. 2012;60(6):766-76."
      ]
    },
    {
      id: "killip",
      name: "Clasificaci\xF3n de Killip para la insuficiencia card\xEDaca en el SCA",
      shortName: "Killip",
      description: "Cuantifica la gravedad de la insuficiencia card\xEDaca en el s\xEDndrome coronario agudo y estima la mortalidad.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        {
          id: "clase",
          type: "select",
          label: "Clase Killip",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "I \u2014 Sin signos de insuficiencia card\xEDaca", value: 1 },
            { label: "II \u2014 Crepitantes basales, galope S3 o ingurgitaci\xF3n yugular", value: 2 },
            { label: "III \u2014 Edema agudo de pulm\xF3n", value: 3 },
            { label: "IV \u2014 Shock cardiog\xE9nico (hipotensi\xF3n, hipoperfusi\xF3n)", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const c = v.clase ?? 1;
        const mort = ["", "\u2248 6 %", "\u2248 17 %", "\u2248 38 %", "\u2248 67\u201381 %"][c];
        return {
          main: `Killip ${["", "I", "II", "III", "IV"][c]}`,
          secondary: mort,
          secondaryLabel: "mortalidad hist\xF3rica a 30 d\xEDas",
          interpretation: c === 1 ? "Sin insuficiencia card\xEDaca: pron\xF3stico favorable." : c === 2 ? "Insuficiencia card\xEDaca leve-moderada: vigilancia estrecha y tratamiento descongestivo." : c === 3 ? "Edema agudo de pulm\xF3n: tratamiento intensivo inmediato." : "Shock cardiog\xE9nico: soporte hemodin\xE1mico y revascularizaci\xF3n urgente.",
          level: c === 1 ? "ok" : c === 2 ? "info" : c === 3 ? "warn" : "danger"
        };
      },
      notes: ["Las mortalidades proceden de la serie original (1967); con la reperfusi\xF3n actual son menores, pero el gradiente pron\xF3stico se mantiene."],
      references: [
        "Killip T, Kimball JT. Treatment of myocardial infarction in a coronary care unit. Am J Cardiol. 1967;20(4):457-64."
      ]
    },
    {
      id: "duke-treadmill",
      name: "Puntuaci\xF3n de la cinta de correr de Duke",
      shortName: "Duke Treadmill",
      description: "Estratifica el pron\xF3stico de la enfermedad coronaria sospechada a partir de la ergometr\xEDa (protocolo de Bruce).",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        { id: "minutos", type: "number", label: "Duraci\xF3n del ejercicio (protocolo de Bruce)", unit: "min", min: 0, max: 30 },
        { id: "st", type: "number", label: "Desviaci\xF3n m\xE1xima del ST", unit: "mm", min: 0, max: 10, step: 0.5 },
        {
          id: "angina",
          type: "select",
          label: "Angina durante la prueba",
          options: [
            { label: "Sin angina", value: 0 },
            { label: "Angina que no limita la prueba", value: 1 },
            { label: "Angina que obliga a parar", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const dts = v.minutos - 5 * v.st - 4 * (v.angina ?? 0);
        const banda = dts >= 5 ? "bajo" : dts >= -10 ? "intermedio" : "alto";
        return {
          main: fmt(dts, 1),
          mainUnit: "puntos",
          interpretation: banda === "bajo" ? "Riesgo bajo (\u2265 +5): supervivencia a 4 a\xF1os \u2248 99 %; en general no requiere estudios invasivos." : banda === "intermedio" ? "Riesgo intermedio (\u221210 a +4): valorar prueba de imagen o coronariograf\xEDa seg\xFAn el contexto cl\xEDnico." : "Riesgo alto (\u2264 \u221211): mortalidad anual \u2248 5 %; considerar coronariograf\xEDa.",
          level: banda === "bajo" ? "ok" : banda === "intermedio" ? "warn" : "danger",
          details: ["DTS = minutos de ejercicio \u2212 5 \xD7 desviaci\xF3n del ST (mm) \u2212 4 \xD7 \xEDndice de angina."]
        };
      },
      references: [
        "Mark DB, et al. Exercise treadmill score for predicting prognosis in coronary artery disease. Ann Intern Med. 1987;106(6):793-800."
      ]
    },
    {
      id: "brugada-tv",
      name: "Criterios de Brugada para taquicardia ventricular",
      shortName: "Brugada TV",
      description: "Algoritmo secuencial para distinguir la taquicardia ventricular de la supraventricular con aberrancia en la taquicardia regular de QRS ancho.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        {
          id: "rs",
          type: "boolean",
          label: "Paso 1 \u2014 Ausencia de complejo RS en todas las derivaciones precordiales",
          noPoints: true
        },
        {
          id: "rsLargo",
          type: "boolean",
          label: "Paso 2 \u2014 Intervalo R\u2013S > 100 ms en alguna precordial",
          description: "Del inicio de la R al nadir de la S.",
          noPoints: true
        },
        {
          id: "disociacion",
          type: "boolean",
          label: "Paso 3 \u2014 Disociaci\xF3n auriculoventricular",
          noPoints: true
        },
        {
          id: "morfologia",
          type: "boolean",
          label: "Paso 4 \u2014 Criterios morfol\xF3gicos de TV en V1\u2013V2 y V6",
          noPoints: true
        }
      ],
      compute: (v) => {
        const tv = v.rs === 1 || v.rsLargo === 1 || v.disociacion === 1 || v.morfologia === 1;
        return {
          main: tv ? "TV" : "TSV con aberrancia",
          interpretation: tv ? "Si cualquiera de los pasos es positivo, el algoritmo diagnostica taquicardia ventricular (especificidad alta). Tratar como TV." : "Con los cuatro pasos negativos, el algoritmo sugiere taquicardia supraventricular con conducci\xF3n aberrante. Ante la duda, tratar siempre como TV.",
          level: tv ? "danger" : "info"
        };
      },
      notes: [
        "En pacientes inestables no aplicar algoritmos: cardioversi\xF3n inmediata.",
        "Ante la duda, toda taquicardia regular de QRS ancho se trata como TV."
      ],
      references: [
        "Brugada P, et al. A new approach to the differential diagnosis of a regular tachycardia with a wide QRS complex. Circulation. 1991;83(5):1649-59."
      ]
    },
    {
      id: "mehran",
      name: "Puntuaci\xF3n de Mehran para nefropat\xEDa por contraste tras ICP",
      shortName: "Mehran",
      description: "Predice el riesgo de nefropat\xEDa inducida por contraste tras una intervenci\xF3n coronaria percut\xE1nea.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        { id: "hipotension", type: "boolean", label: "Hipotensi\xF3n", description: "PAS < 80 mmHg \u2265 1 h que requiere soporte.", points: 5 },
        { id: "biac", type: "boolean", label: "Bal\xF3n de contrapulsaci\xF3n intraa\xF3rtico", points: 5 },
        { id: "icc", type: "boolean", label: "Insuficiencia card\xEDaca (NYHA III\u2013IV o edema pulmonar)", points: 5 },
        { id: "edad", type: "boolean", label: "Edad > 75 a\xF1os", points: 4 },
        { id: "anemia", type: "boolean", label: "Anemia", description: "Hto < 39 % en varones o < 36 % en mujeres.", points: 3 },
        { id: "dm", type: "boolean", label: "Diabetes mellitus", points: 3 },
        {
          id: "fge",
          type: "select",
          label: "Filtrado glomerular estimado",
          options: [
            { label: "\u2265 60 mL/min/1,73 m\xB2", value: 0 },
            { label: "40\u201359", value: 2 },
            { label: "20\u201339", value: 4 },
            { label: "< 20", value: 6 }
          ]
        },
        { id: "contraste", type: "number", label: "Volumen de contraste", unit: "mL", min: 0, max: 1e3 }
      ],
      compute: (v) => {
        const score = sum(v, ["hipotension", "biac", "icc", "edad", "anemia", "dm", "fge"]) + Math.floor(v.contraste / 100);
        const banda = score <= 5 ? "bajo" : score <= 10 ? "moderado" : score <= 15 ? "alto" : "muy alto";
        const nic = score <= 5 ? "7,5 %" : score <= 10 ? "14 %" : score <= 15 ? "26 %" : "57 %";
        const dialisis = score <= 5 ? "0,04 %" : score <= 10 ? "0,12 %" : score <= 15 ? "1,1 %" : "12,6 %";
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: nic,
          secondaryLabel: "riesgo de nefropat\xEDa por contraste",
          interpretation: `Riesgo ${banda}. Riesgo de di\xE1lisis: ${dialisis}. En riesgo moderado-alto: hidrataci\xF3n pautada, minimizar contraste y evitar nefrot\xF3xicos.`,
          level: score <= 5 ? "ok" : score <= 10 ? "info" : score <= 15 ? "warn" : "danger",
          details: ["El volumen de contraste a\xF1ade 1 punto por cada 100 mL."]
        };
      },
      references: [
        "Mehran R, et al. A simple risk score for prediction of contrast-induced nephropathy after percutaneous coronary intervention. J Am Coll Cardiol. 2004;44(7):1393-9."
      ]
    }
  ];

  // src/calculators/cardio-tev.ts
  var CAT12 = "Tromboembolismo venoso";
  var CARD3 = ["Cardiolog\xEDa"];
  var cardioTEV = [
    {
      id: "wells-ep",
      name: "Criterios de Wells para la embolia pulmonar",
      shortName: "Wells EP",
      description: "Calcula la probabilidad cl\xEDnica (pretest) de embolia pulmonar para decidir los siguientes pasos diagn\xF3sticos.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "tvp", type: "boolean", label: "Signos cl\xEDnicos de TVP", description: "Edema y dolor a la palpaci\xF3n de la pierna.", points: 3 },
        { id: "primera", type: "boolean", label: "La EP es el diagn\xF3stico m\xE1s probable (o igual de probable)", points: 3 },
        { id: "fc", type: "boolean", label: "Frecuencia card\xEDaca > 100 lpm", points: 1.5 },
        { id: "inmovilizacion", type: "boolean", label: "Inmovilizaci\xF3n \u2265 3 d\xEDas o cirug\xEDa en las \xFAltimas 4 semanas", points: 1.5 },
        { id: "previo", type: "boolean", label: "TVP o EP previas", points: 1.5 },
        { id: "hemoptisis", type: "boolean", label: "Hemoptisis" },
        { id: "cancer", type: "boolean", label: "Neoplasia activa", description: "En tratamiento, tratada en los \xFAltimos 6 meses o paliativa." }
      ],
      compute: (v) => {
        const score = sum(v, ["tvp", "primera", "fc", "inmovilizacion", "previo", "hemoptisis", "cancer"]);
        const tres = score < 2 ? "baja" : score <= 6 ? "intermedia" : "alta";
        const dos = score <= 4 ? "EP improbable" : "EP probable";
        return {
          main: fmt(score, 1),
          mainUnit: "puntos",
          secondary: dos,
          secondaryLabel: "modelo de dos niveles",
          interpretation: score <= 4 ? `Probabilidad ${tres} (tres niveles). Con \xABEP improbable\xBB (\u2264 4): d\xEDmero D; si es negativo, la EP queda razonablemente excluida.` : `Probabilidad ${tres} (tres niveles). Con \xABEP probable\xBB (> 4): angio-TC pulmonar directamente (el d\xEDmero D no basta para excluir).`,
          level: score < 2 ? "ok" : score <= 4 ? "info" : score <= 6 ? "warn" : "danger"
        };
      },
      references: [
        "Wells PS, et al. Derivation of a simple clinical model to categorize patients probability of pulmonary embolism. Thromb Haemost. 2000;83(3):416-20."
      ]
    },
    {
      id: "wells-tvp",
      name: "Criterios de Wells para la trombosis venosa profunda",
      shortName: "Wells TVP",
      description: "Calcula la probabilidad cl\xEDnica de trombosis venosa profunda.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "cancer", type: "boolean", label: "Neoplasia activa", description: "En tratamiento actual, en los \xFAltimos 6 meses o paliativa." },
        { id: "paralisis", type: "boolean", label: "Par\xE1lisis, paresia o inmovilizaci\xF3n reciente con yeso de una pierna" },
        { id: "encamado", type: "boolean", label: "Encamado \u2265 3 d\xEDas o cirug\xEDa mayor en las \xFAltimas 12 semanas" },
        { id: "dolor", type: "boolean", label: "Dolor a la palpaci\xF3n del trayecto venoso profundo" },
        { id: "edemaPierna", type: "boolean", label: "Edema de toda la pierna" },
        { id: "pantorrilla", type: "boolean", label: "Per\xEDmetro de la pantorrilla > 3 cm mayor que el contralateral", description: "Medido 10 cm bajo la tuberosidad tibial." },
        { id: "fovea", type: "boolean", label: "Edema con f\xF3vea limitado a la pierna sintom\xE1tica" },
        { id: "colaterales", type: "boolean", label: "Venas superficiales colaterales (no varicosas)" },
        { id: "previa", type: "boolean", label: "TVP previa documentada" },
        { id: "alternativo", type: "boolean", label: "Diagn\xF3stico alternativo al menos igual de probable", points: -2 }
      ],
      compute: (v) => {
        const score = sum(v, ["cancer", "paralisis", "encamado", "dolor", "edemaPierna", "pantorrilla", "fovea", "colaterales", "previa", "alternativo"]);
        const banda = score <= 0 ? "baja (\u2248 5 %)" : score <= 2 ? "moderada (\u2248 17 %)" : "alta (\u2248 17\u201353 %)";
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: score >= 2 ? "TVP probable" : "TVP improbable",
          secondaryLabel: "modelo de dos niveles",
          interpretation: score >= 2 ? `Probabilidad ${banda}. Con \xABTVP probable\xBB (\u2265 2): ecograf\xEDa de compresi\xF3n; el d\xEDmero D negativo no excluye por s\xED solo.` : `Probabilidad ${banda}. Con \xABTVP improbable\xBB (< 2): d\xEDmero D; si es negativo, la TVP queda razonablemente excluida.`,
          level: score <= 0 ? "ok" : score <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Wells PS, et al. Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med. 2003;349(13):1227-35."
      ]
    },
    {
      id: "perc",
      name: "Regla PERC para la embolia pulmonar",
      shortName: "PERC",
      description: "Descarta la embolia pulmonar sin m\xE1s pruebas cuando la probabilidad cl\xEDnica es baja (< 15 %) y no se cumple ning\xFAn criterio.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad \u2265 50 a\xF1os" },
        { id: "fc", type: "boolean", label: "Frecuencia card\xEDaca \u2265 100 lpm" },
        { id: "spo2", type: "boolean", label: "SpO\u2082 < 95 % (aire ambiente)" },
        { id: "edema", type: "boolean", label: "Edema unilateral de una pierna" },
        { id: "hemoptisis", type: "boolean", label: "Hemoptisis" },
        { id: "cirugia", type: "boolean", label: "Cirug\xEDa o traumatismo en las \xFAltimas 4 semanas" },
        { id: "previo", type: "boolean", label: "TVP o EP previas" },
        { id: "hormonas", type: "boolean", label: "Uso de estr\xF3genos", description: "Anticonceptivos, terapia hormonal." }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "fc", "spo2", "edema", "hemoptisis", "cirugia", "previo", "hormonas"]);
        return {
          main: String(score),
          mainUnit: score === 1 ? "criterio" : "criterios",
          interpretation: score === 0 ? "PERC negativa: en pacientes con probabilidad cl\xEDnica baja (< 15 %), la EP queda descartada sin necesidad de d\xEDmero D (riesgo residual < 2 %)." : "PERC positiva: no permite descartar la EP; continuar con d\xEDmero D o imagen seg\xFAn la probabilidad cl\xEDnica.",
          level: score === 0 ? "ok" : "warn"
        };
      },
      notes: ["Solo aplicable si la impresi\xF3n cl\xEDnica previa es de probabilidad baja; no usar en pacientes de probabilidad intermedia o alta."],
      references: [
        "Kline JA, et al. Clinical criteria to prevent unnecessary diagnostic testing in emergency department patients with suspected pulmonary embolism. J Thromb Haemost. 2004;2(8):1247-55."
      ]
    },
    {
      id: "ginebra",
      name: "Puntuaci\xF3n de Ginebra revisada para la embolia pulmonar",
      shortName: "Ginebra revisada",
      description: "Objetiva la probabilidad cl\xEDnica de embolia pulmonar (alternativa a los criterios de Wells).",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad > 65 a\xF1os" },
        { id: "previo", type: "boolean", label: "TVP o EP previas", points: 3 },
        { id: "cirugia", type: "boolean", label: "Cirug\xEDa o fractura en el \xFAltimo mes", points: 2 },
        { id: "cancer", type: "boolean", label: "Neoplasia activa", points: 2 },
        { id: "dolorUnilateral", type: "boolean", label: "Dolor unilateral en una pierna", points: 3 },
        { id: "hemoptisis", type: "boolean", label: "Hemoptisis", points: 2 },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia card\xEDaca",
          options: [
            { label: "< 75 lpm", value: 0 },
            { label: "75\u201394 lpm", value: 3 },
            { label: "\u2265 95 lpm", value: 5 }
          ]
        },
        {
          id: "palpacion",
          type: "boolean",
          label: "Dolor a la palpaci\xF3n venosa profunda y edema unilateral",
          points: 4
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "previo", "cirugia", "cancer", "dolorUnilateral", "hemoptisis", "fc", "palpacion"]);
        const banda = score <= 3 ? "baja (\u2248 8 %)" : score <= 10 ? "intermedia (\u2248 28 %)" : "alta (\u2248 74 %)";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201325)",
          interpretation: `Probabilidad cl\xEDnica ${banda} de embolia pulmonar. Probabilidad baja-intermedia: d\xEDmero D; probabilidad alta: imagen directamente.`,
          level: score <= 3 ? "ok" : score <= 10 ? "warn" : "danger"
        };
      },
      references: [
        "Le Gal G, et al. Prediction of pulmonary embolism in the emergency department: the revised Geneva score. Ann Intern Med. 2006;144(3):165-71."
      ]
    },
    {
      id: "pesi",
      name: "\xCDndice de gravedad de la embolia pulmonar (PESI)",
      shortName: "PESI",
      description: "Predice la mortalidad a 30 d\xEDas en pacientes con embolia pulmonar confirmada.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "edad", type: "number", label: "Edad (suma 1 punto por a\xF1o)", unit: "a\xF1os", min: 18, max: 110 },
        { id: "varon", type: "boolean", label: "Sexo masculino", points: 10 },
        { id: "cancer", type: "boolean", label: "Neoplasia", points: 30 },
        { id: "icc", type: "boolean", label: "Insuficiencia card\xEDaca cr\xF3nica", points: 10 },
        { id: "epoc", type: "boolean", label: "Enfermedad pulmonar cr\xF3nica", points: 10 },
        { id: "fc", type: "boolean", label: "Frecuencia card\xEDaca \u2265 110 lpm", points: 20 },
        { id: "pas", type: "boolean", label: "PA sist\xF3lica < 100 mmHg", points: 30 },
        { id: "fr", type: "boolean", label: "Frecuencia respiratoria \u2265 30 rpm", points: 20 },
        { id: "temp", type: "boolean", label: "Temperatura < 36 \xB0C", points: 20 },
        { id: "mental", type: "boolean", label: "Alteraci\xF3n del estado mental", description: "Desorientaci\xF3n, letargo, estupor o coma.", points: 60 },
        { id: "spo2", type: "boolean", label: "SpO\u2082 < 90 %", points: 20 }
      ],
      compute: (v) => {
        const score = v.edad + sum(v, ["varon", "cancer", "icc", "epoc", "fc", "pas", "fr", "temp", "mental", "spo2"]);
        const clase = score <= 65 ? 1 : score <= 85 ? 2 : score <= 105 ? 3 : score <= 125 ? 4 : 5;
        const mort = ["", "0\u20131,6 %", "1,7\u20133,5 %", "3,2\u20137,1 %", "4,0\u201311,4 %", "10\u201324,5 %"][clase];
        return {
          main: String(score),
          mainUnit: `puntos \u2014 clase ${["", "I", "II", "III", "IV", "V"][clase]}`,
          secondary: mort,
          secondaryLabel: "mortalidad a 30 d\xEDas",
          interpretation: clase <= 2 ? "Clases I\u2013II (riesgo bajo): candidato a tratamiento ambulatorio o alta precoz si no hay otros motivos de ingreso." : clase === 3 ? "Clase III (riesgo intermedio): ingreso y vigilancia." : "Clases IV\u2013V (riesgo alto): ingreso, considerar unidad de intermedios/UCI y evaluar disfunci\xF3n del ventr\xEDculo derecho.",
          level: clase <= 2 ? "ok" : clase === 3 ? "warn" : "danger"
        };
      },
      references: [
        "Aujesky D, et al. Derivation and validation of a prognostic model for pulmonary embolism. Am J Respir Crit Care Med. 2005;172(8):1041-6."
      ]
    },
    {
      id: "spesi",
      name: "PESI simplificado (sPESI)",
      shortName: "sPESI",
      description: "Predice la mortalidad a 30 d\xEDas en la embolia pulmonar con solo seis criterios.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad > 80 a\xF1os" },
        { id: "cancer", type: "boolean", label: "Neoplasia" },
        { id: "cardiopulmonar", type: "boolean", label: "Enfermedad cardiopulmonar cr\xF3nica", description: "Insuficiencia card\xEDaca o enfermedad pulmonar cr\xF3nica." },
        { id: "fc", type: "boolean", label: "Frecuencia card\xEDaca \u2265 110 lpm" },
        { id: "pas", type: "boolean", label: "PA sist\xF3lica < 100 mmHg" },
        { id: "spo2", type: "boolean", label: "SpO\u2082 < 90 %" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "cancer", "cardiopulmonar", "fc", "pas", "spo2"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20136)",
          secondary: score === 0 ? "\u2248 1,0 %" : "\u2248 10,9 %",
          secondaryLabel: "mortalidad a 30 d\xEDas",
          interpretation: score === 0 ? "sPESI = 0: riesgo bajo; candidato a tratamiento ambulatorio o alta precoz si el resto del contexto lo permite." : "sPESI \u2265 1: riesgo no bajo; ingreso y estratificaci\xF3n adicional (biomarcadores, funci\xF3n del ventr\xEDculo derecho).",
          level: score === 0 ? "ok" : "danger"
        };
      },
      references: [
        "Jim\xE9nez D, et al. Simplification of the Pulmonary Embolism Severity Index for prognostication in patients with acute symptomatic pulmonary embolism. Arch Intern Med. 2010;170(15):1383-9."
      ]
    },
    {
      id: "hestia",
      name: "Criterios de Hestia para el tratamiento ambulatorio de la EP",
      shortName: "Hestia",
      description: "Identifica a los pacientes con embolia pulmonar aguda que pueden tratarse de forma ambulatoria.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "inestable", type: "boolean", label: "Inestabilidad hemodin\xE1mica", description: "PAS < 100 mmHg con FC > 100 lpm; o necesidad de UCI/vasoactivos." },
        { id: "trombolisis", type: "boolean", label: "Necesidad de tromb\xF3lisis o embolectom\xEDa" },
        { id: "sangradoActivo", type: "boolean", label: "Hemorragia activa o riesgo hemorr\xE1gico alto" },
        { id: "oxigeno", type: "boolean", label: "Necesidad de ox\xEDgeno para mantener SpO\u2082 > 90 % durante m\xE1s de 24 h" },
        { id: "anticoagulado", type: "boolean", label: "EP diagnosticada estando ya anticoagulado" },
        { id: "dolor", type: "boolean", label: "Dolor intenso que requiere analgesia intravenosa > 24 h" },
        { id: "social", type: "boolean", label: "Motivo m\xE9dico o social que exige ingreso > 24 h" },
        { id: "renal", type: "boolean", label: "Aclaramiento de creatinina < 30 mL/min" },
        { id: "hepatica", type: "boolean", label: "Insuficiencia hep\xE1tica grave" },
        { id: "embarazo", type: "boolean", label: "Embarazo" },
        { id: "tih", type: "boolean", label: "Antecedente documentado de trombopenia inducida por heparina" }
      ],
      compute: (v) => {
        const score = sum(v, ["inestable", "trombolisis", "sangradoActivo", "oxigeno", "anticoagulado", "dolor", "social", "renal", "hepatica", "embarazo", "tih"]);
        return {
          main: String(score),
          mainUnit: score === 1 ? "criterio" : "criterios",
          interpretation: score === 0 ? "Ning\xFAn criterio de Hestia: candidato a tratamiento ambulatorio de la EP (mortalidad y recurrencias bajas en las cohortes de validaci\xF3n)." : "Uno o m\xE1s criterios presentes: se recomienda tratamiento hospitalario.",
          level: score === 0 ? "ok" : "danger"
        };
      },
      references: [
        "Zondag W, et al. Outpatient treatment in patients with acute pulmonary embolism: the Hestia Study. J Thromb Haemost. 2011;9(8):1500-7."
      ]
    },
    {
      id: "padua",
      name: "Puntuaci\xF3n de Padua para el riesgo de TEV en pacientes hospitalizados",
      shortName: "Padua",
      description: "Determina la necesidad de tromboprofilaxis en pacientes m\xE9dicos hospitalizados seg\xFAn su riesgo de tromboembolismo venoso.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "cancer", type: "boolean", label: "C\xE1ncer activo", description: "Met\xE1stasis o quimioterapia/radioterapia en los \xFAltimos 6 meses.", points: 3 },
        { id: "previo", type: "boolean", label: "TEV previo (excluida la trombosis superficial)", points: 3 },
        { id: "movilidad", type: "boolean", label: "Movilidad reducida", description: "Encamamiento \u2265 3 d\xEDas (con permiso para el ba\xF1o).", points: 3 },
        { id: "trombofilia", type: "boolean", label: "Trombofilia conocida", points: 3 },
        { id: "trauma", type: "boolean", label: "Traumatismo o cirug\xEDa en el \xFAltimo mes", points: 2 },
        { id: "edad", type: "boolean", label: "Edad \u2265 70 a\xF1os" },
        { id: "cardioresp", type: "boolean", label: "Insuficiencia card\xEDaca o respiratoria" },
        { id: "iamIctus", type: "boolean", label: "IAM o ictus isqu\xE9mico agudos" },
        { id: "infeccion", type: "boolean", label: "Infecci\xF3n aguda o enfermedad reumatol\xF3gica" },
        { id: "obesidad", type: "boolean", label: "Obesidad (IMC \u2265 30)" },
        { id: "hormonal", type: "boolean", label: "Tratamiento hormonal en curso" }
      ],
      compute: (v) => {
        const score = sum(v, ["cancer", "previo", "movilidad", "trombofilia", "trauma", "edad", "cardioresp", "iamIctus", "infeccion", "obesidad", "hormonal"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201320)",
          interpretation: score >= 4 ? "Riesgo alto de TEV (\u2265 4): indicada la tromboprofilaxis farmacol\xF3gica si no hay contraindicaci\xF3n (si el riesgo hemorr\xE1gico es alto, profilaxis mec\xE1nica)." : "Riesgo bajo de TEV (< 4): en general no requiere profilaxis farmacol\xF3gica; fomentar la movilizaci\xF3n precoz.",
          level: score >= 4 ? "danger" : "ok"
        };
      },
      references: [
        "Barbar S, et al. A risk assessment model for the identification of hospitalized medical patients at risk for venous thromboembolism: the Padua Prediction Score. J Thromb Haemost. 2010;8(11):2450-7."
      ]
    },
    {
      id: "improve-tev",
      name: "Puntuaci\xF3n IMPROVE de riesgo de TEV",
      shortName: "IMPROVE",
      description: "Predice el riesgo de tromboembolismo venoso a 3 meses en pacientes m\xE9dicos hospitalizados.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "previo", type: "boolean", label: "TEV previo", points: 3 },
        { id: "trombofilia", type: "boolean", label: "Trombofilia conocida", points: 2 },
        { id: "paralisis", type: "boolean", label: "Par\xE1lisis de miembros inferiores actual", points: 2 },
        { id: "cancer", type: "boolean", label: "C\xE1ncer activo", points: 2 },
        { id: "inmovilizacion", type: "boolean", label: "Inmovilizaci\xF3n \u2265 7 d\xEDas", description: "Inmediatamente antes y durante el ingreso." },
        { id: "uci", type: "boolean", label: "Estancia en UCI o unidad coronaria" },
        { id: "edad", type: "boolean", label: "Edad > 60 a\xF1os" }
      ],
      compute: (v) => {
        const score = sum(v, ["previo", "trombofilia", "paralisis", "cancer", "inmovilizacion", "uci", "edad"]);
        const riesgo2 = score === 0 ? "0,4 %" : score === 1 ? "0,6 %" : score === 2 ? "1,0 %" : score === 3 ? "1,7 %" : score === 4 ? "2,9 %" : "\u2265 5 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201312)",
          secondary: riesgo2,
          secondaryLabel: "TEV sintom\xE1tico a 3 meses",
          interpretation: score < 2 ? "Riesgo bajo (< 2): la profilaxis farmacol\xF3gica aporta poco beneficio en la mayor\xEDa de los casos." : "Riesgo aumentado (\u2265 2): valorar tromboprofilaxis farmacol\xF3gica si no hay contraindicaci\xF3n.",
          level: score < 2 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Spyropoulos AC, et al. Predictive and associative models to identify hospitalized medical patients at risk for VTE (IMPROVE). Chest. 2011;140(3):706-14."
      ]
    },
    {
      id: "dash",
      name: "Puntuaci\xF3n DASH para la recurrencia del TEV",
      shortName: "DASH",
      description: "Predice la probabilidad de recurrencia tras un primer episodio de TEV no provocado, para orientar la duraci\xF3n de la anticoagulaci\xF3n.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "dimero", type: "boolean", label: "D\xEDmero D anormal tras suspender la anticoagulaci\xF3n (D)", points: 2 },
        { id: "edad", type: "boolean", label: "Edad < 50 a\xF1os (A)" },
        { id: "varon", type: "boolean", label: "Sexo masculino (S)" },
        { id: "hormonal", type: "boolean", label: "TEV asociado a tratamiento hormonal (H)", description: "En mujeres.", points: -2 }
      ],
      compute: (v) => {
        const score = sum(v, ["dimero", "edad", "varon", "hormonal"]);
        const anual = score <= 1 ? "\u2248 3,1 %" : score === 2 ? "\u2248 6,4 %" : "\u2248 12,3 %";
        return {
          main: String(score),
          mainUnit: "puntos (\u22122 a 4)",
          secondary: anual,
          secondaryLabel: "recurrencia anual",
          interpretation: score <= 1 ? "Riesgo de recurrencia bajo: puede plantearse suspender la anticoagulaci\xF3n tras 3\u20136 meses, individualizando." : "Riesgo de recurrencia no bajo: valorar anticoagulaci\xF3n prolongada si el riesgo hemorr\xE1gico lo permite.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      references: [
        "Tosetto A, et al. Predicting disease recurrence in patients with previous unprovoked venous thromboembolism: the DASH prediction score. J Thromb Haemost. 2012;10(6):1019-25."
      ]
    },
    {
      id: "riete",
      name: "Puntuaci\xF3n RIETE de riesgo hemorr\xE1gico en el TEV",
      shortName: "RIETE",
      description: "Estima el riesgo de hemorragia mayor durante los primeros 3 meses de anticoagulaci\xF3n por tromboembolismo venoso.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "sangrado", type: "boolean", label: "Hemorragia mayor reciente (\xFAltimo mes)", points: 2 },
        { id: "creatinina", type: "boolean", label: "Creatinina > 1,2 mg/dL", points: 1.5 },
        { id: "anemia", type: "boolean", label: "Anemia", description: "Hb < 13 g/dL en varones o < 12 g/dL en mujeres.", points: 1.5 },
        { id: "cancer", type: "boolean", label: "Neoplasia" },
        { id: "ep", type: "boolean", label: "Presentaci\xF3n como EP sintom\xE1tica (frente a TVP aislada)" },
        { id: "edad", type: "boolean", label: "Edad > 75 a\xF1os" }
      ],
      compute: (v) => {
        const score = sum(v, ["sangrado", "creatinina", "anemia", "cancer", "ep", "edad"]);
        const banda = score === 0 ? "bajo (\u2248 0,1 %)" : score <= 4 ? "intermedio (\u2248 2,8 %)" : "alto (\u2248 6,2 %)";
        return {
          main: fmt(score, 1),
          mainUnit: "puntos (0\u20138)",
          interpretation: `Riesgo ${banda} de hemorragia mayor en los primeros 3 meses de anticoagulaci\xF3n. En riesgo alto: extremar la vigilancia y corregir factores modificables.`,
          level: score === 0 ? "ok" : score <= 4 ? "warn" : "danger"
        };
      },
      references: [
        "Ru\xEDz-Gim\xE9nez N, et al. Predictive variables for major bleeding events in patients presenting with documented acute venous thromboembolism (RIETE). Thromb Haemost. 2008;100(1):26-31."
      ]
    },
    {
      id: "dimero-edad",
      name: "D\xEDmero D ajustado por edad",
      shortName: "D\xEDmero D por edad",
      description: "Ajusta el umbral del d\xEDmero D en mayores de 50 a\xF1os para descartar el tromboembolismo venoso con menos falsos positivos.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 18, max: 110 },
        { id: "dimero", type: "number", label: "D\xEDmero D medido", unit: "\xB5g/L FEU", min: 0, max: 1e5 }
      ],
      compute: (v) => {
        const umbral = v.edad > 50 ? v.edad * 10 : 500;
        const negativo = v.dimero < umbral;
        return {
          main: `${fmt(umbral, 0)} \xB5g/L`,
          mainUnit: "umbral ajustado",
          secondary: negativo ? "Negativo" : "Positivo",
          secondaryLabel: "resultado frente al umbral",
          interpretation: negativo ? "D\xEDmero D por debajo del umbral ajustado por edad: en pacientes con probabilidad cl\xEDnica no alta, el TEV queda razonablemente excluido." : "D\xEDmero D por encima del umbral ajustado: continuar el algoritmo diagn\xF3stico con imagen.",
          level: negativo ? "ok" : "warn",
          details: ["Umbral = edad \xD7 10 \xB5g/L FEU en mayores de 50 a\xF1os; 500 \xB5g/L en \u2264 50 a\xF1os."]
        };
      },
      notes: [
        "Verifica las unidades de tu laboratorio: la regla est\xE1 validada para unidades FEU (equivalentes de fibrin\xF3geno); con unidades DDU el umbral convencional es 250 \xB5g/L y el ajuste ser\xEDa edad \xD7 5.",
        "No aplicar con probabilidad cl\xEDnica alta."
      ],
      references: [
        "Righini M, et al. Age-adjusted D-dimer cutoff levels to rule out pulmonary embolism: the ADJUST-PE study. JAMA. 2014;311(11):1117-24."
      ]
    },
    {
      id: "villalta",
      name: "Escala de Villalta para el s\xEDndrome postromb\xF3tico",
      shortName: "Villalta",
      description: "Diagnostica y clasifica la gravedad del s\xEDndrome postromb\xF3tico tras una TVP de miembros inferiores.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        ...[
          ["dolorS", "S\xEDntoma: dolor"],
          ["calambres", "S\xEDntoma: calambres"],
          ["pesadez", "S\xEDntoma: pesadez"],
          ["parestesias", "S\xEDntoma: parestesias"],
          ["prurito", "S\xEDntoma: prurito"],
          ["edema", "Signo: edema pretibial"],
          ["induracion", "Signo: induraci\xF3n cut\xE1nea"],
          ["hiperpigmentacion", "Signo: hiperpigmentaci\xF3n"],
          ["enrojecimiento", "Signo: enrojecimiento"],
          ["ectasia", "Signo: ectasia venosa"],
          ["dolorPantorrilla", "Signo: dolor a la compresi\xF3n de la pantorrilla"]
        ].map(([id, label]) => ({
          id,
          type: "select",
          label,
          options: [
            { label: "Ausente", value: 0 },
            { label: "Leve", value: 1 },
            { label: "Moderado", value: 2 },
            { label: "Grave", value: 3 }
          ]
        })),
        { id: "ulcera", type: "boolean", label: "\xDAlcera venosa presente", noPoints: true }
      ],
      compute: (v) => {
        const score = sum(v, ["dolorS", "calambres", "pesadez", "parestesias", "prurito", "edema", "induracion", "hiperpigmentacion", "enrojecimiento", "ectasia", "dolorPantorrilla"]);
        const ulcera = v.ulcera === 1;
        const banda = ulcera || score >= 15 ? "grave" : score >= 10 ? "moderado" : score >= 5 ? "leve" : "sin SPT";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201333)",
          interpretation: banda === "sin SPT" ? "Puntuaci\xF3n < 5 sin \xFAlcera: no hay s\xEDndrome postromb\xF3tico." : `S\xEDndrome postromb\xF3tico ${banda}${ulcera ? " (la \xFAlcera venosa clasifica autom\xE1ticamente como grave)" : ""}. Optimizar la compresi\xF3n y el seguimiento vascular.`,
          level: banda === "sin SPT" ? "ok" : banda === "leve" ? "info" : banda === "moderado" ? "warn" : "danger"
        };
      },
      notes: ["5\u20139: leve \xB7 10\u201314: moderado \xB7 \u2265 15 o \xFAlcera venosa: grave. Evaluar preferiblemente tras \u2265 3\u20136 meses de la TVP aguda."],
      references: [
        "Villalta S, et al. Assessment of validity and reproducibility of a clinical scale for the post-thrombotic syndrome. Haemostasis. 1994;24(Suppl 1):158a.",
        "Kahn SR. Measurement properties of the Villalta scale to define and classify the severity of the post-thrombotic syndrome. J Thromb Haemost. 2009;7(5):884-8."
      ]
    }
  ];

  // src/calculators/cardio-ic-sincope.ts
  var CAT_IC = "Insuficiencia card\xEDaca";
  var CAT_SINCOPE = "S\xEDncope";
  var CARD4 = ["Cardiolog\xEDa"];
  var cardioICSincope = [
    {
      id: "nyha",
      name: "Clasificaci\xF3n funcional NYHA de la insuficiencia card\xEDaca",
      shortName: "NYHA",
      description: "Clasifica la gravedad de la insuficiencia card\xEDaca seg\xFAn la limitaci\xF3n funcional.",
      category: CAT_IC,
      specialty: CARD4,
      inputs: [
        {
          id: "clase",
          type: "select",
          label: "Clase funcional",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "I \u2014 Sin limitaci\xF3n: la actividad f\xEDsica ordinaria no causa s\xEDntomas", value: 1 },
            { label: "II \u2014 Limitaci\xF3n ligera: c\xF3modo en reposo; la actividad ordinaria causa disnea, fatiga o palpitaciones", value: 2 },
            { label: "III \u2014 Limitaci\xF3n marcada: c\xF3modo en reposo; actividades menores causan s\xEDntomas", value: 3 },
            { label: "IV \u2014 S\xEDntomas en reposo o con cualquier actividad", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const c = v.clase ?? 1;
        return {
          main: `NYHA ${["", "I", "II", "III", "IV"][c]}`,
          interpretation: c === 1 ? "Sin limitaci\xF3n funcional. Optimizar el tratamiento de base y los factores de riesgo." : c === 2 ? "Limitaci\xF3n ligera. Revisar y titular el tratamiento recomendado por las gu\xEDas." : c === 3 ? "Limitaci\xF3n marcada. Optimizaci\xF3n intensiva del tratamiento; valorar dispositivos seg\xFAn FEVI y criterios de las gu\xEDas." : "S\xEDntomas en reposo. Valorar terapias avanzadas (unidad de IC, dispositivos, trasplante) y cuidados paliativos si procede.",
          level: c === 1 ? "ok" : c === 2 ? "info" : c === 3 ? "warn" : "danger"
        };
      },
      references: [
        "The Criteria Committee of the New York Heart Association. Nomenclature and Criteria for Diagnosis of Diseases of the Heart and Great Vessels. 9.\xAA ed. 1994."
      ]
    },
    {
      id: "acc-aha-ic",
      name: "Estadios ACC/AHA de la insuficiencia card\xEDaca",
      shortName: "Estadios ACC/AHA",
      description: "Describe las etapas evolutivas de la insuficiencia card\xEDaca, desde el riesgo hasta la enfermedad avanzada.",
      category: CAT_IC,
      specialty: CARD4,
      inputs: [
        {
          id: "estadio",
          type: "select",
          label: "Estadio",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "A \u2014 En riesgo: HTA, diabetes, obesidad, cardiot\xF3xicos\u2026, sin cardiopat\xEDa estructural ni s\xEDntomas", value: 1 },
            { label: "B \u2014 Pre-insuficiencia card\xEDaca: cardiopat\xEDa estructural, biomarcadores elevados o FEVI reducida, sin s\xEDntomas", value: 2 },
            { label: "C \u2014 Insuficiencia card\xEDaca sintom\xE1tica (actual o previa)", value: 3 },
            { label: "D \u2014 Insuficiencia card\xEDaca avanzada: s\xEDntomas que interfieren con la vida diaria y hospitalizaciones recurrentes pese a tratamiento \xF3ptimo", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const e = v.estadio ?? 1;
        return {
          main: `Estadio ${["", "A", "B", "C", "D"][e]}`,
          interpretation: [
            "",
            "Prevenci\xF3n: control de los factores de riesgo (HTA, diabetes, l\xEDpidos), estilos de vida; considerar iSGLT2 en diabetes con riesgo cardiovascular.",
            "Prevenir la progresi\xF3n: IECA/ARA-II y betabloqueantes si FEVI reducida o IAM previo; tratar la cardiopat\xEDa de base.",
            "Tratamiento seg\xFAn fenotipo y FEVI (cu\xE1druple terapia en FEVI reducida), manejo de la congesti\xF3n y de las comorbilidades.",
            "Terapias avanzadas: unidad especializada, soporte circulatorio mec\xE1nico, trasplante, o cuidados paliativos seg\xFAn objetivos del paciente."
          ][e],
          level: e === 1 ? "ok" : e === 2 ? "info" : e === 3 ? "warn" : "danger"
        };
      },
      references: [
        "Heidenreich PA, et al. 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. Circulation. 2022;145(18):e895-e1032."
      ]
    },
    {
      id: "framingham-ic",
      name: "Criterios de Framingham para el diagn\xF3stico de insuficiencia card\xEDaca",
      shortName: "Framingham IC",
      description: "Diagnostica la insuficiencia card\xEDaca congestiva mediante criterios cl\xEDnicos mayores y menores.",
      category: CAT_IC,
      specialty: CARD4,
      inputs: [
        { id: "dpn", type: "boolean", label: "Mayor: disnea parox\xEDstica nocturna", noPoints: true },
        { id: "yugular", type: "boolean", label: "Mayor: ingurgitaci\xF3n yugular", noPoints: true },
        { id: "crepitantes", type: "boolean", label: "Mayor: crepitantes pulmonares", noPoints: true },
        { id: "cardiomegalia", type: "boolean", label: "Mayor: cardiomegalia radiol\xF3gica", noPoints: true },
        { id: "eap", type: "boolean", label: "Mayor: edema agudo de pulm\xF3n", noPoints: true },
        { id: "s3", type: "boolean", label: "Mayor: galope por tercer ruido (S3)", noPoints: true },
        { id: "pvc", type: "boolean", label: "Mayor: presi\xF3n venosa central > 16 cmH\u2082O", noPoints: true },
        { id: "reflujo", type: "boolean", label: "Mayor: reflujo hepatoyugular", noPoints: true },
        { id: "perdidaPeso", type: "boolean", label: "Mayor: p\xE9rdida de > 4,5 kg en 5 d\xEDas con el tratamiento", noPoints: true },
        { id: "edemas", type: "boolean", label: "Menor: edemas bilaterales de tobillos", noPoints: true },
        { id: "tos", type: "boolean", label: "Menor: tos nocturna", noPoints: true },
        { id: "disnea", type: "boolean", label: "Menor: disnea de esfuerzo", noPoints: true },
        { id: "hepatomegalia", type: "boolean", label: "Menor: hepatomegalia", noPoints: true },
        { id: "derrame", type: "boolean", label: "Menor: derrame pleural", noPoints: true },
        { id: "taquicardia", type: "boolean", label: "Menor: frecuencia card\xEDaca > 120 lpm", noPoints: true }
      ],
      compute: (v) => {
        const mayores = sum(v, ["dpn", "yugular", "crepitantes", "cardiomegalia", "eap", "s3", "pvc", "reflujo", "perdidaPeso"]);
        const menores = sum(v, ["edemas", "tos", "disnea", "hepatomegalia", "derrame", "taquicardia"]);
        const positivo = mayores >= 2 || mayores >= 1 && menores >= 2;
        return {
          main: `${mayores} mayores \xB7 ${menores} menores`,
          interpretation: positivo ? "Criterios de Framingham cumplidos (\u2265 2 mayores, o 1 mayor + 2 menores): diagn\xF3stico cl\xEDnico de insuficiencia card\xEDaca. Confirmar con ecocardiograma y p\xE9ptidos natriur\xE9ticos." : "Criterios no cumplidos: el diagn\xF3stico cl\xEDnico de insuficiencia card\xEDaca es poco probable por estos criterios; valorar otras causas y completar estudio si la sospecha persiste.",
          level: positivo ? "danger" : "ok"
        };
      },
      notes: ["Los criterios menores solo punt\xFAan si no se explican por otra enfermedad."],
      references: [
        "McKee PA, et al. The natural history of congestive heart failure: the Framingham study. N Engl J Med. 1971;285(26):1441-6."
      ]
    },
    {
      id: "h2fpef",
      name: "Puntuaci\xF3n H\u2082FPEF para IC con fracci\xF3n de eyecci\xF3n preservada",
      shortName: "H\u2082FPEF",
      description: "Estima la probabilidad de que la disnea de un paciente con FEVI conservada se deba a insuficiencia card\xEDaca con FE preservada.",
      category: CAT_IC,
      specialty: CARD4,
      inputs: [
        { id: "obesidad", type: "boolean", label: "Obesidad (IMC > 30 kg/m\xB2) \u2014 H (Heavy)", points: 2 },
        { id: "hta", type: "boolean", label: "Tratamiento con \u2265 2 antihipertensivos \u2014 H (Hypertensive)" },
        { id: "fa", type: "boolean", label: "Fibrilaci\xF3n auricular (parox\xEDstica o persistente) \u2014 F", points: 3 },
        { id: "hp", type: "boolean", label: "Hipertensi\xF3n pulmonar (PSAP > 35 mmHg en eco) \u2014 P" },
        { id: "edad", type: "boolean", label: "Edad > 60 a\xF1os \u2014 E (Elder)" },
        { id: "ee", type: "boolean", label: "Presiones de llenado elevadas (E/e\u2032 > 9) \u2014 F (Filling)" }
      ],
      compute: (v) => {
        const score = sum(v, ["obesidad", "hta", "fa", "hp", "edad", "ee"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20139)",
          interpretation: score <= 1 ? "Probabilidad baja de ICFEp: buscar causas alternativas de la disnea." : score <= 5 ? "Probabilidad intermedia: se recomienda estudio adicional (p\xE9ptidos natriur\xE9ticos, eco de esfuerzo o cateterismo con ejercicio)." : "Probabilidad alta de insuficiencia card\xEDaca con FE preservada: tratar y completar el estudio etiol\xF3gico.",
          level: score <= 1 ? "ok" : score <= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Reddy YNV, et al. A simple, evidence-based approach to help guide diagnosis of heart failure with preserved ejection fraction (H2FPEF). Circulation. 2018;138(9):861-70."
      ]
    },
    {
      id: "ccs-angina",
      name: "Clasificaci\xF3n de la angina de la Sociedad Cardiovascular Canadiense (CCS)",
      shortName: "CCS",
      description: "Grad\xFAa la gravedad de la angina de esfuerzo.",
      category: CAT_IC,
      specialty: CARD4,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "Grado de angina",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "I \u2014 Solo con esfuerzos extenuantes, r\xE1pidos o prolongados; no con la actividad ordinaria", value: 1 },
            { label: "II \u2014 Limitaci\xF3n ligera: al caminar deprisa, subir cuestas, tras las comidas, con fr\xEDo o estr\xE9s", value: 2 },
            { label: "III \u2014 Limitaci\xF3n marcada: al caminar 1\u20132 manzanas en llano o subir un piso a paso normal", value: 3 },
            { label: "IV \u2014 Incapacidad para cualquier actividad sin angina; puede aparecer en reposo", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const g = v.grado ?? 1;
        return {
          main: `CCS ${["", "I", "II", "III", "IV"][g]}`,
          interpretation: g <= 2 ? "Angina estable con limitaci\xF3n ausente o ligera: optimizar tratamiento antianginoso y control de factores de riesgo." : "Angina limitante (CCS III\u2013IV): intensificar tratamiento y valorar coronariograf\xEDa/revascularizaci\xF3n seg\xFAn las gu\xEDas.",
          level: g === 1 ? "ok" : g === 2 ? "info" : g === 3 ? "warn" : "danger"
        };
      },
      references: [
        "Campeau L. Grading of angina pectoris. Circulation. 1976;54(3):522-3."
      ]
    },
    {
      id: "sfsr",
      name: "Regla de s\xEDncope de San Francisco",
      shortName: "San Francisco",
      description: "Predice el riesgo de eventos graves a 7 d\xEDas en pacientes con s\xEDncope o pres\xEDncope (regla CHESS).",
      category: CAT_SINCOPE,
      specialty: CARD4,
      inputs: [
        { id: "icc", type: "boolean", label: "Antecedente de insuficiencia card\xEDaca congestiva (C)" },
        { id: "hto", type: "boolean", label: "Hematocrito < 30 % (H)" },
        { id: "ecg", type: "boolean", label: "ECG anormal (E)", description: "Cualquier cambio nuevo o ritmo no sinusal." },
        { id: "disnea", type: "boolean", label: "Disnea referida (S \u2014 Shortness of breath)" },
        { id: "pas", type: "boolean", label: "PA sist\xF3lica < 90 mmHg en el triaje (S)" }
      ],
      compute: (v) => {
        const score = sum(v, ["icc", "hto", "ecg", "disnea", "pas"]);
        return {
          main: String(score),
          mainUnit: score === 1 ? "criterio" : "criterios",
          interpretation: score === 0 ? "Regla negativa: riesgo bajo de evento grave a 7 d\xEDas (sensibilidad \u2248 96 % en la derivaci\xF3n; menor en validaciones externas \u2014 integrar con el juicio cl\xEDnico)." : "Regla positiva: riesgo aumentado de evento grave (muerte, arritmia, IAM, embolia pulmonar, hemorragia\u2026); se recomienda observaci\xF3n/ingreso y estudio.",
          level: score === 0 ? "ok" : "danger"
        };
      },
      references: [
        "Quinn JV, et al. Derivation of the San Francisco Syncope Rule to predict patients with short-term serious outcomes. Ann Emerg Med. 2004;43(2):224-32."
      ]
    },
    {
      id: "egsys",
      name: "Puntuaci\xF3n EGSYS para el s\xEDncope de origen card\xEDaco",
      shortName: "EGSYS",
      description: "Estima la probabilidad de que un s\xEDncope sea de causa card\xEDaca.",
      category: CAT_SINCOPE,
      specialty: CARD4,
      inputs: [
        { id: "palpitaciones", type: "boolean", label: "Palpitaciones antes del s\xEDncope", points: 4 },
        { id: "cardiopatia", type: "boolean", label: "Cardiopat\xEDa conocida o ECG anormal", points: 3 },
        { id: "esfuerzo", type: "boolean", label: "S\xEDncope durante el esfuerzo", points: 3 },
        { id: "supino", type: "boolean", label: "S\xEDncope en dec\xFAbito supino", points: 2 },
        { id: "prodromos", type: "boolean", label: "Pr\xF3dromos auton\xF3micos", description: "N\xE1useas o v\xF3mitos previos.", points: -1 },
        {
          id: "precipitantes",
          type: "boolean",
          label: "Factores predisponentes o precipitantes",
          description: "Lugar caluroso o concurrido, ortostatismo prolongado, miedo, dolor o emoci\xF3n intensa.",
          points: -1
        }
      ],
      compute: (v) => {
        const score = sum(v, ["palpitaciones", "cardiopatia", "esfuerzo", "supino", "prodromos", "precipitantes"]);
        return {
          main: String(score),
          mainUnit: "puntos (\u22122 a 12)",
          interpretation: score >= 3 ? "EGSYS \u2265 3: s\xEDncope probablemente card\xEDaco (sensibilidad \u2248 95 %); ingreso o estudio cardiol\xF3gico preferente. La mortalidad a 2 a\xF1os es mayor en este grupo." : "EGSYS < 3: origen card\xEDaco poco probable; valorar causas reflejas/ortost\xE1ticas y completar la evaluaci\xF3n b\xE1sica.",
          level: score >= 3 ? "danger" : "ok"
        };
      },
      references: [
        "Del Rosso A, et al. Clinical predictors of cardiac syncope at initial evaluation in patients referred urgently to a general hospital: the EGSYS score. Heart. 2008;94(12):1620-6."
      ]
    },
    {
      id: "oesil",
      name: "Puntuaci\xF3n OESIL para el s\xEDncope",
      shortName: "OESIL",
      description: "Estima la mortalidad a 12 meses tras un episodio de s\xEDncope.",
      category: CAT_SINCOPE,
      specialty: CARD4,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad > 65 a\xF1os" },
        { id: "cardiovascular", type: "boolean", label: "Enfermedad cardiovascular previa" },
        { id: "prodromos", type: "boolean", label: "S\xEDncope sin pr\xF3dromos" },
        { id: "ecg", type: "boolean", label: "ECG anormal" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "cardiovascular", "prodromos", "ecg"]);
        const mort = ["0 %", "0,6 %", "14 %", "29 %", "53 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20134)",
          secondary: mort,
          secondaryLabel: "mortalidad a 12 meses (cohorte original)",
          interpretation: score <= 1 ? "Riesgo bajo: puede completarse el estudio de forma ambulatoria en la mayor\xEDa de los casos." : "Riesgo elevado (\u2265 2): se recomienda ingreso u observaci\xF3n con estudio cardiol\xF3gico.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      references: [
        "Colivicchi F, et al. Development and prospective validation of a risk stratification system for patients with syncope in the emergency department: the OESIL risk score. Eur Heart J. 2003;24(9):811-9."
      ]
    },
    {
      id: "sincope-canadiense",
      name: "Puntuaci\xF3n canadiense de riesgo en el s\xEDncope (CSRS)",
      shortName: "S\xEDncope canadiense",
      description: "Predice eventos adversos graves a 30 d\xEDas en pacientes evaluados en urgencias por s\xEDncope.",
      category: CAT_SINCOPE,
      specialty: CARD4,
      inputs: [
        { id: "vasovagal", type: "boolean", label: "Predisposici\xF3n vasovagal", description: "Desencadenado por ortostatismo prolongado, lugar caluroso, emoci\xF3n, miedo o dolor.", points: -1 },
        { id: "cardiopatia", type: "boolean", label: "Antecedente de cardiopat\xEDa", description: "EAC, FA/flutter, IC, valvulopat\xEDa." },
        { id: "pas", type: "boolean", label: "PA sist\xF3lica < 90 o > 180 mmHg en alg\xFAn momento en urgencias", points: 2 },
        { id: "troponina", type: "boolean", label: "Troponina elevada (> percentil 99)", points: 2 },
        { id: "eje", type: "boolean", label: "Eje QRS anormal", description: "< \u221230\xB0 o > 100\xB0." },
        { id: "qrs", type: "boolean", label: "Duraci\xF3n del QRS > 130 ms" },
        { id: "qtc", type: "boolean", label: "QTc > 480 ms", points: 2 },
        { id: "dxVasovagal", type: "boolean", label: "Diagn\xF3stico en urgencias: s\xEDncope vasovagal", points: -2 },
        { id: "dxCardiaco", type: "boolean", label: "Diagn\xF3stico en urgencias: s\xEDncope card\xEDaco", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["vasovagal", "cardiopatia", "pas", "troponina", "eje", "qrs", "qtc", "dxVasovagal", "dxCardiaco"]);
        const banda = score <= -2 ? "muy bajo (\u2248 0,4 %)" : score <= 0 ? "bajo (\u2248 1\u20132 %)" : score <= 3 ? "intermedio (\u2248 3\u20138 %)" : score <= 5 ? "alto (\u2248 13\u201320 %)" : "muy alto (> 25 %)";
        return {
          main: String(score),
          mainUnit: "puntos (\u22123 a 11)",
          interpretation: `Riesgo ${banda} de evento grave a 30 d\xEDas (arritmia, IAM, muerte, hemorragia grave\u2026). En riesgo intermedio o superior, valorar observaci\xF3n con monitorizaci\xF3n y estudio dirigido.`,
          level: score <= 0 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Thiruganasambandamoorthy V, et al. Development of the Canadian Syncope Risk Score to predict serious adverse events after emergency department assessment of syncope. CMAJ. 2016;188(12):E289-E298."
      ]
    }
  ];

  // src/calculators/cardio-varios.ts
  var CAT_DX = "Criterios diagn\xF3sticos";
  var CAT_GRAV = "Gravedad y pron\xF3stico";
  var CARD5 = ["Cardiolog\xEDa"];
  var cardioVarios = [
    {
      id: "duke-endocarditis",
      name: "Criterios de Duke modificados para la endocarditis infecciosa",
      shortName: "Duke",
      description: "Criterios diagn\xF3sticos de endocarditis infecciosa (versi\xF3n modificada de Li).",
      category: CAT_DX,
      specialty: CARD5,
      inputs: [
        {
          id: "hemocultivos",
          type: "boolean",
          label: "Mayor: hemocultivos positivos t\xEDpicos",
          description: "Microorganismos t\xEDpicos en 2 hemocultivos separados, hemocultivos persistentemente positivos o Coxiella burnetii (t\xEDtulo IgG > 1:800).",
          noPoints: true
        },
        {
          id: "imagen",
          type: "boolean",
          label: "Mayor: evidencia de afectaci\xF3n endoc\xE1rdica",
          description: "Vegetaci\xF3n, absceso, dehiscencia de pr\xF3tesis o nueva insuficiencia valvular.",
          noPoints: true
        },
        { id: "predisposicion", type: "boolean", label: "Menor: cardiopat\xEDa predisponente o uso de drogas por v\xEDa parenteral", noPoints: true },
        { id: "fiebre", type: "boolean", label: "Menor: fiebre > 38 \xB0C", noPoints: true },
        {
          id: "vascular",
          type: "boolean",
          label: "Menor: fen\xF3menos vasculares",
          description: "Embolias arteriales, infartos pulmonares s\xE9pticos, aneurisma mic\xF3tico, hemorragia intracraneal o conjuntival, lesiones de Janeway.",
          noPoints: true
        },
        {
          id: "inmunologico",
          type: "boolean",
          label: "Menor: fen\xF3menos inmunol\xF3gicos",
          description: "Glomerulonefritis, n\xF3dulos de Osler, manchas de Roth o factor reumatoide.",
          noPoints: true
        },
        { id: "microbiologico", type: "boolean", label: "Menor: evidencia microbiol\xF3gica que no cumple criterio mayor", noPoints: true }
      ],
      compute: (v) => {
        const mayores = sum(v, ["hemocultivos", "imagen"]);
        const menores = sum(v, ["predisposicion", "fiebre", "vascular", "inmunologico", "microbiologico"]);
        const definida = mayores === 2 || mayores === 1 && menores >= 3 || menores >= 5;
        const posible = !definida && (mayores === 1 && menores >= 1 || menores >= 3);
        return {
          main: definida ? "Endocarditis definida" : posible ? "Endocarditis posible" : "Criterios no cumplidos",
          secondary: `${mayores} mayores \xB7 ${menores} menores`,
          interpretation: definida ? "Criterios cl\xEDnicos de endocarditis definida (2 mayores, o 1 mayor + 3 menores, o 5 menores). Iniciar tratamiento y valoraci\xF3n por el equipo de endocarditis." : posible ? "Endocarditis posible (1 mayor + 1 menor, o 3 menores): mantener alta sospecha, repetir hemocultivos e imagen (ecocardiograma transesof\xE1gico, PET-TC si procede)." : "No se cumplen criterios: considerar diagn\xF3sticos alternativos, sin olvidar que un tratamiento antibi\xF3tico previo puede negativizar los hemocultivos.",
          level: definida ? "danger" : posible ? "warn" : "ok"
        };
      },
      notes: [
        "El diagn\xF3stico tambi\xE9n es definido con criterios patol\xF3gicos (microorganismos o lesiones en la anatom\xEDa patol\xF3gica de la vegetaci\xF3n o del absceso).",
        "La lista de MDCalc incluye adem\xE1s los criterios ISCVID 2023, pendientes de incorporar."
      ],
      references: [
        "Li JS, et al. Proposed modifications to the Duke criteria for the diagnosis of infective endocarditis. Clin Infect Dis. 2000;30(4):633-8."
      ]
    },
    {
      id: "isth-cid",
      name: "Criterios de la ISTH para la coagulaci\xF3n intravascular diseminada",
      shortName: "CID (ISTH)",
      description: "Diagnostica la coagulaci\xF3n intravascular diseminada manifiesta.",
      category: CAT_DX,
      specialty: CARD5,
      inputs: [
        {
          id: "plaquetas",
          type: "select",
          label: "Plaquetas (\xD710\xB3/\xB5L)",
          options: [
            { label: "\u2265 100", value: 0 },
            { label: "50\u201399", value: 1 },
            { label: "< 50", value: 2 }
          ]
        },
        {
          id: "dimero",
          type: "select",
          label: "Marcadores de fibrina (d\xEDmero D, PDF)",
          options: [
            { label: "Sin elevaci\xF3n", value: 0 },
            { label: "Elevaci\xF3n moderada", value: 2 },
            { label: "Elevaci\xF3n intensa", value: 3 }
          ]
        },
        {
          id: "tp",
          type: "select",
          label: "Prolongaci\xF3n del tiempo de protrombina",
          options: [
            { label: "< 3 s", value: 0 },
            { label: "3\u20136 s", value: 1 },
            { label: "> 6 s", value: 2 }
          ]
        },
        {
          id: "fibrinogeno",
          type: "select",
          label: "Fibrin\xF3geno",
          options: [
            { label: "\u2265 100 mg/dL", value: 0 },
            { label: "< 100 mg/dL", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["plaquetas", "dimero", "tp", "fibrinogeno"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20138)",
          interpretation: score >= 5 ? "Compatible con CID manifiesta (\u2265 5 puntos): repetir a diario, tratar la causa subyacente y dar soporte hemost\xE1tico seg\xFAn sangrado." : "No sugiere CID manifiesta (< 5 puntos): si la sospecha cl\xEDnica persiste, repetir en 1\u20132 d\xEDas.",
          level: score >= 5 ? "danger" : "ok"
        };
      },
      notes: ["El algoritmo solo debe aplicarse en pacientes con una enfermedad de base conocida asociada a CID (sepsis, trauma, neoplasia, complicaciones obst\xE9tricas\u2026)."],
      references: [
        "Taylor FB Jr, et al. Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation. Thromb Haemost. 2001;86(5):1327-30."
      ]
    },
    {
      id: "jones",
      name: "Criterios de Jones para la fiebre reum\xE1tica aguda",
      shortName: "Jones",
      description: "Diagnostica la fiebre reum\xE1tica aguda (revisi\xF3n de 2015 de la AHA).",
      category: CAT_DX,
      specialty: CARD5,
      inputs: [
        {
          id: "poblacion",
          type: "select",
          label: "Poblaci\xF3n",
          noPoints: true,
          options: [
            { label: "Riesgo bajo", value: 0 },
            { label: "Riesgo moderado-alto", value: 1 }
          ]
        },
        {
          id: "estreptococo",
          type: "boolean",
          label: "Evidencia de infecci\xF3n estreptoc\xF3cica previa",
          description: "Cultivo, test r\xE1pido o ascenso de antiestreptolisina O.",
          noPoints: true
        },
        { id: "carditis", type: "boolean", label: "Mayor: carditis (cl\xEDnica o subcl\xEDnica por eco)", noPoints: true },
        { id: "artritis", type: "boolean", label: "Mayor: artritis", description: "Poliartritis en riesgo bajo; tambi\xE9n monoartritis o poliartralgia en riesgo moderado-alto.", noPoints: true },
        { id: "corea", type: "boolean", label: "Mayor: corea de Sydenham", noPoints: true },
        { id: "eritema", type: "boolean", label: "Mayor: eritema marginado", noPoints: true },
        { id: "nodulos", type: "boolean", label: "Mayor: n\xF3dulos subcut\xE1neos", noPoints: true },
        { id: "fiebre", type: "boolean", label: "Menor: fiebre (\u2265 38,5 \xB0C en riesgo bajo; \u2265 38 \xB0C en riesgo moderado-alto)", noPoints: true },
        { id: "artralgia", type: "boolean", label: "Menor: poliartralgia (riesgo bajo) o monoartralgia (riesgo moderado-alto)", noPoints: true },
        { id: "reactantes", type: "boolean", label: "Menor: VSG o PCR elevadas", noPoints: true },
        { id: "pr", type: "boolean", label: "Menor: intervalo PR prolongado", noPoints: true }
      ],
      compute: (v) => {
        const mayores = sum(v, ["carditis", "artritis", "corea", "eritema", "nodulos"]);
        const menores = sum(v, ["fiebre", "artralgia", "reactantes", "pr"]);
        const cumple = mayores >= 2 || mayores === 1 && menores >= 2;
        const conEstrepto = cumple && v.estreptococo === 1;
        return {
          main: conEstrepto ? "Fiebre reum\xE1tica probable" : cumple ? "Criterios cl\xEDnicos cumplidos" : "Criterios no cumplidos",
          secondary: `${mayores} mayores \xB7 ${menores} menores`,
          interpretation: conEstrepto ? "Se cumplen los criterios (2 mayores o 1 mayor + 2 menores) junto con evidencia de infecci\xF3n estreptoc\xF3cica previa: diagn\xF3stico de fiebre reum\xE1tica aguda. Iniciar tratamiento y profilaxis secundaria." : cumple ? "Se cumplen los criterios cl\xEDnicos, pero falta evidencia de infecci\xF3n estreptoc\xF3cica previa: necesaria para el diagn\xF3stico (salvo corea o carditis indolente)." : "No se cumplen los criterios de Jones en este momento.",
          level: conEstrepto ? "danger" : cumple ? "warn" : "ok"
        };
      },
      notes: ["La corea de Sydenham y la carditis indolente pueden diagnosticar por s\xED solas, sin evidencia de infecci\xF3n estreptoc\xF3cica previa."],
      references: [
        "Gewitz MH, et al. Revision of the Jones Criteria for the diagnosis of acute rheumatic fever in the era of Doppler echocardiography. Circulation. 2015;131(20):1806-18."
      ]
    },
    {
      id: "kawasaki",
      name: "Criterios diagn\xF3sticos de la enfermedad de Kawasaki",
      shortName: "Kawasaki",
      description: "Diagnostica la enfermedad de Kawasaki cl\xE1sica e identifica formas incompletas.",
      category: CAT_DX,
      specialty: CARD5,
      inputs: [
        { id: "fiebre", type: "boolean", label: "Fiebre \u2265 5 d\xEDas", noPoints: true },
        { id: "conjuntivitis", type: "boolean", label: "Conjuntivitis bilateral no exudativa", noPoints: true },
        { id: "oral", type: "boolean", label: "Cambios orofar\xEDngeos", description: "Labios agrietados, lengua aframbuesada o eritema far\xEDngeo.", noPoints: true },
        { id: "extremidades", type: "boolean", label: "Cambios en las extremidades", description: "Eritema o edema de palmas y plantas; descamaci\xF3n periungueal en la fase subaguda.", noPoints: true },
        { id: "exantema", type: "boolean", label: "Exantema polimorfo", noPoints: true },
        { id: "adenopatia", type: "boolean", label: "Adenopat\xEDa cervical \u2265 1,5 cm (habitualmente unilateral)", noPoints: true }
      ],
      compute: (v) => {
        const criterios = sum(v, ["conjuntivitis", "oral", "extremidades", "exantema", "adenopatia"]);
        const fiebre = v.fiebre === 1;
        const clasica = fiebre && criterios >= 4;
        const incompleta = fiebre && criterios >= 2 && criterios < 4;
        return {
          main: clasica ? "Kawasaki cl\xE1sica" : incompleta ? "Posible Kawasaki incompleta" : "Criterios no cumplidos",
          secondary: `${criterios}/5`,
          secondaryLabel: "criterios cl\xEDnicos principales",
          interpretation: clasica ? "Fiebre \u2265 5 d\xEDas con \u2265 4 criterios principales: enfermedad de Kawasaki cl\xE1sica. Tratamiento con inmunoglobulina intravenosa y AAS, y ecocardiograma precoz." : incompleta ? "Fiebre \u2265 5 d\xEDas con 2\u20133 criterios: valorar Kawasaki incompleta con anal\xEDtica (PCR, VSG, anemia, plaquetas, transaminasas, alb\xFAmina, piuria est\xE9ril) y ecocardiograma." : "No se cumplen los criterios; reevaluar si la fiebre persiste y descartar otras causas.",
          level: clasica ? "danger" : incompleta ? "warn" : "ok"
        };
      },
      notes: ["Con \u2265 4 criterios principales (especialmente con afectaci\xF3n de extremidades) puede diagnosticarse al 4.\xBA d\xEDa de fiebre."],
      references: [
        "McCrindle BW, et al. Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease. Circulation. 2017;135(17):e927-e999."
      ]
    },
    {
      id: "rope",
      name: "Puntuaci\xF3n RoPE de embolia parad\xF3jica",
      shortName: "RoPE",
      description: "Estima la probabilidad de que un foramen oval permeable sea la causa del ictus criptog\xE9nico.",
      category: CAT_GRAV,
      specialty: CARD5,
      inputs: [
        { id: "noHta", type: "boolean", label: "Sin antecedente de hipertensi\xF3n arterial" },
        { id: "noDm", type: "boolean", label: "Sin antecedente de diabetes mellitus" },
        { id: "noIctus", type: "boolean", label: "Sin ictus ni AIT previos" },
        { id: "noFumador", type: "boolean", label: "No fumador" },
        { id: "cortical", type: "boolean", label: "Infarto cortical en la neuroimagen" },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          dropdown: true,
          options: [
            { label: "18\u201329 a\xF1os", value: 5 },
            { label: "30\u201339 a\xF1os", value: 4 },
            { label: "40\u201349 a\xF1os", value: 3 },
            { label: "50\u201359 a\xF1os", value: 2 },
            { label: "60\u201369 a\xF1os", value: 1 },
            { label: "\u2265 70 a\xF1os", value: 0 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["noHta", "noDm", "noIctus", "noFumador", "cortical", "edad"]);
        const atribuible = score <= 3 ? "\u2248 0 %" : score === 4 ? "38 %" : score === 5 ? "34 %" : score === 6 ? "62 %" : score === 7 ? "72 %" : score === 8 ? "84 %" : "88 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          secondary: atribuible,
          secondaryLabel: "fracci\xF3n atribuible al FOP",
          interpretation: score >= 7 ? "Puntuaci\xF3n alta: es probable que el foramen oval permeable sea causal del ictus; valorar cierre percut\xE1neo junto con las caracter\xEDsticas anat\xF3micas de alto riesgo." : score >= 5 ? "Puntuaci\xF3n intermedia: la relaci\xF3n causal es incierta; decisi\xF3n individualizada en equipo multidisciplinar." : "Puntuaci\xF3n baja: el FOP probablemente sea un hallazgo incidental; buscar otras causas del ictus.",
          level: score >= 7 ? "info" : score >= 5 ? "warn" : "ok"
        };
      },
      references: [
        "Kent DM, et al. An index to identify stroke-related vs incidental patent foramen ovale in cryptogenic stroke. Neurology. 2013;81(7):619-25."
      ]
    },
    {
      id: "mews",
      name: "Puntuaci\xF3n de alerta temprana modificada (MEWS)",
      shortName: "MEWS",
      description: "Detecta el deterioro cl\xEDnico del paciente hospitalizado a partir de las constantes vitales.",
      category: CAT_GRAV,
      specialty: CARD5,
      inputs: [
        {
          id: "pas",
          type: "select",
          label: "Presi\xF3n arterial sist\xF3lica (mmHg)",
          dropdown: true,
          options: [
            { label: "\u2264 70", value: 3 },
            { label: "71\u201380", value: 2 },
            { label: "81\u2013100", value: 1 },
            { label: "101\u2013199", value: 0 },
            { label: "\u2265 200", value: 2 }
          ],
          default: 0
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia card\xEDaca (lpm)",
          dropdown: true,
          options: [
            { label: "< 40", value: 2 },
            { label: "41\u201350", value: 1 },
            { label: "51\u2013100", value: 0 },
            { label: "101\u2013110", value: 1 },
            { label: "111\u2013129", value: 2 },
            { label: "\u2265 130", value: 3 }
          ],
          default: 0
        },
        {
          id: "fr",
          type: "select",
          label: "Frecuencia respiratoria (rpm)",
          dropdown: true,
          options: [
            { label: "< 9", value: 2 },
            { label: "9\u201314", value: 0 },
            { label: "15\u201320", value: 1 },
            { label: "21\u201329", value: 2 },
            { label: "\u2265 30", value: 3 }
          ],
          default: 0
        },
        {
          id: "temp",
          type: "select",
          label: "Temperatura (\xB0C)",
          dropdown: true,
          options: [
            { label: "< 35", value: 2 },
            { label: "35\u201338,4", value: 0 },
            { label: "\u2265 38,5", value: 2 }
          ],
          default: 0
        },
        {
          id: "conciencia",
          type: "select",
          label: "Nivel de conciencia (AVDN)",
          dropdown: true,
          options: [
            { label: "Alerta", value: 0 },
            { label: "Responde a la voz", value: 1 },
            { label: "Responde al dolor", value: 2 },
            { label: "No responde", value: 3 }
          ],
          default: 0
        }
      ],
      compute: (v) => {
        const score = sum(v, ["pas", "fc", "fr", "temp", "conciencia"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201314)",
          interpretation: score >= 5 ? "MEWS \u2265 5: riesgo elevado de deterioro, ingreso en cuidados intensivos o muerte. Avisar al equipo m\xE9dico de forma urgente." : score >= 3 ? "MEWS 3\u20134: aumentar la frecuencia de controles y avisar al equipo responsable." : "MEWS bajo: continuar la monitorizaci\xF3n habitual.",
          level: score >= 5 ? "danger" : score >= 3 ? "warn" : "ok"
        };
      },
      references: [
        "Subbe CP, et al. Validation of a modified Early Warning Score in medical admissions. QJM. 2001;94(10):521-6."
      ]
    },
    {
      id: "mmrc",
      name: "Escala de disnea mMRC",
      shortName: "mMRC",
      description: "Clasifica la disnea seg\xFAn la limitaci\xF3n que produce en la actividad diaria.",
      category: CAT_GRAV,
      specialty: CARD5,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "Grado de disnea",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "0 \u2014 Disnea solo con ejercicio intenso", value: 0 },
            { label: "1 \u2014 Disnea al andar deprisa en llano o subir una cuesta ligera", value: 1 },
            { label: "2 \u2014 Anda m\xE1s despacio que las personas de su edad, o debe parar al andar a su paso en llano", value: 2 },
            { label: "3 \u2014 Para a descansar tras andar unos 100 m o pocos minutos en llano", value: 3 },
            { label: "4 \u2014 No puede salir de casa, o presenta disnea al vestirse o desvestirse", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const g = v.grado ?? 0;
        return {
          main: `mMRC ${g}`,
          interpretation: g <= 1 ? "Disnea leve. En EPOC, un mMRC < 2 corresponde a los grupos de menor carga sintom\xE1tica." : "Disnea significativa (mMRC \u2265 2): mayor carga sintom\xE1tica; en EPOC indica tratamiento broncodilatador optimizado y rehabilitaci\xF3n respiratoria.",
          level: g <= 1 ? "ok" : g === 2 ? "warn" : "danger"
        };
      },
      references: [
        "Bestall JC, et al. Usefulness of the Medical Research Council (MRC) dyspnoea scale as a measure of disability in patients with chronic obstructive pulmonary disease. Thorax. 1999;54(7):581-6."
      ]
    },
    {
      id: "lace",
      name: "\xCDndice LACE de riesgo de reingreso",
      shortName: "LACE",
      description: "Predice el riesgo de reingreso no programado o muerte a 30 d\xEDas tras el alta hospitalaria.",
      category: CAT_GRAV,
      specialty: CARD5,
      inputs: [
        {
          id: "estancia",
          type: "select",
          label: "Duraci\xF3n del ingreso (L)",
          dropdown: true,
          options: [
            { label: "< 1 d\xEDa", value: 1 },
            { label: "1 d\xEDa", value: 1 },
            { label: "2 d\xEDas", value: 2 },
            { label: "3 d\xEDas", value: 3 },
            { label: "4\u20136 d\xEDas", value: 4 },
            { label: "7\u201313 d\xEDas", value: 5 },
            { label: "\u2265 14 d\xEDas", value: 7 }
          ]
        },
        { id: "agudo", type: "boolean", label: "Ingreso urgente/agudo (A)", points: 3 },
        {
          id: "charlson",
          type: "select",
          label: "\xCDndice de comorbilidad de Charlson (C)",
          dropdown: true,
          options: [
            { label: "0", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "\u2265 4", value: 5 }
          ]
        },
        {
          id: "urgencias",
          type: "select",
          label: "Visitas a urgencias en los 6 meses previos (E)",
          dropdown: true,
          options: [
            { label: "Ninguna", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "\u2265 4", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["estancia", "agudo", "charlson", "urgencias"]);
        const banda = score <= 4 ? "bajo" : score <= 9 ? "moderado" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201319)",
          interpretation: banda === "bajo" ? "Riesgo bajo de reingreso o muerte a 30 d\xEDas." : banda === "moderado" ? "Riesgo moderado: reforzar la conciliaci\xF3n de la medicaci\xF3n y el seguimiento tras el alta." : "Riesgo alto (\u2265 10): planificar el alta con seguimiento precoz, educaci\xF3n al paciente y coordinaci\xF3n con atenci\xF3n primaria.",
          level: banda === "bajo" ? "ok" : banda === "moderado" ? "warn" : "danger"
        };
      },
      references: [
        "van Walraven C, et al. Derivation and validation of an index to predict early death or unplanned readmission after discharge from hospital to the community. CMAJ. 2010;182(6):551-7."
      ]
    }
  ];

  // src/calculators/formulas.ts
  var CAT13 = "F\xF3rmulas y c\xE1lculos cl\xEDnicos";
  var CARD6 = ["Cardiolog\xEDa"];
  var formulas = [
    {
      id: "qtc",
      name: "Intervalo QT corregido (QTc)",
      shortName: "QTc",
      description: "Corrige el intervalo QT seg\xFAn la frecuencia card\xEDaca (f\xF3rmulas de Bazett, Fridericia, Framingham, Hodges y Rautaharju).",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "qt", type: "number", label: "Intervalo QT medido", unit: "ms", min: 100, max: 900 },
        { id: "fc", type: "number", label: "Frecuencia card\xEDaca", unit: "lpm", min: 20, max: 250 },
        {
          id: "formula",
          type: "select",
          label: "F\xF3rmula de correcci\xF3n",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Bazett \u2014 QT / \u221ARR (la m\xE1s usada)", value: 0 },
            { label: "Fridericia \u2014 QT / RR^(1/3)", value: 1 },
            { label: "Framingham \u2014 QT + 154 \xD7 (1 \u2212 RR)", value: 2 },
            { label: "Hodges \u2014 QT + 1,75 \xD7 (FC \u2212 60)", value: 3 },
            { label: "Rautaharju \u2014 QT \xD7 (120 + FC) / 180", value: 4 }
          ]
        },
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const rr = 60 / v.fc;
        const qt = v.qt;
        const f = v.formula ?? 0;
        const qtc = [
          qt / Math.sqrt(rr),
          qt / Math.cbrt(rr),
          qt + 154 * (1 - rr),
          qt + 1.75 * (v.fc - 60),
          qt * (120 + v.fc) / 180
        ][f];
        const nombre = ["Bazett", "Fridericia", "Framingham", "Hodges", "Rautaharju"][f];
        const mujer = v.sexo === 1;
        const limite = mujer ? 460 : 450;
        const prolongado = qtc > limite;
        const muyProlongado = qtc >= 500;
        return {
          main: fmt(qtc, 0),
          mainUnit: `ms (${nombre})`,
          secondary: fmt(rr, 2),
          secondaryLabel: "intervalo RR (s)",
          interpretation: muyProlongado ? "QTc \u2265 500 ms: riesgo elevado de torsade de pointes. Revisar f\xE1rmacos que prolongan el QT, corregir potasio y magnesio y monitorizar." : prolongado ? `QTc prolongado para el l\xEDmite habitual (${limite} ms en ${mujer ? "mujeres" : "varones"}): revisar f\xE1rmacos y electrolitos.` : "QTc dentro del rango normal.",
          level: muyProlongado ? "danger" : prolongado ? "warn" : "ok",
          details: [
            "Bazett sobrecorrige con taquicardia e infracorrige con bradicardia; con frecuencias extremas se prefieren Fridericia o Framingham."
          ]
        };
      },
      notes: ["L\xEDmites habituales de normalidad: \u2264 450 ms en varones y \u2264 460 ms en mujeres; \u2265 500 ms se considera de alto riesgo."]
    },
    {
      id: "tisdale",
      name: "Puntuaci\xF3n de riesgo de Tisdale para la prolongaci\xF3n del QT",
      shortName: "Tisdale",
      description: "Predice el riesgo de prolongaci\xF3n del QTc por encima de 500 ms en pacientes hospitalizados.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad \u2265 68 a\xF1os" },
        { id: "mujer", type: "boolean", label: "Sexo femenino" },
        { id: "asa", type: "boolean", label: "Tratamiento con diur\xE9ticos de asa" },
        { id: "potasio", type: "boolean", label: "Potasio s\xE9rico \u2264 3,5 mEq/L" },
        { id: "qtcIngreso", type: "boolean", label: "QTc al ingreso \u2265 450 ms", points: 2 },
        { id: "iamAgudo", type: "boolean", label: "Infarto agudo de miocardio", points: 2 },
        { id: "unQt", type: "boolean", label: "Un f\xE1rmaco que prolonga el QT", points: 3 },
        { id: "dosQt", type: "boolean", label: "\u2265 2 f\xE1rmacos que prolongan el QT", points: 3 },
        { id: "sepsis", type: "boolean", label: "Sepsis", points: 3 },
        { id: "icc", type: "boolean", label: "Insuficiencia card\xEDaca", points: 3 }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "mujer", "asa", "potasio", "qtcIngreso", "iamAgudo", "unQt", "dosQt", "sepsis", "icc"]);
        const banda = score <= 6 ? "bajo" : score <= 10 ? "moderado" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201321)",
          interpretation: banda === "bajo" ? "Riesgo bajo de prolongaci\xF3n del QTc > 500 ms (\u2248 15 %)." : banda === "moderado" ? "Riesgo moderado (\u2248 37 %): monitorizaci\xF3n electrocardiogr\xE1fica y control de electrolitos." : "Riesgo alto (\u2248 73 %): evitar en lo posible f\xE1rmacos que prolonguen el QT, monitorizaci\xF3n continua y correcci\xF3n de potasio y magnesio.",
          level: banda === "bajo" ? "ok" : banda === "moderado" ? "warn" : "danger"
        };
      },
      notes: ["Si se toman \u2265 2 f\xE1rmacos que prolongan el QT, deben marcarse ambas casillas (3 + 3 puntos)."],
      references: [
        "Tisdale JE, et al. Development and validation of a risk score to predict QT interval prolongation in hospitalized patients. Circ Cardiovasc Qual Outcomes. 2013;6(4):479-87."
      ]
    },
    {
      id: "cockcroft-gault",
      name: "Aclaramiento de creatinina (Cockcroft-Gault)",
      shortName: "Cockcroft-Gault",
      description: "Estima el aclaramiento de creatinina para el ajuste de dosis de f\xE1rmacos.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 18, max: 110 },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 20, max: 300 },
        { id: "creatinina", type: "number", label: "Creatinina s\xE9rica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 }
      ],
      compute: (v) => {
        const crcl = (140 - v.edad) * v.peso / (72 * v.creatinina) * (v.sexo === 1 ? 0.85 : 1);
        return {
          main: fmt(crcl, 1),
          mainUnit: "mL/min",
          interpretation: crcl >= 90 ? "Aclaramiento normal." : crcl >= 60 ? "Reducci\xF3n leve del aclaramiento: revisar f\xE1rmacos de eliminaci\xF3n renal." : crcl >= 30 ? "Reducci\xF3n moderada: ajuste de dosis necesario en muchos f\xE1rmacos (incluidos los anticoagulantes directos)." : crcl >= 15 ? "Reducci\xF3n grave: ajuste estricto y evitar nefrot\xF3xicos." : "Fallo renal: valorar contraindicaciones farmacol\xF3gicas y necesidad de terapia renal sustitutiva.",
          level: crcl >= 60 ? "ok" : crcl >= 30 ? "warn" : "danger",
          details: ["CrCl = [(140 \u2212 edad) \xD7 peso] / (72 \xD7 creatinina) \xD7 0,85 si mujer."]
        };
      },
      notes: [
        "En obesidad conviene usar el peso ideal o ajustado; la f\xF3rmula sobreestima con peso elevado.",
        "Es la f\xF3rmula usada en las fichas t\xE9cnicas de muchos f\xE1rmacos (p. ej., anticoagulantes de acci\xF3n directa), aunque el CKD-EPI estime mejor el filtrado glomerular."
      ],
      references: [
        "Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41."
      ]
    },
    {
      id: "friedewald",
      name: "Colesterol LDL (ecuaci\xF3n de Friedewald)",
      shortName: "LDL Friedewald",
      description: "Calcula el colesterol LDL a partir del perfil lip\xEDdico est\xE1ndar.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "total", type: "number", label: "Colesterol total", unit: "mg/dL", min: 50, max: 800 },
        { id: "hdl", type: "number", label: "Colesterol HDL", unit: "mg/dL", min: 5, max: 200 },
        { id: "tg", type: "number", label: "Triglic\xE9ridos", unit: "mg/dL", min: 10, max: 2e3 }
      ],
      compute: (v) => {
        if (v.tg > 400)
          return {
            main: "No v\xE1lido",
            interpretation: "Con triglic\xE9ridos > 400 mg/dL la ecuaci\xF3n de Friedewald no es fiable: usar LDL directo o las ecuaciones de Martin-Hopkins o Sampson.",
            level: "warn"
          };
        const ldl = v.total - v.hdl - v.tg / 5;
        return {
          main: fmt(ldl, 0),
          mainUnit: "mg/dL de LDL",
          secondary: fmt(v.total - v.hdl, 0),
          secondaryLabel: "colesterol no-HDL (mg/dL)",
          interpretation: ldl < 55 ? "LDL < 55 mg/dL: objetivo de muy alto riesgo cardiovascular alcanzado." : ldl < 70 ? "LDL < 70 mg/dL: objetivo de alto riesgo alcanzado." : ldl < 100 ? "LDL < 100 mg/dL: objetivo de riesgo moderado alcanzado." : "LDL elevado respecto a los objetivos habituales: valorar tratamiento hipolipemiante seg\xFAn el riesgo cardiovascular.",
          level: ldl < 70 ? "ok" : ldl < 100 ? "info" : ldl < 190 ? "warn" : "danger",
          details: ["LDL = colesterol total \u2212 HDL \u2212 triglic\xE9ridos/5 (mg/dL)."]
        };
      },
      notes: ["Requiere ayuno y no es v\xE1lida con triglic\xE9ridos > 400 mg/dL ni con LDL muy bajo."],
      references: [
        "Friedewald WT, et al. Estimation of the concentration of low-density lipoprotein cholesterol in plasma, without use of the preparative ultracentrifuge. Clin Chem. 1972;18(6):499-502."
      ]
    },
    {
      id: "calcio-corregido",
      name: "Calcio corregido por alb\xFAmina",
      shortName: "Calcio corregido",
      description: "Corrige la calcemia total seg\xFAn la concentraci\xF3n de alb\xFAmina s\xE9rica.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "calcio", type: "number", label: "Calcio s\xE9rico total", unit: "mg/dL", min: 2, max: 20, step: 0.1 },
        { id: "albumina", type: "number", label: "Alb\xFAmina s\xE9rica", unit: "g/dL", min: 0.5, max: 7, step: 0.1 }
      ],
      compute: (v) => {
        const corr = v.calcio + 0.8 * (4 - v.albumina);
        return {
          main: fmt(corr, 2),
          mainUnit: "mg/dL (calcio corregido)",
          interpretation: corr < 8.5 ? "Hipocalcemia: valorar causas (d\xE9ficit de vitamina D, hipoparatiroidismo, hipomagnesemia) y prolongaci\xF3n del QT." : corr <= 10.5 ? "Calcio corregido dentro del rango normal (8,5\u201310,5 mg/dL)." : "Hipercalcemia: valorar hiperparatiroidismo, neoplasia y otras causas; vigilar acortamiento del QT.",
          level: corr < 8.5 || corr > 10.5 ? "warn" : "ok",
          details: ["Calcio corregido = calcio medido + 0,8 \xD7 (4 \u2212 alb\xFAmina)."]
        };
      },
      notes: ["Ante dudas o situaciones cr\xEDticas, medir el calcio i\xF3nico directamente."]
    },
    {
      id: "fick",
      name: "Gasto card\xEDaco (f\xF3rmula de Fick)",
      shortName: "Fick",
      description: "Calcula el gasto card\xEDaco, el \xEDndice card\xEDaco y el volumen sist\xF3lico.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "hb", type: "number", label: "Hemoglobina", unit: "g/dL", min: 3, max: 25, step: 0.1 },
        { id: "sao2", type: "number", label: "Saturaci\xF3n arterial de O\u2082", unit: "%", min: 40, max: 100 },
        { id: "svo2", type: "number", label: "Saturaci\xF3n venosa mixta de O\u2082", unit: "%", min: 10, max: 100 },
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 18, max: 110 },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 20, max: 300 },
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 100, max: 230 },
        { id: "fc", type: "number", label: "Frecuencia card\xEDaca", unit: "lpm", min: 20, max: 250 },
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const bsa = Math.sqrt(v.talla * v.peso / 3600);
        const coefEdad = v.sexo === 1 ? 17.04 : 11.49;
        const vo2 = (138.1 - coefEdad * Math.log(v.edad) + 0.378 * v.fc) * bsa;
        const dif = 13.4 * v.hb * ((v.sao2 - v.svo2) / 100);
        if (dif <= 0)
          return {
            main: "\u2014",
            interpretation: "La saturaci\xF3n arterial debe ser mayor que la venosa mixta.",
            level: "warn"
          };
        const co = vo2 / dif;
        const ci = co / bsa;
        const sv = co * 1e3 / v.fc;
        return {
          main: fmt(co, 2),
          mainUnit: "L/min (gasto card\xEDaco)",
          secondary: fmt(ci, 2),
          secondaryLabel: "\xEDndice card\xEDaco (L/min/m\xB2)",
          interpretation: ci < 2.2 ? "\xCDndice card\xEDaco < 2,2 L/min/m\xB2: bajo gasto; valorar soporte inotr\xF3pico o mec\xE1nico seg\xFAn el contexto." : ci <= 4 ? "\xCDndice card\xEDaco dentro del rango habitual (2,2\u20134,0 L/min/m\xB2)." : "\xCDndice card\xEDaco elevado: valorar estados hiperdin\xE1micos (sepsis, anemia, tirotoxicosis).",
          level: ci < 2.2 ? "danger" : ci <= 4 ? "ok" : "warn",
          details: [
            `Superficie corporal (Mosteller): ${fmt(bsa, 2)} m\xB2.`,
            `VO\u2082 estimado (LaFarge): ${fmt(vo2, 0)} mL/min.`,
            `Volumen sist\xF3lico: ${fmt(sv, 0)} mL.`
          ]
        };
      },
      notes: [
        "Usa el consumo de ox\xEDgeno estimado con la ecuaci\xF3n de LaFarge y Miettinen (Fick indirecto), no medido.",
        "En insuficiencia card\xEDaca con fracci\xF3n de eyecci\xF3n reducida, las ecuaciones de estimaci\xF3n tienen l\xEDmites de concordancia amplios: LaFarge fue la m\xE1s ajustada de las tres estudiadas, pero con un error \u2265 25 % en el 11 % de los pacientes y una clasificaci\xF3n err\xF3nea del \xEDndice card\xEDaco en torno al 20 %. Ante decisiones cr\xEDticas, medir el VO\u2082 directamente.",
        "Requiere saturaci\xF3n venosa mixta obtenida de arteria pulmonar (no venosa central)."
      ],
      references: [
        "LaFarge CG, Miettinen OS. The estimation of oxygen consumption. Cardiovasc Res. 1970;4(1):23-30.",
        "Chase PJ, et al. Comparison of estimations versus measured oxygen consumption at rest in patients with heart failure and reduced ejection fraction who underwent right-sided heart catheterization. Am J Cardiol. 2015;116(11):1724-30. doi:10.1016/j.amjcard.2015.08.051"
      ]
    },
    {
      id: "cpo",
      name: "Potencia card\xEDaca (CPO)",
      shortName: "CPO",
      description: "Calcula la potencia desarrollada por el coraz\xF3n; predictor pron\xF3stico en el shock cardiog\xE9nico.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "pam", type: "number", label: "Presi\xF3n arterial media", unit: "mmHg", min: 20, max: 200 },
        { id: "co", type: "number", label: "Gasto card\xEDaco", unit: "L/min", min: 0.5, max: 15, step: 0.1 }
      ],
      compute: (v) => {
        const cpo = v.pam * v.co / 451;
        return {
          main: fmt(cpo, 2),
          mainUnit: "W",
          interpretation: cpo < 0.6 ? "CPO < 0,6 W: se asocia a mortalidad elevada en el shock cardiog\xE9nico; considerar soporte inotr\xF3pico o circulatorio mec\xE1nico." : "CPO \u2265 0,6 W: mejor pron\xF3stico hemodin\xE1mico.",
          level: cpo < 0.6 ? "danger" : "ok",
          details: ["CPO = PAM \xD7 gasto card\xEDaco / 451."]
        };
      },
      references: [
        "Fincke R, et al. Cardiac power is the strongest hemodynamic correlate of mortality in cardiogenic shock (SHOCK trial registry). J Am Coll Cardiol. 2004;44(2):340-8."
      ]
    },
    {
      id: "papi",
      name: "\xCDndice de pulsatilidad de la arteria pulmonar (PAPi)",
      shortName: "PAPi",
      description: "Eval\xFAa el riesgo de disfunci\xF3n del ventr\xEDculo derecho (infarto inferior, implante de asistencia ventricular izquierda).",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "pasp", type: "number", label: "Presi\xF3n sist\xF3lica en arteria pulmonar", unit: "mmHg", min: 5, max: 150 },
        { id: "padp", type: "number", label: "Presi\xF3n diast\xF3lica en arteria pulmonar", unit: "mmHg", min: 0, max: 100 },
        { id: "pad", type: "number", label: "Presi\xF3n auricular derecha media", unit: "mmHg", min: 0.5, max: 40, step: 0.5 }
      ],
      compute: (v) => {
        const papi = (v.pasp - v.padp) / v.pad;
        return {
          main: fmt(papi, 2),
          interpretation: papi < 1 ? "PAPi < 1,0: disfunci\xF3n grave del ventr\xEDculo derecho; asociado a mal pron\xF3stico y a necesidad de soporte del VD." : papi < 1.85 ? "PAPi entre 1,0 y 1,85: riesgo aumentado de fallo del ventr\xEDculo derecho, especialmente tras implante de asistencia ventricular izquierda." : "PAPi \u2265 1,85: funci\xF3n del ventr\xEDculo derecho conservada en t\xE9rminos hemodin\xE1micos.",
          level: papi < 1 ? "danger" : papi < 1.85 ? "warn" : "ok",
          details: ["PAPi = (PAP sist\xF3lica \u2212 PAP diast\xF3lica) / presi\xF3n auricular derecha."]
        };
      },
      references: [
        "Korabathina R, et al. The pulmonary artery pulsatility index identifies severe right ventricular dysfunction in acute inferior myocardial infarction. Catheter Cardiovasc Interv. 2012;80(4):593-600."
      ]
    },
    {
      id: "light",
      name: "Criterios de Light para el derrame pleural",
      shortName: "Light",
      description: "Determina si un derrame pleural es exudado o trasudado.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "protPleural", type: "number", label: "Prote\xEDnas en l\xEDquido pleural", unit: "g/dL", min: 0, max: 10, step: 0.1 },
        { id: "protSuero", type: "number", label: "Prote\xEDnas s\xE9ricas", unit: "g/dL", min: 1, max: 12, step: 0.1 },
        { id: "ldhPleural", type: "number", label: "LDH en l\xEDquido pleural", unit: "U/L", min: 0, max: 5e3 },
        { id: "ldhSuero", type: "number", label: "LDH s\xE9rica", unit: "U/L", min: 10, max: 5e3 },
        { id: "ldhLimite", type: "number", label: "L\xEDmite superior de LDH del laboratorio", unit: "U/L", min: 50, max: 1e3 }
      ],
      compute: (v) => {
        const rProt = v.protPleural / v.protSuero;
        const rLdh = v.ldhPleural / v.ldhSuero;
        const c1 = rProt > 0.5;
        const c2 = rLdh > 0.6;
        const c3 = v.ldhPleural > 2 / 3 * v.ldhLimite;
        const exudado = c1 || c2 || c3;
        return {
          main: exudado ? "Exudado" : "Trasudado",
          secondary: `${[c1, c2, c3].filter(Boolean).length}/3`,
          secondaryLabel: "criterios cumplidos",
          interpretation: exudado ? "Cumple al menos un criterio de Light: exudado. Estudiar causas (infecci\xF3n, neoplasia, embolia pulmonar, enfermedades del tejido conectivo)." : "No cumple ning\xFAn criterio: trasudado. Causas habituales: insuficiencia card\xEDaca, cirrosis, s\xEDndrome nefr\xF3tico.",
          level: exudado ? "warn" : "info",
          details: [
            `Prote\xEDnas pleural/suero: ${fmt(rProt, 2)} (criterio > 0,5) ${c1 ? "\u2713" : "\u2717"}`,
            `LDH pleural/suero: ${fmt(rLdh, 2)} (criterio > 0,6) ${c2 ? "\u2713" : "\u2717"}`,
            `LDH pleural > 2/3 del l\xEDmite superior (${fmt(2 / 3 * v.ldhLimite, 0)} U/L) ${c3 ? "\u2713" : "\u2717"}`
          ]
        };
      },
      notes: [
        "En pacientes con insuficiencia card\xEDaca en tratamiento diur\xE9tico, los criterios pueden clasificar err\xF3neamente un trasudado como exudado: valorar el gradiente de alb\xFAmina suero-l\xEDquido (> 1,2 g/dL sugiere trasudado)."
      ],
      references: [
        "Light RW, et al. Pleural effusions: the diagnostic separation of transudates and exudates. Ann Intern Med. 1972;77(4):507-13."
      ]
    },
    {
      id: "fluidos-mantenimiento",
      name: "Fluidos de mantenimiento (regla 4-2-1 / Holliday-Segar)",
      shortName: "Fluidos de mantenimiento",
      description: "Calcula las necesidades basales de l\xEDquidos seg\xFAn el peso.",
      category: CAT13,
      specialty: CARD6,
      inputs: [{ id: "peso", type: "number", label: "Peso", unit: "kg", min: 0.5, max: 300, step: 0.1 }],
      compute: (v) => {
        const w = v.peso;
        const hora = w <= 10 ? 4 * w : w <= 20 ? 40 + 2 * (w - 10) : 60 + (w - 20);
        const dia = w <= 10 ? 100 * w : w <= 20 ? 1e3 + 50 * (w - 10) : 1500 + 20 * (w - 20);
        return {
          main: fmt(hora, 0),
          mainUnit: "mL/h",
          secondary: fmt(dia, 0),
          secondaryLabel: "mL/d\xEDa",
          interpretation: "Necesidades basales de mantenimiento. Ajustar seg\xFAn p\xE9rdidas, estado de volemia, funci\xF3n renal y card\xEDaca; en insuficiencia card\xEDaca o renal suele requerirse restricci\xF3n.",
          level: "info",
          details: ["Regla 4-2-1: 4 mL/kg/h los primeros 10 kg, 2 mL/kg/h los siguientes 10 kg y 1 mL/kg/h el resto."]
        };
      },
      references: [
        "Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957;19(5):823-32."
      ]
    },
    {
      id: "diuresis",
      name: "Diuresis y balance h\xEDdrico",
      shortName: "Diuresis",
      description: "Calcula la diuresis horaria y el balance de l\xEDquidos en 24 horas.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 0.5, max: 300, step: 0.1 },
        { id: "orina", type: "number", label: "Volumen de orina recogido", unit: "mL", min: 0, max: 2e4 },
        { id: "horas", type: "number", label: "Tiempo de recogida", unit: "h", min: 0.5, max: 72, step: 0.5 },
        { id: "aportes", type: "number", label: "Aportes totales en ese per\xEDodo (opcional)", unit: "mL", min: 0, max: 3e4 }
      ],
      compute: (v) => {
        const mlKgH = v.orina / v.peso / v.horas;
        const balance = v.aportes - v.orina;
        return {
          main: fmt(mlKgH, 2),
          mainUnit: "mL/kg/h",
          secondary: `${balance >= 0 ? "+" : ""}${fmt(balance, 0)} mL`,
          secondaryLabel: "balance en el per\xEDodo",
          interpretation: mlKgH < 0.3 ? "Oliguria grave / anuria (< 0,3 mL/kg/h): criterio de lesi\xF3n renal aguda; valorar causa prerrenal, renal u obstructiva de forma urgente." : mlKgH < 0.5 ? "Oliguria (< 0,5 mL/kg/h): si persiste \u2265 6 h cumple criterio KDIGO de lesi\xF3n renal aguda." : "Diuresis dentro del rango habitual (\u2265 0,5 mL/kg/h).",
          level: mlKgH < 0.3 ? "danger" : mlKgH < 0.5 ? "warn" : "ok",
          details: [`Diuresis extrapolada a 24 h: ${fmt(v.orina / v.horas * 24, 0)} mL/d\xEDa.`]
        };
      },
      notes: ["El balance no incluye las p\xE9rdidas insensibles (aprox. 500\u2013800 mL/d\xEDa en un adulto, m\xE1s con fiebre o taquipnea)."]
    },
    {
      id: "reticulocitos",
      name: "\xCDndice de producci\xF3n reticulocitaria (IPR)",
      shortName: "IPR / reticulocitos",
      description: "Eval\xFAa la respuesta de la m\xE9dula \xF3sea a la anemia corrigiendo el porcentaje de reticulocitos.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "retis", type: "number", label: "Reticulocitos", unit: "%", min: 0, max: 60, step: 0.1 },
        { id: "hto", type: "number", label: "Hematocrito del paciente", unit: "%", min: 5, max: 65, step: 0.1 },
        { id: "htoNormal", type: "number", label: "Hematocrito normal de referencia", unit: "%", min: 30, max: 55, step: 0.5 }
      ],
      compute: (v) => {
        const corregido = v.retis * (v.hto / v.htoNormal);
        const madur = v.hto >= 35 ? 1 : v.hto >= 25 ? 1.5 : v.hto >= 20 ? 2 : 2.5;
        const ipr = corregido / madur;
        return {
          main: fmt(ipr, 2),
          mainUnit: "IPR",
          secondary: `${fmt(corregido, 2)} %`,
          secondaryLabel: "reticulocitos corregidos",
          interpretation: ipr < 2 ? "IPR < 2: respuesta medular inadecuada (anemia hipoproliferativa: ferropenia, enfermedad cr\xF3nica, aplasia, infiltraci\xF3n medular)." : "IPR \u2265 2: respuesta medular adecuada, sugestiva de hem\xF3lisis o sangrado con m\xE9dula competente.",
          level: ipr < 2 ? "warn" : "ok",
          details: [`Factor de maduraci\xF3n aplicado: ${madur}.`]
        };
      }
    },
    {
      id: "marcha-6min",
      name: "Prueba de la marcha de 6 minutos (valores de referencia)",
      shortName: "Marcha 6 min",
      description: "Calcula la distancia te\xF3rica esperada en la prueba de los 6 minutos como medida del estado funcional.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 18, max: 100 },
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 120, max: 220 },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 25, max: 250 },
        { id: "recorrida", type: "number", label: "Distancia recorrida (opcional)", unit: "m", min: 0, max: 1e3 }
      ],
      compute: (v) => {
        const teorica = v.sexo === 0 ? 7.57 * v.talla - 5.02 * v.edad - 1.76 * v.peso - 309 : 2.11 * v.talla - 2.29 * v.peso - 5.78 * v.edad + 667;
        const li = v.sexo === 0 ? teorica - 153 : teorica - 139;
        const pct = v.recorrida > 0 ? v.recorrida / teorica * 100 : null;
        return {
          main: fmt(teorica, 0),
          mainUnit: "m (distancia te\xF3rica)",
          secondary: pct !== null ? `${fmt(pct, 0)} %` : void 0,
          secondaryLabel: pct !== null ? "del valor te\xF3rico" : void 0,
          interpretation: pct === null ? `L\xEDmite inferior de la normalidad: ${fmt(li, 0)} m (ecuaciones de Enright y Sherrill).` : v.recorrida < li ? `Distancia por debajo del l\xEDmite inferior de la normalidad (${fmt(li, 0)} m): capacidad funcional reducida.` : "Distancia dentro del rango esperado para edad, sexo, talla y peso.",
          level: pct === null ? "info" : v.recorrida < li ? "warn" : "ok"
        };
      },
      notes: [
        "Una diferencia de 30\u201350 m se considera cl\xEDnicamente relevante en el seguimiento individual.",
        "Registrar adem\xE1s la SpO\u2082, la disnea (Borg) y los motivos de interrupci\xF3n."
      ],
      references: [
        "Enright PL, Sherrill DL. Reference equations for the six-minute walk in healthy adults. Am J Respir Crit Care Med. 1998;158(5):1384-7."
      ]
    },
    {
      id: "trombolisis-ictus",
      name: "Dosificaci\xF3n de trombol\xEDticos en el ictus isqu\xE9mico",
      shortName: "Dosis alteplasa / tenecteplasa",
      description: "Calcula la dosis de alteplasa (0,9 mg/kg) o tenecteplasa (0,25 mg/kg) para el ictus isqu\xE9mico agudo.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        {
          id: "farmaco",
          type: "select",
          label: "F\xE1rmaco",
          noPoints: true,
          options: [
            { label: "Alteplasa (rtPA) 0,9 mg/kg \u2014 m\xE1ximo 90 mg", value: 0 },
            { label: "Tenecteplasa (TNK) 0,25 mg/kg \u2014 m\xE1ximo 25 mg", value: 1 }
          ]
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 20, max: 250, step: 0.5 }
      ],
      compute: (v) => {
        const tnk = v.farmaco === 1;
        const total = tnk ? Math.min(0.25 * v.peso, 25) : Math.min(0.9 * v.peso, 90);
        const bolo = tnk ? total : total * 0.1;
        const infusion = tnk ? 0 : total - bolo;
        return {
          main: fmt(total, 1),
          mainUnit: "mg (dosis total)",
          secondary: fmt(bolo, 1),
          secondaryLabel: tnk ? "mg en bolo \xFAnico (5 s)" : "mg en bolo (1 min)",
          interpretation: tnk ? "Tenecteplasa: dosis \xFAnica en bolo intravenoso de 5 segundos (0,25 mg/kg, m\xE1ximo 25 mg)." : `Alteplasa: 10 % en bolo durante 1 minuto y el 90 % restante (${fmt(infusion, 1)} mg) en infusi\xF3n de 60 minutos.`,
          level: "info",
          details: [
            "Verificar ventana terap\xE9utica, criterios de inclusi\xF3n/exclusi\xF3n y control estricto de la presi\xF3n arterial (< 185/110 mmHg antes de tratar).",
            "Monitorizaci\xF3n neurol\xF3gica y de la presi\xF3n arterial seg\xFAn protocolo durante y tras la infusi\xF3n."
          ]
        };
      },
      notes: ["Comprobar siempre la dosis con el protocolo de tu centro y la ficha t\xE9cnica antes de administrarla."],
      references: [
        "Powers WJ, et al. Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update. Stroke. 2019;50(12):e344-e418."
      ]
    }
  ];

  // src/calculators/neurocritico.ts
  var CAT14 = "Neurocr\xEDtico e ictus";
  var UCI = ["Medicina Intensiva"];
  var escala = (items) => items.map(([value, label]) => ({ label: `${value} \u2014 ${label}`, value }));
  var neurocritico = [
    {
      id: "glasgow",
      name: "Escala de coma de Glasgow (GCS)",
      shortName: "Glasgow",
      description: "Cuantifica el nivel de conciencia mediante la respuesta ocular, verbal y motora.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "ocular",
          type: "select",
          label: "Apertura ocular",
          dropdown: true,
          options: escala([
            [4, "Espont\xE1nea"],
            [3, "A la orden verbal"],
            [2, "Al dolor"],
            [1, "Ninguna"]
          ]),
          default: 4
        },
        {
          id: "verbal",
          type: "select",
          label: "Respuesta verbal",
          dropdown: true,
          options: escala([
            [5, "Orientada"],
            [4, "Confusa"],
            [3, "Palabras inapropiadas"],
            [2, "Sonidos incomprensibles"],
            [1, "Ninguna (o intubado)"]
          ]),
          default: 5
        },
        {
          id: "motora",
          type: "select",
          label: "Respuesta motora",
          dropdown: true,
          options: escala([
            [6, "Obedece \xF3rdenes"],
            [5, "Localiza el dolor"],
            [4, "Retirada al dolor"],
            [3, "Flexi\xF3n anormal (decorticaci\xF3n)"],
            [2, "Extensi\xF3n anormal (descerebraci\xF3n)"],
            [1, "Ninguna"]
          ]),
          default: 6
        }
      ],
      compute: (v) => {
        const score = sum(v, ["ocular", "verbal", "motora"]);
        return {
          main: String(score),
          mainUnit: "puntos (3\u201315)",
          secondary: `O${v.ocular} V${v.verbal} M${v.motora}`,
          secondaryLabel: "desglose",
          interpretation: score >= 13 ? "Traumatismo craneoencef\xE1lico leve (13\u201315)." : score >= 9 ? "Traumatismo craneoencef\xE1lico moderado (9\u201312): vigilancia estrecha y neuroimagen." : "Traumatismo craneoencef\xE1lico grave (\u2264 8): considerar aislamiento de la v\xEDa a\xE9rea y monitorizaci\xF3n neurocr\xEDtica.",
          level: score >= 13 ? "ok" : score >= 9 ? "warn" : "danger"
        };
      },
      notes: [
        "Registrar siempre el desglose por componentes: es m\xE1s informativo que la suma.",
        "En pacientes intubados, la respuesta verbal se anota como 1 con el sufijo \xABT\xBB; en ese caso la puntuaci\xF3n m\xE1xima es 10T.",
        "Puntuar la mejor respuesta obtenida."
      ],
      references: [
        "Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81-4."
      ]
    },
    {
      id: "gcs-p",
      name: "Escala de Glasgow con reactividad pupilar (GCS-P)",
      shortName: "GCS-P",
      description: "Combina la escala de Glasgow con la reactividad pupilar para afinar el pron\xF3stico en puntuaciones bajas.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        { id: "gcs", type: "number", label: "Puntuaci\xF3n total de Glasgow", unit: "puntos", min: 3, max: 15, step: 1 },
        {
          id: "pupilas",
          type: "select",
          label: "Pupilas que no reaccionan a la luz",
          options: [
            { label: "Ninguna (ambas reactivas)", value: 0 },
            { label: "Una", value: 1 },
            { label: "Ambas", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const gcsp = v.gcs - (v.pupilas ?? 0);
        const mort = gcsp <= 2 ? "\u2248 74 %" : gcsp <= 4 ? "\u2248 40\u201350 %" : gcsp <= 8 ? "\u2248 20\u201330 %" : "< 15 %";
        return {
          main: String(gcsp),
          mainUnit: "puntos (1\u201315)",
          secondary: mort,
          secondaryLabel: "mortalidad orientativa a 6 meses",
          interpretation: gcsp <= 4 ? "Puntuaci\xF3n muy baja: pron\xF3stico desfavorable. La escala ampl\xEDa el rango inferior de la GCS al restar la falta de reactividad pupilar." : gcsp <= 8 ? "Da\xF1o cerebral grave: monitorizaci\xF3n neurocr\xEDtica." : "Rango de mejor pron\xF3stico.",
          level: gcsp <= 4 ? "danger" : gcsp <= 8 ? "warn" : "ok",
          details: ["GCS-P = GCS total \u2212 puntuaci\xF3n de reactividad pupilar (0, 1 o 2)."]
        };
      },
      references: [
        "Brennan PM, Murray GD, Teasdale GM. Simplifying the use of prognostic information in traumatic brain injury. Part 1: The GCS-Pupils score. J Neurosurg. 2018;128(6):1612-20."
      ]
    },
    {
      id: "four",
      name: "Puntuaci\xF3n FOUR (Full Outline of UnResponsiveness)",
      shortName: "FOUR",
      description: "Grad\xFAa la profundidad del coma; aplicable a pacientes intubados, donde la escala de Glasgow pierde el componente verbal.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "ocular",
          type: "select",
          label: "Respuesta ocular",
          dropdown: true,
          options: escala([
            [4, "Ojos abiertos, sigue con la mirada o parpadea a la orden"],
            [3, "Ojos abiertos pero no sigue con la mirada"],
            [2, "Ojos cerrados; los abre con voz fuerte"],
            [1, "Ojos cerrados; los abre con el dolor"],
            [0, "Ojos permanecen cerrados con el dolor"]
          ]),
          default: 4
        },
        {
          id: "motora",
          type: "select",
          label: "Respuesta motora",
          dropdown: true,
          options: escala([
            [4, "Hace el signo de victoria, el pu\xF1o o el pulgar a la orden"],
            [3, "Localiza el dolor"],
            [2, "Respuesta en flexi\xF3n al dolor"],
            [1, "Respuesta en extensi\xF3n al dolor"],
            [0, "Sin respuesta al dolor o estado miocl\xF3nico generalizado"]
          ]),
          default: 4
        },
        {
          id: "tronco",
          type: "select",
          label: "Reflejos del tronco encef\xE1lico",
          dropdown: true,
          options: escala([
            [4, "Reflejos pupilar y corneal presentes"],
            [3, "Una pupila midri\xE1tica y fija"],
            [2, "Reflejo pupilar o corneal ausente"],
            [1, "Reflejos pupilar y corneal ausentes"],
            [0, "Reflejos pupilar, corneal y tus\xEDgeno ausentes"]
          ]),
          default: 4
        },
        {
          id: "respiracion",
          type: "select",
          label: "Patr\xF3n respiratorio",
          dropdown: true,
          options: escala([
            [4, "No intubado, patr\xF3n respiratorio regular"],
            [3, "No intubado, respiraci\xF3n de Cheyne-Stokes"],
            [2, "No intubado, respiraci\xF3n irregular"],
            [1, "Respira por encima de la frecuencia del ventilador"],
            [0, "Respira a la frecuencia del ventilador o apnea"]
          ]),
          default: 4
        }
      ],
      compute: (v) => {
        const score = sum(v, ["ocular", "motora", "tronco", "respiracion"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201316)",
          secondary: `O${v.ocular} M${v.motora} T${v.tronco} R${v.respiracion}`,
          secondaryLabel: "desglose",
          interpretation: score === 0 ? "Puntuaci\xF3n 0: ausencia completa de respuesta y de reflejos de tronco; valorar protocolo de muerte encef\xE1lica." : score <= 4 ? "Coma muy profundo: pron\xF3stico desfavorable." : score <= 11 ? "Alteraci\xF3n importante del nivel de conciencia: monitorizaci\xF3n neurocr\xEDtica." : "Alteraci\xF3n leve-moderada del nivel de conciencia.",
          level: score <= 4 ? "danger" : score <= 11 ? "warn" : "ok"
        };
      },
      notes: [
        "Ventaja sobre la GCS: valora reflejos de tronco y patr\xF3n respiratorio, y es aplicable a pacientes intubados.",
        "Detecta el s\xEDndrome de cautiverio (locked-in) y los estados vegetativos que la GCS no distingue."
      ],
      references: [
        "Wijdicks EF, et al. Validation of a new coma scale: the FOUR score. Ann Neurol. 2005;58(4):585-93."
      ]
    },
    {
      id: "nihss",
      name: "Escala de ictus del NIH (NIHSS)",
      shortName: "NIHSS",
      description: "Cuantifica la gravedad del ictus y permite monitorizar los cambios neurol\xF3gicos en el tiempo.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "i1a",
          type: "select",
          label: "1a. Nivel de conciencia",
          dropdown: true,
          options: escala([
            [0, "Alerta, respuestas normales"],
            [1, "Somnoliento, despierta con est\xEDmulo m\xEDnimo"],
            [2, "Estuporoso, requiere est\xEDmulo repetido o doloroso"],
            [3, "Coma, solo respuestas reflejas o ninguna"]
          ])
        },
        {
          id: "i1b",
          type: "select",
          label: "1b. Preguntas (mes actual y edad)",
          dropdown: true,
          options: escala([
            [0, "Responde correctamente a ambas"],
            [1, "Responde correctamente a una"],
            [2, "No responde correctamente a ninguna"]
          ])
        },
        {
          id: "i1c",
          type: "select",
          label: "1c. \xD3rdenes (abrir/cerrar los ojos, abrir/cerrar la mano)",
          dropdown: true,
          options: escala([
            [0, "Realiza ambas correctamente"],
            [1, "Realiza una correctamente"],
            [2, "No realiza ninguna"]
          ])
        },
        {
          id: "i2",
          type: "select",
          label: "2. Mirada conjugada",
          dropdown: true,
          options: escala([
            [0, "Normal"],
            [1, "Paresia parcial de la mirada"],
            [2, "Desviaci\xF3n forzada o paresia total"]
          ])
        },
        {
          id: "i3",
          type: "select",
          label: "3. Campos visuales",
          dropdown: true,
          options: escala([
            [0, "Sin defectos"],
            [1, "Hemianopsia parcial"],
            [2, "Hemianopsia completa"],
            [3, "Hemianopsia bilateral o ceguera cortical"]
          ])
        },
        {
          id: "i4",
          type: "select",
          label: "4. Paresia facial",
          dropdown: true,
          options: escala([
            [0, "Movimientos normales y sim\xE9tricos"],
            [1, "Paresia leve (asimetr\xEDa al sonre\xEDr)"],
            [2, "Par\xE1lisis parcial (facial inferior)"],
            [3, "Par\xE1lisis completa (superior e inferior)"]
          ])
        },
        {
          id: "i5a",
          type: "select",
          label: "5a. Motor \u2014 brazo izquierdo",
          dropdown: true,
          options: escala([
            [0, "Mantiene la posici\xF3n 10 s sin claudicar"],
            [1, "Claudica antes de 10 s, sin llegar a tocar la cama"],
            [2, "Esfuerzo contra gravedad, cae a la cama"],
            [3, "Movimiento sin vencer la gravedad"],
            [4, "Ausencia de movimiento"]
          ])
        },
        {
          id: "i5b",
          type: "select",
          label: "5b. Motor \u2014 brazo derecho",
          dropdown: true,
          options: escala([
            [0, "Mantiene la posici\xF3n 10 s sin claudicar"],
            [1, "Claudica antes de 10 s, sin llegar a tocar la cama"],
            [2, "Esfuerzo contra gravedad, cae a la cama"],
            [3, "Movimiento sin vencer la gravedad"],
            [4, "Ausencia de movimiento"]
          ])
        },
        {
          id: "i6a",
          type: "select",
          label: "6a. Motor \u2014 pierna izquierda",
          dropdown: true,
          options: escala([
            [0, "Mantiene la posici\xF3n 5 s sin claudicar"],
            [1, "Claudica antes de 5 s, sin llegar a tocar la cama"],
            [2, "Esfuerzo contra gravedad, cae a la cama"],
            [3, "Movimiento sin vencer la gravedad"],
            [4, "Ausencia de movimiento"]
          ])
        },
        {
          id: "i6b",
          type: "select",
          label: "6b. Motor \u2014 pierna derecha",
          dropdown: true,
          options: escala([
            [0, "Mantiene la posici\xF3n 5 s sin claudicar"],
            [1, "Claudica antes de 5 s, sin llegar a tocar la cama"],
            [2, "Esfuerzo contra gravedad, cae a la cama"],
            [3, "Movimiento sin vencer la gravedad"],
            [4, "Ausencia de movimiento"]
          ])
        },
        {
          id: "i7",
          type: "select",
          label: "7. Ataxia de las extremidades",
          dropdown: true,
          options: escala([
            [0, "Ausente"],
            [1, "Presente en una extremidad"],
            [2, "Presente en dos o m\xE1s extremidades"]
          ])
        },
        {
          id: "i8",
          type: "select",
          label: "8. Sensibilidad",
          dropdown: true,
          options: escala([
            [0, "Normal"],
            [1, "Hipoestesia leve-moderada"],
            [2, "Anestesia grave o total"]
          ])
        },
        {
          id: "i9",
          type: "select",
          label: "9. Lenguaje",
          dropdown: true,
          options: escala([
            [0, "Normal"],
            [1, "Afasia leve-moderada"],
            [2, "Afasia grave"],
            [3, "Mutismo o afasia global"]
          ])
        },
        {
          id: "i10",
          type: "select",
          label: "10. Disartria",
          dropdown: true,
          options: escala([
            [0, "Articulaci\xF3n normal"],
            [1, "Disartria leve-moderada"],
            [2, "Disartria grave, ininteligible o anartria"]
          ])
        },
        {
          id: "i11",
          type: "select",
          label: "11. Extinci\xF3n / inatenci\xF3n",
          dropdown: true,
          options: escala([
            [0, "Sin alteraciones"],
            [1, "Inatenci\xF3n en una modalidad sensorial"],
            [2, "Hemi-inatenci\xF3n grave o en m\xE1s de una modalidad"]
          ])
        }
      ],
      compute: (v) => {
        const ids = ["i1a", "i1b", "i1c", "i2", "i3", "i4", "i5a", "i5b", "i6a", "i6b", "i7", "i8", "i9", "i10", "i11"];
        const score = sum(v, ids);
        const banda = score === 0 ? "Sin d\xE9ficit medible" : score <= 4 ? "Ictus leve" : score <= 15 ? "Ictus moderado" : score <= 20 ? "Ictus moderado-grave" : "Ictus grave";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201342)",
          interpretation: `${banda}. A mayor puntuaci\xF3n, mayor volumen de lesi\xF3n y peor pron\xF3stico funcional. Una NIHSS \u2265 6 con cl\xEDnica compatible sugiere oclusi\xF3n de gran vaso: valorar trombectom\xEDa adem\xE1s de la tromb\xF3lisis.`,
          level: score === 0 ? "ok" : score <= 4 ? "info" : score <= 15 ? "warn" : "danger"
        };
      },
      notes: [
        "Puntuar lo que el paciente hace, no lo que se cree que puede hacer; no ayudar ni repetir instrucciones m\xE1s de lo indicado.",
        "Realizar los \xEDtems en orden y no volver atr\xE1s para modificar puntuaciones.",
        "En la circulaci\xF3n posterior la NIHSS infraestima la gravedad."
      ],
      references: [
        "Brott T, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864-70."
      ]
    },
    {
      id: "rankin",
      name: "Escala de Rankin modificada (mRS)",
      shortName: "Rankin",
      description: "Mide el grado de discapacidad o dependencia tras un ictus u otra causa de da\xF1o neurol\xF3gico.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "Grado de discapacidad",
          dropdown: true,
          noPoints: true,
          options: escala([
            [0, "Sin s\xEDntomas"],
            [1, "Sin discapacidad significativa: realiza sus actividades habituales pese a alg\xFAn s\xEDntoma"],
            [2, "Discapacidad leve: no puede hacer todo lo que hac\xEDa antes, pero se vale por s\xED mismo"],
            [3, "Discapacidad moderada: requiere alguna ayuda, pero camina sin asistencia"],
            [4, "Discapacidad moderada-grave: no camina ni atiende sus necesidades sin ayuda"],
            [5, "Discapacidad grave: encamado, incontinente, requiere cuidados constantes"],
            [6, "Fallecido"]
          ])
        }
      ],
      compute: (v) => {
        const g = v.grado ?? 0;
        return {
          main: `mRS ${g}`,
          interpretation: g <= 2 ? "mRS 0\u20132: independencia funcional; es el resultado favorable habitual en los ensayos de tromb\xF3lisis y trombectom\xEDa." : g <= 5 ? "mRS 3\u20135: dependencia funcional en grado creciente; planificar rehabilitaci\xF3n y apoyo sociosanitario." : "Fallecimiento.",
          level: g <= 2 ? "ok" : g <= 4 ? "warn" : "danger"
        };
      },
      references: [
        "van Swieten JC, et al. Interobserver agreement for the assessment of handicap in stroke patients. Stroke. 1988;19(5):604-7."
      ]
    },
    {
      id: "abc2-volumen",
      name: "F\xF3rmula ABC/2 para el volumen de la hemorragia intracerebral",
      shortName: "ABC/2",
      description: "Estima el volumen del hematoma intracraneal a partir de la tomograf\xEDa computarizada.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        { id: "a", type: "number", label: "A \u2014 di\xE1metro mayor del hematoma", unit: "cm", min: 0.1, max: 30, step: 0.1 },
        { id: "b", type: "number", label: "B \u2014 di\xE1metro perpendicular al anterior", unit: "cm", min: 0.1, max: 30, step: 0.1 },
        { id: "cortes", type: "number", label: "N\xFAmero de cortes con hemorragia", unit: "cortes", min: 1, max: 100, step: 1 },
        { id: "grosor", type: "number", label: "Grosor de corte", unit: "cm", min: 0.1, max: 2, step: 0.1 }
      ],
      compute: (v) => {
        const c = v.cortes * v.grosor;
        const vol = v.a * v.b * c / 2;
        return {
          main: fmt(vol, 1),
          mainUnit: "cm\xB3 (mL)",
          interpretation: vol >= 30 ? "Volumen \u2265 30 cm\xB3: se asocia a peor pron\xF3stico y punt\xFAa en la escala ICH; valoraci\xF3n neuroquir\xFArgica." : "Volumen < 30 cm\xB3.",
          level: vol >= 30 ? "danger" : "warn",
          details: [
            `C (extensi\xF3n craneocaudal) = ${fmt(c, 1)} cm.`,
            "Volumen = A \xD7 B \xD7 C / 2 (aproximaci\xF3n elipsoidal)."
          ]
        };
      },
      notes: [
        "Para contar los cortes, se toman como completos los que tienen \u2265 75 % del \xE1rea del corte mayor y como medios los que tienen entre el 25 y el 75 %.",
        "La f\xF3rmula sobrestima el volumen en hematomas de forma irregular o lobares."
      ],
      references: [
        "Kothari RU, et al. The ABCs of measuring intracerebral hemorrhage volumes. Stroke. 1996;27(8):1304-5."
      ]
    },
    {
      id: "ich-score",
      name: "Puntuaci\xF3n ICH de hemorragia intracerebral",
      shortName: "ICH",
      description: "Estima la mortalidad a 30 d\xEDas en la hemorragia intracerebral espont\xE1nea.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "gcs",
          type: "select",
          label: "Escala de coma de Glasgow",
          options: [
            { label: "13\u201315", value: 0 },
            { label: "5\u201312", value: 1 },
            { label: "3\u20134", value: 2 }
          ]
        },
        { id: "volumen", type: "boolean", label: "Volumen del hematoma \u2265 30 cm\xB3" },
        { id: "intraventricular", type: "boolean", label: "Hemorragia intraventricular" },
        { id: "infratentorial", type: "boolean", label: "Origen infratentorial" },
        { id: "edad", type: "boolean", label: "Edad \u2265 80 a\xF1os" }
      ],
      compute: (v) => {
        const score = sum(v, ["gcs", "volumen", "intraventricular", "infratentorial", "edad"]);
        const mort = ["0 %", "13 %", "26 %", "72 %", "97 %", "100 %", "100 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20136)",
          secondary: mort,
          secondaryLabel: "mortalidad a 30 d\xEDas (cohorte original)",
          interpretation: score <= 1 ? "Riesgo bajo de mortalidad a 30 d\xEDas." : score === 2 ? "Riesgo intermedio." : "Riesgo alto de mortalidad. Evitar decisiones de limitaci\xF3n del esfuerzo terap\xE9utico basadas solo en esta escala en las primeras 24\u201348 h: constituyen una profec\xEDa autocumplida.",
          level: score <= 1 ? "warn" : "danger"
        };
      },
      notes: [
        "La cohorte de derivaci\xF3n fue peque\xF1a; las cifras son orientativas.",
        "Las gu\xEDas desaconsejan usar escalas pron\xF3sticas para limitar tratamientos de forma precoz."
      ],
      references: [
        "Hemphill JC 3rd, et al. The ICH score: a simple, reliable grading scale for intracerebral hemorrhage. Stroke. 2001;32(4):891-7."
      ]
    },
    {
      id: "hunt-hess",
      name: "Clasificaci\xF3n de Hunt y Hess de la hemorragia subaracnoidea",
      shortName: "Hunt-Hess",
      description: "Grad\xFAa la gravedad cl\xEDnica de la hemorragia subaracnoidea aneurism\xE1tica.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "Grado cl\xEDnico",
          dropdown: true,
          noPoints: true,
          options: escala([
            [1, "Asintom\xE1tico o cefalea leve y ligera rigidez de nuca"],
            [2, "Cefalea moderada-intensa, rigidez de nuca, sin d\xE9ficit salvo par\xE1lisis de pares craneales"],
            [3, "Somnolencia, confusi\xF3n o d\xE9ficit focal leve"],
            [4, "Estupor, hemiparesia moderada-grave, rigidez de descerebraci\xF3n precoz"],
            [5, "Coma profundo, rigidez de descerebraci\xF3n, aspecto moribundo"]
          ])
        }
      ],
      compute: (v) => {
        const g = v.grado ?? 1;
        const superv = ["", "\u2248 70 %", "\u2248 60 %", "\u2248 50 %", "\u2248 20 %", "\u2248 10 %"][g];
        return {
          main: `Grado ${["", "I", "II", "III", "IV", "V"][g]}`,
          secondary: superv,
          secondaryLabel: "supervivencia orientativa",
          interpretation: g <= 2 ? "Buen grado cl\xEDnico: candidato a tratamiento precoz del aneurisma con buen pron\xF3stico esperado." : g === 3 ? "Grado intermedio: tratamiento precoz e ingreso en unidad neurocr\xEDtica." : "Mal grado cl\xEDnico: alta mortalidad; manejo neurocr\xEDtico intensivo y valoraci\xF3n individualizada.",
          level: g <= 2 ? "ok" : g === 3 ? "warn" : "danger"
        };
      },
      notes: ["Sumar un grado si existe enfermedad sist\xE9mica grave (HTA, diabetes, arteriosclerosis, EPOC) o vasoespasmo grave en la arteriograf\xEDa."],
      references: [
        "Hunt WE, Hess RM. Surgical risk as related to time of intervention in the repair of intracranial aneurysms. J Neurosurg. 1968;28(1):14-20."
      ]
    },
    {
      id: "abcd2",
      name: "Puntuaci\xF3n ABCD\xB2 para el accidente isqu\xE9mico transitorio",
      shortName: "ABCD\xB2",
      description: "Estima el riesgo de ictus tras un accidente isqu\xE9mico transitorio.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad \u2265 60 a\xF1os (A)" },
        { id: "pa", type: "boolean", label: "Presi\xF3n arterial \u2265 140/90 mmHg (B)" },
        {
          id: "clinica",
          type: "select",
          label: "Caracter\xEDsticas cl\xEDnicas (C)",
          options: [
            { label: "Otros s\xEDntomas", value: 0 },
            { label: "Alteraci\xF3n del habla sin debilidad", value: 1 },
            { label: "Debilidad unilateral", value: 2 }
          ]
        },
        {
          id: "duracion",
          type: "select",
          label: "Duraci\xF3n de los s\xEDntomas (D)",
          options: [
            { label: "< 10 min", value: 0 },
            { label: "10\u201359 min", value: 1 },
            { label: "\u2265 60 min", value: 2 }
          ]
        },
        { id: "diabetes", type: "boolean", label: "Diabetes mellitus (D)" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "pa", "clinica", "duracion", "diabetes"]);
        const r2 = score <= 3 ? "1,0 %" : score <= 5 ? "4,1 %" : "8,1 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u20137)",
          secondary: r2,
          secondaryLabel: "riesgo de ictus a 2 d\xEDas",
          interpretation: score <= 3 ? "Riesgo bajo. Aun as\xED, las gu\xEDas actuales recomiendan estudio urgente de todo AIT (imagen vascular y cerebral, ECG) sin apoyarse solo en esta escala." : score <= 5 ? "Riesgo moderado: estudio urgente e inicio precoz de prevenci\xF3n secundaria." : "Riesgo alto: valoraci\xF3n e ingreso urgentes.",
          level: score <= 3 ? "warn" : score <= 5 ? "warn" : "danger"
        };
      },
      notes: [
        "La escala no debe usarse aisladamente para decidir el alta: no identifica de forma fiable causas tratables como la estenosis carot\xEDdea o la fibrilaci\xF3n auricular."
      ],
      references: [
        "Johnston SC, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet. 2007;369(9558):283-92."
      ]
    },
    {
      id: "2helps2b",
      name: "Puntuaci\xF3n 2HELPS2B de riesgo de crisis en el EEG continuo",
      shortName: "2HELPS2B",
      description: "Estima el riesgo de crisis epil\xE9pticas en pacientes cr\xEDticos monitorizados con electroencefalograma continuo.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "frecuencia",
          type: "boolean",
          label: "Patr\xF3n peri\xF3dico o r\xEDtmico con frecuencia > 2 Hz"
        },
        { id: "esporadicas", type: "boolean", label: "Descargas epileptiformes espor\xE1dicas" },
        {
          id: "patrones",
          type: "boolean",
          label: "Descargas peri\xF3dicas lateralizadas (LPD), actividad delta r\xEDtmica lateralizada (LRDA) o descargas peri\xF3dicas bilaterales independientes (BIPD)"
        },
        {
          id: "plus",
          type: "boolean",
          label: "Caracter\xEDsticas \xABplus\xBB",
          description: "Actividad r\xE1pida, r\xEDtmica o aguda superpuesta al patr\xF3n."
        },
        { id: "crisis", type: "boolean", label: "Crisis epil\xE9ptica previa (cl\xEDnica o electrogr\xE1fica)" },
        {
          id: "birds",
          type: "boolean",
          label: "BIRDs (descargas r\xEDtmicas breves potencialmente ictales)",
          points: 2
        }
      ],
      compute: (v) => {
        const score = sum(v, ["frecuencia", "esporadicas", "patrones", "plus", "crisis", "birds"]);
        const riesgo2 = ["5 %", "12 %", "27 %", "50 %", "73 %", "> 80 %", "> 80 %", "> 80 %"][Math.min(score, 7)];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20137)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de crisis",
          interpretation: score === 0 ? "Riesgo bajo (\u2248 5 %): puede bastar con 1 hora de EEG si no hay otros motivos de sospecha." : score === 1 ? "Riesgo intermedio: se recomienda al menos 12\u201324 h de monitorizaci\xF3n." : "Riesgo alto (\u2265 2 puntos): se recomienda monitorizaci\xF3n con EEG continuo durante al menos 24\u201348 h.",
          level: score === 0 ? "ok" : score === 1 ? "warn" : "danger"
        };
      },
      references: [
        "Struck AF, et al. Association of an electroencephalography-based risk score with seizure probability in hospitalized patients. JAMA Neurol. 2017;74(12):1419-24."
      ]
    },
    {
      id: "cam-icu",
      name: "M\xE9todo de evaluaci\xF3n de la confusi\xF3n en la UCI (CAM-ICU)",
      shortName: "CAM-ICU",
      description: "Detecta el delirio en pacientes cr\xEDticos, incluidos los que est\xE1n intubados.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "rass",
          type: "select",
          label: "Nivel de sedaci\xF3n (RASS)",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "RASS \u22125 o \u22124 (no despierta): no evaluable, reevaluar m\xE1s tarde", value: 0 },
            { label: "RASS \u22123 a +4 (despierta a la voz): puede evaluarse", value: 1 }
          ],
          default: 1
        },
        {
          id: "agudo",
          type: "boolean",
          label: "1. Inicio agudo o curso fluctuante",
          description: "\xBFHay un cambio agudo respecto al estado mental basal, o el estado mental ha fluctuado en las \xFAltimas 24 h?",
          noPoints: true
        },
        {
          id: "inatencion",
          type: "boolean",
          label: "2. Inatenci\xF3n",
          description: "Menos de 8 aciertos de 10 en la prueba de letras (apretar la mano con la letra \xABA\xBB) o de im\xE1genes.",
          noPoints: true
        },
        {
          id: "conciencia",
          type: "boolean",
          label: "3. Nivel de conciencia alterado",
          description: "RASS distinto de 0 en el momento de la evaluaci\xF3n.",
          noPoints: true
        },
        {
          id: "pensamiento",
          type: "boolean",
          label: "4. Pensamiento desorganizado",
          description: "Errores en las preguntas l\xF3gicas o incapacidad para seguir la orden de mostrar dedos.",
          noPoints: true
        }
      ],
      compute: (v) => {
        if (v.rass === 0)
          return {
            main: "No evaluable",
            interpretation: "Con RASS \u22124 o \u22125 el paciente est\xE1 demasiado sedado para valorar el delirio: reevaluar cuando el nivel de sedaci\xF3n mejore.",
            level: "info"
          };
        const positivo = v.agudo === 1 && v.inatencion === 1 && (v.conciencia === 1 || v.pensamiento === 1);
        return {
          main: positivo ? "CAM-ICU positivo" : "CAM-ICU negativo",
          interpretation: positivo ? "Delirio presente: buscar y corregir causas (dolor, f\xE1rmacos, infecci\xF3n, hipoxia, abstinencia, retenci\xF3n urinaria), favorecer la movilizaci\xF3n precoz, el sue\xF1o y la reorientaci\xF3n, y reservar los antipsic\xF3ticos para la agitaci\xF3n con riesgo." : "Sin delirio en este momento. Reevaluar al menos una vez por turno.",
          level: positivo ? "danger" : "ok",
          details: [
            "Se requieren los criterios 1 y 2, m\xE1s el 3 o el 4."
          ]
        };
      },
      references: [
        "Ely EW, et al. Delirium in mechanically ventilated patients: validity and reliability of the confusion assessment method for the intensive care unit (CAM-ICU). JAMA. 2001;286(21):2703-10."
      ]
    },
    {
      id: "cpot",
      name: "Herramienta de observaci\xF3n del dolor en cuidados intensivos (CPOT)",
      shortName: "CPOT",
      description: "Eval\xFAa el dolor del paciente cr\xEDtico que no puede comunicarlo, mediante observaci\xF3n.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "facial",
          type: "select",
          label: "Expresi\xF3n facial",
          dropdown: true,
          options: escala([
            [0, "Relajada, neutra"],
            [1, "Tensa (ce\xF1o fruncido, cejas bajas, contracci\xF3n periorbitaria)"],
            [2, "Muecas de dolor (adem\xE1s, p\xE1rpados fuertemente cerrados)"]
          ])
        },
        {
          id: "movimientos",
          type: "select",
          label: "Movimientos corporales",
          dropdown: true,
          options: escala([
            [0, "Ausencia de movimientos o posici\xF3n normal"],
            [1, "Protecci\xF3n (movimientos lentos y cautelosos, se toca la zona dolorosa)"],
            [2, "Inquietud (intenta sentarse, mueve las extremidades, no obedece \xF3rdenes, intenta retirar dispositivos)"]
          ])
        },
        {
          id: "muscular",
          type: "select",
          label: "Tensi\xF3n muscular (flexi\xF3n-extensi\xF3n pasiva del brazo)",
          dropdown: true,
          options: escala([
            [0, "Relajado, sin resistencia"],
            [1, "Tenso, r\xEDgido; resistencia a los movimientos pasivos"],
            [2, "Muy tenso o r\xEDgido; imposible completar los movimientos pasivos"]
          ])
        },
        {
          id: "ventilador",
          type: "select",
          label: "Adaptaci\xF3n al ventilador (intubados) o vocalizaci\xF3n (extubados)",
          dropdown: true,
          options: escala([
            [0, "Tolera el ventilador / habla en tono normal o est\xE1 en silencio"],
            [1, "Tose pero tolera / suspira, gime"],
            [2, "Lucha contra el ventilador / llora, grita"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["facial", "movimientos", "muscular", "ventilador"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20138)",
          interpretation: score > 2 ? "CPOT > 2: dolor significativo. Administrar analgesia y reevaluar tras la intervenci\xF3n." : "CPOT \u2264 2: dolor m\xEDnimo o ausente. Continuar la vigilancia y reevaluar tras los procedimientos.",
          level: score > 2 ? "danger" : "ok"
        };
      },
      notes: ["Evaluar en reposo y durante los procedimientos dolorosos (movilizaci\xF3n, aspiraci\xF3n, curas)."],
      references: [
        "G\xE9linas C, et al. Validation of the critical-care pain observation tool in adult patients. Am J Crit Care. 2006;15(4):420-7."
      ]
    }
  ];

  // src/calculators/uci-gravedad.ts
  var CAT15 = "Gravedad en UCI y sepsis";
  var UCI2 = ["Medicina Intensiva"];
  var escala2 = (items) => items.map(([value, label]) => ({ label: `${value} \u2014 ${label}`, value }));
  var uciGravedad = [
    {
      id: "qsofa",
      name: "Puntuaci\xF3n qSOFA (SOFA r\xE1pido) para la sepsis",
      shortName: "qSOFA",
      description: "Identifica, fuera de la UCI, a los pacientes con sospecha de infecci\xF3n y mayor riesgo de mala evoluci\xF3n.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        { id: "fr", type: "boolean", label: "Frecuencia respiratoria \u2265 22 rpm" },
        { id: "mental", type: "boolean", label: "Alteraci\xF3n del estado mental (Glasgow < 15)" },
        { id: "pas", type: "boolean", label: "Presi\xF3n arterial sist\xF3lica \u2264 100 mmHg" }
      ],
      compute: (v) => {
        const score = sum(v, ["fr", "mental", "pas"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20133)",
          interpretation: score >= 2 ? "qSOFA \u2265 2: mayor riesgo de mortalidad y estancia prolongada. Investigar disfunci\xF3n org\xE1nica, iniciar tratamiento precoz y valorar el nivel de cuidados." : "qSOFA < 2: no descarta la sepsis. Si la sospecha cl\xEDnica persiste, continuar la evaluaci\xF3n y reevaluar con frecuencia.",
          level: score >= 2 ? "danger" : "warn"
        };
      },
      notes: [
        "La campa\xF1a Sobrevivir a la Sepsis 2021 desaconseja usar el qSOFA como herramienta \xFAnica de cribado por su baja sensibilidad; se prefieren sistemas como NEWS o los criterios de SIRS para el cribado inicial.",
        "Un qSOFA positivo debe motivar la b\xFAsqueda activa de disfunci\xF3n org\xE1nica (SOFA completo, lactato)."
      ],
      references: [
        "Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-10.",
        "Evans L, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Crit Care Med. 2021;49(11):e1063-e1143."
      ]
    },
    {
      id: "msofa",
      name: "Puntuaci\xF3n SOFA modificada (mSOFA)",
      shortName: "mSOFA",
      description: "Predice la mortalidad en la UCI usando principalmente variables cl\xEDnicas y menos pruebas de laboratorio que la SOFA original.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "resp",
          type: "select",
          label: "Respiratorio \u2014 SpO\u2082/FiO\u2082",
          dropdown: true,
          options: [
            { label: "> 400", value: 0 },
            { label: "316\u2013400", value: 1 },
            { label: "235\u2013315", value: 2 },
            { label: "150\u2013234 con soporte respiratorio", value: 3 },
            { label: "< 150 con soporte respiratorio", value: 4 }
          ]
        },
        {
          id: "hepatico",
          type: "select",
          label: "H\xEDgado \u2014 ictericia cl\xEDnica",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Presente", value: 3 }
          ]
        },
        {
          id: "cardio",
          type: "select",
          label: "Cardiovascular",
          dropdown: true,
          options: [
            { label: "PAM \u2265 70 mmHg sin vasoactivos", value: 0 },
            { label: "PAM < 70 mmHg sin vasoactivos", value: 1 },
            { label: "Dopamina \u2264 5 \xB5g/kg/min o dobutamina (cualquier dosis)", value: 2 },
            { label: "Dopamina > 5, o adrenalina/noradrenalina \u2264 0,1 \xB5g/kg/min", value: 3 },
            { label: "Dopamina > 15, o adrenalina/noradrenalina > 0,1 \xB5g/kg/min", value: 4 }
          ]
        },
        {
          id: "snc",
          type: "select",
          label: "Neurol\xF3gico \u2014 escala de coma de Glasgow",
          dropdown: true,
          options: [
            { label: "15", value: 0 },
            { label: "13\u201314", value: 1 },
            { label: "10\u201312", value: 2 },
            { label: "6\u20139", value: 3 },
            { label: "< 6", value: 4 }
          ]
        },
        {
          id: "renal",
          type: "select",
          label: "Renal \u2014 creatinina (mg/dL)",
          dropdown: true,
          options: [
            { label: "< 1,2", value: 0 },
            { label: "1,2\u20131,9", value: 1 },
            { label: "2,0\u20133,4", value: 2 },
            { label: "3,5\u20134,9", value: 3 },
            { label: "\u2265 5,0", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["resp", "hepatico", "cardio", "snc", "renal"]);
        const mort = score <= 7 ? "\u2248 4 %" : score <= 11 ? "\u2248 31 %" : "\u2248 68 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201320)",
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria orientativa",
          interpretation: score <= 7 ? "Disfunci\xF3n org\xE1nica leve." : score <= 11 ? "Disfunci\xF3n org\xE1nica moderada: vigilancia intensiva." : "Disfunci\xF3n org\xE1nica grave con mortalidad elevada.",
          level: score <= 7 ? "ok" : score <= 11 ? "warn" : "danger"
        };
      },
      notes: [
        "Sustituye la PaO\u2082 por la SpO\u2082, la bilirrubina por la ictericia cl\xEDnica y prescinde de las plaquetas: pensada para entornos con recursos limitados o situaciones de cat\xE1strofe."
      ],
      references: [
        "Grissom CK, et al. A modified sequential organ failure assessment score for critical care triage. Disaster Med Public Health Prep. 2010;4(4):277-84."
      ]
    },
    {
      id: "apache2",
      name: "Puntuaci\xF3n APACHE II",
      shortName: "APACHE II",
      description: "Estima la mortalidad hospitalaria del paciente cr\xEDtico a partir de las peores variables de las primeras 24 horas de ingreso en la UCI.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "temp",
          type: "select",
          label: "Temperatura rectal (\xB0C)",
          dropdown: true,
          options: [
            { label: "\u2265 41 o \u2264 29,9", value: 4 },
            { label: "39\u201340,9 o 30\u201331,9", value: 3 },
            { label: "32\u201333,9", value: 2 },
            { label: "38,5\u201338,9 o 34\u201335,9", value: 1 },
            { label: "36\u201338,4", value: 0 }
          ],
          default: 0
        },
        {
          id: "pam",
          type: "select",
          label: "Presi\xF3n arterial media (mmHg)",
          dropdown: true,
          options: [
            { label: "\u2265 160 o \u2264 49", value: 4 },
            { label: "130\u2013159", value: 3 },
            { label: "110\u2013129 o 50\u201369", value: 2 },
            { label: "70\u2013109", value: 0 }
          ],
          default: 0
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia card\xEDaca (lpm)",
          dropdown: true,
          options: [
            { label: "\u2265 180 o \u2264 39", value: 4 },
            { label: "140\u2013179 o 40\u201354", value: 3 },
            { label: "110\u2013139 o 55\u201369", value: 2 },
            { label: "70\u2013109", value: 0 }
          ],
          default: 0
        },
        {
          id: "fr",
          type: "select",
          label: "Frecuencia respiratoria (rpm)",
          dropdown: true,
          options: [
            { label: "\u2265 50 o \u2264 5", value: 4 },
            { label: "35\u201349", value: 3 },
            { label: "6\u20139", value: 2 },
            { label: "25\u201334 o 10\u201311", value: 1 },
            { label: "12\u201324", value: 0 }
          ],
          default: 0
        },
        {
          id: "oxigenacion",
          type: "select",
          label: "Oxigenaci\xF3n",
          description: "Con FiO\u2082 \u2265 0,5 usar el gradiente alveolo-arterial; con FiO\u2082 < 0,5 usar la PaO\u2082.",
          dropdown: true,
          options: [
            { label: "A-a \u2265 500 (FiO\u2082 \u2265 0,5)", value: 4 },
            { label: "A-a 350\u2013499 (FiO\u2082 \u2265 0,5)", value: 3 },
            { label: "A-a 200\u2013349 (FiO\u2082 \u2265 0,5)", value: 2 },
            { label: "A-a < 200 (FiO\u2082 \u2265 0,5) o PaO\u2082 > 70 (FiO\u2082 < 0,5)", value: 0 },
            { label: "PaO\u2082 61\u201370 (FiO\u2082 < 0,5)", value: 1 },
            { label: "PaO\u2082 55\u201360 (FiO\u2082 < 0,5)", value: 3 },
            { label: "PaO\u2082 < 55 (FiO\u2082 < 0,5)", value: 4 }
          ],
          default: 0
        },
        {
          id: "ph",
          type: "select",
          label: "pH arterial",
          dropdown: true,
          options: [
            { label: "\u2265 7,7 o < 7,15", value: 4 },
            { label: "7,6\u20137,69 o 7,15\u20137,24", value: 3 },
            { label: "7,25\u20137,32", value: 2 },
            { label: "7,5\u20137,59", value: 1 },
            { label: "7,33\u20137,49", value: 0 }
          ],
          default: 0
        },
        {
          id: "sodio",
          type: "select",
          label: "Sodio s\xE9rico (mEq/L)",
          dropdown: true,
          options: [
            { label: "\u2265 180 o \u2264 110", value: 4 },
            { label: "160\u2013179 o 111\u2013119", value: 3 },
            { label: "155\u2013159 o 120\u2013129", value: 2 },
            { label: "150\u2013154", value: 1 },
            { label: "130\u2013149", value: 0 }
          ],
          default: 0
        },
        {
          id: "potasio",
          type: "select",
          label: "Potasio s\xE9rico (mEq/L)",
          dropdown: true,
          options: [
            { label: "\u2265 7 o < 2,5", value: 4 },
            { label: "6\u20136,9", value: 3 },
            { label: "2,5\u20132,9", value: 2 },
            { label: "5,5\u20135,9 o 3\u20133,4", value: 1 },
            { label: "3,5\u20135,4", value: 0 }
          ],
          default: 0
        },
        {
          id: "creatinina",
          type: "select",
          label: "Creatinina s\xE9rica (mg/dL)",
          description: "Duplicar la puntuaci\xF3n si hay insuficiencia renal aguda.",
          dropdown: true,
          options: [
            { label: "\u2265 3,5", value: 4 },
            { label: "2\u20133,4", value: 3 },
            { label: "1,5\u20131,9 o < 0,6", value: 2 },
            { label: "0,6\u20131,4", value: 0 }
          ],
          default: 0
        },
        { id: "renalAguda", type: "boolean", label: "Insuficiencia renal aguda (duplica los puntos de creatinina)", noPoints: true },
        {
          id: "hematocrito",
          type: "select",
          label: "Hematocrito (%)",
          dropdown: true,
          options: [
            { label: "\u2265 60 o < 20", value: 4 },
            { label: "50\u201359,9 o 20\u201329,9", value: 2 },
            { label: "46\u201349,9", value: 1 },
            { label: "30\u201345,9", value: 0 }
          ],
          default: 0
        },
        {
          id: "leucocitos",
          type: "select",
          label: "Leucocitos (\xD710\xB3/mm\xB3)",
          dropdown: true,
          options: [
            { label: "\u2265 40 o < 1", value: 4 },
            { label: "20\u201339,9 o 1\u20132,9", value: 2 },
            { label: "15\u201319,9", value: 1 },
            { label: "3\u201314,9", value: 0 }
          ],
          default: 0
        },
        { id: "gcs", type: "number", label: "Escala de coma de Glasgow", unit: "puntos", min: 3, max: 15, step: 1 },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          dropdown: true,
          options: [
            { label: "\u2264 44 a\xF1os", value: 0 },
            { label: "45\u201354 a\xF1os", value: 2 },
            { label: "55\u201364 a\xF1os", value: 3 },
            { label: "65\u201374 a\xF1os", value: 5 },
            { label: "\u2265 75 a\xF1os", value: 6 }
          ]
        },
        {
          id: "cronico",
          type: "select",
          label: "Enfermedad cr\xF3nica grave",
          description: "Cirrosis con hipertensi\xF3n portal, insuficiencia card\xEDaca clase IV, enfermedad respiratoria cr\xF3nica grave, di\xE1lisis cr\xF3nica o inmunodepresi\xF3n.",
          dropdown: true,
          options: [
            { label: "Ninguna", value: 0 },
            { label: "Presente \u2014 postoperatorio programado", value: 2 },
            { label: "Presente \u2014 no quir\xFArgico o postoperatorio urgente", value: 5 }
          ]
        }
      ],
      compute: (v) => {
        const crea = (v.creatinina ?? 0) * (v.renalAguda === 1 ? 2 : 1);
        const gcsPuntos = 15 - v.gcs;
        const score = sum(v, ["temp", "pam", "fc", "fr", "oxigenacion", "ph", "sodio", "potasio", "hematocrito", "leucocitos", "edad", "cronico"]) + crea + gcsPuntos;
        const mort = score <= 4 ? "\u2248 4 %" : score <= 9 ? "\u2248 8 %" : score <= 14 ? "\u2248 15 %" : score <= 19 ? "\u2248 25 %" : score <= 24 ? "\u2248 40 %" : score <= 29 ? "\u2248 55 %" : score <= 34 ? "\u2248 73 %" : "\u2248 85 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201371)",
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria orientativa",
          interpretation: score <= 9 ? "Gravedad baja." : score <= 19 ? "Gravedad moderada." : score <= 29 ? "Gravedad alta." : "Gravedad muy alta.",
          level: score <= 9 ? "ok" : score <= 19 ? "warn" : "danger",
          details: [
            `Puntos por Glasgow: ${gcsPuntos} (15 \u2212 GCS).`,
            `Puntos por creatinina: ${crea}${v.renalAguda === 1 ? " (duplicados por insuficiencia renal aguda)" : ""}.`
          ]
        };
      },
      notes: [
        "Usar los peores valores de las primeras 24 horas de ingreso en la UCI.",
        "La mortalidad exacta depende adem\xE1s del diagn\xF3stico de ingreso mediante coeficientes espec\xEDficos; las cifras mostradas son orientativas por tramos.",
        "Los porcentajes proceden de cohortes de los a\xF1os ochenta y sobreestiman la mortalidad actual."
      ],
      references: [
        "Knaus WA, et al. APACHE II: a severity of disease classification system. Crit Care Med. 1985;13(10):818-29."
      ]
    },
    {
      id: "news2",
      name: "Puntuaci\xF3n nacional de alerta temprana 2 (NEWS2)",
      shortName: "NEWS2",
      description: "Detecta el deterioro cl\xEDnico agudo y grad\xFAa la respuesta asistencial (versi\xF3n recomendada por el NHS).",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "fr",
          type: "select",
          label: "Frecuencia respiratoria (rpm)",
          dropdown: true,
          options: [
            { label: "\u2264 8", value: 3 },
            { label: "9\u201311", value: 1 },
            { label: "12\u201320", value: 0 },
            { label: "21\u201324", value: 2 },
            { label: "\u2265 25", value: 3 }
          ],
          default: 0
        },
        {
          id: "escala",
          type: "select",
          label: "Escala de saturaci\xF3n",
          noPoints: true,
          options: [
            { label: "Escala 1 (habitual)", value: 0 },
            { label: "Escala 2 (riesgo de insuficiencia respiratoria hiperc\xE1pnica)", value: 1 }
          ]
        },
        {
          id: "spo2a",
          type: "select",
          label: "SpO\u2082 \u2014 escala 1",
          dropdown: true,
          options: [
            { label: "\u2264 91 %", value: 3 },
            { label: "92\u201393 %", value: 2 },
            { label: "94\u201395 %", value: 1 },
            { label: "\u2265 96 %", value: 0 }
          ],
          default: 0
        },
        {
          id: "spo2b",
          type: "select",
          label: "SpO\u2082 \u2014 escala 2 (objetivo 88\u201392 %)",
          dropdown: true,
          options: [
            { label: "\u2264 83 %", value: 3 },
            { label: "84\u201385 %", value: 2 },
            { label: "86\u201387 %", value: 1 },
            { label: "88\u201392 % sin ox\xEDgeno, o \u2265 93 % sin ox\xEDgeno", value: 0 },
            { label: "93\u201394 % con ox\xEDgeno", value: 1 },
            { label: "95\u201396 % con ox\xEDgeno", value: 2 },
            { label: "\u2265 97 % con ox\xEDgeno", value: 3 }
          ],
          default: 0
        },
        {
          id: "oxigeno",
          type: "select",
          label: "Oxigenoterapia",
          options: [
            { label: "Aire ambiente", value: 0 },
            { label: "Ox\xEDgeno suplementario", value: 2 }
          ]
        },
        {
          id: "pas",
          type: "select",
          label: "Presi\xF3n arterial sist\xF3lica (mmHg)",
          dropdown: true,
          options: [
            { label: "\u2264 90", value: 3 },
            { label: "91\u2013100", value: 2 },
            { label: "101\u2013110", value: 1 },
            { label: "111\u2013219", value: 0 },
            { label: "\u2265 220", value: 3 }
          ],
          default: 0
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia card\xEDaca (lpm)",
          dropdown: true,
          options: [
            { label: "\u2264 40", value: 3 },
            { label: "41\u201350", value: 1 },
            { label: "51\u201390", value: 0 },
            { label: "91\u2013110", value: 1 },
            { label: "111\u2013130", value: 2 },
            { label: "\u2265 131", value: 3 }
          ],
          default: 0
        },
        {
          id: "conciencia",
          type: "select",
          label: "Nivel de conciencia",
          options: [
            { label: "Alerta", value: 0 },
            { label: "Confusi\xF3n nueva, responde a voz o dolor, o no responde", value: 3 }
          ]
        },
        {
          id: "temp",
          type: "select",
          label: "Temperatura (\xB0C)",
          dropdown: true,
          options: [
            { label: "\u2264 35", value: 3 },
            { label: "35,1\u201336", value: 1 },
            { label: "36,1\u201338", value: 0 },
            { label: "38,1\u201339", value: 1 },
            { label: "\u2265 39,1", value: 2 }
          ],
          default: 0
        }
      ],
      compute: (v) => {
        const esc2 = v.escala === 1;
        const spo2 = esc2 ? v.spo2b ?? 0 : v.spo2a ?? 0;
        const score = sum(v, ["fr", "oxigeno", "pas", "fc", "conciencia", "temp"]) + spo2;
        const parametros = [v.fr, v.oxigeno, v.pas, v.fc, v.conciencia, v.temp, spo2];
        const algunoTres = parametros.some((p) => p === 3);
        const banda = score >= 7 ? "alto" : score >= 5 || algunoTres ? "medio" : score >= 1 ? "bajo" : "muy bajo";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201320)",
          secondary: `Riesgo ${banda}`,
          interpretation: banda === "alto" ? "Riesgo alto (\u2265 7): valoraci\xF3n urgente por el equipo de cuidados cr\xEDticos, monitorizaci\xF3n continua y traslado a un nivel de cuidados superior." : banda === "medio" ? "Riesgo medio (5\u20136, o 3 puntos en un solo par\xE1metro): valoraci\xF3n urgente por el m\xE9dico responsable y monitorizaci\xF3n al menos horaria." : banda === "bajo" ? "Riesgo bajo (1\u20134): valoraci\xF3n por enfermer\xEDa y control de constantes cada 4\u20136 h." : "Riesgo muy bajo: control rutinario cada 12 h.",
          level: banda === "alto" ? "danger" : banda === "medio" ? "warn" : banda === "bajo" ? "info" : "ok",
          details: [
            esc2 ? "Escala 2: solo para pacientes con insuficiencia respiratoria hiperc\xE1pnica confirmada y objetivo de saturaci\xF3n 88\u201392 % prescrito." : "Escala 1: objetivo de saturaci\xF3n habitual.",
            algunoTres && score < 5 ? "Alerta: hay un par\xE1metro con 3 puntos, lo que eleva la respuesta a riesgo medio." : ""
          ].filter(Boolean)
        };
      },
      notes: [
        "NEWS2 no est\xE1 validada en embarazadas, pacientes pedi\xE1tricos ni en pacientes con limitaci\xF3n del esfuerzo terap\xE9utico.",
        "La confusi\xF3n de nueva aparici\xF3n punt\xFAa igual que la respuesta solo a la voz o al dolor."
      ],
      references: [
        "Royal College of Physicians. National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS. Londres, 2017."
      ]
    },
    {
      id: "braden",
      name: "Escala de Braden para el riesgo de \xFAlceras por presi\xF3n",
      shortName: "Braden",
      description: "Identifica a los pacientes con riesgo de desarrollar \xFAlceras por presi\xF3n.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "sensorial",
          type: "select",
          label: "Percepci\xF3n sensorial",
          dropdown: true,
          options: escala2([
            [1, "Completamente limitada: no responde a est\xEDmulos dolorosos"],
            [2, "Muy limitada: solo responde a est\xEDmulos dolorosos"],
            [3, "Ligeramente limitada: responde a \xF3rdenes verbales, con alguna limitaci\xF3n"],
            [4, "Sin limitaciones: responde a \xF3rdenes verbales, sin d\xE9ficit sensorial"]
          ]),
          default: 4
        },
        {
          id: "humedad",
          type: "select",
          label: "Exposici\xF3n a la humedad",
          dropdown: true,
          options: escala2([
            [1, "Constantemente h\xFAmeda"],
            [2, "A menudo h\xFAmeda"],
            [3, "Ocasionalmente h\xFAmeda"],
            [4, "Raramente h\xFAmeda"]
          ]),
          default: 4
        },
        {
          id: "actividad",
          type: "select",
          label: "Actividad",
          dropdown: true,
          options: escala2([
            [1, "Encamado"],
            [2, "En silla"],
            [3, "Deambula ocasionalmente"],
            [4, "Deambula con frecuencia"]
          ]),
          default: 4
        },
        {
          id: "movilidad",
          type: "select",
          label: "Movilidad",
          dropdown: true,
          options: escala2([
            [1, "Completamente inm\xF3vil"],
            [2, "Muy limitada"],
            [3, "Ligeramente limitada"],
            [4, "Sin limitaciones"]
          ]),
          default: 4
        },
        {
          id: "nutricion",
          type: "select",
          label: "Nutrici\xF3n",
          dropdown: true,
          options: escala2([
            [1, "Muy pobre"],
            [2, "Probablemente inadecuada"],
            [3, "Adecuada"],
            [4, "Excelente"]
          ]),
          default: 4
        },
        {
          id: "roce",
          type: "select",
          label: "Roce y peligro de lesiones",
          dropdown: true,
          options: escala2([
            [1, "Problema: requiere ayuda importante para moverse; se desliza con frecuencia"],
            [2, "Problema potencial: se mueve con dificultad o requiere ayuda m\xEDnima"],
            [3, "Sin problema aparente: se mueve solo en la cama y en la silla"]
          ]),
          default: 3
        }
      ],
      compute: (v) => {
        const score = sum(v, ["sensorial", "humedad", "actividad", "movilidad", "nutricion", "roce"]);
        const banda = score <= 9 ? "muy alto" : score <= 12 ? "alto" : score <= 14 ? "moderado" : score <= 18 ? "leve" : "sin riesgo";
        return {
          main: String(score),
          mainUnit: "puntos (6\u201323)",
          secondary: `Riesgo ${banda}`,
          interpretation: score <= 18 ? `Riesgo ${banda} de \xFAlceras por presi\xF3n: protocolo de prevenci\xF3n con cambios posturales programados, superficies especiales de manejo de la presi\xF3n, cuidado de la piel y soporte nutricional.` : "Sin riesgo seg\xFAn la escala; reevaluar si cambia la situaci\xF3n cl\xEDnica.",
          level: score <= 12 ? "danger" : score <= 14 ? "warn" : score <= 18 ? "info" : "ok"
        };
      },
      notes: [
        "\u2264 9: riesgo muy alto \xB7 10\u201312: alto \xB7 13\u201314: moderado \xB7 15\u201318: leve \xB7 \u2265 19: sin riesgo.",
        "En pacientes cr\xEDticos suele adoptarse un umbral m\xE1s conservador (\u2264 16) por la mayor incidencia de lesiones."
      ],
      references: [
        "Bergstrom N, et al. The Braden Scale for Predicting Pressure Sore Risk. Nurs Res. 1987;36(4):205-10."
      ]
    },
    {
      id: "indice-choque-diastolico",
      name: "\xCDndice de choque diast\xF3lico (DSI)",
      shortName: "DSI",
      description: "Eval\xFAa el riesgo de shock s\xE9ptico en pacientes con sepsis o sospecha de infecci\xF3n.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        { id: "fc", type: "number", label: "Frecuencia card\xEDaca", unit: "lpm", min: 20, max: 250 },
        { id: "pad", type: "number", label: "Presi\xF3n arterial diast\xF3lica", unit: "mmHg", min: 10, max: 150 }
      ],
      compute: (v) => {
        const dsi = v.fc / v.pad;
        return {
          main: fmt(dsi, 2),
          interpretation: dsi >= 2.5 ? "DSI \u2265 2,5: se asocia a mayor mortalidad y a mayor probabilidad de necesitar vasopresores. Reevaluar la perfusi\xF3n, el lactato y la respuesta a fluidos." : "DSI < 2,5: menor riesgo seg\xFAn este \xEDndice; continuar la reevaluaci\xF3n cl\xEDnica.",
          level: dsi >= 2.5 ? "danger" : "ok",
          details: ["DSI = frecuencia card\xEDaca / presi\xF3n arterial diast\xF3lica."]
        };
      },
      notes: ["La presi\xF3n diast\xF3lica refleja el tono vascular; su descenso con taquicardia sugiere vasoplejia precoz."],
      references: [
        "Ospina-Tasc\xF3n GA, et al. Diastolic shock index and clinical outcomes in patients with septic shock. Ann Intensive Care. 2020;10(1):41."
      ]
    },
    {
      id: "nutric",
      name: "Puntuaci\xF3n NUTRIC modificada (riesgo nutricional en el paciente cr\xEDtico)",
      shortName: "NUTRIC",
      description: "Identifica a los pacientes cr\xEDticos que m\xE1s se benefician de una terapia nutricional intensiva.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 50 a\xF1os", value: 0 },
            { label: "50\u201374 a\xF1os", value: 1 },
            { label: "\u2265 75 a\xF1os", value: 2 }
          ]
        },
        {
          id: "apache",
          type: "select",
          label: "APACHE II",
          dropdown: true,
          options: [
            { label: "< 15", value: 0 },
            { label: "15\u201319", value: 1 },
            { label: "20\u201327", value: 2 },
            { label: "\u2265 28", value: 3 }
          ]
        },
        {
          id: "sofa",
          type: "select",
          label: "SOFA",
          options: [
            { label: "< 6", value: 0 },
            { label: "6\u20139", value: 1 },
            { label: "\u2265 10", value: 2 }
          ]
        },
        {
          id: "comorbilidades",
          type: "select",
          label: "N\xFAmero de comorbilidades",
          options: [
            { label: "0\u20131", value: 0 },
            { label: "\u2265 2", value: 1 }
          ]
        },
        {
          id: "dias",
          type: "select",
          label: "D\xEDas de hospitalizaci\xF3n antes del ingreso en UCI",
          options: [
            { label: "0\u2013< 1 d\xEDa", value: 0 },
            { label: "\u2265 1 d\xEDa", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "apache", "sofa", "comorbilidades", "dias"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20139)",
          interpretation: score >= 5 ? "Riesgo nutricional alto (\u2265 5): se benefician de una terapia nutricional precoz y agresiva, con vigilancia estrecha del aporte proteico-cal\xF3rico." : "Riesgo nutricional bajo (0\u20134): menor probabilidad de beneficio de la nutrici\xF3n agresiva; aplicar el soporte nutricional habitual.",
          level: score >= 5 ? "danger" : "ok"
        };
      },
      notes: ["Versi\xF3n modificada (sin interleucina 6), que es la utilizada habitualmente en la pr\xE1ctica cl\xEDnica."],
      references: [
        "Heyland DK, et al. Identifying critically ill patients who benefit the most from nutrition therapy: the development and initial validation of a novel risk assessment tool. Crit Care. 2011;15(6):R268."
      ]
    },
    {
      id: "must",
      name: "Herramienta universal de cribado de desnutrici\xF3n (MUST)",
      shortName: "MUST",
      description: "Identifica a los adultos desnutridos o en riesgo de desnutrici\xF3n.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "imc",
          type: "select",
          label: "\xCDndice de masa corporal",
          options: [
            { label: "> 20 kg/m\xB2 (> 30 en obesidad)", value: 0 },
            { label: "18,5\u201320 kg/m\xB2", value: 1 },
            { label: "< 18,5 kg/m\xB2", value: 2 }
          ]
        },
        {
          id: "perdida",
          type: "select",
          label: "P\xE9rdida de peso no intencionada en 3\u20136 meses",
          options: [
            { label: "< 5 %", value: 0 },
            { label: "5\u201310 %", value: 1 },
            { label: "> 10 %", value: 2 }
          ]
        },
        {
          id: "agudo",
          type: "boolean",
          label: "Enfermedad aguda con ausencia de ingesta prevista > 5 d\xEDas",
          points: 2
        }
      ],
      compute: (v) => {
        const score = sum(v, ["imc", "perdida", "agudo"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20136)",
          interpretation: score >= 2 ? "Riesgo alto de desnutrici\xF3n: valoraci\xF3n por nutrici\xF3n, plan de tratamiento nutricional y monitorizaci\xF3n de la ingesta." : score === 1 ? "Riesgo medio: registrar la ingesta durante 3 d\xEDas y repetir el cribado." : "Riesgo bajo: repetir el cribado de forma peri\xF3dica seg\xFAn el \xE1mbito asistencial.",
          level: score >= 2 ? "danger" : score === 1 ? "warn" : "ok"
        };
      },
      references: [
        "Elia M (ed.). The MUST Report. Nutritional screening of adults: a multidisciplinary responsibility. BAPEN, 2003."
      ]
    },
    {
      id: "nrs-2002",
      name: "Cribado de riesgo nutricional NRS-2002",
      shortName: "NRS-2002",
      description: "Predice el riesgo de desnutrici\xF3n en pacientes hospitalizados.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "nutricional",
          type: "select",
          label: "Deterioro del estado nutricional",
          dropdown: true,
          options: escala2([
            [0, "Normal"],
            [1, "Leve: p\xE9rdida > 5 % en 3 meses, o ingesta del 50\u201375 % de lo habitual en la \xFAltima semana"],
            [2, "Moderado: p\xE9rdida > 5 % en 2 meses, IMC 18,5\u201320,5 con estado general afectado, o ingesta del 25\u201350 %"],
            [3, "Grave: p\xE9rdida > 5 % en 1 mes (> 15 % en 3 meses), IMC < 18,5 con estado general afectado, o ingesta del 0\u201325 %"]
          ])
        },
        {
          id: "severidad",
          type: "select",
          label: "Gravedad de la enfermedad (aumento de los requerimientos)",
          dropdown: true,
          options: escala2([
            [0, "Requerimientos normales"],
            [1, "Leve: fractura de cadera, enfermedad cr\xF3nica con complicaciones, cirrosis, EPOC, di\xE1lisis, oncol\xF3gico"],
            [2, "Moderada: cirug\xEDa abdominal mayor, ictus, neumon\xEDa grave, neoplasia hematol\xF3gica"],
            [3, "Grave: traumatismo craneal, trasplante de m\xE9dula \xF3sea, paciente cr\xEDtico con APACHE II > 10"]
          ])
        },
        { id: "edad", type: "boolean", label: "Edad \u2265 70 a\xF1os" }
      ],
      compute: (v) => {
        const score = sum(v, ["nutricional", "severidad", "edad"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20137)",
          interpretation: score >= 3 ? "Riesgo nutricional presente (\u2265 3): iniciar un plan de soporte nutricional." : "Sin riesgo nutricional en este momento: repetir el cribado semanalmente durante el ingreso.",
          level: score >= 3 ? "danger" : "ok"
        };
      },
      notes: ["Todo paciente cr\xEDtico ingresado en UCI tiene, por definici\xF3n, una gravedad de al menos 3 puntos, por lo que suele considerarse en riesgo."],
      references: [
        "Kondrup J, et al. Nutritional risk screening (NRS 2002): a new method based on an analysis of controlled clinical trials. Clin Nutr. 2003;22(3):321-36."
      ]
    },
    {
      id: "aldrete",
      name: "Puntuaci\xF3n de Aldrete modificada",
      shortName: "Aldrete",
      description: "Eval\xFAa si el paciente est\xE1 en condiciones de recibir el alta de la unidad de recuperaci\xF3n postanest\xE9sica.",
      category: CAT15,
      specialty: [...UCI2, "Anestesiolog\xEDa"],
      inputs: [
        {
          id: "actividad",
          type: "select",
          label: "Actividad (mueve las extremidades voluntariamente o a la orden)",
          dropdown: true,
          options: escala2([
            [2, "Mueve las cuatro extremidades"],
            [1, "Mueve dos extremidades"],
            [0, "No mueve ninguna extremidad"]
          ]),
          default: 2
        },
        {
          id: "respiracion",
          type: "select",
          label: "Respiraci\xF3n",
          dropdown: true,
          options: escala2([
            [2, "Respira profundamente y tose con facilidad"],
            [1, "Disnea o respiraci\xF3n limitada"],
            [0, "Apnea"]
          ]),
          default: 2
        },
        {
          id: "circulacion",
          type: "select",
          label: "Circulaci\xF3n",
          dropdown: true,
          options: escala2([
            [2, "Presi\xF3n arterial \xB1 20 % del valor preanest\xE9sico"],
            [1, "Presi\xF3n arterial \xB1 20\u201349 % del valor preanest\xE9sico"],
            [0, "Presi\xF3n arterial \xB1 50 % o m\xE1s del valor preanest\xE9sico"]
          ]),
          default: 2
        },
        {
          id: "conciencia",
          type: "select",
          label: "Conciencia",
          dropdown: true,
          options: escala2([
            [2, "Completamente despierto"],
            [1, "Despierta al llamarlo"],
            [0, "No responde"]
          ]),
          default: 2
        },
        {
          id: "saturacion",
          type: "select",
          label: "Saturaci\xF3n de ox\xEDgeno",
          dropdown: true,
          options: escala2([
            [2, "SpO\u2082 > 92 % respirando aire ambiente"],
            [1, "Necesita ox\xEDgeno para mantener SpO\u2082 > 90 %"],
            [0, "SpO\u2082 < 90 % incluso con ox\xEDgeno"]
          ]),
          default: 2
        }
      ],
      compute: (v) => {
        const score = sum(v, ["actividad", "respiracion", "circulacion", "conciencia", "saturacion"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          interpretation: score >= 9 ? "Puntuaci\xF3n \u2265 9: criterios de alta de la unidad de recuperaci\xF3n postanest\xE9sica cumplidos, siempre que no haya otros problemas (dolor no controlado, n\xE1useas, sangrado, bloqueo residual)." : "Puntuaci\xF3n < 9: mantener en la unidad de recuperaci\xF3n con vigilancia y tratar la causa del d\xE9ficit.",
          level: score >= 9 ? "ok" : "warn"
        };
      },
      references: [
        "Aldrete JA. The post-anesthesia recovery score revisited. J Clin Anesth. 1995;7(1):89-91."
      ]
    }
  ];

  // src/calculators/respiratorio-critico.ts
  var CAT16 = "Respiratorio cr\xEDtico y ventilaci\xF3n";
  var UCI3 = ["Medicina Intensiva"];
  var escala3 = (items) => items.map(([value, label]) => ({ label: `${value} \u2014 ${label}`, value }));
  var respiratorioCritico = [
    {
      id: "horowitz",
      name: "\xCDndice de Horowitz (relaci\xF3n PaO\u2082/FiO\u2082)",
      shortName: "PaO\u2082/FiO\u2082",
      description: "Eval\xFAa la oxigenaci\xF3n y grad\xFAa la gravedad de la insuficiencia respiratoria.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "pao2", type: "number", label: "PaO\u2082 arterial", unit: "mmHg", min: 20, max: 700 },
        { id: "fio2", type: "number", label: "FiO\u2082", unit: "%", min: 21, max: 100 }
      ],
      compute: (v) => {
        const pf = v.pao2 / (v.fio2 / 100);
        return {
          main: fmt(pf, 0),
          mainUnit: "mmHg",
          interpretation: pf > 300 ? "Oxigenaci\xF3n conservada (> 300)." : pf > 200 ? "Rango de SDRA leve (201\u2013300) si se cumplen el resto de criterios de Berl\xEDn." : pf > 100 ? "Rango de SDRA moderado (101\u2013200): considerar ventilaci\xF3n protectora y valorar dec\xFAbito prono." : "Rango de SDRA grave (\u2264 100): ventilaci\xF3n protectora, dec\xFAbito prono y valorar bloqueo neuromuscular u oxigenaci\xF3n extracorp\xF3rea.",
          level: pf > 300 ? "ok" : pf > 200 ? "warn" : "danger"
        };
      },
      notes: [
        "Para clasificar el SDRA, la medici\xF3n debe hacerse con PEEP o CPAP \u2265 5 cmH\u2082O.",
        "La relaci\xF3n depende de la PEEP y de la altitud; a gran altitud debe corregirse por la presi\xF3n barom\xE9trica."
      ]
    },
    {
      id: "gradiente-aa",
      name: "Gradiente alveolo-arterial de ox\xEDgeno (A-a)",
      shortName: "Gradiente A-a",
      description: "Eval\xFAa el grado de cortocircuito y de desequilibrio ventilaci\xF3n/perfusi\xF3n en la hipoxemia.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 1, max: 110 },
        { id: "fio2", type: "number", label: "FiO\u2082", unit: "%", min: 21, max: 100 },
        { id: "pao2", type: "number", label: "PaO\u2082 arterial", unit: "mmHg", min: 20, max: 700 },
        { id: "paco2", type: "number", label: "PaCO\u2082 arterial", unit: "mmHg", min: 10, max: 150 },
        { id: "patm", type: "number", label: "Presi\xF3n atmosf\xE9rica", unit: "mmHg", min: 400, max: 800, step: 1 }
      ],
      compute: (v) => {
        const pAO2 = v.fio2 / 100 * (v.patm - 47) - v.paco2 / 0.8;
        const gradiente = pAO2 - v.pao2;
        const esperado = v.edad / 4 + 4;
        const elevado = gradiente > esperado;
        return {
          main: fmt(gradiente, 1),
          mainUnit: "mmHg",
          secondary: fmt(esperado, 1),
          secondaryLabel: "gradiente esperado para la edad",
          interpretation: elevado ? "Gradiente A-a elevado para la edad: sugiere alteraci\xF3n del intercambio gaseoso \u2014 desequilibrio ventilaci\xF3n/perfusi\xF3n (neumon\xEDa, EPOC, atelectasia), cortocircuito (SDRA, edema pulmonar) o alteraci\xF3n de la difusi\xF3n. La embolia pulmonar tambi\xE9n lo eleva." : "Gradiente A-a normal para la edad: si hay hipoxemia, orienta a hipoventilaci\xF3n (f\xE1rmacos, enfermedad neuromuscular) o a baja presi\xF3n inspirada de ox\xEDgeno (altitud).",
          level: elevado ? "warn" : "ok",
          details: [
            `PAO\u2082 (alveolar) = FiO\u2082 \xD7 (Patm \u2212 47) \u2212 PaCO\u2082/0,8 = ${fmt(pAO2, 1)} mmHg.`,
            "Gradiente esperado \u2248 (edad/4) + 4 respirando aire ambiente."
          ]
        };
      },
      notes: ["La estimaci\xF3n del gradiente esperado por la edad solo es v\xE1lida respirando aire ambiente."]
    },
    {
      id: "berlin",
      name: "Criterios de Berl\xEDn para el s\xEDndrome de distr\xE9s respiratorio agudo",
      shortName: "Berl\xEDn (SDRA)",
      description: "Define y grad\xFAa el s\xEDndrome de distr\xE9s respiratorio agudo.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        {
          id: "tiempo",
          type: "boolean",
          label: "Inicio en la \xFAltima semana",
          description: "Aparici\xF3n o empeoramiento de los s\xEDntomas respiratorios en los 7 d\xEDas previos.",
          noPoints: true
        },
        {
          id: "imagen",
          type: "boolean",
          label: "Infiltrados bilaterales en la imagen tor\xE1cica",
          description: "No explicables por derrame, atelectasia lobar/pulmonar o n\xF3dulos.",
          noPoints: true
        },
        {
          id: "origen",
          type: "boolean",
          label: "No explicable por insuficiencia card\xEDaca ni sobrecarga de volumen",
          description: "Si no hay factor de riesgo, se requiere una valoraci\xF3n objetiva (ecocardiograma) para excluir el edema hidrost\xE1tico.",
          noPoints: true
        },
        {
          id: "peep",
          type: "boolean",
          label: "PEEP o CPAP \u2265 5 cmH\u2082O",
          noPoints: true
        },
        { id: "pao2", type: "number", label: "PaO\u2082", unit: "mmHg", min: 20, max: 700 },
        { id: "fio2", type: "number", label: "FiO\u2082", unit: "%", min: 21, max: 100 }
      ],
      compute: (v) => {
        const pf = v.pao2 / (v.fio2 / 100);
        const criterios = [v.tiempo, v.imagen, v.origen, v.peep].filter((x) => x === 1).length;
        const cumple = criterios === 4 && pf <= 300;
        const grado = pf <= 100 ? "grave" : pf <= 200 ? "moderado" : "leve";
        const mort = pf <= 100 ? "\u2248 45 %" : pf <= 200 ? "\u2248 32 %" : "\u2248 27 %";
        if (!cumple)
          return {
            main: "No cumple criterios",
            secondary: fmt(pf, 0),
            secondaryLabel: "PaO\u2082/FiO\u2082",
            interpretation: pf > 300 ? `Faltan criterios: la relaci\xF3n PaO\u2082/FiO\u2082 (${fmt(pf, 0)}) es mayor de 300.` : `Faltan criterios cl\xEDnicos (${criterios}/4 marcados). Los cuatro son necesarios adem\xE1s de la hipoxemia.`,
            level: "info"
          };
        return {
          main: `SDRA ${grado}`,
          mainUnit: `PaO\u2082/FiO\u2082 ${fmt(pf, 0)}`,
          secondary: mort,
          secondaryLabel: "mortalidad orientativa",
          interpretation: `Se cumplen los cuatro criterios de Berl\xEDn con hipoxemia en rango ${grado}. Ventilaci\xF3n protectora (volumen corriente 4\u20138 mL/kg de peso predicho, presi\xF3n meseta < 30 cmH\u2082O), y en el SDRA moderado-grave valorar dec\xFAbito prono, bloqueo neuromuscular y, en casos refractarios, oxigenaci\xF3n por membrana extracorp\xF3rea.`,
          level: grado === "leve" ? "warn" : "danger"
        };
      },
      references: [
        "ARDS Definition Task Force; Ranieri VM, et al. Acute respiratory distress syndrome: the Berlin Definition. JAMA. 2012;307(23):2526-33."
      ]
    },
    {
      id: "indice-oxigenacion",
      name: "\xCDndice de oxigenaci\xF3n (IO)",
      shortName: "\xCDndice de oxigenaci\xF3n",
      description: "Grad\xFAa la gravedad de la insuficiencia respiratoria teniendo en cuenta el soporte ventilatorio; ayuda a decidir la indicaci\xF3n de ECMO, sobre todo en pediatr\xEDa.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "map", type: "number", label: "Presi\xF3n media de la v\xEDa a\xE9rea", unit: "cmH\u2082O", min: 1, max: 60, step: 0.5 },
        { id: "fio2", type: "number", label: "FiO\u2082", unit: "%", min: 21, max: 100 },
        { id: "pao2", type: "number", label: "PaO\u2082", unit: "mmHg", min: 10, max: 700 }
      ],
      compute: (v) => {
        const io = v.map * v.fio2 / v.pao2;
        return {
          main: fmt(io, 1),
          interpretation: io < 4 ? "\xCDndice bajo: insuficiencia respiratoria leve." : io < 8 ? "Insuficiencia respiratoria moderada." : io < 16 ? "Insuficiencia respiratoria grave: optimizar el soporte y valorar terapias de rescate." : "Insuficiencia respiratoria muy grave: en pediatr\xEDa, un \xEDndice \u2265 16 mantenido suele considerarse criterio de valoraci\xF3n para ECMO (\u2265 40 en los criterios cl\xE1sicos neonatales).",
          level: io < 4 ? "ok" : io < 8 ? "warn" : "danger",
          details: ["IO = (presi\xF3n media de la v\xEDa a\xE9rea \xD7 FiO\u2082 \xD7 100) / PaO\u2082, con la FiO\u2082 expresada en porcentaje."]
        };
      },
      notes: ["Un \xEDndice m\xE1s alto indica peor situaci\xF3n, a diferencia de la relaci\xF3n PaO\u2082/FiO\u2082."]
    },
    {
      id: "murray",
      name: "Puntuaci\xF3n de Murray de lesi\xF3n pulmonar aguda",
      shortName: "Murray",
      description: "Estratifica la gravedad de la lesi\xF3n pulmonar aguda; se usa en la selecci\xF3n de pacientes para ECMO.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        {
          id: "radiografia",
          type: "select",
          label: "Radiograf\xEDa de t\xF3rax \u2014 cuadrantes con infiltrados alveolares",
          dropdown: true,
          options: escala3([
            [0, "Sin consolidaci\xF3n alveolar"],
            [1, "Consolidaci\xF3n en 1 cuadrante"],
            [2, "Consolidaci\xF3n en 2 cuadrantes"],
            [3, "Consolidaci\xF3n en 3 cuadrantes"],
            [4, "Consolidaci\xF3n en 4 cuadrantes"]
          ])
        },
        {
          id: "hipoxemia",
          type: "select",
          label: "Hipoxemia (PaO\u2082/FiO\u2082)",
          dropdown: true,
          options: escala3([
            [0, "\u2265 300"],
            [1, "225\u2013299"],
            [2, "175\u2013224"],
            [3, "100\u2013174"],
            [4, "< 100"]
          ])
        },
        {
          id: "peep",
          type: "select",
          label: "PEEP (cmH\u2082O)",
          dropdown: true,
          options: escala3([
            [0, "\u2264 5"],
            [1, "6\u20138"],
            [2, "9\u201311"],
            [3, "12\u201314"],
            [4, "\u2265 15"]
          ])
        },
        {
          id: "compliance",
          type: "select",
          label: "Distensibilidad pulmonar (mL/cmH\u2082O)",
          dropdown: true,
          options: escala3([
            [0, "\u2265 80"],
            [1, "60\u201379"],
            [2, "40\u201359"],
            [3, "20\u201339"],
            [4, "\u2264 19"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["radiografia", "hipoxemia", "peep", "compliance"]) / 4;
        return {
          main: fmt(score, 2),
          mainUnit: "puntos (0\u20134)",
          interpretation: score === 0 ? "Sin lesi\xF3n pulmonar." : score <= 2.5 ? "Lesi\xF3n pulmonar leve-moderada." : "Lesi\xF3n pulmonar grave (> 2,5): en el ensayo CESAR, una puntuaci\xF3n > 3 fue criterio de derivaci\xF3n para valorar ECMO.",
          level: score === 0 ? "ok" : score <= 2.5 ? "warn" : "danger",
          details: ["Se calcula como la media de los cuatro componentes puntuados."]
        };
      },
      references: [
        "Murray JF, et al. An expanded definition of the adult respiratory distress syndrome. Am Rev Respir Dis. 1988;138(3):720-3."
      ]
    },
    {
      id: "macocha",
      name: "Puntuaci\xF3n MACOCHA de intubaci\xF3n dif\xEDcil en la UCI",
      shortName: "MACOCHA",
      description: "Predice la dificultad de intubaci\xF3n en el paciente cr\xEDtico.",
      category: CAT16,
      specialty: [...UCI3, "Anestesiolog\xEDa"],
      inputs: [
        { id: "mallampati", type: "boolean", label: "Mallampati III o IV (M)", points: 5 },
        { id: "apnea", type: "boolean", label: "S\xEDndrome de apnea obstructiva del sue\xF1o (A)", points: 2 },
        { id: "cervical", type: "boolean", label: "Movilidad cervical reducida (C)", points: 1 },
        { id: "apertura", type: "boolean", label: "Apertura bucal < 3 cm (O)", points: 1 },
        { id: "coma", type: "boolean", label: "Coma (C)", points: 1 },
        { id: "hipoxemia", type: "boolean", label: "Hipoxemia grave, SpO\u2082 < 80 % (H)", points: 1 },
        { id: "noAnestesista", type: "boolean", label: "Operador no anestesi\xF3logo (A)", points: 1 }
      ],
      compute: (v) => {
        const score = sum(v, ["mallampati", "apnea", "cervical", "apertura", "coma", "hipoxemia", "noAnestesista"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201312)",
          interpretation: score >= 3 ? "MACOCHA \u2265 3: riesgo elevado de intubaci\xF3n dif\xEDcil. Preparar plan alternativo, preoxigenaci\xF3n optimizada (ventilaci\xF3n no invasiva u ox\xEDgeno de alto flujo), presencia del operador m\xE1s experto y material de rescate disponible." : "MACOCHA < 3: baja probabilidad de intubaci\xF3n dif\xEDcil, aunque el paciente cr\xEDtico siempre exige preparaci\xF3n completa (valor predictivo negativo alto, positivo bajo).",
          level: score >= 3 ? "danger" : "ok"
        };
      },
      references: [
        "De Jong A, et al. Early identification of patients at risk for difficult intubation in the intensive care unit: development and validation of the MACOCHA score. Am J Respir Crit Care Med. 2013;187(8):832-9."
      ]
    },
    {
      id: "tet-profundidad",
      name: "Profundidad del tubo endotraqueal y volumen corriente objetivo",
      shortName: "Tubo endotraqueal",
      description: "Estima la profundidad de fijaci\xF3n del tubo endotraqueal y el volumen corriente seg\xFAn el peso corporal predicho.",
      category: CAT16,
      specialty: [...UCI3, "Anestesiolog\xEDa"],
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 100, max: 230 },
        {
          id: "mlkg",
          type: "select",
          label: "Volumen corriente objetivo",
          noPoints: true,
          options: [
            { label: "4 mL/kg (SDRA grave)", value: 4 },
            { label: "6 mL/kg (ventilaci\xF3n protectora)", value: 6 },
            { label: "8 mL/kg (pulm\xF3n sano)", value: 8 }
          ],
          default: 6
        }
      ],
      compute: (v) => {
        const pulgadas = v.talla / 2.54;
        const pcp = v.sexo === 1 ? 45.5 + 2.3 * (pulgadas - 60) : 50 + 2.3 * (pulgadas - 60);
        const vt = pcp * (v.mlkg ?? 6);
        const profundidad = v.sexo === 1 ? 21 : 23;
        return {
          main: fmt(vt, 0),
          mainUnit: "mL de volumen corriente",
          secondary: `${profundidad} cm`,
          secondaryLabel: "profundidad orientativa en la comisura labial",
          interpretation: "El volumen corriente debe calcularse siempre sobre el peso corporal predicho (que depende solo de talla y sexo), nunca sobre el peso real.",
          level: "info",
          details: [
            `Peso corporal predicho: ${fmt(pcp, 1)} kg.`,
            "Profundidad orientativa: 23 cm en varones y 21 cm en mujeres; tambi\xE9n puede estimarse como 3 \xD7 el di\xE1metro interno del tubo.",
            "Confirmar siempre la posici\xF3n con auscultaci\xF3n, capnograf\xEDa y radiograf\xEDa de t\xF3rax (punta 3\u20135 cm sobre la carina)."
          ]
        };
      },
      references: [
        "The Acute Respiratory Distress Syndrome Network. Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury and ARDS. N Engl J Med. 2000;342(18):1301-8."
      ]
    },
    {
      id: "curb65",
      name: "Puntuaci\xF3n CURB-65 para la neumon\xEDa adquirida en la comunidad",
      shortName: "CURB-65",
      description: "Estima la mortalidad de la neumon\xEDa adquirida en la comunidad y orienta la decisi\xF3n de ingreso.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "confusion", type: "boolean", label: "Confusi\xF3n (C)", description: "Desorientaci\xF3n en tiempo, espacio o persona, de nueva aparici\xF3n." },
        { id: "urea", type: "boolean", label: "Urea > 42 mg/dL (BUN > 19 mg/dL) (U)" },
        { id: "fr", type: "boolean", label: "Frecuencia respiratoria \u2265 30 rpm (R)" },
        { id: "pa", type: "boolean", label: "PA sist\xF3lica < 90 mmHg o diast\xF3lica \u2264 60 mmHg (B)" },
        { id: "edad", type: "boolean", label: "Edad \u2265 65 a\xF1os" }
      ],
      compute: (v) => {
        const score = sum(v, ["confusion", "urea", "fr", "pa", "edad"]);
        const mort = ["0,6 %", "2,7 %", "6,8 %", "14 %", "27,8 %", "27,8 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20135)",
          secondary: mort,
          secondaryLabel: "mortalidad a 30 d\xEDas",
          interpretation: score <= 1 ? "Riesgo bajo: habitualmente tratamiento ambulatorio." : score === 2 ? "Riesgo intermedio: valorar ingreso hospitalario o unidad de corta estancia." : "Riesgo alto (\u2265 3): ingreso hospitalario; con 4\u20135 puntos, valorar unidad de cuidados intensivos.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      notes: ["La decisi\xF3n de ingreso debe integrar tambi\xE9n la comorbilidad, la oxigenaci\xF3n y el contexto social."],
      references: [
        "Lim WS, et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study. Thorax. 2003;58(5):377-82."
      ]
    },
    {
      id: "crb65",
      name: "Puntuaci\xF3n CRB-65 para la neumon\xEDa adquirida en la comunidad",
      shortName: "CRB-65",
      description: "Clasifica la gravedad de la neumon\xEDa sin necesidad de pruebas de laboratorio (\xFAtil en atenci\xF3n primaria).",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "confusion", type: "boolean", label: "Confusi\xF3n (C)" },
        { id: "fr", type: "boolean", label: "Frecuencia respiratoria \u2265 30 rpm (R)" },
        { id: "pa", type: "boolean", label: "PA sist\xF3lica < 90 mmHg o diast\xF3lica \u2264 60 mmHg (B)" },
        { id: "edad", type: "boolean", label: "Edad \u2265 65 a\xF1os" }
      ],
      compute: (v) => {
        const score = sum(v, ["confusion", "fr", "pa", "edad"]);
        const mort = ["0,9 %", "5,2 %", "12 %", "31,2 %", "31,2 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20134)",
          secondary: mort,
          secondaryLabel: "mortalidad a 30 d\xEDas",
          interpretation: score === 0 ? "Riesgo bajo: tratamiento ambulatorio razonable." : score <= 2 ? "Riesgo intermedio: valorar derivaci\xF3n hospitalaria." : "Riesgo alto: derivaci\xF3n hospitalaria urgente.",
          level: score === 0 ? "ok" : score <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Lim WS, et al. Defining community acquired pneumonia severity on presentation to hospital. Thorax. 2003;58(5):377-82."
      ]
    },
    {
      id: "bap65",
      name: "Puntuaci\xF3n BAP-65 para la exacerbaci\xF3n aguda de la EPOC",
      shortName: "BAP-65",
      description: "Predice la mortalidad y la necesidad de ventilaci\xF3n mec\xE1nica en la exacerbaci\xF3n de la EPOC.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "bun", type: "boolean", label: "BUN \u2265 25 mg/dL (urea \u2265 53 mg/dL) (B)" },
        { id: "mental", type: "boolean", label: "Alteraci\xF3n del estado mental (A)" },
        { id: "pulso", type: "boolean", label: "Frecuencia card\xEDaca \u2265 109 lpm (P)" },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 65 a\xF1os", value: 0 },
            { label: "\u2265 65 a\xF1os", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const puntos = sum(v, ["bun", "mental", "pulso"]);
        const mayor65 = v.edad === 1;
        let clase;
        if (puntos === 0) clase = mayor65 ? 2 : 1;
        else if (puntos === 1) clase = 3;
        else if (puntos === 2) clase = 4;
        else clase = 5;
        const mort = ["", "\u2248 0,3 %", "\u2248 1,0 %", "\u2248 2,2 %", "\u2248 6,4 %", "\u2248 14,1 %"][clase];
        const vm = ["", "\u2248 0,9 %", "\u2248 1,9 %", "\u2248 4,7 %", "\u2248 14,3 %", "\u2248 29,4 %"][clase];
        return {
          main: `Clase ${clase}`,
          mainUnit: `${puntos} de 3 criterios`,
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria",
          interpretation: clase <= 2 ? "Riesgo bajo: manejo en planta convencional." : clase === 3 ? "Riesgo intermedio: vigilancia estrecha." : `Riesgo alto: valorar unidad de cuidados intermedios o intensivos. Necesidad de ventilaci\xF3n mec\xE1nica ${vm}.`,
          level: clase <= 2 ? "ok" : clase === 3 ? "warn" : "danger"
        };
      },
      notes: ["La clase 1 corresponde a menores de 65 a\xF1os sin ning\xFAn criterio; la clase 2, a mayores de 65 sin criterios."],
      references: [
        "Shorr AF, et al. Validation of a novel risk score for severity of illness in acute exacerbations of COPD. Chest. 2011;140(5):1177-83."
      ]
    },
    {
      id: "decaf",
      name: "Puntuaci\xF3n DECAF para la exacerbaci\xF3n aguda de la EPOC",
      shortName: "DECAF",
      description: "Predice la mortalidad hospitalaria en la exacerbaci\xF3n aguda de la EPOC.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        {
          id: "disnea",
          type: "select",
          label: "Disnea basal (eMRCD) (D)",
          dropdown: true,
          options: [
            { label: "eMRCD 1\u20134 (no limitado a domicilio)", value: 0 },
            { label: "eMRCD 5a: limitado a domicilio, aut\xF3nomo para lavarse y vestirse", value: 1 },
            { label: "eMRCD 5b: limitado a domicilio, no aut\xF3nomo para lavarse ni vestirse", value: 2 }
          ]
        },
        { id: "eosinopenia", type: "boolean", label: "Eosinopenia < 0,05 \xD710\u2079/L (E)" },
        { id: "consolidacion", type: "boolean", label: "Consolidaci\xF3n radiol\xF3gica (C)" },
        { id: "acidemia", type: "boolean", label: "Acidemia (pH < 7,30) (A)" },
        { id: "fibrilacion", type: "boolean", label: "Fibrilaci\xF3n auricular (F)" }
      ],
      compute: (v) => {
        const score = sum(v, ["disnea", "eosinopenia", "consolidacion", "acidemia", "fibrilacion"]);
        const mort = ["1,0 %", "1,4 %", "5,4 %", "15,3 %", "31,0 %", "40,5 %", "50,0 %"][Math.min(score, 6)];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20136)",
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria",
          interpretation: score <= 1 ? "Riesgo bajo: puede valorarse el manejo ambulatorio u hospitalizaci\xF3n domiciliaria en casos seleccionados." : score === 2 ? "Riesgo intermedio: ingreso convencional con vigilancia." : "Riesgo alto (\u2265 3): considerar cuidados intermedios o intensivos y anticipar decisiones sobre el techo terap\xE9utico.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      references: [
        "Steer J, et al. The DECAF Score: predicting hospital mortality in exacerbations of chronic obstructive pulmonary disease. Thorax. 2012;67(11):970-6."
      ]
    },
    {
      id: "bode",
      name: "\xCDndice BODE para la supervivencia en la EPOC",
      shortName: "BODE",
      description: "Predice la supervivencia a 4 a\xF1os en pacientes con EPOC.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        {
          id: "imc",
          type: "select",
          label: "\xCDndice de masa corporal (B)",
          options: [
            { label: "> 21 kg/m\xB2", value: 0 },
            { label: "\u2264 21 kg/m\xB2", value: 1 }
          ]
        },
        {
          id: "fev1",
          type: "select",
          label: "FEV\u2081 posbroncodilatador (% del te\xF3rico) (O)",
          dropdown: true,
          options: [
            { label: "\u2265 65 %", value: 0 },
            { label: "50\u201364 %", value: 1 },
            { label: "36\u201349 %", value: 2 },
            { label: "\u2264 35 %", value: 3 }
          ]
        },
        {
          id: "disnea",
          type: "select",
          label: "Disnea (escala mMRC) (D)",
          dropdown: true,
          options: [
            { label: "mMRC 0\u20131", value: 0 },
            { label: "mMRC 2", value: 1 },
            { label: "mMRC 3", value: 2 },
            { label: "mMRC 4", value: 3 }
          ]
        },
        {
          id: "marcha",
          type: "select",
          label: "Prueba de la marcha de 6 minutos (E)",
          dropdown: true,
          options: [
            { label: "\u2265 350 m", value: 0 },
            { label: "250\u2013349 m", value: 1 },
            { label: "150\u2013249 m", value: 2 },
            { label: "\u2264 149 m", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["imc", "fev1", "disnea", "marcha"]);
        const cuartil = score <= 2 ? 1 : score <= 4 ? 2 : score <= 6 ? 3 : 4;
        const superv = ["", "80 %", "67 %", "57 %", "18 %"][cuartil];
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          secondary: superv,
          secondaryLabel: "supervivencia aproximada a 4 a\xF1os",
          interpretation: `Cuartil ${cuartil}. ${cuartil >= 3 ? "Mortalidad elevada: optimizar el tratamiento, la rehabilitaci\xF3n respiratoria y la planificaci\xF3n anticipada de cuidados; valorar trasplante en casos seleccionados." : "Pron\xF3stico relativamente favorable; mantener el tratamiento optimizado y la rehabilitaci\xF3n."}`,
          level: cuartil <= 2 ? "ok" : cuartil === 3 ? "warn" : "danger"
        };
      },
      references: [
        "Celli BR, et al. The body-mass index, airflow obstruction, dyspnea, and exercise capacity index in chronic obstructive pulmonary disease. N Engl J Med. 2004;350(10):1005-12."
      ]
    },
    {
      id: "cat-epoc",
      name: "Prueba de evaluaci\xF3n de la EPOC (CAT)",
      shortName: "CAT",
      description: "Cuantifica el impacto de los s\xEDntomas de la EPOC en la calidad de vida.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "tos", type: "number", label: "Tos (0 = nunca toso \xB7 5 = toso siempre)", min: 0, max: 5, step: 1 },
        { id: "flema", type: "number", label: "Flema (0 = sin flemas \xB7 5 = lleno de flemas)", min: 0, max: 5, step: 1 },
        { id: "opresion", type: "number", label: "Opresi\xF3n tor\xE1cica (0 = ninguna \xB7 5 = mucha)", min: 0, max: 5, step: 1 },
        { id: "cuesta", type: "number", label: "Disnea al subir una cuesta o un piso (0 = ninguna \xB7 5 = mucha)", min: 0, max: 5, step: 1 },
        { id: "actividades", type: "number", label: "Limitaci\xF3n de actividades dom\xE9sticas (0 = ninguna \xB7 5 = mucha)", min: 0, max: 5, step: 1 },
        { id: "salir", type: "number", label: "Seguridad al salir de casa (0 = total \xB7 5 = ninguna)", min: 0, max: 5, step: 1 },
        { id: "dormir", type: "number", label: "Sue\xF1o (0 = duermo bien \xB7 5 = no duermo bien)", min: 0, max: 5, step: 1 },
        { id: "energia", type: "number", label: "Energ\xEDa (0 = mucha \xB7 5 = ninguna)", min: 0, max: 5, step: 1 }
      ],
      compute: (v) => {
        const ids = ["tos", "flema", "opresion", "cuesta", "actividades", "salir", "dormir", "energia"];
        if (ids.some((id) => (v[id] ?? 0) < 0 || (v[id] ?? 0) > 5))
          return { main: "\u2014", interpretation: "Cada \xEDtem debe puntuarse entre 0 y 5.", level: "warn" };
        const score = sum(v, ids);
        const impacto = score < 10 ? "bajo" : score < 20 ? "medio" : score < 30 ? "alto" : "muy alto";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201340)",
          secondary: `Impacto ${impacto}`,
          interpretation: score < 10 ? "Impacto bajo: la EPOC apenas limita la vida diaria." : score < 20 ? "Impacto medio: la EPOC es uno de los problemas m\xE1s importantes del paciente." : "Impacto alto o muy alto: la EPOC condiciona de forma importante la vida diaria; optimizar el tratamiento y valorar rehabilitaci\xF3n respiratoria.",
          level: score < 10 ? "ok" : score < 20 ? "warn" : "danger",
          details: ["Un CAT \u2265 10 se usa como umbral de \xABm\xE1s s\xEDntomas\xBB en la clasificaci\xF3n GOLD.", "Una diferencia de 2 puntos se considera cl\xEDnicamente relevante."]
        };
      },
      references: [
        "Jones PW, et al. Development and first validation of the COPD Assessment Test. Eur Respir J. 2009;34(3):648-54."
      ]
    },
    {
      id: "gold",
      name: "Clasificaci\xF3n GOLD de la EPOC",
      shortName: "GOLD",
      description: "Clasifica la EPOC por grado de obstrucci\xF3n y por grupo de s\xEDntomas y exacerbaciones (revisi\xF3n GOLD 2023).",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        {
          id: "fev1",
          type: "select",
          label: "FEV\u2081 posbroncodilatador (% del te\xF3rico)",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "GOLD 1 \u2014 leve: FEV\u2081 \u2265 80 %", value: 1 },
            { label: "GOLD 2 \u2014 moderada: FEV\u2081 50\u201379 %", value: 2 },
            { label: "GOLD 3 \u2014 grave: FEV\u2081 30\u201349 %", value: 3 },
            { label: "GOLD 4 \u2014 muy grave: FEV\u2081 < 30 %", value: 4 }
          ]
        },
        {
          id: "sintomas",
          type: "select",
          label: "Carga sintom\xE1tica",
          noPoints: true,
          options: [
            { label: "Pocos s\xEDntomas (mMRC 0\u20131 o CAT < 10)", value: 0 },
            { label: "M\xE1s s\xEDntomas (mMRC \u2265 2 o CAT \u2265 10)", value: 1 }
          ]
        },
        {
          id: "exacerbaciones",
          type: "select",
          label: "Exacerbaciones en el \xFAltimo a\xF1o",
          noPoints: true,
          options: [
            { label: "0 o 1 sin ingreso", value: 0 },
            { label: "\u2265 2 moderadas, o \u2265 1 con ingreso hospitalario", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const grupo = v.exacerbaciones === 1 ? "E" : v.sintomas === 1 ? "B" : "A";
        const tratamiento = grupo === "A" ? "Un broncodilatador (de acci\xF3n corta o larga seg\xFAn los s\xEDntomas)." : grupo === "B" ? "Doble broncodilataci\xF3n LABA + LAMA." : "LABA + LAMA; a\xF1adir corticoide inhalado si los eosin\xF3filos son \u2265 300/\xB5L (o \u2265 100/\xB5L con exacerbaciones frecuentes).";
        return {
          main: `GOLD ${v.fev1 ?? 1} \xB7 Grupo ${grupo}`,
          interpretation: `Obstrucci\xF3n de grado ${v.fev1 ?? 1} y grupo ${grupo} por s\xEDntomas y exacerbaciones. Tratamiento inicial recomendado: ${tratamiento} A\xF1adir siempre deshabituaci\xF3n tab\xE1quica, vacunaci\xF3n, rehabilitaci\xF3n respiratoria y revisi\xF3n de la t\xE9cnica inhalatoria.`,
          level: grupo === "E" ? "danger" : grupo === "B" ? "warn" : "ok"
        };
      },
      notes: [
        "Desde GOLD 2023 los antiguos grupos C y D se fusionan en el grupo E (exacerbadores), independientemente de la carga sintom\xE1tica.",
        "El diagn\xF3stico requiere una relaci\xF3n FEV\u2081/FVC posbroncodilatador < 0,70."
      ],
      references: [
        "Global Initiative for Chronic Obstructive Lung Disease. Global Strategy for the Diagnosis, Management, and Prevention of COPD, informe 2023."
      ]
    }
  ];

  // src/calculators/renal-metabolico.ts
  var CAT17 = "Renal, iones y equilibrio \xE1cido-base";
  var UCI4 = ["Medicina Intensiva"];
  var renalMetabolico = [
    {
      id: "gasometria",
      name: "Analizador de gasometr\xEDa arterial",
      shortName: "Gasometr\xEDa",
      description: "Interpreta el trastorno \xE1cido-base primario, la compensaci\xF3n esperada y el ani\xF3n gap.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "ph", type: "number", label: "pH", min: 6.5, max: 8, step: 0.01 },
        { id: "paco2", type: "number", label: "PaCO\u2082", unit: "mmHg", min: 5, max: 150, step: 0.1 },
        { id: "hco3", type: "number", label: "Bicarbonato (HCO\u2083\u207B)", unit: "mEq/L", min: 1, max: 60, step: 0.1 },
        { id: "na", type: "number", label: "Sodio", unit: "mEq/L", min: 90, max: 200, step: 0.1 },
        { id: "cl", type: "number", label: "Cloro", unit: "mEq/L", min: 50, max: 160, step: 0.1 },
        { id: "albumina", type: "number", label: "Alb\xFAmina", unit: "g/dL", min: 0.5, max: 7, step: 0.1 }
      ],
      compute: (v) => {
        const ph = v.ph;
        const paco2 = v.paco2;
        const hco3 = v.hco3;
        const ag = v.na - v.cl - hco3;
        const agCorr = ag + 2.5 * (4 - v.albumina);
        const detalles = [];
        let primario;
        let level = "warn";
        const acidemia = ph < 7.35;
        const alcalemia = ph > 7.45;
        if (!acidemia && !alcalemia) {
          primario = Math.abs(paco2 - 40) > 8 || Math.abs(hco3 - 24) > 4 ? "pH normal con alteraciones de PaCO\u2082 o bicarbonato: sugiere un trastorno mixto o completamente compensado" : "Equilibrio \xE1cido-base normal";
          level = Math.abs(paco2 - 40) > 8 || Math.abs(hco3 - 24) > 4 ? "warn" : "ok";
        } else if (acidemia) {
          if (hco3 < 22) {
            primario = "Acidosis metab\xF3lica";
            const esperado = 1.5 * hco3 + 8;
            detalles.push(
              `Compensaci\xF3n esperada (Winter): PaCO\u2082 = ${fmt(esperado - 2, 0)}\u2013${fmt(esperado + 2, 0)} mmHg. Medida: ${fmt(paco2, 0)}.`
            );
            if (paco2 > esperado + 2) detalles.push("PaCO\u2082 mayor de lo esperado: acidosis respiratoria a\xF1adida.");
            else if (paco2 < esperado - 2) detalles.push("PaCO\u2082 menor de lo esperado: alcalosis respiratoria a\xF1adida.");
            else detalles.push("Compensaci\xF3n respiratoria adecuada.");
          } else {
            primario = "Acidosis respiratoria";
            const agudo = 24 + (paco2 - 40) / 10;
            const cronico = 24 + 3.5 * (paco2 - 40) / 10;
            detalles.push(
              `Bicarbonato esperado: ${fmt(agudo, 1)} mEq/L si es aguda y ${fmt(cronico, 1)} si es cr\xF3nica. Medido: ${fmt(hco3, 1)}.`
            );
          }
          level = ph < 7.2 ? "danger" : "warn";
        } else {
          if (hco3 > 26) {
            primario = "Alcalosis metab\xF3lica";
            const esperado = 40 + 0.7 * (hco3 - 24);
            detalles.push(`PaCO\u2082 esperada: \u2248 ${fmt(esperado, 0)} mmHg. Medida: ${fmt(paco2, 0)}.`);
          } else {
            primario = "Alcalosis respiratoria";
            const agudo = 24 - 2 * (40 - paco2) / 10;
            const cronico = 24 - 5 * (40 - paco2) / 10;
            detalles.push(
              `Bicarbonato esperado: ${fmt(agudo, 1)} mEq/L si es aguda y ${fmt(cronico, 1)} si es cr\xF3nica. Medido: ${fmt(hco3, 1)}.`
            );
          }
          level = ph > 7.6 ? "danger" : "warn";
        }
        detalles.push(`Ani\xF3n gap: ${fmt(ag, 1)} mEq/L \xB7 corregido por alb\xFAmina: ${fmt(agCorr, 1)} mEq/L (normal 8\u201312).`);
        if (agCorr > 12) {
          detalles.push(
            "Ani\xF3n gap elevado: valorar cetoacidosis, acidosis l\xE1ctica, insuficiencia renal o t\xF3xicos (metanol, etilenglicol, salicilatos)."
          );
          if (hco3 < 22) {
            const delta = (agCorr - 12) / (24 - hco3);
            detalles.push(
              `Cociente delta-delta: ${fmt(delta, 2)} \u2014 ${delta < 0.4 ? "sugiere acidosis metab\xF3lica hiperclor\xE9mica pura" : delta < 1 ? "sugiere acidosis con ani\xF3n gap elevado y acidosis hiperclor\xE9mica asociadas" : delta <= 2 ? "acidosis con ani\xF3n gap elevado aislada" : "sugiere alcalosis metab\xF3lica concomitante o acidosis respiratoria cr\xF3nica previa"}.`
            );
          }
        } else if (hco3 < 22 && ph < 7.35) {
          detalles.push("Ani\xF3n gap normal: valorar p\xE9rdidas digestivas de bicarbonato, acidosis tubular renal o exceso de suero salino.");
        }
        return {
          main: primario,
          secondary: fmt(ph, 2),
          secondaryLabel: "pH",
          interpretation: "Interpretaci\xF3n autom\xE1tica orientativa: confirmar siempre con la situaci\xF3n cl\xEDnica, el lactato y el resto de la anal\xEDtica.",
          level,
          details: detalles
        };
      },
      notes: [
        "El ani\xF3n gap debe corregirse por la alb\xFAmina: por cada 1 g/dL de descenso, sumar 2,5 mEq/L.",
        "La f\xF3rmula de Winter estima la compensaci\xF3n respiratoria en la acidosis metab\xF3lica."
      ]
    },
    {
      id: "mdrd",
      name: "Filtrado glomerular estimado (MDRD)",
      shortName: "MDRD",
      description: "Estima el filtrado glomerular en la enfermedad renal cr\xF3nica.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "creatinina", type: "number", label: "Creatinina s\xE9rica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 },
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 18, max: 110 },
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const fge = 175 * Math.pow(v.creatinina, -1.154) * Math.pow(v.edad, -0.203) * (v.sexo === 1 ? 0.742 : 1);
        const estadio = fge >= 90 ? "G1" : fge >= 60 ? "G2" : fge >= 45 ? "G3a" : fge >= 30 ? "G3b" : fge >= 15 ? "G4" : "G5";
        return {
          main: fmt(fge, 1),
          mainUnit: "mL/min/1,73 m\xB2",
          secondary: estadio,
          secondaryLabel: "estadio KDIGO",
          interpretation: fge >= 60 ? "Filtrado conservado o levemente reducido. El estadio G1\u2013G2 solo indica enfermedad renal cr\xF3nica si hay adem\xE1s da\xF1o renal (albuminuria, alteraciones estructurales)." : fge >= 30 ? "Reducci\xF3n moderada del filtrado: ajustar f\xE1rmacos, evitar nefrot\xF3xicos y controlar las complicaciones." : fge >= 15 ? "Reducci\xF3n grave: preparar el tratamiento sustitutivo y seguimiento por nefrolog\xEDa." : "Fallo renal: valorar terapia renal sustitutiva.",
          level: fge >= 60 ? "ok" : fge >= 30 ? "warn" : "danger",
          details: ["Ecuaci\xF3n MDRD-4 IDMS. Las gu\xEDas actuales prefieren CKD-EPI, m\xE1s precisa con filtrados altos."]
        };
      },
      notes: [
        "No es v\xE1lida en la insuficiencia renal aguda, en el embarazo ni en situaciones de masa muscular extrema.",
        "Se ha eliminado el coeficiente por raza de las ecuaciones actuales."
      ],
      references: [
        "Levey AS, et al. A more accurate method to estimate glomerular filtration rate from serum creatinine. Ann Intern Med. 1999;130(6):461-70."
      ]
    },
    {
      id: "fena",
      name: "Excreci\xF3n fraccionada de sodio (FENa)",
      shortName: "FENa",
      description: "Diferencia la insuficiencia renal prerrenal de la lesi\xF3n renal intr\xEDnseca.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "naOrina", type: "number", label: "Sodio en orina", unit: "mEq/L", min: 0.1, max: 300, step: 0.1 },
        { id: "naPlasma", type: "number", label: "Sodio plasm\xE1tico", unit: "mEq/L", min: 90, max: 200, step: 0.1 },
        { id: "crOrina", type: "number", label: "Creatinina en orina", unit: "mg/dL", min: 1, max: 500, step: 0.1 },
        { id: "crPlasma", type: "number", label: "Creatinina plasm\xE1tica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 }
      ],
      compute: (v) => {
        const fena = v.naOrina * v.crPlasma / (v.naPlasma * v.crOrina) * 100;
        return {
          main: fmt(fena, 2),
          mainUnit: "%",
          interpretation: fena < 1 ? "FENa < 1 %: sugiere causa prerrenal (hipovolemia, bajo gasto, s\xEDndrome hepatorrenal). Tambi\xE9n puede verse en la glomerulonefritis aguda, la nefropat\xEDa por contraste y la obstrucci\xF3n precoz." : fena > 2 ? "FENa > 2 %: sugiere lesi\xF3n renal intr\xEDnseca, t\xEDpicamente necrosis tubular aguda." : "FENa entre 1 y 2 %: zona indeterminada; interpretar con la cl\xEDnica y la respuesta a fluidos.",
          level: fena < 1 ? "info" : fena > 2 ? "warn" : "warn",
          details: ["FENa = (Na orina \xD7 creatinina plasma) / (Na plasma \xD7 creatinina orina) \xD7 100."]
        };
      },
      notes: ["No es interpretable si el paciente ha recibido diur\xE9ticos: en ese caso usar la excreci\xF3n fraccionada de urea."]
    },
    {
      id: "feurea",
      name: "Excreci\xF3n fraccionada de urea (FEUrea)",
      shortName: "FEUrea",
      description: "Diferencia la azotemia prerrenal de la necrosis tubular aguda; utilizable en pacientes que reciben diur\xE9ticos.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "ureaOrina", type: "number", label: "Urea en orina", unit: "mg/dL", min: 1, max: 5e3, step: 1 },
        { id: "ureaPlasma", type: "number", label: "Urea plasm\xE1tica", unit: "mg/dL", min: 1, max: 500, step: 0.1 },
        { id: "crOrina", type: "number", label: "Creatinina en orina", unit: "mg/dL", min: 1, max: 500, step: 0.1 },
        { id: "crPlasma", type: "number", label: "Creatinina plasm\xE1tica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 }
      ],
      compute: (v) => {
        const fe = v.ureaOrina * v.crPlasma / (v.ureaPlasma * v.crOrina) * 100;
        return {
          main: fmt(fe, 1),
          mainUnit: "%",
          interpretation: fe < 35 ? "FEUrea < 35 %: sugiere azotemia prerrenal." : fe > 50 ? "FEUrea > 50 %: sugiere necrosis tubular aguda." : "Zona intermedia (35\u201350 %): interpretar junto con la cl\xEDnica y la respuesta al tratamiento.",
          level: fe < 35 ? "info" : fe > 50 ? "warn" : "warn",
          details: ["FEUrea = (urea orina \xD7 creatinina plasma) / (urea plasma \xD7 creatinina orina) \xD7 100."]
        };
      },
      notes: ["Si el laboratorio informa BUN en lugar de urea, puede usarse indistintamente siempre que ambas cifras est\xE9n en la misma unidad."]
    },
    {
      id: "akin",
      name: "Clasificaci\xF3n AKIN de la lesi\xF3n renal aguda",
      shortName: "AKIN",
      description: "Grad\xFAa la gravedad de la lesi\xF3n renal aguda.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        {
          id: "creatinina",
          type: "select",
          label: "Criterio de creatinina (en 48 h)",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Sin aumento significativo", value: 0 },
            { label: "Aumento \u2265 0,3 mg/dL o de 1,5\u20132 veces el valor basal", value: 1 },
            { label: "Aumento de m\xE1s de 2 a 3 veces el valor basal", value: 2 },
            { label: "Aumento de m\xE1s de 3 veces, o creatinina \u2265 4 mg/dL con ascenso agudo \u2265 0,5, o necesidad de di\xE1lisis", value: 3 }
          ]
        },
        {
          id: "diuresis",
          type: "select",
          label: "Criterio de diuresis",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Diuresis conservada", value: 0 },
            { label: "< 0,5 mL/kg/h durante m\xE1s de 6 h", value: 1 },
            { label: "< 0,5 mL/kg/h durante m\xE1s de 12 h", value: 2 },
            { label: "< 0,3 mL/kg/h durante 24 h, o anuria durante 12 h", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const estadio = Math.max(v.creatinina ?? 0, v.diuresis ?? 0);
        if (estadio === 0)
          return {
            main: "Sin lesi\xF3n renal aguda",
            interpretation: "No se cumplen criterios AKIN en este momento. Reevaluar si cambia la situaci\xF3n cl\xEDnica.",
            level: "ok"
          };
        return {
          main: `Estadio ${estadio}`,
          interpretation: estadio === 1 ? "Lesi\xF3n renal aguda estadio 1: revisar la volemia, retirar nefrot\xF3xicos, ajustar f\xE1rmacos y monitorizar diuresis y creatinina." : estadio === 2 ? "Estadio 2: adem\xE1s de lo anterior, valoraci\xF3n por nefrolog\xEDa y vigilancia de complicaciones." : "Estadio 3: valorar terapia renal sustitutiva, especialmente ante hiperpotasemia refractaria, acidosis grave, sobrecarga de volumen o uremia sintom\xE1tica.",
          level: estadio === 1 ? "warn" : "danger",
          details: ["Se asigna el estadio m\xE1s alto de los dos criterios (creatinina o diuresis)."]
        };
      },
      notes: ["Los criterios exigen que el diagn\xF3stico se haga en las primeras 48 h y tras optimizar el estado de volemia."],
      references: [
        "Mehta RL, et al. Acute Kidney Injury Network: report of an initiative to improve outcomes in acute kidney injury. Crit Care. 2007;11(2):R31."
      ]
    },
    {
      id: "bun-creatinina",
      name: "Cociente BUN/creatinina",
      shortName: "BUN/creatinina",
      description: "Ayuda a orientar la causa de la insuficiencia renal y a detectar hemorragia digestiva alta.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "bun", type: "number", label: "BUN (nitr\xF3geno ureico)", unit: "mg/dL", min: 1, max: 250, step: 0.1 },
        { id: "creatinina", type: "number", label: "Creatinina s\xE9rica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 }
      ],
      compute: (v) => {
        const ratio = v.bun / v.creatinina;
        return {
          main: fmt(ratio, 1),
          interpretation: ratio > 20 ? "Cociente > 20: sugiere causa prerrenal (hipovolemia, bajo gasto), hemorragia digestiva alta, dieta hiperproteica o corticoides." : ratio < 10 ? "Cociente < 10: sugiere lesi\xF3n renal intr\xEDnseca, malnutrici\xF3n, hepatopat\xEDa o rabdomi\xF3lisis." : "Cociente en rango habitual (10\u201320).",
          level: ratio > 20 || ratio < 10 ? "warn" : "ok",
          details: ["Si el laboratorio informa urea en lugar de BUN: BUN = urea / 2,14."]
        };
      }
    },
    {
      id: "deficit-agua-libre",
      name: "D\xE9ficit de agua libre en la hipernatremia",
      shortName: "D\xE9ficit de agua libre",
      description: "Calcula el agua libre necesaria para corregir la hipernatremia o la deshidrataci\xF3n.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        {
          id: "poblacion",
          type: "select",
          label: "Grupo de paciente (fracci\xF3n de agua corporal)",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Var\xF3n adulto (0,6)", value: 0.6 },
            { label: "Mujer adulta (0,5)", value: 0.5 },
            { label: "Var\xF3n anciano (0,5)", value: 0.5001 },
            { label: "Mujer anciana (0,45)", value: 0.45 },
            { label: "Ni\xF1o (0,6)", value: 0.6001 }
          ],
          default: 0.6
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 3, max: 300, step: 0.5 },
        { id: "naActual", type: "number", label: "Sodio actual", unit: "mEq/L", min: 120, max: 200, step: 0.1 },
        { id: "naObjetivo", type: "number", label: "Sodio objetivo", unit: "mEq/L", min: 120, max: 160, step: 0.1 }
      ],
      compute: (v) => {
        const acT = (v.poblacion ?? 0.6) * v.peso;
        if (v.naActual <= v.naObjetivo)
          return {
            main: "\u2014",
            interpretation: "El sodio actual debe ser mayor que el objetivo para calcular un d\xE9ficit de agua libre.",
            level: "warn"
          };
        const deficit = acT * (v.naActual / v.naObjetivo - 1);
        const horas24 = (v.naActual - v.naObjetivo) / 0.5;
        return {
          main: fmt(deficit * 1e3, 0),
          mainUnit: "mL de agua libre",
          secondary: fmt(acT, 1),
          secondaryLabel: "agua corporal total (L)",
          interpretation: "Reponer de forma gradual, sin bajar el sodio m\xE1s de 10\u201312 mEq/L al d\xEDa (0,5 mEq/L por hora) para evitar el edema cerebral. A\xF1adir a este d\xE9ficit las p\xE9rdidas insensibles y las p\xE9rdidas en curso.",
          level: "info",
          details: [
            `Tiempo m\xEDnimo de correcci\xF3n recomendado: ${fmt(horas24, 0)} h a un ritmo de 0,5 mEq/L por hora.`,
            "D\xE9ficit = agua corporal total \xD7 (sodio actual / sodio objetivo \u2212 1)."
          ]
        };
      },
      notes: ["En la hipernatremia de instauraci\xF3n aguda (< 48 h) puede corregirse m\xE1s r\xE1pido; en la cr\xF3nica, nunca m\xE1s de 10 mEq/L al d\xEDa."]
    },
    {
      id: "deficit-bicarbonato",
      name: "D\xE9ficit de bicarbonato",
      shortName: "D\xE9ficit de bicarbonato",
      description: "Calcula el d\xE9ficit corporal total de bicarbonato en la acidosis metab\xF3lica.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 3, max: 300, step: 0.5 },
        { id: "actual", type: "number", label: "Bicarbonato actual", unit: "mEq/L", min: 1, max: 40, step: 0.1 },
        { id: "objetivo", type: "number", label: "Bicarbonato objetivo", unit: "mEq/L", min: 5, max: 30, step: 0.1 },
        {
          id: "distribucion",
          type: "select",
          label: "Volumen de distribuci\xF3n",
          noPoints: true,
          options: [
            { label: "0,4 \xD7 peso (habitual)", value: 0.4 },
            { label: "0,5 \xD7 peso (acidosis grave)", value: 0.5 },
            { label: "0,6 \xD7 peso (acidosis muy grave)", value: 0.6 }
          ],
          default: 0.4
        }
      ],
      compute: (v) => {
        if (v.objetivo <= v.actual)
          return {
            main: "\u2014",
            interpretation: "El bicarbonato objetivo debe ser mayor que el actual.",
            level: "warn"
          };
        const deficit = (v.distribucion ?? 0.4) * v.peso * (v.objetivo - v.actual);
        return {
          main: fmt(deficit, 0),
          mainUnit: "mEq de bicarbonato",
          secondary: fmt(deficit / 2, 0),
          secondaryLabel: "mEq de la mitad de la dosis",
          interpretation: "Administrar como m\xE1ximo la mitad del d\xE9ficit calculado y reevaluar la gasometr\xEDa: la correcci\xF3n r\xE1pida puede provocar hipopotasemia, hipocalcemia, hipernatremia, sobrecarga de volumen, acidosis intracelular parad\xF3jica y desplazamiento de la curva de disociaci\xF3n de la hemoglobina.",
          level: "warn",
          details: [
            "D\xE9ficit = volumen de distribuci\xF3n \xD7 peso \xD7 (bicarbonato objetivo \u2212 actual).",
            "El bicarbonato no est\xE1 indicado de forma sistem\xE1tica en la acidosis l\xE1ctica ni en la cetoacidosis diab\xE9tica; lo prioritario es tratar la causa."
          ]
        };
      }
    },
    {
      id: "kt-v",
      name: "Kt/V para la adecuaci\xF3n de la hemodi\xE1lisis (Daugirdas)",
      shortName: "Kt/V",
      description: "Cuantifica la dosis de di\xE1lisis administrada en una sesi\xF3n de hemodi\xE1lisis.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "preUrea", type: "number", label: "Urea (o BUN) antes de la sesi\xF3n", unit: "mg/dL", min: 5, max: 400, step: 0.1 },
        { id: "postUrea", type: "number", label: "Urea (o BUN) despu\xE9s de la sesi\xF3n", unit: "mg/dL", min: 1, max: 400, step: 0.1 },
        { id: "horas", type: "number", label: "Duraci\xF3n de la sesi\xF3n", unit: "h", min: 0.5, max: 12, step: 0.25 },
        { id: "ufv", type: "number", label: "Volumen de ultrafiltraci\xF3n", unit: "L", min: 0, max: 10, step: 0.1 },
        { id: "peso", type: "number", label: "Peso posdi\xE1lisis", unit: "kg", min: 20, max: 250, step: 0.1 }
      ],
      compute: (v) => {
        const r = v.postUrea / v.preUrea;
        if (r >= 1)
          return {
            main: "\u2014",
            interpretation: "La urea posdi\xE1lisis debe ser menor que la predial\xEDtica.",
            level: "warn"
          };
        const ktv = -Math.log(r - 8e-3 * v.horas) + (4 - 3.5 * r) * (v.ufv / v.peso);
        const urr = (1 - r) * 100;
        return {
          main: fmt(ktv, 2),
          mainUnit: "Kt/V",
          secondary: `${fmt(urr, 0)} %`,
          secondaryLabel: "tasa de reducci\xF3n de urea (URR)",
          interpretation: ktv >= 1.2 ? "Dosis de di\xE1lisis adecuada (Kt/V \u2265 1,2 por sesi\xF3n en pauta de tres sesiones semanales; objetivo habitual \u2265 1,4)." : "Dosis de di\xE1lisis insuficiente (< 1,2): revisar el tiempo de sesi\xF3n, el flujo sangu\xEDneo, el acceso vascular y el dializador.",
          level: ktv >= 1.2 ? "ok" : "danger",
          details: ["F\xF3rmula de Daugirdas de segunda generaci\xF3n.", "La URR objetivo equivalente es \u2265 65 %."]
        };
      },
      references: [
        "Daugirdas JT. Second generation logarithmic estimates of single-pool variable volume Kt/V. J Am Soc Nephrol. 1993;4(5):1205-13."
      ]
    }
  ];

  // src/calculators/hepato-digestivo.ts
  var CAT18 = "Hepatolog\xEDa y digestivo";
  var UCI5 = ["Medicina Intensiva"];
  var escala4 = (items) => items.map(([value, label]) => ({ label: `${value} \u2014 ${label}`, value }));
  var hepatoDigestivo = [
    {
      id: "child-pugh",
      name: "Puntuaci\xF3n de Child-Pugh para la cirrosis",
      shortName: "Child-Pugh",
      description: "Estima la gravedad y el pron\xF3stico de la cirrosis hep\xE1tica.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        {
          id: "bilirrubina",
          type: "select",
          label: "Bilirrubina total (mg/dL)",
          options: [
            { label: "< 2", value: 1 },
            { label: "2\u20133", value: 2 },
            { label: "> 3", value: 3 }
          ]
        },
        {
          id: "albumina",
          type: "select",
          label: "Alb\xFAmina (g/dL)",
          options: [
            { label: "> 3,5", value: 1 },
            { label: "2,8\u20133,5", value: 2 },
            { label: "< 2,8", value: 3 }
          ]
        },
        {
          id: "inr",
          type: "select",
          label: "INR",
          options: [
            { label: "< 1,7", value: 1 },
            { label: "1,7\u20132,3", value: 2 },
            { label: "> 2,3", value: 3 }
          ]
        },
        {
          id: "ascitis",
          type: "select",
          label: "Ascitis",
          options: [
            { label: "Ausente", value: 1 },
            { label: "Leve, controlada con diur\xE9ticos", value: 2 },
            { label: "Moderada-grave, refractaria", value: 3 }
          ]
        },
        {
          id: "encefalopatia",
          type: "select",
          label: "Encefalopat\xEDa hep\xE1tica",
          options: [
            { label: "Ausente", value: 1 },
            { label: "Grado I\u2013II (o controlada con tratamiento)", value: 2 },
            { label: "Grado III\u2013IV (o refractaria)", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["bilirrubina", "albumina", "inr", "ascitis", "encefalopatia"]);
        const clase = score <= 6 ? "A" : score <= 9 ? "B" : "C";
        const superv = clase === "A" ? "100 % / 85 %" : clase === "B" ? "81 % / 57 %" : "45 % / 35 %";
        return {
          main: String(score),
          mainUnit: `puntos (5\u201315) \u2014 clase ${clase}`,
          secondary: superv,
          secondaryLabel: "supervivencia a 1 y 2 a\xF1os",
          interpretation: clase === "A" ? "Cirrosis compensada (clase A): buen pron\xF3stico a corto plazo; cribado de varices y de hepatocarcinoma." : clase === "B" ? "Deterioro funcional significativo (clase B): valorar remisi\xF3n a una unidad de trasplante y control estrecho de las complicaciones." : "Enfermedad hep\xE1tica descompensada (clase C): pron\xF3stico grave; valoraci\xF3n de trasplante y manejo intensivo de las complicaciones.",
          level: clase === "A" ? "ok" : clase === "B" ? "warn" : "danger"
        };
      },
      notes: [
        "La clase de Child-Pugh tambi\xE9n predice el riesgo quir\xFArgico: la mortalidad perioperatoria en cirug\xEDa abdominal es aproximadamente del 10 % en la clase A, del 30 % en la B y del 70\u201380 % en la C.",
        "En la colangitis biliar primaria, los puntos de corte de bilirrubina son distintos (< 4, 4\u201310 y > 10 mg/dL)."
      ],
      references: [
        "Pugh RN, et al. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg. 1973;60(8):646-9."
      ]
    },
    {
      id: "meld",
      name: "Puntuaci\xF3n MELD y MELD-Na",
      shortName: "MELD / MELD-Na",
      description: "Cuantifica la gravedad de la hepatopat\xEDa terminal y prioriza en las listas de trasplante.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "bilirrubina", type: "number", label: "Bilirrubina total", unit: "mg/dL", min: 0.1, max: 60, step: 0.1 },
        { id: "inr", type: "number", label: "INR", min: 0.5, max: 20, step: 0.01 },
        { id: "creatinina", type: "number", label: "Creatinina s\xE9rica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 },
        { id: "sodio", type: "number", label: "Sodio s\xE9rico", unit: "mEq/L", min: 100, max: 175, step: 0.1 },
        {
          id: "dialisis",
          type: "boolean",
          label: "Di\xE1lisis \u2265 2 veces en la \xFAltima semana o hemofiltraci\xF3n \u2265 24 h",
          description: "En ese caso, la creatinina se fija en 4,0 mg/dL.",
          noPoints: true
        }
      ],
      compute: (v) => {
        const acotar = (x, min, max) => Math.min(Math.max(x, min), max);
        const bili = acotar(v.bilirrubina, 1, 99);
        const inr = acotar(v.inr, 1, 99);
        const crea = v.dialisis === 1 ? 4 : acotar(v.creatinina, 1, 4);
        const meldRaw = 0.957 * Math.log(crea) + 0.378 * Math.log(bili) + 1.12 * Math.log(inr) + 0.643;
        let meld = Math.round(meldRaw * 10);
        meld = acotar(meld, 6, 40);
        const na = acotar(v.sodio, 125, 137);
        let meldNa = meld;
        if (meld > 11) {
          meldNa = Math.round(meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na));
          meldNa = acotar(meldNa, 6, 40);
        }
        const mort = meldNa <= 9 ? "1,9 %" : meldNa <= 19 ? "6,0 %" : meldNa <= 29 ? "19,6 %" : meldNa <= 39 ? "52,6 %" : "71,3 %";
        return {
          main: String(meldNa),
          mainUnit: "MELD-Na (6\u201340)",
          secondary: String(meld),
          secondaryLabel: "MELD sin sodio",
          interpretation: `Mortalidad estimada a 3 meses: ${mort}. ${meldNa >= 15 ? "Un MELD \u2265 15 es el umbral habitual a partir del cual el trasplante hep\xE1tico aporta beneficio en supervivencia: remitir a una unidad de trasplante." : "Por debajo de 15, el riesgo del trasplante suele superar al beneficio; seguimiento y tratamiento de las complicaciones."}`,
          level: meldNa <= 9 ? "ok" : meldNa <= 19 ? "warn" : "danger",
          details: [
            "Todos los valores menores de 1,0 se elevan a 1,0; la creatinina se limita a un m\xE1ximo de 4,0 mg/dL.",
            "La correcci\xF3n por sodio solo se aplica si el MELD es mayor de 11."
          ]
        };
      },
      notes: [
        "Desde 2023 la UNOS emplea el MELD 3.0, que incorpora el sexo y la alb\xFAmina; aqu\xED se muestra el MELD-Na cl\xE1sico, todav\xEDa muy utilizado.",
        "No aplicable a menores de 12 a\xF1os (usar PELD)."
      ],
      references: [
        "Kamath PS, et al. A model to predict survival in patients with end-stage liver disease. Hepatology. 2001;33(2):464-70.",
        "Kim WR, et al. Hyponatremia and mortality among patients on the liver-transplant waiting list. N Engl J Med. 2008;359(10):1018-26."
      ]
    },
    {
      id: "maddrey",
      name: "Funci\xF3n discriminante de Maddrey para la hepatitis alcoh\xF3lica",
      shortName: "Maddrey",
      description: "Predice el pron\xF3stico de la hepatitis alcoh\xF3lica y orienta la indicaci\xF3n de corticoides.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "tp", type: "number", label: "Tiempo de protrombina del paciente", unit: "s", min: 5, max: 120, step: 0.1 },
        { id: "control", type: "number", label: "Tiempo de protrombina control", unit: "s", min: 5, max: 30, step: 0.1 },
        { id: "bilirrubina", type: "number", label: "Bilirrubina total", unit: "mg/dL", min: 0.1, max: 60, step: 0.1 }
      ],
      compute: (v) => {
        const df = 4.6 * (v.tp - v.control) + v.bilirrubina;
        return {
          main: fmt(df, 1),
          interpretation: df >= 32 ? "Funci\xF3n discriminante \u2265 32: hepatitis alcoh\xF3lica grave, con mortalidad a corto plazo del 30\u201350 % sin tratamiento. Se considera la indicaci\xF3n de corticoides (prednisolona 40 mg/d\xEDa durante 28 d\xEDas) si no hay contraindicaci\xF3n (infecci\xF3n activa, hemorragia digestiva, insuficiencia renal, pancreatitis)." : "Funci\xF3n discriminante < 32: hepatitis alcoh\xF3lica no grave; no est\xE1 indicado el tratamiento con corticoides. Abstinencia, soporte nutricional y tratamiento del s\xEDndrome de abstinencia.",
          level: df >= 32 ? "danger" : "ok",
          details: ["Funci\xF3n discriminante = 4,6 \xD7 (TP paciente \u2212 TP control) + bilirrubina."]
        };
      },
      references: [
        "Maddrey WC, et al. Corticosteroid therapy of alcoholic hepatitis. Gastroenterology. 1978;75(2):193-9."
      ]
    },
    {
      id: "glasgow-hepatitis",
      name: "Puntuaci\xF3n de Glasgow para la hepatitis alcoh\xF3lica (GAHS)",
      shortName: "GAHS",
      description: "Predice la mortalidad en la hepatitis alcoh\xF3lica.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 50 a\xF1os", value: 1 },
            { label: "\u2265 50 a\xF1os", value: 2 }
          ]
        },
        {
          id: "leucocitos",
          type: "select",
          label: "Leucocitos (\xD710\u2079/L)",
          options: [
            { label: "< 15", value: 1 },
            { label: "\u2265 15", value: 2 }
          ]
        },
        {
          id: "urea",
          type: "select",
          label: "Urea (mg/dL)",
          options: [
            { label: "< 42 (BUN < 19,6)", value: 1 },
            { label: "\u2265 42", value: 2 }
          ]
        },
        {
          id: "inr",
          type: "select",
          label: "INR",
          options: [
            { label: "< 1,5", value: 1 },
            { label: "1,5\u20132,0", value: 2 },
            { label: "> 2,0", value: 3 }
          ]
        },
        {
          id: "bilirrubina",
          type: "select",
          label: "Bilirrubina (mg/dL)",
          options: [
            { label: "< 7,3", value: 1 },
            { label: "7,3\u201314,6", value: 2 },
            { label: "> 14,6", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "leucocitos", "urea", "inr", "bilirrubina"]);
        return {
          main: String(score),
          mainUnit: "puntos (5\u201312)",
          interpretation: score >= 9 ? "GAHS \u2265 9: mortalidad elevada (supervivencia a 28 d\xEDas \u2248 46 % sin tratamiento). Es el subgrupo que m\xE1s se beneficia de los corticoides cuando la funci\xF3n discriminante de Maddrey tambi\xE9n es \u2265 32." : "GAHS < 9: mejor pron\xF3stico (supervivencia a 28 d\xEDas \u2248 87 %); el beneficio de los corticoides es dudoso en este grupo.",
          level: score >= 9 ? "danger" : "ok"
        };
      },
      references: [
        "Forrest EH, et al. Analysis of factors predictive of mortality in alcoholic hepatitis and derivation and validation of the Glasgow alcoholic hepatitis score. Gut. 2005;54(8):1174-9."
      ]
    },
    {
      id: "lille",
      name: "Modelo de Lille para la hepatitis alcoh\xF3lica",
      shortName: "Lille",
      description: "Eval\xFAa a los 7 d\xEDas la respuesta al tratamiento con corticoides en la hepatitis alcoh\xF3lica.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 18, max: 100 },
        { id: "albumina", type: "number", label: "Alb\xFAmina al ingreso", unit: "g/L", min: 5, max: 60, step: 0.1 },
        { id: "bili0", type: "number", label: "Bilirrubina al ingreso", unit: "mg/dL", min: 0.1, max: 60, step: 0.1 },
        { id: "bili7", type: "number", label: "Bilirrubina el d\xEDa 7", unit: "mg/dL", min: 0.1, max: 60, step: 0.1 },
        { id: "creatinina", type: "number", label: "Creatinina", unit: "mg/dL", min: 0.1, max: 15, step: 0.01 },
        { id: "tp", type: "number", label: "Tiempo de protrombina", unit: "s", min: 5, max: 120, step: 0.1 }
      ],
      compute: (v) => {
        const bili0 = v.bili0 * 17.1;
        const bili7 = v.bili7 * 17.1;
        const insufRenal = v.creatinina > 1.3 ? 1 : 0;
        const R = 3.19 - 0.101 * v.edad + 0.0147 * v.albumina + 0.0165 * (bili0 - bili7) - 0.206 * insufRenal - 65e-4 * bili0 - 96e-4 * v.tp;
        const lille = Math.exp(-R) / (1 + Math.exp(-R));
        const noRespondedor = lille >= 0.45;
        return {
          main: fmt(lille, 3),
          mainUnit: "\xEDndice de Lille (0\u20131)",
          secondary: noRespondedor ? "No respondedor" : "Respondedor",
          interpretation: noRespondedor ? "\xCDndice \u2265 0,45: no respondedor a los corticoides (supervivencia a 6 meses \u2248 25 %). Se recomienda suspender el tratamiento y valorar alternativas, incluido el trasplante en casos muy seleccionados." : "\xCDndice < 0,45: respondedor a los corticoides (supervivencia a 6 meses \u2248 85 %). Completar el ciclo de 28 d\xEDas.",
          level: noRespondedor ? "danger" : "ok",
          details: [
            `Insuficiencia renal (creatinina > 1,3 mg/dL): ${insufRenal ? "s\xED" : "no"}.`,
            "Las bilirrubinas se convierten internamente a \xB5mol/L (\xD7 17,1)."
          ]
        };
      },
      notes: ["Se calcula tras 7 d\xEDas de tratamiento con corticoides; no es aplicable antes."],
      references: [
        "Louvet A, et al. The Lille model: a new tool for therapeutic strategy in patients with severe alcoholic hepatitis treated with steroids. Hepatology. 2007;45(6):1348-54."
      ]
    },
    {
      id: "kings-college",
      name: "Criterios del King's College para la insuficiencia hep\xE1tica aguda",
      shortName: "King's College",
      description: "Identifica a los pacientes con insuficiencia hep\xE1tica aguda que deben remitirse con urgencia para trasplante.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        {
          id: "etiologia",
          type: "select",
          label: "Etiolog\xEDa",
          noPoints: true,
          options: [
            { label: "Paracetamol", value: 0 },
            { label: "No paracetamol", value: 1 }
          ]
        },
        { id: "ph", type: "boolean", label: "Paracetamol: pH arterial < 7,30 tras la reanimaci\xF3n con fluidos", noPoints: true },
        { id: "lactato", type: "boolean", label: "Paracetamol: lactato > 3,0 mmol/L tras reanimaci\xF3n", noPoints: true },
        { id: "triada", type: "boolean", label: "Paracetamol: INR > 6,5 Y creatinina > 3,4 mg/dL Y encefalopat\xEDa grado III\u2013IV, en 24 h", noPoints: true },
        { id: "inrAlto", type: "boolean", label: "No paracetamol: INR > 6,5 (tiempo de protrombina > 100 s)", noPoints: true },
        {
          id: "menores",
          type: "select",
          label: "No paracetamol: n\xFAmero de criterios menores presentes",
          description: "Edad < 10 o > 40 a\xF1os; etiolog\xEDa desfavorable (hepatitis no A no B, halotano, reacci\xF3n idiosincr\xE1sica); ictericia > 7 d\xEDas antes de la encefalopat\xEDa; INR > 3,5; bilirrubina > 17,5 mg/dL.",
          dropdown: true,
          noPoints: true,
          options: escala4([
            [0, "Ninguno"],
            [1, "Uno"],
            [2, "Dos"],
            [3, "Tres"],
            [4, "Cuatro"],
            [5, "Cinco"]
          ])
        }
      ],
      compute: (v) => {
        const paracetamol = v.etiologia === 0;
        const cumple = paracetamol ? v.ph === 1 || v.lactato === 1 || v.triada === 1 : v.inrAlto === 1 || (v.menores ?? 0) >= 3;
        return {
          main: cumple ? "Criterios cumplidos" : "Criterios no cumplidos",
          interpretation: cumple ? "Se cumplen los criterios del King's College: mal pron\xF3stico sin trasplante. Contactar de forma urgente con una unidad de trasplante hep\xE1tico." : "No se cumplen los criterios en este momento, lo que no descarta la progresi\xF3n: reevaluar de forma seriada y contactar precozmente con la unidad de trasplante si hay deterioro.",
          level: cumple ? "danger" : "warn",
          details: [
            paracetamol ? "V\xEDa paracetamol: basta el pH < 7,30, o el lactato > 3,0 tras reanimaci\xF3n, o la tr\xEDada completa de INR, creatinina y encefalopat\xEDa." : "V\xEDa no paracetamol: basta el INR > 6,5, o tres o m\xE1s criterios menores."
          ]
        };
      },
      notes: ["Estos criterios tienen alta especificidad pero sensibilidad limitada: no deben retrasar la derivaci\xF3n de un paciente que empeora."],
      references: [
        "O'Grady JG, et al. Early indicators of prognosis in fulminant hepatic failure. Gastroenterology. 1989;97(2):439-45."
      ]
    },
    {
      id: "bisap",
      name: "Puntuaci\xF3n BISAP para la pancreatitis aguda",
      shortName: "BISAP",
      description: "Predice la mortalidad en la pancreatitis aguda en las primeras 24 horas.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "bun", type: "boolean", label: "BUN > 25 mg/dL (urea > 53 mg/dL) (B)" },
        { id: "mental", type: "boolean", label: "Alteraci\xF3n del estado mental (I)" },
        {
          id: "sirs",
          type: "boolean",
          label: "S\xEDndrome de respuesta inflamatoria sist\xE9mica (S)",
          description: "\u2265 2 de: temperatura < 36 o > 38 \xB0C; FC > 90 lpm; FR > 20 rpm o PaCO\u2082 < 32 mmHg; leucocitos < 4.000 o > 12.000 o > 10 % de cayados."
        },
        { id: "edad", type: "boolean", label: "Edad > 60 a\xF1os (A)" },
        { id: "derrame", type: "boolean", label: "Derrame pleural en la imagen (P)" }
      ],
      compute: (v) => {
        const score = sum(v, ["bun", "mental", "sirs", "edad", "derrame"]);
        const mort = ["< 1 %", "< 1 %", "1,6 %", "3,6 %", "7,4 %", "9,5 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20135)",
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria",
          interpretation: score <= 2 ? "Riesgo bajo de mortalidad: manejo convencional con hidrataci\xF3n, analgesia y nutrici\xF3n precoz." : "Riesgo elevado (\u2265 3): pancreatitis grave probable; valorar cuidados intermedios o intensivos, monitorizaci\xF3n estrecha y reevaluaci\xF3n frecuente.",
          level: score <= 2 ? "ok" : "danger"
        };
      },
      references: [
        "Wu BU, et al. The early prediction of mortality in acute pancreatitis: a large population-based study. Gut. 2008;57(12):1698-703."
      ]
    },
    {
      id: "haps",
      name: "Puntuaci\xF3n HAPS de pancreatitis aguda leve",
      shortName: "HAPS",
      description: "Identifica en las primeras horas a los pacientes con pancreatitis aguda que tendr\xE1n un curso leve.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "peritoneo", type: "boolean", label: "Signos de irritaci\xF3n peritoneal (defensa o rebote)" },
        { id: "creatinina", type: "boolean", label: "Creatinina \u2265 2 mg/dL" },
        { id: "hematocrito", type: "boolean", label: "Hematocrito elevado (\u2265 43 % en varones o \u2265 39,6 % en mujeres)" }
      ],
      compute: (v) => {
        const score = sum(v, ["peritoneo", "creatinina", "hematocrito"]);
        return {
          main: String(score),
          mainUnit: score === 1 ? "criterio" : "criterios",
          interpretation: score === 0 ? "Ning\xFAn criterio presente: curso leve muy probable (valor predictivo positivo \u2248 98 % para pancreatitis no grave). Puede manejarse fuera de cuidados intensivos." : "Al menos un criterio presente: no puede predecirse un curso leve; mantener la monitorizaci\xF3n habitual y estratificar con otras escalas (BISAP, criterios de Atlanta).",
          level: score === 0 ? "ok" : "warn"
        };
      },
      notes: ["Se eval\xFAa en los primeros 30\u201360 minutos desde el ingreso."],
      references: [
        "Lankisch PG, et al. The harmless acute pancreatitis score: a clinical algorithm for rapid initial stratification of nonsevere disease. Clin Gastroenterol Hepatol. 2009;7(6):702-5."
      ]
    },
    {
      id: "glasgow-blatchford",
      name: "Puntuaci\xF3n de Glasgow-Blatchford para la hemorragia digestiva alta",
      shortName: "Glasgow-Blatchford",
      description: "Identifica a los pacientes con hemorragia digestiva alta de bajo riesgo que pueden manejarse de forma ambulatoria.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        {
          id: "urea",
          type: "select",
          label: "Urea s\xE9rica (mg/dL)",
          dropdown: true,
          options: [
            { label: "< 39", value: 0 },
            { label: "39\u201348", value: 2 },
            { label: "48\u201360", value: 3 },
            { label: "60\u2013150", value: 4 },
            { label: "\u2265 150", value: 6 }
          ]
        },
        {
          id: "hb",
          type: "select",
          label: "Hemoglobina",
          dropdown: true,
          options: [
            { label: "Var\xF3n \u2265 13 o mujer \u2265 12 g/dL", value: 0 },
            { label: "Var\xF3n 12\u201313 g/dL", value: 1 },
            { label: "Mujer 10\u201312 g/dL", value: 1.0001 },
            { label: "Var\xF3n 10\u201312 g/dL", value: 3 },
            { label: "< 10 g/dL (cualquier sexo)", value: 6 }
          ]
        },
        {
          id: "pas",
          type: "select",
          label: "Presi\xF3n arterial sist\xF3lica (mmHg)",
          dropdown: true,
          options: [
            { label: "\u2265 110", value: 0 },
            { label: "100\u2013109", value: 1 },
            { label: "90\u201399", value: 2 },
            { label: "< 90", value: 3 }
          ]
        },
        { id: "fc", type: "boolean", label: "Frecuencia card\xEDaca \u2265 100 lpm" },
        { id: "melenas", type: "boolean", label: "Melenas" },
        { id: "sincope", type: "boolean", label: "S\xEDncope", points: 2 },
        { id: "hepatopatia", type: "boolean", label: "Hepatopat\xEDa", points: 2 },
        { id: "cardiaca", type: "boolean", label: "Insuficiencia card\xEDaca", points: 2 }
      ],
      compute: (v) => {
        const score = Math.round(
          sum(v, ["urea", "hb", "pas", "fc", "melenas", "sincope", "hepatopatia", "cardiaca"])
        );
        return {
          main: String(score),
          mainUnit: "puntos (0\u201323)",
          interpretation: score === 0 ? "Puntuaci\xF3n 0: riesgo muy bajo de necesitar intervenci\xF3n (transfusi\xF3n, endoscopia terap\xE9utica o cirug\xEDa) o de fallecer. Candidato a manejo ambulatorio con endoscopia preferente." : score <= 1 ? "Puntuaci\xF3n \u2264 1: riesgo bajo; algunos protocolos admiten el manejo ambulatorio con este umbral." : "Puntuaci\xF3n \u2265 2: riesgo aumentado de precisar intervenci\xF3n; se recomienda ingreso y endoscopia en las primeras 24 h.",
          level: score <= 1 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      notes: ["A diferencia de la escala de Rockall, no requiere datos endosc\xF3picos, por lo que puede aplicarse en el primer contacto."],
      references: [
        "Blatchford O, et al. A risk score to predict need for treatment for upper-gastrointestinal haemorrhage. Lancet. 2000;356(9238):1318-21."
      ]
    },
    {
      id: "aims65",
      name: "Puntuaci\xF3n AIMS65 para la hemorragia digestiva alta",
      shortName: "AIMS65",
      description: "Predice la mortalidad hospitalaria en la hemorragia digestiva alta.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "albumina", type: "boolean", label: "Alb\xFAmina < 3 g/dL (A)" },
        { id: "inr", type: "boolean", label: "INR > 1,5 (I)" },
        { id: "mental", type: "boolean", label: "Alteraci\xF3n del estado mental (M)" },
        { id: "pas", type: "boolean", label: "PA sist\xF3lica \u2264 90 mmHg (S)" },
        { id: "edad", type: "boolean", label: "Edad > 65 a\xF1os (65)" }
      ],
      compute: (v) => {
        const score = sum(v, ["albumina", "inr", "mental", "pas", "edad"]);
        const mort = ["0,3 %", "1 %", "3 %", "9 %", "15 %", "25 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20135)",
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria",
          interpretation: score <= 1 ? "Riesgo bajo de mortalidad." : "Riesgo elevado (\u2265 2): ingreso, reanimaci\xF3n y endoscopia precoz; valorar el nivel de cuidados.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      references: [
        "Saltzman JR, et al. A simple risk score accurately predicts in-hospital mortality, length of stay, and cost in acute upper GI bleeding. Gastrointest Endosc. 2011;74(6):1215-24."
      ]
    },
    {
      id: "oakland",
      name: "Puntuaci\xF3n de Oakland para la hemorragia digestiva baja",
      shortName: "Oakland",
      description: "Identifica a los pacientes con hemorragia digestiva baja que pueden recibir el alta de forma segura.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          dropdown: true,
          options: [
            { label: "< 40 a\xF1os", value: 0 },
            { label: "40\u201369 a\xF1os", value: 1 },
            { label: "\u2265 70 a\xF1os", value: 2 }
          ]
        },
        { id: "varon", type: "boolean", label: "Sexo masculino" },
        { id: "ingresoPrevio", type: "boolean", label: "Ingreso previo por hemorragia digestiva baja" },
        { id: "tacto", type: "boolean", label: "Sangre en el tacto rectal" },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia card\xEDaca (lpm)",
          dropdown: true,
          options: [
            { label: "< 70", value: 0 },
            { label: "70\u201389", value: 1 },
            { label: "90\u2013109", value: 2 },
            { label: "\u2265 110", value: 3 }
          ]
        },
        {
          id: "pas",
          type: "select",
          label: "Presi\xF3n arterial sist\xF3lica (mmHg)",
          dropdown: true,
          options: [
            { label: "\u2265 160", value: 0 },
            { label: "130\u2013159", value: 2 },
            { label: "120\u2013129", value: 3 },
            { label: "110\u2013119", value: 4 },
            { label: "< 110", value: 5 }
          ]
        },
        {
          id: "hb",
          type: "select",
          label: "Hemoglobina (g/dL)",
          dropdown: true,
          options: [
            { label: "\u2265 16", value: 0 },
            { label: "14,0\u201315,9", value: 4 },
            { label: "12,0\u201313,9", value: 8 },
            { label: "10,0\u201311,9", value: 14 },
            { label: "7,0\u20139,9", value: 22 },
            { label: "< 7,0", value: 21 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "varon", "ingresoPrevio", "tacto", "fc", "pas", "hb"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201335)",
          interpretation: score <= 8 ? "Puntuaci\xF3n \u2264 8: riesgo bajo (probabilidad \u2248 95 % de alta segura sin transfusi\xF3n, hemostasia ni muerte). Candidato a manejo ambulatorio." : "Puntuaci\xF3n > 8: riesgo aumentado de eventos adversos; se recomienda ingreso y estudio.",
          level: score <= 8 ? "ok" : "warn"
        };
      },
      references: [
        "Oakland K, et al. Derivation and validation of a novel risk score for safe discharge after acute lower gastrointestinal bleeding. Lancet Gastroenterol Hepatol. 2017;2(9):635-43."
      ]
    },
    {
      id: "bard",
      name: "Puntuaci\xF3n BARD de fibrosis en la esteatosis hep\xE1tica no alcoh\xF3lica",
      shortName: "BARD",
      description: "Predice el riesgo de fibrosis avanzada en el h\xEDgado graso no alcoh\xF3lico.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "imc", type: "boolean", label: "IMC \u2265 28 kg/m\xB2 (B)" },
        {
          id: "ast",
          type: "boolean",
          label: "Cociente AST/ALT \u2265 0,8 (A)",
          points: 2
        },
        { id: "diabetes", type: "boolean", label: "Diabetes mellitus (D)" }
      ],
      compute: (v) => {
        const score = sum(v, ["imc", "ast", "diabetes"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20134)",
          interpretation: score >= 2 ? "BARD \u2265 2: riesgo aumentado de fibrosis avanzada (odds ratio \u2248 17); completar el estudio con elastograf\xEDa u otros marcadores no invasivos." : "BARD 0\u20131: fibrosis avanzada poco probable (valor predictivo negativo \u2248 96 %).",
          level: score >= 2 ? "warn" : "ok"
        };
      },
      references: [
        "Harrison SA, et al. Development and validation of a simple NAFLD clinical scoring system for identifying patients without advanced disease. Gut. 2008;57(10):1441-7."
      ]
    }
  ];

  // src/calculators/hemato-trauma.ts
  var CAT_HEM = "Hematolog\xEDa y oncolog\xEDa";
  var CAT_TRAUMA = "Trauma y quemados";
  var UCI6 = ["Medicina Intensiva"];
  var escala5 = (items) => items.map(([value, label]) => ({ label: `${value} \u2014 ${label}`, value }));
  var hematoTrauma = [
    {
      id: "4ts",
      name: "Puntuaci\xF3n 4T para la trombopenia inducida por heparina",
      shortName: "4Ts",
      description: "Estima la probabilidad de que una trombopenia est\xE9 causada por heparina antes de las pruebas de laboratorio.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        {
          id: "trombopenia",
          type: "select",
          label: "Trombopenia (magnitud)",
          dropdown: true,
          options: escala5([
            [2, "Descenso > 50 % y nadir \u2265 20 \xD710\u2079/L"],
            [1, "Descenso del 30\u201350 %, o nadir de 10\u201319 \xD710\u2079/L"],
            [0, "Descenso < 30 %, o nadir < 10 \xD710\u2079/L"]
          ])
        },
        {
          id: "tiempo",
          type: "select",
          label: "Momento de aparici\xF3n",
          dropdown: true,
          options: escala5([
            [2, "D\xEDas 5\u201310 tras el inicio, o \u2264 1 d\xEDa si hubo exposici\xF3n a heparina en los \xFAltimos 30 d\xEDas"],
            [1, "Compatible con d\xEDas 5\u201310 pero no documentado, o inicio tras el d\xEDa 10, o \u2264 1 d\xEDa con exposici\xF3n hace 30\u2013100 d\xEDas"],
            [0, "Descenso antes del d\xEDa 4 sin exposici\xF3n reciente"]
          ])
        },
        {
          id: "trombosis",
          type: "select",
          label: "Trombosis u otras secuelas",
          dropdown: true,
          options: escala5([
            [2, "Trombosis confirmada nueva, necrosis cut\xE1nea o reacci\xF3n sist\xE9mica aguda tras un bolo de heparina"],
            [1, "Trombosis recurrente o progresiva, lesiones cut\xE1neas no necrosantes, o sospecha de trombosis no confirmada"],
            [0, "Ninguna"]
          ])
        },
        {
          id: "otras",
          type: "select",
          label: "Otras causas de trombopenia",
          dropdown: true,
          options: escala5([
            [2, "Ninguna aparente"],
            [1, "Posible otra causa"],
            [0, "Otra causa evidente"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["trombopenia", "tiempo", "trombosis", "otras"]);
        const banda = score <= 3 ? "baja" : score <= 5 ? "intermedia" : "alta";
        const prob = score <= 3 ? "< 5 %" : score <= 5 ? "\u2248 14 %" : "\u2248 64 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u20138)",
          secondary: prob,
          secondaryLabel: "probabilidad de trombopenia por heparina",
          interpretation: banda === "baja" ? "Probabilidad baja: el valor predictivo negativo es muy alto; en general no se requieren pruebas de anticuerpos ni suspender la heparina." : "Probabilidad intermedia o alta: suspender toda heparina (incluidos los lavados de cat\xE9ter), iniciar un anticoagulante alternativo no hepar\xEDnico y solicitar anticuerpos anti-PF4 con prueba funcional confirmatoria. No transfundir plaquetas de forma profil\xE1ctica ni iniciar warfarina hasta la recuperaci\xF3n plaquetaria.",
          level: banda === "baja" ? "ok" : banda === "intermedia" ? "warn" : "danger"
        };
      },
      references: [
        "Lo GK, et al. Evaluation of pretest clinical score (4 T\u2019s) for the diagnosis of heparin-induced thrombocytopenia. J Thromb Haemost. 2006;4(4):759-65."
      ]
    },
    {
      id: "neutrofilos-linfocitos",
      name: "Recuento absoluto de neutr\xF3filos, linfocitos e \xEDndice neutr\xF3filos/linfocitos",
      shortName: "RAN / RAL / NLR",
      description: "Calcula el recuento absoluto de neutr\xF3filos y linfocitos y el \xEDndice neutr\xF3filos/linfocitos.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        { id: "leucocitos", type: "number", label: "Leucocitos totales", unit: "\xD710\xB3/\xB5L", min: 0.01, max: 200, step: 0.01 },
        { id: "neutrofilos", type: "number", label: "Neutr\xF3filos segmentados", unit: "%", min: 0, max: 100, step: 0.1 },
        { id: "cayados", type: "number", label: "Cayados (bandas)", unit: "%", min: 0, max: 100, step: 0.1 },
        { id: "linfocitos", type: "number", label: "Linfocitos", unit: "%", min: 0, max: 100, step: 0.1 }
      ],
      compute: (v) => {
        const ran = v.leucocitos * ((v.neutrofilos + v.cayados) / 100) * 1e3;
        const ral = v.leucocitos * (v.linfocitos / 100) * 1e3;
        const nlr = ral > 0 ? ran / ral : 0;
        const cd4 = ral > 2e3 ? "> 500 (probable)" : ral < 1e3 ? "< 200 (posible)" : "indeterminado";
        return {
          main: fmt(ran, 0),
          mainUnit: "neutr\xF3filos/\xB5L",
          secondary: fmt(nlr, 2),
          secondaryLabel: "\xEDndice neutr\xF3filos/linfocitos",
          interpretation: ran < 500 ? "Neutropenia grave (< 500/\xB5L): riesgo alto de infecci\xF3n. Ante fiebre, antibioterapia emp\xEDrica de amplio espectro sin demora." : ran < 1e3 ? "Neutropenia moderada (500\u20131.000/\xB5L): precauci\xF3n ante la fiebre." : ran < 1500 ? "Neutropenia leve (1.000\u20131.500/\xB5L)." : "Recuento de neutr\xF3filos dentro del rango habitual.",
          level: ran < 500 ? "danger" : ran < 1500 ? "warn" : "ok",
          details: [
            `Linfocitos absolutos: ${fmt(ral, 0)}/\xB5L (predicci\xF3n de CD4: ${cd4}).`,
            "Un \xEDndice neutr\xF3filos/linfocitos elevado (> 3\u20135) se asocia a inflamaci\xF3n sist\xE9mica y peor pron\xF3stico en m\xFAltiples enfermedades, pero no es espec\xEDfico."
          ]
        };
      },
      notes: ["RAN = leucocitos \xD7 (neutr\xF3filos % + cayados %) / 100."]
    },
    {
      id: "mascc",
      name: "\xCDndice MASCC para la neutropenia febril",
      shortName: "MASCC",
      description: "Identifica a los pacientes con neutropenia febril de bajo riesgo de complicaciones graves.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        {
          id: "sintomas",
          type: "select",
          label: "Gravedad de los s\xEDntomas",
          dropdown: true,
          options: [
            { label: "Sin s\xEDntomas o s\xEDntomas leves", value: 5 },
            { label: "S\xEDntomas moderados", value: 3 },
            { label: "S\xEDntomas graves o moribundo", value: 0 }
          ]
        },
        { id: "hipotension", type: "boolean", label: "Sin hipotensi\xF3n (PA sist\xF3lica > 90 mmHg)", points: 5 },
        { id: "epoc", type: "boolean", label: "Sin enfermedad pulmonar obstructiva cr\xF3nica", points: 4 },
        {
          id: "tumor",
          type: "boolean",
          label: "Tumor s\xF3lido, o neoplasia hematol\xF3gica sin infecci\xF3n f\xFAngica previa",
          points: 4
        },
        { id: "deshidratacion", type: "boolean", label: "Sin deshidrataci\xF3n que requiera fluidos intravenosos", points: 3 },
        { id: "ambulatorio", type: "boolean", label: "Paciente ambulatorio al inicio de la fiebre", points: 3 },
        { id: "edad", type: "boolean", label: "Edad < 60 a\xF1os", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["sintomas", "hipotension", "epoc", "tumor", "deshidratacion", "ambulatorio", "edad"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201326)",
          interpretation: score >= 21 ? "MASCC \u2265 21: bajo riesgo de complicaciones graves. Puede valorarse tratamiento oral o ambulatorio en pacientes seleccionados, con acceso r\xE1pido al hospital y buen soporte social." : "MASCC < 21: alto riesgo de complicaciones. Ingreso hospitalario con antibioterapia intravenosa de amplio espectro.",
          level: score >= 21 ? "ok" : "danger"
        };
      },
      notes: ["Los puntos por \xABs\xEDntomas moderados\xBB y \xABleves\xBB no se suman entre s\xED: solo se elige una categor\xEDa."],
      references: [
        "Klastersky J, et al. The Multinational Association for Supportive Care in Cancer risk index. J Clin Oncol. 2000;18(16):3038-51."
      ]
    },
    {
      id: "cisne",
      name: "\xCDndice CISNE para la neutropenia febril estable",
      shortName: "CISNE",
      description: "Identifica a los pacientes con neutropenia febril cl\xEDnicamente estable y tumor s\xF3lido que tienen bajo riesgo de complicaciones.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        { id: "ecog", type: "boolean", label: "ECOG \u2265 2", points: 2 },
        { id: "epoc", type: "boolean", label: "Enfermedad pulmonar obstructiva cr\xF3nica" },
        { id: "cardiovascular", type: "boolean", label: "Enfermedad cardiovascular cr\xF3nica" },
        { id: "mucositis", type: "boolean", label: "Mucositis de grado \u2265 2 (NCI)" },
        { id: "monocitos", type: "boolean", label: "Monocitos < 200/\xB5L" },
        { id: "hiperglucemia", type: "boolean", label: "Hiperglucemia por estr\xE9s (> 121 mg/dL)", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["ecog", "epoc", "cardiovascular", "mucositis", "monocitos", "hiperglucemia"]);
        const banda = score === 0 ? "bajo" : score <= 2 ? "intermedio" : "alto";
        const comp = score === 0 ? "1,1 %" : score <= 2 ? "6,2 %" : "36 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u20138)",
          secondary: comp,
          secondaryLabel: "riesgo de complicaciones",
          interpretation: banda === "bajo" ? "Riesgo bajo (0 puntos): puede valorarse el manejo ambulatorio con antibioterapia oral." : banda === "intermedio" ? "Riesgo intermedio (1\u20132): se recomienda observaci\xF3n hospitalaria inicial." : "Riesgo alto (\u2265 3): ingreso con antibioterapia intravenosa y vigilancia estrecha.",
          level: banda === "bajo" ? "ok" : banda === "intermedio" ? "warn" : "danger"
        };
      },
      notes: ["Solo aplicable a pacientes con tumores s\xF3lidos y aparentemente estables; no usar en neoplasias hematol\xF3gicas ni en pacientes inestables."],
      references: [
        "Carmona-Bayonas A, et al. Prediction of serious complications in patients with seemingly stable febrile neutropenia: validation of the Clinical Index of Stable Febrile Neutropenia. J Clin Oncol. 2015;33(5):465-71."
      ]
    },
    {
      id: "crs",
      name: "Clasificaci\xF3n del s\xEDndrome de liberaci\xF3n de citocinas (ASTCT)",
      shortName: "CRS",
      description: "Grad\xFAa la gravedad del s\xEDndrome de liberaci\xF3n de citocinas en pacientes tratados con inmunoterapia celular.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        { id: "fiebre", type: "boolean", label: "Temperatura \u2265 38 \xB0C", noPoints: true },
        {
          id: "hipotension",
          type: "select",
          label: "Hipotensi\xF3n",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "Responde a fluidos, sin vasopresores", value: 1 },
            { label: "Requiere un vasopresor (con o sin vasopresina)", value: 2 },
            { label: "Requiere varios vasopresores (excluida la vasopresina)", value: 3 }
          ]
        },
        {
          id: "hipoxia",
          type: "select",
          label: "Hipoxia",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "Requiere gafas nasales de bajo flujo (\u2264 6 L/min) o mascarilla", value: 1 },
            { label: "Requiere alto flujo (> 6 L/min), mascarilla con reservorio o Venturi", value: 2 },
            { label: "Requiere presi\xF3n positiva (CPAP, BiPAP o intubaci\xF3n)", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        if (v.fiebre !== 1)
          return {
            main: "Sin CRS",
            interpretation: "La fiebre \u2265 38 \xB0C es requisito para el grado 1. Sin fiebre no se clasifica como s\xEDndrome de liberaci\xF3n de citocinas (salvo si ya recibe antipir\xE9ticos o tratamiento espec\xEDfico).",
            level: "ok"
          };
        const hipo = v.hipotension ?? 0;
        const hipox = v.hipoxia ?? 0;
        const grado = Math.max(1, hipo === 3 || hipox === 3 ? 4 : hipo === 2 || hipox === 2 ? 3 : hipo === 1 || hipox === 1 ? 2 : 1);
        return {
          main: `Grado ${grado}`,
          interpretation: [
            "",
            "Grado 1: solo fiebre. Tratamiento sintom\xE1tico, cultivos y vigilancia; valorar antibioterapia emp\xEDrica por la dificultad para distinguirlo de la sepsis.",
            "Grado 2: fiebre con hipotensi\xF3n que responde a fluidos o hipoxia con ox\xEDgeno de bajo flujo. Se recomienda tocilizumab, con o sin corticoides.",
            "Grado 3: requiere un vasopresor o alto flujo de ox\xEDgeno. Tocilizumab y corticoides; traslado a cuidados intensivos.",
            "Grado 4: requiere varios vasopresores o soporte ventilatorio con presi\xF3n positiva. Manejo en cuidados intensivos con corticoides a dosis altas y tocilizumab."
          ][grado],
          level: grado <= 1 ? "warn" : "danger",
          details: ["El grado lo determina el componente (hipotensi\xF3n o hipoxia) m\xE1s grave."]
        };
      },
      references: [
        "Lee DW, et al. ASTCT Consensus Grading for Cytokine Release Syndrome and Neurologic Toxicity Associated with Immune Effector Cells. Biol Blood Marrow Transplant. 2019;25(4):625-38."
      ]
    },
    {
      id: "ice-icans",
      name: "Puntuaci\xF3n ICE y clasificaci\xF3n ICANS",
      shortName: "ICE / ICANS",
      description: "Eval\xFAa la neurotoxicidad asociada a las terapias con c\xE9lulas efectoras inmunitarias (c\xE9lulas CAR-T).",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        {
          id: "orientacion",
          type: "select",
          label: "Orientaci\xF3n (a\xF1o, mes, ciudad, hospital)",
          options: escala5([
            [4, "4 aciertos"],
            [3, "3 aciertos"],
            [2, "2 aciertos"],
            [1, "1 acierto"],
            [0, "Ninguno"]
          ]),
          default: 4
        },
        {
          id: "denominacion",
          type: "select",
          label: "Denominaci\xF3n de 3 objetos",
          options: escala5([
            [3, "3 objetos"],
            [2, "2 objetos"],
            [1, "1 objeto"],
            [0, "Ninguno"]
          ]),
          default: 3
        },
        {
          id: "ordenes",
          type: "select",
          label: "Seguir \xF3rdenes sencillas",
          options: escala5([
            [1, "Capaz"],
            [0, "Incapaz"]
          ]),
          default: 1
        },
        {
          id: "escritura",
          type: "select",
          label: "Escribir una frase est\xE1ndar",
          options: escala5([
            [1, "Capaz"],
            [0, "Incapaz"]
          ]),
          default: 1
        },
        {
          id: "atencion",
          type: "select",
          label: "Atenci\xF3n (contar hacia atr\xE1s de 10 en 10 desde 100)",
          options: escala5([
            [1, "Capaz"],
            [0, "Incapaz"]
          ]),
          default: 1
        },
        {
          id: "conciencia",
          type: "select",
          label: "Nivel de conciencia",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Despierto y alerta", value: 0 },
            { label: "Despierta espont\xE1neamente", value: 1 },
            { label: "Despierta solo con est\xEDmulo t\xE1ctil", value: 2 },
            { label: "Despierta solo con est\xEDmulo intenso o repetido", value: 3 },
            { label: "No despierta o requiere est\xEDmulo vigoroso", value: 4 }
          ]
        },
        {
          id: "convulsiones",
          type: "select",
          label: "Convulsiones",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Ninguna", value: 0 },
            { label: "Crisis focal o generalizada que resuelve r\xE1pidamente, o actividad no convulsiva en el EEG que responde al tratamiento", value: 3 },
            { label: "Crisis prolongada (> 5 min) o crisis repetidas sin recuperaci\xF3n entre ellas", value: 4 }
          ]
        },
        {
          id: "motor",
          type: "select",
          label: "Hallazgos motores",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Ninguno", value: 0 },
            { label: "Debilidad motora focal profunda (hemiparesia o paraparesia)", value: 4 }
          ]
        },
        {
          id: "edema",
          type: "select",
          label: "Edema cerebral / hipertensi\xF3n intracraneal",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "Edema cerebral focal o local en la neuroimagen", value: 3 },
            { label: "Edema cerebral difuso, postura de descerebraci\xF3n o decorticaci\xF3n, par\xE1lisis del VI par o papiledema", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const ice = sum(v, ["orientacion", "denominacion", "ordenes", "escritura", "atencion"]);
        const porIce = ice === 10 ? 0 : ice >= 7 ? 1 : ice >= 3 ? 2 : ice >= 1 ? 3 : 4;
        const grado = Math.max(porIce, v.conciencia ?? 0, v.convulsiones ?? 0, v.motor ?? 0, v.edema ?? 0);
        return {
          main: grado === 0 ? "Sin ICANS" : `ICANS grado ${grado}`,
          secondary: String(ice),
          secondaryLabel: "puntuaci\xF3n ICE (0\u201310)",
          interpretation: [
            "Sin datos de neurotoxicidad en este momento; repetir la evaluaci\xF3n al menos dos veces al d\xEDa durante el per\xEDodo de riesgo.",
            "Grado 1: neurotoxicidad leve. Vigilancia estrecha, evitar sedantes, valorar EEG y neuroimagen.",
            "Grado 2: se recomienda dexametasona y monitorizaci\xF3n continua; valorar traslado a cuidados intensivos.",
            "Grado 3: corticoides a dosis altas, ingreso en cuidados intensivos, EEG y neuroimagen.",
            "Grado 4: soporte vital avanzado, corticoides a dosis altas y manejo de la hipertensi\xF3n intracraneal."
          ][grado],
          level: grado === 0 ? "ok" : grado <= 2 ? "warn" : "danger",
          details: [
            `Grado derivado de la puntuaci\xF3n ICE: ${porIce}.`,
            "El grado final es el m\xE1s alto de todos los dominios evaluados.",
            "Un paciente que no despierta y no puede realizar la evaluaci\xF3n ICE tiene 0 puntos y corresponde a grado 3 o 4 seg\xFAn el nivel de conciencia."
          ]
        };
      },
      references: [
        "Lee DW, et al. ASTCT Consensus Grading for Cytokine Release Syndrome and Neurologic Toxicity Associated with Immune Effector Cells. Biol Blood Marrow Transplant. 2019;25(4):625-38."
      ]
    },
    {
      id: "hscore",
      name: "HScore para el s\xEDndrome hemofagoc\xEDtico reactivo",
      shortName: "HScore",
      description: "Estima la probabilidad de linfohistiocitosis hemofagoc\xEDtica secundaria.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        {
          id: "inmunodepresion",
          type: "select",
          label: "Inmunodepresi\xF3n conocida",
          description: "VIH o tratamiento inmunosupresor prolongado.",
          options: [
            { label: "No", value: 0 },
            { label: "S\xED", value: 18 }
          ]
        },
        {
          id: "temperatura",
          type: "select",
          label: "Temperatura m\xE1xima",
          dropdown: true,
          options: [
            { label: "< 38,4 \xB0C", value: 0 },
            { label: "38,4\u201339,4 \xB0C", value: 33 },
            { label: "> 39,4 \xB0C", value: 49 }
          ]
        },
        {
          id: "organomegalia",
          type: "select",
          label: "Organomegalia",
          dropdown: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "Hepatomegalia o esplenomegalia", value: 23 },
            { label: "Hepatomegalia y esplenomegalia", value: 38 }
          ]
        },
        {
          id: "citopenias",
          type: "select",
          label: "N\xFAmero de citopenias",
          description: "Hb \u2264 9,2 g/dL, leucocitos \u2264 5.000/mm\xB3, plaquetas \u2264 110.000/mm\xB3.",
          dropdown: true,
          options: [
            { label: "Una l\xEDnea", value: 0 },
            { label: "Dos l\xEDneas", value: 24 },
            { label: "Tres l\xEDneas", value: 34 }
          ]
        },
        {
          id: "ferritina",
          type: "select",
          label: "Ferritina",
          dropdown: true,
          options: [
            { label: "< 2.000 ng/mL", value: 0 },
            { label: "2.000\u20136.000 ng/mL", value: 35 },
            { label: "> 6.000 ng/mL", value: 50 }
          ]
        },
        {
          id: "trigliceridos",
          type: "select",
          label: "Triglic\xE9ridos",
          dropdown: true,
          options: [
            { label: "< 132,7 mg/dL", value: 0 },
            { label: "132,7\u2013354 mg/dL", value: 44 },
            { label: "> 354 mg/dL", value: 64 }
          ]
        },
        {
          id: "fibrinogeno",
          type: "select",
          label: "Fibrin\xF3geno",
          options: [
            { label: "> 250 mg/dL", value: 0 },
            { label: "\u2264 250 mg/dL", value: 30 }
          ]
        },
        {
          id: "ast",
          type: "select",
          label: "AST (GOT)",
          options: [
            { label: "< 30 U/L", value: 0 },
            { label: "\u2265 30 U/L", value: 19 }
          ]
        },
        {
          id: "hemofagocitosis",
          type: "select",
          label: "Hemofagocitosis en el aspirado medular",
          options: [
            { label: "No", value: 0 },
            { label: "S\xED", value: 35 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["inmunodepresion", "temperatura", "organomegalia", "citopenias", "ferritina", "trigliceridos", "fibrinogeno", "ast", "hemofagocitosis"]);
        const prob = score < 90 ? "< 1 %" : score < 169 ? "intermedia" : "> 99 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u2013337)",
          secondary: prob,
          secondaryLabel: "probabilidad de s\xEDndrome hemofagoc\xEDtico",
          interpretation: score >= 169 ? "HScore \u2265 169: alta probabilidad de linfohistiocitosis hemofagoc\xEDtica (sensibilidad 93 %, especificidad 86 %). Iniciar estudio y tratamiento urgentes junto con hematolog\xEDa." : score < 90 ? "Probabilidad muy baja." : "Probabilidad intermedia: repetir determinaciones (ferritina, triglic\xE9ridos, fibrin\xF3geno) y valorar aspirado medular.",
          level: score >= 169 ? "danger" : score < 90 ? "ok" : "warn"
        };
      },
      references: [
        "Fardet L, et al. Development and validation of the HScore, a score for the diagnosis of reactive hemophagocytic syndrome. Arthritis Rheumatol. 2014;66(9):2613-20."
      ]
    },
    {
      id: "volumen-sanguineo",
      name: "Volumen sangu\xEDneo total, eritrocitario y plasm\xE1tico",
      shortName: "Volumen sangu\xEDneo",
      description: "Calcula el volumen sangu\xEDneo total y sus componentes.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        {
          id: "poblacion",
          type: "select",
          label: "Grupo de paciente",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Neonato prematuro (\u2248 96 mL/kg)", value: 96 },
            { label: "Neonato a t\xE9rmino (\u2248 85 mL/kg)", value: 85 },
            { label: "Lactante (\u2248 80 mL/kg)", value: 80 },
            { label: "Ni\xF1o (\u2248 70 mL/kg)", value: 70 },
            { label: "Var\xF3n adulto (\u2248 75 mL/kg)", value: 75 },
            { label: "Mujer adulta (\u2248 65 mL/kg)", value: 65 }
          ],
          default: 75
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 0.3, max: 300, step: 0.1 },
        { id: "hto", type: "number", label: "Hematocrito", unit: "%", min: 5, max: 70, step: 0.1 }
      ],
      compute: (v) => {
        const total = (v.poblacion ?? 75) * v.peso;
        const eritro = total * (v.hto / 100);
        const plasma = total - eritro;
        return {
          main: fmt(total, 0),
          mainUnit: "mL de volumen sangu\xEDneo total",
          secondary: fmt(eritro, 0),
          secondaryLabel: "mL de volumen eritrocitario",
          interpretation: "\xDAtil para calcular p\xE9rdidas admisibles, dosis de transfusi\xF3n y vol\xFAmenes de recambio plasm\xE1tico.",
          level: "info",
          details: [`Volumen plasm\xE1tico: ${fmt(plasma, 0)} mL.`]
        };
      }
    },
    {
      id: "crioprecipitado",
      name: "Dosis de crioprecipitado para reponer fibrin\xF3geno",
      shortName: "Crioprecipitado",
      description: "Estima las unidades de crioprecipitado necesarias para alcanzar un fibrin\xF3geno objetivo.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 1, max: 250, step: 0.5 },
        { id: "hto", type: "number", label: "Hematocrito", unit: "%", min: 5, max: 70, step: 0.1 },
        { id: "actual", type: "number", label: "Fibrin\xF3geno actual", unit: "mg/dL", min: 0, max: 800, step: 1 },
        { id: "objetivo", type: "number", label: "Fibrin\xF3geno objetivo", unit: "mg/dL", min: 50, max: 800, step: 1 },
        { id: "contenido", type: "number", label: "Fibrin\xF3geno por unidad", unit: "mg", min: 100, max: 500, step: 10 }
      ],
      compute: (v) => {
        if (v.objetivo <= v.actual)
          return {
            main: "\u2014",
            interpretation: "El fibrin\xF3geno objetivo debe ser mayor que el actual.",
            level: "warn"
          };
        const volumenSangre = 70 * v.peso;
        const volumenPlasma = volumenSangre * (1 - v.hto / 100);
        const mgNecesarios = (v.objetivo - v.actual) * volumenPlasma / 100;
        const unidades = Math.ceil(mgNecesarios / v.contenido);
        return {
          main: String(unidades),
          mainUnit: unidades === 1 ? "unidad" : "unidades",
          secondary: fmt(mgNecesarios, 0),
          secondaryLabel: "mg de fibrin\xF3geno necesarios",
          interpretation: "Dosis orientativa. En la hemorragia masiva se prefiere con frecuencia el concentrado de fibrin\xF3geno, guiado por tromboelastograf\xEDa o tromboelastometr\xEDa cuando se dispone de ellas. Objetivo habitual: > 150\u2013200 mg/dL (> 200 en la hemorragia obst\xE9trica).",
          level: "info",
          details: [
            `Volumen plasm\xE1tico estimado: ${fmt(volumenPlasma, 0)} mL.`,
            "El contenido real por unidad var\xEDa; consultar la ficha del banco de sangre (habitualmente 150\u2013250 mg)."
          ]
        };
      }
    },
    {
      id: "iss",
      name: "Puntuaci\xF3n de gravedad de las lesiones (ISS)",
      shortName: "ISS",
      description: "Estandariza la gravedad del politraumatismo a partir de la escala abreviada de lesiones (AIS) por regiones corporales.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        ["cabeza", "Cabeza y cuello"],
        ["cara", "Cara"],
        ["torax", "T\xF3rax"],
        ["abdomen", "Abdomen y contenido p\xE9lvico"],
        ["extremidades", "Extremidades y cintura p\xE9lvica"],
        ["externa", "Superficie externa (piel)"]
      ].map(([id, label]) => ({
        id,
        type: "select",
        label,
        dropdown: true,
        options: escala5([
          [0, "Sin lesi\xF3n"],
          [1, "AIS 1 \u2014 leve"],
          [2, "AIS 2 \u2014 moderada"],
          [3, "AIS 3 \u2014 grave, no amenaza la vida"],
          [4, "AIS 4 \u2014 grave, amenaza la vida"],
          [5, "AIS 5 \u2014 cr\xEDtica, supervivencia incierta"],
          [6, "AIS 6 \u2014 m\xE1xima, lesi\xF3n no superviviente"]
        ])
      })),
      compute: (v) => {
        const ids = ["cabeza", "cara", "torax", "abdomen", "extremidades", "externa"];
        const valores = ids.map((id) => v[id] ?? 0);
        if (valores.some((x) => x === 6))
          return {
            main: "75",
            mainUnit: "puntos (m\xE1ximo)",
            interpretation: "Una lesi\xF3n AIS 6 (no superviviente) asigna autom\xE1ticamente el ISS m\xE1ximo de 75.",
            level: "danger"
          };
        const top3 = [...valores].sort((a, b) => b - a).slice(0, 3);
        const score = top3.reduce((acc, x) => acc + x * x, 0);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201375)",
          secondary: top3.join(" \xB7 "),
          secondaryLabel: "las tres regiones m\xE1s graves",
          interpretation: score >= 16 ? "ISS \u2265 16: politraumatismo grave seg\xFAn la definici\xF3n habitual; manejo en centro de trauma con equipo multidisciplinar." : score >= 9 ? "Traumatismo moderado." : "Traumatismo leve.",
          level: score >= 25 ? "danger" : score >= 16 ? "warn" : "ok",
          details: ["ISS = suma de los cuadrados de los tres valores AIS m\xE1s altos de regiones distintas."]
        };
      },
      references: [
        "Baker SP, et al. The injury severity score: a method for describing patients with multiple injuries. J Trauma. 1974;14(3):187-96."
      ]
    },
    {
      id: "abc-transfusion",
      name: "Puntuaci\xF3n ABC para la transfusi\xF3n masiva",
      shortName: "ABC",
      description: "Predice la necesidad de protocolo de transfusi\xF3n masiva en el paciente traumatizado.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        { id: "penetrante", type: "boolean", label: "Mecanismo penetrante" },
        { id: "pas", type: "boolean", label: "PA sist\xF3lica \u2264 90 mmHg al llegar" },
        { id: "fc", type: "boolean", label: "Frecuencia card\xEDaca \u2265 120 lpm al llegar" },
        { id: "fast", type: "boolean", label: "Ecograf\xEDa FAST positiva" }
      ],
      compute: (v) => {
        const score = sum(v, ["penetrante", "pas", "fc", "fast"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20134)",
          interpretation: score >= 2 ? "ABC \u2265 2: alta probabilidad de requerir transfusi\xF3n masiva. Activar el protocolo de hemorragia masiva con hemoderivados en proporci\xF3n equilibrada y \xE1cido tranex\xE1mico si est\xE1 indicado." : "ABC < 2: baja probabilidad de transfusi\xF3n masiva, aunque no la excluye; reevaluar de forma continua.",
          level: score >= 2 ? "danger" : "ok"
        };
      },
      references: [
        "Nunez TC, et al. Early prediction of massive transfusion in trauma: simple as ABC? J Trauma. 2009;66(2):346-52."
      ]
    },
    {
      id: "parkland",
      name: "F\xF3rmula de Parkland para quemados",
      shortName: "Parkland",
      description: "Calcula la reposici\xF3n de l\xEDquidos en las primeras 24 horas del paciente quemado.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 1, max: 300, step: 0.5 },
        {
          id: "sctq",
          type: "number",
          label: "Superficie corporal quemada (2.\xBA y 3.er grado)",
          unit: "%",
          min: 1,
          max: 100,
          step: 1
        },
        {
          id: "mlkg",
          type: "select",
          label: "F\xF3rmula",
          noPoints: true,
          options: [
            { label: "Parkland cl\xE1sica: 4 mL/kg/%", value: 4 },
            { label: "ABLS / consenso actual: 2 mL/kg/%", value: 2 },
            { label: "Quemadura el\xE9ctrica de alto voltaje: 4 mL/kg/%", value: 4.0001 }
          ],
          default: 2
        }
      ],
      compute: (v) => {
        const factor = v.mlkg ?? 2;
        const total = factor * v.peso * v.sctq;
        const primeras8 = total / 2;
        const ritmo8 = primeras8 / 8;
        const ritmo16 = total / 2 / 16;
        return {
          main: fmt(total, 0),
          mainUnit: "mL en 24 h",
          secondary: fmt(ritmo8, 0),
          secondaryLabel: "mL/h en las primeras 8 horas",
          interpretation: "La mitad del volumen se administra en las primeras 8 horas desde el momento de la quemadura (no desde la llegada) y la otra mitad en las 16 horas siguientes, con Ringer lactato.",
          level: "info",
          details: [
            `Primeras 8 h: ${fmt(primeras8, 0)} mL (${fmt(ritmo8, 0)} mL/h).`,
            `Siguientes 16 h: ${fmt(total / 2, 0)} mL (${fmt(ritmo16, 0)} mL/h).`,
            "Ajustar el ritmo seg\xFAn la diuresis objetivo: 0,5 mL/kg/h en adultos y 1 mL/kg/h en ni\xF1os.",
            "Las gu\xEDas actuales recomiendan iniciar con 2 mL/kg/% para evitar la sobrerreanimaci\xF3n (\xABfluid creep\xBB)."
          ]
        };
      },
      notes: [
        "No incluir las quemaduras de primer grado en el c\xE1lculo de la superficie.",
        "Los ni\xF1os necesitan adem\xE1s fluidos de mantenimiento con glucosa."
      ],
      references: [
        "Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci. 1968;150(3):874-94."
      ]
    },
    {
      id: "lrinec",
      name: "Puntuaci\xF3n LRINEC para la fascitis necrosante",
      shortName: "LRINEC",
      description: "Ayuda a distinguir la infecci\xF3n necrosante de tejidos blandos de una celulitis grave.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        {
          id: "pcr",
          type: "select",
          label: "Prote\xEDna C reactiva (mg/L)",
          options: [
            { label: "< 150", value: 0 },
            { label: "\u2265 150", value: 4 }
          ]
        },
        {
          id: "leucocitos",
          type: "select",
          label: "Leucocitos (\xD710\xB3/\xB5L)",
          dropdown: true,
          options: [
            { label: "< 15", value: 0 },
            { label: "15\u201325", value: 1 },
            { label: "> 25", value: 2 }
          ]
        },
        {
          id: "hb",
          type: "select",
          label: "Hemoglobina (g/dL)",
          dropdown: true,
          options: [
            { label: "> 13,5", value: 0 },
            { label: "11\u201313,5", value: 1 },
            { label: "< 11", value: 2 }
          ]
        },
        {
          id: "sodio",
          type: "select",
          label: "Sodio (mEq/L)",
          options: [
            { label: "\u2265 135", value: 0 },
            { label: "< 135", value: 2 }
          ]
        },
        {
          id: "creatinina",
          type: "select",
          label: "Creatinina (mg/dL)",
          options: [
            { label: "\u2264 1,6", value: 0 },
            { label: "> 1,6", value: 2 }
          ]
        },
        {
          id: "glucosa",
          type: "select",
          label: "Glucosa (mg/dL)",
          options: [
            { label: "\u2264 180", value: 0 },
            { label: "> 180", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["pcr", "leucocitos", "hb", "sodio", "creatinina", "glucosa"]);
        const banda = score <= 5 ? "bajo" : score <= 7 ? "intermedio" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201313)",
          interpretation: banda === "bajo" ? "Riesgo bajo seg\xFAn la escala (< 50 % de probabilidad), pero una puntuaci\xF3n baja NO descarta la fascitis necrosante: si la cl\xEDnica es sugestiva (dolor desproporcionado, crepitaci\xF3n, lesiones ampollosas, r\xE1pida progresi\xF3n, toxicidad sist\xE9mica), la exploraci\xF3n quir\xFArgica no debe retrasarse." : banda === "intermedio" ? "Riesgo intermedio (50\u201375 %): valoraci\xF3n quir\xFArgica urgente." : "Riesgo alto (> 75 %): exploraci\xF3n quir\xFArgica urgente, antibioterapia de amplio espectro y soporte en cuidados intensivos.",
          level: banda === "bajo" ? "warn" : "danger"
        };
      },
      notes: [
        "Validaciones posteriores han mostrado una sensibilidad menor que la del estudio original: es una herramienta de apoyo, nunca de exclusi\xF3n."
      ],
      references: [
        "Wong CH, et al. The LRINEC (Laboratory Risk Indicator for Necrotizing Fasciitis) score. Crit Care Med. 2004;32(7):1535-41."
      ]
    },
    {
      id: "nexus-cabeza",
      name: "Criterios NEXUS II para la tomograf\xEDa craneal",
      shortName: "NEXUS craneal",
      description: "Identifica a los pacientes con traumatismo craneal cerrado que requieren tomograf\xEDa computarizada.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad \u2265 65 a\xF1os" },
        { id: "craneo", type: "boolean", label: "Signos de fractura craneal (incluida la fractura de base)" },
        { id: "cuero", type: "boolean", label: "Hematoma significativo del cuero cabelludo" },
        { id: "neurologico", type: "boolean", label: "D\xE9ficit neurol\xF3gico focal" },
        { id: "conciencia", type: "boolean", label: "Nivel de conciencia alterado" },
        { id: "conducta", type: "boolean", label: "Conducta anormal" },
        { id: "coagulopatia", type: "boolean", label: "Coagulopat\xEDa" },
        { id: "vomitos", type: "boolean", label: "V\xF3mitos persistentes" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "craneo", "cuero", "neurologico", "conciencia", "conducta", "coagulopatia", "vomitos"]);
        return {
          main: score === 0 ? "Bajo riesgo" : "Riesgo no bajo",
          secondary: String(score),
          secondaryLabel: score === 1 ? "criterio presente" : "criterios presentes",
          interpretation: score === 0 ? "Ning\xFAn criterio presente: riesgo bajo de lesi\xF3n intracraneal significativa; la tomograf\xEDa puede evitarse con seguridad razonable (sensibilidad \u2248 98\u2013100 %)." : "Al menos un criterio presente: est\xE1 indicada la tomograf\xEDa craneal.",
          level: score === 0 ? "ok" : "danger"
        };
      },
      references: [
        "Mower WR, et al. Developing a decision instrument to guide computed tomographic imaging of blunt head injury patients. J Trauma. 2005;59(4):954-9."
      ]
    },
    {
      id: "nexus-torax",
      name: "Criterios NEXUS para la tomograf\xEDa tor\xE1cica",
      shortName: "NEXUS tor\xE1cico",
      description: "Identifica a los pacientes con traumatismo tor\xE1cico cerrado que requieren tomograf\xEDa computarizada.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        { id: "mecanismo", type: "boolean", label: "Mecanismo de alta energ\xEDa" },
        { id: "radiografia", type: "boolean", label: "Radiograf\xEDa de t\xF3rax anormal" },
        { id: "esternon", type: "boolean", label: "Dolor a la palpaci\xF3n del estern\xF3n" },
        { id: "escapula", type: "boolean", label: "Dolor a la palpaci\xF3n de la esc\xE1pula" },
        { id: "columna", type: "boolean", label: "Dolor a la palpaci\xF3n de la columna tor\xE1cica" },
        { id: "costal", type: "boolean", label: "Dolor a la palpaci\xF3n de la parrilla costal" },
        { id: "edad", type: "boolean", label: "Edad > 60 a\xF1os" },
        { id: "intoxicacion", type: "boolean", label: "Intoxicaci\xF3n" },
        { id: "distraccion", type: "boolean", label: "Lesi\xF3n distractora dolorosa" },
        { id: "alerta", type: "boolean", label: "Alteraci\xF3n del nivel de alerta o del juicio" }
      ],
      compute: (v) => {
        const score = sum(v, ["mecanismo", "radiografia", "esternon", "escapula", "columna", "costal", "edad", "intoxicacion", "distraccion", "alerta"]);
        return {
          main: score === 0 ? "Bajo riesgo" : "Riesgo no bajo",
          secondary: String(score),
          secondaryLabel: score === 1 ? "criterio presente" : "criterios presentes",
          interpretation: score === 0 ? "Ning\xFAn criterio presente: puede evitarse la tomograf\xEDa tor\xE1cica (sensibilidad \u2248 99 % para lesiones tor\xE1cicas significativas)." : "Al menos un criterio presente: valorar tomograf\xEDa tor\xE1cica seg\xFAn el contexto cl\xEDnico.",
          level: score === 0 ? "ok" : "warn"
        };
      },
      references: [
        "Rodriguez RM, et al. Derivation and validation of two decision instruments for selective chest CT in blunt trauma. PLoS Med. 2015;12(10):e1001883."
      ]
    }
  ];

  // src/calculators/antropometria.ts
  var CAT19 = "Antropometr\xEDa y metabolismo";
  var CAT_ENDO = "Endocrino y t\xF3xicos";
  var UCI7 = ["Medicina Intensiva"];
  var antropometria = [
    {
      id: "imc-sc",
      name: "\xCDndice de masa corporal y superficie corporal",
      shortName: "IMC / SC",
      description: "Calcula el \xEDndice de masa corporal y la superficie corporal.",
      category: CAT19,
      specialty: UCI7,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 1, max: 400, step: 0.1 },
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 30, max: 250, step: 0.5 }
      ],
      compute: (v) => {
        const hM = v.talla / 100;
        const imc = v.peso / (hM * hM);
        const mosteller = Math.sqrt(v.talla * v.peso / 3600);
        const dubois = 7184e-6 * Math.pow(v.talla, 0.725) * Math.pow(v.peso, 0.425);
        const clas = imc < 16 ? "Delgadez grave" : imc < 17 ? "Delgadez moderada" : imc < 18.5 ? "Bajo peso" : imc < 25 ? "Normopeso" : imc < 30 ? "Sobrepeso" : imc < 35 ? "Obesidad grado I" : imc < 40 ? "Obesidad grado II" : "Obesidad grado III (m\xF3rbida)";
        return {
          main: fmt(imc, 1),
          mainUnit: "kg/m\xB2 (IMC)",
          secondary: fmt(mosteller, 2),
          secondaryLabel: "superficie corporal (m\xB2, Mosteller)",
          interpretation: `${clas} seg\xFAn la clasificaci\xF3n de la Organizaci\xF3n Mundial de la Salud.`,
          level: imc < 18.5 ? "warn" : imc < 25 ? "ok" : imc < 30 ? "warn" : "danger",
          details: [
            `Superficie corporal (Du Bois): ${fmt(dubois, 2)} m\xB2.`,
            "El IMC no distingue masa grasa de masa magra ni valora la distribuci\xF3n de la grasa."
          ]
        };
      }
    },
    {
      id: "peso-ideal",
      name: "Peso corporal ideal, predicho y ajustado",
      shortName: "Peso ideal",
      description: "Calcula el peso ideal (f\xF3rmula de Devine), el peso predicho para la ventilaci\xF3n y el peso ajustado para dosificar f\xE1rmacos.",
      category: CAT19,
      specialty: UCI7,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 100, max: 230, step: 0.5 },
        { id: "peso", type: "number", label: "Peso real", unit: "kg", min: 20, max: 400, step: 0.1 }
      ],
      compute: (v) => {
        const pulgadas = v.talla / 2.54;
        const sobre60 = Math.max(pulgadas - 60, 0);
        const ideal = v.sexo === 1 ? 45.5 + 2.3 * sobre60 : 50 + 2.3 * sobre60;
        const predicho = v.sexo === 1 ? 45.5 + 2.3 * (pulgadas - 60) : 50 + 2.3 * (pulgadas - 60);
        const ajustado = ideal + 0.4 * (v.peso - ideal);
        const exceso = v.peso / ideal * 100;
        return {
          main: fmt(ideal, 1),
          mainUnit: "kg (peso ideal, Devine)",
          secondary: fmt(ajustado, 1),
          secondaryLabel: "kg (peso ajustado)",
          interpretation: v.peso > ideal * 1.3 ? "El peso real supera en m\xE1s del 30 % al ideal: para muchos f\xE1rmacos hidr\xF3filos conviene dosificar por peso ideal o ajustado, no por peso real." : "El peso real est\xE1 pr\xF3ximo al ideal.",
          level: "info",
          details: [
            `Peso corporal predicho (para volumen corriente en ventilaci\xF3n): ${fmt(predicho, 1)} kg.`,
            `Peso real respecto al ideal: ${fmt(exceso, 0)} %.`,
            "Peso ajustado = peso ideal + 0,4 \xD7 (peso real \u2212 peso ideal).",
            "Volumen corriente protector (6 mL/kg de peso predicho): " + fmt(predicho * 6, 0) + " mL."
          ]
        };
      },
      notes: [
        "La f\xF3rmula de Devine se dise\xF1\xF3 para dosificar f\xE1rmacos y solo es fiable a partir de 152 cm de talla.",
        "El peso predicho puede ser negativo o muy bajo en tallas muy peque\xF1as: en ese caso usar tablas pedi\xE1tricas."
      ]
    },
    {
      id: "gasto-energetico",
      name: "Gasto energ\xE9tico basal (Harris-Benedict)",
      shortName: "Gasto energ\xE9tico",
      description: "Calcula las necesidades energ\xE9ticas diarias.",
      category: CAT19,
      specialty: UCI7,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 20, max: 300, step: 0.1 },
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 100, max: 230, step: 0.5 },
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 15, max: 110 },
        {
          id: "actividad",
          type: "select",
          label: "Factor de actividad o estr\xE9s",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Reposo en cama (1,2)", value: 1.2 },
            { label: "Actividad ligera (1,375)", value: 1.375 },
            { label: "Actividad moderada (1,55)", value: 1.55 },
            { label: "Actividad intensa (1,725)", value: 1.725 },
            { label: "Cirug\xEDa menor (1,2)", value: 1.2001 },
            { label: "Sepsis o traumatismo (1,3\u20131,5)", value: 1.4 },
            { label: "Quemadura extensa (1,5\u20132,0)", value: 1.75 }
          ],
          default: 1.2
        }
      ],
      compute: (v) => {
        const geb = v.sexo === 1 ? 655.1 + 9.563 * v.peso + 1.85 * v.talla - 4.676 * v.edad : 66.5 + 13.75 * v.peso + 5.003 * v.talla - 6.775 * v.edad;
        const total = geb * (v.actividad ?? 1.2);
        const porKg = total / v.peso;
        return {
          main: fmt(total, 0),
          mainUnit: "kcal/d\xEDa",
          secondary: fmt(geb, 0),
          secondaryLabel: "kcal/d\xEDa en reposo (basal)",
          interpretation: "Estimaci\xF3n orientativa. En el paciente cr\xEDtico, las gu\xEDas recomiendan 20\u201325 kcal/kg/d\xEDa en la fase aguda y 25\u201330 kcal/kg/d\xEDa en la fase de recuperaci\xF3n, con 1,2\u20132,0 g/kg/d\xEDa de prote\xEDnas.",
          level: "info",
          details: [
            `Equivale a ${fmt(porKg, 1)} kcal/kg/d\xEDa.`,
            "La calorimetr\xEDa indirecta sigue siendo el patr\xF3n de referencia; las f\xF3rmulas pueden errar de forma considerable en el paciente cr\xEDtico."
          ]
        };
      },
      references: [
        "Harris JA, Benedict FG. A Biometric Study of Human Basal Metabolism. Proc Natl Acad Sci USA. 1918;4(12):370-3."
      ]
    },
    {
      id: "ritmo-goteo",
      name: "Velocidad de goteo intravenoso",
      shortName: "Goteo intravenoso",
      description: "Calcula las gotas por minuto cuando no se dispone de bomba de infusi\xF3n.",
      category: CAT19,
      specialty: UCI7,
      inputs: [
        { id: "volumen", type: "number", label: "Volumen a infundir", unit: "mL", min: 1, max: 1e4, step: 1 },
        { id: "tiempo", type: "number", label: "Tiempo de infusi\xF3n", unit: "min", min: 1, max: 2880, step: 1 },
        {
          id: "factor",
          type: "select",
          label: "Factor de goteo del equipo",
          noPoints: true,
          options: [
            { label: "Macrogotero 10 gotas/mL", value: 10 },
            { label: "Macrogotero 15 gotas/mL", value: 15 },
            { label: "Macrogotero 20 gotas/mL", value: 20 },
            { label: "Microgotero 60 gotas/mL", value: 60 }
          ],
          default: 20
        }
      ],
      compute: (v) => {
        const gotasMin = v.volumen * (v.factor ?? 20) / v.tiempo;
        const mlHora = v.volumen / v.tiempo * 60;
        return {
          main: fmt(gotasMin, 0),
          mainUnit: "gotas/min",
          secondary: fmt(mlHora, 1),
          secondaryLabel: "mL/h equivalentes",
          interpretation: "Contar las gotas durante 15 segundos y multiplicar por 4 para comprobar el ritmo; revisar peri\xF3dicamente, ya que la gravedad hace que el ritmo var\xEDe con el tiempo.",
          level: "info",
          details: [`Equivale a una gota cada ${fmt(60 / gotasMin, 1)} segundos.`]
        };
      }
    },
    {
      id: "etanol-estimado",
      name: "Concentraci\xF3n estimada de etanol y alcoholes t\xF3xicos",
      shortName: "Etanol estimado",
      description: "Estima la concentraci\xF3n sangu\xEDnea de alcohol a partir de la cantidad ingerida.",
      category: CAT_ENDO,
      specialty: UCI7,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo (volumen de distribuci\xF3n)",
          noPoints: true,
          options: [
            { label: "Var\xF3n (0,68 L/kg)", value: 0.68 },
            { label: "Mujer (0,55 L/kg)", value: 0.55 }
          ]
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 10, max: 250, step: 0.5 },
        { id: "volumen", type: "number", label: "Volumen ingerido", unit: "mL", min: 1, max: 5e3, step: 1 },
        { id: "concentracion", type: "number", label: "Graduaci\xF3n de la bebida", unit: "% vol", min: 0.5, max: 100, step: 0.5 },
        { id: "horas", type: "number", label: "Horas transcurridas desde la ingesta", unit: "h", min: 0, max: 48, step: 0.5 }
      ],
      compute: (v) => {
        const gramos = v.volumen * (v.concentracion / 100) * 0.789;
        const vd = (v.sexo ?? 0.68) * v.peso;
        const pico = gramos / vd * 100;
        const eliminado = 20 * v.horas;
        const actual = Math.max(pico - eliminado, 0);
        return {
          main: fmt(actual, 0),
          mainUnit: "mg/dL estimados",
          secondary: fmt(pico, 0),
          secondaryLabel: "mg/dL de pico te\xF3rico",
          interpretation: actual >= 300 ? "Concentraci\xF3n potencialmente grave (\u2265 300 mg/dL): riesgo de depresi\xF3n respiratoria y coma; vigilar v\xEDa a\xE9rea." : actual >= 80 ? "Concentraci\xF3n en rango de intoxicaci\xF3n cl\xEDnica evidente." : actual > 0 ? "Concentraci\xF3n estimada baja." : "Alcohol te\xF3ricamente eliminado seg\xFAn la estimaci\xF3n.",
          level: actual >= 300 ? "danger" : actual >= 80 ? "warn" : "ok",
          details: [
            `Alcohol ingerido: ${fmt(gramos, 1)} g (${fmt(gramos / 10, 1)} unidades de bebida est\xE1ndar).`,
            "Se asume una eliminaci\xF3n de 20 mg/dL por hora (rango real 15\u201325; mayor en bebedores cr\xF3nicos).",
            "Es una estimaci\xF3n te\xF3rica: no sustituye la determinaci\xF3n anal\xEDtica ni la valoraci\xF3n cl\xEDnica."
          ]
        };
      },
      notes: [
        "La f\xF3rmula de Widmark asume absorci\xF3n completa y no considera el vaciamiento g\xE1strico ni la ingesta simult\xE1nea de comida.",
        "Ante sospecha de metanol o etilenglicol, calcular el hiato osmolar y contactar con toxicolog\xEDa: la ausencia de etanol no descarta otros alcoholes."
      ]
    },
    {
      id: "burch-wartofsky",
      name: "Escala de Burch-Wartofsky para la crisis tirot\xF3xica",
      shortName: "Burch-Wartofsky",
      description: "Estima la probabilidad de que una tirotoxicosis sea una crisis tiroidea.",
      category: CAT_ENDO,
      specialty: UCI7,
      inputs: [
        {
          id: "temperatura",
          type: "select",
          label: "Temperatura (\xB0C)",
          dropdown: true,
          options: [
            { label: "< 37,2", value: 0 },
            { label: "37,2\u201337,7", value: 5 },
            { label: "37,8\u201338,2", value: 10 },
            { label: "38,3\u201338,8", value: 15 },
            { label: "38,9\u201339,4", value: 20 },
            { label: "39,4\u201339,9", value: 25 },
            { label: "\u2265 40", value: 30 }
          ]
        },
        {
          id: "snc",
          type: "select",
          label: "Efectos sobre el sistema nervioso central",
          dropdown: true,
          options: [
            { label: "Ausentes", value: 0 },
            { label: "Leves (agitaci\xF3n)", value: 10 },
            { label: "Moderados (delirio, psicosis, letargia extrema)", value: 20 },
            { label: "Graves (convulsiones, coma)", value: 30 }
          ]
        },
        {
          id: "digestivo",
          type: "select",
          label: "Disfunci\xF3n digestiva o hep\xE1tica",
          dropdown: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "Moderada (diarrea, n\xE1useas, v\xF3mitos, dolor abdominal)", value: 10 },
            { label: "Grave (ictericia inexplicada)", value: 20 }
          ]
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia card\xEDaca (lpm)",
          dropdown: true,
          options: [
            { label: "< 90", value: 0 },
            { label: "90\u2013109", value: 5 },
            { label: "110\u2013119", value: 10 },
            { label: "120\u2013129", value: 15 },
            { label: "130\u2013139", value: 20 },
            { label: "\u2265 140", value: 25 }
          ]
        },
        {
          id: "icc",
          type: "select",
          label: "Insuficiencia card\xEDaca congestiva",
          dropdown: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "Leve (edema maleolar)", value: 5 },
            { label: "Moderada (crepitantes bibasales)", value: 10 },
            { label: "Grave (edema agudo de pulm\xF3n)", value: 15 }
          ]
        },
        {
          id: "fa",
          type: "select",
          label: "Fibrilaci\xF3n auricular",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Presente", value: 10 }
          ]
        },
        {
          id: "desencadenante",
          type: "select",
          label: "Antecedente desencadenante",
          description: "Infecci\xF3n, cirug\xEDa, contraste yodado, parto, suspensi\xF3n de antitiroideos.",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Presente", value: 10 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["temperatura", "snc", "digestivo", "fc", "icc", "fa", "desencadenante"]);
        return {
          main: String(score),
          mainUnit: "puntos",
          interpretation: score >= 45 ? "Puntuaci\xF3n \u2265 45: altamente sugestiva de crisis tirot\xF3xica. Tratamiento urgente en cuidados intensivos: betabloqueantes, tionamidas, yodo (al menos 1 hora despu\xE9s de la tionamida), corticoides y tratamiento del desencadenante." : score >= 25 ? "Puntuaci\xF3n 25\u201344: crisis tirot\xF3xica inminente o probable; iniciar tratamiento y vigilancia estrecha." : "Puntuaci\xF3n < 25: crisis tirot\xF3xica poco probable.",
          level: score >= 45 ? "danger" : score >= 25 ? "warn" : "ok"
        };
      },
      notes: ["La crisis tirot\xF3xica es un diagn\xF3stico cl\xEDnico: esta escala apoya la decisi\xF3n, pero no debe retrasar el tratamiento ante una sospecha alta."],
      references: [
        "Burch HB, Wartofsky L. Life-threatening thyrotoxicosis: thyroid storm. Endocrinol Metab Clin North Am. 1993;22(2):263-77."
      ]
    },
    {
      id: "coma-mixedematoso",
      name: "Puntuaci\xF3n diagn\xF3stica del coma mixedematoso",
      shortName: "Coma mixedematoso",
      description: "Apoya el diagn\xF3stico del coma mixedematoso (hipotiroidismo descompensado).",
      category: CAT_ENDO,
      specialty: UCI7,
      inputs: [
        {
          id: "temperatura",
          type: "select",
          label: "Temperatura (\xB0C)",
          dropdown: true,
          options: [
            { label: "> 35", value: 0 },
            { label: "32\u201335", value: 10 },
            { label: "< 32", value: 20 }
          ]
        },
        {
          id: "snc",
          type: "select",
          label: "Efectos sobre el sistema nervioso central",
          dropdown: true,
          options: [
            { label: "Ausentes", value: 0 },
            { label: "Somnolencia o letargia", value: 10 },
            { label: "Obnubilaci\xF3n", value: 15 },
            { label: "Estupor", value: 20 },
            { label: "Coma o convulsiones", value: 30 }
          ]
        },
        {
          id: "digestivo",
          type: "select",
          label: "S\xEDntomas digestivos",
          dropdown: true,
          options: [
            { label: "Ausentes", value: 0 },
            { label: "Anorexia, dolor abdominal o estre\xF1imiento", value: 5 },
            { label: "Disminuci\xF3n del peristaltismo", value: 15 },
            { label: "\xCDleo paral\xEDtico o megacolon", value: 20 }
          ]
        },
        {
          id: "precipitante",
          type: "select",
          label: "Factor precipitante",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Presente", value: 10 }
          ]
        },
        {
          id: "cardiaco",
          type: "select",
          label: "Alteraciones card\xEDacas",
          dropdown: true,
          options: [
            { label: "Ausentes", value: 0 },
            { label: "Bradicardia 50\u201359 lpm", value: 10 },
            { label: "Bradicardia 40\u201349 lpm", value: 20 },
            { label: "Bradicardia < 40 lpm, cambios en el ECG, derrame peric\xE1rdico o edema pulmonar", value: 30 }
          ]
        },
        {
          id: "metabolico",
          type: "select",
          label: "Alteraciones metab\xF3licas",
          description: "Hiponatremia, hipoglucemia, hipoxemia, hipercapnia o descenso del filtrado glomerular.",
          dropdown: true,
          options: [
            { label: "Ninguna", value: 0 },
            { label: "Una", value: 10 },
            { label: "Dos", value: 15 },
            { label: "Tres o m\xE1s", value: 20 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["temperatura", "snc", "digestivo", "precipitante", "cardiaco", "metabolico"]);
        return {
          main: String(score),
          mainUnit: "puntos",
          interpretation: score >= 60 ? "Puntuaci\xF3n \u2265 60: altamente sugestiva de coma mixedematoso. Tratamiento urgente con levotiroxina intravenosa, hidrocortisona (antes que la hormona tiroidea, hasta descartar insuficiencia suprarrenal), recalentamiento pasivo y soporte en cuidados intensivos." : score >= 45 ? "Puntuaci\xF3n 45\u201359: sugestiva; iniciar tratamiento y confirmar con la funci\xF3n tiroidea." : "Puntuaci\xF3n < 45: coma mixedematoso poco probable.",
          level: score >= 60 ? "danger" : score >= 45 ? "warn" : "ok"
        };
      },
      notes: ["Administrar siempre corticoides antes que la levotiroxina: la hormona tiroidea puede precipitar una crisis suprarrenal."],
      references: [
        "Popoveniuc G, et al. A diagnostic scoring system for myxedema coma. Endocr Pract. 2014;20(8):808-17."
      ]
    },
    {
      id: "katz",
      name: "\xCDndice de Katz de independencia en las actividades b\xE1sicas",
      shortName: "Katz",
      description: "Eval\xFAa el estado funcional basal en las actividades b\xE1sicas de la vida diaria.",
      category: CAT19,
      specialty: UCI7,
      inputs: [
        { id: "bano", type: "boolean", label: "Ba\xF1o \u2014 independiente", labels: ["Dependiente", "Independiente"] },
        { id: "vestido", type: "boolean", label: "Vestido \u2014 independiente", labels: ["Dependiente", "Independiente"] },
        { id: "aseo", type: "boolean", label: "Uso del retrete \u2014 independiente", labels: ["Dependiente", "Independiente"] },
        { id: "movilidad", type: "boolean", label: "Movilidad / transferencias \u2014 independiente", labels: ["Dependiente", "Independiente"] },
        { id: "continencia", type: "boolean", label: "Continencia \u2014 continente", labels: ["Incontinente", "Continente"] },
        { id: "alimentacion", type: "boolean", label: "Alimentaci\xF3n \u2014 independiente", labels: ["Dependiente", "Independiente"] }
      ],
      compute: (v) => {
        const score = sum(v, ["bano", "vestido", "aseo", "movilidad", "continencia", "alimentacion"]);
        return {
          main: String(score),
          mainUnit: "de 6 actividades",
          interpretation: score === 6 ? "Independiente para todas las actividades b\xE1sicas." : score >= 4 ? "Dependencia leve-moderada: valorar apoyos y rehabilitaci\xF3n." : "Dependencia grave: planificar cuidados y apoyo sociosanitario; es un dato pron\xF3stico relevante en el paciente cr\xEDtico y en la toma de decisiones sobre la intensidad terap\xE9utica.",
          level: score === 6 ? "ok" : score >= 4 ? "warn" : "danger"
        };
      },
      references: [
        "Katz S, et al. Studies of illness in the aged. The index of ADL. JAMA. 1963;185:914-9."
      ]
    }
  ];

  // src/calculators/farmacia-formulas.ts
  var CAT_RENAL = "Funci\xF3n renal y ajuste de dosis";
  var CAT_FLUIDOS = "Fluidos, electrolitos e infusiones";
  var CAT_FARMACO = "Farmacolog\xEDa y dosificaci\xF3n";
  var FARM = ["Farmacia"];
  var farmaciaFormulas = [
    {
      id: "ckd-epi",
      name: "Ecuaci\xF3n CKD-EPI 2021 (sin raza)",
      shortName: "CKD-EPI",
      description: "Estima el filtrado glomerular en adultos mayores de 18 a\xF1os; recomendada por las gu\xEDas KDIGO actuales.",
      category: CAT_RENAL,
      specialty: FARM,
      inputs: [
        { id: "creatinina", type: "number", label: "Creatinina s\xE9rica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 },
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 18, max: 110 },
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const mujer = v.sexo === 1;
        const k = mujer ? 0.7 : 0.9;
        const alpha = mujer ? -0.241 : -0.302;
        const min = Math.min(v.creatinina / k, 1);
        const max = Math.max(v.creatinina / k, 1);
        const fge = 142 * Math.pow(min, alpha) * Math.pow(max, -1.2) * Math.pow(0.9938, v.edad) * (mujer ? 1.012 : 1);
        const estadio = fge >= 90 ? "G1" : fge >= 60 ? "G2" : fge >= 45 ? "G3a" : fge >= 30 ? "G3b" : fge >= 15 ? "G4" : "G5";
        return {
          main: fmt(fge, 1),
          mainUnit: "mL/min/1,73 m\xB2",
          secondary: estadio,
          secondaryLabel: "estadio KDIGO",
          interpretation: fge >= 60 ? "Filtrado conservado o levemente reducido. Solo hay enfermedad renal cr\xF3nica si hay adem\xE1s da\xF1o renal (albuminuria, alteraciones estructurales) durante \u2265 3 meses." : fge >= 30 ? "Reducci\xF3n moderada del filtrado: ajustar f\xE1rmacos, evitar nefrot\xF3xicos." : fge >= 15 ? "Reducci\xF3n grave: seguimiento por nefrolog\xEDa y preparaci\xF3n del tratamiento sustitutivo." : "Fallo renal: valorar terapia renal sustitutiva.",
          level: fge >= 60 ? "ok" : fge >= 30 ? "warn" : "danger",
          details: [
            "CKD-EPI 2021 sin coeficiente racial (recomendado por NKF y ASN desde 2021).",
            "Para ajustar dosis de f\xE1rmacos, muchas fichas t\xE9cnicas todav\xEDa se basan en Cockcroft-Gault: verificar cada caso."
          ]
        };
      },
      notes: [
        "La ecuaci\xF3n devuelve el filtrado indexado por 1,73 m\xB2 de superficie corporal. Para pesos extremos, usar la versi\xF3n no indexada.",
        "No aplicable en la insuficiencia renal aguda ni en el embarazo."
      ],
      references: [
        "Inker LA, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. N Engl J Med. 2021;385(19):1737-49."
      ]
    },
    {
      id: "schwartz-2009",
      name: "Ecuaci\xF3n de Schwartz revisada pedi\xE1trica (2009)",
      shortName: "Schwartz",
      description: "Estima el filtrado glomerular en pacientes pedi\xE1tricos.",
      category: CAT_RENAL,
      specialty: FARM,
      inputs: [
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 30, max: 200, step: 0.5 },
        { id: "creatinina", type: "number", label: "Creatinina s\xE9rica", unit: "mg/dL", min: 0.05, max: 15, step: 0.01 }
      ],
      compute: (v) => {
        const fge = 0.413 * v.talla / v.creatinina;
        return {
          main: fmt(fge, 1),
          mainUnit: "mL/min/1,73 m\xB2",
          interpretation: fge >= 90 ? "Filtrado glomerular estimado normal para la edad pedi\xE1trica." : fge >= 60 ? "Reducci\xF3n leve." : "Reducci\xF3n significativa: valorar por nefrolog\xEDa pedi\xE1trica.",
          level: fge >= 90 ? "ok" : fge >= 60 ? "warn" : "danger",
          details: ["FGe = 0,413 \xD7 talla (cm) / creatinina (mg/dL)."]
        };
      },
      notes: [
        "Validada en ni\xF1os y adolescentes con enfermedad renal cr\xF3nica y filtrado 15\u201375 mL/min/1,73 m\xB2.",
        "En neonatos, prematuros y lactantes peque\xF1os la ecuaci\xF3n pierde exactitud."
      ],
      references: [
        "Schwartz GJ, et al. New equations to estimate GFR in children with CKD. J Am Soc Nephrol. 2009;20(3):629-37."
      ]
    },
    {
      id: "fenitoina-corregida",
      name: "Fenito\xEDna corregida por alb\xFAmina e insuficiencia renal",
      shortName: "Fenito\xEDna corregida",
      description: "Corrige la concentraci\xF3n total de fenito\xEDna en pacientes con hipoalbuminemia o insuficiencia renal (f\xF3rmula de Sheiner-Tozer).",
      category: CAT_RENAL,
      specialty: FARM,
      inputs: [
        { id: "nivel", type: "number", label: "Fenito\xEDna total medida", unit: "\xB5g/mL", min: 0, max: 100, step: 0.1 },
        { id: "albumina", type: "number", label: "Alb\xFAmina s\xE9rica", unit: "g/dL", min: 0.5, max: 6, step: 0.1 },
        {
          id: "renal",
          type: "select",
          label: "Funci\xF3n renal",
          noPoints: true,
          options: [
            { label: "Conservada (aclaramiento \u2265 20 mL/min)", value: 0 },
            { label: "Insuficiencia renal grave (aclaramiento < 20 mL/min)", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const factor = v.renal === 1 ? 0.1 : 0.2;
        const corregida = v.nivel / (factor * v.albumina + 0.1);
        return {
          main: fmt(corregida, 1),
          mainUnit: "\xB5g/mL corregida",
          interpretation: corregida < 10 ? "Rango infraterap\xE9utico: valorar aumento de dosis seg\xFAn la cl\xEDnica." : corregida <= 20 ? "Rango terap\xE9utico (10\u201320 \xB5g/mL)." : "Rango t\xF3xico (> 20 \xB5g/mL): valorar suspender o reducir la dosis y buscar signos de toxicidad (nistagmo, ataxia, disartria, alteraci\xF3n del nivel de conciencia).",
          level: corregida < 10 ? "warn" : corregida <= 20 ? "ok" : "danger",
          details: [
            `F\xF3rmula: nivel medido / (${factor} \xD7 alb\xFAmina + 0,1).`,
            v.renal === 1 ? "Usa la f\xF3rmula modificada para pacientes con insuficiencia renal grave (factor 0,1 en lugar de 0,2)." : "Factor 0,2 (f\xF3rmula est\xE1ndar)."
          ]
        };
      },
      notes: [
        "Si dispone de fenito\xEDna libre, es preferible medirla directamente (rango terap\xE9utico 1\u20132 \xB5g/mL).",
        "La f\xF3rmula estima; los rangos son orientativos y deben integrarse con la respuesta cl\xEDnica."
      ],
      references: [
        "Winter ME. Basic Clinical Pharmacokinetics. 5.\xAA ed. Lippincott, 2010."
      ]
    },
    {
      id: "gir",
      name: "Tasa de infusi\xF3n de glucosa (GIR)",
      shortName: "GIR",
      description: "Cuantifica la velocidad a la que se administra glucosa por v\xEDa intravenosa (\xFAtil en neonatolog\xEDa y pediatr\xEDa).",
      category: CAT_FLUIDOS,
      specialty: FARM,
      inputs: [
        { id: "ritmo", type: "number", label: "Ritmo de infusi\xF3n", unit: "mL/h", min: 0.1, max: 500, step: 0.1 },
        { id: "concentracion", type: "number", label: "Concentraci\xF3n de glucosa", unit: "%", min: 1, max: 70, step: 0.5 },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 0.3, max: 200, step: 0.1 }
      ],
      compute: (v) => {
        const gir = v.ritmo * v.concentracion * 10 / (60 * v.peso);
        return {
          main: fmt(gir, 1),
          mainUnit: "mg/kg/min",
          interpretation: gir < 4 ? "GIR baja: puede ser insuficiente para prevenir la hipoglucemia en el neonato (objetivo habitual 4\u20138 mg/kg/min)." : gir <= 8 ? "GIR habitual de mantenimiento neonatal (4\u20138 mg/kg/min)." : gir <= 12 ? "GIR alta: vigilar hiperglucemia y la osmolaridad de la soluci\xF3n." : "GIR muy alta (> 12 mg/kg/min): riesgo de hiperglucemia y de esteatosis hep\xE1tica; revisar la indicaci\xF3n y considerar insulina.",
          level: gir < 4 ? "warn" : gir <= 8 ? "ok" : gir <= 12 ? "warn" : "danger",
          details: [
            "F\xF3rmula: GIR = (mL/h \xD7 % glucosa \xD7 10) / (60 \xD7 peso).",
            `Aporte total de glucosa: ${fmt(v.ritmo * v.concentracion / 100 * 24, 1)} g/d\xEDa.`,
            "Con GIR > 6 mg/kg/min por v\xEDa perif\xE9rica se recomienda v\xEDa central si la osmolaridad supera 900 mOsm/L."
          ]
        };
      },
      references: [
        "Adamkin DH. Clinical Report\u2014Postnatal Glucose Homeostasis in Late-Preterm and Term Infants. Pediatrics. 2011;127(3):575-9."
      ]
    },
    {
      id: "correccion-sodio",
      name: "Tasa de correcci\xF3n de sodio (Adrogu\xE9-Madias)",
      shortName: "Correcci\xF3n de sodio",
      description: "Estima el cambio de sodio s\xE9rico que produce 1 litro de la soluci\xF3n elegida y el volumen necesario para alcanzar un objetivo.",
      category: CAT_FLUIDOS,
      specialty: FARM,
      inputs: [
        {
          id: "poblacion",
          type: "select",
          label: "Grupo (fracci\xF3n de agua corporal)",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Var\xF3n adulto (0,6)", value: 0.6 },
            { label: "Mujer adulta (0,5)", value: 0.5 },
            { label: "Var\xF3n anciano (0,5)", value: 0.5001 },
            { label: "Mujer anciana (0,45)", value: 0.45 },
            { label: "Ni\xF1o (0,6)", value: 0.6002 }
          ],
          default: 0.6
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 3, max: 250, step: 0.5 },
        { id: "naActual", type: "number", label: "Sodio s\xE9rico actual", unit: "mEq/L", min: 100, max: 180, step: 0.1 },
        { id: "naObjetivo", type: "number", label: "Sodio s\xE9rico objetivo", unit: "mEq/L", min: 100, max: 180, step: 0.1 },
        {
          id: "solucion",
          type: "select",
          label: "Soluci\xF3n de infusi\xF3n (Na\u207A infundido, mEq/L)",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Suero fisiol\xF3gico 0,9 % (154)", value: 154 },
            { label: "Ringer lactato (130)", value: 130 },
            { label: "Suero salino hipert\xF3nico 3 % (513)", value: 513 },
            { label: "Suero salino hipert\xF3nico 2 % (342)", value: 342 },
            { label: "Suero salino 0,45 % (77)", value: 77 },
            { label: "Suero glucosado 5 % (0)", value: 0 }
          ],
          default: 154
        },
        {
          id: "horas",
          type: "number",
          label: "Tiempo previsto de correcci\xF3n",
          unit: "h",
          min: 1,
          max: 96,
          step: 1
        }
      ],
      compute: (v) => {
        const acT = (v.poblacion ?? 0.6) * v.peso;
        const cambio = ((v.solucion ?? 154) - v.naActual) / (acT + 1);
        const objetivo = v.naObjetivo - v.naActual;
        const litros = cambio === 0 ? Infinity : objetivo / cambio;
        const ritmo = litros === Infinity ? 0 : litros * 1e3 / v.horas;
        const seguro = Math.abs(objetivo) / (v.horas / 24) <= (v.naActual < v.naObjetivo ? 10 : 10);
        return {
          main: fmt(cambio, 2),
          mainUnit: "mEq/L por cada litro infundido",
          secondary: litros === Infinity ? "\u2014" : `${fmt(litros * 1e3, 0)} mL`,
          secondaryLabel: "volumen total para alcanzar el objetivo",
          interpretation: litros === Infinity ? "La soluci\xF3n elegida tiene la misma concentraci\xF3n que el sodio del paciente: no modificar\xE1 la natremia." : (v.naActual < v.naObjetivo ? "Hiponatremia: no superar 10 mEq/L al d\xEDa (8 mEq/L en pacientes con riesgo alto de mielinolisis: alcoh\xF3licos, malnutridos, hipopotas\xE9micos, hepatopat\xEDa). En hiponatremia grave sintom\xE1tica, aportar bolo de 100\u2013150 mL de salino al 3 % y reevaluar." : "Hipernatremia: no bajar m\xE1s de 10 mEq/L al d\xEDa para evitar el edema cerebral.") + (seguro ? "" : " Atenci\xF3n: el ritmo previsto supera el l\xEDmite recomendado."),
          level: !seguro ? "danger" : "warn",
          details: [
            `Ritmo aproximado: ${fmt(ritmo, 0)} mL/h.`,
            "F\xF3rmula: \u0394Na por litro = (Na infundido \u2212 Na s\xE9rico) / (agua corporal total + 1).",
            "Reevaluar sodio cada 2\u20134 h; no basar decisiones \xFAnicamente en el c\xE1lculo."
          ]
        };
      },
      notes: [
        "En la hiponatremia cr\xF3nica, corregir de forma lenta (m\xE1x. 8\u201310 mEq/L en 24 h) para prevenir el s\xEDndrome de desmielinizaci\xF3n osm\xF3tica.",
        "En la hipernatremia cr\xF3nica, corregir a raz\xF3n m\xE1xima de 10 mEq/L al d\xEDa.",
        "A\xF1adir el aporte de potasio de la soluci\xF3n al c\xE1lculo si es significativo."
      ],
      references: [
        "Adrogu\xE9 HJ, Madias NE. Hyponatremia. N Engl J Med. 2000;342(21):1581-9."
      ]
    },
    {
      id: "balance-fluidos",
      name: "Balance de fluidos por entradas y salidas",
      shortName: "Balance de fluidos",
      description: "Calcula el balance h\xEDdrico diario y estima el sodio administrado y las p\xE9rdidas insensibles.",
      category: CAT_FLUIDOS,
      specialty: FARM,
      inputs: [
        { id: "iv", type: "number", label: "Fluidos intravenosos administrados", unit: "mL", min: 0, max: 2e4, step: 10 },
        { id: "oral", type: "number", label: "Ingesta oral / enteral", unit: "mL", min: 0, max: 1e4, step: 10 },
        { id: "diuresis", type: "number", label: "Diuresis", unit: "mL", min: 0, max: 2e4, step: 10 },
        { id: "perdidas", type: "number", label: "Otras p\xE9rdidas (SNG, drenajes, heces l\xEDquidas)", unit: "mL", min: 0, max: 2e4, step: 10 },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 1, max: 250, step: 0.5 },
        { id: "temp", type: "number", label: "Temperatura m\xE1xima", unit: "\xB0C", min: 34, max: 42, step: 0.1 },
        { id: "horas", type: "number", label: "Horas del per\xEDodo", unit: "h", min: 1, max: 72, step: 1 }
      ],
      compute: (v) => {
        const insensibles = 0.5 * v.peso * v.horas;
        const extraFiebre = Math.max(0, v.temp - 37) * 0.5 * v.peso;
        const salidas = v.diuresis + v.perdidas + insensibles + extraFiebre;
        const balance = v.iv + v.oral - salidas;
        return {
          main: fmt(balance, 0),
          mainUnit: "mL de balance",
          secondary: fmt(salidas, 0),
          secondaryLabel: "mL de salidas totales",
          interpretation: balance > 500 ? "Balance positivo: valorar riesgo de sobrecarga (crepitantes, edema, presi\xF3n venosa)." : balance < -500 ? "Balance negativo: valorar hipoperfusi\xF3n y ajustar el aporte." : "Balance dentro de un rango habitual.",
          level: balance > 1e3 || balance < -1e3 ? "warn" : "ok",
          details: [
            `P\xE9rdidas insensibles estimadas: ${fmt(insensibles, 0)} mL (0,5 mL/kg/h).`,
            `P\xE9rdidas adicionales por fiebre: ${fmt(extraFiebre, 0)} mL (0,5 mL/kg por cada \xB0C sobre 37).`,
            "Sumar sudoraci\xF3n profusa y taquipnea marcadas si son significativas."
          ]
        };
      }
    },
    {
      id: "conversion-esteroides",
      name: "Conversi\xF3n de esteroides",
      shortName: "Esteroides",
      description: "Convierte dosis de corticoides sist\xE9micos entre s\xED usando la potencia glucocorticoide relativa.",
      category: CAT_FARMACO,
      specialty: FARM,
      inputs: [
        {
          id: "origen",
          type: "select",
          label: "Corticoide de partida",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Cortisona", value: 25 },
            { label: "Hidrocortisona", value: 20 },
            { label: "Prednisona", value: 5 },
            { label: "Prednisolona", value: 5.0001 },
            { label: "Metilprednisolona", value: 4 },
            { label: "Triamcinolona", value: 4.0001 },
            { label: "Deflazacort", value: 6 },
            { label: "Dexametasona", value: 0.75 },
            { label: "Betametasona", value: 0.6 }
          ]
        },
        { id: "dosis", type: "number", label: "Dosis de partida", unit: "mg", min: 0.1, max: 2e3, step: 0.5 },
        {
          id: "destino",
          type: "select",
          label: "Corticoide equivalente",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Cortisona", value: 25 },
            { label: "Hidrocortisona", value: 20 },
            { label: "Prednisona", value: 5 },
            { label: "Prednisolona", value: 5.0001 },
            { label: "Metilprednisolona", value: 4 },
            { label: "Triamcinolona", value: 4.0001 },
            { label: "Deflazacort", value: 6 },
            { label: "Dexametasona", value: 0.75 },
            { label: "Betametasona", value: 0.6 }
          ]
        }
      ],
      compute: (v) => {
        const equiv = v.dosis * (v.destino ?? 4) / (v.origen ?? 5);
        return {
          main: fmt(equiv, 2),
          mainUnit: "mg equivalentes",
          interpretation: "Equivalencia glucocorticoide orientativa. Los corticoides difieren tambi\xE9n en potencia mineralocorticoide y duraci\xF3n de acci\xF3n; adaptar la pauta al escenario cl\xEDnico.",
          level: "info",
          details: [
            "Potencia mineralocorticoide: cortisona e hidrocortisona alta; prednisona/prednisolona intermedia; metilprednisolona/triamcinolona baja; dexametasona/betametasona nula.",
            "Duraci\xF3n de acci\xF3n: cortisona/hidrocortisona corta (8\u201312 h); prednisona/prednisolona/metilprednisolona/triamcinolona/deflazacort intermedia (12\u201336 h); dexametasona/betametasona larga (36\u201372 h)."
          ]
        };
      },
      notes: [
        "La conversi\xF3n de fluticasona, budesonida u otros inhalados o t\xF3picos no es equivalente a la sist\xE9mica: no usar esta calculadora para ellos.",
        "En dosis > 40 mg/d\xEDa de equivalentes de prednisona, valorar profilaxis g\xE1strica y \xF3sea, y cribado del riesgo cardiometab\xF3lico."
      ],
      references: [
        "Liu D, et al. A practical guide to the monitoring and management of the complications of systemic corticosteroid therapy. Allergy Asthma Clin Immunol. 2013;9(1):30."
      ]
    },
    {
      id: "levotiroxina",
      name: "Dosis inicial de levotiroxina para el hipotiroidismo",
      shortName: "Levotiroxina",
      description: "Estima la dosis diaria de levotiroxina en funci\xF3n del peso y del contexto cl\xEDnico.",
      category: CAT_FARMACO,
      specialty: FARM,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 30, max: 200, step: 0.5 },
        {
          id: "contexto",
          type: "select",
          label: "Contexto cl\xEDnico",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Hipotiroidismo primario en paciente joven sano (1,6 \xB5g/kg/d\xEDa)", value: 1.6 },
            { label: "Anciano o cardiopat\xEDa (0,3\u20130,5 \xB5g/kg/d\xEDa, comenzar bajo)", value: 0.4 },
            { label: "Post-tiroidectom\xEDa por c\xE1ncer (2,0 \xB5g/kg/d\xEDa)", value: 2 },
            { label: "Post-tiroidectom\xEDa benigna (1,7 \xB5g/kg/d\xEDa)", value: 1.7 },
            { label: "Embarazo (2,0\u20132,4 \xB5g/kg/d\xEDa)", value: 2.2 }
          ],
          default: 1.6
        }
      ],
      compute: (v) => {
        const dosis = v.peso * (v.contexto ?? 1.6);
        const dosisRedondeada = Math.round(dosis / 12.5) * 12.5;
        return {
          main: fmt(dosisRedondeada, 1),
          mainUnit: "\xB5g/d\xEDa",
          secondary: fmt(dosis, 0),
          secondaryLabel: "\xB5g/d\xEDa calculados sin redondear",
          interpretation: "Administrar en ayunas, 30\u201360 min antes del desayuno. Reevaluar TSH a las 6\u20138 semanas y ajustar la dosis en incrementos de 12,5\u201325 \xB5g. En ancianos y cardi\xF3patas, iniciar con 12,5\u201325 \xB5g/d\xEDa e ir subiendo.",
          level: "info",
          details: ["Presentaciones habituales: 25, 50, 75, 88, 100, 112, 125, 137, 150, 175, 200 \xB5g."]
        };
      },
      references: [
        "Jonklaas J, et al. Guidelines for the Treatment of Hypothyroidism (American Thyroid Association). Thyroid. 2014;24(12):1670-751."
      ]
    },
    {
      id: "hidroxicloroquina",
      name: "Dosis m\xE1xima segura de hidroxicloroquina",
      shortName: "Hidroxicloroquina",
      description: "Calcula la dosis m\xE1xima diaria de hidroxicloroquina que minimiza el riesgo de retinopat\xEDa (gu\xEDa AAO 2016).",
      category: CAT_FARMACO,
      specialty: FARM,
      inputs: [
        { id: "peso", type: "number", label: "Peso corporal real", unit: "kg", min: 30, max: 200, step: 0.5 }
      ],
      compute: (v) => {
        const dosis = 5 * v.peso;
        const dosisRedondeada = Math.min(Math.round(dosis / 100) * 100, 400);
        return {
          main: fmt(dosisRedondeada, 0),
          mainUnit: "mg/d\xEDa (m\xE1ximo)",
          secondary: fmt(dosis, 0),
          secondaryLabel: "mg/d\xEDa calculados",
          interpretation: "Dosis diaria m\xE1xima: 5 mg/kg de peso real, sin superar 400 mg/d\xEDa. Cribado oftalmol\xF3gico basal y anual a partir del quinto a\xF1o (antes si hay factores de riesgo).",
          level: "info",
          details: [
            "La gu\xEDa anterior (6,5 mg/kg de peso ideal) infraestimaba el riesgo en pacientes con sobrepeso.",
            "Factores de riesgo de retinopat\xEDa: dosis > 5 mg/kg/d\xEDa, duraci\xF3n > 5 a\xF1os, insuficiencia renal, uso concomitante de tamoxifeno, patolog\xEDa macular preexistente."
          ]
        };
      },
      references: [
        "Marmor MF, et al. Recommendations on Screening for Chloroquine and Hydroxychloroquine Retinopathy. Ophthalmology. 2016;123(6):1386-94."
      ]
    }
  ];

  // src/calculators/farmacia-opioides.ts
  var CAT20 = "Opioides, benzodiacepinas y controlados";
  var FARM2 = ["Farmacia"];
  var MME_FACTORS = [
    { label: "Morfina", via: "oral", factor: 1 },
    { label: "Morfina", via: "IV o SC", factor: 3 },
    { label: "Code\xEDna", via: "oral", factor: 0.15 },
    { label: "Tramadol", via: "oral", factor: 0.1 },
    { label: "Hidrocodona", via: "oral", factor: 1 },
    { label: "Oxicodona", via: "oral", factor: 1.5 },
    { label: "Oxicodona", via: "IV", factor: 3 },
    { label: "Hidromorfona", via: "oral", factor: 4 },
    { label: "Hidromorfona", via: "IV o SC", factor: 20 },
    { label: "Tapentadol", via: "oral", factor: 0.4 },
    { label: "Fentanilo parche", via: "transd\xE9rmico (\xB5g/h)", factor: 2.4, nota: "Multiplica los \xB5g/h del parche por 2,4 para obtener MME/d\xEDa" },
    { label: "Meperidina (petidina)", via: "oral", factor: 0.1 },
    { label: "Metadona", via: "oral (\u2264 20 mg/d\xEDa)", factor: 4 },
    { label: "Metadona", via: "oral (21\u201340 mg/d\xEDa)", factor: 8 },
    { label: "Metadona", via: "oral (41\u201360 mg/d\xEDa)", factor: 10 },
    { label: "Metadona", via: "oral (> 60 mg/d\xEDa)", factor: 12 },
    { label: "Buprenorfina", via: "transd\xE9rmica (\xB5g/h)", factor: 12.6, nota: "\xB5g/h \xD7 12,6 = MME/d\xEDa (aproximaci\xF3n)" },
    { label: "Buprenorfina", via: "sublingual (mg)", factor: 30, nota: "Aproximaci\xF3n; hay controversia sobre su MME por efecto techo" }
  ];
  var BENZO_EQUIV = [
    { label: "Diazepam", factor: 10 },
    { label: "Alprazolam", factor: 0.5 },
    { label: "Lorazepam", factor: 1 },
    { label: "Clonazepam", factor: 0.5 },
    { label: "Midazolam (oral)", factor: 7.5 },
    { label: "Oxazepam", factor: 20 },
    { label: "Temazepam", factor: 20 },
    { label: "Bromazepam", factor: 5 },
    { label: "Clobazam", factor: 20 },
    { label: "Cloracepato", factor: 15 },
    { label: "Ketazolam", factor: 15 },
    { label: "Flunitrazepam", factor: 1 }
  ];
  var farmaciaOpioides = [
    {
      id: "mme",
      name: "Miligramos equivalentes de morfina al d\xEDa (MME)",
      shortName: "MME diario",
      description: "Convierte una dosis diaria de opioide a miligramos equivalentes de morfina oral usando los factores de los CDC.",
      category: CAT20,
      specialty: FARM2,
      inputs: [
        {
          id: "farmaco",
          type: "select",
          label: "Opioide y v\xEDa",
          noPoints: true,
          dropdown: true,
          options: MME_FACTORS.map((m, i) => ({
            label: `${m.label} (${m.via})`,
            value: i
          }))
        },
        { id: "dosis", type: "number", label: "Dosis diaria total", unit: "mg (o \xB5g/h en parches)", min: 0, max: 5e3, step: 0.5 }
      ],
      compute: (v) => {
        const m = MME_FACTORS[v.farmaco ?? 0];
        const mme = v.dosis * m.factor;
        const banda = mme < 50 ? "baja" : mme < 90 ? "moderada" : mme < 200 ? "alta" : "muy alta";
        const level = mme < 50 ? "ok" : mme < 90 ? "warn" : "danger";
        return {
          main: fmt(mme, 1),
          mainUnit: "MME/d\xEDa",
          secondary: `Dosis ${banda}`,
          interpretation: mme < 50 ? "Dosis diaria baja seg\xFAn los umbrales de los CDC." : mme < 90 ? "A partir de 50 MME/d\xEDa, los CDC recomiendan reevaluar riesgos y beneficios, considerar naloxona domiciliaria y revisar comorbilidades." : mme < 200 ? "Dosis alta (\u2265 90 MME/d\xEDa): valorar consulta a unidad del dolor, evitar aumentos y aportar naloxona." : "Dosis muy alta (\u2265 200 MME/d\xEDa): riesgo significativo de sobredosis. Revisar indicaci\xF3n y estrategia de deshabituaci\xF3n.",
          level,
          details: [
            `Factor de conversi\xF3n: 1 mg de ${m.label} (${m.via}) = ${fmt(m.factor, 2)} MME.`,
            m.nota ?? "La conversi\xF3n es solo orientativa: cada paciente puede tener sensibilidad muy distinta.",
            "La metadona no es lineal: usar la tabla por tramo de dosis y ajustar con especial precauci\xF3n."
          ]
        };
      },
      notes: [
        "Estos factores no son dosis cl\xEDnicamente equivalentes ni deben usarse para rotar un opioide a otro sin reducir la dosis calculada al menos un 25\u201350 % por tolerancia cruzada incompleta.",
        "Los CDC recomiendan revaluar cuidadosamente cualquier paciente con \u2265 50 MME/d\xEDa y evitar en general los \u2265 90 MME/d\xEDa para dolor cr\xF3nico no oncol\xF3gico.",
        "La buprenorfina tiene efecto techo y su conversi\xF3n a MME es controvertida; interpr\xE9tala solo como orientaci\xF3n."
      ],
      references: [
        "Dowell D, et al. CDC Clinical Practice Guideline for Prescribing Opioids for Pain \u2014 United States, 2022. MMWR Recomm Rep. 2022;71(3):1-95."
      ]
    },
    {
      id: "rotacion-opioides",
      name: "Rotaci\xF3n de opioides",
      shortName: "Rotaci\xF3n de opioides",
      description: "Convierte una dosis de un opioide a otro usando los factores de MME y aplica una reducci\xF3n de seguridad por tolerancia cruzada incompleta.",
      category: CAT20,
      specialty: FARM2,
      inputs: [
        {
          id: "origen",
          type: "select",
          label: "Opioide y v\xEDa de partida",
          noPoints: true,
          dropdown: true,
          options: MME_FACTORS.map((m, i) => ({
            label: `${m.label} (${m.via})`,
            value: i
          }))
        },
        { id: "dosis", type: "number", label: "Dosis diaria de partida", unit: "mg (o \xB5g/h)", min: 0, max: 5e3, step: 0.5 },
        {
          id: "destino",
          type: "select",
          label: "Opioide y v\xEDa de destino",
          noPoints: true,
          dropdown: true,
          options: MME_FACTORS.map((m, i) => ({
            label: `${m.label} (${m.via})`,
            value: i
          }))
        },
        {
          id: "reduccion",
          type: "select",
          label: "Reducci\xF3n de seguridad por tolerancia cruzada",
          noPoints: true,
          options: [
            { label: "25 % (dolor bien controlado, paciente estable)", value: 0.75 },
            { label: "33 % (habitual)", value: 0.67 },
            { label: "50 % (rotaci\xF3n a metadona, ancianos, comorbilidad)", value: 0.5 },
            { label: "Sin reducci\xF3n", value: 1 }
          ],
          default: 0.67
        }
      ],
      compute: (v) => {
        const o = MME_FACTORS[v.origen ?? 0];
        const d = MME_FACTORS[v.destino ?? 0];
        if (!d.factor)
          return { main: "\u2014", interpretation: "El opioide de destino no tiene factor definido.", level: "warn" };
        const mme = v.dosis * o.factor;
        const equivalente = mme / d.factor;
        const ajustada = equivalente * (v.reduccion ?? 0.67);
        const rescate = ajustada * 0.1;
        return {
          main: fmt(ajustada, 1),
          mainUnit: `mg/d\xEDa de ${d.label} (${d.via})`,
          secondary: fmt(mme, 1),
          secondaryLabel: "MME/d\xEDa equivalentes",
          interpretation: `Dosis inicial recomendada tras la rotaci\xF3n. Repartir en las tomas habituales del opioide de destino y ajustar seg\xFAn respuesta y efectos adversos. Prever pauta de rescate (aprox. 10 % de la dosis diaria).`,
          level: "warn",
          details: [
            `Equivalente sin reducci\xF3n: ${fmt(equivalente, 1)} mg/d\xEDa.`,
            `Rescate orientativo: ${fmt(rescate, 1)} mg cada 4 h a demanda.`,
            "La rotaci\xF3n a metadona requiere consulta con especialista: la relaci\xF3n de conversi\xF3n no es lineal y su vida media prolongada aumenta el riesgo de acumulaci\xF3n.",
            "En rotaci\xF3n a parche transd\xE9rmico, mantener la analgesia previa 12\u201324 h tras la aplicaci\xF3n mientras se alcanza el estado estacionario."
          ]
        };
      },
      notes: [
        "Herramienta de apoyo: la rotaci\xF3n exige valoraci\xF3n cl\xEDnica individual y monitorizaci\xF3n estrecha en las primeras 24\u201372 h.",
        "Reduce la dosis calculada si el paciente presenta ancianidad, insuficiencia renal o hep\xE1tica, comorbilidad respiratoria o s\xEDndrome de apnea."
      ],
      references: [
        'Fine PG, Portenoy RK. Establishing "best practices" for opioid rotation. J Pain Symptom Manage. 2009;38(3):418-25.'
      ]
    },
    {
      id: "conversion-benzodiacepinas",
      name: "Conversi\xF3n de benzodiacepinas",
      shortName: "Benzodiacepinas",
      description: "Proporciona equivalencias orientativas entre benzodiacepinas usando el diazepam como referencia.",
      category: CAT20,
      specialty: FARM2,
      inputs: [
        {
          id: "origen",
          type: "select",
          label: "Benzodiacepina de partida",
          noPoints: true,
          dropdown: true,
          options: BENZO_EQUIV.map((b, i) => ({ label: b.label, value: i }))
        },
        { id: "dosis", type: "number", label: "Dosis diaria total", unit: "mg", min: 0.05, max: 500, step: 0.05 },
        {
          id: "destino",
          type: "select",
          label: "Benzodiacepina equivalente",
          noPoints: true,
          dropdown: true,
          options: BENZO_EQUIV.map((b, i) => ({ label: b.label, value: i }))
        }
      ],
      compute: (v) => {
        const o = BENZO_EQUIV[v.origen ?? 0];
        const d = BENZO_EQUIV[v.destino ?? 0];
        const diazepamEq = v.dosis / o.factor * 10;
        const equivalente = diazepamEq * d.factor / 10;
        return {
          main: fmt(equivalente, 2),
          mainUnit: `mg/d\xEDa de ${d.label}`,
          secondary: fmt(diazepamEq, 1),
          secondaryLabel: "mg/d\xEDa equivalentes de diazepam",
          interpretation: "La conversi\xF3n entre benzodiacepinas es aproximada y la variabilidad interindividual es alta. Vida media, potencia y ansiedad rebote difieren de una mol\xE9cula a otra.",
          level: "warn",
          details: [
            `Equivalencia de referencia: 10 mg de diazepam \u2261 ${fmt(o.factor, 2)} mg de ${o.label} \u2261 ${fmt(d.factor, 2)} mg de ${d.label}.`,
            "Al pasar a diazepam para deshabituaci\xF3n se aprovecha su vida media larga; hacerlo de forma gradual (5\u201310 % de reducci\xF3n cada 2\u20134 semanas).",
            "La retirada brusca puede precipitar convulsiones y delirio: nunca suspender abruptamente en tratamiento cr\xF3nico."
          ]
        };
      },
      notes: ["Los factores de equivalencia proceden del manual cl\xE1sico de Ashton; la comunidad cl\xEDnica los utiliza como referencia orientativa."],
      references: [
        "Ashton CH. Benzodiazepines: How they work and how to withdraw. Universidad de Newcastle, 2002 (rev. 2007)."
      ]
    },
    {
      id: "ciwa-b",
      name: "CIWA-B para la abstinencia de benzodiacepinas",
      shortName: "CIWA-B",
      description: "Eval\xFAa la gravedad del s\xEDndrome de abstinencia de benzodiacepinas.",
      category: CAT20,
      specialty: FARM2,
      inputs: [
        ...[
          ["irritabilidad", "Irritabilidad"],
          ["fatiga", "Fatiga"],
          ["tension", "Tensi\xF3n muscular"],
          ["dificultadConcentracion", "Dificultad para concentrarse"],
          ["perdidaApetito", "P\xE9rdida de apetito"],
          ["entumecimiento", "Entumecimiento u hormigueos"],
          ["tinnitus", "Zumbidos de o\xEDdos"],
          ["confusion", "Confusi\xF3n"],
          ["fotofobia", "Molestia con la luz"],
          ["fonofobia", "Molestia con el ruido"],
          ["pesadillas", "Pesadillas"],
          ["nauseas", "N\xE1useas"],
          ["temblor", "Temblor"],
          ["sudoracion", "Sudoraci\xF3n"],
          ["ansiedad", "Ansiedad"],
          ["agitacion", "Agitaci\xF3n"],
          ["alucinacionesV", "Alucinaciones visuales"],
          ["alucinacionesA", "Alucinaciones auditivas"],
          ["alucinacionesT", "Alucinaciones t\xE1ctiles"]
        ].map(([id, label]) => ({
          id,
          type: "select",
          label,
          options: [
            { label: "0 \u2014 Nada", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4 \u2014 Muy intenso", value: 4 }
          ]
        })),
        {
          id: "sueno",
          type: "select",
          label: "Alteraci\xF3n del sue\xF1o",
          options: [
            { label: "0 \u2014 Normal", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4 \u2014 Insomnio grave", value: 4 }
          ]
        },
        {
          id: "debilidad",
          type: "select",
          label: "Debilidad muscular",
          options: [
            { label: "0 \u2014 Ninguna", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4 \u2014 Grave", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const ids = [
          "irritabilidad",
          "fatiga",
          "tension",
          "dificultadConcentracion",
          "perdidaApetito",
          "entumecimiento",
          "tinnitus",
          "confusion",
          "fotofobia",
          "fonofobia",
          "pesadillas",
          "nauseas",
          "temblor",
          "sudoracion",
          "ansiedad",
          "agitacion",
          "alucinacionesV",
          "alucinacionesA",
          "alucinacionesT",
          "sueno",
          "debilidad"
        ];
        const score = ids.reduce((acc, id) => acc + (v[id] ?? 0), 0);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201384)",
          interpretation: score < 20 ? "Abstinencia leve: continuar reducci\xF3n gradual y vigilar." : score < 40 ? "Abstinencia moderada: enlentecer o parar la reducci\xF3n y valorar apoyo farmacol\xF3gico." : "Abstinencia intensa: riesgo de convulsiones y delirio; ingreso y tratamiento activo.",
          level: score < 20 ? "ok" : score < 40 ? "warn" : "danger"
        };
      },
      notes: ["Los umbrales son orientativos; la CIWA-B se usa junto a la cl\xEDnica para modular el ritmo de deshabituaci\xF3n."],
      references: [
        "Busto UE, et al. Clinical Institute Withdrawal Assessment for Benzodiazepines (CIWA-B). J Clin Psychopharmacol. 1989;9(6):412-6."
      ]
    }
  ];

  // src/calculators/pediatria.ts
  var CAT21 = "Neonatolog\xEDa y pediatr\xEDa";
  var PED = ["Cuidados Cr\xEDticos Neonatales", "Pediatr\xEDa"];
  var escala6 = (items) => items.map(([value, label]) => ({ label: `${value} \u2014 ${label}`, value }));
  var pediatria = [
    {
      id: "apgar",
      name: "Puntuaci\xF3n de Apgar del reci\xE9n nacido",
      shortName: "Apgar",
      description: "Eval\xFAa la adaptaci\xF3n del reci\xE9n nacido al minuto 1, 5 (y si procede al 10) de vida.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "aspecto",
          type: "select",
          label: "Aspecto (color)",
          dropdown: true,
          options: escala6([
            [0, "Azul o p\xE1lido"],
            [1, "Cuerpo rosado, extremidades azules (acrocianosis)"],
            [2, "Rosado en todo el cuerpo"]
          ])
        },
        {
          id: "pulso",
          type: "select",
          label: "Pulso (frecuencia card\xEDaca)",
          dropdown: true,
          options: escala6([
            [0, "Ausente"],
            [1, "< 100 lpm"],
            [2, "\u2265 100 lpm"]
          ])
        },
        {
          id: "gesto",
          type: "select",
          label: "Gesto (respuesta al est\xEDmulo)",
          dropdown: true,
          options: escala6([
            [0, "Sin respuesta"],
            [1, "Muecas"],
            [2, "Llora vigorosamente, tose o estornuda"]
          ])
        },
        {
          id: "actividad",
          type: "select",
          label: "Actividad (tono muscular)",
          dropdown: true,
          options: escala6([
            [0, "Fl\xE1cido"],
            [1, "Cierta flexi\xF3n de extremidades"],
            [2, "Movimientos activos, buena flexi\xF3n"]
          ])
        },
        {
          id: "respiracion",
          type: "select",
          label: "Respiraci\xF3n",
          dropdown: true,
          options: escala6([
            [0, "Ausente"],
            [1, "D\xE9bil, irregular o boqueo"],
            [2, "Buena, llanto vigoroso"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["aspecto", "pulso", "gesto", "actividad", "respiracion"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          interpretation: score >= 7 ? "Adaptaci\xF3n adecuada (7\u201310). Cuidados habituales." : score >= 4 ? "Adaptaci\xF3n moderadamente deprimida (4\u20136): reevaluar y valorar apoyo respiratorio." : "Adaptaci\xF3n gravemente deprimida (0\u20133): iniciar reanimaci\xF3n neonatal.",
          level: score >= 7 ? "ok" : score >= 4 ? "warn" : "danger"
        };
      },
      notes: [
        "Se registra al minuto 1 y a los 5 minutos; si a los 5 minutos es < 7, repetir cada 5 minutos hasta 20 minutos.",
        "La Academia Americana de Pediatr\xEDa desaconseja usar el Apgar como \xFAnico criterio para diagn\xF3stico de asfixia perinatal o para decisiones sobre reanimaci\xF3n (que debe iniciarse ya en el minuto 0 seg\xFAn necesidad)."
      ],
      references: [
        "Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-7.",
        "American Academy of Pediatrics; ACOG. The Apgar Score. Pediatrics. 2015;136(4):819-22."
      ]
    },
    {
      id: "finnegan",
      name: "Puntuaci\xF3n de Finnegan modificada para abstinencia neonatal (NAS)",
      shortName: "Finnegan (NAS)",
      description: "Cuantifica la gravedad del s\xEDndrome de abstinencia neonatal por opioides y gu\xEDa el tratamiento farmacol\xF3gico.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "llanto",
          type: "select",
          label: "Llanto",
          dropdown: true,
          options: escala6([
            [0, "Normal"],
            [2, "Agudo, excesivo"],
            [3, "Agudo continuo"]
          ])
        },
        {
          id: "sueno",
          type: "select",
          label: "Sue\xF1o tras la toma",
          dropdown: true,
          options: escala6([
            [0, "Duerme > 3 h"],
            [1, "Duerme < 3 h"],
            [2, "Duerme < 2 h"],
            [3, "Duerme < 1 h"]
          ])
        },
        {
          id: "moro",
          type: "select",
          label: "Reflejo de Moro",
          dropdown: true,
          options: escala6([
            [0, "Normal"],
            [2, "Hiperactivo"],
            [3, "Muy hiperactivo"]
          ])
        },
        {
          id: "temblor",
          type: "select",
          label: "Temblor",
          dropdown: true,
          options: escala6([
            [0, "Ausente"],
            [1, "Leve al est\xEDmulo"],
            [2, "Moderado-intenso al est\xEDmulo"],
            [3, "Moderado-intenso en reposo"],
            [4, "Intenso continuo en reposo"]
          ])
        },
        { id: "tono", type: "boolean", label: "Aumento del tono muscular", points: 2 },
        { id: "erosiones", type: "boolean", label: "Erosiones/excoriaciones cut\xE1neas", points: 1 },
        { id: "mioclonias", type: "boolean", label: "Mioclon\xEDas", points: 3 },
        { id: "convulsiones", type: "boolean", label: "Convulsiones generalizadas", points: 5 },
        {
          id: "sudoracion",
          type: "boolean",
          label: "Sudoraci\xF3n"
        },
        {
          id: "temperatura",
          type: "select",
          label: "Temperatura",
          dropdown: true,
          options: escala6([
            [0, "Normal"],
            [1, "37,2\u201338,3 \xB0C"],
            [2, "> 38,3 \xB0C"]
          ])
        },
        { id: "bostezos", type: "boolean", label: "Bostezos frecuentes (> 3\u20134 en el intervalo)" },
        { id: "aleteo", type: "boolean", label: "Aleteo nasal", points: 2 },
        {
          id: "estornudos",
          type: "boolean",
          label: "Estornudos frecuentes (> 3\u20134 en el intervalo)"
        },
        {
          id: "respiracion",
          type: "select",
          label: "Frecuencia respiratoria",
          dropdown: true,
          options: escala6([
            [0, "< 60 rpm"],
            [1, "> 60 rpm"],
            [2, "> 60 rpm con tiraje"]
          ])
        },
        { id: "succion", type: "boolean", label: "Succi\xF3n excesiva o desorganizada" },
        { id: "alimentacion", type: "boolean", label: "Toma deficiente (< 15 min o toma escasa)", points: 2 },
        { id: "regurgitacion", type: "boolean", label: "Regurgitaci\xF3n / v\xF3mitos en escopetazo", points: 2 },
        {
          id: "deposiciones",
          type: "select",
          label: "Deposiciones",
          dropdown: true,
          options: escala6([
            [0, "Normales"],
            [2, "Blandas"],
            [3, "L\xEDquidas o explosivas"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, [
          "llanto",
          "sueno",
          "moro",
          "temblor",
          "tono",
          "erosiones",
          "mioclonias",
          "convulsiones",
          "sudoracion",
          "temperatura",
          "bostezos",
          "aleteo",
          "estornudos",
          "respiracion",
          "succion",
          "alimentacion",
          "regurgitacion",
          "deposiciones"
        ]);
        return {
          main: String(score),
          mainUnit: "puntos",
          interpretation: score < 8 ? "Abstinencia leve: continuar cuidados no farmacol\xF3gicos (contacto piel con piel, lactancia materna, ambiente tranquilo, agrupaci\xF3n de cuidados)." : score <= 11 ? "Abstinencia moderada: si se repite \u2265 8 en dos evaluaciones consecutivas (o \u2265 12 en una), iniciar tratamiento farmacol\xF3gico (morfina oral 0,04 mg/kg/dosis cada 3\u20134 h suele ser el f\xE1rmaco de primera l\xEDnea)." : "Abstinencia intensa: tratamiento farmacol\xF3gico y valoraci\xF3n por neonatolog\xEDa. Ajustar dosis seg\xFAn puntuaci\xF3n cada 3\u20134 h.",
          level: score < 8 ? "ok" : score <= 11 ? "warn" : "danger"
        };
      },
      notes: [
        "Evaluar cada 3\u20134 h coincidiendo con las tomas; nunca despertar al ni\xF1o para valorar.",
        "La AAP recomienda desde 2020 priorizar los cuidados no farmacol\xF3gicos y usar herramientas m\xE1s simples como Eat-Sleep-Console cuando sea posible; Finnegan sigue vigente donde no se haya adoptado el nuevo enfoque.",
        "Un umbral de tratamiento farmacol\xF3gico habitual es puntuaci\xF3n \u2265 8 en dos evaluaciones consecutivas o \u2265 12 en una."
      ],
      references: [
        "Finnegan LP, et al. Neonatal abstinence syndrome: assessment and management. Addict Dis. 1975;2(1-2):141-58."
      ]
    },
    {
      id: "esc",
      name: "Enfoque \xABEat, Sleep, Console\xBB (ESC) para el s\xEDndrome de abstinencia neonatal",
      shortName: "ESC",
      description: "Gu\xEDa funcional para el manejo del s\xEDndrome de abstinencia neonatal: alimentaci\xF3n, sue\xF1o y consolabilidad.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "comer",
          type: "select",
          label: "Alimentaci\xF3n (Eat)",
          options: [
            { label: "Toma \u2265 1 oz (30 mL) o al pecho \u2265 10 min sin dificultad", value: 0 },
            { label: "Toma comprometida por s\xEDntomas de abstinencia", value: 1 }
          ]
        },
        {
          id: "dormir",
          type: "select",
          label: "Sue\xF1o (Sleep)",
          options: [
            { label: "Duerme \u2265 1 hora seguida sin ser molestado", value: 0 },
            { label: "Sue\xF1o limitado a menos de 1 hora por s\xEDntomas", value: 1 }
          ]
        },
        {
          id: "consolar",
          type: "select",
          label: "Consolabilidad (Console)",
          options: [
            { label: "Se consuela en \u2264 10 minutos con intervenci\xF3n de los cuidadores", value: 0 },
            { label: "No se consuela en 10 minutos con intervenciones adecuadas", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const puntos = sum(v, ["comer", "dormir", "consolar"]);
        return {
          main: puntos === 0 ? "Manejo no farmacol\xF3gico" : `${puntos}/3 dominios afectados`,
          interpretation: puntos === 0 ? "El neonato come, duerme y se consuela adecuadamente: continuar con cuidados no farmacol\xF3gicos (contacto piel con piel, agrupaci\xF3n de cuidados, lactancia materna, ambiente tranquilo, alojamiento conjunto)." : "Uno o m\xE1s dominios afectados: optimizar los cuidados no farmacol\xF3gicos y reevaluar tras 30\u201360 minutos con intervenciones. Si persiste el fallo, valorar iniciar/aumentar tratamiento farmacol\xF3gico.",
          level: puntos === 0 ? "ok" : puntos === 1 ? "warn" : "danger"
        };
      },
      notes: [
        "ESC no sustituye a Finnegan: es un enfoque funcional distinto que ha demostrado reducir la duraci\xF3n de la hospitalizaci\xF3n y la exposici\xF3n a opioides en el neonato.",
        "Los padres son coprotagonistas del cuidado: el alojamiento conjunto y su implicaci\xF3n son parte esencial del abordaje."
      ],
      references: [
        "Grossman MR, et al. An Initiative to Improve the Quality of Care of Infants With Neonatal Abstinence Syndrome. Pediatrics. 2017;139(6):e20163360.",
        "Young LW, et al. Eat, Sleep, Console Approach or Usual Care for Neonatal Opioid Withdrawal. N Engl J Med. 2023;388(25):2326-37."
      ]
    },
    {
      id: "bhutani",
      name: "Nomograma de Bhutani para el riesgo de hiperbilirrubinemia",
      shortName: "Bhutani",
      description: "Clasifica el riesgo de hiperbilirrubinemia significativa en reci\xE9n nacidos \u2265 35 semanas a partir de la bilirrubina por horas de vida.",
      category: CAT21,
      specialty: PED,
      inputs: [
        { id: "horas", type: "number", label: "Edad postnatal", unit: "horas", min: 12, max: 168, step: 1 },
        { id: "bilirrubina", type: "number", label: "Bilirrubina total s\xE9rica", unit: "mg/dL", min: 0, max: 40, step: 0.1 }
      ],
      compute: (v) => {
        const h = v.horas;
        const p40 = h < 24 ? 4 + h / 24 * 1.5 : h < 48 ? 5.5 + (h - 24) / 24 * 2 : h < 72 ? 7.5 + (h - 48) / 24 * 1.5 : h < 96 ? 9 + (h - 72) / 24 * 0.5 : 9.5;
        const p75 = h < 24 ? 5 + h / 24 * 2 : h < 48 ? 7 + (h - 24) / 24 * 2.5 : h < 72 ? 9.5 + (h - 48) / 24 * 1.5 : h < 96 ? 11 + (h - 72) / 24 * 0.5 : 11.5;
        const p95 = h < 24 ? 6 + h / 24 * 2 : h < 48 ? 8 + (h - 24) / 24 * 3 : h < 72 ? 11 + (h - 48) / 24 * 2 : h < 96 ? 13 + (h - 72) / 24 * 1 : 14;
        const b = v.bilirrubina;
        let zona, level;
        if (b < p40) {
          zona = "Riesgo bajo (bajo percentil 40)";
          level = "ok";
        } else if (b < p75) {
          zona = "Riesgo intermedio-bajo (percentil 40\u201375)";
          level = "info";
        } else if (b < p95) {
          zona = "Riesgo intermedio-alto (percentil 75\u201395)";
          level = "warn";
        } else {
          zona = "Riesgo alto (\u2265 percentil 95)";
          level = "danger";
        }
        return {
          main: fmt(b, 1),
          mainUnit: "mg/dL",
          secondary: zona,
          interpretation: level === "ok" ? "Riesgo bajo de hiperbilirrubinemia significativa: seguimiento cl\xEDnico habitual." : level === "info" ? "Riesgo intermedio-bajo: nueva medici\xF3n en 24\u201348 h seg\xFAn juicio cl\xEDnico y factores de riesgo." : level === "warn" ? "Riesgo intermedio-alto: repetir bilirrubina en 12\u201324 h y valorar factores de riesgo." : "Riesgo alto: bilirrubina cercana o superior al percentil 95; comparar con el umbral de fototerapia seg\xFAn horas de vida, edad gestacional y factores de riesgo (gu\xEDa AAP 2022) y actuar sin demora.",
          level,
          details: [
            `Percentiles aproximados a las ${h} h: P40 \u2248 ${fmt(p40, 1)}, P75 \u2248 ${fmt(p75, 1)}, P95 \u2248 ${fmt(p95, 1)} mg/dL.`,
            "La decisi\xF3n de fototerapia se toma con el nomograma AAP 2022 seg\xFAn edad gestacional y factores de riesgo, no solo con el percentil de Bhutani."
          ]
        };
      },
      notes: [
        "Aplicable a reci\xE9n nacidos de \u2265 35 semanas de edad gestacional, sanos, sin enfermedad hemol\xEDtica.",
        "Los percentiles mostrados son una aproximaci\xF3n del nomograma original.",
        "Factores de riesgo adicionales: edad gestacional < 38 semanas, ictericia en las primeras 24 h, incompatibilidad ABO/Rh, hermano con fototerapia, lactancia materna exclusiva mal establecida, cefalohematoma, sexo masculino."
      ],
      references: [
        "Bhutani VK, et al. Predictive ability of a predischarge hour-specific serum bilirubin for subsequent significant hyperbilirubinemia. Pediatrics. 1999;103(1):6-14.",
        "AAP. Clinical Practice Guideline Revision: Management of Hyperbilirubinemia in the Newborn Infant 35 or More Weeks of Gestation. Pediatrics. 2022;150(3):e2022058859."
      ]
    },
    {
      id: "rochester",
      name: "Criterios de Rochester para lactantes febriles",
      shortName: "Rochester",
      description: "Identifica a los lactantes \u2264 60 d\xEDas con fiebre que tienen bajo riesgo de infecci\xF3n bacteriana grave.",
      category: CAT21,
      specialty: PED,
      inputs: [
        { id: "aspecto", type: "boolean", label: "Aspecto cl\xEDnico bueno" },
        { id: "termino", type: "boolean", label: "Reci\xE9n nacido a t\xE9rmino, sin complicaciones perinatales" },
        { id: "antibioticos", type: "boolean", label: "Sin antibioterapia perinatal ni actual" },
        { id: "hospital", type: "boolean", label: "Sin hospitalizaciones previas ni enfermedad cr\xF3nica" },
        { id: "foco", type: "boolean", label: "Sin foco infeccioso al examen f\xEDsico (piel, tejidos blandos, huesos, o\xEDdos)" },
        { id: "leucos", type: "boolean", label: "Leucocitos 5.000\u201315.000/mm\xB3" },
        { id: "cayados", type: "boolean", label: "Cayados < 1.500/mm\xB3" },
        { id: "orina", type: "boolean", label: "Sedimento urinario < 10 leucocitos/campo o tira de orina negativa" },
        { id: "heces", type: "boolean", label: "Si hay diarrea: < 5 leucocitos/campo en heces" }
      ],
      compute: (v) => {
        const ids = ["aspecto", "termino", "antibioticos", "hospital", "foco", "leucos", "cayados", "orina", "heces"];
        const cumplidos = sum(v, ids);
        const bajoRiesgo = cumplidos === ids.length;
        return {
          main: bajoRiesgo ? "Bajo riesgo" : "No cumple criterios",
          secondary: `${cumplidos}/${ids.length}`,
          secondaryLabel: "criterios positivos",
          interpretation: bajoRiesgo ? "Todos los criterios cumplidos: riesgo bajo de infecci\xF3n bacteriana grave (VPN \u2248 98,9 %). Puede plantearse manejo ambulatorio con seguimiento en 24 h, seg\xFAn protocolo local." : "No cumple todos los criterios: no puede clasificarse como bajo riesgo; completar estudio de sepsis y valorar ingreso con antibioterapia emp\xEDrica.",
          level: bajoRiesgo ? "ok" : "danger"
        };
      },
      notes: [
        "Aplicable a lactantes \u2264 60 d\xEDas con temperatura rectal \u2265 38 \xB0C.",
        "Las gu\xEDas actuales (AAP 2021, Step-by-Step europeo, PECARN 2019) han refinado el abordaje: usar la escala que cada centro tenga protocolizada."
      ],
      references: [
        "Jaskiewicz JA, et al. Febrile infants at low risk for serious bacterial infection: an appraisal of the Rochester criteria. Pediatrics. 1994;94(3):390-6."
      ]
    },
    {
      id: "step-by-step",
      name: "Enfoque paso a paso (Step-by-step) para lactantes febriles",
      shortName: "Step-by-step",
      description: "Algoritmo europeo secuencial para identificar lactantes \u2264 90 d\xEDas con fiebre y bajo riesgo de infecci\xF3n bacteriana grave.",
      category: CAT21,
      specialty: PED,
      inputs: [
        { id: "malAspecto", type: "boolean", label: "\xBFMal aspecto cl\xEDnico?", noPoints: true },
        { id: "menor21", type: "boolean", label: "\xBFEdad \u2264 21 d\xEDas?", noPoints: true },
        { id: "orinaAlt", type: "boolean", label: "\xBFTira reactiva de orina alterada?", description: "Leucocituria o nitritos positivos.", noPoints: true },
        { id: "pct", type: "boolean", label: "\xBFProcalcitonina \u2265 0,5 ng/mL?", noPoints: true },
        { id: "pcr", type: "boolean", label: "\xBFPCR > 20 mg/L?", noPoints: true },
        { id: "nan", type: "boolean", label: "\xBFNeutr\xF3filos absolutos > 10.000/mm\xB3?", noPoints: true }
      ],
      compute: (v) => {
        if (v.malAspecto === 1)
          return {
            main: "Alto riesgo",
            interpretation: "Mal aspecto cl\xEDnico: ingreso, estudio completo (hemocultivo, urocultivo, LCR) y antibioterapia emp\xEDrica.",
            level: "danger"
          };
        if (v.menor21 === 1)
          return {
            main: "Alto riesgo",
            interpretation: "Edad \u2264 21 d\xEDas: por edad, se recomienda ingreso, estudio completo (incluida punci\xF3n lumbar) y antibioterapia emp\xEDrica independientemente del resto de par\xE1metros.",
            level: "danger"
          };
        if (v.orinaAlt === 1)
          return {
            main: "Riesgo intermedio",
            interpretation: "Tira de orina alterada: probable infecci\xF3n urinaria. Sedimento y urocultivo; ingreso o manejo ambulatorio seg\xFAn protocolo local.",
            level: "warn"
          };
        if (v.pct === 1)
          return {
            main: "Alto riesgo",
            interpretation: "Procalcitonina \u2265 0,5 ng/mL: riesgo elevado de infecci\xF3n bacteriana invasiva; estudio completo, ingreso y antibioterapia emp\xEDrica.",
            level: "danger"
          };
        if (v.pcr === 1 || v.nan === 1)
          return {
            main: "Riesgo intermedio",
            interpretation: "PCR > 20 mg/L o neutr\xF3filos > 10.000/mm\xB3 con procalcitonina normal: observaci\xF3n hospitalaria durante 24 h; individualizar necesidad de antibioterapia.",
            level: "warn"
          };
        return {
          main: "Bajo riesgo",
          interpretation: "Bien aspecto, > 21 d\xEDas, tira de orina normal, procalcitonina < 0,5, PCR \u2264 20 y neutr\xF3filos \u2264 10.000: bajo riesgo de infecci\xF3n bacteriana invasiva (VPN \u2248 99,3 %). Puede considerarse manejo ambulatorio en > 21 d\xEDas con adecuado seguimiento, seg\xFAn protocolo local.",
          level: "ok"
        };
      },
      notes: [
        "Aplicable a lactantes \u2264 90 d\xEDas con fiebre sin foco.",
        "Rendimiento superior a Rochester y Filadelfia para detectar meningitis bacteriana en menores de 90 d\xEDas."
      ],
      references: [
        'G\xF3mez B, et al. Validation of the "Step-by-Step" approach in the management of young febrile infants. Pediatrics. 2016;138(2):e20154381.'
      ]
    },
    {
      id: "pecarn-lactantes",
      name: "PECARN para lactantes febriles de 8\u201360 d\xEDas",
      shortName: "PECARN 8\u201360 d",
      description: "Regla de decisi\xF3n para identificar lactantes de 8 a 60 d\xEDas con fiebre y bajo riesgo de infecci\xF3n bacteriana grave.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "orinaAlt",
          type: "boolean",
          label: "\xBFAn\xE1lisis de orina alterado?",
          description: "Cualquiera: leucoesterasa positiva, nitritos positivos o > 5 leucocitos por campo.",
          noPoints: true
        },
        { id: "nan", type: "boolean", label: "\xBFNeutr\xF3filos absolutos > 4.090/mm\xB3?", noPoints: true },
        { id: "pct", type: "boolean", label: "\xBFProcalcitonina > 1,71 ng/mL?", noPoints: true }
      ],
      compute: (v) => {
        const bajo = v.orinaAlt === 0 && v.nan === 0 && v.pct === 0;
        return {
          main: bajo ? "Bajo riesgo" : "No bajo riesgo",
          interpretation: bajo ? "Los tres marcadores dentro de rango: sensibilidad 97,7 % para infecci\xF3n bacteriana grave y 100 % para infecci\xF3n bacteriana invasiva. Puede considerarse manejo sin punci\xF3n lumbar y observaci\xF3n (individualizar seg\xFAn edad y protocolo local)." : "Al menos un marcador alterado: no se cumple la regla de bajo riesgo. Ampliar estudio (incluida punci\xF3n lumbar en < 28 d\xEDas o si otros signos) e iniciar antibioterapia emp\xEDrica seg\xFAn protocolo.",
          level: bajo ? "ok" : "danger"
        };
      },
      notes: [
        "Aplicable a lactantes de 29 a 60 d\xEDas con fiebre \u2265 38 \xB0C y buen aspecto. En menores de 28 d\xEDas se recomienda estudio completo y antibioterapia emp\xEDrica independientemente de la regla.",
        "La procalcitonina puede no estar disponible en todos los centros; su ausencia limita la aplicabilidad de la regla."
      ],
      references: [
        "Kuppermann N, et al. A Clinical Prediction Rule to Identify Febrile Infants 60 Days and Younger at Low Risk for Serious Bacterial Infections. JAMA Pediatr. 2019;173(4):342-51."
      ]
    },
    {
      id: "sirs-pediatrico",
      name: "SIRS pedi\xE1trico (criterios de Goldstein)",
      shortName: "SIRS pedi\xE1trico",
      description: "Criterios del International Pediatric Sepsis Consensus para el s\xEDndrome de respuesta inflamatoria sist\xE9mica en ni\xF1os.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "temp",
          type: "boolean",
          label: "Temperatura central > 38,5 \xB0C o < 36 \xB0C"
        },
        {
          id: "leucos",
          type: "boolean",
          label: "Leucocitos alterados para la edad o > 10 % de cayados"
        },
        {
          id: "fc",
          type: "boolean",
          label: "Taquicardia (> 2 DE sobre la media para la edad) o bradicardia (< 1 a\xF1o)"
        },
        {
          id: "fr",
          type: "boolean",
          label: "Taquipnea (> 2 DE sobre la media) o necesidad de ventilaci\xF3n mec\xE1nica"
        },
        {
          id: "infeccion",
          type: "boolean",
          label: "Infecci\xF3n confirmada o sospechada",
          noPoints: true
        },
        {
          id: "disfuncion",
          type: "boolean",
          label: "Disfunci\xF3n cardiovascular o respiratoria aguda, o \u2265 2 disfunciones org\xE1nicas",
          noPoints: true
        }
      ],
      compute: (v) => {
        const criteriosSIRS = sum(v, ["temp", "leucos", "fc", "fr"]);
        const cumpleSIRS = criteriosSIRS >= 2 && (v.temp === 1 || v.leucos === 1);
        const sepsis = cumpleSIRS && v.infeccion === 1;
        const grave = sepsis && v.disfuncion === 1;
        return {
          main: grave ? "Sepsis grave o shock s\xE9ptico" : sepsis ? "Sepsis" : cumpleSIRS ? "SIRS" : "No cumple SIRS",
          secondary: `${criteriosSIRS}/4 criterios`,
          interpretation: grave ? "Sepsis grave / shock s\xE9ptico: reanimaci\xF3n con fluidos, antibioterapia precoz (idealmente en la primera hora) y valoraci\xF3n por cuidados intensivos pedi\xE1tricos." : sepsis ? "Sepsis pedi\xE1trica: activar bundle de sepsis (identificaci\xF3n, cultivos, antibioterapia emp\xEDrica en la primera hora, reanimaci\xF3n con fluidos)." : cumpleSIRS ? "SIRS sin infecci\xF3n demostrada: buscar causa (traumatismo, quemados, cirug\xEDa, pancreatitis\u2026)." : "No cumple criterios de SIRS: reevaluar la cl\xEDnica y las tendencias.",
          level: grave ? "danger" : sepsis ? "danger" : cumpleSIRS ? "warn" : "ok",
          details: [
            "SIRS = \u2265 2 de los 4 criterios, siendo obligatorio uno de ellos temperatura o leucocitos alterados."
          ]
        };
      },
      notes: [
        "Los umbrales de FC, FR y leucocitos var\xEDan por edad; usar los valores de referencia pedi\xE1tricos del centro.",
        "La consensuada Phoenix Sepsis Score (2024) sustituye progresivamente a los criterios de Goldstein para la definici\xF3n de sepsis pedi\xE1trica."
      ],
      references: [
        "Goldstein B, et al. International pediatric sepsis consensus conference: Definitions for sepsis and organ dysfunction in pediatrics. Pediatr Crit Care Med. 2005;6(1):2-8."
      ]
    },
    {
      id: "phoenix-sepsis",
      name: "Puntuaci\xF3n de sepsis Phoenix (2024)",
      shortName: "Phoenix Sepsis",
      description: "Definici\xF3n actualizada de sepsis pedi\xE1trica: identifica disfunci\xF3n org\xE1nica en ni\xF1os con sospecha de infecci\xF3n.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "respiratorio",
          type: "select",
          label: "Respiratorio",
          dropdown: true,
          options: [
            { label: "PaO\u2082/FiO\u2082 \u2265 400 o SpO\u2082/FiO\u2082 \u2265 292", value: 0 },
            { label: "PaO\u2082/FiO\u2082 < 400 o SpO\u2082/FiO\u2082 < 292 con ox\xEDgeno", value: 1 },
            { label: "PaO\u2082/FiO\u2082 100\u2013200 con soporte respiratorio invasivo, o 148\u2013220 con ventilaci\xF3n no invasiva", value: 2 },
            { label: "PaO\u2082/FiO\u2082 < 100 con soporte respiratorio invasivo, o SpO\u2082/FiO\u2082 < 148 con soporte", value: 3 }
          ]
        },
        {
          id: "cardiovascular",
          type: "select",
          label: "Cardiovascular \u2014 vasoactivos",
          dropdown: true,
          options: [
            { label: "Sin vasoactivos", value: 0 },
            { label: "1 vasoactivo", value: 1 },
            { label: "2 o m\xE1s vasoactivos", value: 2 }
          ]
        },
        {
          id: "lactato",
          type: "select",
          label: "Cardiovascular \u2014 lactato",
          dropdown: true,
          options: [
            { label: "< 5 mmol/L", value: 0 },
            { label: "5\u201310,9 mmol/L", value: 1 },
            { label: "\u2265 11 mmol/L", value: 2 }
          ]
        },
        {
          id: "pam",
          type: "select",
          label: "Cardiovascular \u2014 PAM por edad",
          dropdown: true,
          options: [
            { label: "PAM en rango normal para la edad", value: 0 },
            { label: "PAM entre 1 y 2 DE por debajo de lo normal", value: 1 },
            { label: "PAM > 2 DE por debajo de lo normal", value: 2 }
          ]
        },
        {
          id: "coagulacion",
          type: "select",
          label: "Coagulaci\xF3n",
          dropdown: true,
          options: [
            { label: "Sin alteraciones", value: 0 },
            { label: "Una alteraci\xF3n: plaquetas < 100.000, INR > 1,3, D-d\xEDmero > 2 mg/L o fibrin\xF3geno < 100 mg/dL", value: 1 },
            { label: "Dos o m\xE1s alteraciones", value: 2 }
          ]
        },
        {
          id: "neurologico",
          type: "select",
          label: "Neurol\xF3gico",
          dropdown: true,
          options: [
            { label: "GCS > 10 y pupilas reactivas", value: 0 },
            { label: "GCS \u2264 10", value: 1 },
            { label: "Pupilas fijas bilateralmente", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["respiratorio", "cardiovascular", "lactato", "pam", "coagulacion", "neurologico"]);
        const sepsis = score >= 2;
        const shock = (v.cardiovascular ?? 0) + (v.lactato ?? 0) + (v.pam ?? 0) >= 1 && sepsis;
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: shock ? "Shock s\xE9ptico" : sepsis ? "Sepsis" : "Sin sepsis",
          interpretation: shock ? "Sepsis pedi\xE1trica con disfunci\xF3n cardiovascular: shock s\xE9ptico. Reanimaci\xF3n con fluidos, vasoactivos precoces, antibioterapia emp\xEDrica en la primera hora y traslado a cuidados intensivos." : sepsis ? "Sepsis pedi\xE1trica seg\xFAn criterios Phoenix (\u2265 2 puntos con sospecha de infecci\xF3n). Activar bundle de sepsis pedi\xE1trica." : "No cumple criterios Phoenix de sepsis: reevaluar y considerar otras causas.",
          level: shock ? "danger" : sepsis ? "warn" : "ok"
        };
      },
      notes: [
        "La sepsis pedi\xE1trica se define por sospecha de infecci\xF3n + Phoenix \u2265 2.",
        "El shock s\xE9ptico requiere adem\xE1s \u2265 1 punto en el dominio cardiovascular.",
        "Los umbrales de PAM por edad y de FR/FC deben tomarse de las tablas de referencia pedi\xE1tricas."
      ],
      references: [
        "Schlapbach LJ, et al. International Consensus Criteria for Pediatric Sepsis and Septic Shock. JAMA. 2024;331(8):665-74."
      ]
    },
    {
      id: "fluidos-pediatricos",
      name: "Fluidos de mantenimiento pedi\xE1tricos (regla 4-2-1)",
      shortName: "Fluidos pedi\xE1tricos",
      description: "Calcula las necesidades diarias de fluidos y el ritmo horario en pacientes pedi\xE1tricos.",
      category: CAT21,
      specialty: PED,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 1, max: 100, step: 0.1 }
      ],
      compute: (v) => {
        const w = v.peso;
        const ritmo = w <= 10 ? 4 * w : w <= 20 ? 40 + 2 * (w - 10) : 60 + (w - 20);
        const dia = ritmo * 24;
        return {
          main: fmt(ritmo, 1),
          mainUnit: "mL/h de mantenimiento",
          secondary: fmt(dia, 0),
          secondaryLabel: "mL en 24 h",
          interpretation: "Ritmo de mantenimiento habitual (regla 4-2-1). A\xF1adir a este c\xE1lculo el d\xE9ficit por deshidrataci\xF3n y las p\xE9rdidas continuas si las hay.",
          level: "info",
          details: [
            "4 mL/kg/h para los primeros 10 kg + 2 mL/kg/h para los kg 11\u201320 + 1 mL/kg/h para el resto.",
            "Usar suero isot\xF3nico (0,9 % NaCl) con glucosa al 5 %: las gu\xEDas desaconsejan el uso rutinario de hipot\xF3nicos por riesgo de hiponatremia hospitalaria."
          ]
        };
      },
      references: [
        "Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957;19(5):823-32.",
        "Feld LG, et al. Clinical Practice Guideline: Maintenance Intravenous Fluids in Children. Pediatrics. 2018;142(6):e20183083."
      ]
    },
    {
      id: "tet-pediatrico",
      name: "Tama\xF1o del tubo endotraqueal pedi\xE1trico",
      shortName: "TET pedi\xE1trico",
      description: "Estima el di\xE1metro interno y la profundidad de fijaci\xF3n del tubo endotraqueal seg\xFAn la edad.",
      category: CAT21,
      specialty: PED,
      inputs: [
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 0, max: 18, step: 0.1 },
        {
          id: "balon",
          type: "select",
          label: "Tubo con o sin bal\xF3n",
          noPoints: true,
          options: [
            { label: "Sin bal\xF3n (cuffed = no)", value: 0 },
            { label: "Con bal\xF3n (cuffed = s\xED)", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const edad = v.edad;
        let diametro, profundidad;
        if (edad < 1) {
          diametro = v.balon === 1 ? 3 : 3.5;
          profundidad = edad < 0.08 ? 6 : 7;
        } else {
          diametro = v.balon === 1 ? 3.5 + edad / 4 : 4 + edad / 4;
          profundidad = 3 * diametro;
        }
        return {
          main: fmt(diametro, 1),
          mainUnit: "mm (di\xE1metro interno)",
          secondary: fmt(profundidad, 1),
          secondaryLabel: "cm de profundidad en la comisura labial",
          interpretation: "Estimaci\xF3n orientativa. Confirmar la posici\xF3n del tubo con auscultaci\xF3n bilateral, capnograf\xEDa y radiograf\xEDa de t\xF3rax (punta 1\u20132 cm sobre la carina).",
          level: "info",
          details: [
            `F\xF3rmulas: sin bal\xF3n \u2192 di\xE1metro = 4 + edad/4; con bal\xF3n \u2192 di\xE1metro = 3,5 + edad/4.`,
            `Profundidad \u2248 3 \xD7 di\xE1metro interno del tubo.`,
            "En neonatos usar el peso al nacer: < 1 kg \u2192 TET 2,5; 1\u20132 kg \u2192 3,0; 2\u20133 kg \u2192 3,0\u20133,5; > 3 kg \u2192 3,5.",
            "Preparar tambi\xE9n un tubo 0,5 mm m\xE1s grande y otro m\xE1s peque\xF1o."
          ]
        };
      },
      references: [
        "Khine HH, et al. Comparison of cuffed and uncuffed endotracheal tubes in young children during general anesthesia. Anesthesiology. 1997;86(3):627-31."
      ]
    },
    {
      id: "rebote-bilirrubina",
      name: "Riesgo de hiperbilirrubinemia de rebote tras fototerapia",
      shortName: "Rebote bilirrubina",
      description: "Estima el riesgo de que la bilirrubina vuelva a elevarse por encima del umbral de fototerapia tras suspenderla.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad gestacional",
          options: [
            { label: "\u2265 38 semanas", value: 0 },
            { label: "< 38 semanas", value: 1 }
          ]
        },
        {
          id: "inicio",
          type: "select",
          label: "Edad al inicio de la fototerapia",
          options: [
            { label: "\u2265 72 horas de vida", value: 0 },
            { label: "< 72 horas de vida", value: 1 }
          ]
        },
        {
          id: "diferencia",
          type: "number",
          label: "Diferencia entre umbral de fototerapia y bilirrubina al suspenderla",
          unit: "mg/dL",
          min: -5,
          max: 15,
          step: 0.1
        }
      ],
      compute: (v) => {
        const puntos = (v.edad ?? 0) * 3 + (v.inicio ?? 0) * 4 + Math.max(0, 8 - v.diferencia) * 0.4;
        const banda = puntos < 3 ? "bajo (< 5 %)" : puntos < 5 ? "intermedio (\u2248 15 %)" : "alto (\u2248 40 %)";
        return {
          main: fmt(puntos, 1),
          mainUnit: "puntos orientativos",
          secondary: banda,
          secondaryLabel: "riesgo de rebote",
          interpretation: puntos < 3 ? "Bajo riesgo de rebote: control cl\xEDnico habitual sin necesidad de bilirrubina de control precoz." : puntos < 5 ? "Riesgo intermedio: repetir bilirrubina a las 24 h de suspender la fototerapia." : "Alto riesgo de rebote: mantener fototerapia hasta un margen mayor bajo el umbral, o repetir bilirrubina en 12\u201324 h tras suspenderla.",
          level: puntos < 3 ? "ok" : puntos < 5 ? "warn" : "danger",
          details: [
            "Estimaci\xF3n orientativa basada en Chang 2017; la decisi\xF3n final se toma con la cl\xEDnica y el nomograma AAP 2022 vigente."
          ]
        };
      },
      notes: [
        "Los factores que m\xE1s aumentan el riesgo de rebote son: edad gestacional < 38 semanas, inicio de fototerapia < 72 h de vida, y bilirrubina al suspender cercana al umbral."
      ],
      references: [
        "Chang PW, et al. A Clinical Prediction Rule for Rebound Hyperbilirubinemia Following Inpatient Phototherapy. Pediatrics. 2017;139(3):e20162896."
      ]
    }
  ];

  // src/calculators/pediatria-2.ts
  var CAT22 = "Neonatolog\xEDa y pediatr\xEDa";
  var CAT_GO = "Obstetricia y ginecolog\xEDa";
  var PED2 = ["Pediatr\xEDa"];
  var OBS = ["Obstetricia"];
  var escala7 = (items) => items.map(([value, label]) => ({ label: `${value} \u2014 ${label}`, value }));
  var pediatria2 = [
    {
      id: "pecarn-head",
      name: "PECARN para traumatismo craneoencef\xE1lico pedi\xE1trico",
      shortName: "PECARN cabeza",
      description: "Regla de decisi\xF3n para identificar ni\xF1os con TCE leve que no necesitan tomograf\xEDa craneal.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad del paciente",
          noPoints: true,
          options: [
            { label: "< 2 a\xF1os", value: 0 },
            { label: "\u2265 2 a\xF1os", value: 1 }
          ]
        },
        { id: "gcs", type: "boolean", label: "GCS \u2264 14 o alteraci\xF3n del estado mental (agitaci\xF3n, somnolencia, respuestas lentas, preguntas repetidas)", noPoints: true },
        { id: "palpableInfant", type: "boolean", label: "< 2 a\xF1os: fractura craneal palpable", noPoints: true },
        { id: "baseCraneo", type: "boolean", label: "\u2265 2 a\xF1os: signos de fractura de base de cr\xE1neo (hemot\xEDmpano, ojos de mapache, otorrea o rinorrea de LCR, signo de Battle)", noPoints: true },
        { id: "hematomaCuero", type: "boolean", label: "< 2 a\xF1os: hematoma en cuero cabelludo no frontal", noPoints: true },
        { id: "perdidaConciencia", type: "boolean", label: "< 2 a\xF1os: p\xE9rdida de conciencia \u2265 5 s   |   \u2265 2 a\xF1os: p\xE9rdida de conciencia", noPoints: true },
        { id: "comportamiento", type: "boolean", label: "< 2 a\xF1os: cambio de comportamiento seg\xFAn los padres", noPoints: true },
        { id: "mecanismo", type: "boolean", label: "Mecanismo grave de lesi\xF3n (accidente veh\xEDculo, muerte de otro pasajero, atropello, ca\xEDda > 0,9 m si < 2 a\xF1os o > 1,5 m si \u2265 2 a\xF1os, impacto por objeto de alta energ\xEDa)", noPoints: true },
        { id: "vomitos", type: "boolean", label: "\u2265 2 a\xF1os: v\xF3mitos", noPoints: true },
        { id: "cefalea", type: "boolean", label: "\u2265 2 a\xF1os: cefalea intensa", noPoints: true }
      ],
      compute: (v) => {
        const menor2 = v.edad === 0;
        const factorAlto = v.gcs === 1 || (menor2 ? v.palpableInfant === 1 : v.baseCraneo === 1);
        const factorIntermedio = menor2 ? v.hematomaCuero === 1 || v.perdidaConciencia === 1 || v.comportamiento === 1 || v.mecanismo === 1 : v.perdidaConciencia === 1 || v.vomitos === 1 || v.cefalea === 1 || v.mecanismo === 1;
        if (factorAlto)
          return {
            main: "TC craneal recomendada",
            interpretation: "Factor de alto riesgo: riesgo de lesi\xF3n cerebral traum\xE1tica cl\xEDnicamente significativa \u2248 4,4 % en < 2 a\xF1os y 4,3 % en \u2265 2 a\xF1os. Se recomienda tomograf\xEDa craneal.",
            level: "danger"
          };
        if (factorIntermedio)
          return {
            main: "Observaci\xF3n o TC",
            interpretation: "Factores intermedios: riesgo \u2248 0,9 % en < 2 a\xF1os y 0,8 % en \u2265 2 a\xF1os. Decisi\xF3n compartida con la familia: observaci\xF3n 4\u20136 h en centro con TC disponible o tomograf\xEDa. Factores que inclinan hacia TC: s\xEDntomas o hallazgos empeoran, mecanismo grave, edad < 3 meses, preferencia parental.",
            level: "warn"
          };
        return {
          main: "TC no necesaria",
          interpretation: "Sin factores de riesgo: riesgo de lesi\xF3n cerebral traum\xE1tica cl\xEDnicamente significativa < 0,05 %. Puede evitarse la tomograf\xEDa y dar alta con recomendaciones de observaci\xF3n domiciliaria.",
          level: "ok"
        };
      },
      notes: [
        "Aplicable a ni\xF1os con GCS 14\u201315 en las primeras 24 h tras un traumatismo craneal cerrado no penetrante.",
        "Regla m\xE1s validada en pediatr\xEDa; sensibilidad pr\xE1cticamente del 100 % para lesi\xF3n que requiere neurocirug\xEDa."
      ],
      references: [
        "Kuppermann N, et al. Identification of children at very low risk of clinically-important brain injuries after head trauma: a prospective cohort study. Lancet. 2009;374(9696):1160-70."
      ]
    },
    {
      id: "catch",
      name: "Regla CATCH \u2014 traumatismo craneal pedi\xE1trico",
      shortName: "CATCH",
      description: "Regla canadiense de decisi\xF3n para tomograf\xEDa tras traumatismo craneal en ni\xF1os.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        { id: "gcs", type: "boolean", label: "GCS < 15 a las 2 horas del traumatismo", noPoints: true },
        { id: "fracturaAbierta", type: "boolean", label: "Sospecha de fractura craneal abierta o deprimida", noPoints: true },
        { id: "cefalea", type: "boolean", label: "Historia de cefalea que empeora", noPoints: true },
        { id: "irritabilidad", type: "boolean", label: "Irritabilidad al examen", noPoints: true },
        { id: "baseCraneo", type: "boolean", label: "Signos de fractura de base de cr\xE1neo", noPoints: true },
        { id: "hematoma", type: "boolean", label: "Hematoma extenso, blando y con crepitaci\xF3n en el cuero cabelludo", noPoints: true },
        { id: "mecanismo", type: "boolean", label: "Mecanismo peligroso (accidente veh\xEDculo, ca\xEDda > 0,9 m o de 5 escalones, ca\xEDda desde bicicleta sin casco)", noPoints: true }
      ],
      compute: (v) => {
        const alto = v.gcs === 1 || v.fracturaAbierta === 1 || v.cefalea === 1 || v.irritabilidad === 1;
        const medio = !alto && (v.baseCraneo === 1 || v.hematoma === 1 || v.mecanismo === 1);
        return {
          main: alto ? "TC obligada" : medio ? "TC recomendada" : "TC no necesaria",
          interpretation: alto ? "Factor de riesgo alto: tomograf\xEDa obligada por riesgo de necesidad de intervenci\xF3n neuroquir\xFArgica." : medio ? "Factor de riesgo medio: tomograf\xEDa recomendada por riesgo de lesi\xF3n cerebral en la imagen." : "Sin factores de riesgo: puede evitarse la tomograf\xEDa.",
          level: alto ? "danger" : medio ? "warn" : "ok"
        };
      },
      notes: ["Aplicable a ni\xF1os de 0\u201316 a\xF1os con GCS 13\u201315 tras un traumatismo craneal menor con p\xE9rdida de conciencia testificada, amnesia o v\xF3mitos."],
      references: [
        "Osmond MH, et al. CATCH: a clinical decision rule for the use of computed tomography in children with minor head injury. CMAJ. 2010;182(4):341-8."
      ]
    },
    {
      id: "chalice",
      name: "Regla CHALICE \u2014 traumatismo craneal pedi\xE1trico",
      shortName: "CHALICE",
      description: "Regla brit\xE1nica de decisi\xF3n para tomograf\xEDa tras traumatismo craneal en ni\xF1os < 16 a\xF1os.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        { id: "perdida", type: "boolean", label: "P\xE9rdida de conciencia > 5 minutos", noPoints: true },
        { id: "amnesia", type: "boolean", label: "Amnesia > 5 minutos", noPoints: true },
        { id: "somnolencia", type: "boolean", label: "Somnolencia anormal", noPoints: true },
        { id: "vomitos", type: "boolean", label: "\u2265 3 v\xF3mitos tras el traumatismo", noPoints: true },
        { id: "sospechaMaltrato", type: "boolean", label: "Sospecha de maltrato no accidental", noPoints: true },
        { id: "convulsion", type: "boolean", label: "Convulsi\xF3n postraum\xE1tica (sin epilepsia previa)", noPoints: true },
        { id: "gcs", type: "boolean", label: "GCS < 14 (o < 15 si < 1 a\xF1o)", noPoints: true },
        { id: "fractura", type: "boolean", label: "Sospecha de fractura craneal penetrante o deprimida, o fontanela abombada tensa", noPoints: true },
        { id: "baseCraneo", type: "boolean", label: "Signos de fractura de base de cr\xE1neo", noPoints: true },
        { id: "focal", type: "boolean", label: "D\xE9ficit neurol\xF3gico focal", noPoints: true },
        { id: "hematomaInfant", type: "boolean", label: "< 1 a\xF1o: hematoma, tumefacci\xF3n o laceraci\xF3n > 5 cm en cuero cabelludo", noPoints: true },
        { id: "mecanismo", type: "boolean", label: "Mecanismo peligroso (accidente veh\xEDculo alta velocidad, ca\xEDda > 3 m, impacto por objeto de alta velocidad)", noPoints: true }
      ],
      compute: (v) => {
        const positivo = ["perdida", "amnesia", "somnolencia", "vomitos", "sospechaMaltrato", "convulsion", "gcs", "fractura", "baseCraneo", "focal", "hematomaInfant", "mecanismo"].some((k) => v[k] === 1);
        return {
          main: positivo ? "TC indicada" : "TC no necesaria",
          interpretation: positivo ? "Al menos un criterio positivo: se recomienda tomograf\xEDa craneal." : "Ning\xFAn criterio positivo: puede evitarse la tomograf\xEDa (sensibilidad \u2248 98 % para lesi\xF3n cerebral cl\xEDnicamente significativa).",
          level: positivo ? "danger" : "ok"
        };
      },
      references: [
        "Dunning J, et al. Derivation of the children's head injury algorithm for the prediction of important clinical events decision rule for head injury in children. Arch Dis Child. 2006;91(11):885-91."
      ]
    },
    {
      id: "pas-samuel",
      name: "Puntuaci\xF3n de apendicitis pedi\xE1trica de Samuel (PAS)",
      shortName: "PAS",
      description: "Estima la probabilidad de apendicitis aguda en ni\xF1os con dolor abdominal.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        { id: "tos", type: "boolean", label: "Dolor con tos, salto o percusi\xF3n", points: 2 },
        { id: "anorexia", type: "boolean", label: "Anorexia" },
        { id: "fiebre", type: "boolean", label: "Fiebre > 38 \xB0C" },
        { id: "nauseas", type: "boolean", label: "N\xE1useas o v\xF3mitos" },
        { id: "fid", type: "boolean", label: "Dolor a la palpaci\xF3n en fosa il\xEDaca derecha", points: 2 },
        { id: "leucocitosis", type: "boolean", label: "Leucocitos > 10.000/mm\xB3" },
        { id: "neutrofilia", type: "boolean", label: "Neutr\xF3filos > 7.500/mm\xB3" },
        { id: "migracion", type: "boolean", label: "Migraci\xF3n del dolor a fosa il\xEDaca derecha" }
      ],
      compute: (v) => {
        const score = sum(v, ["tos", "anorexia", "fiebre", "nauseas", "fid", "leucocitosis", "neutrofilia", "migracion"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          interpretation: score <= 3 ? "Baja probabilidad de apendicitis: valorar alta con reevaluaci\xF3n." : score <= 6 ? "Probabilidad intermedia: observaci\xF3n y prueba de imagen (ecograf\xEDa)." : "Alta probabilidad de apendicitis: valoraci\xF3n quir\xFArgica.",
          level: score <= 3 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      references: [
        "Samuel M. Pediatric appendicitis score. J Pediatr Surg. 2002;37(6):877-81."
      ]
    },
    {
      id: "pgcs",
      name: "Escala de coma de Glasgow pedi\xE1trica",
      shortName: "GCS pedi\xE1trica",
      description: "Valora el nivel de conciencia en pacientes pedi\xE1tricos preverbales o verbales.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        {
          id: "ocular",
          type: "select",
          label: "Respuesta ocular",
          dropdown: true,
          options: escala7([
            [4, "Espont\xE1nea"],
            [3, "A la voz"],
            [2, "Al dolor"],
            [1, "Ninguna"]
          ]),
          default: 4
        },
        {
          id: "verbal",
          type: "select",
          label: "Respuesta verbal",
          dropdown: true,
          options: escala7([
            [5, "Sonr\xEDe/balbucea (< 2 a) o orientado (\u2265 2 a)"],
            [4, "Llanto consolable (< 2 a) o confuso (\u2265 2 a)"],
            [3, "Llanto inconsolable (< 2 a) o palabras inapropiadas (\u2265 2 a)"],
            [2, "Gemidos (< 2 a) o sonidos incomprensibles (\u2265 2 a)"],
            [1, "Ninguna"]
          ]),
          default: 5
        },
        {
          id: "motora",
          type: "select",
          label: "Respuesta motora",
          dropdown: true,
          options: escala7([
            [6, "Movimientos espont\xE1neos con prop\xF3sito"],
            [5, "Localiza el dolor"],
            [4, "Retirada al dolor"],
            [3, "Flexi\xF3n anormal (decorticaci\xF3n)"],
            [2, "Extensi\xF3n anormal (descerebraci\xF3n)"],
            [1, "Ninguna"]
          ]),
          default: 6
        }
      ],
      compute: (v) => {
        const score = sum(v, ["ocular", "verbal", "motora"]);
        return {
          main: String(score),
          mainUnit: "puntos (3\u201315)",
          secondary: `O${v.ocular} V${v.verbal} M${v.motora}`,
          interpretation: score >= 13 ? "Alteraci\xF3n leve del nivel de conciencia." : score >= 9 ? "Alteraci\xF3n moderada: vigilancia estrecha, neuroimagen." : "Alteraci\xF3n grave (\u2264 8): valorar aislamiento de la v\xEDa a\xE9rea.",
          level: score >= 13 ? "ok" : score >= 9 ? "warn" : "danger"
        };
      }
    },
    {
      id: "pts",
      name: "Puntuaci\xF3n de trauma pedi\xE1trica (PTS)",
      shortName: "PTS",
      description: "Valora la gravedad del traumatismo en ni\xF1os para orientar el triage.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        {
          id: "peso",
          type: "select",
          label: "Peso",
          options: escala7([
            [2, "> 20 kg"],
            [1, "10\u201320 kg"],
            [-1, "< 10 kg"]
          ])
        },
        {
          id: "aerea",
          type: "select",
          label: "V\xEDa a\xE9rea",
          options: escala7([
            [2, "Normal"],
            [1, "Mantenible (ox\xEDgeno, c\xE1nula)"],
            [-1, "Precisa intubaci\xF3n"]
          ])
        },
        {
          id: "pas",
          type: "select",
          label: "Presi\xF3n arterial sist\xF3lica",
          options: escala7([
            [2, "> 90 mmHg (o pulso perif\xE9rico palpable)"],
            [1, "50\u201390 mmHg (o pulso central palpable)"],
            [-1, "< 50 mmHg (o sin pulso)"]
          ])
        },
        {
          id: "conciencia",
          type: "select",
          label: "Nivel de conciencia",
          options: escala7([
            [2, "Despierto"],
            [1, "Somnoliento o p\xE9rdida de conciencia"],
            [-1, "Coma o descerebraci\xF3n"]
          ])
        },
        {
          id: "abierta",
          type: "select",
          label: "Heridas abiertas",
          options: escala7([
            [2, "Ninguna"],
            [1, "Menores"],
            [-1, "M\xFAltiples o penetrantes"]
          ])
        },
        {
          id: "esqueleto",
          type: "select",
          label: "Lesiones esquel\xE9ticas",
          options: escala7([
            [2, "Ninguna"],
            [1, "Fractura cerrada \xFAnica"],
            [-1, "Fractura abierta o m\xFAltiple"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["peso", "aerea", "pas", "conciencia", "abierta", "esqueleto"]);
        return {
          main: String(score),
          mainUnit: "puntos (\u22126 a +12)",
          interpretation: score >= 9 ? "Trauma leve: manejo habitual en urgencias." : score >= 6 ? "Trauma moderado: traslado a hospital con capacidad pedi\xE1trica." : "Trauma grave (\u2264 5): traslado a centro de referencia de trauma pedi\xE1trico.",
          level: score >= 9 ? "ok" : score >= 6 ? "warn" : "danger"
        };
      },
      references: [
        "Tepas JJ, et al. The Pediatric Trauma Score as a predictor of injury severity: an objective assessment. J Trauma. 1988;28(4):425-9."
      ]
    },
    {
      id: "westley-croup",
      name: "Puntuaci\xF3n de Westley para crup",
      shortName: "Westley (crup)",
      description: "Cuantifica la gravedad del crup viral (laringotraque\xEDtis aguda).",
      category: CAT22,
      specialty: PED2,
      inputs: [
        {
          id: "estridor",
          type: "select",
          label: "Estridor inspiratorio",
          options: escala7([
            [0, "Ausente"],
            [1, "Con la agitaci\xF3n"],
            [2, "En reposo"]
          ])
        },
        {
          id: "tiraje",
          type: "select",
          label: "Tiraje",
          options: escala7([
            [0, "Ausente"],
            [1, "Leve"],
            [2, "Moderado"],
            [3, "Intenso"]
          ])
        },
        {
          id: "aire",
          type: "select",
          label: "Entrada de aire",
          options: escala7([
            [0, "Normal"],
            [1, "Disminuida"],
            [2, "Muy disminuida"]
          ])
        },
        {
          id: "cianosis",
          type: "select",
          label: "Cianosis",
          options: escala7([
            [0, "Ausente"],
            [4, "Con la agitaci\xF3n"],
            [5, "En reposo"]
          ])
        },
        {
          id: "conciencia",
          type: "select",
          label: "Nivel de conciencia",
          options: escala7([
            [0, "Normal"],
            [5, "Alterado"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["estridor", "tiraje", "aire", "cianosis", "conciencia"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201317)",
          interpretation: score <= 2 ? "Crup leve: dexametasona 0,15\u20130,6 mg/kg oral en dosis \xFAnica, observaci\xF3n." : score <= 5 ? "Crup moderado: dexametasona y valorar adrenalina nebulizada." : score <= 11 ? "Crup grave: adrenalina nebulizada, dexametasona, ox\xEDgeno, observaci\xF3n estrecha." : "Insuficiencia respiratoria inminente: preparar v\xEDa a\xE9rea avanzada.",
          level: score <= 2 ? "ok" : score <= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Westley CR, Cotton EK, Brooks JG. Nebulized racemic epinephrine by IPPB for the treatment of croup. Am J Dis Child. 1978;132(5):484-7."
      ]
    },
    {
      id: "peld",
      name: "PELD \u2014 Model for End-Stage Liver Disease pedi\xE1trico",
      shortName: "PELD",
      description: "Cuantifica la gravedad de la hepatopat\xEDa cr\xF3nica en ni\xF1os < 12 a\xF1os en lista de trasplante hep\xE1tico.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        { id: "bilirrubina", type: "number", label: "Bilirrubina total", unit: "mg/dL", min: 0.1, max: 40, step: 0.1 },
        { id: "inr", type: "number", label: "INR", min: 0.5, max: 10, step: 0.01 },
        { id: "albumina", type: "number", label: "Alb\xFAmina", unit: "g/dL", min: 1, max: 6, step: 0.1 },
        { id: "menor1", type: "boolean", label: "Edad < 1 a\xF1o en el momento de la inclusi\xF3n en lista" },
        { id: "crecimiento", type: "boolean", label: "Fallo de crecimiento (< \u22122 DE en talla o peso)" }
      ],
      compute: (v) => {
        const acotar = (x, min) => Math.max(x, min);
        const bili = acotar(v.bilirrubina, 1);
        const inr = acotar(v.inr, 1);
        const alb = acotar(v.albumina, 1);
        const raw = 4.8 * Math.log(bili) + 18.57 * Math.log(inr) - 6.87 * Math.log(alb) + (v.menor1 === 1 ? 4.36 : 0) + (v.crecimiento === 1 ? 6.67 : 0);
        const peld = Math.max(0, Math.round(raw));
        return {
          main: String(peld),
          mainUnit: "PELD",
          interpretation: peld < 10 ? "Enfermedad hep\xE1tica compensada; seguimiento habitual." : peld < 20 ? "Deterioro moderado: valoraci\xF3n por hepatolog\xEDa pedi\xE1trica." : "Deterioro grave: prioridad en lista de trasplante.",
          level: peld < 10 ? "ok" : peld < 20 ? "warn" : "danger"
        };
      },
      notes: ["Aplicable a menores de 12 a\xF1os; a partir de 12 a\xF1os se usa el MELD del adulto."],
      references: [
        "McDiarmid SV, et al. Development of a pediatric end-stage liver disease score. Transplantation. 2002;74(2):173-81."
      ]
    },
    {
      id: "pucai",
      name: "PUCAI \u2014 \xCDndice de actividad de la colitis ulcerosa pedi\xE1trica",
      shortName: "PUCAI",
      description: "Cuantifica la actividad de la colitis ulcerosa en ni\xF1os sin necesidad de endoscopia.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        {
          id: "dolor",
          type: "select",
          label: "Dolor abdominal",
          options: escala7([
            [0, "Ausente"],
            [5, "Puede ignorarlo"],
            [10, "No puede ignorarlo"]
          ])
        },
        {
          id: "sangrado",
          type: "select",
          label: "Sangrado rectal",
          dropdown: true,
          options: escala7([
            [0, "Ausente"],
            [10, "Peque\xF1a cantidad, < 50 % de las deposiciones"],
            [20, "Peque\xF1a cantidad, en la mayor\xEDa"],
            [30, "Gran cantidad (> 50 % del contenido)"]
          ])
        },
        {
          id: "consistencia",
          type: "select",
          label: "Consistencia de las heces",
          options: escala7([
            [0, "Formadas"],
            [5, "Parcialmente formadas"],
            [10, "Completamente no formadas"]
          ])
        },
        {
          id: "deposiciones",
          type: "select",
          label: "N\xFAmero de deposiciones en 24 h",
          dropdown: true,
          options: escala7([
            [0, "0\u20132"],
            [5, "3\u20135"],
            [10, "6\u20138"],
            [15, "> 8"]
          ])
        },
        {
          id: "nocturnas",
          type: "select",
          label: "Deposiciones nocturnas (que despiertan)",
          options: escala7([
            [0, "No"],
            [10, "S\xED"]
          ])
        },
        {
          id: "actividad",
          type: "select",
          label: "Nivel de actividad",
          options: escala7([
            [0, "Sin limitaci\xF3n"],
            [5, "Actividad ocasionalmente limitada"],
            [10, "Muy limitada"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["dolor", "sangrado", "consistencia", "deposiciones", "nocturnas", "actividad"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201385)",
          interpretation: score < 10 ? "Remisi\xF3n (< 10): mantener tratamiento actual y controles." : score < 35 ? "Actividad leve (10\u201334)." : score < 65 ? "Actividad moderada (35\u201364): considerar intensificaci\xF3n del tratamiento." : "Actividad grave (\u2265 65): hospitalizaci\xF3n con corticoides intravenosos; PUCAI \u2265 45 al d\xEDa 3 y \u2265 65 al d\xEDa 5 predice fracaso a corticoides y necesita rescate.",
          level: score < 10 ? "ok" : score < 35 ? "info" : score < 65 ? "warn" : "danger"
        };
      },
      references: [
        "Turner D, et al. Development, validation, and evaluation of a pediatric ulcerative colitis activity index: a prospective multicenter study. Gastroenterology. 2007;133(2):423-32."
      ]
    },
    {
      // Renombrada localmente para evitar colisión con la ya existente en
      // cardio-varios.ts (que se mantiene con id 'kawasaki'). Se preserva
      // también aquí para que aparezca en el catálogo de Pediatría.
      id: "kawasaki-ped",
      name: "Criterios de la enfermedad de Kawasaki",
      shortName: "Kawasaki",
      description: "Diagn\xF3stico de la enfermedad de Kawasaki en ni\xF1os.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        { id: "fiebre", type: "boolean", label: "Fiebre \u2265 5 d\xEDas (o < 5 d\xEDas si se cumplen suficientes criterios)", noPoints: true },
        { id: "conjuntivitis", type: "boolean", label: "Conjuntivitis bilateral no exudativa", noPoints: true },
        { id: "oral", type: "boolean", label: "Alteraciones oro-far\xEDngeas (labios agrietados, lengua aframbuesada, faringe hiper\xE9mica)", noPoints: true },
        { id: "extremidades", type: "boolean", label: "Cambios en manos y pies (eritema/edema palmoplantar o descamaci\xF3n periungueal en fase subaguda)", noPoints: true },
        { id: "exantema", type: "boolean", label: "Exantema polimorfo", noPoints: true },
        { id: "adenopatia", type: "boolean", label: "Adenopat\xEDa cervical \u2265 1,5 cm, generalmente unilateral", noPoints: true }
      ],
      compute: (v) => {
        const criterios = sum(v, ["conjuntivitis", "oral", "extremidades", "exantema", "adenopatia"]);
        if (v.fiebre !== 1)
          return {
            main: "No cumple criterios",
            interpretation: "La fiebre \u2265 5 d\xEDas es un criterio obligatorio (o < 5 d\xEDas con \u2265 4 criterios adicionales si se sospecha fuertemente).",
            level: "ok"
          };
        if (criterios >= 4)
          return {
            main: "Kawasaki cl\xE1sica",
            interpretation: "Fiebre \u2265 5 d\xEDas + \u2265 4 criterios principales: se diagnostica enfermedad de Kawasaki. Iniciar inmunoglobulina intravenosa 2 g/kg en 12 h y AAS a dosis antiinflamatoria en las primeras 10 d\xEDas de fiebre.",
            level: "danger"
          };
        if (criterios >= 2)
          return {
            main: "Kawasaki incompleta posible",
            interpretation: "Fiebre \u2265 5 d\xEDas + 2\u20133 criterios: valorar Kawasaki incompleta. Solicitar PCR, VSG, hemograma, transaminasas, orina y ecocardiograma. Consultar criterios de laboratorio y de imagen de la AHA 2017.",
            level: "warn"
          };
        return {
          main: "Kawasaki improbable",
          interpretation: "Menos de 2 criterios adicionales: buscar otros diagn\xF3sticos. Si persiste la fiebre sin foco, reevaluar.",
          level: "ok"
        };
      },
      notes: [
        "La ecocardiograf\xEDa es indispensable en todo caso sospechado para valorar aneurismas coronarios.",
        "En Kawasaki incompleta, seguir el algoritmo de la AHA con laboratorio y ecocardiograma."
      ],
      references: [
        "McCrindle BW, et al. Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease. AHA Scientific Statement. Circulation. 2017;135(17):e927-e999."
      ]
    },
    {
      id: "crafft",
      name: "CRAFFT \u2014 Cribado de consumo de sustancias en adolescentes",
      shortName: "CRAFFT",
      description: "Cribado del consumo problem\xE1tico de alcohol y drogas en adolescentes.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        { id: "car", type: "boolean", label: "\xBFHas viajado en un coche conducido por alguien (incluido t\xFA) que hab\xEDa consumido alcohol o drogas? (C)" },
        { id: "relax", type: "boolean", label: "\xBFConsumes alcohol o drogas para relajarte, sentirte mejor o encajar? (R)" },
        { id: "alone", type: "boolean", label: "\xBFConsumes alcohol o drogas cuando est\xE1s solo/a? (A)" },
        { id: "forget", type: "boolean", label: "\xBFOlvidas cosas que has hecho estando bajo los efectos? (F)" },
        { id: "family", type: "boolean", label: "\xBFTu familia o amigos te han dicho que reduzcas el consumo? (F)" },
        { id: "trouble", type: "boolean", label: "\xBFTe has metido en problemas estando bajo los efectos? (T)" }
      ],
      compute: (v) => {
        const score = sum(v, ["car", "relax", "alone", "forget", "family", "trouble"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20136)",
          interpretation: score >= 2 ? "CRAFFT \u2265 2: alta sospecha de consumo problem\xE1tico o trastorno por consumo. Entrevista motivacional y valorar derivaci\xF3n a salud mental." : score === 1 ? "Una respuesta positiva: consejo breve, refuerzo y reevaluar." : "Cribado negativo: refuerzo positivo.",
          level: score >= 2 ? "danger" : score === 1 ? "warn" : "ok"
        };
      },
      notes: ["Aplicable a adolescentes de 12 a 21 a\xF1os. Una respuesta afirmativa a \xABcoche\xBB siempre exige consejo espec\xEDfico aunque el resto sea negativo."],
      references: [
        "Knight JR, et al. Validity of the CRAFFT substance abuse screening test among adolescent clinic patients. Arch Pediatr Adolesc Med. 2002;156(6):607-14."
      ]
    },
    {
      id: "heads-ed",
      name: "HEADS-ED \u2014 Cribado psicosocial pedi\xE1trico en urgencias",
      shortName: "HEADS-ED",
      description: "Herramienta r\xE1pida de cribado psicosocial para adolescentes que acuden a urgencias por motivos de salud mental.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        ...[
          ["home", "Home (hogar)"],
          ["education", "Educaci\xF3n / empleo"],
          ["activities", "Actividades y pares"],
          ["drugs", "Alcohol y drogas"],
          ["suicidalidad", "Suicidalidad"],
          ["emociones", "Emociones y comportamiento (ansiedad, depresi\xF3n\u2026)"],
          ["descargador", "Recursos de apoyo (professionals/discharge)"]
        ].map(([id, label]) => ({
          id,
          type: "select",
          label,
          options: escala7([
            [0, "Sin problemas"],
            [1, "Problemas leves-moderados"],
            [2, "Problemas graves o urgentes"]
          ])
        }))
      ],
      compute: (v) => {
        const ids = ["home", "education", "activities", "drugs", "suicidalidad", "emociones", "descargador"];
        const score = sum(v, ids);
        const suic = (v.suicidalidad ?? 0) === 2;
        const consulta = score >= 8 || suic;
        return {
          main: String(score),
          mainUnit: "puntos (0\u201314)",
          interpretation: consulta ? "Se recomienda consulta con psiquiatr\xEDa o salud mental (HEADS-ED \u2265 8 o suicidalidad grave)." : "Puntuaci\xF3n baja: seguir con evaluaci\xF3n cl\xEDnica habitual y valorar apoyo comunitario.",
          level: consulta ? "danger" : "warn"
        };
      },
      references: [
        "Cappelli M, et al. The HEADS-ED: a rapid mental health screening tool for pediatric patients in the emergency department. Pediatrics. 2012;130(2):e321-7."
      ]
    },
    {
      id: "lansky",
      name: "Escala de Lansky (equivalente pedi\xE1trico de Karnofsky)",
      shortName: "Lansky",
      description: "Eval\xFAa el nivel de actividad funcional en ni\xF1os con enfermedad grave (oncolog\xEDa pedi\xE1trica).",
      category: CAT22,
      specialty: PED2,
      inputs: [
        {
          id: "nivel",
          type: "select",
          label: "Nivel de actividad",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "100 \u2014 Totalmente activo, normal", value: 100 },
            { label: "90 \u2014 Restricciones menores en actividades f\xEDsicas intensas", value: 90 },
            { label: "80 \u2014 Activo pero se cansa antes", value: 80 },
            { label: "70 \u2014 Actividad limitada; se cansa con juegos activos", value: 70 },
            { label: "60 \u2014 Levantado y con juegos tranquilos; pocos juegos activos", value: 60 },
            { label: "50 \u2014 Se levanta y se viste; sin juegos activos; puede participar en juegos tranquilos", value: 50 },
            { label: "40 \u2014 Principalmente en cama; participa en actividades tranquilas", value: 40 },
            { label: "30 \u2014 En cama; necesita ayuda incluso para juegos tranquilos", value: 30 },
            { label: "20 \u2014 Duerme mucho; juego totalmente limitado a actividades muy pasivas", value: 20 },
            { label: "10 \u2014 No juega; no se levanta de la cama", value: 10 },
            { label: "0 \u2014 No responde", value: 0 }
          ]
        }
      ],
      compute: (v) => {
        const g = v.nivel ?? 100;
        return {
          main: String(g),
          mainUnit: "/100",
          interpretation: g >= 70 ? "Estado funcional preservado: tolerar\xE1 razonablemente los tratamientos." : g >= 40 ? "Estado funcional intermedio: valorar caso a caso." : "Estado funcional muy reducido: en general no se toleran los tratamientos oncol\xF3gicos activos; priorizar control sintom\xE1tico.",
          level: g >= 70 ? "ok" : g >= 40 ? "warn" : "danger"
        };
      },
      references: [
        "Lansky SB, et al. The measurement of performance in childhood cancer patients. Cancer. 1987;60(7):1651-6."
      ]
    },
    {
      id: "wat-1",
      name: "WAT-1 \u2014 Escala de abstinencia pedi\xE1trica",
      shortName: "WAT-1",
      description: "Cuantifica el s\xEDndrome de abstinencia de opioides y benzodiacepinas en pacientes pedi\xE1tricos cr\xEDticos.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        { id: "deposiciones", type: "boolean", label: "Deposiciones blandas o l\xEDquidas en las \xFAltimas 12 h" },
        { id: "vomitos", type: "boolean", label: "V\xF3mitos, arcadas o babeo en las \xFAltimas 12 h" },
        { id: "temperatura", type: "boolean", label: "Temperatura > 37,8 \xB0C en las \xFAltimas 12 h" },
        {
          id: "estado",
          type: "select",
          label: "Estado tras est\xEDmulo (nuevo)",
          options: [
            { label: "Calmado o tranquilo", value: 0 },
            { label: "Inquieto o distra\xEDdo", value: 1 },
            { label: "Muy agitado", value: 2 }
          ]
        },
        { id: "temblor", type: "boolean", label: "Temblor con o sin est\xEDmulo" },
        { id: "sudoracion", type: "boolean", label: "Sudoraci\xF3n" },
        { id: "movimientos", type: "boolean", label: "Movimientos no coordinados o repetitivos" },
        { id: "bostezos", type: "boolean", label: "Bostezos o estornudos \u2265 3 veces en 1 h" },
        { id: "sobresalto", type: "boolean", label: "Sobresalto exagerado al ruido" },
        { id: "tonoMus", type: "boolean", label: "Hiperton\xEDa muscular" },
        { id: "tiempoConsuelo", type: "boolean", label: "Tiempo hasta el consuelo > 5 minutos" }
      ],
      compute: (v) => {
        const score = sum(v, ["deposiciones", "vomitos", "temperatura", "estado", "temblor", "sudoracion", "movimientos", "bostezos", "sobresalto", "tonoMus", "tiempoConsuelo"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201312)",
          interpretation: score < 3 ? "Sin s\xEDntomas de abstinencia significativos: mantener plan de destete." : "WAT-1 \u2265 3: s\xEDndrome de abstinencia significativo. Ralentizar el destete o administrar dosis de rescate.",
          level: score < 3 ? "ok" : "warn"
        };
      },
      references: [
        "Franck LS, et al. The Withdrawal Assessment Tool-1 (WAT-1): an assessment instrument for monitoring opioid and benzodiazepine withdrawal symptoms in pediatric patients. Pediatr Crit Care Med. 2008;9(6):573-80."
      ]
    },
    {
      id: "sodio-hiperglucemia",
      name: "Correcci\xF3n de sodio por hiperglucemia",
      shortName: "Na corregido (glucosa)",
      description: "Estima el sodio s\xE9rico real en pacientes con hiperglucemia significativa.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        { id: "sodio", type: "number", label: "Sodio medido", unit: "mEq/L", min: 100, max: 180, step: 0.1 },
        { id: "glucemia", type: "number", label: "Glucemia", unit: "mg/dL", min: 100, max: 2e3, step: 1 }
      ],
      compute: (v) => {
        const na = v.sodio + 1.6 * ((v.glucemia - 100) / 100);
        const naHillier = v.sodio + 2.4 * ((v.glucemia - 100) / 100);
        return {
          main: fmt(na, 1),
          mainUnit: "mEq/L (Katz 1,6)",
          secondary: fmt(naHillier, 1),
          secondaryLabel: "mEq/L (Hillier 2,4)",
          interpretation: "La f\xF3rmula cl\xE1sica (Katz, 1,6 mEq/L por cada 100 mg/dL de glucosa por encima de 100) infraestima el sodio real; la f\xF3rmula de Hillier (2,4) es m\xE1s exacta con glucemias muy altas.",
          level: "info"
        };
      },
      references: [
        "Hillier TA, et al. Hyponatremia: evaluating the correction factor for hyperglycemia. Am J Med. 1999;106(4):399-403."
      ]
    },
    {
      id: "fecha-parto",
      name: "Fecha probable de parto y edad gestacional",
      shortName: "Fecha del parto",
      description: "Calcula la fecha probable de parto (regla de Naegele) y la edad gestacional actual a partir de la fecha de la \xFAltima menstruaci\xF3n.",
      category: CAT_GO,
      specialty: OBS,
      inputs: [
        {
          id: "metodo",
          type: "select",
          label: "Base de c\xE1lculo",
          noPoints: true,
          options: [
            { label: "\xDAltima menstruaci\xF3n (FUR)", value: 0 },
            { label: "Fecha de concepci\xF3n", value: 1 }
          ]
        },
        { id: "dia", type: "number", label: "D\xEDa (1\u201331)", min: 1, max: 31, step: 1 },
        { id: "mes", type: "number", label: "Mes (1\u201312)", min: 1, max: 12, step: 1 },
        { id: "anio", type: "number", label: "A\xF1o", min: 2020, max: 2030, step: 1 },
        { id: "hoyDia", type: "number", label: "Hoy \u2014 d\xEDa", min: 1, max: 31, step: 1 },
        { id: "hoyMes", type: "number", label: "Hoy \u2014 mes", min: 1, max: 12, step: 1 },
        { id: "hoyAnio", type: "number", label: "Hoy \u2014 a\xF1o", min: 2020, max: 2030, step: 1 }
      ],
      compute: (v) => {
        const base = new Date(v.anio, v.mes - 1, v.dia);
        if (isNaN(base.getTime()))
          return { main: "\u2014", interpretation: "Fecha no v\xE1lida.", level: "warn" };
        const inicio = v.metodo === 1 ? new Date(base.getTime() - 14 * 864e5) : base;
        const parto = new Date(inicio.getTime() + 280 * 864e5);
        const hoy = new Date(v.hoyAnio, v.hoyMes - 1, v.hoyDia);
        if (isNaN(hoy.getTime()))
          return { main: "\u2014", interpretation: "La fecha de hoy no es v\xE1lida.", level: "warn" };
        const dias = Math.floor((hoy.getTime() - inicio.getTime()) / 864e5);
        const semanas = Math.floor(dias / 7);
        const restoDias = dias % 7;
        const fmtDate = (d) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        return {
          main: fmtDate(parto),
          mainUnit: "fecha probable de parto",
          secondary: `${semanas} sem + ${restoDias} d`,
          secondaryLabel: "edad gestacional actual",
          interpretation: dias < 0 ? "La fecha base es posterior a hoy; revisa las fechas." : semanas < 22 ? "Primer o segundo trimestre." : semanas < 37 ? "Pret\xE9rmino: si nace ahora, requiere atenci\xF3n neonatal especializada." : semanas < 42 ? "A t\xE9rmino." : "Post\xE9rmino: valorar inducci\xF3n seg\xFAn protocolo.",
          level: semanas < 37 ? "warn" : semanas < 42 ? "ok" : "warn",
          details: [
            `Fecha de inicio calculada: ${fmtDate(inicio)}.`,
            "Regla de Naegele: FUR + 280 d\xEDas (o + 40 semanas)."
          ]
        };
      }
    },
    {
      id: "mapi",
      name: "\xCDndice predictivo del asma modificado (mAPI)",
      shortName: "mAPI",
      description: "Predice el riesgo de asma persistente en preescolares con episodios recurrentes de sibilancias.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        { id: "episodios", type: "boolean", label: "\u2265 4 episodios de sibilancias en el \xFAltimo a\xF1o (al menos uno confirmado por un m\xE9dico)", noPoints: true },
        { id: "padres", type: "boolean", label: "Criterio mayor: asma diagnosticada en padres", noPoints: true },
        { id: "atopia", type: "boolean", label: "Criterio mayor: dermatitis at\xF3pica personal", noPoints: true },
        { id: "sensibAero", type: "boolean", label: "Criterio mayor: sensibilizaci\xF3n a \u2265 1 aeroal\xE9rgeno", noPoints: true },
        { id: "sensibAlim", type: "boolean", label: "Criterio menor: sensibilizaci\xF3n a leche, huevo o frutos secos", noPoints: true },
        { id: "sibsSinCatarro", type: "boolean", label: "Criterio menor: sibilancias no relacionadas con resfriados", noPoints: true },
        { id: "eosinofilia", type: "boolean", label: "Criterio menor: eosinofilia \u2265 4 %", noPoints: true }
      ],
      compute: (v) => {
        if (v.episodios !== 1)
          return {
            main: "No aplicable",
            interpretation: "La regla se aplica a preescolares con \u2265 4 episodios de sibilancias en el \xFAltimo a\xF1o.",
            level: "info"
          };
        const mayores = sum(v, ["padres", "atopia", "sensibAero"]);
        const menores = sum(v, ["sensibAlim", "sibsSinCatarro", "eosinofilia"]);
        const positivo = mayores >= 1 || menores >= 2;
        return {
          main: positivo ? "mAPI positivo" : "mAPI negativo",
          secondary: `${mayores} mayor + ${menores} menor`,
          interpretation: positivo ? "mAPI positivo: alto valor predictivo positivo para el diagn\xF3stico de asma en edad escolar. Reforzar seguimiento y tratamiento preventivo." : "mAPI negativo: valor predictivo negativo muy alto; probable evoluci\xF3n favorable con la edad.",
          level: positivo ? "warn" : "ok"
        };
      },
      references: [
        "Guilbert TW, et al. Atopic characteristics of children with recurrent wheezing at high risk for the development of childhood asthma. J Allergy Clin Immunol. 2004;114(6):1282-7."
      ]
    },
    {
      id: "regla-7-lyme",
      name: "Regla de los 7 para la meningitis de Lyme",
      shortName: "Regla de 7 (Lyme)",
      description: "Diferencia la meningitis de Lyme de la meningitis as\xE9ptica viral en ni\xF1os de \xE1reas end\xE9micas.",
      category: CAT22,
      specialty: PED2,
      inputs: [
        { id: "sintomas", type: "boolean", label: "\u2265 7 d\xEDas de s\xEDntomas", noPoints: true },
        { id: "parCraneal", type: "boolean", label: "Par\xE1lisis de un par craneal (especialmente el VII)", noPoints: true },
        { id: "mononuclear", type: "boolean", label: "\u2265 70 % de mononucleares en el LCR", noPoints: true }
      ],
      compute: (v) => {
        const criterios = ["sintomas", "parCraneal", "mononuclear"].filter((k) => v[k] === 1).length;
        return {
          main: criterios === 0 ? "Riesgo bajo" : "No de bajo riesgo",
          secondary: `${criterios}/3 criterios positivos`,
          interpretation: criterios === 0 ? "Ning\xFAn criterio positivo: riesgo muy bajo de meningitis de Lyme (probabilidad < 10 %). Puede tratarse como meningitis viral inicialmente y esperar a la serolog\xEDa." : "Uno o m\xE1s criterios positivos: se recomienda iniciar antibioterapia emp\xEDrica cubriendo Borrelia (ceftriaxona) mientras se completa la serolog\xEDa.",
          level: criterios === 0 ? "ok" : "warn"
        };
      },
      notes: ["Aplicable en ni\xF1os de \xE1reas end\xE9micas con meningitis linfocitaria confirmada."],
      references: [
        "Cohn KA, et al. Validation of a clinical prediction rule to distinguish Lyme meningitis from aseptic meningitis. Pediatrics. 2012;129(1):e46-53."
      ]
    },
    {
      id: "flamm-vbac",
      name: "Puntuaci\xF3n de Flamm \u2014 parto vaginal tras ces\xE1rea (VBAC)",
      shortName: "Flamm VBAC",
      description: "Estima la probabilidad de \xE9xito de un parto vaginal en una gestante con ces\xE1rea previa.",
      category: CAT_GO,
      specialty: OBS,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad materna",
          options: [
            { label: "< 40 a\xF1os", value: 2 },
            { label: "\u2265 40 a\xF1os", value: 0 }
          ]
        },
        { id: "partoPrevio", type: "boolean", label: "Parto vaginal previo", points: 4 },
        { id: "partoDespuesCesarea", type: "boolean", label: "Parto vaginal despu\xE9s de la ces\xE1rea previa", points: 1 },
        { id: "indicacion", type: "boolean", label: "La ces\xE1rea previa NO fue por falta de progresi\xF3n" },
        {
          id: "borramiento",
          type: "select",
          label: "Borramiento cervical al ingreso",
          dropdown: true,
          options: [
            { label: "\u2265 75 %", value: 2 },
            { label: "25\u201374 %", value: 1 },
            { label: "< 25 %", value: 0 }
          ]
        },
        {
          id: "dilatacion",
          type: "select",
          label: "Dilataci\xF3n cervical al ingreso",
          options: [
            { label: "\u2265 4 cm", value: 1 },
            { label: "< 4 cm", value: 0 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "partoPrevio", "partoDespuesCesarea", "indicacion", "borramiento", "dilatacion"]);
        const exito = ["49 %", "60 %", "67 %", "75 %", "82 %", "85 %", "89 %", "93 %", "95 %", "95 %", "95 %"][Math.min(score, 10)];
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          secondary: exito,
          secondaryLabel: "probabilidad de VBAC exitoso",
          interpretation: score >= 8 ? "Alta probabilidad de \xE9xito: candidata a intento de parto vaginal." : score >= 4 ? "Probabilidad moderada: informar riesgos-beneficios y decidir con la paciente." : "Probabilidad baja: valorar ces\xE1rea electiva salvo preferencia informada de la paciente.",
          level: score >= 8 ? "ok" : score >= 4 ? "warn" : "danger"
        };
      },
      notes: ["Contraindicaciones absolutas de VBAC: ces\xE1rea previa cl\xE1sica, cirug\xEDa uterina previa con entrada en cavidad, dos o m\xE1s ces\xE1reas previas en la mayor\xEDa de gu\xEDas, ruptura uterina previa."],
      references: [
        "Flamm BL, Geiger AM. Vaginal birth after cesarean delivery: an admission scoring system. Obstet Gynecol. 1997;90(6):907-10."
      ]
    }
  ];

  // src/calculators/primary-care.ts
  var S = (arr) => arr.reduce((a, b) => a + Number(b || 0), 0);
  var CAT_SALUD_MENTAL = "Geriatr\xEDa, fragilidad y salud mental";
  var CAT_URG = "Urgencias y decisi\xF3n cl\xEDnica";
  var CAT_MED = "Medicina interna y familiar";
  var CAT_INFEC = "Infecciones";
  var CAT_DOLOR = "Dolor";
  var CAT_TOX = "Endocrino y t\xF3xicos";
  var CAT_FORM = "F\xF3rmulas y c\xE1lculos cl\xEDnicos";
  var CAT_HEMAT = "Hematolog\xEDa y oncolog\xEDa";
  var CAT_TEV = "Tromboembolismo venoso";
  var CAT_GO2 = "Obstetricia y ginecolog\xEDa";
  var CAT_NEO = "Neonatolog\xEDa y pediatr\xEDa";
  var MED = ["Medicina Familiar"];
  var URG = ["Emergencias"];
  var PED3 = ["Pediatr\xEDa"];
  var OPC03 = [
    { label: "0 \u2014 Nunca", value: 0 },
    { label: "1 \u2014 Varios d\xEDas", value: 1 },
    { label: "2 \u2014 M\xE1s de la mitad de los d\xEDas", value: 2 },
    { label: "3 \u2014 Casi todos los d\xEDas", value: 3 }
  ];
  var primaryCare = [
    // -------- PHQ-9 --------
    {
      id: "phq-9",
      name: "PHQ-9 \u2014 cribado de depresi\xF3n",
      shortName: "PHQ-9",
      description: "Frecuencia de nueve s\xEDntomas depresivos en las \xFAltimas 2 semanas (DSM-5). Cribado y seguimiento.",
      category: CAT_SALUD_MENTAL,
      specialty: MED,
      inputs: [
        { id: "anhedonia", type: "select", label: "1. Poco inter\xE9s o placer en hacer cosas", options: OPC03 },
        { id: "depresion", type: "select", label: "2. Sensaci\xF3n de estar deca\xEDdo/a, deprimido/a o sin esperanza", options: OPC03 },
        { id: "sueno", type: "select", label: "3. Problemas para dormir o dormir en exceso", options: OPC03 },
        { id: "cansancio", type: "select", label: "4. Cansancio o poca energ\xEDa", options: OPC03 },
        { id: "apetito", type: "select", label: "5. Poco apetito o comer en exceso", options: OPC03 },
        { id: "fracaso", type: "select", label: "6. Sentirse mal consigo mismo/a, fracasado/a o culpable", options: OPC03 },
        { id: "concentracion", type: "select", label: "7. Dificultad para concentrarse (leer, ver TV)", options: OPC03 },
        { id: "psicomotor", type: "select", label: "8. Lentitud o inquietud psicomotora percibidas por los dem\xE1s", options: OPC03 },
        { id: "ideacion", type: "select", label: "9. Ideas de muerte, autolesi\xF3n o \xABestar\xEDa mejor muerto/a\xBB", options: OPC03 }
      ],
      compute: (v) => {
        const total = S([v.anhedonia, v.depresion, v.sueno, v.cansancio, v.apetito, v.fracaso, v.concentracion, v.psicomotor, v.ideacion]);
        let level = "ok";
        let sub = "Sin depresi\xF3n (0\u20134).";
        if (total >= 20) {
          level = "danger";
          sub = "Depresi\xF3n grave (\u2265 20): iniciar tratamiento activo y valoraci\xF3n especializada.";
        } else if (total >= 15) {
          level = "warn";
          sub = "Depresi\xF3n moderadamente grave (15\u201319): tratamiento activo.";
        } else if (total >= 10) {
          level = "warn";
          sub = "Depresi\xF3n moderada (10\u201314): considerar tratamiento activo.";
        } else if (total >= 5) {
          level = "info";
          sub = "Depresi\xF3n leve (5\u20139): vigilancia y apoyo.";
        }
        const ideacion = Number(v.ideacion) > 0;
        return {
          main: fmt(total),
          mainUnit: "puntos (0\u201327)",
          interpretation: (ideacion ? "\u26A0 \xCDtem 9 positivo: valorar riesgo de suicidio con entrevista dirigida. " : "") + sub,
          level: ideacion ? "danger" : level
        };
      },
      notes: ["Kroenke K, Spitzer RL, Williams JB. J Gen Intern Med 2001. Punto de corte \u2265 10 sensibilidad ~88 %, especificidad ~88 %. \xCDtem 9 obliga a valorar riesgo suicida."]
    },
    // -------- GAD-7 --------
    {
      id: "gad-7",
      name: "GAD-7 \u2014 cribado de ansiedad generalizada",
      shortName: "GAD-7",
      description: "Frecuencia de 7 s\xEDntomas de ansiedad en las \xFAltimas 2 semanas.",
      category: CAT_SALUD_MENTAL,
      specialty: MED,
      inputs: [
        { id: "nervios", type: "select", label: "1. Sentirse nervioso/a, ansioso/a o con los nervios de punta", options: OPC03 },
        { id: "preocuparse", type: "select", label: "2. No poder dejar de preocuparse o controlar la preocupaci\xF3n", options: OPC03 },
        { id: "diversas", type: "select", label: "3. Preocuparse demasiado por diferentes cosas", options: OPC03 },
        { id: "relajarse", type: "select", label: "4. Dificultad para relajarse", options: OPC03 },
        { id: "inquieto", type: "select", label: "5. Estar tan inquieto/a que resulta dif\xEDcil quedarse sentado/a", options: OPC03 },
        { id: "irritable", type: "select", label: "6. Enfadarse o irritarse f\xE1cilmente", options: OPC03 },
        { id: "miedo", type: "select", label: "7. Sentir miedo como si algo horrible fuese a suceder", options: OPC03 }
      ],
      compute: (v) => {
        const total = S([v.nervios, v.preocuparse, v.diversas, v.relajarse, v.inquieto, v.irritable, v.miedo]);
        let level = "ok";
        let sub = "Ansiedad m\xEDnima (0\u20134).";
        if (total >= 15) {
          level = "danger";
          sub = "Ansiedad grave (\u2265 15): considerar tratamiento activo y derivaci\xF3n.";
        } else if (total >= 10) {
          level = "warn";
          sub = "Ansiedad moderada (10\u201314): valorar tratamiento.";
        } else if (total >= 5) {
          level = "info";
          sub = "Ansiedad leve (5\u20139): vigilar evoluci\xF3n.";
        }
        return { main: fmt(total), mainUnit: "puntos (0\u201321)", interpretation: sub, level };
      },
      notes: ["Spitzer RL. Arch Intern Med 2006. Punto de corte \u2265 10 para TAG: sensibilidad 89 %, especificidad 82 %."]
    },
    // -------- AUDIT-C --------
    {
      id: "audit-c",
      name: "AUDIT-C \u2014 cribado de consumo de riesgo de alcohol",
      shortName: "AUDIT-C",
      description: "Tres primeras preguntas del AUDIT: frecuencia y cantidad de consumo.",
      category: CAT_SALUD_MENTAL,
      specialty: MED,
      inputs: [
        {
          id: "frecuencia",
          type: "select",
          label: "\xBFCon qu\xE9 frecuencia consume alguna bebida alcoh\xF3lica?",
          options: [
            { label: "0 \u2014 Nunca", value: 0 },
            { label: "1 \u2014 Una vez al mes o menos", value: 1 },
            { label: "2 \u2014 2\u20134 veces al mes", value: 2 },
            { label: "3 \u2014 2\u20133 veces por semana", value: 3 },
            { label: "4 \u2014 4 o m\xE1s veces por semana", value: 4 }
          ]
        },
        {
          id: "unidades",
          type: "select",
          label: "\xBFCu\xE1ntas consumiciones de bebida alcoh\xF3lica toma un d\xEDa normal?",
          options: [
            { label: "0 \u2014 1 o 2", value: 0 },
            { label: "1 \u2014 3 o 4", value: 1 },
            { label: "2 \u2014 5 o 6", value: 2 },
            { label: "3 \u2014 7 a 9", value: 3 },
            { label: "4 \u2014 10 o m\xE1s", value: 4 }
          ]
        },
        {
          id: "atracon",
          type: "select",
          label: "\xBFCon qu\xE9 frecuencia toma 6 o m\xE1s bebidas en una sola ocasi\xF3n?",
          options: [
            { label: "0 \u2014 Nunca", value: 0 },
            { label: "1 \u2014 Menos de una vez al mes", value: 1 },
            { label: "2 \u2014 Mensualmente", value: 2 },
            { label: "3 \u2014 Semanalmente", value: 3 },
            { label: "4 \u2014 A diario o casi a diario", value: 4 }
          ]
        },
        { id: "sexo", type: "select", label: "Sexo", noPoints: true, options: [
          { label: "Hombre", value: 0 },
          { label: "Mujer", value: 1 }
        ] }
      ],
      compute: (v) => {
        const total = S([v.frecuencia, v.unidades, v.atracon]);
        const umbral = v.sexo === 1 ? 3 : 4;
        const positivo = total >= umbral;
        return {
          main: fmt(total),
          mainUnit: `puntos (umbral \u2265 ${umbral})`,
          interpretation: positivo ? `Cribado positivo (\u2265 ${umbral}): consumo de riesgo. Completar el AUDIT-10 y ofrecer intervenci\xF3n breve.` : "Cribado negativo.",
          level: positivo ? "warn" : "ok"
        };
      },
      notes: ["Bush K. Arch Intern Med 1998. Puntos de corte 4 en hombres y 3 en mujeres. Cualquier respuesta \u2265 4 en la pregunta 3 sugiere consumo perjudicial."]
    },
    // -------- DAST-10 --------
    {
      id: "dast-10",
      name: "DAST-10 \u2014 consumo problem\xE1tico de drogas",
      shortName: "DAST-10",
      description: "Diez preguntas S\xED/No sobre uso de drogas (no incluye alcohol) en los \xFAltimos 12 meses.",
      category: CAT_SALUD_MENTAL,
      specialty: MED,
      inputs: [
        { id: "noMedica", type: "boolean", label: "1. \xBFHa consumido drogas distintas a las que precisa por razones m\xE9dicas?" },
        { id: "masDeUna", type: "boolean", label: "2. \xBFAbusa de m\xE1s de una droga a la vez?" },
        { id: "parar", type: "boolean", label: "3. \xBFEs incapaz de parar el consumo cuando quiere?" },
        { id: "lagunas", type: "boolean", label: "4. \xBFHa tenido p\xE9rdidas de memoria (blackouts) o flashbacks por el consumo?" },
        { id: "culpa", type: "boolean", label: "5. \xBFSe siente mal o culpable por consumir?" },
        { id: "familia", type: "boolean", label: "6. \xBFSu familia se queja por su consumo?" },
        { id: "problemas", type: "boolean", label: "7. \xBFHa descuidado a su familia por el consumo?" },
        { id: "ilegal", type: "boolean", label: "8. \xBFHa realizado actividades ilegales para conseguir drogas?" },
        { id: "abstinencia", type: "boolean", label: "9. \xBFHa tenido s\xEDntomas de abstinencia al parar?" },
        { id: "medico", type: "boolean", label: "10. \xBFHa tenido problemas m\xE9dicos por el consumo (memoria, hepatitis, hemorragias, convulsiones)?" }
      ],
      compute: (v) => {
        const total = S([v.noMedica, v.masDeUna, v.parar, v.lagunas, v.culpa, v.familia, v.problemas, v.ilegal, v.abstinencia, v.medico]);
        let level = "ok";
        let sub = "Sin problemas relacionados con drogas (0).";
        if (total >= 9) {
          level = "danger";
          sub = "Nivel grave (9\u201310): tratamiento intensivo.";
        } else if (total >= 6) {
          level = "warn";
          sub = "Nivel sustancial (6\u20138): evaluaci\xF3n e intervenci\xF3n.";
        } else if (total >= 3) {
          level = "warn";
          sub = "Nivel moderado (3\u20135): evaluaci\xF3n adicional y consejo.";
        } else if (total >= 1) {
          level = "info";
          sub = "Nivel bajo (1\u20132): consejo motivacional breve.";
        }
        return { main: fmt(total), mainUnit: "puntos (0\u201310)", interpretation: sub, level };
      },
      notes: ["Skinner HA. Addict Behav 1982. Punto de corte \u2265 3 para intervenci\xF3n breve, \u2265 6 evaluaci\xF3n intensiva."]
    },
    // -------- 4AT delirio --------
    {
      id: "4at",
      name: "4AT \u2014 cribado r\xE1pido de delirio",
      shortName: "4AT",
      description: "Herramienta de 4 \xEDtems en <2 min para cribar delirio y deterioro cognitivo.",
      category: CAT_SALUD_MENTAL,
      specialty: MED,
      inputs: [
        { id: "alerta", type: "select", label: "Alerta (observar 10 s)", options: [
          { label: "0 \u2014 Normal", value: 0 },
          { label: "0 \u2014 Levemente somnoliento < 10 s pero luego normal", value: 0 },
          { label: "4 \u2014 Claramente anormal (agitaci\xF3n, hipoactividad marcada)", value: 4 }
        ] },
        { id: "amt4", type: "select", label: "AMT-4 (edad, fecha de nacimiento, lugar, a\xF1o)", options: [
          { label: "0 \u2014 Sin errores", value: 0 },
          { label: "1 \u2014 1 error", value: 1 },
          { label: "2 \u2014 2 o m\xE1s errores / no evaluable", value: 2 }
        ] },
        { id: "atencion", type: "select", label: "Atenci\xF3n: meses del a\xF1o hacia atr\xE1s desde diciembre", options: [
          { label: "0 \u2014 Consigue \u2265 7 correctos", value: 0 },
          { label: "1 \u2014 Empieza pero < 7 o se niega", value: 1 },
          { label: "2 \u2014 No evaluable (somnolencia, mala salud)", value: 2 }
        ] },
        { id: "curso", type: "select", label: "Curso agudo o fluctuante (en las \xFAltimas 2 semanas y todav\xEDa presente en 24 h)", options: [
          { label: "0 \u2014 No", value: 0 },
          { label: "4 \u2014 S\xED", value: 4 }
        ] }
      ],
      compute: (v) => {
        const total = S([v.alerta, v.amt4, v.atencion, v.curso]);
        let level = "ok";
        let sub = "Delirio o deterioro cognitivo grave improbables (0).";
        if (total >= 4) {
          level = "danger";
          sub = "Posible delirio \xB1 deterioro cognitivo (\u2265 4): valorar causa, entorno y medicaci\xF3n.";
        } else if (total >= 1) {
          level = "warn";
          sub = "Posible deterioro cognitivo (1\u20133): valorar en profundidad.";
        }
        return { main: fmt(total), mainUnit: "puntos (0\u201312)", interpretation: sub, level };
      },
      notes: ["MacLullich A. Age Ageing 2014. Validado en urgencias, hospitalizaci\xF3n y geriatr\xEDa. Sensibilidad ~90 %, especificidad ~85 % para delirio."]
    },
    // -------- AMT-4 --------
    {
      id: "amt-4",
      name: "AMT-4 \u2014 Abbreviated Mental Test",
      shortName: "AMT-4",
      description: "Cribado ultrabreve de orientaci\xF3n con 4 preguntas.",
      category: CAT_SALUD_MENTAL,
      specialty: MED,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad correcta" },
        { id: "nacimiento", type: "boolean", label: "Fecha de nacimiento correcta" },
        { id: "lugar", type: "boolean", label: "Lugar donde est\xE1 correcto" },
        { id: "anio", type: "boolean", label: "A\xF1o actual correcto" }
      ],
      compute: (v) => {
        const total = S([v.edad, v.nacimiento, v.lugar, v.anio]);
        let level = "ok";
        let sub = "Orientaci\xF3n conservada (4/4).";
        if (total <= 2) {
          level = "warn";
          sub = "Probable deterioro cognitivo (\u2264 2/4): completar valoraci\xF3n.";
        } else if (total === 3) {
          level = "info";
          sub = "Rendimiento reducido (3/4): repetir en evoluci\xF3n.";
        }
        return { main: `${total}/4`, interpretation: sub, level };
      },
      notes: ["Swain DG, Nightingale PG. Age Ageing 1997. Rendimiento comparable al AMT-10 para orientaci\xF3n b\xE1sica."]
    },
    // -------- PAINAD --------
    {
      id: "painad",
      name: "PAINAD \u2014 dolor en demencia avanzada",
      shortName: "PAINAD",
      description: "Evaluaci\xF3n del dolor por observaci\xF3n (5 dimensiones) en pacientes con demencia moderada-grave.",
      category: CAT_DOLOR,
      specialty: MED,
      inputs: [
        { id: "respiracion", type: "select", label: "Respiraci\xF3n independiente de la vocalizaci\xF3n", options: [
          { label: "0 \u2014 Normal", value: 0 },
          { label: "1 \u2014 Respiraci\xF3n con dificultad ocasional o corta hiperventilaci\xF3n", value: 1 },
          { label: "2 \u2014 Respiraci\xF3n ruidosa, hiperventilaci\xF3n prolongada, Cheyne-Stokes", value: 2 }
        ] },
        { id: "vocalizacion", type: "select", label: "Vocalizaci\xF3n negativa", options: [
          { label: "0 \u2014 Ausente", value: 0 },
          { label: "1 \u2014 Gemidos, quejas ocasionales; habla en tono bajo/negativo", value: 1 },
          { label: "2 \u2014 Llamadas repetidas, gemidos fuertes o llanto", value: 2 }
        ] },
        { id: "facial", type: "select", label: "Expresi\xF3n facial", options: [
          { label: "0 \u2014 Sonriente o inexpresiva", value: 0 },
          { label: "1 \u2014 Triste, atemorizada, ce\xF1o fruncido", value: 1 },
          { label: "2 \u2014 Muecas", value: 2 }
        ] },
        { id: "corporal", type: "select", label: "Lenguaje corporal", options: [
          { label: "0 \u2014 Relajado", value: 0 },
          { label: "1 \u2014 Tenso, deambulaci\xF3n afligida, inquietud", value: 1 },
          { label: "2 \u2014 Rigidez, pu\xF1os cerrados, rodillas flexionadas, apartar/golpear", value: 2 }
        ] },
        { id: "consuelo", type: "select", label: "Consolabilidad", options: [
          { label: "0 \u2014 Sin necesidad de consuelo", value: 0 },
          { label: "1 \u2014 Se distrae o tranquiliza con voz o toque", value: 1 },
          { label: "2 \u2014 Imposible consolar, distraer o tranquilizar", value: 2 }
        ] }
      ],
      compute: (v) => {
        const total = S([v.respiracion, v.vocalizacion, v.facial, v.corporal, v.consuelo]);
        let level = "ok";
        let sub = "Sin dolor observado (0).";
        if (total >= 7) {
          level = "danger";
          sub = "Dolor intenso (7\u201310): tratamiento y reevaluaci\xF3n tras 30\u201360 min.";
        } else if (total >= 4) {
          level = "warn";
          sub = "Dolor moderado (4\u20136): iniciar tratamiento analg\xE9sico.";
        } else if (total >= 1) {
          level = "info";
          sub = "Dolor leve (1\u20133): valorar causa y medidas no farmacol\xF3gicas.";
        }
        return { main: fmt(total), mainUnit: "puntos (0\u201310)", interpretation: sub, level };
      },
      notes: ["Warden V. J Am Med Dir Assoc 2003. Correlaci\xF3n con escalas verbales; recomendada en geriatr\xEDa y cuidados paliativos."]
    },
    // -------- MIDAS --------
    {
      id: "midas",
      name: "MIDAS \u2014 discapacidad por migra\xF1a",
      shortName: "MIDAS",
      description: "D\xEDas perdidos por cefalea en los \xFAltimos 3 meses en 5 \xE1reas.",
      category: CAT_MED,
      specialty: MED,
      inputs: [
        { id: "trabajo", type: "number", label: "1. D\xEDas de trabajo/estudio perdidos (\xFAltimos 3 meses)" },
        { id: "rendimiento", type: "number", label: "2. D\xEDas con rendimiento reducido \u2265 50 % en trabajo/estudio" },
        { id: "casa", type: "number", label: "3. D\xEDas de tareas del hogar perdidas" },
        { id: "casaReducido", type: "number", label: "4. D\xEDas con rendimiento reducido \u2265 50 % en tareas del hogar" },
        { id: "ocio", type: "number", label: "5. D\xEDas de actividades familiares/sociales/ocio perdidas" }
      ],
      compute: (v) => {
        const total = Number(v.trabajo || 0) + Number(v.rendimiento || 0) + Number(v.casa || 0) + Number(v.casaReducido || 0) + Number(v.ocio || 0);
        let level = "ok";
        let grado = "Grado I: discapacidad m\xEDnima (0\u20135).";
        if (total >= 21) {
          level = "danger";
          grado = "Grado IV: discapacidad grave (\u2265 21). Profilaxis y valoraci\xF3n especializada.";
        } else if (total >= 11) {
          level = "warn";
          grado = "Grado III: discapacidad moderada (11\u201320). Considerar profilaxis.";
        } else if (total >= 6) {
          level = "info";
          grado = "Grado II: discapacidad leve (6\u201310).";
        }
        return { main: fmt(total), mainUnit: "d\xEDas", interpretation: grado, level };
      },
      notes: ["Stewart WF. Cephalalgia 1999. Se acompa\xF1a siempre de dos preguntas adicionales (d\xEDas con cefalea y su intensidad) que no punt\xFAan."]
    },
    // -------- NDI --------
    {
      id: "ndi",
      name: "NDI \u2014 Neck Disability Index",
      shortName: "NDI",
      description: "Discapacidad por cervicalgia en 10 \xE1reas (0-5 cada una).",
      category: CAT_MED,
      specialty: MED,
      inputs: Array.from({ length: 10 }).map((_, i) => ({
        id: `q${i + 1}`,
        type: "select",
        label: [
          "1. Intensidad del dolor",
          "2. Cuidado personal (lavarse, vestirse)",
          "3. Levantar pesos",
          "4. Leer",
          "5. Cefalea",
          "6. Concentraci\xF3n",
          "7. Trabajo",
          "8. Conducir",
          "9. Sue\xF1o",
          "10. Ocio"
        ][i],
        options: [
          { label: "0 \u2014 Sin problemas", value: 0 },
          { label: "1", value: 1 },
          { label: "2", value: 2 },
          { label: "3", value: 3 },
          { label: "4", value: 4 },
          { label: "5 \u2014 Peor imaginable / imposible", value: 5 }
        ]
      })),
      compute: (v) => {
        const total = S([v.q1, v.q2, v.q3, v.q4, v.q5, v.q6, v.q7, v.q8, v.q9, v.q10]);
        const pct = total / 50 * 100;
        let level = "ok";
        let sub = "Sin discapacidad (0\u20134 puntos, < 10 %).";
        if (total >= 35) {
          level = "danger";
          sub = "Discapacidad completa (\u2265 70 %): reevaluar diagn\xF3stico.";
        } else if (total >= 25) {
          level = "danger";
          sub = "Discapacidad grave (50\u201368 %).";
        } else if (total >= 15) {
          level = "warn";
          sub = "Discapacidad moderada (30\u201348 %).";
        } else if (total >= 5) {
          level = "info";
          sub = "Discapacidad leve (10\u201328 %).";
        }
        return { main: `${fmt(total)} (${fmt(pct, 0)} %)`, mainUnit: "de 50", interpretation: sub, level };
      },
      notes: ["Vernon H. J Manipulative Physiol Ther 1991. Diferencia m\xEDnima cl\xEDnicamente relevante \u2248 5 puntos o 10 %."]
    },
    // -------- PUQE --------
    {
      id: "puqe",
      name: "PUQE \u2014 n\xE1useas y v\xF3mitos del embarazo",
      shortName: "PUQE",
      description: "Suma la duraci\xF3n de las n\xE1useas, el n\xFAmero de v\xF3mitos y de arcadas en las \xFAltimas 24 h.",
      category: CAT_GO2,
      specialty: MED,
      inputs: [
        { id: "nausea", type: "select", label: "Horas con n\xE1useas en 24 h", options: [
          { label: "1 \u2014 No", value: 1 },
          { label: "2 \u2014 \u2264 1 h", value: 2 },
          { label: "3 \u2014 2\u20133 h", value: 3 },
          { label: "4 \u2014 4\u20136 h", value: 4 },
          { label: "5 \u2014 > 6 h", value: 5 }
        ] },
        { id: "vomitos", type: "select", label: "Episodios de v\xF3mito en 24 h", options: [
          { label: "1 \u2014 Ninguno", value: 1 },
          { label: "2 \u2014 1\u20132", value: 2 },
          { label: "3 \u2014 3\u20134", value: 3 },
          { label: "4 \u2014 5\u20136", value: 4 },
          { label: "5 \u2014 \u2265 7", value: 5 }
        ] },
        { id: "arcadas", type: "select", label: "Arcadas (sin expulsi\xF3n) en 24 h", options: [
          { label: "1 \u2014 Ninguna", value: 1 },
          { label: "2 \u2014 1\u20132", value: 2 },
          { label: "3 \u2014 3\u20134", value: 3 },
          { label: "4 \u2014 5\u20136", value: 4 },
          { label: "5 \u2014 \u2265 7", value: 5 }
        ] }
      ],
      compute: (v) => {
        const total = S([v.nausea, v.vomitos, v.arcadas]);
        let level = "ok";
        let sub = "N\xE1useas y v\xF3mitos leves (\u2264 6): antiem\xE9ticos orales y medidas diet\xE9ticas.";
        if (total >= 13) {
          level = "danger";
          sub = "Grave (\u2265 13): considerar hospitalizaci\xF3n, l\xEDquidos IV y antiem\xE9ticos.";
        } else if (total >= 7) {
          level = "warn";
          sub = "Moderado (7\u201312): antiem\xE9ticos, valorar hidrataci\xF3n y controles.";
        }
        return { main: fmt(total), mainUnit: "puntos (3\u201315)", interpretation: sub, level };
      },
      notes: ["Koren G. Am J Obstet Gynecol 2002 (PUQE-24, modificado en 2005). Alta correlaci\xF3n con calidad de vida y con hospitalizaci\xF3n."]
    },
    // -------- Marburg heart score --------
    {
      id: "marburg",
      name: "Puntuaci\xF3n card\xEDaca de Marburgo \u2014 dolor tor\xE1cico en Primaria",
      shortName: "Marburgo",
      description: "Descarta enfermedad coronaria en pacientes con dolor tor\xE1cico en Atenci\xF3n Primaria.",
      category: CAT_URG,
      specialty: MED,
      inputs: [
        { id: "edadSexo", type: "boolean", label: "Edad y sexo (mujer \u2265 65 a\xF1os o var\xF3n \u2265 55 a\xF1os)" },
        { id: "ecvConocida", type: "boolean", label: "Enfermedad cardiovascular conocida (coronaria, arteriopat\xEDa, ictus)" },
        { id: "esfuerzo", type: "boolean", label: "El dolor empeora con el esfuerzo" },
        { id: "noPalpacion", type: "boolean", label: "El dolor NO se reproduce con la palpaci\xF3n" },
        { id: "pacienteCardiaco", type: "boolean", label: "El paciente cree que es un dolor de origen card\xEDaco" }
      ],
      compute: (v) => {
        const total = S([v.edadSexo, v.ecvConocida, v.esfuerzo, v.noPalpacion, v.pacienteCardiaco]);
        let level = "ok";
        let sub = "Bajo riesgo (0\u20132): enfermedad coronaria improbable.";
        if (total >= 4) {
          level = "danger";
          sub = "Riesgo alto (4\u20135): probabilidad ~ 63 %, derivar para valoraci\xF3n cardiol\xF3gica.";
        } else if (total >= 3) {
          level = "warn";
          sub = "Riesgo intermedio (3): probabilidad ~ 17 %, ampliar pruebas.";
        }
        return { main: fmt(total), mainUnit: "puntos (0\u20135)", interpretation: sub, level };
      },
      notes: ["B\xF6sner S. CMAJ 2010. Sensibilidad 87 %, especificidad 81 % con corte \u2265 3. Uso exclusivo en Atenci\xF3n Primaria, no en urgencias."]
    },
    // -------- INTERCHEST --------
    {
      id: "interchest",
      name: "INTERCHEST \u2014 dolor tor\xE1cico en Primaria",
      shortName: "INTERCHEST",
      description: "Alternativa a Marburg. Descarta coronariopat\xEDa en Atenci\xF3n Primaria.",
      category: CAT_URG,
      specialty: MED,
      inputs: [
        { id: "edadSexo", type: "boolean", label: "Mujer \u2265 65 a\xF1os o var\xF3n \u2265 55 a\xF1os" },
        { id: "ecvHistoria", type: "boolean", label: "Antecedentes de enfermedad coronaria" },
        { id: "esfuerzo", type: "boolean", label: "Dolor relacionado con esfuerzo" },
        { id: "pacienteCardiaco", type: "boolean", label: "El paciente asume que es card\xEDaco" },
        { id: "presion", type: "boolean", label: "Sensaci\xF3n de presi\xF3n" },
        { id: "palpacionNo", type: "boolean", label: "NO reproducible con la palpaci\xF3n" }
      ],
      compute: (v) => {
        const total = S([v.edadSexo, v.ecvHistoria, v.esfuerzo, v.pacienteCardiaco, v.presion, v.palpacionNo]);
        const alto = total >= 2;
        return {
          main: fmt(total),
          mainUnit: "puntos (0\u20136)",
          interpretation: alto ? "Riesgo aumentado (\u2265 2): valorar derivaci\xF3n / pruebas complementarias." : "Bajo riesgo (0\u20131): valor predictivo negativo ~ 98 %. Coronariopat\xEDa muy improbable.",
          level: alto ? "warn" : "ok"
        };
      },
      notes: ["Aerts M. Fam Pract 2017. Punto de corte \u2265 2 con sensibilidad ~ 90 %."]
    },
    // -------- Pittsburgh knee --------
    {
      id: "pittsburgh-rodilla",
      name: "Reglas de rodilla de Pittsburgh",
      shortName: "Pittsburgh rodilla",
      description: "Necesidad de radiograf\xEDa tras traumatismo de rodilla.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        { id: "mecanismo", type: "boolean", label: "Mecanismo: ca\xEDda o traumatismo con choque directo" },
        { id: "edad", type: "select", label: "Edad", options: [
          { label: "12\u201350 a\xF1os", value: 0 },
          { label: "< 12 a\xF1os", value: 1 },
          { label: "> 50 a\xF1os", value: 1 }
        ] },
        { id: "noCarga", type: "boolean", label: "Incapaz de caminar 4 pasos con carga en urgencias" }
      ],
      compute: (v) => {
        if (!v.mecanismo) {
          return { main: "Sin indicaci\xF3n de radiograf\xEDa", interpretation: "Falta el criterio de mecanismo traum\xE1tico (contusi\xF3n o ca\xEDda).", level: "ok" };
        }
        const indicada = v.edad === 1 || v.noCarga === 1;
        return {
          main: indicada ? "Radiograf\xEDa indicada" : "Radiograf\xEDa NO necesaria",
          interpretation: indicada ? "Cumple mecanismo + edad de riesgo o incapacidad para cargar peso: solicitar Rx." : "Puede evitarse la radiograf\xEDa si la exploraci\xF3n es normal.",
          level: indicada ? "warn" : "ok"
        };
      },
      notes: ["Seaberg DC. Ann Emerg Med 1998. Sensibilidad 99 % para fractura cl\xEDnicamente significativa."]
    },
    // -------- PECARN c-spine --------
    {
      id: "pecarn-cspine",
      name: "PECARN cervical \u2014 lesi\xF3n de columna cervical pedi\xE1trica",
      shortName: "PECARN cervical",
      description: "Identifica ni\xF1os < 18 a\xF1os con TCE-trauma cervical que requieren imagen.",
      category: CAT_NEO,
      specialty: PED3,
      inputs: [
        { id: "gcs", type: "boolean", label: "Alteraci\xF3n de conciencia (GCS < 15, alterado)" },
        { id: "focal", type: "boolean", label: "D\xE9ficit neurol\xF3gico focal" },
        { id: "dolorCuello", type: "boolean", label: "Dolor cervical o dolor a la palpaci\xF3n de l\xEDnea media" },
        { id: "torticolis", type: "boolean", label: "Torticolis" },
        { id: "traumaTronco", type: "boolean", label: "Traumatismo tor\xE1cico significativo" },
        { id: "condicionAlto", type: "boolean", label: "Condici\xF3n predisponente (Down, artritis reumatoide, EDS, otros)" },
        { id: "buceoAlto", type: "boolean", label: "Buceo o mecanismo de alto riesgo (accidente veh\xEDculo > 60 km/h, atropello, ca\xEDda > 3 m)" }
      ],
      compute: (v) => {
        const alto = S([v.gcs, v.focal, v.dolorCuello, v.torticolis, v.traumaTronco, v.condicionAlto, v.buceoAlto]);
        if (alto === 0) {
          return {
            main: "Imagen NO necesaria",
            interpretation: "Sin factores de riesgo: valor predictivo negativo alto. Retirar collar\xEDn tras exploraci\xF3n.",
            level: "ok"
          };
        }
        return {
          main: "Considerar imagen cervical",
          interpretation: `${alto} factor(es) presente(s): TC cervical o Rx AP/lateral/odontoides seg\xFAn protocolo local.`,
          level: "warn"
        };
      },
      notes: ["Leonard JC. Ann Emerg Med 2011. Estudio original: 8 factores con sensibilidad 98 %. La regla PECARN 2024 (Leonard JC. Lancet Child Adolesc Health) simplifica; usar la versi\xF3n cl\xE1sica hasta validaci\xF3n local."]
    },
    // -------- ATLAS C. difficile --------
    {
      id: "atlas-cdiff",
      name: "ATLAS \u2014 pron\xF3stico de C. difficile",
      shortName: "ATLAS",
      description: "Predice la respuesta al tratamiento en infecci\xF3n por Clostridioides difficile.",
      category: CAT_INFEC,
      specialty: MED,
      inputs: [
        { id: "edad", type: "select", label: "Edad", options: [
          { label: "0 \u2014 < 60 a\xF1os", value: 0 },
          { label: "1 \u2014 60\u201379 a\xF1os", value: 1 },
          { label: "2 \u2014 \u2265 80 a\xF1os", value: 2 }
        ] },
        { id: "tempC", type: "select", label: "Temperatura", options: [
          { label: "0 \u2014 \u2264 37,5 \xB0C", value: 0 },
          { label: "1 \u2014 37,6\u201338,5 \xB0C", value: 1 },
          { label: "2 \u2014 > 38,5 \xB0C", value: 2 }
        ] },
        { id: "leucos", type: "select", label: "Leucocitos (\xD710\u2079/L)", options: [
          { label: "0 \u2014 < 16", value: 0 },
          { label: "1 \u2014 16\u201325", value: 1 },
          { label: "2 \u2014 > 25", value: 2 }
        ] },
        { id: "albumina", type: "select", label: "Alb\xFAmina (g/dL)", options: [
          { label: "0 \u2014 > 3,5", value: 0 },
          { label: "1 \u2014 2,6\u20133,5", value: 1 },
          { label: "2 \u2014 < 2,6", value: 2 }
        ] },
        { id: "antibiotico", type: "boolean", label: "Antibi\xF3tico sist\xE9mico concomitante" }
      ],
      compute: (v) => {
        const total = S([v.edad, v.tempC, v.leucos, v.albumina, v.antibiotico ? 2 : 0]);
        let level = "ok";
        let sub = "Buen pron\xF3stico (0\u20133): curaci\xF3n esperada.";
        if (total >= 8) {
          level = "danger";
          sub = "Muy mal pron\xF3stico (\u2265 8): considerar tratamiento intensivo y valoraci\xF3n quir\xFArgica.";
        } else if (total >= 6) {
          level = "warn";
          sub = "Mal pron\xF3stico (6\u20137): vigilancia estrecha.";
        } else if (total >= 4) {
          level = "info";
          sub = "Riesgo intermedio (4\u20135).";
        }
        return { main: fmt(total), mainUnit: "puntos (0\u201310)", interpretation: sub, level };
      },
      notes: ["Miller MA. BMC Infect Dis 2013. Correlaciona con curaci\xF3n al d\xEDa 10 y reca\xEDda."]
    },
    // -------- Martin LDL --------
    {
      id: "martin-ldl",
      name: "LDL de Martin-Hopkins",
      shortName: "LDL Martin",
      description: "Alternativa a Friedewald: usa relaci\xF3n TG/VLDL ajustada por franja de triglic\xE9ridos.",
      category: CAT_FORM,
      specialty: MED,
      inputs: [
        { id: "colTotal", type: "number", label: "Colesterol total (mg/dL)" },
        { id: "hdl", type: "number", label: "HDL (mg/dL)" },
        { id: "trigliceridos", type: "number", label: "Triglic\xE9ridos (mg/dL)" }
      ],
      compute: (v) => {
        const ct = Number(v.colTotal);
        const hdl = Number(v.hdl);
        const tg = Number(v.trigliceridos);
        if (!ct || !hdl || !tg) return { main: "Completa los campos num\xE9ricos para ver el resultado.", interpretation: "" };
        if (tg >= 400) return { main: "\u2014", interpretation: "Con TG \u2265 400 mg/dL no se recomienda estimar el LDL: solicitar LDL directo.", level: "warn" };
        const noHDL = ct - hdl;
        const franjas = [
          // [minTG, maxTG, ratios por bandas de no-HDL: <100, 100-129, 130-159, 160-189, 190-219, ≥220]
          [0, 49, [3.5, 3.4, 3.3, 3.3, 3.2, 3.1]],
          [50, 69, [4, 3.9, 3.7, 3.6, 3.5, 3.4]],
          [70, 99, [4.3, 4.2, 4, 3.9, 3.8, 3.7]],
          [100, 129, [4.9, 4.6, 4.4, 4.2, 4.1, 4]],
          [130, 159, [5.4, 5, 4.8, 4.6, 4.5, 4.4]],
          [160, 199, [6.2, 5.5, 5.2, 5, 4.8, 4.7]],
          [200, 249, [7.2, 6.2, 5.7, 5.5, 5.3, 5.2]],
          [250, 299, [8.5, 6.8, 6.3, 6, 5.8, 5.6]],
          [300, 399, [10.6, 8, 7.2, 6.8, 6.5, 6.4]]
        ];
        const banda = noHDL < 100 ? 0 : noHDL < 130 ? 1 : noHDL < 160 ? 2 : noHDL < 190 ? 3 : noHDL < 220 ? 4 : 5;
        const franja = franjas.find(([lo, hi]) => tg >= lo && tg <= hi) || franjas[franjas.length - 1];
        const ratio = franja[2][banda];
        const ldl = ct - hdl - tg / ratio;
        return {
          main: fmt(ldl, 0),
          mainUnit: "mg/dL",
          interpretation: `no-HDL ${fmt(noHDL, 0)} \xB7 TG/VLDL ratio ${ratio}. M\xE1s preciso que Friedewald cuando TG 150\u2013400 mg/dL.`,
          level: "ok"
        };
      },
      notes: ["Martin SS. JAMA 2013 (180-cell table). Recomendado por AHA/ACC 2018 sobre Friedewald."]
    },
    // -------- Mentzer --------
    {
      id: "mentzer",
      name: "\xCDndice de Mentzer",
      shortName: "Mentzer",
      description: "Distingue \u03B2-talasemia menor de ferropenia en microcitosis.",
      category: CAT_HEMAT,
      specialty: MED,
      inputs: [
        { id: "vcm", type: "number", label: "VCM (fL)" },
        { id: "hematies", type: "number", label: "Hemat\xEDes (\xD710\xB9\xB2/L)" }
      ],
      compute: (v) => {
        const vcm = Number(v.vcm);
        const rbc = Number(v.hematies);
        if (!vcm || !rbc) return { main: "Completa los campos num\xE9ricos para ver el resultado.", interpretation: "" };
        const idx = vcm / rbc;
        const tal = idx < 13;
        return {
          main: fmt(idx, 1),
          mainUnit: "VCM/RBC",
          interpretation: tal ? "\xCDndice < 13: sugiere \u03B2-talasemia menor (hemat\xEDes conservados). Solicitar Hb A\u2082." : "\xCDndice > 13: sugiere ferropenia. Completar perfil f\xE9rrico.",
          level: "info"
        };
      },
      notes: ["Mentzer WC. Lancet 1973. Sensibilidad ~ 80 % \u2014 no sustituye a la HPLC en talasemia."]
    },
    // -------- RFM --------
    {
      id: "rfm",
      name: "RFM \u2014 Relative Fat Mass",
      shortName: "RFM",
      description: "Estima el % de grasa corporal a partir de la relaci\xF3n altura/per\xEDmetro de cintura.",
      category: CAT_MED,
      specialty: MED,
      inputs: [
        { id: "altura", type: "number", label: "Altura (cm)" },
        { id: "cintura", type: "number", label: "Per\xEDmetro abdominal (cm)" },
        { id: "sexo", type: "select", label: "Sexo", options: [
          { label: "Hombre", value: 0 },
          { label: "Mujer", value: 1 }
        ] }
      ],
      compute: (v) => {
        const h = Number(v.altura);
        const c = Number(v.cintura);
        if (!h || !c) return { main: "Completa los campos num\xE9ricos para ver el resultado.", interpretation: "" };
        const base = v.sexo === 1 ? 76 : 64;
        const rfm = base - 20 * (h / c);
        const obesidad = v.sexo === 1 ? rfm >= 35 : rfm >= 25;
        return {
          main: fmt(rfm, 1),
          mainUnit: "% grasa",
          interpretation: obesidad ? "Compatible con obesidad seg\xFAn % grasa (\u2265 25 % en hombres, \u2265 35 % en mujeres)." : "Dentro del rango no-obeso por % de grasa.",
          level: obesidad ? "warn" : "ok"
        };
      },
      notes: ["Woolcott OO. Sci Rep 2018. Menos sesgo que el IMC para estimar grasa corporal."]
    },
    // -------- IMPEDE-VTE --------
    {
      id: "impede-vte",
      name: "IMPEDE-VTE \u2014 TEV en mieloma m\xFAltiple",
      shortName: "IMPEDE-VTE",
      description: "Riesgo de tromboembolismo venoso en pacientes con mieloma m\xFAltiple.",
      category: CAT_TEV,
      specialty: MED,
      inputs: [
        { id: "imid", type: "select", label: "IMID (talidomida/lenalidomida/pomalidomida)", options: [
          { label: "0 \u2014 No", value: 0 },
          { label: "4 \u2014 S\xED", value: 4 }
        ] },
        { id: "imcAlto", type: "boolean", label: "IMC \u2265 25 kg/m\xB2 (+1)" },
        { id: "fracturaPelvis", type: "boolean", label: "Fractura p\xE9lvica, cadera o f\xE9mur (+4)" },
        { id: "epo", type: "boolean", label: "Uso de eritropoyetina (+1)" },
        { id: "doxo", type: "boolean", label: "Doxorrubicina (+3)" },
        { id: "dexoAlta", type: "select", label: "Dexametasona semanal", options: [
          { label: "0 \u2014 No", value: 0 },
          { label: "2 \u2014 Dosis est\xE1ndar", value: 2 },
          { label: "4 \u2014 Dosis alta (> 160 mg/mes)", value: 4 }
        ] },
        { id: "tevPrevio", type: "boolean", label: "Antecedente de TEV (+5)" },
        { id: "trombofilia", type: "boolean", label: "Trombofilia conocida (+3)" },
        { id: "cvc", type: "boolean", label: "Cat\xE9ter venoso central o v\xEDa tunelizada (+2)" },
        { id: "profilaxis", type: "select", label: "Profilaxis antitromb\xF3tica", options: [
          { label: "0 \u2014 Sin profilaxis", value: 0 },
          { label: "-3 \u2014 AAS profil\xE1ctico", value: -3 },
          { label: "-4 \u2014 HBPM o anticoagulaci\xF3n completa", value: -4 }
        ] }
      ],
      compute: (v) => {
        const total = S([
          v.imid,
          v.imcAlto,
          v.fracturaPelvis ? 4 : 0,
          v.epo,
          v.doxo ? 3 : 0,
          v.dexoAlta,
          v.tevPrevio ? 5 : 0,
          v.trombofilia ? 3 : 0,
          v.cvc ? 2 : 0,
          v.profilaxis
        ]);
        let level = "ok";
        let sub = "Riesgo bajo (\u2264 3): sin profilaxis espec\xEDfica.";
        if (total >= 8) {
          level = "danger";
          sub = "Alto riesgo (\u2265 8): profilaxis con HBPM o DOAC durante el ciclo.";
        } else if (total >= 4) {
          level = "warn";
          sub = "Riesgo intermedio (4\u20137): profilaxis con AAS o HBPM seg\xFAn gu\xEDas.";
        }
        return { main: fmt(total), mainUnit: "puntos", interpretation: sub, level };
      },
      notes: ["Sanfilippo KM. Am J Hematol 2019. IMWG y NCCN recomiendan profilaxis desde riesgo intermedio."]
    },
    // -------- ORT-OUD --------
    {
      id: "ort-oud",
      name: "ORT-OUD \u2014 riesgo de trastorno por opioides",
      shortName: "ORT-OUD",
      description: "Versi\xF3n actualizada del Opioid Risk Tool. Predice trastorno por uso de opioides antes de prescripciones prolongadas.",
      category: CAT_TOX,
      specialty: MED,
      inputs: [
        { id: "afAlcohol", type: "boolean", label: "Antecedente familiar de abuso de alcohol" },
        { id: "afIlegal", type: "boolean", label: "Antecedente familiar de abuso de drogas ilegales" },
        { id: "apAlcohol", type: "boolean", label: "Antecedente personal de abuso de alcohol" },
        { id: "apIlegal", type: "boolean", label: "Antecedente personal de abuso de drogas ilegales" },
        { id: "apReceta", type: "boolean", label: "Antecedente personal de abuso de f\xE1rmacos con receta" },
        { id: "edadJoven", type: "boolean", label: "Edad 16\u201345 a\xF1os" },
        { id: "psq", type: "boolean", label: "Trastorno psiqui\xE1trico (depresi\xF3n, TDAH, TOC, bipolar, esquizofrenia)" }
      ],
      compute: (v) => {
        const total = S([v.afAlcohol, v.afIlegal, v.apAlcohol, v.apIlegal, v.apReceta, v.edadJoven, v.psq]);
        let level = "ok";
        let sub = "Riesgo bajo (0\u20132).";
        if (total >= 4) {
          level = "danger";
          sub = "Riesgo alto (\u2265 4): considerar alternativas no opioides y consultar con especialista en dolor/adicciones.";
        } else if (total === 3) {
          level = "warn";
          sub = "Riesgo moderado (3): consentimiento, monitorizaci\xF3n con acuerdo terap\xE9utico y an\xE1lisis de orina.";
        }
        return { main: fmt(total), mainUnit: "puntos (0\u20137)", interpretation: sub, level };
      },
      notes: ["Cheatle MD. J Pain 2019 (ORT-OUD, versi\xF3n revisada sin sesgo de sexo). Instrumento de cribado, no diagn\xF3stico."]
    },
    // -------- MDQ bipolar --------
    {
      id: "mdq",
      name: "MDQ \u2014 cribado de trastorno bipolar",
      shortName: "MDQ",
      description: "Mood Disorder Questionnaire para episodios hipoman\xEDacos/maniacos previos.",
      category: CAT_SALUD_MENTAL,
      specialty: MED,
      inputs: [
        { id: "sintomas", type: "select", label: "\xBFCu\xE1ntos de los 13 s\xEDntomas t\xEDpicos ha presentado alguna vez?", options: Array.from({ length: 14 }, (_, i) => ({ label: `${i} s\xEDntomas`, value: i })) },
        { id: "simultaneo", type: "boolean", label: "\xBFVarios de esos s\xEDntomas ocurrieron al mismo tiempo?" },
        { id: "problemas", type: "select", label: "Grado de problemas que le causaron", options: [
          { label: "Sin problemas", value: 0 },
          { label: "Menores", value: 0 },
          { label: "Moderados", value: 1 },
          { label: "Graves", value: 1 }
        ] }
      ],
      compute: (v) => {
        const sint = Number(v.sintomas || 0);
        const positivo = sint >= 7 && v.simultaneo === 1 && v.problemas === 1;
        return {
          main: positivo ? "MDQ positivo" : "MDQ negativo",
          interpretation: positivo ? "\u2265 7 s\xEDntomas + simult\xE1neos + problemas moderados/graves: valoraci\xF3n por psiquiatr\xEDa para descartar bipolaridad." : "No cumple criterios para cribado positivo.",
          level: positivo ? "warn" : "ok"
        };
      },
      notes: ["Hirschfeld RM. Am J Psychiatry 2000. Sensibilidad ~ 73 %, especificidad 90 %. Complementar con entrevista cl\xEDnica."]
    },
    // -------- Paxlovid --------
    {
      id: "paxlovid",
      name: "Indicaci\xF3n de Paxlovid (nirmatrelvir/ritonavir)",
      shortName: "Paxlovid",
      description: "Elegibilidad de nirmatrelvir/ritonavir para COVID-19 en adultos no hospitalizados.",
      category: CAT_INFEC,
      specialty: MED,
      inputs: [
        { id: "sintomas", type: "boolean", label: "Inicio de s\xEDntomas hace \u2264 5 d\xEDas" },
        { id: "noHosp", type: "boolean", label: "No requiere hospitalizaci\xF3n por COVID-19" },
        { id: "riesgo", type: "boolean", label: "Al menos un factor de riesgo (edad \u2265 60, obesidad, diabetes, ERC, EPOC, cardiopat\xEDa, inmunodepresi\xF3n)" },
        { id: "tfg", type: "number", label: "TFG estimada (mL/min/1,73 m\xB2)" },
        { id: "child", type: "select", label: "Funci\xF3n hep\xE1tica", options: [
          { label: "Normal o Child-Pugh A", value: 0 },
          { label: "Child-Pugh B", value: 1 },
          { label: "Child-Pugh C", value: 2 }
        ] },
        { id: "interacciones", type: "boolean", label: "F\xE1rmacos contraindicados: rifampicina, carbamazepina, fenobarbital, hierba de San Juan, dronedarona, midazolam oral, alfuzosina, etc." }
      ],
      compute: (v) => {
        if (v.interacciones === 1) return { main: "CONTRAINDICADO", interpretation: "Interacciones graves con inhibici\xF3n de CYP3A. Elegir alternativa (remdesivir).", level: "danger" };
        if (v.child === 2) return { main: "CONTRAINDICADO", interpretation: "Child-Pugh C: no usar.", level: "danger" };
        const tfg = Number(v.tfg);
        if (tfg && tfg < 30) return { main: "No recomendado", interpretation: "TFG < 30 mL/min/1,73 m\xB2: no usar Paxlovid. Considerar remdesivir.", level: "danger" };
        if (!v.sintomas || !v.noHosp || !v.riesgo) return { main: "No indicado", interpretation: "No cumple los tres criterios: s\xEDntomas \u2264 5 d\xEDas, ambulatorio y factor de riesgo.", level: "info" };
        const ajuste = tfg && tfg < 60;
        return {
          main: "Indicado",
          interpretation: ajuste ? "Ajuste de dosis (TFG 30\u201360): nirmatrelvir 150 mg + ritonavir 100 mg/12 h \xD7 5 d\xEDas." : "Dosis est\xE1ndar: nirmatrelvir 300 mg + ritonavir 100 mg/12 h \xD7 5 d\xEDas. Revisar interacciones.",
          level: ajuste ? "warn" : "ok"
        };
      },
      notes: ["FDA/AEMPS ficha t\xE9cnica 2024. Iniciar en \u2264 5 d\xEDas desde el inicio de s\xEDntomas. Consultar Liverpool COVID-19 Drug Interactions."]
    },
    // -------- NAC Rumack-Matthew --------
    {
      id: "nac-paracetamol",
      name: "N-acetilciste\xEDna en intoxicaci\xF3n por paracetamol",
      shortName: "NAC paracetamol",
      description: "Necesidad y dosificaci\xF3n de N-acetilciste\xEDna (Prescott) seg\xFAn niveles y horas.",
      category: CAT_TOX,
      specialty: URG,
      inputs: [
        { id: "horas", type: "number", label: "Horas desde la ingesta" },
        { id: "paracetamol", type: "number", label: "Paracetamol s\xE9rico (\xB5g/mL)" },
        { id: "peso", type: "number", label: "Peso (kg)" },
        { id: "liberacionSostenida", type: "boolean", label: "Formulaci\xF3n de liberaci\xF3n sostenida o ingesta m\xFAltiple" }
      ],
      compute: (v) => {
        const h = Number(v.horas);
        const p = Number(v.paracetamol);
        const kg = Number(v.peso);
        if (!h || !p || !kg) return { main: "Completa los campos num\xE9ricos para ver el resultado.", interpretation: "" };
        if (h < 4) return { main: "Repetir nivel a las 4 h", interpretation: "La nomograma no es aplicable antes de las 4 h.", level: "info" };
        const umbral = 150 * Math.pow(0.5, (h - 4) / 4);
        const tratar = p >= umbral || v.liberacionSostenida === 1 || h > 24;
        const carga = Math.min(kg, 100) * 150;
        const dosis2 = Math.min(kg, 100) * 50;
        const dosis3 = Math.min(kg, 100) * 100;
        return {
          main: tratar ? "Iniciar NAC IV" : "NAC NO indicada",
          mainUnit: `umbral ${fmt(umbral, 0)} \xB5g/mL`,
          interpretation: tratar ? `R\xE9gimen Prescott 21 h (peso m\xE1x. 100 kg): ${fmt(carga, 0)} mg en 200 mL en 60 min \u2192 ${fmt(dosis2, 0)} mg en 500 mL en 4 h \u2192 ${fmt(dosis3, 0)} mg en 1 000 mL en 16 h.` : `Nivel ${p} \xB5g/mL < l\xEDnea de tratamiento (${fmt(umbral, 0)}). Reevaluar cl\xEDnica y transaminasas.`,
          level: tratar ? "danger" : "ok"
        };
      },
      notes: ["Prescott LF 1979; Rumack BH 1975. En Reino Unido se usa una l\xEDnea \xFAnica a 100 \xB5g/mL (SNAP 12 h). Iniciar sin esperar niveles si ingesta > 150 mg/kg o desconocida."],
      references: ["AEMPS: N-acetilciste\xEDna, ficha t\xE9cnica \xB7 https://cima.aemps.es"]
    }
  ];

  // src/calculators/family-practice.ts
  var CAT_SM = "Geriatr\xEDa, fragilidad y salud mental";
  var CAT_MED2 = "Medicina interna y familiar";
  var CAT_GO3 = "Obstetricia y ginecolog\xEDa";
  var CAT_TEV2 = "Tromboembolismo venoso";
  var CAT_ENDO2 = "Endocrino, obesidad y diabetes";
  var CAT_RIESGO = "Riesgo perioperatorio";
  var CAT_SCA = "S\xEDndrome coronario agudo y dolor tor\xE1cico";
  var CAT_SINCOPE2 = "S\xEDncope";
  var CAT_FORM2 = "F\xF3rmulas y c\xE1lculos cl\xEDnicos";
  var MED2 = ["Medicina Familiar"];
  var familyPractice = [
    // -------- EPDS --------
    {
      id: "epds",
      name: "EPDS \u2014 Escala de Depresi\xF3n Posnatal de Edimburgo",
      shortName: "EPDS",
      description: "Cribado de depresi\xF3n posparto y del embarazo (10 \xEDtems, \xFAltimos 7 d\xEDas).",
      category: CAT_GO3,
      specialty: MED2,
      inputs: [
        { id: "q1", type: "select", label: "1. He sido capaz de re\xEDrme y ver el lado divertido de las cosas", options: [
          { label: "0 \u2014 Tanto como siempre", value: 0 },
          { label: "1 \u2014 No tanto ahora", value: 1 },
          { label: "2 \u2014 Mucho menos ahora", value: 2 },
          { label: "3 \u2014 Nada en absoluto", value: 3 }
        ] },
        { id: "q2", type: "select", label: "2. He mirado el futuro con ilusi\xF3n", options: [
          { label: "0 \u2014 Tanto como siempre", value: 0 },
          { label: "1 \u2014 Menos que antes", value: 1 },
          { label: "2 \u2014 Mucho menos que antes", value: 2 },
          { label: "3 \u2014 Casi nada", value: 3 }
        ] },
        { id: "q3", type: "select", label: "3. Me he culpado innecesariamente cuando las cosas iban mal", options: [
          { label: "0 \u2014 Nunca", value: 0 },
          { label: "1 \u2014 Casi nunca", value: 1 },
          { label: "2 \u2014 S\xED, algunas veces", value: 2 },
          { label: "3 \u2014 S\xED, la mayor parte del tiempo", value: 3 }
        ] },
        { id: "q4", type: "select", label: "4. He estado ansiosa o preocupada sin motivo", options: [
          { label: "0 \u2014 Nunca", value: 0 },
          { label: "1 \u2014 Casi nunca", value: 1 },
          { label: "2 \u2014 S\xED, a veces", value: 2 },
          { label: "3 \u2014 S\xED, muy a menudo", value: 3 }
        ] },
        { id: "q5", type: "select", label: "5. He sentido miedo o p\xE1nico sin motivo", options: [
          { label: "0 \u2014 Nunca", value: 0 },
          { label: "1 \u2014 No, no mucho", value: 1 },
          { label: "2 \u2014 S\xED, a veces", value: 2 },
          { label: "3 \u2014 S\xED, con bastante frecuencia", value: 3 }
        ] },
        { id: "q6", type: "select", label: "6. Las cosas me han estado abrumando", options: [
          { label: "0 \u2014 Nunca; he manejado todo bien", value: 0 },
          { label: "1 \u2014 Casi nunca", value: 1 },
          { label: "2 \u2014 S\xED, a veces no he podido manejar tan bien como siempre", value: 2 },
          { label: "3 \u2014 S\xED, la mayor parte del tiempo no he podido manejar nada", value: 3 }
        ] },
        { id: "q7", type: "select", label: "7. He estado tan infeliz que he tenido dificultad para dormir", options: [
          { label: "0 \u2014 Nunca", value: 0 },
          { label: "1 \u2014 Casi nunca", value: 1 },
          { label: "2 \u2014 S\xED, a veces", value: 2 },
          { label: "3 \u2014 S\xED, la mayor parte del tiempo", value: 3 }
        ] },
        { id: "q8", type: "select", label: "8. Me he sentido triste o desgraciada", options: [
          { label: "0 \u2014 Nunca", value: 0 },
          { label: "1 \u2014 Casi nunca", value: 1 },
          { label: "2 \u2014 S\xED, a veces", value: 2 },
          { label: "3 \u2014 S\xED, la mayor parte del tiempo", value: 3 }
        ] },
        { id: "q9", type: "select", label: "9. He estado tan infeliz que he estado llorando", options: [
          { label: "0 \u2014 Nunca", value: 0 },
          { label: "1 \u2014 Solo ocasionalmente", value: 1 },
          { label: "2 \u2014 S\xED, con bastante frecuencia", value: 2 },
          { label: "3 \u2014 S\xED, la mayor parte del tiempo", value: 3 }
        ] },
        { id: "q10", type: "select", label: "10. Se me ha ocurrido la idea de hacerme da\xF1o", options: [
          { label: "0 \u2014 Nunca", value: 0 },
          { label: "1 \u2014 Casi nunca", value: 1 },
          { label: "2 \u2014 A veces", value: 2 },
          { label: "3 \u2014 S\xED, con bastante frecuencia", value: 3 }
        ] }
      ],
      compute: (v) => {
        const total = sum(v, ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"]);
        const ideacion = (v.q10 ?? 0) > 0;
        let level = "ok";
        let sub = "Cribado negativo (< 10).";
        if (total >= 13) {
          level = "danger";
          sub = "Probable depresi\xF3n posparto (\u2265 13): valoraci\xF3n especializada.";
        } else if (total >= 10) {
          level = "warn";
          sub = "Posible depresi\xF3n posparto (10\u201312): repetir en 2 semanas y valorar.";
        }
        return {
          main: fmt(total),
          mainUnit: "puntos (0\u201330)",
          interpretation: (ideacion ? "\u26A0 \xCDtem 10 positivo: valorar riesgo suicida siempre. " : "") + sub,
          level: ideacion ? "danger" : level
        };
      },
      notes: ["Cox JL, Holden JM, Sagovsky R. Br J Psychiatry 1987. Cribado en cualquier momento del embarazo o hasta 12 meses posparto."]
    },
    // -------- MADRS --------
    {
      id: "madrs",
      name: "MADRS \u2014 Montgomery-\xC5sberg Depression Rating Scale",
      shortName: "MADRS",
      description: "Gravedad de la depresi\xF3n en adultos (10 \xEDtems, 0-6 cada uno).",
      category: CAT_SM,
      specialty: MED2,
      inputs: [
        "Tristeza aparente",
        "Tristeza referida",
        "Tensi\xF3n interna",
        "Sue\xF1o reducido",
        "Apetito reducido",
        "Dificultad de concentraci\xF3n",
        "Lasitud",
        "Incapacidad para sentir",
        "Pensamientos pesimistas",
        "Pensamientos suicidas"
      ].map((lab, i) => ({
        id: `m${i + 1}`,
        type: "select",
        label: `${i + 1}. ${lab}`,
        options: [0, 1, 2, 3, 4, 5, 6].map((n) => ({ label: `${n}`, value: n }))
      })),
      compute: (v) => {
        const ids = Array.from({ length: 10 }, (_, i) => `m${i + 1}`);
        const total = sum(v, ids);
        const ideacion = (v.m10 ?? 0) >= 3;
        let level = "ok";
        let sub = "Sin depresi\xF3n o m\xEDnima (0\u20136).";
        if (total >= 35) {
          level = "danger";
          sub = "Depresi\xF3n grave (\u2265 35).";
        } else if (total >= 20) {
          level = "warn";
          sub = "Depresi\xF3n moderada (20\u201334).";
        } else if (total >= 7) {
          level = "info";
          sub = "Depresi\xF3n leve (7\u201319).";
        }
        return {
          main: fmt(total),
          mainUnit: "puntos (0\u201360)",
          interpretation: (ideacion ? "\u26A0 \xCDtem 10 \u2265 3: valorar riesgo suicida. " : "") + sub,
          level: ideacion ? "danger" : level
        };
      },
      notes: ["Montgomery SA, \xC5sberg M. Br J Psychiatry 1979. Escala de referencia en ensayos cl\xEDnicos de depresi\xF3n mayor."]
    },
    // -------- C-SSRS simplificado --------
    {
      id: "c-ssrs",
      name: "C-SSRS \u2014 cribado de ideaci\xF3n y conducta suicida",
      shortName: "C-SSRS",
      description: "Versi\xF3n de cribado (\xFAltimos 30 d\xEDas para ideaci\xF3n; siempre para conducta).",
      category: CAT_SM,
      specialty: MED2,
      inputs: [
        { id: "i1", type: "boolean", label: "1. \xBFHa deseado estar muerto/a o poder dormirse y no despertar?" },
        { id: "i2", type: "boolean", label: "2. \xBFHa tenido pensamientos reales de suicidarse?" },
        { id: "i3", type: "boolean", label: "3. \xBFHa pensado en c\xF3mo hacerlo (m\xE9todo)?" },
        { id: "i4", type: "boolean", label: "4. \xBFHa tenido alguna intenci\xF3n de actuar seg\xFAn estos pensamientos?" },
        { id: "i5", type: "boolean", label: "5. \xBFHa comenzado a elaborar un plan espec\xEDfico o lo tiene?" },
        { id: "c", type: "boolean", label: "6. En su vida, \xBFalguna vez ha hecho algo o preparado algo para acabar con su vida?" },
        { id: "c3m", type: "boolean", label: "   \xBFHa ocurrido en los \xFAltimos 3 meses?" }
      ],
      compute: (v) => {
        let nivel = "Sin riesgo detectable";
        let level = "ok";
        let sub = "Todos los \xEDtems negativos: no se requiere derivaci\xF3n por conducta suicida.";
        if (v.i1 || v.i2) {
          level = "info";
          nivel = "Riesgo bajo";
          sub = "Ideaci\xF3n pasiva o activa sin plan: evaluar factores de riesgo y proteger acceso a medios.";
        }
        if (v.i3) {
          level = "warn";
          nivel = "Riesgo moderado";
          sub = "Ideaci\xF3n con m\xE9todo considerado: valoraci\xF3n por salud mental de forma preferente.";
        }
        if (v.i4 || v.i5) {
          level = "danger";
          nivel = "Riesgo alto";
          sub = "Intenci\xF3n o plan espec\xEDfico: derivaci\xF3n urgente y seguridad activa (retirar medios, acompa\xF1amiento).";
        }
        if (v.c && v.c3m) {
          level = "danger";
          nivel = "Riesgo alto (conducta reciente)";
          sub = "Conducta suicida en los \xFAltimos 3 meses: derivaci\xF3n urgente y valoraci\xF3n de ingreso.";
        }
        return { main: nivel, interpretation: sub, level };
      },
      notes: ["Posner K. Am J Psychiatry 2011. La respuesta positiva a los \xEDtems 4, 5 o a la conducta reciente exige actuaci\xF3n urgente."]
    },
    // -------- HITS --------
    {
      id: "hits",
      name: "HITS \u2014 cribado de violencia de pareja",
      shortName: "HITS",
      description: "Cuatro preguntas sobre golpes, insultos, amenazas y gritos en el \xFAltimo a\xF1o.",
      category: CAT_MED2,
      specialty: MED2,
      inputs: [
        { id: "h", type: "select", label: "Su pareja le ha pegado f\xEDsicamente (H)", options: [
          { label: "1 \u2014 Nunca", value: 1 },
          { label: "2 \u2014 Raras veces", value: 2 },
          { label: "3 \u2014 A veces", value: 3 },
          { label: "4 \u2014 Con frecuencia", value: 4 },
          { label: "5 \u2014 Muy a menudo", value: 5 }
        ] },
        { id: "i", type: "select", label: "Le ha insultado o hablado despectivamente (I)", options: [
          { label: "1 \u2014 Nunca", value: 1 },
          { label: "2 \u2014 Raras veces", value: 2 },
          { label: "3 \u2014 A veces", value: 3 },
          { label: "4 \u2014 Con frecuencia", value: 4 },
          { label: "5 \u2014 Muy a menudo", value: 5 }
        ] },
        { id: "t", type: "select", label: "La ha amenazado con hacerle da\xF1o (T)", options: [
          { label: "1 \u2014 Nunca", value: 1 },
          { label: "2 \u2014 Raras veces", value: 2 },
          { label: "3 \u2014 A veces", value: 3 },
          { label: "4 \u2014 Con frecuencia", value: 4 },
          { label: "5 \u2014 Muy a menudo", value: 5 }
        ] },
        { id: "s", type: "select", label: "Le ha gritado o maldecido (S)", options: [
          { label: "1 \u2014 Nunca", value: 1 },
          { label: "2 \u2014 Raras veces", value: 2 },
          { label: "3 \u2014 A veces", value: 3 },
          { label: "4 \u2014 Con frecuencia", value: 4 },
          { label: "5 \u2014 Muy a menudo", value: 5 }
        ] }
      ],
      compute: (v) => {
        const total = sum(v, ["h", "i", "t", "s"]);
        const positivo = total >= 11;
        return {
          main: fmt(total),
          mainUnit: "puntos (4\u201320)",
          interpretation: positivo ? "Cribado positivo (\u2265 11): valorar violencia de pareja, seguridad y ofrecer recursos." : "Cribado negativo.",
          level: positivo ? "warn" : "ok"
        };
      },
      notes: ["Sherin KM. Fam Med 1998. Punto de corte \u2265 11 con sensibilidad 96 % y especificidad 91 %."]
    },
    // -------- AAS --------
    {
      id: "aas",
      name: "AAS \u2014 Abuse Assessment Screen",
      shortName: "AAS",
      description: "Cribado de violencia dom\xE9stica, especialmente durante el embarazo.",
      category: CAT_MED2,
      specialty: MED2,
      inputs: [
        { id: "ultimoAno", type: "boolean", label: "\xBFEn el \xFAltimo a\xF1o ha sido golpeada, abofeteada, pateada o agredida f\xEDsicamente por alguien?" },
        { id: "embarazo", type: "boolean", label: "Durante el embarazo actual, \xBFha sufrido agresiones f\xEDsicas?" },
        { id: "sexual", type: "boolean", label: "\xBFEn el \xFAltimo a\xF1o ha sido forzada a mantener relaciones sexuales?" },
        { id: "miedo", type: "boolean", label: "\xBFTiene miedo de su pareja o de alguien de su entorno?" }
      ],
      compute: (v) => {
        const positivo = v.ultimoAno || v.embarazo || v.sexual || v.miedo;
        return {
          main: positivo ? "AAS positivo" : "AAS negativo",
          interpretation: positivo ? "Cualquier respuesta afirmativa activa: valorar seguridad, red de apoyo y recursos legales/sociales." : "Sin evidencia actual de violencia dom\xE9stica en el cribado.",
          level: positivo ? "warn" : "ok"
        };
      },
      notes: ["McFarlane J. JAMA 1992. Instrumento breve validado; combinar con espacio seguro para preguntar."]
    },
    // -------- Pack-years --------
    {
      id: "pack-years",
      name: "Paquetes-a\xF1o de tabaco",
      shortName: "Paquetes-a\xF1o",
      description: "Cuantifica el consumo acumulado de tabaco.",
      category: CAT_FORM2,
      specialty: MED2,
      inputs: [
        { id: "cigarros", type: "number", label: "Cigarrillos por d\xEDa" },
        { id: "anios", type: "number", label: "A\xF1os fumando" }
      ],
      compute: (v) => {
        const c = Number(v.cigarros);
        const a = Number(v.anios);
        if (!c || !a) return { main: "Completa los campos num\xE9ricos para ver el resultado.", interpretation: "" };
        const pky = c / 20 * a;
        let level = "info";
        let sub = "Consumo cuantificado. Consejo estructurado de deshabituaci\xF3n.";
        if (pky >= 20) {
          level = "warn";
          sub = "Consumo \u2265 20 paquetes-a\xF1o: indicaci\xF3n de cribado de c\xE1ncer de pulm\xF3n con TC de baja dosis (seg\xFAn edad y estado cl\xEDnico).";
        }
        if (pky >= 30) {
          level = "danger";
          sub = "Consumo \u2265 30 paquetes-a\xF1o: cribado firmemente indicado en adultos 50\u201380 a\xF1os activos o exfumadores de < 15 a\xF1os.";
        }
        return { main: fmt(pky, 1), mainUnit: "paquetes-a\xF1o", interpretation: sub, level };
      },
      notes: ["USPSTF 2021: cribado de CP con TCBD en 50\u201380 a\xF1os, \u2265 20 paquetes-a\xF1o, fumadores actuales o exfumadores de < 15 a\xF1os."]
    },
    // -------- IPSS / AUA-SI --------
    {
      id: "ipss",
      name: "IPSS / AUA-SI \u2014 s\xEDntomas prost\xE1ticos",
      shortName: "IPSS",
      description: "Siete s\xEDntomas urinarios + una pregunta de calidad de vida.",
      category: CAT_MED2,
      specialty: MED2,
      inputs: [
        "Sensaci\xF3n de vaciado incompleto",
        "Frecuencia (< 2 h)",
        "Intermitencia",
        "Urgencia",
        "Chorro d\xE9bil",
        "Esfuerzo para orinar",
        "Nocturia (n.\xBA de veces al d\xEDa)"
      ].map((lab, i) => ({
        id: `q${i + 1}`,
        type: "select",
        label: `${i + 1}. ${lab}`,
        options: [
          { label: "0 \u2014 Ninguna vez", value: 0 },
          { label: "1 \u2014 Menos de 1 de cada 5", value: 1 },
          { label: "2 \u2014 Menos de la mitad", value: 2 },
          { label: "3 \u2014 La mitad", value: 3 },
          { label: "4 \u2014 M\xE1s de la mitad", value: 4 },
          { label: "5 \u2014 Casi siempre", value: 5 }
        ]
      })),
      compute: (v) => {
        const ids = Array.from({ length: 7 }, (_, i) => `q${i + 1}`);
        const total = sum(v, ids);
        let level = "ok";
        let sub = "S\xEDntomas leves (0\u20137).";
        if (total >= 20) {
          level = "danger";
          sub = "S\xEDntomas graves (20\u201335): valorar tratamiento y derivaci\xF3n a urolog\xEDa.";
        } else if (total >= 8) {
          level = "warn";
          sub = "S\xEDntomas moderados (8\u201319): iniciar tratamiento m\xE9dico.";
        }
        return { main: fmt(total), mainUnit: "puntos (0\u201335)", interpretation: sub, level };
      },
      notes: ["Barry MJ. J Urol 1992. Se acompa\xF1a de una octava pregunta (calidad de vida 0\u20136) que no punt\xFAa pero orienta la decisi\xF3n terap\xE9utica."]
    },
    // -------- HERDOO2 --------
    {
      id: "herdoo2",
      name: "HERDOO2 \u2014 suspender anticoagulaci\xF3n tras TEV no provocado (mujeres)",
      shortName: "HERDOO2",
      description: "Identifica mujeres con TEV no provocado que pueden suspender la anticoagulaci\xF3n tras la fase inicial.",
      category: CAT_TEV2,
      specialty: MED2,
      inputs: [
        { id: "hiperpig", type: "boolean", label: "Hiperpigmentaci\xF3n, edema o eritema de la pierna afectada" },
        { id: "dimero", type: "boolean", label: "D\xEDmero-D \u2265 250 \xB5g/L (con anticoagulaci\xF3n activa)" },
        { id: "imc", type: "boolean", label: "IMC \u2265 30 kg/m\xB2" },
        { id: "edad", type: "boolean", label: "Edad \u2265 65 a\xF1os" }
      ],
      compute: (v) => {
        const total = sum(v, ["hiperpig", "dimero", "imc", "edad"]);
        const suspender = total <= 1;
        return {
          main: fmt(total),
          mainUnit: "puntos (0\u20134)",
          interpretation: suspender ? "Riesgo bajo (\u2264 1): puede considerarse suspender anticoagulaci\xF3n (recurrencia anual ~ 3 %)." : "Riesgo alto (\u2265 2): mantener anticoagulaci\xF3n (recurrencia anual ~ 8 %).",
          level: suspender ? "ok" : "warn"
        };
      },
      notes: ["Rodger MA. BMJ 2017 (validaci\xF3n REVERSE II). Solo aplicable en mujeres tras 5\u201312 meses de anticoagulaci\xF3n por TEV no provocado."]
    },
    // -------- Dutch FH --------
    {
      id: "dutch-fh",
      name: "Criterios Dutch Lipid Clinic (hipercolesterolemia familiar)",
      shortName: "Dutch FH",
      description: "Diagn\xF3stico cl\xEDnico de hipercolesterolemia familiar (HF) en adultos.",
      category: CAT_MED2,
      specialty: MED2,
      inputs: [
        { id: "af1", type: "boolean", label: "Familiar de 1er grado con enfermedad coronaria/vascular prematura o LDL > percentil 95", points: 1 },
        { id: "af2", type: "boolean", label: "Familiar de 1er grado con xantomas tendinosos o arco corneal o LDL > percentil 95 (edad < 18 a\xF1os)", points: 2 },
        { id: "ap1", type: "boolean", label: "Paciente con enfermedad coronaria prematura (< 55 a\xF1os H / < 60 a\xF1os M)", points: 2 },
        { id: "ap2", type: "boolean", label: "Paciente con enfermedad vascular cerebral/perif\xE9rica prematura", points: 1 },
        { id: "xantoma", type: "boolean", label: "Xantomas tendinosos", points: 6 },
        { id: "arco", type: "boolean", label: "Arco corneal antes de los 45 a\xF1os", points: 4 },
        { id: "ldl", type: "select", label: "LDL colesterol (mg/dL)", options: [
          { label: "0 \u2014 < 155", value: 0 },
          { label: "1 \u2014 155\u2013189", value: 1 },
          { label: "3 \u2014 190\u2013249", value: 3 },
          { label: "5 \u2014 250\u2013329", value: 5 },
          { label: "8 \u2014 \u2265 330", value: 8 }
        ] },
        { id: "mutacion", type: "boolean", label: "Mutaci\xF3n funcional documentada (LDLR, ApoB, PCSK9)", points: 8 }
      ],
      compute: (v) => {
        const total = sum(v, ["af1", "af2", "ap1", "ap2", "xantoma", "arco", "ldl", "mutacion"]);
        let dx = "Diagn\xF3stico improbable (< 3).";
        let level = "ok";
        if (total > 8) {
          dx = "Diagn\xF3stico definitivo (> 8): manejo especializado de HF.";
          level = "danger";
        } else if (total >= 6) {
          dx = "Diagn\xF3stico probable (6\u20138): tratamiento con estatinas de alta intensidad y estudio familiar.";
          level = "warn";
        } else if (total >= 3) {
          dx = "Diagn\xF3stico posible (3\u20135): valorar cribado familiar.";
          level = "info";
        }
        return { main: fmt(total), mainUnit: "puntos", interpretation: dx, level };
      },
      notes: ["Dutch Lipid Clinic Network 1999. Criterios recomendados por ESC/EAS para el diagn\xF3stico cl\xEDnico de HF."]
    },
    // -------- Gupta neumonía --------
    {
      id: "gupta-neumonia",
      name: "Gupta \u2014 riesgo de neumon\xEDa postoperatoria",
      shortName: "Gupta neumon\xEDa",
      description: "Predice el riesgo de neumon\xEDa en los 30 d\xEDas tras cirug\xEDa no card\xEDaca.",
      category: CAT_RIESGO,
      specialty: MED2,
      inputs: [
        { id: "edad", type: "number", label: "Edad (a\xF1os)" },
        { id: "copd", type: "boolean", label: "EPOC" },
        { id: "tabaco", type: "boolean", label: "Fumador activo" },
        { id: "sepsis", type: "select", label: "Estado s\xE9ptico preoperatorio", options: [
          { label: "\u22120,72 \u2014 Ninguno", value: -0.72 },
          { label: "0 \u2014 SIRS", value: 0 },
          { label: "+0,42 \u2014 Sepsis", value: 0.42 },
          { label: "+1,25 \u2014 Shock s\xE9ptico", value: 1.25 }
        ] },
        { id: "clase", type: "select", label: "Clase funcional", options: [
          { label: "\u22120,29 \u2014 Independiente", value: -0.29 },
          { label: "+0,49 \u2014 Parcialmente dependiente", value: 0.49 },
          { label: "+1,26 \u2014 Totalmente dependiente", value: 1.26 }
        ] },
        { id: "asa", type: "select", label: "Clasificaci\xF3n ASA", options: [
          { label: "\u22123 \u2014 ASA I", value: -3 },
          { label: "\u22121,8 \u2014 ASA II", value: -1.8 },
          { label: "\u22120,9 \u2014 ASA III", value: -0.9 },
          { label: "0 \u2014 ASA IV", value: 0 },
          { label: "+0,65 \u2014 ASA V", value: 0.65 }
        ] },
        { id: "cirugia", type: "select", label: "Tipo de cirug\xEDa (riesgo)", options: [
          { label: "\u22121,3 \u2014 Piel/anorrectal/mama/ginecol\xF3gica", value: -1.3 },
          { label: "\u22120,7 \u2014 Otros de riesgo bajo", value: -0.7 },
          { label: "0 \u2014 Neurocirug\xEDa / abdominal", value: 0 },
          { label: "+0,6 \u2014 Vascular / ORL", value: 0.6 },
          { label: "+1 \u2014 Tor\xE1cica / esof\xE1gica", value: 1 }
        ] }
      ],
      compute: (v) => {
        const edad = Number(v.edad) || 0;
        const x = -2.8977 + 0.0144 * edad + 0.7241 * (v.copd ? 1 : 0) + 0.3225 * (v.tabaco ? 1 : 0) + Number(v.sepsis || 0) + Number(v.clase || 0) + Number(v.asa || 0) + Number(v.cirugia || 0);
        const p = 100 / (1 + Math.exp(-x));
        let level = "ok";
        if (p >= 5) level = "danger";
        else if (p >= 2) level = "warn";
        else if (p >= 1) level = "info";
        return {
          main: fmt(p, 2),
          mainUnit: "% neumon\xEDa a 30 d\xEDas",
          interpretation: "Optimizar funci\xF3n pulmonar, cesaci\xF3n tab\xE1quica, fisioterapia respiratoria si riesgo elevado.",
          level
        };
      },
      notes: ["Gupta H. Chest 2013 (base ACS-NSQIP). Riesgo global < 1 % en cirug\xEDa electiva ambulatoria."]
    },
    // -------- Gupta insuficiencia respiratoria --------
    {
      id: "gupta-insufresp",
      name: "Gupta \u2014 riesgo de insuficiencia respiratoria postoperatoria",
      shortName: "Gupta IRA",
      description: "Predice ventilaci\xF3n mec\xE1nica > 48 h o reintubaci\xF3n en los 30 d\xEDas.",
      category: CAT_RIESGO,
      specialty: MED2,
      inputs: [
        { id: "clase", type: "select", label: "Clase funcional", options: [
          { label: "\u22120,45 \u2014 Independiente", value: -0.45 },
          { label: "+0,77 \u2014 Parcial", value: 0.77 },
          { label: "+1,26 \u2014 Total", value: 1.26 }
        ] },
        { id: "asa", type: "select", label: "ASA", options: [
          { label: "\u22123,7 \u2014 I", value: -3.7 },
          { label: "\u22122,42 \u2014 II", value: -2.42 },
          { label: "\u22121,56 \u2014 III", value: -1.56 },
          { label: "\u22120,71 \u2014 IV", value: -0.71 },
          { label: "0 \u2014 V", value: 0 }
        ] },
        { id: "sepsis", type: "select", label: "Estado s\xE9ptico preoperatorio", options: [
          { label: "\u22120,55 \u2014 Ninguno", value: -0.55 },
          { label: "0 \u2014 SIRS", value: 0 },
          { label: "+0,26 \u2014 Sepsis", value: 0.26 },
          { label: "+1,3 \u2014 Shock s\xE9ptico", value: 1.3 }
        ] },
        { id: "emergencia", type: "boolean", label: "Cirug\xEDa urgente/emergente", points: 0 },
        { id: "cirugia", type: "select", label: "Tipo de cirug\xEDa", options: [
          { label: "\u22121,2 \u2014 Piel/anorrectal/mama", value: -1.2 },
          { label: "\u22120,4 \u2014 Otros de riesgo bajo", value: -0.4 },
          { label: "0 \u2014 Neurocirug\xEDa/abdominal", value: 0 },
          { label: "+0,5 \u2014 Vascular/ORL", value: 0.5 },
          { label: "+1,5 \u2014 Tor\xE1cica/esof\xE1gica/a\xF3rtica", value: 1.5 }
        ] }
      ],
      compute: (v) => {
        const x = -1.7397 + Number(v.clase || 0) + Number(v.asa || 0) + Number(v.sepsis || 0) + (v.emergencia ? 0.535 : 0) + Number(v.cirugia || 0);
        const p = 100 / (1 + Math.exp(-x));
        let level = "ok";
        if (p >= 5) level = "danger";
        else if (p >= 2) level = "warn";
        else if (p >= 1) level = "info";
        return {
          main: fmt(p, 2),
          mainUnit: "% IRA postoperatoria",
          interpretation: "Considerar VMNI, fisioterapia y protocolos de extubaci\xF3n segura si riesgo elevado.",
          level
        };
      },
      notes: ["Gupta H. Mayo Clin Proc 2011."]
    },
    // -------- Duke treadmill --------
    {
      // Renombrada localmente para evitar colisión con la ya existente en
      // cardio-sca.ts (que se mantiene con id 'duke-treadmill').
      id: "duke-treadmill-mf",
      name: "Puntuaci\xF3n de Duke en ergometr\xEDa",
      shortName: "Duke treadmill",
      description: "Pron\xF3stico coronario tras prueba de esfuerzo est\xE1ndar (Bruce).",
      category: CAT_SCA,
      specialty: MED2,
      inputs: [
        { id: "minutos", type: "number", label: "Duraci\xF3n del ejercicio (minutos)" },
        { id: "st", type: "number", label: "M\xE1xima desviaci\xF3n del ST durante el ejercicio (mm)" },
        { id: "angina", type: "select", label: "Angina durante el ejercicio", options: [
          { label: "0 \u2014 Sin angina", value: 0 },
          { label: "1 \u2014 Angina no limitante", value: 1 },
          { label: "2 \u2014 Angina que obliga a parar", value: 2 }
        ] }
      ],
      compute: (v) => {
        const t = Number(v.minutos);
        const s = Number(v.st);
        if (isNaN(t) || isNaN(s)) return { main: "Completa los campos num\xE9ricos para ver el resultado.", interpretation: "" };
        const score = t - 5 * s - 4 * Number(v.angina || 0);
        let level = "ok";
        let sub = "Riesgo bajo (\u2265 5): mortalidad anual < 1 %.";
        if (score <= -11) {
          level = "danger";
          sub = "Riesgo alto (\u2264 \u221211): mortalidad anual > 5 %. Coronariograf\xEDa.";
        } else if (score < 5) {
          level = "warn";
          sub = "Riesgo intermedio (\u221210 a 4): mortalidad anual \u2248 2\u20133 %. Considerar imagen funcional.";
        }
        return { main: fmt(score, 0), mainUnit: "puntos", interpretation: sub, level };
      },
      notes: ["Mark DB. N Engl J Med 1991. F\xF3rmula: minutos \u2212 5\xD7ST \u2212 4\xD7angina."]
    },
    // -------- Boston syncope --------
    {
      id: "boston-sincope",
      name: "Criterios de s\xEDncope de Boston",
      shortName: "Boston s\xEDncope",
      description: "Identifica pacientes con s\xEDncope que requieren ingreso o estudio.",
      category: CAT_SINCOPE2,
      specialty: MED2,
      inputs: [
        { id: "sca", type: "boolean", label: "S\xEDntomas o signos de s\xEDndrome coronario agudo" },
        { id: "cardio", type: "boolean", label: "Antecedente de cardiopat\xEDa significativa" },
        { id: "familia", type: "boolean", label: "Antecedentes familiares de muerte s\xFAbita" },
        { id: "ecg", type: "boolean", label: "ECG con hallazgos relevantes (BAV, isquemia, QT largo, Brugada, Delta, HVI)" },
        { id: "esfuerzo", type: "boolean", label: "S\xEDncope durante el ejercicio" },
        { id: "palpit", type: "boolean", label: "Palpitaciones antes del s\xEDncope" },
        { id: "hipovol", type: "boolean", label: "Signos de hipovolemia o hemorragia (Hb < 9 g/dL, sangrado activo)" },
        { id: "valvular", type: "boolean", label: "Soplo o valvulopat\xEDa significativa" },
        { id: "constantes", type: "boolean", label: "Alteraci\xF3n persistente de constantes (bradi < 50, taqui > 100 tras reposo)" }
      ],
      compute: (v) => {
        const ids = ["sca", "cardio", "familia", "ecg", "esfuerzo", "palpit", "hipovol", "valvular", "constantes"];
        const total = sum(v, ids);
        const ingreso = total >= 1;
        return {
          main: ingreso ? "Ingreso recomendado" : "Alta segura",
          interpretation: ingreso ? `${total} criterio(s) positivo(s): monitorizaci\xF3n y estudio hospitalario.` : "Ning\xFAn criterio de alto riesgo: s\xEDncope de bajo riesgo, alta con seguimiento ambulatorio.",
          level: ingreso ? "warn" : "ok"
        };
      },
      notes: ["Grossman SA. Ann Emerg Med 2007. Sensibilidad 97 % para eventos adversos a 30 d\xEDas."]
    },
    // -------- Karter hipoglucemia --------
    {
      id: "karter-hipoglucemia",
      name: "Riesgo de hipoglucemia grave (Karter)",
      shortName: "Karter",
      description: "Predice hipoglucemia grave en pacientes con diabetes tipo 2 con hospitalizaci\xF3n o visita a urgencias en el \xFAltimo a\xF1o.",
      category: CAT_ENDO2,
      specialty: MED2,
      inputs: [
        { id: "hipoPrevia", type: "select", label: "Episodios previos de hipoglucemia en el \xFAltimo a\xF1o", options: [
          { label: "0", value: 0 },
          { label: "1\u20132", value: 1 },
          { label: "\u2265 3", value: 2 }
        ] },
        { id: "insulina", type: "boolean", label: "Tratamiento con insulina" },
        { id: "edad", type: "boolean", label: "Edad \u2265 77 a\xF1os" },
        { id: "erc", type: "boolean", label: "ERC (TFG < 60)" },
        { id: "sulfonilurea", type: "boolean", label: "Uso de sulfonilurea" },
        { id: "urgencias", type: "boolean", label: "Visita a urgencias en el \xFAltimo a\xF1o" }
      ],
      compute: (v) => {
        const total = Number(v.hipoPrevia || 0) + sum(v, ["insulina", "edad", "erc", "sulfonilurea", "urgencias"]);
        let categoria = "Bajo (< 1 %/a\xF1o).";
        let level = "ok";
        if (total >= 5) {
          categoria = "Alto (> 5 %/a\xF1o).";
          level = "danger";
        } else if (total >= 3) {
          categoria = "Intermedio (~ 1\u20135 %/a\xF1o).";
          level = "warn";
        }
        return { main: fmt(total), mainUnit: "puntos", interpretation: `Riesgo estimado a 12 meses: ${categoria} Ajustar objetivos de HbA1c y priorizar f\xE1rmacos con bajo riesgo (metformina, iSGLT2, GLP-1).`, level };
      },
      notes: ["Karter AJ. JAMA Intern Med 2017 (modelo original 6 variables). Herramienta simplificada: use la versi\xF3n completa para decisiones cr\xEDticas."]
    },
    // -------- Cambridge diabetes risk --------
    {
      id: "cambridge-diabetes",
      name: "Cambridge Diabetes Risk Score",
      shortName: "Cambridge",
      description: "Riesgo de diabetes tipo 2 no diagnosticada en adultos.",
      category: CAT_ENDO2,
      specialty: MED2,
      inputs: [
        { id: "edad", type: "number", label: "Edad (a\xF1os)" },
        { id: "sexo", type: "select", label: "Sexo", options: [
          { label: "Mujer", value: 0 },
          { label: "Hombre", value: 1 }
        ] },
        { id: "imc", type: "number", label: "IMC (kg/m\xB2)" },
        { id: "familia", type: "boolean", label: "Antecedente familiar de diabetes (padres/hermanos)" },
        { id: "esteroides", type: "boolean", label: "Tratamiento con corticoides orales" },
        { id: "antihta", type: "boolean", label: "Tratamiento antihipertensivo actual" },
        { id: "fumador", type: "select", label: "Tabaco", options: [
          { label: "No fumador", value: 0 },
          { label: "Exfumador", value: 1 },
          { label: "Fumador activo", value: 2 }
        ] }
      ],
      compute: (v) => {
        const edad = Number(v.edad);
        const imc = Number(v.imc);
        if (!edad || !imc) return { main: "Completa los campos num\xE9ricos para ver el resultado.", interpretation: "" };
        const beta = -6.322 + 0.063 * edad + 0.573 * (v.sexo === 1 ? 1 : 0) + 0.116 * imc + 0.728 * (v.familia ? 1 : 0) + 2.191 * (v.esteroides ? 1 : 0) + 1.222 * (v.antihta ? 1 : 0) + 0.855 * (v.fumador === 2 ? 1 : 0) + 0.221 * (v.fumador === 1 ? 1 : 0);
        const p = 100 / (1 + Math.exp(-beta));
        let level = "ok";
        let sub = "Riesgo bajo (< 3 %).";
        if (p >= 15) {
          level = "danger";
          sub = "Riesgo muy alto (\u2265 15 %): glucemia/HbA1c ahora.";
        } else if (p >= 8) {
          level = "warn";
          sub = "Riesgo alto (8\u201315 %): cribado y consejo intensivo.";
        } else if (p >= 3) {
          level = "info";
          sub = "Riesgo intermedio (3\u20138 %).";
        }
        return { main: fmt(p, 1), mainUnit: "% probabilidad", interpretation: sub, level };
      },
      notes: ["Griffin SJ. Diabetes Metab Res Rev 2000. Dise\xF1ada como cribado no invasivo."]
    }
  ];

  // src/calculators/neuro-critica.ts
  var CAT23 = "Neurolog\xEDa cr\xEDtica e ictus";
  var NEURO = ["Neurolog\xEDa cr\xEDtica", "Medicina Intensiva"];
  var escala8 = (items) => items.map(([value, label]) => ({ label: `${value} \u2014 ${label}`, value }));
  var neuroCritica = [
    {
      id: "rass",
      name: "Escala de agitaci\xF3n-sedaci\xF3n de Richmond (RASS)",
      shortName: "RASS",
      description: "Cuantifica de forma objetiva el nivel de agitaci\xF3n o sedaci\xF3n del paciente cr\xEDtico.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        {
          id: "nivel",
          type: "select",
          label: "Nivel de agitaci\xF3n / sedaci\xF3n",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "+4 \u2014 Combativo: violento, peligro inmediato para el personal", value: 4 },
            { label: "+3 \u2014 Muy agitado: tira o retira tubos y cat\xE9teres, agresivo", value: 3 },
            { label: "+2 \u2014 Agitado: movimientos frecuentes sin prop\xF3sito, lucha con el ventilador", value: 2 },
            { label: "+1 \u2014 Inquieto: ansioso pero sin movimientos agresivos", value: 1 },
            { label: "0 \u2014 Alerta y tranquilo", value: 0 },
            { label: "\u22121 \u2014 Somnoliento: no plenamente alerta pero mantiene los ojos abiertos > 10 s al hablar", value: -1 },
            { label: "\u22122 \u2014 Sedaci\xF3n ligera: abre los ojos brevemente al hablar (< 10 s)", value: -2 },
            { label: "\u22123 \u2014 Sedaci\xF3n moderada: mueve los ojos o los abre al hablar (sin contacto visual)", value: -3 },
            { label: "\u22124 \u2014 Sedaci\xF3n profunda: sin respuesta a la voz, responde al est\xEDmulo f\xEDsico", value: -4 },
            { label: "\u22125 \u2014 No despertable: sin respuesta a la voz ni al est\xEDmulo f\xEDsico", value: -5 }
          ],
          default: 0
        }
      ],
      compute: (v) => {
        const n = v.nivel ?? 0;
        let interp, level;
        if (n === 0) {
          interp = "Nivel deseable en la mayor\xEDa de los pacientes cr\xEDticos despiertos.";
          level = "ok";
        } else if (n > 0) {
          interp = n === 1 ? "Agitaci\xF3n leve: valorar causas (dolor, delirio, ansiedad, retirada de sedaci\xF3n, hipoxia, retenci\xF3n urinaria) antes de sedar." : n <= 2 ? "Agitaci\xF3n moderada: buscar y tratar la causa; valorar apoyo farmacol\xF3gico si es necesario." : "Agitaci\xF3n grave: riesgo inmediato de autoextubaci\xF3n y de da\xF1o; sedaci\xF3n de rescate y tratamiento etiol\xF3gico.";
          level = n === 1 ? "warn" : "danger";
        } else {
          interp = n >= -2 ? "Sedaci\xF3n ligera: nivel adecuado para la mayor\xEDa de pacientes en ventilaci\xF3n mec\xE1nica seg\xFAn la campa\xF1a de sedaci\xF3n ligera (PADIS)." : n === -3 ? "Sedaci\xF3n moderada: valorar si es necesaria esta profundidad; sedaci\xF3n diaria intermitente favorece el destete." : n === -4 ? "Sedaci\xF3n profunda: reservada a situaciones espec\xEDficas (hipertensi\xF3n intracraneal, SDRA grave con bloqueo neuromuscular, estatus refractario)." : "No despertable: valorar profundidad excesiva o causa neurol\xF3gica; despertar diario si no est\xE1 contraindicado.";
          level = n >= -2 ? "ok" : n === -3 ? "warn" : "danger";
        }
        return {
          main: (n > 0 ? "+" : "") + String(n),
          mainUnit: "RASS",
          interpretation: interp,
          level
        };
      },
      notes: [
        "Objetivo habitual del paciente cr\xEDtico en ventilaci\xF3n mec\xE1nica: RASS entre 0 y \u22122.",
        "Con RASS \u2265 +2 o \u2264 \u22124, evaluar delirio con CAM-ICU no es fiable: reevaluar cuando la sedaci\xF3n mejore."
      ],
      references: [
        "Sessler CN, et al. The Richmond Agitation-Sedation Scale: validity and reliability in adult intensive care unit patients. Am J Respir Crit Care Med. 2002;166(10):1338-44."
      ]
    },
    {
      id: "aspects",
      name: "ASPECTS \u2014 Alberta Stroke Program Early CT Score",
      shortName: "ASPECTS",
      description: "Cuantifica la extensi\xF3n de la isquemia precoz en la arteria cerebral media en la tomograf\xEDa sin contraste.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        { id: "c", type: "boolean", label: "Caudado afectado", labels: ["Normal", "Isquemia"] },
        { id: "l", type: "boolean", label: "N\xFAcleo lenticular afectado", labels: ["Normal", "Isquemia"] },
        { id: "i", type: "boolean", label: "C\xE1psula interna afectada", labels: ["Normal", "Isquemia"] },
        { id: "ic", type: "boolean", label: "Cinta insular afectada", labels: ["Normal", "Isquemia"] },
        { id: "m1", type: "boolean", label: "M1 (corteza anterior de la ACM) afectada", labels: ["Normal", "Isquemia"] },
        { id: "m2", type: "boolean", label: "M2 (corteza lateral al ribete insular) afectada", labels: ["Normal", "Isquemia"] },
        { id: "m3", type: "boolean", label: "M3 (corteza posterior de la ACM) afectada", labels: ["Normal", "Isquemia"] },
        { id: "m4", type: "boolean", label: "M4 (territorio ACM anterior superior) afectado", labels: ["Normal", "Isquemia"] },
        { id: "m5", type: "boolean", label: "M5 (territorio ACM lateral superior) afectado", labels: ["Normal", "Isquemia"] },
        { id: "m6", type: "boolean", label: "M6 (territorio ACM posterior superior) afectado", labels: ["Normal", "Isquemia"] }
      ],
      compute: (v) => {
        const afectados = sum(v, ["c", "l", "i", "ic", "m1", "m2", "m3", "m4", "m5", "m6"]);
        const score = 10 - afectados;
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          interpretation: score >= 7 ? "ASPECTS \u2265 7: rango en el que la trombectom\xEDa mec\xE1nica es especialmente beneficiosa (junto con NIHSS \u2265 6 y ventana temporal apropiada)." : score >= 4 ? "ASPECTS 4\u20136: valorar de forma individualizada la trombectom\xEDa; los estudios SELECT2 y ANGEL-ASPECT muestran beneficio en ictus con n\xFAcleo m\xE1s amplio." : "ASPECTS < 4: infarto extenso ya establecido; el beneficio de reperfusi\xF3n es menor y el riesgo hemorr\xE1gico es mayor.",
          level: score >= 7 ? "ok" : score >= 4 ? "warn" : "danger",
          details: ["Se resta un punto por cada una de las 10 regiones ASPECTS con signos de isquemia precoz."]
        };
      },
      references: [
        "Barber PA, et al. Validity and reliability of a quantitative computed tomography score in predicting outcome of hyperacute stroke. Lancet. 2000;355(9216):1670-4."
      ]
    },
    {
      id: "ottawa-sah",
      name: "Regla de Ottawa para la hemorragia subaracnoidea",
      shortName: "Ottawa HSA",
      description: "Descarta la hemorragia subaracnoidea en pacientes con cefalea aguda de m\xE1xima intensidad.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad \u2265 40 a\xF1os" },
        { id: "rigidez", type: "boolean", label: "Rigidez de nuca" },
        { id: "conciencia", type: "boolean", label: "Alteraci\xF3n testificada del nivel de conciencia" },
        { id: "esfuerzo", type: "boolean", label: "Inicio durante el esfuerzo" },
        { id: "trueno", type: "boolean", label: "Cefalea explosiva (\xABen trueno\xBB, m\xE1xima en segundos)" },
        { id: "limitacion", type: "boolean", label: "Limitaci\xF3n a la flexi\xF3n cervical" }
      ],
      compute: (v) => {
        const criterios = sum(v, ["edad", "rigidez", "conciencia", "esfuerzo", "trueno", "limitacion"]);
        return {
          main: criterios === 0 ? "HSA razonablemente descartada" : "No se puede descartar HSA",
          secondary: String(criterios),
          secondaryLabel: "criterios positivos",
          interpretation: criterios === 0 ? "Regla negativa: sensibilidad \u2248 100 % para HSA en pacientes con cefalea de nueva aparici\xF3n que alcanz\xF3 su intensidad m\xE1xima en menos de 1 h y sin d\xE9ficits focales. No se requieren estudios adicionales por sospecha de HSA (siempre juicio cl\xEDnico)." : "Al menos un criterio positivo: no puede descartarse HSA por la regla. Estudio con tomograf\xEDa sin contraste; si es negativa dentro de 6 h del inicio, valor predictivo negativo muy alto en el paciente neurol\xF3gicamente intacto.",
          level: criterios === 0 ? "ok" : "danger"
        };
      },
      notes: [
        "Solo aplicable a pacientes \u2265 15 a\xF1os con cefalea de nueva aparici\xF3n no traum\xE1tica, no d\xE9ficits focales y no antecedente de aneurisma, HSA previa, tumor cerebral o cefaleas similares recurrentes."
      ],
      references: [
        "Perry JJ, et al. Clinical decision rules to rule out subarachnoid hemorrhage for acute headache. JAMA. 2013;310(12):1248-55."
      ]
    },
    {
      id: "mbig",
      name: "Brain Injury Guidelines modificado (mBIG)",
      shortName: "mBIG",
      description: "Estratifica el traumatismo craneoencef\xE1lico leve con hallazgos en tomograf\xEDa para orientar el manejo.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        {
          id: "gcs",
          type: "select",
          label: "GCS al ingreso",
          options: [
            { label: "15", value: 0 },
            { label: "13\u201314", value: 1 },
            { label: "\u2264 12", value: 2 }
          ]
        },
        { id: "anticoagulacion", type: "boolean", label: "Anticoagulaci\xF3n o antiagregaci\xF3n (excepto AAS profil\xE1ctica)" },
        { id: "intoxicacion", type: "boolean", label: "Intoxicaci\xF3n evidente" },
        { id: "focal", type: "boolean", label: "D\xE9ficit neurol\xF3gico focal" },
        { id: "fracturaDesplazada", type: "boolean", label: "Fractura craneal desplazada o abierta" },
        {
          id: "sdh",
          type: "select",
          label: "Hematoma subdural (SDH)",
          dropdown: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "\u2264 4 mm", value: 1 },
            { label: "5\u20137 mm", value: 2 },
            { label: "> 7 mm", value: 3 }
          ]
        },
        {
          id: "edh",
          type: "select",
          label: "Hematoma epidural (EDH)",
          dropdown: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "\u2264 4 mm", value: 1 },
            { label: "5\u20137 mm", value: 2 },
            { label: "> 7 mm", value: 3 }
          ]
        },
        {
          id: "contusion",
          type: "select",
          label: "Contusi\xF3n intraparenquimatosa",
          dropdown: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "\u2264 4 mm, \xFAnica", value: 1 },
            { label: "5\u20137 mm o m\xFAltiple", value: 2 },
            { label: "> 7 mm", value: 3 }
          ]
        },
        { id: "hemoventricular", type: "boolean", label: "Hemorragia intraventricular o subaracnoidea" }
      ],
      compute: (v) => {
        const grave = v.anticoagulacion === 1 || v.intoxicacion === 1 || v.focal === 1 || v.fracturaDesplazada === 1 || (v.gcs ?? 0) === 2 || (v.sdh ?? 0) === 3 || (v.edh ?? 0) === 3 || (v.contusion ?? 0) === 3 || v.hemoventricular === 1;
        const intermedio = !grave && ((v.gcs ?? 0) === 1 || (v.sdh ?? 0) === 2 || (v.edh ?? 0) === 2 || (v.contusion ?? 0) === 2);
        const leve = !grave && !intermedio && ((v.sdh ?? 0) === 1 || (v.edh ?? 0) === 1 || (v.contusion ?? 0) === 1);
        const categoria = grave ? "mBIG 3" : intermedio ? "mBIG 2" : leve ? "mBIG 1" : "Sin criterios";
        return {
          main: categoria,
          interpretation: grave ? "mBIG 3: manejo hospitalario con neurocirug\xEDa, tomograf\xEDa de control, ingreso (a menudo en cuidados intermedios/UCI) y valoraci\xF3n quir\xFArgica." : intermedio ? "mBIG 2: observaci\xF3n hospitalaria, tomograf\xEDa de control en 6 h, valoraci\xF3n neuroquir\xFArgica; puede evitarse ingreso en UCI si la evoluci\xF3n es favorable." : leve ? "mBIG 1: puede manejarse en observaci\xF3n sin tomograf\xEDa de control ni ingreso en cuidados intensivos, si el paciente est\xE1 estable y hay red de apoyo." : "No se cumplen criterios de lesi\xF3n: si el TC es normal y el paciente est\xE1 estable, alta con recomendaciones.",
          level: grave ? "danger" : intermedio ? "warn" : leve ? "info" : "ok"
        };
      },
      notes: [
        "Aplicable a traumatismos craneoencef\xE1licos leves con GCS 13\u201315 y hallazgos en tomograf\xEDa.",
        "Requiere disponibilidad r\xE1pida de neurocirug\xEDa; validaciones locales antes de aplicar de forma sistem\xE1tica."
      ],
      references: [
        "Joseph B, et al. The BIG (Brain Injury Guidelines) project: defining the management of TBI by acute care surgeons. J Trauma Acute Care Surg. 2014;76(4):965-9."
      ]
    },
    {
      id: "fisher-modificado",
      name: "Escala de Fisher modificada para el vasoespasmo",
      shortName: "Fisher modificado",
      description: "Predice el riesgo de vasoespasmo en la hemorragia subaracnoidea aneurism\xE1tica seg\xFAn la tomograf\xEDa inicial.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "Hallazgos en la tomograf\xEDa",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Grado 0 \u2014 Sin sangre en cisternas ni hemorragia intraventricular", value: 0 },
            { label: "Grado 1 \u2014 Sangre subaracnoidea fina sin hemorragia intraventricular", value: 1 },
            { label: "Grado 2 \u2014 Sangre subaracnoidea fina con hemorragia intraventricular", value: 2 },
            { label: "Grado 3 \u2014 Sangre subaracnoidea gruesa (> 1 mm) sin hemorragia intraventricular", value: 3 },
            { label: "Grado 4 \u2014 Sangre subaracnoidea gruesa con hemorragia intraventricular", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const g = v.grado ?? 0;
        const riesgo2 = ["0 %", "24 %", "33 %", "33 %", "40 %"][g];
        return {
          main: `Grado ${g}`,
          secondary: riesgo2,
          secondaryLabel: "riesgo de vasoespasmo sintom\xE1tico",
          interpretation: g <= 1 ? "Riesgo bajo de vasoespasmo sintom\xE1tico." : g <= 2 ? "Riesgo moderado: vigilancia con Doppler transcraneal y cl\xEDnica." : "Riesgo alto: profilaxis con nimodipino, mantener euvolemia y normotensi\xF3n, y vigilancia estrecha (Doppler transcraneal, exploraciones neurol\xF3gicas frecuentes).",
          level: g <= 1 ? "ok" : g <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Frontera JA, et al. Prediction of symptomatic vasospasm after subarachnoid hemorrhage: the modified Fisher scale. Neurosurgery. 2006;59(1):21-7."
      ]
    },
    {
      id: "func",
      name: "Puntuaci\xF3n FUNC para hemorragia intracerebral",
      shortName: "FUNC",
      description: "Predice la probabilidad de independencia funcional a los 90 d\xEDas tras una hemorragia intracerebral espont\xE1nea.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        {
          id: "volumen",
          type: "select",
          label: "Volumen del hematoma",
          options: [
            { label: "< 30 cm\xB3", value: 4 },
            { label: "30\u201360 cm\xB3", value: 2 },
            { label: "> 60 cm\xB3", value: 0 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 70 a\xF1os", value: 2 },
            { label: "70\u201379 a\xF1os", value: 1 },
            { label: "\u2265 80 a\xF1os", value: 0 }
          ]
        },
        {
          id: "localizacion",
          type: "select",
          label: "Localizaci\xF3n",
          options: [
            { label: "Lobar", value: 2 },
            { label: "Profunda (ganglios basales, t\xE1lamo)", value: 1 },
            { label: "Infratentorial", value: 0 }
          ]
        },
        {
          id: "gcs",
          type: "select",
          label: "GCS al ingreso",
          options: [
            { label: "\u2265 9", value: 2 },
            { label: "\u2264 8", value: 0 }
          ]
        },
        {
          id: "deterioro",
          type: "select",
          label: "Deterioro cognitivo previo",
          options: [
            { label: "Ausente", value: 1 },
            { label: "Presente", value: 0 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["volumen", "edad", "localizacion", "gcs", "deterioro"]);
        const funcional = ["0 %", "0 %", "0 %", "13 %", "20 %", "42 %", "66 %", "82 %", "82 %", "95 %", "95 %", "95 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u201311)",
          secondary: funcional,
          secondaryLabel: "independencia funcional a 90 d\xEDas",
          interpretation: score >= 8 ? "Alta probabilidad de recuperaci\xF3n funcional: apostar por un manejo agresivo y rehabilitaci\xF3n precoz." : score >= 5 ? "Probabilidad intermedia: manejo activo con reevaluaci\xF3n cl\xEDnica y de imagen." : "Probabilidad baja de independencia funcional. No usar la puntuaci\xF3n como \xFAnico criterio para limitar el esfuerzo terap\xE9utico en las primeras 24\u201348 h.",
          level: score >= 8 ? "ok" : score >= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Rost NS, et al. Prediction of functional outcome in patients with primary intracerebral hemorrhage: the FUNC score. Stroke. 2008;39(8):2304-9."
      ]
    },
    {
      id: "hat",
      name: "Puntuaci\xF3n HAT \u2014 riesgo de hemorragia tras tPA",
      shortName: "HAT",
      description: "Estima el riesgo de hemorragia intracraneal sintom\xE1tica tras la administraci\xF3n de trombol\xEDtico en el ictus isqu\xE9mico.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        {
          id: "diabetes",
          type: "select",
          label: "Diabetes o glucemia > 200 mg/dL al ingreso",
          options: [
            { label: "No", value: 0 },
            { label: "S\xED", value: 1 }
          ]
        },
        {
          id: "nihss",
          type: "select",
          label: "NIHSS pretratamiento",
          options: [
            { label: "< 15", value: 0 },
            { label: "15\u201320", value: 1 },
            { label: "\u2265 20", value: 2 }
          ]
        },
        {
          id: "tc",
          type: "select",
          label: "Hipodensidad en la tomograf\xEDa",
          options: [
            { label: "Ausente", value: 0 },
            { label: "< 1/3 del territorio ACM", value: 1 },
            { label: "\u2265 1/3 del territorio ACM", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["diabetes", "nihss", "tc"]);
        const total = ["2 %", "5 %", "10 %", "15 %", "44 %", "44 %"][score];
        const sintom = ["6 %", "16 %", "23 %", "36 %", "78 %", "78 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20135)",
          secondary: sintom,
          secondaryLabel: "riesgo de hemorragia sintom\xE1tica",
          interpretation: score <= 1 ? "Riesgo bajo de hemorragia intracraneal sintom\xE1tica." : score <= 2 ? "Riesgo moderado." : "Riesgo alto: individualizar la decisi\xF3n y vigilancia neurol\xF3gica estrecha tras el tratamiento.",
          level: score <= 1 ? "ok" : score <= 2 ? "warn" : "danger",
          details: [`Riesgo de cualquier hemorragia intracraneal en la TC de control: ${total}.`]
        };
      },
      references: [
        "Lou M, et al. The HAT score: a simple grading scale for predicting hemorrhage after thrombolysis. Neurology. 2008;71(18):1417-23."
      ]
    },
    {
      id: "sedan",
      name: "Puntuaci\xF3n SEDAN \u2014 hemorragia sintom\xE1tica tras tPA",
      shortName: "SEDAN",
      description: "Predice el riesgo de hemorragia intracerebral sintom\xE1tica tras trombolisis intravenosa en el ictus isqu\xE9mico.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        {
          id: "glucemia",
          type: "select",
          label: "Glucemia s\xE9rica al ingreso",
          options: [
            { label: "< 144 mg/dL", value: 0 },
            { label: "145\u2013216 mg/dL", value: 1 },
            { label: "> 216 mg/dL", value: 2 }
          ]
        },
        {
          id: "aspects",
          type: "select",
          label: "ASPECTS pretratamiento",
          options: [
            { label: "\u2265 10", value: 0 },
            { label: "< 10", value: 1 }
          ]
        },
        {
          id: "hiperdensidad",
          type: "select",
          label: "Signo hiperdenso de la arteria cerebral en la TC",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Presente", value: 1 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "\u2264 75 a\xF1os", value: 0 },
            { label: "> 75 a\xF1os", value: 1 }
          ]
        },
        {
          id: "nihss",
          type: "select",
          label: "NIHSS al ingreso",
          options: [
            { label: "\u2264 9", value: 0 },
            { label: "\u2265 10", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["glucemia", "aspects", "hiperdensidad", "edad", "nihss"]);
        const riesgo2 = ["1,6 %", "2,4 %", "3,5 %", "4,8 %", "9,3 %", "16,9 %", "27,8 %"][Math.min(score, 6)];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20136)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de hemorragia intracraneal sintom\xE1tica",
          interpretation: score <= 1 ? "Riesgo bajo." : score <= 3 ? "Riesgo moderado." : "Riesgo alto: valorar de forma individualizada el balance riesgo-beneficio del tratamiento y la vigilancia postratamiento.",
          level: score <= 1 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Strbian D, et al. Symptomatic intracranial hemorrhage after stroke thrombolysis: the SEDAN score. Ann Neurol. 2012;71(5):634-41."
      ]
    },
    {
      id: "thrive",
      name: "Puntuaci\xF3n THRIVE tras el ictus",
      shortName: "THRIVE",
      description: "Estima la probabilidad de resultado funcional y de mortalidad tras un ictus isqu\xE9mico agudo tratado.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        {
          id: "nihss",
          type: "select",
          label: "NIHSS al ingreso",
          options: [
            { label: "\u2264 10", value: 0 },
            { label: "11\u201320", value: 2 },
            { label: "\u2265 21", value: 4 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "\u2264 59 a\xF1os", value: 0 },
            { label: "60\u201379 a\xF1os", value: 1 },
            { label: "\u2265 80 a\xF1os", value: 2 }
          ]
        },
        { id: "hta", type: "boolean", label: "Hipertensi\xF3n" },
        { id: "dm", type: "boolean", label: "Diabetes mellitus" },
        { id: "fa", type: "boolean", label: "Fibrilaci\xF3n auricular" }
      ],
      compute: (v) => {
        const score = sum(v, ["nihss", "edad", "hta", "dm", "fa"]);
        const bueno = ["65 %", "58 %", "52 %", "42 %", "35 %", "27 %", "20 %", "14 %", "10 %", "10 %"][score];
        const mort = ["12 %", "14 %", "16 %", "22 %", "28 %", "35 %", "42 %", "50 %", "58 %", "58 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20139)",
          secondary: bueno,
          secondaryLabel: "probabilidad de buen resultado (mRS 0\u20132) a 90 d\xEDas",
          interpretation: `Mortalidad estimada a 90 d\xEDas: ${mort}. Herramienta pron\xF3stica; no debe usarse aisladamente para negar la reperfusi\xF3n.`,
          level: score <= 3 ? "ok" : score <= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Flint AC, et al. THRIVE score predicts ischemic stroke outcomes and thrombolytic hemorrhage risk in VISTA. Stroke. 2013;44(12):3365-9."
      ]
    },
    {
      id: "lams",
      name: "LAMS \u2014 Los Angeles Motor Scale",
      shortName: "LAMS",
      description: "Escala prehospitalaria de tres \xEDtems para identificar r\xE1pidamente ictus por oclusi\xF3n de gran vaso.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        {
          id: "facial",
          type: "select",
          label: "Paresia facial",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Presente", value: 1 }
          ]
        },
        {
          id: "brazo",
          type: "select",
          label: "Debilidad del brazo",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Deriva", value: 1 },
            { label: "Cae", value: 2 }
          ]
        },
        {
          id: "mano",
          type: "select",
          label: "Fuerza de la mano",
          options: [
            { label: "Normal", value: 0 },
            { label: "Debilidad de la prensi\xF3n", value: 1 },
            { label: "Sin prensi\xF3n", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["facial", "brazo", "mano"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20135)",
          interpretation: score >= 4 ? "LAMS \u2265 4: alta probabilidad de oclusi\xF3n de gran vaso. Considerar traslado directo a centro con capacidad de trombectom\xEDa mec\xE1nica." : "LAMS < 4: menor probabilidad de oclusi\xF3n de gran vaso; traslado seg\xFAn protocolo habitual de ictus.",
          level: score >= 4 ? "danger" : "warn"
        };
      },
      references: [
        "Nazliel B, et al. A brief prehospital stroke severity scale identifies ischemic stroke patients harboring persisting large arterial occlusions. Stroke. 2008;39(8):2264-7."
      ]
    },
    {
      id: "barthel",
      name: "\xCDndice de Barthel",
      shortName: "Barthel",
      description: "Mide el grado de independencia en las actividades b\xE1sicas de la vida diaria.",
      category: CAT23,
      specialty: NEURO,
      inputs: [
        {
          id: "comer",
          type: "select",
          label: "Comer",
          dropdown: true,
          options: escala8([
            [0, "Dependiente"],
            [5, "Necesita ayuda"],
            [10, "Independiente"]
          ])
        },
        {
          id: "lavarse",
          type: "select",
          label: "Lavarse (ba\xF1o/ducha)",
          options: escala8([
            [0, "Dependiente"],
            [5, "Independiente"]
          ])
        },
        {
          id: "vestirse",
          type: "select",
          label: "Vestirse",
          dropdown: true,
          options: escala8([
            [0, "Dependiente"],
            [5, "Necesita ayuda"],
            [10, "Independiente"]
          ])
        },
        {
          id: "arreglarse",
          type: "select",
          label: "Arreglarse (aseo personal)",
          options: escala8([
            [0, "Dependiente"],
            [5, "Independiente"]
          ])
        },
        {
          id: "deposicion",
          type: "select",
          label: "Deposici\xF3n",
          dropdown: true,
          options: escala8([
            [0, "Incontinente"],
            [5, "Accidente ocasional"],
            [10, "Continente"]
          ])
        },
        {
          id: "miccion",
          type: "select",
          label: "Micci\xF3n",
          dropdown: true,
          options: escala8([
            [0, "Incontinente o sondado"],
            [5, "Accidente ocasional"],
            [10, "Continente"]
          ])
        },
        {
          id: "wc",
          type: "select",
          label: "Uso del retrete",
          dropdown: true,
          options: escala8([
            [0, "Dependiente"],
            [5, "Necesita ayuda"],
            [10, "Independiente"]
          ])
        },
        {
          id: "traslado",
          type: "select",
          label: "Traslado (cama\u2013sill\xF3n)",
          dropdown: true,
          options: escala8([
            [0, "Dependiente"],
            [5, "Gran ayuda (una persona)"],
            [10, "M\xEDnima ayuda"],
            [15, "Independiente"]
          ])
        },
        {
          id: "deambulacion",
          type: "select",
          label: "Deambulaci\xF3n",
          dropdown: true,
          options: escala8([
            [0, "Dependiente"],
            [5, "Independiente en silla de ruedas"],
            [10, "Camina con ayuda"],
            [15, "Independiente"]
          ])
        },
        {
          id: "escaleras",
          type: "select",
          label: "Subir y bajar escaleras",
          dropdown: true,
          options: escala8([
            [0, "Dependiente"],
            [5, "Necesita ayuda"],
            [10, "Independiente"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["comer", "lavarse", "vestirse", "arreglarse", "deposicion", "miccion", "wc", "traslado", "deambulacion", "escaleras"]);
        const banda = score < 20 ? "total" : score < 60 ? "grave" : score < 90 ? "moderada" : score < 100 ? "leve" : "independiente";
        return {
          main: String(score),
          mainUnit: "puntos (0\u2013100)",
          secondary: `Dependencia ${banda}`,
          interpretation: score === 100 ? "Independencia total para las actividades b\xE1sicas de la vida diaria." : score >= 60 ? "Dependencia leve o moderada: valorar apoyos y rehabilitaci\xF3n." : "Dependencia grave o total: planificar cuidados, ayudas t\xE9cnicas y apoyo sociosanitario.",
          level: score >= 90 ? "ok" : score >= 60 ? "warn" : "danger"
        };
      },
      references: [
        "Mahoney FI, Barthel DW. Functional evaluation: the Barthel Index. Md State Med J. 1965;14:61-5."
      ]
    }
  ];

  // src/calculators/urgencias.ts
  var CAT_URG2 = "Urgencias y decisi\xF3n cl\xEDnica";
  var CAT_TOX2 = "Endocrino y t\xF3xicos";
  var URG2 = ["Emergencias"];
  var urgencias = [
    {
      id: "alvarado",
      name: "Puntuaci\xF3n de Alvarado para la apendicitis",
      shortName: "Alvarado",
      description: "Estima la probabilidad de apendicitis aguda en pacientes con dolor abdominal.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        { id: "migracion", type: "boolean", label: "Migraci\xF3n del dolor a fosa il\xEDaca derecha" },
        { id: "anorexia", type: "boolean", label: "Anorexia" },
        { id: "nauseas", type: "boolean", label: "N\xE1useas o v\xF3mitos" },
        { id: "sensibilidad", type: "boolean", label: "Dolor a la palpaci\xF3n en fosa il\xEDaca derecha", points: 2 },
        { id: "rebote", type: "boolean", label: "Signo de rebote (Blumberg)" },
        { id: "fiebre", type: "boolean", label: "Temperatura > 37,3 \xB0C" },
        { id: "leucocitosis", type: "boolean", label: "Leucocitos > 10.000/mm\xB3", points: 2 },
        { id: "neutrofilia", type: "boolean", label: "Desviaci\xF3n izquierda (>75 % neutr\xF3filos)" }
      ],
      compute: (v) => {
        const score = sum(v, ["migracion", "anorexia", "nauseas", "sensibilidad", "rebote", "fiebre", "leucocitosis", "neutrofilia"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201310)",
          interpretation: score <= 3 ? "Baja probabilidad de apendicitis: valorar alta con reevaluaci\xF3n." : score <= 6 ? "Probabilidad intermedia: observaci\xF3n y prueba de imagen (ecograf\xEDa o TC)." : "Alta probabilidad de apendicitis: valoraci\xF3n quir\xFArgica.",
          level: score <= 3 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      references: [
        "Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med. 1986;15(5):557-64."
      ]
    },
    {
      id: "air",
      name: "Puntuaci\xF3n AIR (Appendicitis Inflammatory Response)",
      shortName: "AIR",
      description: "Alternativa a Alvarado con mayor peso a los reactantes de fase aguda.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        { id: "vomitos", type: "boolean", label: "V\xF3mitos" },
        { id: "fid", type: "boolean", label: "Dolor en fosa il\xEDaca derecha" },
        { id: "rebote", type: "boolean", label: "Defensa/rebote leve" },
        {
          id: "reboteM",
          type: "select",
          label: "Defensa/rebote \u2014 intensidad",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Leve", value: 1 },
            { label: "Moderado", value: 2 },
            { label: "Intenso", value: 3 }
          ]
        },
        {
          id: "temp",
          type: "select",
          label: "Temperatura",
          options: [
            { label: "< 38,5 \xB0C", value: 0 },
            { label: "\u2265 38,5 \xB0C", value: 1 }
          ]
        },
        {
          id: "neutro",
          type: "select",
          label: "Polimorfonucleares (%)",
          options: [
            { label: "< 70", value: 0 },
            { label: "70\u201384", value: 1 },
            { label: "\u2265 85", value: 2 }
          ]
        },
        {
          id: "leucos",
          type: "select",
          label: "Leucocitos (\xD710\u2079/L)",
          options: [
            { label: "< 10", value: 0 },
            { label: "10\u201314,9", value: 1 },
            { label: "\u2265 15", value: 2 }
          ]
        },
        {
          id: "pcr",
          type: "select",
          label: "Prote\xEDna C reactiva (mg/L)",
          options: [
            { label: "< 10", value: 0 },
            { label: "10\u201349", value: 1 },
            { label: "\u2265 50", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["vomitos", "fid", "rebote", "reboteM", "temp", "neutro", "leucos", "pcr"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201312)",
          interpretation: score <= 4 ? "Baja probabilidad: apendicitis poco probable; valorar alta con reevaluaci\xF3n." : score <= 8 ? "Probabilidad intermedia: observaci\xF3n e imagen; usar AIR para reducir im\xE1genes innecesarias en adultos y ni\xF1os." : "Alta probabilidad: valoraci\xF3n quir\xFArgica; puede evitarse imagen si la cl\xEDnica es clara.",
          level: score <= 4 ? "ok" : score <= 8 ? "warn" : "danger"
        };
      },
      references: [
        "Andersson M, Andersson RE. The appendicitis inflammatory response score: a tool for the diagnosis of acute appendicitis. World J Surg. 2008;32(8):1843-9."
      ]
    },
    {
      id: "centor-mcisaac",
      name: "Puntuaci\xF3n Centor / McIsaac para faringitis estreptoc\xF3cica",
      shortName: "Centor-McIsaac",
      description: "Estima la probabilidad de faringitis por estreptococo del grupo A y gu\xEDa la decisi\xF3n de test r\xE1pido o antibi\xF3tico.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "3\u201314 a\xF1os", value: 1 },
            { label: "15\u201344 a\xF1os", value: 0 },
            { label: "\u2265 45 a\xF1os", value: -1 }
          ]
        },
        { id: "exudado", type: "boolean", label: "Exudado o hipertrofia amigdalar" },
        { id: "adenopatia", type: "boolean", label: "Adenopat\xEDa cervical anterior dolorosa" },
        { id: "fiebre", type: "boolean", label: "Fiebre > 38 \xB0C" },
        { id: "tos", type: "boolean", label: "Ausencia de tos" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "exudado", "adenopatia", "fiebre", "tos"]);
        const prob = score <= 0 ? "1\u20132 %" : score === 1 ? "5\u201310 %" : score === 2 ? "11\u201317 %" : score === 3 ? "28\u201335 %" : "51\u201353 %";
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: prob,
          secondaryLabel: "probabilidad de estreptococo",
          interpretation: score <= 0 ? "Muy baja probabilidad: no test, no antibi\xF3tico." : score <= 1 ? "Baja: no test ni antibi\xF3tico rutinarios." : score <= 3 ? "Intermedia: test r\xE1pido o cultivo. Tratar solo si resulta positivo." : "Alta: puede plantearse tratamiento emp\xEDrico, aunque las gu\xEDas actuales recomiendan confirmar con test r\xE1pido para evitar antibioterapia innecesaria.",
          level: score <= 1 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "McIsaac WJ, et al. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ. 1998;158(1):75-83."
      ]
    },
    {
      id: "feverpain",
      name: "Puntuaci\xF3n FeverPAIN para faringitis",
      shortName: "FeverPAIN",
      description: "Alternativa brit\xE1nica a Centor para orientar el uso de antibi\xF3ticos en la faringitis aguda.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        { id: "fiebre", type: "boolean", label: "Fiebre en las \xFAltimas 24 h" },
        { id: "exudado", type: "boolean", label: "Exudado purulento amigdalar" },
        { id: "rapido", type: "boolean", label: "Consulta r\xE1pida (\u2264 3 d\xEDas desde el inicio)" },
        { id: "inflamacion", type: "boolean", label: "Am\xEDgdalas muy inflamadas" },
        { id: "noTos", type: "boolean", label: "Ausencia de tos y de coriza" }
      ],
      compute: (v) => {
        const score = sum(v, ["fiebre", "exudado", "rapido", "inflamacion", "noTos"]);
        const prob = ["13\u201318 %", "13\u201318 %", "30\u201335 %", "30\u201335 %", "45\u201365 %", "62\u201365 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20135)",
          secondary: prob,
          secondaryLabel: "probabilidad de estreptococo",
          interpretation: score <= 1 ? "Baja probabilidad: manejo sintom\xE1tico." : score <= 3 ? "Probabilidad intermedia: valorar \xABwait and see\xBB (prescripci\xF3n diferida a las 48 h si no mejora)." : "Alta probabilidad: valorar antibi\xF3tico o test r\xE1pido.",
          level: score <= 1 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Little P, et al. Clinical score and rapid antigen detection test to guide antibiotic use for sore throats (PRISM). BMJ. 2013;347:f5806."
      ]
    },
    {
      id: "kocher",
      name: "Criterios de Kocher para artritis s\xE9ptica de cadera pedi\xE1trica",
      shortName: "Kocher",
      description: "Ayuda a diferenciar la artritis s\xE9ptica de la sinovitis transitoria en ni\xF1os con cadera dolorosa.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        { id: "noPeso", type: "boolean", label: "No apoya el peso sobre la pierna afectada" },
        { id: "fiebre", type: "boolean", label: "Fiebre > 38,5 \xB0C" },
        { id: "leucos", type: "boolean", label: "Leucocitos > 12.000/mm\xB3" },
        { id: "esr", type: "boolean", label: "VSG > 40 mm/h" }
      ],
      compute: (v) => {
        const score = sum(v, ["noPeso", "fiebre", "leucos", "esr"]);
        const prob = ["0,2 %", "3 %", "40 %", "93 %", "99 %"][score];
        return {
          main: String(score),
          mainUnit: "criterios (0\u20134)",
          secondary: prob,
          secondaryLabel: "probabilidad de artritis s\xE9ptica",
          interpretation: score <= 1 ? "Baja probabilidad: sugiere sinovitis transitoria; valorar seguimiento." : score <= 2 ? "Probabilidad intermedia: valorar artrocentesis diagn\xF3stica." : "Alta probabilidad de artritis s\xE9ptica: valoraci\xF3n por traumatolog\xEDa pedi\xE1trica, artrocentesis y antibioterapia emp\xEDrica.",
          level: score <= 1 ? "ok" : score <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Kocher MS, et al. Differentiating between septic arthritis and transient synovitis of the hip in children: an evidence-based clinical prediction algorithm. J Bone Joint Surg Am. 1999;81(12):1662-70."
      ]
    },
    {
      id: "meningitis-bacteriana",
      name: "Escala de meningitis bacteriana pedi\xE1trica (Nigrovic)",
      shortName: "BMS pedi\xE1trica",
      description: "Estima el riesgo de meningitis bacteriana en ni\xF1os con pleocitosis en el l\xEDquido cefalorraqu\xEDdeo.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        { id: "tincion", type: "boolean", label: "Tinci\xF3n de Gram del LCR positiva" },
        { id: "convulsion", type: "boolean", label: "Convulsi\xF3n al inicio o antes de la consulta" },
        { id: "proteinas", type: "boolean", label: "Prote\xEDnas en LCR \u2265 80 mg/dL" },
        { id: "neutrofilosLCR", type: "boolean", label: "Neutr\xF3filos absolutos en LCR \u2265 1.000/mm\xB3" },
        { id: "neutrofilosSangre", type: "boolean", label: "Neutr\xF3filos absolutos en sangre \u2265 10.000/mm\xB3" }
      ],
      compute: (v) => {
        const score = sum(v, ["tincion", "convulsion", "proteinas", "neutrofilosLCR", "neutrofilosSangre"]);
        return {
          main: String(score),
          mainUnit: "criterios (0\u20135)",
          interpretation: score === 0 ? "Riesgo muy bajo de meningitis bacteriana: en ni\xF1os de 29 d\xEDas a 19 a\xF1os con LCR pleocitario, un puntaje 0 tiene sensibilidad \u2248 100 % y valor predictivo negativo pr\xF3ximo al 100 %. Puede plantearse observaci\xF3n sin antibioterapia emp\xEDrica." : "Al menos un criterio positivo: iniciar antibioterapia emp\xEDrica y considerar ingreso.",
          level: score === 0 ? "ok" : "danger"
        };
      },
      notes: [
        "Solo aplicable a ni\xF1os \u2265 29 d\xEDas con al menos 10 leucocitos/mm\xB3 en LCR y buen aspecto.",
        "No aplicable si el paciente ha recibido antibi\xF3ticos previos, tiene inmunodepresi\xF3n, ha sido sometido a neurocirug\xEDa reciente o presenta un shunt del sistema nervioso central."
      ],
      references: [
        "Nigrovic LE, et al. Clinical prediction rule for identifying children with cerebrospinal fluid pleocytosis at very low risk of bacterial meningitis. JAMA. 2007;297(1):52-60."
      ]
    },
    {
      id: "ottawa-tobillo",
      name: "Reglas de Ottawa para tobillo y pie",
      shortName: "Ottawa tobillo/pie",
      description: "Identifica qu\xE9 pacientes con lesi\xF3n aguda de tobillo necesitan radiograf\xEDa.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        { id: "malolar", type: "boolean", label: "Dolor a la palpaci\xF3n en los \xFAltimos 6 cm del mal\xE9olo lateral o medial" },
        { id: "quinto", type: "boolean", label: "Dolor a la palpaci\xF3n en la base del 5.\xBA metatarsiano" },
        { id: "navicular", type: "boolean", label: "Dolor a la palpaci\xF3n en el hueso navicular" },
        { id: "apoyo", type: "boolean", label: "Incapacidad para dar 4 pasos (dos con cada pie) al llegar y en urgencias" }
      ],
      compute: (v) => {
        const tobillo = v.malolar === 1 || v.apoyo === 1;
        const pie = v.quinto === 1 || v.navicular === 1 || v.apoyo === 1;
        const rx = tobillo || pie;
        return {
          main: rx ? "Radiograf\xEDa indicada" : "Radiograf\xEDa no necesaria",
          interpretation: rx ? `Indicada radiograf\xEDa de ${tobillo ? "tobillo" : ""}${tobillo && pie ? " y " : ""}${pie ? "pie" : ""}.` : "Ning\xFAn criterio positivo: puede omitirse la radiograf\xEDa con seguridad razonable (sensibilidad \u2248 100 % para fractura cl\xEDnicamente significativa).",
          level: rx ? "warn" : "ok"
        };
      },
      references: [
        "Stiell IG, et al. Implementation of the Ottawa ankle rules. JAMA. 1994;271(11):827-32."
      ]
    },
    {
      id: "ottawa-rodilla",
      name: "Regla de Ottawa para rodilla",
      shortName: "Ottawa rodilla",
      description: "Identifica qu\xE9 pacientes con traumatismo agudo de rodilla necesitan radiograf\xEDa.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad \u2265 55 a\xF1os" },
        { id: "peronea", type: "boolean", label: "Dolor a la palpaci\xF3n en la cabeza del peron\xE9" },
        { id: "rotula", type: "boolean", label: "Dolor aislado a la palpaci\xF3n de la r\xF3tula" },
        { id: "flexion", type: "boolean", label: "Incapacidad para flexionar 90\xB0" },
        { id: "apoyo", type: "boolean", label: "Incapacidad para caminar 4 pasos inmediatamente y en urgencias" }
      ],
      compute: (v) => {
        const rx = sum(v, ["edad", "peronea", "rotula", "flexion", "apoyo"]) >= 1;
        return {
          main: rx ? "Radiograf\xEDa indicada" : "Radiograf\xEDa no necesaria",
          interpretation: rx ? "Al menos un criterio positivo: indicada radiograf\xEDa de rodilla." : "Ning\xFAn criterio positivo: puede omitirse la radiograf\xEDa (sensibilidad \u2248 98\u2013100 %).",
          level: rx ? "warn" : "ok"
        };
      },
      references: [
        "Stiell IG, et al. Prospective validation of a decision rule for the use of radiography in acute knee injuries. JAMA. 1996;275(8):611-5."
      ]
    },
    {
      id: "ccr",
      name: "Regla canadiense de la columna cervical (CCR)",
      shortName: "CCR",
      description: "Regla de decisi\xF3n para indicar imagen cervical en pacientes traumatizados alerta y estables.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        {
          id: "altoRiesgo",
          type: "boolean",
          label: "Factor de alto riesgo",
          description: "\u2265 65 a\xF1os, mecanismo peligroso (ca\xEDda \u2265 1 m/5 escalones, carga axial, colisi\xF3n de alta energ\xEDa, vuelco, atropello, deportes con impacto), o parestesias en extremidades.",
          noPoints: true
        },
        {
          id: "bajoRiesgo",
          type: "boolean",
          label: "\xBFCumple alg\xFAn factor de bajo riesgo que permita valorar la movilidad?",
          description: "Colisi\xF3n posterior simple, sedestaci\xF3n en urgencias, deambulaci\xF3n en cualquier momento, dolor cervical de inicio diferido o ausencia de dolor a la palpaci\xF3n l\xEDnea media.",
          noPoints: true
        },
        {
          id: "rotacion",
          type: "boolean",
          label: "\xBFPuede rotar activamente el cuello 45\xB0 a cada lado?",
          noPoints: true
        }
      ],
      compute: (v) => {
        if (v.altoRiesgo === 1)
          return {
            main: "Imagen indicada",
            interpretation: "Factor de alto riesgo presente: imagen cervical (TC preferente).",
            level: "danger"
          };
        if (v.bajoRiesgo !== 1)
          return {
            main: "Imagen indicada",
            interpretation: "Sin factor de bajo riesgo que permita valorar la movilidad: imagen cervical.",
            level: "danger"
          };
        if (v.rotacion !== 1)
          return {
            main: "Imagen indicada",
            interpretation: "No puede rotar activamente 45\xB0 a cada lado: imagen cervical.",
            level: "danger"
          };
        return {
          main: "Imagen no necesaria",
          interpretation: "Sin factores de alto riesgo, con al menos un factor de bajo riesgo y rotaci\xF3n cervical 45\xB0 a cada lado: puede retirarse la inmovilizaci\xF3n cervical con seguridad (sensibilidad \u2248 100 %).",
          level: "ok"
        };
      },
      notes: ["Aplicable a pacientes \u2265 16 a\xF1os, alerta (GCS 15), estables y no intoxicados, con traumatismo cervical cerrado en las \xFAltimas 48 h."],
      references: [
        "Stiell IG, et al. The Canadian C-Spine Rule for radiography in alert and stable trauma patients. JAMA. 2001;286(15):1841-8."
      ]
    },
    {
      id: "cchr",
      name: "Canadian CT Head Rule (CCHR)",
      shortName: "CCHR",
      description: "Regla para indicar tomograf\xEDa craneal en el traumatismo craneoencef\xE1lico leve.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        { id: "gcs2h", type: "boolean", label: "GCS < 15 a las 2 h del traumatismo", noPoints: true },
        { id: "fracturaAbierta", type: "boolean", label: "Sospecha de fractura craneal abierta o deprimida", noPoints: true },
        { id: "baseCraneo", type: "boolean", label: "Signos de fractura de base de cr\xE1neo (hemot\xEDmpano, ojos de mapache, otorrea/rinorrea de LCR, signo de Battle)", noPoints: true },
        { id: "vomitos", type: "boolean", label: "\u2265 2 episodios de v\xF3mitos", noPoints: true },
        { id: "edad65", type: "boolean", label: "Edad \u2265 65 a\xF1os", noPoints: true },
        { id: "amnesia", type: "boolean", label: "Amnesia retr\xF3grada > 30 min", noPoints: true },
        { id: "peligroso", type: "boolean", label: "Mecanismo peligroso (peat\xF3n atropellado, salir despedido de un veh\xEDculo, ca\xEDda > 1 m / 5 escalones)", noPoints: true }
      ],
      compute: (v) => {
        const alto = v.gcs2h === 1 || v.fracturaAbierta === 1 || v.baseCraneo === 1 || v.vomitos === 1 || v.edad65 === 1;
        const medio = !alto && (v.amnesia === 1 || v.peligroso === 1);
        return {
          main: alto ? "TC obligada" : medio ? "TC recomendada" : "TC no necesaria",
          interpretation: alto ? "Al menos un factor de alto riesgo: tomograf\xEDa craneal obligada." : medio ? "Factor de riesgo medio: tomograf\xEDa craneal recomendada para descartar lesi\xF3n cl\xEDnicamente significativa." : "Ning\xFAn factor: puede evitarse la tomograf\xEDa (regla con sensibilidad \u2248 100 % para lesi\xF3n que requiera intervenci\xF3n neuroquir\xFArgica).",
          level: alto ? "danger" : medio ? "warn" : "ok"
        };
      },
      notes: ["Aplicable a traumatismo craneoencef\xE1lico cerrado con GCS 13\u201315 y p\xE9rdida de conciencia testificada, amnesia o desorientaci\xF3n tras el traumatismo."],
      references: [
        "Stiell IG, et al. The Canadian CT Head Rule for patients with minor head injury. Lancet. 2001;357(9266):1391-6."
      ]
    },
    {
      id: "rosier",
      name: "Escala ROSIER (Recognition of Stroke in the Emergency Room)",
      shortName: "ROSIER",
      description: "Reconocimiento del ictus agudo en urgencias.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        { id: "sincope", type: "boolean", label: "P\xE9rdida de conciencia o s\xEDncope", points: -1 },
        { id: "convulsion", type: "boolean", label: "Actividad convulsiva", points: -1 },
        { id: "facial", type: "boolean", label: "Debilidad facial de nueva aparici\xF3n" },
        { id: "brazo", type: "boolean", label: "Debilidad asim\xE9trica del brazo de nueva aparici\xF3n" },
        { id: "pierna", type: "boolean", label: "Debilidad asim\xE9trica de la pierna de nueva aparici\xF3n" },
        { id: "habla", type: "boolean", label: "Alteraci\xF3n del habla de nueva aparici\xF3n" },
        { id: "visual", type: "boolean", label: "Defecto de campo visual de nueva aparici\xF3n" }
      ],
      compute: (v) => {
        const score = sum(v, ["sincope", "convulsion", "facial", "brazo", "pierna", "habla", "visual"]);
        return {
          main: String(score),
          mainUnit: "puntos (\u22122 a +5)",
          interpretation: score > 0 ? "ROSIER > 0: alta probabilidad de ictus. Activar c\xF3digo ictus y traslado a centro adecuado." : "ROSIER \u2264 0: ictus poco probable. Considerar diagn\xF3sticos alternativos (hipoglucemia, migra\xF1a, s\xEDncope, convulsi\xF3n, mareo perif\xE9rico).",
          level: score > 0 ? "danger" : "ok"
        };
      },
      notes: ["Descartar previamente hipoglucemia (glucemia capilar)."],
      references: [
        "Nor AM, et al. The Recognition of Stroke in the Emergency Room (ROSIER) scale. Lancet Neurol. 2005;4(11):727-34."
      ]
    },
    {
      id: "rems",
      name: "Puntuaci\xF3n REMS (Rapid Emergency Medicine Score)",
      shortName: "REMS",
      description: "Predice la mortalidad intrahospitalaria en pacientes que acuden a urgencias.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          dropdown: true,
          options: [
            { label: "< 45 a\xF1os", value: 0 },
            { label: "45\u201354", value: 2 },
            { label: "55\u201364", value: 3 },
            { label: "65\u201374", value: 5 },
            { label: "\u2265 75", value: 6 }
          ]
        },
        {
          id: "pam",
          type: "select",
          label: "Presi\xF3n arterial media (mmHg)",
          dropdown: true,
          options: [
            { label: "70\u2013109", value: 0 },
            { label: "50\u201369 o 110\u2013129", value: 2 },
            { label: "\u2265 160", value: 3 },
            { label: "130\u2013159", value: 3.0001 },
            { label: "< 50", value: 4 }
          ]
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia card\xEDaca",
          dropdown: true,
          options: [
            { label: "70\u2013109 lpm", value: 0 },
            { label: "110\u2013139 o 55\u201369", value: 2 },
            { label: "140\u2013179 o 40\u201354", value: 3 },
            { label: "\u2265 180 o \u2264 39", value: 4 }
          ]
        },
        {
          id: "fr",
          type: "select",
          label: "Frecuencia respiratoria",
          dropdown: true,
          options: [
            { label: "12\u201324 rpm", value: 0 },
            { label: "10\u201311 o 25\u201334", value: 1 },
            { label: "6\u20139", value: 2 },
            { label: "35\u201349", value: 3 },
            { label: "\u2265 50 o \u2264 5", value: 4 }
          ]
        },
        {
          id: "spo2",
          type: "select",
          label: "SpO\u2082",
          dropdown: true,
          options: [
            { label: "> 89 %", value: 0 },
            { label: "86\u201389 %", value: 1 },
            { label: "75\u201385 %", value: 3 },
            { label: "< 75 %", value: 4 }
          ]
        },
        {
          id: "gcs",
          type: "select",
          label: "Escala de coma de Glasgow",
          dropdown: true,
          options: [
            { label: "> 13", value: 0 },
            { label: "11\u201313", value: 1 },
            { label: "8\u201310", value: 2 },
            { label: "5\u20137", value: 3 },
            { label: "< 5", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = Math.round(sum(v, ["edad", "pam", "fc", "fr", "spo2", "gcs"]));
        const mort = score <= 2 ? "0,3 %" : score <= 5 ? "2 %" : score <= 9 ? "9 %" : score <= 11 ? "17 %" : score <= 15 ? "38 %" : "75 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201326)",
          secondary: mort,
          secondaryLabel: "mortalidad intrahospitalaria",
          interpretation: score <= 5 ? "Riesgo bajo de mortalidad." : score <= 11 ? "Riesgo intermedio: vigilancia estrecha." : "Riesgo alto: ingreso en cuidados intermedios o intensivos.",
          level: score <= 5 ? "ok" : score <= 11 ? "warn" : "danger"
        };
      },
      references: [
        "Olsson T, et al. Rapid Emergency Medicine Score: a new prognostic tool for in-hospital mortality in nonsurgical emergency department patients. J Intern Med. 2004;255(5):579-87."
      ]
    },
    {
      id: "cows",
      name: "Escala COWS (Clinical Opiate Withdrawal Scale)",
      shortName: "COWS",
      description: "Cuantifica la gravedad del s\xEDndrome de abstinencia de opioides.",
      category: "Alcohol y abstinencia",
      specialty: URG2,
      inputs: [
        { id: "fc", type: "select", label: "Frecuencia card\xEDaca (lpm)", options: [
          { label: "\u2264 80", value: 0 },
          { label: "81\u2013100", value: 1 },
          { label: "101\u2013120", value: 2 },
          { label: "> 120", value: 4 }
        ] },
        { id: "sudoracion", type: "select", label: "Sudoraci\xF3n", options: [
          { label: "Ausente", value: 0 },
          { label: "Escalofr\xEDos o rubor", value: 1 },
          { label: "Sudor visible en cara", value: 2 },
          { label: "Sudor corriendo por la cara", value: 3 },
          { label: "Sudor empapando la ropa", value: 4 }
        ] },
        { id: "inquietud", type: "select", label: "Inquietud", options: [
          { label: "Puede estarse quieto", value: 0 },
          { label: "Movimientos ocasionales", value: 1 },
          { label: "Cambia de postura frecuentemente", value: 3 },
          { label: "Incapaz de estarse quieto", value: 5 }
        ] },
        { id: "pupilas", type: "select", label: "Pupilas", options: [
          { label: "Normales o mi\xF3ticas", value: 0 },
          { label: "Posiblemente mayores de lo normal", value: 1 },
          { label: "Moderadamente dilatadas", value: 2 },
          { label: "Muy dilatadas", value: 5 }
        ] },
        { id: "huesos", type: "select", label: "Dolor \xF3seo o articular", options: [
          { label: "Ausente", value: 0 },
          { label: "Molestia leve", value: 1 },
          { label: "Dolor difuso", value: 2 },
          { label: "Frota articulaciones, no soporta el dolor", value: 4 }
        ] },
        { id: "rinorrea", type: "select", label: "Rinorrea o lagrimeo", options: [
          { label: "Ausente", value: 0 },
          { label: "Congesti\xF3n nasal o lagrimeo leve", value: 1 },
          { label: "Rinorrea o lagrimeo", value: 2 },
          { label: "Rinorrea y lagrimeo continuos", value: 4 }
        ] },
        { id: "gi", type: "select", label: "Molestias gastrointestinales", options: [
          { label: "Sin s\xEDntomas", value: 0 },
          { label: "Retortijones", value: 1 },
          { label: "N\xE1useas o heces blandas", value: 2 },
          { label: "V\xF3mitos o diarrea", value: 3 },
          { label: "V\xF3mitos y diarrea m\xFAltiples", value: 5 }
        ] },
        { id: "temblor", type: "select", label: "Temblor (manos extendidas)", options: [
          { label: "Sin temblor", value: 0 },
          { label: "Palpable, no visible", value: 1 },
          { label: "Fasciculaciones leves visibles", value: 2 },
          { label: "Temblor grueso extenso", value: 4 }
        ] },
        { id: "bostezos", type: "select", label: "Bostezos", options: [
          { label: "Ausentes", value: 0 },
          { label: "1\u20132 veces durante la evaluaci\xF3n", value: 1 },
          { label: "\u2265 3 veces", value: 2 },
          { label: "\u2265 3 veces por minuto", value: 4 }
        ] },
        { id: "ansiedad", type: "select", label: "Ansiedad o irritabilidad", options: [
          { label: "Ausente", value: 0 },
          { label: "Levemente ansioso", value: 1 },
          { label: "Moderadamente ansioso", value: 2 },
          { label: "Tan ansioso que dificulta la evaluaci\xF3n", value: 4 }
        ] },
        { id: "piloereccion", type: "select", label: "Piloerecci\xF3n", options: [
          { label: "Piel lisa", value: 0 },
          { label: "Cutis anserina en brazos", value: 3 },
          { label: "Piloerecci\xF3n evidente", value: 5 }
        ] }
      ],
      compute: (v) => {
        const score = sum(v, ["fc", "sudoracion", "inquietud", "pupilas", "huesos", "rinorrea", "gi", "temblor", "bostezos", "ansiedad", "piloereccion"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201348)",
          interpretation: score < 5 ? "Sin abstinencia significativa." : score < 13 ? "Abstinencia leve (5\u201312): valorar iniciar tratamiento con buprenorfina si procede." : score < 25 ? "Abstinencia moderada (13\u201324): apto para iniciar buprenorfina." : score < 37 ? "Abstinencia moderadamente intensa (25\u201336): tratamiento activo." : "Abstinencia intensa (\u2265 37): tratamiento activo y vigilancia estrecha.",
          level: score < 5 ? "ok" : score < 13 ? "info" : score < 25 ? "warn" : "danger"
        };
      },
      notes: ["Un COWS \u2265 8 indica abstinencia objetiva m\xEDnima suficiente para iniciar la inducci\xF3n con buprenorfina de forma segura."],
      references: [
        "Wesson DR, Ling W. The Clinical Opiate Withdrawal Scale (COWS). J Psychoactive Drugs. 2003;35(2):253-9."
      ]
    },
    {
      id: "mcmahon",
      name: "Puntuaci\xF3n de McMahon para la rabdomi\xF3lisis",
      shortName: "McMahon",
      description: "Predice la mortalidad o la necesidad de terapia renal sustitutiva en la rabdomi\xF3lisis.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 51 a\xF1os", value: 0 },
            { label: "51\u201370 a\xF1os", value: 1.5 },
            { label: "71\u201380 a\xF1os", value: 2.5 },
            { label: "> 80 a\xF1os", value: 3 }
          ]
        },
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          options: [
            { label: "Var\xF3n", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        {
          id: "etiologia",
          type: "boolean",
          label: "Etiolog\xEDa distinta de convulsi\xF3n, s\xEDncope, ejercicio, estatinas o mioaflibrada",
          points: 3
        },
        { id: "creatinina", type: "boolean", label: "Creatinina > 1,4 mg/dL", points: 1.5 },
        { id: "calcio", type: "boolean", label: "Calcio inicial < 7,5 mg/dL", points: 2 },
        { id: "ck", type: "boolean", label: "CK inicial > 40.000 U/L", points: 2 },
        { id: "fosfato", type: "boolean", label: "F\xF3sforo inicial > 4,0 mg/dL", points: 1.5 },
        { id: "bicarbonato", type: "boolean", label: "Bicarbonato < 19 mmol/L", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "sexo", "etiologia", "creatinina", "calcio", "ck", "fosfato", "bicarbonato"]);
        return {
          main: fmt(score, 1),
          mainUnit: "puntos",
          interpretation: score < 5 ? "Riesgo bajo (probabilidad de di\xE1lisis o muerte \u2248 3 %): puede manejarse fuera de cuidados intensivos con hidrataci\xF3n y vigilancia." : score <= 10 ? "Riesgo intermedio (\u2248 20 %): vigilancia estrecha y valoraci\xF3n por nefrolog\xEDa." : "Riesgo alto (> 50 %): considerar ingreso en cuidados intermedios o intensivos y preparaci\xF3n para terapia renal sustitutiva.",
          level: score < 5 ? "ok" : score <= 10 ? "warn" : "danger"
        };
      },
      references: [
        "McMahon GM, et al. A risk prediction score for kidney failure or mortality in rhabdomyolysis. JAMA Intern Med. 2013;173(19):1821-8."
      ]
    },
    {
      id: "bishop",
      name: "Puntuaci\xF3n de Bishop para la maduraci\xF3n cervical",
      shortName: "Bishop",
      description: "Estima la favorabilidad del cuello uterino para la inducci\xF3n del parto.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        {
          id: "dilatacion",
          type: "select",
          label: "Dilataci\xF3n",
          options: [
            { label: "0 cm", value: 0 },
            { label: "1\u20132 cm", value: 1 },
            { label: "3\u20134 cm", value: 2 },
            { label: "\u2265 5 cm", value: 3 }
          ]
        },
        {
          id: "borramiento",
          type: "select",
          label: "Borramiento",
          options: [
            { label: "0\u201330 %", value: 0 },
            { label: "40\u201350 %", value: 1 },
            { label: "60\u201370 %", value: 2 },
            { label: "\u2265 80 %", value: 3 }
          ]
        },
        {
          id: "estacion",
          type: "select",
          label: "Estaci\xF3n (planos de Hodge)",
          options: [
            { label: "\u22123", value: 0 },
            { label: "\u22122", value: 1 },
            { label: "\u22121 / 0", value: 2 },
            { label: "+1 / +2", value: 3 }
          ]
        },
        {
          id: "consistencia",
          type: "select",
          label: "Consistencia",
          options: [
            { label: "Firme", value: 0 },
            { label: "Intermedia", value: 1 },
            { label: "Blanda", value: 2 }
          ]
        },
        {
          id: "posicion",
          type: "select",
          label: "Posici\xF3n del cuello",
          options: [
            { label: "Posterior", value: 0 },
            { label: "Intermedia", value: 1 },
            { label: "Anterior", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["dilatacion", "borramiento", "estacion", "consistencia", "posicion"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201313)",
          interpretation: score <= 5 ? "Cuello desfavorable: la inducci\xF3n probablemente requerir\xE1 maduraci\xF3n cervical previa (prostaglandinas o bal\xF3n)." : score <= 8 ? "Favorabilidad intermedia: valorar inducci\xF3n con oxitocina y amniotom\xEDa seg\xFAn protocolo." : "Cuello favorable (\u2265 9): la inducci\xF3n con oxitocina tiene alta probabilidad de \xE9xito.",
          level: score <= 5 ? "warn" : score <= 8 ? "info" : "ok"
        };
      },
      references: [
        "Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964;24:266-8."
      ]
    },
    {
      id: "homa-ir",
      name: "HOMA-IR (resistencia a la insulina)",
      shortName: "HOMA-IR",
      description: "Estima la resistencia a la insulina en ayunas.",
      category: CAT_TOX2,
      specialty: URG2,
      inputs: [
        { id: "glucemia", type: "number", label: "Glucemia en ayunas", unit: "mg/dL", min: 30, max: 500, step: 1 },
        { id: "insulina", type: "number", label: "Insulina en ayunas", unit: "\xB5U/mL", min: 0, max: 500, step: 0.1 }
      ],
      compute: (v) => {
        const glucoseMmol = v.glucemia / 18;
        const homa = v.insulina * glucoseMmol / 22.5;
        return {
          main: fmt(homa, 2),
          mainUnit: "HOMA-IR",
          interpretation: homa < 2.5 ? "HOMA-IR < 2,5: sensibilidad a la insulina en rango habitual." : homa < 3.8 ? "Resistencia leve-moderada: valorar estilo de vida y factores de riesgo cardiometab\xF3lico." : "Resistencia significativa: alto riesgo de diabetes tipo 2 y s\xEDndrome metab\xF3lico. Intervenci\xF3n sobre estilo de vida y valoraci\xF3n de tratamiento.",
          level: homa < 2.5 ? "ok" : homa < 3.8 ? "warn" : "danger",
          details: ["F\xF3rmula: HOMA-IR = insulina \xD7 glucosa (mmol/L) / 22,5."]
        };
      },
      notes: ["Los puntos de corte var\xEDan por poblaci\xF3n; usar los del laboratorio de referencia."],
      references: [
        "Matthews DR, et al. Homeostasis model assessment: insulin resistance and beta-cell function from fasting plasma glucose and insulin concentrations in man. Diabetologia. 1985;28(7):412-9."
      ]
    },
    {
      id: "hba1c-glucosa",
      name: "Glucosa promedio estimada a partir de la HbA1c",
      shortName: "eAG",
      description: "Convierte la hemoglobina glucosilada en glucemia media estimada.",
      category: CAT_TOX2,
      specialty: URG2,
      inputs: [
        { id: "hba1c", type: "number", label: "HbA1c", unit: "%", min: 4, max: 20, step: 0.1 }
      ],
      compute: (v) => {
        const eag = 28.7 * v.hba1c - 46.7;
        return {
          main: fmt(eag, 0),
          mainUnit: "mg/dL (glucosa media estimada)",
          interpretation: v.hba1c < 5.7 ? "HbA1c normal (< 5,7 %)." : v.hba1c < 6.5 ? "Prediabetes (5,7\u20136,4 %): recomendar cambios de estilo de vida." : "Rango de diabetes (\u2265 6,5 %): valorar objetivos individualizados de control (habitualmente HbA1c < 7 %, m\xE1s estricto o menos seg\xFAn el paciente).",
          level: v.hba1c < 5.7 ? "ok" : v.hba1c < 6.5 ? "warn" : "danger",
          details: ["F\xF3rmula: eAG (mg/dL) = 28,7 \xD7 HbA1c \u2212 46,7 (Nathan 2008)."]
        };
      },
      references: [
        "Nathan DM, et al. Translating the A1C assay into estimated average glucose values. Diabetes Care. 2008;31(8):1473-8."
      ]
    },
    {
      id: "forrest",
      name: "Clasificaci\xF3n de Forrest para la hemorragia digestiva alta",
      shortName: "Forrest",
      description: "Estratifica el riesgo de resangrado y mortalidad en la \xFAlcera p\xE9ptica sangrante seg\xFAn los hallazgos endosc\xF3picos.",
      category: CAT_URG2,
      specialty: URG2,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "Hallazgo endosc\xF3pico",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Ia \u2014 Sangrado arterial puls\xE1til", value: 1 },
            { label: "Ib \u2014 Sangrado en s\xE1bana (venoso)", value: 2 },
            { label: "IIa \u2014 Vaso visible no sangrante", value: 3 },
            { label: "IIb \u2014 Co\xE1gulo adherido", value: 4 },
            { label: "IIc \u2014 Mancha plana pigmentada (hematina)", value: 5 },
            { label: "III \u2014 Base limpia sin estigmas", value: 6 }
          ]
        }
      ],
      compute: (v) => {
        const g = v.grado ?? 6;
        const info = [
          "",
          { r: "55 %", m: "11 %", a: "Alto riesgo \u2014 tratamiento endosc\xF3pico obligado", level: "danger" },
          { r: "55 %", m: "11 %", a: "Alto riesgo \u2014 tratamiento endosc\xF3pico obligado", level: "danger" },
          { r: "43 %", m: "11 %", a: "Alto riesgo \u2014 tratamiento endosc\xF3pico", level: "danger" },
          { r: "22 %", m: "7 %", a: "Riesgo intermedio \u2014 tratamiento endosc\xF3pico", level: "warn" },
          { r: "10 %", m: "3 %", a: "Riesgo bajo \u2014 no requiere terapia endosc\xF3pica", level: "ok" },
          { r: "5 %", m: "2 %", a: "Riesgo muy bajo \u2014 alta precoz posible", level: "ok" }
        ][g];
        const labels = ["", "Ia", "Ib", "IIa", "IIb", "IIc", "III"];
        return {
          main: `Forrest ${labels[g]}`,
          secondary: info.r,
          secondaryLabel: "riesgo de resangrado",
          interpretation: `${info.a}. Mortalidad \u2248 ${info.m}. En Forrest I y IIa se recomienda tratamiento endosc\xF3pico (inyecci\xF3n + m\xE9todo t\xE9rmico o clip) e IBP intravenoso en perfusi\xF3n.`,
          level: info.level
        };
      },
      references: [
        "Forrest JA, et al. Endoscopy in gastrointestinal bleeding. Lancet. 1974;2(7877):394-7."
      ]
    }
  ];

  // src/calculators/medicina-familia.ts
  var CAT_GENERAL = "Medicina interna y familiar";
  var CAT_GERIA = "Geriatr\xEDa, fragilidad y salud mental";
  var CAT_DIABETES = "Endocrino, obesidad y diabetes";
  var CAT_GASTRO = "Hepato-digestivo y nutrici\xF3n";
  var CAT_HEMATO = "Hematolog\xEDa y oncolog\xEDa";
  var CAT_CARDIO = "S\xEDndrome coronario agudo y dolor tor\xE1cico";
  var CAT_TEV3 = "Tromboembolismo venoso";
  var CAT_RESPI = "Respiratorio cr\xEDtico y ventilaci\xF3n";
  var FAM = ["Medicina Familiar"];
  var escala9 = (items) => items.map(([value, label]) => ({ label: `${value} \u2014 ${label}`, value }));
  var medicinaFamilia = [
    {
      id: "bristol",
      name: "Escala de heces de Bristol",
      shortName: "Bristol",
      description: "Clasifica la consistencia de las heces en siete tipos; \xFAtil en estre\xF1imiento, diarrea y s\xEDndrome del intestino irritable.",
      category: CAT_GASTRO,
      specialty: FAM,
      inputs: [
        {
          id: "tipo",
          type: "select",
          label: "Tipo de heces",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Tipo 1 \u2014 Bolas duras separadas, como nueces", value: 1 },
            { label: "Tipo 2 \u2014 Salchicha compuesta de fragmentos", value: 2 },
            { label: "Tipo 3 \u2014 Salchicha con grietas en la superficie", value: 3 },
            { label: "Tipo 4 \u2014 Salchicha lisa y blanda", value: 4 },
            { label: "Tipo 5 \u2014 Fragmentos blandos con bordes definidos", value: 5 },
            { label: "Tipo 6 \u2014 Fragmentos blandos y esponjosos", value: 6 },
            { label: "Tipo 7 \u2014 L\xEDquido sin fragmentos s\xF3lidos", value: 7 }
          ]
        }
      ],
      compute: (v) => {
        const t = v.tipo ?? 4;
        const banda = t <= 2 ? "Estre\xF1imiento" : t <= 5 ? "Normal" : "Diarrea";
        const detalle = t <= 2 ? "Sugiere estre\xF1imiento: aumentar fibra, l\xEDquidos y actividad f\xEDsica; valorar laxantes si es persistente." : t <= 4 ? "Tr\xE1nsito y consistencia normales." : t === 5 ? "Blandas: puede indicar tr\xE1nsito ligeramente acelerado; valorar dieta." : t === 6 ? "Sugiere diarrea: valorar hidrataci\xF3n, dieta y factores desencadenantes." : "Diarrea l\xEDquida: reposici\xF3n hidroelectrol\xEDtica; buscar causa infecciosa, medicamentosa o funcional.";
        return {
          main: `Tipo ${t}`,
          secondary: banda,
          interpretation: detalle,
          level: t <= 2 ? "warn" : t <= 5 ? "ok" : t === 6 ? "warn" : "danger"
        };
      },
      references: [
        "Lewis SJ, Heaton KW. Stool form scale as a useful guide to intestinal transit time. Scand J Gastroenterol. 1997;32(9):920-4."
      ]
    },
    {
      id: "clinical-frailty",
      name: "Escala de fragilidad cl\xEDnica (Rockwood CFS)",
      shortName: "Rockwood CFS",
      description: "Cuantifica el grado de fragilidad cl\xEDnica en pacientes \u2265 65 a\xF1os.",
      category: CAT_GERIA,
      specialty: FAM,
      inputs: [
        {
          id: "nivel",
          type: "select",
          label: "Grado de fragilidad",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "1 \u2014 Muy en forma: robusto, activo, motivado", value: 1 },
            { label: "2 \u2014 En forma: sin enfermedad activa; ejercicio ocasional", value: 2 },
            { label: "3 \u2014 Se mantiene bien: enfermedades controladas; no realiza ejercicio regular", value: 3 },
            { label: "4 \u2014 Vulnerable: no depende de otros, pero los s\xEDntomas limitan la actividad", value: 4 },
            { label: "5 \u2014 Fragilidad leve: dependencia parcial en actividades instrumentales", value: 5 },
            { label: "6 \u2014 Fragilidad moderada: necesita ayuda en actividades exteriores y algunas del hogar", value: 6 },
            { label: "7 \u2014 Fragilidad grave: dependencia total para el autocuidado; estable", value: 7 },
            { label: "8 \u2014 Fragilidad muy grave: dependencia total; enfermedad terminal probable en < 6 meses", value: 8 },
            { label: "9 \u2014 Enfermedad terminal: expectativa de vida < 6 meses", value: 9 }
          ]
        }
      ],
      compute: (v) => {
        const n = v.nivel ?? 1;
        return {
          main: `CFS ${n}`,
          interpretation: n <= 3 ? "No fr\xE1gil: buen pron\xF3stico funcional; expectativa de recuperaci\xF3n tras enfermedad aguda." : n === 4 ? "Vulnerable: mayor riesgo de deterioro con enfermedad aguda; anticipar apoyo." : n <= 6 ? "Fragilidad leve-moderada: mayor riesgo de deterioro funcional, delirium y mortalidad. Valorar intensidad del tratamiento y objetivos con el paciente y la familia." : n <= 8 ? "Fragilidad grave o muy grave: enfoque paliativo y confortable; los tratamientos invasivos ofrecen escaso beneficio." : "Enfermedad terminal: cuidados paliativos y planificaci\xF3n del final de vida.",
          level: n <= 3 ? "ok" : n <= 5 ? "warn" : "danger"
        };
      },
      notes: [
        "Aplicable a pacientes \u2265 65 a\xF1os; el juicio cl\xEDnico prevalece.",
        "Muy usada durante la pandemia COVID-19 para orientar la toma de decisiones sobre soporte vital avanzado."
      ],
      references: [
        "Rockwood K, et al. A global clinical measure of fitness and frailty in elderly people. CMAJ. 2005;173(5):489-95."
      ]
    },
    {
      id: "cdr",
      name: "Escala cl\xEDnica de demencia (CDR)",
      shortName: "CDR",
      description: "Estadifica la gravedad cl\xEDnica de la demencia mediante seis dominios.",
      category: CAT_GERIA,
      specialty: FAM,
      inputs: [
        ...[
          ["memoria", "Memoria"],
          ["orientacion", "Orientaci\xF3n"],
          ["juicio", "Juicio y resoluci\xF3n de problemas"],
          ["asuntos", "Asuntos comunitarios"],
          ["hogar", "Hogar y aficiones"],
          ["cuidado", "Cuidado personal"]
        ].map(([id, label]) => ({
          id,
          type: "select",
          label,
          dropdown: true,
          options: [
            { label: "0 \u2014 Sin alteraci\xF3n", value: 0 },
            { label: "0,5 \u2014 Cuestionable", value: 0.5 },
            { label: "1 \u2014 Leve", value: 1 },
            { label: "2 \u2014 Moderada", value: 2 },
            { label: "3 \u2014 Grave", value: 3 }
          ]
        }))
      ],
      compute: (v) => {
        const memoria = v.memoria ?? 0;
        const secundarios = ["orientacion", "juicio", "asuntos", "hogar", "cuidado"].map((k) => v[k] ?? 0);
        const cdr = memoria;
        const acuerdo = secundarios.filter((x) => x === memoria).length;
        const global = acuerdo >= 3 ? cdr : (memoria + secundarios.reduce((a, b) => a + b, 0)) / 6;
        const round = (x) => {
          if (x <= 0.25) return 0;
          if (x <= 0.75) return 0.5;
          if (x <= 1.5) return 1;
          if (x <= 2.5) return 2;
          return 3;
        };
        const g = round(global);
        const etiqueta = { 0: "Sin demencia", 0.5: "Deterioro cognitivo cuestionable", 1: "Demencia leve", 2: "Demencia moderada", 3: "Demencia grave" }[g];
        return {
          main: `CDR ${g}`,
          secondary: etiqueta,
          interpretation: g === 0 ? "Sin demencia cl\xEDnica." : g === 0.5 ? "Deterioro cognitivo leve o cuestionable: seguimiento y evaluaci\xF3n neuropsicol\xF3gica." : g === 1 ? "Demencia leve: apoyo a la persona y a la familia, valoraci\xF3n de tratamiento espec\xEDfico." : g === 2 ? "Demencia moderada: dependencia creciente; planificar cuidados y decisiones anticipadas." : "Demencia grave: cuidados de apoyo intensivos; valorar cuidados paliativos.",
          level: g === 0 ? "ok" : g <= 1 ? "warn" : "danger"
        };
      },
      notes: [
        "Se usa el algoritmo est\xE1ndar: la memoria es el dominio principal; si 3 o m\xE1s secundarios coinciden con el valor de memoria, el CDR global es ese valor."
      ],
      references: [
        "Morris JC. The Clinical Dementia Rating (CDR): current version and scoring rules. Neurology. 1993;43(11):2412-4."
      ]
    },
    {
      id: "gds-15",
      name: "Escala de depresi\xF3n geri\xE1trica de Yesavage (GDS-15)",
      shortName: "GDS-15",
      description: "Cribado de depresi\xF3n en personas mayores mediante 15 preguntas de respuesta s\xED/no.",
      category: CAT_GERIA,
      specialty: FAM,
      inputs: [
        { id: "q1", type: "boolean", label: "\xBFEst\xE1 satisfecho/a con su vida?", labels: ["S\xED", "No"] },
        { id: "q2", type: "boolean", label: "\xBFHa renunciado a muchas actividades e intereses?", labels: ["No", "S\xED"] },
        { id: "q3", type: "boolean", label: "\xBFSiente que su vida est\xE1 vac\xEDa?", labels: ["No", "S\xED"] },
        { id: "q4", type: "boolean", label: "\xBFSe aburre a menudo?", labels: ["No", "S\xED"] },
        { id: "q5", type: "boolean", label: "\xBFEst\xE1 de buen humor la mayor parte del tiempo?", labels: ["S\xED", "No"] },
        { id: "q6", type: "boolean", label: "\xBFTiene miedo de que le suceda algo malo?", labels: ["No", "S\xED"] },
        { id: "q7", type: "boolean", label: "\xBFSe siente feliz la mayor parte del tiempo?", labels: ["S\xED", "No"] },
        { id: "q8", type: "boolean", label: "\xBFSe siente a menudo indefenso/a?", labels: ["No", "S\xED"] },
        { id: "q9", type: "boolean", label: "\xBFPrefiere quedarse en casa a salir a hacer cosas nuevas?", labels: ["No", "S\xED"] },
        { id: "q10", type: "boolean", label: "\xBFCree que tiene m\xE1s problemas de memoria que los dem\xE1s?", labels: ["No", "S\xED"] },
        { id: "q11", type: "boolean", label: "\xBFCree que es maravilloso estar vivo/a?", labels: ["S\xED", "No"] },
        { id: "q12", type: "boolean", label: "\xBFSe siente in\xFAtil tal como est\xE1 ahora?", labels: ["No", "S\xED"] },
        { id: "q13", type: "boolean", label: "\xBFSe siente lleno/a de energ\xEDa?", labels: ["S\xED", "No"] },
        { id: "q14", type: "boolean", label: "\xBFCree que su situaci\xF3n es desesperada?", labels: ["No", "S\xED"] },
        { id: "q15", type: "boolean", label: "\xBFCree que la mayor\xEDa de la gente est\xE1 mejor que usted?", labels: ["No", "S\xED"] }
      ],
      compute: (v) => {
        const score = sum(v, Array.from({ length: 15 }, (_, i) => `q${i + 1}`));
        return {
          main: String(score),
          mainUnit: "puntos (0\u201315)",
          interpretation: score <= 4 ? "Sin depresi\xF3n: puntuaci\xF3n en rango normal." : score <= 8 ? "Depresi\xF3n leve o probable: valorar entrevista cl\xEDnica estructurada y seguimiento." : score <= 11 ? "Depresi\xF3n moderada: evaluaci\xF3n diagn\xF3stica y valorar tratamiento." : "Depresi\xF3n grave: iniciar tratamiento y valorar riesgo autol\xEDtico.",
          level: score <= 4 ? "ok" : score <= 8 ? "warn" : "danger"
        };
      },
      references: [
        "Sheikh JI, Yesavage JA. Geriatric Depression Scale (GDS): recent evidence and development of a shorter version. Clin Gerontol. 1986;5:165-73."
      ]
    },
    {
      id: "ham-a",
      name: "Escala de ansiedad de Hamilton (HAM-A)",
      shortName: "HAM-A",
      description: "Cuantifica la gravedad de los s\xEDntomas de ansiedad mediante 14 dimensiones.",
      category: CAT_GERIA,
      specialty: FAM,
      inputs: [
        "Estado de \xE1nimo ansioso",
        "Tensi\xF3n",
        "Miedos",
        "Insomnio",
        "Funci\xF3n intelectual (concentraci\xF3n)",
        "\xC1nimo depresivo",
        "S\xEDntomas som\xE1ticos musculares",
        "S\xEDntomas som\xE1ticos sensoriales",
        "S\xEDntomas cardiovasculares",
        "S\xEDntomas respiratorios",
        "S\xEDntomas gastrointestinales",
        "S\xEDntomas genitourinarios",
        "S\xEDntomas auton\xF3micos",
        "Comportamiento en la entrevista"
      ].map((label, i) => ({
        id: `d${i + 1}`,
        type: "select",
        label,
        dropdown: true,
        options: escala9([
          [0, "Ausente"],
          [1, "Leve"],
          [2, "Moderado"],
          [3, "Grave"],
          [4, "Muy grave / incapacitante"]
        ])
      })),
      compute: (v) => {
        const score = sum(v, Array.from({ length: 14 }, (_, i) => `d${i + 1}`));
        return {
          main: String(score),
          mainUnit: "puntos (0\u201356)",
          interpretation: score < 8 ? "Sin ansiedad cl\xEDnicamente significativa." : score <= 14 ? "Ansiedad leve." : score <= 23 ? "Ansiedad moderada." : "Ansiedad grave: valorar tratamiento farmacol\xF3gico y derivaci\xF3n.",
          level: score < 8 ? "ok" : score <= 14 ? "info" : score <= 23 ? "warn" : "danger"
        };
      },
      references: [
        "Hamilton M. The assessment of anxiety states by rating. Br J Med Psychol. 1959;32(1):50-5."
      ]
    },
    {
      id: "bri",
      name: "\xCDndice de redondez corporal (BRI)",
      shortName: "BRI",
      description: "Estima el porcentaje de grasa corporal y grasa visceral a partir del per\xEDmetro abdominal y la talla.",
      category: CAT_DIABETES,
      specialty: FAM,
      inputs: [
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 100, max: 220, step: 0.5 },
        { id: "cintura", type: "number", label: "Per\xEDmetro abdominal (a la altura del ombligo)", unit: "cm", min: 40, max: 200, step: 0.5 }
      ],
      compute: (v) => {
        const talla_m = v.talla / 100;
        const cintura_m = v.cintura / 100;
        const excentricidad2 = 1 - Math.pow(cintura_m / (2 * Math.PI * (talla_m / 2)), 2);
        const bri = 364.2 - 365.5 * Math.sqrt(Math.max(0, excentricidad2));
        const banda = bri < 3.41 ? "muy bajo" : bri < 4.45 ? "bajo" : bri < 5.46 ? "medio" : bri < 6.91 ? "alto" : "muy alto";
        return {
          main: fmt(bri, 2),
          mainUnit: "BRI",
          secondary: banda,
          secondaryLabel: "quintil de riesgo cardiometab\xF3lico",
          interpretation: banda === "muy bajo" || banda === "bajo" ? "Riesgo cardiometab\xF3lico bajo seg\xFAn distribuci\xF3n corporal." : banda === "medio" ? "Riesgo cardiometab\xF3lico intermedio." : "Distribuci\xF3n corporal asociada a mayor riesgo cardiometab\xF3lico: valorar intervenci\xF3n sobre h\xE1bitos.",
          level: banda === "muy bajo" || banda === "bajo" ? "ok" : banda === "medio" ? "warn" : "danger"
        };
      },
      references: [
        "Thomas DM, et al. Relationships between body roundness with body fat and visceral adipose tissue emerging from a new geometrical model. Obesity (Silver Spring). 2013;21(11):2264-71."
      ]
    },
    {
      id: "findrisc",
      name: "FINDRISC \u2014 Riesgo de diabetes tipo 2 a 10 a\xF1os",
      shortName: "FINDRISC",
      description: "Cribado del riesgo de diabetes tipo 2 en 10 a\xF1os basado en factores cl\xEDnicos.",
      category: CAT_DIABETES,
      specialty: FAM,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 45 a\xF1os", value: 0 },
            { label: "45\u201354 a\xF1os", value: 2 },
            { label: "55\u201364 a\xF1os", value: 3 },
            { label: "> 64 a\xF1os", value: 4 }
          ]
        },
        {
          id: "imc",
          type: "select",
          label: "\xCDndice de masa corporal",
          options: [
            { label: "< 25 kg/m\xB2", value: 0 },
            { label: "25\u201330 kg/m\xB2", value: 1 },
            { label: "> 30 kg/m\xB2", value: 3 }
          ]
        },
        {
          id: "cintura",
          type: "select",
          label: "Per\xEDmetro abdominal",
          dropdown: true,
          options: [
            { label: "Var\xF3n < 94 cm o mujer < 80 cm", value: 0 },
            { label: "Var\xF3n 94\u2013102 cm o mujer 80\u201388 cm", value: 3 },
            { label: "Var\xF3n > 102 cm o mujer > 88 cm", value: 4 }
          ]
        },
        { id: "actividad", type: "boolean", label: "Actividad f\xEDsica < 30 min al d\xEDa", points: 2 },
        {
          id: "dieta",
          type: "select",
          label: "Consumo diario de verduras, frutas u hortalizas",
          options: [
            { label: "Todos los d\xEDas", value: 0 },
            { label: "No todos los d\xEDas", value: 1 }
          ]
        },
        { id: "medicacion", type: "boolean", label: "Toma medicaci\xF3n para la hipertensi\xF3n", points: 2 },
        { id: "glucemia", type: "boolean", label: "Antecedente de glucemia alta (embarazo, chequeo, enfermedad)", points: 5 },
        {
          id: "familia",
          type: "select",
          label: "Familiares con diabetes",
          options: [
            { label: "No", value: 0 },
            { label: "Abuelos, t\xEDos o primos", value: 3 },
            { label: "Padres, hermanos o hijos", value: 5 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "imc", "cintura", "actividad", "dieta", "medicacion", "glucemia", "familia"]);
        const riesgo2 = score < 7 ? "bajo (\u2248 1 %)" : score < 12 ? "ligeramente elevado (\u2248 4 %)" : score < 15 ? "moderado (\u2248 17 %)" : score < 21 ? "alto (\u2248 33 %)" : "muy alto (\u2248 50 %)";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201326)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de diabetes en 10 a\xF1os",
          interpretation: score < 12 ? "Riesgo bajo o ligeramente elevado: mantener estilo de vida saludable y reevaluar en 3\u20135 a\xF1os." : score < 15 ? "Riesgo moderado: intervenci\xF3n sobre estilo de vida y valorar glucemia basal." : "Riesgo alto o muy alto: glucemia basal y/o HbA1c, intervenci\xF3n intensiva sobre estilo de vida.",
          level: score < 12 ? "ok" : score < 15 ? "warn" : "danger"
        };
      },
      references: [
        "Lindstr\xF6m J, Tuomilehto J. The diabetes risk score. Diabetes Care. 2003;26(3):725-31."
      ]
    },
    {
      id: "fli",
      name: "Fatty Liver Index (FLI)",
      shortName: "FLI",
      description: "Predice la presencia de esteatosis hep\xE1tica por criterios ecogr\xE1ficos.",
      category: CAT_GASTRO,
      specialty: FAM,
      inputs: [
        { id: "tg", type: "number", label: "Triglic\xE9ridos", unit: "mg/dL", min: 30, max: 1e3, step: 1 },
        { id: "imc", type: "number", label: "IMC", unit: "kg/m\xB2", min: 15, max: 60, step: 0.1 },
        { id: "ggt", type: "number", label: "GGT", unit: "U/L", min: 5, max: 1500, step: 1 },
        { id: "cintura", type: "number", label: "Per\xEDmetro abdominal", unit: "cm", min: 40, max: 200, step: 0.5 }
      ],
      compute: (v) => {
        const L = 0.953 * Math.log(v.tg) + 0.139 * v.imc + 0.718 * Math.log(v.ggt) + 0.053 * v.cintura - 15.745;
        const fli = Math.exp(L) / (1 + Math.exp(L)) * 100;
        return {
          main: fmt(fli, 0),
          mainUnit: "FLI (0\u2013100)",
          interpretation: fli < 30 ? "FLI < 30: h\xEDgado graso razonablemente descartado (sensibilidad \u2248 87 %)." : fli < 60 ? "FLI 30\u201359: no concluyente; interpretar con la cl\xEDnica y los factores de riesgo metab\xF3licos." : "FLI \u2265 60: esteatosis hep\xE1tica altamente probable (especificidad \u2248 86 %). Valorar estudio adicional (elastograf\xEDa, control metab\xF3lico).",
          level: fli < 30 ? "ok" : fli < 60 ? "warn" : "danger"
        };
      },
      references: [
        "Bedogni G, et al. The Fatty Liver Index: a simple and accurate predictor of hepatic steatosis in the general population. BMC Gastroenterol. 2006;6:33."
      ]
    },
    {
      id: "cdai",
      name: "CDAI \u2014 \xCDndice de actividad de la enfermedad de Crohn",
      shortName: "CDAI",
      description: "Cuantifica la actividad de la enfermedad de Crohn.",
      category: CAT_GASTRO,
      specialty: FAM,
      inputs: [
        { id: "deposiciones", type: "number", label: "N\xFAmero de deposiciones l\xEDquidas o pastosas en 7 d\xEDas", min: 0, max: 200, step: 1 },
        {
          id: "dolor",
          type: "number",
          label: "Dolor abdominal (suma diaria 0\u20133, 7 d\xEDas)",
          description: "0 ninguno \xB7 1 leve \xB7 2 moderado \xB7 3 grave",
          min: 0,
          max: 21,
          step: 1
        },
        {
          id: "bienestar",
          type: "number",
          label: "Bienestar general (suma diaria 0\u20134, 7 d\xEDas)",
          description: "0 bien \xB7 1 regular \xB7 2 mal \xB7 3 muy mal \xB7 4 terrible",
          min: 0,
          max: 28,
          step: 1
        },
        {
          id: "complicaciones",
          type: "number",
          label: "N\xFAmero de complicaciones (artritis, iritis/uve\xEDtis, eritema/aftas, fisura/f\xEDstula, fiebre)",
          min: 0,
          max: 6,
          step: 1
        },
        { id: "antidiarreicos", type: "boolean", label: "Uso de antidiarreicos" },
        {
          id: "masa",
          type: "select",
          label: "Masa abdominal",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Dudosa", value: 2 },
            { label: "Presente", value: 5 }
          ]
        },
        { id: "hto", type: "number", label: "Diferencia del hematocrito respecto al esperado", unit: "puntos %", min: -20, max: 20, step: 1 },
        { id: "pesoDif", type: "number", label: "Porcentaje de desviaci\xF3n del peso respecto al est\xE1ndar", unit: "%", min: -50, max: 50, step: 1 }
      ],
      compute: (v) => {
        const score = 2 * v.deposiciones + 5 * v.dolor + 7 * v.bienestar + 20 * v.complicaciones + 30 * (v.antidiarreicos ?? 0) + 10 * (v.masa ?? 0) + 6 * v.hto + v.pesoDif;
        return {
          main: fmt(score, 0),
          mainUnit: "CDAI",
          interpretation: score < 150 ? "Enfermedad en remisi\xF3n (< 150)." : score < 220 ? "Actividad leve (150\u2013219)." : score < 450 ? "Actividad moderada (220\u2013449)." : "Actividad grave (\u2265 450): valorar hospitalizaci\xF3n.",
          level: score < 150 ? "ok" : score < 220 ? "info" : score < 450 ? "warn" : "danger"
        };
      },
      references: [
        "Best WR, et al. Development of a Crohn's disease activity index. Gastroenterology. 1976;70(3):439-44."
      ]
    },
    {
      id: "ecog",
      name: "Estado funcional ECOG",
      shortName: "ECOG",
      description: "Cuantifica el estado funcional del paciente oncol\xF3gico; gu\xEDa la tolerancia a tratamientos.",
      category: CAT_HEMATO,
      specialty: FAM,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "Grado ECOG",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "0 \u2014 Totalmente activo, sin restricciones", value: 0 },
            { label: "1 \u2014 Restringido para actividad f\xEDsica extenuante, ambulatorio", value: 1 },
            { label: "2 \u2014 Ambulatorio, autocuidado; no puede trabajar; en pie > 50 % del d\xEDa", value: 2 },
            { label: "3 \u2014 Autocuidado limitado; encamado o en silla > 50 % del d\xEDa", value: 3 },
            { label: "4 \u2014 Completamente incapacitado; encamado o en silla", value: 4 },
            { label: "5 \u2014 Fallecido", value: 5 }
          ]
        }
      ],
      compute: (v) => {
        const g = v.grado ?? 0;
        return {
          main: `ECOG ${g}`,
          interpretation: g <= 1 ? "Estado funcional preservado: apto para tratamientos oncol\xF3gicos habituales." : g === 2 ? "Estado funcional intermedio: valorar caso a caso la intensidad del tratamiento." : g === 3 ? "Estado funcional muy limitado: en general no se toleran los tratamientos oncol\xF3gicos activos; priorizar control sintom\xE1tico." : g === 4 ? "Encamado: tratamiento paliativo y confortable." : "Fallecido.",
          level: g <= 1 ? "ok" : g === 2 ? "warn" : "danger"
        };
      },
      notes: ["Equivalencias aproximadas con Karnofsky: ECOG 0 \u2248 KPS 100, 1 \u2248 80\u201390, 2 \u2248 60\u201370, 3 \u2248 40\u201350, 4 \u2248 10\u201330."],
      references: [
        "Oken MM, et al. Toxicity and response criteria of the Eastern Cooperative Oncology Group. Am J Clin Oncol. 1982;5(6):649-55."
      ]
    },
    {
      id: "ganzoni",
      name: "Ecuaci\xF3n de Ganzoni para el d\xE9ficit de hierro",
      shortName: "Ganzoni",
      description: "Calcula el d\xE9ficit total de hierro para reposici\xF3n intravenosa en la anemia ferrop\xE9nica.",
      category: CAT_HEMATO,
      specialty: FAM,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 5, max: 250, step: 0.5 },
        { id: "hbActual", type: "number", label: "Hemoglobina actual", unit: "g/dL", min: 3, max: 18, step: 0.1 },
        { id: "hbObjetivo", type: "number", label: "Hemoglobina objetivo", unit: "g/dL", min: 8, max: 16, step: 0.1 },
        {
          id: "reservas",
          type: "number",
          label: "Hierro para reservas",
          unit: "mg",
          description: "\u2265 35 kg: 500 mg. 5\u201334 kg: 15 mg/kg.",
          min: 0,
          max: 1e3,
          step: 10
        }
      ],
      compute: (v) => {
        if (v.hbObjetivo <= v.hbActual)
          return {
            main: "\u2014",
            interpretation: "La hemoglobina objetivo debe ser mayor que la actual.",
            level: "warn"
          };
        const deficit = 2.4 * v.peso * (v.hbObjetivo - v.hbActual) + v.reservas;
        return {
          main: fmt(deficit, 0),
          mainUnit: "mg de hierro",
          interpretation: "Dosis total a reponer por v\xEDa intravenosa. Repartir seg\xFAn la preparaci\xF3n (carboximaltosa f\xE9rrica hasta 1.000 mg por sesi\xF3n; hierro sacarosa 100\u2013200 mg por sesi\xF3n).",
          level: "info",
          details: [
            "F\xF3rmula: d\xE9ficit (mg) = 2,4 \xD7 peso (kg) \xD7 (Hb objetivo \u2212 Hb actual) + hierro para reservas.",
            "En pacientes con peso \u2265 35 kg y hemoglobina objetivo 15 g/dL, reservas = 500 mg. En menor peso, 15 mg/kg."
          ]
        };
      },
      references: [
        "Ganzoni AM. Intravenous iron-dextran: therapeutic and experimental possibilities. Schweiz Med Wochenschr. 1970;100(7):301-3."
      ]
    },
    {
      id: "bova",
      name: "Puntuaci\xF3n de Bova para embolia pulmonar hemodin\xE1micamente estable",
      shortName: "Bova",
      description: "Estratifica el riesgo de complicaciones a 30 d\xEDas en pacientes normotensos con embolia pulmonar aguda.",
      category: CAT_TEV3,
      specialty: FAM,
      inputs: [
        {
          id: "pas",
          type: "select",
          label: "PA sist\xF3lica",
          options: [
            { label: "\u2265 110 mmHg", value: 0 },
            { label: "90\u2013109 mmHg", value: 2 }
          ]
        },
        { id: "fc", type: "boolean", label: "Frecuencia card\xEDaca \u2265 110 lpm" },
        { id: "troponina", type: "boolean", label: "Troponina elevada", points: 2 },
        { id: "disfuncionVD", type: "boolean", label: "Disfunci\xF3n del ventr\xEDculo derecho", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["pas", "fc", "troponina", "disfuncionVD"]);
        const stage = score <= 2 ? "I" : score <= 4 ? "II" : "III";
        const riesgo2 = score <= 2 ? "< 5 %" : score <= 4 ? "\u2248 18 %" : "\u2248 42 %";
        return {
          main: `Estadio ${stage}`,
          secondary: riesgo2,
          secondaryLabel: "complicaciones a 30 d\xEDas",
          interpretation: stage === "I" ? "Riesgo bajo: manejo habitual con anticoagulaci\xF3n." : stage === "II" ? "Riesgo intermedio: vigilancia estrecha, considerar ingreso en cuidados intermedios." : "Riesgo alto: vigilancia en cuidados intensivos; monitorizaci\xF3n de la evoluci\xF3n hemodin\xE1mica y considerar reperfusi\xF3n si aparece inestabilidad.",
          level: stage === "I" ? "ok" : stage === "II" ? "warn" : "danger"
        };
      },
      notes: ["Solo aplicable a pacientes con embolia pulmonar aguda y presi\xF3n arterial sist\xF3lica \u2265 90 mmHg al ingreso."],
      references: [
        "Bova C, et al. Identification of intermediate-risk patients with acute symptomatic pulmonary embolism. Eur Respir J. 2014;44(3):694-703."
      ]
    },
    {
      id: "cpis",
      name: "CPIS \u2014 Escala cl\xEDnica de infecci\xF3n pulmonar (Pugin)",
      shortName: "CPIS",
      description: "Ayuda a diagnosticar la neumon\xEDa asociada a la ventilaci\xF3n mec\xE1nica.",
      category: CAT_RESPI,
      specialty: FAM,
      inputs: [
        {
          id: "temperatura",
          type: "select",
          label: "Temperatura",
          options: [
            { label: "36,5\u201338,4 \xB0C", value: 0 },
            { label: "38,5\u201338,9 \xB0C", value: 1 },
            { label: "\u2265 39 o \u2264 36 \xB0C", value: 2 }
          ]
        },
        {
          id: "leucos",
          type: "select",
          label: "Leucocitos (\xD710\xB3/mm\xB3)",
          options: [
            { label: "4\u201311", value: 0 },
            { label: "< 4 o > 11", value: 1 },
            { label: "< 4 o > 11 con \u2265 50 % cayados", value: 2 }
          ]
        },
        {
          id: "secreciones",
          type: "select",
          label: "Secreciones traqueales",
          options: [
            { label: "Ausentes o escasas", value: 0 },
            { label: "Abundantes no purulentas", value: 1 },
            { label: "Abundantes purulentas", value: 2 }
          ]
        },
        {
          id: "pf",
          type: "select",
          label: "Oxigenaci\xF3n (PaO\u2082/FiO\u2082)",
          options: [
            { label: "> 240 o SDRA presente", value: 0 },
            { label: "\u2264 240 sin SDRA", value: 2 }
          ]
        },
        {
          id: "radiografia",
          type: "select",
          label: "Radiograf\xEDa de t\xF3rax",
          options: [
            { label: "Sin infiltrados", value: 0 },
            { label: "Infiltrado difuso o parcheado", value: 1 },
            { label: "Infiltrado localizado", value: 2 }
          ]
        },
        {
          id: "progresion",
          type: "select",
          label: "Progresi\xF3n del infiltrado",
          options: [
            { label: "Sin progresi\xF3n", value: 0 },
            { label: "Progresi\xF3n radiol\xF3gica (excluidos SDRA e ICC)", value: 2 }
          ]
        },
        {
          id: "cultivo",
          type: "select",
          label: "Cultivo de aspirado traqueal",
          options: [
            { label: "Sin crecimiento significativo", value: 0 },
            { label: "Crecimiento significativo (positivo)", value: 1 },
            { label: "Mismo pat\xF3geno en tinci\xF3n de Gram", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["temperatura", "leucos", "secreciones", "pf", "radiografia", "progresion", "cultivo"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u201312)",
          interpretation: score > 6 ? "CPIS > 6: alta probabilidad de neumon\xEDa asociada a la ventilaci\xF3n mec\xE1nica. Iniciar o mantener antibioterapia emp\xEDrica y ajustar seg\xFAn cultivos." : "CPIS \u2264 6: baja probabilidad de neumon\xEDa asociada a la ventilaci\xF3n mec\xE1nica; reevaluar en 48\u201372 h.",
          level: score > 6 ? "danger" : "ok"
        };
      },
      references: [
        'Pugin J, et al. Diagnosis of ventilator-associated pneumonia by bacteriologic analysis of bronchoscopic and nonbronchoscopic "blind" bronchoalveolar lavage fluid. Am Rev Respir Dis. 1991;143(5):1121-9.'
      ]
    },
    {
      id: "caspar",
      name: "Criterios CASPAR para artritis psori\xE1sica",
      shortName: "CASPAR",
      description: "Clasifica la artritis psori\xE1sica en pacientes con enfermedad inflamatoria articular.",
      category: CAT_GENERAL,
      specialty: FAM,
      inputs: [
        { id: "enfermedad", type: "boolean", label: "\xBFPresenta enfermedad articular inflamatoria confirmada?", noPoints: true },
        {
          id: "psoriasis",
          type: "select",
          label: "Psoriasis",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Antecedente personal o familiar (primer o segundo grado)", value: 1 },
            { label: "Actual", value: 2 }
          ]
        },
        { id: "ungueal", type: "boolean", label: "Alteraci\xF3n ungueal (onic\xF3lisis, pitting, hiperqueratosis)" },
        { id: "fr", type: "boolean", label: "Factor reumatoide negativo" },
        { id: "dactilitis", type: "boolean", label: "Dactilitis actual o pasada" },
        { id: "radiologico", type: "boolean", label: "Neoformaci\xF3n \xF3sea yuxtaarticular en la radiograf\xEDa" }
      ],
      compute: (v) => {
        if (v.enfermedad !== 1)
          return {
            main: "No aplicable",
            interpretation: "CASPAR se aplica solo en pacientes con enfermedad articular inflamatoria establecida.",
            level: "warn"
          };
        const score = sum(v, ["psoriasis", "ungueal", "fr", "dactilitis", "radiologico"]);
        return {
          main: String(score),
          mainUnit: "puntos (0\u20136)",
          interpretation: score >= 3 ? "Cumple criterios CASPAR (\u2265 3 puntos): clasifica como artritis psori\xE1sica (sensibilidad \u2248 91 %, especificidad \u2248 99 %)." : "No cumple criterios CASPAR: valorar otros diagn\xF3sticos.",
          level: score >= 3 ? "danger" : "ok"
        };
      },
      references: [
        "Taylor W, et al. Classification criteria for psoriatic arthritis: development of new criteria from a large international study (CASPAR). Arthritis Rheum. 2006;54(8):2665-73."
      ]
    },
    {
      id: "dlcn",
      name: "Criterios holandeses (DLCN) de hipercolesterolemia familiar",
      shortName: "DLCN",
      description: "Diagnostica cl\xEDnicamente la hipercolesterolemia familiar heterocigota.",
      category: CAT_CARDIO,
      specialty: FAM,
      inputs: [
        {
          id: "familia",
          type: "select",
          label: "Historia familiar",
          dropdown: true,
          options: [
            { label: "Sin datos relevantes", value: 0 },
            { label: "Familiar de primer grado con enfermedad coronaria o vascular precoz (< 55 a\xF1os en varones, < 60 en mujeres) o LDL > 210 mg/dL en adultos, o presencia de xantomas o arco corneal en < 45 a\xF1os", value: 1 },
            { label: "Familiar de primer grado < 18 a\xF1os con LDL > 155 mg/dL", value: 2 }
          ]
        },
        {
          id: "personal",
          type: "select",
          label: "Historia personal",
          options: [
            { label: "Sin datos relevantes", value: 0 },
            { label: "Enfermedad coronaria prematura", value: 2 },
            { label: "Enfermedad vascular prematura (cerebral o perif\xE9rica)", value: 1 }
          ]
        },
        {
          id: "examen",
          type: "select",
          label: "Exploraci\xF3n f\xEDsica",
          options: [
            { label: "Sin hallazgos", value: 0 },
            { label: "Arco corneal < 45 a\xF1os", value: 4 },
            { label: "Xantomas tendinosos", value: 6 }
          ]
        },
        {
          id: "ldl",
          type: "select",
          label: "LDL colesterol",
          dropdown: true,
          options: [
            { label: "< 155 mg/dL", value: 0 },
            { label: "155\u2013189 mg/dL", value: 1 },
            { label: "190\u2013249 mg/dL", value: 3 },
            { label: "250\u2013329 mg/dL", value: 5 },
            { label: "\u2265 330 mg/dL", value: 8 }
          ]
        },
        { id: "genetico", type: "boolean", label: "Mutaci\xF3n funcional confirmada (LDLR, APOB, PCSK9)", points: 8 }
      ],
      compute: (v) => {
        const score = sum(v, ["familia", "personal", "examen", "ldl", "genetico"]);
        const dx = score < 3 ? "improbable" : score <= 5 ? "posible" : score <= 8 ? "probable" : "definitiva";
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: `Hipercolesterolemia familiar ${dx}`,
          interpretation: dx === "improbable" ? "Hipercolesterolemia familiar improbable: control lip\xEDdico habitual." : dx === "posible" ? "Hipercolesterolemia familiar posible: valorar estudio gen\xE9tico y cribado familiar." : "Diagn\xF3stico probable o definitivo: iniciar estatinas de alta potencia (objetivo LDL < 100 mg/dL o < 70 con enfermedad cardiovascular), estudio gen\xE9tico y cribado familiar en cascada.",
          level: dx === "improbable" ? "ok" : dx === "posible" ? "warn" : "danger"
        };
      },
      references: [
        "World Health Organization. Familial hypercholesterolemia: report of a WHO consultation. Ginebra, 1999."
      ]
    },
    {
      id: "fleischner",
      name: "Gu\xEDas de Fleischner para n\xF3dulos pulmonares s\xF3lidos (2017)",
      shortName: "Fleischner",
      description: "Recomienda el seguimiento de n\xF3dulos pulmonares s\xF3lidos hallados incidentalmente en tomograf\xEDa.",
      category: CAT_RESPI,
      specialty: FAM,
      inputs: [
        {
          id: "riesgo",
          type: "select",
          label: "Riesgo del paciente",
          noPoints: true,
          options: [
            { label: "Bajo (no fumador, sin factores)", value: 0 },
            { label: "Alto (fumador, EPOC, exposici\xF3n asbesto, historia familiar)", value: 1 }
          ]
        },
        {
          id: "numero",
          type: "select",
          label: "N\xFAmero de n\xF3dulos",
          noPoints: true,
          options: [
            { label: "\xDAnico", value: 0 },
            { label: "M\xFAltiples", value: 1 }
          ]
        },
        { id: "tamano", type: "number", label: "Tama\xF1o del n\xF3dulo mayor", unit: "mm", min: 1, max: 30, step: 0.1 }
      ],
      compute: (v) => {
        const alto = v.riesgo === 1;
        const multi = v.numero === 1;
        const t = v.tamano;
        let rec;
        if (t < 6) {
          rec = alto ? "N\xF3dulo < 6 mm en paciente de alto riesgo: TC de control opcional a los 12 meses." : "N\xF3dulo < 6 mm en paciente de bajo riesgo: no se recomienda seguimiento rutinario.";
        } else if (t <= 8) {
          rec = alto ? "N\xF3dulo 6\u20138 mm en paciente de alto riesgo: TC de control a los 6\u201312 meses y considerar a los 18\u201324 meses." : "N\xF3dulo 6\u20138 mm en paciente de bajo riesgo: TC de control a los 6\u201312 meses y considerar a los 18\u201324 meses.";
        } else {
          rec = "N\xF3dulo > 8 mm: considerar TC de control a los 3 meses, PET-TC o biopsia seg\xFAn sospecha cl\xEDnica.";
        }
        if (multi) rec += " (N\xF3dulos m\xFAltiples: usar el n\xF3dulo m\xE1s sospechoso para orientar el seguimiento.)";
        const level = t < 6 ? "ok" : t <= 8 ? "warn" : "danger";
        return {
          main: `${fmt(t, 1)} mm`,
          interpretation: rec,
          level
        };
      },
      notes: [
        "Solo para n\xF3dulos s\xF3lidos \u2265 6 mm de forma sistem\xE1tica; los subs\xF3lidos tienen su propio algoritmo.",
        "No aplicable a pacientes < 35 a\xF1os ni a pacientes inmunodeprimidos u oncol\xF3gicos, en los que la conducta es individualizada."
      ],
      references: [
        "MacMahon H, et al. Guidelines for Management of Incidental Pulmonary Nodules Detected on CT Images: From the Fleischner Society 2017. Radiology. 2017;284(1):228-43."
      ]
    },
    {
      id: "ottawa-tia",
      name: "Ottawa TIA \u2014 Riesgo de ictus tras AIT",
      shortName: "Ottawa TIA",
      description: "Regla canadiense de decisi\xF3n para estimar el riesgo de ictus a 7 d\xEDas tras un AIT.",
      category: "Neurolog\xEDa cr\xEDtica e ictus",
      specialty: FAM,
      inputs: [
        { id: "primer", type: "boolean", label: "Primer episodio de AIT en la vida", points: 2 },
        { id: "sintomas", type: "boolean", label: "S\xEDntomas > 10 minutos", points: 2 },
        { id: "aterotrombosis", type: "boolean", label: "Antecedente de arteriopat\xEDa carot\xEDdea", points: 2 },
        { id: "antiagregante", type: "boolean", label: "Ya recib\xEDa antiagregante en el momento del AIT", points: 3 },
        { id: "debilidad", type: "boolean", label: "Debilidad focal", points: 2 },
        { id: "lenguaje", type: "boolean", label: "Alteraci\xF3n del lenguaje", points: 1 },
        {
          id: "duracion",
          type: "select",
          label: "Duraci\xF3n de los s\xEDntomas",
          options: [
            { label: "< 10 min", value: 0 },
            { label: "10\u201359 min", value: 1 },
            { label: "\u2265 60 min", value: 2 }
          ]
        },
        { id: "fa", type: "boolean", label: "Fibrilaci\xF3n auricular en el ECG", points: 2 },
        { id: "isquemia", type: "boolean", label: "Signos de isquemia en el ECG", points: 2 },
        {
          id: "glucosa",
          type: "boolean",
          label: "Glucemia \u2265 265 mg/dL",
          points: 3
        },
        { id: "plaquetas", type: "boolean", label: "Plaquetas \u2265 400 \xD710\u2079/L", points: 2 },
        { id: "leucocitos", type: "boolean", label: "Leucocitos \u2265 10 \xD710\u2079/L", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["primer", "sintomas", "aterotrombosis", "antiagregante", "debilidad", "lenguaje", "duracion", "fa", "isquemia", "glucosa", "plaquetas", "leucocitos"]);
        const riesgo2 = score <= 3 ? "bajo (< 1 %)" : score <= 8 ? "intermedio (\u2248 4 %)" : "alto (\u2248 10 %)";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201323)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de ictus a 7 d\xEDas",
          interpretation: score <= 3 ? "Riesgo bajo: estudio ambulatorio urgente en las primeras 48 h con neuroimagen, estudio vascular, ECG y ecocardiograma seg\xFAn protocolo." : score <= 8 ? "Riesgo intermedio: valoraci\xF3n r\xE1pida; algunos centros ingresan para estudio si no hay unidad ambulatorio urgente." : "Riesgo alto: ingreso hospitalario para estudio completo y tratamiento antiagregante precoz.",
          level: score <= 3 ? "ok" : score <= 8 ? "warn" : "danger"
        };
      },
      notes: ["Todos los pacientes con AIT deben iniciar antiagregaci\xF3n (AAS o clopidogrel) y prevenci\xF3n secundaria intensiva."],
      references: [
        "Perry JJ, et al. A prospective cohort study of patients with transient ischemic attack to identify high-risk clinical characteristics. Stroke. 2014;45(1):92-100."
      ]
    },
    {
      id: "peptido-c",
      name: "Cociente p\xE9ptido C / glucosa",
      shortName: "P\xE9ptido C / glucosa",
      description: "Eval\xFAa la funci\xF3n residual de las c\xE9lulas beta pancre\xE1ticas; \xFAtil para diferenciar diabetes tipo 1 de tipo 2.",
      category: CAT_DIABETES,
      specialty: FAM,
      inputs: [
        { id: "peptido", type: "number", label: "P\xE9ptido C s\xE9rico", unit: "ng/mL", min: 0, max: 20, step: 0.01 },
        { id: "glucemia", type: "number", label: "Glucemia simult\xE1nea", unit: "mg/dL", min: 30, max: 800, step: 1 }
      ],
      compute: (v) => {
        const glucoseMmol = v.glucemia / 18;
        const peptidoNmol = v.peptido * 0.331;
        const cociente = peptidoNmol / glucoseMmol;
        return {
          main: fmt(cociente, 3),
          mainUnit: "nmol/mmol",
          interpretation: cociente < 0.2 ? "Funci\xF3n beta muy reducida (< 0,2): compatible con diabetes tipo 1 o insulinodependencia establecida." : cociente < 0.6 ? "Funci\xF3n beta intermedia (0,2\u20130,6): posible LADA o diabetes tipo 2 avanzada." : "Funci\xF3n beta preservada (\u2265 0,6): sugiere diabetes tipo 2, MODY o alteraci\xF3n de la sensibilidad a la insulina.",
          level: cociente < 0.2 ? "danger" : cociente < 0.6 ? "warn" : "ok",
          details: ["Conversi\xF3n: p\xE9ptido C 1 ng/mL \u2248 0,331 nmol/L; glucemia 1 mmol/L = 18 mg/dL."]
        };
      },
      notes: ["Ideal en muestra postprandial o tras est\xEDmulo con comida mixta; los valores en ayunas pueden infraestimar la reserva beta."],
      references: [
        "Jones AG, Hattersley AT. The clinical utility of C-peptide measurement in the care of patients with diabetes. Diabet Med. 2013;30(7):803-17."
      ]
    },
    {
      id: "delta-p",
      name: "Puntuaci\xF3n DELTA-P para Lambert-Eaton",
      shortName: "DELTA-P",
      description: "Estima el riesgo de c\xE1ncer de pulm\xF3n microc\xEDtico en pacientes con s\xEDndrome miast\xE9nico de Lambert-Eaton.",
      category: CAT_HEMATO,
      specialty: FAM,
      inputs: [
        { id: "perdidaPeso", type: "boolean", label: "P\xE9rdida de peso reciente" },
        { id: "edad", type: "boolean", label: "Edad \u2265 50 a\xF1os al inicio de los s\xEDntomas" },
        { id: "tabaco", type: "boolean", label: "Tabaquismo (activo o significativo previo)" },
        { id: "disfuncion", type: "boolean", label: "Disfunci\xF3n bulbar" },
        { id: "ereccion", type: "boolean", label: "Disfunci\xF3n er\xE9ctil (en varones)" },
        { id: "karnofsky", type: "boolean", label: "Karnofsky < 70 al inicio" }
      ],
      compute: (v) => {
        const score = sum(v, ["perdidaPeso", "edad", "tabaco", "disfuncion", "ereccion", "karnofsky"]);
        const riesgo2 = ["2,6 %", "4,7 %", "8,3 %", "18,2 %", "46,1 %", "83,9 %", "96,6 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20136)",
          secondary: riesgo2,
          secondaryLabel: "probabilidad de carcinoma microc\xEDtico",
          interpretation: score <= 1 ? "Riesgo bajo: seguimiento habitual con tomograf\xEDa de t\xF3rax." : score <= 3 ? "Riesgo intermedio: intensificar el cribado (TC y PET-TC)." : "Riesgo alto: cribado oncol\xF3gico intensivo (PET-TC) y repetir en 3\u20136 meses si es negativo.",
          level: score <= 1 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Titulaer MJ, et al. Screening for tumours in paraneoplastic syndromes: report of an EFNS task force. Eur J Neurol. 2011;18(1):19-e3."
      ]
    }
  ];

  // src/calculators/cardiotoracica.ts
  var CAT_CT = "Cirug\xEDa cardiotor\xE1cica y perioperatorio";
  var CAT_TEV4 = "Tromboembolismo venoso";
  var CAT_PLE = "Enfermedad pleural";
  var CAT_ECMO = "Soporte extracorp\xF3reo";
  var CAT_AORTA = "Aorta y grandes vasos";
  var CT = ["Cirug\xEDa Cardiotor\xE1cica"];
  var escala10 = (items) => items.map(([value, label]) => ({ label: `${value} \u2014 ${label}`, value }));
  var cardiotoracica = [
    {
      id: "caprini",
      name: "Puntuaci\xF3n Caprini para riesgo de TEV en el paciente quir\xFArgico",
      shortName: "Caprini",
      description: "Estratifica el riesgo de tromboembolismo venoso y orienta la profilaxis en pacientes quir\xFArgicos.",
      category: CAT_TEV4,
      specialty: CT,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 41 a\xF1os", value: 0 },
            { label: "41\u201360 a\xF1os", value: 1 },
            { label: "61\u201374 a\xF1os", value: 2 },
            { label: "\u2265 75 a\xF1os", value: 3 }
          ]
        },
        {
          id: "cirugia",
          type: "select",
          label: "Tipo de cirug\xEDa",
          options: [
            { label: "Menor (< 45 min)", value: 1 },
            { label: "Laparosc\xF3pica (> 45 min)", value: 2 },
            { label: "Mayor abierta o electiva de artroplastia (> 45 min)", value: 2.0001 },
            { label: "Ninguna cirug\xEDa", value: 0 }
          ]
        },
        { id: "imc", type: "boolean", label: "IMC > 25 kg/m\xB2" },
        { id: "edema", type: "boolean", label: "Edema en miembros inferiores" },
        { id: "varices", type: "boolean", label: "Varices" },
        { id: "sepsis", type: "boolean", label: "Sepsis (en el \xFAltimo mes)" },
        { id: "pulmonar", type: "boolean", label: "Enfermedad pulmonar grave (neumon\xEDa < 1 mes)" },
        { id: "epoc", type: "boolean", label: "Funci\xF3n pulmonar anormal (EPOC)" },
        { id: "iam", type: "boolean", label: "Infarto de miocardio (agudo)" },
        { id: "iccPuntos", type: "boolean", label: "Insuficiencia card\xEDaca congestiva" },
        { id: "confinamiento", type: "boolean", label: "Confinamiento en cama > 72 h" },
        { id: "yeso", type: "boolean", label: "Inmovilizaci\xF3n con yeso" },
        { id: "catetercentral", type: "boolean", label: "Acceso venoso central" },
        { id: "anticonceptivos", type: "boolean", label: "Anticonceptivos orales o terapia hormonal" },
        { id: "embarazoPuerperio", type: "boolean", label: "Embarazo o puerperio (< 1 mes)" },
        { id: "historia", type: "boolean", label: "Antecedente de abortos de repetici\xF3n o p\xE9rdidas fetales" },
        { id: "edadAvanzada", type: "boolean", label: "Edad > 75 a\xF1os" },
        { id: "artroplastia", type: "boolean", label: "Artroplastia de cadera o rodilla", points: 5 },
        { id: "fracturaGrande", type: "boolean", label: "Fractura de cadera, pelvis o pierna en < 1 mes", points: 5 },
        { id: "ictusRec", type: "boolean", label: "Ictus en el \xFAltimo mes", points: 5 },
        { id: "medular", type: "boolean", label: "Lesi\xF3n medular aguda (par\xE1lisis) en el \xFAltimo mes", points: 5 },
        { id: "multiTrauma", type: "boolean", label: "Politraumatismo en el \xFAltimo mes", points: 5 },
        { id: "tevPrevio", type: "boolean", label: "Antecedente personal de TVP o EP", points: 3 },
        { id: "familiarTev", type: "boolean", label: "Antecedente familiar de TEV", points: 3 },
        { id: "trombofilia", type: "boolean", label: "Trombofilia (factor V Leiden, protrombina, anticardiolipina...)", points: 3 },
        { id: "trombopeniaHIT", type: "boolean", label: "Trombopenia inducida por heparina previa", points: 3 },
        { id: "cancer", type: "boolean", label: "Neoplasia activa o previa", points: 2 }
      ],
      compute: (v) => {
        const score = Math.round(
          sum(v, [
            "edad",
            "cirugia",
            "imc",
            "edema",
            "varices",
            "sepsis",
            "pulmonar",
            "epoc",
            "iam",
            "iccPuntos",
            "confinamiento",
            "yeso",
            "catetercentral",
            "anticonceptivos",
            "embarazoPuerperio",
            "historia",
            "edadAvanzada",
            "artroplastia",
            "fracturaGrande",
            "ictusRec",
            "medular",
            "multiTrauma",
            "tevPrevio",
            "familiarTev",
            "trombofilia",
            "trombopeniaHIT",
            "cancer"
          ])
        );
        const banda = score === 0 ? "muy bajo" : score <= 1 ? "bajo" : score <= 4 ? "moderado" : "alto";
        const rec = banda === "muy bajo" ? "Deambulaci\xF3n temprana; sin profilaxis espec\xEDfica." : banda === "bajo" ? "Medidas mec\xE1nicas (compresi\xF3n neum\xE1tica intermitente)." : banda === "moderado" ? "Profilaxis farmacol\xF3gica (HBPM o heparina no fraccionada) o mec\xE1nica si contraindicaci\xF3n." : "Profilaxis farmacol\xF3gica y mec\xE1nica combinadas; prolongar hasta 30 d\xEDas en cirug\xEDa oncol\xF3gica abdominop\xE9lvica.";
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: `Riesgo ${banda}`,
          interpretation: rec,
          level: banda === "muy bajo" || banda === "bajo" ? "ok" : banda === "moderado" ? "warn" : "danger"
        };
      },
      references: [
        "Caprini JA. Thrombosis risk assessment as a guide to quality patient care. Dis Mon. 2005;51(2-3):70-8.",
        "Gould MK, et al. Prevention of VTE in Nonorthopedic Surgical Patients (ACCP CHEST 2012). Chest. 2012;141(2 Suppl):e227S-e277S."
      ]
    },
    {
      id: "add-rs",
      name: "ADD-RS (Aortic Dissection Detection Risk Score)",
      shortName: "ADD-RS",
      description: "Estratifica la probabilidad cl\xEDnica de disecci\xF3n a\xF3rtica aguda.",
      category: CAT_AORTA,
      specialty: CT,
      inputs: [
        {
          id: "marfan",
          type: "boolean",
          label: "Condiciones predisponentes",
          description: "Marfan u otra enfermedad del tejido conectivo, antecedente familiar de aneurisma/disecci\xF3n a\xF3rtica, valvulopat\xEDa a\xF3rtica, manipulaci\xF3n a\xF3rtica reciente, aneurisma a\xF3rtico tor\xE1cico conocido."
        },
        {
          id: "dolor",
          type: "boolean",
          label: "Caracter\xEDsticas del dolor",
          description: "Dolor de aparici\xF3n s\xFAbita, intenso, o descrito como desgarrador/lacerante en t\xF3rax, espalda o abdomen."
        },
        {
          id: "examen",
          type: "boolean",
          label: "Hallazgos en la exploraci\xF3n",
          description: "D\xE9ficit de pulsos, asimetr\xEDa de tensiones sist\xF3licas > 20 mmHg, d\xE9ficit neurol\xF3gico focal con dolor o soplo diast\xF3lico de nueva aparici\xF3n con dolor y/o hipotensi\xF3n/shock."
        }
      ],
      compute: (v) => {
        const score = sum(v, ["marfan", "dolor", "examen"]);
        const banda = score === 0 ? "muy bajo" : score === 1 ? "bajo" : "alto";
        return {
          main: String(score),
          mainUnit: "de 3 categor\xEDas",
          secondary: `Riesgo ${banda}`,
          interpretation: score === 0 ? "Riesgo muy bajo: si D-d\xEDmero < 500 ng/mL, la disecci\xF3n a\xF3rtica queda razonablemente descartada." : score === 1 ? "Riesgo bajo-intermedio: combinar con D-d\xEDmero para descartar; si es positivo o dudoso, angio-TC." : "Riesgo alto (\u2265 2 categor\xEDas): angio-TC toracoabdominal urgente.",
          level: score === 0 ? "ok" : score === 1 ? "warn" : "danger"
        };
      },
      references: [
        "Rogers AM, et al. Sensitivity of the aortic dissection detection risk score, a novel guideline-based tool. Circulation. 2011;123(20):2213-8."
      ]
    },
    {
      id: "acef2",
      name: "Puntuaci\xF3n ACEF II para cirug\xEDa card\xEDaca",
      shortName: "ACEF II",
      description: "Predice la mortalidad a 30 d\xEDas tras cirug\xEDa card\xEDaca electiva o urgente.",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        { id: "edad", type: "number", label: "Edad", unit: "a\xF1os", min: 18, max: 100 },
        { id: "fevi", type: "number", label: "Fracci\xF3n de eyecci\xF3n del VI", unit: "%", min: 10, max: 80, step: 1 },
        { id: "creatinina", type: "number", label: "Creatinina s\xE9rica", unit: "mg/dL", min: 0.3, max: 15, step: 0.01 },
        { id: "urgente", type: "boolean", label: "Cirug\xEDa de urgencia" },
        { id: "anemia", type: "boolean", label: "Hematocrito < 36 %" }
      ],
      compute: (v) => {
        const base = v.edad / v.fevi + (v.creatinina > 2 ? 2 : 0) + (v.urgente === 1 ? 3 : 0) + (v.anemia === 1 ? 0.2 * (36 - Math.max(20, 36 - 10)) : 0);
        const banda = base < 1 ? "bajo" : base < 2 ? "intermedio" : "alto";
        const mort = base < 1 ? "< 1 %" : base < 2 ? "\u2248 3 %" : "\u2265 8 %";
        return {
          main: fmt(base, 2),
          mainUnit: "puntos ACEF II",
          secondary: mort,
          secondaryLabel: "mortalidad a 30 d\xEDas",
          interpretation: `Riesgo ${banda} de mortalidad tras la cirug\xEDa card\xEDaca.`,
          level: banda === "bajo" ? "ok" : banda === "intermedio" ? "warn" : "danger",
          details: [
            "F\xF3rmula ACEF II = edad/FEVI + 2 (si creatinina > 2 mg/dL) + 3 (si urgencia) + 0,2 \xD7 (36 \u2212 hematocrito) si Hto < 36 %.",
            "Como no pedimos el hematocrito exacto, la penalizaci\xF3n por anemia se calcula solo por presencia/ausencia como aproximaci\xF3n (compruebe el valor real para casos l\xEDmite)."
          ]
        };
      },
      references: [
        "Ranucci M, et al. The multicenter external validation of ACEF II. J Thorac Cardiovasc Surg. 2018;155(4):1461-9."
      ]
    },
    {
      id: "aub-has2",
      name: "AUB-HAS2 \u2014 Riesgo cardiovascular perioperatorio no card\xEDaco",
      shortName: "AUB-HAS2",
      description: "Estratifica el riesgo cardiovascular perioperatorio en cirug\xEDa no card\xEDaca (alternativa simplificada a RCRI).",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        { id: "hta", type: "boolean", label: "Historia de hipertensi\xF3n (H)" },
        { id: "angina", type: "boolean", label: "Historia de angina (A)" },
        { id: "edad", type: "boolean", label: "Edad \u2265 75 a\xF1os (A)" },
        { id: "sintomas", type: "boolean", label: "S\xEDntomas de insuficiencia card\xEDaca o disnea (S)" },
        { id: "quirurgico", type: "boolean", label: "Tipo de cirug\xEDa de alto riesgo (S)" }
      ],
      compute: (v) => {
        const score = sum(v, ["hta", "angina", "edad", "sintomas", "quirurgico"]);
        const eventos = ["0,3 %", "0,3 %", "1,5 %", "4,4 %", "8 %", "13 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0\u20135)",
          secondary: eventos,
          secondaryLabel: "eventos cardiovasculares graves a 30 d\xEDas",
          interpretation: score <= 1 ? "Riesgo bajo." : score <= 2 ? "Riesgo intermedio: optimizaci\xF3n preoperatoria y vigilancia postoperatoria." : "Riesgo alto: consulta cardiol\xF3gica preoperatoria y considerar monitorizaci\xF3n de troponina postoperatoria.",
          level: score <= 1 ? "ok" : score <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Dakik HA, et al. AUB-HAS2 Cardiovascular Risk Index: Performance in Surgical Subpopulations and Comparison to the Revised Cardiac Risk Index. J Am Heart Assoc. 2019;8(9):e011477."
      ]
    },
    {
      id: "euromacs-rhf",
      name: "EUROMACS-RHF \u2014 Riesgo de insuficiencia card\xEDaca derecha tras LVAD",
      shortName: "EUROMACS-RHF",
      description: "Estima el riesgo de fallo del ventr\xEDculo derecho tras el implante de un dispositivo de asistencia ventricular izquierda.",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        { id: "intermacs", type: "boolean", label: "Perfil INTERMACS 1\u20133", points: 2 },
        { id: "multiInotrop", type: "boolean", label: "Uso de \u2265 3 inotr\xF3picos preoperatorios", points: 2.5 },
        { id: "gradiente", type: "boolean", label: "RA/PCWP > 0,54", points: 2 },
        { id: "hemoglobina", type: "boolean", label: "Hemoglobina \u2264 10 g/dL", points: 1 },
        { id: "disfuncionVD", type: "boolean", label: "Disfunci\xF3n moderada-grave del ventr\xEDculo derecho en ecocardiograma", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["intermacs", "multiInotrop", "gradiente", "hemoglobina", "disfuncionVD"]);
        const riesgo2 = score <= 2 ? "bajo (11 %)" : score <= 4 ? "intermedio (37 %)" : "alto (43\u201358 %)";
        return {
          main: fmt(score, 1),
          mainUnit: "puntos (0\u20139,5)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de insuficiencia card\xEDaca derecha post-LVAD",
          interpretation: score <= 2 ? "Riesgo bajo de insuficiencia card\xEDaca derecha tras el implante." : score <= 4 ? "Riesgo intermedio: valorar biventricular temporal, vigilancia estrecha." : "Riesgo alto: considerar soporte biventricular o trasplante como estrategia alternativa.",
          level: score <= 2 ? "ok" : score <= 4 ? "warn" : "danger"
        };
      },
      references: [
        "Soliman OII, et al. Derivation and Validation of a Novel Right-Sided Heart Failure Model After Implantation of Continuous Flow LVADs. Circulation. 2018;137(9):891-906."
      ]
    },
    {
      id: "thakar",
      name: "Puntuaci\xF3n de Thakar para lesi\xF3n renal aguda tras cirug\xEDa card\xEDaca",
      shortName: "Thakar",
      description: "Predice el riesgo de insuficiencia renal aguda que requiere di\xE1lisis tras cirug\xEDa card\xEDaca.",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        { id: "mujer", type: "boolean", label: "Sexo femenino" },
        { id: "icc", type: "boolean", label: "Insuficiencia card\xEDaca congestiva" },
        { id: "fevi", type: "boolean", label: "FEVI < 35 %" },
        { id: "biac", type: "boolean", label: "Bal\xF3n de contrapulsaci\xF3n intraa\xF3rtico preoperatorio", points: 2 },
        { id: "epoc", type: "boolean", label: "EPOC" },
        { id: "diabetesInsul", type: "boolean", label: "Diabetes en tratamiento con insulina" },
        { id: "cardiacaPrevia", type: "boolean", label: "Cirug\xEDa card\xEDaca previa" },
        { id: "urgencia", type: "boolean", label: "Cirug\xEDa urgente", points: 2 },
        {
          id: "tipo",
          type: "select",
          label: "Tipo de cirug\xEDa",
          options: [
            { label: "Solo revascularizaci\xF3n coronaria", value: 0 },
            { label: "Solo valvular", value: 1 },
            { label: "Combinada (revascularizaci\xF3n + valvular u otra)", value: 2 }
          ]
        },
        {
          id: "creatinina",
          type: "select",
          label: "Creatinina preoperatoria (mg/dL)",
          options: [
            { label: "< 1,2", value: 0 },
            { label: "1,2\u20132,1", value: 2 },
            { label: "> 2,1", value: 5 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["mujer", "icc", "fevi", "biac", "epoc", "diabetesInsul", "cardiacaPrevia", "urgencia", "tipo", "creatinina"]);
        const riesgo2 = score <= 2 ? "0,5 %" : score <= 5 ? "1,8 %" : score <= 8 ? "7,7 %" : "21 %";
        return {
          main: String(score),
          mainUnit: "puntos (0\u201317)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de di\xE1lisis post-cirug\xEDa",
          interpretation: score <= 2 ? "Riesgo bajo." : score <= 5 ? "Riesgo intermedio." : score <= 8 ? "Riesgo alto." : "Riesgo muy alto: intensificar profilaxis renal (evitar nefrot\xF3xicos, mantener perfusi\xF3n, ajustar contraste, valoraci\xF3n por nefrolog\xEDa).",
          level: score <= 2 ? "ok" : score <= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Thakar CV, et al. A clinical score to predict acute renal failure after cardiac surgery. J Am Soc Nephrol. 2005;16(1):162-8."
      ]
    },
    {
      id: "lent",
      name: "Puntuaci\xF3n LENT para derrame pleural maligno",
      shortName: "LENT",
      description: "Estima la supervivencia en pacientes con derrame pleural maligno.",
      category: CAT_PLE,
      specialty: CT,
      inputs: [
        {
          id: "ldh",
          type: "select",
          label: "LDH del l\xEDquido pleural",
          options: [
            { label: "< 1.500 U/L", value: 0 },
            { label: "\u2265 1.500 U/L", value: 1 }
          ]
        },
        {
          id: "ecog",
          type: "select",
          label: "ECOG performance status",
          options: [
            { label: "0", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3\u20134", value: 3 }
          ]
        },
        {
          id: "nlr",
          type: "select",
          label: "Cociente neutr\xF3filos/linfocitos",
          options: [
            { label: "< 9", value: 0 },
            { label: "\u2265 9", value: 1 }
          ]
        },
        {
          id: "tumor",
          type: "select",
          label: "Tipo de tumor",
          dropdown: true,
          options: [
            { label: "Mesotelioma / hematol\xF3gico", value: 0 },
            { label: "Mama / ginecol\xF3gico / renal", value: 1 },
            { label: "Pulm\xF3n / otros", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["ldh", "ecog", "nlr", "tumor"]);
        const riesgo2 = score <= 1 ? "bajo" : score <= 4 ? "moderado" : "alto";
        const superv = score <= 1 ? "319 d\xEDas" : score <= 4 ? "130 d\xEDas" : "44 d\xEDas";
        return {
          main: String(score),
          mainUnit: "puntos (0\u20137)",
          secondary: superv,
          secondaryLabel: "mediana de supervivencia",
          interpretation: `Riesgo ${riesgo2} de mortalidad. Ayuda a decidir entre pleurodesis o cat\xE9ter pleural tunelizado.`,
          level: riesgo2 === "bajo" ? "ok" : riesgo2 === "moderado" ? "warn" : "danger"
        };
      },
      references: [
        "Clive AO, et al. Predicting survival in malignant pleural effusion: development and validation of the LENT prognostic score. Thorax. 2014;69(12):1098-104."
      ]
    },
    {
      id: "rapid-pleural",
      name: "Puntuaci\xF3n RAPID para infecci\xF3n pleural",
      shortName: "RAPID (pleural)",
      description: "Estima la mortalidad a 3 meses en pacientes con infecci\xF3n pleural.",
      category: CAT_PLE,
      specialty: CT,
      inputs: [
        {
          id: "urea",
          type: "select",
          label: "Urea s\xE9rica (BUN)",
          options: [
            { label: "< 14 mg/dL", value: 0 },
            { label: "14\u201322 mg/dL", value: 1 },
            { label: "> 22 mg/dL", value: 2 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 50 a\xF1os", value: 0 },
            { label: "50\u201370 a\xF1os", value: 1 },
            { label: "> 70 a\xF1os", value: 2 }
          ]
        },
        {
          id: "pus",
          type: "select",
          label: "Aspecto del l\xEDquido pleural",
          options: [
            { label: "No purulento", value: 0 },
            { label: "Purulento", value: 1 }
          ]
        },
        {
          id: "infeccion",
          type: "select",
          label: "Origen de la infecci\xF3n",
          options: [
            { label: "Comunitario", value: 0 },
            { label: "Nosocomial", value: 1 }
          ]
        },
        {
          id: "albumina",
          type: "select",
          label: "Alb\xFAmina s\xE9rica",
          options: [
            { label: "\u2265 2,7 g/dL", value: 0 },
            { label: "< 2,7 g/dL", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["urea", "edad", "pus", "infeccion", "albumina"]);
        const banda = score <= 2 ? "bajo (< 5 %)" : score <= 4 ? "intermedio (17 %)" : "alto (48 %)";
        return {
          main: String(score),
          mainUnit: "puntos (0\u20137)",
          secondary: banda,
          secondaryLabel: "mortalidad a 3 meses",
          interpretation: score <= 2 ? "Riesgo bajo: buen pron\xF3stico con tratamiento convencional (drenaje + antibioterapia)." : score <= 4 ? "Riesgo intermedio: vigilancia estrecha; considerar activaci\xF3n de v\xEDa quir\xFArgica temprana." : "Riesgo alto: mortalidad significativa; valoraci\xF3n por cirug\xEDa tor\xE1cica precoz y cuidados intermedios.",
          level: score <= 2 ? "ok" : score <= 4 ? "warn" : "danger"
        };
      },
      references: [
        "Rahman NM, et al. A clinical score (RAPID) to identify those at risk for poor outcome at presentation with pleural infection. Chest. 2014;145(4):848-55."
      ]
    },
    {
      id: "save",
      name: "Puntuaci\xF3n SAVE para supervivencia tras ECMO venoarterial",
      shortName: "SAVE",
      description: "Predice la supervivencia intrahospitalaria en adultos con shock cardiog\xE9nico refractario tratados con ECMO VA.",
      category: CAT_ECMO,
      specialty: CT,
      inputs: [
        {
          id: "diagnostico",
          type: "select",
          label: "Grupo diagn\xF3stico",
          dropdown: true,
          options: [
            { label: "Miocarditis", value: 3 },
            { label: "Rechazo de trasplante refractario", value: 3.0001 },
            { label: "FV/TV refractaria", value: 2 },
            { label: "Post-trasplante card\xEDaco / pulmonar", value: 3.0002 },
            { label: "Miocardiopat\xEDa cong\xE9nita", value: -3 },
            { label: "Otros", value: 0 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          dropdown: true,
          options: [
            { label: "18\u201338", value: 7 },
            { label: "39\u201352", value: 4 },
            { label: "53\u201362", value: 3 },
            { label: "\u2265 63", value: 0 }
          ]
        },
        {
          id: "peso",
          type: "select",
          label: "Peso",
          options: [
            { label: "\u2264 65 kg", value: 1 },
            { label: "65\u201389 kg", value: 2 },
            { label: "> 89 kg", value: 0 }
          ]
        },
        {
          id: "organos",
          type: "select",
          label: "Fallo org\xE1nico agudo previo a la ECMO",
          options: [
            { label: "Renal (creatinina > 1,5 o di\xE1lisis)", value: -3 },
            { label: "Hep\xE1tico (bilirrubina > 2 o transaminasas > 70)", value: -3.0001 },
            { label: "Neurol\xF3gico", value: -3.0002 },
            { label: "Sin fallo org\xE1nico", value: 0 }
          ]
        },
        { id: "ventilacion", type: "boolean", label: "Ventilaci\xF3n mec\xE1nica > 10 d\xEDas", points: -1 },
        { id: "presionInspiratoria", type: "boolean", label: "Presi\xF3n inspiratoria pico \u2265 20 cmH\u2082O", points: -3 },
        { id: "pcr", type: "boolean", label: "Parada card\xEDaca antes de la ECMO", points: -2 },
        { id: "pas", type: "boolean", label: "PA sist\xF3lica \u2264 90 mmHg pre-ECMO", points: -2 },
        { id: "ph", type: "boolean", label: "pH < 7,25 pre-ECMO", points: -3 }
      ],
      compute: (v) => {
        const score = Math.round(
          sum(v, ["diagnostico", "edad", "peso", "organos", "ventilacion", "presionInspiratoria", "pcr", "pas", "ph"]) + 6
        );
        const banda = score > 5 ? "I (75 %)" : score >= 1 ? "II (58 %)" : score >= -4 ? "III (42 %)" : score >= -9 ? "IV (30 %)" : "V (18 %)";
        return {
          main: String(score),
          mainUnit: "puntos SAVE",
          secondary: `Clase ${banda}`,
          secondaryLabel: "supervivencia hospitalaria",
          interpretation: "Herramienta de apoyo para decidir sobre la indicaci\xF3n de ECMO VA y las expectativas realistas. La decisi\xF3n final integra el juicio cl\xEDnico y la disponibilidad de recursos.",
          level: score >= 1 ? "ok" : score >= -4 ? "warn" : "danger"
        };
      },
      references: [
        "Schmidt M, et al. Predicting survival after ECMO for refractory cardiogenic shock: the SAVE-score. Eur Heart J. 2015;36(33):2246-56."
      ]
    },
    {
      id: "resp",
      name: "Puntuaci\xF3n RESP para supervivencia tras ECMO respiratoria",
      shortName: "RESP",
      description: "Predice la supervivencia hospitalaria en pacientes con insuficiencia respiratoria aguda tratados con ECMO.",
      category: CAT_ECMO,
      specialty: CT,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          dropdown: true,
          options: [
            { label: "18\u201349 a\xF1os", value: 0 },
            { label: "50\u201359 a\xF1os", value: -2 },
            { label: "\u2265 60 a\xF1os", value: -3 }
          ]
        },
        {
          id: "inmunocomp",
          type: "select",
          label: "Inmunodepresi\xF3n",
          options: [
            { label: "No", value: 0 },
            { label: "S\xED (tumor s\xF3lido, hematol\xF3gico, cirrosis, VIH\u2026)", value: -2 }
          ]
        },
        {
          id: "ventilacion",
          type: "select",
          label: "Duraci\xF3n de la ventilaci\xF3n mec\xE1nica antes de la ECMO",
          dropdown: true,
          options: [
            { label: "< 48 h", value: 3 },
            { label: "48 h \u2013 7 d\xEDas", value: 1 },
            { label: "> 7 d\xEDas", value: 0 }
          ]
        },
        {
          id: "diagnostico",
          type: "select",
          label: "Diagn\xF3stico agudo",
          dropdown: true,
          options: [
            { label: "Neumon\xEDa viral", value: 3 },
            { label: "Neumon\xEDa bacteriana", value: 3.0001 },
            { label: "Asma", value: 11 },
            { label: "Traumatismo o quemadura", value: 3.0002 },
            { label: "Aspiraci\xF3n", value: 5 },
            { label: "Otras causas", value: 1 }
          ]
        },
        { id: "snc", type: "boolean", label: "Disfunci\xF3n del sistema nervioso central", points: -7 },
        { id: "infeccion", type: "boolean", label: "Infecci\xF3n bacteriana aguda no pulmonar", points: -3 },
        { id: "bnm", type: "boolean", label: "Uso de bloqueantes neuromusculares" },
        { id: "no", type: "boolean", label: "Uso de \xF3xido n\xEDtrico inhalado", points: -1 },
        { id: "bicarbonato", type: "boolean", label: "Uso de bicarbonato", points: -2 },
        { id: "pcr", type: "boolean", label: "Parada card\xEDaca previa a la ECMO", points: -2 },
        {
          id: "paco2",
          type: "select",
          label: "PaCO\u2082",
          options: [
            { label: "< 75 mmHg", value: 0 },
            { label: "\u2265 75 mmHg", value: -1 }
          ]
        },
        {
          id: "presion",
          type: "select",
          label: "Presi\xF3n pico inspiratoria",
          options: [
            { label: "< 42 cmH\u2082O", value: 0 },
            { label: "\u2265 42 cmH\u2082O", value: -1 }
          ]
        }
      ],
      compute: (v) => {
        const score = Math.round(sum(v, ["edad", "inmunocomp", "ventilacion", "diagnostico", "snc", "infeccion", "bnm", "no", "bicarbonato", "pcr", "paco2", "presion"]));
        const banda = score >= 6 ? "I (92 %)" : score >= 3 ? "II (76 %)" : score >= -1 ? "III (57 %)" : score >= -5 ? "IV (33 %)" : "V (18 %)";
        return {
          main: String(score),
          mainUnit: "puntos RESP",
          secondary: `Clase ${banda}`,
          secondaryLabel: "supervivencia hospitalaria",
          interpretation: "Herramienta de apoyo para decidir sobre la indicaci\xF3n de ECMO respiratoria y anticipar expectativas.",
          level: score >= 3 ? "ok" : score >= -1 ? "warn" : "danger"
        };
      },
      references: [
        "Schmidt M, et al. Predicting survival after ECMO for severe acute respiratory failure. The Respiratory ECMO Survival Prediction (RESP) score. Am J Respir Crit Care Med. 2014;189(11):1374-82."
      ]
    },
    {
      id: "pons",
      name: "PONS \u2014 Perioperative Nutrition Screen",
      shortName: "PONS",
      description: "Cribado nutricional preoperatorio en cirug\xEDa electiva; identifica pacientes que se beneficiar\xE1n de optimizaci\xF3n nutricional.",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        {
          id: "imc",
          type: "boolean",
          label: "IMC < 18,5 (o < 20 si \u2265 65 a\xF1os)"
        },
        {
          id: "perdida",
          type: "boolean",
          label: "P\xE9rdida de peso no intencionada > 10 % en 6 meses"
        },
        {
          id: "ingesta",
          type: "boolean",
          label: "Ingesta oral reducida en la \xFAltima semana"
        },
        {
          id: "albumina",
          type: "boolean",
          label: "Alb\xFAmina preoperatoria < 3,0 g/dL"
        }
      ],
      compute: (v) => {
        const score = sum(v, ["imc", "perdida", "ingesta", "albumina"]);
        return {
          main: String(score),
          mainUnit: "criterios (0\u20134)",
          interpretation: score === 0 ? "Riesgo nutricional bajo: no requiere intervenci\xF3n espec\xEDfica preoperatoria." : "Al menos un criterio positivo: derivar a nutrici\xF3n para optimizaci\xF3n preoperatoria (suplementos orales, retraso de cirug\xEDa electiva si es posible 7\u201314 d\xEDas).",
          level: score === 0 ? "ok" : "warn"
        };
      },
      references: [
        "Wischmeyer PE, et al. American Society for Enhanced Recovery and Perioperative Quality Initiative Joint Consensus Statement on Nutrition Screening. Anesth Analg. 2018;126(6):1883-95."
      ]
    },
    {
      id: "bridge-anticoagulacion",
      name: "Algoritmo de puentes de anticoagulaci\xF3n perioperatoria",
      shortName: "Puente anticoagulaci\xF3n",
      description: "Orienta la necesidad de puente con HBPM durante la suspensi\xF3n perioperatoria de la anticoagulaci\xF3n oral.",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        {
          id: "indicacion",
          type: "select",
          label: "Motivo de la anticoagulaci\xF3n",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Pr\xF3tesis valvular mec\xE1nica", value: 1 },
            { label: "Fibrilaci\xF3n auricular", value: 2 },
            { label: "Tromboembolismo venoso", value: 3 }
          ],
          default: 2
        },
        {
          id: "riesgo",
          type: "select",
          label: "Riesgo tromboemb\xF3lico espec\xEDfico",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Alto \u2014 pr\xF3tesis mitral, pr\xF3tesis a\xF3rtica antigua, CHA\u2082DS\u2082-VASc \u2265 7, ictus/AIT en los \xFAltimos 3 meses, TEV en los \xFAltimos 3 meses, trombofilia grave", value: "alto" },
            { label: "Intermedio \u2014 pr\xF3tesis a\xF3rtica bic\xFAspide moderna con factores de riesgo, CHA\u2082DS\u2082-VASc 5\u20136, TEV en los \xFAltimos 3\u201312 meses, trombofilia leve o TEV recurrente", value: "intermedio" },
            { label: "Bajo \u2014 pr\xF3tesis a\xF3rtica bic\xFAspide moderna sin factores, CHA\u2082DS\u2082-VASc 1\u20134 sin ictus previo, TEV \xFAnico > 12 meses", value: "bajo" }
          ],
          default: "intermedio"
        },
        {
          id: "sangrado",
          type: "select",
          label: "Riesgo hemorr\xE1gico del procedimiento",
          noPoints: true,
          options: [
            { label: "Bajo (cataratas, endoscopia diagn\xF3stica, extracci\xF3n dental)", value: "bajo" },
            { label: "Intermedio (mayor\xEDa de cirug\xEDas generales)", value: "intermedio" },
            { label: "Alto (neurocirug\xEDa, card\xEDaca mayor, resecciones oncol\xF3gicas)", value: "alto" }
          ],
          default: "intermedio"
        }
      ],
      compute: (v) => {
        const r = v.riesgo;
        const s = v.sangrado;
        const puente = r === "alto" || r === "intermedio" && s !== "alto";
        const guiaAcod = r === "alto" ? "Alto riesgo tromboemb\xF3lico: se recomienda puente con HBPM a dosis terap\xE9utica." : r === "intermedio" ? "Riesgo intermedio: valorar puente individualizando; en fibrilaci\xF3n auricular sin ictus previo el ensayo BRIDGE mostr\xF3 que la mayor\xEDa no se benefician." : "Riesgo bajo: en general no se recomienda puente.";
        return {
          main: puente ? "Puente indicado" : "Puente no recomendado",
          interpretation: `${guiaAcod} ${s === "alto" ? "Sangrado alto: reanudar anticoagulaci\xF3n a las 48\u201372 h; en pacientes con riesgo tromboemb\xF3lico muy alto, priorizar el control de la hemorragia." : s === "intermedio" ? "Sangrado intermedio: reanudar anticoagulaci\xF3n en 24 h si hemostasia adecuada." : "Sangrado bajo: puede no ser necesario suspender la anticoagulaci\xF3n (procedimientos menores)."}`,
          level: puente ? "warn" : "ok",
          details: [
            "En pacientes con anticoagulantes orales directos, en general NO se hace puente: se suspenden 24\u201348 h antes seg\xFAn funci\xF3n renal.",
            "La warfarina se suspende 5 d\xEDas antes; el INR debe ser < 1,5 el d\xEDa de la cirug\xEDa.",
            "Reanudar la HBPM 24 h despu\xE9s de la cirug\xEDa de bajo-intermedio riesgo o 48\u201372 h si el riesgo hemorr\xE1gico es alto."
          ]
        };
      },
      notes: [
        "El ensayo BRIDGE (NEJM 2015) demostr\xF3 que no hacer puente en fibrilaci\xF3n auricular sin ictus previo es no inferior en tromboembolismo y reduce las hemorragias."
      ],
      references: [
        "Douketis JD, et al. Perioperative Management of Antithrombotic Therapy: An American College of Chest Physicians Clinical Practice Guideline. Chest. 2022;162(5):e207-e243."
      ]
    },
    {
      id: "duke-iscvid-2023",
      name: "Criterios Duke-ISCVID 2023 para endocarditis infecciosa",
      shortName: "Duke-ISCVID 2023",
      description: "Criterios diagn\xF3sticos actualizados de endocarditis infecciosa (Sociedad Internacional de ISCVID, 2023).",
      category: "Criterios diagn\xF3sticos",
      specialty: CT,
      inputs: [
        {
          id: "mayores",
          type: "select",
          label: "Criterios mayores presentes",
          dropdown: true,
          options: escala10([
            [0, "0"],
            [1, "1"],
            [2, "2"]
          ])
        },
        {
          id: "menores",
          type: "select",
          label: "Criterios menores presentes",
          dropdown: true,
          options: escala10([
            [0, "0"],
            [1, "1"],
            [2, "2"],
            [3, "3"],
            [4, "4"],
            [5, "5"]
          ])
        },
        { id: "confirmadaAP", type: "boolean", label: "Endocarditis confirmada por anatom\xEDa patol\xF3gica o cultivo de v\xE1lvula/vegetaci\xF3n", noPoints: true }
      ],
      compute: (v) => {
        if (v.confirmadaAP === 1)
          return {
            main: "Endocarditis definitiva",
            interpretation: "Criterio anatomopatol\xF3gico: la demostraci\xF3n de microorganismos o inflamaci\xF3n activa en v\xE1lvula o vegetaci\xF3n establece el diagn\xF3stico definitivo.",
            level: "danger"
          };
        const mayor = v.mayores ?? 0;
        const menor = v.menores ?? 0;
        let categoria;
        if (mayor >= 2 || mayor === 1 && menor >= 3 || menor >= 5) categoria = "Definitiva";
        else if (mayor === 1 && menor >= 1 || menor >= 3) categoria = "Posible";
        else categoria = "Rechazada";
        return {
          main: `Endocarditis ${categoria.toLowerCase()}`,
          interpretation: categoria === "Definitiva" ? "Diagn\xF3stico definitivo por criterios cl\xEDnicos: iniciar antibioterapia dirigida y valoraci\xF3n por equipo multidisciplinar de endocarditis." : categoria === "Posible" ? "Diagn\xF3stico posible: completar estudio (hemocultivos seriados, ecocardiograma transesof\xE1gico, imagen avanzada: PET-TC en pr\xF3tesis, angio-TC)." : "Diagn\xF3stico rechazado: buscar diagn\xF3sticos alternativos.",
          level: categoria === "Definitiva" ? "danger" : categoria === "Posible" ? "warn" : "ok",
          details: [
            "Los criterios mayores incluyen ahora hemocultivos con nuevos microorganismos t\xEDpicos, PCR positiva en tejido/serolog\xEDa, y hallazgos en PET-TC.",
            "Los criterios menores incluyen fen\xF3menos vasculares/inmunol\xF3gicos, cat\xE9ter venoso central, drogadicci\xF3n intravenosa reciente, y hallazgos ecogr\xE1ficos sugestivos."
          ]
        };
      },
      notes: [
        "Los criterios ISCVID 2023 ampl\xEDan y actualizan los Duke modificados cl\xE1sicos, integrando t\xE9cnicas de imagen (PET-TC, angio-TC card\xEDaca) y microbiolog\xEDa molecular."
      ],
      references: [
        "Fowler VG, et al. The 2023 Duke-International Society for Cardiovascular Infectious Diseases Criteria for Infective Endocarditis. Clin Infect Dis. 2023;77(4):518-26."
      ]
    }
  ];

  // src/calculators/enfermeria.ts
  var CAT24 = "Valoraci\xF3n enfermera";
  var ENF = ["Enfermer\xEDa"];
  var enfermeria = [
    {
      id: "norton",
      name: "Norton (riesgo de UPP)",
      shortName: "Norton",
      description: "Riesgo de \xFAlceras por presi\xF3n seg\xFAn estado f\xEDsico, mental, actividad, movilidad e incontinencia.",
      category: CAT24,
      specialty: ENF,
      inputs: [
        {
          id: "fis",
          type: "select",
          label: "Estado f\xEDsico general",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 4, label: "4 \u2014 Bueno" },
            { value: 3, label: "3 \u2014 Mediano" },
            { value: 2, label: "2 \u2014 Regular" },
            { value: 1, label: "1 \u2014 Muy malo" }
          ]
        },
        {
          id: "men",
          type: "select",
          label: "Estado mental",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 4, label: "4 \u2014 Alerta" },
            { value: 3, label: "3 \u2014 Ap\xE1tico" },
            { value: 2, label: "2 \u2014 Confuso" },
            { value: 1, label: "1 \u2014 Estuporoso o comatoso" }
          ]
        },
        {
          id: "act",
          type: "select",
          label: "Actividad",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 4, label: "4 \u2014 Ambulante" },
            { value: 3, label: "3 \u2014 Camina con ayuda" },
            { value: 2, label: "2 \u2014 Sentado" },
            { value: 1, label: "1 \u2014 Encamado" }
          ]
        },
        {
          id: "mov",
          type: "select",
          label: "Movilidad",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 4, label: "4 \u2014 Total" },
            { value: 3, label: "3 \u2014 Disminuida" },
            { value: 2, label: "2 \u2014 Muy limitada" },
            { value: 1, label: "1 \u2014 Inm\xF3vil" }
          ]
        },
        {
          id: "inc",
          type: "select",
          label: "Incontinencia",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 4, label: "4 \u2014 Ninguna" },
            { value: 3, label: "3 \u2014 Ocasional" },
            { value: 2, label: "2 \u2014 Urinaria o fecal" },
            { value: 1, label: "1 \u2014 Doble incontinencia" }
          ]
        }
      ],
      compute: (v) => {
        const fis = v.fis ?? 4;
        const men = v.men ?? 4;
        const act = v.act ?? 4;
        const mov = v.mov ?? 4;
        const inc = v.inc ?? 4;
        const total = fis + men + act + mov + inc;
        let interpretation;
        let level;
        if (total <= 12) {
          level = "danger";
          interpretation = "\u{1F534} Riesgo alto \u2014 superficie especial de manejo de presi\xF3n, cambios posturales y revisi\xF3n diaria de la piel";
        } else if (total <= 14) {
          level = "warn";
          interpretation = "\u{1F7E0} Riesgo medio \u2014 pauta de cambios posturales y protecci\xF3n de prominencias \xF3seas";
        } else {
          level = "ok";
          interpretation = "\u{1F7E2} Riesgo m\xEDnimo \u2014 mantener vigilancia y reevaluar si cambia la situaci\xF3n";
        }
        return {
          main: `Norton ${total} / 20`,
          interpretation,
          level,
          details: [
            `F\xEDsico ${fis} \xB7 Mental ${men} \xB7 Actividad ${act} \xB7 Movilidad ${mov} \xB7 Incontinencia ${inc}`
          ]
        };
      }
    },
    {
      id: "morse",
      name: "Morse (riesgo de ca\xEDdas)",
      shortName: "Morse",
      description: "Riesgo de ca\xEDdas durante el ingreso hospitalario.",
      category: CAT24,
      specialty: ENF,
      inputs: [
        {
          id: "ant",
          type: "select",
          label: "Antecedente de ca\xEDdas recientes",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 0, label: "0 \u2014 No" },
            { value: 25, label: "25 \u2014 S\xED" }
          ]
        },
        {
          id: "dx",
          type: "select",
          label: "M\xE1s de un diagn\xF3stico m\xE9dico",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 0, label: "0 \u2014 No" },
            { value: 15, label: "15 \u2014 S\xED" }
          ]
        },
        {
          id: "ayu",
          type: "select",
          label: "Ayuda para deambular",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 0, label: "0 \u2014 Ninguna, reposo en cama o ayuda de enfermer\xEDa" },
            { value: 15, label: "15 \u2014 Muletas, bast\xF3n o andador" },
            { value: 30, label: "30 \u2014 Se apoya en el mobiliario" }
          ]
        },
        {
          id: "iv",
          type: "select",
          label: "Terapia intravenosa o v\xEDa heparinizada",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 0, label: "0 \u2014 No" },
            { value: 20, label: "20 \u2014 S\xED" }
          ]
        },
        {
          id: "mar",
          type: "select",
          label: "Marcha",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 0, label: "0 \u2014 Normal, reposo en cama o inmovilidad" },
            { value: 10, label: "10 \u2014 D\xE9bil" },
            { value: 20, label: "20 \u2014 Alterada o inestable" }
          ]
        },
        {
          id: "men",
          type: "select",
          label: "Estado mental",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 0, label: "0 \u2014 Consciente de sus limitaciones" },
            { value: 15, label: "15 \u2014 Olvida o sobreestima sus limitaciones" }
          ]
        }
      ],
      compute: (v) => {
        const ant = v.ant ?? 0;
        const dx = v.dx ?? 0;
        const ayu = v.ayu ?? 0;
        const iv = v.iv ?? 0;
        const mar = v.mar ?? 0;
        const men = v.men ?? 0;
        const total = ant + dx + ayu + iv + mar + men;
        let interpretation;
        let level;
        if (total >= 45) {
          level = "danger";
          interpretation = "\u{1F534} Riesgo alto \u2014 medidas espec\xEDficas de prevenci\xF3n de ca\xEDdas y registro en el plan de cuidados";
        } else if (total >= 25) {
          level = "warn";
          interpretation = "\u{1F7E0} Riesgo medio \u2014 medidas preventivas est\xE1ndar";
        } else {
          level = "ok";
          interpretation = "\u{1F7E2} Riesgo bajo \u2014 medidas b\xE1sicas de seguridad";
        }
        return {
          main: `Morse ${total} / 125`,
          interpretation,
          level,
          details: [
            `Antecedente ${ant} \xB7 Diagn\xF3sticos ${dx} \xB7 Ayuda ${ayu} \xB7 V\xEDa IV ${iv} \xB7 Marcha ${mar} \xB7 Mental ${men}`
          ]
        };
      }
    },
    {
      id: "dolor",
      name: "Dolor (EVA y escala num\xE9rica)",
      shortName: "Dolor \xB7 EVA",
      description: "Intensidad del dolor mediante escala visual anal\xF3gica o escala num\xE9rica verbal.",
      category: CAT24,
      specialty: ENF,
      inputs: [
        {
          id: "d",
          type: "select",
          label: "Intensidad referida por el paciente",
          dropdown: true,
          noPoints: true,
          options: [
            { value: 0, label: "0 \u2014 Sin dolor" },
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3" },
            { value: 4, label: "4" },
            { value: 5, label: "5" },
            { value: 6, label: "6" },
            { value: 7, label: "7" },
            { value: 8, label: "8" },
            { value: 9, label: "9" },
            { value: 10, label: "10 \u2014 El peor dolor imaginable" }
          ]
        }
      ],
      compute: (v) => {
        const d = v.d ?? 0;
        let interpretation;
        let level;
        if (d === 0) {
          level = "ok";
          interpretation = "\u{1F7E2} Sin dolor \u2014 mantener la reevaluaci\xF3n pautada";
        } else if (d <= 3) {
          level = "warn";
          interpretation = "\u{1F7E1} Dolor leve \u2014 medidas no farmacol\xF3gicas y analgesia de primer escal\xF3n si procede";
        } else if (d <= 6) {
          level = "warn";
          interpretation = "\u{1F7E0} Dolor moderado \u2014 revisar la pauta analg\xE9sica y reevaluar tras administrarla";
        } else {
          level = "danger";
          interpretation = "\u{1F534} Dolor intenso \u2014 analgesia de rescate y reevaluaci\xF3n precoz";
        }
        return {
          main: `Dolor ${d} / 10`,
          interpretation,
          level,
          details: ["Escala visual anal\xF3gica o escala num\xE9rica verbal"]
        };
      }
    }
  ];

  // src/calculators/index.ts
  var CATEGORIES = [
    "Gravedad en UCI y sepsis",
    "Neurocr\xEDtico e ictus",
    "Respiratorio cr\xEDtico y ventilaci\xF3n",
    "Renal, iones y equilibrio \xE1cido-base",
    "Hepatolog\xEDa y digestivo",
    "Hematolog\xEDa y oncolog\xEDa",
    "Trauma y quemados",
    "Riesgo perioperatorio",
    "V\xEDa a\xE9rea",
    "Fibrilaci\xF3n auricular y anticoagulaci\xF3n",
    "S\xEDndrome coronario agudo y dolor tor\xE1cico",
    "Insuficiencia card\xEDaca",
    "S\xEDncope",
    "Tromboembolismo venoso",
    "Criterios diagn\xF3sticos",
    "Gravedad y pron\xF3stico",
    "Dolor",
    "Respiratorio y ventilaci\xF3n",
    "Hemodin\xE1mica y fluidos",
    "Neurol\xF3gico, sedaci\xF3n y gravedad",
    "Alcohol y abstinencia",
    "Infecciones",
    "Endocrino y t\xF3xicos",
    "Antropometr\xEDa y metabolismo",
    "Funci\xF3n renal y ajuste de dosis",
    "Fluidos, electrolitos e infusiones",
    "Opioides, benzodiacepinas y controlados",
    "Neonatolog\xEDa y pediatr\xEDa",
    "Obstetricia y ginecolog\xEDa",
    "Neurolog\xEDa cr\xEDtica e ictus",
    "Urgencias y decisi\xF3n cl\xEDnica",
    "Medicina interna y familiar",
    "Geriatr\xEDa, fragilidad y salud mental",
    "Endocrino, obesidad y diabetes",
    "Hepato-digestivo y nutrici\xF3n",
    "Cirug\xEDa cardiotor\xE1cica y perioperatorio",
    "Enfermedad pleural",
    "Soporte extracorp\xF3reo",
    "Aorta y grandes vasos",
    "Farmacolog\xEDa y dosificaci\xF3n",
    "F\xF3rmulas y c\xE1lculos cl\xEDnicos",
    "Valoraci\xF3n enfermera"
  ];
  var SPECIALTIES = [
    "Anestesiolog\xEDa",
    "Cardiolog\xEDa",
    "Medicina Intensiva",
    "Farmacia",
    "Pediatr\xEDa",
    "Cuidados Cr\xEDticos Neonatales",
    "Neurolog\xEDa cr\xEDtica",
    "Emergencias",
    "Medicina Familiar",
    "Cirug\xEDa Cardiotor\xE1cica",
    "Obstetricia",
    "Enfermer\xEDa"
  ];
  var EXTRA_SPECIALTIES = {
    // Anestesiología ↔ Cardiología
    pam: ["Cardiolog\xEDa", "Medicina Intensiva"],
    rcri: ["Cardiolog\xEDa"],
    dasi: ["Cardiolog\xEDa", "Medicina Intensiva"],
    charlson: ["Cardiolog\xEDa", "Medicina Intensiva"],
    care: ["Cardiolog\xEDa"],
    cage: ["Cardiolog\xEDa"],
    vexus: ["Cardiolog\xEDa"],
    // Compartidas con Medicina Intensiva
    "fluidos-mantenimiento": ["Anestesiolog\xEDa", "Medicina Intensiva", "Farmacia"],
    "calcio-corregido": ["Anestesiolog\xEDa", "Medicina Intensiva"],
    qtc: ["Anestesiolog\xEDa"],
    diuresis: ["Anestesiolog\xEDa", "Medicina Intensiva"],
    light: ["Anestesiolog\xEDa", "Medicina Intensiva"],
    mews: ["Anestesiolog\xEDa", "Medicina Intensiva"],
    mmrc: ["Anestesiolog\xEDa", "Medicina Intensiva"],
    fick: ["Medicina Intensiva"],
    cpo: ["Medicina Intensiva"],
    ariscat: ["Medicina Intensiva"],
    heart: ["Medicina Intensiva"],
    "has-bled": ["Medicina Intensiva"],
    "cha2ds2-vasc": ["Medicina Intensiva"],
    chads2: ["Medicina Intensiva"],
    "atria-hemorragia": ["Medicina Intensiva"],
    hemorr2hages: ["Medicina Intensiva"],
    "brugada-tv": ["Medicina Intensiva"],
    sgarbossa: ["Medicina Intensiva"],
    nyha: ["Medicina Intensiva"],
    "ccs-angina": ["Medicina Intensiva"],
    "framingham-ic": ["Medicina Intensiva"],
    "duke-endocarditis": ["Medicina Intensiva"],
    ginebra: ["Medicina Intensiva"],
    hestia: ["Medicina Intensiva"],
    padua: ["Medicina Intensiva"],
    "improve-tev": ["Medicina Intensiva"],
    "dimero-edad": ["Medicina Intensiva"],
    perc: ["Medicina Intensiva"],
    "wells-ep": ["Medicina Intensiva"],
    "wells-tvp": ["Medicina Intensiva"],
    nhfs: ["Medicina Intensiva"],
    "el-ganzouri": ["Medicina Intensiva"],
    heaven: ["Medicina Intensiva"],
    mallampati: ["Medicina Intensiva"],
    bps: ["Medicina Intensiva"],
    nvps: ["Medicina Intensiva"],
    abbey: ["Medicina Intensiva"],
    flacc: ["Medicina Intensiva"],
    rdos: ["Medicina Intensiva"],
    baws: ["Medicina Intensiva"],
    drip: ["Medicina Intensiva"],
    "masa-libre-grasa": ["Medicina Intensiva"],
    "anestesicos-locales": ["Medicina Intensiva"],
    mabl: ["Medicina Intensiva"],
    "fluidos-intraoperatorios": ["Medicina Intensiva"],
    reticulocitos: ["Medicina Intensiva"],
    sofa: ["Medicina Intensiva"],
    "spo2-fio2": ["Medicina Intensiva"],
    // Compartidas con Farmacia
    "cockcroft-gault": ["Anestesiolog\xEDa", "Medicina Intensiva", "Farmacia"],
    mdrd: ["Farmacia"],
    "imc-sc": ["Farmacia", "Medicina Intensiva"],
    "peso-ideal": ["Farmacia", "Medicina Intensiva"],
    "gasto-energetico": ["Farmacia", "Medicina Intensiva"],
    "masa-libre-grasa-farm": ["Farmacia"],
    "anestesicos-locales-farm": ["Farmacia"],
    "fluidos-intraoperatorios-farm": ["Farmacia"],
    crioprecipitado: ["Farmacia"],
    "etanol-estimado": ["Farmacia"],
    "deficit-agua-libre": ["Farmacia"],
    "deficit-bicarbonato": ["Farmacia"],
    "tpa-ictus": ["Farmacia"],
    "ritmo-goteo": ["Farmacia"]
  };
  var ALL = [
    ...uciGravedad,
    ...neurocritico,
    ...respiratorioCritico,
    ...renalMetabolico,
    ...hepatoDigestivo,
    ...hematoTrauma,
    ...riesgo,
    ...viaAerea,
    ...cardioFA,
    ...cardioSCA,
    ...cardioICSincope,
    ...cardioTEV,
    ...cardioVarios,
    ...dolor,
    ...respiratorio,
    ...hemodinamica,
    ...neuro,
    ...alcohol,
    ...infecciones,
    ...antropometria,
    ...farmacologia,
    ...farmaciaFormulas,
    ...farmaciaOpioides,
    ...pediatria,
    ...pediatria2,
    ...primaryCare,
    ...familyPractice,
    ...neuroCritica,
    ...urgencias,
    ...medicinaFamilia,
    ...cardiotoracica,
    ...formulas,
    ...enfermeria
  ];
  var CALCULATORS = ALL.map((c) => {
    const extra = EXTRA_SPECIALTIES[c.id];
    return extra ? { ...c, specialty: [.../* @__PURE__ */ new Set([...c.specialty, ...extra])] } : c;
  });
  return __toCommonJS(index_exports);
})();
window.ENFERIX_ESCALAS_DATA = { CATEGORIES: __enferix_escalas.CATEGORIES, SPECIALTIES: __enferix_escalas.SPECIALTIES, CALCULATORS: __enferix_escalas.CALCULATORS };
