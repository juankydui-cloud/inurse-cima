import { requestJSON } from "../cache.mjs";

const CROSSREF_BASE = "https://api.crossref.org/v1";

export async function searchCrossref(query, { page = 1, limit = 25 } = {}) {
  try {
    const params = new URLSearchParams({
      query,
      rows: String(limit),
      offset: String((page - 1) * limit),
      mailto: "contact@inurse-cima.local"
    });

    const url = `${CROSSREF_BASE}/works?${params}`;
    const result = await requestJSON(url, {
      ttl: 15 * 60 * 1000,
      label: "Crossref Search"
    });

    const items = (result?.message?.items || []).map(work => ({
      id: `crossref:${work.DOI}`,
      doi: work.DOI || "",
      title: work.title?.[0] || work.title || "",
      authors: (work["author"] || []).slice(0, 10).map(a => ({
        name: `${a.given || ""} ${a.family || ""}`.trim(),
        orcid: a.ORCID || ""
      })).filter(a => a.name),
      journal: work["container-title"]?.[0] || work["container-title"] || "",
      year: work.issued?.["date-parts"]?.[0]?.[0] || work["published-online"]?.["date-parts"]?.[0]?.[0] || 0,
      abstract: work.abstract || "",
      type: work.type || "journal-article",
      published: work.issued?.["date-parts"]?.[0] ? new Date(...work.issued["date-parts"][0]).toISOString() : "",
      citedBy: work["is-referenced-by-count"] || 0,
      source: "Crossref",
      url: `https://doi.org/${work.DOI}`
    }));

    return {
      items,
      total: result?.message?.["total-results"] || items.length,
      page,
      query,
      source: "Crossref",
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Crossref search failed: ${error.message}`);
  }
}

export async function fetchCrossrefWork(doi) {
  try {
    const encodedDoi = encodeURIComponent(doi);
    const url = `${CROSSREF_BASE}/works/${encodedDoi}?mailto=contact@inurse-cima.local`;
    const result = await requestJSON(url, {
      ttl: 30 * 60 * 1000,
      label: "Crossref Work Fetch"
    });

    const work = result?.message || {};

    return {
      id: `crossref:${work.DOI}`,
      doi: work.DOI || "",
      title: work.title?.[0] || work.title || "",
      authors: (work["author"] || []).slice(0, 50).map(a => ({
        name: `${a.given || ""} ${a.family || ""}`.trim(),
        orcid: a.ORCID || "",
        affiliation: a.affiliation?.map(aff => aff.name).join(", ") || ""
      })).filter(a => a.name),
      journal: work["container-title"]?.[0] || work["container-title"] || "",
      year: work.issued?.["date-parts"]?.[0]?.[0] || 0,
      abstract: work.abstract || "",
      type: work.type || "journal-article",
      published: work.issued?.["date-parts"]?.[0] ? new Date(...work.issued["date-parts"][0]).toISOString() : "",
      citedBy: work["is-referenced-by-count"] || 0,
      funding: (work.funding || []).map(f => ({
        funder: f.name,
        award: f.award?.[0] || ""
      })).filter(f => f.funder),
      references: work["reference-count"] || 0,
      license: work.license?.map(l => ({
        type: l.URL,
        delay: l["delay-in-days"]
      })) || [],
      source: "Crossref",
      url: `https://doi.org/${work.DOI}`,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to fetch Crossref work ${doi}: ${error.message}`);
  }
}

export async function searchByDoi(doi) {
  return fetchCrossrefWork(doi);
}
