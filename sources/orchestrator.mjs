import { requestJSON } from "../cache.mjs";
import { searchPubMed } from "./pubmed.mjs";
import { searchCrossref } from "./crossref.mjs";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT = `Eres **Vivi**, la asistente clínica de referencia de iNurse. Tu función es proporcionar respuestas clínicas exhaustivas, basadas en evidencia, al nivel de una herramienta profesional de consulta clínica como UpToDate o Dr.Oracle.

## Principios fundamentales

1. **Responde siempre con profundidad clínica**, independientemente de lo breve o coloquial que sea la pregunta del usuario. Si alguien escribe "neumotórax a tensión", responde como si te hubieran pedido una revisión clínica completa del tema.

2. **Busca siempre en las fuentes disponibles.** Antes de responder cualquier pregunta clínica:
   - Consulta las fichas validadas de iNurse (contenido interno verificado).
   - Integra la evidencia publicada recuperada de PubMed, Crossref y Europe PMC.
   - Si la pregunta involucra fármacos, consulta también las fichas del vademécum interno.
   - Integra toda la información recuperada en una respuesta cohesionada.

3. **Nunca respondas solo de memoria.** Siempre fundamenta tus afirmaciones en fuentes recuperadas. Si no encuentras evidencia suficiente, indícalo explícitamente.

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
- Lista numerada de todas las fuentes citadas en la respuesta.
- Formato: Autores. Título. Revista. Año;volumen(número):páginas. DOI o PMID.
- Diferencia las fuentes internas de iNurse (marcadas como [iNurse · Ficha validada]) de la literatura externa.
- Incluye siempre al menos 3-5 referencias de literatura publicada cuando estén disponibles.

## Citación en el texto

- Cita cada afirmación clínica relevante con un número entre corchetes que remita a la lista de referencias: [1], [2], etc.
- Si una afirmación proviene de una ficha validada de iNurse, márcala como [iNurse-código].
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

const GUIDELINE_ORGS = [
  '"NICE guideline" OR "National Institute for Health and Care Excellence"',
  '"ESC guideline" OR "European Society of Cardiology"',
  '"ERC guideline" OR "European Resuscitation Council"',
  '"JBI" OR "Joanna Briggs Institute"'
];

async function searchAllSources(question) {
  const queries = generateQueries(question);
  const guidelineQuery = `(${queries[0]}) AND (${GUIDELINE_ORGS.join(" OR ")})`;

  const [pmcResult, pubmedResult, crossrefResult, guidelineResult] = await Promise.allSettled([
    searchPubMed(queries[0], { limit: 8 }),
    queries[1] ? searchPubMed(queries[1], { limit: 5 }) : Promise.resolve({ items: [] }),
    searchCrossref(queries[0], { limit: 5 }),
    searchPubMed(guidelineQuery, { limit: 5 })
  ]);

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

  return {
    articles: articles.slice(0, 12),
    queries,
    errors: [pmcResult, pubmedResult, crossrefResult, guidelineResult]
      .filter(r => r.status === "rejected")
      .map(r => r.reason?.message || "Error desconocido")
  };
}

function assembleContext(question, externalArticles, clientContext) {
  let ctx = "";

  if (clientContext?.guides) {
    ctx += "--- FICHAS VALIDADAS DE iNURSE (GUÍAS CLÍNICAS Y VADEMÉCUM) ---\n";
    ctx += clientContext.guides + "\n\n";
  }

  if (clientContext?.library) {
    ctx += "--- BIBLIOTECA VIRTUAL DE iNURSE ---\n";
    ctx += clientContext.library + "\n\n";
  }

  if (externalArticles.length > 0) {
    ctx += "--- LITERATURA RECUPERADA (PubMed + Crossref + Guías internacionales) ---\n";
    externalArticles.forEach((art, i) => {
      const authors = Array.isArray(art.authors) ? art.authors.join(", ") : (art.authors || "");
      ctx += `\n[REF-${i + 1}] ${authors}. ${art.title}. ${art.journal || ""}. ${art.year || ""}.`;
      if (art.doi) ctx += ` DOI: ${art.doi}`;
      if (art.pmid) ctx += ` PMID: ${art.pmid}`;
      ctx += `\nFuente: ${art.retrievedFrom || art.source || ""}`;
      if (art.abstract) ctx += `\nAbstract: ${String(art.abstract).slice(0, 500)}`;
      ctx += "\n";
    });
    ctx += "\n";
  }

  ctx += `--- INSTRUCCIÓN ---
Utiliza las fuentes anteriores para responder la siguiente pregunta clínica.
Cita cada afirmación con [REF-N] para literatura externa o [iNurse-código] para fichas internas.
Incluye un bloque de REFERENCIAS al final con formato bibliográfico completo.
Si las fuentes no cubren algún aspecto, indícalo explícitamente.

PREGUNTA DEL USUARIO: ${question}`;

  return ctx;
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

  const data = await requestJSON(url, { method: "POST", body, ttl: 0, label: "Gemini" });

  const candidate = data?.candidates?.[0];
  if (!candidate?.content?.parts) throw new Error("Respuesta vacía del modelo");

  return candidate.content.parts.map(p => p.text || "").join("").trim();
}

export async function orchestrate({ question, context: clientContext, history, apiKey, model, caseMemory, route, attachment }) {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  if (!key) {
    throw new Error("No hay API Key de Gemini configurada. Añade GEMINI_API_KEY en las variables de entorno de Render.");
  }

  const { articles, queries, errors } = await searchAllSources(question);
  console.log(`[Orquestador] Queries: ${JSON.stringify(queries)} | Artículos: ${articles.length}` +
    (errors.length ? ` | Errores: ${errors.join("; ")}` : ""));

  const userPrompt = assembleContext(question, articles, clientContext);

  let sys = SYSTEM_PROMPT;
  if (caseMemory?.length) {
    sys += "\n\n[MEMORIA TEMPORAL DEL CASO]\n" + caseMemory.slice(-6).join("\n") + "\n[FIN MEMORIA]";
  }

  const answer = await callGemini(sys, userPrompt, {
    apiKey: key,
    model: model || GEMINI_MODEL,
    history,
    maxOutputTokens: 8192,
    temperature: 0.3
  });

  return {
    answer,
    sources: {
      articles: articles.map(a => ({
        title: a.title, authors: Array.isArray(a.authors) ? a.authors.join(", ") : a.authors,
        journal: a.journal, year: a.year, doi: a.doi, pmid: a.pmid,
        source: a.retrievedFrom || a.source, url: a.url
      })),
      queries,
      errors: errors.length ? errors : undefined
    },
    fetchedAt: new Date().toISOString()
  };
}

export { SYSTEM_PROMPT, generateQueries, searchAllSources };
