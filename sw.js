// Minimal service worker for PWA install capability
// No offline caching — always fetch from network
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
