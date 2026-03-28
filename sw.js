// Service Worker for Mama G's Shop - Complete Offline Support
const CACHE_NAME = 'mamag-shop-v3';
const urlsToCache = [
  '/',
  '/index.html'
];

// Install event - cache core files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Cache complete');
      })
      .catch(error => {
        console.log('Service Worker: Cache failed', error);
      })
  );
  // Force activation
  self.skipWaiting();
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Found in cache - return it
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        // Not in cache - fetch from network
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Cache new files for future offline use
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('Service Worker: Fetch failed, returning offline fallback', error);
            // Return cached index.html as fallback
            return caches.match('/index.html');
          });
      })
  );
});

// Activate event - clean old caches and take control
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
});

// Handle messages from the page
self.addEventListener('message', event => {
  if (event.data === 'cacheNow') {
    console.log('Service Worker: Manual cache triggered');
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(urlsToCache);
      })
    );
  }
});
