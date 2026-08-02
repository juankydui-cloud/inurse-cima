import { requestJSON } from "../cache.mjs";
import { searchPubMed } from "./pubmed.mjs";
import { searchCrossref } from "./crossref.mjs";
import { searchNICE } from "./nice.mjs";
import { searchOpenFDA } from "./openfda.mjs";
import { searchClinicalTrials } from "./clinicaltrials.mjs";
import { searchSemanticScholar } from "./semanticscholar.mjs";
import { searchWHO } from "./who.mjs";
import { searchCIMA } from "./cima.mjs";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT = `Eres **Vivi**, la asistente clínica de referencia de iNurse. Tu función es proporcionar respuestas clínicas exhaustivas, basadas en evidencia, al nivel de una herramienta profesional de consulta clínica como UpToDate o Dr.Oracle.

## Principios fundamentales

1. **Responde siempre con profundidad clínica**, independientemente de lo breve o coloquial que sea la pregunta del usuario. Si alguien escribe "neumotórax a tensión", responde como si te hubieran pedido una revisión clínica completa del tema.

2. **Busca siempre en las fuentes disponibles.** Antes de responder cualquier pregunta clínica:
   - Consulta las fichas validadas de iNurse (contenido interno verificado).
   - Integra la evidencia publicada recuperada de PubMed, Crossref y Europe PMC.
   - Consulta las guías NICE (National Institute for Health and Care Excellence) cuando estén disponibles.
   - Consulta los ensayos clínicos activos de ClinicalTrials.gov para evidencia emergente.
   - Consulta papers académicos en Semantic Scholar para perspectiva amplia de la literatura.
   - Consulta documentos de la OMS (WHO IRIS) para recomendaciones internacionales.
   - Si la pregunta involucra fármacos, consulta primero el Vademécum oficial español (CIMA-AEMPS) por ser la fuente autorizada en España; usa la ficha técnica de la FDA (OpenFDA) como complemento cuando aporte algo que CIMA no cubra (p. ej. black box warnings), y el vademécum interno de iNurse.
   - Integra toda la información recuperada en una respuesta cohesionada.

3. **Nunca respondas solo de memoria.** Siempre fundamenta tus afirmaciones en fuentes recuperadas. Si no encuentras evidencia suficiente, indícalo explícitamente.

4. **Ubicación y servicios sanitarios cercanos.** Si el usuario pregunta por el hospital, urgencias o desfibrilador (DEA) más cercano, o "dónde puedo ir": usa ÚNICAMENTE los datos del bloque "SERVICIOS SANITARIOS CERCANOS" si está presente en el contexto (nombre, distancia y cómo llegar reales, nunca inventados). Si ese bloque no está presente, dile al usuario que active la ubicación desde "📍 Servicios sanitarios cercanos" en la app para poder indicárselo con datos reales — nunca inventes hospitales, direcciones ni distancias.

## Estructura de respuesta

Organiza SIEMPRE tu respuesta siguiendo esta estructura narrativa (sin usar estos encabezados literalmente — intégralos de forma natural en un discurso fluido):

### Bloque 1 — Contexto clínico
- Definición y relevancia clínica del tema.
- Epidemiología breve si es pertinente.
- Fisiopatología resumida cuando ayude a entender el manejo.

### Bloque 2 — Presentación clínica
- Signos y síntomas clave.
- Criterios diagnósticos si existen (escalas validadas, clasificaciones).
- Diagnóstico diferencial relevante.

### Bloque 3 — Manejo basado en evidencia
- Evaluación inicial y estabilización.
- Tratamiento de primera línea según guías vigentes.
- Intervenciones de enfermería específicas cuando aplique.
- Monitorización y criterios de alerta.
- Consideraciones especiales (embarazo, pediatría, ancianos, comorbilidades).

### Bloque 4 — Puntos clave para enfermería
- Cuidados de enfermería prioritarios.
- Valoración y vigilancia específica.
- Educación al paciente si aplica.

### Bloque 5 — Referencias
- Lista numerada de todas las fuentes citadas en la respuesta, usando los mismos números [n] del contexto.
- Formato: Autores. Título. Revista. Año;volumen(número):páginas. DOI o PMID.
- Diferencia las fuentes internas de iNurse (marcadas como [iNurse · Ficha validada]) de la literatura externa.
- Incluye siempre al menos 3-5 referencias de literatura publicada cuando estén disponibles.

## Citación en el texto

- Cita cada afirmación clínica relevante con el número entre corchetes que se indica junto a cada fuente en el contexto: [1], [2], [3]... Usa EXACTAMENTE esos números, nunca inventes uno ni reutilices el mismo número para fuentes distintas.
- Si una afirmación proviene de una ficha validada de iNurse, márcala como [iNurse-código] (no un número).
- No hagas afirmaciones clínicas sin respaldo de fuente.

## Tono y estilo

- Profesional pero accesible. Escribe como lo haría un texto de referencia clínica de calidad.
- Usa terminología médica apropiada pero explica conceptos complejos cuando sea necesario.
- Evita respuestas telegráficas o tipo lista de bullets. Desarrolla un discurso clínico completo y cohesionado.
- Responde en el idioma en que te pregunten (castellano o catalán).
- La extensión típica de una respuesta clínica completa debe ser de 800-1500 palabras. No te autocensures por longitud.

## Seguridad

- Recuerda siempre que eres una herramienta de apoyo educativo y de consulta, no un sustituto del juicio clínico profesional.
- Si detectas una situación de emergencia vital en la pregunta, prioriza el manejo inmediato (ABCDE) antes del desarrollo teórico.
- Indica claramente cuando una recomendación tiene nivel de evidencia bajo o se basa en consenso de expertos.
- No inventes datos, bibliografía, dosis, concentraciones ni protocolos. Las dosis documentales deben marcarse para verificación institucional/farmacéutica.`;

const MEDICAL_TERMS = {
  "parada cardiorrespiratoria": "cardiac arrest resuscitation",
  "pcr": "cardiac arrest CPR",
  "rcp": "cardiopulmonary resuscitation",
  "infarto": "myocardial infarction STEMI",
  "ictus": "stroke cerebrovascular",
  "neumotorax": "pneumothorax",
  "sepsis": "sepsis septic shock management",
  "shock": "shock hemodynamic management",
  "arritmia": "arrhythmia cardiac rhythm",
  "taquicardia": "tachycardia SVT management",
  "bradicardia": "bradycardia management pacing",
  "insuficiencia cardiaca": "heart failure management",
  "edema pulmonar": "pulmonary edema acute",
  "tromboembolismo": "thromboembolism pulmonary embolism",
  "tep": "pulmonary embolism PE",
  "tvp": "deep vein thrombosis DVT",
  "hemorragia": "hemorrhage bleeding management",
  "intubacion": "intubation airway management",
  "ventilacion mecanica": "mechanical ventilation",
  "sedacion": "sedation analgesia ICU",
  "dolor": "pain management analgesia",
  "quemadura": "burn management",
  "traumatismo": "trauma management",
  "diabetes": "diabetes mellitus management",
  "hipoglucemia": "hypoglycemia management",
  "cetoacidosis": "diabetic ketoacidosis DKA",
  "hipertension": "hypertension management",
  "crisis hipertensiva": "hypertensive crisis emergency",
  "anafilaxia": "anaphylaxis epinephrine",
  "asma": "asthma exacerbation management",
  "epoc": "COPD exacerbation",
  "neumonia": "pneumonia treatment guidelines",
  "covid": "COVID-19 management",
  "meningitis": "meningitis management",
  "convulsion": "seizure management epilepsy",
  "embarazo": "pregnancy obstetric emergency",
  "eclampsia": "preeclampsia eclampsia",
  "neonato": "neonatal resuscitation",
  "pediatria": "pediatric emergency",
  "politraumatismo": "polytrauma management",
  "fractura": "fracture management orthopedic",
  "intoxicacion": "poisoning toxicology management",
  "sobredosis": "overdose toxicology",
  "reanimacion": "resuscitation guidelines ERC",
  "cateter": "catheter central venous",
  "sonda": "catheterization nursing",
  "ulcera": "pressure ulcer wound care",
  "herida": "wound management nursing",
  "transfusion": "blood transfusion",
  "antibiotico": "antibiotic therapy guidelines",
  "farmaco": "pharmacology drug therapy",
  "dosis": "drug dosing guidelines",
  "perfusion": "infusion pump dosing",
  "electrocardiograma": "electrocardiogram ECG interpretation",
  "ecg": "ECG interpretation cardiology",
  "gasometria": "arterial blood gas ABG",
  "analitica": "laboratory tests clinical",
  "enfermeria": "nursing care clinical",
  "cuidados": "nursing interventions",
  "protocolo": "clinical protocol guideline",
  "guia": "clinical practice guideline"
};

function normalize(text) {
  return text.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ").trim();
}

function generateQueries(question) {
  const norm = normalize(question);
  const queries = [];

  for (const [es, en] of Object.entries(MEDICAL_TERMS)) {
    if (norm.includes(normalize(es))) {
      queries.push(en);
    }
  }

  const words = norm.split(" ").filter(w => w.length > 3);
  if (words.length > 0) {
    queries.push(words.join(" "));
  }

  if (queries.length === 0) {
    queries.push(norm);
  }

  return [...new Set(queries)].slice(0, 3);
}

const DRUG_KEYWORDS = new Set([
  "farmaco", "medicamento", "dosis", "posologia", "antibiotico", "analgesico",
  "antihipertensivo", "anticoagulante", "diuretico", "corticoide", "insulina",
  "perfusion", "infusion", "bolo", "via oral", "via intravenosa", "via subcutanea",
  "interaccion", "contraindicacion", "efecto adverso", "sobredosis", "antidoto"
]);

const DRUG_NAMES = {
  "paracetamol": "acetaminophen", "ibuprofeno": "ibuprofen", "amoxicilina": "amoxicillin",
  "omeprazol": "omeprazole", "metformina": "metformin", "enalapril": "enalapril",
  "losartan": "losartan", "atorvastatina": "atorvastatin", "simvastatina": "simvastatin",
  "amlodipino": "amlodipine", "furosemida": "furosemide", "hidroclorotiazida": "hydrochlorothiazide",
  "warfarina": "warfarin", "heparina": "heparin", "enoxaparina": "enoxaparin",
  "clopidogrel": "clopidogrel", "aspirina": "aspirin", "acido acetilsalicilico": "aspirin",
  "metoprolol": "metoprolol", "atenolol": "atenolol", "bisoprolol": "bisoprolol",
  "propranolol": "propranolol", "digoxina": "digoxin", "amiodarona": "amiodarone",
  "nitroglicerina": "nitroglycerin", "dopamina": "dopamine", "dobutamina": "dobutamine",
  "noradrenalina": "norepinephrine", "adrenalina": "epinephrine",
  "morfina": "morphine", "fentanilo": "fentanyl", "tramadol": "tramadol",
  "metadona": "methadone", "naloxona": "naloxone", "flumazenilo": "flumazenil",
  "midazolam": "midazolam", "diazepam": "diazepam", "lorazepam": "lorazepam",
  "propofol": "propofol", "ketamina": "ketamine", "lidocaina": "lidocaine",
  "atropina": "atropine", "adenosina": "adenosine", "verapamilo": "verapamil",
  "diltiazem": "diltiazem", "captopril": "captopril", "ramipril": "ramipril",
  "espironolactona": "spironolactone", "manitol": "mannitol",
  "dexametasona": "dexamethasone", "prednisona": "prednisone", "prednisolona": "prednisolone",
  "hidrocortisona": "hydrocortisone", "metilprednisolona": "methylprednisolone",
  "salbutamol": "albuterol", "ipratropio": "ipratropium", "budesonida": "budesonide",
  "insulina glargina": "insulin glargine", "insulina lispro": "insulin lispro",
  "metoclopramida": "metoclopramide", "ondansetron": "ondansetron",
  "ciprofloxacino": "ciprofloxacin", "levofloxacino": "levofloxacin",
  "azitromicina": "azithromycin", "claritromicina": "clarithromycin",
  "ceftriaxona": "ceftriaxone", "cefazolina": "cefazolin", "meropenem": "meropenem",
  "vancomicina": "vancomycin", "gentamicina": "gentamicin", "clindamicina": "clindamycin",
  "metronidazol": "metronidazole", "fluconazol": "fluconazole",
  "levotiroxina": "levothyroxine", "cloruro potasico": "potassium chloride",
  "bicarbonato sodico": "sodium bicarbonate", "sulfato magnesio": "magnesium sulfate",
  "gluconato calcio": "calcium gluconate", "alteplasa": "alteplase", "tenecteplasa": "tenecteplase",
  "acido tranexamico": "tranexamic acid", "fitomenadiona": "phytonadione",
  "clexane": "enoxaparin", "nolotil": "metamizole", "metamizol": "metamizole",
  "enantyum": "dexketoprofen", "dexketoprofeno": "dexketoprofen",
  "ventolin": "albuterol", "urbason": "methylprednisolone"
};

function detectDrugName(question) {
  const norm = normalize(question);
  for (const [es, en] of Object.entries(DRUG_NAMES)) {
    if (norm.includes(normalize(es))) return en;
  }
  return null;
}

function isDrugRelated(question) {
  const norm = normalize(question);
  if (detectDrugName(question)) return true;
  for (const kw of DRUG_KEYWORDS) {
    if (norm.includes(normalize(kw))) return true;
  }
  return false;
}

const GUIDELINE_ORGS = [
  '"NICE guideline" OR "National Institute for Health and Care Excellence"',
  '"ESC guideline" OR "European Society of Cardiology"',
  '"ERC guideline" OR "European Resuscitation Council"',
  '"JBI" OR "Joanna Briggs Institute"'
];

async function searchAllSources(question) {
  const queries = generateQueries(question);
  const guidelineQuery = `(${queries[0]}) AND (${GUIDELINE_ORGS.join(" OR ")})`;
  const drugName = detectDrugName(question);
  const drugRelated = isDrugRelated(question);
  // Para CIMA (mercado español) usamos el término original en castellano, no la
  // traducción a inglés de DRUG_NAMES (pensada para PubMed/OpenFDA).
  const cimaQuery = normalize(question).split(" ").filter(w => w.length > 3)[0] || queries[0];

  const searches = [
    searchPubMed(queries[0], { limit: 8 }),
    queries[1] ? searchPubMed(queries[1], { limit: 5 }) : Promise.resolve({ items: [] }),
    searchCrossref(queries[0], { limit: 5 }),
    searchPubMed(guidelineQuery, { limit: 5 }),
    searchNICE(queries[0], { limit: 5 }),
    drugName ? searchOpenFDA(drugName) : Promise.resolve(null),
    searchClinicalTrials(queries[0], { limit: 5 }),
    searchSemanticScholar(queries[0], { limit: 5 }),
    searchWHO(queries[0], { limit: 5 }),
    drugRelated ? searchCIMA(cimaQuery, { limit: 5 }) : Promise.resolve({ items: [] })
  ];

  const [pmcResult, pubmedResult, crossrefResult, guidelineResult, niceResult, fdaResult, ctResult, scholarResult, whoResult, cimaResult] =
    await Promise.allSettled(searches);

  const articles = [];
  const seen = new Set();

  function addUnique(items, sourceLabel) {
    for (const item of items || []) {
      const key = item.doi || item.pmid || item.title;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      articles.push({ ...item, retrievedFrom: sourceLabel });
    }
  }

  if (pmcResult.status === "fulfilled") addUnique(pmcResult.value.items, "PubMed");
  if (pubmedResult.status === "fulfilled") addUnique(pubmedResult.value.items, "PubMed");
  if (crossrefResult.status === "fulfilled") addUnique(crossrefResult.value.items, "Crossref");
  if (guidelineResult.status === "fulfilled") addUnique(guidelineResult.value.items, "Guías internacionales");

  const niceGuidelines = niceResult.status === "fulfilled" ? (niceResult.value?.items || []) : [];
  const fdaDrug = fdaResult.status === "fulfilled" ? fdaResult.value : null;
  const clinicalTrials = ctResult.status === "fulfilled" ? (ctResult.value?.items || []) : [];
  const semanticScholar = scholarResult.status === "fulfilled" ? (scholarResult.value?.items || []) : [];
  const whoDocuments = whoResult.status === "fulfilled" ? (whoResult.value?.items || []) : [];
  const cimaDrugs = cimaResult.status === "fulfilled" ? (cimaResult.value?.items || []) : [];

  const allSettled = [pmcResult, pubmedResult, crossrefResult, guidelineResult, niceResult, fdaResult, ctResult, scholarResult, whoResult, cimaResult];

  return {
    articles: articles.slice(0, 12),
    niceGuidelines: niceGuidelines.slice(0, 5),
    fdaDrug,
    clinicalTrials: clinicalTrials.slice(0, 3),
    semanticScholar: semanticScholar.slice(0, 3),
    whoDocuments: whoDocuments.slice(0, 3),
    cimaDrugs: cimaDrugs.slice(0, 5),
    drugDetected: drugName,
    queries,
    errors: allSettled
      .filter(r => r.status === "rejected")
      .map(r => r.reason?.message || "Error desconocido")
  };
}

// Construye el contexto en texto plano para el prompt de Gemini Y, en paralelo, una
// lista de referencias plana con numeración GLOBAL y secuencial ([1], [2], [3]...)
// que abarca todos los tipos de fuente. Es deliberadamente la misma lista y la misma
// numeración que se envía al frontend (buildSourcesPayload) para que los números que
// Gemini use al citar ([n]) coincidan exactamente con los que el cliente enlaza.
function assembleContext(question, { articles, niceGuidelines, fdaDrug, clinicalTrials, semanticScholar, whoDocuments, cimaDrugs }, clientContext) {
  let ctx = "";
  const refs = [];
  let n = 0;

  if (clientContext?.guides) {
    ctx += "--- FICHAS VALIDADAS DE iNURSE (GUÍAS CLÍNICAS Y VADEMÉCUM) ---\n";
    ctx += clientContext.guides + "\n\n";
  }

  if (clientContext?.library) {
    ctx += "--- BIBLIOTECA VIRTUAL DE iNURSE ---\n";
    ctx += clientContext.library + "\n\n";
  }

  if (clientContext?.nearby) {
    ctx += "--- SERVICIOS SANITARIOS CERCANOS AL USUARIO (OpenStreetMap, ubicación compartida por el propio usuario) ---\n";
    ctx += clientContext.nearby + "\n\n";
  }

  if (articles.length > 0) {
    ctx += "--- LITERATURA RECUPERADA (PubMed + Crossref + Guías internacionales) ---\n";
    articles.forEach(art => {
      const num = ++n;
      const authors = Array.isArray(art.authors) ? art.authors.join(", ") : (art.authors || "");
      const url = art.url || (art.doi ? `https://doi.org/${art.doi}` : "");
      refs.push({ n: num, type: "literature", title: art.title || "", authors, journal: art.journal || art.retrievedFrom || art.source || "", year: art.year || "", doi: art.doi || "", pmid: art.pmid || "", url, source: art.retrievedFrom || art.source || "" });
      ctx += `\n[${num}] ${authors}. ${art.title}. ${art.journal || ""}. ${art.year || ""}.`;
      if (art.doi) ctx += ` DOI: ${art.doi}`;
      if (art.pmid) ctx += ` PMID: ${art.pmid}`;
      ctx += `\nFuente: ${art.retrievedFrom || art.source || ""}`;
      if (art.abstract) ctx += `\nAbstract: ${String(art.abstract).slice(0, 500)}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  if (niceGuidelines.length > 0) {
    ctx += "--- GUÍAS NICE (National Institute for Health and Care Excellence) ---\n";
    niceGuidelines.forEach(g => {
      const num = ++n;
      const year = (String(g.date || "").match(/(20\d{2})/) || [])[1] || "";
      refs.push({ n: num, type: "guideline", title: g.title || "", journal: "NICE", year, url: g.url || "", source: "NICE" });
      ctx += `\n[${num}] ${g.title}`;
      if (g.type) ctx += ` (${g.type})`;
      if (g.date) ctx += ` — ${g.date}`;
      if (g.url) ctx += `\nURL: ${g.url}`;
      if (g.summary) ctx += `\nResumen: ${g.summary}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  if (cimaDrugs.length > 0) {
    ctx += "--- VADEMÉCUM OFICIAL ESPAÑOL (CIMA-AEMPS) ---\n";
    cimaDrugs.forEach(m => {
      const num = ++n;
      refs.push({ n: num, type: "drug", title: m.name || "Ficha CIMA", journal: "CIMA-AEMPS", year: "", url: m.url || "", source: "CIMA-AEMPS" });
      ctx += `\n[${num}] ${m.name}`;
      if (m.lab) ctx += ` — ${m.lab}`;
      ctx += "\n";
      if (m.active) ctx += `Principios activos: ${m.active}\n`;
      ctx += `Comercializado: ${m.commercialized ? "sí" : "no"} | Autorizado: ${m.authorized ? "sí" : "no"}\n`;
      if (m.url) ctx += `Ficha técnica: ${m.url}\n`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  if (fdaDrug) {
    const num = ++n;
    refs.push({ n: num, type: "drug", title: fdaDrug.brandName || fdaDrug.genericName || "Ficha FDA", journal: "OpenFDA", year: "", url: "", source: "OpenFDA" });
    ctx += "--- FICHA TÉCNICA FDA (OpenFDA Drug Label) ---\n";
    ctx += `[${num}] Fármaco: ${fdaDrug.genericName}`;
    if (fdaDrug.brandName) ctx += ` (${fdaDrug.brandName})`;
    ctx += "\n";
    if (fdaDrug.manufacturer) ctx += `Fabricante: ${fdaDrug.manufacturer} | Vía: ${fdaDrug.route || "N/D"}\n`;
    if (fdaDrug.boxedWarning) ctx += `⚠️ BLACK BOX WARNING: ${fdaDrug.boxedWarning}\n`;
    if (fdaDrug.indications) ctx += `Indicaciones: ${fdaDrug.indications}\n`;
    if (fdaDrug.dosage) ctx += `Posología: ${fdaDrug.dosage}\n`;
    if (fdaDrug.contraindications) ctx += `Contraindicaciones: ${fdaDrug.contraindications}\n`;
    if (fdaDrug.interactions) ctx += `Interacciones: ${fdaDrug.interactions}\n`;
    if (fdaDrug.adverseReactions) ctx += `Reacciones adversas: ${fdaDrug.adverseReactions}\n`;
    if (fdaDrug.specialPopulations) ctx += `Poblaciones especiales: ${fdaDrug.specialPopulations}\n`;
    ctx += "\n";
  }

  if (clinicalTrials.length > 0) {
    ctx += "--- ENSAYOS CLÍNICOS EN CURSO (ClinicalTrials.gov) ---\n";
    clinicalTrials.forEach(ct => {
      const num = ++n;
      refs.push({ n: num, type: "trial", title: `${ct.title} (${ct.nctId})`, journal: "ClinicalTrials.gov", year: ct.startDate || "", url: ct.url || "", source: "ClinicalTrials.gov" });
      ctx += `\n[${num}] ${ct.title} (${ct.nctId})`;
      if (ct.status) ctx += `\nEstado: ${ct.status}`;
      if (ct.phase) ctx += ` | Fase: ${ct.phase}`;
      if (ct.organization) ctx += `\nOrganización: ${ct.organization}`;
      if (ct.startDate) ctx += ` | Inicio: ${ct.startDate}`;
      ctx += `\nURL: ${ct.url}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  if (semanticScholar.length > 0) {
    ctx += "--- PAPERS ACADÉMICOS (Semantic Scholar) ---\n";
    semanticScholar.forEach(paper => {
      const num = ++n;
      const url = paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : "");
      refs.push({ n: num, type: "literature", title: paper.title || "", authors: paper.authors || "", journal: "Semantic Scholar", year: paper.year || "", doi: paper.doi || "", url, source: "Semantic Scholar" });
      ctx += `\n[${num}] ${paper.authors}. ${paper.title}. ${paper.year || ""}.`;
      if (paper.doi) ctx += ` DOI: ${paper.doi}`;
      if (paper.isOpenAccess) ctx += " [OPEN ACCESS]";
      if (paper.abstract) ctx += `\nAbstract: ${String(paper.abstract).slice(0, 400)}`;
      ctx += `\nURL: ${paper.url}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  if (whoDocuments.length > 0) {
    ctx += "--- DOCUMENTOS DE LA OMS (WHO IRIS) ---\n";
    whoDocuments.forEach(doc => {
      const num = ++n;
      const year = (String(doc.date || "").match(/(20\d{2})/) || [])[1] || "";
      refs.push({ n: num, type: "guideline", title: doc.title || "", journal: "OMS", year, url: doc.url || "", source: "WHO" });
      ctx += `\n[${num}] ${doc.title}`;
      if (doc.type) ctx += ` (${doc.type})`;
      if (doc.date) ctx += ` — ${doc.date}`;
      ctx += `\nURL: ${doc.url}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  ctx += `--- INSTRUCCIÓN ---
Utiliza TODAS las fuentes anteriores para responder la siguiente pregunta clínica.
Cita cada afirmación con el número entre corchetes indicado junto a cada fuente arriba: [1], [2], [3]...
Usa EXACTAMENTE esos números; no inventes ninguno ni cites uno que no exista en el contexto.
Si una afirmación proviene de una ficha validada de iNurse, márcala como [iNurse-código] en vez de un número.
Incluye un bloque de REFERENCIAS al final con formato bibliográfico completo, usando los mismos números.
Si una fuente se contradice con otra, señálalo y prioriza la de mayor nivel de evidencia.
Si las fuentes no cubren algún aspecto, indícalo explícitamente.

PREGUNTA DEL USUARIO: ${question}`;

  return { ctx, refs };
}

async function callGemini(systemPrompt, userPrompt, { apiKey, model, history, maxOutputTokens = 8192, temperature = 0.3 } = {}) {
  if (!apiKey) throw new Error("Falta la API Key de Gemini (GEMINI_API_KEY)");

  const contents = [];
  if (history?.length) {
    for (const m of history.slice(-10)) {
      contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] });
    }
  }
  contents.push({ role: "user", parts: [{ text: userPrompt }] });

  const url = `${GEMINI_BASE}/${model || GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature, maxOutputTokens, topP: 0.8, topK: 40 }
  };

  // Una respuesta clínica completa (hasta maxOutputTokens) puede tardar más que el
  // timeout genérico de 18s de httpRequest, pensado para APIs de búsqueda rápidas.
  const data = await requestJSON(url, { method: "POST", body, ttl: 0, label: "Gemini", timeout: 55000 });

  const candidate = data?.candidates?.[0];
  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) throw new Error(`Gemini bloqueó la respuesta por seguridad de contenido (${blockReason}). Reformula la pregunta.`);
  if (!candidate) throw new Error("Gemini no devolvió ningún candidato de respuesta.");
  if (candidate.finishReason && candidate.finishReason !== "STOP" && !candidate.content?.parts?.length) {
    throw new Error(`Gemini interrumpió la respuesta sin generar texto (motivo: ${candidate.finishReason}).`);
  }
  if (!candidate.content?.parts) throw new Error("Respuesta vacía del modelo");

  const text = candidate.content.parts.map(p => p.text || "").join("").trim();
  if (!text) throw new Error("Gemini devolvió una respuesta vacía.");
  return text;
}

// Variante en streaming de callGemini: usa el endpoint SSE de Gemini con fetch()
// nativo de Node (requestJSON/httpRequest de cache.mjs bufferizan la respuesta
// completa y no sirven para ir emitiendo texto parcial).
async function streamGeminiCall(systemPrompt, userPrompt, { apiKey, model, history, maxOutputTokens = 8192, temperature = 0.3 } = {}, onDelta) {
  if (!apiKey) throw new Error("Falta la API Key de Gemini (GEMINI_API_KEY)");

  const contents = [];
  if (history?.length) {
    for (const m of history.slice(-10)) {
      contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] });
    }
  }
  contents.push({ role: "user", parts: [{ text: userPrompt }] });

  const url = `${GEMINI_BASE}/${model || GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature, maxOutputTokens, topP: 0.8, topK: 40 }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok || !res.body) {
    let errData = {};
    try { errData = await res.json(); } catch { /* respuesta de error no era JSON */ }
    throw new Error(errData?.error?.message || `Error ${res.status} llamando a Gemini`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "", full = "", blockReason = "", finishReason = "", sawCandidate = false;

  function handleEvent(jsonStr) {
    if (!jsonStr || jsonStr === "[DONE]") return;
    let evt;
    try { evt = JSON.parse(jsonStr); } catch { return; /* fragmento SSE incompleto: se completa en el siguiente trozo */ }
    if (evt?.promptFeedback?.blockReason) blockReason = evt.promptFeedback.blockReason;
    const cand = evt?.candidates?.[0];
    if (cand) {
      sawCandidate = true;
      if (cand.finishReason && cand.finishReason !== "STOP") finishReason = cand.finishReason;
      const t = cand?.content?.parts ? cand.content.parts.map(p => p.text || "").join("") : "";
      if (t) { full += t; if (onDelta) onDelta(full); }
    }
  }

  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buf += decoder.decode(chunk.value, { stream: true });
    const events = buf.split("\n\n");
    buf = events.pop();
    for (const raw of events) {
      const line = raw.trim();
      if (line.indexOf("data:") !== 0) continue;
      handleEvent(line.replace(/^data:\s*/, "").trim());
    }
  }
  // Último evento sin salto de línea final tras él (la conexión se cerró justo después).
  const lastLine = buf.trim();
  if (lastLine.indexOf("data:") === 0) handleEvent(lastLine.replace(/^data:\s*/, "").trim());

  if (!full.trim()) {
    if (blockReason) throw new Error(`Gemini bloqueó la respuesta por seguridad de contenido (${blockReason}). Reformula la pregunta.`);
    if (finishReason) throw new Error(`Gemini interrumpió la respuesta sin generar texto (motivo: ${finishReason}).`);
    if (!sawCandidate) throw new Error("Gemini no devolvió ningún candidato de respuesta (posible cambio en el formato de streaming del modelo).");
    throw new Error("Gemini devolvió una respuesta vacía.");
  }

  return full.trim();
}

function buildSourcesPayload(refs, { queries, errors }) {
  return {
    references: refs,
    queries,
    errors: errors.length ? errors : undefined
  };
}

async function prepareOrchestration(question, clientContext) {
  const searchResults = await searchAllSources(question);
  const { articles, niceGuidelines, fdaDrug, cimaDrugs, drugDetected, queries, errors } = searchResults;
  console.log(`[Orquestador] Queries: ${JSON.stringify(queries)} | Artículos: ${articles.length} | NICE: ${niceGuidelines.length} | FDA: ${fdaDrug ? "sí" : "no"} | CIMA: ${cimaDrugs.length}` +
    (drugDetected ? ` | Fármaco: ${drugDetected}` : "") +
    (errors.length ? ` | Errores: ${errors.join("; ")}` : ""));

  const { ctx, refs } = assembleContext(question, searchResults, clientContext);
  return {
    searchResults,
    userPrompt: ctx,
    sources: buildSourcesPayload(refs, searchResults)
  };
}

function buildSystemPrompt(caseMemory) {
  let sys = SYSTEM_PROMPT;
  if (caseMemory?.length) {
    sys += "\n\n[MEMORIA TEMPORAL DEL CASO]\n" + caseMemory.slice(-6).join("\n") + "\n[FIN MEMORIA]";
  }
  return sys;
}

export async function orchestrate({ question, context: clientContext, history, apiKey, model, caseMemory, route, attachment }) {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  if (!key) {
    throw new Error("No hay API Key de Gemini configurada. Añade GEMINI_API_KEY en las variables de entorno de Render.");
  }

  const { userPrompt, sources } = await prepareOrchestration(question, clientContext);

  const answer = await callGemini(buildSystemPrompt(caseMemory), userPrompt, {
    apiKey: key,
    model: model || GEMINI_MODEL,
    history,
    maxOutputTokens: 8192,
    temperature: 0.3
  });

  return { answer, sources, fetchedAt: new Date().toISOString() };
}

// Variante en streaming de orchestrate(): en vez de devolver la respuesta completa
// de una vez, emite eventos vía onEvent({type,...}) a medida que están disponibles
// (fuentes en cuanto se resuelve la búsqueda, texto parcial a medida que Gemini lo
// genera, y un evento final "done"). No escribe nada en la red directamente: eso lo
// hace el llamador (server.mjs), que decide el formato de transporte (NDJSON).
export async function orchestrateStream({ question, context: clientContext, history, apiKey, model, caseMemory, route, attachment }, onEvent) {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  if (!key) {
    throw new Error("No hay API Key de Gemini configurada. Añade GEMINI_API_KEY en las variables de entorno de Render.");
  }

  const { userPrompt, sources } = await prepareOrchestration(question, clientContext);
  onEvent({ type: "sources", sources });

  const answer = await streamGeminiCall(buildSystemPrompt(caseMemory), userPrompt, {
    apiKey: key,
    model: model || GEMINI_MODEL,
    history,
    maxOutputTokens: 8192,
    temperature: 0.3
  }, (fullText) => onEvent({ type: "delta", text: fullText }));

  onEvent({ type: "done", answer, sources, fetchedAt: new Date().toISOString() });
}

// Sonda de diagnóstico para /api/vivi/health: hace la llamada más pequeña posible a
// Gemini y devuelve el motivo exacto si falla, en vez de propagar la excepción. Sirve
// para separar de un vistazo los tres fallos que se confunden entre sí desde la app
// (clave ausente o inválida, modelo no disponible, y cuota agotada), sin tener que
// abrir los registros del servidor.
export async function probeGemini(apiKeyArg) {
  const apiKey = apiKeyArg || process.env.GEMINI_API_KEY || "";
  const startedAt = Date.now();
  try {
    // maxOutputTokens holgado a propósito: con un tope muy bajo, un modelo que use
    // tokens de razonamiento puede terminar en MAX_TOKENS sin texto y hacer fallar
    // la sonda por un motivo que no es el que estamos buscando.
    const text = await callGemini("Responde con una sola palabra.", "Responde únicamente: OK", {
      apiKey,
      model: GEMINI_MODEL,
      maxOutputTokens: 1024,
      temperature: 0
    });
    return { ok: true, model: GEMINI_MODEL, ms: Date.now() - startedAt, sample: text.slice(0, 80) };
  } catch (err) {
    return {
      ok: false,
      model: GEMINI_MODEL,
      ms: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

// Transcribe audio (base64) a texto usando Gemini. Devuelve "" si no hay voz clara.
export async function transcribeAudio(audioBase64, mimeType = "audio/wav", apiKeyArg) {
  const apiKey = apiKeyArg || process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Falta la API Key de Gemini (GEMINI_API_KEY)");
  if (!audioBase64) return "";

  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [{
      role: "user",
      parts: [
        { text: "Transcribe literalmente este audio de una consulta clínica hablada en español. Devuelve ÚNICAMENTE el texto transcrito, sin comillas, sin comentarios ni explicaciones. Si el audio no contiene voz clara, devuelve una cadena vacía." },
        { inlineData: { mimeType, data: audioBase64 } }
      ]
    }],
    generationConfig: { temperature: 0, maxOutputTokens: 512 }
  };

  const data = await requestJSON(url, { method: "POST", body, ttl: 0, label: "Gemini Transcribe", timeout: 45000 });
  const candidate = data?.candidates?.[0];
  if (!candidate?.content?.parts) return "";
  return candidate.content.parts.map(p => p.text || "").join("").trim();
}

export { SYSTEM_PROMPT, generateQueries, searchAllSources };
