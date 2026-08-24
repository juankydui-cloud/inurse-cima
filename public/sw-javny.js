/* Javny público · Service Worker (PWA offline)
   Solo cubre el shell de javny-publico.html — nunca cachea /api/* (chat, hospitales
   cercanos): mostrar una respuesta médica o una ubicación de hospital antigua en vez
   de un aviso claro de "sin conexión" sería peor que no responder nada.
*/
const VERSION = "javny-publico-pwa-v2";
const SHELL_CACHE = `${VERSION}-shell`;

const SHELL_ASSETS = [
  "/javny-publico.html",
  "/manifest-javny.json",
  "/icon-192-v2.png",
  "/icon-512-v2.png",
  "/icon-512-maskable-v2.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
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
      await Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // POST (chat, transcribe) → directo a la red

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Gemini, mapas, etc. → directo

  // /api/* nunca se cachea: mejor un fallo claro sin conexión que una respuesta vieja.
  if (url.pathname.startsWith("/api/")) return;

  const isNavigation =
    req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("/javny-publico.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
