/* =========================================================================
   Enferix · Índices y escalas clínicas (Anestesiología)
   35 calculadoras con sus fórmulas, notas clínicas y referencias.
   Portado del proyecto React+TypeScript juankydue-dev/inurse
   (rama claude/indices-escalas-app-55c6g3) a JavaScript plano con esbuild;
   define window.ENFERIX_ESCALAS_DATA = { CATEGORIES, CALCULATORS }.
   La interfaz que lo consume vive en
   /js/calculadoras/inurse-escalas-anestesia-js.js.
   ========================================================================= */
(() => {
  // inurse-src/src/engine/types.ts
  var sum = (v, ids) => ids.reduce((acc, id) => {
    var _a;
    return acc + ((_a = v[id]) != null ? _a : 0);
  }, 0);
  var fmt = (n, dec = 0) => n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: dec });

  // inurse-src/src/calculators/riesgo.ts
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

  // inurse-src/src/calculators/dolor.ts
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

  // inurse-src/src/calculators/viaaerea.ts
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

  // inurse-src/src/calculators/respiratorio.ts
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

  // inurse-src/src/calculators/hemodinamica.ts
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

  // inurse-src/src/calculators/neuro.ts
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

  // inurse-src/src/calculators/alcohol.ts
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

  // inurse-src/src/calculators/infecciones.ts
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

  // inurse-src/src/calculators/farmacologia.ts
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

  // inurse-src/src/calculators/index.ts
  var CATEGORIES = [
    "Riesgo perioperatorio",
    "Dolor",
    "Vía aérea",
    "Respiratorio y ventilación",
    "Hemodinámica y fluidos",
    "Neurológico, sedación y gravedad",
    "Alcohol y abstinencia",
    "Infecciones",
    "Farmacología y dosificación"
  ];
  var CALCULATORS = [
    ...riesgo,
    ...dolor,
    ...viaAerea,
    ...respiratorio,
    ...hemodinamica,
    ...neuro,
    ...alcohol,
    ...infecciones,
    ...farmacologia
  ];

  // entry.ts
  window.ENFERIX_ESCALAS_DATA = { CATEGORIES, CALCULATORS };
})();
