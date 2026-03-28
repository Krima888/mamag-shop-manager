// Service Worker for Mama G's Shop - UPDATED for offline support
const CACHE_NAME = 'mamag-shop-v2';
const urlsToCache = [
  '/',
  '/index.html',
  // Add all the assets your app needs
  'https://fonts.googleapis.com/css2?family=Segoe+UI&display=swap'
];

// Install event - cache all important files
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app files');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Cache addAll error:', error);
      })
  );
  // Force activation
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Found in cache - return it
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        // Not in cache - fetch from network
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Optional: Cache new files for future offline use
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            // Return offline fallback page
            return caches.match('/index.html');
          });
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients
  event.waitUntil(clients.claim());
});
