/**
 * terminology-connector.mjs — Enferix
 * ---------------------------------------------------------------------------
 * Capa 3 (validación determinista) de la arquitectura de 3 capas.
 *
 * Dos fuentes:
 *   - "nnn"    → nnn_codes.json, generado a partir de la tabla Excel
 *                de códigos NANDA-I / NIC / NOC verificados manualmente en NNNConsult.
 *   - "snomed" → snapshot local de la Edición Española de SNOMED CT (RF2,
 *                descargado con licencia de afiliado MLDS). Coincidencia EXACTA
 *                de término normalizado únicamente: sin fuzzy match, para no
 *                arriesgarse a citar un código que no corresponde.
 *
 * Regla de oro:
 *   Si no hay conector, o no hay coincidencia, NUNCA se fabrica un código.
 *   El campo devuelve { code_status: "unvalidated" } y el hueco queda visible.
 * ---------------------------------------------------------------------------
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { snomedExactLookup, snomedDataAvailable } from "./sources/snomed.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function norm(s) {
  return String(s ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

let _nnnCache = null;

async function loadNnnDictionary() {
  if (_nnnCache) return _nnnCache;
  const file = path.join(__dirname, "nnn_codes.json");
  try {
    const raw = await readFile(file, "utf-8");
    const data = JSON.parse(raw);
    const index = new Map();
    for (const [key, entry] of Object.entries(data.verificados ?? {})) {
      index.set(norm(key), entry);
    }
    _nnnCache = { index, pendientes: data.pendientes_de_verificar ?? [] };
  } catch (err) {
    console.warn("[terminology-connector] nnn_codes.json no encontrado o ilegible:", err.message);
    _nnnCache = { index: new Map(), pendientes: [] };
  }
  return _nnnCache;
}

async function nnnLookup(value) {
  const { index, pendientes } = await loadNnnDictionary();
  const hit = index.get(norm(value));
  if (hit) {
    return {
      code_status: "coded",
      nanda: hit.nanda,
      nic: hit.nic,
      noc: hit.noc,
      fuente: hit.fuente,
      fecha_verificacion: hit.fecha_verificacion,
      revisado_por: hit.revisado_por,
    };
  }
  const isPending = pendientes.some((p) => norm(p) === norm(value));
  return {
    code_status: "unvalidated",
    reason: isPending
      ? "término pendiente de verificar en la tabla NNN (codigos_NNN_curados_iNurse.xlsx)"
      : "término no presente en la tabla NNN — añádelo al Excel para verificarlo",
  };
}

async function snomedLookup(value) {
  if (!snomedDataAvailable()) {
    return {
      code_status: "unvalidated",
      reason: "snapshot de SNOMED CT (snomed_ct_es.tsv.gz) no encontrado en el servidor",
    };
  }
  const hit = await snomedExactLookup(value);
  if (!hit) {
    return {
      code_status: "unvalidated",
      reason: "término no encontrado como coincidencia exacta en SNOMED CT Edición Española",
    };
  }
  return {
    code_status: "coded",
    snomed: { conceptId: hit.conceptId, term: hit.term },
    fuente: "SNOMED CT Edición Española (RF2, snapshot local)",
  };
}

const CONNECTORS = {
  nnn: nnnLookup,
  snomed: snomedLookup,
};

export async function validarTerminologia(valor, via) {
  const connector = CONNECTORS[via];
  if (!connector) {
    return { code_status: "unvalidated", reason: `ningún conector configurado para '${via}'` };
  }
  return connector(valor);
}

export async function nnnStats() {
  const { index, pendientes } = await loadNnnDictionary();
  return { verificados: index.size, pendientes: pendientes.length };
}

export function invalidateNnnCache() {
  _nnnCache = null;
}

export default { validarTerminologia, invalidateNnnCache, nnnStats };
