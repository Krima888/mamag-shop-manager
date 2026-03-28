// Improved Service Worker for Mama G's Shop
const CACHE_NAME = 'mamag-shop-v2';
const urlsToCache = [
  '/',
  '/index.html',
  // Add all critical files
  '/manifest.json'
];

// Install event - cache all files immediately
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All files cached!');
        return self.skipWaiting();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Return cached version
          return response;
        }
        
        // Not in cache - fetch from network
        return fetch(event.request).then(networkResponse => {
          // Don't cache non-GET requests or external URLs
          if (event.request.method !== 'GET') {
            return networkResponse;
          }
          
          // Cache the fetched response
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
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
    }).then(() => {
      console.log('Service Worker activated, claiming clients...');
      return self.clients.claim();
    })
  );
});

// Handle offline fallback
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
  }
});
