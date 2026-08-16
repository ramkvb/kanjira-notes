/**
 * Service Worker - Offline caching for Kanjira Notes PWA
 * Cache-first for static assets, network-first for API/HTML
 */

const CACHE_NAME = 'kanjira-notes-v1';
const STATIC_ASSETS = [
    '/',
    '/css/site.css',
    '/js/kanjira-sounds.js',
    '/js/metronome.js',
    '/js/drum-grid.js',
    '/icons/icon.svg',
    '/manifest.json'
];

// Install - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch strategy
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API calls - network only (don't cache mutations)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Static assets - cache first
    if (url.pathname.match(/\.(css|js|svg|png|jpg|woff2?)$/)) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                return cached || fetch(event.request).then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // HTML pages - network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
