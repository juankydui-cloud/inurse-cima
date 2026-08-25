/* iNurse · Service Worker (PWA offline)
   Estrategia:
   - App shell (HTML, iconos, manifest): precache + network-first con fallback a caché.
   - Recursos estáticos same-origin (css/js/img/fuentes): cache-first.
   - /api/* (GET): network-first con fallback a caché (datos clínicos frescos online,
     y accesibles offline si ya se consultaron).
   - POST y cross-origin: pasan directos a la red (no se cachean).
*/
const VERSION = "inurse-pwa-v7";
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

  // Código de la app (.js y .css) → network-first con fallback a caché.
  // Con cache-first el service worker devolvía su copia guardada sin llegar
  // a preguntar al servidor, así que tras un despliegue la app quedaba en un
  // estado mezclado: el HTML y los ficheros de nombre nuevo llegaban
  // actualizados, pero los .js y .css que ya existían se seguían sirviendo
  // en su versión anterior. Subir VERSION no lo evita, porque las cachés
  // viejas no se borran hasta que el SW nuevo activa, y para entonces la
  // página ya se ha pintado con el código viejo.
  // El servidor manda no-cache + ETag en .js, así que revalidar se resuelve
  // con un 304 sin cuerpo, y sin red se sigue tirando de la caché.
  if (/\.(?:js|css)$/i.test(url.pathname)) {
    event.respondWith(
      // cache:"reload" salta la caché HTTP del navegador, que si no le
      // devuelve al propio service worker la copia anterior del fichero y
      // deja el despliegue a medias igualmente. Es lo mismo que ya hace el
      // precache de instalación.
      fetch(new Request(url.pathname + url.search, { cache: "reload", credentials: "same-origin" }))
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Resto de estáticos (imágenes, fuentes) → cache-first, y se rellena la
  // caché al vuelo. Aquí sí es seguro: cuando cambia un icono se le cambia
  // el nombre (icon-512-v2.png), así que la URL nueva nunca está cacheada.
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
