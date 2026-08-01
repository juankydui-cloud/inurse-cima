// Conector de terminología clínica para diagnósticos enfermeros.
//
// Regla de oro: si no hay conector disponible o no hay coincidencia exacta
// en la tabla curada, nunca se fabrica un código. Se devuelve
// code_status: "unvalidated" con el motivo, de forma visible para la ficha.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NNN_CODES_PATH = path.join(__dirname, "..", "data", "nnn_codes.json");

// Servidor de terminología SNOMED CT (p. ej. Snowstorm con API FHIR).
// Se activa en cuanto llegue la licencia del Ministerio de Sanidad y haya
// un endpoint real que apuntar aquí.
const SNOMED_ENDPOINT = process.env.SNOMED_TERMINOLOGY_URL || "";

let nnnCache = null;
let nnnCacheMtime = 0;

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function loadNNNCodes() {
  try {
    const stat = fs.statSync(NNN_CODES_PATH);
    if (nnnCache && stat.mtimeMs === nnnCacheMtime) return nnnCache;
    const raw = fs.readFileSync(NNN_CODES_PATH, "utf8");
    nnnCache = JSON.parse(raw);
    nnnCacheMtime = stat.mtimeMs;
    return nnnCache;
  } catch {
    return { terms: [] };
  }
}

// Solo términos con NANDA + NIC + NOC verificados por Juanky en NNNConsult
// llegan a nnn_codes.json (ver scripts/build_nnn_json.py). No hay fallback
// difuso: la coincidencia debe ser exacta sobre el término normalizado.
function nnnLookup(valor) {
  const { terms = [] } = loadNNNCodes();
  const needle = normalize(valor);
  const match = terms.find((t) => normalize(t.termino) === needle);
  if (!match) {
    return {
      code_status: "unvalidated",
      reason: "Sin coincidencia exacta en la tabla NNN curada (NNNConsult). Pendiente de verificación manual.",
      via: "nnn"
    };
  }
  return {
    code_status: "validated",
    via: "nnn",
    termino: match.termino,
    nanda: match.nanda,
    nic: match.nic,
    noc: match.noc,
    verifiedBy: match.verifiedBy || null,
    verifiedAt: match.verifiedAt || null
  };
}

function snomedLookup(valor) {
  if (!SNOMED_ENDPOINT) {
    return {
      code_status: "unvalidated",
      reason: "No hay servidor de terminología SNOMED CT configurado (pendiente de licencia del Ministerio de Sanidad).",
      via: "snomed"
    };
  }
  // TODO: descomentar cuando SNOMED_TERMINOLOGY_URL apunte a un servidor
  // real (p. ej. Snowstorm) con API FHIR $lookup / $expand.
  //
  // const url = `${SNOMED_ENDPOINT}/fhir/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs&filter=${encodeURIComponent(valor)}`;
  // const res = await fetch(url);
  // const data = await res.json();
  // const match = data?.expansion?.contains?.[0];
  // if (!match) {
  //   return { code_status: "unvalidated", reason: "Sin coincidencia en el servidor SNOMED CT.", via: "snomed" };
  // }
  // return { code_status: "validated", via: "snomed", code: match.code, display: match.display };

  return {
    code_status: "unvalidated",
    reason: "Conector SNOMED CT desactivado (SNOMED_ENDPOINT sin implementar).",
    via: "snomed"
  };
}

// via: "nnn" | "snomed"
export function validarTerminologia(valor, via) {
  const term = String(valor || "").trim();
  if (!term) {
    return { code_status: "unvalidated", reason: "Valor vacío.", via: via || null };
  }
  if (via === "nnn") return nnnLookup(term);
  if (via === "snomed") return snomedLookup(term);
  return { code_status: "unvalidated", reason: `Vía de terminología desconocida: "${via}".`, via: via || null };
}
