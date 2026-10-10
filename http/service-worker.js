const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URL = '/offline/index.html';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

async function getOfflinePage() {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(OFFLINE_URL);
  return response || new Response('Die Offline-Seite ist nicht im Cache verfügbar.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.mode !== 'navigate') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok || response.status < 500) {
        return response;
      }
    } catch {
      return getOfflinePage();
    }

    return getOfflinePage();
  })());
});
