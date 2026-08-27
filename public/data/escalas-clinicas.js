/* =========================================================================
   Enferix · Índices y escalas clínicas
   190 calculadoras de Anestesiología (46), Cardiología (69), Medicina
   Intensiva (131) y Farmacia (24); muchas escalas se comparten entre
   especialidades, por eso las cifras suman más que el total. Incluye
   fórmulas, notas clínicas, referencias bibliográficas y las advertencias
   de seguridad de cada escala.
   Portado del proyecto React+TypeScript juankydue-dev/inurse (rama main)
   a JavaScript plano con esbuild; define
   window.ENFERIX_ESCALAS_DATA = { CATEGORIES, SPECIALTIES, CALCULATORS }.
   La interfaz que lo consume vive en
   /js/calculadoras/inurse-escalas-clinicas-js.js.
   ========================================================================= */
(() => {
  // inurse-main/src/engine/types.ts
  var sum = (v, ids) => ids.reduce((acc, id) => {
    var _a;
    return acc + ((_a = v[id]) != null ? _a : 0);
  }, 0);
  var fmt = (n, dec = 0) => n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: dec });

  // inurse-main/src/calculators/riesgo.ts
  var CAT = "Riesgo perioperatorio";
  var ANES = ["Anestesiología"];
  var riesgo = [
    {
      id: "rcri",
      name: "Índice de riesgo cardíaco revisado (RCRI)",
      shortName: "RCRI · Lee",
      description: "Estima el riesgo de complicaciones cardíacas mayores tras una cirugía no cardíaca.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "altoRiesgo",
          type: "boolean",
          label: "Cirugía de alto riesgo",
          description: "Intraperitoneal, intratorácica o vascular suprainguinal."
        },
        {
          id: "cardiopatia",
          type: "boolean",
          label: "Antecedentes de cardiopatía isquémica",
          description: "Infarto de miocardio previo, prueba de esfuerzo positiva, dolor torácico de origen isquémico, tratamiento con nitratos o ECG con ondas Q patológicas."
        },
        {
          id: "icc",
          type: "boolean",
          label: "Antecedentes de insuficiencia cardíaca congestiva",
          description: "Edema pulmonar, crepitantes bilaterales o galope S3, disnea paroxística nocturna o radiografía con redistribución vascular."
        },
        {
          id: "acv",
          type: "boolean",
          label: "Antecedentes de enfermedad cerebrovascular",
          description: "Ictus o accidente isquémico transitorio (AIT) previos."
        },
        {
          id: "insulina",
          type: "boolean",
          label: "Diabetes en tratamiento con insulina preoperatoria"
        },
        {
          id: "creatinina",
          type: "boolean",
          label: "Creatinina preoperatoria > 2 mg/dL (177 µmol/L)"
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
          secondaryLabel: "riesgo de evento cardíaco mayor",
          interpretation: `Clase ${clase} de Lee. Riesgo estimado de infarto, edema pulmonar, fibrilación ventricular, parada cardíaca o bloqueo AV completo en el perioperatorio.`,
          level: score === 0 ? "ok" : score === 1 ? "info" : score === 2 ? "warn" : "danger"
        };
      },
      notes: [
        "Porcentajes de la cohorte original de Lee (clases I–IV: 0,5 / 1,3 / 3,6 / 9,1 %).",
        "Validaciones contemporáneas con vigilancia sistemática de troponinas estiman riesgos mayores (aprox. 3,9 / 6,0 / 10,1 / 15 % para 0, 1, 2 y ≥3 puntos).",
        "Con ≥1 punto y cirugía de riesgo, valorar optimización y vigilancia postoperatoria de troponinas según guías."
      ],
      references: [
        "Lee TH, et al. Derivation and prospective validation of a simple index for prediction of cardiac risk of major noncardiac surgery. Circulation. 1999;100(10):1043-9.",
        "Duceppe E, et al. Canadian Cardiovascular Society Guidelines on Perioperative Cardiac Risk Assessment. Can J Cardiol. 2017;33(1):17-32."
      ]
    },
    {
      id: "stop-bang",
      name: "Puntuación STOP-BANG para apnea obstructiva del sueño",
      shortName: "STOP-BANG",
      description: "Cribado del síndrome de apnea-hipopnea obstructiva del sueño (SAHOS).",
      category: CAT,
      specialty: ANES,
      inputs: [
        { id: "s", type: "boolean", label: "Ronquidos fuertes (Snoring)", description: "Más fuertes que una conversación o audibles a través de una puerta cerrada." },
        { id: "t", type: "boolean", label: "Cansancio diurno (Tiredness)", description: "Fatiga o somnolencia diurna frecuente." },
        { id: "o", type: "boolean", label: "Apneas observadas (Observed)", description: "Alguien ha observado pausas respiratorias durante el sueño." },
        { id: "p", type: "boolean", label: "Hipertensión arterial (Pressure)", description: "En tratamiento o diagnosticada." },
        { id: "b", type: "boolean", label: "IMC > 35 kg/m² (BMI)" },
        { id: "a", type: "boolean", label: "Edad > 50 años (Age)" },
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
          interpretation: `Riesgo ${band} de apnea obstructiva del sueño.${altRisk && score < 5 ? " (≥2 criterios STOP junto con sexo masculino, IMC >35 o cuello >40 cm también clasifica como riesgo alto)." : ""}`,
          level: high ? "danger" : score >= 3 ? "warn" : "ok"
        };
      },
      notes: [
        "0–2: riesgo bajo · 3–4: riesgo intermedio · 5–8: riesgo alto.",
        "Riesgo alto alternativo: ≥2 ítems STOP + sexo masculino, o IMC >35, o cuello >40 cm.",
        "En riesgo alto, considerar estudio de sueño y precauciones perioperatorias (vía aérea, opioides, monitorización)."
      ],
      references: [
        "Chung F, et al. STOP questionnaire: a tool to screen patients for obstructive sleep apnea. Anesthesiology. 2008;108(5):812-21.",
        "Chung F, et al. STOP-Bang Questionnaire: a practical approach to screen for obstructive sleep apnea. Chest. 2016;149(3):631-8."
      ]
    },
    {
      id: "ariscat",
      name: "Puntuación ARISCAT de complicaciones pulmonares postoperatorias",
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
            { label: "≤ 50 años", value: 0 },
            { label: "51–80 años", value: 3 },
            { label: "> 80 años", value: 16 }
          ]
        },
        {
          id: "spo2",
          type: "select",
          label: "SpO₂ preoperatoria (aire ambiente, sedestación)",
          options: [
            { label: "≥ 96 %", value: 0 },
            { label: "91–95 %", value: 8 },
            { label: "≤ 90 %", value: 24 }
          ]
        },
        {
          id: "infeccion",
          type: "boolean",
          label: "Infección respiratoria en el último mes",
          description: "Con fiebre y tratamiento antibiótico.",
          points: 17
        },
        {
          id: "anemia",
          type: "boolean",
          label: "Anemia preoperatoria (Hb ≤ 10 g/dL)",
          points: 11
        },
        {
          id: "incision",
          type: "select",
          label: "Localización de la incisión quirúrgica",
          options: [
            { label: "Periférica", value: 0 },
            { label: "Abdominal superior", value: 15 },
            { label: "Intratorácica", value: 24 }
          ]
        },
        {
          id: "duracion",
          type: "select",
          label: "Duración prevista de la cirugía",
          options: [
            { label: "≤ 2 h", value: 0 },
            { label: "> 2–3 h", value: 16 },
            { label: "> 3 h", value: 23 }
          ]
        },
        { id: "urgente", type: "boolean", label: "Cirugía urgente", points: 8 }
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
          interpretation: `Riesgo ${band} de complicaciones pulmonares postoperatorias (insuficiencia respiratoria, infección, derrame, atelectasia, neumotórax, broncoespasmo o neumonitis por aspiración).`,
          level
        };
      },
      notes: [
        "< 26 puntos: riesgo bajo (1,6 %) · 26–44: intermedio (13,3 %) · ≥ 45: alto (42,1 %).",
        "En riesgo intermedio-alto: optimización preoperatoria, fisioterapia respiratoria, ventilación protectora y analgesia eficaz."
      ],
      references: [
        "Canet J, et al. Prediction of postoperative pulmonary complications in a population-based surgical cohort (ARISCAT). Anesthesiology. 2010;113(6):1338-50."
      ]
    },
    {
      id: "apfel",
      name: "Escala de Apfel para náuseas y vómitos postoperatorios",
      shortName: "Apfel · NVPO",
      description: "Predice el riesgo de náuseas y vómitos postoperatorios (NVPO) en las primeras 24 h.",
      category: CAT,
      specialty: ANES,
      inputs: [
        { id: "mujer", type: "boolean", label: "Sexo femenino" },
        { id: "noFumador", type: "boolean", label: "No fumador/a" },
        {
          id: "antecedentes",
          type: "boolean",
          label: "Antecedentes de NVPO o cinetosis",
          description: "NVPO en cirugías previas o mareo por movimiento."
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
          interpretation: score <= 1 ? "Riesgo bajo: profilaxis según contexto quirúrgico." : score === 2 ? "Riesgo moderado: se recomienda profilaxis con 1–2 antieméticos." : "Riesgo alto: profilaxis multimodal (≥2 antieméticos) y considerar anestesia total intravenosa.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      notes: ["Riesgo aproximado: 0 → 10 %, 1 → 21 %, 2 → 39 %, 3 → 61 %, 4 → 79 %."],
      references: [
        "Apfel CC, et al. A simplified risk score for predicting postoperative nausea and vomiting. Anesthesiology. 1999;91(3):693-700.",
        "Gan TJ, et al. Fourth Consensus Guidelines for the Management of Postoperative Nausea and Vomiting. Anesth Analg. 2020;131(2):411-48."
      ]
    },
    {
      id: "asa",
      name: "Clasificación del estado físico ASA",
      shortName: "ASA",
      description: "Clasifica el estado de salud del paciente antes de la cirugía según la American Society of Anesthesiologists.",
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
            { label: "ASA I — Paciente sano", value: 1 },
            { label: "ASA II — Enfermedad sistémica leve", value: 2 },
            { label: "ASA III — Enfermedad sistémica grave", value: 3 },
            { label: "ASA IV — Enfermedad sistémica grave con amenaza constante para la vida", value: 4 },
            { label: "ASA V — Paciente moribundo; no se espera que sobreviva sin la cirugía", value: 5 },
            { label: "ASA VI — Muerte cerebral declarada; donante de órganos", value: 6 }
          ]
        },
        {
          id: "urgencia",
          type: "boolean",
          label: "Cirugía urgente (añadir sufijo «E»)",
          noPoints: true,
          description: "El retraso del tratamiento supondría un aumento significativo del riesgo."
        }
      ],
      compute: (v) => {
        var _a;
        const c = (_a = v.clase) != null ? _a : 1;
        const desc = [
          "",
          "Sano, sin enfermedad sistémica; no fumador, consumo de alcohol nulo o mínimo.",
          "Enfermedad sistémica leve sin limitación funcional (p. ej., fumador, embarazo, obesidad 30–40, DM o HTA bien controladas, EPOC leve).",
          "Enfermedad sistémica grave con limitación funcional (p. ej., DM o HTA mal controladas, EPOC, obesidad ≥40, hepatitis activa, marcapasos, FEVI reducida, IAM/ACV/AIT/stents hace >3 meses, ERC en diálisis programada).",
          "Enfermedad grave con amenaza constante para la vida (p. ej., IAM/ACV/AIT/stents hace <3 meses, isquemia miocárdica en curso, disfunción valvular grave, sepsis, CID, SDRA, ERC terminal sin diálisis programada).",
          "Paciente moribundo que no se espera que sobreviva sin la intervención (p. ej., rotura de aneurisma, traumatismo masivo, isquemia intestinal con fallo multiorgánico).",
          "Paciente con muerte cerebral declarada para extracción de órganos."
        ][c];
        return {
          main: `ASA ${["", "I", "II", "III", "IV", "V", "VI"][c]}${v.urgencia ? " E" : ""}`,
          interpretation: desc + (v.urgencia ? " Cirugía de carácter urgente («E»)." : ""),
          level: c <= 2 ? "ok" : c === 3 ? "warn" : "danger"
        };
      },
      notes: [
        "La clasificación ASA por sí sola no predice el riesgo perioperatorio: debe interpretarse junto con el tipo de cirugía y la optimización del paciente."
      ],
      references: [
        "ASA Physical Status Classification System. American Society of Anesthesiologists (última actualización 2020)."
      ]
    },
    {
      id: "apgar-quirurgico",
      name: "Puntuación de Apgar quirúrgica (SAS)",
      shortName: "Apgar quirúrgico",
      description: "Predice el riesgo de complicaciones mayores o muerte en los 30 días posteriores a la cirugía a partir de datos intraoperatorios.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "sangrado",
          type: "select",
          label: "Pérdida sanguínea estimada",
          options: [
            { label: "≤ 100 mL", value: 3 },
            { label: "101–600 mL", value: 2 },
            { label: "601–1000 mL", value: 1 },
            { label: "> 1000 mL", value: 0 }
          ]
        },
        {
          id: "pam",
          type: "select",
          label: "PAM más baja durante la cirugía",
          options: [
            { label: "≥ 70 mmHg", value: 3 },
            { label: "55–69 mmHg", value: 2 },
            { label: "40–54 mmHg", value: 1 },
            { label: "< 40 mmHg", value: 0 }
          ]
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia cardíaca más baja durante la cirugía",
          options: [
            { label: "≤ 55 lpm", value: 4 },
            { label: "56–65 lpm", value: 3 },
            { label: "66–75 lpm", value: 2 },
            { label: "76–85 lpm", value: 1 },
            { label: "> 85 lpm", value: 0 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["sangrado", "pam", "fc"]);
        const band = score >= 7 ? "bajo" : score >= 5 ? "intermedio" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          interpretation: band === "bajo" ? "Riesgo bajo de complicación mayor o muerte a 30 días." : band === "intermedio" ? "Riesgo intermedio: valorar vigilancia postoperatoria estrecha." : "Riesgo alto de complicación mayor o muerte a 30 días: considerar cuidados intensivos/intermedios.",
          level: band === "bajo" ? "ok" : band === "intermedio" ? "warn" : "danger"
        };
      },
      notes: [
        "Puntuaciones más bajas indican mayor riesgo; ≤ 4 identifica al grupo de mayor riesgo.",
        "En caso de ritmos anómalos (p. ej., bradiarritmias por bloqueo), usar la FC sinusal más baja registrada."
      ],
      references: [
        "Gawande AA, et al. An Apgar score for surgery. J Am Coll Surg. 2007;204(2):201-8."
      ]
    },
    {
      id: "care",
      name: "Puntuación CARE de riesgo en anestesia cardíaca",
      shortName: "CARE",
      description: "Clasificación ordinal sencilla que predice morbimortalidad tras cirugía cardíaca.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "clase",
          type: "select",
          label: "Categoría CARE",
          dropdown: true,
          noPoints: true,
          options: [
            {
              label: "CARE 1 — Cardiopatía estable, sin otros problemas médicos; cirugía no compleja",
              value: 1
            },
            {
              label: "CARE 2 — Cardiopatía estable con uno o más problemas médicos controlados; cirugía no compleja",
              value: 2
            },
            {
              label: "CARE 3 — Cualquier problema médico no controlado O cirugía compleja",
              value: 3
            },
            {
              label: "CARE 4 — Problema médico no controlado Y cirugía compleja",
              value: 4
            },
            {
              label: "CARE 5 — Cardiopatía crónica o avanzada; cirugía como última esperanza de salvar o mejorar la vida",
              value: 5
            }
          ]
        },
        {
          id: "urgencia",
          type: "boolean",
          label: "Cirugía de urgencia (añadir sufijo «E»)",
          noPoints: true,
          description: "Debe operarse tan pronto como el diagnóstico y el quirófano lo permitan."
        }
      ],
      compute: (v) => {
        var _a;
        const c = (_a = v.clase) != null ? _a : 1;
        const ejemplos = [
          "",
          "Ejemplos de problemas no controlados: angina inestable, insuficiencia cardíaca descompensada, HTA grave, insuficiencia renal aguda.",
          "Ejemplos de problemas controlados: HTA, diabetes, EPOC, enfermedades sistémicas controladas.",
          "Cirugía compleja: reintervención, cirugía combinada, cirugía de aorta, FEVI < 0,35, etc.",
          "Combina enfermedad no controlada y cirugía compleja: riesgo elevado.",
          "Riesgo muy elevado de mortalidad y morbilidad."
        ][c];
        return {
          main: `CARE ${c}${v.urgencia ? " E" : ""}`,
          interpretation: `A mayor categoría, mayor mortalidad y morbilidad hospitalarias; la urgencia («E») incrementa el riesgo dentro de cada categoría. ${ejemplos}`,
          level: c <= 2 ? "ok" : c === 3 ? "warn" : "danger"
        };
      },
      references: [
        "Dupuis JY, et al. The Cardiac Anesthesia Risk Evaluation score: a clinically useful predictor of mortality and morbidity after cardiac surgery. Anesthesiology. 2001;94(2):194-204."
      ]
    },
    {
      id: "nhfs",
      name: "Puntuación de fractura de cadera de Nottingham (NHFS)",
      shortName: "NHFS",
      description: "Predice la mortalidad a 30 días tras la cirugía de fractura de cadera.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 66 años", value: 0 },
            { label: "66–85 años", value: 3 },
            { label: "≥ 86 años", value: 4 }
          ]
        },
        { id: "varon", type: "boolean", label: "Sexo masculino" },
        {
          id: "hb",
          type: "boolean",
          label: "Hemoglobina ≤ 10 g/dL al ingreso"
        },
        {
          id: "amts",
          type: "boolean",
          label: "Deterioro cognitivo (AMTS ≤ 6/10)",
          description: "Abbreviated Mental Test Score al ingreso."
        },
        {
          id: "residencia",
          type: "boolean",
          label: "Vive en una institución",
          description: "Residencia o centro sociosanitario."
        },
        {
          id: "comorbilidades",
          type: "boolean",
          label: "≥ 2 comorbilidades",
          description: "Entre: cardiopatía, enfermedad cerebrovascular, EPOC/enfermedad respiratoria, enfermedad renal y diabetes."
        },
        {
          id: "cancer",
          type: "boolean",
          label: "Neoplasia activa en los últimos 20 años"
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "varon", "hb", "amts", "residencia", "comorbilidades", "cancer"]);
        const band = score <= 4 ? "bajo" : score === 5 ? "intermedio" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          interpretation: band === "bajo" ? "Riesgo bajo de mortalidad a 30 días (orientativamente < 7 %)." : band === "intermedio" ? "Riesgo intermedio de mortalidad a 30 días (orientativamente ≈ 10 %)." : "Riesgo alto de mortalidad a 30 días (orientativamente > 15 %): optimización y planificación multidisciplinar precoces.",
          level: band === "bajo" ? "ok" : band === "intermedio" ? "warn" : "danger"
        };
      },
      notes: [
        "Los porcentajes son orientativos; la mortalidad exacta por punto varía entre cohortes de validación.",
        "Útil para informar a pacientes y familias y para priorizar la valoración ortogeriátrica."
      ],
      references: [
        "Maxwell MJ, et al. Development and validation of a preoperative scoring system to predict 30 day mortality in patients undergoing hip fracture surgery. Br J Anaesth. 2008;101(4):511-7.",
        "Wiles MD, et al. Nottingham Hip Fracture Score as a predictor of one year mortality. Br J Anaesth. 2011;106(4):501-4."
      ]
    },
    {
      id: "charlson",
      name: "Índice de comorbilidad de Charlson (CCI)",
      shortName: "Charlson",
      description: "Predice la supervivencia a 10 años en pacientes con múltiples comorbilidades.",
      category: CAT,
      specialty: ANES,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 50 años", value: 0 },
            { label: "50–59 años", value: 1 },
            { label: "60–69 años", value: 2 },
            { label: "70–79 años", value: 3 },
            { label: "≥ 80 años", value: 4 }
          ]
        },
        { id: "iam", type: "boolean", label: "Infarto de miocardio", description: "Antecedente de IAM (no solo cambios ECG)." },
        { id: "icc", type: "boolean", label: "Insuficiencia cardíaca congestiva" },
        { id: "evp", type: "boolean", label: "Enfermedad vascular periférica", description: "Incluye claudicación, cirugía o aneurisma aórtico ≥ 6 cm." },
        { id: "acv", type: "boolean", label: "Enfermedad cerebrovascular (ACV o AIT)", description: "Con secuelas leves o sin secuelas. La hemiplejía puntúa aparte." },
        { id: "demencia", type: "boolean", label: "Demencia" },
        { id: "epoc", type: "boolean", label: "Enfermedad pulmonar crónica" },
        { id: "conectivo", type: "boolean", label: "Enfermedad del tejido conectivo" },
        { id: "ulcera", type: "boolean", label: "Enfermedad ulcerosa péptica" },
        {
          id: "higado",
          type: "select",
          label: "Hepatopatía",
          options: [
            { label: "Ninguna", value: 0 },
            { label: "Leve (hepatitis crónica o cirrosis sin hipertensión portal)", value: 1 },
            { label: "Moderada-grave (hipertensión portal, varices)", value: 3 }
          ]
        },
        {
          id: "diabetes",
          type: "select",
          label: "Diabetes mellitus",
          options: [
            { label: "No o controlada con dieta", value: 0 },
            { label: "Sin lesión de órgano diana", value: 1 },
            { label: "Con lesión de órgano diana (retinopatía, nefropatía, neuropatía)", value: 2 }
          ]
        },
        { id: "hemiplejia", type: "boolean", label: "Hemiplejía", points: 2 },
        {
          id: "renal",
          type: "boolean",
          label: "Enfermedad renal moderada-grave",
          description: "Creatinina > 3 mg/dL, diálisis, trasplante o uremia.",
          points: 2
        },
        {
          id: "tumor",
          type: "select",
          label: "Tumor sólido",
          options: [
            { label: "No", value: 0 },
            { label: "Localizado (en los últimos 5 años)", value: 2 },
            { label: "Metastásico", value: 6 }
          ]
        },
        { id: "leucemia", type: "boolean", label: "Leucemia", points: 2 },
        { id: "linfoma", type: "boolean", label: "Linfoma", points: 2 },
        {
          id: "sida",
          type: "boolean",
          label: "SIDA",
          description: "Enfermedad definitoria de SIDA (no solo infección por VIH).",
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
          secondaryLabel: "supervivencia estimada a 10 años",
          interpretation: score <= 2 ? "Carga de comorbilidad baja." : score <= 4 ? "Carga de comorbilidad moderada." : "Carga de comorbilidad alta: pronóstico vital significativamente limitado.",
          level: score <= 2 ? "ok" : score <= 4 ? "warn" : "danger",
          details: [`Supervivencia a 10 años = 0,983^e^(0,9 × ${score}) (fórmula original de Charlson).`]
        };
      },
      notes: [
        "Versión combinada edad-comorbilidad (Charlson-Deyo con puntos por década a partir de los 50 años).",
        "Si coexisten dos grados de la misma enfermedad (p. ej., tumor localizado y metastásico), puntúa solo el más grave."
      ],
      references: [
        "Charlson ME, et al. A new method of classifying prognostic comorbidity in longitudinal studies. J Chronic Dis. 1987;40(5):373-83.",
        "Charlson ME, et al. Validation of a combined comorbidity index. J Clin Epidemiol. 1994;47(11):1245-51."
      ]
    },
    {
      id: "dasi",
      name: "Índice de estado de actividad de Duke (DASI)",
      shortName: "DASI",
      description: "Estima la capacidad funcional (VO₂ pico y METs) a partir de 12 actividades de la vida diaria.",
      category: CAT,
      specialty: ANES,
      inputs: [
        { id: "q1", type: "boolean", label: "¿Puede cuidar de sí mismo/a?", description: "Comer, vestirse, bañarse o ir al baño.", points: 2.75 },
        { id: "q2", type: "boolean", label: "¿Caminar dentro de casa?", points: 1.75 },
        { id: "q3", type: "boolean", label: "¿Caminar 1–2 manzanas en llano?", points: 2.75 },
        { id: "q4", type: "boolean", label: "¿Subir un tramo de escaleras o una cuesta?", points: 5.5 },
        { id: "q5", type: "boolean", label: "¿Correr una distancia corta?", points: 8 },
        { id: "q6", type: "boolean", label: "¿Tareas domésticas ligeras?", description: "Quitar el polvo, fregar los platos.", points: 2.7 },
        { id: "q7", type: "boolean", label: "¿Tareas domésticas moderadas?", description: "Pasar la aspiradora, barrer, llevar la compra.", points: 3.5 },
        { id: "q8", type: "boolean", label: "¿Tareas domésticas pesadas?", description: "Fregar suelos, levantar o mover muebles.", points: 8 },
        { id: "q9", type: "boolean", label: "¿Trabajo de jardinería?", description: "Rastrillar hojas, quitar malas hierbas, cortar el césped.", points: 4.5 },
        { id: "q10", type: "boolean", label: "¿Mantener relaciones sexuales?", points: 5.25 },
        { id: "q11", type: "boolean", label: "¿Actividades recreativas moderadas?", description: "Golf, bolos, baile, tenis en dobles.", points: 6 },
        { id: "q12", type: "boolean", label: "¿Deportes extenuantes?", description: "Natación, tenis individual, fútbol, baloncesto, esquí.", points: 7.5 }
      ],
      compute: (v) => {
        const score = sum(v, ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12"]);
        const vo2 = 0.43 * score + 9.6;
        const mets = vo2 / 3.5;
        return {
          main: fmt(score, 2),
          mainUnit: "puntos (0–58,2)",
          secondary: `${fmt(mets, 1)} METs`,
          secondaryLabel: "capacidad funcional estimada",
          interpretation: score >= 34 ? "DASI ≥ 34: buena capacidad funcional, asociada a menor riesgo de complicaciones perioperatorias." : "DASI < 34: capacidad funcional reducida, asociada a mayor riesgo de eventos cardíacos y complicaciones tras cirugía no cardíaca.",
          level: score >= 34 ? "ok" : "warn",
          details: [`VO₂ pico estimado = 0,43 × DASI + 9,6 = ${fmt(vo2, 1)} mL/kg/min.`]
        };
      },
      notes: [
        "Cada actividad que el paciente puede realizar suma su peso; las que no puede realizar suman 0.",
        "El umbral DASI < 34 se asoció a mayor riesgo de lesión miocárdica y complicaciones en el estudio METS (2018)."
      ],
      references: [
        "Hlatky MA, et al. A brief self-administered questionnaire to determine functional capacity (the Duke Activity Status Index). Am J Cardiol. 1989;64(10):651-4.",
        "Wijeysundera DN, et al. Assessment of functional capacity before major non-cardiac surgery (METS study). Lancet. 2018;391(10140):2631-40."
      ]
    }
  ];

  // inurse-main/src/calculators/dolor.ts
  var CAT2 = "Dolor";
  var ANES2 = ["Anestesiología"];
  var dolor = [
    {
      id: "flacc",
      name: "Escala FLACC (cara, piernas, actividad, llanto, consolabilidad)",
      shortName: "FLACC",
      description: "Evalúa el dolor postoperatorio en niños pequeños (2 meses – 7 años) y en pacientes que no pueden comunicarlo.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "cara",
          type: "select",
          label: "Cara",
          dropdown: true,
          options: [
            { label: "0 — Sin expresión particular o sonríe", value: 0 },
            { label: "1 — Muecas o ceño fruncido ocasionales; retraído, desinteresado", value: 1 },
            { label: "2 — Ceño fruncido frecuente o constante, mandíbula apretada, temblor de mentón", value: 2 }
          ]
        },
        {
          id: "piernas",
          type: "select",
          label: "Piernas",
          dropdown: true,
          options: [
            { label: "0 — Posición normal o relajadas", value: 0 },
            { label: "1 — Inquietas, intranquilas, tensas", value: 1 },
            { label: "2 — Patalea o piernas encogidas", value: 2 }
          ]
        },
        {
          id: "actividad",
          type: "select",
          label: "Actividad",
          dropdown: true,
          options: [
            { label: "0 — Tumbado tranquilo, posición normal, se mueve con facilidad", value: 0 },
            { label: "1 — Se retuerce, se balancea, tenso", value: 1 },
            { label: "2 — Arqueado, rígido o con sacudidas", value: 2 }
          ]
        },
        {
          id: "llanto",
          type: "select",
          label: "Llanto",
          dropdown: true,
          options: [
            { label: "0 — Sin llanto (despierto o dormido)", value: 0 },
            { label: "1 — Gemidos o lloriqueos; quejas ocasionales", value: 1 },
            { label: "2 — Llanto mantenido, gritos o sollozos; quejas frecuentes", value: 2 }
          ]
        },
        {
          id: "consolabilidad",
          type: "select",
          label: "Consolabilidad",
          dropdown: true,
          options: [
            { label: "0 — Contento, relajado", value: 0 },
            { label: "1 — Se tranquiliza al tocarlo, abrazarlo o hablarle; distraíble", value: 1 },
            { label: "2 — Difícil de consolar o reconfortar", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["cara", "piernas", "actividad", "llanto", "consolabilidad"]);
        const band = score === 0 ? "Relajado y cómodo" : score <= 3 ? "Malestar leve" : score <= 6 ? "Dolor moderado" : "Dolor intenso o malestar importante";
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          interpretation: `${band}.${score >= 4 ? " Valorar analgesia y reevaluar tras la intervención." : ""}`,
          level: score === 0 ? "ok" : score <= 3 ? "info" : score <= 6 ? "warn" : "danger"
        };
      },
      notes: [
        "0: relajado · 1–3: malestar leve · 4–6: dolor moderado · 7–10: dolor intenso.",
        "Observar 1–5 minutos con el paciente descubierto; recolocar o observar durante la movilización si está dormido."
      ],
      references: [
        "Merkel SI, et al. The FLACC: a behavioral scale for scoring postoperative pain in young children. Pediatr Nurs. 1997;23(3):293-7."
      ]
    },
    {
      id: "bps",
      name: "Escala de dolor conductual (BPS) para pacientes intubados",
      shortName: "BPS",
      description: "Cuantifica el dolor en pacientes críticos intubados y sedados mediante tres indicadores conductuales.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "facial",
          type: "select",
          label: "Expresión facial",
          dropdown: true,
          options: [
            { label: "1 — Relajada", value: 1 },
            { label: "2 — Parcialmente tensa (p. ej., ceño fruncido)", value: 2 },
            { label: "3 — Totalmente tensa (p. ej., párpados apretados)", value: 3 },
            { label: "4 — Muecas de dolor", value: 4 }
          ]
        },
        {
          id: "miembros",
          type: "select",
          label: "Miembros superiores",
          dropdown: true,
          options: [
            { label: "1 — Sin movimiento", value: 1 },
            { label: "2 — Parcialmente flexionados", value: 2 },
            { label: "3 — Muy flexionados con flexión de los dedos", value: 3 },
            { label: "4 — Retracción permanente", value: 4 }
          ]
        },
        {
          id: "ventilacion",
          type: "select",
          label: "Adaptación a la ventilación mecánica",
          dropdown: true,
          options: [
            { label: "1 — Tolera la ventilación", value: 1 },
            { label: "2 — Tose, pero tolera la ventilación la mayor parte del tiempo", value: 2 },
            { label: "3 — Lucha contra el ventilador", value: 3 },
            { label: "4 — Imposible controlar la ventilación", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["facial", "miembros", "ventilacion"]);
        return {
          main: String(score),
          mainUnit: "puntos (3–12)",
          interpretation: score === 3 ? "Sin dolor aparente." : score <= 5 ? "Dolor leve: vigilar y reevaluar." : score <= 8 ? "Dolor significativo (BPS ≥ 6): se recomienda tratar y reevaluar." : "Dolor intenso: tratamiento analgésico inmediato y reevaluación.",
          level: score === 3 ? "ok" : score <= 5 ? "info" : score <= 8 ? "warn" : "danger"
        };
      },
      notes: [
        "Un BPS ≥ 6 se considera dolor significativo que requiere tratamiento.",
        "Existe la variante BPS-NI (no intubados) que sustituye el ítem ventilatorio por la vocalización."
      ],
      references: [
        "Payen JF, et al. Assessing pain in critically ill sedated patients by using a behavioral pain scale. Crit Care Med. 2001;29(12):2258-63."
      ]
    },
    {
      id: "nvps",
      name: "Escala de dolor no verbal (NVPS)",
      shortName: "NVPS",
      description: "Cuantifica el dolor en pacientes que no pueden comunicarse (intubación, sedación, demencia…).",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "cara",
          type: "select",
          label: "Cara",
          dropdown: true,
          options: [
            { label: "0 — Sin expresión particular o sonrisa", value: 0 },
            { label: "1 — Muecas, ceño fruncido o gesto de dolor ocasionales", value: 1 },
            { label: "2 — Muecas o gesto de dolor frecuentes", value: 2 }
          ]
        },
        {
          id: "actividad",
          type: "select",
          label: "Actividad (movimiento)",
          dropdown: true,
          options: [
            { label: "0 — Tumbado tranquilo, posición normal", value: 0 },
            { label: "1 — Movimientos lentos y cautelosos; se toca o señala la zona dolorida", value: 1 },
            { label: "2 — Inquieto, actividad excesiva o rituales de protección", value: 2 }
          ]
        },
        {
          id: "defensa",
          type: "select",
          label: "Defensa (guarding)",
          dropdown: true,
          options: [
            { label: "0 — Tumbado tranquilo, sin posición protectora", value: 0 },
            { label: "1 — Protege zonas del cuerpo o adopta postura antiálgica", value: 1 },
            { label: "2 — Rígido, tenso", value: 2 }
          ]
        },
        {
          id: "fisio1",
          type: "select",
          label: "Fisiológico I (constantes vitales)",
          dropdown: true,
          options: [
            { label: "0 — Constantes estables, sin cambios en las últimas 4 h", value: 0 },
            { label: "1 — Cambio en las últimas 4 h: PAS > 20 mmHg o FC > 20 lpm sobre la basal", value: 1 },
            { label: "2 — Cambio en las últimas 4 h: PAS > 30 mmHg o FC > 25 lpm sobre la basal", value: 2 }
          ]
        },
        {
          id: "fisio2",
          type: "select",
          label: "Fisiológico II (respiratorio)",
          dropdown: true,
          options: [
            { label: "0 — FR basal / SpO₂ basal; adaptado al ventilador", value: 0 },
            { label: "1 — FR > 10 rpm sobre la basal, o descenso de SpO₂ del 5 %; asincronía leve", value: 1 },
            { label: "2 — FR > 20 rpm sobre la basal, o descenso de SpO₂ del 10 %; lucha con el ventilador", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["cara", "actividad", "defensa", "fisio1", "fisio2"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          interpretation: score <= 2 ? "Ausencia de dolor o dolor leve." : score <= 6 ? "Dolor moderado: se recomienda intervención analgésica y reevaluación." : "Dolor intenso: tratamiento analgésico inmediato.",
          level: score <= 2 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      notes: [
        "Los puntos de corte no están tan estandarizados como en otras escalas: usar como tendencia y reevaluar tras cada intervención."
      ],
      references: [
        "Odhner M, et al. Assessing pain control in nonverbal critically ill adults. Dimens Crit Care Nurs. 2003;22(6):260-7."
      ]
    },
    {
      id: "cheops",
      name: "Escala CHEOPS de dolor pediátrico postoperatorio",
      shortName: "CHEOPS",
      description: "Cuantifica el dolor postoperatorio en pacientes pediátricos de 1 a 5 años.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "llanto",
          type: "select",
          label: "Llanto",
          dropdown: true,
          options: [
            { label: "1 — No llora", value: 1 },
            { label: "2 — Gime o llora", value: 2 },
            { label: "3 — Grita o solloza", value: 3 }
          ]
        },
        {
          id: "facial",
          type: "select",
          label: "Expresión facial",
          dropdown: true,
          options: [
            { label: "0 — Sonriente", value: 0 },
            { label: "1 — Serena, neutra", value: 1 },
            { label: "2 — Muecas de dolor", value: 2 }
          ]
        },
        {
          id: "verbal",
          type: "select",
          label: "Expresión verbal",
          dropdown: true,
          options: [
            { label: "0 — Habla de otras cosas en positivo, sin quejas", value: 0 },
            { label: "1 — No habla, o se queja de otras cosas", value: 1 },
            { label: "2 — Se queja de dolor", value: 2 }
          ]
        },
        {
          id: "torso",
          type: "select",
          label: "Torso",
          dropdown: true,
          options: [
            { label: "1 — Posición neutra, cuerpo en reposo", value: 1 },
            { label: "2 — Cambia de postura, tenso, erguido, tiritando o sujeto", value: 2 }
          ]
        },
        {
          id: "tacto",
          type: "select",
          label: "Tacto (herida)",
          dropdown: true,
          options: [
            { label: "1 — No toca la herida", value: 1 },
            { label: "2 — Alcanza, toca o agarra la herida, o tiene los brazos sujetos", value: 2 }
          ]
        },
        {
          id: "piernas",
          type: "select",
          label: "Piernas",
          dropdown: true,
          options: [
            { label: "1 — Posición neutra", value: 1 },
            { label: "2 — Se retuerce, patalea, piernas encogidas, de pie o sujetas", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["llanto", "facial", "verbal", "torso", "tacto", "piernas"]);
        return {
          main: String(score),
          mainUnit: "puntos (4–13)",
          interpretation: score === 4 ? "Sin dolor aparente." : score <= 7 ? "Dolor leve-moderado: vigilar, medidas de confort y valorar analgesia." : "Dolor intenso (≥ 8): se recomienda administrar analgesia y reevaluar.",
          level: score === 4 ? "ok" : score <= 7 ? "warn" : "danger"
        };
      },
      notes: ["La puntuación mínima es 4. Un valor ≥ 8 se usa habitualmente como umbral para tratar."],
      references: [
        "McGrath PJ, et al. CHEOPS: a behavioral scale for rating postoperative pain in children. Adv Pain Res Ther. 1985;9:395-402."
      ]
    },
    {
      id: "bops",
      name: "Escala de dolor observacional conductual (BOPS)",
      shortName: "BOPS",
      description: "Cuantifica el dolor postoperatorio en niños de 1 a 7 años.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "facial",
          type: "select",
          label: "Expresión facial",
          dropdown: true,
          options: [
            { label: "0 — Neutra o positiva", value: 0 },
            { label: "1 — Expresión negativa (ceño, muecas ocasionales)", value: 1 },
            { label: "2 — Expresión claramente negativa y mantenida", value: 2 }
          ]
        },
        {
          id: "verbal",
          type: "select",
          label: "Verbalización",
          dropdown: true,
          options: [
            { label: "0 — Tranquilo, no se queja", value: 0 },
            { label: "1 — Se queja o gime, se distrae con facilidad", value: 1 },
            { label: "2 — Llanto o quejas de dolor persistentes", value: 2 }
          ]
        },
        {
          id: "postura",
          type: "select",
          label: "Posición corporal",
          dropdown: true,
          options: [
            { label: "0 — Neutra, relajada", value: 0 },
            { label: "1 — Inquieto, tenso, cambia de postura", value: 1 },
            { label: "2 — Rígido o protege/señala la zona dolorida", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["facial", "verbal", "postura"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–6)",
          interpretation: score < 3 ? "Dolor leve o ausente: continuar con medidas de confort y reevaluación periódica." : "BOPS ≥ 3: se recomienda administrar analgesia y reevaluar (a los 15–20 min si es IV; a los 30–45 min si es oral o rectal).",
          level: score < 3 ? "ok" : "warn"
        };
      },
      notes: ["Reevaluar cada 3 horas y tras cada intervención analgésica."],
      references: [
        "Hesselgard K, et al. Validity and reliability of the Behavioural Observational Pain Scale for postoperative pain measurement in children 1–7 years of age. Pediatr Crit Care Med. 2007;8(2):102-8."
      ]
    },
    {
      id: "abbey",
      name: "Escala de dolor de Abbey para pacientes con demencia",
      shortName: "Abbey",
      description: "Evalúa el dolor en pacientes con demencia avanzada que no pueden verbalizarlo.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        {
          id: "voz",
          type: "select",
          label: "Vocalización",
          description: "Gimoteos, quejidos, llanto.",
          dropdown: true,
          options: [
            { label: "0 — Ausente", value: 0 },
            { label: "1 — Leve", value: 1 },
            { label: "2 — Moderada", value: 2 },
            { label: "3 — Grave", value: 3 }
          ]
        },
        {
          id: "facial",
          type: "select",
          label: "Expresión facial",
          description: "Tensión, ceño fruncido, muecas, aspecto asustado.",
          dropdown: true,
          options: [
            { label: "0 — Ausente", value: 0 },
            { label: "1 — Leve", value: 1 },
            { label: "2 — Moderada", value: 2 },
            { label: "3 — Grave", value: 3 }
          ]
        },
        {
          id: "corporal",
          type: "select",
          label: "Cambios en el lenguaje corporal",
          description: "Inquietud, balanceo, protege una parte del cuerpo, retraimiento.",
          dropdown: true,
          options: [
            { label: "0 — Ausentes", value: 0 },
            { label: "1 — Leves", value: 1 },
            { label: "2 — Moderados", value: 2 },
            { label: "3 — Graves", value: 3 }
          ]
        },
        {
          id: "conducta",
          type: "select",
          label: "Cambios de conducta",
          description: "Mayor confusión, rechazo de la comida, alteración de patrones habituales.",
          dropdown: true,
          options: [
            { label: "0 — Ausentes", value: 0 },
            { label: "1 — Leves", value: 1 },
            { label: "2 — Moderados", value: 2 },
            { label: "3 — Graves", value: 3 }
          ]
        },
        {
          id: "fisio",
          type: "select",
          label: "Cambios fisiológicos",
          description: "Temperatura, pulso o presión arterial fuera de rango; sudoración, rubor o palidez.",
          dropdown: true,
          options: [
            { label: "0 — Ausentes", value: 0 },
            { label: "1 — Leves", value: 1 },
            { label: "2 — Moderados", value: 2 },
            { label: "3 — Graves", value: 3 }
          ]
        },
        {
          id: "fisicos",
          type: "select",
          label: "Cambios físicos",
          description: "Lesiones cutáneas, zonas de presión, artritis, contracturas, lesiones previas.",
          dropdown: true,
          options: [
            { label: "0 — Ausentes", value: 0 },
            { label: "1 — Leves", value: 1 },
            { label: "2 — Moderados", value: 2 },
            { label: "3 — Graves", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["voz", "facial", "corporal", "conducta", "fisio", "fisicos"]);
        const band = score <= 2 ? "Sin dolor" : score <= 7 ? "Dolor leve" : score <= 13 ? "Dolor moderado" : "Dolor intenso";
        return {
          main: String(score),
          mainUnit: "puntos (0–18)",
          interpretation: `${band}.${score >= 3 ? " Tratar según intensidad y reevaluar 1 hora después de la intervención." : ""}`,
          level: score <= 2 ? "ok" : score <= 7 ? "info" : score <= 13 ? "warn" : "danger"
        };
      },
      notes: [
        "0–2: sin dolor · 3–7: leve · 8–13: moderado · ≥14: intenso.",
        "Registrar también si el dolor parece crónico, agudo o agudo sobre crónico.",
        "Evaluar durante la movilización si es posible."
      ],
      references: [
        "Abbey J, et al. The Abbey pain scale: a 1-minute numerical indicator for people with end-stage dementia. Int J Palliat Nurs. 2004;10(1):6-13."
      ]
    },
    {
      id: "nps",
      name: "Escala de dolor neuropático (NPS)",
      shortName: "NPS",
      description: "Cuantifica la gravedad y las cualidades del dolor neuropático; útil para seguir la respuesta al tratamiento.",
      category: CAT2,
      specialty: ANES2,
      inputs: [
        { id: "i1", type: "number", label: "Intensidad del dolor", description: "0 = sin dolor; 10 = el dolor más intenso imaginable.", min: 0, max: 10, step: 1 },
        { id: "i2", type: "number", label: "Dolor agudo / punzante", description: "«Como un cuchillo o agujas». 0–10.", min: 0, max: 10, step: 1 },
        { id: "i3", type: "number", label: "Dolor caliente / quemante", description: "«Como si quemara». 0–10.", min: 0, max: 10, step: 1 },
        { id: "i4", type: "number", label: "Dolor sordo / opresivo", description: "«Dolor profundo y continuo». 0–10.", min: 0, max: 10, step: 1 },
        { id: "i5", type: "number", label: "Dolor frío / helado", description: "«Como congelación». 0–10.", min: 0, max: 10, step: 1 },
        { id: "i6", type: "number", label: "Sensibilidad al tacto", description: "Dolor con el roce o la ropa (alodinia). 0–10.", min: 0, max: 10, step: 1 },
        { id: "i7", type: "number", label: "Picor", description: "0–10.", min: 0, max: 10, step: 1 },
        { id: "i8", type: "number", label: "Desagrado", description: "Cuán desagradable resulta el dolor. 0–10.", min: 0, max: 10, step: 1 },
        { id: "i9", type: "number", label: "Intensidad del dolor profundo", description: "0–10.", min: 0, max: 10, step: 1 },
        { id: "i10", type: "number", label: "Intensidad del dolor superficial", description: "0–10.", min: 0, max: 10, step: 1 }
      ],
      compute: (v) => {
        const ids = ["i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8", "i9", "i10"];
        const bad = ids.some((id) => {
          var _a, _b;
          return ((_a = v[id]) != null ? _a : 0) < 0 || ((_b = v[id]) != null ? _b : 0) > 10;
        });
        if (bad)
          return {
            main: "—",
            interpretation: "Cada ítem debe puntuarse entre 0 y 10.",
            level: "warn"
          };
        const score = sum(v, ids);
        return {
          main: fmt(score),
          mainUnit: "puntos (0–100)",
          interpretation: "No existen puntos de corte diagnósticos: la NPS sirve para caracterizar las cualidades del dolor neuropático y monitorizar la respuesta al tratamiento comparando puntuaciones sucesivas.",
          level: "info"
        };
      },
      notes: [
        "También se pueden analizar los ítems por separado (p. ej., mejora del componente quemante frente al punzante).",
        "Para diagnóstico de dolor neuropático se recomiendan herramientas específicas (DN4, LANSS)."
      ],
      references: [
        "Galer BS, Jensen MP. Development and preliminary validation of a pain measure specific to neuropathic pain: the Neuropathic Pain Scale. Neurology. 1997;48(2):332-8."
      ]
    }
  ];

  // inurse-main/src/calculators/viaaerea.ts
  var CAT3 = "Vía aérea";
  var ANES3 = ["Anestesiología"];
  var viaAerea = [
    {
      id: "mallampati",
      name: "Clasificación de Mallampati modificada",
      shortName: "Mallampati",
      description: "Clasifica la dificultad prevista de la intubación endotraqueal según las estructuras orofaríngeas visibles.",
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
            { label: "Clase I — Paladar blando, fauces, úvula y pilares visibles", value: 1 },
            { label: "Clase II — Paladar blando, fauces y úvula visibles (pilares ocultos)", value: 2 },
            { label: "Clase III — Paladar blando y base de la úvula visibles", value: 3 },
            { label: "Clase IV — Solo paladar duro visible", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const c = (_a = v.clase) != null ? _a : 1;
        return {
          main: `Clase ${["", "I", "II", "III", "IV"][c]}`,
          interpretation: c <= 2 ? "Predice, en general, una laringoscopia sin dificultad especial." : "Las clases III–IV se asocian a mayor probabilidad de laringoscopia e intubación difíciles: preparar plan alternativo (videolaringoscopio, dispositivos supraglóticos, fibroscopio).",
          level: c <= 2 ? "ok" : c === 3 ? "warn" : "danger"
        };
      },
      notes: [
        "Evaluar con el paciente sentado, cabeza neutra, boca abierta al máximo y lengua protruida sin fonación.",
        "De forma aislada tiene sensibilidad limitada: combinar con otros predictores (apertura oral, distancia tiromentoniana, movilidad cervical…)."
      ],
      references: [
        "Mallampati SR, et al. A clinical sign to predict difficult tracheal intubation: a prospective study. Can Anaesth Soc J. 1985;32(4):429-34.",
        "Samsoon GL, Young JR. Difficult tracheal intubation: a retrospective study. Anaesthesia. 1987;42(5):487-90."
      ]
    },
    {
      id: "el-ganzouri",
      name: "Índice de riesgo de El-Ganzouri (EGRI) para vía aérea difícil",
      shortName: "El-Ganzouri",
      description: "Predice el riesgo de laringoscopia e intubación difíciles combinando siete variables preoperatorias.",
      category: CAT3,
      specialty: ANES3,
      inputs: [
        {
          id: "apertura",
          type: "select",
          label: "Apertura oral",
          options: [
            { label: "≥ 4 cm", value: 0 },
            { label: "< 4 cm", value: 1 }
          ]
        },
        {
          id: "tiromentoniana",
          type: "select",
          label: "Distancia tiromentoniana",
          options: [
            { label: "> 6,5 cm", value: 0 },
            { label: "6–6,5 cm", value: 1 },
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
            { label: "> 90°", value: 0 },
            { label: "80–90°", value: 1 },
            { label: "< 80°", value: 2 }
          ]
        },
        {
          id: "prognatismo",
          type: "select",
          label: "¿Puede adelantar la mandíbula (prognatismo)?",
          options: [
            { label: "Sí", value: 0 },
            { label: "No", value: 1 }
          ]
        },
        {
          id: "peso",
          type: "select",
          label: "Peso corporal",
          options: [
            { label: "< 90 kg", value: 0 },
            { label: "90–110 kg", value: 1 },
            { label: "> 110 kg", value: 2 }
          ]
        },
        {
          id: "antecedente",
          type: "select",
          label: "Antecedente de intubación difícil",
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
          mainUnit: "puntos (0–12)",
          interpretation: score < 4 ? "Riesgo bajo de laringoscopia difícil; mantener siempre un plan alternativo disponible." : "EGRI ≥ 4: riesgo elevado de laringoscopia/intubación difícil. Planificar de entrada técnica alternativa (videolaringoscopia, intubación despierto con fibroscopio según contexto).",
          level: score < 4 ? "ok" : "danger"
        };
      },
      references: [
        "El-Ganzouri AR, et al. Preoperative airway assessment: predictive value of a multivariate risk index. Anesth Analg. 1996;82(6):1197-204."
      ]
    },
    {
      id: "heaven",
      name: "Criterios HEAVEN para vía aérea difícil en intubación de emergencia",
      shortName: "HEAVEN",
      description: "Identifica atributos asociados a intubación difícil en la secuencia rápida de emergencia.",
      category: CAT3,
      specialty: ANES3,
      inputs: [
        {
          id: "h",
          type: "boolean",
          label: "Hipoxemia (Hypoxaemia)",
          description: "SpO₂ ≤ 93 % en el momento de la laringoscopia inicial."
        },
        {
          id: "e1",
          type: "boolean",
          label: "Extremos de tamaño (Extremes of size)",
          description: "Paciente pediátrico (< 8 años) u obesidad clínica."
        },
        {
          id: "a",
          type: "boolean",
          label: "Reto anatómico (Anatomic challenge)",
          description: "Traumatismo, masas, hinchazón, cuerpo extraño u otra anomalía estructural que limite la visión laringoscópica."
        },
        {
          id: "v",
          type: "boolean",
          label: "Vómito / sangre / líquido (Vomit, blood, fluid)",
          description: "Presentes clínicamente en la faringe o hipofaringe."
        },
        {
          id: "e2",
          type: "boolean",
          label: "Exanguinación / anemia (Exsanguination)",
          description: "Sospecha de anemia grave que acelera la desaturación durante la apnea."
        },
        {
          id: "n",
          type: "boolean",
          label: "Cuello (Neck)",
          description: "Movilidad cervical limitada (artrosis grave, inmovilización, collarín…)."
        }
      ],
      compute: (v) => {
        const score = sum(v, ["h", "e1", "a", "v", "e2", "n"]);
        return {
          main: String(score),
          mainUnit: score === 1 ? "criterio" : "criterios",
          interpretation: score === 0 ? "Sin criterios HEAVEN: se prevé menor dificultad para la intubación de secuencia rápida." : "Presencia de criterios HEAVEN: anticipar vía aérea difícil; a más criterios, menor probabilidad de éxito al primer intento. Optimizar preoxigenación, posición, dispositivo y plan de rescate.",
          level: score === 0 ? "ok" : score <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Kuzmack E, et al. A novel difficult-airway prediction tool for emergency airway management: validation of the HEAVEN criteria in a large air medical cohort. J Emerg Med. 2018;54(4):395-401."
      ]
    }
  ];

  // inurse-main/src/calculators/respiratorio.ts
  var CAT4 = "Respiratorio y ventilación";
  var ANES4 = ["Anestesiología"];
  var respiratorio = [
    {
      id: "spo2-fio2",
      name: "Relación SpO₂/FiO₂ (índice S/F)",
      shortName: "SpO₂/FiO₂",
      description: "Evalúa la oxigenación de forma no invasiva; se correlaciona con la relación PaO₂/FiO₂.",
      category: CAT4,
      specialty: ANES4,
      inputs: [
        { id: "spo2", type: "number", label: "SpO₂", unit: "%", min: 50, max: 100 },
        { id: "fio2", type: "number", label: "FiO₂", unit: "%", min: 21, max: 100 }
      ],
      compute: (v) => {
        const ratio = v.spo2 / (v.fio2 / 100);
        return {
          main: fmt(ratio, 0),
          interpretation: ratio <= 235 ? "S/F ≤ 235 ≈ PaO₂/FiO₂ ≤ 200: hipoxemia moderada-grave (rango de SDRA moderado)." : ratio <= 315 ? "S/F ≤ 315 ≈ PaO₂/FiO₂ ≤ 300: hipoxemia compatible con SDRA leve / insuficiencia respiratoria aguda." : "Oxigenación conservada según el índice S/F.",
          level: ratio <= 235 ? "danger" : ratio <= 315 ? "warn" : "ok",
          details: ["Correlación de Rice: S/F 235 ≈ P/F 200; S/F 315 ≈ P/F 300."]
        };
      },
      notes: [
        "Menos fiable con SpO₂ > 97 % (zona plana de la curva de disociación de la hemoglobina).",
        "La medición debe hacerse con una señal de pulsioximetría de buena calidad."
      ],
      references: [
        "Rice TW, et al. Comparison of the SpO2/FiO2 ratio and the PaO2/FiO2 ratio in patients with acute lung injury or ARDS. Chest. 2007;132(2):410-7."
      ]
    },
    {
      id: "rdos",
      name: "Escala de observación de dificultad respiratoria (RDOS)",
      shortName: "RDOS",
      description: "Cuantifica la dificultad respiratoria en pacientes que no pueden comunicar su disnea.",
      category: CAT4,
      specialty: ANES4,
      inputs: [
        {
          id: "fc",
          type: "select",
          label: "Frecuencia cardíaca (lpm)",
          options: [
            { label: "< 90", value: 0 },
            { label: "90–109", value: 1 },
            { label: "≥ 110", value: 2 }
          ]
        },
        {
          id: "fr",
          type: "select",
          label: "Frecuencia respiratoria (rpm)",
          options: [
            { label: "≤ 18", value: 0 },
            { label: "19–30", value: 1 },
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
          label: "Respiración paradójica abdominal",
          description: "El abdomen se hunde en la inspiración.",
          options: [
            { label: "No", value: 0 },
            { label: "Sí", value: 2 }
          ]
        },
        {
          id: "accesoria",
          type: "select",
          label: "Uso de musculatura accesoria",
          description: "Elevación de la clavícula en la inspiración.",
          options: [
            { label: "No", value: 0 },
            { label: "Elevación leve", value: 1 },
            { label: "Elevación pronunciada", value: 2 }
          ]
        },
        {
          id: "quejido",
          type: "select",
          label: "Quejido al final de la espiración",
          description: "Sonido gutural.",
          options: [
            { label: "No", value: 0 },
            { label: "Sí", value: 2 }
          ]
        },
        {
          id: "aleteo",
          type: "select",
          label: "Aleteo nasal",
          description: "Movimiento involuntario de las alas nasales.",
          options: [
            { label: "No", value: 0 },
            { label: "Sí", value: 2 }
          ]
        },
        {
          id: "miedo",
          type: "select",
          label: "Expresión facial de miedo o angustia",
          description: "Ojos muy abiertos, musculatura facial tensa, ceño fruncido, boca abierta.",
          options: [
            { label: "No", value: 0 },
            { label: "Sí", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["fc", "fr", "inquietud", "paradojica", "accesoria", "quejido", "aleteo", "miedo"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–16)",
          interpretation: score <= 2 ? "Dificultad respiratoria escasa o ausente." : score <= 6 ? "Dificultad respiratoria moderada: valorar tratamiento sintomático y de la causa." : "Dificultad respiratoria grave: tratamiento paliativo/etiológico urgente.",
          level: score <= 2 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      notes: [
        "Diseñada y validada sobre todo en cuidados paliativos y pacientes incapaces de autoinformar la disnea.",
        "Un valor ≥ 3 indica presencia de distrés respiratorio clínicamente relevante."
      ],
      references: [
        "Campbell ML, et al. A Respiratory Distress Observation Scale for patients unable to self-report dyspnea. J Palliat Med. 2008;11(1):44-50."
      ]
    }
  ];

  // inurse-main/src/calculators/hemodinamica.ts
  var CAT5 = "Hemodinámica y fluidos";
  var ANES5 = ["Anestesiología"];
  var hemodinamica = [
    {
      id: "pam",
      name: "Presión arterial media (PAM)",
      shortName: "PAM",
      description: "Calcula la presión de perfusión media a partir de la PA sistólica y diastólica.",
      category: CAT5,
      specialty: ANES5,
      inputs: [
        { id: "pas", type: "number", label: "Presión arterial sistólica", unit: "mmHg", min: 0, max: 300 },
        { id: "pad", type: "number", label: "Presión arterial diastólica", unit: "mmHg", min: 0, max: 200 }
      ],
      compute: (v) => {
        const pas = v.pas;
        const pad = v.pad;
        if (pad > pas)
          return {
            main: "—",
            interpretation: "La presión diastólica no puede ser mayor que la sistólica.",
            level: "warn"
          };
        const pam = (pas + 2 * pad) / 3;
        return {
          main: fmt(pam, 0),
          mainUnit: "mmHg",
          interpretation: pam < 65 ? "PAM < 65 mmHg: riesgo de hipoperfusión tisular; objetivo habitual en shock ≥ 65 mmHg." : pam <= 110 ? "PAM dentro del rango habitual (aprox. 70–100 mmHg)." : "PAM elevada.",
          level: pam < 65 ? "danger" : pam <= 110 ? "ok" : "warn",
          details: ["PAM = (PAS + 2 × PAD) / 3."]
        };
      },
      notes: [
        "La fórmula asume una frecuencia cardíaca normal; con taquicardia importante infraestima la PAM real."
      ]
    },
    {
      id: "mabl",
      name: "Pérdida máxima de sangre permitida (PMSP)",
      shortName: "PMSP / MABL",
      description: "Estima cuánta sangre puede perderse durante la cirugía antes de plantear una transfusión.",
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
            { label: "Neonato prematuro (≈ 96 mL/kg)", value: 96 },
            { label: "Neonato a término (≈ 85 mL/kg)", value: 85 },
            { label: "Lactante (≈ 80 mL/kg)", value: 80 },
            { label: "Niño (≈ 70 mL/kg)", value: 70 },
            { label: "Varón adulto (≈ 75 mL/kg)", value: 75 },
            { label: "Mujer adulta (≈ 65 mL/kg)", value: 65 }
          ],
          default: 75
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 0.3, max: 300 },
        { id: "hi", type: "number", label: "Hematocrito inicial", unit: "%", min: 10, max: 70 },
        { id: "hf", type: "number", label: "Hematocrito mínimo aceptable", unit: "%", min: 10, max: 60 }
      ],
      compute: (v) => {
        var _a;
        const ebv = ((_a = v.poblacion) != null ? _a : 75) * v.peso;
        if (v.hf >= v.hi)
          return {
            main: "—",
            interpretation: "El hematocrito inicial debe ser mayor que el mínimo aceptable.",
            level: "warn"
          };
        const mabl = ebv * (v.hi - v.hf) / v.hi;
        return {
          main: fmt(mabl, 0),
          mainUnit: "mL",
          interpretation: "Pérdida sanguínea estimada a partir de la cual se debe valorar la transfusión, junto con la clínica y la monitorización.",
          level: "info",
          details: [
            `Volemia estimada: ${fmt(ebv, 0)} mL.`,
            "Fórmula: PMSP = volemia × (Hto inicial − Hto mínimo) / Hto inicial."
          ]
        };
      },
      notes: [
        "Puede calcularse igualmente con hemoglobina en lugar de hematocrito.",
        "Algunas variantes usan el hematocrito medio en el denominador; la diferencia es pequeña.",
        "Es una estimación estática: la decisión de transfundir debe basarse también en la situación hemodinámica y las pérdidas en curso."
      ]
    },
    {
      id: "fluidos-intraoperatorios",
      name: "Dosificación de líquidos intraoperatorios (adultos)",
      shortName: "Fluidos intraoperatorios",
      description: "Calcula el mantenimiento (regla 4-2-1), el déficit por ayuno y las pérdidas por trauma quirúrgico.",
      category: CAT5,
      specialty: ANES5,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 3, max: 300 },
        { id: "ayuno", type: "number", label: "Horas de ayuno", unit: "h", min: 0, max: 48 },
        {
          id: "trauma",
          type: "select",
          label: "Magnitud del trauma quirúrgico",
          noPoints: true,
          options: [
            { label: "Leve (p. ej., hernia): ≈ 2–4 mL/kg/h", value: 3 },
            { label: "Moderado (p. ej., colecistectomía abierta): ≈ 4–6 mL/kg/h", value: 5 },
            { label: "Grave (p. ej., resección intestinal): ≈ 6–8 mL/kg/h", value: 7 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const w = v.peso;
        const maint = w <= 10 ? 4 * w : w <= 20 ? 40 + 2 * (w - 10) : 60 + (w - 20);
        const deficit = maint * v.ayuno;
        const trauma = ((_a = v.trauma) != null ? _a : 3) * w;
        const h1 = maint + deficit / 2 + trauma;
        const h23 = maint + deficit / 4 + trauma;
        const after = maint + trauma;
        return {
          main: fmt(h1, 0),
          mainUnit: "mL en la 1.ª hora",
          interpretation: "Pauta clásica: en la 1.ª hora se repone la mitad del déficit de ayuno; en la 2.ª y 3.ª, un cuarto en cada una, siempre sumando mantenimiento y pérdidas por trauma.",
          level: "info",
          details: [
            `Mantenimiento (4-2-1): ${fmt(maint, 0)} mL/h.`,
            `Déficit por ayuno: ${fmt(deficit, 0)} mL.`,
            `2.ª y 3.ª hora: ${fmt(h23, 0)} mL/h cada una.`,
            `A partir de la 4.ª hora: ${fmt(after, 0)} mL/h (mantenimiento + trauma).`
          ]
        };
      },
      notes: [
        "Es la aproximación clásica docente: la práctica actual tiende a estrategias más restrictivas o guiadas por objetivos (GDT), especialmente en cirugía mayor.",
        "No aplicable a grandes quemados, pediatría compleja ni reposición de hemorragia."
      ]
    },
    {
      id: "vexus",
      name: "Puntuación ecográfica de congestión venosa (VExUS)",
      shortName: "VExUS",
      description: "Gradúa la congestión venosa sistémica mediante ecografía (VCI y Doppler hepático, portal e intrarrenal) y estima el riesgo de lesión renal aguda congestiva.",
      category: CAT5,
      specialty: ANES5,
      inputs: [
        {
          id: "vci",
          type: "select",
          label: "Vena cava inferior",
          noPoints: true,
          options: [
            { label: "< 2 cm de diámetro", value: 0 },
            { label: "≥ 2 cm de diámetro", value: 1 }
          ]
        },
        {
          id: "hepatica",
          type: "select",
          label: "Doppler de venas suprahepáticas",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Normal — onda S mayor que la D (S > D), ambas anterógradas", value: 0 },
            { label: "Alteración leve-moderada — S menor que D (S < D), ambas anterógradas", value: 1 },
            { label: "Alteración grave — onda S invertida (flujo retrógrado sistólico)", value: 2 }
          ]
        },
        {
          id: "porta",
          type: "select",
          label: "Doppler de vena porta",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Normal — pulsatilidad < 30 %", value: 0 },
            { label: "Alteración leve-moderada — pulsatilidad 30–49 %", value: 1 },
            { label: "Alteración grave — pulsatilidad ≥ 50 %", value: 2 }
          ]
        },
        {
          id: "renal",
          type: "select",
          label: "Doppler venoso intrarrenal",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Normal — flujo continuo", value: 0 },
            { label: "Alteración leve-moderada — flujo discontinuo bifásico (sistólico y diastólico)", value: 1 },
            { label: "Alteración grave — flujo discontinuo monofásico (solo diastólico)", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        let grade;
        if (((_a = v.vci) != null ? _a : 0) === 0) grade = 0;
        else {
          const severos = [v.hepatica, v.porta, v.renal].filter((x) => x === 2).length;
          grade = severos === 0 ? 1 : severos === 1 ? 2 : 3;
        }
        const texto = [
          "Sin congestión significativa (VCI < 2 cm).",
          "Congestión leve: VCI dilatada sin patrones graves.",
          "Congestión moderada: un patrón Doppler gravemente alterado.",
          "Congestión grave: dos o más patrones gravemente alterados. Riesgo elevado de lesión renal aguda congestiva; valorar descongestión (diuréticos/ultrafiltración) y tratar la causa."
        ][grade];
        return {
          main: `Grado ${grade}`,
          interpretation: texto,
          level: grade === 0 ? "ok" : grade === 1 ? "info" : grade === 2 ? "warn" : "danger"
        };
      },
      notes: [
        "Grado 0: VCI < 2 cm · Grado 1: VCI ≥ 2 cm sin patrones graves · Grado 2: un patrón grave · Grado 3: ≥ 2 patrones graves.",
        "El grado 3 se asoció de forma independiente con lesión renal aguda en pacientes tras cirugía cardíaca."
      ],
      references: [
        "Beaubien-Souligny W, et al. Quantifying systemic congestion with point-of-care ultrasound: development of the venous excess ultrasound grading system. Ultrasound J. 2020;12(1):16."
      ]
    }
  ];

  // inurse-main/src/calculators/neuro.ts
  var CAT6 = "Neurológico, sedación y gravedad";
  var ANES6 = ["Anestesiología"];
  var neuro = [
    {
      id: "sms",
      name: "Puntuación motora simplificada (SMS)",
      shortName: "SMS",
      description: "Simplifica la valoración del traumatismo craneoencefálico frente a la escala de coma de Glasgow.",
      category: CAT6,
      specialty: ANES6,
      inputs: [
        {
          id: "motor",
          type: "select",
          label: "Mejor respuesta motora",
          options: [
            { label: "Obedece órdenes", value: 2 },
            { label: "Localiza el dolor", value: 1 },
            { label: "Retirada al dolor o respuesta menor", value: 0 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const s = (_a = v.motor) != null ? _a : 2;
        return {
          main: String(s),
          mainUnit: "puntos (0–2)",
          interpretation: s === 2 ? "Obedece órdenes: menor probabilidad de lesión cerebral grave (equivalente aproximado a GCS alto)." : s === 1 ? "Localiza el dolor: riesgo intermedio; vigilancia estrecha y TC según protocolo." : "Retirada o menos: se asocia a lesión grave (aprox. GCS ≤ 8); valorar aislamiento precoz de la vía aérea.",
          level: s === 2 ? "ok" : s === 1 ? "warn" : "danger"
        };
      },
      notes: [
        "SMS < 2 identifica a los pacientes con mayor riesgo de lesión cerebral traumática significativa, necesidad de intubación y mortalidad, con rendimiento similar a la GCS completa."
      ],
      references: [
        "Gill M, et al. A comparison of the Glasgow Coma Scale score to simplified alternative scores for the prediction of traumatic brain injury outcomes. Ann Emerg Med. 2005;45(1):37-42."
      ]
    },
    {
      id: "sofa",
      name: "Escala SOFA de disfunción orgánica secuencial",
      shortName: "SOFA",
      description: "Evalúa la gravedad de la disfunción orgánica aguda en pacientes críticos mediante seis sistemas.",
      category: CAT6,
      specialty: ANES6,
      inputs: [
        {
          id: "resp",
          type: "select",
          label: "Respiratorio — PaO₂/FiO₂ (mmHg)",
          dropdown: true,
          options: [
            { label: "≥ 400", value: 0 },
            { label: "300–399", value: 1 },
            { label: "200–299", value: 2 },
            { label: "100–199 con soporte respiratorio", value: 3 },
            { label: "< 100 con soporte respiratorio", value: 4 }
          ]
        },
        {
          id: "coag",
          type: "select",
          label: "Coagulación — plaquetas (×10³/µL)",
          dropdown: true,
          options: [
            { label: "≥ 150", value: 0 },
            { label: "100–149", value: 1 },
            { label: "50–99", value: 2 },
            { label: "20–49", value: 3 },
            { label: "< 20", value: 4 }
          ]
        },
        {
          id: "higado",
          type: "select",
          label: "Hígado — bilirrubina (mg/dL)",
          dropdown: true,
          options: [
            { label: "< 1,2", value: 0 },
            { label: "1,2–1,9", value: 1 },
            { label: "2,0–5,9", value: 2 },
            { label: "6,0–11,9", value: 3 },
            { label: "≥ 12", value: 4 }
          ]
        },
        {
          id: "cardio",
          type: "select",
          label: "Cardiovascular",
          dropdown: true,
          options: [
            { label: "PAM ≥ 70 mmHg sin vasoactivos", value: 0 },
            { label: "PAM < 70 mmHg sin vasoactivos", value: 1 },
            { label: "Dopamina ≤ 5 µg/kg/min o dobutamina (cualquier dosis)", value: 2 },
            { label: "Dopamina > 5, o adrenalina/noradrenalina ≤ 0,1 µg/kg/min", value: 3 },
            { label: "Dopamina > 15, o adrenalina/noradrenalina > 0,1 µg/kg/min", value: 4 }
          ]
        },
        {
          id: "snc",
          type: "select",
          label: "Neurológico — escala de coma de Glasgow",
          dropdown: true,
          options: [
            { label: "15", value: 0 },
            { label: "13–14", value: 1 },
            { label: "10–12", value: 2 },
            { label: "6–9", value: 3 },
            { label: "< 6", value: 4 }
          ]
        },
        {
          id: "renal",
          type: "select",
          label: "Renal — creatinina (mg/dL) o diuresis",
          dropdown: true,
          options: [
            { label: "< 1,2", value: 0 },
            { label: "1,2–1,9", value: 1 },
            { label: "2,0–3,4", value: 2 },
            { label: "3,5–4,9 o diuresis < 500 mL/día", value: 3 },
            { label: "≥ 5,0 o diuresis < 200 mL/día", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["resp", "coag", "higado", "cardio", "snc", "renal"]);
        const mort = score <= 6 ? "< 10 %" : score <= 9 ? "≈ 15–20 %" : score <= 12 ? "≈ 40–50 %" : score <= 14 ? "≈ 50–60 %" : "> 80 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–24)",
          secondary: mort,
          secondaryLabel: "mortalidad orientativa",
          interpretation: "A mayor puntuación, mayor disfunción orgánica y mortalidad. Un aumento ≥ 2 puntos respecto a la basal en un paciente con infección define sepsis (criterios Sepsis-3). La evolución del SOFA en el tiempo es más informativa que un valor aislado.",
          level: score <= 6 ? score === 0 ? "ok" : "info" : score <= 9 ? "warn" : "danger"
        };
      },
      notes: [
        "Versión clásica de la escala SOFA (1996). La lista de MDCalc incluye la revisión «SOFA-2» (2025), pendiente de incorporar en una próxima versión.",
        "Los porcentajes de mortalidad son orientativos y varían según la población estudiada."
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
          label: "¿Cómo se siente ahora mismo?",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "1 — Activo, vital, alerta, completamente despierto", value: 1 },
            { label: "2 — Rendimiento alto aunque no máximo; capaz de concentrarse", value: 2 },
            { label: "3 — Despierto y relajado; responde, pero no del todo alerta", value: 3 },
            { label: "4 — Algo apagado, decaído", value: 4 },
            { label: "5 — Apagado, pierde el interés; enlentecido", value: 5 },
            { label: "6 — Somnoliento, prefiere tumbarse; lucha contra el sueño; aturdido", value: 6 },
            { label: "7 — Casi dormido; inicio del sueño inminente; incapaz de mantenerse despierto", value: 7 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const g = (_a = v.grado) != null ? _a : 1;
        return {
          main: String(g),
          mainUnit: "de 7",
          interpretation: g <= 3 ? "Nivel de alerta dentro de lo esperable durante la vigilia." : "Somnolencia significativa: si aparece en momentos en que debería estar alerta, sugiere deuda de sueño o un trastorno del sueño; valorar estudio y precaución con actividades de riesgo.",
          level: g <= 3 ? "ok" : g <= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Hoddes E, et al. Quantification of sleepiness: a new approach. Psychophysiology. 1973;10(4):431-6."
      ]
    }
  ];

  // inurse-main/src/calculators/alcohol.ts
  var CAT7 = "Alcohol y abstinencia";
  var ANES7 = ["Anestesiología"];
  var escala07 = (anchors) => Array.from({ length: 8 }, (_, i) => ({
    label: anchors[i] ? `${i} — ${anchors[i]}` : `${i} — (intensidad intermedia)`,
    value: i
  }));
  var alcohol = [
    {
      id: "ciwa-ar",
      name: "CIWA-Ar para la abstinencia de alcohol",
      shortName: "CIWA-Ar",
      description: "Objetiva la gravedad del síndrome de abstinencia alcohólica y guía el tratamiento pautado por síntomas.",
      category: CAT7,
      specialty: ANES7,
      inputs: [
        {
          id: "nauseas",
          type: "select",
          label: "Náuseas y vómitos",
          description: "«¿Tiene el estómago revuelto? ¿Ha vomitado?»",
          dropdown: true,
          options: escala07({
            0: "Sin náuseas ni vómitos",
            1: "Náuseas leves sin vómitos",
            4: "Náuseas intermitentes con arcadas secas",
            7: "Náuseas constantes, arcadas frecuentes y vómitos"
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
          label: "Sudoración paroxística",
          dropdown: true,
          options: escala07({
            0: "Sin sudoración visible",
            1: "Sudoración apenas perceptible, palmas húmedas",
            4: "Gotas de sudor evidentes en la frente",
            7: "Sudoración profusa que empapa"
          })
        },
        {
          id: "ansiedad",
          type: "select",
          label: "Ansiedad",
          description: "«¿Se siente nervioso/a?»",
          dropdown: true,
          options: escala07({
            0: "Tranquilo, sin ansiedad",
            1: "Ligeramente ansioso",
            4: "Moderadamente ansioso o en guardia",
            7: "Equivalente a un estado de pánico agudo"
          })
        },
        {
          id: "agitacion",
          type: "select",
          label: "Agitación",
          dropdown: true,
          options: escala07({
            0: "Actividad normal",
            1: "Algo más inquieto de lo normal",
            4: "Moderadamente inquieto, no puede estarse quieto",
            7: "Camina de un lado a otro o forcejea constantemente"
          })
        },
        {
          id: "tactiles",
          type: "select",
          label: "Alteraciones táctiles",
          description: "Picores, pinchazos, quemazón, entumecimiento o sensación de bichos bajo la piel.",
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
            1: "Muy leves (sonidos ásperos o que sobresaltan)",
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
          description: "Molestia con la luz, colores extraños o cosas que no existen.",
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
          label: "Orientación y funciones superiores",
          description: "«¿Qué día es hoy? ¿Dónde está? ¿Quién soy yo?»",
          dropdown: true,
          options: [
            { label: "0 — Orientado; puede hacer sumas seriadas", value: 0 },
            { label: "1 — No puede hacer sumas seriadas o duda sobre la fecha", value: 1 },
            { label: "2 — Desorientado en fecha (≤ 2 días de error)", value: 2 },
            { label: "3 — Desorientado en fecha (> 2 días de error)", value: 3 },
            { label: "4 — Desorientado en lugar y/o persona", value: 4 }
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
          mainUnit: "puntos (0–67)",
          interpretation: score <= 8 ? "Abstinencia ausente o leve: habitualmente no requiere medicación adicional; reevaluar de forma periódica." : score <= 15 ? "Abstinencia moderada: se recomienda tratamiento farmacológico (benzodiacepinas pautadas por síntomas) y reevaluación frecuente." : "Abstinencia grave: tratamiento inmediato; riesgo elevado de convulsiones y delirium tremens.",
          level: score <= 8 ? "ok" : score <= 15 ? "warn" : "danger"
        };
      },
      notes: [
        "≤ 8: leve · 9–15: moderada · > 15: grave (umbral habitual de tratamiento ≥ 8–10).",
        "Requiere que el paciente pueda comunicarse; en pacientes que no colaboran, valorar escalas alternativas (p. ej., BAWS, protocolos de sedación)."
      ],
      references: [
        "Sullivan JT, et al. Assessment of alcohol withdrawal: the revised Clinical Institute Withdrawal Assessment for Alcohol scale (CIWA-Ar). Br J Addict. 1989;84(11):1353-7."
      ]
    },
    {
      id: "baws",
      name: "Escala breve de abstinencia de alcohol (BAWS)",
      shortName: "BAWS",
      description: "Evalúa los síntomas de abstinencia alcohólica con cinco ítems rápidos; alternativa abreviada a la CIWA-Ar.",
      category: CAT7,
      specialty: ANES7,
      inputs: [
        {
          id: "temblor",
          type: "select",
          label: "Temblor",
          dropdown: true,
          options: [
            { label: "0 — Ausente", value: 0 },
            { label: "1 — No visible, pero el paciente lo nota / se palpa", value: 1 },
            { label: "2 — Moderado, visible con los brazos extendidos", value: 2 },
            { label: "3 — Intenso, visible sin extender los brazos", value: 3 }
          ]
        },
        {
          id: "sudor",
          type: "select",
          label: "Sudoración",
          dropdown: true,
          options: [
            { label: "0 — Ausente", value: 0 },
            { label: "1 — Apenas perceptible, palmas húmedas", value: 1 },
            { label: "2 — Gotas de sudor visibles", value: 2 },
            { label: "3 — Sudoración profusa que empapa", value: 3 }
          ]
        },
        {
          id: "agitacion",
          type: "select",
          label: "Agitación",
          dropdown: true,
          options: [
            { label: "0 — Actividad normal", value: 0 },
            { label: "1 — Algo inquieto", value: 1 },
            { label: "2 — Moderadamente inquieto; se mueve constantemente", value: 2 },
            { label: "3 — Camina de un lado a otro o forcejea", value: 3 }
          ]
        },
        {
          id: "orientacion",
          type: "select",
          label: "Orientación",
          dropdown: true,
          options: [
            { label: "0 — Orientado en fecha, lugar y persona", value: 0 },
            { label: "1 — Desorientado en fecha o en lugar", value: 1 },
            { label: "2 — Desorientado en fecha y lugar", value: 2 },
            { label: "3 — Desorientado también en persona", value: 3 }
          ]
        },
        {
          id: "alucinaciones",
          type: "select",
          label: "Alucinaciones",
          dropdown: true,
          options: [
            { label: "0 — Ninguna", value: 0 },
            { label: "1 — Leves (el paciente sabe que no son reales)", value: 1 },
            { label: "2 — Moderadas (a veces las cree reales)", value: 2 },
            { label: "3 — Graves (las cree reales y responde a ellas)", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["temblor", "sudor", "agitacion", "orientacion", "alucinaciones"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–15)",
          interpretation: score <= 2 ? "Abstinencia leve: vigilancia y reevaluación periódica." : score <= 5 ? "BAWS ≥ 3 (≈ CIWA-Ar ≥ 8): abstinencia moderada; se recomienda iniciar o ajustar tratamiento según protocolo." : "Abstinencia grave: tratamiento inmediato y vigilancia estrecha (riesgo de delirium tremens).",
          level: score <= 2 ? "ok" : score <= 5 ? "warn" : "danger"
        };
      },
      notes: ["Un BAWS ≥ 3 se corresponde aproximadamente con un CIWA-Ar ≥ 8."],
      references: [
        "Rastegar DA, et al. Development and implementation of an alcohol withdrawal protocol using a 5-item scale (BAWS). Subst Abus. 2017;38(4):394-400."
      ]
    },
    {
      id: "cage",
      name: "Cuestionario CAGE sobre el consumo de alcohol",
      shortName: "CAGE",
      description: "Cribado rápido del consumo problemático de alcohol y de la dependencia alcohólica.",
      category: CAT7,
      specialty: ANES7,
      inputs: [
        {
          id: "c",
          type: "boolean",
          label: "¿Ha sentido alguna vez que debería beber menos? (Cut down)"
        },
        {
          id: "a",
          type: "boolean",
          label: "¿Le ha molestado que la gente critique su forma de beber? (Annoyed)"
        },
        {
          id: "g",
          type: "boolean",
          label: "¿Se ha sentido alguna vez mal o culpable por su forma de beber? (Guilty)"
        },
        {
          id: "e",
          type: "boolean",
          label: "¿Ha bebido alguna vez a primera hora de la mañana para calmar los nervios o la resaca? (Eye-opener)"
        }
      ],
      compute: (v) => {
        const score = sum(v, ["c", "a", "g", "e"]);
        return {
          main: String(score),
          mainUnit: "de 4",
          interpretation: score >= 2 ? "Cribado positivo (≥ 2): alta sospecha de consumo problemático o dependencia; ampliar la evaluación (p. ej., AUDIT, historia clínica dirigida) y valorar riesgo de abstinencia perioperatoria." : score === 1 ? "Una respuesta positiva: valorar ampliar la anamnesis sobre el consumo." : "Cribado negativo.",
          level: score >= 2 ? "danger" : score === 1 ? "warn" : "ok"
        };
      },
      notes: [
        "La respuesta afirmativa a la última pregunta («eye-opener») es especialmente sugestiva de dependencia.",
        "El CAGE no cuantifica el consumo actual: complementar con unidades de bebida estándar por semana."
      ],
      references: ["Ewing JA. Detecting alcoholism: the CAGE questionnaire. JAMA. 1984;252(14):1905-7."]
    }
  ];

  // inurse-main/src/calculators/infecciones.ts
  var CAT8 = "Infecciones";
  var ANES8 = ["Anestesiología"];
  var infecciones = [
    {
      id: "drip",
      name: "Puntuación DRIP de neumonía por patógenos resistentes",
      shortName: "DRIP",
      description: "Predice el riesgo de neumonía adquirida en la comunidad causada por patógenos resistentes a los antibióticos habituales.",
      category: CAT8,
      specialty: ANES8,
      inputs: [
        {
          id: "antibiotico",
          type: "boolean",
          label: "Uso de antibióticos en los últimos 60 días",
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
          label: "Alimentación por sonda",
          points: 2
        },
        {
          id: "previa",
          type: "boolean",
          label: "Infección previa por patógeno resistente (último año)",
          points: 2
        },
        {
          id: "hospitalizacion",
          type: "boolean",
          label: "Hospitalización en los últimos 60 días"
        },
        {
          id: "pulmonar",
          type: "boolean",
          label: "Enfermedad pulmonar crónica",
          description: "EPOC, bronquiectasias, fibrosis…"
        },
        {
          id: "funcional",
          type: "boolean",
          label: "Mal estado funcional",
          description: "Dependencia para las actividades básicas."
        },
        {
          id: "antiacidos",
          type: "boolean",
          label: "Supresión ácida gástrica",
          description: "IBP o anti-H2."
        },
        {
          id: "heridas",
          type: "boolean",
          label: "Cuidado de heridas crónicas"
        },
        {
          id: "mrsa",
          type: "boolean",
          label: "Colonización por SARM en el último año",
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
          mainUnit: "puntos (0–14)",
          interpretation: score < 4 ? "Riesgo bajo de patógenos resistentes: el tratamiento empírico habitual de la NAC suele ser suficiente." : "DRIP ≥ 4: riesgo elevado de patógenos resistentes; valorar cobertura empírica ampliada (p. ej., frente a SARM y Pseudomonas) según protocolo local y cultivos.",
          level: score < 4 ? "ok" : "danger"
        };
      },
      notes: [
        "Factores mayores (2 puntos): antibióticos, residencia de larga estancia, sonda de alimentación e infección resistente previa.",
        "Factores menores (1 punto): hospitalización reciente, enfermedad pulmonar crónica, mal estado funcional, supresión ácida, heridas crónicas y colonización por SARM."
      ],
      references: [
        "Webb BJ, et al. Derivation and multicenter validation of the drug resistance in pneumonia clinical prediction score. Antimicrob Agents Chemother. 2016;60(5):2652-63."
      ]
    }
  ];

  // inurse-main/src/calculators/farmacologia.ts
  var CAT9 = "Farmacología y dosificación";
  var ANES9 = ["Anestesiología"];
  var ANESTESICOS = [
    { nombre: "Lidocaína", mgKg: 4.5, mgKgEpi: 7, capMg: 300, capMgEpi: 500 },
    { nombre: "Mepivacaína", mgKg: 4.4, mgKgEpi: 7, capMg: 400, capMgEpi: 550 },
    { nombre: "Bupivacaína", mgKg: 2.5, mgKgEpi: 3, capMg: 175, capMgEpi: 225 },
    { nombre: "Ropivacaína", mgKg: 3, mgKgEpi: 3, capMg: 225, capMgEpi: 225 }
  ];
  var farmacologia = [
    {
      id: "anestesicos-locales",
      name: "Dosis máxima de anestésicos locales",
      shortName: "Anestésicos locales",
      description: "Calcula la dosis máxima recomendada (mg y volumen) de los anestésicos locales más habituales según el peso.",
      category: CAT9,
      specialty: ANES9,
      inputs: [
        {
          id: "farmaco",
          type: "select",
          label: "Anestésico local",
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
          label: "Concentración de la solución",
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
        var _a, _b, _c, _d;
        const drug = ANESTESICOS[(_a = v.farmaco) != null ? _a : 0];
        const epi = ((_b = v.epinefrina) != null ? _b : 0) === 1;
        const mgKg = epi ? drug.mgKgEpi : drug.mgKg;
        const cap = epi ? drug.capMgEpi : drug.capMg;
        const porPeso = mgKg * v.peso;
        const dosis = Math.min(porPeso, cap);
        const mgMl = ((_c = v.concentracion) != null ? _c : 1) * 10;
        const vol = dosis / mgMl;
        return {
          main: fmt(dosis, 0),
          mainUnit: "mg (dosis máxima)",
          secondary: `${fmt(vol, 1)} mL`,
          secondaryLabel: `volumen máximo al ${fmt((_d = v.concentracion) != null ? _d : 1, 2)} %`,
          interpretation: `${drug.nombre} ${epi ? "con" : "sin"} epinefrina: máximo ${fmt(mgKg, 1)} mg/kg${porPeso > cap ? `, limitado por el techo absoluto de ${cap} mg` : ""}. Aspirar antes de inyectar, fraccionar la dosis y vigilar signos de toxicidad sistémica (LAST).`,
          level: "info",
          details: [
            `Dosis por peso: ${fmt(porPeso, 0)} mg · techo absoluto: ${cap} mg.`,
            "En obesidad, calcular sobre el peso corporal ideal o magro.",
            "Si se combinan varios anestésicos, la toxicidad es aditiva."
          ]
        };
      },
      notes: [
        "Las dosis máximas «clásicas» varían entre fuentes y fichas técnicas; se muestran los valores de referencia más habituales.",
        "La dosis tóxica depende también del lugar de inyección (intercostal > epidural > plexo > subcutáneo).",
        "Ante sospecha de toxicidad sistémica (LAST): parar la inyección, soporte vital y emulsión lipídica al 20 % según protocolo."
      ],
      references: [
        "Neal JM, et al. The Third American Society of Regional Anesthesia and Pain Medicine Practice Advisory on Local Anesthetic Systemic Toxicity. Reg Anesth Pain Med. 2018;43(2):113-23."
      ]
    },
    {
      id: "masa-libre-grasa",
      name: "Masa libre de grasa (MLG)",
      shortName: "MLG / FFM",
      description: "Estima la masa libre de grasa a partir del peso y el IMC (fórmula de Janmahasatian); útil para dosificar fármacos.",
      category: CAT9,
      specialty: ANES9,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Varón", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 20, max: 300 },
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 100, max: 230 }
      ],
      compute: (v) => {
        var _a;
        const w = v.peso;
        const hM = v.talla / 100;
        const bmi = w / (hM * hM);
        const ffm = ((_a = v.sexo) != null ? _a : 0) === 0 ? 9270 * w / (6680 + 216 * bmi) : 9270 * w / (8780 + 244 * bmi);
        const pct = ffm / w * 100;
        return {
          main: fmt(ffm, 1),
          mainUnit: "kg de masa libre de grasa",
          secondary: `${fmt(pct, 0)} %`,
          secondaryLabel: "del peso corporal total",
          interpretation: "La masa libre de grasa es un tamaño corporal útil para dosificar fármacos hidrófilos y para escalar la inducción en pacientes con obesidad (p. ej., propofol de inducción, remifentanilo).",
          level: "info",
          details: [`IMC: ${fmt(bmi, 1)} kg/m².`, "Fórmula de Janmahasatian (2005)."]
        };
      },
      references: [
        "Janmahasatian S, et al. Quantification of lean bodyweight. Clin Pharmacokinet. 2005;44(10):1051-65."
      ]
    }
  ];

  // inurse-main/src/calculators/cardio-fa.ts
  var CAT10 = "Fibrilación auricular y anticoagulación";
  var CARD = ["Cardiología"];
  var cardioFA = [
    {
      id: "cha2ds2-vasc",
      name: "Puntuación CHA₂DS₂-VASc para el riesgo de ictus en fibrilación auricular",
      shortName: "CHA₂DS₂-VASc",
      description: "Estima el riesgo anual de ictus en pacientes con fibrilación auricular no valvular para decidir la anticoagulación.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "icc", type: "boolean", label: "Insuficiencia cardíaca congestiva (C)", description: "Signos/síntomas de IC o FEVI reducida." },
        { id: "hta", type: "boolean", label: "Hipertensión arterial (H)", description: "En tratamiento o PA en reposo > 140/90 mmHg." },
        {
          id: "edad",
          type: "select",
          label: "Edad (A₂ / A)",
          options: [
            { label: "< 65 años", value: 0 },
            { label: "65–74 años", value: 1 },
            { label: "≥ 75 años", value: 2 }
          ]
        },
        { id: "dm", type: "boolean", label: "Diabetes mellitus (D)" },
        { id: "ictus", type: "boolean", label: "Ictus, AIT o embolia sistémica previos (S₂)", points: 2 },
        { id: "vascular", type: "boolean", label: "Enfermedad vascular (V)", description: "IAM previo, arteriopatía periférica o placa aórtica." },
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
          mainUnit: "puntos (0–9)",
          secondary: `${fmt(riesgo2, 1)} %`,
          secondaryLabel: "riesgo anual de ictus/AIT/embolia",
          interpretation: score >= umbralAlto ? "Riesgo elevado: se recomienda anticoagulación oral salvo contraindicación." : score >= umbralConsiderar ? "Riesgo intermedio: considerar anticoagulación oral valorando riesgo hemorrágico y preferencias del paciente." : "Riesgo bajo: en general no se recomienda tratamiento antitrombótico.",
          level: score >= umbralAlto ? "danger" : score >= umbralConsiderar ? "warn" : "ok"
        };
      },
      notes: [
        "El sexo femenino es un modificador de riesgo: puntúa, pero de forma aislada (mujer sin otros factores) no indica anticoagulación.",
        "Porcentajes anuales de la cohorte de validación de Friberg 2012.",
        "Valorar siempre junto al riesgo hemorrágico (HAS-BLED u ORBIT)."
      ],
      references: [
        "Lip GY, et al. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation (Euro Heart Survey). Chest. 2010;137(2):263-72.",
        "Friberg L, et al. Evaluation of risk stratification schemes for ischaemic stroke and bleeding in 182 678 patients with atrial fibrillation. Eur Heart J. 2012;33(12):1500-10."
      ]
    },
    {
      id: "cha2ds2-va",
      name: "Puntuación CHA₂DS₂-VA para el riesgo de ictus en fibrilación auricular",
      shortName: "CHA₂DS₂-VA",
      description: "Versión sin el criterio de sexo recomendada por la guía ESC 2024 para decidir la anticoagulación en fibrilación auricular.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "icc", type: "boolean", label: "Insuficiencia cardíaca congestiva (C)" },
        { id: "hta", type: "boolean", label: "Hipertensión arterial (H)" },
        {
          id: "edad",
          type: "select",
          label: "Edad (A₂ / A)",
          options: [
            { label: "< 65 años", value: 0 },
            { label: "65–74 años", value: 1 },
            { label: "≥ 75 años", value: 2 }
          ]
        },
        { id: "dm", type: "boolean", label: "Diabetes mellitus (D)" },
        { id: "ictus", type: "boolean", label: "Ictus, AIT o embolia sistémica previos (S₂)", points: 2 },
        { id: "vascular", type: "boolean", label: "Enfermedad vascular (V)", description: "IAM previo, arteriopatía periférica o placa aórtica." }
      ],
      compute: (v) => {
        const score = sum(v, ["icc", "hta", "edad", "dm", "ictus", "vascular"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–8)",
          interpretation: score >= 2 ? "CHA₂DS₂-VA ≥ 2: se recomienda anticoagulación oral (guía ESC 2024)." : score === 1 ? "CHA₂DS₂-VA = 1: debe considerarse la anticoagulación oral, individualizando." : "Riesgo bajo: en general no se recomienda anticoagulación.",
          level: score >= 2 ? "danger" : score === 1 ? "warn" : "ok"
        };
      },
      references: [
        "Van Gelder IC, et al. 2024 ESC Guidelines for the management of atrial fibrillation. Eur Heart J. 2024;45(36):3314-414."
      ]
    },
    {
      id: "chads2",
      name: "Puntuación CHADS₂ para el riesgo de ictus en fibrilación auricular",
      shortName: "CHADS₂",
      description: "Estima el riesgo anual de ictus en fibrilación auricular (escala clásica, hoy en general sustituida por CHA₂DS₂-VASc).",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "icc", type: "boolean", label: "Insuficiencia cardíaca congestiva (C)" },
        { id: "hta", type: "boolean", label: "Hipertensión arterial (H)" },
        { id: "edad", type: "boolean", label: "Edad ≥ 75 años (A)" },
        { id: "dm", type: "boolean", label: "Diabetes mellitus (D)" },
        { id: "ictus", type: "boolean", label: "Ictus o AIT previos (S₂)", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["icc", "hta", "edad", "dm", "ictus"]);
        const riesgo2 = [1.9, 2.8, 4, 5.9, 8.5, 12.5, 18.2][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–6)",
          secondary: `${fmt(riesgo2, 1)} %`,
          secondaryLabel: "riesgo anual de ictus",
          interpretation: score >= 2 ? "Riesgo moderado-alto: anticoagulación oral recomendada." : score === 1 ? "Riesgo intermedio: valorar anticoagulación (las guías actuales recomiendan reevaluar con CHA₂DS₂-VASc)." : "Riesgo bajo según CHADS₂; conviene refinar con CHA₂DS₂-VASc antes de descartar la anticoagulación.",
          level: score >= 2 ? "danger" : score === 1 ? "warn" : "ok"
        };
      },
      references: [
        "Gage BF, et al. Validation of clinical classification schemes for predicting stroke (CHADS2). JAMA. 2001;285(22):2864-70."
      ]
    },
    {
      id: "has-bled",
      name: "Puntuación HAS-BLED de riesgo hemorrágico",
      shortName: "HAS-BLED",
      description: "Estima el riesgo de hemorragia mayor en pacientes anticoagulados por fibrilación auricular.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "hta", type: "boolean", label: "Hipertensión no controlada (H)", description: "PA sistólica > 160 mmHg." },
        { id: "renal", type: "boolean", label: "Función renal alterada (A)", description: "Diálisis, trasplante o creatinina > 2,26 mg/dL." },
        { id: "hepatica", type: "boolean", label: "Función hepática alterada (A)", description: "Cirrosis, bilirrubina > 2× o transaminasas > 3× el límite superior." },
        { id: "ictus", type: "boolean", label: "Ictus previo (S)" },
        { id: "sangrado", type: "boolean", label: "Antecedente o predisposición a hemorragia (B)", description: "Hemorragia mayor previa, anemia o diátesis hemorrágica." },
        { id: "inr", type: "boolean", label: "INR lábil (L)", description: "Tiempo en rango terapéutico < 60 % (solo si toma antivitamina K)." },
        { id: "edad", type: "boolean", label: "Edad > 65 años (E)" },
        { id: "farmacos", type: "boolean", label: "Fármacos que favorecen el sangrado (D)", description: "Antiagregantes o AINE." },
        { id: "alcohol", type: "boolean", label: "Consumo de alcohol (D)", description: "≥ 8 unidades a la semana." }
      ],
      compute: (v) => {
        const score = sum(v, ["hta", "renal", "hepatica", "ictus", "sangrado", "inr", "edad", "farmacos", "alcohol"]);
        const tasas = [1.13, 1.02, 1.88, 3.74, 8.7, 12.5];
        const tasa = score <= 5 ? tasas[score] : 12.5;
        return {
          main: String(score),
          mainUnit: "puntos (0–9)",
          secondary: `≈ ${fmt(tasa, 1)}`,
          secondaryLabel: "hemorragias mayores / 100 pacientes-año",
          interpretation: score >= 3 ? "Riesgo hemorrágico alto: no contraindica por sí solo la anticoagulación; corregir los factores modificables (HTA, INR lábil, fármacos, alcohol) y programar controles más frecuentes." : "Riesgo hemorrágico bajo-moderado con las precauciones habituales.",
          level: score >= 3 ? "danger" : score >= 2 ? "warn" : "ok"
        };
      },
      notes: [
        "HAS-BLED sirve para identificar y corregir factores de riesgo modificables, no para negar la anticoagulación.",
        "Tasas orientativas de la cohorte original (puntuaciones ≥ 5 con pocos pacientes)."
      ],
      references: [
        "Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation. Chest. 2010;138(5):1093-100."
      ]
    },
    {
      id: "orbit",
      name: "Puntuación ORBIT de riesgo hemorrágico en fibrilación auricular",
      shortName: "ORBIT",
      description: "Predice el riesgo de hemorragia mayor en pacientes con fibrilación auricular anticoagulados.",
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
        { id: "edad", type: "boolean", label: "Edad > 74 años" },
        { id: "sangrado", type: "boolean", label: "Antecedente de sangrado", description: "Hemorragia digestiva, intracraneal o ictus hemorrágico previos.", points: 2 },
        { id: "renal", type: "boolean", label: "Insuficiencia renal (FGe < 60 mL/min/1,73 m²)" },
        { id: "antiagregante", type: "boolean", label: "Tratamiento antiagregante concomitante" }
      ],
      compute: (v) => {
        const score = sum(v, ["anemia", "edad", "sangrado", "renal", "antiagregante"]);
        const banda = score <= 2 ? "bajo" : score === 3 ? "intermedio" : "alto";
        const tasa = score <= 2 ? 2.4 : score === 3 ? 4.7 : 8.1;
        return {
          main: String(score),
          mainUnit: "puntos (0–7)",
          secondary: `≈ ${fmt(tasa, 1)}`,
          secondaryLabel: "hemorragias mayores / 100 pacientes-año",
          interpretation: `Riesgo hemorrágico ${banda}. Igual que HAS-BLED, orienta a corregir factores modificables y a intensificar el seguimiento, no a suspender la anticoagulación de forma automática.`,
          level: score <= 2 ? "ok" : score === 3 ? "warn" : "danger"
        };
      },
      references: [
        "O'Brien EC, et al. The ORBIT bleeding score: a simple bedside score to assess bleeding risk in atrial fibrillation. Eur Heart J. 2015;36(46):3258-64."
      ]
    },
    {
      id: "atria-hemorragia",
      name: "Puntuación ATRIA de riesgo hemorrágico",
      shortName: "ATRIA (hemorragia)",
      description: "Determina el riesgo de hemorragia mayor en pacientes anticoagulados con warfarina.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "anemia", type: "boolean", label: "Anemia", description: "Hb < 13 g/dL en varones o < 12 g/dL en mujeres.", points: 3 },
        { id: "renal", type: "boolean", label: "Enfermedad renal grave", description: "FGe < 30 mL/min o diálisis.", points: 3 },
        { id: "edad", type: "boolean", label: "Edad ≥ 75 años", points: 2 },
        { id: "sangrado", type: "boolean", label: "Hemorragia previa" },
        { id: "hta", type: "boolean", label: "Hipertensión arterial" }
      ],
      compute: (v) => {
        const score = sum(v, ["anemia", "renal", "edad", "sangrado", "hta"]);
        const banda = score <= 3 ? "bajo" : score === 4 ? "intermedio" : "alto";
        const tasa = score <= 3 ? 0.8 : score === 4 ? 2.6 : 5.8;
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          secondary: `≈ ${fmt(tasa, 1)} %`,
          secondaryLabel: "hemorragias mayores al año",
          interpretation: `Riesgo hemorrágico ${banda} con warfarina.`,
          level: score <= 3 ? "ok" : score === 4 ? "warn" : "danger"
        };
      },
      references: [
        "Fang MC, et al. A new risk scheme to predict warfarin-associated hemorrhage (ATRIA). J Am Coll Cardiol. 2011;58(4):395-401."
      ]
    },
    {
      id: "hemorr2hages",
      name: "Puntuación HEMORR₂HAGES de riesgo hemorrágico",
      shortName: "HEMORR₂HAGES",
      description: "Cuantifica el riesgo hemorrágico en pacientes (sobre todo ancianos) con fibrilación auricular anticoagulados.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        { id: "hepatorenal", type: "boolean", label: "Enfermedad hepática o renal (H)" },
        { id: "etanol", type: "boolean", label: "Abuso de alcohol (E)" },
        { id: "cancer", type: "boolean", label: "Neoplasia (M)" },
        { id: "edad", type: "boolean", label: "Edad > 75 años (O)" },
        { id: "plaquetas", type: "boolean", label: "Cifra o función plaquetaria reducidas (R)", description: "Trombopenia o antiagregación." },
        { id: "resangrado", type: "boolean", label: "Hemorragia previa (R₂)", points: 2 },
        { id: "hta", type: "boolean", label: "Hipertensión no controlada (H)" },
        { id: "anemia", type: "boolean", label: "Anemia (A)" },
        { id: "genetico", type: "boolean", label: "Factores genéticos (G)", description: "Polimorfismos de CYP2C9, si se conocen." },
        { id: "caidas", type: "boolean", label: "Riesgo elevado de caídas (E)" },
        { id: "ictus", type: "boolean", label: "Ictus previo (S)" }
      ],
      compute: (v) => {
        const score = sum(v, ["hepatorenal", "etanol", "cancer", "edad", "plaquetas", "resangrado", "hta", "anemia", "genetico", "caidas", "ictus"]);
        const banda = score <= 1 ? "bajo" : score <= 3 ? "intermedio" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0–12)",
          interpretation: `Riesgo hemorrágico ${banda} (orientativo: de ≈ 1,9 hemorragias/100 pacientes-año con 0 puntos a > 12 con ≥ 5). En riesgo alto, intensificar la vigilancia y corregir factores modificables.`,
          level: score <= 1 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Gage BF, et al. Clinical classification schemes for predicting hemorrhage (HEMORR2HAGES). Am Heart J. 2006;151(3):713-9."
      ]
    },
    {
      id: "dapt",
      name: "Puntuación DAPT (doble antiagregación prolongada)",
      shortName: "DAPT",
      description: "Identifica a los pacientes que se beneficiarían de prolongar la doble antiagregación más allá de 12 meses tras el implante de un stent coronario.",
      category: CAT10,
      specialty: CARD,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 65 años", value: 0 },
            { label: "65–74 años", value: -1 },
            { label: "≥ 75 años", value: -2 }
          ]
        },
        { id: "tabaco", type: "boolean", label: "Fumador actual" },
        { id: "dm", type: "boolean", label: "Diabetes mellitus" },
        { id: "iamActual", type: "boolean", label: "Infarto de miocardio en la presentación" },
        { id: "previo", type: "boolean", label: "IAM o ICP previos" },
        { id: "paclitaxel", type: "boolean", label: "Stent liberador de paclitaxel" },
        { id: "diametro", type: "boolean", label: "Diámetro del stent < 3 mm" },
        { id: "icc", type: "boolean", label: "Insuficiencia cardíaca o FEVI < 30 %", points: 2 },
        { id: "safena", type: "boolean", label: "Stent en injerto de vena safena", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "tabaco", "dm", "iamActual", "previo", "paclitaxel", "diametro", "icc", "safena"]);
        return {
          main: String(score),
          mainUnit: "puntos (−2 a 10)",
          interpretation: score >= 2 ? "Puntuación ≥ 2: relación beneficio/riesgo favorable a prolongar la doble antiagregación (menos eventos isquémicos que hemorragias añadidas)." : "Puntuación < 2: la prolongación de la doble antiagregación aporta poco beneficio isquémico con más riesgo hemorrágico; en general, no prolongar.",
          level: score >= 2 ? "info" : "warn"
        };
      },
      notes: ["Aplicable a pacientes que han completado 12 meses de doble antiagregación sin eventos isquémicos ni hemorrágicos mayores."],
      references: [
        "Yeh RW, et al. Development and validation of a prediction rule for benefit and harm of dual antiplatelet therapy beyond 1 year after percutaneous coronary intervention. JAMA. 2016;315(16):1735-49."
      ]
    }
  ];

  // inurse-main/src/calculators/cardio-sca.ts
  var CAT11 = "Síndrome coronario agudo y dolor torácico";
  var CARD2 = ["Cardiología"];
  var cardioSCA = [
    {
      id: "heart",
      name: "Puntuación HEART para eventos cardíacos mayores",
      shortName: "HEART",
      description: "Predice el riesgo a 6 semanas de eventos cardíacos adversos mayores (MACE) en pacientes con dolor torácico en urgencias.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        {
          id: "historia",
          type: "select",
          label: "Historia clínica (History)",
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
            { label: "Alteraciones inespecíficas de la repolarización", value: 1 },
            { label: "Descenso significativo del ST", value: 2 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad (Age)",
          options: [
            { label: "< 45 años", value: 0 },
            { label: "45–64 años", value: 1 },
            { label: "≥ 65 años", value: 2 }
          ]
        },
        {
          id: "factores",
          type: "select",
          label: "Factores de riesgo (Risk factors)",
          description: "HTA, hipercolesterolemia, diabetes, obesidad (IMC > 30), tabaquismo, historia familiar de cardiopatía precoz o enfermedad aterosclerótica conocida.",
          options: [
            { label: "Ninguno", value: 0 },
            { label: "1–2 factores", value: 1 },
            { label: "≥ 3 factores o enfermedad aterosclerótica conocida", value: 2 }
          ]
        },
        {
          id: "troponina",
          type: "select",
          label: "Troponina (Troponin)",
          options: [
            { label: "≤ límite normal", value: 0 },
            { label: "1–3 × el límite normal", value: 1 },
            { label: "> 3 × el límite normal", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["historia", "ecg", "edad", "factores", "troponina"]);
        const banda = score <= 3 ? "bajo" : score <= 6 ? "intermedio" : "alto";
        const pct = score <= 3 ? "≈ 1–2 %" : score <= 6 ? "≈ 12–17 %" : "≈ 50–65 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          secondary: pct,
          secondaryLabel: "MACE a 6 semanas",
          interpretation: banda === "bajo" ? "Riesgo bajo: candidato a alta precoz con seguimiento ambulatorio (según protocolo HEART Pathway con troponinas seriadas negativas)." : banda === "intermedio" ? "Riesgo intermedio: observación e ingreso para estudio (troponinas seriadas, pruebas de isquemia)." : "Riesgo alto: manejo agresivo precoz, valorar estrategia invasiva.",
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
      name: "Escala EDACS de dolor torácico en urgencias",
      shortName: "EDACS",
      description: "Identifica a los pacientes con dolor torácico de bajo riesgo de evento coronario adverso mayor a 30 días.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          dropdown: true,
          options: [
            { label: "18–45 años", value: 2 },
            { label: "46–50 años", value: 4 },
            { label: "51–55 años", value: 6 },
            { label: "56–60 años", value: 8 },
            { label: "61–65 años", value: 10 },
            { label: "66–70 años", value: 12 },
            { label: "71–75 años", value: 14 },
            { label: "76–80 años", value: 16 },
            { label: "81–85 años", value: 18 },
            { label: "≥ 86 años", value: 20 }
          ]
        },
        { id: "varon", type: "boolean", label: "Sexo masculino", points: 6 },
        {
          id: "riesgo",
          type: "boolean",
          label: "EAC conocida o ≥ 3 factores de riesgo (solo si tiene 18–50 años)",
          description: "Factores: HTA, dislipemia, diabetes, tabaquismo, historia familiar de cardiopatía precoz.",
          points: 4
        },
        { id: "sudor", type: "boolean", label: "Diaforesis", points: 3 },
        { id: "irradiacion", type: "boolean", label: "Dolor irradiado a brazo, hombro, cuello o mandíbula", points: 5 },
        { id: "inspiracion", type: "boolean", label: "El dolor empeora con la inspiración", points: -4 },
        { id: "palpacion", type: "boolean", label: "El dolor se reproduce con la palpación", points: -6 }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "varon", "riesgo", "sudor", "irradiacion", "inspiracion", "palpacion"]);
        return {
          main: String(score),
          mainUnit: "puntos",
          interpretation: score < 16 ? "EDACS < 16: riesgo bajo si además el ECG no muestra isquemia aguda y las troponinas a las 0 y 2 h son negativas — candidato a alta precoz con seguimiento." : "EDACS ≥ 16: no es de bajo riesgo; continuar la evaluación habitual del síndrome coronario agudo.",
          level: score < 16 ? "ok" : "warn"
        };
      },
      notes: ["La regla completa (EDACS-ADP) exige, además de la puntuación < 16, un ECG sin isquemia y troponinas seriadas negativas."],
      references: [
        "Than M, et al. Development and validation of the Emergency Department Assessment of Chest pain Score and 2 h accelerated diagnostic protocol. Emerg Med Australas. 2014;26(1):34-44."
      ]
    },
    {
      id: "timi-nstemi",
      name: "Puntuación TIMI para angina inestable / IAMSEST",
      shortName: "TIMI UA/NSTEMI",
      description: "Estima el riesgo de muerte, infarto o revascularización urgente a 14 días en angina inestable o infarto sin elevación del ST.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad ≥ 65 años" },
        { id: "factores", type: "boolean", label: "≥ 3 factores de riesgo de EAC", description: "HTA, hipercolesterolemia, diabetes, tabaquismo, historia familiar." },
        { id: "eac", type: "boolean", label: "EAC conocida (estenosis ≥ 50 %)" },
        { id: "aas", type: "boolean", label: "Uso de AAS en los últimos 7 días" },
        { id: "angina", type: "boolean", label: "Angina grave reciente (≥ 2 episodios en 24 h)" },
        { id: "st", type: "boolean", label: "Desviación del ST ≥ 0,5 mm en el ECG" },
        { id: "marcadores", type: "boolean", label: "Marcadores cardíacos elevados" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "factores", "eac", "aas", "angina", "st", "marcadores"]);
        const riesgo2 = [4.7, 4.7, 8.3, 13.2, 19.9, 26.2, 40.9, 40.9][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–7)",
          secondary: `${fmt(riesgo2, 1)} %`,
          secondaryLabel: "eventos a 14 días",
          interpretation: score <= 2 ? "Riesgo bajo de muerte, IAM o revascularización urgente a 14 días." : score <= 4 ? "Riesgo intermedio: se beneficia de tratamiento antitrombótico intensivo y estrategia invasiva precoz." : "Riesgo alto: estrategia invasiva precoz recomendada.",
          level: score <= 2 ? "ok" : score <= 4 ? "warn" : "danger"
        };
      },
      references: [
        "Antman EM, et al. The TIMI risk score for unstable angina/non-ST elevation MI. JAMA. 2000;284(7):835-42."
      ]
    },
    {
      id: "timi-stemi",
      name: "Puntuación TIMI para STEMI",
      shortName: "TIMI STEMI",
      description: "Estima la mortalidad a 30 días en el infarto agudo de miocardio con elevación del ST.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 65 años", value: 0 },
            { label: "65–74 años", value: 2 },
            { label: "≥ 75 años", value: 3 }
          ]
        },
        { id: "dmHtaAngina", type: "boolean", label: "Diabetes, hipertensión o angina previa" },
        { id: "pas", type: "boolean", label: "PA sistólica < 100 mmHg", points: 3 },
        { id: "fc", type: "boolean", label: "Frecuencia cardíaca > 100 lpm", points: 2 },
        { id: "killip", type: "boolean", label: "Clase Killip II–IV", points: 2 },
        { id: "peso", type: "boolean", label: "Peso < 67 kg" },
        { id: "anterior", type: "boolean", label: "Elevación del ST anterior o bloqueo de rama izquierda" },
        { id: "tiempo", type: "boolean", label: "Tiempo hasta el tratamiento > 4 horas" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "dmHtaAngina", "pas", "fc", "killip", "peso", "anterior", "tiempo"]);
        const tabla = [0.8, 1.6, 2.2, 4.4, 7.3, 12.4, 16.1, 23.4, 26.8];
        const riesgo2 = score <= 8 ? tabla[score] : 35.9;
        return {
          main: String(score),
          mainUnit: "puntos (0–14)",
          secondary: `${fmt(riesgo2, 1)} %`,
          secondaryLabel: "mortalidad a 30 días",
          interpretation: score <= 3 ? "Riesgo bajo-moderado de mortalidad a 30 días." : score <= 6 ? "Riesgo elevado: vigilancia intensiva tras la reperfusión." : "Riesgo muy elevado: considerar soporte avanzado y vigilancia en unidad coronaria.",
          level: score <= 3 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      references: [
        "Morrow DA, et al. TIMI risk score for ST-elevation myocardial infarction. Circulation. 2000;102(17):2031-7."
      ]
    },
    {
      id: "timi-indice",
      name: "Índice de riesgo TIMI",
      shortName: "Índice TIMI",
      description: "Estimación rápida de la mortalidad en el síndrome coronario agudo usando solo edad, frecuencia cardíaca y presión arterial.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        { id: "fc", type: "number", label: "Frecuencia cardíaca", unit: "lpm", min: 20, max: 250 },
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 18, max: 110 },
        { id: "pas", type: "number", label: "Presión arterial sistólica", unit: "mmHg", min: 40, max: 260 }
      ],
      compute: (v) => {
        const indice = v.fc * Math.pow(v.edad / 10, 2) / v.pas;
        const banda = indice < 12.5 ? "muy bajo" : indice < 17.5 ? "bajo" : indice < 22.5 ? "intermedio" : indice < 30 ? "alto" : "muy alto";
        return {
          main: fmt(indice, 1),
          interpretation: `Riesgo ${banda} de mortalidad a 30 días (quintiles orientativos: < 12,5 ≈ < 1 %; > 30 ≈ ≥ 8 %). Útil como triaje rápido inicial; no sustituye a las escalas completas.`,
          level: indice < 17.5 ? "ok" : indice < 22.5 ? "info" : indice < 30 ? "warn" : "danger",
          details: ["Índice = FC × (edad/10)² / PAS."]
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
          label: "Elevación del ST ≥ 1 mm concordante con el QRS",
          description: "En cualquier derivación.",
          points: 5
        },
        {
          id: "descensoV1V3",
          type: "boolean",
          label: "Descenso del ST ≥ 1 mm en V1–V3",
          points: 3
        },
        {
          id: "discordante",
          type: "boolean",
          label: "Elevación del ST ≥ 5 mm discordante con el QRS",
          points: 2
        },
        {
          id: "ratio",
          type: "boolean",
          label: "Criterio modificado (Smith): elevación discordante del ST con relación ST/S ≥ 0,25",
          description: "Elevación del ST ≥ 1 mm y ST/S ≥ 25 % en cualquier derivación.",
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
          interpretation: originalPositivo ? "Criterios originales ≥ 3 puntos: alta especificidad para infarto agudo de miocardio — activar el protocolo de reperfusión." : modificadoPositivo ? "Criterios modificados positivos: sugieren IAM con mayor sensibilidad que los originales — correlacionar con clínica y troponinas y valorar reperfusión." : "Criterios negativos: no descartan el infarto (sensibilidad limitada); seriar ECG y troponinas si la sospecha persiste.",
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
      name: "Clasificación de Killip para la insuficiencia cardíaca en el SCA",
      shortName: "Killip",
      description: "Cuantifica la gravedad de la insuficiencia cardíaca en el síndrome coronario agudo y estima la mortalidad.",
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
            { label: "I — Sin signos de insuficiencia cardíaca", value: 1 },
            { label: "II — Crepitantes basales, galope S3 o ingurgitación yugular", value: 2 },
            { label: "III — Edema agudo de pulmón", value: 3 },
            { label: "IV — Shock cardiogénico (hipotensión, hipoperfusión)", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const c = (_a = v.clase) != null ? _a : 1;
        const mort = ["", "≈ 6 %", "≈ 17 %", "≈ 38 %", "≈ 67–81 %"][c];
        return {
          main: `Killip ${["", "I", "II", "III", "IV"][c]}`,
          secondary: mort,
          secondaryLabel: "mortalidad histórica a 30 días",
          interpretation: c === 1 ? "Sin insuficiencia cardíaca: pronóstico favorable." : c === 2 ? "Insuficiencia cardíaca leve-moderada: vigilancia estrecha y tratamiento descongestivo." : c === 3 ? "Edema agudo de pulmón: tratamiento intensivo inmediato." : "Shock cardiogénico: soporte hemodinámico y revascularización urgente.",
          level: c === 1 ? "ok" : c === 2 ? "info" : c === 3 ? "warn" : "danger"
        };
      },
      notes: ["Las mortalidades proceden de la serie original (1967); con la reperfusión actual son menores, pero el gradiente pronóstico se mantiene."],
      references: [
        "Killip T, Kimball JT. Treatment of myocardial infarction in a coronary care unit. Am J Cardiol. 1967;20(4):457-64."
      ]
    },
    {
      id: "duke-treadmill",
      name: "Puntuación de la cinta de correr de Duke",
      shortName: "Duke Treadmill",
      description: "Estratifica el pronóstico de la enfermedad coronaria sospechada a partir de la ergometría (protocolo de Bruce).",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        { id: "minutos", type: "number", label: "Duración del ejercicio (protocolo de Bruce)", unit: "min", min: 0, max: 30 },
        { id: "st", type: "number", label: "Desviación máxima del ST", unit: "mm", min: 0, max: 10, step: 0.5 },
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
        var _a;
        const dts = v.minutos - 5 * v.st - 4 * ((_a = v.angina) != null ? _a : 0);
        const banda = dts >= 5 ? "bajo" : dts >= -10 ? "intermedio" : "alto";
        return {
          main: fmt(dts, 1),
          mainUnit: "puntos",
          interpretation: banda === "bajo" ? "Riesgo bajo (≥ +5): supervivencia a 4 años ≈ 99 %; en general no requiere estudios invasivos." : banda === "intermedio" ? "Riesgo intermedio (−10 a +4): valorar prueba de imagen o coronariografía según el contexto clínico." : "Riesgo alto (≤ −11): mortalidad anual ≈ 5 %; considerar coronariografía.",
          level: banda === "bajo" ? "ok" : banda === "intermedio" ? "warn" : "danger",
          details: ["DTS = minutos de ejercicio − 5 × desviación del ST (mm) − 4 × índice de angina."]
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
          label: "Paso 1 — Ausencia de complejo RS en todas las derivaciones precordiales",
          noPoints: true
        },
        {
          id: "rsLargo",
          type: "boolean",
          label: "Paso 2 — Intervalo R–S > 100 ms en alguna precordial",
          description: "Del inicio de la R al nadir de la S.",
          noPoints: true
        },
        {
          id: "disociacion",
          type: "boolean",
          label: "Paso 3 — Disociación auriculoventricular",
          noPoints: true
        },
        {
          id: "morfologia",
          type: "boolean",
          label: "Paso 4 — Criterios morfológicos de TV en V1–V2 y V6",
          noPoints: true
        }
      ],
      compute: (v) => {
        const tv = v.rs === 1 || v.rsLargo === 1 || v.disociacion === 1 || v.morfologia === 1;
        return {
          main: tv ? "TV" : "TSV con aberrancia",
          interpretation: tv ? "Si cualquiera de los pasos es positivo, el algoritmo diagnostica taquicardia ventricular (especificidad alta). Tratar como TV." : "Con los cuatro pasos negativos, el algoritmo sugiere taquicardia supraventricular con conducción aberrante. Ante la duda, tratar siempre como TV.",
          level: tv ? "danger" : "info"
        };
      },
      notes: [
        "En pacientes inestables no aplicar algoritmos: cardioversión inmediata.",
        "Ante la duda, toda taquicardia regular de QRS ancho se trata como TV."
      ],
      references: [
        "Brugada P, et al. A new approach to the differential diagnosis of a regular tachycardia with a wide QRS complex. Circulation. 1991;83(5):1649-59."
      ]
    },
    {
      id: "mehran",
      name: "Puntuación de Mehran para nefropatía por contraste tras ICP",
      shortName: "Mehran",
      description: "Predice el riesgo de nefropatía inducida por contraste tras una intervención coronaria percutánea.",
      category: CAT11,
      specialty: CARD2,
      inputs: [
        { id: "hipotension", type: "boolean", label: "Hipotensión", description: "PAS < 80 mmHg ≥ 1 h que requiere soporte.", points: 5 },
        { id: "biac", type: "boolean", label: "Balón de contrapulsación intraaórtico", points: 5 },
        { id: "icc", type: "boolean", label: "Insuficiencia cardíaca (NYHA III–IV o edema pulmonar)", points: 5 },
        { id: "edad", type: "boolean", label: "Edad > 75 años", points: 4 },
        { id: "anemia", type: "boolean", label: "Anemia", description: "Hto < 39 % en varones o < 36 % en mujeres.", points: 3 },
        { id: "dm", type: "boolean", label: "Diabetes mellitus", points: 3 },
        {
          id: "fge",
          type: "select",
          label: "Filtrado glomerular estimado",
          options: [
            { label: "≥ 60 mL/min/1,73 m²", value: 0 },
            { label: "40–59", value: 2 },
            { label: "20–39", value: 4 },
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
          secondaryLabel: "riesgo de nefropatía por contraste",
          interpretation: `Riesgo ${banda}. Riesgo de diálisis: ${dialisis}. En riesgo moderado-alto: hidratación pautada, minimizar contraste y evitar nefrotóxicos.`,
          level: score <= 5 ? "ok" : score <= 10 ? "info" : score <= 15 ? "warn" : "danger",
          details: ["El volumen de contraste añade 1 punto por cada 100 mL."]
        };
      },
      references: [
        "Mehran R, et al. A simple risk score for prediction of contrast-induced nephropathy after percutaneous coronary intervention. J Am Coll Cardiol. 2004;44(7):1393-9."
      ]
    }
  ];

  // inurse-main/src/calculators/cardio-tev.ts
  var CAT12 = "Tromboembolismo venoso";
  var CARD3 = ["Cardiología"];
  var cardioTEV = [
    {
      id: "wells-ep",
      name: "Criterios de Wells para la embolia pulmonar",
      shortName: "Wells EP",
      description: "Calcula la probabilidad clínica (pretest) de embolia pulmonar para decidir los siguientes pasos diagnósticos.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "tvp", type: "boolean", label: "Signos clínicos de TVP", description: "Edema y dolor a la palpación de la pierna.", points: 3 },
        { id: "primera", type: "boolean", label: "La EP es el diagnóstico más probable (o igual de probable)", points: 3 },
        { id: "fc", type: "boolean", label: "Frecuencia cardíaca > 100 lpm", points: 1.5 },
        { id: "inmovilizacion", type: "boolean", label: "Inmovilización ≥ 3 días o cirugía en las últimas 4 semanas", points: 1.5 },
        { id: "previo", type: "boolean", label: "TVP o EP previas", points: 1.5 },
        { id: "hemoptisis", type: "boolean", label: "Hemoptisis" },
        { id: "cancer", type: "boolean", label: "Neoplasia activa", description: "En tratamiento, tratada en los últimos 6 meses o paliativa." }
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
          interpretation: score <= 4 ? `Probabilidad ${tres} (tres niveles). Con «EP improbable» (≤ 4): dímero D; si es negativo, la EP queda razonablemente excluida.` : `Probabilidad ${tres} (tres niveles). Con «EP probable» (> 4): angio-TC pulmonar directamente (el dímero D no basta para excluir).`,
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
      description: "Calcula la probabilidad clínica de trombosis venosa profunda.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "cancer", type: "boolean", label: "Neoplasia activa", description: "En tratamiento actual, en los últimos 6 meses o paliativa." },
        { id: "paralisis", type: "boolean", label: "Parálisis, paresia o inmovilización reciente con yeso de una pierna" },
        { id: "encamado", type: "boolean", label: "Encamado ≥ 3 días o cirugía mayor en las últimas 12 semanas" },
        { id: "dolor", type: "boolean", label: "Dolor a la palpación del trayecto venoso profundo" },
        { id: "edemaPierna", type: "boolean", label: "Edema de toda la pierna" },
        { id: "pantorrilla", type: "boolean", label: "Perímetro de la pantorrilla > 3 cm mayor que el contralateral", description: "Medido 10 cm bajo la tuberosidad tibial." },
        { id: "fovea", type: "boolean", label: "Edema con fóvea limitado a la pierna sintomática" },
        { id: "colaterales", type: "boolean", label: "Venas superficiales colaterales (no varicosas)" },
        { id: "previa", type: "boolean", label: "TVP previa documentada" },
        { id: "alternativo", type: "boolean", label: "Diagnóstico alternativo al menos igual de probable", points: -2 }
      ],
      compute: (v) => {
        const score = sum(v, ["cancer", "paralisis", "encamado", "dolor", "edemaPierna", "pantorrilla", "fovea", "colaterales", "previa", "alternativo"]);
        const banda = score <= 0 ? "baja (≈ 5 %)" : score <= 2 ? "moderada (≈ 17 %)" : "alta (≈ 17–53 %)";
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: score >= 2 ? "TVP probable" : "TVP improbable",
          secondaryLabel: "modelo de dos niveles",
          interpretation: score >= 2 ? `Probabilidad ${banda}. Con «TVP probable» (≥ 2): ecografía de compresión; el dímero D negativo no excluye por sí solo.` : `Probabilidad ${banda}. Con «TVP improbable» (< 2): dímero D; si es negativo, la TVP queda razonablemente excluida.`,
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
      description: "Descarta la embolia pulmonar sin más pruebas cuando la probabilidad clínica es baja (< 15 %) y no se cumple ningún criterio.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad ≥ 50 años" },
        { id: "fc", type: "boolean", label: "Frecuencia cardíaca ≥ 100 lpm" },
        { id: "spo2", type: "boolean", label: "SpO₂ < 95 % (aire ambiente)" },
        { id: "edema", type: "boolean", label: "Edema unilateral de una pierna" },
        { id: "hemoptisis", type: "boolean", label: "Hemoptisis" },
        { id: "cirugia", type: "boolean", label: "Cirugía o traumatismo en las últimas 4 semanas" },
        { id: "previo", type: "boolean", label: "TVP o EP previas" },
        { id: "hormonas", type: "boolean", label: "Uso de estrógenos", description: "Anticonceptivos, terapia hormonal." }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "fc", "spo2", "edema", "hemoptisis", "cirugia", "previo", "hormonas"]);
        return {
          main: String(score),
          mainUnit: score === 1 ? "criterio" : "criterios",
          interpretation: score === 0 ? "PERC negativa: en pacientes con probabilidad clínica baja (< 15 %), la EP queda descartada sin necesidad de dímero D (riesgo residual < 2 %)." : "PERC positiva: no permite descartar la EP; continuar con dímero D o imagen según la probabilidad clínica.",
          level: score === 0 ? "ok" : "warn"
        };
      },
      notes: ["Solo aplicable si la impresión clínica previa es de probabilidad baja; no usar en pacientes de probabilidad intermedia o alta."],
      references: [
        "Kline JA, et al. Clinical criteria to prevent unnecessary diagnostic testing in emergency department patients with suspected pulmonary embolism. J Thromb Haemost. 2004;2(8):1247-55."
      ]
    },
    {
      id: "ginebra",
      name: "Puntuación de Ginebra revisada para la embolia pulmonar",
      shortName: "Ginebra revisada",
      description: "Objetiva la probabilidad clínica de embolia pulmonar (alternativa a los criterios de Wells).",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad > 65 años" },
        { id: "previo", type: "boolean", label: "TVP o EP previas", points: 3 },
        { id: "cirugia", type: "boolean", label: "Cirugía o fractura en el último mes", points: 2 },
        { id: "cancer", type: "boolean", label: "Neoplasia activa", points: 2 },
        { id: "dolorUnilateral", type: "boolean", label: "Dolor unilateral en una pierna", points: 3 },
        { id: "hemoptisis", type: "boolean", label: "Hemoptisis", points: 2 },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia cardíaca",
          options: [
            { label: "< 75 lpm", value: 0 },
            { label: "75–94 lpm", value: 3 },
            { label: "≥ 95 lpm", value: 5 }
          ]
        },
        {
          id: "palpacion",
          type: "boolean",
          label: "Dolor a la palpación venosa profunda y edema unilateral",
          points: 4
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "previo", "cirugia", "cancer", "dolorUnilateral", "hemoptisis", "fc", "palpacion"]);
        const banda = score <= 3 ? "baja (≈ 8 %)" : score <= 10 ? "intermedia (≈ 28 %)" : "alta (≈ 74 %)";
        return {
          main: String(score),
          mainUnit: "puntos (0–25)",
          interpretation: `Probabilidad clínica ${banda} de embolia pulmonar. Probabilidad baja-intermedia: dímero D; probabilidad alta: imagen directamente.`,
          level: score <= 3 ? "ok" : score <= 10 ? "warn" : "danger"
        };
      },
      references: [
        "Le Gal G, et al. Prediction of pulmonary embolism in the emergency department: the revised Geneva score. Ann Intern Med. 2006;144(3):165-71."
      ]
    },
    {
      id: "pesi",
      name: "Índice de gravedad de la embolia pulmonar (PESI)",
      shortName: "PESI",
      description: "Predice la mortalidad a 30 días en pacientes con embolia pulmonar confirmada.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "edad", type: "number", label: "Edad (suma 1 punto por año)", unit: "años", min: 18, max: 110 },
        { id: "varon", type: "boolean", label: "Sexo masculino", points: 10 },
        { id: "cancer", type: "boolean", label: "Neoplasia", points: 30 },
        { id: "icc", type: "boolean", label: "Insuficiencia cardíaca crónica", points: 10 },
        { id: "epoc", type: "boolean", label: "Enfermedad pulmonar crónica", points: 10 },
        { id: "fc", type: "boolean", label: "Frecuencia cardíaca ≥ 110 lpm", points: 20 },
        { id: "pas", type: "boolean", label: "PA sistólica < 100 mmHg", points: 30 },
        { id: "fr", type: "boolean", label: "Frecuencia respiratoria ≥ 30 rpm", points: 20 },
        { id: "temp", type: "boolean", label: "Temperatura < 36 °C", points: 20 },
        { id: "mental", type: "boolean", label: "Alteración del estado mental", description: "Desorientación, letargo, estupor o coma.", points: 60 },
        { id: "spo2", type: "boolean", label: "SpO₂ < 90 %", points: 20 }
      ],
      compute: (v) => {
        const score = v.edad + sum(v, ["varon", "cancer", "icc", "epoc", "fc", "pas", "fr", "temp", "mental", "spo2"]);
        const clase = score <= 65 ? 1 : score <= 85 ? 2 : score <= 105 ? 3 : score <= 125 ? 4 : 5;
        const mort = ["", "0–1,6 %", "1,7–3,5 %", "3,2–7,1 %", "4,0–11,4 %", "10–24,5 %"][clase];
        return {
          main: String(score),
          mainUnit: `puntos — clase ${["", "I", "II", "III", "IV", "V"][clase]}`,
          secondary: mort,
          secondaryLabel: "mortalidad a 30 días",
          interpretation: clase <= 2 ? "Clases I–II (riesgo bajo): candidato a tratamiento ambulatorio o alta precoz si no hay otros motivos de ingreso." : clase === 3 ? "Clase III (riesgo intermedio): ingreso y vigilancia." : "Clases IV–V (riesgo alto): ingreso, considerar unidad de intermedios/UCI y evaluar disfunción del ventrículo derecho.",
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
      description: "Predice la mortalidad a 30 días en la embolia pulmonar con solo seis criterios.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad > 80 años" },
        { id: "cancer", type: "boolean", label: "Neoplasia" },
        { id: "cardiopulmonar", type: "boolean", label: "Enfermedad cardiopulmonar crónica", description: "Insuficiencia cardíaca o enfermedad pulmonar crónica." },
        { id: "fc", type: "boolean", label: "Frecuencia cardíaca ≥ 110 lpm" },
        { id: "pas", type: "boolean", label: "PA sistólica < 100 mmHg" },
        { id: "spo2", type: "boolean", label: "SpO₂ < 90 %" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "cancer", "cardiopulmonar", "fc", "pas", "spo2"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–6)",
          secondary: score === 0 ? "≈ 1,0 %" : "≈ 10,9 %",
          secondaryLabel: "mortalidad a 30 días",
          interpretation: score === 0 ? "sPESI = 0: riesgo bajo; candidato a tratamiento ambulatorio o alta precoz si el resto del contexto lo permite." : "sPESI ≥ 1: riesgo no bajo; ingreso y estratificación adicional (biomarcadores, función del ventrículo derecho).",
          level: score === 0 ? "ok" : "danger"
        };
      },
      references: [
        "Jiménez D, et al. Simplification of the Pulmonary Embolism Severity Index for prognostication in patients with acute symptomatic pulmonary embolism. Arch Intern Med. 2010;170(15):1383-9."
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
        { id: "inestable", type: "boolean", label: "Inestabilidad hemodinámica", description: "PAS < 100 mmHg con FC > 100 lpm; o necesidad de UCI/vasoactivos." },
        { id: "trombolisis", type: "boolean", label: "Necesidad de trombólisis o embolectomía" },
        { id: "sangradoActivo", type: "boolean", label: "Hemorragia activa o riesgo hemorrágico alto" },
        { id: "oxigeno", type: "boolean", label: "Necesidad de oxígeno para mantener SpO₂ > 90 % durante más de 24 h" },
        { id: "anticoagulado", type: "boolean", label: "EP diagnosticada estando ya anticoagulado" },
        { id: "dolor", type: "boolean", label: "Dolor intenso que requiere analgesia intravenosa > 24 h" },
        { id: "social", type: "boolean", label: "Motivo médico o social que exige ingreso > 24 h" },
        { id: "renal", type: "boolean", label: "Aclaramiento de creatinina < 30 mL/min" },
        { id: "hepatica", type: "boolean", label: "Insuficiencia hepática grave" },
        { id: "embarazo", type: "boolean", label: "Embarazo" },
        { id: "tih", type: "boolean", label: "Antecedente documentado de trombopenia inducida por heparina" }
      ],
      compute: (v) => {
        const score = sum(v, ["inestable", "trombolisis", "sangradoActivo", "oxigeno", "anticoagulado", "dolor", "social", "renal", "hepatica", "embarazo", "tih"]);
        return {
          main: String(score),
          mainUnit: score === 1 ? "criterio" : "criterios",
          interpretation: score === 0 ? "Ningún criterio de Hestia: candidato a tratamiento ambulatorio de la EP (mortalidad y recurrencias bajas en las cohortes de validación)." : "Uno o más criterios presentes: se recomienda tratamiento hospitalario.",
          level: score === 0 ? "ok" : "danger"
        };
      },
      references: [
        "Zondag W, et al. Outpatient treatment in patients with acute pulmonary embolism: the Hestia Study. J Thromb Haemost. 2011;9(8):1500-7."
      ]
    },
    {
      id: "padua",
      name: "Puntuación de Padua para el riesgo de TEV en pacientes hospitalizados",
      shortName: "Padua",
      description: "Determina la necesidad de tromboprofilaxis en pacientes médicos hospitalizados según su riesgo de tromboembolismo venoso.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "cancer", type: "boolean", label: "Cáncer activo", description: "Metástasis o quimioterapia/radioterapia en los últimos 6 meses.", points: 3 },
        { id: "previo", type: "boolean", label: "TEV previo (excluida la trombosis superficial)", points: 3 },
        { id: "movilidad", type: "boolean", label: "Movilidad reducida", description: "Encamamiento ≥ 3 días (con permiso para el baño).", points: 3 },
        { id: "trombofilia", type: "boolean", label: "Trombofilia conocida", points: 3 },
        { id: "trauma", type: "boolean", label: "Traumatismo o cirugía en el último mes", points: 2 },
        { id: "edad", type: "boolean", label: "Edad ≥ 70 años" },
        { id: "cardioresp", type: "boolean", label: "Insuficiencia cardíaca o respiratoria" },
        { id: "iamIctus", type: "boolean", label: "IAM o ictus isquémico agudos" },
        { id: "infeccion", type: "boolean", label: "Infección aguda o enfermedad reumatológica" },
        { id: "obesidad", type: "boolean", label: "Obesidad (IMC ≥ 30)" },
        { id: "hormonal", type: "boolean", label: "Tratamiento hormonal en curso" }
      ],
      compute: (v) => {
        const score = sum(v, ["cancer", "previo", "movilidad", "trombofilia", "trauma", "edad", "cardioresp", "iamIctus", "infeccion", "obesidad", "hormonal"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–20)",
          interpretation: score >= 4 ? "Riesgo alto de TEV (≥ 4): indicada la tromboprofilaxis farmacológica si no hay contraindicación (si el riesgo hemorrágico es alto, profilaxis mecánica)." : "Riesgo bajo de TEV (< 4): en general no requiere profilaxis farmacológica; fomentar la movilización precoz.",
          level: score >= 4 ? "danger" : "ok"
        };
      },
      references: [
        "Barbar S, et al. A risk assessment model for the identification of hospitalized medical patients at risk for venous thromboembolism: the Padua Prediction Score. J Thromb Haemost. 2010;8(11):2450-7."
      ]
    },
    {
      id: "improve-tev",
      name: "Puntuación IMPROVE de riesgo de TEV",
      shortName: "IMPROVE",
      description: "Predice el riesgo de tromboembolismo venoso a 3 meses en pacientes médicos hospitalizados.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "previo", type: "boolean", label: "TEV previo", points: 3 },
        { id: "trombofilia", type: "boolean", label: "Trombofilia conocida", points: 2 },
        { id: "paralisis", type: "boolean", label: "Parálisis de miembros inferiores actual", points: 2 },
        { id: "cancer", type: "boolean", label: "Cáncer activo", points: 2 },
        { id: "inmovilizacion", type: "boolean", label: "Inmovilización ≥ 7 días", description: "Inmediatamente antes y durante el ingreso." },
        { id: "uci", type: "boolean", label: "Estancia en UCI o unidad coronaria" },
        { id: "edad", type: "boolean", label: "Edad > 60 años" }
      ],
      compute: (v) => {
        const score = sum(v, ["previo", "trombofilia", "paralisis", "cancer", "inmovilizacion", "uci", "edad"]);
        const riesgo2 = score === 0 ? "0,4 %" : score === 1 ? "0,6 %" : score === 2 ? "1,0 %" : score === 3 ? "1,7 %" : score === 4 ? "2,9 %" : "≥ 5 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–12)",
          secondary: riesgo2,
          secondaryLabel: "TEV sintomático a 3 meses",
          interpretation: score < 2 ? "Riesgo bajo (< 2): la profilaxis farmacológica aporta poco beneficio en la mayoría de los casos." : "Riesgo aumentado (≥ 2): valorar tromboprofilaxis farmacológica si no hay contraindicación.",
          level: score < 2 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Spyropoulos AC, et al. Predictive and associative models to identify hospitalized medical patients at risk for VTE (IMPROVE). Chest. 2011;140(3):706-14."
      ]
    },
    {
      id: "dash",
      name: "Puntuación DASH para la recurrencia del TEV",
      shortName: "DASH",
      description: "Predice la probabilidad de recurrencia tras un primer episodio de TEV no provocado, para orientar la duración de la anticoagulación.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "dimero", type: "boolean", label: "Dímero D anormal tras suspender la anticoagulación (D)", points: 2 },
        { id: "edad", type: "boolean", label: "Edad < 50 años (A)" },
        { id: "varon", type: "boolean", label: "Sexo masculino (S)" },
        { id: "hormonal", type: "boolean", label: "TEV asociado a tratamiento hormonal (H)", description: "En mujeres.", points: -2 }
      ],
      compute: (v) => {
        const score = sum(v, ["dimero", "edad", "varon", "hormonal"]);
        const anual = score <= 1 ? "≈ 3,1 %" : score === 2 ? "≈ 6,4 %" : "≈ 12,3 %";
        return {
          main: String(score),
          mainUnit: "puntos (−2 a 4)",
          secondary: anual,
          secondaryLabel: "recurrencia anual",
          interpretation: score <= 1 ? "Riesgo de recurrencia bajo: puede plantearse suspender la anticoagulación tras 3–6 meses, individualizando." : "Riesgo de recurrencia no bajo: valorar anticoagulación prolongada si el riesgo hemorrágico lo permite.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      references: [
        "Tosetto A, et al. Predicting disease recurrence in patients with previous unprovoked venous thromboembolism: the DASH prediction score. J Thromb Haemost. 2012;10(6):1019-25."
      ]
    },
    {
      id: "riete",
      name: "Puntuación RIETE de riesgo hemorrágico en el TEV",
      shortName: "RIETE",
      description: "Estima el riesgo de hemorragia mayor durante los primeros 3 meses de anticoagulación por tromboembolismo venoso.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "sangrado", type: "boolean", label: "Hemorragia mayor reciente (último mes)", points: 2 },
        { id: "creatinina", type: "boolean", label: "Creatinina > 1,2 mg/dL", points: 1.5 },
        { id: "anemia", type: "boolean", label: "Anemia", description: "Hb < 13 g/dL en varones o < 12 g/dL en mujeres.", points: 1.5 },
        { id: "cancer", type: "boolean", label: "Neoplasia" },
        { id: "ep", type: "boolean", label: "Presentación como EP sintomática (frente a TVP aislada)" },
        { id: "edad", type: "boolean", label: "Edad > 75 años" }
      ],
      compute: (v) => {
        const score = sum(v, ["sangrado", "creatinina", "anemia", "cancer", "ep", "edad"]);
        const banda = score === 0 ? "bajo (≈ 0,1 %)" : score <= 4 ? "intermedio (≈ 2,8 %)" : "alto (≈ 6,2 %)";
        return {
          main: fmt(score, 1),
          mainUnit: "puntos (0–8)",
          interpretation: `Riesgo ${banda} de hemorragia mayor en los primeros 3 meses de anticoagulación. En riesgo alto: extremar la vigilancia y corregir factores modificables.`,
          level: score === 0 ? "ok" : score <= 4 ? "warn" : "danger"
        };
      },
      references: [
        "Ruíz-Giménez N, et al. Predictive variables for major bleeding events in patients presenting with documented acute venous thromboembolism (RIETE). Thromb Haemost. 2008;100(1):26-31."
      ]
    },
    {
      id: "dimero-edad",
      name: "Dímero D ajustado por edad",
      shortName: "Dímero D por edad",
      description: "Ajusta el umbral del dímero D en mayores de 50 años para descartar el tromboembolismo venoso con menos falsos positivos.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 18, max: 110 },
        { id: "dimero", type: "number", label: "Dímero D medido", unit: "µg/L FEU", min: 0, max: 1e5 }
      ],
      compute: (v) => {
        const umbral = v.edad > 50 ? v.edad * 10 : 500;
        const negativo = v.dimero < umbral;
        return {
          main: `${fmt(umbral, 0)} µg/L`,
          mainUnit: "umbral ajustado",
          secondary: negativo ? "Negativo" : "Positivo",
          secondaryLabel: "resultado frente al umbral",
          interpretation: negativo ? "Dímero D por debajo del umbral ajustado por edad: en pacientes con probabilidad clínica no alta, el TEV queda razonablemente excluido." : "Dímero D por encima del umbral ajustado: continuar el algoritmo diagnóstico con imagen.",
          level: negativo ? "ok" : "warn",
          details: ["Umbral = edad × 10 µg/L FEU en mayores de 50 años; 500 µg/L en ≤ 50 años."]
        };
      },
      notes: [
        "Verifica las unidades de tu laboratorio: la regla está validada para unidades FEU (equivalentes de fibrinógeno); con unidades DDU el umbral convencional es 250 µg/L y el ajuste sería edad × 5.",
        "No aplicar con probabilidad clínica alta."
      ],
      references: [
        "Righini M, et al. Age-adjusted D-dimer cutoff levels to rule out pulmonary embolism: the ADJUST-PE study. JAMA. 2014;311(11):1117-24."
      ]
    },
    {
      id: "villalta",
      name: "Escala de Villalta para el síndrome postrombótico",
      shortName: "Villalta",
      description: "Diagnostica y clasifica la gravedad del síndrome postrombótico tras una TVP de miembros inferiores.",
      category: CAT12,
      specialty: CARD3,
      inputs: [
        ...[
          ["dolorS", "Síntoma: dolor"],
          ["calambres", "Síntoma: calambres"],
          ["pesadez", "Síntoma: pesadez"],
          ["parestesias", "Síntoma: parestesias"],
          ["prurito", "Síntoma: prurito"],
          ["edema", "Signo: edema pretibial"],
          ["induracion", "Signo: induración cutánea"],
          ["hiperpigmentacion", "Signo: hiperpigmentación"],
          ["enrojecimiento", "Signo: enrojecimiento"],
          ["ectasia", "Signo: ectasia venosa"],
          ["dolorPantorrilla", "Signo: dolor a la compresión de la pantorrilla"]
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
        { id: "ulcera", type: "boolean", label: "Úlcera venosa presente", noPoints: true }
      ],
      compute: (v) => {
        const score = sum(v, ["dolorS", "calambres", "pesadez", "parestesias", "prurito", "edema", "induracion", "hiperpigmentacion", "enrojecimiento", "ectasia", "dolorPantorrilla"]);
        const ulcera = v.ulcera === 1;
        const banda = ulcera || score >= 15 ? "grave" : score >= 10 ? "moderado" : score >= 5 ? "leve" : "sin SPT";
        return {
          main: String(score),
          mainUnit: "puntos (0–33)",
          interpretation: banda === "sin SPT" ? "Puntuación < 5 sin úlcera: no hay síndrome postrombótico." : `Síndrome postrombótico ${banda}${ulcera ? " (la úlcera venosa clasifica automáticamente como grave)" : ""}. Optimizar la compresión y el seguimiento vascular.`,
          level: banda === "sin SPT" ? "ok" : banda === "leve" ? "info" : banda === "moderado" ? "warn" : "danger"
        };
      },
      notes: ["5–9: leve · 10–14: moderado · ≥ 15 o úlcera venosa: grave. Evaluar preferiblemente tras ≥ 3–6 meses de la TVP aguda."],
      references: [
        "Villalta S, et al. Assessment of validity and reproducibility of a clinical scale for the post-thrombotic syndrome. Haemostasis. 1994;24(Suppl 1):158a.",
        "Kahn SR. Measurement properties of the Villalta scale to define and classify the severity of the post-thrombotic syndrome. J Thromb Haemost. 2009;7(5):884-8."
      ]
    }
  ];

  // inurse-main/src/calculators/cardio-ic-sincope.ts
  var CAT_IC = "Insuficiencia cardíaca";
  var CAT_SINCOPE = "Síncope";
  var CARD4 = ["Cardiología"];
  var cardioICSincope = [
    {
      id: "nyha",
      name: "Clasificación funcional NYHA de la insuficiencia cardíaca",
      shortName: "NYHA",
      description: "Clasifica la gravedad de la insuficiencia cardíaca según la limitación funcional.",
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
            { label: "I — Sin limitación: la actividad física ordinaria no causa síntomas", value: 1 },
            { label: "II — Limitación ligera: cómodo en reposo; la actividad ordinaria causa disnea, fatiga o palpitaciones", value: 2 },
            { label: "III — Limitación marcada: cómodo en reposo; actividades menores causan síntomas", value: 3 },
            { label: "IV — Síntomas en reposo o con cualquier actividad", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const c = (_a = v.clase) != null ? _a : 1;
        return {
          main: `NYHA ${["", "I", "II", "III", "IV"][c]}`,
          interpretation: c === 1 ? "Sin limitación funcional. Optimizar el tratamiento de base y los factores de riesgo." : c === 2 ? "Limitación ligera. Revisar y titular el tratamiento recomendado por las guías." : c === 3 ? "Limitación marcada. Optimización intensiva del tratamiento; valorar dispositivos según FEVI y criterios de las guías." : "Síntomas en reposo. Valorar terapias avanzadas (unidad de IC, dispositivos, trasplante) y cuidados paliativos si procede.",
          level: c === 1 ? "ok" : c === 2 ? "info" : c === 3 ? "warn" : "danger"
        };
      },
      references: [
        "The Criteria Committee of the New York Heart Association. Nomenclature and Criteria for Diagnosis of Diseases of the Heart and Great Vessels. 9.ª ed. 1994."
      ]
    },
    {
      id: "acc-aha-ic",
      name: "Estadios ACC/AHA de la insuficiencia cardíaca",
      shortName: "Estadios ACC/AHA",
      description: "Describe las etapas evolutivas de la insuficiencia cardíaca, desde el riesgo hasta la enfermedad avanzada.",
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
            { label: "A — En riesgo: HTA, diabetes, obesidad, cardiotóxicos…, sin cardiopatía estructural ni síntomas", value: 1 },
            { label: "B — Pre-insuficiencia cardíaca: cardiopatía estructural, biomarcadores elevados o FEVI reducida, sin síntomas", value: 2 },
            { label: "C — Insuficiencia cardíaca sintomática (actual o previa)", value: 3 },
            { label: "D — Insuficiencia cardíaca avanzada: síntomas que interfieren con la vida diaria y hospitalizaciones recurrentes pese a tratamiento óptimo", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const e = (_a = v.estadio) != null ? _a : 1;
        return {
          main: `Estadio ${["", "A", "B", "C", "D"][e]}`,
          interpretation: [
            "",
            "Prevención: control de los factores de riesgo (HTA, diabetes, lípidos), estilos de vida; considerar iSGLT2 en diabetes con riesgo cardiovascular.",
            "Prevenir la progresión: IECA/ARA-II y betabloqueantes si FEVI reducida o IAM previo; tratar la cardiopatía de base.",
            "Tratamiento según fenotipo y FEVI (cuádruple terapia en FEVI reducida), manejo de la congestión y de las comorbilidades.",
            "Terapias avanzadas: unidad especializada, soporte circulatorio mecánico, trasplante, o cuidados paliativos según objetivos del paciente."
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
      name: "Criterios de Framingham para el diagnóstico de insuficiencia cardíaca",
      shortName: "Framingham IC",
      description: "Diagnostica la insuficiencia cardíaca congestiva mediante criterios clínicos mayores y menores.",
      category: CAT_IC,
      specialty: CARD4,
      inputs: [
        { id: "dpn", type: "boolean", label: "Mayor: disnea paroxística nocturna", noPoints: true },
        { id: "yugular", type: "boolean", label: "Mayor: ingurgitación yugular", noPoints: true },
        { id: "crepitantes", type: "boolean", label: "Mayor: crepitantes pulmonares", noPoints: true },
        { id: "cardiomegalia", type: "boolean", label: "Mayor: cardiomegalia radiológica", noPoints: true },
        { id: "eap", type: "boolean", label: "Mayor: edema agudo de pulmón", noPoints: true },
        { id: "s3", type: "boolean", label: "Mayor: galope por tercer ruido (S3)", noPoints: true },
        { id: "pvc", type: "boolean", label: "Mayor: presión venosa central > 16 cmH₂O", noPoints: true },
        { id: "reflujo", type: "boolean", label: "Mayor: reflujo hepatoyugular", noPoints: true },
        { id: "perdidaPeso", type: "boolean", label: "Mayor: pérdida de > 4,5 kg en 5 días con el tratamiento", noPoints: true },
        { id: "edemas", type: "boolean", label: "Menor: edemas bilaterales de tobillos", noPoints: true },
        { id: "tos", type: "boolean", label: "Menor: tos nocturna", noPoints: true },
        { id: "disnea", type: "boolean", label: "Menor: disnea de esfuerzo", noPoints: true },
        { id: "hepatomegalia", type: "boolean", label: "Menor: hepatomegalia", noPoints: true },
        { id: "derrame", type: "boolean", label: "Menor: derrame pleural", noPoints: true },
        { id: "taquicardia", type: "boolean", label: "Menor: frecuencia cardíaca > 120 lpm", noPoints: true }
      ],
      compute: (v) => {
        const mayores = sum(v, ["dpn", "yugular", "crepitantes", "cardiomegalia", "eap", "s3", "pvc", "reflujo", "perdidaPeso"]);
        const menores = sum(v, ["edemas", "tos", "disnea", "hepatomegalia", "derrame", "taquicardia"]);
        const positivo = mayores >= 2 || mayores >= 1 && menores >= 2;
        return {
          main: `${mayores} mayores · ${menores} menores`,
          interpretation: positivo ? "Criterios de Framingham cumplidos (≥ 2 mayores, o 1 mayor + 2 menores): diagnóstico clínico de insuficiencia cardíaca. Confirmar con ecocardiograma y péptidos natriuréticos." : "Criterios no cumplidos: el diagnóstico clínico de insuficiencia cardíaca es poco probable por estos criterios; valorar otras causas y completar estudio si la sospecha persiste.",
          level: positivo ? "danger" : "ok"
        };
      },
      notes: ["Los criterios menores solo puntúan si no se explican por otra enfermedad."],
      references: [
        "McKee PA, et al. The natural history of congestive heart failure: the Framingham study. N Engl J Med. 1971;285(26):1441-6."
      ]
    },
    {
      id: "h2fpef",
      name: "Puntuación H₂FPEF para IC con fracción de eyección preservada",
      shortName: "H₂FPEF",
      description: "Estima la probabilidad de que la disnea de un paciente con FEVI conservada se deba a insuficiencia cardíaca con FE preservada.",
      category: CAT_IC,
      specialty: CARD4,
      inputs: [
        { id: "obesidad", type: "boolean", label: "Obesidad (IMC > 30 kg/m²) — H (Heavy)", points: 2 },
        { id: "hta", type: "boolean", label: "Tratamiento con ≥ 2 antihipertensivos — H (Hypertensive)" },
        { id: "fa", type: "boolean", label: "Fibrilación auricular (paroxística o persistente) — F", points: 3 },
        { id: "hp", type: "boolean", label: "Hipertensión pulmonar (PSAP > 35 mmHg en eco) — P" },
        { id: "edad", type: "boolean", label: "Edad > 60 años — E (Elder)" },
        { id: "ee", type: "boolean", label: "Presiones de llenado elevadas (E/e′ > 9) — F (Filling)" }
      ],
      compute: (v) => {
        const score = sum(v, ["obesidad", "hta", "fa", "hp", "edad", "ee"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–9)",
          interpretation: score <= 1 ? "Probabilidad baja de ICFEp: buscar causas alternativas de la disnea." : score <= 5 ? "Probabilidad intermedia: se recomienda estudio adicional (péptidos natriuréticos, eco de esfuerzo o cateterismo con ejercicio)." : "Probabilidad alta de insuficiencia cardíaca con FE preservada: tratar y completar el estudio etiológico.",
          level: score <= 1 ? "ok" : score <= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Reddy YNV, et al. A simple, evidence-based approach to help guide diagnosis of heart failure with preserved ejection fraction (H2FPEF). Circulation. 2018;138(9):861-70."
      ]
    },
    {
      id: "ccs-angina",
      name: "Clasificación de la angina de la Sociedad Cardiovascular Canadiense (CCS)",
      shortName: "CCS",
      description: "Gradúa la gravedad de la angina de esfuerzo.",
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
            { label: "I — Solo con esfuerzos extenuantes, rápidos o prolongados; no con la actividad ordinaria", value: 1 },
            { label: "II — Limitación ligera: al caminar deprisa, subir cuestas, tras las comidas, con frío o estrés", value: 2 },
            { label: "III — Limitación marcada: al caminar 1–2 manzanas en llano o subir un piso a paso normal", value: 3 },
            { label: "IV — Incapacidad para cualquier actividad sin angina; puede aparecer en reposo", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const g = (_a = v.grado) != null ? _a : 1;
        return {
          main: `CCS ${["", "I", "II", "III", "IV"][g]}`,
          interpretation: g <= 2 ? "Angina estable con limitación ausente o ligera: optimizar tratamiento antianginoso y control de factores de riesgo." : "Angina limitante (CCS III–IV): intensificar tratamiento y valorar coronariografía/revascularización según las guías.",
          level: g === 1 ? "ok" : g === 2 ? "info" : g === 3 ? "warn" : "danger"
        };
      },
      references: [
        "Campeau L. Grading of angina pectoris. Circulation. 1976;54(3):522-3."
      ]
    },
    {
      id: "sfsr",
      name: "Regla de síncope de San Francisco",
      shortName: "San Francisco",
      description: "Predice el riesgo de eventos graves a 7 días en pacientes con síncope o presíncope (regla CHESS).",
      category: CAT_SINCOPE,
      specialty: CARD4,
      inputs: [
        { id: "icc", type: "boolean", label: "Antecedente de insuficiencia cardíaca congestiva (C)" },
        { id: "hto", type: "boolean", label: "Hematocrito < 30 % (H)" },
        { id: "ecg", type: "boolean", label: "ECG anormal (E)", description: "Cualquier cambio nuevo o ritmo no sinusal." },
        { id: "disnea", type: "boolean", label: "Disnea referida (S — Shortness of breath)" },
        { id: "pas", type: "boolean", label: "PA sistólica < 90 mmHg en el triaje (S)" }
      ],
      compute: (v) => {
        const score = sum(v, ["icc", "hto", "ecg", "disnea", "pas"]);
        return {
          main: String(score),
          mainUnit: score === 1 ? "criterio" : "criterios",
          interpretation: score === 0 ? "Regla negativa: riesgo bajo de evento grave a 7 días (sensibilidad ≈ 96 % en la derivación; menor en validaciones externas — integrar con el juicio clínico)." : "Regla positiva: riesgo aumentado de evento grave (muerte, arritmia, IAM, embolia pulmonar, hemorragia…); se recomienda observación/ingreso y estudio.",
          level: score === 0 ? "ok" : "danger"
        };
      },
      references: [
        "Quinn JV, et al. Derivation of the San Francisco Syncope Rule to predict patients with short-term serious outcomes. Ann Emerg Med. 2004;43(2):224-32."
      ]
    },
    {
      id: "egsys",
      name: "Puntuación EGSYS para el síncope de origen cardíaco",
      shortName: "EGSYS",
      description: "Estima la probabilidad de que un síncope sea de causa cardíaca.",
      category: CAT_SINCOPE,
      specialty: CARD4,
      inputs: [
        { id: "palpitaciones", type: "boolean", label: "Palpitaciones antes del síncope", points: 4 },
        { id: "cardiopatia", type: "boolean", label: "Cardiopatía conocida o ECG anormal", points: 3 },
        { id: "esfuerzo", type: "boolean", label: "Síncope durante el esfuerzo", points: 3 },
        { id: "supino", type: "boolean", label: "Síncope en decúbito supino", points: 2 },
        { id: "prodromos", type: "boolean", label: "Pródromos autonómicos", description: "Náuseas o vómitos previos.", points: -1 },
        {
          id: "precipitantes",
          type: "boolean",
          label: "Factores predisponentes o precipitantes",
          description: "Lugar caluroso o concurrido, ortostatismo prolongado, miedo, dolor o emoción intensa.",
          points: -1
        }
      ],
      compute: (v) => {
        const score = sum(v, ["palpitaciones", "cardiopatia", "esfuerzo", "supino", "prodromos", "precipitantes"]);
        return {
          main: String(score),
          mainUnit: "puntos (−2 a 12)",
          interpretation: score >= 3 ? "EGSYS ≥ 3: síncope probablemente cardíaco (sensibilidad ≈ 95 %); ingreso o estudio cardiológico preferente. La mortalidad a 2 años es mayor en este grupo." : "EGSYS < 3: origen cardíaco poco probable; valorar causas reflejas/ortostáticas y completar la evaluación básica.",
          level: score >= 3 ? "danger" : "ok"
        };
      },
      references: [
        "Del Rosso A, et al. Clinical predictors of cardiac syncope at initial evaluation in patients referred urgently to a general hospital: the EGSYS score. Heart. 2008;94(12):1620-6."
      ]
    },
    {
      id: "oesil",
      name: "Puntuación OESIL para el síncope",
      shortName: "OESIL",
      description: "Estima la mortalidad a 12 meses tras un episodio de síncope.",
      category: CAT_SINCOPE,
      specialty: CARD4,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad > 65 años" },
        { id: "cardiovascular", type: "boolean", label: "Enfermedad cardiovascular previa" },
        { id: "prodromos", type: "boolean", label: "Síncope sin pródromos" },
        { id: "ecg", type: "boolean", label: "ECG anormal" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "cardiovascular", "prodromos", "ecg"]);
        const mort = ["0 %", "0,6 %", "14 %", "29 %", "53 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–4)",
          secondary: mort,
          secondaryLabel: "mortalidad a 12 meses (cohorte original)",
          interpretation: score <= 1 ? "Riesgo bajo: puede completarse el estudio de forma ambulatoria en la mayoría de los casos." : "Riesgo elevado (≥ 2): se recomienda ingreso u observación con estudio cardiológico.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      references: [
        "Colivicchi F, et al. Development and prospective validation of a risk stratification system for patients with syncope in the emergency department: the OESIL risk score. Eur Heart J. 2003;24(9):811-9."
      ]
    },
    {
      id: "sincope-canadiense",
      name: "Puntuación canadiense de riesgo en el síncope (CSRS)",
      shortName: "Síncope canadiense",
      description: "Predice eventos adversos graves a 30 días en pacientes evaluados en urgencias por síncope.",
      category: CAT_SINCOPE,
      specialty: CARD4,
      inputs: [
        { id: "vasovagal", type: "boolean", label: "Predisposición vasovagal", description: "Desencadenado por ortostatismo prolongado, lugar caluroso, emoción, miedo o dolor.", points: -1 },
        { id: "cardiopatia", type: "boolean", label: "Antecedente de cardiopatía", description: "EAC, FA/flutter, IC, valvulopatía." },
        { id: "pas", type: "boolean", label: "PA sistólica < 90 o > 180 mmHg en algún momento en urgencias", points: 2 },
        { id: "troponina", type: "boolean", label: "Troponina elevada (> percentil 99)", points: 2 },
        { id: "eje", type: "boolean", label: "Eje QRS anormal", description: "< −30° o > 100°." },
        { id: "qrs", type: "boolean", label: "Duración del QRS > 130 ms" },
        { id: "qtc", type: "boolean", label: "QTc > 480 ms", points: 2 },
        { id: "dxVasovagal", type: "boolean", label: "Diagnóstico en urgencias: síncope vasovagal", points: -2 },
        { id: "dxCardiaco", type: "boolean", label: "Diagnóstico en urgencias: síncope cardíaco", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["vasovagal", "cardiopatia", "pas", "troponina", "eje", "qrs", "qtc", "dxVasovagal", "dxCardiaco"]);
        const banda = score <= -2 ? "muy bajo (≈ 0,4 %)" : score <= 0 ? "bajo (≈ 1–2 %)" : score <= 3 ? "intermedio (≈ 3–8 %)" : score <= 5 ? "alto (≈ 13–20 %)" : "muy alto (> 25 %)";
        return {
          main: String(score),
          mainUnit: "puntos (−3 a 11)",
          interpretation: `Riesgo ${banda} de evento grave a 30 días (arritmia, IAM, muerte, hemorragia grave…). En riesgo intermedio o superior, valorar observación con monitorización y estudio dirigido.`,
          level: score <= 0 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Thiruganasambandamoorthy V, et al. Development of the Canadian Syncope Risk Score to predict serious adverse events after emergency department assessment of syncope. CMAJ. 2016;188(12):E289-E298."
      ]
    }
  ];

  // inurse-main/src/calculators/cardio-varios.ts
  var CAT_DX = "Criterios diagnósticos";
  var CAT_GRAV = "Gravedad y pronóstico";
  var CARD5 = ["Cardiología"];
  var cardioVarios = [
    {
      id: "duke-endocarditis",
      name: "Criterios de Duke modificados para la endocarditis infecciosa",
      shortName: "Duke",
      description: "Criterios diagnósticos de endocarditis infecciosa (versión modificada de Li).",
      category: CAT_DX,
      specialty: CARD5,
      inputs: [
        {
          id: "hemocultivos",
          type: "boolean",
          label: "Mayor: hemocultivos positivos típicos",
          description: "Microorganismos típicos en 2 hemocultivos separados, hemocultivos persistentemente positivos o Coxiella burnetii (título IgG > 1:800).",
          noPoints: true
        },
        {
          id: "imagen",
          type: "boolean",
          label: "Mayor: evidencia de afectación endocárdica",
          description: "Vegetación, absceso, dehiscencia de prótesis o nueva insuficiencia valvular.",
          noPoints: true
        },
        { id: "predisposicion", type: "boolean", label: "Menor: cardiopatía predisponente o uso de drogas por vía parenteral", noPoints: true },
        { id: "fiebre", type: "boolean", label: "Menor: fiebre > 38 °C", noPoints: true },
        {
          id: "vascular",
          type: "boolean",
          label: "Menor: fenómenos vasculares",
          description: "Embolias arteriales, infartos pulmonares sépticos, aneurisma micótico, hemorragia intracraneal o conjuntival, lesiones de Janeway.",
          noPoints: true
        },
        {
          id: "inmunologico",
          type: "boolean",
          label: "Menor: fenómenos inmunológicos",
          description: "Glomerulonefritis, nódulos de Osler, manchas de Roth o factor reumatoide.",
          noPoints: true
        },
        { id: "microbiologico", type: "boolean", label: "Menor: evidencia microbiológica que no cumple criterio mayor", noPoints: true }
      ],
      compute: (v) => {
        const mayores = sum(v, ["hemocultivos", "imagen"]);
        const menores = sum(v, ["predisposicion", "fiebre", "vascular", "inmunologico", "microbiologico"]);
        const definida = mayores === 2 || mayores === 1 && menores >= 3 || menores >= 5;
        const posible = !definida && (mayores === 1 && menores >= 1 || menores >= 3);
        return {
          main: definida ? "Endocarditis definida" : posible ? "Endocarditis posible" : "Criterios no cumplidos",
          secondary: `${mayores} mayores · ${menores} menores`,
          interpretation: definida ? "Criterios clínicos de endocarditis definida (2 mayores, o 1 mayor + 3 menores, o 5 menores). Iniciar tratamiento y valoración por el equipo de endocarditis." : posible ? "Endocarditis posible (1 mayor + 1 menor, o 3 menores): mantener alta sospecha, repetir hemocultivos e imagen (ecocardiograma transesofágico, PET-TC si procede)." : "No se cumplen criterios: considerar diagnósticos alternativos, sin olvidar que un tratamiento antibiótico previo puede negativizar los hemocultivos.",
          level: definida ? "danger" : posible ? "warn" : "ok"
        };
      },
      notes: [
        "El diagnóstico también es definido con criterios patológicos (microorganismos o lesiones en la anatomía patológica de la vegetación o del absceso).",
        "La lista de MDCalc incluye además los criterios ISCVID 2023, pendientes de incorporar."
      ],
      references: [
        "Li JS, et al. Proposed modifications to the Duke criteria for the diagnosis of infective endocarditis. Clin Infect Dis. 2000;30(4):633-8."
      ]
    },
    {
      id: "isth-cid",
      name: "Criterios de la ISTH para la coagulación intravascular diseminada",
      shortName: "CID (ISTH)",
      description: "Diagnostica la coagulación intravascular diseminada manifiesta.",
      category: CAT_DX,
      specialty: CARD5,
      inputs: [
        {
          id: "plaquetas",
          type: "select",
          label: "Plaquetas (×10³/µL)",
          options: [
            { label: "≥ 100", value: 0 },
            { label: "50–99", value: 1 },
            { label: "< 50", value: 2 }
          ]
        },
        {
          id: "dimero",
          type: "select",
          label: "Marcadores de fibrina (dímero D, PDF)",
          options: [
            { label: "Sin elevación", value: 0 },
            { label: "Elevación moderada", value: 2 },
            { label: "Elevación intensa", value: 3 }
          ]
        },
        {
          id: "tp",
          type: "select",
          label: "Prolongación del tiempo de protrombina",
          options: [
            { label: "< 3 s", value: 0 },
            { label: "3–6 s", value: 1 },
            { label: "> 6 s", value: 2 }
          ]
        },
        {
          id: "fibrinogeno",
          type: "select",
          label: "Fibrinógeno",
          options: [
            { label: "≥ 100 mg/dL", value: 0 },
            { label: "< 100 mg/dL", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["plaquetas", "dimero", "tp", "fibrinogeno"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–8)",
          interpretation: score >= 5 ? "Compatible con CID manifiesta (≥ 5 puntos): repetir a diario, tratar la causa subyacente y dar soporte hemostático según sangrado." : "No sugiere CID manifiesta (< 5 puntos): si la sospecha clínica persiste, repetir en 1–2 días.",
          level: score >= 5 ? "danger" : "ok"
        };
      },
      notes: ["El algoritmo solo debe aplicarse en pacientes con una enfermedad de base conocida asociada a CID (sepsis, trauma, neoplasia, complicaciones obstétricas…)."],
      references: [
        "Taylor FB Jr, et al. Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation. Thromb Haemost. 2001;86(5):1327-30."
      ]
    },
    {
      id: "jones",
      name: "Criterios de Jones para la fiebre reumática aguda",
      shortName: "Jones",
      description: "Diagnostica la fiebre reumática aguda (revisión de 2015 de la AHA).",
      category: CAT_DX,
      specialty: CARD5,
      inputs: [
        {
          id: "poblacion",
          type: "select",
          label: "Población",
          noPoints: true,
          options: [
            { label: "Riesgo bajo", value: 0 },
            { label: "Riesgo moderado-alto", value: 1 }
          ]
        },
        {
          id: "estreptococo",
          type: "boolean",
          label: "Evidencia de infección estreptocócica previa",
          description: "Cultivo, test rápido o ascenso de antiestreptolisina O.",
          noPoints: true
        },
        { id: "carditis", type: "boolean", label: "Mayor: carditis (clínica o subclínica por eco)", noPoints: true },
        { id: "artritis", type: "boolean", label: "Mayor: artritis", description: "Poliartritis en riesgo bajo; también monoartritis o poliartralgia en riesgo moderado-alto.", noPoints: true },
        { id: "corea", type: "boolean", label: "Mayor: corea de Sydenham", noPoints: true },
        { id: "eritema", type: "boolean", label: "Mayor: eritema marginado", noPoints: true },
        { id: "nodulos", type: "boolean", label: "Mayor: nódulos subcutáneos", noPoints: true },
        { id: "fiebre", type: "boolean", label: "Menor: fiebre (≥ 38,5 °C en riesgo bajo; ≥ 38 °C en riesgo moderado-alto)", noPoints: true },
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
          main: conEstrepto ? "Fiebre reumática probable" : cumple ? "Criterios clínicos cumplidos" : "Criterios no cumplidos",
          secondary: `${mayores} mayores · ${menores} menores`,
          interpretation: conEstrepto ? "Se cumplen los criterios (2 mayores o 1 mayor + 2 menores) junto con evidencia de infección estreptocócica previa: diagnóstico de fiebre reumática aguda. Iniciar tratamiento y profilaxis secundaria." : cumple ? "Se cumplen los criterios clínicos, pero falta evidencia de infección estreptocócica previa: necesaria para el diagnóstico (salvo corea o carditis indolente)." : "No se cumplen los criterios de Jones en este momento.",
          level: conEstrepto ? "danger" : cumple ? "warn" : "ok"
        };
      },
      notes: ["La corea de Sydenham y la carditis indolente pueden diagnosticar por sí solas, sin evidencia de infección estreptocócica previa."],
      references: [
        "Gewitz MH, et al. Revision of the Jones Criteria for the diagnosis of acute rheumatic fever in the era of Doppler echocardiography. Circulation. 2015;131(20):1806-18."
      ]
    },
    {
      id: "kawasaki",
      name: "Criterios diagnósticos de la enfermedad de Kawasaki",
      shortName: "Kawasaki",
      description: "Diagnostica la enfermedad de Kawasaki clásica e identifica formas incompletas.",
      category: CAT_DX,
      specialty: CARD5,
      inputs: [
        { id: "fiebre", type: "boolean", label: "Fiebre ≥ 5 días", noPoints: true },
        { id: "conjuntivitis", type: "boolean", label: "Conjuntivitis bilateral no exudativa", noPoints: true },
        { id: "oral", type: "boolean", label: "Cambios orofaríngeos", description: "Labios agrietados, lengua aframbuesada o eritema faríngeo.", noPoints: true },
        { id: "extremidades", type: "boolean", label: "Cambios en las extremidades", description: "Eritema o edema de palmas y plantas; descamación periungueal en la fase subaguda.", noPoints: true },
        { id: "exantema", type: "boolean", label: "Exantema polimorfo", noPoints: true },
        { id: "adenopatia", type: "boolean", label: "Adenopatía cervical ≥ 1,5 cm (habitualmente unilateral)", noPoints: true }
      ],
      compute: (v) => {
        const criterios = sum(v, ["conjuntivitis", "oral", "extremidades", "exantema", "adenopatia"]);
        const fiebre = v.fiebre === 1;
        const clasica = fiebre && criterios >= 4;
        const incompleta = fiebre && criterios >= 2 && criterios < 4;
        return {
          main: clasica ? "Kawasaki clásica" : incompleta ? "Posible Kawasaki incompleta" : "Criterios no cumplidos",
          secondary: `${criterios}/5`,
          secondaryLabel: "criterios clínicos principales",
          interpretation: clasica ? "Fiebre ≥ 5 días con ≥ 4 criterios principales: enfermedad de Kawasaki clásica. Tratamiento con inmunoglobulina intravenosa y AAS, y ecocardiograma precoz." : incompleta ? "Fiebre ≥ 5 días con 2–3 criterios: valorar Kawasaki incompleta con analítica (PCR, VSG, anemia, plaquetas, transaminasas, albúmina, piuria estéril) y ecocardiograma." : "No se cumplen los criterios; reevaluar si la fiebre persiste y descartar otras causas.",
          level: clasica ? "danger" : incompleta ? "warn" : "ok"
        };
      },
      notes: ["Con ≥ 4 criterios principales (especialmente con afectación de extremidades) puede diagnosticarse al 4.º día de fiebre."],
      references: [
        "McCrindle BW, et al. Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease. Circulation. 2017;135(17):e927-e999."
      ]
    },
    {
      id: "rope",
      name: "Puntuación RoPE de embolia paradójica",
      shortName: "RoPE",
      description: "Estima la probabilidad de que un foramen oval permeable sea la causa del ictus criptogénico.",
      category: CAT_GRAV,
      specialty: CARD5,
      inputs: [
        { id: "noHta", type: "boolean", label: "Sin antecedente de hipertensión arterial" },
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
            { label: "18–29 años", value: 5 },
            { label: "30–39 años", value: 4 },
            { label: "40–49 años", value: 3 },
            { label: "50–59 años", value: 2 },
            { label: "60–69 años", value: 1 },
            { label: "≥ 70 años", value: 0 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["noHta", "noDm", "noIctus", "noFumador", "cortical", "edad"]);
        const atribuible = score <= 3 ? "≈ 0 %" : score === 4 ? "38 %" : score === 5 ? "34 %" : score === 6 ? "62 %" : score === 7 ? "72 %" : score === 8 ? "84 %" : "88 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          secondary: atribuible,
          secondaryLabel: "fracción atribuible al FOP",
          interpretation: score >= 7 ? "Puntuación alta: es probable que el foramen oval permeable sea causal del ictus; valorar cierre percutáneo junto con las características anatómicas de alto riesgo." : score >= 5 ? "Puntuación intermedia: la relación causal es incierta; decisión individualizada en equipo multidisciplinar." : "Puntuación baja: el FOP probablemente sea un hallazgo incidental; buscar otras causas del ictus.",
          level: score >= 7 ? "info" : score >= 5 ? "warn" : "ok"
        };
      },
      references: [
        "Kent DM, et al. An index to identify stroke-related vs incidental patent foramen ovale in cryptogenic stroke. Neurology. 2013;81(7):619-25."
      ]
    },
    {
      id: "mews",
      name: "Puntuación de alerta temprana modificada (MEWS)",
      shortName: "MEWS",
      description: "Detecta el deterioro clínico del paciente hospitalizado a partir de las constantes vitales.",
      category: CAT_GRAV,
      specialty: CARD5,
      inputs: [
        {
          id: "pas",
          type: "select",
          label: "Presión arterial sistólica (mmHg)",
          dropdown: true,
          options: [
            { label: "≤ 70", value: 3 },
            { label: "71–80", value: 2 },
            { label: "81–100", value: 1 },
            { label: "101–199", value: 0 },
            { label: "≥ 200", value: 2 }
          ],
          default: 0
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia cardíaca (lpm)",
          dropdown: true,
          options: [
            { label: "< 40", value: 2 },
            { label: "41–50", value: 1 },
            { label: "51–100", value: 0 },
            { label: "101–110", value: 1 },
            { label: "111–129", value: 2 },
            { label: "≥ 130", value: 3 }
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
            { label: "9–14", value: 0 },
            { label: "15–20", value: 1 },
            { label: "21–29", value: 2 },
            { label: "≥ 30", value: 3 }
          ],
          default: 0
        },
        {
          id: "temp",
          type: "select",
          label: "Temperatura (°C)",
          dropdown: true,
          options: [
            { label: "< 35", value: 2 },
            { label: "35–38,4", value: 0 },
            { label: "≥ 38,5", value: 2 }
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
          mainUnit: "puntos (0–14)",
          interpretation: score >= 5 ? "MEWS ≥ 5: riesgo elevado de deterioro, ingreso en cuidados intensivos o muerte. Avisar al equipo médico de forma urgente." : score >= 3 ? "MEWS 3–4: aumentar la frecuencia de controles y avisar al equipo responsable." : "MEWS bajo: continuar la monitorización habitual.",
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
      description: "Clasifica la disnea según la limitación que produce en la actividad diaria.",
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
            { label: "0 — Disnea solo con ejercicio intenso", value: 0 },
            { label: "1 — Disnea al andar deprisa en llano o subir una cuesta ligera", value: 1 },
            { label: "2 — Anda más despacio que las personas de su edad, o debe parar al andar a su paso en llano", value: 2 },
            { label: "3 — Para a descansar tras andar unos 100 m o pocos minutos en llano", value: 3 },
            { label: "4 — No puede salir de casa, o presenta disnea al vestirse o desvestirse", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const g = (_a = v.grado) != null ? _a : 0;
        return {
          main: `mMRC ${g}`,
          interpretation: g <= 1 ? "Disnea leve. En EPOC, un mMRC < 2 corresponde a los grupos de menor carga sintomática." : "Disnea significativa (mMRC ≥ 2): mayor carga sintomática; en EPOC indica tratamiento broncodilatador optimizado y rehabilitación respiratoria.",
          level: g <= 1 ? "ok" : g === 2 ? "warn" : "danger"
        };
      },
      references: [
        "Bestall JC, et al. Usefulness of the Medical Research Council (MRC) dyspnoea scale as a measure of disability in patients with chronic obstructive pulmonary disease. Thorax. 1999;54(7):581-6."
      ]
    },
    {
      id: "lace",
      name: "Índice LACE de riesgo de reingreso",
      shortName: "LACE",
      description: "Predice el riesgo de reingreso no programado o muerte a 30 días tras el alta hospitalaria.",
      category: CAT_GRAV,
      specialty: CARD5,
      inputs: [
        {
          id: "estancia",
          type: "select",
          label: "Duración del ingreso (L)",
          dropdown: true,
          options: [
            { label: "< 1 día", value: 1 },
            { label: "1 día", value: 1 },
            { label: "2 días", value: 2 },
            { label: "3 días", value: 3 },
            { label: "4–6 días", value: 4 },
            { label: "7–13 días", value: 5 },
            { label: "≥ 14 días", value: 7 }
          ]
        },
        { id: "agudo", type: "boolean", label: "Ingreso urgente/agudo (A)", points: 3 },
        {
          id: "charlson",
          type: "select",
          label: "Índice de comorbilidad de Charlson (C)",
          dropdown: true,
          options: [
            { label: "0", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "≥ 4", value: 5 }
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
            { label: "≥ 4", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["estancia", "agudo", "charlson", "urgencias"]);
        const banda = score <= 4 ? "bajo" : score <= 9 ? "moderado" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0–19)",
          interpretation: banda === "bajo" ? "Riesgo bajo de reingreso o muerte a 30 días." : banda === "moderado" ? "Riesgo moderado: reforzar la conciliación de la medicación y el seguimiento tras el alta." : "Riesgo alto (≥ 10): planificar el alta con seguimiento precoz, educación al paciente y coordinación con atención primaria.",
          level: banda === "bajo" ? "ok" : banda === "moderado" ? "warn" : "danger"
        };
      },
      references: [
        "van Walraven C, et al. Derivation and validation of an index to predict early death or unplanned readmission after discharge from hospital to the community. CMAJ. 2010;182(6):551-7."
      ]
    }
  ];

  // inurse-main/src/calculators/formulas.ts
  var CAT13 = "Fórmulas y cálculos clínicos";
  var CARD6 = ["Cardiología"];
  var formulas = [
    {
      id: "qtc",
      name: "Intervalo QT corregido (QTc)",
      shortName: "QTc",
      description: "Corrige el intervalo QT según la frecuencia cardíaca (fórmulas de Bazett, Fridericia, Framingham, Hodges y Rautaharju).",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "qt", type: "number", label: "Intervalo QT medido", unit: "ms", min: 100, max: 900 },
        { id: "fc", type: "number", label: "Frecuencia cardíaca", unit: "lpm", min: 20, max: 250 },
        {
          id: "formula",
          type: "select",
          label: "Fórmula de corrección",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Bazett — QT / √RR (la más usada)", value: 0 },
            { label: "Fridericia — QT / RR^(1/3)", value: 1 },
            { label: "Framingham — QT + 154 × (1 − RR)", value: 2 },
            { label: "Hodges — QT + 1,75 × (FC − 60)", value: 3 },
            { label: "Rautaharju — QT × (120 + FC) / 180", value: 4 }
          ]
        },
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Varón", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const rr = 60 / v.fc;
        const qt = v.qt;
        const f = (_a = v.formula) != null ? _a : 0;
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
          interpretation: muyProlongado ? "QTc ≥ 500 ms: riesgo elevado de torsade de pointes. Revisar fármacos que prolongan el QT, corregir potasio y magnesio y monitorizar." : prolongado ? `QTc prolongado para el límite habitual (${limite} ms en ${mujer ? "mujeres" : "varones"}): revisar fármacos y electrolitos.` : "QTc dentro del rango normal.",
          level: muyProlongado ? "danger" : prolongado ? "warn" : "ok",
          details: [
            "Bazett sobrecorrige con taquicardia e infracorrige con bradicardia; con frecuencias extremas se prefieren Fridericia o Framingham."
          ]
        };
      },
      notes: ["Límites habituales de normalidad: ≤ 450 ms en varones y ≤ 460 ms en mujeres; ≥ 500 ms se considera de alto riesgo."]
    },
    {
      id: "tisdale",
      name: "Puntuación de riesgo de Tisdale para la prolongación del QT",
      shortName: "Tisdale",
      description: "Predice el riesgo de prolongación del QTc por encima de 500 ms en pacientes hospitalizados.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad ≥ 68 años" },
        { id: "mujer", type: "boolean", label: "Sexo femenino" },
        { id: "asa", type: "boolean", label: "Tratamiento con diuréticos de asa" },
        { id: "potasio", type: "boolean", label: "Potasio sérico ≤ 3,5 mEq/L" },
        { id: "qtcIngreso", type: "boolean", label: "QTc al ingreso ≥ 450 ms", points: 2 },
        { id: "iamAgudo", type: "boolean", label: "Infarto agudo de miocardio", points: 2 },
        { id: "unQt", type: "boolean", label: "Un fármaco que prolonga el QT", points: 3 },
        { id: "dosQt", type: "boolean", label: "≥ 2 fármacos que prolongan el QT", points: 3 },
        { id: "sepsis", type: "boolean", label: "Sepsis", points: 3 },
        { id: "icc", type: "boolean", label: "Insuficiencia cardíaca", points: 3 }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "mujer", "asa", "potasio", "qtcIngreso", "iamAgudo", "unQt", "dosQt", "sepsis", "icc"]);
        const banda = score <= 6 ? "bajo" : score <= 10 ? "moderado" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0–21)",
          interpretation: banda === "bajo" ? "Riesgo bajo de prolongación del QTc > 500 ms (≈ 15 %)." : banda === "moderado" ? "Riesgo moderado (≈ 37 %): monitorización electrocardiográfica y control de electrolitos." : "Riesgo alto (≈ 73 %): evitar en lo posible fármacos que prolonguen el QT, monitorización continua y corrección de potasio y magnesio.",
          level: banda === "bajo" ? "ok" : banda === "moderado" ? "warn" : "danger"
        };
      },
      notes: ["Si se toman ≥ 2 fármacos que prolongan el QT, deben marcarse ambas casillas (3 + 3 puntos)."],
      references: [
        "Tisdale JE, et al. Development and validation of a risk score to predict QT interval prolongation in hospitalized patients. Circ Cardiovasc Qual Outcomes. 2013;6(4):479-87."
      ]
    },
    {
      id: "cockcroft-gault",
      name: "Aclaramiento de creatinina (Cockcroft-Gault)",
      shortName: "Cockcroft-Gault",
      description: "Estima el aclaramiento de creatinina para el ajuste de dosis de fármacos.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Varón", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 18, max: 110 },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 20, max: 300 },
        { id: "creatinina", type: "number", label: "Creatinina sérica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 }
      ],
      compute: (v) => {
        const crcl = (140 - v.edad) * v.peso / (72 * v.creatinina) * (v.sexo === 1 ? 0.85 : 1);
        return {
          main: fmt(crcl, 1),
          mainUnit: "mL/min",
          interpretation: crcl >= 90 ? "Aclaramiento normal." : crcl >= 60 ? "Reducción leve del aclaramiento: revisar fármacos de eliminación renal." : crcl >= 30 ? "Reducción moderada: ajuste de dosis necesario en muchos fármacos (incluidos los anticoagulantes directos)." : crcl >= 15 ? "Reducción grave: ajuste estricto y evitar nefrotóxicos." : "Fallo renal: valorar contraindicaciones farmacológicas y necesidad de terapia renal sustitutiva.",
          level: crcl >= 60 ? "ok" : crcl >= 30 ? "warn" : "danger",
          details: ["CrCl = [(140 − edad) × peso] / (72 × creatinina) × 0,85 si mujer."]
        };
      },
      notes: [
        "En obesidad conviene usar el peso ideal o ajustado; la fórmula sobreestima con peso elevado.",
        "Es la fórmula usada en las fichas técnicas de muchos fármacos (p. ej., anticoagulantes de acción directa), aunque el CKD-EPI estime mejor el filtrado glomerular."
      ],
      references: [
        "Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41."
      ]
    },
    {
      id: "friedewald",
      name: "Colesterol LDL (ecuación de Friedewald)",
      shortName: "LDL Friedewald",
      description: "Calcula el colesterol LDL a partir del perfil lipídico estándar.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "total", type: "number", label: "Colesterol total", unit: "mg/dL", min: 50, max: 800 },
        { id: "hdl", type: "number", label: "Colesterol HDL", unit: "mg/dL", min: 5, max: 200 },
        { id: "tg", type: "number", label: "Triglicéridos", unit: "mg/dL", min: 10, max: 2e3 }
      ],
      compute: (v) => {
        if (v.tg > 400)
          return {
            main: "No válido",
            interpretation: "Con triglicéridos > 400 mg/dL la ecuación de Friedewald no es fiable: usar LDL directo o las ecuaciones de Martin-Hopkins o Sampson.",
            level: "warn"
          };
        const ldl = v.total - v.hdl - v.tg / 5;
        return {
          main: fmt(ldl, 0),
          mainUnit: "mg/dL de LDL",
          secondary: fmt(v.total - v.hdl, 0),
          secondaryLabel: "colesterol no-HDL (mg/dL)",
          interpretation: ldl < 55 ? "LDL < 55 mg/dL: objetivo de muy alto riesgo cardiovascular alcanzado." : ldl < 70 ? "LDL < 70 mg/dL: objetivo de alto riesgo alcanzado." : ldl < 100 ? "LDL < 100 mg/dL: objetivo de riesgo moderado alcanzado." : "LDL elevado respecto a los objetivos habituales: valorar tratamiento hipolipemiante según el riesgo cardiovascular.",
          level: ldl < 70 ? "ok" : ldl < 100 ? "info" : ldl < 190 ? "warn" : "danger",
          details: ["LDL = colesterol total − HDL − triglicéridos/5 (mg/dL)."]
        };
      },
      notes: ["Requiere ayuno y no es válida con triglicéridos > 400 mg/dL ni con LDL muy bajo."],
      references: [
        "Friedewald WT, et al. Estimation of the concentration of low-density lipoprotein cholesterol in plasma, without use of the preparative ultracentrifuge. Clin Chem. 1972;18(6):499-502."
      ]
    },
    {
      id: "calcio-corregido",
      name: "Calcio corregido por albúmina",
      shortName: "Calcio corregido",
      description: "Corrige la calcemia total según la concentración de albúmina sérica.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "calcio", type: "number", label: "Calcio sérico total", unit: "mg/dL", min: 2, max: 20, step: 0.1 },
        { id: "albumina", type: "number", label: "Albúmina sérica", unit: "g/dL", min: 0.5, max: 7, step: 0.1 }
      ],
      compute: (v) => {
        const corr = v.calcio + 0.8 * (4 - v.albumina);
        return {
          main: fmt(corr, 2),
          mainUnit: "mg/dL (calcio corregido)",
          interpretation: corr < 8.5 ? "Hipocalcemia: valorar causas (déficit de vitamina D, hipoparatiroidismo, hipomagnesemia) y prolongación del QT." : corr <= 10.5 ? "Calcio corregido dentro del rango normal (8,5–10,5 mg/dL)." : "Hipercalcemia: valorar hiperparatiroidismo, neoplasia y otras causas; vigilar acortamiento del QT.",
          level: corr < 8.5 || corr > 10.5 ? "warn" : "ok",
          details: ["Calcio corregido = calcio medido + 0,8 × (4 − albúmina)."]
        };
      },
      notes: ["Ante dudas o situaciones críticas, medir el calcio iónico directamente."]
    },
    {
      id: "fick",
      name: "Gasto cardíaco (fórmula de Fick)",
      shortName: "Fick",
      description: "Calcula el gasto cardíaco, el índice cardíaco y el volumen sistólico.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "hb", type: "number", label: "Hemoglobina", unit: "g/dL", min: 3, max: 25, step: 0.1 },
        { id: "sao2", type: "number", label: "Saturación arterial de O₂", unit: "%", min: 40, max: 100 },
        { id: "svo2", type: "number", label: "Saturación venosa mixta de O₂", unit: "%", min: 10, max: 100 },
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 18, max: 110 },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 20, max: 300 },
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 100, max: 230 },
        { id: "fc", type: "number", label: "Frecuencia cardíaca", unit: "lpm", min: 20, max: 250 },
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Varón", value: 0 },
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
            main: "—",
            interpretation: "La saturación arterial debe ser mayor que la venosa mixta.",
            level: "warn"
          };
        const co = vo2 / dif;
        const ci = co / bsa;
        const sv = co * 1e3 / v.fc;
        return {
          main: fmt(co, 2),
          mainUnit: "L/min (gasto cardíaco)",
          secondary: fmt(ci, 2),
          secondaryLabel: "índice cardíaco (L/min/m²)",
          interpretation: ci < 2.2 ? "Índice cardíaco < 2,2 L/min/m²: bajo gasto; valorar soporte inotrópico o mecánico según el contexto." : ci <= 4 ? "Índice cardíaco dentro del rango habitual (2,2–4,0 L/min/m²)." : "Índice cardíaco elevado: valorar estados hiperdinámicos (sepsis, anemia, tirotoxicosis).",
          level: ci < 2.2 ? "danger" : ci <= 4 ? "ok" : "warn",
          details: [
            `Superficie corporal (Mosteller): ${fmt(bsa, 2)} m².`,
            `VO₂ estimado (LaFarge): ${fmt(vo2, 0)} mL/min.`,
            `Volumen sistólico: ${fmt(sv, 0)} mL.`
          ]
        };
      },
      notes: [
        "Usa el consumo de oxígeno estimado con la ecuación de LaFarge y Miettinen (Fick indirecto), no medido.",
        "En insuficiencia cardíaca con fracción de eyección reducida, las ecuaciones de estimación tienen límites de concordancia amplios: LaFarge fue la más ajustada de las tres estudiadas, pero con un error ≥ 25 % en el 11 % de los pacientes y una clasificación errónea del índice cardíaco en torno al 20 %. Ante decisiones críticas, medir el VO₂ directamente.",
        "Requiere saturación venosa mixta obtenida de arteria pulmonar (no venosa central)."
      ],
      references: [
        "LaFarge CG, Miettinen OS. The estimation of oxygen consumption. Cardiovasc Res. 1970;4(1):23-30.",
        "Chase PJ, et al. Comparison of estimations versus measured oxygen consumption at rest in patients with heart failure and reduced ejection fraction who underwent right-sided heart catheterization. Am J Cardiol. 2015;116(11):1724-30. doi:10.1016/j.amjcard.2015.08.051"
      ]
    },
    {
      id: "cpo",
      name: "Potencia cardíaca (CPO)",
      shortName: "CPO",
      description: "Calcula la potencia desarrollada por el corazón; predictor pronóstico en el shock cardiogénico.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "pam", type: "number", label: "Presión arterial media", unit: "mmHg", min: 20, max: 200 },
        { id: "co", type: "number", label: "Gasto cardíaco", unit: "L/min", min: 0.5, max: 15, step: 0.1 }
      ],
      compute: (v) => {
        const cpo = v.pam * v.co / 451;
        return {
          main: fmt(cpo, 2),
          mainUnit: "W",
          interpretation: cpo < 0.6 ? "CPO < 0,6 W: se asocia a mortalidad elevada en el shock cardiogénico; considerar soporte inotrópico o circulatorio mecánico." : "CPO ≥ 0,6 W: mejor pronóstico hemodinámico.",
          level: cpo < 0.6 ? "danger" : "ok",
          details: ["CPO = PAM × gasto cardíaco / 451."]
        };
      },
      references: [
        "Fincke R, et al. Cardiac power is the strongest hemodynamic correlate of mortality in cardiogenic shock (SHOCK trial registry). J Am Coll Cardiol. 2004;44(2):340-8."
      ]
    },
    {
      id: "papi",
      name: "Índice de pulsatilidad de la arteria pulmonar (PAPi)",
      shortName: "PAPi",
      description: "Evalúa el riesgo de disfunción del ventrículo derecho (infarto inferior, implante de asistencia ventricular izquierda).",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "pasp", type: "number", label: "Presión sistólica en arteria pulmonar", unit: "mmHg", min: 5, max: 150 },
        { id: "padp", type: "number", label: "Presión diastólica en arteria pulmonar", unit: "mmHg", min: 0, max: 100 },
        { id: "pad", type: "number", label: "Presión auricular derecha media", unit: "mmHg", min: 0.5, max: 40, step: 0.5 }
      ],
      compute: (v) => {
        const papi = (v.pasp - v.padp) / v.pad;
        return {
          main: fmt(papi, 2),
          interpretation: papi < 1 ? "PAPi < 1,0: disfunción grave del ventrículo derecho; asociado a mal pronóstico y a necesidad de soporte del VD." : papi < 1.85 ? "PAPi entre 1,0 y 1,85: riesgo aumentado de fallo del ventrículo derecho, especialmente tras implante de asistencia ventricular izquierda." : "PAPi ≥ 1,85: función del ventrículo derecho conservada en términos hemodinámicos.",
          level: papi < 1 ? "danger" : papi < 1.85 ? "warn" : "ok",
          details: ["PAPi = (PAP sistólica − PAP diastólica) / presión auricular derecha."]
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
        { id: "protPleural", type: "number", label: "Proteínas en líquido pleural", unit: "g/dL", min: 0, max: 10, step: 0.1 },
        { id: "protSuero", type: "number", label: "Proteínas séricas", unit: "g/dL", min: 1, max: 12, step: 0.1 },
        { id: "ldhPleural", type: "number", label: "LDH en líquido pleural", unit: "U/L", min: 0, max: 5e3 },
        { id: "ldhSuero", type: "number", label: "LDH sérica", unit: "U/L", min: 10, max: 5e3 },
        { id: "ldhLimite", type: "number", label: "Límite superior de LDH del laboratorio", unit: "U/L", min: 50, max: 1e3 }
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
          interpretation: exudado ? "Cumple al menos un criterio de Light: exudado. Estudiar causas (infección, neoplasia, embolia pulmonar, enfermedades del tejido conectivo)." : "No cumple ningún criterio: trasudado. Causas habituales: insuficiencia cardíaca, cirrosis, síndrome nefrótico.",
          level: exudado ? "warn" : "info",
          details: [
            `Proteínas pleural/suero: ${fmt(rProt, 2)} (criterio > 0,5) ${c1 ? "✓" : "✗"}`,
            `LDH pleural/suero: ${fmt(rLdh, 2)} (criterio > 0,6) ${c2 ? "✓" : "✗"}`,
            `LDH pleural > 2/3 del límite superior (${fmt(2 / 3 * v.ldhLimite, 0)} U/L) ${c3 ? "✓" : "✗"}`
          ]
        };
      },
      notes: [
        "En pacientes con insuficiencia cardíaca en tratamiento diurético, los criterios pueden clasificar erróneamente un trasudado como exudado: valorar el gradiente de albúmina suero-líquido (> 1,2 g/dL sugiere trasudado)."
      ],
      references: [
        "Light RW, et al. Pleural effusions: the diagnostic separation of transudates and exudates. Ann Intern Med. 1972;77(4):507-13."
      ]
    },
    {
      id: "fluidos-mantenimiento",
      name: "Fluidos de mantenimiento (regla 4-2-1 / Holliday-Segar)",
      shortName: "Fluidos de mantenimiento",
      description: "Calcula las necesidades basales de líquidos según el peso.",
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
          secondaryLabel: "mL/día",
          interpretation: "Necesidades basales de mantenimiento. Ajustar según pérdidas, estado de volemia, función renal y cardíaca; en insuficiencia cardíaca o renal suele requerirse restricción.",
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
      name: "Diuresis y balance hídrico",
      shortName: "Diuresis",
      description: "Calcula la diuresis horaria y el balance de líquidos en 24 horas.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 0.5, max: 300, step: 0.1 },
        { id: "orina", type: "number", label: "Volumen de orina recogido", unit: "mL", min: 0, max: 2e4 },
        { id: "horas", type: "number", label: "Tiempo de recogida", unit: "h", min: 0.5, max: 72, step: 0.5 },
        { id: "aportes", type: "number", label: "Aportes totales en ese período (opcional)", unit: "mL", min: 0, max: 3e4 }
      ],
      compute: (v) => {
        const mlKgH = v.orina / v.peso / v.horas;
        const balance = v.aportes - v.orina;
        return {
          main: fmt(mlKgH, 2),
          mainUnit: "mL/kg/h",
          secondary: `${balance >= 0 ? "+" : ""}${fmt(balance, 0)} mL`,
          secondaryLabel: "balance en el período",
          interpretation: mlKgH < 0.3 ? "Oliguria grave / anuria (< 0,3 mL/kg/h): criterio de lesión renal aguda; valorar causa prerrenal, renal u obstructiva de forma urgente." : mlKgH < 0.5 ? "Oliguria (< 0,5 mL/kg/h): si persiste ≥ 6 h cumple criterio KDIGO de lesión renal aguda." : "Diuresis dentro del rango habitual (≥ 0,5 mL/kg/h).",
          level: mlKgH < 0.3 ? "danger" : mlKgH < 0.5 ? "warn" : "ok",
          details: [`Diuresis extrapolada a 24 h: ${fmt(v.orina / v.horas * 24, 0)} mL/día.`]
        };
      },
      notes: ["El balance no incluye las pérdidas insensibles (aprox. 500–800 mL/día en un adulto, más con fiebre o taquipnea)."]
    },
    {
      id: "reticulocitos",
      name: "Índice de producción reticulocitaria (IPR)",
      shortName: "IPR / reticulocitos",
      description: "Evalúa la respuesta de la médula ósea a la anemia corrigiendo el porcentaje de reticulocitos.",
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
          interpretation: ipr < 2 ? "IPR < 2: respuesta medular inadecuada (anemia hipoproliferativa: ferropenia, enfermedad crónica, aplasia, infiltración medular)." : "IPR ≥ 2: respuesta medular adecuada, sugestiva de hemólisis o sangrado con médula competente.",
          level: ipr < 2 ? "warn" : "ok",
          details: [`Factor de maduración aplicado: ${madur}.`]
        };
      }
    },
    {
      id: "marcha-6min",
      name: "Prueba de la marcha de 6 minutos (valores de referencia)",
      shortName: "Marcha 6 min",
      description: "Calcula la distancia teórica esperada en la prueba de los 6 minutos como medida del estado funcional.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Varón", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 18, max: 100 },
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
          mainUnit: "m (distancia teórica)",
          secondary: pct !== null ? `${fmt(pct, 0)} %` : void 0,
          secondaryLabel: pct !== null ? "del valor teórico" : void 0,
          interpretation: pct === null ? `Límite inferior de la normalidad: ${fmt(li, 0)} m (ecuaciones de Enright y Sherrill).` : v.recorrida < li ? `Distancia por debajo del límite inferior de la normalidad (${fmt(li, 0)} m): capacidad funcional reducida.` : "Distancia dentro del rango esperado para edad, sexo, talla y peso.",
          level: pct === null ? "info" : v.recorrida < li ? "warn" : "ok"
        };
      },
      notes: [
        "Una diferencia de 30–50 m se considera clínicamente relevante en el seguimiento individual.",
        "Registrar además la SpO₂, la disnea (Borg) y los motivos de interrupción."
      ],
      references: [
        "Enright PL, Sherrill DL. Reference equations for the six-minute walk in healthy adults. Am J Respir Crit Care Med. 1998;158(5):1384-7."
      ]
    },
    {
      id: "trombolisis-ictus",
      name: "Dosificación de trombolíticos en el ictus isquémico",
      shortName: "Dosis alteplasa / tenecteplasa",
      description: "Calcula la dosis de alteplasa (0,9 mg/kg) o tenecteplasa (0,25 mg/kg) para el ictus isquémico agudo.",
      category: CAT13,
      specialty: CARD6,
      inputs: [
        {
          id: "farmaco",
          type: "select",
          label: "Fármaco",
          noPoints: true,
          options: [
            { label: "Alteplasa (rtPA) 0,9 mg/kg — máximo 90 mg", value: 0 },
            { label: "Tenecteplasa (TNK) 0,25 mg/kg — máximo 25 mg", value: 1 }
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
          secondaryLabel: tnk ? "mg en bolo único (5 s)" : "mg en bolo (1 min)",
          interpretation: tnk ? "Tenecteplasa: dosis única en bolo intravenoso de 5 segundos (0,25 mg/kg, máximo 25 mg)." : `Alteplasa: 10 % en bolo durante 1 minuto y el 90 % restante (${fmt(infusion, 1)} mg) en infusión de 60 minutos.`,
          level: "info",
          details: [
            "Verificar ventana terapéutica, criterios de inclusión/exclusión y control estricto de la presión arterial (< 185/110 mmHg antes de tratar).",
            "Monitorización neurológica y de la presión arterial según protocolo durante y tras la infusión."
          ]
        };
      },
      notes: ["Comprobar siempre la dosis con el protocolo de tu centro y la ficha técnica antes de administrarla."],
      references: [
        "Powers WJ, et al. Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update. Stroke. 2019;50(12):e344-e418."
      ]
    }
  ];

  // inurse-main/src/calculators/neurocritico.ts
  var CAT14 = "Neurocrítico e ictus";
  var UCI = ["Medicina Intensiva"];
  var escala = (items) => items.map(([value, label]) => ({ label: `${value} — ${label}`, value }));
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
            [4, "Espontánea"],
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
            [6, "Obedece órdenes"],
            [5, "Localiza el dolor"],
            [4, "Retirada al dolor"],
            [3, "Flexión anormal (decorticación)"],
            [2, "Extensión anormal (descerebración)"],
            [1, "Ninguna"]
          ]),
          default: 6
        }
      ],
      compute: (v) => {
        const score = sum(v, ["ocular", "verbal", "motora"]);
        return {
          main: String(score),
          mainUnit: "puntos (3–15)",
          secondary: `O${v.ocular} V${v.verbal} M${v.motora}`,
          secondaryLabel: "desglose",
          interpretation: score >= 13 ? "Traumatismo craneoencefálico leve (13–15)." : score >= 9 ? "Traumatismo craneoencefálico moderado (9–12): vigilancia estrecha y neuroimagen." : "Traumatismo craneoencefálico grave (≤ 8): considerar aislamiento de la vía aérea y monitorización neurocrítica.",
          level: score >= 13 ? "ok" : score >= 9 ? "warn" : "danger"
        };
      },
      notes: [
        "Registrar siempre el desglose por componentes: es más informativo que la suma.",
        "En pacientes intubados, la respuesta verbal se anota como 1 con el sufijo «T»; en ese caso la puntuación máxima es 10T.",
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
      description: "Combina la escala de Glasgow con la reactividad pupilar para afinar el pronóstico en puntuaciones bajas.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        { id: "gcs", type: "number", label: "Puntuación total de Glasgow", unit: "puntos", min: 3, max: 15, step: 1 },
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
        var _a;
        const gcsp = v.gcs - ((_a = v.pupilas) != null ? _a : 0);
        const mort = gcsp <= 2 ? "≈ 74 %" : gcsp <= 4 ? "≈ 40–50 %" : gcsp <= 8 ? "≈ 20–30 %" : "< 15 %";
        return {
          main: String(gcsp),
          mainUnit: "puntos (1–15)",
          secondary: mort,
          secondaryLabel: "mortalidad orientativa a 6 meses",
          interpretation: gcsp <= 4 ? "Puntuación muy baja: pronóstico desfavorable. La escala amplía el rango inferior de la GCS al restar la falta de reactividad pupilar." : gcsp <= 8 ? "Daño cerebral grave: monitorización neurocrítica." : "Rango de mejor pronóstico.",
          level: gcsp <= 4 ? "danger" : gcsp <= 8 ? "warn" : "ok",
          details: ["GCS-P = GCS total − puntuación de reactividad pupilar (0, 1 o 2)."]
        };
      },
      references: [
        "Brennan PM, Murray GD, Teasdale GM. Simplifying the use of prognostic information in traumatic brain injury. Part 1: The GCS-Pupils score. J Neurosurg. 2018;128(6):1612-20."
      ]
    },
    {
      id: "four",
      name: "Puntuación FOUR (Full Outline of UnResponsiveness)",
      shortName: "FOUR",
      description: "Gradúa la profundidad del coma; aplicable a pacientes intubados, donde la escala de Glasgow pierde el componente verbal.",
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
            [4, "Hace el signo de victoria, el puño o el pulgar a la orden"],
            [3, "Localiza el dolor"],
            [2, "Respuesta en flexión al dolor"],
            [1, "Respuesta en extensión al dolor"],
            [0, "Sin respuesta al dolor o estado mioclónico generalizado"]
          ]),
          default: 4
        },
        {
          id: "tronco",
          type: "select",
          label: "Reflejos del tronco encefálico",
          dropdown: true,
          options: escala([
            [4, "Reflejos pupilar y corneal presentes"],
            [3, "Una pupila midriática y fija"],
            [2, "Reflejo pupilar o corneal ausente"],
            [1, "Reflejos pupilar y corneal ausentes"],
            [0, "Reflejos pupilar, corneal y tusígeno ausentes"]
          ]),
          default: 4
        },
        {
          id: "respiracion",
          type: "select",
          label: "Patrón respiratorio",
          dropdown: true,
          options: escala([
            [4, "No intubado, patrón respiratorio regular"],
            [3, "No intubado, respiración de Cheyne-Stokes"],
            [2, "No intubado, respiración irregular"],
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
          mainUnit: "puntos (0–16)",
          secondary: `O${v.ocular} M${v.motora} T${v.tronco} R${v.respiracion}`,
          secondaryLabel: "desglose",
          interpretation: score === 0 ? "Puntuación 0: ausencia completa de respuesta y de reflejos de tronco; valorar protocolo de muerte encefálica." : score <= 4 ? "Coma muy profundo: pronóstico desfavorable." : score <= 11 ? "Alteración importante del nivel de conciencia: monitorización neurocrítica." : "Alteración leve-moderada del nivel de conciencia.",
          level: score <= 4 ? "danger" : score <= 11 ? "warn" : "ok"
        };
      },
      notes: [
        "Ventaja sobre la GCS: valora reflejos de tronco y patrón respiratorio, y es aplicable a pacientes intubados.",
        "Detecta el síndrome de cautiverio (locked-in) y los estados vegetativos que la GCS no distingue."
      ],
      references: [
        "Wijdicks EF, et al. Validation of a new coma scale: the FOUR score. Ann Neurol. 2005;58(4):585-93."
      ]
    },
    {
      id: "nihss",
      name: "Escala de ictus del NIH (NIHSS)",
      shortName: "NIHSS",
      description: "Cuantifica la gravedad del ictus y permite monitorizar los cambios neurológicos en el tiempo.",
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
            [1, "Somnoliento, despierta con estímulo mínimo"],
            [2, "Estuporoso, requiere estímulo repetido o doloroso"],
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
          label: "1c. Órdenes (abrir/cerrar los ojos, abrir/cerrar la mano)",
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
            [2, "Desviación forzada o paresia total"]
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
            [0, "Movimientos normales y simétricos"],
            [1, "Paresia leve (asimetría al sonreír)"],
            [2, "Parálisis parcial (facial inferior)"],
            [3, "Parálisis completa (superior e inferior)"]
          ])
        },
        {
          id: "i5a",
          type: "select",
          label: "5a. Motor — brazo izquierdo",
          dropdown: true,
          options: escala([
            [0, "Mantiene la posición 10 s sin claudicar"],
            [1, "Claudica antes de 10 s, sin llegar a tocar la cama"],
            [2, "Esfuerzo contra gravedad, cae a la cama"],
            [3, "Movimiento sin vencer la gravedad"],
            [4, "Ausencia de movimiento"]
          ])
        },
        {
          id: "i5b",
          type: "select",
          label: "5b. Motor — brazo derecho",
          dropdown: true,
          options: escala([
            [0, "Mantiene la posición 10 s sin claudicar"],
            [1, "Claudica antes de 10 s, sin llegar a tocar la cama"],
            [2, "Esfuerzo contra gravedad, cae a la cama"],
            [3, "Movimiento sin vencer la gravedad"],
            [4, "Ausencia de movimiento"]
          ])
        },
        {
          id: "i6a",
          type: "select",
          label: "6a. Motor — pierna izquierda",
          dropdown: true,
          options: escala([
            [0, "Mantiene la posición 5 s sin claudicar"],
            [1, "Claudica antes de 5 s, sin llegar a tocar la cama"],
            [2, "Esfuerzo contra gravedad, cae a la cama"],
            [3, "Movimiento sin vencer la gravedad"],
            [4, "Ausencia de movimiento"]
          ])
        },
        {
          id: "i6b",
          type: "select",
          label: "6b. Motor — pierna derecha",
          dropdown: true,
          options: escala([
            [0, "Mantiene la posición 5 s sin claudicar"],
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
            [2, "Presente en dos o más extremidades"]
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
            [0, "Articulación normal"],
            [1, "Disartria leve-moderada"],
            [2, "Disartria grave, ininteligible o anartria"]
          ])
        },
        {
          id: "i11",
          type: "select",
          label: "11. Extinción / inatención",
          dropdown: true,
          options: escala([
            [0, "Sin alteraciones"],
            [1, "Inatención en una modalidad sensorial"],
            [2, "Hemi-inatención grave o en más de una modalidad"]
          ])
        }
      ],
      compute: (v) => {
        const ids = ["i1a", "i1b", "i1c", "i2", "i3", "i4", "i5a", "i5b", "i6a", "i6b", "i7", "i8", "i9", "i10", "i11"];
        const score = sum(v, ids);
        const banda = score === 0 ? "Sin déficit medible" : score <= 4 ? "Ictus leve" : score <= 15 ? "Ictus moderado" : score <= 20 ? "Ictus moderado-grave" : "Ictus grave";
        return {
          main: String(score),
          mainUnit: "puntos (0–42)",
          interpretation: `${banda}. A mayor puntuación, mayor volumen de lesión y peor pronóstico funcional. Una NIHSS ≥ 6 con clínica compatible sugiere oclusión de gran vaso: valorar trombectomía además de la trombólisis.`,
          level: score === 0 ? "ok" : score <= 4 ? "info" : score <= 15 ? "warn" : "danger"
        };
      },
      notes: [
        "Puntuar lo que el paciente hace, no lo que se cree que puede hacer; no ayudar ni repetir instrucciones más de lo indicado.",
        "Realizar los ítems en orden y no volver atrás para modificar puntuaciones.",
        "En la circulación posterior la NIHSS infraestima la gravedad."
      ],
      references: [
        "Brott T, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864-70."
      ]
    },
    {
      id: "rankin",
      name: "Escala de Rankin modificada (mRS)",
      shortName: "Rankin",
      description: "Mide el grado de discapacidad o dependencia tras un ictus u otra causa de daño neurológico.",
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
            [0, "Sin síntomas"],
            [1, "Sin discapacidad significativa: realiza sus actividades habituales pese a algún síntoma"],
            [2, "Discapacidad leve: no puede hacer todo lo que hacía antes, pero se vale por sí mismo"],
            [3, "Discapacidad moderada: requiere alguna ayuda, pero camina sin asistencia"],
            [4, "Discapacidad moderada-grave: no camina ni atiende sus necesidades sin ayuda"],
            [5, "Discapacidad grave: encamado, incontinente, requiere cuidados constantes"],
            [6, "Fallecido"]
          ])
        }
      ],
      compute: (v) => {
        var _a;
        const g = (_a = v.grado) != null ? _a : 0;
        return {
          main: `mRS ${g}`,
          interpretation: g <= 2 ? "mRS 0–2: independencia funcional; es el resultado favorable habitual en los ensayos de trombólisis y trombectomía." : g <= 5 ? "mRS 3–5: dependencia funcional en grado creciente; planificar rehabilitación y apoyo sociosanitario." : "Fallecimiento.",
          level: g <= 2 ? "ok" : g <= 4 ? "warn" : "danger"
        };
      },
      references: [
        "van Swieten JC, et al. Interobserver agreement for the assessment of handicap in stroke patients. Stroke. 1988;19(5):604-7."
      ]
    },
    {
      id: "abc2-volumen",
      name: "Fórmula ABC/2 para el volumen de la hemorragia intracerebral",
      shortName: "ABC/2",
      description: "Estima el volumen del hematoma intracraneal a partir de la tomografía computarizada.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        { id: "a", type: "number", label: "A — diámetro mayor del hematoma", unit: "cm", min: 0.1, max: 30, step: 0.1 },
        { id: "b", type: "number", label: "B — diámetro perpendicular al anterior", unit: "cm", min: 0.1, max: 30, step: 0.1 },
        { id: "cortes", type: "number", label: "Número de cortes con hemorragia", unit: "cortes", min: 1, max: 100, step: 1 },
        { id: "grosor", type: "number", label: "Grosor de corte", unit: "cm", min: 0.1, max: 2, step: 0.1 }
      ],
      compute: (v) => {
        const c = v.cortes * v.grosor;
        const vol = v.a * v.b * c / 2;
        return {
          main: fmt(vol, 1),
          mainUnit: "cm³ (mL)",
          interpretation: vol >= 30 ? "Volumen ≥ 30 cm³: se asocia a peor pronóstico y puntúa en la escala ICH; valoración neuroquirúrgica." : "Volumen < 30 cm³.",
          level: vol >= 30 ? "danger" : "warn",
          details: [
            `C (extensión craneocaudal) = ${fmt(c, 1)} cm.`,
            "Volumen = A × B × C / 2 (aproximación elipsoidal)."
          ]
        };
      },
      notes: [
        "Para contar los cortes, se toman como completos los que tienen ≥ 75 % del área del corte mayor y como medios los que tienen entre el 25 y el 75 %.",
        "La fórmula sobrestima el volumen en hematomas de forma irregular o lobares."
      ],
      references: [
        "Kothari RU, et al. The ABCs of measuring intracerebral hemorrhage volumes. Stroke. 1996;27(8):1304-5."
      ]
    },
    {
      id: "ich-score",
      name: "Puntuación ICH de hemorragia intracerebral",
      shortName: "ICH",
      description: "Estima la mortalidad a 30 días en la hemorragia intracerebral espontánea.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "gcs",
          type: "select",
          label: "Escala de coma de Glasgow",
          options: [
            { label: "13–15", value: 0 },
            { label: "5–12", value: 1 },
            { label: "3–4", value: 2 }
          ]
        },
        { id: "volumen", type: "boolean", label: "Volumen del hematoma ≥ 30 cm³" },
        { id: "intraventricular", type: "boolean", label: "Hemorragia intraventricular" },
        { id: "infratentorial", type: "boolean", label: "Origen infratentorial" },
        { id: "edad", type: "boolean", label: "Edad ≥ 80 años" }
      ],
      compute: (v) => {
        const score = sum(v, ["gcs", "volumen", "intraventricular", "infratentorial", "edad"]);
        const mort = ["0 %", "13 %", "26 %", "72 %", "97 %", "100 %", "100 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–6)",
          secondary: mort,
          secondaryLabel: "mortalidad a 30 días (cohorte original)",
          interpretation: score <= 1 ? "Riesgo bajo de mortalidad a 30 días." : score === 2 ? "Riesgo intermedio." : "Riesgo alto de mortalidad. Evitar decisiones de limitación del esfuerzo terapéutico basadas solo en esta escala en las primeras 24–48 h: constituyen una profecía autocumplida.",
          level: score <= 1 ? "warn" : "danger"
        };
      },
      notes: [
        "La cohorte de derivación fue pequeña; las cifras son orientativas.",
        "Las guías desaconsejan usar escalas pronósticas para limitar tratamientos de forma precoz."
      ],
      references: [
        "Hemphill JC 3rd, et al. The ICH score: a simple, reliable grading scale for intracerebral hemorrhage. Stroke. 2001;32(4):891-7."
      ]
    },
    {
      id: "hunt-hess",
      name: "Clasificación de Hunt y Hess de la hemorragia subaracnoidea",
      shortName: "Hunt-Hess",
      description: "Gradúa la gravedad clínica de la hemorragia subaracnoidea aneurismática.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "Grado clínico",
          dropdown: true,
          noPoints: true,
          options: escala([
            [1, "Asintomático o cefalea leve y ligera rigidez de nuca"],
            [2, "Cefalea moderada-intensa, rigidez de nuca, sin déficit salvo parálisis de pares craneales"],
            [3, "Somnolencia, confusión o déficit focal leve"],
            [4, "Estupor, hemiparesia moderada-grave, rigidez de descerebración precoz"],
            [5, "Coma profundo, rigidez de descerebración, aspecto moribundo"]
          ])
        }
      ],
      compute: (v) => {
        var _a;
        const g = (_a = v.grado) != null ? _a : 1;
        const superv = ["", "≈ 70 %", "≈ 60 %", "≈ 50 %", "≈ 20 %", "≈ 10 %"][g];
        return {
          main: `Grado ${["", "I", "II", "III", "IV", "V"][g]}`,
          secondary: superv,
          secondaryLabel: "supervivencia orientativa",
          interpretation: g <= 2 ? "Buen grado clínico: candidato a tratamiento precoz del aneurisma con buen pronóstico esperado." : g === 3 ? "Grado intermedio: tratamiento precoz e ingreso en unidad neurocrítica." : "Mal grado clínico: alta mortalidad; manejo neurocrítico intensivo y valoración individualizada.",
          level: g <= 2 ? "ok" : g === 3 ? "warn" : "danger"
        };
      },
      notes: ["Sumar un grado si existe enfermedad sistémica grave (HTA, diabetes, arteriosclerosis, EPOC) o vasoespasmo grave en la arteriografía."],
      references: [
        "Hunt WE, Hess RM. Surgical risk as related to time of intervention in the repair of intracranial aneurysms. J Neurosurg. 1968;28(1):14-20."
      ]
    },
    {
      id: "abcd2",
      name: "Puntuación ABCD² para el accidente isquémico transitorio",
      shortName: "ABCD²",
      description: "Estima el riesgo de ictus tras un accidente isquémico transitorio.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad ≥ 60 años (A)" },
        { id: "pa", type: "boolean", label: "Presión arterial ≥ 140/90 mmHg (B)" },
        {
          id: "clinica",
          type: "select",
          label: "Características clínicas (C)",
          options: [
            { label: "Otros síntomas", value: 0 },
            { label: "Alteración del habla sin debilidad", value: 1 },
            { label: "Debilidad unilateral", value: 2 }
          ]
        },
        {
          id: "duracion",
          type: "select",
          label: "Duración de los síntomas (D)",
          options: [
            { label: "< 10 min", value: 0 },
            { label: "10–59 min", value: 1 },
            { label: "≥ 60 min", value: 2 }
          ]
        },
        { id: "diabetes", type: "boolean", label: "Diabetes mellitus (D)" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "pa", "clinica", "duracion", "diabetes"]);
        const r2 = score <= 3 ? "1,0 %" : score <= 5 ? "4,1 %" : "8,1 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–7)",
          secondary: r2,
          secondaryLabel: "riesgo de ictus a 2 días",
          interpretation: score <= 3 ? "Riesgo bajo. Aun así, las guías actuales recomiendan estudio urgente de todo AIT (imagen vascular y cerebral, ECG) sin apoyarse solo en esta escala." : score <= 5 ? "Riesgo moderado: estudio urgente e inicio precoz de prevención secundaria." : "Riesgo alto: valoración e ingreso urgentes.",
          level: score <= 3 ? "warn" : score <= 5 ? "warn" : "danger"
        };
      },
      notes: [
        "La escala no debe usarse aisladamente para decidir el alta: no identifica de forma fiable causas tratables como la estenosis carotídea o la fibrilación auricular."
      ],
      references: [
        "Johnston SC, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet. 2007;369(9558):283-92."
      ]
    },
    {
      id: "2helps2b",
      name: "Puntuación 2HELPS2B de riesgo de crisis en el EEG continuo",
      shortName: "2HELPS2B",
      description: "Estima el riesgo de crisis epilépticas en pacientes críticos monitorizados con electroencefalograma continuo.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "frecuencia",
          type: "boolean",
          label: "Patrón periódico o rítmico con frecuencia > 2 Hz"
        },
        { id: "esporadicas", type: "boolean", label: "Descargas epileptiformes esporádicas" },
        {
          id: "patrones",
          type: "boolean",
          label: "Descargas periódicas lateralizadas (LPD), actividad delta rítmica lateralizada (LRDA) o descargas periódicas bilaterales independientes (BIPD)"
        },
        {
          id: "plus",
          type: "boolean",
          label: "Características «plus»",
          description: "Actividad rápida, rítmica o aguda superpuesta al patrón."
        },
        { id: "crisis", type: "boolean", label: "Crisis epiléptica previa (clínica o electrográfica)" },
        {
          id: "birds",
          type: "boolean",
          label: "BIRDs (descargas rítmicas breves potencialmente ictales)",
          points: 2
        }
      ],
      compute: (v) => {
        const score = sum(v, ["frecuencia", "esporadicas", "patrones", "plus", "crisis", "birds"]);
        const riesgo2 = ["5 %", "12 %", "27 %", "50 %", "73 %", "> 80 %", "> 80 %", "> 80 %"][Math.min(score, 7)];
        return {
          main: String(score),
          mainUnit: "puntos (0–7)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de crisis",
          interpretation: score === 0 ? "Riesgo bajo (≈ 5 %): puede bastar con 1 hora de EEG si no hay otros motivos de sospecha." : score === 1 ? "Riesgo intermedio: se recomienda al menos 12–24 h de monitorización." : "Riesgo alto (≥ 2 puntos): se recomienda monitorización con EEG continuo durante al menos 24–48 h.",
          level: score === 0 ? "ok" : score === 1 ? "warn" : "danger"
        };
      },
      references: [
        "Struck AF, et al. Association of an electroencephalography-based risk score with seizure probability in hospitalized patients. JAMA Neurol. 2017;74(12):1419-24."
      ]
    },
    {
      id: "cam-icu",
      name: "Método de evaluación de la confusión en la UCI (CAM-ICU)",
      shortName: "CAM-ICU",
      description: "Detecta el delirio en pacientes críticos, incluidos los que están intubados.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "rass",
          type: "select",
          label: "Nivel de sedación (RASS)",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "RASS −5 o −4 (no despierta): no evaluable, reevaluar más tarde", value: 0 },
            { label: "RASS −3 a +4 (despierta a la voz): puede evaluarse", value: 1 }
          ],
          default: 1
        },
        {
          id: "agudo",
          type: "boolean",
          label: "1. Inicio agudo o curso fluctuante",
          description: "¿Hay un cambio agudo respecto al estado mental basal, o el estado mental ha fluctuado en las últimas 24 h?",
          noPoints: true
        },
        {
          id: "inatencion",
          type: "boolean",
          label: "2. Inatención",
          description: "Menos de 8 aciertos de 10 en la prueba de letras (apretar la mano con la letra «A») o de imágenes.",
          noPoints: true
        },
        {
          id: "conciencia",
          type: "boolean",
          label: "3. Nivel de conciencia alterado",
          description: "RASS distinto de 0 en el momento de la evaluación.",
          noPoints: true
        },
        {
          id: "pensamiento",
          type: "boolean",
          label: "4. Pensamiento desorganizado",
          description: "Errores en las preguntas lógicas o incapacidad para seguir la orden de mostrar dedos.",
          noPoints: true
        }
      ],
      compute: (v) => {
        if (v.rass === 0)
          return {
            main: "No evaluable",
            interpretation: "Con RASS −4 o −5 el paciente está demasiado sedado para valorar el delirio: reevaluar cuando el nivel de sedación mejore.",
            level: "info"
          };
        const positivo = v.agudo === 1 && v.inatencion === 1 && (v.conciencia === 1 || v.pensamiento === 1);
        return {
          main: positivo ? "CAM-ICU positivo" : "CAM-ICU negativo",
          interpretation: positivo ? "Delirio presente: buscar y corregir causas (dolor, fármacos, infección, hipoxia, abstinencia, retención urinaria), favorecer la movilización precoz, el sueño y la reorientación, y reservar los antipsicóticos para la agitación con riesgo." : "Sin delirio en este momento. Reevaluar al menos una vez por turno.",
          level: positivo ? "danger" : "ok",
          details: [
            "Se requieren los criterios 1 y 2, más el 3 o el 4."
          ]
        };
      },
      references: [
        "Ely EW, et al. Delirium in mechanically ventilated patients: validity and reliability of the confusion assessment method for the intensive care unit (CAM-ICU). JAMA. 2001;286(21):2703-10."
      ]
    },
    {
      id: "cpot",
      name: "Herramienta de observación del dolor en cuidados intensivos (CPOT)",
      shortName: "CPOT",
      description: "Evalúa el dolor del paciente crítico que no puede comunicarlo, mediante observación.",
      category: CAT14,
      specialty: UCI,
      inputs: [
        {
          id: "facial",
          type: "select",
          label: "Expresión facial",
          dropdown: true,
          options: escala([
            [0, "Relajada, neutra"],
            [1, "Tensa (ceño fruncido, cejas bajas, contracción periorbitaria)"],
            [2, "Muecas de dolor (además, párpados fuertemente cerrados)"]
          ])
        },
        {
          id: "movimientos",
          type: "select",
          label: "Movimientos corporales",
          dropdown: true,
          options: escala([
            [0, "Ausencia de movimientos o posición normal"],
            [1, "Protección (movimientos lentos y cautelosos, se toca la zona dolorosa)"],
            [2, "Inquietud (intenta sentarse, mueve las extremidades, no obedece órdenes, intenta retirar dispositivos)"]
          ])
        },
        {
          id: "muscular",
          type: "select",
          label: "Tensión muscular (flexión-extensión pasiva del brazo)",
          dropdown: true,
          options: escala([
            [0, "Relajado, sin resistencia"],
            [1, "Tenso, rígido; resistencia a los movimientos pasivos"],
            [2, "Muy tenso o rígido; imposible completar los movimientos pasivos"]
          ])
        },
        {
          id: "ventilador",
          type: "select",
          label: "Adaptación al ventilador (intubados) o vocalización (extubados)",
          dropdown: true,
          options: escala([
            [0, "Tolera el ventilador / habla en tono normal o está en silencio"],
            [1, "Tose pero tolera / suspira, gime"],
            [2, "Lucha contra el ventilador / llora, grita"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["facial", "movimientos", "muscular", "ventilador"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–8)",
          interpretation: score > 2 ? "CPOT > 2: dolor significativo. Administrar analgesia y reevaluar tras la intervención." : "CPOT ≤ 2: dolor mínimo o ausente. Continuar la vigilancia y reevaluar tras los procedimientos.",
          level: score > 2 ? "danger" : "ok"
        };
      },
      notes: ["Evaluar en reposo y durante los procedimientos dolorosos (movilización, aspiración, curas)."],
      references: [
        "Gélinas C, et al. Validation of the critical-care pain observation tool in adult patients. Am J Crit Care. 2006;15(4):420-7."
      ]
    }
  ];

  // inurse-main/src/calculators/uci-gravedad.ts
  var CAT15 = "Gravedad en UCI y sepsis";
  var UCI2 = ["Medicina Intensiva"];
  var escala2 = (items) => items.map(([value, label]) => ({ label: `${value} — ${label}`, value }));
  var uciGravedad = [
    {
      id: "qsofa",
      name: "Puntuación qSOFA (SOFA rápido) para la sepsis",
      shortName: "qSOFA",
      description: "Identifica, fuera de la UCI, a los pacientes con sospecha de infección y mayor riesgo de mala evolución.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        { id: "fr", type: "boolean", label: "Frecuencia respiratoria ≥ 22 rpm" },
        { id: "mental", type: "boolean", label: "Alteración del estado mental (Glasgow < 15)" },
        { id: "pas", type: "boolean", label: "Presión arterial sistólica ≤ 100 mmHg" }
      ],
      compute: (v) => {
        const score = sum(v, ["fr", "mental", "pas"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–3)",
          interpretation: score >= 2 ? "qSOFA ≥ 2: mayor riesgo de mortalidad y estancia prolongada. Investigar disfunción orgánica, iniciar tratamiento precoz y valorar el nivel de cuidados." : "qSOFA < 2: no descarta la sepsis. Si la sospecha clínica persiste, continuar la evaluación y reevaluar con frecuencia.",
          level: score >= 2 ? "danger" : "warn"
        };
      },
      notes: [
        "La campaña Sobrevivir a la Sepsis 2021 desaconseja usar el qSOFA como herramienta única de cribado por su baja sensibilidad; se prefieren sistemas como NEWS o los criterios de SIRS para el cribado inicial.",
        "Un qSOFA positivo debe motivar la búsqueda activa de disfunción orgánica (SOFA completo, lactato)."
      ],
      references: [
        "Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-10.",
        "Evans L, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Crit Care Med. 2021;49(11):e1063-e1143."
      ]
    },
    {
      id: "msofa",
      name: "Puntuación SOFA modificada (mSOFA)",
      shortName: "mSOFA",
      description: "Predice la mortalidad en la UCI usando principalmente variables clínicas y menos pruebas de laboratorio que la SOFA original.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "resp",
          type: "select",
          label: "Respiratorio — SpO₂/FiO₂",
          dropdown: true,
          options: [
            { label: "> 400", value: 0 },
            { label: "316–400", value: 1 },
            { label: "235–315", value: 2 },
            { label: "150–234 con soporte respiratorio", value: 3 },
            { label: "< 150 con soporte respiratorio", value: 4 }
          ]
        },
        {
          id: "hepatico",
          type: "select",
          label: "Hígado — ictericia clínica",
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
            { label: "PAM ≥ 70 mmHg sin vasoactivos", value: 0 },
            { label: "PAM < 70 mmHg sin vasoactivos", value: 1 },
            { label: "Dopamina ≤ 5 µg/kg/min o dobutamina (cualquier dosis)", value: 2 },
            { label: "Dopamina > 5, o adrenalina/noradrenalina ≤ 0,1 µg/kg/min", value: 3 },
            { label: "Dopamina > 15, o adrenalina/noradrenalina > 0,1 µg/kg/min", value: 4 }
          ]
        },
        {
          id: "snc",
          type: "select",
          label: "Neurológico — escala de coma de Glasgow",
          dropdown: true,
          options: [
            { label: "15", value: 0 },
            { label: "13–14", value: 1 },
            { label: "10–12", value: 2 },
            { label: "6–9", value: 3 },
            { label: "< 6", value: 4 }
          ]
        },
        {
          id: "renal",
          type: "select",
          label: "Renal — creatinina (mg/dL)",
          dropdown: true,
          options: [
            { label: "< 1,2", value: 0 },
            { label: "1,2–1,9", value: 1 },
            { label: "2,0–3,4", value: 2 },
            { label: "3,5–4,9", value: 3 },
            { label: "≥ 5,0", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["resp", "hepatico", "cardio", "snc", "renal"]);
        const mort = score <= 7 ? "≈ 4 %" : score <= 11 ? "≈ 31 %" : "≈ 68 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–20)",
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria orientativa",
          interpretation: score <= 7 ? "Disfunción orgánica leve." : score <= 11 ? "Disfunción orgánica moderada: vigilancia intensiva." : "Disfunción orgánica grave con mortalidad elevada.",
          level: score <= 7 ? "ok" : score <= 11 ? "warn" : "danger"
        };
      },
      notes: [
        "Sustituye la PaO₂ por la SpO₂, la bilirrubina por la ictericia clínica y prescinde de las plaquetas: pensada para entornos con recursos limitados o situaciones de catástrofe."
      ],
      references: [
        "Grissom CK, et al. A modified sequential organ failure assessment score for critical care triage. Disaster Med Public Health Prep. 2010;4(4):277-84."
      ]
    },
    {
      id: "apache2",
      name: "Puntuación APACHE II",
      shortName: "APACHE II",
      description: "Estima la mortalidad hospitalaria del paciente crítico a partir de las peores variables de las primeras 24 horas de ingreso en la UCI.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "temp",
          type: "select",
          label: "Temperatura rectal (°C)",
          dropdown: true,
          options: [
            { label: "≥ 41 o ≤ 29,9", value: 4 },
            { label: "39–40,9 o 30–31,9", value: 3 },
            { label: "32–33,9", value: 2 },
            { label: "38,5–38,9 o 34–35,9", value: 1 },
            { label: "36–38,4", value: 0 }
          ],
          default: 0
        },
        {
          id: "pam",
          type: "select",
          label: "Presión arterial media (mmHg)",
          dropdown: true,
          options: [
            { label: "≥ 160 o ≤ 49", value: 4 },
            { label: "130–159", value: 3 },
            { label: "110–129 o 50–69", value: 2 },
            { label: "70–109", value: 0 }
          ],
          default: 0
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia cardíaca (lpm)",
          dropdown: true,
          options: [
            { label: "≥ 180 o ≤ 39", value: 4 },
            { label: "140–179 o 40–54", value: 3 },
            { label: "110–139 o 55–69", value: 2 },
            { label: "70–109", value: 0 }
          ],
          default: 0
        },
        {
          id: "fr",
          type: "select",
          label: "Frecuencia respiratoria (rpm)",
          dropdown: true,
          options: [
            { label: "≥ 50 o ≤ 5", value: 4 },
            { label: "35–49", value: 3 },
            { label: "6–9", value: 2 },
            { label: "25–34 o 10–11", value: 1 },
            { label: "12–24", value: 0 }
          ],
          default: 0
        },
        {
          id: "oxigenacion",
          type: "select",
          label: "Oxigenación",
          description: "Con FiO₂ ≥ 0,5 usar el gradiente alveolo-arterial; con FiO₂ < 0,5 usar la PaO₂.",
          dropdown: true,
          options: [
            { label: "A-a ≥ 500 (FiO₂ ≥ 0,5)", value: 4 },
            { label: "A-a 350–499 (FiO₂ ≥ 0,5)", value: 3 },
            { label: "A-a 200–349 (FiO₂ ≥ 0,5)", value: 2 },
            { label: "A-a < 200 (FiO₂ ≥ 0,5) o PaO₂ > 70 (FiO₂ < 0,5)", value: 0 },
            { label: "PaO₂ 61–70 (FiO₂ < 0,5)", value: 1 },
            { label: "PaO₂ 55–60 (FiO₂ < 0,5)", value: 3 },
            { label: "PaO₂ < 55 (FiO₂ < 0,5)", value: 4 }
          ],
          default: 0
        },
        {
          id: "ph",
          type: "select",
          label: "pH arterial",
          dropdown: true,
          options: [
            { label: "≥ 7,7 o < 7,15", value: 4 },
            { label: "7,6–7,69 o 7,15–7,24", value: 3 },
            { label: "7,25–7,32", value: 2 },
            { label: "7,5–7,59", value: 1 },
            { label: "7,33–7,49", value: 0 }
          ],
          default: 0
        },
        {
          id: "sodio",
          type: "select",
          label: "Sodio sérico (mEq/L)",
          dropdown: true,
          options: [
            { label: "≥ 180 o ≤ 110", value: 4 },
            { label: "160–179 o 111–119", value: 3 },
            { label: "155–159 o 120–129", value: 2 },
            { label: "150–154", value: 1 },
            { label: "130–149", value: 0 }
          ],
          default: 0
        },
        {
          id: "potasio",
          type: "select",
          label: "Potasio sérico (mEq/L)",
          dropdown: true,
          options: [
            { label: "≥ 7 o < 2,5", value: 4 },
            { label: "6–6,9", value: 3 },
            { label: "2,5–2,9", value: 2 },
            { label: "5,5–5,9 o 3–3,4", value: 1 },
            { label: "3,5–5,4", value: 0 }
          ],
          default: 0
        },
        {
          id: "creatinina",
          type: "select",
          label: "Creatinina sérica (mg/dL)",
          description: "Duplicar la puntuación si hay insuficiencia renal aguda.",
          dropdown: true,
          options: [
            { label: "≥ 3,5", value: 4 },
            { label: "2–3,4", value: 3 },
            { label: "1,5–1,9 o < 0,6", value: 2 },
            { label: "0,6–1,4", value: 0 }
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
            { label: "≥ 60 o < 20", value: 4 },
            { label: "50–59,9 o 20–29,9", value: 2 },
            { label: "46–49,9", value: 1 },
            { label: "30–45,9", value: 0 }
          ],
          default: 0
        },
        {
          id: "leucocitos",
          type: "select",
          label: "Leucocitos (×10³/mm³)",
          dropdown: true,
          options: [
            { label: "≥ 40 o < 1", value: 4 },
            { label: "20–39,9 o 1–2,9", value: 2 },
            { label: "15–19,9", value: 1 },
            { label: "3–14,9", value: 0 }
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
            { label: "≤ 44 años", value: 0 },
            { label: "45–54 años", value: 2 },
            { label: "55–64 años", value: 3 },
            { label: "65–74 años", value: 5 },
            { label: "≥ 75 años", value: 6 }
          ]
        },
        {
          id: "cronico",
          type: "select",
          label: "Enfermedad crónica grave",
          description: "Cirrosis con hipertensión portal, insuficiencia cardíaca clase IV, enfermedad respiratoria crónica grave, diálisis crónica o inmunodepresión.",
          dropdown: true,
          options: [
            { label: "Ninguna", value: 0 },
            { label: "Presente — postoperatorio programado", value: 2 },
            { label: "Presente — no quirúrgico o postoperatorio urgente", value: 5 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const crea = ((_a = v.creatinina) != null ? _a : 0) * (v.renalAguda === 1 ? 2 : 1);
        const gcsPuntos = 15 - v.gcs;
        const score = sum(v, ["temp", "pam", "fc", "fr", "oxigenacion", "ph", "sodio", "potasio", "hematocrito", "leucocitos", "edad", "cronico"]) + crea + gcsPuntos;
        const mort = score <= 4 ? "≈ 4 %" : score <= 9 ? "≈ 8 %" : score <= 14 ? "≈ 15 %" : score <= 19 ? "≈ 25 %" : score <= 24 ? "≈ 40 %" : score <= 29 ? "≈ 55 %" : score <= 34 ? "≈ 73 %" : "≈ 85 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–71)",
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria orientativa",
          interpretation: score <= 9 ? "Gravedad baja." : score <= 19 ? "Gravedad moderada." : score <= 29 ? "Gravedad alta." : "Gravedad muy alta.",
          level: score <= 9 ? "ok" : score <= 19 ? "warn" : "danger",
          details: [
            `Puntos por Glasgow: ${gcsPuntos} (15 − GCS).`,
            `Puntos por creatinina: ${crea}${v.renalAguda === 1 ? " (duplicados por insuficiencia renal aguda)" : ""}.`
          ]
        };
      },
      notes: [
        "Usar los peores valores de las primeras 24 horas de ingreso en la UCI.",
        "La mortalidad exacta depende además del diagnóstico de ingreso mediante coeficientes específicos; las cifras mostradas son orientativas por tramos.",
        "Los porcentajes proceden de cohortes de los años ochenta y sobreestiman la mortalidad actual."
      ],
      references: [
        "Knaus WA, et al. APACHE II: a severity of disease classification system. Crit Care Med. 1985;13(10):818-29."
      ]
    },
    {
      id: "news2",
      name: "Puntuación nacional de alerta temprana 2 (NEWS2)",
      shortName: "NEWS2",
      description: "Detecta el deterioro clínico agudo y gradúa la respuesta asistencial (versión recomendada por el NHS).",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "fr",
          type: "select",
          label: "Frecuencia respiratoria (rpm)",
          dropdown: true,
          options: [
            { label: "≤ 8", value: 3 },
            { label: "9–11", value: 1 },
            { label: "12–20", value: 0 },
            { label: "21–24", value: 2 },
            { label: "≥ 25", value: 3 }
          ],
          default: 0
        },
        {
          id: "escala",
          type: "select",
          label: "Escala de saturación",
          noPoints: true,
          options: [
            { label: "Escala 1 (habitual)", value: 0 },
            { label: "Escala 2 (riesgo de insuficiencia respiratoria hipercápnica)", value: 1 }
          ]
        },
        {
          id: "spo2a",
          type: "select",
          label: "SpO₂ — escala 1",
          dropdown: true,
          options: [
            { label: "≤ 91 %", value: 3 },
            { label: "92–93 %", value: 2 },
            { label: "94–95 %", value: 1 },
            { label: "≥ 96 %", value: 0 }
          ],
          default: 0
        },
        {
          id: "spo2b",
          type: "select",
          label: "SpO₂ — escala 2 (objetivo 88–92 %)",
          dropdown: true,
          options: [
            { label: "≤ 83 %", value: 3 },
            { label: "84–85 %", value: 2 },
            { label: "86–87 %", value: 1 },
            { label: "88–92 % sin oxígeno, o ≥ 93 % sin oxígeno", value: 0 },
            { label: "93–94 % con oxígeno", value: 1 },
            { label: "95–96 % con oxígeno", value: 2 },
            { label: "≥ 97 % con oxígeno", value: 3 }
          ],
          default: 0
        },
        {
          id: "oxigeno",
          type: "select",
          label: "Oxigenoterapia",
          options: [
            { label: "Aire ambiente", value: 0 },
            { label: "Oxígeno suplementario", value: 2 }
          ]
        },
        {
          id: "pas",
          type: "select",
          label: "Presión arterial sistólica (mmHg)",
          dropdown: true,
          options: [
            { label: "≤ 90", value: 3 },
            { label: "91–100", value: 2 },
            { label: "101–110", value: 1 },
            { label: "111–219", value: 0 },
            { label: "≥ 220", value: 3 }
          ],
          default: 0
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia cardíaca (lpm)",
          dropdown: true,
          options: [
            { label: "≤ 40", value: 3 },
            { label: "41–50", value: 1 },
            { label: "51–90", value: 0 },
            { label: "91–110", value: 1 },
            { label: "111–130", value: 2 },
            { label: "≥ 131", value: 3 }
          ],
          default: 0
        },
        {
          id: "conciencia",
          type: "select",
          label: "Nivel de conciencia",
          options: [
            { label: "Alerta", value: 0 },
            { label: "Confusión nueva, responde a voz o dolor, o no responde", value: 3 }
          ]
        },
        {
          id: "temp",
          type: "select",
          label: "Temperatura (°C)",
          dropdown: true,
          options: [
            { label: "≤ 35", value: 3 },
            { label: "35,1–36", value: 1 },
            { label: "36,1–38", value: 0 },
            { label: "38,1–39", value: 1 },
            { label: "≥ 39,1", value: 2 }
          ],
          default: 0
        }
      ],
      compute: (v) => {
        var _a, _b;
        const esc2 = v.escala === 1;
        const spo2 = esc2 ? (_a = v.spo2b) != null ? _a : 0 : (_b = v.spo2a) != null ? _b : 0;
        const score = sum(v, ["fr", "oxigeno", "pas", "fc", "conciencia", "temp"]) + spo2;
        const parametros = [v.fr, v.oxigeno, v.pas, v.fc, v.conciencia, v.temp, spo2];
        const algunoTres = parametros.some((p) => p === 3);
        const banda = score >= 7 ? "alto" : score >= 5 || algunoTres ? "medio" : score >= 1 ? "bajo" : "muy bajo";
        return {
          main: String(score),
          mainUnit: "puntos (0–20)",
          secondary: `Riesgo ${banda}`,
          interpretation: banda === "alto" ? "Riesgo alto (≥ 7): valoración urgente por el equipo de cuidados críticos, monitorización continua y traslado a un nivel de cuidados superior." : banda === "medio" ? "Riesgo medio (5–6, o 3 puntos en un solo parámetro): valoración urgente por el médico responsable y monitorización al menos horaria." : banda === "bajo" ? "Riesgo bajo (1–4): valoración por enfermería y control de constantes cada 4–6 h." : "Riesgo muy bajo: control rutinario cada 12 h.",
          level: banda === "alto" ? "danger" : banda === "medio" ? "warn" : banda === "bajo" ? "info" : "ok",
          details: [
            esc2 ? "Escala 2: solo para pacientes con insuficiencia respiratoria hipercápnica confirmada y objetivo de saturación 88–92 % prescrito." : "Escala 1: objetivo de saturación habitual.",
            algunoTres && score < 5 ? "Alerta: hay un parámetro con 3 puntos, lo que eleva la respuesta a riesgo medio." : ""
          ].filter(Boolean)
        };
      },
      notes: [
        "NEWS2 no está validada en embarazadas, pacientes pediátricos ni en pacientes con limitación del esfuerzo terapéutico.",
        "La confusión de nueva aparición puntúa igual que la respuesta solo a la voz o al dolor."
      ],
      references: [
        "Royal College of Physicians. National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS. Londres, 2017."
      ]
    },
    {
      id: "braden",
      name: "Escala de Braden para el riesgo de úlceras por presión",
      shortName: "Braden",
      description: "Identifica a los pacientes con riesgo de desarrollar úlceras por presión.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "sensorial",
          type: "select",
          label: "Percepción sensorial",
          dropdown: true,
          options: escala2([
            [1, "Completamente limitada: no responde a estímulos dolorosos"],
            [2, "Muy limitada: solo responde a estímulos dolorosos"],
            [3, "Ligeramente limitada: responde a órdenes verbales, con alguna limitación"],
            [4, "Sin limitaciones: responde a órdenes verbales, sin déficit sensorial"]
          ]),
          default: 4
        },
        {
          id: "humedad",
          type: "select",
          label: "Exposición a la humedad",
          dropdown: true,
          options: escala2([
            [1, "Constantemente húmeda"],
            [2, "A menudo húmeda"],
            [3, "Ocasionalmente húmeda"],
            [4, "Raramente húmeda"]
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
            [1, "Completamente inmóvil"],
            [2, "Muy limitada"],
            [3, "Ligeramente limitada"],
            [4, "Sin limitaciones"]
          ]),
          default: 4
        },
        {
          id: "nutricion",
          type: "select",
          label: "Nutrición",
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
            [2, "Problema potencial: se mueve con dificultad o requiere ayuda mínima"],
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
          mainUnit: "puntos (6–23)",
          secondary: `Riesgo ${banda}`,
          interpretation: score <= 18 ? `Riesgo ${banda} de úlceras por presión: protocolo de prevención con cambios posturales programados, superficies especiales de manejo de la presión, cuidado de la piel y soporte nutricional.` : "Sin riesgo según la escala; reevaluar si cambia la situación clínica.",
          level: score <= 12 ? "danger" : score <= 14 ? "warn" : score <= 18 ? "info" : "ok"
        };
      },
      notes: [
        "≤ 9: riesgo muy alto · 10–12: alto · 13–14: moderado · 15–18: leve · ≥ 19: sin riesgo.",
        "En pacientes críticos suele adoptarse un umbral más conservador (≤ 16) por la mayor incidencia de lesiones."
      ],
      references: [
        "Bergstrom N, et al. The Braden Scale for Predicting Pressure Sore Risk. Nurs Res. 1987;36(4):205-10."
      ]
    },
    {
      id: "indice-choque-diastolico",
      name: "Índice de choque diastólico (DSI)",
      shortName: "DSI",
      description: "Evalúa el riesgo de shock séptico en pacientes con sepsis o sospecha de infección.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        { id: "fc", type: "number", label: "Frecuencia cardíaca", unit: "lpm", min: 20, max: 250 },
        { id: "pad", type: "number", label: "Presión arterial diastólica", unit: "mmHg", min: 10, max: 150 }
      ],
      compute: (v) => {
        const dsi = v.fc / v.pad;
        return {
          main: fmt(dsi, 2),
          interpretation: dsi >= 2.5 ? "DSI ≥ 2,5: se asocia a mayor mortalidad y a mayor probabilidad de necesitar vasopresores. Reevaluar la perfusión, el lactato y la respuesta a fluidos." : "DSI < 2,5: menor riesgo según este índice; continuar la reevaluación clínica.",
          level: dsi >= 2.5 ? "danger" : "ok",
          details: ["DSI = frecuencia cardíaca / presión arterial diastólica."]
        };
      },
      notes: ["La presión diastólica refleja el tono vascular; su descenso con taquicardia sugiere vasoplejia precoz."],
      references: [
        "Ospina-Tascón GA, et al. Diastolic shock index and clinical outcomes in patients with septic shock. Ann Intensive Care. 2020;10(1):41."
      ]
    },
    {
      id: "nutric",
      name: "Puntuación NUTRIC modificada (riesgo nutricional en el paciente crítico)",
      shortName: "NUTRIC",
      description: "Identifica a los pacientes críticos que más se benefician de una terapia nutricional intensiva.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 50 años", value: 0 },
            { label: "50–74 años", value: 1 },
            { label: "≥ 75 años", value: 2 }
          ]
        },
        {
          id: "apache",
          type: "select",
          label: "APACHE II",
          dropdown: true,
          options: [
            { label: "< 15", value: 0 },
            { label: "15–19", value: 1 },
            { label: "20–27", value: 2 },
            { label: "≥ 28", value: 3 }
          ]
        },
        {
          id: "sofa",
          type: "select",
          label: "SOFA",
          options: [
            { label: "< 6", value: 0 },
            { label: "6–9", value: 1 },
            { label: "≥ 10", value: 2 }
          ]
        },
        {
          id: "comorbilidades",
          type: "select",
          label: "Número de comorbilidades",
          options: [
            { label: "0–1", value: 0 },
            { label: "≥ 2", value: 1 }
          ]
        },
        {
          id: "dias",
          type: "select",
          label: "Días de hospitalización antes del ingreso en UCI",
          options: [
            { label: "0–< 1 día", value: 0 },
            { label: "≥ 1 día", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "apache", "sofa", "comorbilidades", "dias"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–9)",
          interpretation: score >= 5 ? "Riesgo nutricional alto (≥ 5): se benefician de una terapia nutricional precoz y agresiva, con vigilancia estrecha del aporte proteico-calórico." : "Riesgo nutricional bajo (0–4): menor probabilidad de beneficio de la nutrición agresiva; aplicar el soporte nutricional habitual.",
          level: score >= 5 ? "danger" : "ok"
        };
      },
      notes: ["Versión modificada (sin interleucina 6), que es la utilizada habitualmente en la práctica clínica."],
      references: [
        "Heyland DK, et al. Identifying critically ill patients who benefit the most from nutrition therapy: the development and initial validation of a novel risk assessment tool. Crit Care. 2011;15(6):R268."
      ]
    },
    {
      id: "must",
      name: "Herramienta universal de cribado de desnutrición (MUST)",
      shortName: "MUST",
      description: "Identifica a los adultos desnutridos o en riesgo de desnutrición.",
      category: CAT15,
      specialty: UCI2,
      inputs: [
        {
          id: "imc",
          type: "select",
          label: "Índice de masa corporal",
          options: [
            { label: "> 20 kg/m² (> 30 en obesidad)", value: 0 },
            { label: "18,5–20 kg/m²", value: 1 },
            { label: "< 18,5 kg/m²", value: 2 }
          ]
        },
        {
          id: "perdida",
          type: "select",
          label: "Pérdida de peso no intencionada en 3–6 meses",
          options: [
            { label: "< 5 %", value: 0 },
            { label: "5–10 %", value: 1 },
            { label: "> 10 %", value: 2 }
          ]
        },
        {
          id: "agudo",
          type: "boolean",
          label: "Enfermedad aguda con ausencia de ingesta prevista > 5 días",
          points: 2
        }
      ],
      compute: (v) => {
        const score = sum(v, ["imc", "perdida", "agudo"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–6)",
          interpretation: score >= 2 ? "Riesgo alto de desnutrición: valoración por nutrición, plan de tratamiento nutricional y monitorización de la ingesta." : score === 1 ? "Riesgo medio: registrar la ingesta durante 3 días y repetir el cribado." : "Riesgo bajo: repetir el cribado de forma periódica según el ámbito asistencial.",
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
      description: "Predice el riesgo de desnutrición en pacientes hospitalizados.",
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
            [1, "Leve: pérdida > 5 % en 3 meses, o ingesta del 50–75 % de lo habitual en la última semana"],
            [2, "Moderado: pérdida > 5 % en 2 meses, IMC 18,5–20,5 con estado general afectado, o ingesta del 25–50 %"],
            [3, "Grave: pérdida > 5 % en 1 mes (> 15 % en 3 meses), IMC < 18,5 con estado general afectado, o ingesta del 0–25 %"]
          ])
        },
        {
          id: "severidad",
          type: "select",
          label: "Gravedad de la enfermedad (aumento de los requerimientos)",
          dropdown: true,
          options: escala2([
            [0, "Requerimientos normales"],
            [1, "Leve: fractura de cadera, enfermedad crónica con complicaciones, cirrosis, EPOC, diálisis, oncológico"],
            [2, "Moderada: cirugía abdominal mayor, ictus, neumonía grave, neoplasia hematológica"],
            [3, "Grave: traumatismo craneal, trasplante de médula ósea, paciente crítico con APACHE II > 10"]
          ])
        },
        { id: "edad", type: "boolean", label: "Edad ≥ 70 años" }
      ],
      compute: (v) => {
        const score = sum(v, ["nutricional", "severidad", "edad"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–7)",
          interpretation: score >= 3 ? "Riesgo nutricional presente (≥ 3): iniciar un plan de soporte nutricional." : "Sin riesgo nutricional en este momento: repetir el cribado semanalmente durante el ingreso.",
          level: score >= 3 ? "danger" : "ok"
        };
      },
      notes: ["Todo paciente crítico ingresado en UCI tiene, por definición, una gravedad de al menos 3 puntos, por lo que suele considerarse en riesgo."],
      references: [
        "Kondrup J, et al. Nutritional risk screening (NRS 2002): a new method based on an analysis of controlled clinical trials. Clin Nutr. 2003;22(3):321-36."
      ]
    },
    {
      id: "aldrete",
      name: "Puntuación de Aldrete modificada",
      shortName: "Aldrete",
      description: "Evalúa si el paciente está en condiciones de recibir el alta de la unidad de recuperación postanestésica.",
      category: CAT15,
      specialty: [...UCI2, "Anestesiología"],
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
          label: "Respiración",
          dropdown: true,
          options: escala2([
            [2, "Respira profundamente y tose con facilidad"],
            [1, "Disnea o respiración limitada"],
            [0, "Apnea"]
          ]),
          default: 2
        },
        {
          id: "circulacion",
          type: "select",
          label: "Circulación",
          dropdown: true,
          options: escala2([
            [2, "Presión arterial ± 20 % del valor preanestésico"],
            [1, "Presión arterial ± 20–49 % del valor preanestésico"],
            [0, "Presión arterial ± 50 % o más del valor preanestésico"]
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
          label: "Saturación de oxígeno",
          dropdown: true,
          options: escala2([
            [2, "SpO₂ > 92 % respirando aire ambiente"],
            [1, "Necesita oxígeno para mantener SpO₂ > 90 %"],
            [0, "SpO₂ < 90 % incluso con oxígeno"]
          ]),
          default: 2
        }
      ],
      compute: (v) => {
        const score = sum(v, ["actividad", "respiracion", "circulacion", "conciencia", "saturacion"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          interpretation: score >= 9 ? "Puntuación ≥ 9: criterios de alta de la unidad de recuperación postanestésica cumplidos, siempre que no haya otros problemas (dolor no controlado, náuseas, sangrado, bloqueo residual)." : "Puntuación < 9: mantener en la unidad de recuperación con vigilancia y tratar la causa del déficit.",
          level: score >= 9 ? "ok" : "warn"
        };
      },
      references: [
        "Aldrete JA. The post-anesthesia recovery score revisited. J Clin Anesth. 1995;7(1):89-91."
      ]
    }
  ];

  // inurse-main/src/calculators/respiratorio-critico.ts
  var CAT16 = "Respiratorio crítico y ventilación";
  var UCI3 = ["Medicina Intensiva"];
  var escala3 = (items) => items.map(([value, label]) => ({ label: `${value} — ${label}`, value }));
  var respiratorioCritico = [
    {
      id: "horowitz",
      name: "Índice de Horowitz (relación PaO₂/FiO₂)",
      shortName: "PaO₂/FiO₂",
      description: "Evalúa la oxigenación y gradúa la gravedad de la insuficiencia respiratoria.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "pao2", type: "number", label: "PaO₂ arterial", unit: "mmHg", min: 20, max: 700 },
        { id: "fio2", type: "number", label: "FiO₂", unit: "%", min: 21, max: 100 }
      ],
      compute: (v) => {
        const pf = v.pao2 / (v.fio2 / 100);
        return {
          main: fmt(pf, 0),
          mainUnit: "mmHg",
          interpretation: pf > 300 ? "Oxigenación conservada (> 300)." : pf > 200 ? "Rango de SDRA leve (201–300) si se cumplen el resto de criterios de Berlín." : pf > 100 ? "Rango de SDRA moderado (101–200): considerar ventilación protectora y valorar decúbito prono." : "Rango de SDRA grave (≤ 100): ventilación protectora, decúbito prono y valorar bloqueo neuromuscular u oxigenación extracorpórea.",
          level: pf > 300 ? "ok" : pf > 200 ? "warn" : "danger"
        };
      },
      notes: [
        "Para clasificar el SDRA, la medición debe hacerse con PEEP o CPAP ≥ 5 cmH₂O.",
        "La relación depende de la PEEP y de la altitud; a gran altitud debe corregirse por la presión barométrica."
      ]
    },
    {
      id: "gradiente-aa",
      name: "Gradiente alveolo-arterial de oxígeno (A-a)",
      shortName: "Gradiente A-a",
      description: "Evalúa el grado de cortocircuito y de desequilibrio ventilación/perfusión en la hipoxemia.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 1, max: 110 },
        { id: "fio2", type: "number", label: "FiO₂", unit: "%", min: 21, max: 100 },
        { id: "pao2", type: "number", label: "PaO₂ arterial", unit: "mmHg", min: 20, max: 700 },
        { id: "paco2", type: "number", label: "PaCO₂ arterial", unit: "mmHg", min: 10, max: 150 },
        { id: "patm", type: "number", label: "Presión atmosférica", unit: "mmHg", min: 400, max: 800, step: 1 }
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
          interpretation: elevado ? "Gradiente A-a elevado para la edad: sugiere alteración del intercambio gaseoso — desequilibrio ventilación/perfusión (neumonía, EPOC, atelectasia), cortocircuito (SDRA, edema pulmonar) o alteración de la difusión. La embolia pulmonar también lo eleva." : "Gradiente A-a normal para la edad: si hay hipoxemia, orienta a hipoventilación (fármacos, enfermedad neuromuscular) o a baja presión inspirada de oxígeno (altitud).",
          level: elevado ? "warn" : "ok",
          details: [
            `PAO₂ (alveolar) = FiO₂ × (Patm − 47) − PaCO₂/0,8 = ${fmt(pAO2, 1)} mmHg.`,
            "Gradiente esperado ≈ (edad/4) + 4 respirando aire ambiente."
          ]
        };
      },
      notes: ["La estimación del gradiente esperado por la edad solo es válida respirando aire ambiente."]
    },
    {
      id: "berlin",
      name: "Criterios de Berlín para el síndrome de distrés respiratorio agudo",
      shortName: "Berlín (SDRA)",
      description: "Define y gradúa el síndrome de distrés respiratorio agudo.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        {
          id: "tiempo",
          type: "boolean",
          label: "Inicio en la última semana",
          description: "Aparición o empeoramiento de los síntomas respiratorios en los 7 días previos.",
          noPoints: true
        },
        {
          id: "imagen",
          type: "boolean",
          label: "Infiltrados bilaterales en la imagen torácica",
          description: "No explicables por derrame, atelectasia lobar/pulmonar o nódulos.",
          noPoints: true
        },
        {
          id: "origen",
          type: "boolean",
          label: "No explicable por insuficiencia cardíaca ni sobrecarga de volumen",
          description: "Si no hay factor de riesgo, se requiere una valoración objetiva (ecocardiograma) para excluir el edema hidrostático.",
          noPoints: true
        },
        {
          id: "peep",
          type: "boolean",
          label: "PEEP o CPAP ≥ 5 cmH₂O",
          noPoints: true
        },
        { id: "pao2", type: "number", label: "PaO₂", unit: "mmHg", min: 20, max: 700 },
        { id: "fio2", type: "number", label: "FiO₂", unit: "%", min: 21, max: 100 }
      ],
      compute: (v) => {
        const pf = v.pao2 / (v.fio2 / 100);
        const criterios = [v.tiempo, v.imagen, v.origen, v.peep].filter((x) => x === 1).length;
        const cumple = criterios === 4 && pf <= 300;
        const grado = pf <= 100 ? "grave" : pf <= 200 ? "moderado" : "leve";
        const mort = pf <= 100 ? "≈ 45 %" : pf <= 200 ? "≈ 32 %" : "≈ 27 %";
        if (!cumple)
          return {
            main: "No cumple criterios",
            secondary: fmt(pf, 0),
            secondaryLabel: "PaO₂/FiO₂",
            interpretation: pf > 300 ? `Faltan criterios: la relación PaO₂/FiO₂ (${fmt(pf, 0)}) es mayor de 300.` : `Faltan criterios clínicos (${criterios}/4 marcados). Los cuatro son necesarios además de la hipoxemia.`,
            level: "info"
          };
        return {
          main: `SDRA ${grado}`,
          mainUnit: `PaO₂/FiO₂ ${fmt(pf, 0)}`,
          secondary: mort,
          secondaryLabel: "mortalidad orientativa",
          interpretation: `Se cumplen los cuatro criterios de Berlín con hipoxemia en rango ${grado}. Ventilación protectora (volumen corriente 4–8 mL/kg de peso predicho, presión meseta < 30 cmH₂O), y en el SDRA moderado-grave valorar decúbito prono, bloqueo neuromuscular y, en casos refractarios, oxigenación por membrana extracorpórea.`,
          level: grado === "leve" ? "warn" : "danger"
        };
      },
      references: [
        "ARDS Definition Task Force; Ranieri VM, et al. Acute respiratory distress syndrome: the Berlin Definition. JAMA. 2012;307(23):2526-33."
      ]
    },
    {
      id: "indice-oxigenacion",
      name: "Índice de oxigenación (IO)",
      shortName: "Índice de oxigenación",
      description: "Gradúa la gravedad de la insuficiencia respiratoria teniendo en cuenta el soporte ventilatorio; ayuda a decidir la indicación de ECMO, sobre todo en pediatría.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "map", type: "number", label: "Presión media de la vía aérea", unit: "cmH₂O", min: 1, max: 60, step: 0.5 },
        { id: "fio2", type: "number", label: "FiO₂", unit: "%", min: 21, max: 100 },
        { id: "pao2", type: "number", label: "PaO₂", unit: "mmHg", min: 10, max: 700 }
      ],
      compute: (v) => {
        const io = v.map * v.fio2 / v.pao2;
        return {
          main: fmt(io, 1),
          interpretation: io < 4 ? "Índice bajo: insuficiencia respiratoria leve." : io < 8 ? "Insuficiencia respiratoria moderada." : io < 16 ? "Insuficiencia respiratoria grave: optimizar el soporte y valorar terapias de rescate." : "Insuficiencia respiratoria muy grave: en pediatría, un índice ≥ 16 mantenido suele considerarse criterio de valoración para ECMO (≥ 40 en los criterios clásicos neonatales).",
          level: io < 4 ? "ok" : io < 8 ? "warn" : "danger",
          details: ["IO = (presión media de la vía aérea × FiO₂ × 100) / PaO₂, con la FiO₂ expresada en porcentaje."]
        };
      },
      notes: ["Un índice más alto indica peor situación, a diferencia de la relación PaO₂/FiO₂."]
    },
    {
      id: "murray",
      name: "Puntuación de Murray de lesión pulmonar aguda",
      shortName: "Murray",
      description: "Estratifica la gravedad de la lesión pulmonar aguda; se usa en la selección de pacientes para ECMO.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        {
          id: "radiografia",
          type: "select",
          label: "Radiografía de tórax — cuadrantes con infiltrados alveolares",
          dropdown: true,
          options: escala3([
            [0, "Sin consolidación alveolar"],
            [1, "Consolidación en 1 cuadrante"],
            [2, "Consolidación en 2 cuadrantes"],
            [3, "Consolidación en 3 cuadrantes"],
            [4, "Consolidación en 4 cuadrantes"]
          ])
        },
        {
          id: "hipoxemia",
          type: "select",
          label: "Hipoxemia (PaO₂/FiO₂)",
          dropdown: true,
          options: escala3([
            [0, "≥ 300"],
            [1, "225–299"],
            [2, "175–224"],
            [3, "100–174"],
            [4, "< 100"]
          ])
        },
        {
          id: "peep",
          type: "select",
          label: "PEEP (cmH₂O)",
          dropdown: true,
          options: escala3([
            [0, "≤ 5"],
            [1, "6–8"],
            [2, "9–11"],
            [3, "12–14"],
            [4, "≥ 15"]
          ])
        },
        {
          id: "compliance",
          type: "select",
          label: "Distensibilidad pulmonar (mL/cmH₂O)",
          dropdown: true,
          options: escala3([
            [0, "≥ 80"],
            [1, "60–79"],
            [2, "40–59"],
            [3, "20–39"],
            [4, "≤ 19"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["radiografia", "hipoxemia", "peep", "compliance"]) / 4;
        return {
          main: fmt(score, 2),
          mainUnit: "puntos (0–4)",
          interpretation: score === 0 ? "Sin lesión pulmonar." : score <= 2.5 ? "Lesión pulmonar leve-moderada." : "Lesión pulmonar grave (> 2,5): en el ensayo CESAR, una puntuación > 3 fue criterio de derivación para valorar ECMO.",
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
      name: "Puntuación MACOCHA de intubación difícil en la UCI",
      shortName: "MACOCHA",
      description: "Predice la dificultad de intubación en el paciente crítico.",
      category: CAT16,
      specialty: [...UCI3, "Anestesiología"],
      inputs: [
        { id: "mallampati", type: "boolean", label: "Mallampati III o IV (M)", points: 5 },
        { id: "apnea", type: "boolean", label: "Síndrome de apnea obstructiva del sueño (A)", points: 2 },
        { id: "cervical", type: "boolean", label: "Movilidad cervical reducida (C)", points: 1 },
        { id: "apertura", type: "boolean", label: "Apertura bucal < 3 cm (O)", points: 1 },
        { id: "coma", type: "boolean", label: "Coma (C)", points: 1 },
        { id: "hipoxemia", type: "boolean", label: "Hipoxemia grave, SpO₂ < 80 % (H)", points: 1 },
        { id: "noAnestesista", type: "boolean", label: "Operador no anestesiólogo (A)", points: 1 }
      ],
      compute: (v) => {
        const score = sum(v, ["mallampati", "apnea", "cervical", "apertura", "coma", "hipoxemia", "noAnestesista"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–12)",
          interpretation: score >= 3 ? "MACOCHA ≥ 3: riesgo elevado de intubación difícil. Preparar plan alternativo, preoxigenación optimizada (ventilación no invasiva u oxígeno de alto flujo), presencia del operador más experto y material de rescate disponible." : "MACOCHA < 3: baja probabilidad de intubación difícil, aunque el paciente crítico siempre exige preparación completa (valor predictivo negativo alto, positivo bajo).",
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
      description: "Estima la profundidad de fijación del tubo endotraqueal y el volumen corriente según el peso corporal predicho.",
      category: CAT16,
      specialty: [...UCI3, "Anestesiología"],
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Varón", value: 0 },
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
            { label: "6 mL/kg (ventilación protectora)", value: 6 },
            { label: "8 mL/kg (pulmón sano)", value: 8 }
          ],
          default: 6
        }
      ],
      compute: (v) => {
        var _a;
        const pulgadas = v.talla / 2.54;
        const pcp = v.sexo === 1 ? 45.5 + 2.3 * (pulgadas - 60) : 50 + 2.3 * (pulgadas - 60);
        const vt = pcp * ((_a = v.mlkg) != null ? _a : 6);
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
            "Profundidad orientativa: 23 cm en varones y 21 cm en mujeres; también puede estimarse como 3 × el diámetro interno del tubo.",
            "Confirmar siempre la posición con auscultación, capnografía y radiografía de tórax (punta 3–5 cm sobre la carina)."
          ]
        };
      },
      references: [
        "The Acute Respiratory Distress Syndrome Network. Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury and ARDS. N Engl J Med. 2000;342(18):1301-8."
      ]
    },
    {
      id: "curb65",
      name: "Puntuación CURB-65 para la neumonía adquirida en la comunidad",
      shortName: "CURB-65",
      description: "Estima la mortalidad de la neumonía adquirida en la comunidad y orienta la decisión de ingreso.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "confusion", type: "boolean", label: "Confusión (C)", description: "Desorientación en tiempo, espacio o persona, de nueva aparición." },
        { id: "urea", type: "boolean", label: "Urea > 42 mg/dL (BUN > 19 mg/dL) (U)" },
        { id: "fr", type: "boolean", label: "Frecuencia respiratoria ≥ 30 rpm (R)" },
        { id: "pa", type: "boolean", label: "PA sistólica < 90 mmHg o diastólica ≤ 60 mmHg (B)" },
        { id: "edad", type: "boolean", label: "Edad ≥ 65 años" }
      ],
      compute: (v) => {
        const score = sum(v, ["confusion", "urea", "fr", "pa", "edad"]);
        const mort = ["0,6 %", "2,7 %", "6,8 %", "14 %", "27,8 %", "27,8 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–5)",
          secondary: mort,
          secondaryLabel: "mortalidad a 30 días",
          interpretation: score <= 1 ? "Riesgo bajo: habitualmente tratamiento ambulatorio." : score === 2 ? "Riesgo intermedio: valorar ingreso hospitalario o unidad de corta estancia." : "Riesgo alto (≥ 3): ingreso hospitalario; con 4–5 puntos, valorar unidad de cuidados intensivos.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      notes: ["La decisión de ingreso debe integrar también la comorbilidad, la oxigenación y el contexto social."],
      references: [
        "Lim WS, et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study. Thorax. 2003;58(5):377-82."
      ]
    },
    {
      id: "crb65",
      name: "Puntuación CRB-65 para la neumonía adquirida en la comunidad",
      shortName: "CRB-65",
      description: "Clasifica la gravedad de la neumonía sin necesidad de pruebas de laboratorio (útil en atención primaria).",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "confusion", type: "boolean", label: "Confusión (C)" },
        { id: "fr", type: "boolean", label: "Frecuencia respiratoria ≥ 30 rpm (R)" },
        { id: "pa", type: "boolean", label: "PA sistólica < 90 mmHg o diastólica ≤ 60 mmHg (B)" },
        { id: "edad", type: "boolean", label: "Edad ≥ 65 años" }
      ],
      compute: (v) => {
        const score = sum(v, ["confusion", "fr", "pa", "edad"]);
        const mort = ["0,9 %", "5,2 %", "12 %", "31,2 %", "31,2 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–4)",
          secondary: mort,
          secondaryLabel: "mortalidad a 30 días",
          interpretation: score === 0 ? "Riesgo bajo: tratamiento ambulatorio razonable." : score <= 2 ? "Riesgo intermedio: valorar derivación hospitalaria." : "Riesgo alto: derivación hospitalaria urgente.",
          level: score === 0 ? "ok" : score <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Lim WS, et al. Defining community acquired pneumonia severity on presentation to hospital. Thorax. 2003;58(5):377-82."
      ]
    },
    {
      id: "bap65",
      name: "Puntuación BAP-65 para la exacerbación aguda de la EPOC",
      shortName: "BAP-65",
      description: "Predice la mortalidad y la necesidad de ventilación mecánica en la exacerbación de la EPOC.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "bun", type: "boolean", label: "BUN ≥ 25 mg/dL (urea ≥ 53 mg/dL) (B)" },
        { id: "mental", type: "boolean", label: "Alteración del estado mental (A)" },
        { id: "pulso", type: "boolean", label: "Frecuencia cardíaca ≥ 109 lpm (P)" },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 65 años", value: 0 },
            { label: "≥ 65 años", value: 1 }
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
        const mort = ["", "≈ 0,3 %", "≈ 1,0 %", "≈ 2,2 %", "≈ 6,4 %", "≈ 14,1 %"][clase];
        const vm = ["", "≈ 0,9 %", "≈ 1,9 %", "≈ 4,7 %", "≈ 14,3 %", "≈ 29,4 %"][clase];
        return {
          main: `Clase ${clase}`,
          mainUnit: `${puntos} de 3 criterios`,
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria",
          interpretation: clase <= 2 ? "Riesgo bajo: manejo en planta convencional." : clase === 3 ? "Riesgo intermedio: vigilancia estrecha." : `Riesgo alto: valorar unidad de cuidados intermedios o intensivos. Necesidad de ventilación mecánica ${vm}.`,
          level: clase <= 2 ? "ok" : clase === 3 ? "warn" : "danger"
        };
      },
      notes: ["La clase 1 corresponde a menores de 65 años sin ningún criterio; la clase 2, a mayores de 65 sin criterios."],
      references: [
        "Shorr AF, et al. Validation of a novel risk score for severity of illness in acute exacerbations of COPD. Chest. 2011;140(5):1177-83."
      ]
    },
    {
      id: "decaf",
      name: "Puntuación DECAF para la exacerbación aguda de la EPOC",
      shortName: "DECAF",
      description: "Predice la mortalidad hospitalaria en la exacerbación aguda de la EPOC.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        {
          id: "disnea",
          type: "select",
          label: "Disnea basal (eMRCD) (D)",
          dropdown: true,
          options: [
            { label: "eMRCD 1–4 (no limitado a domicilio)", value: 0 },
            { label: "eMRCD 5a: limitado a domicilio, autónomo para lavarse y vestirse", value: 1 },
            { label: "eMRCD 5b: limitado a domicilio, no autónomo para lavarse ni vestirse", value: 2 }
          ]
        },
        { id: "eosinopenia", type: "boolean", label: "Eosinopenia < 0,05 ×10⁹/L (E)" },
        { id: "consolidacion", type: "boolean", label: "Consolidación radiológica (C)" },
        { id: "acidemia", type: "boolean", label: "Acidemia (pH < 7,30) (A)" },
        { id: "fibrilacion", type: "boolean", label: "Fibrilación auricular (F)" }
      ],
      compute: (v) => {
        const score = sum(v, ["disnea", "eosinopenia", "consolidacion", "acidemia", "fibrilacion"]);
        const mort = ["1,0 %", "1,4 %", "5,4 %", "15,3 %", "31,0 %", "40,5 %", "50,0 %"][Math.min(score, 6)];
        return {
          main: String(score),
          mainUnit: "puntos (0–6)",
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria",
          interpretation: score <= 1 ? "Riesgo bajo: puede valorarse el manejo ambulatorio u hospitalización domiciliaria en casos seleccionados." : score === 2 ? "Riesgo intermedio: ingreso convencional con vigilancia." : "Riesgo alto (≥ 3): considerar cuidados intermedios o intensivos y anticipar decisiones sobre el techo terapéutico.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      references: [
        "Steer J, et al. The DECAF Score: predicting hospital mortality in exacerbations of chronic obstructive pulmonary disease. Thorax. 2012;67(11):970-6."
      ]
    },
    {
      id: "bode",
      name: "Índice BODE para la supervivencia en la EPOC",
      shortName: "BODE",
      description: "Predice la supervivencia a 4 años en pacientes con EPOC.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        {
          id: "imc",
          type: "select",
          label: "Índice de masa corporal (B)",
          options: [
            { label: "> 21 kg/m²", value: 0 },
            { label: "≤ 21 kg/m²", value: 1 }
          ]
        },
        {
          id: "fev1",
          type: "select",
          label: "FEV₁ posbroncodilatador (% del teórico) (O)",
          dropdown: true,
          options: [
            { label: "≥ 65 %", value: 0 },
            { label: "50–64 %", value: 1 },
            { label: "36–49 %", value: 2 },
            { label: "≤ 35 %", value: 3 }
          ]
        },
        {
          id: "disnea",
          type: "select",
          label: "Disnea (escala mMRC) (D)",
          dropdown: true,
          options: [
            { label: "mMRC 0–1", value: 0 },
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
            { label: "≥ 350 m", value: 0 },
            { label: "250–349 m", value: 1 },
            { label: "150–249 m", value: 2 },
            { label: "≤ 149 m", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["imc", "fev1", "disnea", "marcha"]);
        const cuartil = score <= 2 ? 1 : score <= 4 ? 2 : score <= 6 ? 3 : 4;
        const superv = ["", "80 %", "67 %", "57 %", "18 %"][cuartil];
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          secondary: superv,
          secondaryLabel: "supervivencia aproximada a 4 años",
          interpretation: `Cuartil ${cuartil}. ${cuartil >= 3 ? "Mortalidad elevada: optimizar el tratamiento, la rehabilitación respiratoria y la planificación anticipada de cuidados; valorar trasplante en casos seleccionados." : "Pronóstico relativamente favorable; mantener el tratamiento optimizado y la rehabilitación."}`,
          level: cuartil <= 2 ? "ok" : cuartil === 3 ? "warn" : "danger"
        };
      },
      references: [
        "Celli BR, et al. The body-mass index, airflow obstruction, dyspnea, and exercise capacity index in chronic obstructive pulmonary disease. N Engl J Med. 2004;350(10):1005-12."
      ]
    },
    {
      id: "cat-epoc",
      name: "Prueba de evaluación de la EPOC (CAT)",
      shortName: "CAT",
      description: "Cuantifica el impacto de los síntomas de la EPOC en la calidad de vida.",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        { id: "tos", type: "number", label: "Tos (0 = nunca toso · 5 = toso siempre)", min: 0, max: 5, step: 1 },
        { id: "flema", type: "number", label: "Flema (0 = sin flemas · 5 = lleno de flemas)", min: 0, max: 5, step: 1 },
        { id: "opresion", type: "number", label: "Opresión torácica (0 = ninguna · 5 = mucha)", min: 0, max: 5, step: 1 },
        { id: "cuesta", type: "number", label: "Disnea al subir una cuesta o un piso (0 = ninguna · 5 = mucha)", min: 0, max: 5, step: 1 },
        { id: "actividades", type: "number", label: "Limitación de actividades domésticas (0 = ninguna · 5 = mucha)", min: 0, max: 5, step: 1 },
        { id: "salir", type: "number", label: "Seguridad al salir de casa (0 = total · 5 = ninguna)", min: 0, max: 5, step: 1 },
        { id: "dormir", type: "number", label: "Sueño (0 = duermo bien · 5 = no duermo bien)", min: 0, max: 5, step: 1 },
        { id: "energia", type: "number", label: "Energía (0 = mucha · 5 = ninguna)", min: 0, max: 5, step: 1 }
      ],
      compute: (v) => {
        const ids = ["tos", "flema", "opresion", "cuesta", "actividades", "salir", "dormir", "energia"];
        if (ids.some((id) => {
          var _a, _b;
          return ((_a = v[id]) != null ? _a : 0) < 0 || ((_b = v[id]) != null ? _b : 0) > 5;
        }))
          return { main: "—", interpretation: "Cada ítem debe puntuarse entre 0 y 5.", level: "warn" };
        const score = sum(v, ids);
        const impacto = score < 10 ? "bajo" : score < 20 ? "medio" : score < 30 ? "alto" : "muy alto";
        return {
          main: String(score),
          mainUnit: "puntos (0–40)",
          secondary: `Impacto ${impacto}`,
          interpretation: score < 10 ? "Impacto bajo: la EPOC apenas limita la vida diaria." : score < 20 ? "Impacto medio: la EPOC es uno de los problemas más importantes del paciente." : "Impacto alto o muy alto: la EPOC condiciona de forma importante la vida diaria; optimizar el tratamiento y valorar rehabilitación respiratoria.",
          level: score < 10 ? "ok" : score < 20 ? "warn" : "danger",
          details: ["Un CAT ≥ 10 se usa como umbral de «más síntomas» en la clasificación GOLD.", "Una diferencia de 2 puntos se considera clínicamente relevante."]
        };
      },
      references: [
        "Jones PW, et al. Development and first validation of the COPD Assessment Test. Eur Respir J. 2009;34(3):648-54."
      ]
    },
    {
      id: "gold",
      name: "Clasificación GOLD de la EPOC",
      shortName: "GOLD",
      description: "Clasifica la EPOC por grado de obstrucción y por grupo de síntomas y exacerbaciones (revisión GOLD 2023).",
      category: CAT16,
      specialty: UCI3,
      inputs: [
        {
          id: "fev1",
          type: "select",
          label: "FEV₁ posbroncodilatador (% del teórico)",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "GOLD 1 — leve: FEV₁ ≥ 80 %", value: 1 },
            { label: "GOLD 2 — moderada: FEV₁ 50–79 %", value: 2 },
            { label: "GOLD 3 — grave: FEV₁ 30–49 %", value: 3 },
            { label: "GOLD 4 — muy grave: FEV₁ < 30 %", value: 4 }
          ]
        },
        {
          id: "sintomas",
          type: "select",
          label: "Carga sintomática",
          noPoints: true,
          options: [
            { label: "Pocos síntomas (mMRC 0–1 o CAT < 10)", value: 0 },
            { label: "Más síntomas (mMRC ≥ 2 o CAT ≥ 10)", value: 1 }
          ]
        },
        {
          id: "exacerbaciones",
          type: "select",
          label: "Exacerbaciones en el último año",
          noPoints: true,
          options: [
            { label: "0 o 1 sin ingreso", value: 0 },
            { label: "≥ 2 moderadas, o ≥ 1 con ingreso hospitalario", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        var _a, _b;
        const grupo = v.exacerbaciones === 1 ? "E" : v.sintomas === 1 ? "B" : "A";
        const tratamiento = grupo === "A" ? "Un broncodilatador (de acción corta o larga según los síntomas)." : grupo === "B" ? "Doble broncodilatación LABA + LAMA." : "LABA + LAMA; añadir corticoide inhalado si los eosinófilos son ≥ 300/µL (o ≥ 100/µL con exacerbaciones frecuentes).";
        return {
          main: `GOLD ${(_a = v.fev1) != null ? _a : 1} · Grupo ${grupo}`,
          interpretation: `Obstrucción de grado ${(_b = v.fev1) != null ? _b : 1} y grupo ${grupo} por síntomas y exacerbaciones. Tratamiento inicial recomendado: ${tratamiento} Añadir siempre deshabituación tabáquica, vacunación, rehabilitación respiratoria y revisión de la técnica inhalatoria.`,
          level: grupo === "E" ? "danger" : grupo === "B" ? "warn" : "ok"
        };
      },
      notes: [
        "Desde GOLD 2023 los antiguos grupos C y D se fusionan en el grupo E (exacerbadores), independientemente de la carga sintomática.",
        "El diagnóstico requiere una relación FEV₁/FVC posbroncodilatador < 0,70."
      ],
      references: [
        "Global Initiative for Chronic Obstructive Lung Disease. Global Strategy for the Diagnosis, Management, and Prevention of COPD, informe 2023."
      ]
    }
  ];

  // inurse-main/src/calculators/renal-metabolico.ts
  var CAT17 = "Renal, iones y equilibrio ácido-base";
  var UCI4 = ["Medicina Intensiva"];
  var renalMetabolico = [
    {
      id: "gasometria",
      name: "Analizador de gasometría arterial",
      shortName: "Gasometría",
      description: "Interpreta el trastorno ácido-base primario, la compensación esperada y el anión gap.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "ph", type: "number", label: "pH", min: 6.5, max: 8, step: 0.01 },
        { id: "paco2", type: "number", label: "PaCO₂", unit: "mmHg", min: 5, max: 150, step: 0.1 },
        { id: "hco3", type: "number", label: "Bicarbonato (HCO₃⁻)", unit: "mEq/L", min: 1, max: 60, step: 0.1 },
        { id: "na", type: "number", label: "Sodio", unit: "mEq/L", min: 90, max: 200, step: 0.1 },
        { id: "cl", type: "number", label: "Cloro", unit: "mEq/L", min: 50, max: 160, step: 0.1 },
        { id: "albumina", type: "number", label: "Albúmina", unit: "g/dL", min: 0.5, max: 7, step: 0.1 }
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
          primario = Math.abs(paco2 - 40) > 8 || Math.abs(hco3 - 24) > 4 ? "pH normal con alteraciones de PaCO₂ o bicarbonato: sugiere un trastorno mixto o completamente compensado" : "Equilibrio ácido-base normal";
          level = Math.abs(paco2 - 40) > 8 || Math.abs(hco3 - 24) > 4 ? "warn" : "ok";
        } else if (acidemia) {
          if (hco3 < 22) {
            primario = "Acidosis metabólica";
            const esperado = 1.5 * hco3 + 8;
            detalles.push(
              `Compensación esperada (Winter): PaCO₂ = ${fmt(esperado - 2, 0)}–${fmt(esperado + 2, 0)} mmHg. Medida: ${fmt(paco2, 0)}.`
            );
            if (paco2 > esperado + 2) detalles.push("PaCO₂ mayor de lo esperado: acidosis respiratoria añadida.");
            else if (paco2 < esperado - 2) detalles.push("PaCO₂ menor de lo esperado: alcalosis respiratoria añadida.");
            else detalles.push("Compensación respiratoria adecuada.");
          } else {
            primario = "Acidosis respiratoria";
            const agudo = 24 + (paco2 - 40) / 10;
            const cronico = 24 + 3.5 * (paco2 - 40) / 10;
            detalles.push(
              `Bicarbonato esperado: ${fmt(agudo, 1)} mEq/L si es aguda y ${fmt(cronico, 1)} si es crónica. Medido: ${fmt(hco3, 1)}.`
            );
          }
          level = ph < 7.2 ? "danger" : "warn";
        } else {
          if (hco3 > 26) {
            primario = "Alcalosis metabólica";
            const esperado = 40 + 0.7 * (hco3 - 24);
            detalles.push(`PaCO₂ esperada: ≈ ${fmt(esperado, 0)} mmHg. Medida: ${fmt(paco2, 0)}.`);
          } else {
            primario = "Alcalosis respiratoria";
            const agudo = 24 - 2 * (40 - paco2) / 10;
            const cronico = 24 - 5 * (40 - paco2) / 10;
            detalles.push(
              `Bicarbonato esperado: ${fmt(agudo, 1)} mEq/L si es aguda y ${fmt(cronico, 1)} si es crónica. Medido: ${fmt(hco3, 1)}.`
            );
          }
          level = ph > 7.6 ? "danger" : "warn";
        }
        detalles.push(`Anión gap: ${fmt(ag, 1)} mEq/L · corregido por albúmina: ${fmt(agCorr, 1)} mEq/L (normal 8–12).`);
        if (agCorr > 12) {
          detalles.push(
            "Anión gap elevado: valorar cetoacidosis, acidosis láctica, insuficiencia renal o tóxicos (metanol, etilenglicol, salicilatos)."
          );
          if (hco3 < 22) {
            const delta = (agCorr - 12) / (24 - hco3);
            detalles.push(
              `Cociente delta-delta: ${fmt(delta, 2)} — ${delta < 0.4 ? "sugiere acidosis metabólica hiperclorémica pura" : delta < 1 ? "sugiere acidosis con anión gap elevado y acidosis hiperclorémica asociadas" : delta <= 2 ? "acidosis con anión gap elevado aislada" : "sugiere alcalosis metabólica concomitante o acidosis respiratoria crónica previa"}.`
            );
          }
        } else if (hco3 < 22 && ph < 7.35) {
          detalles.push("Anión gap normal: valorar pérdidas digestivas de bicarbonato, acidosis tubular renal o exceso de suero salino.");
        }
        return {
          main: primario,
          secondary: fmt(ph, 2),
          secondaryLabel: "pH",
          interpretation: "Interpretación automática orientativa: confirmar siempre con la situación clínica, el lactato y el resto de la analítica.",
          level,
          details: detalles
        };
      },
      notes: [
        "El anión gap debe corregirse por la albúmina: por cada 1 g/dL de descenso, sumar 2,5 mEq/L.",
        "La fórmula de Winter estima la compensación respiratoria en la acidosis metabólica."
      ]
    },
    {
      id: "mdrd",
      name: "Filtrado glomerular estimado (MDRD)",
      shortName: "MDRD",
      description: "Estima el filtrado glomerular en la enfermedad renal crónica.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "creatinina", type: "number", label: "Creatinina sérica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 },
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 18, max: 110 },
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Varón", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const fge = 175 * Math.pow(v.creatinina, -1.154) * Math.pow(v.edad, -0.203) * (v.sexo === 1 ? 0.742 : 1);
        const estadio = fge >= 90 ? "G1" : fge >= 60 ? "G2" : fge >= 45 ? "G3a" : fge >= 30 ? "G3b" : fge >= 15 ? "G4" : "G5";
        return {
          main: fmt(fge, 1),
          mainUnit: "mL/min/1,73 m²",
          secondary: estadio,
          secondaryLabel: "estadio KDIGO",
          interpretation: fge >= 60 ? "Filtrado conservado o levemente reducido. El estadio G1–G2 solo indica enfermedad renal crónica si hay además daño renal (albuminuria, alteraciones estructurales)." : fge >= 30 ? "Reducción moderada del filtrado: ajustar fármacos, evitar nefrotóxicos y controlar las complicaciones." : fge >= 15 ? "Reducción grave: preparar el tratamiento sustitutivo y seguimiento por nefrología." : "Fallo renal: valorar terapia renal sustitutiva.",
          level: fge >= 60 ? "ok" : fge >= 30 ? "warn" : "danger",
          details: ["Ecuación MDRD-4 IDMS. Las guías actuales prefieren CKD-EPI, más precisa con filtrados altos."]
        };
      },
      notes: [
        "No es válida en la insuficiencia renal aguda, en el embarazo ni en situaciones de masa muscular extrema.",
        "Se ha eliminado el coeficiente por raza de las ecuaciones actuales."
      ],
      references: [
        "Levey AS, et al. A more accurate method to estimate glomerular filtration rate from serum creatinine. Ann Intern Med. 1999;130(6):461-70."
      ]
    },
    {
      id: "fena",
      name: "Excreción fraccionada de sodio (FENa)",
      shortName: "FENa",
      description: "Diferencia la insuficiencia renal prerrenal de la lesión renal intrínseca.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "naOrina", type: "number", label: "Sodio en orina", unit: "mEq/L", min: 0.1, max: 300, step: 0.1 },
        { id: "naPlasma", type: "number", label: "Sodio plasmático", unit: "mEq/L", min: 90, max: 200, step: 0.1 },
        { id: "crOrina", type: "number", label: "Creatinina en orina", unit: "mg/dL", min: 1, max: 500, step: 0.1 },
        { id: "crPlasma", type: "number", label: "Creatinina plasmática", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 }
      ],
      compute: (v) => {
        const fena = v.naOrina * v.crPlasma / (v.naPlasma * v.crOrina) * 100;
        return {
          main: fmt(fena, 2),
          mainUnit: "%",
          interpretation: fena < 1 ? "FENa < 1 %: sugiere causa prerrenal (hipovolemia, bajo gasto, síndrome hepatorrenal). También puede verse en la glomerulonefritis aguda, la nefropatía por contraste y la obstrucción precoz." : fena > 2 ? "FENa > 2 %: sugiere lesión renal intrínseca, típicamente necrosis tubular aguda." : "FENa entre 1 y 2 %: zona indeterminada; interpretar con la clínica y la respuesta a fluidos.",
          level: fena < 1 ? "info" : fena > 2 ? "warn" : "warn",
          details: ["FENa = (Na orina × creatinina plasma) / (Na plasma × creatinina orina) × 100."]
        };
      },
      notes: ["No es interpretable si el paciente ha recibido diuréticos: en ese caso usar la excreción fraccionada de urea."]
    },
    {
      id: "feurea",
      name: "Excreción fraccionada de urea (FEUrea)",
      shortName: "FEUrea",
      description: "Diferencia la azotemia prerrenal de la necrosis tubular aguda; utilizable en pacientes que reciben diuréticos.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "ureaOrina", type: "number", label: "Urea en orina", unit: "mg/dL", min: 1, max: 5e3, step: 1 },
        { id: "ureaPlasma", type: "number", label: "Urea plasmática", unit: "mg/dL", min: 1, max: 500, step: 0.1 },
        { id: "crOrina", type: "number", label: "Creatinina en orina", unit: "mg/dL", min: 1, max: 500, step: 0.1 },
        { id: "crPlasma", type: "number", label: "Creatinina plasmática", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 }
      ],
      compute: (v) => {
        const fe = v.ureaOrina * v.crPlasma / (v.ureaPlasma * v.crOrina) * 100;
        return {
          main: fmt(fe, 1),
          mainUnit: "%",
          interpretation: fe < 35 ? "FEUrea < 35 %: sugiere azotemia prerrenal." : fe > 50 ? "FEUrea > 50 %: sugiere necrosis tubular aguda." : "Zona intermedia (35–50 %): interpretar junto con la clínica y la respuesta al tratamiento.",
          level: fe < 35 ? "info" : fe > 50 ? "warn" : "warn",
          details: ["FEUrea = (urea orina × creatinina plasma) / (urea plasma × creatinina orina) × 100."]
        };
      },
      notes: ["Si el laboratorio informa BUN en lugar de urea, puede usarse indistintamente siempre que ambas cifras estén en la misma unidad."]
    },
    {
      id: "akin",
      name: "Clasificación AKIN de la lesión renal aguda",
      shortName: "AKIN",
      description: "Gradúa la gravedad de la lesión renal aguda.",
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
            { label: "Aumento ≥ 0,3 mg/dL o de 1,5–2 veces el valor basal", value: 1 },
            { label: "Aumento de más de 2 a 3 veces el valor basal", value: 2 },
            { label: "Aumento de más de 3 veces, o creatinina ≥ 4 mg/dL con ascenso agudo ≥ 0,5, o necesidad de diálisis", value: 3 }
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
            { label: "< 0,5 mL/kg/h durante más de 6 h", value: 1 },
            { label: "< 0,5 mL/kg/h durante más de 12 h", value: 2 },
            { label: "< 0,3 mL/kg/h durante 24 h, o anuria durante 12 h", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        var _a, _b;
        const estadio = Math.max((_a = v.creatinina) != null ? _a : 0, (_b = v.diuresis) != null ? _b : 0);
        if (estadio === 0)
          return {
            main: "Sin lesión renal aguda",
            interpretation: "No se cumplen criterios AKIN en este momento. Reevaluar si cambia la situación clínica.",
            level: "ok"
          };
        return {
          main: `Estadio ${estadio}`,
          interpretation: estadio === 1 ? "Lesión renal aguda estadio 1: revisar la volemia, retirar nefrotóxicos, ajustar fármacos y monitorizar diuresis y creatinina." : estadio === 2 ? "Estadio 2: además de lo anterior, valoración por nefrología y vigilancia de complicaciones." : "Estadio 3: valorar terapia renal sustitutiva, especialmente ante hiperpotasemia refractaria, acidosis grave, sobrecarga de volumen o uremia sintomática.",
          level: estadio === 1 ? "warn" : "danger",
          details: ["Se asigna el estadio más alto de los dos criterios (creatinina o diuresis)."]
        };
      },
      notes: ["Los criterios exigen que el diagnóstico se haga en las primeras 48 h y tras optimizar el estado de volemia."],
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
        { id: "bun", type: "number", label: "BUN (nitrógeno ureico)", unit: "mg/dL", min: 1, max: 250, step: 0.1 },
        { id: "creatinina", type: "number", label: "Creatinina sérica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 }
      ],
      compute: (v) => {
        const ratio = v.bun / v.creatinina;
        return {
          main: fmt(ratio, 1),
          interpretation: ratio > 20 ? "Cociente > 20: sugiere causa prerrenal (hipovolemia, bajo gasto), hemorragia digestiva alta, dieta hiperproteica o corticoides." : ratio < 10 ? "Cociente < 10: sugiere lesión renal intrínseca, malnutrición, hepatopatía o rabdomiólisis." : "Cociente en rango habitual (10–20).",
          level: ratio > 20 || ratio < 10 ? "warn" : "ok",
          details: ["Si el laboratorio informa urea en lugar de BUN: BUN = urea / 2,14."]
        };
      }
    },
    {
      id: "deficit-agua-libre",
      name: "Déficit de agua libre en la hipernatremia",
      shortName: "Déficit de agua libre",
      description: "Calcula el agua libre necesaria para corregir la hipernatremia o la deshidratación.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        {
          id: "poblacion",
          type: "select",
          label: "Grupo de paciente (fracción de agua corporal)",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Varón adulto (0,6)", value: 0.6 },
            { label: "Mujer adulta (0,5)", value: 0.5 },
            { label: "Varón anciano (0,5)", value: 0.5001 },
            { label: "Mujer anciana (0,45)", value: 0.45 },
            { label: "Niño (0,6)", value: 0.6001 }
          ],
          default: 0.6
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 3, max: 300, step: 0.5 },
        { id: "naActual", type: "number", label: "Sodio actual", unit: "mEq/L", min: 120, max: 200, step: 0.1 },
        { id: "naObjetivo", type: "number", label: "Sodio objetivo", unit: "mEq/L", min: 120, max: 160, step: 0.1 }
      ],
      compute: (v) => {
        var _a;
        const acT = ((_a = v.poblacion) != null ? _a : 0.6) * v.peso;
        if (v.naActual <= v.naObjetivo)
          return {
            main: "—",
            interpretation: "El sodio actual debe ser mayor que el objetivo para calcular un déficit de agua libre.",
            level: "warn"
          };
        const deficit = acT * (v.naActual / v.naObjetivo - 1);
        const horas24 = (v.naActual - v.naObjetivo) / 0.5;
        return {
          main: fmt(deficit * 1e3, 0),
          mainUnit: "mL de agua libre",
          secondary: fmt(acT, 1),
          secondaryLabel: "agua corporal total (L)",
          interpretation: "Reponer de forma gradual, sin bajar el sodio más de 10–12 mEq/L al día (0,5 mEq/L por hora) para evitar el edema cerebral. Añadir a este déficit las pérdidas insensibles y las pérdidas en curso.",
          level: "info",
          details: [
            `Tiempo mínimo de corrección recomendado: ${fmt(horas24, 0)} h a un ritmo de 0,5 mEq/L por hora.`,
            "Déficit = agua corporal total × (sodio actual / sodio objetivo − 1)."
          ]
        };
      },
      notes: ["En la hipernatremia de instauración aguda (< 48 h) puede corregirse más rápido; en la crónica, nunca más de 10 mEq/L al día."]
    },
    {
      id: "deficit-bicarbonato",
      name: "Déficit de bicarbonato",
      shortName: "Déficit de bicarbonato",
      description: "Calcula el déficit corporal total de bicarbonato en la acidosis metabólica.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 3, max: 300, step: 0.5 },
        { id: "actual", type: "number", label: "Bicarbonato actual", unit: "mEq/L", min: 1, max: 40, step: 0.1 },
        { id: "objetivo", type: "number", label: "Bicarbonato objetivo", unit: "mEq/L", min: 5, max: 30, step: 0.1 },
        {
          id: "distribucion",
          type: "select",
          label: "Volumen de distribución",
          noPoints: true,
          options: [
            { label: "0,4 × peso (habitual)", value: 0.4 },
            { label: "0,5 × peso (acidosis grave)", value: 0.5 },
            { label: "0,6 × peso (acidosis muy grave)", value: 0.6 }
          ],
          default: 0.4
        }
      ],
      compute: (v) => {
        var _a;
        if (v.objetivo <= v.actual)
          return {
            main: "—",
            interpretation: "El bicarbonato objetivo debe ser mayor que el actual.",
            level: "warn"
          };
        const deficit = ((_a = v.distribucion) != null ? _a : 0.4) * v.peso * (v.objetivo - v.actual);
        return {
          main: fmt(deficit, 0),
          mainUnit: "mEq de bicarbonato",
          secondary: fmt(deficit / 2, 0),
          secondaryLabel: "mEq de la mitad de la dosis",
          interpretation: "Administrar como máximo la mitad del déficit calculado y reevaluar la gasometría: la corrección rápida puede provocar hipopotasemia, hipocalcemia, hipernatremia, sobrecarga de volumen, acidosis intracelular paradójica y desplazamiento de la curva de disociación de la hemoglobina.",
          level: "warn",
          details: [
            "Déficit = volumen de distribución × peso × (bicarbonato objetivo − actual).",
            "El bicarbonato no está indicado de forma sistemática en la acidosis láctica ni en la cetoacidosis diabética; lo prioritario es tratar la causa."
          ]
        };
      }
    },
    {
      id: "kt-v",
      name: "Kt/V para la adecuación de la hemodiálisis (Daugirdas)",
      shortName: "Kt/V",
      description: "Cuantifica la dosis de diálisis administrada en una sesión de hemodiálisis.",
      category: CAT17,
      specialty: UCI4,
      inputs: [
        { id: "preUrea", type: "number", label: "Urea (o BUN) antes de la sesión", unit: "mg/dL", min: 5, max: 400, step: 0.1 },
        { id: "postUrea", type: "number", label: "Urea (o BUN) después de la sesión", unit: "mg/dL", min: 1, max: 400, step: 0.1 },
        { id: "horas", type: "number", label: "Duración de la sesión", unit: "h", min: 0.5, max: 12, step: 0.25 },
        { id: "ufv", type: "number", label: "Volumen de ultrafiltración", unit: "L", min: 0, max: 10, step: 0.1 },
        { id: "peso", type: "number", label: "Peso posdiálisis", unit: "kg", min: 20, max: 250, step: 0.1 }
      ],
      compute: (v) => {
        const r = v.postUrea / v.preUrea;
        if (r >= 1)
          return {
            main: "—",
            interpretation: "La urea posdiálisis debe ser menor que la predialítica.",
            level: "warn"
          };
        const ktv = -Math.log(r - 8e-3 * v.horas) + (4 - 3.5 * r) * (v.ufv / v.peso);
        const urr = (1 - r) * 100;
        return {
          main: fmt(ktv, 2),
          mainUnit: "Kt/V",
          secondary: `${fmt(urr, 0)} %`,
          secondaryLabel: "tasa de reducción de urea (URR)",
          interpretation: ktv >= 1.2 ? "Dosis de diálisis adecuada (Kt/V ≥ 1,2 por sesión en pauta de tres sesiones semanales; objetivo habitual ≥ 1,4)." : "Dosis de diálisis insuficiente (< 1,2): revisar el tiempo de sesión, el flujo sanguíneo, el acceso vascular y el dializador.",
          level: ktv >= 1.2 ? "ok" : "danger",
          details: ["Fórmula de Daugirdas de segunda generación.", "La URR objetivo equivalente es ≥ 65 %."]
        };
      },
      references: [
        "Daugirdas JT. Second generation logarithmic estimates of single-pool variable volume Kt/V. J Am Soc Nephrol. 1993;4(5):1205-13."
      ]
    }
  ];

  // inurse-main/src/calculators/hepato-digestivo.ts
  var CAT18 = "Hepatología y digestivo";
  var UCI5 = ["Medicina Intensiva"];
  var escala4 = (items) => items.map(([value, label]) => ({ label: `${value} — ${label}`, value }));
  var hepatoDigestivo = [
    {
      id: "child-pugh",
      name: "Puntuación de Child-Pugh para la cirrosis",
      shortName: "Child-Pugh",
      description: "Estima la gravedad y el pronóstico de la cirrosis hepática.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        {
          id: "bilirrubina",
          type: "select",
          label: "Bilirrubina total (mg/dL)",
          options: [
            { label: "< 2", value: 1 },
            { label: "2–3", value: 2 },
            { label: "> 3", value: 3 }
          ]
        },
        {
          id: "albumina",
          type: "select",
          label: "Albúmina (g/dL)",
          options: [
            { label: "> 3,5", value: 1 },
            { label: "2,8–3,5", value: 2 },
            { label: "< 2,8", value: 3 }
          ]
        },
        {
          id: "inr",
          type: "select",
          label: "INR",
          options: [
            { label: "< 1,7", value: 1 },
            { label: "1,7–2,3", value: 2 },
            { label: "> 2,3", value: 3 }
          ]
        },
        {
          id: "ascitis",
          type: "select",
          label: "Ascitis",
          options: [
            { label: "Ausente", value: 1 },
            { label: "Leve, controlada con diuréticos", value: 2 },
            { label: "Moderada-grave, refractaria", value: 3 }
          ]
        },
        {
          id: "encefalopatia",
          type: "select",
          label: "Encefalopatía hepática",
          options: [
            { label: "Ausente", value: 1 },
            { label: "Grado I–II (o controlada con tratamiento)", value: 2 },
            { label: "Grado III–IV (o refractaria)", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["bilirrubina", "albumina", "inr", "ascitis", "encefalopatia"]);
        const clase = score <= 6 ? "A" : score <= 9 ? "B" : "C";
        const superv = clase === "A" ? "100 % / 85 %" : clase === "B" ? "81 % / 57 %" : "45 % / 35 %";
        return {
          main: String(score),
          mainUnit: `puntos (5–15) — clase ${clase}`,
          secondary: superv,
          secondaryLabel: "supervivencia a 1 y 2 años",
          interpretation: clase === "A" ? "Cirrosis compensada (clase A): buen pronóstico a corto plazo; cribado de varices y de hepatocarcinoma." : clase === "B" ? "Deterioro funcional significativo (clase B): valorar remisión a una unidad de trasplante y control estrecho de las complicaciones." : "Enfermedad hepática descompensada (clase C): pronóstico grave; valoración de trasplante y manejo intensivo de las complicaciones.",
          level: clase === "A" ? "ok" : clase === "B" ? "warn" : "danger"
        };
      },
      notes: [
        "La clase de Child-Pugh también predice el riesgo quirúrgico: la mortalidad perioperatoria en cirugía abdominal es aproximadamente del 10 % en la clase A, del 30 % en la B y del 70–80 % en la C.",
        "En la colangitis biliar primaria, los puntos de corte de bilirrubina son distintos (< 4, 4–10 y > 10 mg/dL)."
      ],
      references: [
        "Pugh RN, et al. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg. 1973;60(8):646-9."
      ]
    },
    {
      id: "meld",
      name: "Puntuación MELD y MELD-Na",
      shortName: "MELD / MELD-Na",
      description: "Cuantifica la gravedad de la hepatopatía terminal y prioriza en las listas de trasplante.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "bilirrubina", type: "number", label: "Bilirrubina total", unit: "mg/dL", min: 0.1, max: 60, step: 0.1 },
        { id: "inr", type: "number", label: "INR", min: 0.5, max: 20, step: 0.01 },
        { id: "creatinina", type: "number", label: "Creatinina sérica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 },
        { id: "sodio", type: "number", label: "Sodio sérico", unit: "mEq/L", min: 100, max: 175, step: 0.1 },
        {
          id: "dialisis",
          type: "boolean",
          label: "Diálisis ≥ 2 veces en la última semana o hemofiltración ≥ 24 h",
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
          mainUnit: "MELD-Na (6–40)",
          secondary: String(meld),
          secondaryLabel: "MELD sin sodio",
          interpretation: `Mortalidad estimada a 3 meses: ${mort}. ${meldNa >= 15 ? "Un MELD ≥ 15 es el umbral habitual a partir del cual el trasplante hepático aporta beneficio en supervivencia: remitir a una unidad de trasplante." : "Por debajo de 15, el riesgo del trasplante suele superar al beneficio; seguimiento y tratamiento de las complicaciones."}`,
          level: meldNa <= 9 ? "ok" : meldNa <= 19 ? "warn" : "danger",
          details: [
            "Todos los valores menores de 1,0 se elevan a 1,0; la creatinina se limita a un máximo de 4,0 mg/dL.",
            "La corrección por sodio solo se aplica si el MELD es mayor de 11."
          ]
        };
      },
      notes: [
        "Desde 2023 la UNOS emplea el MELD 3.0, que incorpora el sexo y la albúmina; aquí se muestra el MELD-Na clásico, todavía muy utilizado.",
        "No aplicable a menores de 12 años (usar PELD)."
      ],
      references: [
        "Kamath PS, et al. A model to predict survival in patients with end-stage liver disease. Hepatology. 2001;33(2):464-70.",
        "Kim WR, et al. Hyponatremia and mortality among patients on the liver-transplant waiting list. N Engl J Med. 2008;359(10):1018-26."
      ]
    },
    {
      id: "maddrey",
      name: "Función discriminante de Maddrey para la hepatitis alcohólica",
      shortName: "Maddrey",
      description: "Predice el pronóstico de la hepatitis alcohólica y orienta la indicación de corticoides.",
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
          interpretation: df >= 32 ? "Función discriminante ≥ 32: hepatitis alcohólica grave, con mortalidad a corto plazo del 30–50 % sin tratamiento. Se considera la indicación de corticoides (prednisolona 40 mg/día durante 28 días) si no hay contraindicación (infección activa, hemorragia digestiva, insuficiencia renal, pancreatitis)." : "Función discriminante < 32: hepatitis alcohólica no grave; no está indicado el tratamiento con corticoides. Abstinencia, soporte nutricional y tratamiento del síndrome de abstinencia.",
          level: df >= 32 ? "danger" : "ok",
          details: ["Función discriminante = 4,6 × (TP paciente − TP control) + bilirrubina."]
        };
      },
      references: [
        "Maddrey WC, et al. Corticosteroid therapy of alcoholic hepatitis. Gastroenterology. 1978;75(2):193-9."
      ]
    },
    {
      id: "glasgow-hepatitis",
      name: "Puntuación de Glasgow para la hepatitis alcohólica (GAHS)",
      shortName: "GAHS",
      description: "Predice la mortalidad en la hepatitis alcohólica.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 50 años", value: 1 },
            { label: "≥ 50 años", value: 2 }
          ]
        },
        {
          id: "leucocitos",
          type: "select",
          label: "Leucocitos (×10⁹/L)",
          options: [
            { label: "< 15", value: 1 },
            { label: "≥ 15", value: 2 }
          ]
        },
        {
          id: "urea",
          type: "select",
          label: "Urea (mg/dL)",
          options: [
            { label: "< 42 (BUN < 19,6)", value: 1 },
            { label: "≥ 42", value: 2 }
          ]
        },
        {
          id: "inr",
          type: "select",
          label: "INR",
          options: [
            { label: "< 1,5", value: 1 },
            { label: "1,5–2,0", value: 2 },
            { label: "> 2,0", value: 3 }
          ]
        },
        {
          id: "bilirrubina",
          type: "select",
          label: "Bilirrubina (mg/dL)",
          options: [
            { label: "< 7,3", value: 1 },
            { label: "7,3–14,6", value: 2 },
            { label: "> 14,6", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "leucocitos", "urea", "inr", "bilirrubina"]);
        return {
          main: String(score),
          mainUnit: "puntos (5–12)",
          interpretation: score >= 9 ? "GAHS ≥ 9: mortalidad elevada (supervivencia a 28 días ≈ 46 % sin tratamiento). Es el subgrupo que más se beneficia de los corticoides cuando la función discriminante de Maddrey también es ≥ 32." : "GAHS < 9: mejor pronóstico (supervivencia a 28 días ≈ 87 %); el beneficio de los corticoides es dudoso en este grupo.",
          level: score >= 9 ? "danger" : "ok"
        };
      },
      references: [
        "Forrest EH, et al. Analysis of factors predictive of mortality in alcoholic hepatitis and derivation and validation of the Glasgow alcoholic hepatitis score. Gut. 2005;54(8):1174-9."
      ]
    },
    {
      id: "lille",
      name: "Modelo de Lille para la hepatitis alcohólica",
      shortName: "Lille",
      description: "Evalúa a los 7 días la respuesta al tratamiento con corticoides en la hepatitis alcohólica.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 18, max: 100 },
        { id: "albumina", type: "number", label: "Albúmina al ingreso", unit: "g/L", min: 5, max: 60, step: 0.1 },
        { id: "bili0", type: "number", label: "Bilirrubina al ingreso", unit: "mg/dL", min: 0.1, max: 60, step: 0.1 },
        { id: "bili7", type: "number", label: "Bilirrubina el día 7", unit: "mg/dL", min: 0.1, max: 60, step: 0.1 },
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
          mainUnit: "índice de Lille (0–1)",
          secondary: noRespondedor ? "No respondedor" : "Respondedor",
          interpretation: noRespondedor ? "Índice ≥ 0,45: no respondedor a los corticoides (supervivencia a 6 meses ≈ 25 %). Se recomienda suspender el tratamiento y valorar alternativas, incluido el trasplante en casos muy seleccionados." : "Índice < 0,45: respondedor a los corticoides (supervivencia a 6 meses ≈ 85 %). Completar el ciclo de 28 días.",
          level: noRespondedor ? "danger" : "ok",
          details: [
            `Insuficiencia renal (creatinina > 1,3 mg/dL): ${insufRenal ? "sí" : "no"}.`,
            "Las bilirrubinas se convierten internamente a µmol/L (× 17,1)."
          ]
        };
      },
      notes: ["Se calcula tras 7 días de tratamiento con corticoides; no es aplicable antes."],
      references: [
        "Louvet A, et al. The Lille model: a new tool for therapeutic strategy in patients with severe alcoholic hepatitis treated with steroids. Hepatology. 2007;45(6):1348-54."
      ]
    },
    {
      id: "kings-college",
      name: "Criterios del King's College para la insuficiencia hepática aguda",
      shortName: "King's College",
      description: "Identifica a los pacientes con insuficiencia hepática aguda que deben remitirse con urgencia para trasplante.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        {
          id: "etiologia",
          type: "select",
          label: "Etiología",
          noPoints: true,
          options: [
            { label: "Paracetamol", value: 0 },
            { label: "No paracetamol", value: 1 }
          ]
        },
        { id: "ph", type: "boolean", label: "Paracetamol: pH arterial < 7,30 tras la reanimación con fluidos", noPoints: true },
        { id: "lactato", type: "boolean", label: "Paracetamol: lactato > 3,0 mmol/L tras reanimación", noPoints: true },
        { id: "triada", type: "boolean", label: "Paracetamol: INR > 6,5 Y creatinina > 3,4 mg/dL Y encefalopatía grado III–IV, en 24 h", noPoints: true },
        { id: "inrAlto", type: "boolean", label: "No paracetamol: INR > 6,5 (tiempo de protrombina > 100 s)", noPoints: true },
        {
          id: "menores",
          type: "select",
          label: "No paracetamol: número de criterios menores presentes",
          description: "Edad < 10 o > 40 años; etiología desfavorable (hepatitis no A no B, halotano, reacción idiosincrásica); ictericia > 7 días antes de la encefalopatía; INR > 3,5; bilirrubina > 17,5 mg/dL.",
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
        var _a;
        const paracetamol = v.etiologia === 0;
        const cumple = paracetamol ? v.ph === 1 || v.lactato === 1 || v.triada === 1 : v.inrAlto === 1 || ((_a = v.menores) != null ? _a : 0) >= 3;
        return {
          main: cumple ? "Criterios cumplidos" : "Criterios no cumplidos",
          interpretation: cumple ? "Se cumplen los criterios del King's College: mal pronóstico sin trasplante. Contactar de forma urgente con una unidad de trasplante hepático." : "No se cumplen los criterios en este momento, lo que no descarta la progresión: reevaluar de forma seriada y contactar precozmente con la unidad de trasplante si hay deterioro.",
          level: cumple ? "danger" : "warn",
          details: [
            paracetamol ? "Vía paracetamol: basta el pH < 7,30, o el lactato > 3,0 tras reanimación, o la tríada completa de INR, creatinina y encefalopatía." : "Vía no paracetamol: basta el INR > 6,5, o tres o más criterios menores."
          ]
        };
      },
      notes: ["Estos criterios tienen alta especificidad pero sensibilidad limitada: no deben retrasar la derivación de un paciente que empeora."],
      references: [
        "O'Grady JG, et al. Early indicators of prognosis in fulminant hepatic failure. Gastroenterology. 1989;97(2):439-45."
      ]
    },
    {
      id: "bisap",
      name: "Puntuación BISAP para la pancreatitis aguda",
      shortName: "BISAP",
      description: "Predice la mortalidad en la pancreatitis aguda en las primeras 24 horas.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "bun", type: "boolean", label: "BUN > 25 mg/dL (urea > 53 mg/dL) (B)" },
        { id: "mental", type: "boolean", label: "Alteración del estado mental (I)" },
        {
          id: "sirs",
          type: "boolean",
          label: "Síndrome de respuesta inflamatoria sistémica (S)",
          description: "≥ 2 de: temperatura < 36 o > 38 °C; FC > 90 lpm; FR > 20 rpm o PaCO₂ < 32 mmHg; leucocitos < 4.000 o > 12.000 o > 10 % de cayados."
        },
        { id: "edad", type: "boolean", label: "Edad > 60 años (A)" },
        { id: "derrame", type: "boolean", label: "Derrame pleural en la imagen (P)" }
      ],
      compute: (v) => {
        const score = sum(v, ["bun", "mental", "sirs", "edad", "derrame"]);
        const mort = ["< 1 %", "< 1 %", "1,6 %", "3,6 %", "7,4 %", "9,5 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–5)",
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria",
          interpretation: score <= 2 ? "Riesgo bajo de mortalidad: manejo convencional con hidratación, analgesia y nutrición precoz." : "Riesgo elevado (≥ 3): pancreatitis grave probable; valorar cuidados intermedios o intensivos, monitorización estrecha y reevaluación frecuente.",
          level: score <= 2 ? "ok" : "danger"
        };
      },
      references: [
        "Wu BU, et al. The early prediction of mortality in acute pancreatitis: a large population-based study. Gut. 2008;57(12):1698-703."
      ]
    },
    {
      id: "haps",
      name: "Puntuación HAPS de pancreatitis aguda leve",
      shortName: "HAPS",
      description: "Identifica en las primeras horas a los pacientes con pancreatitis aguda que tendrán un curso leve.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "peritoneo", type: "boolean", label: "Signos de irritación peritoneal (defensa o rebote)" },
        { id: "creatinina", type: "boolean", label: "Creatinina ≥ 2 mg/dL" },
        { id: "hematocrito", type: "boolean", label: "Hematocrito elevado (≥ 43 % en varones o ≥ 39,6 % en mujeres)" }
      ],
      compute: (v) => {
        const score = sum(v, ["peritoneo", "creatinina", "hematocrito"]);
        return {
          main: String(score),
          mainUnit: score === 1 ? "criterio" : "criterios",
          interpretation: score === 0 ? "Ningún criterio presente: curso leve muy probable (valor predictivo positivo ≈ 98 % para pancreatitis no grave). Puede manejarse fuera de cuidados intensivos." : "Al menos un criterio presente: no puede predecirse un curso leve; mantener la monitorización habitual y estratificar con otras escalas (BISAP, criterios de Atlanta).",
          level: score === 0 ? "ok" : "warn"
        };
      },
      notes: ["Se evalúa en los primeros 30–60 minutos desde el ingreso."],
      references: [
        "Lankisch PG, et al. The harmless acute pancreatitis score: a clinical algorithm for rapid initial stratification of nonsevere disease. Clin Gastroenterol Hepatol. 2009;7(6):702-5."
      ]
    },
    {
      id: "glasgow-blatchford",
      name: "Puntuación de Glasgow-Blatchford para la hemorragia digestiva alta",
      shortName: "Glasgow-Blatchford",
      description: "Identifica a los pacientes con hemorragia digestiva alta de bajo riesgo que pueden manejarse de forma ambulatoria.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        {
          id: "urea",
          type: "select",
          label: "Urea sérica (mg/dL)",
          dropdown: true,
          options: [
            { label: "< 39", value: 0 },
            { label: "39–48", value: 2 },
            { label: "48–60", value: 3 },
            { label: "60–150", value: 4 },
            { label: "≥ 150", value: 6 }
          ]
        },
        {
          id: "hb",
          type: "select",
          label: "Hemoglobina",
          dropdown: true,
          options: [
            { label: "Varón ≥ 13 o mujer ≥ 12 g/dL", value: 0 },
            { label: "Varón 12–13 g/dL", value: 1 },
            { label: "Mujer 10–12 g/dL", value: 1.0001 },
            { label: "Varón 10–12 g/dL", value: 3 },
            { label: "< 10 g/dL (cualquier sexo)", value: 6 }
          ]
        },
        {
          id: "pas",
          type: "select",
          label: "Presión arterial sistólica (mmHg)",
          dropdown: true,
          options: [
            { label: "≥ 110", value: 0 },
            { label: "100–109", value: 1 },
            { label: "90–99", value: 2 },
            { label: "< 90", value: 3 }
          ]
        },
        { id: "fc", type: "boolean", label: "Frecuencia cardíaca ≥ 100 lpm" },
        { id: "melenas", type: "boolean", label: "Melenas" },
        { id: "sincope", type: "boolean", label: "Síncope", points: 2 },
        { id: "hepatopatia", type: "boolean", label: "Hepatopatía", points: 2 },
        { id: "cardiaca", type: "boolean", label: "Insuficiencia cardíaca", points: 2 }
      ],
      compute: (v) => {
        const score = Math.round(
          sum(v, ["urea", "hb", "pas", "fc", "melenas", "sincope", "hepatopatia", "cardiaca"])
        );
        return {
          main: String(score),
          mainUnit: "puntos (0–23)",
          interpretation: score === 0 ? "Puntuación 0: riesgo muy bajo de necesitar intervención (transfusión, endoscopia terapéutica o cirugía) o de fallecer. Candidato a manejo ambulatorio con endoscopia preferente." : score <= 1 ? "Puntuación ≤ 1: riesgo bajo; algunos protocolos admiten el manejo ambulatorio con este umbral." : "Puntuación ≥ 2: riesgo aumentado de precisar intervención; se recomienda ingreso y endoscopia en las primeras 24 h.",
          level: score <= 1 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      notes: ["A diferencia de la escala de Rockall, no requiere datos endoscópicos, por lo que puede aplicarse en el primer contacto."],
      references: [
        "Blatchford O, et al. A risk score to predict need for treatment for upper-gastrointestinal haemorrhage. Lancet. 2000;356(9238):1318-21."
      ]
    },
    {
      id: "aims65",
      name: "Puntuación AIMS65 para la hemorragia digestiva alta",
      shortName: "AIMS65",
      description: "Predice la mortalidad hospitalaria en la hemorragia digestiva alta.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "albumina", type: "boolean", label: "Albúmina < 3 g/dL (A)" },
        { id: "inr", type: "boolean", label: "INR > 1,5 (I)" },
        { id: "mental", type: "boolean", label: "Alteración del estado mental (M)" },
        { id: "pas", type: "boolean", label: "PA sistólica ≤ 90 mmHg (S)" },
        { id: "edad", type: "boolean", label: "Edad > 65 años (65)" }
      ],
      compute: (v) => {
        const score = sum(v, ["albumina", "inr", "mental", "pas", "edad"]);
        const mort = ["0,3 %", "1 %", "3 %", "9 %", "15 %", "25 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–5)",
          secondary: mort,
          secondaryLabel: "mortalidad hospitalaria",
          interpretation: score <= 1 ? "Riesgo bajo de mortalidad." : "Riesgo elevado (≥ 2): ingreso, reanimación y endoscopia precoz; valorar el nivel de cuidados.",
          level: score <= 1 ? "ok" : score === 2 ? "warn" : "danger"
        };
      },
      references: [
        "Saltzman JR, et al. A simple risk score accurately predicts in-hospital mortality, length of stay, and cost in acute upper GI bleeding. Gastrointest Endosc. 2011;74(6):1215-24."
      ]
    },
    {
      id: "oakland",
      name: "Puntuación de Oakland para la hemorragia digestiva baja",
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
            { label: "< 40 años", value: 0 },
            { label: "40–69 años", value: 1 },
            { label: "≥ 70 años", value: 2 }
          ]
        },
        { id: "varon", type: "boolean", label: "Sexo masculino" },
        { id: "ingresoPrevio", type: "boolean", label: "Ingreso previo por hemorragia digestiva baja" },
        { id: "tacto", type: "boolean", label: "Sangre en el tacto rectal" },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia cardíaca (lpm)",
          dropdown: true,
          options: [
            { label: "< 70", value: 0 },
            { label: "70–89", value: 1 },
            { label: "90–109", value: 2 },
            { label: "≥ 110", value: 3 }
          ]
        },
        {
          id: "pas",
          type: "select",
          label: "Presión arterial sistólica (mmHg)",
          dropdown: true,
          options: [
            { label: "≥ 160", value: 0 },
            { label: "130–159", value: 2 },
            { label: "120–129", value: 3 },
            { label: "110–119", value: 4 },
            { label: "< 110", value: 5 }
          ]
        },
        {
          id: "hb",
          type: "select",
          label: "Hemoglobina (g/dL)",
          dropdown: true,
          options: [
            { label: "≥ 16", value: 0 },
            { label: "14,0–15,9", value: 4 },
            { label: "12,0–13,9", value: 8 },
            { label: "10,0–11,9", value: 14 },
            { label: "7,0–9,9", value: 22 },
            { label: "< 7,0", value: 21 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "varon", "ingresoPrevio", "tacto", "fc", "pas", "hb"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–35)",
          interpretation: score <= 8 ? "Puntuación ≤ 8: riesgo bajo (probabilidad ≈ 95 % de alta segura sin transfusión, hemostasia ni muerte). Candidato a manejo ambulatorio." : "Puntuación > 8: riesgo aumentado de eventos adversos; se recomienda ingreso y estudio.",
          level: score <= 8 ? "ok" : "warn"
        };
      },
      references: [
        "Oakland K, et al. Derivation and validation of a novel risk score for safe discharge after acute lower gastrointestinal bleeding. Lancet Gastroenterol Hepatol. 2017;2(9):635-43."
      ]
    },
    {
      id: "bard",
      name: "Puntuación BARD de fibrosis en la esteatosis hepática no alcohólica",
      shortName: "BARD",
      description: "Predice el riesgo de fibrosis avanzada en el hígado graso no alcohólico.",
      category: CAT18,
      specialty: UCI5,
      inputs: [
        { id: "imc", type: "boolean", label: "IMC ≥ 28 kg/m² (B)" },
        {
          id: "ast",
          type: "boolean",
          label: "Cociente AST/ALT ≥ 0,8 (A)",
          points: 2
        },
        { id: "diabetes", type: "boolean", label: "Diabetes mellitus (D)" }
      ],
      compute: (v) => {
        const score = sum(v, ["imc", "ast", "diabetes"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–4)",
          interpretation: score >= 2 ? "BARD ≥ 2: riesgo aumentado de fibrosis avanzada (odds ratio ≈ 17); completar el estudio con elastografía u otros marcadores no invasivos." : "BARD 0–1: fibrosis avanzada poco probable (valor predictivo negativo ≈ 96 %).",
          level: score >= 2 ? "warn" : "ok"
        };
      },
      references: [
        "Harrison SA, et al. Development and validation of a simple NAFLD clinical scoring system for identifying patients without advanced disease. Gut. 2008;57(10):1441-7."
      ]
    }
  ];

  // inurse-main/src/calculators/hemato-trauma.ts
  var CAT_HEM = "Hematología y oncología";
  var CAT_TRAUMA = "Trauma y quemados";
  var UCI6 = ["Medicina Intensiva"];
  var escala5 = (items) => items.map(([value, label]) => ({ label: `${value} — ${label}`, value }));
  var hematoTrauma = [
    {
      id: "4ts",
      name: "Puntuación 4T para la trombopenia inducida por heparina",
      shortName: "4Ts",
      description: "Estima la probabilidad de que una trombopenia esté causada por heparina antes de las pruebas de laboratorio.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        {
          id: "trombopenia",
          type: "select",
          label: "Trombopenia (magnitud)",
          dropdown: true,
          options: escala5([
            [2, "Descenso > 50 % y nadir ≥ 20 ×10⁹/L"],
            [1, "Descenso del 30–50 %, o nadir de 10–19 ×10⁹/L"],
            [0, "Descenso < 30 %, o nadir < 10 ×10⁹/L"]
          ])
        },
        {
          id: "tiempo",
          type: "select",
          label: "Momento de aparición",
          dropdown: true,
          options: escala5([
            [2, "Días 5–10 tras el inicio, o ≤ 1 día si hubo exposición a heparina en los últimos 30 días"],
            [1, "Compatible con días 5–10 pero no documentado, o inicio tras el día 10, o ≤ 1 día con exposición hace 30–100 días"],
            [0, "Descenso antes del día 4 sin exposición reciente"]
          ])
        },
        {
          id: "trombosis",
          type: "select",
          label: "Trombosis u otras secuelas",
          dropdown: true,
          options: escala5([
            [2, "Trombosis confirmada nueva, necrosis cutánea o reacción sistémica aguda tras un bolo de heparina"],
            [1, "Trombosis recurrente o progresiva, lesiones cutáneas no necrosantes, o sospecha de trombosis no confirmada"],
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
        const prob = score <= 3 ? "< 5 %" : score <= 5 ? "≈ 14 %" : "≈ 64 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–8)",
          secondary: prob,
          secondaryLabel: "probabilidad de trombopenia por heparina",
          interpretation: banda === "baja" ? "Probabilidad baja: el valor predictivo negativo es muy alto; en general no se requieren pruebas de anticuerpos ni suspender la heparina." : "Probabilidad intermedia o alta: suspender toda heparina (incluidos los lavados de catéter), iniciar un anticoagulante alternativo no heparínico y solicitar anticuerpos anti-PF4 con prueba funcional confirmatoria. No transfundir plaquetas de forma profiláctica ni iniciar warfarina hasta la recuperación plaquetaria.",
          level: banda === "baja" ? "ok" : banda === "intermedia" ? "warn" : "danger"
        };
      },
      references: [
        "Lo GK, et al. Evaluation of pretest clinical score (4 T’s) for the diagnosis of heparin-induced thrombocytopenia. J Thromb Haemost. 2006;4(4):759-65."
      ]
    },
    {
      id: "neutrofilos-linfocitos",
      name: "Recuento absoluto de neutrófilos, linfocitos e índice neutrófilos/linfocitos",
      shortName: "RAN / RAL / NLR",
      description: "Calcula el recuento absoluto de neutrófilos y linfocitos y el índice neutrófilos/linfocitos.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        { id: "leucocitos", type: "number", label: "Leucocitos totales", unit: "×10³/µL", min: 0.01, max: 200, step: 0.01 },
        { id: "neutrofilos", type: "number", label: "Neutrófilos segmentados", unit: "%", min: 0, max: 100, step: 0.1 },
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
          mainUnit: "neutrófilos/µL",
          secondary: fmt(nlr, 2),
          secondaryLabel: "índice neutrófilos/linfocitos",
          interpretation: ran < 500 ? "Neutropenia grave (< 500/µL): riesgo alto de infección. Ante fiebre, antibioterapia empírica de amplio espectro sin demora." : ran < 1e3 ? "Neutropenia moderada (500–1.000/µL): precaución ante la fiebre." : ran < 1500 ? "Neutropenia leve (1.000–1.500/µL)." : "Recuento de neutrófilos dentro del rango habitual.",
          level: ran < 500 ? "danger" : ran < 1500 ? "warn" : "ok",
          details: [
            `Linfocitos absolutos: ${fmt(ral, 0)}/µL (predicción de CD4: ${cd4}).`,
            "Un índice neutrófilos/linfocitos elevado (> 3–5) se asocia a inflamación sistémica y peor pronóstico en múltiples enfermedades, pero no es específico."
          ]
        };
      },
      notes: ["RAN = leucocitos × (neutrófilos % + cayados %) / 100."]
    },
    {
      id: "mascc",
      name: "Índice MASCC para la neutropenia febril",
      shortName: "MASCC",
      description: "Identifica a los pacientes con neutropenia febril de bajo riesgo de complicaciones graves.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        {
          id: "sintomas",
          type: "select",
          label: "Gravedad de los síntomas",
          dropdown: true,
          options: [
            { label: "Sin síntomas o síntomas leves", value: 5 },
            { label: "Síntomas moderados", value: 3 },
            { label: "Síntomas graves o moribundo", value: 0 }
          ]
        },
        { id: "hipotension", type: "boolean", label: "Sin hipotensión (PA sistólica > 90 mmHg)", points: 5 },
        { id: "epoc", type: "boolean", label: "Sin enfermedad pulmonar obstructiva crónica", points: 4 },
        {
          id: "tumor",
          type: "boolean",
          label: "Tumor sólido, o neoplasia hematológica sin infección fúngica previa",
          points: 4
        },
        { id: "deshidratacion", type: "boolean", label: "Sin deshidratación que requiera fluidos intravenosos", points: 3 },
        { id: "ambulatorio", type: "boolean", label: "Paciente ambulatorio al inicio de la fiebre", points: 3 },
        { id: "edad", type: "boolean", label: "Edad < 60 años", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["sintomas", "hipotension", "epoc", "tumor", "deshidratacion", "ambulatorio", "edad"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–26)",
          interpretation: score >= 21 ? "MASCC ≥ 21: bajo riesgo de complicaciones graves. Puede valorarse tratamiento oral o ambulatorio en pacientes seleccionados, con acceso rápido al hospital y buen soporte social." : "MASCC < 21: alto riesgo de complicaciones. Ingreso hospitalario con antibioterapia intravenosa de amplio espectro.",
          level: score >= 21 ? "ok" : "danger"
        };
      },
      notes: ["Los puntos por «síntomas moderados» y «leves» no se suman entre sí: solo se elige una categoría."],
      references: [
        "Klastersky J, et al. The Multinational Association for Supportive Care in Cancer risk index. J Clin Oncol. 2000;18(16):3038-51."
      ]
    },
    {
      id: "cisne",
      name: "Índice CISNE para la neutropenia febril estable",
      shortName: "CISNE",
      description: "Identifica a los pacientes con neutropenia febril clínicamente estable y tumor sólido que tienen bajo riesgo de complicaciones.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        { id: "ecog", type: "boolean", label: "ECOG ≥ 2", points: 2 },
        { id: "epoc", type: "boolean", label: "Enfermedad pulmonar obstructiva crónica" },
        { id: "cardiovascular", type: "boolean", label: "Enfermedad cardiovascular crónica" },
        { id: "mucositis", type: "boolean", label: "Mucositis de grado ≥ 2 (NCI)" },
        { id: "monocitos", type: "boolean", label: "Monocitos < 200/µL" },
        { id: "hiperglucemia", type: "boolean", label: "Hiperglucemia por estrés (> 121 mg/dL)", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["ecog", "epoc", "cardiovascular", "mucositis", "monocitos", "hiperglucemia"]);
        const banda = score === 0 ? "bajo" : score <= 2 ? "intermedio" : "alto";
        const comp = score === 0 ? "1,1 %" : score <= 2 ? "6,2 %" : "36 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–8)",
          secondary: comp,
          secondaryLabel: "riesgo de complicaciones",
          interpretation: banda === "bajo" ? "Riesgo bajo (0 puntos): puede valorarse el manejo ambulatorio con antibioterapia oral." : banda === "intermedio" ? "Riesgo intermedio (1–2): se recomienda observación hospitalaria inicial." : "Riesgo alto (≥ 3): ingreso con antibioterapia intravenosa y vigilancia estrecha.",
          level: banda === "bajo" ? "ok" : banda === "intermedio" ? "warn" : "danger"
        };
      },
      notes: ["Solo aplicable a pacientes con tumores sólidos y aparentemente estables; no usar en neoplasias hematológicas ni en pacientes inestables."],
      references: [
        "Carmona-Bayonas A, et al. Prediction of serious complications in patients with seemingly stable febrile neutropenia: validation of the Clinical Index of Stable Febrile Neutropenia. J Clin Oncol. 2015;33(5):465-71."
      ]
    },
    {
      id: "crs",
      name: "Clasificación del síndrome de liberación de citocinas (ASTCT)",
      shortName: "CRS",
      description: "Gradúa la gravedad del síndrome de liberación de citocinas en pacientes tratados con inmunoterapia celular.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        { id: "fiebre", type: "boolean", label: "Temperatura ≥ 38 °C", noPoints: true },
        {
          id: "hipotension",
          type: "select",
          label: "Hipotensión",
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
            { label: "Requiere gafas nasales de bajo flujo (≤ 6 L/min) o mascarilla", value: 1 },
            { label: "Requiere alto flujo (> 6 L/min), mascarilla con reservorio o Venturi", value: 2 },
            { label: "Requiere presión positiva (CPAP, BiPAP o intubación)", value: 3 }
          ]
        }
      ],
      compute: (v) => {
        var _a, _b;
        if (v.fiebre !== 1)
          return {
            main: "Sin CRS",
            interpretation: "La fiebre ≥ 38 °C es requisito para el grado 1. Sin fiebre no se clasifica como síndrome de liberación de citocinas (salvo si ya recibe antipiréticos o tratamiento específico).",
            level: "ok"
          };
        const hipo = (_a = v.hipotension) != null ? _a : 0;
        const hipox = (_b = v.hipoxia) != null ? _b : 0;
        const grado = Math.max(1, hipo === 3 || hipox === 3 ? 4 : hipo === 2 || hipox === 2 ? 3 : hipo === 1 || hipox === 1 ? 2 : 1);
        return {
          main: `Grado ${grado}`,
          interpretation: [
            "",
            "Grado 1: solo fiebre. Tratamiento sintomático, cultivos y vigilancia; valorar antibioterapia empírica por la dificultad para distinguirlo de la sepsis.",
            "Grado 2: fiebre con hipotensión que responde a fluidos o hipoxia con oxígeno de bajo flujo. Se recomienda tocilizumab, con o sin corticoides.",
            "Grado 3: requiere un vasopresor o alto flujo de oxígeno. Tocilizumab y corticoides; traslado a cuidados intensivos.",
            "Grado 4: requiere varios vasopresores o soporte ventilatorio con presión positiva. Manejo en cuidados intensivos con corticoides a dosis altas y tocilizumab."
          ][grado],
          level: grado <= 1 ? "warn" : "danger",
          details: ["El grado lo determina el componente (hipotensión o hipoxia) más grave."]
        };
      },
      references: [
        "Lee DW, et al. ASTCT Consensus Grading for Cytokine Release Syndrome and Neurologic Toxicity Associated with Immune Effector Cells. Biol Blood Marrow Transplant. 2019;25(4):625-38."
      ]
    },
    {
      id: "ice-icans",
      name: "Puntuación ICE y clasificación ICANS",
      shortName: "ICE / ICANS",
      description: "Evalúa la neurotoxicidad asociada a las terapias con células efectoras inmunitarias (células CAR-T).",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        {
          id: "orientacion",
          type: "select",
          label: "Orientación (año, mes, ciudad, hospital)",
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
          label: "Denominación de 3 objetos",
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
          label: "Seguir órdenes sencillas",
          options: escala5([
            [1, "Capaz"],
            [0, "Incapaz"]
          ]),
          default: 1
        },
        {
          id: "escritura",
          type: "select",
          label: "Escribir una frase estándar",
          options: escala5([
            [1, "Capaz"],
            [0, "Incapaz"]
          ]),
          default: 1
        },
        {
          id: "atencion",
          type: "select",
          label: "Atención (contar hacia atrás de 10 en 10 desde 100)",
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
            { label: "Despierta espontáneamente", value: 1 },
            { label: "Despierta solo con estímulo táctil", value: 2 },
            { label: "Despierta solo con estímulo intenso o repetido", value: 3 },
            { label: "No despierta o requiere estímulo vigoroso", value: 4 }
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
            { label: "Crisis focal o generalizada que resuelve rápidamente, o actividad no convulsiva en el EEG que responde al tratamiento", value: 3 },
            { label: "Crisis prolongada (> 5 min) o crisis repetidas sin recuperación entre ellas", value: 4 }
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
          label: "Edema cerebral / hipertensión intracraneal",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "Edema cerebral focal o local en la neuroimagen", value: 3 },
            { label: "Edema cerebral difuso, postura de descerebración o decorticación, parálisis del VI par o papiledema", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        var _a, _b, _c, _d;
        const ice = sum(v, ["orientacion", "denominacion", "ordenes", "escritura", "atencion"]);
        const porIce = ice === 10 ? 0 : ice >= 7 ? 1 : ice >= 3 ? 2 : ice >= 1 ? 3 : 4;
        const grado = Math.max(porIce, (_a = v.conciencia) != null ? _a : 0, (_b = v.convulsiones) != null ? _b : 0, (_c = v.motor) != null ? _c : 0, (_d = v.edema) != null ? _d : 0);
        return {
          main: grado === 0 ? "Sin ICANS" : `ICANS grado ${grado}`,
          secondary: String(ice),
          secondaryLabel: "puntuación ICE (0–10)",
          interpretation: [
            "Sin datos de neurotoxicidad en este momento; repetir la evaluación al menos dos veces al día durante el período de riesgo.",
            "Grado 1: neurotoxicidad leve. Vigilancia estrecha, evitar sedantes, valorar EEG y neuroimagen.",
            "Grado 2: se recomienda dexametasona y monitorización continua; valorar traslado a cuidados intensivos.",
            "Grado 3: corticoides a dosis altas, ingreso en cuidados intensivos, EEG y neuroimagen.",
            "Grado 4: soporte vital avanzado, corticoides a dosis altas y manejo de la hipertensión intracraneal."
          ][grado],
          level: grado === 0 ? "ok" : grado <= 2 ? "warn" : "danger",
          details: [
            `Grado derivado de la puntuación ICE: ${porIce}.`,
            "El grado final es el más alto de todos los dominios evaluados.",
            "Un paciente que no despierta y no puede realizar la evaluación ICE tiene 0 puntos y corresponde a grado 3 o 4 según el nivel de conciencia."
          ]
        };
      },
      references: [
        "Lee DW, et al. ASTCT Consensus Grading for Cytokine Release Syndrome and Neurologic Toxicity Associated with Immune Effector Cells. Biol Blood Marrow Transplant. 2019;25(4):625-38."
      ]
    },
    {
      id: "hscore",
      name: "HScore para el síndrome hemofagocítico reactivo",
      shortName: "HScore",
      description: "Estima la probabilidad de linfohistiocitosis hemofagocítica secundaria.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        {
          id: "inmunodepresion",
          type: "select",
          label: "Inmunodepresión conocida",
          description: "VIH o tratamiento inmunosupresor prolongado.",
          options: [
            { label: "No", value: 0 },
            { label: "Sí", value: 18 }
          ]
        },
        {
          id: "temperatura",
          type: "select",
          label: "Temperatura máxima",
          dropdown: true,
          options: [
            { label: "< 38,4 °C", value: 0 },
            { label: "38,4–39,4 °C", value: 33 },
            { label: "> 39,4 °C", value: 49 }
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
          label: "Número de citopenias",
          description: "Hb ≤ 9,2 g/dL, leucocitos ≤ 5.000/mm³, plaquetas ≤ 110.000/mm³.",
          dropdown: true,
          options: [
            { label: "Una línea", value: 0 },
            { label: "Dos líneas", value: 24 },
            { label: "Tres líneas", value: 34 }
          ]
        },
        {
          id: "ferritina",
          type: "select",
          label: "Ferritina",
          dropdown: true,
          options: [
            { label: "< 2.000 ng/mL", value: 0 },
            { label: "2.000–6.000 ng/mL", value: 35 },
            { label: "> 6.000 ng/mL", value: 50 }
          ]
        },
        {
          id: "trigliceridos",
          type: "select",
          label: "Triglicéridos",
          dropdown: true,
          options: [
            { label: "< 132,7 mg/dL", value: 0 },
            { label: "132,7–354 mg/dL", value: 44 },
            { label: "> 354 mg/dL", value: 64 }
          ]
        },
        {
          id: "fibrinogeno",
          type: "select",
          label: "Fibrinógeno",
          options: [
            { label: "> 250 mg/dL", value: 0 },
            { label: "≤ 250 mg/dL", value: 30 }
          ]
        },
        {
          id: "ast",
          type: "select",
          label: "AST (GOT)",
          options: [
            { label: "< 30 U/L", value: 0 },
            { label: "≥ 30 U/L", value: 19 }
          ]
        },
        {
          id: "hemofagocitosis",
          type: "select",
          label: "Hemofagocitosis en el aspirado medular",
          options: [
            { label: "No", value: 0 },
            { label: "Sí", value: 35 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["inmunodepresion", "temperatura", "organomegalia", "citopenias", "ferritina", "trigliceridos", "fibrinogeno", "ast", "hemofagocitosis"]);
        const prob = score < 90 ? "< 1 %" : score < 169 ? "intermedia" : "> 99 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–337)",
          secondary: prob,
          secondaryLabel: "probabilidad de síndrome hemofagocítico",
          interpretation: score >= 169 ? "HScore ≥ 169: alta probabilidad de linfohistiocitosis hemofagocítica (sensibilidad 93 %, especificidad 86 %). Iniciar estudio y tratamiento urgentes junto con hematología." : score < 90 ? "Probabilidad muy baja." : "Probabilidad intermedia: repetir determinaciones (ferritina, triglicéridos, fibrinógeno) y valorar aspirado medular.",
          level: score >= 169 ? "danger" : score < 90 ? "ok" : "warn"
        };
      },
      references: [
        "Fardet L, et al. Development and validation of the HScore, a score for the diagnosis of reactive hemophagocytic syndrome. Arthritis Rheumatol. 2014;66(9):2613-20."
      ]
    },
    {
      id: "volumen-sanguineo",
      name: "Volumen sanguíneo total, eritrocitario y plasmático",
      shortName: "Volumen sanguíneo",
      description: "Calcula el volumen sanguíneo total y sus componentes.",
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
            { label: "Neonato prematuro (≈ 96 mL/kg)", value: 96 },
            { label: "Neonato a término (≈ 85 mL/kg)", value: 85 },
            { label: "Lactante (≈ 80 mL/kg)", value: 80 },
            { label: "Niño (≈ 70 mL/kg)", value: 70 },
            { label: "Varón adulto (≈ 75 mL/kg)", value: 75 },
            { label: "Mujer adulta (≈ 65 mL/kg)", value: 65 }
          ],
          default: 75
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 0.3, max: 300, step: 0.1 },
        { id: "hto", type: "number", label: "Hematocrito", unit: "%", min: 5, max: 70, step: 0.1 }
      ],
      compute: (v) => {
        var _a;
        const total = ((_a = v.poblacion) != null ? _a : 75) * v.peso;
        const eritro = total * (v.hto / 100);
        const plasma = total - eritro;
        return {
          main: fmt(total, 0),
          mainUnit: "mL de volumen sanguíneo total",
          secondary: fmt(eritro, 0),
          secondaryLabel: "mL de volumen eritrocitario",
          interpretation: "Útil para calcular pérdidas admisibles, dosis de transfusión y volúmenes de recambio plasmático.",
          level: "info",
          details: [`Volumen plasmático: ${fmt(plasma, 0)} mL.`]
        };
      }
    },
    {
      id: "crioprecipitado",
      name: "Dosis de crioprecipitado para reponer fibrinógeno",
      shortName: "Crioprecipitado",
      description: "Estima las unidades de crioprecipitado necesarias para alcanzar un fibrinógeno objetivo.",
      category: CAT_HEM,
      specialty: UCI6,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 1, max: 250, step: 0.5 },
        { id: "hto", type: "number", label: "Hematocrito", unit: "%", min: 5, max: 70, step: 0.1 },
        { id: "actual", type: "number", label: "Fibrinógeno actual", unit: "mg/dL", min: 0, max: 800, step: 1 },
        { id: "objetivo", type: "number", label: "Fibrinógeno objetivo", unit: "mg/dL", min: 50, max: 800, step: 1 },
        { id: "contenido", type: "number", label: "Fibrinógeno por unidad", unit: "mg", min: 100, max: 500, step: 10 }
      ],
      compute: (v) => {
        if (v.objetivo <= v.actual)
          return {
            main: "—",
            interpretation: "El fibrinógeno objetivo debe ser mayor que el actual.",
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
          secondaryLabel: "mg de fibrinógeno necesarios",
          interpretation: "Dosis orientativa. En la hemorragia masiva se prefiere con frecuencia el concentrado de fibrinógeno, guiado por tromboelastografía o tromboelastometría cuando se dispone de ellas. Objetivo habitual: > 150–200 mg/dL (> 200 en la hemorragia obstétrica).",
          level: "info",
          details: [
            `Volumen plasmático estimado: ${fmt(volumenPlasma, 0)} mL.`,
            "El contenido real por unidad varía; consultar la ficha del banco de sangre (habitualmente 150–250 mg)."
          ]
        };
      }
    },
    {
      id: "iss",
      name: "Puntuación de gravedad de las lesiones (ISS)",
      shortName: "ISS",
      description: "Estandariza la gravedad del politraumatismo a partir de la escala abreviada de lesiones (AIS) por regiones corporales.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        ["cabeza", "Cabeza y cuello"],
        ["cara", "Cara"],
        ["torax", "Tórax"],
        ["abdomen", "Abdomen y contenido pélvico"],
        ["extremidades", "Extremidades y cintura pélvica"],
        ["externa", "Superficie externa (piel)"]
      ].map(([id, label]) => ({
        id,
        type: "select",
        label,
        dropdown: true,
        options: escala5([
          [0, "Sin lesión"],
          [1, "AIS 1 — leve"],
          [2, "AIS 2 — moderada"],
          [3, "AIS 3 — grave, no amenaza la vida"],
          [4, "AIS 4 — grave, amenaza la vida"],
          [5, "AIS 5 — crítica, supervivencia incierta"],
          [6, "AIS 6 — máxima, lesión no superviviente"]
        ])
      })),
      compute: (v) => {
        const ids = ["cabeza", "cara", "torax", "abdomen", "extremidades", "externa"];
        const valores = ids.map((id) => {
          var _a;
          return (_a = v[id]) != null ? _a : 0;
        });
        if (valores.some((x) => x === 6))
          return {
            main: "75",
            mainUnit: "puntos (máximo)",
            interpretation: "Una lesión AIS 6 (no superviviente) asigna automáticamente el ISS máximo de 75.",
            level: "danger"
          };
        const top3 = [...valores].sort((a, b) => b - a).slice(0, 3);
        const score = top3.reduce((acc, x) => acc + x * x, 0);
        return {
          main: String(score),
          mainUnit: "puntos (0–75)",
          secondary: top3.join(" · "),
          secondaryLabel: "las tres regiones más graves",
          interpretation: score >= 16 ? "ISS ≥ 16: politraumatismo grave según la definición habitual; manejo en centro de trauma con equipo multidisciplinar." : score >= 9 ? "Traumatismo moderado." : "Traumatismo leve.",
          level: score >= 25 ? "danger" : score >= 16 ? "warn" : "ok",
          details: ["ISS = suma de los cuadrados de los tres valores AIS más altos de regiones distintas."]
        };
      },
      references: [
        "Baker SP, et al. The injury severity score: a method for describing patients with multiple injuries. J Trauma. 1974;14(3):187-96."
      ]
    },
    {
      id: "abc-transfusion",
      name: "Puntuación ABC para la transfusión masiva",
      shortName: "ABC",
      description: "Predice la necesidad de protocolo de transfusión masiva en el paciente traumatizado.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        { id: "penetrante", type: "boolean", label: "Mecanismo penetrante" },
        { id: "pas", type: "boolean", label: "PA sistólica ≤ 90 mmHg al llegar" },
        { id: "fc", type: "boolean", label: "Frecuencia cardíaca ≥ 120 lpm al llegar" },
        { id: "fast", type: "boolean", label: "Ecografía FAST positiva" }
      ],
      compute: (v) => {
        const score = sum(v, ["penetrante", "pas", "fc", "fast"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–4)",
          interpretation: score >= 2 ? "ABC ≥ 2: alta probabilidad de requerir transfusión masiva. Activar el protocolo de hemorragia masiva con hemoderivados en proporción equilibrada y ácido tranexámico si está indicado." : "ABC < 2: baja probabilidad de transfusión masiva, aunque no la excluye; reevaluar de forma continua.",
          level: score >= 2 ? "danger" : "ok"
        };
      },
      references: [
        "Nunez TC, et al. Early prediction of massive transfusion in trauma: simple as ABC? J Trauma. 2009;66(2):346-52."
      ]
    },
    {
      id: "parkland",
      name: "Fórmula de Parkland para quemados",
      shortName: "Parkland",
      description: "Calcula la reposición de líquidos en las primeras 24 horas del paciente quemado.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 1, max: 300, step: 0.5 },
        {
          id: "sctq",
          type: "number",
          label: "Superficie corporal quemada (2.º y 3.er grado)",
          unit: "%",
          min: 1,
          max: 100,
          step: 1
        },
        {
          id: "mlkg",
          type: "select",
          label: "Fórmula",
          noPoints: true,
          options: [
            { label: "Parkland clásica: 4 mL/kg/%", value: 4 },
            { label: "ABLS / consenso actual: 2 mL/kg/%", value: 2 },
            { label: "Quemadura eléctrica de alto voltaje: 4 mL/kg/%", value: 4.0001 }
          ],
          default: 2
        }
      ],
      compute: (v) => {
        var _a;
        const factor = (_a = v.mlkg) != null ? _a : 2;
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
            "Ajustar el ritmo según la diuresis objetivo: 0,5 mL/kg/h en adultos y 1 mL/kg/h en niños.",
            "Las guías actuales recomiendan iniciar con 2 mL/kg/% para evitar la sobrerreanimación («fluid creep»)."
          ]
        };
      },
      notes: [
        "No incluir las quemaduras de primer grado en el cálculo de la superficie.",
        "Los niños necesitan además fluidos de mantenimiento con glucosa."
      ],
      references: [
        "Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci. 1968;150(3):874-94."
      ]
    },
    {
      id: "lrinec",
      name: "Puntuación LRINEC para la fascitis necrosante",
      shortName: "LRINEC",
      description: "Ayuda a distinguir la infección necrosante de tejidos blandos de una celulitis grave.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        {
          id: "pcr",
          type: "select",
          label: "Proteína C reactiva (mg/L)",
          options: [
            { label: "< 150", value: 0 },
            { label: "≥ 150", value: 4 }
          ]
        },
        {
          id: "leucocitos",
          type: "select",
          label: "Leucocitos (×10³/µL)",
          dropdown: true,
          options: [
            { label: "< 15", value: 0 },
            { label: "15–25", value: 1 },
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
            { label: "11–13,5", value: 1 },
            { label: "< 11", value: 2 }
          ]
        },
        {
          id: "sodio",
          type: "select",
          label: "Sodio (mEq/L)",
          options: [
            { label: "≥ 135", value: 0 },
            { label: "< 135", value: 2 }
          ]
        },
        {
          id: "creatinina",
          type: "select",
          label: "Creatinina (mg/dL)",
          options: [
            { label: "≤ 1,6", value: 0 },
            { label: "> 1,6", value: 2 }
          ]
        },
        {
          id: "glucosa",
          type: "select",
          label: "Glucosa (mg/dL)",
          options: [
            { label: "≤ 180", value: 0 },
            { label: "> 180", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["pcr", "leucocitos", "hb", "sodio", "creatinina", "glucosa"]);
        const banda = score <= 5 ? "bajo" : score <= 7 ? "intermedio" : "alto";
        return {
          main: String(score),
          mainUnit: "puntos (0–13)",
          interpretation: banda === "bajo" ? "Riesgo bajo según la escala (< 50 % de probabilidad), pero una puntuación baja NO descarta la fascitis necrosante: si la clínica es sugestiva (dolor desproporcionado, crepitación, lesiones ampollosas, rápida progresión, toxicidad sistémica), la exploración quirúrgica no debe retrasarse." : banda === "intermedio" ? "Riesgo intermedio (50–75 %): valoración quirúrgica urgente." : "Riesgo alto (> 75 %): exploración quirúrgica urgente, antibioterapia de amplio espectro y soporte en cuidados intensivos.",
          level: banda === "bajo" ? "warn" : "danger"
        };
      },
      notes: [
        "Validaciones posteriores han mostrado una sensibilidad menor que la del estudio original: es una herramienta de apoyo, nunca de exclusión."
      ],
      references: [
        "Wong CH, et al. The LRINEC (Laboratory Risk Indicator for Necrotizing Fasciitis) score. Crit Care Med. 2004;32(7):1535-41."
      ]
    },
    {
      id: "nexus-cabeza",
      name: "Criterios NEXUS II para la tomografía craneal",
      shortName: "NEXUS craneal",
      description: "Identifica a los pacientes con traumatismo craneal cerrado que requieren tomografía computarizada.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad ≥ 65 años" },
        { id: "craneo", type: "boolean", label: "Signos de fractura craneal (incluida la fractura de base)" },
        { id: "cuero", type: "boolean", label: "Hematoma significativo del cuero cabelludo" },
        { id: "neurologico", type: "boolean", label: "Déficit neurológico focal" },
        { id: "conciencia", type: "boolean", label: "Nivel de conciencia alterado" },
        { id: "conducta", type: "boolean", label: "Conducta anormal" },
        { id: "coagulopatia", type: "boolean", label: "Coagulopatía" },
        { id: "vomitos", type: "boolean", label: "Vómitos persistentes" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "craneo", "cuero", "neurologico", "conciencia", "conducta", "coagulopatia", "vomitos"]);
        return {
          main: score === 0 ? "Bajo riesgo" : "Riesgo no bajo",
          secondary: String(score),
          secondaryLabel: score === 1 ? "criterio presente" : "criterios presentes",
          interpretation: score === 0 ? "Ningún criterio presente: riesgo bajo de lesión intracraneal significativa; la tomografía puede evitarse con seguridad razonable (sensibilidad ≈ 98–100 %)." : "Al menos un criterio presente: está indicada la tomografía craneal.",
          level: score === 0 ? "ok" : "danger"
        };
      },
      references: [
        "Mower WR, et al. Developing a decision instrument to guide computed tomographic imaging of blunt head injury patients. J Trauma. 2005;59(4):954-9."
      ]
    },
    {
      id: "nexus-torax",
      name: "Criterios NEXUS para la tomografía torácica",
      shortName: "NEXUS torácico",
      description: "Identifica a los pacientes con traumatismo torácico cerrado que requieren tomografía computarizada.",
      category: CAT_TRAUMA,
      specialty: UCI6,
      inputs: [
        { id: "mecanismo", type: "boolean", label: "Mecanismo de alta energía" },
        { id: "radiografia", type: "boolean", label: "Radiografía de tórax anormal" },
        { id: "esternon", type: "boolean", label: "Dolor a la palpación del esternón" },
        { id: "escapula", type: "boolean", label: "Dolor a la palpación de la escápula" },
        { id: "columna", type: "boolean", label: "Dolor a la palpación de la columna torácica" },
        { id: "costal", type: "boolean", label: "Dolor a la palpación de la parrilla costal" },
        { id: "edad", type: "boolean", label: "Edad > 60 años" },
        { id: "intoxicacion", type: "boolean", label: "Intoxicación" },
        { id: "distraccion", type: "boolean", label: "Lesión distractora dolorosa" },
        { id: "alerta", type: "boolean", label: "Alteración del nivel de alerta o del juicio" }
      ],
      compute: (v) => {
        const score = sum(v, ["mecanismo", "radiografia", "esternon", "escapula", "columna", "costal", "edad", "intoxicacion", "distraccion", "alerta"]);
        return {
          main: score === 0 ? "Bajo riesgo" : "Riesgo no bajo",
          secondary: String(score),
          secondaryLabel: score === 1 ? "criterio presente" : "criterios presentes",
          interpretation: score === 0 ? "Ningún criterio presente: puede evitarse la tomografía torácica (sensibilidad ≈ 99 % para lesiones torácicas significativas)." : "Al menos un criterio presente: valorar tomografía torácica según el contexto clínico.",
          level: score === 0 ? "ok" : "warn"
        };
      },
      references: [
        "Rodriguez RM, et al. Derivation and validation of two decision instruments for selective chest CT in blunt trauma. PLoS Med. 2015;12(10):e1001883."
      ]
    }
  ];

  // inurse-main/src/calculators/antropometria.ts
  var CAT19 = "Antropometría y metabolismo";
  var CAT_ENDO = "Endocrino y tóxicos";
  var UCI7 = ["Medicina Intensiva"];
  var antropometria = [
    {
      id: "imc-sc",
      name: "Índice de masa corporal y superficie corporal",
      shortName: "IMC / SC",
      description: "Calcula el índice de masa corporal y la superficie corporal.",
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
        const clas = imc < 16 ? "Delgadez grave" : imc < 17 ? "Delgadez moderada" : imc < 18.5 ? "Bajo peso" : imc < 25 ? "Normopeso" : imc < 30 ? "Sobrepeso" : imc < 35 ? "Obesidad grado I" : imc < 40 ? "Obesidad grado II" : "Obesidad grado III (mórbida)";
        return {
          main: fmt(imc, 1),
          mainUnit: "kg/m² (IMC)",
          secondary: fmt(mosteller, 2),
          secondaryLabel: "superficie corporal (m², Mosteller)",
          interpretation: `${clas} según la clasificación de la Organización Mundial de la Salud.`,
          level: imc < 18.5 ? "warn" : imc < 25 ? "ok" : imc < 30 ? "warn" : "danger",
          details: [
            `Superficie corporal (Du Bois): ${fmt(dubois, 2)} m².`,
            "El IMC no distingue masa grasa de masa magra ni valora la distribución de la grasa."
          ]
        };
      }
    },
    {
      id: "peso-ideal",
      name: "Peso corporal ideal, predicho y ajustado",
      shortName: "Peso ideal",
      description: "Calcula el peso ideal (fórmula de Devine), el peso predicho para la ventilación y el peso ajustado para dosificar fármacos.",
      category: CAT19,
      specialty: UCI7,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Varón", value: 0 },
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
          interpretation: v.peso > ideal * 1.3 ? "El peso real supera en más del 30 % al ideal: para muchos fármacos hidrófilos conviene dosificar por peso ideal o ajustado, no por peso real." : "El peso real está próximo al ideal.",
          level: "info",
          details: [
            `Peso corporal predicho (para volumen corriente en ventilación): ${fmt(predicho, 1)} kg.`,
            `Peso real respecto al ideal: ${fmt(exceso, 0)} %.`,
            "Peso ajustado = peso ideal + 0,4 × (peso real − peso ideal).",
            "Volumen corriente protector (6 mL/kg de peso predicho): " + fmt(predicho * 6, 0) + " mL."
          ]
        };
      },
      notes: [
        "La fórmula de Devine se diseñó para dosificar fármacos y solo es fiable a partir de 152 cm de talla.",
        "El peso predicho puede ser negativo o muy bajo en tallas muy pequeñas: en ese caso usar tablas pediátricas."
      ]
    },
    {
      id: "gasto-energetico",
      name: "Gasto energético basal (Harris-Benedict)",
      shortName: "Gasto energético",
      description: "Calcula las necesidades energéticas diarias.",
      category: CAT19,
      specialty: UCI7,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Varón", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 20, max: 300, step: 0.1 },
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 100, max: 230, step: 0.5 },
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 15, max: 110 },
        {
          id: "actividad",
          type: "select",
          label: "Factor de actividad o estrés",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Reposo en cama (1,2)", value: 1.2 },
            { label: "Actividad ligera (1,375)", value: 1.375 },
            { label: "Actividad moderada (1,55)", value: 1.55 },
            { label: "Actividad intensa (1,725)", value: 1.725 },
            { label: "Cirugía menor (1,2)", value: 1.2001 },
            { label: "Sepsis o traumatismo (1,3–1,5)", value: 1.4 },
            { label: "Quemadura extensa (1,5–2,0)", value: 1.75 }
          ],
          default: 1.2
        }
      ],
      compute: (v) => {
        var _a;
        const geb = v.sexo === 1 ? 655.1 + 9.563 * v.peso + 1.85 * v.talla - 4.676 * v.edad : 66.5 + 13.75 * v.peso + 5.003 * v.talla - 6.775 * v.edad;
        const total = geb * ((_a = v.actividad) != null ? _a : 1.2);
        const porKg = total / v.peso;
        return {
          main: fmt(total, 0),
          mainUnit: "kcal/día",
          secondary: fmt(geb, 0),
          secondaryLabel: "kcal/día en reposo (basal)",
          interpretation: "Estimación orientativa. En el paciente crítico, las guías recomiendan 20–25 kcal/kg/día en la fase aguda y 25–30 kcal/kg/día en la fase de recuperación, con 1,2–2,0 g/kg/día de proteínas.",
          level: "info",
          details: [
            `Equivale a ${fmt(porKg, 1)} kcal/kg/día.`,
            "La calorimetría indirecta sigue siendo el patrón de referencia; las fórmulas pueden errar de forma considerable en el paciente crítico."
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
      description: "Calcula las gotas por minuto cuando no se dispone de bomba de infusión.",
      category: CAT19,
      specialty: UCI7,
      inputs: [
        { id: "volumen", type: "number", label: "Volumen a infundir", unit: "mL", min: 1, max: 1e4, step: 1 },
        { id: "tiempo", type: "number", label: "Tiempo de infusión", unit: "min", min: 1, max: 2880, step: 1 },
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
        var _a;
        const gotasMin = v.volumen * ((_a = v.factor) != null ? _a : 20) / v.tiempo;
        const mlHora = v.volumen / v.tiempo * 60;
        return {
          main: fmt(gotasMin, 0),
          mainUnit: "gotas/min",
          secondary: fmt(mlHora, 1),
          secondaryLabel: "mL/h equivalentes",
          interpretation: "Contar las gotas durante 15 segundos y multiplicar por 4 para comprobar el ritmo; revisar periódicamente, ya que la gravedad hace que el ritmo varíe con el tiempo.",
          level: "info",
          details: [`Equivale a una gota cada ${fmt(60 / gotasMin, 1)} segundos.`]
        };
      }
    },
    {
      id: "etanol-estimado",
      name: "Concentración estimada de etanol y alcoholes tóxicos",
      shortName: "Etanol estimado",
      description: "Estima la concentración sanguínea de alcohol a partir de la cantidad ingerida.",
      category: CAT_ENDO,
      specialty: UCI7,
      inputs: [
        {
          id: "sexo",
          type: "select",
          label: "Sexo (volumen de distribución)",
          noPoints: true,
          options: [
            { label: "Varón (0,68 L/kg)", value: 0.68 },
            { label: "Mujer (0,55 L/kg)", value: 0.55 }
          ]
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 10, max: 250, step: 0.5 },
        { id: "volumen", type: "number", label: "Volumen ingerido", unit: "mL", min: 1, max: 5e3, step: 1 },
        { id: "concentracion", type: "number", label: "Graduación de la bebida", unit: "% vol", min: 0.5, max: 100, step: 0.5 },
        { id: "horas", type: "number", label: "Horas transcurridas desde la ingesta", unit: "h", min: 0, max: 48, step: 0.5 }
      ],
      compute: (v) => {
        var _a;
        const gramos = v.volumen * (v.concentracion / 100) * 0.789;
        const vd = ((_a = v.sexo) != null ? _a : 0.68) * v.peso;
        const pico = gramos / vd * 100;
        const eliminado = 20 * v.horas;
        const actual = Math.max(pico - eliminado, 0);
        return {
          main: fmt(actual, 0),
          mainUnit: "mg/dL estimados",
          secondary: fmt(pico, 0),
          secondaryLabel: "mg/dL de pico teórico",
          interpretation: actual >= 300 ? "Concentración potencialmente grave (≥ 300 mg/dL): riesgo de depresión respiratoria y coma; vigilar vía aérea." : actual >= 80 ? "Concentración en rango de intoxicación clínica evidente." : actual > 0 ? "Concentración estimada baja." : "Alcohol teóricamente eliminado según la estimación.",
          level: actual >= 300 ? "danger" : actual >= 80 ? "warn" : "ok",
          details: [
            `Alcohol ingerido: ${fmt(gramos, 1)} g (${fmt(gramos / 10, 1)} unidades de bebida estándar).`,
            "Se asume una eliminación de 20 mg/dL por hora (rango real 15–25; mayor en bebedores crónicos).",
            "Es una estimación teórica: no sustituye la determinación analítica ni la valoración clínica."
          ]
        };
      },
      notes: [
        "La fórmula de Widmark asume absorción completa y no considera el vaciamiento gástrico ni la ingesta simultánea de comida.",
        "Ante sospecha de metanol o etilenglicol, calcular el hiato osmolar y contactar con toxicología: la ausencia de etanol no descarta otros alcoholes."
      ]
    },
    {
      id: "burch-wartofsky",
      name: "Escala de Burch-Wartofsky para la crisis tirotóxica",
      shortName: "Burch-Wartofsky",
      description: "Estima la probabilidad de que una tirotoxicosis sea una crisis tiroidea.",
      category: CAT_ENDO,
      specialty: UCI7,
      inputs: [
        {
          id: "temperatura",
          type: "select",
          label: "Temperatura (°C)",
          dropdown: true,
          options: [
            { label: "< 37,2", value: 0 },
            { label: "37,2–37,7", value: 5 },
            { label: "37,8–38,2", value: 10 },
            { label: "38,3–38,8", value: 15 },
            { label: "38,9–39,4", value: 20 },
            { label: "39,4–39,9", value: 25 },
            { label: "≥ 40", value: 30 }
          ]
        },
        {
          id: "snc",
          type: "select",
          label: "Efectos sobre el sistema nervioso central",
          dropdown: true,
          options: [
            { label: "Ausentes", value: 0 },
            { label: "Leves (agitación)", value: 10 },
            { label: "Moderados (delirio, psicosis, letargia extrema)", value: 20 },
            { label: "Graves (convulsiones, coma)", value: 30 }
          ]
        },
        {
          id: "digestivo",
          type: "select",
          label: "Disfunción digestiva o hepática",
          dropdown: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "Moderada (diarrea, náuseas, vómitos, dolor abdominal)", value: 10 },
            { label: "Grave (ictericia inexplicada)", value: 20 }
          ]
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia cardíaca (lpm)",
          dropdown: true,
          options: [
            { label: "< 90", value: 0 },
            { label: "90–109", value: 5 },
            { label: "110–119", value: 10 },
            { label: "120–129", value: 15 },
            { label: "130–139", value: 20 },
            { label: "≥ 140", value: 25 }
          ]
        },
        {
          id: "icc",
          type: "select",
          label: "Insuficiencia cardíaca congestiva",
          dropdown: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "Leve (edema maleolar)", value: 5 },
            { label: "Moderada (crepitantes bibasales)", value: 10 },
            { label: "Grave (edema agudo de pulmón)", value: 15 }
          ]
        },
        {
          id: "fa",
          type: "select",
          label: "Fibrilación auricular",
          options: [
            { label: "Ausente", value: 0 },
            { label: "Presente", value: 10 }
          ]
        },
        {
          id: "desencadenante",
          type: "select",
          label: "Antecedente desencadenante",
          description: "Infección, cirugía, contraste yodado, parto, suspensión de antitiroideos.",
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
          interpretation: score >= 45 ? "Puntuación ≥ 45: altamente sugestiva de crisis tirotóxica. Tratamiento urgente en cuidados intensivos: betabloqueantes, tionamidas, yodo (al menos 1 hora después de la tionamida), corticoides y tratamiento del desencadenante." : score >= 25 ? "Puntuación 25–44: crisis tirotóxica inminente o probable; iniciar tratamiento y vigilancia estrecha." : "Puntuación < 25: crisis tirotóxica poco probable.",
          level: score >= 45 ? "danger" : score >= 25 ? "warn" : "ok"
        };
      },
      notes: ["La crisis tirotóxica es un diagnóstico clínico: esta escala apoya la decisión, pero no debe retrasar el tratamiento ante una sospecha alta."],
      references: [
        "Burch HB, Wartofsky L. Life-threatening thyrotoxicosis: thyroid storm. Endocrinol Metab Clin North Am. 1993;22(2):263-77."
      ]
    },
    {
      id: "coma-mixedematoso",
      name: "Puntuación diagnóstica del coma mixedematoso",
      shortName: "Coma mixedematoso",
      description: "Apoya el diagnóstico del coma mixedematoso (hipotiroidismo descompensado).",
      category: CAT_ENDO,
      specialty: UCI7,
      inputs: [
        {
          id: "temperatura",
          type: "select",
          label: "Temperatura (°C)",
          dropdown: true,
          options: [
            { label: "> 35", value: 0 },
            { label: "32–35", value: 10 },
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
            { label: "Obnubilación", value: 15 },
            { label: "Estupor", value: 20 },
            { label: "Coma o convulsiones", value: 30 }
          ]
        },
        {
          id: "digestivo",
          type: "select",
          label: "Síntomas digestivos",
          dropdown: true,
          options: [
            { label: "Ausentes", value: 0 },
            { label: "Anorexia, dolor abdominal o estreñimiento", value: 5 },
            { label: "Disminución del peristaltismo", value: 15 },
            { label: "Íleo paralítico o megacolon", value: 20 }
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
          label: "Alteraciones cardíacas",
          dropdown: true,
          options: [
            { label: "Ausentes", value: 0 },
            { label: "Bradicardia 50–59 lpm", value: 10 },
            { label: "Bradicardia 40–49 lpm", value: 20 },
            { label: "Bradicardia < 40 lpm, cambios en el ECG, derrame pericárdico o edema pulmonar", value: 30 }
          ]
        },
        {
          id: "metabolico",
          type: "select",
          label: "Alteraciones metabólicas",
          description: "Hiponatremia, hipoglucemia, hipoxemia, hipercapnia o descenso del filtrado glomerular.",
          dropdown: true,
          options: [
            { label: "Ninguna", value: 0 },
            { label: "Una", value: 10 },
            { label: "Dos", value: 15 },
            { label: "Tres o más", value: 20 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["temperatura", "snc", "digestivo", "precipitante", "cardiaco", "metabolico"]);
        return {
          main: String(score),
          mainUnit: "puntos",
          interpretation: score >= 60 ? "Puntuación ≥ 60: altamente sugestiva de coma mixedematoso. Tratamiento urgente con levotiroxina intravenosa, hidrocortisona (antes que la hormona tiroidea, hasta descartar insuficiencia suprarrenal), recalentamiento pasivo y soporte en cuidados intensivos." : score >= 45 ? "Puntuación 45–59: sugestiva; iniciar tratamiento y confirmar con la función tiroidea." : "Puntuación < 45: coma mixedematoso poco probable.",
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
      name: "Índice de Katz de independencia en las actividades básicas",
      shortName: "Katz",
      description: "Evalúa el estado funcional basal en las actividades básicas de la vida diaria.",
      category: CAT19,
      specialty: UCI7,
      inputs: [
        { id: "bano", type: "boolean", label: "Baño — independiente", labels: ["Dependiente", "Independiente"] },
        { id: "vestido", type: "boolean", label: "Vestido — independiente", labels: ["Dependiente", "Independiente"] },
        { id: "aseo", type: "boolean", label: "Uso del retrete — independiente", labels: ["Dependiente", "Independiente"] },
        { id: "movilidad", type: "boolean", label: "Movilidad / transferencias — independiente", labels: ["Dependiente", "Independiente"] },
        { id: "continencia", type: "boolean", label: "Continencia — continente", labels: ["Incontinente", "Continente"] },
        { id: "alimentacion", type: "boolean", label: "Alimentación — independiente", labels: ["Dependiente", "Independiente"] }
      ],
      compute: (v) => {
        const score = sum(v, ["bano", "vestido", "aseo", "movilidad", "continencia", "alimentacion"]);
        return {
          main: String(score),
          mainUnit: "de 6 actividades",
          interpretation: score === 6 ? "Independiente para todas las actividades básicas." : score >= 4 ? "Dependencia leve-moderada: valorar apoyos y rehabilitación." : "Dependencia grave: planificar cuidados y apoyo sociosanitario; es un dato pronóstico relevante en el paciente crítico y en la toma de decisiones sobre la intensidad terapéutica.",
          level: score === 6 ? "ok" : score >= 4 ? "warn" : "danger"
        };
      },
      references: [
        "Katz S, et al. Studies of illness in the aged. The index of ADL. JAMA. 1963;185:914-9."
      ]
    }
  ];

  // inurse-main/src/calculators/farmacia-formulas.ts
  var CAT_RENAL = "Función renal y ajuste de dosis";
  var CAT_FLUIDOS = "Fluidos, electrolitos e infusiones";
  var CAT_FARMACO = "Farmacología y dosificación";
  var FARM = ["Farmacia"];
  var farmaciaFormulas = [
    {
      id: "ckd-epi",
      name: "Ecuación CKD-EPI 2021 (sin raza)",
      shortName: "CKD-EPI",
      description: "Estima el filtrado glomerular en adultos mayores de 18 años; recomendada por las guías KDIGO actuales.",
      category: CAT_RENAL,
      specialty: FARM,
      inputs: [
        { id: "creatinina", type: "number", label: "Creatinina sérica", unit: "mg/dL", min: 0.1, max: 20, step: 0.01 },
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 18, max: 110 },
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          noPoints: true,
          options: [
            { label: "Varón", value: 0 },
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
          mainUnit: "mL/min/1,73 m²",
          secondary: estadio,
          secondaryLabel: "estadio KDIGO",
          interpretation: fge >= 60 ? "Filtrado conservado o levemente reducido. Solo hay enfermedad renal crónica si hay además daño renal (albuminuria, alteraciones estructurales) durante ≥ 3 meses." : fge >= 30 ? "Reducción moderada del filtrado: ajustar fármacos, evitar nefrotóxicos." : fge >= 15 ? "Reducción grave: seguimiento por nefrología y preparación del tratamiento sustitutivo." : "Fallo renal: valorar terapia renal sustitutiva.",
          level: fge >= 60 ? "ok" : fge >= 30 ? "warn" : "danger",
          details: [
            "CKD-EPI 2021 sin coeficiente racial (recomendado por NKF y ASN desde 2021).",
            "Para ajustar dosis de fármacos, muchas fichas técnicas todavía se basan en Cockcroft-Gault: verificar cada caso."
          ]
        };
      },
      notes: [
        "La ecuación devuelve el filtrado indexado por 1,73 m² de superficie corporal. Para pesos extremos, usar la versión no indexada.",
        "No aplicable en la insuficiencia renal aguda ni en el embarazo."
      ],
      references: [
        "Inker LA, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. N Engl J Med. 2021;385(19):1737-49."
      ]
    },
    {
      id: "schwartz-2009",
      name: "Ecuación de Schwartz revisada pediátrica (2009)",
      shortName: "Schwartz",
      description: "Estima el filtrado glomerular en pacientes pediátricos.",
      category: CAT_RENAL,
      specialty: FARM,
      inputs: [
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 30, max: 200, step: 0.5 },
        { id: "creatinina", type: "number", label: "Creatinina sérica", unit: "mg/dL", min: 0.05, max: 15, step: 0.01 }
      ],
      compute: (v) => {
        const fge = 0.413 * v.talla / v.creatinina;
        return {
          main: fmt(fge, 1),
          mainUnit: "mL/min/1,73 m²",
          interpretation: fge >= 90 ? "Filtrado glomerular estimado normal para la edad pediátrica." : fge >= 60 ? "Reducción leve." : "Reducción significativa: valorar por nefrología pediátrica.",
          level: fge >= 90 ? "ok" : fge >= 60 ? "warn" : "danger",
          details: ["FGe = 0,413 × talla (cm) / creatinina (mg/dL)."]
        };
      },
      notes: [
        "Validada en niños y adolescentes con enfermedad renal crónica y filtrado 15–75 mL/min/1,73 m².",
        "En neonatos, prematuros y lactantes pequeños la ecuación pierde exactitud."
      ],
      references: [
        "Schwartz GJ, et al. New equations to estimate GFR in children with CKD. J Am Soc Nephrol. 2009;20(3):629-37."
      ]
    },
    {
      id: "fenitoina-corregida",
      name: "Fenitoína corregida por albúmina e insuficiencia renal",
      shortName: "Fenitoína corregida",
      description: "Corrige la concentración total de fenitoína en pacientes con hipoalbuminemia o insuficiencia renal (fórmula de Sheiner-Tozer).",
      category: CAT_RENAL,
      specialty: FARM,
      inputs: [
        { id: "nivel", type: "number", label: "Fenitoína total medida", unit: "µg/mL", min: 0, max: 100, step: 0.1 },
        { id: "albumina", type: "number", label: "Albúmina sérica", unit: "g/dL", min: 0.5, max: 6, step: 0.1 },
        {
          id: "renal",
          type: "select",
          label: "Función renal",
          noPoints: true,
          options: [
            { label: "Conservada (aclaramiento ≥ 20 mL/min)", value: 0 },
            { label: "Insuficiencia renal grave (aclaramiento < 20 mL/min)", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const factor = v.renal === 1 ? 0.1 : 0.2;
        const corregida = v.nivel / (factor * v.albumina + 0.1);
        return {
          main: fmt(corregida, 1),
          mainUnit: "µg/mL corregida",
          interpretation: corregida < 10 ? "Rango infraterapéutico: valorar aumento de dosis según la clínica." : corregida <= 20 ? "Rango terapéutico (10–20 µg/mL)." : "Rango tóxico (> 20 µg/mL): valorar suspender o reducir la dosis y buscar signos de toxicidad (nistagmo, ataxia, disartria, alteración del nivel de conciencia).",
          level: corregida < 10 ? "warn" : corregida <= 20 ? "ok" : "danger",
          details: [
            `Fórmula: nivel medido / (${factor} × albúmina + 0,1).`,
            v.renal === 1 ? "Usa la fórmula modificada para pacientes con insuficiencia renal grave (factor 0,1 en lugar de 0,2)." : "Factor 0,2 (fórmula estándar)."
          ]
        };
      },
      notes: [
        "Si dispone de fenitoína libre, es preferible medirla directamente (rango terapéutico 1–2 µg/mL).",
        "La fórmula estima; los rangos son orientativos y deben integrarse con la respuesta clínica."
      ],
      references: [
        "Winter ME. Basic Clinical Pharmacokinetics. 5.ª ed. Lippincott, 2010."
      ]
    },
    {
      id: "gir",
      name: "Tasa de infusión de glucosa (GIR)",
      shortName: "GIR",
      description: "Cuantifica la velocidad a la que se administra glucosa por vía intravenosa (útil en neonatología y pediatría).",
      category: CAT_FLUIDOS,
      specialty: FARM,
      inputs: [
        { id: "ritmo", type: "number", label: "Ritmo de infusión", unit: "mL/h", min: 0.1, max: 500, step: 0.1 },
        { id: "concentracion", type: "number", label: "Concentración de glucosa", unit: "%", min: 1, max: 70, step: 0.5 },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 0.3, max: 200, step: 0.1 }
      ],
      compute: (v) => {
        const gir = v.ritmo * v.concentracion * 10 / (60 * v.peso);
        return {
          main: fmt(gir, 1),
          mainUnit: "mg/kg/min",
          interpretation: gir < 4 ? "GIR baja: puede ser insuficiente para prevenir la hipoglucemia en el neonato (objetivo habitual 4–8 mg/kg/min)." : gir <= 8 ? "GIR habitual de mantenimiento neonatal (4–8 mg/kg/min)." : gir <= 12 ? "GIR alta: vigilar hiperglucemia y la osmolaridad de la solución." : "GIR muy alta (> 12 mg/kg/min): riesgo de hiperglucemia y de esteatosis hepática; revisar la indicación y considerar insulina.",
          level: gir < 4 ? "warn" : gir <= 8 ? "ok" : gir <= 12 ? "warn" : "danger",
          details: [
            "Fórmula: GIR = (mL/h × % glucosa × 10) / (60 × peso).",
            `Aporte total de glucosa: ${fmt(v.ritmo * v.concentracion / 100 * 24, 1)} g/día.`,
            "Con GIR > 6 mg/kg/min por vía periférica se recomienda vía central si la osmolaridad supera 900 mOsm/L."
          ]
        };
      },
      references: [
        "Adamkin DH. Clinical Report—Postnatal Glucose Homeostasis in Late-Preterm and Term Infants. Pediatrics. 2011;127(3):575-9."
      ]
    },
    {
      id: "correccion-sodio",
      name: "Tasa de corrección de sodio (Adrogué-Madias)",
      shortName: "Corrección de sodio",
      description: "Estima el cambio de sodio sérico que produce 1 litro de la solución elegida y el volumen necesario para alcanzar un objetivo.",
      category: CAT_FLUIDOS,
      specialty: FARM,
      inputs: [
        {
          id: "poblacion",
          type: "select",
          label: "Grupo (fracción de agua corporal)",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Varón adulto (0,6)", value: 0.6 },
            { label: "Mujer adulta (0,5)", value: 0.5 },
            { label: "Varón anciano (0,5)", value: 0.5001 },
            { label: "Mujer anciana (0,45)", value: 0.45 },
            { label: "Niño (0,6)", value: 0.6002 }
          ],
          default: 0.6
        },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 3, max: 250, step: 0.5 },
        { id: "naActual", type: "number", label: "Sodio sérico actual", unit: "mEq/L", min: 100, max: 180, step: 0.1 },
        { id: "naObjetivo", type: "number", label: "Sodio sérico objetivo", unit: "mEq/L", min: 100, max: 180, step: 0.1 },
        {
          id: "solucion",
          type: "select",
          label: "Solución de infusión (Na⁺ infundido, mEq/L)",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Suero fisiológico 0,9 % (154)", value: 154 },
            { label: "Ringer lactato (130)", value: 130 },
            { label: "Suero salino hipertónico 3 % (513)", value: 513 },
            { label: "Suero salino hipertónico 2 % (342)", value: 342 },
            { label: "Suero salino 0,45 % (77)", value: 77 },
            { label: "Suero glucosado 5 % (0)", value: 0 }
          ],
          default: 154
        },
        {
          id: "horas",
          type: "number",
          label: "Tiempo previsto de corrección",
          unit: "h",
          min: 1,
          max: 96,
          step: 1
        }
      ],
      compute: (v) => {
        var _a, _b;
        const acT = ((_a = v.poblacion) != null ? _a : 0.6) * v.peso;
        const cambio = (((_b = v.solucion) != null ? _b : 154) - v.naActual) / (acT + 1);
        const objetivo = v.naObjetivo - v.naActual;
        const litros = cambio === 0 ? Infinity : objetivo / cambio;
        const ritmo = litros === Infinity ? 0 : litros * 1e3 / v.horas;
        const seguro = Math.abs(objetivo) / (v.horas / 24) <= (v.naActual < v.naObjetivo ? 10 : 10);
        return {
          main: fmt(cambio, 2),
          mainUnit: "mEq/L por cada litro infundido",
          secondary: litros === Infinity ? "—" : `${fmt(litros * 1e3, 0)} mL`,
          secondaryLabel: "volumen total para alcanzar el objetivo",
          interpretation: litros === Infinity ? "La solución elegida tiene la misma concentración que el sodio del paciente: no modificará la natremia." : (v.naActual < v.naObjetivo ? "Hiponatremia: no superar 10 mEq/L al día (8 mEq/L en pacientes con riesgo alto de mielinolisis: alcohólicos, malnutridos, hipopotasémicos, hepatopatía). En hiponatremia grave sintomática, aportar bolo de 100–150 mL de salino al 3 % y reevaluar." : "Hipernatremia: no bajar más de 10 mEq/L al día para evitar el edema cerebral.") + (seguro ? "" : " Atención: el ritmo previsto supera el límite recomendado."),
          level: !seguro ? "danger" : "warn",
          details: [
            `Ritmo aproximado: ${fmt(ritmo, 0)} mL/h.`,
            "Fórmula: ΔNa por litro = (Na infundido − Na sérico) / (agua corporal total + 1).",
            "Reevaluar sodio cada 2–4 h; no basar decisiones únicamente en el cálculo."
          ]
        };
      },
      notes: [
        "En la hiponatremia crónica, corregir de forma lenta (máx. 8–10 mEq/L en 24 h) para prevenir el síndrome de desmielinización osmótica.",
        "En la hipernatremia crónica, corregir a razón máxima de 10 mEq/L al día.",
        "Añadir el aporte de potasio de la solución al cálculo si es significativo."
      ],
      references: [
        "Adrogué HJ, Madias NE. Hyponatremia. N Engl J Med. 2000;342(21):1581-9."
      ]
    },
    {
      id: "balance-fluidos",
      name: "Balance de fluidos por entradas y salidas",
      shortName: "Balance de fluidos",
      description: "Calcula el balance hídrico diario y estima el sodio administrado y las pérdidas insensibles.",
      category: CAT_FLUIDOS,
      specialty: FARM,
      inputs: [
        { id: "iv", type: "number", label: "Fluidos intravenosos administrados", unit: "mL", min: 0, max: 2e4, step: 10 },
        { id: "oral", type: "number", label: "Ingesta oral / enteral", unit: "mL", min: 0, max: 1e4, step: 10 },
        { id: "diuresis", type: "number", label: "Diuresis", unit: "mL", min: 0, max: 2e4, step: 10 },
        { id: "perdidas", type: "number", label: "Otras pérdidas (SNG, drenajes, heces líquidas)", unit: "mL", min: 0, max: 2e4, step: 10 },
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 1, max: 250, step: 0.5 },
        { id: "temp", type: "number", label: "Temperatura máxima", unit: "°C", min: 34, max: 42, step: 0.1 },
        { id: "horas", type: "number", label: "Horas del período", unit: "h", min: 1, max: 72, step: 1 }
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
          interpretation: balance > 500 ? "Balance positivo: valorar riesgo de sobrecarga (crepitantes, edema, presión venosa)." : balance < -500 ? "Balance negativo: valorar hipoperfusión y ajustar el aporte." : "Balance dentro de un rango habitual.",
          level: balance > 1e3 || balance < -1e3 ? "warn" : "ok",
          details: [
            `Pérdidas insensibles estimadas: ${fmt(insensibles, 0)} mL (0,5 mL/kg/h).`,
            `Pérdidas adicionales por fiebre: ${fmt(extraFiebre, 0)} mL (0,5 mL/kg por cada °C sobre 37).`,
            "Sumar sudoración profusa y taquipnea marcadas si son significativas."
          ]
        };
      }
    },
    {
      id: "conversion-esteroides",
      name: "Conversión de esteroides",
      shortName: "Esteroides",
      description: "Convierte dosis de corticoides sistémicos entre sí usando la potencia glucocorticoide relativa.",
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
        var _a, _b;
        const equiv = v.dosis * ((_a = v.destino) != null ? _a : 4) / ((_b = v.origen) != null ? _b : 5);
        return {
          main: fmt(equiv, 2),
          mainUnit: "mg equivalentes",
          interpretation: "Equivalencia glucocorticoide orientativa. Los corticoides difieren también en potencia mineralocorticoide y duración de acción; adaptar la pauta al escenario clínico.",
          level: "info",
          details: [
            "Potencia mineralocorticoide: cortisona e hidrocortisona alta; prednisona/prednisolona intermedia; metilprednisolona/triamcinolona baja; dexametasona/betametasona nula.",
            "Duración de acción: cortisona/hidrocortisona corta (8–12 h); prednisona/prednisolona/metilprednisolona/triamcinolona/deflazacort intermedia (12–36 h); dexametasona/betametasona larga (36–72 h)."
          ]
        };
      },
      notes: [
        "La conversión de fluticasona, budesonida u otros inhalados o tópicos no es equivalente a la sistémica: no usar esta calculadora para ellos.",
        "En dosis > 40 mg/día de equivalentes de prednisona, valorar profilaxis gástrica y ósea, y cribado del riesgo cardiometabólico."
      ],
      references: [
        "Liu D, et al. A practical guide to the monitoring and management of the complications of systemic corticosteroid therapy. Allergy Asthma Clin Immunol. 2013;9(1):30."
      ]
    },
    {
      id: "levotiroxina",
      name: "Dosis inicial de levotiroxina para el hipotiroidismo",
      shortName: "Levotiroxina",
      description: "Estima la dosis diaria de levotiroxina en función del peso y del contexto clínico.",
      category: CAT_FARMACO,
      specialty: FARM,
      inputs: [
        { id: "peso", type: "number", label: "Peso", unit: "kg", min: 30, max: 200, step: 0.5 },
        {
          id: "contexto",
          type: "select",
          label: "Contexto clínico",
          noPoints: true,
          dropdown: true,
          options: [
            { label: "Hipotiroidismo primario en paciente joven sano (1,6 µg/kg/día)", value: 1.6 },
            { label: "Anciano o cardiopatía (0,3–0,5 µg/kg/día, comenzar bajo)", value: 0.4 },
            { label: "Post-tiroidectomía por cáncer (2,0 µg/kg/día)", value: 2 },
            { label: "Post-tiroidectomía benigna (1,7 µg/kg/día)", value: 1.7 },
            { label: "Embarazo (2,0–2,4 µg/kg/día)", value: 2.2 }
          ],
          default: 1.6
        }
      ],
      compute: (v) => {
        var _a;
        const dosis = v.peso * ((_a = v.contexto) != null ? _a : 1.6);
        const dosisRedondeada = Math.round(dosis / 12.5) * 12.5;
        return {
          main: fmt(dosisRedondeada, 1),
          mainUnit: "µg/día",
          secondary: fmt(dosis, 0),
          secondaryLabel: "µg/día calculados sin redondear",
          interpretation: "Administrar en ayunas, 30–60 min antes del desayuno. Reevaluar TSH a las 6–8 semanas y ajustar la dosis en incrementos de 12,5–25 µg. En ancianos y cardiópatas, iniciar con 12,5–25 µg/día e ir subiendo.",
          level: "info",
          details: ["Presentaciones habituales: 25, 50, 75, 88, 100, 112, 125, 137, 150, 175, 200 µg."]
        };
      },
      references: [
        "Jonklaas J, et al. Guidelines for the Treatment of Hypothyroidism (American Thyroid Association). Thyroid. 2014;24(12):1670-751."
      ]
    },
    {
      id: "hidroxicloroquina",
      name: "Dosis máxima segura de hidroxicloroquina",
      shortName: "Hidroxicloroquina",
      description: "Calcula la dosis máxima diaria de hidroxicloroquina que minimiza el riesgo de retinopatía (guía AAO 2016).",
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
          mainUnit: "mg/día (máximo)",
          secondary: fmt(dosis, 0),
          secondaryLabel: "mg/día calculados",
          interpretation: "Dosis diaria máxima: 5 mg/kg de peso real, sin superar 400 mg/día. Cribado oftalmológico basal y anual a partir del quinto año (antes si hay factores de riesgo).",
          level: "info",
          details: [
            "La guía anterior (6,5 mg/kg de peso ideal) infraestimaba el riesgo en pacientes con sobrepeso.",
            "Factores de riesgo de retinopatía: dosis > 5 mg/kg/día, duración > 5 años, insuficiencia renal, uso concomitante de tamoxifeno, patología macular preexistente."
          ]
        };
      },
      references: [
        "Marmor MF, et al. Recommendations on Screening for Chloroquine and Hydroxychloroquine Retinopathy. Ophthalmology. 2016;123(6):1386-94."
      ]
    }
  ];

  // inurse-main/src/calculators/farmacia-opioides.ts
  var CAT20 = "Opioides, benzodiacepinas y controlados";
  var FARM2 = ["Farmacia"];
  var MME_FACTORS = [
    { label: "Morfina", via: "oral", factor: 1 },
    { label: "Morfina", via: "IV o SC", factor: 3 },
    { label: "Codeína", via: "oral", factor: 0.15 },
    { label: "Tramadol", via: "oral", factor: 0.1 },
    { label: "Hidrocodona", via: "oral", factor: 1 },
    { label: "Oxicodona", via: "oral", factor: 1.5 },
    { label: "Oxicodona", via: "IV", factor: 3 },
    { label: "Hidromorfona", via: "oral", factor: 4 },
    { label: "Hidromorfona", via: "IV o SC", factor: 20 },
    { label: "Tapentadol", via: "oral", factor: 0.4 },
    { label: "Fentanilo parche", via: "transdérmico (µg/h)", factor: 2.4, nota: "Multiplica los µg/h del parche por 2,4 para obtener MME/día" },
    { label: "Meperidina (petidina)", via: "oral", factor: 0.1 },
    { label: "Metadona", via: "oral (≤ 20 mg/día)", factor: 4 },
    { label: "Metadona", via: "oral (21–40 mg/día)", factor: 8 },
    { label: "Metadona", via: "oral (41–60 mg/día)", factor: 10 },
    { label: "Metadona", via: "oral (> 60 mg/día)", factor: 12 },
    { label: "Buprenorfina", via: "transdérmica (µg/h)", factor: 12.6, nota: "µg/h × 12,6 = MME/día (aproximación)" },
    { label: "Buprenorfina", via: "sublingual (mg)", factor: 30, nota: "Aproximación; hay controversia sobre su MME por efecto techo" }
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
      name: "Miligramos equivalentes de morfina al día (MME)",
      shortName: "MME diario",
      description: "Convierte una dosis diaria de opioide a miligramos equivalentes de morfina oral usando los factores de los CDC.",
      category: CAT20,
      specialty: FARM2,
      inputs: [
        {
          id: "farmaco",
          type: "select",
          label: "Opioide y vía",
          noPoints: true,
          dropdown: true,
          options: MME_FACTORS.map((m, i) => ({
            label: `${m.label} (${m.via})`,
            value: i
          }))
        },
        { id: "dosis", type: "number", label: "Dosis diaria total", unit: "mg (o µg/h en parches)", min: 0, max: 5e3, step: 0.5 }
      ],
      compute: (v) => {
        var _a, _b;
        const m = MME_FACTORS[(_a = v.farmaco) != null ? _a : 0];
        const mme = v.dosis * m.factor;
        const banda = mme < 50 ? "baja" : mme < 90 ? "moderada" : mme < 200 ? "alta" : "muy alta";
        const level = mme < 50 ? "ok" : mme < 90 ? "warn" : "danger";
        return {
          main: fmt(mme, 1),
          mainUnit: "MME/día",
          secondary: `Dosis ${banda}`,
          interpretation: mme < 50 ? "Dosis diaria baja según los umbrales de los CDC." : mme < 90 ? "A partir de 50 MME/día, los CDC recomiendan reevaluar riesgos y beneficios, considerar naloxona domiciliaria y revisar comorbilidades." : mme < 200 ? "Dosis alta (≥ 90 MME/día): valorar consulta a unidad del dolor, evitar aumentos y aportar naloxona." : "Dosis muy alta (≥ 200 MME/día): riesgo significativo de sobredosis. Revisar indicación y estrategia de deshabituación.",
          level,
          details: [
            `Factor de conversión: 1 mg de ${m.label} (${m.via}) = ${fmt(m.factor, 2)} MME.`,
            (_b = m.nota) != null ? _b : "La conversión es solo orientativa: cada paciente puede tener sensibilidad muy distinta.",
            "La metadona no es lineal: usar la tabla por tramo de dosis y ajustar con especial precaución."
          ]
        };
      },
      notes: [
        "Estos factores no son dosis clínicamente equivalentes ni deben usarse para rotar un opioide a otro sin reducir la dosis calculada al menos un 25–50 % por tolerancia cruzada incompleta.",
        "Los CDC recomiendan revaluar cuidadosamente cualquier paciente con ≥ 50 MME/día y evitar en general los ≥ 90 MME/día para dolor crónico no oncológico.",
        "La buprenorfina tiene efecto techo y su conversión a MME es controvertida; interprétala solo como orientación."
      ],
      references: [
        "Dowell D, et al. CDC Clinical Practice Guideline for Prescribing Opioids for Pain — United States, 2022. MMWR Recomm Rep. 2022;71(3):1-95."
      ]
    },
    {
      id: "rotacion-opioides",
      name: "Rotación de opioides",
      shortName: "Rotación de opioides",
      description: "Convierte una dosis de un opioide a otro usando los factores de MME y aplica una reducción de seguridad por tolerancia cruzada incompleta.",
      category: CAT20,
      specialty: FARM2,
      inputs: [
        {
          id: "origen",
          type: "select",
          label: "Opioide y vía de partida",
          noPoints: true,
          dropdown: true,
          options: MME_FACTORS.map((m, i) => ({
            label: `${m.label} (${m.via})`,
            value: i
          }))
        },
        { id: "dosis", type: "number", label: "Dosis diaria de partida", unit: "mg (o µg/h)", min: 0, max: 5e3, step: 0.5 },
        {
          id: "destino",
          type: "select",
          label: "Opioide y vía de destino",
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
          label: "Reducción de seguridad por tolerancia cruzada",
          noPoints: true,
          options: [
            { label: "25 % (dolor bien controlado, paciente estable)", value: 0.75 },
            { label: "33 % (habitual)", value: 0.67 },
            { label: "50 % (rotación a metadona, ancianos, comorbilidad)", value: 0.5 },
            { label: "Sin reducción", value: 1 }
          ],
          default: 0.67
        }
      ],
      compute: (v) => {
        var _a, _b, _c;
        const o = MME_FACTORS[(_a = v.origen) != null ? _a : 0];
        const d = MME_FACTORS[(_b = v.destino) != null ? _b : 0];
        if (!d.factor)
          return { main: "—", interpretation: "El opioide de destino no tiene factor definido.", level: "warn" };
        const mme = v.dosis * o.factor;
        const equivalente = mme / d.factor;
        const ajustada = equivalente * ((_c = v.reduccion) != null ? _c : 0.67);
        const rescate = ajustada * 0.1;
        return {
          main: fmt(ajustada, 1),
          mainUnit: `mg/día de ${d.label} (${d.via})`,
          secondary: fmt(mme, 1),
          secondaryLabel: "MME/día equivalentes",
          interpretation: `Dosis inicial recomendada tras la rotación. Repartir en las tomas habituales del opioide de destino y ajustar según respuesta y efectos adversos. Prever pauta de rescate (aprox. 10 % de la dosis diaria).`,
          level: "warn",
          details: [
            `Equivalente sin reducción: ${fmt(equivalente, 1)} mg/día.`,
            `Rescate orientativo: ${fmt(rescate, 1)} mg cada 4 h a demanda.`,
            "La rotación a metadona requiere consulta con especialista: la relación de conversión no es lineal y su vida media prolongada aumenta el riesgo de acumulación.",
            "En rotación a parche transdérmico, mantener la analgesia previa 12–24 h tras la aplicación mientras se alcanza el estado estacionario."
          ]
        };
      },
      notes: [
        "Herramienta de apoyo: la rotación exige valoración clínica individual y monitorización estrecha en las primeras 24–72 h.",
        "Reduce la dosis calculada si el paciente presenta ancianidad, insuficiencia renal o hepática, comorbilidad respiratoria o síndrome de apnea."
      ],
      references: [
        'Fine PG, Portenoy RK. Establishing "best practices" for opioid rotation. J Pain Symptom Manage. 2009;38(3):418-25.'
      ]
    },
    {
      id: "conversion-benzodiacepinas",
      name: "Conversión de benzodiacepinas",
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
        var _a, _b;
        const o = BENZO_EQUIV[(_a = v.origen) != null ? _a : 0];
        const d = BENZO_EQUIV[(_b = v.destino) != null ? _b : 0];
        const diazepamEq = v.dosis / o.factor * 10;
        const equivalente = diazepamEq * d.factor / 10;
        return {
          main: fmt(equivalente, 2),
          mainUnit: `mg/día de ${d.label}`,
          secondary: fmt(diazepamEq, 1),
          secondaryLabel: "mg/día equivalentes de diazepam",
          interpretation: "La conversión entre benzodiacepinas es aproximada y la variabilidad interindividual es alta. Vida media, potencia y ansiedad rebote difieren de una molécula a otra.",
          level: "warn",
          details: [
            `Equivalencia de referencia: 10 mg de diazepam ≡ ${fmt(o.factor, 2)} mg de ${o.label} ≡ ${fmt(d.factor, 2)} mg de ${d.label}.`,
            "Al pasar a diazepam para deshabituación se aprovecha su vida media larga; hacerlo de forma gradual (5–10 % de reducción cada 2–4 semanas).",
            "La retirada brusca puede precipitar convulsiones y delirio: nunca suspender abruptamente en tratamiento crónico."
          ]
        };
      },
      notes: ["Los factores de equivalencia proceden del manual clásico de Ashton; la comunidad clínica los utiliza como referencia orientativa."],
      references: [
        "Ashton CH. Benzodiazepines: How they work and how to withdraw. Universidad de Newcastle, 2002 (rev. 2007)."
      ]
    },
    {
      id: "ciwa-b",
      name: "CIWA-B para la abstinencia de benzodiacepinas",
      shortName: "CIWA-B",
      description: "Evalúa la gravedad del síndrome de abstinencia de benzodiacepinas.",
      category: CAT20,
      specialty: FARM2,
      inputs: [
        ...[
          ["irritabilidad", "Irritabilidad"],
          ["fatiga", "Fatiga"],
          ["tension", "Tensión muscular"],
          ["dificultadConcentracion", "Dificultad para concentrarse"],
          ["perdidaApetito", "Pérdida de apetito"],
          ["entumecimiento", "Entumecimiento u hormigueos"],
          ["tinnitus", "Zumbidos de oídos"],
          ["confusion", "Confusión"],
          ["fotofobia", "Molestia con la luz"],
          ["fonofobia", "Molestia con el ruido"],
          ["pesadillas", "Pesadillas"],
          ["nauseas", "Náuseas"],
          ["temblor", "Temblor"],
          ["sudoracion", "Sudoración"],
          ["ansiedad", "Ansiedad"],
          ["agitacion", "Agitación"],
          ["alucinacionesV", "Alucinaciones visuales"],
          ["alucinacionesA", "Alucinaciones auditivas"],
          ["alucinacionesT", "Alucinaciones táctiles"]
        ].map(([id, label]) => ({
          id,
          type: "select",
          label,
          options: [
            { label: "0 — Nada", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4 — Muy intenso", value: 4 }
          ]
        })),
        {
          id: "sueno",
          type: "select",
          label: "Alteración del sueño",
          options: [
            { label: "0 — Normal", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4 — Insomnio grave", value: 4 }
          ]
        },
        {
          id: "debilidad",
          type: "select",
          label: "Debilidad muscular",
          options: [
            { label: "0 — Ninguna", value: 0 },
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4 — Grave", value: 4 }
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
        const score = ids.reduce((acc, id) => {
          var _a;
          return acc + ((_a = v[id]) != null ? _a : 0);
        }, 0);
        return {
          main: String(score),
          mainUnit: "puntos (0–84)",
          interpretation: score < 20 ? "Abstinencia leve: continuar reducción gradual y vigilar." : score < 40 ? "Abstinencia moderada: enlentecer o parar la reducción y valorar apoyo farmacológico." : "Abstinencia intensa: riesgo de convulsiones y delirio; ingreso y tratamiento activo.",
          level: score < 20 ? "ok" : score < 40 ? "warn" : "danger"
        };
      },
      notes: ["Los umbrales son orientativos; la CIWA-B se usa junto a la clínica para modular el ritmo de deshabituación."],
      references: [
        "Busto UE, et al. Clinical Institute Withdrawal Assessment for Benzodiazepines (CIWA-B). J Clin Psychopharmacol. 1989;9(6):412-6."
      ]
    }
  ];

  // inurse-main/src/calculators/index.ts
  var CATEGORIES = [
    "Gravedad en UCI y sepsis",
    "Neurocrítico e ictus",
    "Respiratorio crítico y ventilación",
    "Renal, iones y equilibrio ácido-base",
    "Hepatología y digestivo",
    "Hematología y oncología",
    "Trauma y quemados",
    "Riesgo perioperatorio",
    "Vía aérea",
    "Fibrilación auricular y anticoagulación",
    "Síndrome coronario agudo y dolor torácico",
    "Insuficiencia cardíaca",
    "Síncope",
    "Tromboembolismo venoso",
    "Criterios diagnósticos",
    "Gravedad y pronóstico",
    "Dolor",
    "Respiratorio y ventilación",
    "Hemodinámica y fluidos",
    "Neurológico, sedación y gravedad",
    "Alcohol y abstinencia",
    "Infecciones",
    "Endocrino y tóxicos",
    "Antropometría y metabolismo",
    "Función renal y ajuste de dosis",
    "Fluidos, electrolitos e infusiones",
    "Opioides, benzodiacepinas y controlados",
    "Farmacología y dosificación",
    "Fórmulas y cálculos clínicos"
  ];
  var SPECIALTIES = ["Anestesiología", "Cardiología", "Medicina Intensiva", "Farmacia"];
  var EXTRA_SPECIALTIES = {
    // Anestesiología ↔ Cardiología
    pam: ["Cardiología", "Medicina Intensiva"],
    rcri: ["Cardiología"],
    dasi: ["Cardiología", "Medicina Intensiva"],
    charlson: ["Cardiología", "Medicina Intensiva"],
    care: ["Cardiología"],
    cage: ["Cardiología"],
    vexus: ["Cardiología"],
    // Compartidas con Medicina Intensiva
    "fluidos-mantenimiento": ["Anestesiología", "Medicina Intensiva", "Farmacia"],
    "calcio-corregido": ["Anestesiología", "Medicina Intensiva"],
    qtc: ["Anestesiología"],
    diuresis: ["Anestesiología", "Medicina Intensiva"],
    light: ["Anestesiología", "Medicina Intensiva"],
    mews: ["Anestesiología", "Medicina Intensiva"],
    mmrc: ["Anestesiología", "Medicina Intensiva"],
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
    "cockcroft-gault": ["Anestesiología", "Medicina Intensiva", "Farmacia"],
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
    ...formulas
  ];
  var CALCULATORS = ALL.map((c) => {
    const extra = EXTRA_SPECIALTIES[c.id];
    return extra ? { ...c, specialty: [.../* @__PURE__ */ new Set([...c.specialty, ...extra])] } : c;
  });

  // entry2.ts
  window.ENFERIX_ESCALAS_DATA = { CATEGORIES, SPECIALTIES, CALCULATORS };
})();
