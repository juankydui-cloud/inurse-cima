import { requestJSON } from "../cache.mjs";

const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const EMAIL = "contact@inurse-cima.local";

function normalizeAuthors(authorList) {
  if (!authorList) return [];
  if (!Array.isArray(authorList)) return [];
  return authorList.slice(0, 10).map(author => ({
    name: author.Name || "",
    initials: author.Initials || "",
    affiliation: author.Affiliation || ""
  })).filter(a => a.name);
}

function parseArticleXML(article) {
  const pmid = article.MedlineCitation?.[0]?.PMID?.[0]?._ || article.MedlineCitation?.[0]?.PMID?.[0] || "";
  const article_ = article.MedlineCitation?.[0]?.Article?.[0] || {};

  return {
    pmid: String(pmid),
    title: article_.ArticleTitle?.[0]?._ || article_.ArticleTitle?.[0] || "",
    abstract: article_.Abstract?.[0]?.AbstractText?.[0]?._ || article_.Abstract?.[0]?.AbstractText?.[0] || "",
    journal: article_.Journal?.[0]?.Title?.[0] || "",
    year: parseInt(article_.Article?.[0]?.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0]?.Year?.[0] ||
                   article_.PublicationTypeList?.[0]?.PublicationType || 0),
    authors: normalizeAuthors(article_.AuthorList?.[0]?.Author),
    doi: article_.ELocationID?.find(e => e.$.EIdType === "doi")?._ || "",
    pubTypes: article_.PublicationTypeList?.[0]?.PublicationType?.map(p => p._) || [],
    mesh: article_.MeshHeadingList?.[0]?.MeshHeading?.map(m => m.DescriptorName?.[0]?._) || []
  };
}

export async function searchPubMed(query, { page = 1, limit = 25 } = {}) {
  const retstart = (page - 1) * limit;

  try {
    const searchParams = new URLSearchParams({
      db: "pubmed",
      term: query,
      rettype: "json",
      retmode: "json",
      retstart: String(retstart),
      retmax: String(limit),
      email: EMAIL,
      api_key: process.env.PUBMED_API_KEY || ""
    });

    const searchUrl = `${PUBMED_BASE}/esearch.fcgi?${searchParams}`;
    const searchResponse = await fetch(searchUrl);
    const searchResult = await searchResponse.json();

    const pmids = searchResult?.esearchresult?.idlist || [];
    if (pmids.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        query,
        source: "PubMed"
      };
    }

    const fetchParams = new URLSearchParams({
      db: "pubmed",
      id: pmids.join(","),
      rettype: "xml",
      retmode: "xml",
      email: EMAIL,
      api_key: process.env.PUBMED_API_KEY || ""
    });

    const fetchUrl = `${PUBMED_BASE}/efetch.fcgi?${fetchParams}`;
    const fetchResponse = await fetch(fetchUrl);
    const fetchXml = await fetchResponse.text();

    const articles = [];
    const articleRegex = /<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g;
    const matches = fetchXml.match(articleRegex) || [];

    for (const match of matches.slice(0, limit)) {
      try {
        const pmid = match.match(/<PMID[^>]*>([^<]+)<\/PMID>/)?.[1] || "";
        const title = match.match(/<ArticleTitle>([^<]+)<\/ArticleTitle>/)?.[1] || "";
        const abstract = match.match(/<AbstractText>([^<]+)<\/AbstractText>/)?.[1] || "";
        const journal = match.match(/<Title>([^<]+)<\/Title>/)?.[1] || "";
        const year = parseInt(match.match(/<Year>(\d{4})<\/Year>/)?.[1] || 0);

        if (pmid && title) {
          articles.push({
            pmid,
            title,
            abstract: abstract.slice(0, 1400),
            journal,
            year,
            source: "PubMed",
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`
          });
        }
      } catch (e) {
        console.error("Error parsing article:", e.message);
      }
    }

    return {
      items: articles,
      total: parseInt(searchResult?.esearchresult?.count || 0),
      page,
      query,
      source: "PubMed",
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`PubMed search failed: ${error.message}`);
  }
}

export async function fetchPubMedArticle(pmid) {
  try {
    const params = new URLSearchParams({
      db: "pubmed",
      id: pmid,
      rettype: "xml",
      retmode: "xml",
      email: EMAIL,
      api_key: process.env.PUBMED_API_KEY || ""
    });

    const url = `${PUBMED_BASE}/efetch.fcgi?${params}`;
    const xml = await fetch(url).then(r => r.text());

    const pmidMatch = xml.match(/<PMID[^>]*>([^<]+)<\/PMID>/)?.[1];
    const title = xml.match(/<ArticleTitle>([^<]+)<\/ArticleTitle>/)?.[1] || "";
    const abstract = xml.match(/<AbstractText>([^<]+)<\/AbstractText>/)?.[1] || "";
    const journal = xml.match(/<Title>([^<]+)<\/Title>/)?.[1] || "";
    const year = parseInt(xml.match(/<Year>(\d{4})<\/Year>/)?.[1] || 0);
    const doi = xml.match(/<ELocationID EIdType="doi">([^<]+)<\/ELocationID>/)?.[1] || "";

    return {
      id: `pubmed:${pmid}`,
      pmid,
      title,
      abstract,
      journal,
      year,
      doi,
      source: "PubMed",
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to fetch PubMed article ${pmid}: ${error.message}`);
  }
}
