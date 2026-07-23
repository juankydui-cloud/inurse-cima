import { requestJSON } from "../cache.mjs";

const CT_BASE = "https://clinicaltrials.gov/api/v2";

export async function searchClinicalTrials(query, { limit = 10 } = {}) {
  const params = new URLSearchParams({
    "query.term": query,
    pageSize: String(Math.min(limit, 25)),
    format: "json"
  });

  try {
    const raw = await requestJSON(`${CT_BASE}/studies?${params}`, {
      ttl: 30 * 60 * 1000,
      label: "ClinicalTrials.gov"
    });

    const studies = raw?.studies || [];
    return {
      items: studies.slice(0, limit).map(s => {
        const prot = s.protocolSection || {};
        const id = prot.identificationModule?.nctId || s.nctId || "";
        const title = prot.identificationModule?.officialTitle || prot.identificationModule?.briefTitle || "(sin título)";
        const status = prot.statusModule?.overallStatus || "";
        const phase = prot.designModule?.phases?.[0] || "";
        const org = prot.identificationModule?.organization?.name || "";
        const start = prot.statusModule?.startDateStruct?.date || "";

        return {
          id,
          title: String(title).slice(0, 300),
          nctId: id,
          status,
          phase,
          organization: org,
          startDate: start,
          url: `https://clinicaltrials.gov/study/${id}`,
          source: "ClinicalTrials.gov"
        };
      })
    };
  } catch (err) {
    throw new Error(`ClinicalTrials.gov: ${err.message}`);
  }
}

export async function fetchClinicalTrial(nctId) {
  if (!nctId || nctId.length < 5) throw new Error("NCT ID inválido");

  try {
    const raw = await requestJSON(`${CT_BASE}/studies/${encodeURIComponent(nctId)}`, {
      ttl: 60 * 60 * 1000,
      label: "ClinicalTrials.gov (detalle)"
    });

    const prot = raw?.protocolSection || {};
    const id = prot.identificationModule?.nctId || nctId;

    return {
      id,
      title: prot.identificationModule?.officialTitle || prot.identificationModule?.briefTitle || "(sin título)",
      status: prot.statusModule?.overallStatus || "",
      phase: prot.designModule?.phases?.[0] || "",
      organization: prot.identificationModule?.organization?.name || "",
      startDate: prot.statusModule?.startDateStruct?.date || "",
      primaryCompletion: prot.statusModule?.primaryCompletionDateStruct?.date || "",
      locations: (prot.contactsLocationsModule?.locations || []).slice(0, 5).map(l => l.city + (l.country ? `, ${l.country}` : "")).join("; "),
      purpose: prot.designModule?.purposeText || "",
      conditions: (prot.conditionsModule?.conditions || []).slice(0, 10),
      interventions: (prot.armsInterventionsModule?.interventions || []).map(i => i.name).slice(0, 10),
      url: `https://clinicaltrials.gov/study/${id}`,
      source: "ClinicalTrials.gov"
    };
  } catch (err) {
    throw new Error(`ClinicalTrials.gov (detalle): ${err.message}`);
  }
}
