# Graph Report - .  (2026-07-28)

## Corpus Check
- Large corpus: 26 files · ~1,294,910 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 137 nodes · 236 edges · 14 communities (9 shown, 5 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.78)
- Token cost: 0 input · 217,406 output

## Community Hubs (Navigation)
- Fuentes externas + Orquestador Vivi
- Servidor Node (server.mjs)
- Páginas Evidencia/Literatura + Config Render
- Manifest PWA
- Caché + Fuente PubMed
- Configuración del paquete
- Fuente Crossref
- Fuentes citadas (PMC/PubMed/Crossref)
- Datos: Guías clínicas
- Iconos de la app (branding)
- Datos: Diluciones
- Datos: Escalas/Calculadoras
- Datos: Vademécum
- Service Worker (offline)

## God Nodes (most connected - your core abstractions)
1. `requestJSON()` - 29 edges
2. `searchAllSources()` - 12 edges
3. `searchPubMed()` - 8 edges
4. `requestText()` - 7 edges
5. `mapWork()` - 7 edges
6. `searchCrossref()` - 6 edges
7. `searchOpenFDA()` - 6 edges
8. `inurse-cima Render web service` - 6 edges
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

## Hyperedges (group relationships)
- **Evidence library search flow (evidencia.html)** — public_evidencia_areas, public_evidencia_buildquery, public_evidencia_runsearch, public_evidencia_api_pmc_search, public_evidencia_rendercard [EXTRACTED 1.00]
- **Literature search flow (literatura.html)** — public_literatura_areas, public_literatura_buildquery, public_literatura_runsearch, public_literatura_api_literature_search, public_literatura_rendercard [EXTRACTED 1.00]
- **inurse-cima service and its external-API credentials** — render_inurse_cima_service, render_pubmed_api_key, render_pubmed_email, render_crossref_mailto, render_gemini_api_key, render_nice_api_key [EXTRACTED 1.00]

## Communities (14 total, 5 thin omitted)

### Community 0 - "Fuentes externas + Orquestador Vivi"
Cohesion: 0.16
Nodes (23): requestJSON(), fetchClinicalTrial(), searchClinicalTrials(), searchNICE(), searchOpenFDA(), searchOpenFDAByIndication(), truncate(), assembleContext() (+15 more)

### Community 1 - "Servidor Node (server.mjs)"
Cohesion: 0.11
Nodes (16): cache_obj, cima(), CIMA_BASE, __dirname, epmc(), EPMC_BASE, LITERATURE_SOURCES, medicineDetail() (+8 more)

### Community 2 - "Páginas Evidencia/Literatura + Config Render"
Cohesion: 0.15
Nodes (17): /api/pmc/search endpoint, AREAS specialty taxonomy (evidencia.html), buildQuery (evidencia.html), renderCard (evidencia.html), runSearch (evidencia.html), /api/literature/search endpoint, AREAS specialty taxonomy (literatura.html), buildQuery (literatura.html) (+9 more)

### Community 3 - "Manifest PWA"
Cohesion: 0.12
Nodes (15): background_color, categories, description, display, icons, lang, name, orientation (+7 more)

### Community 4 - "Caché + Fuente PubMed"
Cohesion: 0.27
Nodes (12): cache, cacheGet(), cacheSet(), httpRequest(), requestText(), baseParams(), extractAll(), extractFirst() (+4 more)

### Community 5 - "Configuración del paquete"
Cohesion: 0.20
Nodes (9): description, engines, node, main, name, scripts, start, type (+1 more)

### Community 6 - "Fuente Crossref"
Cohesion: 0.42
Nodes (8): CROSSREF_BASE, fetchCrossrefWork(), formatAuthors(), formatDate(), formatYear(), mapWork(), searchCrossref(), stripAbstract()

### Community 7 - "Fuentes citadas (PMC/PubMed/Crossref)"
Cohesion: 0.40
Nodes (5): Europe PMC (EMBL-EBI), Biblioteca de Evidencia (evidencia.html), Crossref, Búsqueda de Literatura (literatura.html), PubMed (NCBI/NLM)

### Community 9 - "Iconos de la app (branding)"
Cohesion: 0.67
Nodes (3): iNurse App Icon (192x192), iNurse App Icon (512x512, non-maskable), iNurse App Icon (Maskable, 512x512)

## Knowledge Gaps
- **49 isolated node(s):** `cache`, `name`, `version`, `description`, `type` (+44 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requestJSON()` connect `Fuentes externas + Orquestador Vivi` to `Servidor Node (server.mjs)`, `Caché + Fuente PubMed`, `Fuente Crossref`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `searchPubMed()` connect `Caché + Fuente PubMed` to `Fuentes externas + Orquestador Vivi`, `Servidor Node (server.mjs)`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `cache`, `name`, `version` to the rest of the system?**
  _49 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Servidor Node (server.mjs)` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._
- **Should `Manifest PWA` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._