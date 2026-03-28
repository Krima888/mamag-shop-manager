// Service Worker for Mama G's Shop - FIXED Version
const CACHE_NAME = 'mamag-shop-v4';

// Install event - just cache the basic files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching index.html');
      return cache.addAll(['/', '/index.html']);
    })
  );
  self.skipWaiting();
});

// Fetch event - ONLY handle HTML, let everything else pass through
self.addEventListener('fetch', event => {
  // Only try to cache HTML requests
  if (event.request.url.includes('.html') || event.request.url === event.request.referrer) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('Serving HTML from cache');
            return response;
          }
          return fetch(event.request);
        })
    );
  } else {
    // For everything else (JS, CSS, etc.) - just fetch normally
    event.respondWith(fetch(event.request));
  }
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
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
  event.waitUntil(clients.claim());
});
