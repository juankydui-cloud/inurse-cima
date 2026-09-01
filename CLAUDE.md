# Enferix / iNurse-CIMA — Guía para Claude

Este archivo lo lee Claude Code automáticamente al arrancar cualquier sesión
sobre este repositorio. Recoge la rama viva, las convenciones que hay que
respetar, y el estado de la tarea en curso.

## Rama activa

**`prioridad-tres`** — Trabajos de la Prioridad 3 del documento de mejoras.
Base: `main`. Pull requests en draft; nada se mergea ni se despliega sin
aprobación explícita del usuario (Juanky).

Contenido ya commiteado en la rama:

- **P3.1 · Navegador NANDA · NOC · NIC** (commit `18bec7a`, PR #141 draft).
  - Overlay con 3 columnas enlazadas en escritorio y 3 pasos con migas de pan
    en móvil.
  - Datos del diccionario NNN curado (`nnn_codes.json`, un único vínculo
    verificado hoy; el resto pendientes editorialmente).
  - Endpoint `GET /api/terminology/dictionary` (cache 5 min).
  - Buscador por etiqueta y código; i18n ES/CA solo en el chrome (las
    etiquetas de taxonomía nunca se autotraducen).
- **P3.2 · Evidencia relacionada al final de ficha** (commits `b2b5ade` +
  siguiente con la corrección de OpenFDA — ver sección "Tarea en curso").

⚠️ **Lección de la sesión anterior**: este mismo bloque (P3.2) se dio por
"implementado, pendiente de OK" en una sesión previa, pero el contenedor se
recicló antes de commitear y solo sobrevivió este CLAUDE.md — el código real
se perdió por completo y hubo que reconstruirlo desde cero. Regla desde
ahora: en cuanto un bloque quede visualmente aprobado, commitear enseguida
(el entorno de ejecución remoto es efímero); no dar nada por "hecho" en este
documento si no hay un commit real que lo respalde.

## Convenciones del proyecto

### Frontend

- Vanilla HTML / JS / CSS, sin bundler, sin framework. Cada mejora vive en un
  par `public/js/patologias/pXX-nombre.js` + `public/css/patologias/pXX-nombre.css`,
  con prefijo `pXX-` en todas las clases y selectores (`.p13-`, `.p21-`, `.p22-`,
  `.p23-`, `.p24-`, `.p2a-`, `.p31-`, `.p32-`…).
- Nunca se toca el monolito: los componentes nuevos se enganchan por
  MutationObserver sobre nodos existentes (`#in54ProtocolContent`,
  `.esc35-body`, `#in56GuidesHost`…) e inyectan HTML o clases sin alterar
  el código heredado.
- Los `data-p2a-icon="nombre"` inyectan un SVG del sistema (P2-A) por
  observer; añadir un icono nuevo es un renglón en
  `public/js/ui-shared/p2a-icons.js`.
- Router de secciones: `window.EnferixOpenSection(id)` y catálogo en
  `window.INURSE_SECTIONS`. Un componente nuevo se registra ahí para
  aparecer en el menú Inicio.
- Persistencia local por componente: `localStorage.inurse_XXXX_v1`.

### Backend

- `server.mjs` en Node puro (sin Express), rutas `if (u.pathname === …)`.
  Cada fuente RAG en `sources/*.mjs` con función `searchX(query, {limit})`.
- Sin claves = sin sincronización. `DATABASE_URL` opcional; NICE_API_KEY,
  GEMINI_API_KEY, PUBMED_API_KEY, etc. se cargan de env de Render.
- Cache HTTP en memoria vía `cache.mjs` (TTL por endpoint).
- Al añadir un endpoint nuevo, cabecera `Cache-Control` explícita y
  respuesta con `debug: { fuente: { url, status, count, ms, error } }`
  cuando agrega fuentes externas.

### Diseño (tokens Enferix)

- Superficie: `#050814` → `#080f22` (gradiente vertical del shell).
- Tarjetas: `rgba(10,18,34,.7)` con borde `rgba(148,163,184,.18)`.
- Acento principal: **teal `#33B6A6`** (chips, activos, bordes de foco).
- Acentos secundarios:
  - Azul `#7dd3fc` (Europe PMC, NOC).
  - Morado `#c4b5fd` (OpenFDA, NIC).
  - Verde `#4ade80` / `#34D399` (NICE, verificado).
  - Ámbar `#fbbf24` (pendiente, aviso).
  - Rojo `#f87171` / `#fca5a5` (fallo, error).
- Texto: `#E5EEFF` (principal), `#c7d4f2` (secundario), `#8aa0c8` (tenue).
- Radios: `12px` (botones), `14–16px` (bloques), `20–22px` (cards grandes).
- Iconografía monolínea (SVG stroke 1.6, currentColor) — sistema `EnferixIcons`
  con emojis fallback.

### Bilingüe (ES ↔ CA)

- Todos los componentes exponen un objeto `L = { es: {…}, ca: {…} }` y
  detectan idioma con `detectLang()`:
  1. `document.documentElement.lang`
  2. `localStorage.inurse_lang`
  3. `navigator.language`
  4. Fallback `es`.
- **Regla férrea**: los labels de datos clínicos y de taxonomías (NANDA, NOC,
  NIC, títulos de artículos, títulos de guías) **nunca se autotraducen**.
  Si la tabla no tiene la versión CA de una etiqueta, se muestra la ES y
  se pinta una nota discreta `"etiqueta disponible sólo en castellano"`
  (una única vez en cabecera cuando aplica a un bloque entero).

### Regla férrea de contenido clínico

- **No se inventa ni se completa contenido clínico**. Nada de rellenar
  vínculos NANDA-NOC-NIC que no estén en `nnn_codes.json` con estado
  "Verificado", ni tramos de escala que no estén en la fuente validada,
  ni placeholders con aspecto de referencia bibliográfica.
- Números / umbrales / dosis / concentraciones: se copian literales de la
  fuente citada. Nunca se paráfrasean.
- Cuando no hay datos, se muestra un **estado vacío honesto** ("Sin
  resultados", "Pendiente de verificar") con explicación de por qué.
- El término de búsqueda en inglés (`evidenceQuery` en cada ficha) también
  es editorial: si no está, se envía el título ES tal cual. Nunca se
  autotraduce.
- Mismo principio para `evidenceDrugs` (array editorial de fármacos que la
  ficha nombra literalmente, p.ej. en su sección de tratamiento/reversión):
  las fuentes de fármacos (OpenFDA) se consultan SOLO por esos nombres,
  nunca por asociación temática con `evidenceQuery` — buscar un fármaco por
  su indicación general trae resultados de fichas ajenas, no evidencia de
  ESTA ficha. Sin `evidenceDrugs`, esa fuente no se llama y se muestra un
  vacío honesto explicando por qué.

## Flujo de trabajo con el usuario

1. **Rama por bloque de mejoras**: `mejoras-visuales-p1`, `mejoras-visuales-p2`,
   `mejoras-visuales-p2a`, `prioridad-tres`…
2. **Capturas antes del commit**: cada componente / iteración se muestra
   como PNG (desktop + móvil + estados relevantes + idiomas). Solo tras el
   OK explícito del usuario se hace commit.
3. **Los pull requests se abren en `draft`**. Ningún merge ni push a `main`
   sin aprobación explícita del usuario.
4. **Ningún despliegue en Render sin aprobación**. `render.yaml` tiene
   `autoDeploy: true`, así que un merge a `main` dispara build automático —
   por eso el gate está en el merge.
5. Todo comentario en PR / commit / mensaje al usuario en **castellano**
   (el usuario también acepta catalán cuando lo pide).
6. Cuando existe un skill / plugin para lo que se pide, se prefiere sobre
   improvisar (`babysit`, `steward`, `code-review`, …). Si no existe, se
   documenta el razonamiento en el PR.

## Tarea en curso — 2026-09-01

**P3.2 · Evidencia relacionada al final de ficha** — reconstruida en esta
sesión (la anterior se perdió, ver aviso arriba) y ya aprobada visualmente
por el usuario, con una corrección aplicada tras revisión suya. Bloque
nuevo al final de cada ficha clínica con resultados del orquestador RAG
(Europe PMC + NICE + OpenFDA), agrupados por fuente, con año y enlace
externo.

Implementado y validado con el usuario:

- Endpoint `GET /api/evidencia-relacionada?q=<término>&drugs=<f1,f2,…>` en
  `server.mjs` con probe nativo `fetch()` a cada fuente y respuesta `debug`
  por fuente (URL exacta, status HTTP, count, ms, error).
- Fuente Europe PMC nueva en `sources/europepmc.mjs` (el orquestador la
  mencionaba pero no la llamaba: además de para este endpoint, se corrigió
  `sources/orchestrator.mjs` — el hueco `pmcResult` invocaba `searchPubMed`
  por duplicado en vez de a Europe PMC).
- **OpenFDA se busca por fármaco, no por indicación** (corrección tras
  revisión del usuario): el parámetro `drugs` viene del campo editorial
  `doc.evidenceDrugs` y arma la query como
  `openfda.generic_name/brand_name/substance_name` de esos fármacos
  exactos. Nunca se busca por la indicación clínica general (`q`), porque
  eso trae fármacos de fichas ajenas por asociación temática. Sin
  `evidenceDrugs`, la fuente ni se llama (`skipped:true`, sin URL) y el
  frontend muestra un vacío honesto distinto de "sin resultados"/"fallo".
- Frontend `public/js/patologias/p32-evidencia-relacionada.js` +
  `public/css/patologias/p32-evidencia-relacionada.css` — observer sobre
  `#in54ProtocolContent`, lee `doc.evidenceQuery`/`doc.evidenceDrugs`
  editoriales (fallback de `evidenceQuery` al título ES), llama al
  endpoint y renderiza.
- **Orden por año descendente** dentro de cada columna (más reciente
  primero: una guía 2022 antecede a la versión 2015 de la misma sociedad).
- **Aislamiento entre fichas verificado con navegación real** (Playwright,
  no solo con el hook de mock): cada ficha dispara su propia petición
  (`q`/`drugs` propios) y no queda contenido de la ficha anterior. Además,
  cada `.p32-body` lleva un número de secuencia y comprueba que sigue
  en el DOM antes de pintar una respuesta — blindaje ante una respuesta
  tardía si el usuario ya navegó o reintentó dos veces seguidas.
- **Dos estados vacíos separados** (más el tercero de "sin fármacos
  editoriales" para OpenFDA):
  - `Sin resultados`: todas las fuentes respondieron 2xx pero count = 0.
  - `Fallo`: alguna fuente devolvió status ≠ 2xx o error de red. Muestra
    qué fuentes fallaron y un botón **Reintentar**.
- Debug del endpoint expuesto también en la consola del navegador
  (`console.log('[EvidenciaRelacionada] debug por fuente:', …)`).
- Campo editorial `evidenceQuery` + `evidenceDrugs` añadidos a la ficha
  `uci-acv-hemorragico` como semilla: `"intracerebral hemorrhage
  management"` / `["Idarucizumab","Andexanet alfa","Protamine"]` — estos
  últimos tomados literalmente de la sección "Reversión de
  anticoagulación" de la propia ficha. El resto de fichas se rellenan
  editorialmente por el usuario, no automático.
- Hook `window.EnferixEvidenciaRelacionada._renderMock(data)` expuesto
  para pruebas visuales sin depender de las APIs externas.

**Limitación de entorno**: el sandbox de desarrollo bloquea
`www.ebi.ac.uk:443`, `api.nice.org.uk:443` y `api.fda.gov:443` con 403
(política del proxy corporativo). Las capturas con resultados reales de
la API solo se pueden generar en Render (producción); localmente se
validan con el hook `_renderMock`.

**Hallazgo aparte (no corregido, fuera de alcance de P3.2)**: al navegar
entre fichas con `window.openDoc()`, la barra de pestañas sticky
(`.in54-tabs` movida a `.in54-proto-head` por `p21-ficha-larga.js`) se
queda a veces con las etiquetas de la ficha anterior aunque el contenido
ya es el de la nueva. Parece que `stickifyTabs()` no reemplaza la barra
vieja cuando `head` ya tiene una `.p21-tabs-in-head`. Pendiente de que el
usuario decida si se aborda y cuándo.

**Pendiente**:

- Poner PR de P3.2 en ready → merge → deploy Render → verificar resultados
  reales (Europe PMC/NICE/OpenFDA sin el bloqueo del proxy del sandbox)
  con la ficha ACV hemorrágico.
- Rellenar `evidenceQuery`/`evidenceDrugs` editorialmente en el resto de
  fichas (hoy solo tiene `uci-acv-hemorragico`).

**Siguiente mejora después de P3.2**: DataMatrix y página de planes en la
nevera (tercer bloque de la Prioridad 3, según el orden que fijó el usuario:
navegador NNN → evidencia relacionada → datamatrix/planes).

## Referencias rápidas de rutas

- Endpoints P3: `GET /api/terminology/dictionary`,
  `GET /api/evidencia-relacionada?q=<término>&drugs=<f1,f2,…>`.
- Fichas: `public/data/guias.js` (142 fichas hoy; añadir `evidenceQuery` /
  `evidenceDrugs` editoriales cuando aporten).
- Diccionario NNN: `nnn_codes.json` en la raíz, regenerable con
  `python3 build_nnn_json.py`.
- Escalas: `public/data/escalas.js` + `public/data/escalas-clinicas.js`.
- Sección router: `public/js/ui-shared/inline-script-17559.js`
  (`EnferixOpenSection`, `INURSE_SECTIONS`).
