import { useState, useEffect, useRef, useCallback } from 'react';

interface LazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function useAdvancedLazyLoading({
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true
}: LazyLoadingOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const observe = useCallback((element: HTMLElement) => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, triggerOnce]);

  useEffect(() => {
    if (elementRef.current) {
      return observe(elementRef.current);
    }
  }, [observe]);

  return { isIntersecting, elementRef };
}

export default useAdvancedLazyLoading;