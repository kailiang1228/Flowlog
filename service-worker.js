const CACHE_NAME = 'flowlog';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  // External Icon
  'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
  // Tailwind
  'https://cdn.tailwindcss.com',
];

// Install event: Cache core assets immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network first, fall back to cache
// This strategy is safer for development to ensure you always get the latest version if online,
// but falls back to offline cache if the network fails.
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response, clone and cache it (Dynamic Caching)
        // This is crucial for catching all the react/esm.sh files we didn't list manually
        if (response && response.status === 200 && response.type === 'basic' || response.type === 'cors') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});