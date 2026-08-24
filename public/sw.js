/* iNurse · Service Worker (PWA offline)
   Estrategia:
   - App shell (HTML, iconos, manifest): precache + network-first con fallback a caché.
   - Recursos estáticos same-origin (css/js/img/fuentes): cache-first.
   - /api/* (GET): network-first con fallback a caché (datos clínicos frescos online,
     y accesibles offline si ya se consultaron).
   - POST y cross-origin: pasan directos a la red (no se cachean).
*/
const VERSION = "inurse-pwa-v5";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

// Recursos que forman el "esqueleto" de la app y deben estar disponibles offline.
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/evidencia.html",
  "/literatura.html",
  "/manifest.json",
  "/icon-192-v2.png",
  "/icon-512-v2.png",
  "/icon-512-maskable-v2.png",
  "/data/guias.js",
  "/data/vademecum.js",
  "/data/diluciones.js",
  "/data/escalas.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      // Se cachea uno a uno para que un fallo aislado no rompa toda la instalación.
      await Promise.allSettled(
        SHELL_ASSETS.map((url) =>
          fetch(url, { cache: "reload" })
            .then((res) => (res.ok ? cache.put(url, res) : null))
            .catch(() => null)
        )
      );
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // POST, etc. → directos a la red
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Cross-origin (Gemini, fuentes de Google, CIMA directo…): pasar directo.
  if (!sameOrigin) return;

  // Navegaciones y documentos HTML → network-first con fallback al shell.
  const isNavigation =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");
  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || (await caches.match("/index.html")) || (await caches.match("/"));
        })
    );
    return;
  }

  // API y datos de la app (/data/*.js, *.json: procedimientos, guías,
  // vademécum...) → network-first con fallback a caché. Este contenido
  // cambia con cada actualización de la app; con cache-first (como el
  // resto de estáticos) el service worker serviría para siempre la
  // primera copia que se descargó, sin enterarse nunca de contenido
  // nuevo aunque el servidor ya lo tenga.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/data/")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Estáticos same-origin → cache-first, y se rellena la caché al vuelo.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});

// Permite que la página fuerce la activación de una nueva versión del SW.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
