const CACHE_NAME = 'pc-custom-lab-cache-v1.0.9';
const ASSETS_TO_CACHE = [
  './index.html',
  './producto.html',
  './checkout.html',
  './assets/css/tailwind-built.css?v=1.0.9',
  './assets/css/fontawesome-all.min.css?v=1.0.9',
  './assets/img/mascota_tigre_thumb.webp?v=1.0.9',
  './assets/img/slider_ia_human_thumb.webp?v=1.0.9',
  './assets/img/slider_warehouse_thumb.webp?v=1.0.9',
  './assets/img/slider_service_thumb.webp?v=1.0.9',
  './assets/img/slider_ia_human.webp?v=1.0.9',
  './assets/img/slider_warehouse.webp?v=1.0.9',
  './assets/img/slider_service.webp?v=1.0.9',
  './assets/img/fachada-oficial.webp?v=1.0.9'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Strategy: Network-First for HTML files & Navigation mode
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Strategy: Cache-First for static assets
  if (url.origin === self.location.origin || url.href.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          }
          return networkResponse;
        });
      })
    );
  }
});
