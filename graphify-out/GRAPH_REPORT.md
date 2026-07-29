# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 124 nodes · 223 edges · 17 communities (8 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.65)
- Token cost: 515 input · 150 output

## Graph Freshness
- Built from commit: `819dd76b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Server and Data Normalization
- Search Orchestration and AI
- API Client and Caching
- Web App Manifest
- Project Metadata
- Crossref API Integration
- PubMed API Integration
- Clinical Evidence Guidelines
- App Branding and Info
- Drug Dilution Logic
- Clinical Calculators
- Drug Reference Guide
- Service Worker Assets
- Crossref Source
- Europe PMC Source
- PubMed (NCBI/NLM)
- Render Configuration

## God Nodes (most connected - your core abstractions)
1. `requestJSON()` - 29 edges
2. `searchAllSources()` - 12 edges
3. `searchPubMed()` - 8 edges
4. `requestText()` - 7 edges
5. `mapWork()` - 7 edges
6. `searchCrossref()` - 6 edges
7. `searchOpenFDA()` - 6 edges
8. `prepareOrchestration()` - 6 edges
9. `searchClinicalTrials()` - 5 edges
10. `fetchCrossrefWork()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `epmc()` --calls--> `requestJSON()`  [EXTRACTED]
  server.mjs → cache.mjs
- `cima()` --calls--> `requestJSON()`  [EXTRACTED]
  server.mjs → cache.mjs
- `fetchClinicalTrial()` --calls--> `requestJSON()`  [EXTRACTED]
  sources/clinicaltrials.mjs → cache.mjs
- `fetchCrossrefWork()` --calls--> `requestJSON()`  [EXTRACTED]
  sources/crossref.mjs → cache.mjs
- `searchCrossref()` --calls--> `requestJSON()`  [EXTRACTED]
  sources/crossref.mjs → cache.mjs

## Import Cycles
- None detected.

## Communities (17 total, 9 thin omitted)

### Community 0 - "Server and Data Normalization"
Cohesion: 0.11
Nodes (15): cache_obj, cima(), CIMA_BASE, __dirname, epmc(), EPMC_BASE, LITERATURE_SOURCES, medicineDetail() (+7 more)

### Community 1 - "Search Orchestration and AI"
Cohesion: 0.19
Nodes (19): searchNICE(), assembleContext(), buildSourcesPayload(), buildSystemPrompt(), callGemini(), detectDrugName(), DRUG_KEYWORDS, DRUG_NAMES (+11 more)

### Community 2 - "API Client and Caching"
Cohesion: 0.20
Nodes (15): cache, cacheGet(), cacheSet(), httpRequest(), requestJSON(), requestText(), fetchClinicalTrial(), searchClinicalTrials() (+7 more)

### Community 3 - "Web App Manifest"
Cohesion: 0.12
Nodes (15): background_color, categories, description, display, icons, lang, name, orientation (+7 more)

### Community 4 - "Project Metadata"
Cohesion: 0.20
Nodes (9): description, engines, node, main, name, scripts, start, type (+1 more)

### Community 5 - "Crossref API Integration"
Cohesion: 0.42
Nodes (8): CROSSREF_BASE, fetchCrossrefWork(), formatAuthors(), formatDate(), formatYear(), mapWork(), searchCrossref(), stripAbstract()

### Community 6 - "PubMed API Integration"
Cohesion: 0.46
Nodes (7): baseParams(), extractAll(), extractFirst(), fetchPubMedArticle(), parseArticleBlock(), PUBMED_BASE, searchPubMed()

### Community 8 - "App Branding and Info"
Cohesion: 0.67
Nodes (3): iNurse v28.1 · CIMA AEMPS + Procedimientos integrados, Biblioteca de Evidencia, Literatura Científica

## Knowledge Gaps
- **47 isolated node(s):** `cache`, `name`, `version`, `description`, `type` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requestJSON()` connect `API Client and Caching` to `Server and Data Normalization`, `Search Orchestration and AI`, `Crossref API Integration`, `PubMed API Integration`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `searchPubMed()` connect `PubMed API Integration` to `Server and Data Normalization`, `Search Orchestration and AI`, `API Client and Caching`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `searchPubMed()` (e.g. with `server.mjs` and `parseArticleBlock()`) actually correct?**
  _`searchPubMed()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `cache`, `name`, `version` to the rest of the system?**
  _47 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Server and Data Normalization` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._
- **Should `Web App Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._