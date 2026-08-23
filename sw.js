const CACHE_NAME = 'shm-pdf-tools-v1';

// Keep this strictly to LOCAL files. 
// If even ONE of these files is missing (returns 404), the Service Worker will fail to install!
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './shmpdf.png',
  './icon-192.png',
  './icon-512.png'
];

// Install Service Worker and Cache Files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Cache addAll failed:', err))
  );
});

// Serve Cached Files when Offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Update Service Worker & Clear Old Cache
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
