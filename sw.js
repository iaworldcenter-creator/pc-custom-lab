// Service Worker v2.0.2 - Aceleración Extrema de Caché & 0ms Latencia
const CACHE_NAME = 'bazar-nfl-static-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/ux-conversion.css',
  './js/ux-engine.js',
  './js/cart-engine.js',
  './assets/img/mascota_tigre_thumb.webp',
  './assets/img/codigo_qr_bazar_nfl.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // HTML: Stale-While-Revalidate para frescura instantánea
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Imágenes, CSS, JS y Fuentes: Cache-First
  if (e.request.destination === 'image' || e.request.destination === 'style' || e.request.destination === 'script' || e.request.destination === 'font' || url.pathname.includes('/assets/')) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
