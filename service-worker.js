const CACHE = 'wahloshop-cache-v1757097561';
const OFFLINE_URL = '.';
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll([
      OFFLINE_URL,
      'index.html',
      'manifest.json',
      'favicon.ico',
      'icons/icon-192.png',
      'icons/icon-512.png'
    ]);
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(e.request);
      if (cached) return cached;
      try {
        const res = await fetch(e.request);
        if (res && res.ok && e.request.method === 'GET') cache.put(e.request, res.clone());
        return res;
      } catch (err) {
        const fallback = await cache.match(OFFLINE_URL);
        return fallback || new Response('Offline', {status: 503, statusText:'Offline'});
      }
    })());
  }
});