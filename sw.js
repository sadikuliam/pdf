// ভার্সন কোড পরিবর্তন করলে সার্ভিস ওয়ার্কার অটোমেটিক পুরানো ক্যাশ মুছে ফেলবে
const CACHE_NAME = 'shm-pdf-tools-v2';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './shmpdf.png',
  './123pdf.png'
];

// 1. Install & Skip Waiting (নতুন আপডেট আসার সাথে সাথে ইনস্টল হবে)
self.addEventListener('install', event => {
  self.skipWaiting(); // পুরানো সার্ভিস ওয়ার্কারকে সাথে সাথে সরিয়ে দেবে
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache updated successfully');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Cache addAll failed:', err))
  );
});

// 2. Activate & Clear ALL Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName); // পুরানো সমস্ত ক্যাশ অটো ডিলিট করবে
          }
        })
      );
    }).then(() => self.clients.claim()) // নতুন সার্ভিস ওয়ার্কার সাথে সাথে পেজে প্রভাব ফেলবে
  );
});

// 3. Network-First Strategy (লাইভ আপডেট পেতে সাহায্য করবে)
self.addEventListener('fetch', event => {
  // শুধুমাত্র GET ریکোয়েস্ট ক্যাশ করবে
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // নেটওয়ার্কে নতুন ফাইল পাওয়া গেলে ক্যাশ আপডেট করে নেবে
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // যদি ইন্টারনেট না থাকে (Offline), তখন ক্যাশ থেকে ফাইল দেবে
        return caches.match(event.request);
      })
  );
});
