export async function searchMockPubMed(query, { page = 1, limit = 25 } = {}) {
  return {
    items: [
      {
        pmid: "33434567",
        title: `Type 2 Diabetes Mellitus: Management and Complications - ${query}`,
        abstract: "This systematic review examines current management strategies for type 2 diabetes mellitus, including pharmacological and lifestyle interventions. We analyzed 150 randomized controlled trials published between 2020-2023.",
        journal: "Journal of Internal Medicine",
        year: 2023,
        source: "PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/33434567"
      },
      {
        pmid: "33445678",
        title: `Glycemic Control and Cardiovascular Outcomes in ${query} Prevention`,
        abstract: "Long-term follow-up study examining the relationship between glycemic control and cardiovascular outcomes in patients with prediabetes.",
        journal: "Diabetes Care",
        year: 2023,
        source: "PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/33445678"
      }
    ],
    total: 12543,
    page,
    query,
    source: "PubMed",
    fetchedAt: new Date().toISOString()
  };
}

export async function searchMockCrossref(query, { page = 1, limit = 25 } = {}) {
  return {
    items: [
      {
        id: `crossref:10.1038/s41591-023-01234-y`,
        doi: "10.1038/s41591-023-01234-y",
        title: `Mechanisms of action of GLP-1 receptor agonists in ${query}`,
        authors: [
          { name: "Smith John", orcid: "" },
          { name: "Johnson Sarah", orcid: "" }
        ],
        journal: "Nature Medicine",
        year: 2023,
        abstract: "Review of the molecular mechanisms underlying the glucose-lowering and cardiovascular benefits of glucagon-like peptide-1 receptor agonists.",
        type: "journal-article",
        published: "2023-04-15T00:00:00Z",
        citedBy: 156,
        source: "Crossref",
        url: "https://doi.org/10.1038/s41591-023-01234-y"
      },
      {
        id: `crossref:10.1016/S0140-6736(23)01234-5`,
        doi: "10.1016/S0140-6736(23)01234-5",
        title: `Global burden of ${query} in 2023: epidemiology and forecasts`,
        authors: [
          { name: "Wang Michael", orcid: "" },
          { name: "Zhang Liu", orcid: "" }
        ],
        journal: "The Lancet",
        year: 2023,
        abstract: "Global disease burden analysis of diabetes mellitus, including prevalence, mortality, and disability-adjusted life years.",
        type: "journal-article",
        published: "2023-05-20T00:00:00Z",
        citedBy: 89,
        source: "Crossref",
        url: "https://doi.org/10.1016/S0140-6736(23)01234-5"
      }
    ],
    total: 87234,
    page,
    query,
    source: "Crossref",
    fetchedAt: new Date().toISOString()
  };
}

export async function fetchMockArticle(id) {
  return {
    id,
    title: "Sample Article for Testing",
    abstract: "This is a test article for demonstrating the literature search API functionality.",
    journal: "Test Journal",
    year: 2023,
    authors: [
      { name: "Test Author", orcid: "" }
    ],
    source: "Mock",
    url: "https://example.com/article",
    fetchedAt: new Date().toISOString()
  };
}
