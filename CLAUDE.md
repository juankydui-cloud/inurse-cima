# Enferix / iNurse-CIMA — Guía para Claude

Este archivo lo lee Claude Code automáticamente al arrancar cualquier sesión
sobre este repositorio. Recoge la rama viva, las convenciones que hay que
respetar, y el estado de la tarea en curso.

## Estado de la rama principal

**`main`** está al día con la **Prioridad 3** (PR #141, mergeado y ya
desplegado en Render vía `autoDeploy: true`). Contiene:

- **P3.1 · Navegador NANDA · NOC · NIC** — overlay con 3 columnas enlazadas
  en escritorio y 3 pasos con migas de pan en móvil. Datos del diccionario
  NNN curado (`nnn_codes.json`, vínculos verificados; el resto pendientes
  editorialmente). Endpoint `GET /api/terminology/dictionary` (cache 5 min).
  Buscador por etiqueta y código; i18n ES/CA solo en el chrome.
- **P3.2 · Evidencia relacionada al final de ficha** — bloque al final de
  cada ficha clínica con resultados de Europe PMC + NICE + OpenFDA,
  agrupados por fuente, ordenados por año descendente, con enlace externo.
  Endpoint `GET /api/evidencia-relacionada?q=<término>&drugs=<f1,f2,…>` con
  probe nativo por fuente y `debug` (URL, status, count, ms, error). OpenFDA
  se busca por los fármacos editoriales de la propia ficha (`evidenceDrugs`),
  nunca por la indicación clínica general. Dos estados vacíos honestos
  ("sin resultados" / "fallo con reintentar") más el de "sin fármacos
  editoriales" en OpenFDA. Aislamiento entre fichas verificado con
  navegación real.
- Corrección de paso: la barra de pestañas sticky y los listeners de scroll
  de `p21-ficha-larga.js` ya no se quedan colgados de la ficha anterior al
  navegar entre fichas.

**Próxima tarea — rama `javny-inteligente`**: mejora del asistente Javny en
tres frentes:

1. **Streaming en la consulta de portada** — la caja de búsqueda/consulta
   principal debe responder en streaming (como ya hace el chat), no con
   una respuesta bloqueante.
2. **Guion de sistema con modo consulta y modo emergencia** — el
   `SYSTEM_PROMPT` de `sources/orchestrator.mjs` se bifurca según el
   contexto: modo consulta (respuesta exhaustiva tipo UpToDate, como hoy)
   y modo emergencia (prioriza brevedad y accionabilidad inmediata cuando
   el contexto indica una situación crítica).
3. **Function calling con las herramientas de la app** — que Javny pueda
   invocar directamente las fuentes/acciones de Enferix (buscador CIMA,
   escalas, terminología NNN, evidencia relacionada…) como *tools* de
   Gemini en vez de solo recibir contexto ya ensamblado por
   `searchAllSources`.

Aún sin empezar; se abrirá como rama nueva desde `main` cuando el usuario
lo indique.

## Convenciones del proyecto

### Frontend

- Vanilla HTML / JS / CSS, sin bundler, sin framework. Cada mejora vive en un
  par `public/js/patologias/pXX-nombre.js` + `public/css/patologias/pXX-nombre.css`,
  con prefijo `pXX-` en todas las clases y selectores (`.p13-`, `.p21-`, `.p22-`,
  `.p23-`, `.p24-`, `.p2a-`, `.p31-`, `.p32-`…).
- Nunca se toca el monolito: los componentes nuevos se enganchan por
  MutationObserver sobre nodos existentes (`#in54ProtocolContent`,
  `.esc35-body`, `#in56GuidesHost`…) e inyectan HTML o clases sin alterar
  el código heredado. Al reconstruir tras un cambio de ficha/estado, se
  reconstruye TODO lo derivado de ella (contenido, pestañas, listeners),
  no solo una parte — un componente que deja listeners o nodos colgados de
  la iteración anterior es un bug, aunque el contenido visible sea correcto.
- Los `data-p2a-icon="nombre"` inyectan un SVG del sistema (P2-A) por
  observer; añadir un icono nuevo es un renglón en
  `public/js/ui-shared/p2a-icons.js`. Iconografía siempre monolínea (SVG
  stroke 1.6, currentColor), con emojis como fallback.
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
  - Verde `#4ade80` / `#34D399` (NICE, verificado, éxito).
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
   `mejoras-visuales-p2a`, `prioridad-tres`, `javny-inteligente`…
2. **Capturas antes del commit**: cada componente / iteración se muestra
   como PNG (desktop + móvil + estados relevantes + idiomas). Solo tras el
   OK explícito del usuario se hace commit.
3. **Los pull requests se abren en `draft`**. Ningún merge ni push a `main`
   sin aprobación explícita del usuario (Juanky).
4. **Ningún despliegue en Render sin aprobación**. `render.yaml` tiene
   `autoDeploy: true`, así que un merge a `main` dispara build automático —
   por eso el gate está en el merge: no se mergea sin que el usuario lo
   pida explícitamente.
5. Todo comentario en PR / commit / mensaje al usuario en **castellano**
   (el usuario también acepta catalán cuando lo pide).
6. Cuando existe un skill / plugin para lo que se pide, se prefiere sobre
   improvisar (`babysit`, `steward`, `code-review`, …). Si no existe, se
   documenta el razonamiento en el PR.

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
- Orquestador Javny (chat con Gemini): `sources/orchestrator.mjs`
  (`SYSTEM_PROMPT`, `searchAllSources`, `orchestrate`/`orchestrateStream`) —
  punto de partida de `javny-inteligente`.
