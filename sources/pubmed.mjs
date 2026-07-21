import { requestJSON, requestText } from "../cache.mjs";

const PUBMED_BASE = (process.env.PUBMED_BASE || "https://eutils.ncbi.nlm.nih.gov/entrez/eutils").replace(/\/$/, "");
const EMAIL = process.env.PUBMED_EMAIL || "contact@inurse-cima.local";
const API_KEY = process.env.PUBMED_API_KEY || "";

function baseParams() {
  const p = { db: "pubmed", email: EMAIL };
  if (API_KEY) p.api_key = API_KEY;
  return p;
}

function extractAll(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  const out = [];
  let m;
  while ((m = re.exec(xml))) out.push(m[1].trim());
  return out;
}

function extractFirst(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : "";
}

function parseArticleBlock(block) {
  const pmid = extractFirst(block, "PMID");
  const title = extractFirst(block, "ArticleTitle");
  if (!pmid || !title) return null;

  const abstractTexts = extractAll(block, "AbstractText");
  const abstract = abstractTexts.join(" ").slice(0, 1400);
  const journal = extractFirst(block, "Title");
  const year = parseInt(extractFirst(block, "Year") || "0", 10);
  const doi = (block.match(/<ELocationID EIdType="doi"[^>]*>([^<]+)<\/ELocationID>/) || [])[1] || "";

  const authorBlocks = extractAll(block, "Author");
  const authors = authorBlocks.slice(0, 10).map(a => {
    const last = extractFirst(a, "LastName");
    const fore = extractFirst(a, "ForeName");
    return last ? `${last} ${fore}`.trim() : "";
  }).filter(Boolean);

  return {
    id: `pubmed:${pmid}`,
    pmid,
    title,
    abstract,
    authors,
    journal,
    year,
    doi,
    source: "PubMed",
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`
  };
}

export async function searchPubMed(query, { page = 1, limit = 25 } = {}) {
  const retstart = (page - 1) * limit;
  const searchParams = new URLSearchParams({
    ...baseParams(),
    term: query,
    retmode: "json",
    retstart: String(retstart),
    retmax: String(limit)
  });

  const searchResult = await requestJSON(`${PUBMED_BASE}/esearch.fcgi?${searchParams}`, {
    ttl: 15 * 60 * 1000,
    label: "PubMed ESearch"
  });

  const pmids = searchResult?.esearchresult?.idlist || [];
  const total = parseInt(searchResult?.esearchresult?.count || "0", 10);

  if (pmids.length === 0) {
    return { items: [], total, page, query, source: "PubMed", fetchedAt: new Date().toISOString() };
  }

  const fetchParams = new URLSearchParams({
    ...baseParams(),
    id: pmids.join(","),
    retmode: "xml"
  });

  const xml = await requestText(`${PUBMED_BASE}/efetch.fcgi?${fetchParams}`, {
    ttl: 15 * 60 * 1000,
    label: "PubMed EFetch"
  });

  const blocks = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];
  const items = blocks.map(parseArticleBlock).filter(Boolean);

  return { items, total, page, query, source: "PubMed", fetchedAt: new Date().toISOString() };
}

export async function fetchPubMedArticle(pmid) {
  const params = new URLSearchParams({ ...baseParams(), id: pmid, retmode: "xml" });
  const xml = await requestText(`${PUBMED_BASE}/efetch.fcgi?${params}`, {
    ttl: 30 * 60 * 1000,
    label: "PubMed EFetch"
  });

  if (!xml.includes("<PubmedArticle>")) {
    throw new Error(`PubMed no encontró el artículo ${pmid}`);
  }

  const block = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/)?.[0] || "";
  const article = parseArticleBlock(block);
  if (!article) throw new Error(`No se pudo parsear el artículo ${pmid}`);

  return { ...article, fetchedAt: new Date().toISOString() };
}
