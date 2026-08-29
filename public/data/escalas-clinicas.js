/* =========================================================================
   Enferix · Índices y escalas clínicas
   320 calculadoras en 41 categorías y 11 especialidades: Anestesiología (46),
   Cardiología (69), Medicina Intensiva (142), Farmacia (24), Pediatría (31),
   Cuidados Críticos Neonatales (12), Neurología crítica (11), Emergencias (18),
   Medicina Familiar (34), Cirugía Cardiotorácica (13) y Obstetricia (2).
   Muchas escalas se comparten entre especialidades, por eso las cifras suman
   más que el total.
   Incluye fórmulas, notas clínicas, referencias bibliográficas y las
   advertencias de seguridad de cada escala.
   Portado del proyecto React+TypeScript juankydue-dev/inurse (rama main)
   a JavaScript plano con esbuild; define
   window.ENFERIX_ESCALAS_DATA = { CATEGORIES, SPECIALTIES, CALCULATORS }.
   La interfaz que lo consume vive en
   /js/calculadoras/inurse-escalas-clinicas-js.js.
   ========================================================================= */
(() => {
  // inurse-m2/src/engine/types.ts
  var sum = (v, ids) => ids.reduce((acc, id) => {
    var _a;
    return acc + ((_a = v[id]) != null ? _a : 0);
  }, 0);
  var fmt = (n, dec = 0) => n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: dec });

  // inurse-m2/src/calculators/riesgo.ts
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

  // inurse-m2/src/calculators/dolor.ts
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

  // inurse-m2/src/calculators/viaaerea.ts
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

  // inurse-m2/src/calculators/respiratorio.ts
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

  // inurse-m2/src/calculators/hemodinamica.ts
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

  // inurse-m2/src/calculators/neuro.ts
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

  // inurse-m2/src/calculators/alcohol.ts
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

  // inurse-m2/src/calculators/infecciones.ts
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

  // inurse-m2/src/calculators/farmacologia.ts
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

  // inurse-m2/src/calculators/cardio-fa.ts
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

  // inurse-m2/src/calculators/cardio-sca.ts
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

  // inurse-m2/src/calculators/cardio-tev.ts
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

  // inurse-m2/src/calculators/cardio-ic-sincope.ts
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

  // inurse-m2/src/calculators/cardio-varios.ts
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

  // inurse-m2/src/calculators/formulas.ts
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

  // inurse-m2/src/calculators/neurocritico.ts
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

  // inurse-m2/src/calculators/uci-gravedad.ts
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

  // inurse-m2/src/calculators/respiratorio-critico.ts
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

  // inurse-m2/src/calculators/renal-metabolico.ts
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

  // inurse-m2/src/calculators/hepato-digestivo.ts
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

  // inurse-m2/src/calculators/hemato-trauma.ts
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

  // inurse-m2/src/calculators/antropometria.ts
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

  // inurse-m2/src/calculators/farmacia-formulas.ts
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

  // inurse-m2/src/calculators/farmacia-opioides.ts
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

  // inurse-m2/src/calculators/pediatria.ts
  var CAT21 = "Neonatología y pediatría";
  var PED = ["Cuidados Críticos Neonatales", "Pediatría"];
  var escala6 = (items) => items.map(([value, label]) => ({ label: `${value} — ${label}`, value }));
  var pediatria = [
    {
      id: "apgar",
      name: "Puntuación de Apgar del recién nacido",
      shortName: "Apgar",
      description: "Evalúa la adaptación del recién nacido al minuto 1, 5 (y si procede al 10) de vida.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "aspecto",
          type: "select",
          label: "Aspecto (color)",
          dropdown: true,
          options: escala6([
            [0, "Azul o pálido"],
            [1, "Cuerpo rosado, extremidades azules (acrocianosis)"],
            [2, "Rosado en todo el cuerpo"]
          ])
        },
        {
          id: "pulso",
          type: "select",
          label: "Pulso (frecuencia cardíaca)",
          dropdown: true,
          options: escala6([
            [0, "Ausente"],
            [1, "< 100 lpm"],
            [2, "≥ 100 lpm"]
          ])
        },
        {
          id: "gesto",
          type: "select",
          label: "Gesto (respuesta al estímulo)",
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
            [0, "Flácido"],
            [1, "Cierta flexión de extremidades"],
            [2, "Movimientos activos, buena flexión"]
          ])
        },
        {
          id: "respiracion",
          type: "select",
          label: "Respiración",
          dropdown: true,
          options: escala6([
            [0, "Ausente"],
            [1, "Débil, irregular o boqueo"],
            [2, "Buena, llanto vigoroso"]
          ])
        }
      ],
      compute: (v) => {
        const score = sum(v, ["aspecto", "pulso", "gesto", "actividad", "respiracion"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          interpretation: score >= 7 ? "Adaptación adecuada (7–10). Cuidados habituales." : score >= 4 ? "Adaptación moderadamente deprimida (4–6): reevaluar y valorar apoyo respiratorio." : "Adaptación gravemente deprimida (0–3): iniciar reanimación neonatal.",
          level: score >= 7 ? "ok" : score >= 4 ? "warn" : "danger"
        };
      },
      notes: [
        "Se registra al minuto 1 y a los 5 minutos; si a los 5 minutos es < 7, repetir cada 5 minutos hasta 20 minutos.",
        "La Academia Americana de Pediatría desaconseja usar el Apgar como único criterio para diagnóstico de asfixia perinatal o para decisiones sobre reanimación (que debe iniciarse ya en el minuto 0 según necesidad)."
      ],
      references: [
        "Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-7.",
        "American Academy of Pediatrics; ACOG. The Apgar Score. Pediatrics. 2015;136(4):819-22."
      ]
    },
    {
      id: "finnegan",
      name: "Puntuación de Finnegan modificada para abstinencia neonatal (NAS)",
      shortName: "Finnegan (NAS)",
      description: "Cuantifica la gravedad del síndrome de abstinencia neonatal por opioides y guía el tratamiento farmacológico.",
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
          label: "Sueño tras la toma",
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
            [1, "Leve al estímulo"],
            [2, "Moderado-intenso al estímulo"],
            [3, "Moderado-intenso en reposo"],
            [4, "Intenso continuo en reposo"]
          ])
        },
        { id: "tono", type: "boolean", label: "Aumento del tono muscular", points: 2 },
        { id: "erosiones", type: "boolean", label: "Erosiones/excoriaciones cutáneas", points: 1 },
        { id: "mioclonias", type: "boolean", label: "Mioclonías", points: 3 },
        { id: "convulsiones", type: "boolean", label: "Convulsiones generalizadas", points: 5 },
        {
          id: "sudoracion",
          type: "boolean",
          label: "Sudoración"
        },
        {
          id: "temperatura",
          type: "select",
          label: "Temperatura",
          dropdown: true,
          options: escala6([
            [0, "Normal"],
            [1, "37,2–38,3 °C"],
            [2, "> 38,3 °C"]
          ])
        },
        { id: "bostezos", type: "boolean", label: "Bostezos frecuentes (> 3–4 en el intervalo)" },
        { id: "aleteo", type: "boolean", label: "Aleteo nasal", points: 2 },
        {
          id: "estornudos",
          type: "boolean",
          label: "Estornudos frecuentes (> 3–4 en el intervalo)"
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
        { id: "succion", type: "boolean", label: "Succión excesiva o desorganizada" },
        { id: "alimentacion", type: "boolean", label: "Toma deficiente (< 15 min o toma escasa)", points: 2 },
        { id: "regurgitacion", type: "boolean", label: "Regurgitación / vómitos en escopetazo", points: 2 },
        {
          id: "deposiciones",
          type: "select",
          label: "Deposiciones",
          dropdown: true,
          options: escala6([
            [0, "Normales"],
            [2, "Blandas"],
            [3, "Líquidas o explosivas"]
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
          interpretation: score < 8 ? "Abstinencia leve: continuar cuidados no farmacológicos (contacto piel con piel, lactancia materna, ambiente tranquilo, agrupación de cuidados)." : score <= 11 ? "Abstinencia moderada: si se repite ≥ 8 en dos evaluaciones consecutivas (o ≥ 12 en una), iniciar tratamiento farmacológico (morfina oral 0,04 mg/kg/dosis cada 3–4 h suele ser el fármaco de primera línea)." : "Abstinencia intensa: tratamiento farmacológico y valoración por neonatología. Ajustar dosis según puntuación cada 3–4 h.",
          level: score < 8 ? "ok" : score <= 11 ? "warn" : "danger"
        };
      },
      notes: [
        "Evaluar cada 3–4 h coincidiendo con las tomas; nunca despertar al niño para valorar.",
        "La AAP recomienda desde 2020 priorizar los cuidados no farmacológicos y usar herramientas más simples como Eat-Sleep-Console cuando sea posible; Finnegan sigue vigente donde no se haya adoptado el nuevo enfoque.",
        "Un umbral de tratamiento farmacológico habitual es puntuación ≥ 8 en dos evaluaciones consecutivas o ≥ 12 en una."
      ],
      references: [
        "Finnegan LP, et al. Neonatal abstinence syndrome: assessment and management. Addict Dis. 1975;2(1-2):141-58."
      ]
    },
    {
      id: "esc",
      name: "Enfoque «Eat, Sleep, Console» (ESC) para el síndrome de abstinencia neonatal",
      shortName: "ESC",
      description: "Guía funcional para el manejo del síndrome de abstinencia neonatal: alimentación, sueño y consolabilidad.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "comer",
          type: "select",
          label: "Alimentación (Eat)",
          options: [
            { label: "Toma ≥ 1 oz (30 mL) o al pecho ≥ 10 min sin dificultad", value: 0 },
            { label: "Toma comprometida por síntomas de abstinencia", value: 1 }
          ]
        },
        {
          id: "dormir",
          type: "select",
          label: "Sueño (Sleep)",
          options: [
            { label: "Duerme ≥ 1 hora seguida sin ser molestado", value: 0 },
            { label: "Sueño limitado a menos de 1 hora por síntomas", value: 1 }
          ]
        },
        {
          id: "consolar",
          type: "select",
          label: "Consolabilidad (Console)",
          options: [
            { label: "Se consuela en ≤ 10 minutos con intervención de los cuidadores", value: 0 },
            { label: "No se consuela en 10 minutos con intervenciones adecuadas", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const puntos = sum(v, ["comer", "dormir", "consolar"]);
        return {
          main: puntos === 0 ? "Manejo no farmacológico" : `${puntos}/3 dominios afectados`,
          interpretation: puntos === 0 ? "El neonato come, duerme y se consuela adecuadamente: continuar con cuidados no farmacológicos (contacto piel con piel, agrupación de cuidados, lactancia materna, ambiente tranquilo, alojamiento conjunto)." : "Uno o más dominios afectados: optimizar los cuidados no farmacológicos y reevaluar tras 30–60 minutos con intervenciones. Si persiste el fallo, valorar iniciar/aumentar tratamiento farmacológico.",
          level: puntos === 0 ? "ok" : puntos === 1 ? "warn" : "danger"
        };
      },
      notes: [
        "ESC no sustituye a Finnegan: es un enfoque funcional distinto que ha demostrado reducir la duración de la hospitalización y la exposición a opioides en el neonato.",
        "Los padres son coprotagonistas del cuidado: el alojamiento conjunto y su implicación son parte esencial del abordaje."
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
      description: "Clasifica el riesgo de hiperbilirrubinemia significativa en recién nacidos ≥ 35 semanas a partir de la bilirrubina por horas de vida.",
      category: CAT21,
      specialty: PED,
      inputs: [
        { id: "horas", type: "number", label: "Edad postnatal", unit: "horas", min: 12, max: 168, step: 1 },
        { id: "bilirrubina", type: "number", label: "Bilirrubina total sérica", unit: "mg/dL", min: 0, max: 40, step: 0.1 }
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
          zona = "Riesgo intermedio-bajo (percentil 40–75)";
          level = "info";
        } else if (b < p95) {
          zona = "Riesgo intermedio-alto (percentil 75–95)";
          level = "warn";
        } else {
          zona = "Riesgo alto (≥ percentil 95)";
          level = "danger";
        }
        return {
          main: fmt(b, 1),
          mainUnit: "mg/dL",
          secondary: zona,
          interpretation: level === "ok" ? "Riesgo bajo de hiperbilirrubinemia significativa: seguimiento clínico habitual." : level === "info" ? "Riesgo intermedio-bajo: nueva medición en 24–48 h según juicio clínico y factores de riesgo." : level === "warn" ? "Riesgo intermedio-alto: repetir bilirrubina en 12–24 h y valorar factores de riesgo." : "Riesgo alto: bilirrubina cercana o superior al percentil 95; comparar con el umbral de fototerapia según horas de vida, edad gestacional y factores de riesgo (guía AAP 2022) y actuar sin demora.",
          level,
          details: [
            `Percentiles aproximados a las ${h} h: P40 ≈ ${fmt(p40, 1)}, P75 ≈ ${fmt(p75, 1)}, P95 ≈ ${fmt(p95, 1)} mg/dL.`,
            "La decisión de fototerapia se toma con el nomograma AAP 2022 según edad gestacional y factores de riesgo, no solo con el percentil de Bhutani."
          ]
        };
      },
      notes: [
        "Aplicable a recién nacidos de ≥ 35 semanas de edad gestacional, sanos, sin enfermedad hemolítica.",
        "Los percentiles mostrados son una aproximación del nomograma original.",
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
      description: "Identifica a los lactantes ≤ 60 días con fiebre que tienen bajo riesgo de infección bacteriana grave.",
      category: CAT21,
      specialty: PED,
      inputs: [
        { id: "aspecto", type: "boolean", label: "Aspecto clínico bueno" },
        { id: "termino", type: "boolean", label: "Recién nacido a término, sin complicaciones perinatales" },
        { id: "antibioticos", type: "boolean", label: "Sin antibioterapia perinatal ni actual" },
        { id: "hospital", type: "boolean", label: "Sin hospitalizaciones previas ni enfermedad crónica" },
        { id: "foco", type: "boolean", label: "Sin foco infeccioso al examen físico (piel, tejidos blandos, huesos, oídos)" },
        { id: "leucos", type: "boolean", label: "Leucocitos 5.000–15.000/mm³" },
        { id: "cayados", type: "boolean", label: "Cayados < 1.500/mm³" },
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
          interpretation: bajoRiesgo ? "Todos los criterios cumplidos: riesgo bajo de infección bacteriana grave (VPN ≈ 98,9 %). Puede plantearse manejo ambulatorio con seguimiento en 24 h, según protocolo local." : "No cumple todos los criterios: no puede clasificarse como bajo riesgo; completar estudio de sepsis y valorar ingreso con antibioterapia empírica.",
          level: bajoRiesgo ? "ok" : "danger"
        };
      },
      notes: [
        "Aplicable a lactantes ≤ 60 días con temperatura rectal ≥ 38 °C.",
        "Las guías actuales (AAP 2021, Step-by-Step europeo, PECARN 2019) han refinado el abordaje: usar la escala que cada centro tenga protocolizada."
      ],
      references: [
        "Jaskiewicz JA, et al. Febrile infants at low risk for serious bacterial infection: an appraisal of the Rochester criteria. Pediatrics. 1994;94(3):390-6."
      ]
    },
    {
      id: "step-by-step",
      name: "Enfoque paso a paso (Step-by-step) para lactantes febriles",
      shortName: "Step-by-step",
      description: "Algoritmo europeo secuencial para identificar lactantes ≤ 90 días con fiebre y bajo riesgo de infección bacteriana grave.",
      category: CAT21,
      specialty: PED,
      inputs: [
        { id: "malAspecto", type: "boolean", label: "¿Mal aspecto clínico?", noPoints: true },
        { id: "menor21", type: "boolean", label: "¿Edad ≤ 21 días?", noPoints: true },
        { id: "orinaAlt", type: "boolean", label: "¿Tira reactiva de orina alterada?", description: "Leucocituria o nitritos positivos.", noPoints: true },
        { id: "pct", type: "boolean", label: "¿Procalcitonina ≥ 0,5 ng/mL?", noPoints: true },
        { id: "pcr", type: "boolean", label: "¿PCR > 20 mg/L?", noPoints: true },
        { id: "nan", type: "boolean", label: "¿Neutrófilos absolutos > 10.000/mm³?", noPoints: true }
      ],
      compute: (v) => {
        if (v.malAspecto === 1)
          return {
            main: "Alto riesgo",
            interpretation: "Mal aspecto clínico: ingreso, estudio completo (hemocultivo, urocultivo, LCR) y antibioterapia empírica.",
            level: "danger"
          };
        if (v.menor21 === 1)
          return {
            main: "Alto riesgo",
            interpretation: "Edad ≤ 21 días: por edad, se recomienda ingreso, estudio completo (incluida punción lumbar) y antibioterapia empírica independientemente del resto de parámetros.",
            level: "danger"
          };
        if (v.orinaAlt === 1)
          return {
            main: "Riesgo intermedio",
            interpretation: "Tira de orina alterada: probable infección urinaria. Sedimento y urocultivo; ingreso o manejo ambulatorio según protocolo local.",
            level: "warn"
          };
        if (v.pct === 1)
          return {
            main: "Alto riesgo",
            interpretation: "Procalcitonina ≥ 0,5 ng/mL: riesgo elevado de infección bacteriana invasiva; estudio completo, ingreso y antibioterapia empírica.",
            level: "danger"
          };
        if (v.pcr === 1 || v.nan === 1)
          return {
            main: "Riesgo intermedio",
            interpretation: "PCR > 20 mg/L o neutrófilos > 10.000/mm³ con procalcitonina normal: observación hospitalaria durante 24 h; individualizar necesidad de antibioterapia.",
            level: "warn"
          };
        return {
          main: "Bajo riesgo",
          interpretation: "Bien aspecto, > 21 días, tira de orina normal, procalcitonina < 0,5, PCR ≤ 20 y neutrófilos ≤ 10.000: bajo riesgo de infección bacteriana invasiva (VPN ≈ 99,3 %). Puede considerarse manejo ambulatorio en > 21 días con adecuado seguimiento, según protocolo local.",
          level: "ok"
        };
      },
      notes: [
        "Aplicable a lactantes ≤ 90 días con fiebre sin foco.",
        "Rendimiento superior a Rochester y Filadelfia para detectar meningitis bacteriana en menores de 90 días."
      ],
      references: [
        'Gómez B, et al. Validation of the "Step-by-Step" approach in the management of young febrile infants. Pediatrics. 2016;138(2):e20154381.'
      ]
    },
    {
      id: "pecarn-lactantes",
      name: "PECARN para lactantes febriles de 8–60 días",
      shortName: "PECARN 8–60 d",
      description: "Regla de decisión para identificar lactantes de 8 a 60 días con fiebre y bajo riesgo de infección bacteriana grave.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "orinaAlt",
          type: "boolean",
          label: "¿Análisis de orina alterado?",
          description: "Cualquiera: leucoesterasa positiva, nitritos positivos o > 5 leucocitos por campo.",
          noPoints: true
        },
        { id: "nan", type: "boolean", label: "¿Neutrófilos absolutos > 4.090/mm³?", noPoints: true },
        { id: "pct", type: "boolean", label: "¿Procalcitonina > 1,71 ng/mL?", noPoints: true }
      ],
      compute: (v) => {
        const bajo = v.orinaAlt === 0 && v.nan === 0 && v.pct === 0;
        return {
          main: bajo ? "Bajo riesgo" : "No bajo riesgo",
          interpretation: bajo ? "Los tres marcadores dentro de rango: sensibilidad 97,7 % para infección bacteriana grave y 100 % para infección bacteriana invasiva. Puede considerarse manejo sin punción lumbar y observación (individualizar según edad y protocolo local)." : "Al menos un marcador alterado: no se cumple la regla de bajo riesgo. Ampliar estudio (incluida punción lumbar en < 28 días o si otros signos) e iniciar antibioterapia empírica según protocolo.",
          level: bajo ? "ok" : "danger"
        };
      },
      notes: [
        "Aplicable a lactantes de 29 a 60 días con fiebre ≥ 38 °C y buen aspecto. En menores de 28 días se recomienda estudio completo y antibioterapia empírica independientemente de la regla.",
        "La procalcitonina puede no estar disponible en todos los centros; su ausencia limita la aplicabilidad de la regla."
      ],
      references: [
        "Kuppermann N, et al. A Clinical Prediction Rule to Identify Febrile Infants 60 Days and Younger at Low Risk for Serious Bacterial Infections. JAMA Pediatr. 2019;173(4):342-51."
      ]
    },
    {
      id: "sirs-pediatrico",
      name: "SIRS pediátrico (criterios de Goldstein)",
      shortName: "SIRS pediátrico",
      description: "Criterios del International Pediatric Sepsis Consensus para el síndrome de respuesta inflamatoria sistémica en niños.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "temp",
          type: "boolean",
          label: "Temperatura central > 38,5 °C o < 36 °C"
        },
        {
          id: "leucos",
          type: "boolean",
          label: "Leucocitos alterados para la edad o > 10 % de cayados"
        },
        {
          id: "fc",
          type: "boolean",
          label: "Taquicardia (> 2 DE sobre la media para la edad) o bradicardia (< 1 año)"
        },
        {
          id: "fr",
          type: "boolean",
          label: "Taquipnea (> 2 DE sobre la media) o necesidad de ventilación mecánica"
        },
        {
          id: "infeccion",
          type: "boolean",
          label: "Infección confirmada o sospechada",
          noPoints: true
        },
        {
          id: "disfuncion",
          type: "boolean",
          label: "Disfunción cardiovascular o respiratoria aguda, o ≥ 2 disfunciones orgánicas",
          noPoints: true
        }
      ],
      compute: (v) => {
        const criteriosSIRS = sum(v, ["temp", "leucos", "fc", "fr"]);
        const cumpleSIRS = criteriosSIRS >= 2 && (v.temp === 1 || v.leucos === 1);
        const sepsis = cumpleSIRS && v.infeccion === 1;
        const grave = sepsis && v.disfuncion === 1;
        return {
          main: grave ? "Sepsis grave o shock séptico" : sepsis ? "Sepsis" : cumpleSIRS ? "SIRS" : "No cumple SIRS",
          secondary: `${criteriosSIRS}/4 criterios`,
          interpretation: grave ? "Sepsis grave / shock séptico: reanimación con fluidos, antibioterapia precoz (idealmente en la primera hora) y valoración por cuidados intensivos pediátricos." : sepsis ? "Sepsis pediátrica: activar bundle de sepsis (identificación, cultivos, antibioterapia empírica en la primera hora, reanimación con fluidos)." : cumpleSIRS ? "SIRS sin infección demostrada: buscar causa (traumatismo, quemados, cirugía, pancreatitis…)." : "No cumple criterios de SIRS: reevaluar la clínica y las tendencias.",
          level: grave ? "danger" : sepsis ? "danger" : cumpleSIRS ? "warn" : "ok",
          details: [
            "SIRS = ≥ 2 de los 4 criterios, siendo obligatorio uno de ellos temperatura o leucocitos alterados."
          ]
        };
      },
      notes: [
        "Los umbrales de FC, FR y leucocitos varían por edad; usar los valores de referencia pediátricos del centro.",
        "La consensuada Phoenix Sepsis Score (2024) sustituye progresivamente a los criterios de Goldstein para la definición de sepsis pediátrica."
      ],
      references: [
        "Goldstein B, et al. International pediatric sepsis consensus conference: Definitions for sepsis and organ dysfunction in pediatrics. Pediatr Crit Care Med. 2005;6(1):2-8."
      ]
    },
    {
      id: "phoenix-sepsis",
      name: "Puntuación de sepsis Phoenix (2024)",
      shortName: "Phoenix Sepsis",
      description: "Definición actualizada de sepsis pediátrica: identifica disfunción orgánica en niños con sospecha de infección.",
      category: CAT21,
      specialty: PED,
      inputs: [
        {
          id: "respiratorio",
          type: "select",
          label: "Respiratorio",
          dropdown: true,
          options: [
            { label: "PaO₂/FiO₂ ≥ 400 o SpO₂/FiO₂ ≥ 292", value: 0 },
            { label: "PaO₂/FiO₂ < 400 o SpO₂/FiO₂ < 292 con oxígeno", value: 1 },
            { label: "PaO₂/FiO₂ 100–200 con soporte respiratorio invasivo, o 148–220 con ventilación no invasiva", value: 2 },
            { label: "PaO₂/FiO₂ < 100 con soporte respiratorio invasivo, o SpO₂/FiO₂ < 148 con soporte", value: 3 }
          ]
        },
        {
          id: "cardiovascular",
          type: "select",
          label: "Cardiovascular — vasoactivos",
          dropdown: true,
          options: [
            { label: "Sin vasoactivos", value: 0 },
            { label: "1 vasoactivo", value: 1 },
            { label: "2 o más vasoactivos", value: 2 }
          ]
        },
        {
          id: "lactato",
          type: "select",
          label: "Cardiovascular — lactato",
          dropdown: true,
          options: [
            { label: "< 5 mmol/L", value: 0 },
            { label: "5–10,9 mmol/L", value: 1 },
            { label: "≥ 11 mmol/L", value: 2 }
          ]
        },
        {
          id: "pam",
          type: "select",
          label: "Cardiovascular — PAM por edad",
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
          label: "Coagulación",
          dropdown: true,
          options: [
            { label: "Sin alteraciones", value: 0 },
            { label: "Una alteración: plaquetas < 100.000, INR > 1,3, D-dímero > 2 mg/L o fibrinógeno < 100 mg/dL", value: 1 },
            { label: "Dos o más alteraciones", value: 2 }
          ]
        },
        {
          id: "neurologico",
          type: "select",
          label: "Neurológico",
          dropdown: true,
          options: [
            { label: "GCS > 10 y pupilas reactivas", value: 0 },
            { label: "GCS ≤ 10", value: 1 },
            { label: "Pupilas fijas bilateralmente", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        var _a, _b, _c;
        const score = sum(v, ["respiratorio", "cardiovascular", "lactato", "pam", "coagulacion", "neurologico"]);
        const sepsis = score >= 2;
        const shock = ((_a = v.cardiovascular) != null ? _a : 0) + ((_b = v.lactato) != null ? _b : 0) + ((_c = v.pam) != null ? _c : 0) >= 1 && sepsis;
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: shock ? "Shock séptico" : sepsis ? "Sepsis" : "Sin sepsis",
          interpretation: shock ? "Sepsis pediátrica con disfunción cardiovascular: shock séptico. Reanimación con fluidos, vasoactivos precoces, antibioterapia empírica en la primera hora y traslado a cuidados intensivos." : sepsis ? "Sepsis pediátrica según criterios Phoenix (≥ 2 puntos con sospecha de infección). Activar bundle de sepsis pediátrica." : "No cumple criterios Phoenix de sepsis: reevaluar y considerar otras causas.",
          level: shock ? "danger" : sepsis ? "warn" : "ok"
        };
      },
      notes: [
        "La sepsis pediátrica se define por sospecha de infección + Phoenix ≥ 2.",
        "El shock séptico requiere además ≥ 1 punto en el dominio cardiovascular.",
        "Los umbrales de PAM por edad y de FR/FC deben tomarse de las tablas de referencia pediátricas."
      ],
      references: [
        "Schlapbach LJ, et al. International Consensus Criteria for Pediatric Sepsis and Septic Shock. JAMA. 2024;331(8):665-74."
      ]
    },
    {
      id: "fluidos-pediatricos",
      name: "Fluidos de mantenimiento pediátricos (regla 4-2-1)",
      shortName: "Fluidos pediátricos",
      description: "Calcula las necesidades diarias de fluidos y el ritmo horario en pacientes pediátricos.",
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
          interpretation: "Ritmo de mantenimiento habitual (regla 4-2-1). Añadir a este cálculo el déficit por deshidratación y las pérdidas continuas si las hay.",
          level: "info",
          details: [
            "4 mL/kg/h para los primeros 10 kg + 2 mL/kg/h para los kg 11–20 + 1 mL/kg/h para el resto.",
            "Usar suero isotónico (0,9 % NaCl) con glucosa al 5 %: las guías desaconsejan el uso rutinario de hipotónicos por riesgo de hiponatremia hospitalaria."
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
      name: "Tamaño del tubo endotraqueal pediátrico",
      shortName: "TET pediátrico",
      description: "Estima el diámetro interno y la profundidad de fijación del tubo endotraqueal según la edad.",
      category: CAT21,
      specialty: PED,
      inputs: [
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 0, max: 18, step: 0.1 },
        {
          id: "balon",
          type: "select",
          label: "Tubo con o sin balón",
          noPoints: true,
          options: [
            { label: "Sin balón (cuffed = no)", value: 0 },
            { label: "Con balón (cuffed = sí)", value: 1 }
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
          mainUnit: "mm (diámetro interno)",
          secondary: fmt(profundidad, 1),
          secondaryLabel: "cm de profundidad en la comisura labial",
          interpretation: "Estimación orientativa. Confirmar la posición del tubo con auscultación bilateral, capnografía y radiografía de tórax (punta 1–2 cm sobre la carina).",
          level: "info",
          details: [
            `Fórmulas: sin balón → diámetro = 4 + edad/4; con balón → diámetro = 3,5 + edad/4.`,
            `Profundidad ≈ 3 × diámetro interno del tubo.`,
            "En neonatos usar el peso al nacer: < 1 kg → TET 2,5; 1–2 kg → 3,0; 2–3 kg → 3,0–3,5; > 3 kg → 3,5.",
            "Preparar también un tubo 0,5 mm más grande y otro más pequeño."
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
            { label: "≥ 38 semanas", value: 0 },
            { label: "< 38 semanas", value: 1 }
          ]
        },
        {
          id: "inicio",
          type: "select",
          label: "Edad al inicio de la fototerapia",
          options: [
            { label: "≥ 72 horas de vida", value: 0 },
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
        var _a, _b;
        const puntos = ((_a = v.edad) != null ? _a : 0) * 3 + ((_b = v.inicio) != null ? _b : 0) * 4 + Math.max(0, 8 - v.diferencia) * 0.4;
        const banda = puntos < 3 ? "bajo (< 5 %)" : puntos < 5 ? "intermedio (≈ 15 %)" : "alto (≈ 40 %)";
        return {
          main: fmt(puntos, 1),
          mainUnit: "puntos orientativos",
          secondary: banda,
          secondaryLabel: "riesgo de rebote",
          interpretation: puntos < 3 ? "Bajo riesgo de rebote: control clínico habitual sin necesidad de bilirrubina de control precoz." : puntos < 5 ? "Riesgo intermedio: repetir bilirrubina a las 24 h de suspender la fototerapia." : "Alto riesgo de rebote: mantener fototerapia hasta un margen mayor bajo el umbral, o repetir bilirrubina en 12–24 h tras suspenderla.",
          level: puntos < 3 ? "ok" : puntos < 5 ? "warn" : "danger",
          details: [
            "Estimación orientativa basada en Chang 2017; la decisión final se toma con la clínica y el nomograma AAP 2022 vigente."
          ]
        };
      },
      notes: [
        "Los factores que más aumentan el riesgo de rebote son: edad gestacional < 38 semanas, inicio de fototerapia < 72 h de vida, y bilirrubina al suspender cercana al umbral."
      ],
      references: [
        "Chang PW, et al. A Clinical Prediction Rule for Rebound Hyperbilirubinemia Following Inpatient Phototherapy. Pediatrics. 2017;139(3):e20162896."
      ]
    }
  ];

  // inurse-m2/src/calculators/neuro-critica.ts
  var CAT22 = "Neurología crítica e ictus";
  var NEURO = ["Neurología crítica", "Medicina Intensiva"];
  var escala7 = (items) => items.map(([value, label]) => ({ label: `${value} — ${label}`, value }));
  var neuroCritica = [
    {
      id: "rass",
      name: "Escala de agitación-sedación de Richmond (RASS)",
      shortName: "RASS",
      description: "Cuantifica de forma objetiva el nivel de agitación o sedación del paciente crítico.",
      category: CAT22,
      specialty: NEURO,
      inputs: [
        {
          id: "nivel",
          type: "select",
          label: "Nivel de agitación / sedación",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "+4 — Combativo: violento, peligro inmediato para el personal", value: 4 },
            { label: "+3 — Muy agitado: tira o retira tubos y catéteres, agresivo", value: 3 },
            { label: "+2 — Agitado: movimientos frecuentes sin propósito, lucha con el ventilador", value: 2 },
            { label: "+1 — Inquieto: ansioso pero sin movimientos agresivos", value: 1 },
            { label: "0 — Alerta y tranquilo", value: 0 },
            { label: "−1 — Somnoliento: no plenamente alerta pero mantiene los ojos abiertos > 10 s al hablar", value: -1 },
            { label: "−2 — Sedación ligera: abre los ojos brevemente al hablar (< 10 s)", value: -2 },
            { label: "−3 — Sedación moderada: mueve los ojos o los abre al hablar (sin contacto visual)", value: -3 },
            { label: "−4 — Sedación profunda: sin respuesta a la voz, responde al estímulo físico", value: -4 },
            { label: "−5 — No despertable: sin respuesta a la voz ni al estímulo físico", value: -5 }
          ],
          default: 0
        }
      ],
      compute: (v) => {
        var _a;
        const n = (_a = v.nivel) != null ? _a : 0;
        let interp, level;
        if (n === 0) {
          interp = "Nivel deseable en la mayoría de los pacientes críticos despiertos.";
          level = "ok";
        } else if (n > 0) {
          interp = n === 1 ? "Agitación leve: valorar causas (dolor, delirio, ansiedad, retirada de sedación, hipoxia, retención urinaria) antes de sedar." : n <= 2 ? "Agitación moderada: buscar y tratar la causa; valorar apoyo farmacológico si es necesario." : "Agitación grave: riesgo inmediato de autoextubación y de daño; sedación de rescate y tratamiento etiológico.";
          level = n === 1 ? "warn" : "danger";
        } else {
          interp = n >= -2 ? "Sedación ligera: nivel adecuado para la mayoría de pacientes en ventilación mecánica según la campaña de sedación ligera (PADIS)." : n === -3 ? "Sedación moderada: valorar si es necesaria esta profundidad; sedación diaria intermitente favorece el destete." : n === -4 ? "Sedación profunda: reservada a situaciones específicas (hipertensión intracraneal, SDRA grave con bloqueo neuromuscular, estatus refractario)." : "No despertable: valorar profundidad excesiva o causa neurológica; despertar diario si no está contraindicado.";
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
        "Objetivo habitual del paciente crítico en ventilación mecánica: RASS entre 0 y −2.",
        "Con RASS ≥ +2 o ≤ −4, evaluar delirio con CAM-ICU no es fiable: reevaluar cuando la sedación mejore."
      ],
      references: [
        "Sessler CN, et al. The Richmond Agitation-Sedation Scale: validity and reliability in adult intensive care unit patients. Am J Respir Crit Care Med. 2002;166(10):1338-44."
      ]
    },
    {
      id: "aspects",
      name: "ASPECTS — Alberta Stroke Program Early CT Score",
      shortName: "ASPECTS",
      description: "Cuantifica la extensión de la isquemia precoz en la arteria cerebral media en la tomografía sin contraste.",
      category: CAT22,
      specialty: NEURO,
      inputs: [
        { id: "c", type: "boolean", label: "Caudado afectado", labels: ["Normal", "Isquemia"] },
        { id: "l", type: "boolean", label: "Núcleo lenticular afectado", labels: ["Normal", "Isquemia"] },
        { id: "i", type: "boolean", label: "Cápsula interna afectada", labels: ["Normal", "Isquemia"] },
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
          mainUnit: "puntos (0–10)",
          interpretation: score >= 7 ? "ASPECTS ≥ 7: rango en el que la trombectomía mecánica es especialmente beneficiosa (junto con NIHSS ≥ 6 y ventana temporal apropiada)." : score >= 4 ? "ASPECTS 4–6: valorar de forma individualizada la trombectomía; los estudios SELECT2 y ANGEL-ASPECT muestran beneficio en ictus con núcleo más amplio." : "ASPECTS < 4: infarto extenso ya establecido; el beneficio de reperfusión es menor y el riesgo hemorrágico es mayor.",
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
      description: "Descarta la hemorragia subaracnoidea en pacientes con cefalea aguda de máxima intensidad.",
      category: CAT22,
      specialty: NEURO,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad ≥ 40 años" },
        { id: "rigidez", type: "boolean", label: "Rigidez de nuca" },
        { id: "conciencia", type: "boolean", label: "Alteración testificada del nivel de conciencia" },
        { id: "esfuerzo", type: "boolean", label: "Inicio durante el esfuerzo" },
        { id: "trueno", type: "boolean", label: "Cefalea explosiva («en trueno», máxima en segundos)" },
        { id: "limitacion", type: "boolean", label: "Limitación a la flexión cervical" }
      ],
      compute: (v) => {
        const criterios = sum(v, ["edad", "rigidez", "conciencia", "esfuerzo", "trueno", "limitacion"]);
        return {
          main: criterios === 0 ? "HSA razonablemente descartada" : "No se puede descartar HSA",
          secondary: String(criterios),
          secondaryLabel: "criterios positivos",
          interpretation: criterios === 0 ? "Regla negativa: sensibilidad ≈ 100 % para HSA en pacientes con cefalea de nueva aparición que alcanzó su intensidad máxima en menos de 1 h y sin déficits focales. No se requieren estudios adicionales por sospecha de HSA (siempre juicio clínico)." : "Al menos un criterio positivo: no puede descartarse HSA por la regla. Estudio con tomografía sin contraste; si es negativa dentro de 6 h del inicio, valor predictivo negativo muy alto en el paciente neurológicamente intacto.",
          level: criterios === 0 ? "ok" : "danger"
        };
      },
      notes: [
        "Solo aplicable a pacientes ≥ 15 años con cefalea de nueva aparición no traumática, no déficits focales y no antecedente de aneurisma, HSA previa, tumor cerebral o cefaleas similares recurrentes."
      ],
      references: [
        "Perry JJ, et al. Clinical decision rules to rule out subarachnoid hemorrhage for acute headache. JAMA. 2013;310(12):1248-55."
      ]
    },
    {
      id: "mbig",
      name: "Brain Injury Guidelines modificado (mBIG)",
      shortName: "mBIG",
      description: "Estratifica el traumatismo craneoencefálico leve con hallazgos en tomografía para orientar el manejo.",
      category: CAT22,
      specialty: NEURO,
      inputs: [
        {
          id: "gcs",
          type: "select",
          label: "GCS al ingreso",
          options: [
            { label: "15", value: 0 },
            { label: "13–14", value: 1 },
            { label: "≤ 12", value: 2 }
          ]
        },
        { id: "anticoagulacion", type: "boolean", label: "Anticoagulación o antiagregación (excepto AAS profiláctica)" },
        { id: "intoxicacion", type: "boolean", label: "Intoxicación evidente" },
        { id: "focal", type: "boolean", label: "Déficit neurológico focal" },
        { id: "fracturaDesplazada", type: "boolean", label: "Fractura craneal desplazada o abierta" },
        {
          id: "sdh",
          type: "select",
          label: "Hematoma subdural (SDH)",
          dropdown: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "≤ 4 mm", value: 1 },
            { label: "5–7 mm", value: 2 },
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
            { label: "≤ 4 mm", value: 1 },
            { label: "5–7 mm", value: 2 },
            { label: "> 7 mm", value: 3 }
          ]
        },
        {
          id: "contusion",
          type: "select",
          label: "Contusión intraparenquimatosa",
          dropdown: true,
          options: [
            { label: "Ausente", value: 0 },
            { label: "≤ 4 mm, única", value: 1 },
            { label: "5–7 mm o múltiple", value: 2 },
            { label: "> 7 mm", value: 3 }
          ]
        },
        { id: "hemoventricular", type: "boolean", label: "Hemorragia intraventricular o subaracnoidea" }
      ],
      compute: (v) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
        const grave = v.anticoagulacion === 1 || v.intoxicacion === 1 || v.focal === 1 || v.fracturaDesplazada === 1 || ((_a = v.gcs) != null ? _a : 0) === 2 || ((_b = v.sdh) != null ? _b : 0) === 3 || ((_c = v.edh) != null ? _c : 0) === 3 || ((_d = v.contusion) != null ? _d : 0) === 3 || v.hemoventricular === 1;
        const intermedio = !grave && (((_e = v.gcs) != null ? _e : 0) === 1 || ((_f = v.sdh) != null ? _f : 0) === 2 || ((_g = v.edh) != null ? _g : 0) === 2 || ((_h = v.contusion) != null ? _h : 0) === 2);
        const leve = !grave && !intermedio && (((_i = v.sdh) != null ? _i : 0) === 1 || ((_j = v.edh) != null ? _j : 0) === 1 || ((_k = v.contusion) != null ? _k : 0) === 1);
        const categoria = grave ? "mBIG 3" : intermedio ? "mBIG 2" : leve ? "mBIG 1" : "Sin criterios";
        return {
          main: categoria,
          interpretation: grave ? "mBIG 3: manejo hospitalario con neurocirugía, tomografía de control, ingreso (a menudo en cuidados intermedios/UCI) y valoración quirúrgica." : intermedio ? "mBIG 2: observación hospitalaria, tomografía de control en 6 h, valoración neuroquirúrgica; puede evitarse ingreso en UCI si la evolución es favorable." : leve ? "mBIG 1: puede manejarse en observación sin tomografía de control ni ingreso en cuidados intensivos, si el paciente está estable y hay red de apoyo." : "No se cumplen criterios de lesión: si el TC es normal y el paciente está estable, alta con recomendaciones.",
          level: grave ? "danger" : intermedio ? "warn" : leve ? "info" : "ok"
        };
      },
      notes: [
        "Aplicable a traumatismos craneoencefálicos leves con GCS 13–15 y hallazgos en tomografía.",
        "Requiere disponibilidad rápida de neurocirugía; validaciones locales antes de aplicar de forma sistemática."
      ],
      references: [
        "Joseph B, et al. The BIG (Brain Injury Guidelines) project: defining the management of TBI by acute care surgeons. J Trauma Acute Care Surg. 2014;76(4):965-9."
      ]
    },
    {
      id: "fisher-modificado",
      name: "Escala de Fisher modificada para el vasoespasmo",
      shortName: "Fisher modificado",
      description: "Predice el riesgo de vasoespasmo en la hemorragia subaracnoidea aneurismática según la tomografía inicial.",
      category: CAT22,
      specialty: NEURO,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "Hallazgos en la tomografía",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Grado 0 — Sin sangre en cisternas ni hemorragia intraventricular", value: 0 },
            { label: "Grado 1 — Sangre subaracnoidea fina sin hemorragia intraventricular", value: 1 },
            { label: "Grado 2 — Sangre subaracnoidea fina con hemorragia intraventricular", value: 2 },
            { label: "Grado 3 — Sangre subaracnoidea gruesa (> 1 mm) sin hemorragia intraventricular", value: 3 },
            { label: "Grado 4 — Sangre subaracnoidea gruesa con hemorragia intraventricular", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const g = (_a = v.grado) != null ? _a : 0;
        const riesgo2 = ["0 %", "24 %", "33 %", "33 %", "40 %"][g];
        return {
          main: `Grado ${g}`,
          secondary: riesgo2,
          secondaryLabel: "riesgo de vasoespasmo sintomático",
          interpretation: g <= 1 ? "Riesgo bajo de vasoespasmo sintomático." : g <= 2 ? "Riesgo moderado: vigilancia con Doppler transcraneal y clínica." : "Riesgo alto: profilaxis con nimodipino, mantener euvolemia y normotensión, y vigilancia estrecha (Doppler transcraneal, exploraciones neurológicas frecuentes).",
          level: g <= 1 ? "ok" : g <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Frontera JA, et al. Prediction of symptomatic vasospasm after subarachnoid hemorrhage: the modified Fisher scale. Neurosurgery. 2006;59(1):21-7."
      ]
    },
    {
      id: "func",
      name: "Puntuación FUNC para hemorragia intracerebral",
      shortName: "FUNC",
      description: "Predice la probabilidad de independencia funcional a los 90 días tras una hemorragia intracerebral espontánea.",
      category: CAT22,
      specialty: NEURO,
      inputs: [
        {
          id: "volumen",
          type: "select",
          label: "Volumen del hematoma",
          options: [
            { label: "< 30 cm³", value: 4 },
            { label: "30–60 cm³", value: 2 },
            { label: "> 60 cm³", value: 0 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 70 años", value: 2 },
            { label: "70–79 años", value: 1 },
            { label: "≥ 80 años", value: 0 }
          ]
        },
        {
          id: "localizacion",
          type: "select",
          label: "Localización",
          options: [
            { label: "Lobar", value: 2 },
            { label: "Profunda (ganglios basales, tálamo)", value: 1 },
            { label: "Infratentorial", value: 0 }
          ]
        },
        {
          id: "gcs",
          type: "select",
          label: "GCS al ingreso",
          options: [
            { label: "≥ 9", value: 2 },
            { label: "≤ 8", value: 0 }
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
          mainUnit: "puntos (0–11)",
          secondary: funcional,
          secondaryLabel: "independencia funcional a 90 días",
          interpretation: score >= 8 ? "Alta probabilidad de recuperación funcional: apostar por un manejo agresivo y rehabilitación precoz." : score >= 5 ? "Probabilidad intermedia: manejo activo con reevaluación clínica y de imagen." : "Probabilidad baja de independencia funcional. No usar la puntuación como único criterio para limitar el esfuerzo terapéutico en las primeras 24–48 h.",
          level: score >= 8 ? "ok" : score >= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Rost NS, et al. Prediction of functional outcome in patients with primary intracerebral hemorrhage: the FUNC score. Stroke. 2008;39(8):2304-9."
      ]
    },
    {
      id: "hat",
      name: "Puntuación HAT — riesgo de hemorragia tras tPA",
      shortName: "HAT",
      description: "Estima el riesgo de hemorragia intracraneal sintomática tras la administración de trombolítico en el ictus isquémico.",
      category: CAT22,
      specialty: NEURO,
      inputs: [
        {
          id: "diabetes",
          type: "select",
          label: "Diabetes o glucemia > 200 mg/dL al ingreso",
          options: [
            { label: "No", value: 0 },
            { label: "Sí", value: 1 }
          ]
        },
        {
          id: "nihss",
          type: "select",
          label: "NIHSS pretratamiento",
          options: [
            { label: "< 15", value: 0 },
            { label: "15–20", value: 1 },
            { label: "≥ 20", value: 2 }
          ]
        },
        {
          id: "tc",
          type: "select",
          label: "Hipodensidad en la tomografía",
          options: [
            { label: "Ausente", value: 0 },
            { label: "< 1/3 del territorio ACM", value: 1 },
            { label: "≥ 1/3 del territorio ACM", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["diabetes", "nihss", "tc"]);
        const total = ["2 %", "5 %", "10 %", "15 %", "44 %", "44 %"][score];
        const sintom = ["6 %", "16 %", "23 %", "36 %", "78 %", "78 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–5)",
          secondary: sintom,
          secondaryLabel: "riesgo de hemorragia sintomática",
          interpretation: score <= 1 ? "Riesgo bajo de hemorragia intracraneal sintomática." : score <= 2 ? "Riesgo moderado." : "Riesgo alto: individualizar la decisión y vigilancia neurológica estrecha tras el tratamiento.",
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
      name: "Puntuación SEDAN — hemorragia sintomática tras tPA",
      shortName: "SEDAN",
      description: "Predice el riesgo de hemorragia intracerebral sintomática tras trombolisis intravenosa en el ictus isquémico.",
      category: CAT22,
      specialty: NEURO,
      inputs: [
        {
          id: "glucemia",
          type: "select",
          label: "Glucemia sérica al ingreso",
          options: [
            { label: "< 144 mg/dL", value: 0 },
            { label: "145–216 mg/dL", value: 1 },
            { label: "> 216 mg/dL", value: 2 }
          ]
        },
        {
          id: "aspects",
          type: "select",
          label: "ASPECTS pretratamiento",
          options: [
            { label: "≥ 10", value: 0 },
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
            { label: "≤ 75 años", value: 0 },
            { label: "> 75 años", value: 1 }
          ]
        },
        {
          id: "nihss",
          type: "select",
          label: "NIHSS al ingreso",
          options: [
            { label: "≤ 9", value: 0 },
            { label: "≥ 10", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["glucemia", "aspects", "hiperdensidad", "edad", "nihss"]);
        const riesgo2 = ["1,6 %", "2,4 %", "3,5 %", "4,8 %", "9,3 %", "16,9 %", "27,8 %"][Math.min(score, 6)];
        return {
          main: String(score),
          mainUnit: "puntos (0–6)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de hemorragia intracraneal sintomática",
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
      name: "Puntuación THRIVE tras el ictus",
      shortName: "THRIVE",
      description: "Estima la probabilidad de resultado funcional y de mortalidad tras un ictus isquémico agudo tratado.",
      category: CAT22,
      specialty: NEURO,
      inputs: [
        {
          id: "nihss",
          type: "select",
          label: "NIHSS al ingreso",
          options: [
            { label: "≤ 10", value: 0 },
            { label: "11–20", value: 2 },
            { label: "≥ 21", value: 4 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "≤ 59 años", value: 0 },
            { label: "60–79 años", value: 1 },
            { label: "≥ 80 años", value: 2 }
          ]
        },
        { id: "hta", type: "boolean", label: "Hipertensión" },
        { id: "dm", type: "boolean", label: "Diabetes mellitus" },
        { id: "fa", type: "boolean", label: "Fibrilación auricular" }
      ],
      compute: (v) => {
        const score = sum(v, ["nihss", "edad", "hta", "dm", "fa"]);
        const bueno = ["65 %", "58 %", "52 %", "42 %", "35 %", "27 %", "20 %", "14 %", "10 %", "10 %"][score];
        const mort = ["12 %", "14 %", "16 %", "22 %", "28 %", "35 %", "42 %", "50 %", "58 %", "58 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–9)",
          secondary: bueno,
          secondaryLabel: "probabilidad de buen resultado (mRS 0–2) a 90 días",
          interpretation: `Mortalidad estimada a 90 días: ${mort}. Herramienta pronóstica; no debe usarse aisladamente para negar la reperfusión.`,
          level: score <= 3 ? "ok" : score <= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Flint AC, et al. THRIVE score predicts ischemic stroke outcomes and thrombolytic hemorrhage risk in VISTA. Stroke. 2013;44(12):3365-9."
      ]
    },
    {
      id: "lams",
      name: "LAMS — Los Angeles Motor Scale",
      shortName: "LAMS",
      description: "Escala prehospitalaria de tres ítems para identificar rápidamente ictus por oclusión de gran vaso.",
      category: CAT22,
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
            { label: "Debilidad de la prensión", value: 1 },
            { label: "Sin prensión", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["facial", "brazo", "mano"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–5)",
          interpretation: score >= 4 ? "LAMS ≥ 4: alta probabilidad de oclusión de gran vaso. Considerar traslado directo a centro con capacidad de trombectomía mecánica." : "LAMS < 4: menor probabilidad de oclusión de gran vaso; traslado según protocolo habitual de ictus.",
          level: score >= 4 ? "danger" : "warn"
        };
      },
      references: [
        "Nazliel B, et al. A brief prehospital stroke severity scale identifies ischemic stroke patients harboring persisting large arterial occlusions. Stroke. 2008;39(8):2264-7."
      ]
    },
    {
      id: "barthel",
      name: "Índice de Barthel",
      shortName: "Barthel",
      description: "Mide el grado de independencia en las actividades básicas de la vida diaria.",
      category: CAT22,
      specialty: NEURO,
      inputs: [
        {
          id: "comer",
          type: "select",
          label: "Comer",
          dropdown: true,
          options: escala7([
            [0, "Dependiente"],
            [5, "Necesita ayuda"],
            [10, "Independiente"]
          ])
        },
        {
          id: "lavarse",
          type: "select",
          label: "Lavarse (baño/ducha)",
          options: escala7([
            [0, "Dependiente"],
            [5, "Independiente"]
          ])
        },
        {
          id: "vestirse",
          type: "select",
          label: "Vestirse",
          dropdown: true,
          options: escala7([
            [0, "Dependiente"],
            [5, "Necesita ayuda"],
            [10, "Independiente"]
          ])
        },
        {
          id: "arreglarse",
          type: "select",
          label: "Arreglarse (aseo personal)",
          options: escala7([
            [0, "Dependiente"],
            [5, "Independiente"]
          ])
        },
        {
          id: "deposicion",
          type: "select",
          label: "Deposición",
          dropdown: true,
          options: escala7([
            [0, "Incontinente"],
            [5, "Accidente ocasional"],
            [10, "Continente"]
          ])
        },
        {
          id: "miccion",
          type: "select",
          label: "Micción",
          dropdown: true,
          options: escala7([
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
          options: escala7([
            [0, "Dependiente"],
            [5, "Necesita ayuda"],
            [10, "Independiente"]
          ])
        },
        {
          id: "traslado",
          type: "select",
          label: "Traslado (cama–sillón)",
          dropdown: true,
          options: escala7([
            [0, "Dependiente"],
            [5, "Gran ayuda (una persona)"],
            [10, "Mínima ayuda"],
            [15, "Independiente"]
          ])
        },
        {
          id: "deambulacion",
          type: "select",
          label: "Deambulación",
          dropdown: true,
          options: escala7([
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
          options: escala7([
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
          mainUnit: "puntos (0–100)",
          secondary: `Dependencia ${banda}`,
          interpretation: score === 100 ? "Independencia total para las actividades básicas de la vida diaria." : score >= 60 ? "Dependencia leve o moderada: valorar apoyos y rehabilitación." : "Dependencia grave o total: planificar cuidados, ayudas técnicas y apoyo sociosanitario.",
          level: score >= 90 ? "ok" : score >= 60 ? "warn" : "danger"
        };
      },
      references: [
        "Mahoney FI, Barthel DW. Functional evaluation: the Barthel Index. Md State Med J. 1965;14:61-5."
      ]
    }
  ];

  // inurse-m2/src/calculators/urgencias.ts
  var CAT_URG = "Urgencias y decisión clínica";
  var CAT_TOX = "Endocrino y tóxicos";
  var URG = ["Emergencias"];
  var urgencias = [
    {
      id: "alvarado",
      name: "Puntuación de Alvarado para la apendicitis",
      shortName: "Alvarado",
      description: "Estima la probabilidad de apendicitis aguda en pacientes con dolor abdominal.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        { id: "migracion", type: "boolean", label: "Migración del dolor a fosa ilíaca derecha" },
        { id: "anorexia", type: "boolean", label: "Anorexia" },
        { id: "nauseas", type: "boolean", label: "Náuseas o vómitos" },
        { id: "sensibilidad", type: "boolean", label: "Dolor a la palpación en fosa ilíaca derecha", points: 2 },
        { id: "rebote", type: "boolean", label: "Signo de rebote (Blumberg)" },
        { id: "fiebre", type: "boolean", label: "Temperatura > 37,3 °C" },
        { id: "leucocitosis", type: "boolean", label: "Leucocitos > 10.000/mm³", points: 2 },
        { id: "neutrofilia", type: "boolean", label: "Desviación izquierda (>75 % neutrófilos)" }
      ],
      compute: (v) => {
        const score = sum(v, ["migracion", "anorexia", "nauseas", "sensibilidad", "rebote", "fiebre", "leucocitosis", "neutrofilia"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–10)",
          interpretation: score <= 3 ? "Baja probabilidad de apendicitis: valorar alta con reevaluación." : score <= 6 ? "Probabilidad intermedia: observación y prueba de imagen (ecografía o TC)." : "Alta probabilidad de apendicitis: valoración quirúrgica.",
          level: score <= 3 ? "ok" : score <= 6 ? "warn" : "danger"
        };
      },
      references: [
        "Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med. 1986;15(5):557-64."
      ]
    },
    {
      id: "air",
      name: "Puntuación AIR (Appendicitis Inflammatory Response)",
      shortName: "AIR",
      description: "Alternativa a Alvarado con mayor peso a los reactantes de fase aguda.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        { id: "vomitos", type: "boolean", label: "Vómitos" },
        { id: "fid", type: "boolean", label: "Dolor en fosa ilíaca derecha" },
        { id: "rebote", type: "boolean", label: "Defensa/rebote leve" },
        {
          id: "reboteM",
          type: "select",
          label: "Defensa/rebote — intensidad",
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
            { label: "< 38,5 °C", value: 0 },
            { label: "≥ 38,5 °C", value: 1 }
          ]
        },
        {
          id: "neutro",
          type: "select",
          label: "Polimorfonucleares (%)",
          options: [
            { label: "< 70", value: 0 },
            { label: "70–84", value: 1 },
            { label: "≥ 85", value: 2 }
          ]
        },
        {
          id: "leucos",
          type: "select",
          label: "Leucocitos (×10⁹/L)",
          options: [
            { label: "< 10", value: 0 },
            { label: "10–14,9", value: 1 },
            { label: "≥ 15", value: 2 }
          ]
        },
        {
          id: "pcr",
          type: "select",
          label: "Proteína C reactiva (mg/L)",
          options: [
            { label: "< 10", value: 0 },
            { label: "10–49", value: 1 },
            { label: "≥ 50", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["vomitos", "fid", "rebote", "reboteM", "temp", "neutro", "leucos", "pcr"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–12)",
          interpretation: score <= 4 ? "Baja probabilidad: apendicitis poco probable; valorar alta con reevaluación." : score <= 8 ? "Probabilidad intermedia: observación e imagen; usar AIR para reducir imágenes innecesarias en adultos y niños." : "Alta probabilidad: valoración quirúrgica; puede evitarse imagen si la clínica es clara.",
          level: score <= 4 ? "ok" : score <= 8 ? "warn" : "danger"
        };
      },
      references: [
        "Andersson M, Andersson RE. The appendicitis inflammatory response score: a tool for the diagnosis of acute appendicitis. World J Surg. 2008;32(8):1843-9."
      ]
    },
    {
      id: "centor-mcisaac",
      name: "Puntuación Centor / McIsaac para faringitis estreptocócica",
      shortName: "Centor-McIsaac",
      description: "Estima la probabilidad de faringitis por estreptococo del grupo A y guía la decisión de test rápido o antibiótico.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "3–14 años", value: 1 },
            { label: "15–44 años", value: 0 },
            { label: "≥ 45 años", value: -1 }
          ]
        },
        { id: "exudado", type: "boolean", label: "Exudado o hipertrofia amigdalar" },
        { id: "adenopatia", type: "boolean", label: "Adenopatía cervical anterior dolorosa" },
        { id: "fiebre", type: "boolean", label: "Fiebre > 38 °C" },
        { id: "tos", type: "boolean", label: "Ausencia de tos" }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "exudado", "adenopatia", "fiebre", "tos"]);
        const prob = score <= 0 ? "1–2 %" : score === 1 ? "5–10 %" : score === 2 ? "11–17 %" : score === 3 ? "28–35 %" : "51–53 %";
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: prob,
          secondaryLabel: "probabilidad de estreptococo",
          interpretation: score <= 0 ? "Muy baja probabilidad: no test, no antibiótico." : score <= 1 ? "Baja: no test ni antibiótico rutinarios." : score <= 3 ? "Intermedia: test rápido o cultivo. Tratar solo si resulta positivo." : "Alta: puede plantearse tratamiento empírico, aunque las guías actuales recomiendan confirmar con test rápido para evitar antibioterapia innecesaria.",
          level: score <= 1 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "McIsaac WJ, et al. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ. 1998;158(1):75-83."
      ]
    },
    {
      id: "feverpain",
      name: "Puntuación FeverPAIN para faringitis",
      shortName: "FeverPAIN",
      description: "Alternativa británica a Centor para orientar el uso de antibióticos en la faringitis aguda.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        { id: "fiebre", type: "boolean", label: "Fiebre en las últimas 24 h" },
        { id: "exudado", type: "boolean", label: "Exudado purulento amigdalar" },
        { id: "rapido", type: "boolean", label: "Consulta rápida (≤ 3 días desde el inicio)" },
        { id: "inflamacion", type: "boolean", label: "Amígdalas muy inflamadas" },
        { id: "noTos", type: "boolean", label: "Ausencia de tos y de coriza" }
      ],
      compute: (v) => {
        const score = sum(v, ["fiebre", "exudado", "rapido", "inflamacion", "noTos"]);
        const prob = ["13–18 %", "13–18 %", "30–35 %", "30–35 %", "45–65 %", "62–65 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–5)",
          secondary: prob,
          secondaryLabel: "probabilidad de estreptococo",
          interpretation: score <= 1 ? "Baja probabilidad: manejo sintomático." : score <= 3 ? "Probabilidad intermedia: valorar «wait and see» (prescripción diferida a las 48 h si no mejora)." : "Alta probabilidad: valorar antibiótico o test rápido.",
          level: score <= 1 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Little P, et al. Clinical score and rapid antigen detection test to guide antibiotic use for sore throats (PRISM). BMJ. 2013;347:f5806."
      ]
    },
    {
      id: "kocher",
      name: "Criterios de Kocher para artritis séptica de cadera pediátrica",
      shortName: "Kocher",
      description: "Ayuda a diferenciar la artritis séptica de la sinovitis transitoria en niños con cadera dolorosa.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        { id: "noPeso", type: "boolean", label: "No apoya el peso sobre la pierna afectada" },
        { id: "fiebre", type: "boolean", label: "Fiebre > 38,5 °C" },
        { id: "leucos", type: "boolean", label: "Leucocitos > 12.000/mm³" },
        { id: "esr", type: "boolean", label: "VSG > 40 mm/h" }
      ],
      compute: (v) => {
        const score = sum(v, ["noPeso", "fiebre", "leucos", "esr"]);
        const prob = ["0,2 %", "3 %", "40 %", "93 %", "99 %"][score];
        return {
          main: String(score),
          mainUnit: "criterios (0–4)",
          secondary: prob,
          secondaryLabel: "probabilidad de artritis séptica",
          interpretation: score <= 1 ? "Baja probabilidad: sugiere sinovitis transitoria; valorar seguimiento." : score <= 2 ? "Probabilidad intermedia: valorar artrocentesis diagnóstica." : "Alta probabilidad de artritis séptica: valoración por traumatología pediátrica, artrocentesis y antibioterapia empírica.",
          level: score <= 1 ? "ok" : score <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Kocher MS, et al. Differentiating between septic arthritis and transient synovitis of the hip in children: an evidence-based clinical prediction algorithm. J Bone Joint Surg Am. 1999;81(12):1662-70."
      ]
    },
    {
      id: "meningitis-bacteriana",
      name: "Escala de meningitis bacteriana pediátrica (Nigrovic)",
      shortName: "BMS pediátrica",
      description: "Estima el riesgo de meningitis bacteriana en niños con pleocitosis en el líquido cefalorraquídeo.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        { id: "tincion", type: "boolean", label: "Tinción de Gram del LCR positiva" },
        { id: "convulsion", type: "boolean", label: "Convulsión al inicio o antes de la consulta" },
        { id: "proteinas", type: "boolean", label: "Proteínas en LCR ≥ 80 mg/dL" },
        { id: "neutrofilosLCR", type: "boolean", label: "Neutrófilos absolutos en LCR ≥ 1.000/mm³" },
        { id: "neutrofilosSangre", type: "boolean", label: "Neutrófilos absolutos en sangre ≥ 10.000/mm³" }
      ],
      compute: (v) => {
        const score = sum(v, ["tincion", "convulsion", "proteinas", "neutrofilosLCR", "neutrofilosSangre"]);
        return {
          main: String(score),
          mainUnit: "criterios (0–5)",
          interpretation: score === 0 ? "Riesgo muy bajo de meningitis bacteriana: en niños de 29 días a 19 años con LCR pleocitario, un puntaje 0 tiene sensibilidad ≈ 100 % y valor predictivo negativo próximo al 100 %. Puede plantearse observación sin antibioterapia empírica." : "Al menos un criterio positivo: iniciar antibioterapia empírica y considerar ingreso.",
          level: score === 0 ? "ok" : "danger"
        };
      },
      notes: [
        "Solo aplicable a niños ≥ 29 días con al menos 10 leucocitos/mm³ en LCR y buen aspecto.",
        "No aplicable si el paciente ha recibido antibióticos previos, tiene inmunodepresión, ha sido sometido a neurocirugía reciente o presenta un shunt del sistema nervioso central."
      ],
      references: [
        "Nigrovic LE, et al. Clinical prediction rule for identifying children with cerebrospinal fluid pleocytosis at very low risk of bacterial meningitis. JAMA. 2007;297(1):52-60."
      ]
    },
    {
      id: "ottawa-tobillo",
      name: "Reglas de Ottawa para tobillo y pie",
      shortName: "Ottawa tobillo/pie",
      description: "Identifica qué pacientes con lesión aguda de tobillo necesitan radiografía.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        { id: "malolar", type: "boolean", label: "Dolor a la palpación en los últimos 6 cm del maléolo lateral o medial" },
        { id: "quinto", type: "boolean", label: "Dolor a la palpación en la base del 5.º metatarsiano" },
        { id: "navicular", type: "boolean", label: "Dolor a la palpación en el hueso navicular" },
        { id: "apoyo", type: "boolean", label: "Incapacidad para dar 4 pasos (dos con cada pie) al llegar y en urgencias" }
      ],
      compute: (v) => {
        const tobillo = v.malolar === 1 || v.apoyo === 1;
        const pie = v.quinto === 1 || v.navicular === 1 || v.apoyo === 1;
        const rx = tobillo || pie;
        return {
          main: rx ? "Radiografía indicada" : "Radiografía no necesaria",
          interpretation: rx ? `Indicada radiografía de ${tobillo ? "tobillo" : ""}${tobillo && pie ? " y " : ""}${pie ? "pie" : ""}.` : "Ningún criterio positivo: puede omitirse la radiografía con seguridad razonable (sensibilidad ≈ 100 % para fractura clínicamente significativa).",
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
      description: "Identifica qué pacientes con traumatismo agudo de rodilla necesitan radiografía.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        { id: "edad", type: "boolean", label: "Edad ≥ 55 años" },
        { id: "peronea", type: "boolean", label: "Dolor a la palpación en la cabeza del peroné" },
        { id: "rotula", type: "boolean", label: "Dolor aislado a la palpación de la rótula" },
        { id: "flexion", type: "boolean", label: "Incapacidad para flexionar 90°" },
        { id: "apoyo", type: "boolean", label: "Incapacidad para caminar 4 pasos inmediatamente y en urgencias" }
      ],
      compute: (v) => {
        const rx = sum(v, ["edad", "peronea", "rotula", "flexion", "apoyo"]) >= 1;
        return {
          main: rx ? "Radiografía indicada" : "Radiografía no necesaria",
          interpretation: rx ? "Al menos un criterio positivo: indicada radiografía de rodilla." : "Ningún criterio positivo: puede omitirse la radiografía (sensibilidad ≈ 98–100 %).",
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
      description: "Regla de decisión para indicar imagen cervical en pacientes traumatizados alerta y estables.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        {
          id: "altoRiesgo",
          type: "boolean",
          label: "Factor de alto riesgo",
          description: "≥ 65 años, mecanismo peligroso (caída ≥ 1 m/5 escalones, carga axial, colisión de alta energía, vuelco, atropello, deportes con impacto), o parestesias en extremidades.",
          noPoints: true
        },
        {
          id: "bajoRiesgo",
          type: "boolean",
          label: "¿Cumple algún factor de bajo riesgo que permita valorar la movilidad?",
          description: "Colisión posterior simple, sedestación en urgencias, deambulación en cualquier momento, dolor cervical de inicio diferido o ausencia de dolor a la palpación línea media.",
          noPoints: true
        },
        {
          id: "rotacion",
          type: "boolean",
          label: "¿Puede rotar activamente el cuello 45° a cada lado?",
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
            interpretation: "No puede rotar activamente 45° a cada lado: imagen cervical.",
            level: "danger"
          };
        return {
          main: "Imagen no necesaria",
          interpretation: "Sin factores de alto riesgo, con al menos un factor de bajo riesgo y rotación cervical 45° a cada lado: puede retirarse la inmovilización cervical con seguridad (sensibilidad ≈ 100 %).",
          level: "ok"
        };
      },
      notes: ["Aplicable a pacientes ≥ 16 años, alerta (GCS 15), estables y no intoxicados, con traumatismo cervical cerrado en las últimas 48 h."],
      references: [
        "Stiell IG, et al. The Canadian C-Spine Rule for radiography in alert and stable trauma patients. JAMA. 2001;286(15):1841-8."
      ]
    },
    {
      id: "cchr",
      name: "Canadian CT Head Rule (CCHR)",
      shortName: "CCHR",
      description: "Regla para indicar tomografía craneal en el traumatismo craneoencefálico leve.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        { id: "gcs2h", type: "boolean", label: "GCS < 15 a las 2 h del traumatismo", noPoints: true },
        { id: "fracturaAbierta", type: "boolean", label: "Sospecha de fractura craneal abierta o deprimida", noPoints: true },
        { id: "baseCraneo", type: "boolean", label: "Signos de fractura de base de cráneo (hemotímpano, ojos de mapache, otorrea/rinorrea de LCR, signo de Battle)", noPoints: true },
        { id: "vomitos", type: "boolean", label: "≥ 2 episodios de vómitos", noPoints: true },
        { id: "edad65", type: "boolean", label: "Edad ≥ 65 años", noPoints: true },
        { id: "amnesia", type: "boolean", label: "Amnesia retrógrada > 30 min", noPoints: true },
        { id: "peligroso", type: "boolean", label: "Mecanismo peligroso (peatón atropellado, salir despedido de un vehículo, caída > 1 m / 5 escalones)", noPoints: true }
      ],
      compute: (v) => {
        const alto = v.gcs2h === 1 || v.fracturaAbierta === 1 || v.baseCraneo === 1 || v.vomitos === 1 || v.edad65 === 1;
        const medio = !alto && (v.amnesia === 1 || v.peligroso === 1);
        return {
          main: alto ? "TC obligada" : medio ? "TC recomendada" : "TC no necesaria",
          interpretation: alto ? "Al menos un factor de alto riesgo: tomografía craneal obligada." : medio ? "Factor de riesgo medio: tomografía craneal recomendada para descartar lesión clínicamente significativa." : "Ningún factor: puede evitarse la tomografía (regla con sensibilidad ≈ 100 % para lesión que requiera intervención neuroquirúrgica).",
          level: alto ? "danger" : medio ? "warn" : "ok"
        };
      },
      notes: ["Aplicable a traumatismo craneoencefálico cerrado con GCS 13–15 y pérdida de conciencia testificada, amnesia o desorientación tras el traumatismo."],
      references: [
        "Stiell IG, et al. The Canadian CT Head Rule for patients with minor head injury. Lancet. 2001;357(9266):1391-6."
      ]
    },
    {
      id: "rosier",
      name: "Escala ROSIER (Recognition of Stroke in the Emergency Room)",
      shortName: "ROSIER",
      description: "Reconocimiento del ictus agudo en urgencias.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        { id: "sincope", type: "boolean", label: "Pérdida de conciencia o síncope", points: -1 },
        { id: "convulsion", type: "boolean", label: "Actividad convulsiva", points: -1 },
        { id: "facial", type: "boolean", label: "Debilidad facial de nueva aparición" },
        { id: "brazo", type: "boolean", label: "Debilidad asimétrica del brazo de nueva aparición" },
        { id: "pierna", type: "boolean", label: "Debilidad asimétrica de la pierna de nueva aparición" },
        { id: "habla", type: "boolean", label: "Alteración del habla de nueva aparición" },
        { id: "visual", type: "boolean", label: "Defecto de campo visual de nueva aparición" }
      ],
      compute: (v) => {
        const score = sum(v, ["sincope", "convulsion", "facial", "brazo", "pierna", "habla", "visual"]);
        return {
          main: String(score),
          mainUnit: "puntos (−2 a +5)",
          interpretation: score > 0 ? "ROSIER > 0: alta probabilidad de ictus. Activar código ictus y traslado a centro adecuado." : "ROSIER ≤ 0: ictus poco probable. Considerar diagnósticos alternativos (hipoglucemia, migraña, síncope, convulsión, mareo periférico).",
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
      name: "Puntuación REMS (Rapid Emergency Medicine Score)",
      shortName: "REMS",
      description: "Predice la mortalidad intrahospitalaria en pacientes que acuden a urgencias.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          dropdown: true,
          options: [
            { label: "< 45 años", value: 0 },
            { label: "45–54", value: 2 },
            { label: "55–64", value: 3 },
            { label: "65–74", value: 5 },
            { label: "≥ 75", value: 6 }
          ]
        },
        {
          id: "pam",
          type: "select",
          label: "Presión arterial media (mmHg)",
          dropdown: true,
          options: [
            { label: "70–109", value: 0 },
            { label: "50–69 o 110–129", value: 2 },
            { label: "≥ 160", value: 3 },
            { label: "130–159", value: 3.0001 },
            { label: "< 50", value: 4 }
          ]
        },
        {
          id: "fc",
          type: "select",
          label: "Frecuencia cardíaca",
          dropdown: true,
          options: [
            { label: "70–109 lpm", value: 0 },
            { label: "110–139 o 55–69", value: 2 },
            { label: "140–179 o 40–54", value: 3 },
            { label: "≥ 180 o ≤ 39", value: 4 }
          ]
        },
        {
          id: "fr",
          type: "select",
          label: "Frecuencia respiratoria",
          dropdown: true,
          options: [
            { label: "12–24 rpm", value: 0 },
            { label: "10–11 o 25–34", value: 1 },
            { label: "6–9", value: 2 },
            { label: "35–49", value: 3 },
            { label: "≥ 50 o ≤ 5", value: 4 }
          ]
        },
        {
          id: "spo2",
          type: "select",
          label: "SpO₂",
          dropdown: true,
          options: [
            { label: "> 89 %", value: 0 },
            { label: "86–89 %", value: 1 },
            { label: "75–85 %", value: 3 },
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
            { label: "11–13", value: 1 },
            { label: "8–10", value: 2 },
            { label: "5–7", value: 3 },
            { label: "< 5", value: 4 }
          ]
        }
      ],
      compute: (v) => {
        const score = Math.round(sum(v, ["edad", "pam", "fc", "fr", "spo2", "gcs"]));
        const mort = score <= 2 ? "0,3 %" : score <= 5 ? "2 %" : score <= 9 ? "9 %" : score <= 11 ? "17 %" : score <= 15 ? "38 %" : "75 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–26)",
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
      description: "Cuantifica la gravedad del síndrome de abstinencia de opioides.",
      category: "Alcohol y abstinencia",
      specialty: URG,
      inputs: [
        { id: "fc", type: "select", label: "Frecuencia cardíaca (lpm)", options: [
          { label: "≤ 80", value: 0 },
          { label: "81–100", value: 1 },
          { label: "101–120", value: 2 },
          { label: "> 120", value: 4 }
        ] },
        { id: "sudoracion", type: "select", label: "Sudoración", options: [
          { label: "Ausente", value: 0 },
          { label: "Escalofríos o rubor", value: 1 },
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
          { label: "Normales o mióticas", value: 0 },
          { label: "Posiblemente mayores de lo normal", value: 1 },
          { label: "Moderadamente dilatadas", value: 2 },
          { label: "Muy dilatadas", value: 5 }
        ] },
        { id: "huesos", type: "select", label: "Dolor óseo o articular", options: [
          { label: "Ausente", value: 0 },
          { label: "Molestia leve", value: 1 },
          { label: "Dolor difuso", value: 2 },
          { label: "Frota articulaciones, no soporta el dolor", value: 4 }
        ] },
        { id: "rinorrea", type: "select", label: "Rinorrea o lagrimeo", options: [
          { label: "Ausente", value: 0 },
          { label: "Congestión nasal o lagrimeo leve", value: 1 },
          { label: "Rinorrea o lagrimeo", value: 2 },
          { label: "Rinorrea y lagrimeo continuos", value: 4 }
        ] },
        { id: "gi", type: "select", label: "Molestias gastrointestinales", options: [
          { label: "Sin síntomas", value: 0 },
          { label: "Retortijones", value: 1 },
          { label: "Náuseas o heces blandas", value: 2 },
          { label: "Vómitos o diarrea", value: 3 },
          { label: "Vómitos y diarrea múltiples", value: 5 }
        ] },
        { id: "temblor", type: "select", label: "Temblor (manos extendidas)", options: [
          { label: "Sin temblor", value: 0 },
          { label: "Palpable, no visible", value: 1 },
          { label: "Fasciculaciones leves visibles", value: 2 },
          { label: "Temblor grueso extenso", value: 4 }
        ] },
        { id: "bostezos", type: "select", label: "Bostezos", options: [
          { label: "Ausentes", value: 0 },
          { label: "1–2 veces durante la evaluación", value: 1 },
          { label: "≥ 3 veces", value: 2 },
          { label: "≥ 3 veces por minuto", value: 4 }
        ] },
        { id: "ansiedad", type: "select", label: "Ansiedad o irritabilidad", options: [
          { label: "Ausente", value: 0 },
          { label: "Levemente ansioso", value: 1 },
          { label: "Moderadamente ansioso", value: 2 },
          { label: "Tan ansioso que dificulta la evaluación", value: 4 }
        ] },
        { id: "piloereccion", type: "select", label: "Piloerección", options: [
          { label: "Piel lisa", value: 0 },
          { label: "Cutis anserina en brazos", value: 3 },
          { label: "Piloerección evidente", value: 5 }
        ] }
      ],
      compute: (v) => {
        const score = sum(v, ["fc", "sudoracion", "inquietud", "pupilas", "huesos", "rinorrea", "gi", "temblor", "bostezos", "ansiedad", "piloereccion"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–48)",
          interpretation: score < 5 ? "Sin abstinencia significativa." : score < 13 ? "Abstinencia leve (5–12): valorar iniciar tratamiento con buprenorfina si procede." : score < 25 ? "Abstinencia moderada (13–24): apto para iniciar buprenorfina." : score < 37 ? "Abstinencia moderadamente intensa (25–36): tratamiento activo." : "Abstinencia intensa (≥ 37): tratamiento activo y vigilancia estrecha.",
          level: score < 5 ? "ok" : score < 13 ? "info" : score < 25 ? "warn" : "danger"
        };
      },
      notes: ["Un COWS ≥ 8 indica abstinencia objetiva mínima suficiente para iniciar la inducción con buprenorfina de forma segura."],
      references: [
        "Wesson DR, Ling W. The Clinical Opiate Withdrawal Scale (COWS). J Psychoactive Drugs. 2003;35(2):253-9."
      ]
    },
    {
      id: "mcmahon",
      name: "Puntuación de McMahon para la rabdomiólisis",
      shortName: "McMahon",
      description: "Predice la mortalidad o la necesidad de terapia renal sustitutiva en la rabdomiólisis.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 51 años", value: 0 },
            { label: "51–70 años", value: 1.5 },
            { label: "71–80 años", value: 2.5 },
            { label: "> 80 años", value: 3 }
          ]
        },
        {
          id: "sexo",
          type: "select",
          label: "Sexo",
          options: [
            { label: "Varón", value: 0 },
            { label: "Mujer", value: 1 }
          ]
        },
        {
          id: "etiologia",
          type: "boolean",
          label: "Etiología distinta de convulsión, síncope, ejercicio, estatinas o mioaflibrada",
          points: 3
        },
        { id: "creatinina", type: "boolean", label: "Creatinina > 1,4 mg/dL", points: 1.5 },
        { id: "calcio", type: "boolean", label: "Calcio inicial < 7,5 mg/dL", points: 2 },
        { id: "ck", type: "boolean", label: "CK inicial > 40.000 U/L", points: 2 },
        { id: "fosfato", type: "boolean", label: "Fósforo inicial > 4,0 mg/dL", points: 1.5 },
        { id: "bicarbonato", type: "boolean", label: "Bicarbonato < 19 mmol/L", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "sexo", "etiologia", "creatinina", "calcio", "ck", "fosfato", "bicarbonato"]);
        return {
          main: fmt(score, 1),
          mainUnit: "puntos",
          interpretation: score < 5 ? "Riesgo bajo (probabilidad de diálisis o muerte ≈ 3 %): puede manejarse fuera de cuidados intensivos con hidratación y vigilancia." : score <= 10 ? "Riesgo intermedio (≈ 20 %): vigilancia estrecha y valoración por nefrología." : "Riesgo alto (> 50 %): considerar ingreso en cuidados intermedios o intensivos y preparación para terapia renal sustitutiva.",
          level: score < 5 ? "ok" : score <= 10 ? "warn" : "danger"
        };
      },
      references: [
        "McMahon GM, et al. A risk prediction score for kidney failure or mortality in rhabdomyolysis. JAMA Intern Med. 2013;173(19):1821-8."
      ]
    },
    {
      id: "bishop",
      name: "Puntuación de Bishop para la maduración cervical",
      shortName: "Bishop",
      description: "Estima la favorabilidad del cuello uterino para la inducción del parto.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        {
          id: "dilatacion",
          type: "select",
          label: "Dilatación",
          options: [
            { label: "0 cm", value: 0 },
            { label: "1–2 cm", value: 1 },
            { label: "3–4 cm", value: 2 },
            { label: "≥ 5 cm", value: 3 }
          ]
        },
        {
          id: "borramiento",
          type: "select",
          label: "Borramiento",
          options: [
            { label: "0–30 %", value: 0 },
            { label: "40–50 %", value: 1 },
            { label: "60–70 %", value: 2 },
            { label: "≥ 80 %", value: 3 }
          ]
        },
        {
          id: "estacion",
          type: "select",
          label: "Estación (planos de Hodge)",
          options: [
            { label: "−3", value: 0 },
            { label: "−2", value: 1 },
            { label: "−1 / 0", value: 2 },
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
          label: "Posición del cuello",
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
          mainUnit: "puntos (0–13)",
          interpretation: score <= 5 ? "Cuello desfavorable: la inducción probablemente requerirá maduración cervical previa (prostaglandinas o balón)." : score <= 8 ? "Favorabilidad intermedia: valorar inducción con oxitocina y amniotomía según protocolo." : "Cuello favorable (≥ 9): la inducción con oxitocina tiene alta probabilidad de éxito.",
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
      category: CAT_TOX,
      specialty: URG,
      inputs: [
        { id: "glucemia", type: "number", label: "Glucemia en ayunas", unit: "mg/dL", min: 30, max: 500, step: 1 },
        { id: "insulina", type: "number", label: "Insulina en ayunas", unit: "µU/mL", min: 0, max: 500, step: 0.1 }
      ],
      compute: (v) => {
        const glucoseMmol = v.glucemia / 18;
        const homa = v.insulina * glucoseMmol / 22.5;
        return {
          main: fmt(homa, 2),
          mainUnit: "HOMA-IR",
          interpretation: homa < 2.5 ? "HOMA-IR < 2,5: sensibilidad a la insulina en rango habitual." : homa < 3.8 ? "Resistencia leve-moderada: valorar estilo de vida y factores de riesgo cardiometabólico." : "Resistencia significativa: alto riesgo de diabetes tipo 2 y síndrome metabólico. Intervención sobre estilo de vida y valoración de tratamiento.",
          level: homa < 2.5 ? "ok" : homa < 3.8 ? "warn" : "danger",
          details: ["Fórmula: HOMA-IR = insulina × glucosa (mmol/L) / 22,5."]
        };
      },
      notes: ["Los puntos de corte varían por población; usar los del laboratorio de referencia."],
      references: [
        "Matthews DR, et al. Homeostasis model assessment: insulin resistance and beta-cell function from fasting plasma glucose and insulin concentrations in man. Diabetologia. 1985;28(7):412-9."
      ]
    },
    {
      id: "hba1c-glucosa",
      name: "Glucosa promedio estimada a partir de la HbA1c",
      shortName: "eAG",
      description: "Convierte la hemoglobina glucosilada en glucemia media estimada.",
      category: CAT_TOX,
      specialty: URG,
      inputs: [
        { id: "hba1c", type: "number", label: "HbA1c", unit: "%", min: 4, max: 20, step: 0.1 }
      ],
      compute: (v) => {
        const eag = 28.7 * v.hba1c - 46.7;
        return {
          main: fmt(eag, 0),
          mainUnit: "mg/dL (glucosa media estimada)",
          interpretation: v.hba1c < 5.7 ? "HbA1c normal (< 5,7 %)." : v.hba1c < 6.5 ? "Prediabetes (5,7–6,4 %): recomendar cambios de estilo de vida." : "Rango de diabetes (≥ 6,5 %): valorar objetivos individualizados de control (habitualmente HbA1c < 7 %, más estricto o menos según el paciente).",
          level: v.hba1c < 5.7 ? "ok" : v.hba1c < 6.5 ? "warn" : "danger",
          details: ["Fórmula: eAG (mg/dL) = 28,7 × HbA1c − 46,7 (Nathan 2008)."]
        };
      },
      references: [
        "Nathan DM, et al. Translating the A1C assay into estimated average glucose values. Diabetes Care. 2008;31(8):1473-8."
      ]
    },
    {
      id: "forrest",
      name: "Clasificación de Forrest para la hemorragia digestiva alta",
      shortName: "Forrest",
      description: "Estratifica el riesgo de resangrado y mortalidad en la úlcera péptica sangrante según los hallazgos endoscópicos.",
      category: CAT_URG,
      specialty: URG,
      inputs: [
        {
          id: "grado",
          type: "select",
          label: "Hallazgo endoscópico",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Ia — Sangrado arterial pulsátil", value: 1 },
            { label: "Ib — Sangrado en sábana (venoso)", value: 2 },
            { label: "IIa — Vaso visible no sangrante", value: 3 },
            { label: "IIb — Coágulo adherido", value: 4 },
            { label: "IIc — Mancha plana pigmentada (hematina)", value: 5 },
            { label: "III — Base limpia sin estigmas", value: 6 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const g = (_a = v.grado) != null ? _a : 6;
        const info = [
          "",
          { r: "55 %", m: "11 %", a: "Alto riesgo — tratamiento endoscópico obligado", level: "danger" },
          { r: "55 %", m: "11 %", a: "Alto riesgo — tratamiento endoscópico obligado", level: "danger" },
          { r: "43 %", m: "11 %", a: "Alto riesgo — tratamiento endoscópico", level: "danger" },
          { r: "22 %", m: "7 %", a: "Riesgo intermedio — tratamiento endoscópico", level: "warn" },
          { r: "10 %", m: "3 %", a: "Riesgo bajo — no requiere terapia endoscópica", level: "ok" },
          { r: "5 %", m: "2 %", a: "Riesgo muy bajo — alta precoz posible", level: "ok" }
        ][g];
        const labels = ["", "Ia", "Ib", "IIa", "IIb", "IIc", "III"];
        return {
          main: `Forrest ${labels[g]}`,
          secondary: info.r,
          secondaryLabel: "riesgo de resangrado",
          interpretation: `${info.a}. Mortalidad ≈ ${info.m}. En Forrest I y IIa se recomienda tratamiento endoscópico (inyección + método térmico o clip) e IBP intravenoso en perfusión.`,
          level: info.level
        };
      },
      references: [
        "Forrest JA, et al. Endoscopy in gastrointestinal bleeding. Lancet. 1974;2(7877):394-7."
      ]
    }
  ];

  // inurse-m2/src/calculators/medicina-familia.ts
  var CAT_GENERAL = "Medicina interna y familiar";
  var CAT_GERIA = "Geriatría, fragilidad y salud mental";
  var CAT_DIABETES = "Endocrino, obesidad y diabetes";
  var CAT_GASTRO = "Hepato-digestivo y nutrición";
  var CAT_HEMATO = "Hematología y oncología";
  var CAT_CARDIO = "Síndrome coronario agudo y dolor torácico";
  var CAT_TEV = "Tromboembolismo venoso";
  var CAT_RESPI = "Respiratorio crítico y ventilación";
  var FAM = ["Medicina Familiar"];
  var escala8 = (items) => items.map(([value, label]) => ({ label: `${value} — ${label}`, value }));
  var medicinaFamilia = [
    {
      id: "bristol",
      name: "Escala de heces de Bristol",
      shortName: "Bristol",
      description: "Clasifica la consistencia de las heces en siete tipos; útil en estreñimiento, diarrea y síndrome del intestino irritable.",
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
            { label: "Tipo 1 — Bolas duras separadas, como nueces", value: 1 },
            { label: "Tipo 2 — Salchicha compuesta de fragmentos", value: 2 },
            { label: "Tipo 3 — Salchicha con grietas en la superficie", value: 3 },
            { label: "Tipo 4 — Salchicha lisa y blanda", value: 4 },
            { label: "Tipo 5 — Fragmentos blandos con bordes definidos", value: 5 },
            { label: "Tipo 6 — Fragmentos blandos y esponjosos", value: 6 },
            { label: "Tipo 7 — Líquido sin fragmentos sólidos", value: 7 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const t = (_a = v.tipo) != null ? _a : 4;
        const banda = t <= 2 ? "Estreñimiento" : t <= 5 ? "Normal" : "Diarrea";
        const detalle = t <= 2 ? "Sugiere estreñimiento: aumentar fibra, líquidos y actividad física; valorar laxantes si es persistente." : t <= 4 ? "Tránsito y consistencia normales." : t === 5 ? "Blandas: puede indicar tránsito ligeramente acelerado; valorar dieta." : t === 6 ? "Sugiere diarrea: valorar hidratación, dieta y factores desencadenantes." : "Diarrea líquida: reposición hidroelectrolítica; buscar causa infecciosa, medicamentosa o funcional.";
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
      name: "Escala de fragilidad clínica (Rockwood CFS)",
      shortName: "Rockwood CFS",
      description: "Cuantifica el grado de fragilidad clínica en pacientes ≥ 65 años.",
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
            { label: "1 — Muy en forma: robusto, activo, motivado", value: 1 },
            { label: "2 — En forma: sin enfermedad activa; ejercicio ocasional", value: 2 },
            { label: "3 — Se mantiene bien: enfermedades controladas; no realiza ejercicio regular", value: 3 },
            { label: "4 — Vulnerable: no depende de otros, pero los síntomas limitan la actividad", value: 4 },
            { label: "5 — Fragilidad leve: dependencia parcial en actividades instrumentales", value: 5 },
            { label: "6 — Fragilidad moderada: necesita ayuda en actividades exteriores y algunas del hogar", value: 6 },
            { label: "7 — Fragilidad grave: dependencia total para el autocuidado; estable", value: 7 },
            { label: "8 — Fragilidad muy grave: dependencia total; enfermedad terminal probable en < 6 meses", value: 8 },
            { label: "9 — Enfermedad terminal: expectativa de vida < 6 meses", value: 9 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const n = (_a = v.nivel) != null ? _a : 1;
        return {
          main: `CFS ${n}`,
          interpretation: n <= 3 ? "No frágil: buen pronóstico funcional; expectativa de recuperación tras enfermedad aguda." : n === 4 ? "Vulnerable: mayor riesgo de deterioro con enfermedad aguda; anticipar apoyo." : n <= 6 ? "Fragilidad leve-moderada: mayor riesgo de deterioro funcional, delirium y mortalidad. Valorar intensidad del tratamiento y objetivos con el paciente y la familia." : n <= 8 ? "Fragilidad grave o muy grave: enfoque paliativo y confortable; los tratamientos invasivos ofrecen escaso beneficio." : "Enfermedad terminal: cuidados paliativos y planificación del final de vida.",
          level: n <= 3 ? "ok" : n <= 5 ? "warn" : "danger"
        };
      },
      notes: [
        "Aplicable a pacientes ≥ 65 años; el juicio clínico prevalece.",
        "Muy usada durante la pandemia COVID-19 para orientar la toma de decisiones sobre soporte vital avanzado."
      ],
      references: [
        "Rockwood K, et al. A global clinical measure of fitness and frailty in elderly people. CMAJ. 2005;173(5):489-95."
      ]
    },
    {
      id: "cdr",
      name: "Escala clínica de demencia (CDR)",
      shortName: "CDR",
      description: "Estadifica la gravedad clínica de la demencia mediante seis dominios.",
      category: CAT_GERIA,
      specialty: FAM,
      inputs: [
        ...[
          ["memoria", "Memoria"],
          ["orientacion", "Orientación"],
          ["juicio", "Juicio y resolución de problemas"],
          ["asuntos", "Asuntos comunitarios"],
          ["hogar", "Hogar y aficiones"],
          ["cuidado", "Cuidado personal"]
        ].map(([id, label]) => ({
          id,
          type: "select",
          label,
          dropdown: true,
          options: [
            { label: "0 — Sin alteración", value: 0 },
            { label: "0,5 — Cuestionable", value: 0.5 },
            { label: "1 — Leve", value: 1 },
            { label: "2 — Moderada", value: 2 },
            { label: "3 — Grave", value: 3 }
          ]
        }))
      ],
      compute: (v) => {
        var _a;
        const memoria = (_a = v.memoria) != null ? _a : 0;
        const secundarios = ["orientacion", "juicio", "asuntos", "hogar", "cuidado"].map((k) => {
          var _a2;
          return (_a2 = v[k]) != null ? _a2 : 0;
        });
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
          interpretation: g === 0 ? "Sin demencia clínica." : g === 0.5 ? "Deterioro cognitivo leve o cuestionable: seguimiento y evaluación neuropsicológica." : g === 1 ? "Demencia leve: apoyo a la persona y a la familia, valoración de tratamiento específico." : g === 2 ? "Demencia moderada: dependencia creciente; planificar cuidados y decisiones anticipadas." : "Demencia grave: cuidados de apoyo intensivos; valorar cuidados paliativos.",
          level: g === 0 ? "ok" : g <= 1 ? "warn" : "danger"
        };
      },
      notes: [
        "Se usa el algoritmo estándar: la memoria es el dominio principal; si 3 o más secundarios coinciden con el valor de memoria, el CDR global es ese valor."
      ],
      references: [
        "Morris JC. The Clinical Dementia Rating (CDR): current version and scoring rules. Neurology. 1993;43(11):2412-4."
      ]
    },
    {
      id: "gds-15",
      name: "Escala de depresión geriátrica de Yesavage (GDS-15)",
      shortName: "GDS-15",
      description: "Cribado de depresión en personas mayores mediante 15 preguntas de respuesta sí/no.",
      category: CAT_GERIA,
      specialty: FAM,
      inputs: [
        { id: "q1", type: "boolean", label: "¿Está satisfecho/a con su vida?", labels: ["Sí", "No"] },
        { id: "q2", type: "boolean", label: "¿Ha renunciado a muchas actividades e intereses?", labels: ["No", "Sí"] },
        { id: "q3", type: "boolean", label: "¿Siente que su vida está vacía?", labels: ["No", "Sí"] },
        { id: "q4", type: "boolean", label: "¿Se aburre a menudo?", labels: ["No", "Sí"] },
        { id: "q5", type: "boolean", label: "¿Está de buen humor la mayor parte del tiempo?", labels: ["Sí", "No"] },
        { id: "q6", type: "boolean", label: "¿Tiene miedo de que le suceda algo malo?", labels: ["No", "Sí"] },
        { id: "q7", type: "boolean", label: "¿Se siente feliz la mayor parte del tiempo?", labels: ["Sí", "No"] },
        { id: "q8", type: "boolean", label: "¿Se siente a menudo indefenso/a?", labels: ["No", "Sí"] },
        { id: "q9", type: "boolean", label: "¿Prefiere quedarse en casa a salir a hacer cosas nuevas?", labels: ["No", "Sí"] },
        { id: "q10", type: "boolean", label: "¿Cree que tiene más problemas de memoria que los demás?", labels: ["No", "Sí"] },
        { id: "q11", type: "boolean", label: "¿Cree que es maravilloso estar vivo/a?", labels: ["Sí", "No"] },
        { id: "q12", type: "boolean", label: "¿Se siente inútil tal como está ahora?", labels: ["No", "Sí"] },
        { id: "q13", type: "boolean", label: "¿Se siente lleno/a de energía?", labels: ["Sí", "No"] },
        { id: "q14", type: "boolean", label: "¿Cree que su situación es desesperada?", labels: ["No", "Sí"] },
        { id: "q15", type: "boolean", label: "¿Cree que la mayoría de la gente está mejor que usted?", labels: ["No", "Sí"] }
      ],
      compute: (v) => {
        const score = sum(v, Array.from({ length: 15 }, (_, i) => `q${i + 1}`));
        return {
          main: String(score),
          mainUnit: "puntos (0–15)",
          interpretation: score <= 4 ? "Sin depresión: puntuación en rango normal." : score <= 8 ? "Depresión leve o probable: valorar entrevista clínica estructurada y seguimiento." : score <= 11 ? "Depresión moderada: evaluación diagnóstica y valorar tratamiento." : "Depresión grave: iniciar tratamiento y valorar riesgo autolítico.",
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
      description: "Cuantifica la gravedad de los síntomas de ansiedad mediante 14 dimensiones.",
      category: CAT_GERIA,
      specialty: FAM,
      inputs: [
        "Estado de ánimo ansioso",
        "Tensión",
        "Miedos",
        "Insomnio",
        "Función intelectual (concentración)",
        "Ánimo depresivo",
        "Síntomas somáticos musculares",
        "Síntomas somáticos sensoriales",
        "Síntomas cardiovasculares",
        "Síntomas respiratorios",
        "Síntomas gastrointestinales",
        "Síntomas genitourinarios",
        "Síntomas autonómicos",
        "Comportamiento en la entrevista"
      ].map((label, i) => ({
        id: `d${i + 1}`,
        type: "select",
        label,
        dropdown: true,
        options: escala8([
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
          mainUnit: "puntos (0–56)",
          interpretation: score < 8 ? "Sin ansiedad clínicamente significativa." : score <= 14 ? "Ansiedad leve." : score <= 23 ? "Ansiedad moderada." : "Ansiedad grave: valorar tratamiento farmacológico y derivación.",
          level: score < 8 ? "ok" : score <= 14 ? "info" : score <= 23 ? "warn" : "danger"
        };
      },
      references: [
        "Hamilton M. The assessment of anxiety states by rating. Br J Med Psychol. 1959;32(1):50-5."
      ]
    },
    {
      id: "bri",
      name: "Índice de redondez corporal (BRI)",
      shortName: "BRI",
      description: "Estima el porcentaje de grasa corporal y grasa visceral a partir del perímetro abdominal y la talla.",
      category: CAT_DIABETES,
      specialty: FAM,
      inputs: [
        { id: "talla", type: "number", label: "Talla", unit: "cm", min: 100, max: 220, step: 0.5 },
        { id: "cintura", type: "number", label: "Perímetro abdominal (a la altura del ombligo)", unit: "cm", min: 40, max: 200, step: 0.5 }
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
          secondaryLabel: "quintil de riesgo cardiometabólico",
          interpretation: banda === "muy bajo" || banda === "bajo" ? "Riesgo cardiometabólico bajo según distribución corporal." : banda === "medio" ? "Riesgo cardiometabólico intermedio." : "Distribución corporal asociada a mayor riesgo cardiometabólico: valorar intervención sobre hábitos.",
          level: banda === "muy bajo" || banda === "bajo" ? "ok" : banda === "medio" ? "warn" : "danger"
        };
      },
      references: [
        "Thomas DM, et al. Relationships between body roundness with body fat and visceral adipose tissue emerging from a new geometrical model. Obesity (Silver Spring). 2013;21(11):2264-71."
      ]
    },
    {
      id: "findrisc",
      name: "FINDRISC — Riesgo de diabetes tipo 2 a 10 años",
      shortName: "FINDRISC",
      description: "Cribado del riesgo de diabetes tipo 2 en 10 años basado en factores clínicos.",
      category: CAT_DIABETES,
      specialty: FAM,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 45 años", value: 0 },
            { label: "45–54 años", value: 2 },
            { label: "55–64 años", value: 3 },
            { label: "> 64 años", value: 4 }
          ]
        },
        {
          id: "imc",
          type: "select",
          label: "Índice de masa corporal",
          options: [
            { label: "< 25 kg/m²", value: 0 },
            { label: "25–30 kg/m²", value: 1 },
            { label: "> 30 kg/m²", value: 3 }
          ]
        },
        {
          id: "cintura",
          type: "select",
          label: "Perímetro abdominal",
          dropdown: true,
          options: [
            { label: "Varón < 94 cm o mujer < 80 cm", value: 0 },
            { label: "Varón 94–102 cm o mujer 80–88 cm", value: 3 },
            { label: "Varón > 102 cm o mujer > 88 cm", value: 4 }
          ]
        },
        { id: "actividad", type: "boolean", label: "Actividad física < 30 min al día", points: 2 },
        {
          id: "dieta",
          type: "select",
          label: "Consumo diario de verduras, frutas u hortalizas",
          options: [
            { label: "Todos los días", value: 0 },
            { label: "No todos los días", value: 1 }
          ]
        },
        { id: "medicacion", type: "boolean", label: "Toma medicación para la hipertensión", points: 2 },
        { id: "glucemia", type: "boolean", label: "Antecedente de glucemia alta (embarazo, chequeo, enfermedad)", points: 5 },
        {
          id: "familia",
          type: "select",
          label: "Familiares con diabetes",
          options: [
            { label: "No", value: 0 },
            { label: "Abuelos, tíos o primos", value: 3 },
            { label: "Padres, hermanos o hijos", value: 5 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["edad", "imc", "cintura", "actividad", "dieta", "medicacion", "glucemia", "familia"]);
        const riesgo2 = score < 7 ? "bajo (≈ 1 %)" : score < 12 ? "ligeramente elevado (≈ 4 %)" : score < 15 ? "moderado (≈ 17 %)" : score < 21 ? "alto (≈ 33 %)" : "muy alto (≈ 50 %)";
        return {
          main: String(score),
          mainUnit: "puntos (0–26)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de diabetes en 10 años",
          interpretation: score < 12 ? "Riesgo bajo o ligeramente elevado: mantener estilo de vida saludable y reevaluar en 3–5 años." : score < 15 ? "Riesgo moderado: intervención sobre estilo de vida y valorar glucemia basal." : "Riesgo alto o muy alto: glucemia basal y/o HbA1c, intervención intensiva sobre estilo de vida.",
          level: score < 12 ? "ok" : score < 15 ? "warn" : "danger"
        };
      },
      references: [
        "Lindström J, Tuomilehto J. The diabetes risk score. Diabetes Care. 2003;26(3):725-31."
      ]
    },
    {
      id: "fli",
      name: "Fatty Liver Index (FLI)",
      shortName: "FLI",
      description: "Predice la presencia de esteatosis hepática por criterios ecográficos.",
      category: CAT_GASTRO,
      specialty: FAM,
      inputs: [
        { id: "tg", type: "number", label: "Triglicéridos", unit: "mg/dL", min: 30, max: 1e3, step: 1 },
        { id: "imc", type: "number", label: "IMC", unit: "kg/m²", min: 15, max: 60, step: 0.1 },
        { id: "ggt", type: "number", label: "GGT", unit: "U/L", min: 5, max: 1500, step: 1 },
        { id: "cintura", type: "number", label: "Perímetro abdominal", unit: "cm", min: 40, max: 200, step: 0.5 }
      ],
      compute: (v) => {
        const L = 0.953 * Math.log(v.tg) + 0.139 * v.imc + 0.718 * Math.log(v.ggt) + 0.053 * v.cintura - 15.745;
        const fli = Math.exp(L) / (1 + Math.exp(L)) * 100;
        return {
          main: fmt(fli, 0),
          mainUnit: "FLI (0–100)",
          interpretation: fli < 30 ? "FLI < 30: hígado graso razonablemente descartado (sensibilidad ≈ 87 %)." : fli < 60 ? "FLI 30–59: no concluyente; interpretar con la clínica y los factores de riesgo metabólicos." : "FLI ≥ 60: esteatosis hepática altamente probable (especificidad ≈ 86 %). Valorar estudio adicional (elastografía, control metabólico).",
          level: fli < 30 ? "ok" : fli < 60 ? "warn" : "danger"
        };
      },
      references: [
        "Bedogni G, et al. The Fatty Liver Index: a simple and accurate predictor of hepatic steatosis in the general population. BMC Gastroenterol. 2006;6:33."
      ]
    },
    {
      id: "cdai",
      name: "CDAI — Índice de actividad de la enfermedad de Crohn",
      shortName: "CDAI",
      description: "Cuantifica la actividad de la enfermedad de Crohn.",
      category: CAT_GASTRO,
      specialty: FAM,
      inputs: [
        { id: "deposiciones", type: "number", label: "Número de deposiciones líquidas o pastosas en 7 días", min: 0, max: 200, step: 1 },
        {
          id: "dolor",
          type: "number",
          label: "Dolor abdominal (suma diaria 0–3, 7 días)",
          description: "0 ninguno · 1 leve · 2 moderado · 3 grave",
          min: 0,
          max: 21,
          step: 1
        },
        {
          id: "bienestar",
          type: "number",
          label: "Bienestar general (suma diaria 0–4, 7 días)",
          description: "0 bien · 1 regular · 2 mal · 3 muy mal · 4 terrible",
          min: 0,
          max: 28,
          step: 1
        },
        {
          id: "complicaciones",
          type: "number",
          label: "Número de complicaciones (artritis, iritis/uveítis, eritema/aftas, fisura/fístula, fiebre)",
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
        { id: "pesoDif", type: "number", label: "Porcentaje de desviación del peso respecto al estándar", unit: "%", min: -50, max: 50, step: 1 }
      ],
      compute: (v) => {
        var _a, _b;
        const score = 2 * v.deposiciones + 5 * v.dolor + 7 * v.bienestar + 20 * v.complicaciones + 30 * ((_a = v.antidiarreicos) != null ? _a : 0) + 10 * ((_b = v.masa) != null ? _b : 0) + 6 * v.hto + v.pesoDif;
        return {
          main: fmt(score, 0),
          mainUnit: "CDAI",
          interpretation: score < 150 ? "Enfermedad en remisión (< 150)." : score < 220 ? "Actividad leve (150–219)." : score < 450 ? "Actividad moderada (220–449)." : "Actividad grave (≥ 450): valorar hospitalización.",
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
      description: "Cuantifica el estado funcional del paciente oncológico; guía la tolerancia a tratamientos.",
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
            { label: "0 — Totalmente activo, sin restricciones", value: 0 },
            { label: "1 — Restringido para actividad física extenuante, ambulatorio", value: 1 },
            { label: "2 — Ambulatorio, autocuidado; no puede trabajar; en pie > 50 % del día", value: 2 },
            { label: "3 — Autocuidado limitado; encamado o en silla > 50 % del día", value: 3 },
            { label: "4 — Completamente incapacitado; encamado o en silla", value: 4 },
            { label: "5 — Fallecido", value: 5 }
          ]
        }
      ],
      compute: (v) => {
        var _a;
        const g = (_a = v.grado) != null ? _a : 0;
        return {
          main: `ECOG ${g}`,
          interpretation: g <= 1 ? "Estado funcional preservado: apto para tratamientos oncológicos habituales." : g === 2 ? "Estado funcional intermedio: valorar caso a caso la intensidad del tratamiento." : g === 3 ? "Estado funcional muy limitado: en general no se toleran los tratamientos oncológicos activos; priorizar control sintomático." : g === 4 ? "Encamado: tratamiento paliativo y confortable." : "Fallecido.",
          level: g <= 1 ? "ok" : g === 2 ? "warn" : "danger"
        };
      },
      notes: ["Equivalencias aproximadas con Karnofsky: ECOG 0 ≈ KPS 100, 1 ≈ 80–90, 2 ≈ 60–70, 3 ≈ 40–50, 4 ≈ 10–30."],
      references: [
        "Oken MM, et al. Toxicity and response criteria of the Eastern Cooperative Oncology Group. Am J Clin Oncol. 1982;5(6):649-55."
      ]
    },
    {
      id: "ganzoni",
      name: "Ecuación de Ganzoni para el déficit de hierro",
      shortName: "Ganzoni",
      description: "Calcula el déficit total de hierro para reposición intravenosa en la anemia ferropénica.",
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
          description: "≥ 35 kg: 500 mg. 5–34 kg: 15 mg/kg.",
          min: 0,
          max: 1e3,
          step: 10
        }
      ],
      compute: (v) => {
        if (v.hbObjetivo <= v.hbActual)
          return {
            main: "—",
            interpretation: "La hemoglobina objetivo debe ser mayor que la actual.",
            level: "warn"
          };
        const deficit = 2.4 * v.peso * (v.hbObjetivo - v.hbActual) + v.reservas;
        return {
          main: fmt(deficit, 0),
          mainUnit: "mg de hierro",
          interpretation: "Dosis total a reponer por vía intravenosa. Repartir según la preparación (carboximaltosa férrica hasta 1.000 mg por sesión; hierro sacarosa 100–200 mg por sesión).",
          level: "info",
          details: [
            "Fórmula: déficit (mg) = 2,4 × peso (kg) × (Hb objetivo − Hb actual) + hierro para reservas.",
            "En pacientes con peso ≥ 35 kg y hemoglobina objetivo 15 g/dL, reservas = 500 mg. En menor peso, 15 mg/kg."
          ]
        };
      },
      references: [
        "Ganzoni AM. Intravenous iron-dextran: therapeutic and experimental possibilities. Schweiz Med Wochenschr. 1970;100(7):301-3."
      ]
    },
    {
      id: "bova",
      name: "Puntuación de Bova para embolia pulmonar hemodinámicamente estable",
      shortName: "Bova",
      description: "Estratifica el riesgo de complicaciones a 30 días en pacientes normotensos con embolia pulmonar aguda.",
      category: CAT_TEV,
      specialty: FAM,
      inputs: [
        {
          id: "pas",
          type: "select",
          label: "PA sistólica",
          options: [
            { label: "≥ 110 mmHg", value: 0 },
            { label: "90–109 mmHg", value: 2 }
          ]
        },
        { id: "fc", type: "boolean", label: "Frecuencia cardíaca ≥ 110 lpm" },
        { id: "troponina", type: "boolean", label: "Troponina elevada", points: 2 },
        { id: "disfuncionVD", type: "boolean", label: "Disfunción del ventrículo derecho", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["pas", "fc", "troponina", "disfuncionVD"]);
        const stage = score <= 2 ? "I" : score <= 4 ? "II" : "III";
        const riesgo2 = score <= 2 ? "< 5 %" : score <= 4 ? "≈ 18 %" : "≈ 42 %";
        return {
          main: `Estadio ${stage}`,
          secondary: riesgo2,
          secondaryLabel: "complicaciones a 30 días",
          interpretation: stage === "I" ? "Riesgo bajo: manejo habitual con anticoagulación." : stage === "II" ? "Riesgo intermedio: vigilancia estrecha, considerar ingreso en cuidados intermedios." : "Riesgo alto: vigilancia en cuidados intensivos; monitorización de la evolución hemodinámica y considerar reperfusión si aparece inestabilidad.",
          level: stage === "I" ? "ok" : stage === "II" ? "warn" : "danger"
        };
      },
      notes: ["Solo aplicable a pacientes con embolia pulmonar aguda y presión arterial sistólica ≥ 90 mmHg al ingreso."],
      references: [
        "Bova C, et al. Identification of intermediate-risk patients with acute symptomatic pulmonary embolism. Eur Respir J. 2014;44(3):694-703."
      ]
    },
    {
      id: "cpis",
      name: "CPIS — Escala clínica de infección pulmonar (Pugin)",
      shortName: "CPIS",
      description: "Ayuda a diagnosticar la neumonía asociada a la ventilación mecánica.",
      category: CAT_RESPI,
      specialty: FAM,
      inputs: [
        {
          id: "temperatura",
          type: "select",
          label: "Temperatura",
          options: [
            { label: "36,5–38,4 °C", value: 0 },
            { label: "38,5–38,9 °C", value: 1 },
            { label: "≥ 39 o ≤ 36 °C", value: 2 }
          ]
        },
        {
          id: "leucos",
          type: "select",
          label: "Leucocitos (×10³/mm³)",
          options: [
            { label: "4–11", value: 0 },
            { label: "< 4 o > 11", value: 1 },
            { label: "< 4 o > 11 con ≥ 50 % cayados", value: 2 }
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
          label: "Oxigenación (PaO₂/FiO₂)",
          options: [
            { label: "> 240 o SDRA presente", value: 0 },
            { label: "≤ 240 sin SDRA", value: 2 }
          ]
        },
        {
          id: "radiografia",
          type: "select",
          label: "Radiografía de tórax",
          options: [
            { label: "Sin infiltrados", value: 0 },
            { label: "Infiltrado difuso o parcheado", value: 1 },
            { label: "Infiltrado localizado", value: 2 }
          ]
        },
        {
          id: "progresion",
          type: "select",
          label: "Progresión del infiltrado",
          options: [
            { label: "Sin progresión", value: 0 },
            { label: "Progresión radiológica (excluidos SDRA e ICC)", value: 2 }
          ]
        },
        {
          id: "cultivo",
          type: "select",
          label: "Cultivo de aspirado traqueal",
          options: [
            { label: "Sin crecimiento significativo", value: 0 },
            { label: "Crecimiento significativo (positivo)", value: 1 },
            { label: "Mismo patógeno en tinción de Gram", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["temperatura", "leucos", "secreciones", "pf", "radiografia", "progresion", "cultivo"]);
        return {
          main: String(score),
          mainUnit: "puntos (0–12)",
          interpretation: score > 6 ? "CPIS > 6: alta probabilidad de neumonía asociada a la ventilación mecánica. Iniciar o mantener antibioterapia empírica y ajustar según cultivos." : "CPIS ≤ 6: baja probabilidad de neumonía asociada a la ventilación mecánica; reevaluar en 48–72 h.",
          level: score > 6 ? "danger" : "ok"
        };
      },
      references: [
        'Pugin J, et al. Diagnosis of ventilator-associated pneumonia by bacteriologic analysis of bronchoscopic and nonbronchoscopic "blind" bronchoalveolar lavage fluid. Am Rev Respir Dis. 1991;143(5):1121-9.'
      ]
    },
    {
      id: "caspar",
      name: "Criterios CASPAR para artritis psoriásica",
      shortName: "CASPAR",
      description: "Clasifica la artritis psoriásica en pacientes con enfermedad inflamatoria articular.",
      category: CAT_GENERAL,
      specialty: FAM,
      inputs: [
        { id: "enfermedad", type: "boolean", label: "¿Presenta enfermedad articular inflamatoria confirmada?", noPoints: true },
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
        { id: "ungueal", type: "boolean", label: "Alteración ungueal (onicólisis, pitting, hiperqueratosis)" },
        { id: "fr", type: "boolean", label: "Factor reumatoide negativo" },
        { id: "dactilitis", type: "boolean", label: "Dactilitis actual o pasada" },
        { id: "radiologico", type: "boolean", label: "Neoformación ósea yuxtaarticular en la radiografía" }
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
          mainUnit: "puntos (0–6)",
          interpretation: score >= 3 ? "Cumple criterios CASPAR (≥ 3 puntos): clasifica como artritis psoriásica (sensibilidad ≈ 91 %, especificidad ≈ 99 %)." : "No cumple criterios CASPAR: valorar otros diagnósticos.",
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
      description: "Diagnostica clínicamente la hipercolesterolemia familiar heterocigota.",
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
            { label: "Familiar de primer grado con enfermedad coronaria o vascular precoz (< 55 años en varones, < 60 en mujeres) o LDL > 210 mg/dL en adultos, o presencia de xantomas o arco corneal en < 45 años", value: 1 },
            { label: "Familiar de primer grado < 18 años con LDL > 155 mg/dL", value: 2 }
          ]
        },
        {
          id: "personal",
          type: "select",
          label: "Historia personal",
          options: [
            { label: "Sin datos relevantes", value: 0 },
            { label: "Enfermedad coronaria prematura", value: 2 },
            { label: "Enfermedad vascular prematura (cerebral o periférica)", value: 1 }
          ]
        },
        {
          id: "examen",
          type: "select",
          label: "Exploración física",
          options: [
            { label: "Sin hallazgos", value: 0 },
            { label: "Arco corneal < 45 años", value: 4 },
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
            { label: "155–189 mg/dL", value: 1 },
            { label: "190–249 mg/dL", value: 3 },
            { label: "250–329 mg/dL", value: 5 },
            { label: "≥ 330 mg/dL", value: 8 }
          ]
        },
        { id: "genetico", type: "boolean", label: "Mutación funcional confirmada (LDLR, APOB, PCSK9)", points: 8 }
      ],
      compute: (v) => {
        const score = sum(v, ["familia", "personal", "examen", "ldl", "genetico"]);
        const dx = score < 3 ? "improbable" : score <= 5 ? "posible" : score <= 8 ? "probable" : "definitiva";
        return {
          main: String(score),
          mainUnit: "puntos",
          secondary: `Hipercolesterolemia familiar ${dx}`,
          interpretation: dx === "improbable" ? "Hipercolesterolemia familiar improbable: control lipídico habitual." : dx === "posible" ? "Hipercolesterolemia familiar posible: valorar estudio genético y cribado familiar." : "Diagnóstico probable o definitivo: iniciar estatinas de alta potencia (objetivo LDL < 100 mg/dL o < 70 con enfermedad cardiovascular), estudio genético y cribado familiar en cascada.",
          level: dx === "improbable" ? "ok" : dx === "posible" ? "warn" : "danger"
        };
      },
      references: [
        "World Health Organization. Familial hypercholesterolemia: report of a WHO consultation. Ginebra, 1999."
      ]
    },
    {
      id: "fleischner",
      name: "Guías de Fleischner para nódulos pulmonares sólidos (2017)",
      shortName: "Fleischner",
      description: "Recomienda el seguimiento de nódulos pulmonares sólidos hallados incidentalmente en tomografía.",
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
            { label: "Alto (fumador, EPOC, exposición asbesto, historia familiar)", value: 1 }
          ]
        },
        {
          id: "numero",
          type: "select",
          label: "Número de nódulos",
          noPoints: true,
          options: [
            { label: "Único", value: 0 },
            { label: "Múltiples", value: 1 }
          ]
        },
        { id: "tamano", type: "number", label: "Tamaño del nódulo mayor", unit: "mm", min: 1, max: 30, step: 0.1 }
      ],
      compute: (v) => {
        const alto = v.riesgo === 1;
        const multi = v.numero === 1;
        const t = v.tamano;
        let rec;
        if (t < 6) {
          rec = alto ? "Nódulo < 6 mm en paciente de alto riesgo: TC de control opcional a los 12 meses." : "Nódulo < 6 mm en paciente de bajo riesgo: no se recomienda seguimiento rutinario.";
        } else if (t <= 8) {
          rec = alto ? "Nódulo 6–8 mm en paciente de alto riesgo: TC de control a los 6–12 meses y considerar a los 18–24 meses." : "Nódulo 6–8 mm en paciente de bajo riesgo: TC de control a los 6–12 meses y considerar a los 18–24 meses.";
        } else {
          rec = "Nódulo > 8 mm: considerar TC de control a los 3 meses, PET-TC o biopsia según sospecha clínica.";
        }
        if (multi) rec += " (Nódulos múltiples: usar el nódulo más sospechoso para orientar el seguimiento.)";
        const level = t < 6 ? "ok" : t <= 8 ? "warn" : "danger";
        return {
          main: `${fmt(t, 1)} mm`,
          interpretation: rec,
          level
        };
      },
      notes: [
        "Solo para nódulos sólidos ≥ 6 mm de forma sistemática; los subsólidos tienen su propio algoritmo.",
        "No aplicable a pacientes < 35 años ni a pacientes inmunodeprimidos u oncológicos, en los que la conducta es individualizada."
      ],
      references: [
        "MacMahon H, et al. Guidelines for Management of Incidental Pulmonary Nodules Detected on CT Images: From the Fleischner Society 2017. Radiology. 2017;284(1):228-43."
      ]
    },
    {
      id: "ottawa-tia",
      name: "Ottawa TIA — Riesgo de ictus tras AIT",
      shortName: "Ottawa TIA",
      description: "Regla canadiense de decisión para estimar el riesgo de ictus a 7 días tras un AIT.",
      category: "Neurología crítica e ictus",
      specialty: FAM,
      inputs: [
        { id: "primer", type: "boolean", label: "Primer episodio de AIT en la vida", points: 2 },
        { id: "sintomas", type: "boolean", label: "Síntomas > 10 minutos", points: 2 },
        { id: "aterotrombosis", type: "boolean", label: "Antecedente de arteriopatía carotídea", points: 2 },
        { id: "antiagregante", type: "boolean", label: "Ya recibía antiagregante en el momento del AIT", points: 3 },
        { id: "debilidad", type: "boolean", label: "Debilidad focal", points: 2 },
        { id: "lenguaje", type: "boolean", label: "Alteración del lenguaje", points: 1 },
        {
          id: "duracion",
          type: "select",
          label: "Duración de los síntomas",
          options: [
            { label: "< 10 min", value: 0 },
            { label: "10–59 min", value: 1 },
            { label: "≥ 60 min", value: 2 }
          ]
        },
        { id: "fa", type: "boolean", label: "Fibrilación auricular en el ECG", points: 2 },
        { id: "isquemia", type: "boolean", label: "Signos de isquemia en el ECG", points: 2 },
        {
          id: "glucosa",
          type: "boolean",
          label: "Glucemia ≥ 265 mg/dL",
          points: 3
        },
        { id: "plaquetas", type: "boolean", label: "Plaquetas ≥ 400 ×10⁹/L", points: 2 },
        { id: "leucocitos", type: "boolean", label: "Leucocitos ≥ 10 ×10⁹/L", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["primer", "sintomas", "aterotrombosis", "antiagregante", "debilidad", "lenguaje", "duracion", "fa", "isquemia", "glucosa", "plaquetas", "leucocitos"]);
        const riesgo2 = score <= 3 ? "bajo (< 1 %)" : score <= 8 ? "intermedio (≈ 4 %)" : "alto (≈ 10 %)";
        return {
          main: String(score),
          mainUnit: "puntos (0–23)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de ictus a 7 días",
          interpretation: score <= 3 ? "Riesgo bajo: estudio ambulatorio urgente en las primeras 48 h con neuroimagen, estudio vascular, ECG y ecocardiograma según protocolo." : score <= 8 ? "Riesgo intermedio: valoración rápida; algunos centros ingresan para estudio si no hay unidad ambulatorio urgente." : "Riesgo alto: ingreso hospitalario para estudio completo y tratamiento antiagregante precoz.",
          level: score <= 3 ? "ok" : score <= 8 ? "warn" : "danger"
        };
      },
      notes: ["Todos los pacientes con AIT deben iniciar antiagregación (AAS o clopidogrel) y prevención secundaria intensiva."],
      references: [
        "Perry JJ, et al. A prospective cohort study of patients with transient ischemic attack to identify high-risk clinical characteristics. Stroke. 2014;45(1):92-100."
      ]
    },
    {
      id: "peptido-c",
      name: "Cociente péptido C / glucosa",
      shortName: "Péptido C / glucosa",
      description: "Evalúa la función residual de las células beta pancreáticas; útil para diferenciar diabetes tipo 1 de tipo 2.",
      category: CAT_DIABETES,
      specialty: FAM,
      inputs: [
        { id: "peptido", type: "number", label: "Péptido C sérico", unit: "ng/mL", min: 0, max: 20, step: 0.01 },
        { id: "glucemia", type: "number", label: "Glucemia simultánea", unit: "mg/dL", min: 30, max: 800, step: 1 }
      ],
      compute: (v) => {
        const glucoseMmol = v.glucemia / 18;
        const peptidoNmol = v.peptido * 0.331;
        const cociente = peptidoNmol / glucoseMmol;
        return {
          main: fmt(cociente, 3),
          mainUnit: "nmol/mmol",
          interpretation: cociente < 0.2 ? "Función beta muy reducida (< 0,2): compatible con diabetes tipo 1 o insulinodependencia establecida." : cociente < 0.6 ? "Función beta intermedia (0,2–0,6): posible LADA o diabetes tipo 2 avanzada." : "Función beta preservada (≥ 0,6): sugiere diabetes tipo 2, MODY o alteración de la sensibilidad a la insulina.",
          level: cociente < 0.2 ? "danger" : cociente < 0.6 ? "warn" : "ok",
          details: ["Conversión: péptido C 1 ng/mL ≈ 0,331 nmol/L; glucemia 1 mmol/L = 18 mg/dL."]
        };
      },
      notes: ["Ideal en muestra postprandial o tras estímulo con comida mixta; los valores en ayunas pueden infraestimar la reserva beta."],
      references: [
        "Jones AG, Hattersley AT. The clinical utility of C-peptide measurement in the care of patients with diabetes. Diabet Med. 2013;30(7):803-17."
      ]
    },
    {
      id: "delta-p",
      name: "Puntuación DELTA-P para Lambert-Eaton",
      shortName: "DELTA-P",
      description: "Estima el riesgo de cáncer de pulmón microcítico en pacientes con síndrome miasténico de Lambert-Eaton.",
      category: CAT_HEMATO,
      specialty: FAM,
      inputs: [
        { id: "perdidaPeso", type: "boolean", label: "Pérdida de peso reciente" },
        { id: "edad", type: "boolean", label: "Edad ≥ 50 años al inicio de los síntomas" },
        { id: "tabaco", type: "boolean", label: "Tabaquismo (activo o significativo previo)" },
        { id: "disfuncion", type: "boolean", label: "Disfunción bulbar" },
        { id: "ereccion", type: "boolean", label: "Disfunción eréctil (en varones)" },
        { id: "karnofsky", type: "boolean", label: "Karnofsky < 70 al inicio" }
      ],
      compute: (v) => {
        const score = sum(v, ["perdidaPeso", "edad", "tabaco", "disfuncion", "ereccion", "karnofsky"]);
        const riesgo2 = ["2,6 %", "4,7 %", "8,3 %", "18,2 %", "46,1 %", "83,9 %", "96,6 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–6)",
          secondary: riesgo2,
          secondaryLabel: "probabilidad de carcinoma microcítico",
          interpretation: score <= 1 ? "Riesgo bajo: seguimiento habitual con tomografía de tórax." : score <= 3 ? "Riesgo intermedio: intensificar el cribado (TC y PET-TC)." : "Riesgo alto: cribado oncológico intensivo (PET-TC) y repetir en 3–6 meses si es negativo.",
          level: score <= 1 ? "ok" : score <= 3 ? "warn" : "danger"
        };
      },
      references: [
        "Titulaer MJ, et al. Screening for tumours in paraneoplastic syndromes: report of an EFNS task force. Eur J Neurol. 2011;18(1):19-e3."
      ]
    }
  ];

  // inurse-m2/src/calculators/cardiotoracica.ts
  var CAT_CT = "Cirugía cardiotorácica y perioperatorio";
  var CAT_TEV2 = "Tromboembolismo venoso";
  var CAT_PLE = "Enfermedad pleural";
  var CAT_ECMO = "Soporte extracorpóreo";
  var CAT_AORTA = "Aorta y grandes vasos";
  var CT = ["Cirugía Cardiotorácica"];
  var escala9 = (items) => items.map(([value, label]) => ({ label: `${value} — ${label}`, value }));
  var cardiotoracica = [
    {
      id: "caprini",
      name: "Puntuación Caprini para riesgo de TEV en el paciente quirúrgico",
      shortName: "Caprini",
      description: "Estratifica el riesgo de tromboembolismo venoso y orienta la profilaxis en pacientes quirúrgicos.",
      category: CAT_TEV2,
      specialty: CT,
      inputs: [
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 41 años", value: 0 },
            { label: "41–60 años", value: 1 },
            { label: "61–74 años", value: 2 },
            { label: "≥ 75 años", value: 3 }
          ]
        },
        {
          id: "cirugia",
          type: "select",
          label: "Tipo de cirugía",
          options: [
            { label: "Menor (< 45 min)", value: 1 },
            { label: "Laparoscópica (> 45 min)", value: 2 },
            { label: "Mayor abierta o electiva de artroplastia (> 45 min)", value: 2.0001 },
            { label: "Ninguna cirugía", value: 0 }
          ]
        },
        { id: "imc", type: "boolean", label: "IMC > 25 kg/m²" },
        { id: "edema", type: "boolean", label: "Edema en miembros inferiores" },
        { id: "varices", type: "boolean", label: "Varices" },
        { id: "sepsis", type: "boolean", label: "Sepsis (en el último mes)" },
        { id: "pulmonar", type: "boolean", label: "Enfermedad pulmonar grave (neumonía < 1 mes)" },
        { id: "epoc", type: "boolean", label: "Función pulmonar anormal (EPOC)" },
        { id: "iam", type: "boolean", label: "Infarto de miocardio (agudo)" },
        { id: "iccPuntos", type: "boolean", label: "Insuficiencia cardíaca congestiva" },
        { id: "confinamiento", type: "boolean", label: "Confinamiento en cama > 72 h" },
        { id: "yeso", type: "boolean", label: "Inmovilización con yeso" },
        { id: "catetercentral", type: "boolean", label: "Acceso venoso central" },
        { id: "anticonceptivos", type: "boolean", label: "Anticonceptivos orales o terapia hormonal" },
        { id: "embarazoPuerperio", type: "boolean", label: "Embarazo o puerperio (< 1 mes)" },
        { id: "historia", type: "boolean", label: "Antecedente de abortos de repetición o pérdidas fetales" },
        { id: "edadAvanzada", type: "boolean", label: "Edad > 75 años" },
        { id: "artroplastia", type: "boolean", label: "Artroplastia de cadera o rodilla", points: 5 },
        { id: "fracturaGrande", type: "boolean", label: "Fractura de cadera, pelvis o pierna en < 1 mes", points: 5 },
        { id: "ictusRec", type: "boolean", label: "Ictus en el último mes", points: 5 },
        { id: "medular", type: "boolean", label: "Lesión medular aguda (parálisis) en el último mes", points: 5 },
        { id: "multiTrauma", type: "boolean", label: "Politraumatismo en el último mes", points: 5 },
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
        const rec = banda === "muy bajo" ? "Deambulación temprana; sin profilaxis específica." : banda === "bajo" ? "Medidas mecánicas (compresión neumática intermitente)." : banda === "moderado" ? "Profilaxis farmacológica (HBPM o heparina no fraccionada) o mecánica si contraindicación." : "Profilaxis farmacológica y mecánica combinadas; prolongar hasta 30 días en cirugía oncológica abdominopélvica.";
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
      description: "Estratifica la probabilidad clínica de disección aórtica aguda.",
      category: CAT_AORTA,
      specialty: CT,
      inputs: [
        {
          id: "marfan",
          type: "boolean",
          label: "Condiciones predisponentes",
          description: "Marfan u otra enfermedad del tejido conectivo, antecedente familiar de aneurisma/disección aórtica, valvulopatía aórtica, manipulación aórtica reciente, aneurisma aórtico torácico conocido."
        },
        {
          id: "dolor",
          type: "boolean",
          label: "Características del dolor",
          description: "Dolor de aparición súbita, intenso, o descrito como desgarrador/lacerante en tórax, espalda o abdomen."
        },
        {
          id: "examen",
          type: "boolean",
          label: "Hallazgos en la exploración",
          description: "Déficit de pulsos, asimetría de tensiones sistólicas > 20 mmHg, déficit neurológico focal con dolor o soplo diastólico de nueva aparición con dolor y/o hipotensión/shock."
        }
      ],
      compute: (v) => {
        const score = sum(v, ["marfan", "dolor", "examen"]);
        const banda = score === 0 ? "muy bajo" : score === 1 ? "bajo" : "alto";
        return {
          main: String(score),
          mainUnit: "de 3 categorías",
          secondary: `Riesgo ${banda}`,
          interpretation: score === 0 ? "Riesgo muy bajo: si D-dímero < 500 ng/mL, la disección aórtica queda razonablemente descartada." : score === 1 ? "Riesgo bajo-intermedio: combinar con D-dímero para descartar; si es positivo o dudoso, angio-TC." : "Riesgo alto (≥ 2 categorías): angio-TC toracoabdominal urgente.",
          level: score === 0 ? "ok" : score === 1 ? "warn" : "danger"
        };
      },
      references: [
        "Rogers AM, et al. Sensitivity of the aortic dissection detection risk score, a novel guideline-based tool. Circulation. 2011;123(20):2213-8."
      ]
    },
    {
      id: "acef2",
      name: "Puntuación ACEF II para cirugía cardíaca",
      shortName: "ACEF II",
      description: "Predice la mortalidad a 30 días tras cirugía cardíaca electiva o urgente.",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        { id: "edad", type: "number", label: "Edad", unit: "años", min: 18, max: 100 },
        { id: "fevi", type: "number", label: "Fracción de eyección del VI", unit: "%", min: 10, max: 80, step: 1 },
        { id: "creatinina", type: "number", label: "Creatinina sérica", unit: "mg/dL", min: 0.3, max: 15, step: 0.01 },
        { id: "urgente", type: "boolean", label: "Cirugía de urgencia" },
        { id: "anemia", type: "boolean", label: "Hematocrito < 36 %" }
      ],
      compute: (v) => {
        const base = v.edad / v.fevi + (v.creatinina > 2 ? 2 : 0) + (v.urgente === 1 ? 3 : 0) + (v.anemia === 1 ? 0.2 * (36 - Math.max(20, 36 - 10)) : 0);
        const banda = base < 1 ? "bajo" : base < 2 ? "intermedio" : "alto";
        const mort = base < 1 ? "< 1 %" : base < 2 ? "≈ 3 %" : "≥ 8 %";
        return {
          main: fmt(base, 2),
          mainUnit: "puntos ACEF II",
          secondary: mort,
          secondaryLabel: "mortalidad a 30 días",
          interpretation: `Riesgo ${banda} de mortalidad tras la cirugía cardíaca.`,
          level: banda === "bajo" ? "ok" : banda === "intermedio" ? "warn" : "danger",
          details: [
            "Fórmula ACEF II = edad/FEVI + 2 (si creatinina > 2 mg/dL) + 3 (si urgencia) + 0,2 × (36 − hematocrito) si Hto < 36 %.",
            "Como no pedimos el hematocrito exacto, la penalización por anemia se calcula solo por presencia/ausencia como aproximación (compruebe el valor real para casos límite)."
          ]
        };
      },
      references: [
        "Ranucci M, et al. The multicenter external validation of ACEF II. J Thorac Cardiovasc Surg. 2018;155(4):1461-9."
      ]
    },
    {
      id: "aub-has2",
      name: "AUB-HAS2 — Riesgo cardiovascular perioperatorio no cardíaco",
      shortName: "AUB-HAS2",
      description: "Estratifica el riesgo cardiovascular perioperatorio en cirugía no cardíaca (alternativa simplificada a RCRI).",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        { id: "hta", type: "boolean", label: "Historia de hipertensión (H)" },
        { id: "angina", type: "boolean", label: "Historia de angina (A)" },
        { id: "edad", type: "boolean", label: "Edad ≥ 75 años (A)" },
        { id: "sintomas", type: "boolean", label: "Síntomas de insuficiencia cardíaca o disnea (S)" },
        { id: "quirurgico", type: "boolean", label: "Tipo de cirugía de alto riesgo (S)" }
      ],
      compute: (v) => {
        const score = sum(v, ["hta", "angina", "edad", "sintomas", "quirurgico"]);
        const eventos = ["0,3 %", "0,3 %", "1,5 %", "4,4 %", "8 %", "13 %"][score];
        return {
          main: String(score),
          mainUnit: "puntos (0–5)",
          secondary: eventos,
          secondaryLabel: "eventos cardiovasculares graves a 30 días",
          interpretation: score <= 1 ? "Riesgo bajo." : score <= 2 ? "Riesgo intermedio: optimización preoperatoria y vigilancia postoperatoria." : "Riesgo alto: consulta cardiológica preoperatoria y considerar monitorización de troponina postoperatoria.",
          level: score <= 1 ? "ok" : score <= 2 ? "warn" : "danger"
        };
      },
      references: [
        "Dakik HA, et al. AUB-HAS2 Cardiovascular Risk Index: Performance in Surgical Subpopulations and Comparison to the Revised Cardiac Risk Index. J Am Heart Assoc. 2019;8(9):e011477."
      ]
    },
    {
      id: "euromacs-rhf",
      name: "EUROMACS-RHF — Riesgo de insuficiencia cardíaca derecha tras LVAD",
      shortName: "EUROMACS-RHF",
      description: "Estima el riesgo de fallo del ventrículo derecho tras el implante de un dispositivo de asistencia ventricular izquierda.",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        { id: "intermacs", type: "boolean", label: "Perfil INTERMACS 1–3", points: 2 },
        { id: "multiInotrop", type: "boolean", label: "Uso de ≥ 3 inotrópicos preoperatorios", points: 2.5 },
        { id: "gradiente", type: "boolean", label: "RA/PCWP > 0,54", points: 2 },
        { id: "hemoglobina", type: "boolean", label: "Hemoglobina ≤ 10 g/dL", points: 1 },
        { id: "disfuncionVD", type: "boolean", label: "Disfunción moderada-grave del ventrículo derecho en ecocardiograma", points: 2 }
      ],
      compute: (v) => {
        const score = sum(v, ["intermacs", "multiInotrop", "gradiente", "hemoglobina", "disfuncionVD"]);
        const riesgo2 = score <= 2 ? "bajo (11 %)" : score <= 4 ? "intermedio (37 %)" : "alto (43–58 %)";
        return {
          main: fmt(score, 1),
          mainUnit: "puntos (0–9,5)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de insuficiencia cardíaca derecha post-LVAD",
          interpretation: score <= 2 ? "Riesgo bajo de insuficiencia cardíaca derecha tras el implante." : score <= 4 ? "Riesgo intermedio: valorar biventricular temporal, vigilancia estrecha." : "Riesgo alto: considerar soporte biventricular o trasplante como estrategia alternativa.",
          level: score <= 2 ? "ok" : score <= 4 ? "warn" : "danger"
        };
      },
      references: [
        "Soliman OII, et al. Derivation and Validation of a Novel Right-Sided Heart Failure Model After Implantation of Continuous Flow LVADs. Circulation. 2018;137(9):891-906."
      ]
    },
    {
      id: "thakar",
      name: "Puntuación de Thakar para lesión renal aguda tras cirugía cardíaca",
      shortName: "Thakar",
      description: "Predice el riesgo de insuficiencia renal aguda que requiere diálisis tras cirugía cardíaca.",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        { id: "mujer", type: "boolean", label: "Sexo femenino" },
        { id: "icc", type: "boolean", label: "Insuficiencia cardíaca congestiva" },
        { id: "fevi", type: "boolean", label: "FEVI < 35 %" },
        { id: "biac", type: "boolean", label: "Balón de contrapulsación intraaórtico preoperatorio", points: 2 },
        { id: "epoc", type: "boolean", label: "EPOC" },
        { id: "diabetesInsul", type: "boolean", label: "Diabetes en tratamiento con insulina" },
        { id: "cardiacaPrevia", type: "boolean", label: "Cirugía cardíaca previa" },
        { id: "urgencia", type: "boolean", label: "Cirugía urgente", points: 2 },
        {
          id: "tipo",
          type: "select",
          label: "Tipo de cirugía",
          options: [
            { label: "Solo revascularización coronaria", value: 0 },
            { label: "Solo valvular", value: 1 },
            { label: "Combinada (revascularización + valvular u otra)", value: 2 }
          ]
        },
        {
          id: "creatinina",
          type: "select",
          label: "Creatinina preoperatoria (mg/dL)",
          options: [
            { label: "< 1,2", value: 0 },
            { label: "1,2–2,1", value: 2 },
            { label: "> 2,1", value: 5 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["mujer", "icc", "fevi", "biac", "epoc", "diabetesInsul", "cardiacaPrevia", "urgencia", "tipo", "creatinina"]);
        const riesgo2 = score <= 2 ? "0,5 %" : score <= 5 ? "1,8 %" : score <= 8 ? "7,7 %" : "21 %";
        return {
          main: String(score),
          mainUnit: "puntos (0–17)",
          secondary: riesgo2,
          secondaryLabel: "riesgo de diálisis post-cirugía",
          interpretation: score <= 2 ? "Riesgo bajo." : score <= 5 ? "Riesgo intermedio." : score <= 8 ? "Riesgo alto." : "Riesgo muy alto: intensificar profilaxis renal (evitar nefrotóxicos, mantener perfusión, ajustar contraste, valoración por nefrología).",
          level: score <= 2 ? "ok" : score <= 5 ? "warn" : "danger"
        };
      },
      references: [
        "Thakar CV, et al. A clinical score to predict acute renal failure after cardiac surgery. J Am Soc Nephrol. 2005;16(1):162-8."
      ]
    },
    {
      id: "lent",
      name: "Puntuación LENT para derrame pleural maligno",
      shortName: "LENT",
      description: "Estima la supervivencia en pacientes con derrame pleural maligno.",
      category: CAT_PLE,
      specialty: CT,
      inputs: [
        {
          id: "ldh",
          type: "select",
          label: "LDH del líquido pleural",
          options: [
            { label: "< 1.500 U/L", value: 0 },
            { label: "≥ 1.500 U/L", value: 1 }
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
            { label: "3–4", value: 3 }
          ]
        },
        {
          id: "nlr",
          type: "select",
          label: "Cociente neutrófilos/linfocitos",
          options: [
            { label: "< 9", value: 0 },
            { label: "≥ 9", value: 1 }
          ]
        },
        {
          id: "tumor",
          type: "select",
          label: "Tipo de tumor",
          dropdown: true,
          options: [
            { label: "Mesotelioma / hematológico", value: 0 },
            { label: "Mama / ginecológico / renal", value: 1 },
            { label: "Pulmón / otros", value: 2 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["ldh", "ecog", "nlr", "tumor"]);
        const riesgo2 = score <= 1 ? "bajo" : score <= 4 ? "moderado" : "alto";
        const superv = score <= 1 ? "319 días" : score <= 4 ? "130 días" : "44 días";
        return {
          main: String(score),
          mainUnit: "puntos (0–7)",
          secondary: superv,
          secondaryLabel: "mediana de supervivencia",
          interpretation: `Riesgo ${riesgo2} de mortalidad. Ayuda a decidir entre pleurodesis o catéter pleural tunelizado.`,
          level: riesgo2 === "bajo" ? "ok" : riesgo2 === "moderado" ? "warn" : "danger"
        };
      },
      references: [
        "Clive AO, et al. Predicting survival in malignant pleural effusion: development and validation of the LENT prognostic score. Thorax. 2014;69(12):1098-104."
      ]
    },
    {
      id: "rapid-pleural",
      name: "Puntuación RAPID para infección pleural",
      shortName: "RAPID (pleural)",
      description: "Estima la mortalidad a 3 meses en pacientes con infección pleural.",
      category: CAT_PLE,
      specialty: CT,
      inputs: [
        {
          id: "urea",
          type: "select",
          label: "Urea sérica (BUN)",
          options: [
            { label: "< 14 mg/dL", value: 0 },
            { label: "14–22 mg/dL", value: 1 },
            { label: "> 22 mg/dL", value: 2 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          options: [
            { label: "< 50 años", value: 0 },
            { label: "50–70 años", value: 1 },
            { label: "> 70 años", value: 2 }
          ]
        },
        {
          id: "pus",
          type: "select",
          label: "Aspecto del líquido pleural",
          options: [
            { label: "No purulento", value: 0 },
            { label: "Purulento", value: 1 }
          ]
        },
        {
          id: "infeccion",
          type: "select",
          label: "Origen de la infección",
          options: [
            { label: "Comunitario", value: 0 },
            { label: "Nosocomial", value: 1 }
          ]
        },
        {
          id: "albumina",
          type: "select",
          label: "Albúmina sérica",
          options: [
            { label: "≥ 2,7 g/dL", value: 0 },
            { label: "< 2,7 g/dL", value: 1 }
          ]
        }
      ],
      compute: (v) => {
        const score = sum(v, ["urea", "edad", "pus", "infeccion", "albumina"]);
        const banda = score <= 2 ? "bajo (< 5 %)" : score <= 4 ? "intermedio (17 %)" : "alto (48 %)";
        return {
          main: String(score),
          mainUnit: "puntos (0–7)",
          secondary: banda,
          secondaryLabel: "mortalidad a 3 meses",
          interpretation: score <= 2 ? "Riesgo bajo: buen pronóstico con tratamiento convencional (drenaje + antibioterapia)." : score <= 4 ? "Riesgo intermedio: vigilancia estrecha; considerar activación de vía quirúrgica temprana." : "Riesgo alto: mortalidad significativa; valoración por cirugía torácica precoz y cuidados intermedios.",
          level: score <= 2 ? "ok" : score <= 4 ? "warn" : "danger"
        };
      },
      references: [
        "Rahman NM, et al. A clinical score (RAPID) to identify those at risk for poor outcome at presentation with pleural infection. Chest. 2014;145(4):848-55."
      ]
    },
    {
      id: "save",
      name: "Puntuación SAVE para supervivencia tras ECMO venoarterial",
      shortName: "SAVE",
      description: "Predice la supervivencia intrahospitalaria en adultos con shock cardiogénico refractario tratados con ECMO VA.",
      category: CAT_ECMO,
      specialty: CT,
      inputs: [
        {
          id: "diagnostico",
          type: "select",
          label: "Grupo diagnóstico",
          dropdown: true,
          options: [
            { label: "Miocarditis", value: 3 },
            { label: "Rechazo de trasplante refractario", value: 3.0001 },
            { label: "FV/TV refractaria", value: 2 },
            { label: "Post-trasplante cardíaco / pulmonar", value: 3.0002 },
            { label: "Miocardiopatía congénita", value: -3 },
            { label: "Otros", value: 0 }
          ]
        },
        {
          id: "edad",
          type: "select",
          label: "Edad",
          dropdown: true,
          options: [
            { label: "18–38", value: 7 },
            { label: "39–52", value: 4 },
            { label: "53–62", value: 3 },
            { label: "≥ 63", value: 0 }
          ]
        },
        {
          id: "peso",
          type: "select",
          label: "Peso",
          options: [
            { label: "≤ 65 kg", value: 1 },
            { label: "65–89 kg", value: 2 },
            { label: "> 89 kg", value: 0 }
          ]
        },
        {
          id: "organos",
          type: "select",
          label: "Fallo orgánico agudo previo a la ECMO",
          options: [
            { label: "Renal (creatinina > 1,5 o diálisis)", value: -3 },
            { label: "Hepático (bilirrubina > 2 o transaminasas > 70)", value: -3.0001 },
            { label: "Neurológico", value: -3.0002 },
            { label: "Sin fallo orgánico", value: 0 }
          ]
        },
        { id: "ventilacion", type: "boolean", label: "Ventilación mecánica > 10 días", points: -1 },
        { id: "presionInspiratoria", type: "boolean", label: "Presión inspiratoria pico ≥ 20 cmH₂O", points: -3 },
        { id: "pcr", type: "boolean", label: "Parada cardíaca antes de la ECMO", points: -2 },
        { id: "pas", type: "boolean", label: "PA sistólica ≤ 90 mmHg pre-ECMO", points: -2 },
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
          interpretation: "Herramienta de apoyo para decidir sobre la indicación de ECMO VA y las expectativas realistas. La decisión final integra el juicio clínico y la disponibilidad de recursos.",
          level: score >= 1 ? "ok" : score >= -4 ? "warn" : "danger"
        };
      },
      references: [
        "Schmidt M, et al. Predicting survival after ECMO for refractory cardiogenic shock: the SAVE-score. Eur Heart J. 2015;36(33):2246-56."
      ]
    },
    {
      id: "resp",
      name: "Puntuación RESP para supervivencia tras ECMO respiratoria",
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
            { label: "18–49 años", value: 0 },
            { label: "50–59 años", value: -2 },
            { label: "≥ 60 años", value: -3 }
          ]
        },
        {
          id: "inmunocomp",
          type: "select",
          label: "Inmunodepresión",
          options: [
            { label: "No", value: 0 },
            { label: "Sí (tumor sólido, hematológico, cirrosis, VIH…)", value: -2 }
          ]
        },
        {
          id: "ventilacion",
          type: "select",
          label: "Duración de la ventilación mecánica antes de la ECMO",
          dropdown: true,
          options: [
            { label: "< 48 h", value: 3 },
            { label: "48 h – 7 días", value: 1 },
            { label: "> 7 días", value: 0 }
          ]
        },
        {
          id: "diagnostico",
          type: "select",
          label: "Diagnóstico agudo",
          dropdown: true,
          options: [
            { label: "Neumonía viral", value: 3 },
            { label: "Neumonía bacteriana", value: 3.0001 },
            { label: "Asma", value: 11 },
            { label: "Traumatismo o quemadura", value: 3.0002 },
            { label: "Aspiración", value: 5 },
            { label: "Otras causas", value: 1 }
          ]
        },
        { id: "snc", type: "boolean", label: "Disfunción del sistema nervioso central", points: -7 },
        { id: "infeccion", type: "boolean", label: "Infección bacteriana aguda no pulmonar", points: -3 },
        { id: "bnm", type: "boolean", label: "Uso de bloqueantes neuromusculares" },
        { id: "no", type: "boolean", label: "Uso de óxido nítrico inhalado", points: -1 },
        { id: "bicarbonato", type: "boolean", label: "Uso de bicarbonato", points: -2 },
        { id: "pcr", type: "boolean", label: "Parada cardíaca previa a la ECMO", points: -2 },
        {
          id: "paco2",
          type: "select",
          label: "PaCO₂",
          options: [
            { label: "< 75 mmHg", value: 0 },
            { label: "≥ 75 mmHg", value: -1 }
          ]
        },
        {
          id: "presion",
          type: "select",
          label: "Presión pico inspiratoria",
          options: [
            { label: "< 42 cmH₂O", value: 0 },
            { label: "≥ 42 cmH₂O", value: -1 }
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
          interpretation: "Herramienta de apoyo para decidir sobre la indicación de ECMO respiratoria y anticipar expectativas.",
          level: score >= 3 ? "ok" : score >= -1 ? "warn" : "danger"
        };
      },
      references: [
        "Schmidt M, et al. Predicting survival after ECMO for severe acute respiratory failure. The Respiratory ECMO Survival Prediction (RESP) score. Am J Respir Crit Care Med. 2014;189(11):1374-82."
      ]
    },
    {
      id: "pons",
      name: "PONS — Perioperative Nutrition Screen",
      shortName: "PONS",
      description: "Cribado nutricional preoperatorio en cirugía electiva; identifica pacientes que se beneficiarán de optimización nutricional.",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        {
          id: "imc",
          type: "boolean",
          label: "IMC < 18,5 (o < 20 si ≥ 65 años)"
        },
        {
          id: "perdida",
          type: "boolean",
          label: "Pérdida de peso no intencionada > 10 % en 6 meses"
        },
        {
          id: "ingesta",
          type: "boolean",
          label: "Ingesta oral reducida en la última semana"
        },
        {
          id: "albumina",
          type: "boolean",
          label: "Albúmina preoperatoria < 3,0 g/dL"
        }
      ],
      compute: (v) => {
        const score = sum(v, ["imc", "perdida", "ingesta", "albumina"]);
        return {
          main: String(score),
          mainUnit: "criterios (0–4)",
          interpretation: score === 0 ? "Riesgo nutricional bajo: no requiere intervención específica preoperatoria." : "Al menos un criterio positivo: derivar a nutrición para optimización preoperatoria (suplementos orales, retraso de cirugía electiva si es posible 7–14 días).",
          level: score === 0 ? "ok" : "warn"
        };
      },
      references: [
        "Wischmeyer PE, et al. American Society for Enhanced Recovery and Perioperative Quality Initiative Joint Consensus Statement on Nutrition Screening. Anesth Analg. 2018;126(6):1883-95."
      ]
    },
    {
      id: "bridge-anticoagulacion",
      name: "Algoritmo de puentes de anticoagulación perioperatoria",
      shortName: "Puente anticoagulación",
      description: "Orienta la necesidad de puente con HBPM durante la suspensión perioperatoria de la anticoagulación oral.",
      category: CAT_CT,
      specialty: CT,
      inputs: [
        {
          id: "indicacion",
          type: "select",
          label: "Motivo de la anticoagulación",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Prótesis valvular mecánica", value: 1 },
            { label: "Fibrilación auricular", value: 2 },
            { label: "Tromboembolismo venoso", value: 3 }
          ],
          default: 2
        },
        {
          id: "riesgo",
          type: "select",
          label: "Riesgo tromboembólico específico",
          dropdown: true,
          noPoints: true,
          options: [
            { label: "Alto — prótesis mitral, prótesis aórtica antigua, CHA₂DS₂-VASc ≥ 7, ictus/AIT en los últimos 3 meses, TEV en los últimos 3 meses, trombofilia grave", value: "alto" },
            { label: "Intermedio — prótesis aórtica bicúspide moderna con factores de riesgo, CHA₂DS₂-VASc 5–6, TEV en los últimos 3–12 meses, trombofilia leve o TEV recurrente", value: "intermedio" },
            { label: "Bajo — prótesis aórtica bicúspide moderna sin factores, CHA₂DS₂-VASc 1–4 sin ictus previo, TEV único > 12 meses", value: "bajo" }
          ],
          default: "intermedio"
        },
        {
          id: "sangrado",
          type: "select",
          label: "Riesgo hemorrágico del procedimiento",
          noPoints: true,
          options: [
            { label: "Bajo (cataratas, endoscopia diagnóstica, extracción dental)", value: "bajo" },
            { label: "Intermedio (mayoría de cirugías generales)", value: "intermedio" },
            { label: "Alto (neurocirugía, cardíaca mayor, resecciones oncológicas)", value: "alto" }
          ],
          default: "intermedio"
        }
      ],
      compute: (v) => {
        const r = v.riesgo;
        const s = v.sangrado;
        const puente = r === "alto" || r === "intermedio" && s !== "alto";
        const guiaAcod = r === "alto" ? "Alto riesgo tromboembólico: se recomienda puente con HBPM a dosis terapéutica." : r === "intermedio" ? "Riesgo intermedio: valorar puente individualizando; en fibrilación auricular sin ictus previo el ensayo BRIDGE mostró que la mayoría no se benefician." : "Riesgo bajo: en general no se recomienda puente.";
        return {
          main: puente ? "Puente indicado" : "Puente no recomendado",
          interpretation: `${guiaAcod} ${s === "alto" ? "Sangrado alto: reanudar anticoagulación a las 48–72 h; en pacientes con riesgo tromboembólico muy alto, priorizar el control de la hemorragia." : s === "intermedio" ? "Sangrado intermedio: reanudar anticoagulación en 24 h si hemostasia adecuada." : "Sangrado bajo: puede no ser necesario suspender la anticoagulación (procedimientos menores)."}`,
          level: puente ? "warn" : "ok",
          details: [
            "En pacientes con anticoagulantes orales directos, en general NO se hace puente: se suspenden 24–48 h antes según función renal.",
            "La warfarina se suspende 5 días antes; el INR debe ser < 1,5 el día de la cirugía.",
            "Reanudar la HBPM 24 h después de la cirugía de bajo-intermedio riesgo o 48–72 h si el riesgo hemorrágico es alto."
          ]
        };
      },
      notes: [
        "El ensayo BRIDGE (NEJM 2015) demostró que no hacer puente en fibrilación auricular sin ictus previo es no inferior en tromboembolismo y reduce las hemorragias."
      ],
      references: [
        "Douketis JD, et al. Perioperative Management of Antithrombotic Therapy: An American College of Chest Physicians Clinical Practice Guideline. Chest. 2022;162(5):e207-e243."
      ]
    },
    {
      id: "duke-iscvid-2023",
      name: "Criterios Duke-ISCVID 2023 para endocarditis infecciosa",
      shortName: "Duke-ISCVID 2023",
      description: "Criterios diagnósticos actualizados de endocarditis infecciosa (Sociedad Internacional de ISCVID, 2023).",
      category: "Criterios diagnósticos",
      specialty: CT,
      inputs: [
        {
          id: "mayores",
          type: "select",
          label: "Criterios mayores presentes",
          dropdown: true,
          options: escala9([
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
          options: escala9([
            [0, "0"],
            [1, "1"],
            [2, "2"],
            [3, "3"],
            [4, "4"],
            [5, "5"]
          ])
        },
        { id: "confirmadaAP", type: "boolean", label: "Endocarditis confirmada por anatomía patológica o cultivo de válvula/vegetación", noPoints: true }
      ],
      compute: (v) => {
        var _a, _b;
        if (v.confirmadaAP === 1)
          return {
            main: "Endocarditis definitiva",
            interpretation: "Criterio anatomopatológico: la demostración de microorganismos o inflamación activa en válvula o vegetación establece el diagnóstico definitivo.",
            level: "danger"
          };
        const mayor = (_a = v.mayores) != null ? _a : 0;
        const menor = (_b = v.menores) != null ? _b : 0;
        let categoria;
        if (mayor >= 2 || mayor === 1 && menor >= 3 || menor >= 5) categoria = "Definitiva";
        else if (mayor === 1 && menor >= 1 || menor >= 3) categoria = "Posible";
        else categoria = "Rechazada";
        return {
          main: `Endocarditis ${categoria.toLowerCase()}`,
          interpretation: categoria === "Definitiva" ? "Diagnóstico definitivo por criterios clínicos: iniciar antibioterapia dirigida y valoración por equipo multidisciplinar de endocarditis." : categoria === "Posible" ? "Diagnóstico posible: completar estudio (hemocultivos seriados, ecocardiograma transesofágico, imagen avanzada: PET-TC en prótesis, angio-TC)." : "Diagnóstico rechazado: buscar diagnósticos alternativos.",
          level: categoria === "Definitiva" ? "danger" : categoria === "Posible" ? "warn" : "ok",
          details: [
            "Los criterios mayores incluyen ahora hemocultivos con nuevos microorganismos típicos, PCR positiva en tejido/serología, y hallazgos en PET-TC.",
            "Los criterios menores incluyen fenómenos vasculares/inmunológicos, catéter venoso central, drogadicción intravenosa reciente, y hallazgos ecográficos sugestivos."
          ]
        };
      },
      notes: [
        "Los criterios ISCVID 2023 amplían y actualizan los Duke modificados clásicos, integrando técnicas de imagen (PET-TC, angio-TC cardíaca) y microbiología molecular."
      ],
      references: [
        "Fowler VG, et al. The 2023 Duke-International Society for Cardiovascular Infectious Diseases Criteria for Infective Endocarditis. Clin Infect Dis. 2023;77(4):518-26."
      ]
    }
  ];

  // inurse-m2/src/calculators/pediatria-2.ts
  var pediatria2 = (function () {
  const CAT = 'Neonatología y pediatría';
  const CAT_GO = 'Obstetricia y ginecología';
  const PED = ['Pediatría'];
  const OBS = ['Obstetricia'];
  const escala = (items) => items.map(([value, label]) => ({ label: `${value} — ${label}`, value }));
  var pediatria2 = [
      {
          id: 'pecarn-head',
          name: 'PECARN para traumatismo craneoencefálico pediátrico',
          shortName: 'PECARN cabeza',
          description: 'Regla de decisión para identificar niños con TCE leve que no necesitan tomografía craneal.',
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
              const menor2 = v.edad === 0;
              const factorAlto = v.gcs === 1 || (menor2 ? v.palpableInfant === 1 : v.baseCraneo === 1);
              const factorIntermedio = menor2
                  ? v.hematomaCuero === 1 || v.perdidaConciencia === 1 || v.comportamiento === 1 || v.mecanismo === 1
                  : v.perdidaConciencia === 1 || v.vomitos === 1 || v.cefalea === 1 || v.mecanismo === 1;
              if (factorAlto)
                  return {
                      main: 'TC craneal recomendada',
                      interpretation: 'Factor de alto riesgo: riesgo de lesión cerebral traumática clínicamente significativa ≈ 4,4 % en < 2 años y 4,3 % en ≥ 2 años. Se recomienda tomografía craneal.',
                      level: 'danger',
                  };
              if (factorIntermedio)
                  return {
                      main: 'Observación o TC',
                      interpretation: 'Factores intermedios: riesgo ≈ 0,9 % en < 2 años y 0,8 % en ≥ 2 años. Decisión compartida con la familia: observación 4–6 h en centro con TC disponible o tomografía. Factores que inclinan hacia TC: síntomas o hallazgos empeoran, mecanismo grave, edad < 3 meses, preferencia parental.',
                      level: 'warn',
                  };
              return {
                  main: 'TC no necesaria',
                  interpretation: 'Sin factores de riesgo: riesgo de lesión cerebral traumática clínicamente significativa < 0,05 %. Puede evitarse la tomografía y dar alta con recomendaciones de observación domiciliaria.',
                  level: 'ok',
              };
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
              const alto = v.gcs === 1 || v.fracturaAbierta === 1 || v.cefalea === 1 || v.irritabilidad === 1;
              const medio = !alto && (v.baseCraneo === 1 || v.hematoma === 1 || v.mecanismo === 1);
              return {
                  main: alto ? 'TC obligada' : medio ? 'TC recomendada' : 'TC no necesaria',
                  interpretation: alto
                      ? 'Factor de riesgo alto: tomografía obligada por riesgo de necesidad de intervención neuroquirúrgica.'
                      : medio
                          ? 'Factor de riesgo medio: tomografía recomendada por riesgo de lesión cerebral en la imagen.'
                          : 'Sin factores de riesgo: puede evitarse la tomografía.',
                  level: alto ? 'danger' : medio ? 'warn' : 'ok',
              };
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
          description: 'Regla británica de decisión para tomografía tras traumatismo craneal en niños < 16 años.',
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
              const positivo = ['perdida', 'amnesia', 'somnolencia', 'vomitos', 'sospechaMaltrato', 'convulsion', 'gcs', 'fractura', 'baseCraneo', 'focal', 'hematomaInfant', 'mecanismo'].some((k) => v[k] === 1);
              return {
                  main: positivo ? 'TC indicada' : 'TC no necesaria',
                  interpretation: positivo
                      ? 'Al menos un criterio positivo: se recomienda tomografía craneal.'
                      : 'Ningún criterio positivo: puede evitarse la tomografía (sensibilidad ≈ 98 % para lesión cerebral clínicamente significativa).',
                  level: positivo ? 'danger' : 'ok',
              };
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
              const score = sum(v, ['tos', 'anorexia', 'fiebre', 'nauseas', 'fid', 'leucocitosis', 'neutrofilia', 'migracion']);
              return {
                  main: String(score),
                  mainUnit: 'puntos (0–10)',
                  interpretation: score <= 3
                      ? 'Baja probabilidad de apendicitis: valorar alta con reevaluación.'
                      : score <= 6
                          ? 'Probabilidad intermedia: observación y prueba de imagen (ecografía).'
                          : 'Alta probabilidad de apendicitis: valoración quirúrgica.',
                  level: score <= 3 ? 'ok' : score <= 6 ? 'warn' : 'danger',
              };
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
              const score = sum(v, ['ocular', 'verbal', 'motora']);
              return {
                  main: String(score),
                  mainUnit: 'puntos (3–15)',
                  secondary: `O${v.ocular} V${v.verbal} M${v.motora}`,
                  interpretation: score >= 13
                      ? 'Alteración leve del nivel de conciencia.'
                      : score >= 9
                          ? 'Alteración moderada: vigilancia estrecha, neuroimagen.'
                          : 'Alteración grave (≤ 8): valorar aislamiento de la vía aérea.',
                  level: score >= 13 ? 'ok' : score >= 9 ? 'warn' : 'danger',
              };
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
              const score = sum(v, ['peso', 'aerea', 'pas', 'conciencia', 'abierta', 'esqueleto']);
              return {
                  main: String(score),
                  mainUnit: 'puntos (−6 a +12)',
                  interpretation: score >= 9
                      ? 'Trauma leve: manejo habitual en urgencias.'
                      : score >= 6
                          ? 'Trauma moderado: traslado a hospital con capacidad pediátrica.'
                          : 'Trauma grave (≤ 5): traslado a centro de referencia de trauma pediátrico.',
                  level: score >= 9 ? 'ok' : score >= 6 ? 'warn' : 'danger',
              };
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
              const score = sum(v, ['estridor', 'tiraje', 'aire', 'cianosis', 'conciencia']);
              return {
                  main: String(score),
                  mainUnit: 'puntos (0–17)',
                  interpretation: score <= 2
                      ? 'Crup leve: dexametasona 0,15–0,6 mg/kg oral en dosis única, observación.'
                      : score <= 5
                          ? 'Crup moderado: dexametasona y valorar adrenalina nebulizada.'
                          : score <= 11
                              ? 'Crup grave: adrenalina nebulizada, dexametasona, oxígeno, observación estrecha.'
                              : 'Insuficiencia respiratoria inminente: preparar vía aérea avanzada.',
                  level: score <= 2 ? 'ok' : score <= 5 ? 'warn' : 'danger',
              };
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
              const acotar = (x, min) => Math.max(x, min);
              const bili = acotar(v.bilirrubina, 1);
              const inr = acotar(v.inr, 1);
              const alb = acotar(v.albumina, 1);
              const raw = 4.80 * Math.log(bili) +
                  18.57 * Math.log(inr) -
                  6.87 * Math.log(alb) +
                  (v.menor1 === 1 ? 4.36 : 0) +
                  (v.crecimiento === 1 ? 6.67 : 0);
              const peld = Math.max(0, Math.round(raw));
              return {
                  main: String(peld),
                  mainUnit: 'PELD',
                  interpretation: peld < 10
                      ? 'Enfermedad hepática compensada; seguimiento habitual.'
                      : peld < 20
                          ? 'Deterioro moderado: valoración por hepatología pediátrica.'
                          : 'Deterioro grave: prioridad en lista de trasplante.',
                  level: peld < 10 ? 'ok' : peld < 20 ? 'warn' : 'danger',
              };
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
              const score = sum(v, ['dolor', 'sangrado', 'consistencia', 'deposiciones', 'nocturnas', 'actividad']);
              return {
                  main: String(score),
                  mainUnit: 'puntos (0–85)',
                  interpretation: score < 10
                      ? 'Remisión (< 10): mantener tratamiento actual y controles.'
                      : score < 35
                          ? 'Actividad leve (10–34).'
                          : score < 65
                              ? 'Actividad moderada (35–64): considerar intensificación del tratamiento.'
                              : 'Actividad grave (≥ 65): hospitalización con corticoides intravenosos; PUCAI ≥ 45 al día 3 y ≥ 65 al día 5 predice fracaso a corticoides y necesita rescate.',
                  level: score < 10 ? 'ok' : score < 35 ? 'info' : score < 65 ? 'warn' : 'danger',
              };
          },
          references: [
              'Turner D, et al. Development, validation, and evaluation of a pediatric ulcerative colitis activity index: a prospective multicenter study. Gastroenterology. 2007;133(2):423-32.',
          ],
      },
      {
          id: 'kawasaki-ped',
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
              const criterios = sum(v, ['conjuntivitis', 'oral', 'extremidades', 'exantema', 'adenopatia']);
              if (v.fiebre !== 1)
                  return {
                      main: 'No cumple criterios',
                      interpretation: 'La fiebre ≥ 5 días es un criterio obligatorio (o < 5 días con ≥ 4 criterios adicionales si se sospecha fuertemente).',
                      level: 'ok',
                  };
              if (criterios >= 4)
                  return {
                      main: 'Kawasaki clásica',
                      interpretation: 'Fiebre ≥ 5 días + ≥ 4 criterios principales: se diagnostica enfermedad de Kawasaki. Iniciar inmunoglobulina intravenosa 2 g/kg en 12 h y AAS a dosis antiinflamatoria en las primeras 10 días de fiebre.',
                      level: 'danger',
                  };
              if (criterios >= 2)
                  return {
                      main: 'Kawasaki incompleta posible',
                      interpretation: 'Fiebre ≥ 5 días + 2–3 criterios: valorar Kawasaki incompleta. Solicitar PCR, VSG, hemograma, transaminasas, orina y ecocardiograma. Consultar criterios de laboratorio y de imagen de la AHA 2017.',
                      level: 'warn',
                  };
              return {
                  main: 'Kawasaki improbable',
                  interpretation: 'Menos de 2 criterios adicionales: buscar otros diagnósticos. Si persiste la fiebre sin foco, reevaluar.',
                  level: 'ok',
              };
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
              const score = sum(v, ['car', 'relax', 'alone', 'forget', 'family', 'trouble']);
              return {
                  main: String(score),
                  mainUnit: 'puntos (0–6)',
                  interpretation: score >= 2
                      ? 'CRAFFT ≥ 2: alta sospecha de consumo problemático o trastorno por consumo. Entrevista motivacional y valorar derivación a salud mental.'
                      : score === 1
                          ? 'Una respuesta positiva: consejo breve, refuerzo y reevaluar.'
                          : 'Cribado negativo: refuerzo positivo.',
                  level: score >= 2 ? 'danger' : score === 1 ? 'warn' : 'ok',
              };
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
          description: 'Herramienta rápida de cribado psicosocial para adolescentes que acuden a urgencias por motivos de salud mental.',
          category: CAT,
          specialty: PED,
          inputs: [
              ...[
                  ['home', 'Home (hogar)'],
                  ['education', 'Educación / empleo'],
                  ['activities', 'Actividades y pares'],
                  ['drugs', 'Alcohol y drogas'],
                  ['suicidalidad', 'Suicidalidad'],
                  ['emociones', 'Emociones y comportamiento (ansiedad, depresión…)'],
                  ['descargador', 'Recursos de apoyo (professionals/discharge)'],
              ].map(([id, label]) => ({
                  id,
                  type: 'select',
                  label,
                  options: escala([
                      [0, 'Sin problemas'],
                      [1, 'Problemas leves-moderados'],
                      [2, 'Problemas graves o urgentes'],
                  ]),
              })),
          ],
          compute: (v) => {
              const ids = ['home', 'education', 'activities', 'drugs', 'suicidalidad', 'emociones', 'descargador'];
              const score = sum(v, ids);
              const suic = (v.suicidalidad ?? 0) === 2;
              const consulta = score >= 8 || suic;
              return {
                  main: String(score),
                  mainUnit: 'puntos (0–14)',
                  interpretation: consulta
                      ? 'Se recomienda consulta con psiquiatría o salud mental (HEADS-ED ≥ 8 o suicidalidad grave).'
                      : 'Puntuación baja: seguir con evaluación clínica habitual y valorar apoyo comunitario.',
                  level: consulta ? 'danger' : 'warn',
              };
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
              const g = v.nivel ?? 100;
              return {
                  main: String(g),
                  mainUnit: '/100',
                  interpretation: g >= 70
                      ? 'Estado funcional preservado: tolerará razonablemente los tratamientos.'
                      : g >= 40
                          ? 'Estado funcional intermedio: valorar caso a caso.'
                          : 'Estado funcional muy reducido: en general no se toleran los tratamientos oncológicos activos; priorizar control sintomático.',
                  level: g >= 70 ? 'ok' : g >= 40 ? 'warn' : 'danger',
              };
          },
          references: [
              'Lansky SB, et al. The measurement of performance in childhood cancer patients. Cancer. 1987;60(7):1651-6.',
          ],
      },
      {
          id: 'wat-1',
          name: 'WAT-1 — Escala de abstinencia pediátrica',
          shortName: 'WAT-1',
          description: 'Cuantifica el síndrome de abstinencia de opioides y benzodiacepinas en pacientes pediátricos críticos.',
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
              const score = sum(v, ['deposiciones', 'vomitos', 'temperatura', 'estado', 'temblor', 'sudoracion', 'movimientos', 'bostezos', 'sobresalto', 'tonoMus', 'tiempoConsuelo']);
              return {
                  main: String(score),
                  mainUnit: 'puntos (0–12)',
                  interpretation: score < 3
                      ? 'Sin síntomas de abstinencia significativos: mantener plan de destete.'
                      : 'WAT-1 ≥ 3: síndrome de abstinencia significativo. Ralentizar el destete o administrar dosis de rescate.',
                  level: score < 3 ? 'ok' : 'warn',
              };
          },
          references: [
              'Franck LS, et al. The Withdrawal Assessment Tool-1 (WAT-1): an assessment instrument for monitoring opioid and benzodiazepine withdrawal symptoms in pediatric patients. Pediatr Crit Care Med. 2008;9(6):573-80.',
          ],
      },
      {
          id: 'sodio-hiperglucemia',
          name: 'Corrección de sodio por hiperglucemia',
          shortName: 'Na corregido (glucosa)',
          description: 'Estima el sodio sérico real en pacientes con hiperglucemia significativa.',
          category: CAT,
          specialty: PED,
          inputs: [
              { id: 'sodio', type: 'number', label: 'Sodio medido', unit: 'mEq/L', min: 100, max: 180, step: 0.1 },
              { id: 'glucemia', type: 'number', label: 'Glucemia', unit: 'mg/dL', min: 100, max: 2000, step: 1 },
          ],
          compute: (v) => {
              const na = v.sodio + 1.6 * ((v.glucemia - 100) / 100);
              const naHillier = v.sodio + 2.4 * ((v.glucemia - 100) / 100);
              return {
                  main: fmt(na, 1),
                  mainUnit: 'mEq/L (Katz 1,6)',
                  secondary: fmt(naHillier, 1),
                  secondaryLabel: 'mEq/L (Hillier 2,4)',
                  interpretation: 'La fórmula clásica (Katz, 1,6 mEq/L por cada 100 mg/dL de glucosa por encima de 100) infraestima el sodio real; la fórmula de Hillier (2,4) es más exacta con glucemias muy altas.',
                  level: 'info',
              };
          },
          references: [
              'Hillier TA, et al. Hyponatremia: evaluating the correction factor for hyperglycemia. Am J Med. 1999;106(4):399-403.',
          ],
      },
      {
          id: 'fecha-parto',
          name: 'Fecha probable de parto y edad gestacional',
          shortName: 'Fecha del parto',
          description: 'Calcula la fecha probable de parto (regla de Naegele) y la edad gestacional actual a partir de la fecha de la última menstruación.',
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
              const base = new Date(v.anio, v.mes - 1, v.dia);
              if (isNaN(base.getTime()))
                  return { main: '—', interpretation: 'Fecha no válida.', level: 'warn' };
              const inicio = v.metodo === 1 ? new Date(base.getTime() - 14 * 86400000) : base;
              const parto = new Date(inicio.getTime() + 280 * 86400000);
              const hoy = new Date(v.hoyAnio, v.hoyMes - 1, v.hoyDia);
              if (isNaN(hoy.getTime()))
                  return { main: '—', interpretation: 'La fecha de hoy no es válida.', level: 'warn' };
              const dias = Math.floor((hoy.getTime() - inicio.getTime()) / 86400000);
              const semanas = Math.floor(dias / 7);
              const restoDias = dias % 7;
              const fmtDate = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
              return {
                  main: fmtDate(parto),
                  mainUnit: 'fecha probable de parto',
                  secondary: `${semanas} sem + ${restoDias} d`,
                  secondaryLabel: 'edad gestacional actual',
                  interpretation: dias < 0
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
              };
          },
      },
      {
          id: 'mapi',
          name: 'Índice predictivo del asma modificado (mAPI)',
          shortName: 'mAPI',
          description: 'Predice el riesgo de asma persistente en preescolares con episodios recurrentes de sibilancias.',
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
                  };
              const mayores = sum(v, ['padres', 'atopia', 'sensibAero']);
              const menores = sum(v, ['sensibAlim', 'sibsSinCatarro', 'eosinofilia']);
              const positivo = mayores >= 1 || menores >= 2;
              return {
                  main: positivo ? 'mAPI positivo' : 'mAPI negativo',
                  secondary: `${mayores} mayor + ${menores} menor`,
                  interpretation: positivo
                      ? 'mAPI positivo: alto valor predictivo positivo para el diagnóstico de asma en edad escolar. Reforzar seguimiento y tratamiento preventivo.'
                      : 'mAPI negativo: valor predictivo negativo muy alto; probable evolución favorable con la edad.',
                  level: positivo ? 'warn' : 'ok',
              };
          },
          references: [
              'Guilbert TW, et al. Atopic characteristics of children with recurrent wheezing at high risk for the development of childhood asthma. J Allergy Clin Immunol. 2004;114(6):1282-7.',
          ],
      },
      {
          id: 'regla-7-lyme',
          name: 'Regla de los 7 para la meningitis de Lyme',
          shortName: 'Regla de 7 (Lyme)',
          description: 'Diferencia la meningitis de Lyme de la meningitis aséptica viral en niños de áreas endémicas.',
          category: CAT,
          specialty: PED,
          inputs: [
              { id: 'sintomas', type: 'boolean', label: '≥ 7 días de síntomas', noPoints: true },
              { id: 'parCraneal', type: 'boolean', label: 'Parálisis de un par craneal (especialmente el VII)', noPoints: true },
              { id: 'mononuclear', type: 'boolean', label: '≥ 70 % de mononucleares en el LCR', noPoints: true },
          ],
          compute: (v) => {
              const criterios = ['sintomas', 'parCraneal', 'mononuclear'].filter((k) => v[k] === 1).length;
              return {
                  main: criterios === 0 ? 'Riesgo bajo' : 'No de bajo riesgo',
                  secondary: `${criterios}/3 criterios positivos`,
                  interpretation: criterios === 0
                      ? 'Ningún criterio positivo: riesgo muy bajo de meningitis de Lyme (probabilidad < 10 %). Puede tratarse como meningitis viral inicialmente y esperar a la serología.'
                      : 'Uno o más criterios positivos: se recomienda iniciar antibioterapia empírica cubriendo Borrelia (ceftriaxona) mientras se completa la serología.',
                  level: criterios === 0 ? 'ok' : 'warn',
              };
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
              const score = sum(v, ['edad', 'partoPrevio', 'partoDespuesCesarea', 'indicacion', 'borramiento', 'dilatacion']);
              const exito = ['49 %', '60 %', '67 %', '75 %', '82 %', '85 %', '89 %', '93 %', '95 %', '95 %', '95 %'][Math.min(score, 10)];
              return {
                  main: String(score),
                  mainUnit: 'puntos (0–10)',
                  secondary: exito,
                  secondaryLabel: 'probabilidad de VBAC exitoso',
                  interpretation: score >= 8
                      ? 'Alta probabilidad de éxito: candidata a intento de parto vaginal.'
                      : score >= 4
                          ? 'Probabilidad moderada: informar riesgos-beneficios y decidir con la paciente.'
                          : 'Probabilidad baja: valorar cesárea electiva salvo preferencia informada de la paciente.',
                  level: score >= 8 ? 'ok' : score >= 4 ? 'warn' : 'danger',
              };
          },
          notes: ['Contraindicaciones absolutas de VBAC: cesárea previa clásica, cirugía uterina previa con entrada en cavidad, dos o más cesáreas previas en la mayoría de guías, ruptura uterina previa.'],
          references: [
              'Flamm BL, Geiger AM. Vaginal birth after cesarean delivery: an admission scoring system. Obstet Gynecol. 1997;90(6):907-10.',
          ],
      },
  ];
    return pediatria2;
  })();

  // inurse-m2/src/calculators/primary-care.ts
  var primaryCare = (function () {
  const S = (arr) => arr.reduce((a, b) => a + Number(b || 0), 0);
  const CAT_SALUD_MENTAL = 'Geriatría, fragilidad y salud mental';
  const CAT_URG = 'Urgencias y decisión clínica';
  const CAT_MED = 'Medicina interna y familiar';
  const CAT_INFEC = 'Infecciones';
  const CAT_DOLOR = 'Dolor';
  const CAT_TOX = 'Endocrino y tóxicos';
  const CAT_FORM = 'Fórmulas y cálculos clínicos';
  const CAT_HEMAT = 'Hematología y oncología';
  const CAT_TEV = 'Tromboembolismo venoso';
  const CAT_GO = 'Obstetricia y ginecología';
  const CAT_NEO = 'Neonatología y pediatría';
  const MED = ['Medicina Familiar'];
  const URG = ['Emergencias'];
  const PED = ['Pediatría'];
  // ------- helpers de escalas frecuentes (0-3) ---------
  const OPC03 = [
      { label: '0 — Nunca', value: 0 },
      { label: '1 — Varios días', value: 1 },
      { label: '2 — Más de la mitad de los días', value: 2 },
      { label: '3 — Casi todos los días', value: 3 },
  ];
  var primaryCare = [
      // -------- PHQ-9 --------
      {
          id: 'phq-9',
          name: 'PHQ-9 — cribado de depresión',
          shortName: 'PHQ-9',
          description: 'Frecuencia de nueve síntomas depresivos en las últimas 2 semanas (DSM-5). Cribado y seguimiento.',
          category: CAT_SALUD_MENTAL,
          specialty: MED,
          inputs: [
              { id: 'anhedonia', type: 'select', label: '1. Poco interés o placer en hacer cosas', options: OPC03 },
              { id: 'depresion', type: 'select', label: '2. Sensación de estar decaído/a, deprimido/a o sin esperanza', options: OPC03 },
              { id: 'sueno', type: 'select', label: '3. Problemas para dormir o dormir en exceso', options: OPC03 },
              { id: 'cansancio', type: 'select', label: '4. Cansancio o poca energía', options: OPC03 },
              { id: 'apetito', type: 'select', label: '5. Poco apetito o comer en exceso', options: OPC03 },
              { id: 'fracaso', type: 'select', label: '6. Sentirse mal consigo mismo/a, fracasado/a o culpable', options: OPC03 },
              { id: 'concentracion', type: 'select', label: '7. Dificultad para concentrarse (leer, ver TV)', options: OPC03 },
              { id: 'psicomotor', type: 'select', label: '8. Lentitud o inquietud psicomotora percibidas por los demás', options: OPC03 },
              { id: 'ideacion', type: 'select', label: '9. Ideas de muerte, autolesión o «estaría mejor muerto/a»', options: OPC03 },
          ],
          compute: (v) => {
              const total = S([v.anhedonia, v.depresion, v.sueno, v.cansancio, v.apetito, v.fracaso, v.concentracion, v.psicomotor, v.ideacion]);
              let level = 'ok';
              let sub = 'Sin depresión (0–4).';
              if (total >= 20) {
                  level = 'danger';
                  sub = 'Depresión grave (≥ 20): iniciar tratamiento activo y valoración especializada.';
              }
              else if (total >= 15) {
                  level = 'warn';
                  sub = 'Depresión moderadamente grave (15–19): tratamiento activo.';
              }
              else if (total >= 10) {
                  level = 'warn';
                  sub = 'Depresión moderada (10–14): considerar tratamiento activo.';
              }
              else if (total >= 5) {
                  level = 'info';
                  sub = 'Depresión leve (5–9): vigilancia y apoyo.';
              }
              const ideacion = Number(v.ideacion) > 0;
              return {
                  main: fmt(total),
                  mainUnit: 'puntos (0–27)',
                  interpretation: (ideacion ? '⚠ Ítem 9 positivo: valorar riesgo de suicidio con entrevista dirigida. ' : '') + sub, level: ideacion ? 'danger' : level,
              };
          },
          notes: ['Kroenke K, Spitzer RL, Williams JB. J Gen Intern Med 2001. Punto de corte ≥ 10 sensibilidad ~88 %, especificidad ~88 %. Ítem 9 obliga a valorar riesgo suicida.'],
      },
      // -------- GAD-7 --------
      {
          id: 'gad-7',
          name: 'GAD-7 — cribado de ansiedad generalizada',
          shortName: 'GAD-7',
          description: 'Frecuencia de 7 síntomas de ansiedad en las últimas 2 semanas.',
          category: CAT_SALUD_MENTAL,
          specialty: MED,
          inputs: [
              { id: 'nervios', type: 'select', label: '1. Sentirse nervioso/a, ansioso/a o con los nervios de punta', options: OPC03 },
              { id: 'preocuparse', type: 'select', label: '2. No poder dejar de preocuparse o controlar la preocupación', options: OPC03 },
              { id: 'diversas', type: 'select', label: '3. Preocuparse demasiado por diferentes cosas', options: OPC03 },
              { id: 'relajarse', type: 'select', label: '4. Dificultad para relajarse', options: OPC03 },
              { id: 'inquieto', type: 'select', label: '5. Estar tan inquieto/a que resulta difícil quedarse sentado/a', options: OPC03 },
              { id: 'irritable', type: 'select', label: '6. Enfadarse o irritarse fácilmente', options: OPC03 },
              { id: 'miedo', type: 'select', label: '7. Sentir miedo como si algo horrible fuese a suceder', options: OPC03 },
          ],
          compute: (v) => {
              const total = S([v.nervios, v.preocuparse, v.diversas, v.relajarse, v.inquieto, v.irritable, v.miedo]);
              let level = 'ok';
              let sub = 'Ansiedad mínima (0–4).';
              if (total >= 15) {
                  level = 'danger';
                  sub = 'Ansiedad grave (≥ 15): considerar tratamiento activo y derivación.';
              }
              else if (total >= 10) {
                  level = 'warn';
                  sub = 'Ansiedad moderada (10–14): valorar tratamiento.';
              }
              else if (total >= 5) {
                  level = 'info';
                  sub = 'Ansiedad leve (5–9): vigilar evolución.';
              }
              return { main: fmt(total), mainUnit: 'puntos (0–21)', interpretation: sub, level };
          },
          notes: ['Spitzer RL. Arch Intern Med 2006. Punto de corte ≥ 10 para TAG: sensibilidad 89 %, especificidad 82 %.'],
      },
      // -------- AUDIT-C --------
      {
          id: 'audit-c',
          name: 'AUDIT-C — cribado de consumo de riesgo de alcohol',
          shortName: 'AUDIT-C',
          description: 'Tres primeras preguntas del AUDIT: frecuencia y cantidad de consumo.',
          category: CAT_SALUD_MENTAL,
          specialty: MED,
          inputs: [
              {
                  id: 'frecuencia',
                  type: 'select',
                  label: '¿Con qué frecuencia consume alguna bebida alcohólica?',
                  options: [
                      { label: '0 — Nunca', value: 0 },
                      { label: '1 — Una vez al mes o menos', value: 1 },
                      { label: '2 — 2–4 veces al mes', value: 2 },
                      { label: '3 — 2–3 veces por semana', value: 3 },
                      { label: '4 — 4 o más veces por semana', value: 4 },
                  ],
              },
              {
                  id: 'unidades',
                  type: 'select',
                  label: '¿Cuántas consumiciones de bebida alcohólica toma un día normal?',
                  options: [
                      { label: '0 — 1 o 2', value: 0 },
                      { label: '1 — 3 o 4', value: 1 },
                      { label: '2 — 5 o 6', value: 2 },
                      { label: '3 — 7 a 9', value: 3 },
                      { label: '4 — 10 o más', value: 4 },
                  ],
              },
              {
                  id: 'atracon',
                  type: 'select',
                  label: '¿Con qué frecuencia toma 6 o más bebidas en una sola ocasión?',
                  options: [
                      { label: '0 — Nunca', value: 0 },
                      { label: '1 — Menos de una vez al mes', value: 1 },
                      { label: '2 — Mensualmente', value: 2 },
                      { label: '3 — Semanalmente', value: 3 },
                      { label: '4 — A diario o casi a diario', value: 4 },
                  ],
              },
              { id: 'sexo', type: 'select', label: 'Sexo', noPoints: true, options: [
                      { label: 'Hombre', value: 0 }, { label: 'Mujer', value: 1 },
                  ] },
          ],
          compute: (v) => {
              const total = S([v.frecuencia, v.unidades, v.atracon]);
              const umbral = v.sexo === 1 ? 3 : 4;
              const positivo = total >= umbral;
              return {
                  main: fmt(total),
                  mainUnit: `puntos (umbral ≥ ${umbral})`,
                  interpretation: positivo
                      ? `Cribado positivo (≥ ${umbral}): consumo de riesgo. Completar el AUDIT-10 y ofrecer intervención breve.`
                      : 'Cribado negativo.',
                  level: positivo ? 'warn' : 'ok',
              };
          },
          notes: ['Bush K. Arch Intern Med 1998. Puntos de corte 4 en hombres y 3 en mujeres. Cualquier respuesta ≥ 4 en la pregunta 3 sugiere consumo perjudicial.'],
      },
      // -------- DAST-10 --------
      {
          id: 'dast-10',
          name: 'DAST-10 — consumo problemático de drogas',
          shortName: 'DAST-10',
          description: 'Diez preguntas Sí/No sobre uso de drogas (no incluye alcohol) en los últimos 12 meses.',
          category: CAT_SALUD_MENTAL,
          specialty: MED,
          inputs: [
              { id: 'noMedica', type: 'boolean', label: '1. ¿Ha consumido drogas distintas a las que precisa por razones médicas?' },
              { id: 'masDeUna', type: 'boolean', label: '2. ¿Abusa de más de una droga a la vez?' },
              { id: 'parar', type: 'boolean', label: '3. ¿Es incapaz de parar el consumo cuando quiere?' },
              { id: 'lagunas', type: 'boolean', label: '4. ¿Ha tenido pérdidas de memoria (blackouts) o flashbacks por el consumo?' },
              { id: 'culpa', type: 'boolean', label: '5. ¿Se siente mal o culpable por consumir?' },
              { id: 'familia', type: 'boolean', label: '6. ¿Su familia se queja por su consumo?' },
              { id: 'problemas', type: 'boolean', label: '7. ¿Ha descuidado a su familia por el consumo?' },
              { id: 'ilegal', type: 'boolean', label: '8. ¿Ha realizado actividades ilegales para conseguir drogas?' },
              { id: 'abstinencia', type: 'boolean', label: '9. ¿Ha tenido síntomas de abstinencia al parar?' },
              { id: 'medico', type: 'boolean', label: '10. ¿Ha tenido problemas médicos por el consumo (memoria, hepatitis, hemorragias, convulsiones)?' },
          ],
          compute: (v) => {
              const total = S([v.noMedica, v.masDeUna, v.parar, v.lagunas, v.culpa, v.familia, v.problemas, v.ilegal, v.abstinencia, v.medico]);
              let level = 'ok';
              let sub = 'Sin problemas relacionados con drogas (0).';
              if (total >= 9) {
                  level = 'danger';
                  sub = 'Nivel grave (9–10): tratamiento intensivo.';
              }
              else if (total >= 6) {
                  level = 'warn';
                  sub = 'Nivel sustancial (6–8): evaluación e intervención.';
              }
              else if (total >= 3) {
                  level = 'warn';
                  sub = 'Nivel moderado (3–5): evaluación adicional y consejo.';
              }
              else if (total >= 1) {
                  level = 'info';
                  sub = 'Nivel bajo (1–2): consejo motivacional breve.';
              }
              return { main: fmt(total), mainUnit: 'puntos (0–10)', interpretation: sub, level };
          },
          notes: ['Skinner HA. Addict Behav 1982. Punto de corte ≥ 3 para intervención breve, ≥ 6 evaluación intensiva.'],
      },
      // -------- 4AT delirio --------
      {
          id: '4at',
          name: '4AT — cribado rápido de delirio',
          shortName: '4AT',
          description: 'Herramienta de 4 ítems en <2 min para cribar delirio y deterioro cognitivo.',
          category: CAT_SALUD_MENTAL,
          specialty: MED,
          inputs: [
              { id: 'alerta', type: 'select', label: 'Alerta (observar 10 s)', options: [
                      { label: '0 — Normal', value: 0 },
                      { label: '0 — Levemente somnoliento < 10 s pero luego normal', value: 0 },
                      { label: '4 — Claramente anormal (agitación, hipoactividad marcada)', value: 4 },
                  ] },
              { id: 'amt4', type: 'select', label: 'AMT-4 (edad, fecha de nacimiento, lugar, año)', options: [
                      { label: '0 — Sin errores', value: 0 },
                      { label: '1 — 1 error', value: 1 },
                      { label: '2 — 2 o más errores / no evaluable', value: 2 },
                  ] },
              { id: 'atencion', type: 'select', label: 'Atención: meses del año hacia atrás desde diciembre', options: [
                      { label: '0 — Consigue ≥ 7 correctos', value: 0 },
                      { label: '1 — Empieza pero < 7 o se niega', value: 1 },
                      { label: '2 — No evaluable (somnolencia, mala salud)', value: 2 },
                  ] },
              { id: 'curso', type: 'select', label: 'Curso agudo o fluctuante (en las últimas 2 semanas y todavía presente en 24 h)', options: [
                      { label: '0 — No', value: 0 },
                      { label: '4 — Sí', value: 4 },
                  ] },
          ],
          compute: (v) => {
              const total = S([v.alerta, v.amt4, v.atencion, v.curso]);
              let level = 'ok';
              let sub = 'Delirio o deterioro cognitivo grave improbables (0).';
              if (total >= 4) {
                  level = 'danger';
                  sub = 'Posible delirio ± deterioro cognitivo (≥ 4): valorar causa, entorno y medicación.';
              }
              else if (total >= 1) {
                  level = 'warn';
                  sub = 'Posible deterioro cognitivo (1–3): valorar en profundidad.';
              }
              return { main: fmt(total), mainUnit: 'puntos (0–12)', interpretation: sub, level };
          },
          notes: ['MacLullich A. Age Ageing 2014. Validado en urgencias, hospitalización y geriatría. Sensibilidad ~90 %, especificidad ~85 % para delirio.'],
      },
      // -------- AMT-4 --------
      {
          id: 'amt-4',
          name: 'AMT-4 — Abbreviated Mental Test',
          shortName: 'AMT-4',
          description: 'Cribado ultrabreve de orientación con 4 preguntas.',
          category: CAT_SALUD_MENTAL,
          specialty: MED,
          inputs: [
              { id: 'edad', type: 'boolean', label: 'Edad correcta' },
              { id: 'nacimiento', type: 'boolean', label: 'Fecha de nacimiento correcta' },
              { id: 'lugar', type: 'boolean', label: 'Lugar donde está correcto' },
              { id: 'anio', type: 'boolean', label: 'Año actual correcto' },
          ],
          compute: (v) => {
              const total = S([v.edad, v.nacimiento, v.lugar, v.anio]);
              let level = 'ok';
              let sub = 'Orientación conservada (4/4).';
              if (total <= 2) {
                  level = 'warn';
                  sub = 'Probable deterioro cognitivo (≤ 2/4): completar valoración.';
              }
              else if (total === 3) {
                  level = 'info';
                  sub = 'Rendimiento reducido (3/4): repetir en evolución.';
              }
              return { main: `${total}/4`, interpretation: sub, level };
          },
          notes: ['Swain DG, Nightingale PG. Age Ageing 1997. Rendimiento comparable al AMT-10 para orientación básica.'],
      },
      // -------- PAINAD --------
      {
          id: 'painad',
          name: 'PAINAD — dolor en demencia avanzada',
          shortName: 'PAINAD',
          description: 'Evaluación del dolor por observación (5 dimensiones) en pacientes con demencia moderada-grave.',
          category: CAT_DOLOR,
          specialty: MED,
          inputs: [
              { id: 'respiracion', type: 'select', label: 'Respiración independiente de la vocalización', options: [
                      { label: '0 — Normal', value: 0 },
                      { label: '1 — Respiración con dificultad ocasional o corta hiperventilación', value: 1 },
                      { label: '2 — Respiración ruidosa, hiperventilación prolongada, Cheyne-Stokes', value: 2 },
                  ] },
              { id: 'vocalizacion', type: 'select', label: 'Vocalización negativa', options: [
                      { label: '0 — Ausente', value: 0 },
                      { label: '1 — Gemidos, quejas ocasionales; habla en tono bajo/negativo', value: 1 },
                      { label: '2 — Llamadas repetidas, gemidos fuertes o llanto', value: 2 },
                  ] },
              { id: 'facial', type: 'select', label: 'Expresión facial', options: [
                      { label: '0 — Sonriente o inexpresiva', value: 0 },
                      { label: '1 — Triste, atemorizada, ceño fruncido', value: 1 },
                      { label: '2 — Muecas', value: 2 },
                  ] },
              { id: 'corporal', type: 'select', label: 'Lenguaje corporal', options: [
                      { label: '0 — Relajado', value: 0 },
                      { label: '1 — Tenso, deambulación afligida, inquietud', value: 1 },
                      { label: '2 — Rigidez, puños cerrados, rodillas flexionadas, apartar/golpear', value: 2 },
                  ] },
              { id: 'consuelo', type: 'select', label: 'Consolabilidad', options: [
                      { label: '0 — Sin necesidad de consuelo', value: 0 },
                      { label: '1 — Se distrae o tranquiliza con voz o toque', value: 1 },
                      { label: '2 — Imposible consolar, distraer o tranquilizar', value: 2 },
                  ] },
          ],
          compute: (v) => {
              const total = S([v.respiracion, v.vocalizacion, v.facial, v.corporal, v.consuelo]);
              let level = 'ok';
              let sub = 'Sin dolor observado (0).';
              if (total >= 7) {
                  level = 'danger';
                  sub = 'Dolor intenso (7–10): tratamiento y reevaluación tras 30–60 min.';
              }
              else if (total >= 4) {
                  level = 'warn';
                  sub = 'Dolor moderado (4–6): iniciar tratamiento analgésico.';
              }
              else if (total >= 1) {
                  level = 'info';
                  sub = 'Dolor leve (1–3): valorar causa y medidas no farmacológicas.';
              }
              return { main: fmt(total), mainUnit: 'puntos (0–10)', interpretation: sub, level };
          },
          notes: ['Warden V. J Am Med Dir Assoc 2003. Correlación con escalas verbales; recomendada en geriatría y cuidados paliativos.'],
      },
      // -------- MIDAS --------
      {
          id: 'midas',
          name: 'MIDAS — discapacidad por migraña',
          shortName: 'MIDAS',
          description: 'Días perdidos por cefalea en los últimos 3 meses en 5 áreas.',
          category: CAT_MED,
          specialty: MED,
          inputs: [
              { id: 'trabajo', type: 'number', label: '1. Días de trabajo/estudio perdidos (últimos 3 meses)' },
              { id: 'rendimiento', type: 'number', label: '2. Días con rendimiento reducido ≥ 50 % en trabajo/estudio' },
              { id: 'casa', type: 'number', label: '3. Días de tareas del hogar perdidas' },
              { id: 'casaReducido', type: 'number', label: '4. Días con rendimiento reducido ≥ 50 % en tareas del hogar' },
              { id: 'ocio', type: 'number', label: '5. Días de actividades familiares/sociales/ocio perdidas' },
          ],
          compute: (v) => {
              const total = Number(v.trabajo || 0) + Number(v.rendimiento || 0) + Number(v.casa || 0) + Number(v.casaReducido || 0) + Number(v.ocio || 0);
              let level = 'ok';
              let grado = 'Grado I: discapacidad mínima (0–5).';
              if (total >= 21) {
                  level = 'danger';
                  grado = 'Grado IV: discapacidad grave (≥ 21). Profilaxis y valoración especializada.';
              }
              else if (total >= 11) {
                  level = 'warn';
                  grado = 'Grado III: discapacidad moderada (11–20). Considerar profilaxis.';
              }
              else if (total >= 6) {
                  level = 'info';
                  grado = 'Grado II: discapacidad leve (6–10).';
              }
              return { main: fmt(total), mainUnit: 'días', interpretation: grado, level };
          },
          notes: ['Stewart WF. Cephalalgia 1999. Se acompaña siempre de dos preguntas adicionales (días con cefalea y su intensidad) que no puntúan.'],
      },
      // -------- NDI --------
      {
          id: 'ndi',
          name: 'NDI — Neck Disability Index',
          shortName: 'NDI',
          description: 'Discapacidad por cervicalgia en 10 áreas (0-5 cada una).',
          category: CAT_MED,
          specialty: MED,
          inputs: Array.from({ length: 10 }).map((_, i) => ({
              id: `q${i + 1}`,
              type: 'select',
              label: [
                  '1. Intensidad del dolor',
                  '2. Cuidado personal (lavarse, vestirse)',
                  '3. Levantar pesos',
                  '4. Leer',
                  '5. Cefalea',
                  '6. Concentración',
                  '7. Trabajo',
                  '8. Conducir',
                  '9. Sueño',
                  '10. Ocio',
              ][i],
              options: [
                  { label: '0 — Sin problemas', value: 0 },
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5 — Peor imaginable / imposible', value: 5 },
              ],
          })),
          compute: (v) => {
              const total = S([v.q1, v.q2, v.q3, v.q4, v.q5, v.q6, v.q7, v.q8, v.q9, v.q10]);
              const pct = (total / 50) * 100;
              let level = 'ok';
              let sub = 'Sin discapacidad (0–4 puntos, < 10 %).';
              if (total >= 35) {
                  level = 'danger';
                  sub = 'Discapacidad completa (≥ 70 %): reevaluar diagnóstico.';
              }
              else if (total >= 25) {
                  level = 'danger';
                  sub = 'Discapacidad grave (50–68 %).';
              }
              else if (total >= 15) {
                  level = 'warn';
                  sub = 'Discapacidad moderada (30–48 %).';
              }
              else if (total >= 5) {
                  level = 'info';
                  sub = 'Discapacidad leve (10–28 %).';
              }
              return { main: `${fmt(total)} (${fmt(pct, 0)} %)`, mainUnit: 'de 50', interpretation: sub, level };
          },
          notes: ['Vernon H. J Manipulative Physiol Ther 1991. Diferencia mínima clínicamente relevante ≈ 5 puntos o 10 %.'],
      },
      // -------- PUQE --------
      {
          id: 'puqe',
          name: 'PUQE — náuseas y vómitos del embarazo',
          shortName: 'PUQE',
          description: 'Suma la duración de las náuseas, el número de vómitos y de arcadas en las últimas 24 h.',
          category: CAT_GO,
          specialty: MED,
          inputs: [
              { id: 'nausea', type: 'select', label: 'Horas con náuseas en 24 h', options: [
                      { label: '1 — No', value: 1 },
                      { label: '2 — ≤ 1 h', value: 2 },
                      { label: '3 — 2–3 h', value: 3 },
                      { label: '4 — 4–6 h', value: 4 },
                      { label: '5 — > 6 h', value: 5 },
                  ] },
              { id: 'vomitos', type: 'select', label: 'Episodios de vómito en 24 h', options: [
                      { label: '1 — Ninguno', value: 1 },
                      { label: '2 — 1–2', value: 2 },
                      { label: '3 — 3–4', value: 3 },
                      { label: '4 — 5–6', value: 4 },
                      { label: '5 — ≥ 7', value: 5 },
                  ] },
              { id: 'arcadas', type: 'select', label: 'Arcadas (sin expulsión) en 24 h', options: [
                      { label: '1 — Ninguna', value: 1 },
                      { label: '2 — 1–2', value: 2 },
                      { label: '3 — 3–4', value: 3 },
                      { label: '4 — 5–6', value: 4 },
                      { label: '5 — ≥ 7', value: 5 },
                  ] },
          ],
          compute: (v) => {
              const total = S([v.nausea, v.vomitos, v.arcadas]);
              let level = 'ok';
              let sub = 'Náuseas y vómitos leves (≤ 6): antieméticos orales y medidas dietéticas.';
              if (total >= 13) {
                  level = 'danger';
                  sub = 'Grave (≥ 13): considerar hospitalización, líquidos IV y antieméticos.';
              }
              else if (total >= 7) {
                  level = 'warn';
                  sub = 'Moderado (7–12): antieméticos, valorar hidratación y controles.';
              }
              return { main: fmt(total), mainUnit: 'puntos (3–15)', interpretation: sub, level };
          },
          notes: ['Koren G. Am J Obstet Gynecol 2002 (PUQE-24, modificado en 2005). Alta correlación con calidad de vida y con hospitalización.'],
      },
      // -------- Marburg heart score --------
      {
          id: 'marburg',
          name: 'Puntuación cardíaca de Marburgo — dolor torácico en Primaria',
          shortName: 'Marburgo',
          description: 'Descarta enfermedad coronaria en pacientes con dolor torácico en Atención Primaria.',
          category: CAT_URG,
          specialty: MED,
          inputs: [
              { id: 'edadSexo', type: 'boolean', label: 'Edad y sexo (mujer ≥ 65 años o varón ≥ 55 años)' },
              { id: 'ecvConocida', type: 'boolean', label: 'Enfermedad cardiovascular conocida (coronaria, arteriopatía, ictus)' },
              { id: 'esfuerzo', type: 'boolean', label: 'El dolor empeora con el esfuerzo' },
              { id: 'noPalpacion', type: 'boolean', label: 'El dolor NO se reproduce con la palpación' },
              { id: 'pacienteCardiaco', type: 'boolean', label: 'El paciente cree que es un dolor de origen cardíaco' },
          ],
          compute: (v) => {
              const total = S([v.edadSexo, v.ecvConocida, v.esfuerzo, v.noPalpacion, v.pacienteCardiaco]);
              let level = 'ok';
              let sub = 'Bajo riesgo (0–2): enfermedad coronaria improbable.';
              if (total >= 4) {
                  level = 'danger';
                  sub = 'Riesgo alto (4–5): probabilidad ~ 63 %, derivar para valoración cardiológica.';
              }
              else if (total >= 3) {
                  level = 'warn';
                  sub = 'Riesgo intermedio (3): probabilidad ~ 17 %, ampliar pruebas.';
              }
              return { main: fmt(total), mainUnit: 'puntos (0–5)', interpretation: sub, level };
          },
          notes: ['Bösner S. CMAJ 2010. Sensibilidad 87 %, especificidad 81 % con corte ≥ 3. Uso exclusivo en Atención Primaria, no en urgencias.'],
      },
      // -------- INTERCHEST --------
      {
          id: 'interchest',
          name: 'INTERCHEST — dolor torácico en Primaria',
          shortName: 'INTERCHEST',
          description: 'Alternativa a Marburg. Descarta coronariopatía en Atención Primaria.',
          category: CAT_URG,
          specialty: MED,
          inputs: [
              { id: 'edadSexo', type: 'boolean', label: 'Mujer ≥ 65 años o varón ≥ 55 años' },
              { id: 'ecvHistoria', type: 'boolean', label: 'Antecedentes de enfermedad coronaria' },
              { id: 'esfuerzo', type: 'boolean', label: 'Dolor relacionado con esfuerzo' },
              { id: 'pacienteCardiaco', type: 'boolean', label: 'El paciente asume que es cardíaco' },
              { id: 'presion', type: 'boolean', label: 'Sensación de presión' },
              { id: 'palpacionNo', type: 'boolean', label: 'NO reproducible con la palpación' },
          ],
          compute: (v) => {
              // Puntuación: cada positivo suma; palpación NO reproducible = 1, esfuerzo=1, edad-sexo=1, historia=1, presión=1, paciente=1 (rango 0-6)
              const total = S([v.edadSexo, v.ecvHistoria, v.esfuerzo, v.pacienteCardiaco, v.presion, v.palpacionNo]);
              const alto = total >= 2;
              return {
                  main: fmt(total),
                  mainUnit: 'puntos (0–6)',
                  interpretation: alto
                      ? 'Riesgo aumentado (≥ 2): valorar derivación / pruebas complementarias.'
                      : 'Bajo riesgo (0–1): valor predictivo negativo ~ 98 %. Coronariopatía muy improbable.',
                  level: alto ? 'warn' : 'ok',
              };
          },
          notes: ['Aerts M. Fam Pract 2017. Punto de corte ≥ 2 con sensibilidad ~ 90 %.'],
      },
      // -------- Pittsburgh knee --------
      {
          id: 'pittsburgh-rodilla',
          name: 'Reglas de rodilla de Pittsburgh',
          shortName: 'Pittsburgh rodilla',
          description: 'Necesidad de radiografía tras traumatismo de rodilla.',
          category: CAT_URG,
          specialty: URG,
          inputs: [
              { id: 'mecanismo', type: 'boolean', label: 'Mecanismo: caída o traumatismo con choque directo' },
              { id: 'edad', type: 'select', label: 'Edad', options: [
                      { label: '12–50 años', value: 0 },
                      { label: '< 12 años', value: 1 },
                      { label: '> 50 años', value: 1 },
                  ] },
              { id: 'noCarga', type: 'boolean', label: 'Incapaz de caminar 4 pasos con carga en urgencias' },
          ],
          compute: (v) => {
              if (!v.mecanismo) {
                  return { main: 'Sin indicación de radiografía', interpretation: 'Falta el criterio de mecanismo traumático (contusión o caída).', level: 'ok' };
              }
              const indicada = v.edad === 1 || v.noCarga === 1;
              return {
                  main: indicada ? 'Radiografía indicada' : 'Radiografía NO necesaria',
                  interpretation: indicada
                      ? 'Cumple mecanismo + edad de riesgo o incapacidad para cargar peso: solicitar Rx.'
                      : 'Puede evitarse la radiografía si la exploración es normal.',
                  level: indicada ? 'warn' : 'ok',
              };
          },
          notes: ['Seaberg DC. Ann Emerg Med 1998. Sensibilidad 99 % para fractura clínicamente significativa.'],
      },
      // -------- PECARN c-spine --------
      {
          id: 'pecarn-cspine',
          name: 'PECARN cervical — lesión de columna cervical pediátrica',
          shortName: 'PECARN cervical',
          description: 'Identifica niños < 18 años con TCE-trauma cervical que requieren imagen.',
          category: CAT_NEO,
          specialty: PED,
          inputs: [
              { id: 'gcs', type: 'boolean', label: 'Alteración de conciencia (GCS < 15, alterado)' },
              { id: 'focal', type: 'boolean', label: 'Déficit neurológico focal' },
              { id: 'dolorCuello', type: 'boolean', label: 'Dolor cervical o dolor a la palpación de línea media' },
              { id: 'torticolis', type: 'boolean', label: 'Torticolis' },
              { id: 'traumaTronco', type: 'boolean', label: 'Traumatismo torácico significativo' },
              { id: 'condicionAlto', type: 'boolean', label: 'Condición predisponente (Down, artritis reumatoide, EDS, otros)' },
              { id: 'buceoAlto', type: 'boolean', label: 'Buceo o mecanismo de alto riesgo (accidente vehículo > 60 km/h, atropello, caída > 3 m)' },
          ],
          compute: (v) => {
              const alto = S([v.gcs, v.focal, v.dolorCuello, v.torticolis, v.traumaTronco, v.condicionAlto, v.buceoAlto]);
              if (alto === 0) {
                  return {
                      main: 'Imagen NO necesaria',
                      interpretation: 'Sin factores de riesgo: valor predictivo negativo alto. Retirar collarín tras exploración.',
                      level: 'ok',
                  };
              }
              return {
                  main: 'Considerar imagen cervical',
                  interpretation: `${alto} factor(es) presente(s): TC cervical o Rx AP/lateral/odontoides según protocolo local.`,
                  level: 'warn',
              };
          },
          notes: ['Leonard JC. Ann Emerg Med 2011. Estudio original: 8 factores con sensibilidad 98 %. La regla PECARN 2024 (Leonard JC. Lancet Child Adolesc Health) simplifica; usar la versión clásica hasta validación local.'],
      },
      // -------- ATLAS C. difficile --------
      {
          id: 'atlas-cdiff',
          name: 'ATLAS — pronóstico de C. difficile',
          shortName: 'ATLAS',
          description: 'Predice la respuesta al tratamiento en infección por Clostridioides difficile.',
          category: CAT_INFEC,
          specialty: MED,
          inputs: [
              { id: 'edad', type: 'select', label: 'Edad', options: [
                      { label: '0 — < 60 años', value: 0 },
                      { label: '1 — 60–79 años', value: 1 },
                      { label: '2 — ≥ 80 años', value: 2 },
                  ] },
              { id: 'tempC', type: 'select', label: 'Temperatura', options: [
                      { label: '0 — ≤ 37,5 °C', value: 0 },
                      { label: '1 — 37,6–38,5 °C', value: 1 },
                      { label: '2 — > 38,5 °C', value: 2 },
                  ] },
              { id: 'leucos', type: 'select', label: 'Leucocitos (×10⁹/L)', options: [
                      { label: '0 — < 16', value: 0 },
                      { label: '1 — 16–25', value: 1 },
                      { label: '2 — > 25', value: 2 },
                  ] },
              { id: 'albumina', type: 'select', label: 'Albúmina (g/dL)', options: [
                      { label: '0 — > 3,5', value: 0 },
                      { label: '1 — 2,6–3,5', value: 1 },
                      { label: '2 — < 2,6', value: 2 },
                  ] },
              { id: 'antibiotico', type: 'boolean', label: 'Antibiótico sistémico concomitante' },
          ],
          compute: (v) => {
              const total = S([v.edad, v.tempC, v.leucos, v.albumina, v.antibiotico ? 2 : 0]);
              let level = 'ok';
              let sub = 'Buen pronóstico (0–3): curación esperada.';
              if (total >= 8) {
                  level = 'danger';
                  sub = 'Muy mal pronóstico (≥ 8): considerar tratamiento intensivo y valoración quirúrgica.';
              }
              else if (total >= 6) {
                  level = 'warn';
                  sub = 'Mal pronóstico (6–7): vigilancia estrecha.';
              }
              else if (total >= 4) {
                  level = 'info';
                  sub = 'Riesgo intermedio (4–5).';
              }
              return { main: fmt(total), mainUnit: 'puntos (0–10)', interpretation: sub, level };
          },
          notes: ['Miller MA. BMC Infect Dis 2013. Correlaciona con curación al día 10 y recaída.'],
      },
      // -------- Martin LDL --------
      {
          id: 'martin-ldl',
          name: 'LDL de Martin-Hopkins',
          shortName: 'LDL Martin',
          description: 'Alternativa a Friedewald: usa relación TG/VLDL ajustada por franja de triglicéridos.',
          category: CAT_FORM,
          specialty: MED,
          inputs: [
              { id: 'colTotal', type: 'number', label: 'Colesterol total (mg/dL)' },
              { id: 'hdl', type: 'number', label: 'HDL (mg/dL)' },
              { id: 'trigliceridos', type: 'number', label: 'Triglicéridos (mg/dL)' },
          ],
          compute: (v) => {
              const ct = Number(v.colTotal);
              const hdl = Number(v.hdl);
              const tg = Number(v.trigliceridos);
              if (!ct || !hdl || !tg)
                  return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' };
              if (tg >= 400)
                  return { main: '—', interpretation: 'Con TG ≥ 400 mg/dL no se recomienda estimar el LDL: solicitar LDL directo.', level: 'warn' };
              // Tabla 180-celdas de Martin: aproximación por franjas
              const noHDL = ct - hdl;
              const franjas = [
                  // [minTG, maxTG, ratios por bandas de no-HDL: <100, 100-129, 130-159, 160-189, 190-219, ≥220]
                  [0, 49, [3.5, 3.4, 3.3, 3.3, 3.2, 3.1]],
                  [50, 69, [4.0, 3.9, 3.7, 3.6, 3.5, 3.4]],
                  [70, 99, [4.3, 4.2, 4.0, 3.9, 3.8, 3.7]],
                  [100, 129, [4.9, 4.6, 4.4, 4.2, 4.1, 4.0]],
                  [130, 159, [5.4, 5.0, 4.8, 4.6, 4.5, 4.4]],
                  [160, 199, [6.2, 5.5, 5.2, 5.0, 4.8, 4.7]],
                  [200, 249, [7.2, 6.2, 5.7, 5.5, 5.3, 5.2]],
                  [250, 299, [8.5, 6.8, 6.3, 6.0, 5.8, 5.6]],
                  [300, 399, [10.6, 8.0, 7.2, 6.8, 6.5, 6.4]],
              ];
              const banda = noHDL < 100 ? 0 : noHDL < 130 ? 1 : noHDL < 160 ? 2 : noHDL < 190 ? 3 : noHDL < 220 ? 4 : 5;
              const franja = franjas.find(([lo, hi]) => tg >= lo && tg <= hi) || franjas[franjas.length - 1];
              const ratio = franja[2][banda];
              const ldl = ct - hdl - tg / ratio;
              return {
                  main: fmt(ldl, 0),
                  mainUnit: 'mg/dL',
                  interpretation: `no-HDL ${fmt(noHDL, 0)} · TG/VLDL ratio ${ratio}. Más preciso que Friedewald cuando TG 150–400 mg/dL.`,
                  level: 'ok',
              };
          },
          notes: ['Martin SS. JAMA 2013 (180-cell table). Recomendado por AHA/ACC 2018 sobre Friedewald.'],
      },
      // -------- Mentzer --------
      {
          id: 'mentzer',
          name: 'Índice de Mentzer',
          shortName: 'Mentzer',
          description: 'Distingue β-talasemia menor de ferropenia en microcitosis.',
          category: CAT_HEMAT,
          specialty: MED,
          inputs: [
              { id: 'vcm', type: 'number', label: 'VCM (fL)' },
              { id: 'hematies', type: 'number', label: 'Hematíes (×10¹²/L)' },
          ],
          compute: (v) => {
              const vcm = Number(v.vcm);
              const rbc = Number(v.hematies);
              if (!vcm || !rbc)
                  return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' };
              const idx = vcm / rbc;
              const tal = idx < 13;
              return {
                  main: fmt(idx, 1),
                  mainUnit: 'VCM/RBC',
                  interpretation: tal
                      ? 'Índice < 13: sugiere β-talasemia menor (hematíes conservados). Solicitar Hb A₂.'
                      : 'Índice > 13: sugiere ferropenia. Completar perfil férrico.',
                  level: 'info',
              };
          },
          notes: ['Mentzer WC. Lancet 1973. Sensibilidad ~ 80 % — no sustituye a la HPLC en talasemia.'],
      },
      // -------- RFM --------
      {
          id: 'rfm',
          name: 'RFM — Relative Fat Mass',
          shortName: 'RFM',
          description: 'Estima el % de grasa corporal a partir de la relación altura/perímetro de cintura.',
          category: CAT_MED,
          specialty: MED,
          inputs: [
              { id: 'altura', type: 'number', label: 'Altura (cm)' },
              { id: 'cintura', type: 'number', label: 'Perímetro abdominal (cm)' },
              { id: 'sexo', type: 'select', label: 'Sexo', options: [
                      { label: 'Hombre', value: 0 }, { label: 'Mujer', value: 1 },
                  ] },
          ],
          compute: (v) => {
              const h = Number(v.altura);
              const c = Number(v.cintura);
              if (!h || !c)
                  return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' };
              const base = v.sexo === 1 ? 76 : 64;
              const rfm = base - 20 * (h / c);
              const obesidad = v.sexo === 1 ? rfm >= 35 : rfm >= 25;
              return {
                  main: fmt(rfm, 1),
                  mainUnit: '% grasa',
                  interpretation: obesidad
                      ? 'Compatible con obesidad según % grasa (≥ 25 % en hombres, ≥ 35 % en mujeres).'
                      : 'Dentro del rango no-obeso por % de grasa.',
                  level: obesidad ? 'warn' : 'ok',
              };
          },
          notes: ['Woolcott OO. Sci Rep 2018. Menos sesgo que el IMC para estimar grasa corporal.'],
      },
      // -------- IMPEDE-VTE --------
      {
          id: 'impede-vte',
          name: 'IMPEDE-VTE — TEV en mieloma múltiple',
          shortName: 'IMPEDE-VTE',
          description: 'Riesgo de tromboembolismo venoso en pacientes con mieloma múltiple.',
          category: CAT_TEV,
          specialty: MED,
          inputs: [
              { id: 'imid', type: 'select', label: 'IMID (talidomida/lenalidomida/pomalidomida)', options: [
                      { label: '0 — No', value: 0 },
                      { label: '4 — Sí', value: 4 },
                  ] },
              { id: 'imcAlto', type: 'boolean', label: 'IMC ≥ 25 kg/m² (+1)' },
              { id: 'fracturaPelvis', type: 'boolean', label: 'Fractura pélvica, cadera o fémur (+4)' },
              { id: 'epo', type: 'boolean', label: 'Uso de eritropoyetina (+1)' },
              { id: 'doxo', type: 'boolean', label: 'Doxorrubicina (+3)' },
              { id: 'dexoAlta', type: 'select', label: 'Dexametasona semanal', options: [
                      { label: '0 — No', value: 0 },
                      { label: '2 — Dosis estándar', value: 2 },
                      { label: '4 — Dosis alta (> 160 mg/mes)', value: 4 },
                  ] },
              { id: 'tevPrevio', type: 'boolean', label: 'Antecedente de TEV (+5)' },
              { id: 'trombofilia', type: 'boolean', label: 'Trombofilia conocida (+3)' },
              { id: 'cvc', type: 'boolean', label: 'Catéter venoso central o vía tunelizada (+2)' },
              { id: 'profilaxis', type: 'select', label: 'Profilaxis antitrombótica', options: [
                      { label: '0 — Sin profilaxis', value: 0 },
                      { label: '-3 — AAS profiláctico', value: -3 },
                      { label: '-4 — HBPM o anticoagulación completa', value: -4 },
                  ] },
          ],
          compute: (v) => {
              const total = S([
                  v.imid, v.imcAlto, v.fracturaPelvis ? 4 : 0, v.epo, v.doxo ? 3 : 0, v.dexoAlta,
                  v.tevPrevio ? 5 : 0, v.trombofilia ? 3 : 0, v.cvc ? 2 : 0, v.profilaxis,
              ]);
              let level = 'ok';
              let sub = 'Riesgo bajo (≤ 3): sin profilaxis específica.';
              if (total >= 8) {
                  level = 'danger';
                  sub = 'Alto riesgo (≥ 8): profilaxis con HBPM o DOAC durante el ciclo.';
              }
              else if (total >= 4) {
                  level = 'warn';
                  sub = 'Riesgo intermedio (4–7): profilaxis con AAS o HBPM según guías.';
              }
              return { main: fmt(total), mainUnit: 'puntos', interpretation: sub, level };
          },
          notes: ['Sanfilippo KM. Am J Hematol 2019. IMWG y NCCN recomiendan profilaxis desde riesgo intermedio.'],
      },
      // -------- ORT-OUD --------
      {
          id: 'ort-oud',
          name: 'ORT-OUD — riesgo de trastorno por opioides',
          shortName: 'ORT-OUD',
          description: 'Versión actualizada del Opioid Risk Tool. Predice trastorno por uso de opioides antes de prescripciones prolongadas.',
          category: CAT_TOX,
          specialty: MED,
          inputs: [
              { id: 'afAlcohol', type: 'boolean', label: 'Antecedente familiar de abuso de alcohol' },
              { id: 'afIlegal', type: 'boolean', label: 'Antecedente familiar de abuso de drogas ilegales' },
              { id: 'apAlcohol', type: 'boolean', label: 'Antecedente personal de abuso de alcohol' },
              { id: 'apIlegal', type: 'boolean', label: 'Antecedente personal de abuso de drogas ilegales' },
              { id: 'apReceta', type: 'boolean', label: 'Antecedente personal de abuso de fármacos con receta' },
              { id: 'edadJoven', type: 'boolean', label: 'Edad 16–45 años' },
              { id: 'psq', type: 'boolean', label: 'Trastorno psiquiátrico (depresión, TDAH, TOC, bipolar, esquizofrenia)' },
          ],
          compute: (v) => {
              const total = S([v.afAlcohol, v.afIlegal, v.apAlcohol, v.apIlegal, v.apReceta, v.edadJoven, v.psq]);
              let level = 'ok';
              let sub = 'Riesgo bajo (0–2).';
              if (total >= 4) {
                  level = 'danger';
                  sub = 'Riesgo alto (≥ 4): considerar alternativas no opioides y consultar con especialista en dolor/adicciones.';
              }
              else if (total === 3) {
                  level = 'warn';
                  sub = 'Riesgo moderado (3): consentimiento, monitorización con acuerdo terapéutico y análisis de orina.';
              }
              return { main: fmt(total), mainUnit: 'puntos (0–7)', interpretation: sub, level };
          },
          notes: ['Cheatle MD. J Pain 2019 (ORT-OUD, versión revisada sin sesgo de sexo). Instrumento de cribado, no diagnóstico.'],
      },
      // -------- MDQ bipolar --------
      {
          id: 'mdq',
          name: 'MDQ — cribado de trastorno bipolar',
          shortName: 'MDQ',
          description: 'Mood Disorder Questionnaire para episodios hipomaníacos/maniacos previos.',
          category: CAT_SALUD_MENTAL,
          specialty: MED,
          inputs: [
              { id: 'sintomas', type: 'select', label: '¿Cuántos de los 13 síntomas típicos ha presentado alguna vez?', options: Array.from({ length: 14 }, (_, i) => ({ label: `${i} síntomas`, value: i })) },
              { id: 'simultaneo', type: 'boolean', label: '¿Varios de esos síntomas ocurrieron al mismo tiempo?' },
              { id: 'problemas', type: 'select', label: 'Grado de problemas que le causaron', options: [
                      { label: 'Sin problemas', value: 0 },
                      { label: 'Menores', value: 0 },
                      { label: 'Moderados', value: 1 },
                      { label: 'Graves', value: 1 },
                  ] },
          ],
          compute: (v) => {
              const sint = Number(v.sintomas || 0);
              const positivo = sint >= 7 && v.simultaneo === 1 && v.problemas === 1;
              return {
                  main: positivo ? 'MDQ positivo' : 'MDQ negativo',
                  interpretation: positivo
                      ? '≥ 7 síntomas + simultáneos + problemas moderados/graves: valoración por psiquiatría para descartar bipolaridad.'
                      : 'No cumple criterios para cribado positivo.',
                  level: positivo ? 'warn' : 'ok',
              };
          },
          notes: ['Hirschfeld RM. Am J Psychiatry 2000. Sensibilidad ~ 73 %, especificidad 90 %. Complementar con entrevista clínica.'],
      },
      // -------- Paxlovid --------
      {
          id: 'paxlovid',
          name: 'Indicación de Paxlovid (nirmatrelvir/ritonavir)',
          shortName: 'Paxlovid',
          description: 'Elegibilidad de nirmatrelvir/ritonavir para COVID-19 en adultos no hospitalizados.',
          category: CAT_INFEC,
          specialty: MED,
          inputs: [
              { id: 'sintomas', type: 'boolean', label: 'Inicio de síntomas hace ≤ 5 días' },
              { id: 'noHosp', type: 'boolean', label: 'No requiere hospitalización por COVID-19' },
              { id: 'riesgo', type: 'boolean', label: 'Al menos un factor de riesgo (edad ≥ 60, obesidad, diabetes, ERC, EPOC, cardiopatía, inmunodepresión)' },
              { id: 'tfg', type: 'number', label: 'TFG estimada (mL/min/1,73 m²)' },
              { id: 'child', type: 'select', label: 'Función hepática', options: [
                      { label: 'Normal o Child-Pugh A', value: 0 },
                      { label: 'Child-Pugh B', value: 1 },
                      { label: 'Child-Pugh C', value: 2 },
                  ] },
              { id: 'interacciones', type: 'boolean', label: 'Fármacos contraindicados: rifampicina, carbamazepina, fenobarbital, hierba de San Juan, dronedarona, midazolam oral, alfuzosina, etc.' },
          ],
          compute: (v) => {
              if (v.interacciones === 1)
                  return { main: 'CONTRAINDICADO', interpretation: 'Interacciones graves con inhibición de CYP3A. Elegir alternativa (remdesivir).', level: 'danger' };
              if (v.child === 2)
                  return { main: 'CONTRAINDICADO', interpretation: 'Child-Pugh C: no usar.', level: 'danger' };
              const tfg = Number(v.tfg);
              if (tfg && tfg < 30)
                  return { main: 'No recomendado', interpretation: 'TFG < 30 mL/min/1,73 m²: no usar Paxlovid. Considerar remdesivir.', level: 'danger' };
              if (!v.sintomas || !v.noHosp || !v.riesgo)
                  return { main: 'No indicado', interpretation: 'No cumple los tres criterios: síntomas ≤ 5 días, ambulatorio y factor de riesgo.', level: 'info' };
              const ajuste = tfg && tfg < 60;
              return {
                  main: 'Indicado',
                  interpretation: ajuste
                      ? 'Ajuste de dosis (TFG 30–60): nirmatrelvir 150 mg + ritonavir 100 mg/12 h × 5 días.'
                      : 'Dosis estándar: nirmatrelvir 300 mg + ritonavir 100 mg/12 h × 5 días. Revisar interacciones.',
                  level: ajuste ? 'warn' : 'ok',
              };
          },
          notes: ['FDA/AEMPS ficha técnica 2024. Iniciar en ≤ 5 días desde el inicio de síntomas. Consultar Liverpool COVID-19 Drug Interactions.'],
      },
      // -------- NAC Rumack-Matthew --------
      {
          id: 'nac-paracetamol',
          name: 'N-acetilcisteína en intoxicación por paracetamol',
          shortName: 'NAC paracetamol',
          description: 'Necesidad y dosificación de N-acetilcisteína (Prescott) según niveles y horas.',
          category: CAT_TOX,
          specialty: URG,
          inputs: [
              { id: 'horas', type: 'number', label: 'Horas desde la ingesta' },
              { id: 'paracetamol', type: 'number', label: 'Paracetamol sérico (µg/mL)' },
              { id: 'peso', type: 'number', label: 'Peso (kg)' },
              { id: 'liberacionSostenida', type: 'boolean', label: 'Formulación de liberación sostenida o ingesta múltiple' },
          ],
          compute: (v) => {
              const h = Number(v.horas);
              const p = Number(v.paracetamol);
              const kg = Number(v.peso);
              if (!h || !p || !kg)
                  return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' };
              if (h < 4)
                  return { main: 'Repetir nivel a las 4 h', interpretation: 'La nomograma no es aplicable antes de las 4 h.', level: 'info' };
              // Rumack-Matthew: línea de tratamiento = 150 µg/mL a las 4 h, semivida 4 h → nivel_umbral = 150 * 0.5^((h-4)/4)
              const umbral = 150 * Math.pow(0.5, (h - 4) / 4);
              const tratar = p >= umbral || v.liberacionSostenida === 1 || h > 24;
              const carga = Math.min(kg, 100) * 150;
              const dosis2 = Math.min(kg, 100) * 50;
              const dosis3 = Math.min(kg, 100) * 100;
              return {
                  main: tratar ? 'Iniciar NAC IV' : 'NAC NO indicada',
                  mainUnit: `umbral ${fmt(umbral, 0)} µg/mL`,
                  interpretation: tratar
                      ? `Régimen Prescott 21 h (peso máx. 100 kg): ${fmt(carga, 0)} mg en 200 mL en 60 min → ${fmt(dosis2, 0)} mg en 500 mL en 4 h → ${fmt(dosis3, 0)} mg en 1 000 mL en 16 h.`
                      : `Nivel ${p} µg/mL < línea de tratamiento (${fmt(umbral, 0)}). Reevaluar clínica y transaminasas.`,
                  level: tratar ? 'danger' : 'ok',
              };
          },
          notes: ['Prescott LF 1979; Rumack BH 1975. En Reino Unido se usa una línea única a 100 µg/mL (SNAP 12 h). Iniciar sin esperar niveles si ingesta > 150 mg/kg o desconocida.'],
          references: ['AEMPS: N-acetilcisteína, ficha técnica · https://cima.aemps.es'],
      },
  ];
    return primaryCare;
  })();

  // inurse-m2/src/calculators/family-practice.ts
  var familyPractice = (function () {
  const CAT_SM = 'Geriatría, fragilidad y salud mental';
  const CAT_MED = 'Medicina interna y familiar';
  const CAT_GO = 'Obstetricia y ginecología';
  const CAT_TEV = 'Tromboembolismo venoso';
  const CAT_ENDO = 'Endocrino, obesidad y diabetes';
  const CAT_RIESGO = 'Riesgo perioperatorio';
  const CAT_SCA = 'Síndrome coronario agudo y dolor torácico';
  const CAT_SINCOPE = 'Síncope';
  const CAT_FORM = 'Fórmulas y cálculos clínicos';
  const MED = ['Medicina Familiar'];
  var familyPractice = [
      // -------- EPDS --------
      {
          id: 'epds',
          name: 'EPDS — Escala de Depresión Posnatal de Edimburgo',
          shortName: 'EPDS',
          description: 'Cribado de depresión posparto y del embarazo (10 ítems, últimos 7 días).',
          category: CAT_GO,
          specialty: MED,
          inputs: [
              { id: 'q1', type: 'select', label: '1. He sido capaz de reírme y ver el lado divertido de las cosas', options: [
                      { label: '0 — Tanto como siempre', value: 0 },
                      { label: '1 — No tanto ahora', value: 1 },
                      { label: '2 — Mucho menos ahora', value: 2 },
                      { label: '3 — Nada en absoluto', value: 3 },
                  ] },
              { id: 'q2', type: 'select', label: '2. He mirado el futuro con ilusión', options: [
                      { label: '0 — Tanto como siempre', value: 0 },
                      { label: '1 — Menos que antes', value: 1 },
                      { label: '2 — Mucho menos que antes', value: 2 },
                      { label: '3 — Casi nada', value: 3 },
                  ] },
              { id: 'q3', type: 'select', label: '3. Me he culpado innecesariamente cuando las cosas iban mal', options: [
                      { label: '0 — Nunca', value: 0 },
                      { label: '1 — Casi nunca', value: 1 },
                      { label: '2 — Sí, algunas veces', value: 2 },
                      { label: '3 — Sí, la mayor parte del tiempo', value: 3 },
                  ] },
              { id: 'q4', type: 'select', label: '4. He estado ansiosa o preocupada sin motivo', options: [
                      { label: '0 — Nunca', value: 0 },
                      { label: '1 — Casi nunca', value: 1 },
                      { label: '2 — Sí, a veces', value: 2 },
                      { label: '3 — Sí, muy a menudo', value: 3 },
                  ] },
              { id: 'q5', type: 'select', label: '5. He sentido miedo o pánico sin motivo', options: [
                      { label: '0 — Nunca', value: 0 },
                      { label: '1 — No, no mucho', value: 1 },
                      { label: '2 — Sí, a veces', value: 2 },
                      { label: '3 — Sí, con bastante frecuencia', value: 3 },
                  ] },
              { id: 'q6', type: 'select', label: '6. Las cosas me han estado abrumando', options: [
                      { label: '0 — Nunca; he manejado todo bien', value: 0 },
                      { label: '1 — Casi nunca', value: 1 },
                      { label: '2 — Sí, a veces no he podido manejar tan bien como siempre', value: 2 },
                      { label: '3 — Sí, la mayor parte del tiempo no he podido manejar nada', value: 3 },
                  ] },
              { id: 'q7', type: 'select', label: '7. He estado tan infeliz que he tenido dificultad para dormir', options: [
                      { label: '0 — Nunca', value: 0 },
                      { label: '1 — Casi nunca', value: 1 },
                      { label: '2 — Sí, a veces', value: 2 },
                      { label: '3 — Sí, la mayor parte del tiempo', value: 3 },
                  ] },
              { id: 'q8', type: 'select', label: '8. Me he sentido triste o desgraciada', options: [
                      { label: '0 — Nunca', value: 0 },
                      { label: '1 — Casi nunca', value: 1 },
                      { label: '2 — Sí, a veces', value: 2 },
                      { label: '3 — Sí, la mayor parte del tiempo', value: 3 },
                  ] },
              { id: 'q9', type: 'select', label: '9. He estado tan infeliz que he estado llorando', options: [
                      { label: '0 — Nunca', value: 0 },
                      { label: '1 — Solo ocasionalmente', value: 1 },
                      { label: '2 — Sí, con bastante frecuencia', value: 2 },
                      { label: '3 — Sí, la mayor parte del tiempo', value: 3 },
                  ] },
              { id: 'q10', type: 'select', label: '10. Se me ha ocurrido la idea de hacerme daño', options: [
                      { label: '0 — Nunca', value: 0 },
                      { label: '1 — Casi nunca', value: 1 },
                      { label: '2 — A veces', value: 2 },
                      { label: '3 — Sí, con bastante frecuencia', value: 3 },
                  ] },
          ],
          compute: (v) => {
              const total = sum(v, ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10']);
              const ideacion = (v.q10 ?? 0) > 0;
              let level = 'ok';
              let sub = 'Cribado negativo (< 10).';
              if (total >= 13) {
                  level = 'danger';
                  sub = 'Probable depresión posparto (≥ 13): valoración especializada.';
              }
              else if (total >= 10) {
                  level = 'warn';
                  sub = 'Posible depresión posparto (10–12): repetir en 2 semanas y valorar.';
              }
              return {
                  main: fmt(total),
                  mainUnit: 'puntos (0–30)',
                  interpretation: (ideacion ? '⚠ Ítem 10 positivo: valorar riesgo suicida siempre. ' : '') + sub,
                  level: ideacion ? 'danger' : level,
              };
          },
          notes: ['Cox JL, Holden JM, Sagovsky R. Br J Psychiatry 1987. Cribado en cualquier momento del embarazo o hasta 12 meses posparto.'],
      },
      // -------- MADRS --------
      {
          id: 'madrs',
          name: 'MADRS — Montgomery-Åsberg Depression Rating Scale',
          shortName: 'MADRS',
          description: 'Gravedad de la depresión en adultos (10 ítems, 0-6 cada uno).',
          category: CAT_SM,
          specialty: MED,
          inputs: [
              'Tristeza aparente', 'Tristeza referida', 'Tensión interna', 'Sueño reducido', 'Apetito reducido', 'Dificultad de concentración', 'Lasitud', 'Incapacidad para sentir', 'Pensamientos pesimistas', 'Pensamientos suicidas'
          ].map((lab, i) => ({
              id: `m${i + 1}`,
              type: 'select',
              label: `${i + 1}. ${lab}`,
              options: [0, 1, 2, 3, 4, 5, 6].map((n) => ({ label: `${n}`, value: n })),
          })),
          compute: (v) => {
              const ids = Array.from({ length: 10 }, (_, i) => `m${i + 1}`);
              const total = sum(v, ids);
              const ideacion = (v.m10 ?? 0) >= 3;
              let level = 'ok';
              let sub = 'Sin depresión o mínima (0–6).';
              if (total >= 35) {
                  level = 'danger';
                  sub = 'Depresión grave (≥ 35).';
              }
              else if (total >= 20) {
                  level = 'warn';
                  sub = 'Depresión moderada (20–34).';
              }
              else if (total >= 7) {
                  level = 'info';
                  sub = 'Depresión leve (7–19).';
              }
              return {
                  main: fmt(total),
                  mainUnit: 'puntos (0–60)',
                  interpretation: (ideacion ? '⚠ Ítem 10 ≥ 3: valorar riesgo suicida. ' : '') + sub,
                  level: ideacion ? 'danger' : level,
              };
          },
          notes: ['Montgomery SA, Åsberg M. Br J Psychiatry 1979. Escala de referencia en ensayos clínicos de depresión mayor.'],
      },
      // -------- C-SSRS simplificado --------
      {
          id: 'c-ssrs',
          name: 'C-SSRS — cribado de ideación y conducta suicida',
          shortName: 'C-SSRS',
          description: 'Versión de cribado (últimos 30 días para ideación; siempre para conducta).',
          category: CAT_SM,
          specialty: MED,
          inputs: [
              { id: 'i1', type: 'boolean', label: '1. ¿Ha deseado estar muerto/a o poder dormirse y no despertar?' },
              { id: 'i2', type: 'boolean', label: '2. ¿Ha tenido pensamientos reales de suicidarse?' },
              { id: 'i3', type: 'boolean', label: '3. ¿Ha pensado en cómo hacerlo (método)?' },
              { id: 'i4', type: 'boolean', label: '4. ¿Ha tenido alguna intención de actuar según estos pensamientos?' },
              { id: 'i5', type: 'boolean', label: '5. ¿Ha comenzado a elaborar un plan específico o lo tiene?' },
              { id: 'c', type: 'boolean', label: '6. En su vida, ¿alguna vez ha hecho algo o preparado algo para acabar con su vida?' },
              { id: 'c3m', type: 'boolean', label: '   ¿Ha ocurrido en los últimos 3 meses?' },
          ],
          compute: (v) => {
              let nivel = 'Sin riesgo detectable';
              let level = 'ok';
              let sub = 'Todos los ítems negativos: no se requiere derivación por conducta suicida.';
              if (v.i1 || v.i2) {
                  level = 'info';
                  nivel = 'Riesgo bajo';
                  sub = 'Ideación pasiva o activa sin plan: evaluar factores de riesgo y proteger acceso a medios.';
              }
              if (v.i3) {
                  level = 'warn';
                  nivel = 'Riesgo moderado';
                  sub = 'Ideación con método considerado: valoración por salud mental de forma preferente.';
              }
              if (v.i4 || v.i5) {
                  level = 'danger';
                  nivel = 'Riesgo alto';
                  sub = 'Intención o plan específico: derivación urgente y seguridad activa (retirar medios, acompañamiento).';
              }
              if (v.c && v.c3m) {
                  level = 'danger';
                  nivel = 'Riesgo alto (conducta reciente)';
                  sub = 'Conducta suicida en los últimos 3 meses: derivación urgente y valoración de ingreso.';
              }
              return { main: nivel, interpretation: sub, level };
          },
          notes: ['Posner K. Am J Psychiatry 2011. La respuesta positiva a los ítems 4, 5 o a la conducta reciente exige actuación urgente.'],
      },
      // -------- HITS --------
      {
          id: 'hits',
          name: 'HITS — cribado de violencia de pareja',
          shortName: 'HITS',
          description: 'Cuatro preguntas sobre golpes, insultos, amenazas y gritos en el último año.',
          category: CAT_MED,
          specialty: MED,
          inputs: [
              { id: 'h', type: 'select', label: 'Su pareja le ha pegado físicamente (H)', options: [
                      { label: '1 — Nunca', value: 1 },
                      { label: '2 — Raras veces', value: 2 },
                      { label: '3 — A veces', value: 3 },
                      { label: '4 — Con frecuencia', value: 4 },
                      { label: '5 — Muy a menudo', value: 5 },
                  ] },
              { id: 'i', type: 'select', label: 'Le ha insultado o hablado despectivamente (I)', options: [
                      { label: '1 — Nunca', value: 1 },
                      { label: '2 — Raras veces', value: 2 },
                      { label: '3 — A veces', value: 3 },
                      { label: '4 — Con frecuencia', value: 4 },
                      { label: '5 — Muy a menudo', value: 5 },
                  ] },
              { id: 't', type: 'select', label: 'La ha amenazado con hacerle daño (T)', options: [
                      { label: '1 — Nunca', value: 1 },
                      { label: '2 — Raras veces', value: 2 },
                      { label: '3 — A veces', value: 3 },
                      { label: '4 — Con frecuencia', value: 4 },
                      { label: '5 — Muy a menudo', value: 5 },
                  ] },
              { id: 's', type: 'select', label: 'Le ha gritado o maldecido (S)', options: [
                      { label: '1 — Nunca', value: 1 },
                      { label: '2 — Raras veces', value: 2 },
                      { label: '3 — A veces', value: 3 },
                      { label: '4 — Con frecuencia', value: 4 },
                      { label: '5 — Muy a menudo', value: 5 },
                  ] },
          ],
          compute: (v) => {
              const total = sum(v, ['h', 'i', 't', 's']);
              const positivo = total >= 11;
              return {
                  main: fmt(total),
                  mainUnit: 'puntos (4–20)',
                  interpretation: positivo
                      ? 'Cribado positivo (≥ 11): valorar violencia de pareja, seguridad y ofrecer recursos.'
                      : 'Cribado negativo.',
                  level: positivo ? 'warn' : 'ok',
              };
          },
          notes: ['Sherin KM. Fam Med 1998. Punto de corte ≥ 11 con sensibilidad 96 % y especificidad 91 %.'],
      },
      // -------- AAS --------
      {
          id: 'aas',
          name: 'AAS — Abuse Assessment Screen',
          shortName: 'AAS',
          description: 'Cribado de violencia doméstica, especialmente durante el embarazo.',
          category: CAT_MED,
          specialty: MED,
          inputs: [
              { id: 'ultimoAno', type: 'boolean', label: '¿En el último año ha sido golpeada, abofeteada, pateada o agredida físicamente por alguien?' },
              { id: 'embarazo', type: 'boolean', label: 'Durante el embarazo actual, ¿ha sufrido agresiones físicas?' },
              { id: 'sexual', type: 'boolean', label: '¿En el último año ha sido forzada a mantener relaciones sexuales?' },
              { id: 'miedo', type: 'boolean', label: '¿Tiene miedo de su pareja o de alguien de su entorno?' },
          ],
          compute: (v) => {
              const positivo = v.ultimoAno || v.embarazo || v.sexual || v.miedo;
              return {
                  main: positivo ? 'AAS positivo' : 'AAS negativo',
                  interpretation: positivo
                      ? 'Cualquier respuesta afirmativa activa: valorar seguridad, red de apoyo y recursos legales/sociales.'
                      : 'Sin evidencia actual de violencia doméstica en el cribado.',
                  level: positivo ? 'warn' : 'ok',
              };
          },
          notes: ['McFarlane J. JAMA 1992. Instrumento breve validado; combinar con espacio seguro para preguntar.'],
      },
      // -------- Pack-years --------
      {
          id: 'pack-years',
          name: 'Paquetes-año de tabaco',
          shortName: 'Paquetes-año',
          description: 'Cuantifica el consumo acumulado de tabaco.',
          category: CAT_FORM,
          specialty: MED,
          inputs: [
              { id: 'cigarros', type: 'number', label: 'Cigarrillos por día' },
              { id: 'anios', type: 'number', label: 'Años fumando' },
          ],
          compute: (v) => {
              const c = Number(v.cigarros);
              const a = Number(v.anios);
              if (!c || !a)
                  return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' };
              const pky = (c / 20) * a;
              let level = 'info';
              let sub = 'Consumo cuantificado. Consejo estructurado de deshabituación.';
              if (pky >= 20) {
                  level = 'warn';
                  sub = 'Consumo ≥ 20 paquetes-año: indicación de cribado de cáncer de pulmón con TC de baja dosis (según edad y estado clínico).';
              }
              if (pky >= 30) {
                  level = 'danger';
                  sub = 'Consumo ≥ 30 paquetes-año: cribado firmemente indicado en adultos 50–80 años activos o exfumadores de < 15 años.';
              }
              return { main: fmt(pky, 1), mainUnit: 'paquetes-año', interpretation: sub, level };
          },
          notes: ['USPSTF 2021: cribado de CP con TCBD en 50–80 años, ≥ 20 paquetes-año, fumadores actuales o exfumadores de < 15 años.'],
      },
      // -------- IPSS / AUA-SI --------
      {
          id: 'ipss',
          name: 'IPSS / AUA-SI — síntomas prostáticos',
          shortName: 'IPSS',
          description: 'Siete síntomas urinarios + una pregunta de calidad de vida.',
          category: CAT_MED,
          specialty: MED,
          inputs: [
              'Sensación de vaciado incompleto', 'Frecuencia (< 2 h)', 'Intermitencia', 'Urgencia', 'Chorro débil', 'Esfuerzo para orinar', 'Nocturia (n.º de veces al día)'
          ].map((lab, i) => ({
              id: `q${i + 1}`,
              type: 'select',
              label: `${i + 1}. ${lab}`,
              options: [
                  { label: '0 — Ninguna vez', value: 0 },
                  { label: '1 — Menos de 1 de cada 5', value: 1 },
                  { label: '2 — Menos de la mitad', value: 2 },
                  { label: '3 — La mitad', value: 3 },
                  { label: '4 — Más de la mitad', value: 4 },
                  { label: '5 — Casi siempre', value: 5 },
              ],
          })),
          compute: (v) => {
              const ids = Array.from({ length: 7 }, (_, i) => `q${i + 1}`);
              const total = sum(v, ids);
              let level = 'ok';
              let sub = 'Síntomas leves (0–7).';
              if (total >= 20) {
                  level = 'danger';
                  sub = 'Síntomas graves (20–35): valorar tratamiento y derivación a urología.';
              }
              else if (total >= 8) {
                  level = 'warn';
                  sub = 'Síntomas moderados (8–19): iniciar tratamiento médico.';
              }
              return { main: fmt(total), mainUnit: 'puntos (0–35)', interpretation: sub, level };
          },
          notes: ['Barry MJ. J Urol 1992. Se acompaña de una octava pregunta (calidad de vida 0–6) que no puntúa pero orienta la decisión terapéutica.'],
      },
      // -------- HERDOO2 --------
      {
          id: 'herdoo2',
          name: 'HERDOO2 — suspender anticoagulación tras TEV no provocado (mujeres)',
          shortName: 'HERDOO2',
          description: 'Identifica mujeres con TEV no provocado que pueden suspender la anticoagulación tras la fase inicial.',
          category: CAT_TEV,
          specialty: MED,
          inputs: [
              { id: 'hiperpig', type: 'boolean', label: 'Hiperpigmentación, edema o eritema de la pierna afectada' },
              { id: 'dimero', type: 'boolean', label: 'Dímero-D ≥ 250 µg/L (con anticoagulación activa)' },
              { id: 'imc', type: 'boolean', label: 'IMC ≥ 30 kg/m²' },
              { id: 'edad', type: 'boolean', label: 'Edad ≥ 65 años' },
          ],
          compute: (v) => {
              const total = sum(v, ['hiperpig', 'dimero', 'imc', 'edad']);
              const suspender = total <= 1;
              return {
                  main: fmt(total),
                  mainUnit: 'puntos (0–4)',
                  interpretation: suspender
                      ? 'Riesgo bajo (≤ 1): puede considerarse suspender anticoagulación (recurrencia anual ~ 3 %).'
                      : 'Riesgo alto (≥ 2): mantener anticoagulación (recurrencia anual ~ 8 %).',
                  level: suspender ? 'ok' : 'warn',
              };
          },
          notes: ['Rodger MA. BMJ 2017 (validación REVERSE II). Solo aplicable en mujeres tras 5–12 meses de anticoagulación por TEV no provocado.'],
      },
      // -------- Dutch FH --------
      {
          id: 'dutch-fh',
          name: 'Criterios Dutch Lipid Clinic (hipercolesterolemia familiar)',
          shortName: 'Dutch FH',
          description: 'Diagnóstico clínico de hipercolesterolemia familiar (HF) en adultos.',
          category: CAT_MED,
          specialty: MED,
          inputs: [
              { id: 'af1', type: 'boolean', label: 'Familiar de 1er grado con enfermedad coronaria/vascular prematura o LDL > percentil 95', points: 1 },
              { id: 'af2', type: 'boolean', label: 'Familiar de 1er grado con xantomas tendinosos o arco corneal o LDL > percentil 95 (edad < 18 años)', points: 2 },
              { id: 'ap1', type: 'boolean', label: 'Paciente con enfermedad coronaria prematura (< 55 años H / < 60 años M)', points: 2 },
              { id: 'ap2', type: 'boolean', label: 'Paciente con enfermedad vascular cerebral/periférica prematura', points: 1 },
              { id: 'xantoma', type: 'boolean', label: 'Xantomas tendinosos', points: 6 },
              { id: 'arco', type: 'boolean', label: 'Arco corneal antes de los 45 años', points: 4 },
              { id: 'ldl', type: 'select', label: 'LDL colesterol (mg/dL)', options: [
                      { label: '0 — < 155', value: 0 },
                      { label: '1 — 155–189', value: 1 },
                      { label: '3 — 190–249', value: 3 },
                      { label: '5 — 250–329', value: 5 },
                      { label: '8 — ≥ 330', value: 8 },
                  ] },
              { id: 'mutacion', type: 'boolean', label: 'Mutación funcional documentada (LDLR, ApoB, PCSK9)', points: 8 },
          ],
          compute: (v) => {
              const total = sum(v, ['af1', 'af2', 'ap1', 'ap2', 'xantoma', 'arco', 'ldl', 'mutacion']);
              let dx = 'Diagnóstico improbable (< 3).';
              let level = 'ok';
              if (total > 8) {
                  dx = 'Diagnóstico definitivo (> 8): manejo especializado de HF.';
                  level = 'danger';
              }
              else if (total >= 6) {
                  dx = 'Diagnóstico probable (6–8): tratamiento con estatinas de alta intensidad y estudio familiar.';
                  level = 'warn';
              }
              else if (total >= 3) {
                  dx = 'Diagnóstico posible (3–5): valorar cribado familiar.';
                  level = 'info';
              }
              return { main: fmt(total), mainUnit: 'puntos', interpretation: dx, level };
          },
          notes: ['Dutch Lipid Clinic Network 1999. Criterios recomendados por ESC/EAS para el diagnóstico clínico de HF.'],
      },
      // -------- Gupta neumonía --------
      {
          id: 'gupta-neumonia',
          name: 'Gupta — riesgo de neumonía postoperatoria',
          shortName: 'Gupta neumonía',
          description: 'Predice el riesgo de neumonía en los 30 días tras cirugía no cardíaca.',
          category: CAT_RIESGO,
          specialty: MED,
          inputs: [
              { id: 'edad', type: 'number', label: 'Edad (años)' },
              { id: 'copd', type: 'boolean', label: 'EPOC' },
              { id: 'tabaco', type: 'boolean', label: 'Fumador activo' },
              { id: 'sepsis', type: 'select', label: 'Estado séptico preoperatorio', options: [
                      { label: '−0,72 — Ninguno', value: -0.72 },
                      { label: '0 — SIRS', value: 0 },
                      { label: '+0,42 — Sepsis', value: 0.42 },
                      { label: '+1,25 — Shock séptico', value: 1.25 },
                  ] },
              { id: 'clase', type: 'select', label: 'Clase funcional', options: [
                      { label: '−0,29 — Independiente', value: -0.29 },
                      { label: '+0,49 — Parcialmente dependiente', value: 0.49 },
                      { label: '+1,26 — Totalmente dependiente', value: 1.26 },
                  ] },
              { id: 'asa', type: 'select', label: 'Clasificación ASA', options: [
                      { label: '−3 — ASA I', value: -3 },
                      { label: '−1,8 — ASA II', value: -1.8 },
                      { label: '−0,9 — ASA III', value: -0.9 },
                      { label: '0 — ASA IV', value: 0 },
                      { label: '+0,65 — ASA V', value: 0.65 },
                  ] },
              { id: 'cirugia', type: 'select', label: 'Tipo de cirugía (riesgo)', options: [
                      { label: '−1,3 — Piel/anorrectal/mama/ginecológica', value: -1.3 },
                      { label: '−0,7 — Otros de riesgo bajo', value: -0.7 },
                      { label: '0 — Neurocirugía / abdominal', value: 0 },
                      { label: '+0,6 — Vascular / ORL', value: 0.6 },
                      { label: '+1 — Torácica / esofágica', value: 1 },
                  ] },
          ],
          compute: (v) => {
              const edad = Number(v.edad) || 0;
              const x = -2.8977 + 0.0144 * edad + 0.7241 * (v.copd ? 1 : 0) + 0.3225 * (v.tabaco ? 1 : 0) + Number(v.sepsis || 0) + Number(v.clase || 0) + Number(v.asa || 0) + Number(v.cirugia || 0);
              const p = 100 / (1 + Math.exp(-x));
              let level = 'ok';
              if (p >= 5)
                  level = 'danger';
              else if (p >= 2)
                  level = 'warn';
              else if (p >= 1)
                  level = 'info';
              return {
                  main: fmt(p, 2),
                  mainUnit: '% neumonía a 30 días',
                  interpretation: 'Optimizar función pulmonar, cesación tabáquica, fisioterapia respiratoria si riesgo elevado.',
                  level,
              };
          },
          notes: ['Gupta H. Chest 2013 (base ACS-NSQIP). Riesgo global < 1 % en cirugía electiva ambulatoria.'],
      },
      // -------- Gupta insuficiencia respiratoria --------
      {
          id: 'gupta-insufresp',
          name: 'Gupta — riesgo de insuficiencia respiratoria postoperatoria',
          shortName: 'Gupta IRA',
          description: 'Predice ventilación mecánica > 48 h o reintubación en los 30 días.',
          category: CAT_RIESGO,
          specialty: MED,
          inputs: [
              { id: 'clase', type: 'select', label: 'Clase funcional', options: [
                      { label: '−0,45 — Independiente', value: -0.45 },
                      { label: '+0,77 — Parcial', value: 0.77 },
                      { label: '+1,26 — Total', value: 1.26 },
                  ] },
              { id: 'asa', type: 'select', label: 'ASA', options: [
                      { label: '−3,7 — I', value: -3.7 },
                      { label: '−2,42 — II', value: -2.42 },
                      { label: '−1,56 — III', value: -1.56 },
                      { label: '−0,71 — IV', value: -0.71 },
                      { label: '0 — V', value: 0 },
                  ] },
              { id: 'sepsis', type: 'select', label: 'Estado séptico preoperatorio', options: [
                      { label: '−0,55 — Ninguno', value: -0.55 },
                      { label: '0 — SIRS', value: 0 },
                      { label: '+0,26 — Sepsis', value: 0.26 },
                      { label: '+1,3 — Shock séptico', value: 1.3 },
                  ] },
              { id: 'emergencia', type: 'boolean', label: 'Cirugía urgente/emergente', points: 0 },
              { id: 'cirugia', type: 'select', label: 'Tipo de cirugía', options: [
                      { label: '−1,2 — Piel/anorrectal/mama', value: -1.2 },
                      { label: '−0,4 — Otros de riesgo bajo', value: -0.4 },
                      { label: '0 — Neurocirugía/abdominal', value: 0 },
                      { label: '+0,5 — Vascular/ORL', value: 0.5 },
                      { label: '+1,5 — Torácica/esofágica/aórtica', value: 1.5 },
                  ] },
          ],
          compute: (v) => {
              const x = -1.7397 + Number(v.clase || 0) + Number(v.asa || 0) + Number(v.sepsis || 0) + (v.emergencia ? 0.535 : 0) + Number(v.cirugia || 0);
              const p = 100 / (1 + Math.exp(-x));
              let level = 'ok';
              if (p >= 5)
                  level = 'danger';
              else if (p >= 2)
                  level = 'warn';
              else if (p >= 1)
                  level = 'info';
              return {
                  main: fmt(p, 2),
                  mainUnit: '% IRA postoperatoria',
                  interpretation: 'Considerar VMNI, fisioterapia y protocolos de extubación segura si riesgo elevado.',
                  level,
              };
          },
          notes: ['Gupta H. Mayo Clin Proc 2011.'],
      },
      // -------- Duke treadmill --------
      {
          id: 'duke-treadmill-mf',
          name: 'Puntuación de Duke en ergometría',
          shortName: 'Duke treadmill',
          description: 'Pronóstico coronario tras prueba de esfuerzo estándar (Bruce).',
          category: CAT_SCA,
          specialty: MED,
          inputs: [
              { id: 'minutos', type: 'number', label: 'Duración del ejercicio (minutos)' },
              { id: 'st', type: 'number', label: 'Máxima desviación del ST durante el ejercicio (mm)' },
              { id: 'angina', type: 'select', label: 'Angina durante el ejercicio', options: [
                      { label: '0 — Sin angina', value: 0 },
                      { label: '1 — Angina no limitante', value: 1 },
                      { label: '2 — Angina que obliga a parar', value: 2 },
                  ] },
          ],
          compute: (v) => {
              const t = Number(v.minutos);
              const s = Number(v.st);
              if (isNaN(t) || isNaN(s))
                  return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' };
              const score = t - 5 * s - 4 * Number(v.angina || 0);
              let level = 'ok';
              let sub = 'Riesgo bajo (≥ 5): mortalidad anual < 1 %.';
              if (score <= -11) {
                  level = 'danger';
                  sub = 'Riesgo alto (≤ −11): mortalidad anual > 5 %. Coronariografía.';
              }
              else if (score < 5) {
                  level = 'warn';
                  sub = 'Riesgo intermedio (−10 a 4): mortalidad anual ≈ 2–3 %. Considerar imagen funcional.';
              }
              return { main: fmt(score, 0), mainUnit: 'puntos', interpretation: sub, level };
          },
          notes: ['Mark DB. N Engl J Med 1991. Fórmula: minutos − 5×ST − 4×angina.'],
      },
      // -------- Boston syncope --------
      {
          id: 'boston-sincope',
          name: 'Criterios de síncope de Boston',
          shortName: 'Boston síncope',
          description: 'Identifica pacientes con síncope que requieren ingreso o estudio.',
          category: CAT_SINCOPE,
          specialty: MED,
          inputs: [
              { id: 'sca', type: 'boolean', label: 'Síntomas o signos de síndrome coronario agudo' },
              { id: 'cardio', type: 'boolean', label: 'Antecedente de cardiopatía significativa' },
              { id: 'familia', type: 'boolean', label: 'Antecedentes familiares de muerte súbita' },
              { id: 'ecg', type: 'boolean', label: 'ECG con hallazgos relevantes (BAV, isquemia, QT largo, Brugada, Delta, HVI)' },
              { id: 'esfuerzo', type: 'boolean', label: 'Síncope durante el ejercicio' },
              { id: 'palpit', type: 'boolean', label: 'Palpitaciones antes del síncope' },
              { id: 'hipovol', type: 'boolean', label: 'Signos de hipovolemia o hemorragia (Hb < 9 g/dL, sangrado activo)' },
              { id: 'valvular', type: 'boolean', label: 'Soplo o valvulopatía significativa' },
              { id: 'constantes', type: 'boolean', label: 'Alteración persistente de constantes (bradi < 50, taqui > 100 tras reposo)' },
          ],
          compute: (v) => {
              const ids = ['sca', 'cardio', 'familia', 'ecg', 'esfuerzo', 'palpit', 'hipovol', 'valvular', 'constantes'];
              const total = sum(v, ids);
              const ingreso = total >= 1;
              return {
                  main: ingreso ? 'Ingreso recomendado' : 'Alta segura',
                  interpretation: ingreso
                      ? `${total} criterio(s) positivo(s): monitorización y estudio hospitalario.`
                      : 'Ningún criterio de alto riesgo: síncope de bajo riesgo, alta con seguimiento ambulatorio.',
                  level: ingreso ? 'warn' : 'ok',
              };
          },
          notes: ['Grossman SA. Ann Emerg Med 2007. Sensibilidad 97 % para eventos adversos a 30 días.'],
      },
      // -------- Karter hipoglucemia --------
      {
          id: 'karter-hipoglucemia',
          name: 'Riesgo de hipoglucemia grave (Karter)',
          shortName: 'Karter',
          description: 'Predice hipoglucemia grave en pacientes con diabetes tipo 2 con hospitalización o visita a urgencias en el último año.',
          category: CAT_ENDO,
          specialty: MED,
          inputs: [
              { id: 'hipoPrevia', type: 'select', label: 'Episodios previos de hipoglucemia en el último año', options: [
                      { label: '0', value: 0 },
                      { label: '1–2', value: 1 },
                      { label: '≥ 3', value: 2 },
                  ] },
              { id: 'insulina', type: 'boolean', label: 'Tratamiento con insulina' },
              { id: 'edad', type: 'boolean', label: 'Edad ≥ 77 años' },
              { id: 'erc', type: 'boolean', label: 'ERC (TFG < 60)' },
              { id: 'sulfonilurea', type: 'boolean', label: 'Uso de sulfonilurea' },
              { id: 'urgencias', type: 'boolean', label: 'Visita a urgencias en el último año' },
          ],
          compute: (v) => {
              // Simplificación: cada factor pondera 1; hipoPrevia 0/1/2
              const total = Number(v.hipoPrevia || 0) + sum(v, ['insulina', 'edad', 'erc', 'sulfonilurea', 'urgencias']);
              let categoria = 'Bajo (< 1 %/año).';
              let level = 'ok';
              if (total >= 5) {
                  categoria = 'Alto (> 5 %/año).';
                  level = 'danger';
              }
              else if (total >= 3) {
                  categoria = 'Intermedio (~ 1–5 %/año).';
                  level = 'warn';
              }
              return { main: fmt(total), mainUnit: 'puntos', interpretation: `Riesgo estimado a 12 meses: ${categoria} Ajustar objetivos de HbA1c y priorizar fármacos con bajo riesgo (metformina, iSGLT2, GLP-1).`, level };
          },
          notes: ['Karter AJ. JAMA Intern Med 2017 (modelo original 6 variables). Herramienta simplificada: use la versión completa para decisiones críticas.'],
      },
      // -------- Cambridge diabetes risk --------
      {
          id: 'cambridge-diabetes',
          name: 'Cambridge Diabetes Risk Score',
          shortName: 'Cambridge',
          description: 'Riesgo de diabetes tipo 2 no diagnosticada en adultos.',
          category: CAT_ENDO,
          specialty: MED,
          inputs: [
              { id: 'edad', type: 'number', label: 'Edad (años)' },
              { id: 'sexo', type: 'select', label: 'Sexo', options: [
                      { label: 'Mujer', value: 0 }, { label: 'Hombre', value: 1 },
                  ] },
              { id: 'imc', type: 'number', label: 'IMC (kg/m²)' },
              { id: 'familia', type: 'boolean', label: 'Antecedente familiar de diabetes (padres/hermanos)' },
              { id: 'esteroides', type: 'boolean', label: 'Tratamiento con corticoides orales' },
              { id: 'antihta', type: 'boolean', label: 'Tratamiento antihipertensivo actual' },
              { id: 'fumador', type: 'select', label: 'Tabaco', options: [
                      { label: 'No fumador', value: 0 },
                      { label: 'Exfumador', value: 1 },
                      { label: 'Fumador activo', value: 2 },
                  ] },
          ],
          compute: (v) => {
              const edad = Number(v.edad);
              const imc = Number(v.imc);
              if (!edad || !imc)
                  return { main: 'Completa los campos numéricos para ver el resultado.', interpretation: '' };
              const beta = -6.322 + 0.063 * edad + 0.573 * (v.sexo === 1 ? 1 : 0) + 0.116 * imc + 0.728 * (v.familia ? 1 : 0) + 2.191 * (v.esteroides ? 1 : 0) + 1.222 * (v.antihta ? 1 : 0) + 0.855 * (v.fumador === 2 ? 1 : 0) + 0.221 * (v.fumador === 1 ? 1 : 0);
              const p = 100 / (1 + Math.exp(-beta));
              let level = 'ok';
              let sub = 'Riesgo bajo (< 3 %).';
              if (p >= 15) {
                  level = 'danger';
                  sub = 'Riesgo muy alto (≥ 15 %): glucemia/HbA1c ahora.';
              }
              else if (p >= 8) {
                  level = 'warn';
                  sub = 'Riesgo alto (8–15 %): cribado y consejo intensivo.';
              }
              else if (p >= 3) {
                  level = 'info';
                  sub = 'Riesgo intermedio (3–8 %).';
              }
              return { main: fmt(p, 1), mainUnit: '% probabilidad', interpretation: sub, level };
          },
          notes: ['Griffin SJ. Diabetes Metab Res Rev 2000. Diseñada como cribado no invasivo.'],
      },
  ];
    return familyPractice;
  })();


  // inurse-m2/src/calculators/index.ts
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
    "Neonatología y pediatría",
    "Obstetricia y ginecología",
    "Neurología crítica e ictus",
    "Urgencias y decisión clínica",
    "Medicina interna y familiar",
    "Geriatría, fragilidad y salud mental",
    "Endocrino, obesidad y diabetes",
    "Hepato-digestivo y nutrición",
    "Cirugía cardiotorácica y perioperatorio",
    "Enfermedad pleural",
    "Soporte extracorpóreo",
    "Aorta y grandes vasos",
    "Farmacología y dosificación",
    "Fórmulas y cálculos clínicos"
  ];
  var SPECIALTIES = [
    "Anestesiología",
    "Cardiología",
    "Medicina Intensiva",
    "Farmacia",
    "Pediatría",
    "Cuidados Críticos Neonatales",
    "Neurología crítica",
    "Emergencias",
    "Medicina Familiar",
    "Cirugía Cardiotorácica",
    "Obstetricia"
  ];
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
    ...pediatria,
    ...neuroCritica,
    ...urgencias,
    ...medicinaFamilia,
    ...cardiotoracica,
    ...pediatria2,
    ...primaryCare,
    ...familyPractice,
    ...formulas
  ];
  var CALCULATORS = ALL.map((c) => {
    const extra = EXTRA_SPECIALTIES[c.id];
    return extra ? { ...c, specialty: [.../* @__PURE__ */ new Set([...c.specialty, ...extra])] } : c;
  });

  // entry3.ts
  window.ENFERIX_ESCALAS_DATA = { CATEGORIES, SPECIALTIES, CALCULATORS };
})();
