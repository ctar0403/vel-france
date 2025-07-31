import { memo, useEffect, useState } from 'react';

interface PerformanceData {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

// Development-only performance monitoring component
const PerformanceMetrics = memo(() => {
  const [metrics, setMetrics] = useState<Partial<PerformanceData>>({});

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        setMetrics(prev => ({
          ...prev,
          [entry.name]: entry.startTime,
        }));
      }
    });

    // Observe various performance metrics
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    } catch (e) {
      console.warn('Performance observer not supported:', e);
    }

    // Web Vitals measurement
    if ('web-vitals' in window) {
      // This would require the web-vitals library, but we'll skip it for now
    }

    // Basic performance timing
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        setMetrics({
          ttfb: navigation.responseStart - navigation.requestStart,
          fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        });
      }
    };

    // Measure on load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg z-50 font-mono">
      <div className="font-bold mb-2">Performance Metrics</div>
      {metrics.ttfb && (
        <div>TTFB: {metrics.ttfb.toFixed(2)}ms</div>
      )}
      {metrics.fcp && (
        <div>FCP: {metrics.fcp.toFixed(2)}ms</div>
      )}
      {metrics.lcp && (
        <div>LCP: {metrics.lcp.toFixed(2)}ms</div>
      )}
    </div>
  );
});

PerformanceMetrics.displayName = 'PerformanceMetrics';

export { PerformanceMetrics };