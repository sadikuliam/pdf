const CACHE_NAME = 'shm-pdf-tools-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './shmpdf.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700;900&display=swap',
  // Add your other pages here if you want them cached for offline use:
  // './editpdf.html',
  // './comp.html',
  // './pdf2png.html',
  // './marge.html',
  // './split.html',
  // './split2by2.html',
  // './2in1pdf.html'
];

// Install Service Worker and Cache Files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
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
