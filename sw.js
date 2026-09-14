/* ==========================================================================
   SERVICE WORKER - VKU Field Survey PWA
   Implementation based on 5 Core Caching Strategies & Service Worker Lifecycle
   ========================================================================== */

const CACHE_VERSION = 'vku-survey-v1.0.1';
const STATIC_CACHE = `vku-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `vku-dynamic-${CACHE_VERSION}`;

// 1. Core App Shell Assets (Pre-cached during Service Worker Installation)
const APP_SHELL = [
  './',
  './index.html',
  './css/index.css',
  './js/app.js',
  './js/storage.js',
  './manifest.json'
];

// CDN Dependencies (Fonts & Icons)
const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons+Round'
];

/* ==========================================================================
   SERVICE WORKER LIFECYCLE EVENTS
   1. Install Event -> Pre-cache App Shell
   2. Activate Event -> Clean old caches & claim clients
   3. Fetch Event -> Intercept & apply caching strategy
   ========================================================================== */

// ---- STEP 1: INSTALL EVENT ----
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event: Pre-caching App Shell assets');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(APP_SHELL).catch(err => {
          console.warn('[Service Worker] Partial pre-cache failure:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ---- STEP 2: ACTIVATE EVENT ----
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event: Cleaning deprecated cache versions');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ---- STEP 3: FETCH EVENT (Intercept & Caching Strategies) ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST, PUT)
  if (request.method !== 'GET') return;

  // Skip non-HTTP(S) protocols (like chrome-extension://)
  if (!request.url.startsWith('http')) return;

  // STRATEGY 1: Cache-First (App Shell & Static Assets)
  // Check cache first; if found, return immediately; else fetch from network.
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis') ||
    url.hostname.includes('fonts.gstatic')
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // STRATEGY 2: Network-First (Live Data & APIs)
  // Attempt fresh network request; fallback to Cache when offline.
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // STRATEGY 3: Stale-While-Revalidate (Dynamic Resources)
  // Return cached response instantly while fetching update in background.
  event.respondWith(staleWhileRevalidateStrategy(request));
});

/* ==========================================================================
   CACHING STRATEGIES IMPLEMENTATION
   ========================================================================== */

// 1. Cache-First Strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[Service Worker] Cache-First network fallback failed:', request.url);
    if (request.mode === 'navigate') {
      return caches.match('./index.html');
    }
    return new Response('Offline Asset Unavailable', { status: 503 });
  }
}

// 2. Network-First Strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ offline: true, message: 'Chế độ ngoại mạng — dữ liệu được lưu cục bộ.' }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

// 3. Stale-While-Revalidate Strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || fetchPromise;
}

/* ==========================================================================
   ENGAGING FEATURES (PUSH NOTIFICATIONS & BADGING API)
   ========================================================================== */

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'VKU Field Survey', body: 'Bạn có báo cáo khảo sát mới cần xem!' };
  const options = {
    body: data.body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" fill="%2300529c"/></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill="%2310b981"/></svg>',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
