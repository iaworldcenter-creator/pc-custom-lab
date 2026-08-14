const CACHE_NAME = 'pc-custom-lab-cache-v1.0.2';
const ASSETS_TO_CACHE = [
  './index.html',
  './assets/css/tailwind-built.css?v=1.0.2',
  './assets/css/fontawesome-all.min.css?v=1.0.2',
  './assets/img/mascota_tigre_thumb.webp?v=1.0.2',
  './assets/img/slider_ia_human_thumb.webp?v=1.0.2',
  './assets/img/slider_warehouse_thumb.webp?v=1.0.2',
  './assets/img/slider_service_thumb.webp?v=1.0.2',
  './assets/img/slider_ia_human.webp?v=1.0.2',
  './assets/img/slider_warehouse.webp?v=1.0.2',
  './assets/img/slider_service.webp?v=1.0.2',
  './assets/img/fachada-oficial.webp?v=1.0.2'
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
  if (url.origin === self.location.origin || url.href.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cacheCopy);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});