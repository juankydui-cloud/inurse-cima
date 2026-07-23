import { requestJSON } from "../cache.mjs";

const WHO_IRIS = "https://iris.who.int/server/api/discover/search/objects";

export async function searchWHO(query, { limit = 10 } = {}) {
  const params = new URLSearchParams({
    query: query,
    size: String(Math.min(limit, 50)),
    sort: "score,DESC"
  });

  try {
    const raw = await requestJSON(`${WHO_IRIS}?${params}`, {
      ttl: 30 * 60 * 1000,
      label: "WHO IRIS"
    });

    const docs = raw?.objects || raw?._embedded?.objects || [];
    return {
      items: docs.slice(0, limit).map(d => {
        const handle = d.handle || d.uuid || "";
        const title = d.name || d.title || "(sin título)";
        const type = d.type || d["dc.type"] || "documento";
        const date = d["dc.date.issued"] || d.dateIssued || "";
        const lang = d["dc.language"] ? Array.isArray(d["dc.language"]) ? d["dc.language"][0] : d["dc.language"] : "es";

        return {
          id: handle,
          title: String(title).slice(0, 300),
          type,
          date,
          language: lang,
          url: handle ? `https://iris.who.int/handle/${handle}` : "",
          source: "WHO IRIS"
        };
      })
    };
  } catch (err) {
    throw new Error(`WHO IRIS: ${err.message}`);
  }
}

export async function fetchWHODocument(handle) {
  if (!handle || handle.length < 5) throw new Error("Handle inválido");

  try {
    const raw = await requestJSON(`${WHO_IRIS.replace("/objects", "")}/${encodeURIComponent(handle)}`, {
      ttl: 60 * 60 * 1000,
      label: "WHO IRIS (detalle)"
    });

    const doc = raw || {};
    const title = doc.name || doc.title || "(sin título)";
    const type = doc.type || doc["dc.type"] || "";
    const date = doc["dc.date.issued"] || doc.dateIssued || "";
    const authors = doc["dc.creator"] || doc.authors || [];
    const summary = doc.description || doc["dc.description"] || "";
    const subjects = doc["dc.subject"] || [];

    return {
      id: handle,
      title: String(title).slice(0, 500),
      type,
      date,
      authors: Array.isArray(authors) ? authors.slice(0, 10) : [authors],
      summary: String(summary).slice(0, 1200),
      subjects: Array.isArray(subjects) ? subjects.slice(0, 15) : [],
      url: `https://iris.who.int/handle/${handle}`,
      source: "WHO IRIS"
    };
  } catch (err) {
    throw new Error(`WHO IRIS (detalle): ${err.message}`);
  }
}
