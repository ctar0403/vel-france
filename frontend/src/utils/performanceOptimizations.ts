// Performance optimizations for reduced reflows and better Core Web Vitals

// Debounced resize handler to prevent excessive reflow calculations
export const createDebouncedResizeHandler = (callback: () => void, delay: number = 150) => {
  let timeoutId: NodeJS.Timeout;
  let ticking = false;

  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(callback, delay);
        ticking = false;
      });
      ticking = true;
    }
  };
};

// Throttled scroll handler for performance-critical scroll events
export const createThrottledScrollHandler = (callback: () => void, limit: number = 16) => {
  let inThrottle = false;
  return () => {
    if (!inThrottle) {
      requestAnimationFrame(() => {
        callback();
        inThrottle = false;
      });
      inThrottle = true;
    }
  };
};

// Optimized intersection observer for lazy loading
export const createOptimizedIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Memory-efficient image preloader
export const preloadCriticalImages = (imageUrls: string[]) => {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    })
  );
};

// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  } else {
    fn();
  }
};

// Reduce layout thrashing in DOM updates
export const batchDOMUpdates = (updates: (() => void)[]) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

// Optimized viewport detection with caching
let cachedViewportWidth: number | null = null;
let cachedViewportHeight: number | null = null;
let lastViewportCheck = 0;
const VIEWPORT_CACHE_DURATION = 100; // ms

export const getOptimizedViewportSize = () => {
  const now = Date.now();
  
  if (
    cachedViewportWidth !== null && 
    cachedViewportHeight !== null && 
    now - lastViewportCheck < VIEWPORT_CACHE_DURATION
  ) {
    return { width: cachedViewportWidth, height: cachedViewportHeight };
  }

  cachedViewportWidth = window.innerWidth;
  cachedViewportHeight = window.innerHeight;
  lastViewportCheck = now;

  return { width: cachedViewportWidth, height: cachedViewportHeight };
};

// Clear viewport cache on resize
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    cachedViewportWidth = null;
    cachedViewportHeight = null;
  }, { passive: true });
}

// Optimized mobile detection with reduced reflows
export const createOptimizedMobileDetector = () => {
  let isMobileCache: boolean | null = null;
  let lastMobileCheck = 0;
  const MOBILE_CACHE_DURATION = 200; // ms

  return () => {
    const now = Date.now();
    
    if (isMobileCache !== null && now - lastMobileCheck < MOBILE_CACHE_DURATION) {
      return isMobileCache;
    }

    isMobileCache = window.innerWidth <= 768;
    lastMobileCheck = now;
    return isMobileCache;
  };
};

// Clear mobile cache on resize
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    // Will be cleared automatically by cache duration
  }, { passive: true });
}