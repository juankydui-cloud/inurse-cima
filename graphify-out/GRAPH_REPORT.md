# Graph Report - /home/user/inurse-cima  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 117 nodes · 221 edges · 13 communities (8 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `50e6851d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server.mjs
- orchestrator.mjs
- requestJSON
- manifest.json
- package.json
- crossref.mjs
- pubmed.mjs
- guias.js
- openfda.mjs
- diluciones.js
- escalas.js
- vademecum.js
- sw.js

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
- `cima()` --calls--> `requestJSON()`  [EXTRACTED]
  server.mjs → cache.mjs
- `epmc()` --calls--> `requestJSON()`  [EXTRACTED]
  server.mjs → cache.mjs
- `fetchClinicalTrial()` --calls--> `requestJSON()`  [EXTRACTED]
  sources/clinicaltrials.mjs → cache.mjs
- `searchClinicalTrials()` --calls--> `requestJSON()`  [EXTRACTED]
  sources/clinicaltrials.mjs → cache.mjs
- `fetchCrossrefWork()` --calls--> `requestJSON()`  [EXTRACTED]
  sources/crossref.mjs → cache.mjs

## Import Cycles
- None detected.

## Communities (13 total, 5 thin omitted)

### Community 0 - "server.mjs"
Cohesion: 0.12
Nodes (14): cache_obj, cima(), CIMA_BASE, __dirname, EPMC_BASE, LITERATURE_SOURCES, medicineDetail(), normalizeList() (+6 more)

### Community 1 - "orchestrator.mjs"
Cohesion: 0.19
Nodes (18): searchClinicalTrials(), assembleContext(), buildSourcesPayload(), buildSystemPrompt(), callGemini(), detectDrugName(), DRUG_KEYWORDS, DRUG_NAMES (+10 more)

### Community 2 - "requestJSON"
Cohesion: 0.20
Nodes (14): cache, cacheGet(), cacheSet(), httpRequest(), requestJSON(), requestText(), epmc(), fetchClinicalTrial() (+6 more)

### Community 3 - "manifest.json"
Cohesion: 0.12
Nodes (15): background_color, categories, description, display, icons, lang, name, orientation (+7 more)

### Community 4 - "package.json"
Cohesion: 0.20
Nodes (9): description, engines, node, main, name, scripts, start, type (+1 more)

### Community 5 - "crossref.mjs"
Cohesion: 0.42
Nodes (8): CROSSREF_BASE, fetchCrossrefWork(), formatAuthors(), formatDate(), formatYear(), mapWork(), searchCrossref(), stripAbstract()

### Community 6 - "pubmed.mjs"
Cohesion: 0.46
Nodes (7): baseParams(), extractAll(), extractFirst(), fetchPubMedArticle(), parseArticleBlock(), PUBMED_BASE, searchPubMed()

### Community 8 - "openfda.mjs"
Cohesion: 0.83
Nodes (3): searchOpenFDA(), searchOpenFDAByIndication(), truncate()

## Knowledge Gaps
- **41 isolated node(s):** `cache`, `name`, `version`, `description`, `type` (+36 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requestJSON()` connect `requestJSON` to `server.mjs`, `orchestrator.mjs`, `crossref.mjs`, `pubmed.mjs`, `openfda.mjs`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `searchPubMed()` connect `pubmed.mjs` to `server.mjs`, `orchestrator.mjs`, `requestJSON`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `searchPubMed()` (e.g. with `server.mjs` and `parseArticleBlock()`) actually correct?**
  _`searchPubMed()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `cache`, `name`, `version` to the rest of the system?**
  _41 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.12105263157894737 - nodes in this community are weakly interconnected._
- **Should `manifest.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._