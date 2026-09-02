# Enferix / iNurse-CIMA — Guía para Claude

Este archivo lo lee Claude Code automáticamente al arrancar cualquier sesión
sobre este repositorio. Recoge la rama viva, las convenciones que hay que
respetar, y el estado de la tarea en curso.

## Estado de la rama principal

**`main`** está al día con el **Frente 1 de `javny-inteligente`** (PR #142,
mergeado y desplegado vía `autoDeploy: true`) y con la **Prioridad 3**
(PR #141). Contiene:

- **F1 · Consulta de portada en streaming** — la caja `#nxAsk` del inicio
  responde en su propio panel (`p33-consulta-portada`), en vez de abrir el
  chat del avatar y enviar por el usuario. NDJSON contra
  `/api/javny/chat/stream`; indicador de fases (`searching` → `writing`,
  evento `phase` nuevo del orquestador); referencias al final, con las citas
  `[n]` enlazadas solo cuando ese número existe en la lista del servidor.
  Tope por fuente en la búsqueda (`SOURCE_BUDGET_MS`, 7 s): antes la
  redacción esperaba a la última fuente en contestar.
  La portada envía el **mismo contexto interno que el chat** (fichas,
  vademécum, biblioteca, cercanos) reutilizando su recuperación, publicada
  como `window.EnferixGuideRetrieve` — no una copia.
  Latencia instrumentada: marcas en consola (envío / contexto / primer token /
  fin) y `scripts/medir-latencia-javny.mjs`.
  **El modo interactivo del avatar no cambia**, y así debe seguir.
- **F1b · La generación no espera a las fuentes externas** (PR #143) — el
  modelo arranca de inmediato con el contexto interno; las búsquedas corren en
  paralelo con tope de 5 s por fuente (`SOURCE_BUDGET_MS`) y sus referencias se
  emiten en cuanto llegan, sin bloquear nunca la respuesta.
  Como al redactar no hay literatura delante, la instrucción del prompt se
  bifurca: **sin literatura se le prohíbe citar `[n]`** (serían inventados) y se
  le pide nombrar la ficha de Enferix; el bloque del panel se llama entonces
  "Evidencia relacionada", con nota de que no respalda cada frase.
  Instrumentación en el servidor: log por fuente (`europepmc=ok/820ms/8`) y
  **tiempo hasta el primer fragmento de Gemini**.

- **F1c · La portada espera a las fuentes y responde corta y citada** (PR #144)
  — medido en producción, las fuentes externas responden en **~950 ms**, así que
  se esperan (tope `WAIT_SOURCES_MS`, 3 s) en vez de sacrificarlas: cuesta ~1 s y
  la respuesta sale fundamentada. Si la espera se agota, se redacta solo con las
  fichas y la respuesta lo dice en su primera línea; las referencias tardías se
  adjuntan como "Evidencia relacionada" con nota de que no fundamentan el texto.
  El prompt lleva las fichas como fuente **prioritaria** y la literatura como
  **complementaria**, citando ambas en el texto.
  **Respuesta concisa (2000-3000 caracteres) SOLO en la portada**, vía el
  parámetro `conciso`; el chat del avatar no lo envía y mantiene su desarrollo
  largo — al tocar el orquestador, comprobar siempre que sigue así.
  El tope por fuente (`SOURCE_BUDGET_MS`, 2,5 s) debe quedar **por debajo** de la
  espera global: siendo iguales competían y la fase se daba por buena justo al
  expirar, informando "a tiempo" con cero referencias.
  `EPMC_BASE_URL` apunta Europe PMC a un doble local para probar los dos caminos.

- **F1d · Fragmentos incrementales y salida sin retenciones** (PR #145) — el
  evento `delta` llevaba el texto **acumulado** en cada fragmento (cientos de KB
  por respuesta); ahora viaja sólo el trozo nuevo (`chunk`) y el texto se acumula
  en el cliente. **Los tres consumidores** lo hacen así: portada, chat del avatar
  y `javny-publico.html` — al tocar el formato del evento hay que actualizar los
  tres. En el endpoint: `flushHeaders()`, `Connection: keep-alive` y
  `setNoDelay`, además del `no-transform` y `X-Accel-Buffering: no` que ya había.
  La compresión NUNCA ha tocado `/api`: sólo se aplica en `sendFile`, por
  extensión de fichero (este servidor no usa Express).
  Log nuevo que separa el tiempo del modelo del del transporte:
  `[Gemini stream] N fragmentos · primero a los X ms · último a los Y ms`.

- **F1e · La redacción la hace Claude, con Gemini de reserva** (PR #146) — el
  endpoint `/api/javny/chat/stream` llama a la **API de Anthropic** con su
  streaming nativo (`sources/anthropic.mjs`, SDK oficial `@anthropic-ai/sdk`,
  `client.messages.stream()` + evento `text`). El orquestador y el contexto de
  fichas NO cambiaron: sólo cambia quién redacta.
  **El guion clínico vive en `sources/guion-clinico.mjs`**, importado por las
  DOS llamadas: si se duplica, la respuesta clínica cambia según el proveedor
  que atienda, y eso no puede pasar.
  Fallback: si Claude falla **antes** de emitir texto, se reintenta con Gemini
  y el cliente recibe un evento `aviso`; si ya había texto en pantalla, el error
  sube tal cual (reintentar duplicaría la respuesta a media frase).
  `ANTHROPIC_API_KEY` en Render activa este camino; sin ella se usa Gemini.
  **`ANTHROPIC_WORKSPACE_ID`**: una clave vinculada a identidad exige además la
  cabecera `anthropic-workspace-id`, o la API responde 400. Se manda sólo si la
  variable existe (con una clave normal sobra). El arranque lo dice en el log:
  `[Anthropic] Cliente listo · workspace sí | no configurado`.
  `ANTHROPIC_MODEL` (por defecto `claude-opus-5`) y `ANTHROPIC_BASE_URL` (doble
  local en pruebas). La portada pide `effort: "low"`; el chat mantiene `"high"`.
  Log: `[Anthropic stream] N fragmentos · primero a los X ms · … · stop=…` —
  ojo a `stop=refusal`, que llega con HTTP 200 y hay que comprobar aparte.

  **Cómo medir el contexto de la portada**: las fichas las monta el NAVEGADOR
  (`EnferixGuideRetrieve`). Medir el endpoint con `curl` manda `context` vacío
  por construcción, y parece un fallo del servidor sin serlo.

  **Diagnóstico abierto de latencia** — medido en producción antes de F1b:
  contexto 15 ms, primer token **34.584 ms**, respuesta completa **31 ms
  después**. Que el texto entero llegue en 31 ms significa que Gemini no emite
  de forma incremental: entrega la respuesta ya terminada. Las búsquedas no lo
  explicaban (estaban topadas). La reordenación de F1b quita del camino
  crítico los segundos de búsqueda, pero **no bajará el primer token de 3 s si
  el modelo sigue sin emitir hasta terminar**. Lo zanja la línea de log
  `[Orquestador] Primer fragmento de Gemini a los N ms`: si marca decenas de
  miles, el tiempo es del modelo (revisar qué modelo corre en Render, si lleva
  razonamiento, y el tamaño del prompt), no de la orquestación.
  Con el dato de las fuentes (~950 ms) queda descartado que las búsquedas
  explicasen los 34 s: como mucho aportaban uno. La palanca que queda es la
  **longitud de la respuesta** (F1c la baja a 2000-3000 caracteres), porque el
  reloj del primer token corre hasta que el modelo termina de generar.
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

**Tarea en curso — `javny-inteligente`**: mejora del asistente Javny en tres
frentes. El primero ya está en `main`; quedan los dos siguientes:

1. ~~**Streaming en la consulta de portada**~~ — hecho (PR #142, ver arriba).
2. ~~**Guion de sistema con modo consulta y modo emergencia**~~ — hecho
   (PR #148). Vive en `sources/guion-clinico.mjs`, compartido por los dos
   proveedores. **Emergencia**: situación urgente EN CURSO (lo delata que algo
   está pasando, no que se pregunte por ello); 112 o equipo de parada primero,
   luego UNA acción, sin bibliografía ni citas ni vigencia de guías; ante la
   duda entre modos, emergencia. **Consulta** (por defecto): cada afirmación
   atribuida a su ficha o su cita, fichas por delante de la bibliografía,
   discrepancias señaladas, huecos de las fuentes dichos.
   **Trampa al tocarlo**: el orquestador añade al contexto instrucciones de
   estructura, extensión y citación `[n]` que contradicen al modo emergencia;
   el guion declara que su formato prevalece sobre ellas. Si se quita esa
   frase, el modo emergencia queda anulado en la práctica.
3. **Function calling con las herramientas de la app** — que Javny pueda
   invocar directamente las fuentes/acciones de Enferix (buscador CIMA,
   escalas, terminología NNN, evidencia relacionada…) como *tools* de
   Gemini en vez de solo recibir contexto ya ensamblado por
   `searchAllSources`.

Los frentes 2 y 3 aún sin empezar; se abren como rama nueva desde `main`
cuando el usuario lo indique.

**Detalle del frente 2 según el usuario**: modo emergencia se activa cuando el
mensaje indica situación urgente **en curso** (parada, atragantamiento,
inconsciencia, sangrado masivo) y responde corto, imperativo, paso a paso,
**una acción por mensaje**, sin bibliografía ni menciones a vigencia de guías,
priorizando avisar al 112 y las maniobras inmediatas. Modo consulta responde
completo, citando siempre la ficha o fuente, y diciendo explícitamente cuándo
algo no está en sus fuentes en vez de rellenar. El contenido clínico de ambos
modos sale exclusivamente de las fuentes del orquestador.

**Detalle del frente 3 según el usuario**: las herramientas son (1) calcular
escalas llamando al **código validado de las calculadoras existentes** — el
modelo solo extrae parámetros y presenta el resultado con su interpretación,
jamás calcula él; (2) diluciones, vías y compatibilidades del formulario de
fármacos; (3) interacciones vía la conexión CIMA existente; (4) enlazar la
ficha o escala relevante de la app. Cada herramienta responde solo con datos
reales de la app; si no hay dato, se dice que no está disponible.

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
- **Texto de relleno en dobles de prueba**: cuando se levante un doble/stub de
  un modelo o de una fuente para probar (streaming, latencia, maquetación), su
  texto debe ser **inconfundible como relleno**: `TEXTO DE PRUEBA, NO CLÍNICO`
  repetido, o equivalente. Nunca frases con aspecto clínico, nunca umbrales ni
  dosis, y **nunca citas ni referencias bibliográficas inventadas** — ni siquiera
  plausibles. Una captura o un vídeo de prueba se enseña sin que nadie pueda
  confundir su contenido con una respuesta real; una nota al pie que avise no
  basta, porque lo que se recuerda es la pantalla. Regla del usuario (Juanky),
  a raíz de un stub cuyo relleno imitaba una respuesta clínica citada.
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
