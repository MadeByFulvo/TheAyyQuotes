// sw.js — Service Worker for TheAyyQuotes PWA
const cacheName = 'ayyquotes-cache-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  // add any images or assets if you have them, e.g. '/icon.png'
];

// Install: cache all necessary files
self.addEventListener('install', event => {
  console.log('[SW] Installing and caching files...');
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
  self.skipWaiting();
});

// Activate: clean old caches if needed
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== cacheName) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve cached files first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached; // return from cache
      return fetch(event.request).then(response => {
        // optionally cache new files dynamically
        return caches.open(cacheName).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => {
        // fallback if offline and file not cached
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
