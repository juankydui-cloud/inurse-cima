import { requestJSON } from "../cache.mjs";

const CIMA_BASE = (process.env.CIMA_BASE || "https://cima.aemps.es/cima/rest").replace(/\/$/, "");

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  return data?.resultados || data?.medicamentos || data?.items || data?.content || [];
}

// Búsqueda de medicamentos autorizados en España (CIMA-AEMPS) para que Naia consulte
// la ficha técnica oficial española antes de responder preguntas sobre fármacos,
// en vez de depender solo de OpenFDA (que refleja el mercado estadounidense).
export async function searchCIMA(query, { limit = 5 } = {}) {
  const params = new URLSearchParams({ nombre: query, pagina: "1" });
  const raw = await requestJSON(`${CIMA_BASE}/medicamentos?${params}`, {
    ttl: 15 * 60 * 1000,
    label: "CIMA"
  });
  const items = normalizeList(raw).slice(0, limit);
  return {
    items: items.map(m => ({
      nregistro: m.nregistro || "",
      name: m.nombre || "",
      lab: m.labtitular || "",
      active: (m.principiosActivos || []).map(p => p.nombre).join(", "),
      atc: (m.vtm?.nombre || (m.atcs || []).map(a => a.nombre).join(", ")) || "",
      commercialized: m.comerc !== false,
      authorized: m.estado?.aut ? true : false,
      photo: m.fotos?.find(f => f.tipo === "materialas")?.url || "",
      docs: (m.docs || []).map(d => ({ tipo: d.tipo, url: d.urlHtml || d.url })),
      url: m.nregistro ? `https://cima.aemps.es/cima/publico/detalle.html?nregistro=${encodeURIComponent(m.nregistro)}` : "",
      source: "CIMA-AEMPS"
    }))
  };
}
