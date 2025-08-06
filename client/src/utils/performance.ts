// Advanced Performance Monitoring and Optimization Utilities

export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  domContentLoaded?: number;
  loadComplete?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
}

// Performance Observer for Core Web Vitals
export class WebVitalsMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // FID Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.reportMetric('FID', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // CLS Observer
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.reportMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // FCP Observer
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              this.reportMetric('FCP', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }

    // Navigation Timing
    this.collectNavigationMetrics();
  }

  private collectNavigationMetrics() {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      
      // Calculate metrics
      this.metrics.ttfb = timing.responseStart - timing.navigationStart;
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;

      // Paint timing
      if ('getEntriesByType' in performance) {
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry: any) => {
          if (entry.name === 'first-paint') {
            this.metrics.firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        });
      }

      // Report navigation metrics
      console.log('Performance Metrics:', this.metrics);
    }
  }

  private reportMetric(name: string, value: number) {
    console.log(`Performance: ${name} = ${value}ms`);
    
    // Send to service worker for potential analytics
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PERFORMANCE_LOG',
        metrics: { [name]: value }
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Image Performance Optimization
export class ImagePerformanceOptimizer {
  private static instance: ImagePerformanceOptimizer;
  private imageCache = new Map<string, HTMLImageElement>();
  private loadingImages = new Set<string>();

  static getInstance(): ImagePerformanceOptimizer {
    if (!ImagePerformanceOptimizer.instance) {
      ImagePerformanceOptimizer.instance = new ImagePerformanceOptimizer();
    }
    return ImagePerformanceOptimizer.instance;
  }

  // Preload critical images with priority
  public preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<HTMLImageElement> {
    if (this.imageCache.has(src)) {
      return Promise.resolve(this.imageCache.get(src)!);
    }

    if (this.loadingImages.has(src)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.imageCache.has(src)) {
            clearInterval(checkInterval);
            resolve(this.imageCache.get(src)!);
          }
        }, 50);
      });
    }

    this.loadingImages.add(src);

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set priority hint if supported
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = priority;
      }

      img.onload = () => {
        this.imageCache.set(src, img);
        this.loadingImages.delete(src);
        resolve(img);
      };

      img.onerror = () => {
        this.loadingImages.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  }

  // Generate responsive image sources
  public generateResponsiveSources(basePath: string, fileName: string): string[] {
    const sizes = [300, 400, 600, 800];
    const formats = ['webp', 'jpg'];
    const sources: string[] = [];

    formats.forEach(format => {
      sizes.forEach(size => {
        sources.push(`${basePath}/${fileName}_${size}.${format}`);
      });
    });

    return sources;
  }

  // Clear cache periodically to prevent memory leaks
  public clearCache() {
    this.imageCache.clear();
    this.loadingImages.clear();
  }
}

// Resource Loading Optimization
export class ResourceLoader {
  private static loadedResources = new Set<string>();

  // Load CSS asynchronously
  public static loadCSS(href: string, media = 'all'): Promise<void> {
    if (this.loadedResources.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.media = 'only x'; // Temporarily disable

      const activate = () => {
        link.media = media;
        link.rel = 'stylesheet';
        this.loadedResources.add(href);
        resolve();
      };

      link.onload = activate;
      link.onerror = () => {
        reject(new Error(`Failed to load CSS: ${href}`));
      };

      // Fallback timeout
      setTimeout(activate, 100);

      document.head.appendChild(link);
    });
  }

  // Load JavaScript modules dynamically
  public static loadScript(src: string): Promise<void> {
    if (this.loadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        this.loadedResources.add(src);
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  // Prefetch resources for next page
  public static prefetchResource(href: string, as: string = 'fetch'): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
}

// Memory Management
export class MemoryOptimizer {
  private static cleanupTasks: (() => void)[] = [];

  public static addCleanupTask(task: () => void) {
    this.cleanupTasks.push(task);
  }

  public static runCleanup() {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  // Monitor memory usage
  public static getMemoryInfo(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }
}

// Initialize performance monitoring
export const webVitalsMonitor = new WebVitalsMonitor();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  webVitalsMonitor.disconnect();
  MemoryOptimizer.runCleanup();
});

// Export utilities
export const performanceUtils = {
  WebVitalsMonitor,
  ImagePerformanceOptimizer,
  ResourceLoader,
  MemoryOptimizer
};