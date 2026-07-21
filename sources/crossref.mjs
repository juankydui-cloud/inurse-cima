import { requestJSON } from "../cache.mjs";

const CROSSREF_BASE = (process.env.CROSSREF_BASE || "https://api.crossref.org/v1").replace(/\/$/, "");
const MAILTO = process.env.CROSSREF_MAILTO || "contact@inurse-cima.local";

function formatYear(work) {
  return work.issued?.["date-parts"]?.[0]?.[0]
    || work["published-online"]?.["date-parts"]?.[0]?.[0]
    || work["published-print"]?.["date-parts"]?.[0]?.[0]
    || 0;
}

function formatDate(dateParts) {
  if (!dateParts?.length) return "";
  const [y, m, d] = dateParts;
  if (!y) return "";
  return [y, m && String(m).padStart(2, "0"), d && String(d).padStart(2, "0")].filter(Boolean).join("-");
}

function formatAuthors(authorList, max) {
  return (authorList || []).slice(0, max).map(a => ({
    name: `${a.given || ""} ${a.family || ""}`.trim(),
    orcid: a.ORCID || ""
  })).filter(a => a.name);
}

function stripAbstract(raw) {
  if (!raw) return "";
  return raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1400);
}

function mapWork(work) {
  return {
    id: `crossref:${work.DOI}`,
    doi: work.DOI || "",
    title: work.title?.[0] || "",
    authors: formatAuthors(work.author, 10),
    journal: work["container-title"]?.[0] || "",
    year: formatYear(work),
    published: formatDate(work.issued?.["date-parts"]?.[0]),
    abstract: stripAbstract(work.abstract),
    type: work.type || "journal-article",
    citedBy: work["is-referenced-by-count"] || 0,
    source: "Crossref",
    url: `https://doi.org/${work.DOI}`
  };
}

export async function searchCrossref(query, { page = 1, limit = 25 } = {}) {
  const params = new URLSearchParams({
    query,
    rows: String(limit),
    offset: String((page - 1) * limit),
    mailto: MAILTO
  });

  const result = await requestJSON(`${CROSSREF_BASE}/works?${params}`, {
    ttl: 15 * 60 * 1000,
    label: "Crossref"
  });

  const items = (result?.message?.items || []).map(mapWork);
  const total = result?.message?.["total-results"] || items.length;

  return { items, total, page, query, source: "Crossref", fetchedAt: new Date().toISOString() };
}

export async function fetchCrossrefWork(doi) {
  const result = await requestJSON(`${CROSSREF_BASE}/works/${encodeURIComponent(doi)}?mailto=${MAILTO}`, {
    ttl: 30 * 60 * 1000,
    label: "Crossref"
  });

  const work = result?.message;
  if (!work) throw new Error(`Crossref no encontró el DOI ${doi}`);

  const base = mapWork(work);
  return {
    ...base,
    authors: formatAuthors(work.author, 50),
    funding: (work.funding || []).map(f => ({ funder: f.name, award: f.award?.[0] || "" })).filter(f => f.funder),
    references: work["reference-count"] || 0,
    license: (work.license || []).map(l => ({ url: l.URL, delay: l["delay-in-days"] })),
    fetchedAt: new Date().toISOString()
  };
}
