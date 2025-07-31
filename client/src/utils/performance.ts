// Performance utilities for React optimization

import { useCallback, useMemo, useRef } from 'react';

// Debounce hook for search and filtering
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const debounceRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: any[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
}

// Throttle hook for scroll events
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef(false);

  return useCallback(
    ((...args: any[]) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => (inThrottle.current = false), limit);
      }
    }) as T,
    [callback, limit]
  );
}

// Memoized price formatter
export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${numPrice.toFixed(2)}₾`;
};

// Memoized discount calculator
export const calculateDiscountPrice = (price: string | number, discount: number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return (numPrice * (1 - discount / 100)).toFixed(2);
};

// Image optimization utilities
export const getOptimizedImageUrl = (url: string, width?: number): string => {
  if (!url) return '/placeholder-perfume.jpg';
  
  // If it's already a placeholder or local image, return as-is
  if (url.includes('/placeholder') || url.startsWith('/')) {
    return url;
  }
  
  // For external images, you could add image optimization parameters
  // This is a placeholder for actual CDN optimization
  return url;
};

// Virtual scrolling helper
export function useVirtualizedList<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) {
  return useMemo(() => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, 0 - overscan);
    const endIndex = Math.min(items.length - 1, startIndex + visibleItemCount + overscan * 2);
    
    return {
      visibleItems: items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, containerHeight, itemHeight, overscan]);
}

// Memory cleanup helper
export const useCleanup = (cleanup: () => void) => {
  const cleanupRef = useRef(cleanup);
  cleanupRef.current = cleanup;

  return useCallback(() => {
    cleanupRef.current();
  }, []);
};