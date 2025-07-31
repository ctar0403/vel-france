// Bundle optimization utilities
import { lazy, Suspense, ComponentType } from 'react';

// Lazy load utility for dynamic imports
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={fallback ? fallback({}) : <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Code splitting for large utilities
export const loadUtilityModule = async <T>(
  moduleLoader: () => Promise<T>
): Promise<T> => {
  try {
    return await moduleLoader();
  } catch (error) {
    console.error('Failed to load utility module:', error);
    throw error;
  }
};

// Preload critical chunks
export const preloadChunk = (chunkName: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = `/js/${chunkName}`;
  document.head.appendChild(link);
};

// Tree-shaking helper - only import what you need
export const importOnlyNeeded = {
  // Date utilities  
  formatDate: () => import('date-fns/format'),
  parseDate: () => import('date-fns/parse'),
};

// Reduce bundle size by conditionally loading polyfills
export const loadPolyfills = async () => {
  const promises: Promise<any>[] = [];
  
  // Intersection Observer polyfill
  if (typeof window !== 'undefined' && !window.IntersectionObserver) {
    promises.push(
      import('intersection-observer').catch(() => {
        console.warn('Could not load IntersectionObserver polyfill');
      })
    );
  }
  
  if (promises.length > 0) {
    await Promise.all(promises);
  }
};

// Service worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};

export {
  lazyLoad,
  loadUtilityModule,
  preloadChunk,
  importOnlyNeeded,
  loadPolyfills,
  registerServiceWorker,
};