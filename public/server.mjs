import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { URL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "public");
const PORT = Number(process.env.PORT || 8787);
const CIMA_BASE = (process.env.CIMA_BASE || "https://cima.aemps.es/cima/rest").replace(/\/$/, "");
const EPMC_BASE = (process.env.EPMC_BASE || "https://www.ebi.ac.uk/europepmc/webservices/rest").replace(/\/$/, "");
const cache = new Map();

function json(res, status, data) {
  const body = Buffer.from(JSON.stringify(data));
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(body);
}

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expires < Date.now()) { cache.delete(key); return null; }
  return hit.data;
}
function cacheSet(key, data, ttl = 10 * 60 * 1000) {
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  cache.set(key, { data, expires: Date.now() + ttl });
}
function normalizeList(data) {
  if (Array.isArray(data)) return data;
  return data?.resultados || data?.medicamentos || data?.items || data?.content || [];
}
function clean(value, max = 160) {
  return String(value || "").trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max);
}
function stripTags(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ").trim();
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > 1024 * 1024) { reject(new Error("Petición demasiado grande")); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
function requestJSON(urlString, { method = "GET", body = null, ttl = 10 * 60 * 1000, label = "La fuente externa" } = {}) {
  const bodyText = body ? JSON.stringify(body) : "";
  const key = `${method}:${urlString}:${bodyText}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);

  return new Promise((resolve, reject) => {
    const target = new URL(urlString);
    const transport = target.protocol === "http:" ? http : https;
    const req = transport.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === "http:" ? 80 : 443),
      path: target.pathname + target.search,
      method,
      timeout: 18000,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "iNurse-CIMA/28.1",
        ...(bodyText ? { "Content-Length": Buffer.byteLength(bodyText) } : {})
      }
    }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let data;
        try { data = text ? JSON.parse(text) : null; }
        catch { reject(new Error(`${label} devolvió una respuesta no válida`)); return; }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(data?.error || data?.message || `${label} respondió ${response.statusCode}`));
          return;
        }
        cacheSet(key, data, ttl);
        resolve(data);
      });
    });
    req.on("timeout", () => req.destroy(new Error(`${label} tardó demasiado en responder`)));
    req.on("error", reject);
    if (bodyText) req.write(bodyText);
    req.end();
  });
}
function cima(pathname, options = {}) {
  return requestJSON(`${CIMA_BASE}/${pathname}`, { ...options, label: "CIMA" });
}
function epmc(pathname, options = {}) {
  return requestJSON(`${EPMC_BASE}/${pathname}`, { ...options, label: "Europe PMC" });
}
function safeStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const full = path.resolve(PUBLIC, relative);
  return full.startsWith(path.resolve(PUBLIC) + path.sep) || full === path.resolve(PUBLIC, "index.html") ? full : null;
}
function serveStatic(req, res) {
  const full = safeStaticPath(req.url);
  if (!full || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    const fallback = path.join(PUBLIC, "index.html");
    if (!fs.existsSync(fallback)) { res.writeHead(404); res.end("No encontrado"); return; }
    return sendFile(fallback, res);
  }
  sendFile(full, res);
}
function sendFile(file, res) {
  const ext = path.extname(file).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml", ".webp": "image/webp"
  };
  const stat = fs.statSync(file);
  res.writeHead(200, {
    "Content-Type": types[ext] || "application/octet-stream",
    "Content-Length": stat.size,
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
  });
  fs.createReadStream(file).pipe(res);
}
async function medicineDetail(nregistro) {
  const medicine = await cima(`medicamento?nregistro=${encodeURIComponent(nregistro)}`, { ttl: 30 * 60 * 1000 });
  const tasks = [
    cima(`docSegmentado/contenido/1?nregistro=${encodeURIComponent(nregistro)}`, { ttl: 30 * 60 * 1000 }),
    medicine?.notas ? cima(`notas/${encodeURIComponent(nregistro)}`, { ttl: 30 * 60 * 1000 }) : Promise.resolve([]),
    medicine?.materialesInf ? cima(`materiales/${encodeURIComponent(nregistro)}`, { ttl: 30 * 60 * 1000 }) : Promise.resolve([])
  ];
  const [sections, notes, materials] = await Promise.allSettled(tasks);
  const affected = (medicine?.presentaciones || []).filter(p => p.psum && p.cn).slice(0, 20);
  const supplySettled = await Promise.allSettled(
    affected.map(p => cima(`psuministro/${encodeURIComponent(p.cn)}`, { ttl: 5 * 60 * 1000 }))
  );
  return {
    medicine,
    sections: sections.status === "fulfilled" ? sections.value : [],
    notes: notes.status === "fulfilled" ? notes.value : [],
    materials: materials.status === "fulfilled" ? materials.value : [],
    supply: supplySettled.flatMap(r => r.status === "fulfilled" ? normalizeList(r.value) : []),
    source: "CIMA-AEMPS",
    fetchedAt: new Date().toISOString()
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") return json(res, 204, {});
    const u = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (u.pathname === "/api/health") {
      return json(res, 200, {
        ok: true, service: "iNurse CIMA local", port: PORT,
        runtime: `Node ${process.version}`, cimaBase: CIMA_BASE
      });
    }
    if (u.pathname === "/api/cima/health") {
      await cima("medicamento?nregistro=51347", { ttl: 30 * 60 * 1000 });
      return json(res, 200, {
        ok: true, service: "CIMA-AEMPS", apiVersion: "REST v1.23",
        source: "Agencia Española de Medicamentos y Productos Sanitarios"
      });
    }
    if (u.pathname === "/api/cima/search" && req.method === "GET") {
      const mode = ["name","active","pathology","atc"].includes(u.searchParams.get("mode"))
        ? u.searchParams.get("mode") : "name";
      const q = clean(u.searchParams.get("q"), 120);
      const page = Math.max(1, Math.min(1000, Number(u.searchParams.get("page")) || 1));
      const commercial = u.searchParams.get("commercial") === "1";
      const authorized = u.searchParams.get("authorized") === "1";
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });

      let raw;
      if (mode === "pathology") {
        raw = await cima("buscarEnFichaTecnica", {
          method: "POST", body: [{ seccion: "4.1", texto: q, contiene: 1 }],
          ttl: 15 * 60 * 1000
        });
      } else {
        const params = new URLSearchParams({ pagina: String(page) });
        if (mode === "name") params.set("nombre", q);
        if (mode === "active") params.set("practiv1", q);
        if (mode === "atc") params.set("atc", q);
        if (commercial) params.set("comerc", "1");
        if (authorized) params.set("autorizados", "1");
        raw = await cima(`medicamentos?${params}`, { ttl: 15 * 60 * 1000 });
      }
      let items = normalizeList(raw);
      if (commercial) items = items.filter(item => item.comerc !== false);
      return json(res, 200, {
        items, page, mode, query: q,
        total: raw?.totalFilas ?? raw?.total ?? items.length,
        source: "CIMA-AEMPS", fetchedAt: new Date().toISOString()
      });
    }
    if (u.pathname.startsWith("/api/cima/medicine/") && req.method === "GET") {
      const nregistro = clean(u.pathname.split("/").pop(), 30);
      if (!/^[A-Za-z0-9.-]+$/.test(nregistro)) return json(res, 400, { error: "Número de registro no válido" });
      return json(res, 200, await medicineDetail(nregistro));
    }
    if (u.pathname === "/api/cima/search-indication" && req.method === "POST") {
      const rawBody = await readBody(req);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const text = clean(parsed.text, 120);
      if (text.length < 2) return json(res, 400, { error: "Texto insuficiente" });
      const raw = await cima("buscarEnFichaTecnica", {
        method: "POST", body: [{ seccion: "4.1", texto: text, contiene: 1 }],
        ttl: 15 * 60 * 1000
      });
      return json(res, 200, { items: normalizeList(raw), query: text, section: "4.1", source: "CIMA-AEMPS" });
    }
    if (u.pathname === "/api/pmc/health") {
      await epmc("search?query=heart&format=json&pageSize=1&resultType=idlist", { ttl: 30 * 60 * 1000 });
      return json(res, 200, {
        ok: true, service: "Europe PMC",
        source: "EMBL-EBI · Europe PMC RESTful Web Service"
      });
    }
    if (u.pathname === "/api/pmc/search" && req.method === "GET") {
      const q = clean(u.searchParams.get("q"), 300);
      if (q.length < 2) return json(res, 400, { error: "Escribe al menos dos caracteres" });
      const openOnly = u.searchParams.get("open") === "1";
      const sort = u.searchParams.get("sort") === "date" ? "date" : "relevance";
      const cursor = clean(u.searchParams.get("cursor") || "*", 200) || "*";

      let query = q;
      if (openOnly) query = `(${query}) AND (OPEN_ACCESS:y)`;
      const params = new URLSearchParams({
        query, format: "json", resultType: "core",
        pageSize: "25", cursorMark: cursor
      });
      if (sort === "date") params.set("sort", "P_PDATE_D desc");

      const raw = await epmc(`search?${params}`, { ttl: 15 * 60 * 1000 });
      const list = raw?.resultList?.result || [];
      const items = list.map(r => ({
        id: r.id || "", source: r.source || "", pmid: r.pmid || "", pmcid: r.pmcid || "", doi: r.doi || "",
        title: clean(stripTags(r.title), 400),
        authors: clean(r.authorString, 240),
        journal: clean(r.journalInfo?.journal?.title || r.journalTitle || r.bookOrReportDetails?.publisher, 160),
        year: r.pubYear || "",
        isOpen: r.isOpenAccess === "Y",
        citedBy: Number(r.citedByCount || 0),
        type: clean(r.pubType, 60),
        abstract: clean(stripTags(r.abstractText), 1400),
        url: r.doi ? `https://doi.org/${r.doi}`
          : (r.source && r.id ? `https://europepmc.org/article/${r.source}/${r.id}` : "")
      }));
      return json(res, 200, {
        items,
        total: raw?.hitCount ?? items.length,
        nextCursor: raw?.nextCursorMark || null,
        query: q, sort, openOnly,
        source: "Europe PMC", fetchedAt: new Date().toISOString()
      });
    }
    if (u.pathname.startsWith("/api/vivi") || u.pathname.startsWith("/api/live")) {
      return json(res, 503, {
        error: "Este iniciador activa CIMA. Vivi Live necesita su configuración de Gemini independiente."
      });
    }
    serveStatic(req, res);
  } catch (error) {
    console.error(error);
    json(res, 502, {
      error: error instanceof Error ? error.message : "Error de conexión con CIMA"
    });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`iNurse CIMA activa en http://localhost:${PORT}`);
});
