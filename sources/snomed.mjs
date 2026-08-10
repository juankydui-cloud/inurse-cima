/**
 * sources/snomed.mjs — Enferix
 * ---------------------------------------------------------------------------
 * Búsqueda local sobre el snapshot oficial de SNOMED CT Edición Española
 * (RF2, Description Snapshot, descargado con licencia de afiliado MLDS).
 *
 * No monta un servidor de terminología completo (Snowstorm): hace streaming
 * sobre un fichero comprimido con las descripciones activas (id, tipo, término),
 * sin cargarlo entero en memoria. Suficiente para lo que necesita
 * terminology-connector.mjs: encontrar el código de concepto de un término
 * exacto, nunca inventarlo.
 * ---------------------------------------------------------------------------
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "snomed_ct_es.tsv.gz");
const SYNONYM_TYPE = "900000000000013009";
const FSN_TYPE = "900000000000003001";

function norm(s) {
  return String(s ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function snomedDataAvailable() {
  return fs.existsSync(DATA_FILE);
}

/**
 * Coincidencia EXACTA (tras normalizar acentos/mayúsculas) del término contra
 * las descripciones activas. No hace fuzzy match: si no hay coincidencia
 * exacta, no se devuelve nada, para no arriesgarse a citar un código erróneo.
 */
export async function snomedExactLookup(term) {
  if (!snomedDataAvailable()) return null;
  const target = norm(term);
  if (!target) return null;

  let best = null;
  const stream = fs.createReadStream(DATA_FILE).pipe(zlib.createGunzip());
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    const tab1 = line.indexOf("\t");
    const tab2 = line.indexOf("\t", tab1 + 1);
    if (tab1 < 0 || tab2 < 0) continue;
    const conceptId = line.slice(0, tab1);
    const typeId = line.slice(tab1 + 1, tab2);
    const rawTerm = line.slice(tab2 + 1);
    if (norm(rawTerm) !== target) continue;
    if (typeId === SYNONYM_TYPE) { best = { conceptId, term: rawTerm, typeId }; break; }
    if (typeId === FSN_TYPE && !best) best = { conceptId, term: rawTerm, typeId };
  }
  rl.close();
  stream.destroy();
  return best;
}

/**
 * Búsqueda por coincidencia parcial (contiene todas las palabras), para
 * autocompletado o exploración — NO usada por la validación determinista
 * de terminology-connector.mjs, solo por endpoints de búsqueda libre.
 */
export async function searchSnomed(query, { limit = 8 } = {}) {
  if (!snomedDataAvailable()) return { items: [] };
  const needle = norm(query);
  if (needle.length < 2) return { items: [] };
  const words = needle.split(/\s+/).filter(Boolean);

  const seen = new Map();
  const stream = fs.createReadStream(DATA_FILE).pipe(zlib.createGunzip());
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    const tab1 = line.indexOf("\t");
    const tab2 = line.indexOf("\t", tab1 + 1);
    if (tab1 < 0 || tab2 < 0) continue;
    const conceptId = line.slice(0, tab1);
    const typeId = line.slice(tab1 + 1, tab2);
    const term = line.slice(tab2 + 1);
    const normTerm = norm(term);
    if (!words.every(w => normTerm.includes(w))) continue;

    const existing = seen.get(conceptId);
    if (!existing || (typeId === SYNONYM_TYPE && existing.typeId !== SYNONYM_TYPE)) {
      seen.set(conceptId, { conceptId, term, typeId });
    }
    if (seen.size >= limit * 4) break;
  }
  rl.close();
  stream.destroy();

  const items = Array.from(seen.values())
    .sort((a, b) => a.term.length - b.term.length)
    .slice(0, limit)
    .map(r => ({
      conceptId: r.conceptId,
      term: r.term,
      url: `https://browser.ihtsdotools.org/?perspective=full&conceptId1=${r.conceptId}`
    }));

  return { items };
}
