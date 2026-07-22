import { requestJSON } from "../cache.mjs";

const NICE_BASE = "https://api.nice.org.uk/services";
const NICE_API_KEY = process.env.NICE_API_KEY || "";

export async function searchNICE(query, { limit = 10 } = {}) {
  const params = new URLSearchParams({
    q: query,
    ps: String(Math.min(limit, 25)),
    pa: "1",
    sp: "Relevance"
  });
  const niceHeaders = NICE_API_KEY ? { "Api-Key": NICE_API_KEY } : {};
  const raw = await requestJSON(`${NICE_BASE}/search?${params}`, {
    ttl: 30 * 60 * 1000,
    label: "NICE",
    headers: niceHeaders
  });
  const docs = raw?.documents || raw?.Documents || [];
  return {
    items: docs.map(d => ({
      id: d.id || d.Id || "",
      title: d.title || d.Title || "(sin título)",
      url: d.url || d.Url || d.pathAndQuery || "",
      date: d.publicationDate || d.PublicationDate || "",
      type: d.documentType || d.DocumentType || d.guidanceType || "",
      summary: (d.telesummary || d.TeleSummary || d.summary || "")
        .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 600),
      source: "NICE"
    })).filter(i => i.title && i.title !== "(sin título)")
  };
}
