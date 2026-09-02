import { requestJSON } from "../cache.mjs";

const EPMC_BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest";

function stripTags(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ").trim();
}

export async function searchEuropePMC(query, { limit = 10 } = {}) {
  const params = new URLSearchParams({
    query,
    format: "json",
    resultType: "core",
    pageSize: String(Math.min(limit, 25))
  });
  const raw = await requestJSON(`${EPMC_BASE}/search?${params}`, {
    ttl: 15 * 60 * 1000,
    label: "Europe PMC"
  });
  const list = raw?.resultList?.result || [];
  return {
    items: list.map(r => ({
      id: r.id || "",
      source: "Europe PMC",
      pmid: r.pmid || "",
      doi: r.doi || "",
      title: stripTags(r.title).slice(0, 400) || "(sin título)",
      authors: stripTags(r.authorString).slice(0, 240),
      journal: stripTags(r.journalInfo?.journal?.title || r.journalTitle || "").slice(0, 160),
      year: r.pubYear || "",
      url: r.doi ? `https://doi.org/${r.doi}`
        : (r.source && r.id ? `https://europepmc.org/article/${r.source}/${r.id}` : "")
    })).filter(i => i.title && i.title !== "(sin título)"),
    total: raw?.hitCount ?? list.length
  };
}
