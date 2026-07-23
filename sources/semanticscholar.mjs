import { requestJSON } from "../cache.mjs";

const SS_BASE = "https://api.semanticscholar.org/graph/v1/paper";

export async function searchSemanticScholar(query, { limit = 10 } = {}) {
  const params = new URLSearchParams({
    query: query,
    limit: String(Math.min(limit, 100)),
    fields: "paperId,title,year,authors,abstract,venue,isOpenAccess,externalIds"
  });

  try {
    const raw = await requestJSON(`${SS_BASE}/search?${params}`, {
      ttl: 30 * 60 * 1000,
      label: "Semantic Scholar"
    });

    const papers = raw?.data || [];
    return {
      items: papers.slice(0, limit).map(p => {
        const doi = p.externalIds?.DOI || "";
        const pubmedId = p.externalIds?.PubMed || "";
        const arxivId = p.externalIds?.ArXiv || "";

        return {
          id: p.paperId || "",
          title: p.title || "(sin título)",
          year: p.year || "",
          authors: (p.authors || []).map(a => a.name).slice(0, 5).join(", "),
          abstract: String(p.abstract || "").slice(0, 600),
          venue: p.venue || "",
          doi,
          pubmedId,
          arxivId,
          isOpenAccess: p.isOpenAccess || false,
          url: doi
            ? `https://doi.org/${doi}`
            : arxivId
            ? `https://arxiv.org/abs/${arxivId}`
            : pubmedId
            ? `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}`
            : `https://www.semanticscholar.org/paper/${p.paperId}`,
          source: "Semantic Scholar"
        };
      })
    };
  } catch (err) {
    throw new Error(`Semantic Scholar: ${err.message}`);
  }
}

export async function fetchSemanticScholarPaper(paperId) {
  if (!paperId || paperId.length < 3) throw new Error("ID de paper inválido");

  try {
    const raw = await requestJSON(
      `${SS_BASE}/${encodeURIComponent(paperId)}?fields=paperId,title,year,authors,abstract,venue,isOpenAccess,citationCount,influentialCitationCount,externalIds,publicationVenue,publicationDate`,
      {
        ttl: 60 * 60 * 1000,
        label: "Semantic Scholar (detalle)"
      }
    );

    const doi = raw.externalIds?.DOI || "";
    const pubmedId = raw.externalIds?.PubMed || "";

    return {
      id: raw.paperId || paperId,
      title: raw.title || "(sin título)",
      year: raw.year || "",
      authors: (raw.authors || []).map(a => a.name).join(", "),
      abstract: raw.abstract || "",
      venue: raw.venue || raw.publicationVenue?.name || "",
      doi,
      pubmedId,
      citations: raw.citationCount || 0,
      influentialCitations: raw.influentialCitationCount || 0,
      isOpenAccess: raw.isOpenAccess || false,
      publicationDate: raw.publicationDate || "",
      url: doi
        ? `https://doi.org/${doi}`
        : pubmedId
        ? `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}`
        : `https://www.semanticscholar.org/paper/${raw.paperId}`,
      source: "Semantic Scholar"
    };
  } catch (err) {
    throw new Error(`Semantic Scholar (detalle): ${err.message}`);
  }
}
