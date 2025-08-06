// Service Worker for advanced caching and performance optimization
const CACHE_NAME = 'vel-france-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const IMAGE_CACHE = 'images-v1.0.0';
const API_CACHE = 'api-v1.0.0';

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/assets/alk-sanet_1754502110450.ttf',
  // Critical images for LCP
  '/assets/4_1754504202405-BpCLEn9R.webp',
  '/assets/discount_1754505093401_mobile-Bi8CSbwf.webp',
  '/src/assets/Your%20paragraph%20text%20(4)_1753542106373.webp'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/products',
  '/api/translations',
  '/api/cart'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different resource types with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with short cache fallback
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(request)) {
    // Images - Cache First with compression optimization
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAsset(request)) {
    // Static assets - Cache First
    event.respondWith(handleStaticRequest(request));
  } else {
    // HTML and other resources - Network First
    event.respondWith(handleNetworkFirst(request));
  }
});

// API Request Handler - Network First with intelligent caching
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses with short TTL
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      
      // Add cache timestamp for TTL management
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cached', Date.now().toString());
      
      return new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      });
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('SW: Serving API from cache:', request.url);
      return cachedResponse;
    }
    
    // If no cache, return error
    return new Response(JSON.stringify({ error: 'Network error and no cache available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Image Request Handler - Cache First with optimization
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // Return a placeholder or error image
    console.log('SW: Image fetch failed:', request.url);
    return new Response('', { status: 404 });
  }
}

// Static Asset Handler - Cache First
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('SW: Static asset fetch failed:', request.url);
    return new Response('', { status: 404 });
  }
}

// Network First Handler - For HTML and dynamic content
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful HTML responses
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or error
    return new Response('Offline', { status: 503 });
  }
}

// Helper functions
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(png|jpg|jpeg|webp|avif|gif|svg)$/i.test(new URL(request.url).pathname);
}

function isStaticAsset(request) {
  const pathname = new URL(request.url).pathname;
  return /\.(js|css|woff|woff2|ttf|ico)$/i.test(pathname) ||
         pathname.startsWith('/assets/');
}

// Background sync for failed API requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic for failed requests
  console.log('SW: Background sync triggered');
}

// Push notification handler
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.png',
      badge: '/favicon.png',
      vibrate: [100, 50, 100],
      data: data
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_LOG') {
    console.log('SW: Performance metrics:', event.data.metrics);
    // Could send to analytics service
  }
});