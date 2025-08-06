// Comprehensive performance optimization utilities to prevent forced reflows

interface ViewportDimensions {
  width: number;
  height: number;
}

// Cached viewport dimensions to avoid repeated geometric queries
let cachedViewport: ViewportDimensions = { width: 1024, height: 768 };
let resizeTimeout: NodeJS.Timeout;

// Initialize viewport cache
export const initializeViewportCache = (): void => {
  if (typeof window === 'undefined') return;
  
  const updateCache = () => {
    cachedViewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };
  
  // Set initial cache
  updateCache();
  
  // Debounced resize handler to prevent excessive calculations
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCache, 100);
  };
  
  window.addEventListener('resize', handleResize, { passive: true });
};

// Get cached viewport dimensions without forced reflows
export const getViewportDimensions = (): ViewportDimensions => {
  return { ...cachedViewport };
};

// Performance-optimized media query detection
export const createMediaQuery = (query: string): MediaQueryList | null => {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return null;
  }
  
  return window.matchMedia(query);
};

// Batch DOM reads to prevent layout thrashing
export const batchDOMReads = <T>(readFunctions: (() => T)[]): T[] => {
  // Use requestAnimationFrame to batch reads during the same frame
  return new Promise<T[]>((resolve) => {
    requestAnimationFrame(() => {
      const results = readFunctions.map(fn => fn());
      resolve(results);
    });
  }) as any; // Type assertion for immediate synchronous use
};

// Optimize DOM writes by batching them
export const batchDOMWrites = (writeFunctions: (() => void)[]): void => {
  requestAnimationFrame(() => {
    writeFunctions.forEach(fn => fn());
  });
};

// Performance-optimized scroll detection
export const createScrollListener = (
  callback: (scrollY: number) => void,
  throttleMs: number = 16
): (() => void) => {
  let ticking = false;
  let lastScrollY = 0;
  
  const updateScrollPosition = () => {
    lastScrollY = window.scrollY;
    callback(lastScrollY);
    ticking = false;
  };
  
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollPosition);
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

// GPU-accelerated transform utility
export const createGPUTransform = (
  translateX: number = 0,
  translateY: number = 0,
  scale: number = 1,
  rotate: number = 0
): string => {
  return `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
};

// Intersection Observer for efficient element visibility detection
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions = {
    rootMargin: '50px 0px',
    threshold: [0, 0.1, 0.5, 1.0],
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Performance monitoring utility
export const measurePerformance = (name: string, fn: () => void): void => {
  if (typeof performance === 'undefined') {
    fn();
    return;
  }
  
  const startTime = performance.now();
  fn();
  const endTime = performance.now();
  
  console.log(`Performance ${name}: ${endTime - startTime}ms`);
};

// Optimize CSS custom properties updates
export const updateCSSProperties = (
  element: HTMLElement,
  properties: Record<string, string>
): void => {
  requestAnimationFrame(() => {
    Object.entries(properties).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  });
};

// Memory-efficient event delegation
export const createDelegatedListener = (
  container: HTMLElement,
  selector: string,
  event: string,
  handler: (event: Event, target: Element) => void
): (() => void) => {
  const delegatedHandler = (e: Event) => {
    const target = (e.target as Element).closest(selector);
    if (target && container.contains(target)) {
      handler(e, target);
    }
  };
  
  container.addEventListener(event, delegatedHandler, { passive: true });
  
  return () => {
    container.removeEventListener(event, delegatedHandler);
  };
};

// Initialize performance optimizations
if (typeof window !== 'undefined') {
  // Initialize viewport cache on module load
  initializeViewportCache();
  
  // Add performance observer for monitoring
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure' && entry.duration > 100) {
          console.warn(`Long task detected: ${entry.name} - ${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
  }
}