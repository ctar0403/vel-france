// Performance utilities for optimization
export function createBuildScript() {
  return `#!/bin/bash
# High-performance build optimization script

echo "🚀 Starting performance optimization build..."

# Set environment variables for maximum optimization
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false

# Clear previous builds
rm -rf dist/

# Build with optimizations
echo "📦 Building with production optimizations..."
npm run build

# Additional optimizations
echo "⚡ Applying additional optimizations..."

# Gzip compression for static files
if command -v gzip &> /dev/null; then
  find dist/ -type f \\( -name "*.js" -o -name "*.css" -o -name "*.html" \\) -exec gzip -9 -k {} \\;
  echo "✅ Gzip compression applied"
fi

# Brotli compression if available
if command -v brotli &> /dev/null; then
  find dist/ -type f \\( -name "*.js" -o -name "*.css" -o -name "*.html" \\) -exec brotli -q 11 -k {} \\;
  echo "✅ Brotli compression applied"
fi

echo "🎉 Performance optimization build complete!"
echo "📊 Build size analysis:"
du -sh dist/

# Optional: Display largest files
echo "📈 Largest files in build:"
find dist/ -type f -exec du -h {} + | sort -hr | head -20
`;
}

// Service Worker for advanced caching
export const serviceWorkerCode = `
const CACHE_NAME = 'vel-france-v1';
const STATIC_CACHE_NAME = 'vel-france-static-v1';

// Cache static assets
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css'
];

// Cache dynamic content with different strategies
const CACHE_STRATEGIES = {
  '/api/products': 'stale-while-revalidate',
  '/api/translations': 'cache-first',
  '/src/assets/': 'cache-first'
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          if (response && url.pathname === '/api/translations') {
            return response; // Return cached translations immediately
          }
          
          return fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => response || new Response('Offline', { status: 503 }));
        });
      })
    );
    return;
  }
  
  // Handle static assets
  if (url.pathname.startsWith('/src/assets/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return response;
        });
      })
    );
  }
});
`;

// Performance monitoring
export function setupPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Monitor Core Web Vitals
  const observer = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      const value = (entry as any).value || entry.duration;
      console.log(`Performance: ${entry.name} = ${value}ms`);
    }
  });

  try {
    observer.observe({ entryTypes: ['measure', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
  } catch (e) {
    // Fallback for browsers that don't support all entry types
    observer.observe({ entryTypes: ['measure'] });
  }

  // Log LCP when page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('Performance Metrics:', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      });
    }, 1000);
  });
}