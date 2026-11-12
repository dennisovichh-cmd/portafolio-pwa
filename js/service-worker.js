/* SERVICE WORKER — Portafolio DENNISOVICHH
   Archivos base: se guardan al instalar. Páginas: red primero, caché de respaldo.
   Resto: caché primero. Sube el número de versión cuando cambies archivos. */
const CACHE_NAME = "portfolio-v9";

// Solo archivos que EXISTEN seguro. Si uno falla, no se instala.
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/variables.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/screens.css",
  "./css/hud.css",
  "./js/theme.js",
  "./js/carousel.js",
  "./js/music.js",
  "./js/games.js",
  "./js/main.js",
  "./js/hud.js",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(CORE_ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; })
                               .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") { return; }
  if (req.destination === "audio" || req.headers.has("range")) { return; }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); });
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (hit) { return hit || caches.match("./index.html"); });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) { return hit; }
      return fetch(req).then(function (res) {
        if (res && (res.ok || res.type === "opaque")) {   // opaque = CSS de otros sitios (Google Fonts, CDN)
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});