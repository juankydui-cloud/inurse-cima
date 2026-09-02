#!/usr/bin/env node
/* Mide los tres tiempos que importan de una consulta de Javny en streaming:
 *
 *   1. envío de la pregunta        (t = 0, referencia)
 *   2. primer token del streaming  (cuándo aparece la primera palabra en pantalla)
 *   3. respuesta completa          (cuándo termina)
 *
 * Los tiempos salen del reloj de este proceso, midiendo la respuesta NDJSON
 * real del servidor. No estima nada.
 *
 *   node scripts/medir-latencia-javny.mjs "manejo de la sepsis"
 *   node scripts/medir-latencia-javny.mjs "manejo de la sepsis" https://inurse-cima.onrender.com
 */

const pregunta = process.argv[2] || "manejo de la sepsis";
const base = (process.argv[3] || "https://inurse-cima.onrender.com").replace(/\/$/, "");

const t0 = performance.now();
const ms = () => Math.round(performance.now() - t0);
const marcas = { envio: 0, fases: [], sources: null, primerToken: null, fin: null };

console.log(`Pregunta: "${pregunta}"`);
console.log(`Backend:  ${base}`);
console.log(`[${String(marcas.envio).padStart(6)} ms] envío de la pregunta`);

const res = await fetch(`${base}/api/javny/chat/stream`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ question: pregunta, context: {}, history: [], caseMemory: [], route: {} })
});

if (!res.ok || !res.body) {
  const detalle = await res.text().catch(() => "");
  console.error(`\nEl servidor respondió ${res.status}. ${detalle.slice(0, 300)}`);
  process.exit(1);
}

const reader = res.body.getReader();
const dec = new TextDecoder("utf-8");
let buf = "", respuesta = "", caracteres = 0;

function evento(linea) {
  linea = linea.trim();
  if (!linea) return;
  let e;
  try { e = JSON.parse(linea); } catch { return; }

  if (e.type === "phase") {
    marcas.fases.push([e.phase, ms()]);
    console.log(`[${String(ms()).padStart(6)} ms] fase: ${e.phase}`
      + (e.sourceCount != null ? ` (${e.sourceCount} referencias)` : ""));
  } else if (e.type === "sources") {
    marcas.sources = ms();
    const n = (e.sources?.references || []).length;
    console.log(`[${String(ms()).padStart(6)} ms] fuentes recuperadas: ${n}`);
    const errores = e.sources?.errors || [];
    if (errores.length) console.log(`${" ".repeat(11)}fuentes con error: ${errores.length}`);
  } else if (e.type === "delta") {
    if (marcas.primerToken === null && (e.text || "").trim()) {
      marcas.primerToken = ms();
      console.log(`[${String(ms()).padStart(6)} ms] PRIMER TOKEN del streaming`);
    }
    respuesta = e.text || "";
  } else if (e.type === "done") {
    respuesta = (e.answer || respuesta || "").trim();
    caracteres = respuesta.length;
    marcas.fin = ms();
    console.log(`[${String(ms()).padStart(6)} ms] respuesta completa (${caracteres} caracteres)`);
  } else if (e.type === "error") {
    console.error(`[${String(ms()).padStart(6)} ms] ERROR del servidor: ${e.error}`);
  }
}

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += dec.decode(value, { stream: true });
  const lineas = buf.split("\n");
  buf = lineas.pop();
  for (const l of lineas) evento(l);
}
if (buf.trim()) evento(buf);

console.log("\n─── resumen ───");
console.log(`envío .................. 0 ms`);
console.log(`primer token ........... ${marcas.primerToken ?? "no llegó"} ms`);
console.log(`respuesta completa ..... ${marcas.fin ?? "no llegó"} ms`);
if (marcas.primerToken != null && marcas.fin != null) {
  console.log(`redacción (1er token → fin) ... ${marcas.fin - marcas.primerToken} ms`);
}
