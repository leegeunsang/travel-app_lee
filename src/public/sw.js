// Service Worker for PWA - Network First Strategy
const CACHE_NAME = 'travel-app-v4-network-first';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v4 - Network First...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential files');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('[SW] Cache failed', err);
      })
  );
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v4 - Cleaning ALL old caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - NETWORK FIRST for all HTML/JS/CSS
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // NETWORK FIRST for everything - prioritize fresh content
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache the fresh response
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Only use cache if network fails (offline)
        console.log('[SW] Network failed, using cache for:', url.pathname);
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // For navigation requests, return index.html
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Message handler to force update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Force update requested');
    self.skipWaiting();
  }
});

// Push notification
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '새로운 여행 추천이 있습니다!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('여행 추천 앱', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
