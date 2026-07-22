import { requestJSON } from "../cache.mjs";

const FDA_BASE = "https://api.fda.gov/drug/label.json";

function truncate(text, max = 600) {
  if (!text) return "";
  return text.length <= max ? text : text.slice(0, max) + "...";
}

export async function searchOpenFDA(drugName) {
  if (!drugName || drugName.length < 2) return null;

  const searches = [
    `openfda.generic_name:"${drugName}"`,
    `openfda.brand_name:"${drugName}"`,
    `openfda.substance_name:"${drugName}"`
  ];

  for (const searchQuery of searches) {
    try {
      const url = `${FDA_BASE}?search=${encodeURIComponent(searchQuery)}&limit=1`;
      const data = await requestJSON(url, { ttl: 30 * 60 * 1000, label: "OpenFDA" });

      if (!data?.results?.length) continue;
      const drug = data.results[0];

      return {
        source: "OpenFDA",
        brandName: drug.openfda?.brand_name?.[0] || "",
        genericName: drug.openfda?.generic_name?.[0] || "",
        manufacturer: drug.openfda?.manufacturer_name?.[0] || "",
        route: drug.openfda?.route?.[0] || "",
        indications: truncate(drug.indications_and_usage?.[0], 800),
        dosage: truncate(drug.dosage_and_administration?.[0], 800),
        contraindications: truncate(drug.contraindications?.[0], 600),
        warnings: truncate(drug.warnings_and_cautions?.[0] || drug.warnings?.[0], 600),
        adverseReactions: truncate(drug.adverse_reactions?.[0], 600),
        interactions: truncate(drug.drug_interactions?.[0], 600),
        specialPopulations: truncate(drug.use_in_specific_populations?.[0], 400),
        boxedWarning: drug.boxed_warning?.[0] || null
      };
    } catch {
      continue;
    }
  }

  return null;
}

export async function searchOpenFDAByIndication(indication) {
  if (!indication || indication.length < 3) return [];

  try {
    const url = `${FDA_BASE}?search=indications_and_usage:"${encodeURIComponent(indication)}"&limit=3`;
    const data = await requestJSON(url, { ttl: 30 * 60 * 1000, label: "OpenFDA" });

    return (data?.results || []).map(drug => ({
      source: "OpenFDA",
      brandName: drug.openfda?.brand_name?.[0] || "",
      genericName: drug.openfda?.generic_name?.[0] || "",
      manufacturer: drug.openfda?.manufacturer_name?.[0] || "",
      route: drug.openfda?.route?.[0] || "",
      indications: truncate(drug.indications_and_usage?.[0], 400),
      boxedWarning: drug.boxed_warning?.[0] || null
    }));
  } catch {
    return [];
  }
}
