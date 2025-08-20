// Advanced image optimization utilities
interface ImageConfig {
  quality?: number;
  format?: 'webp' | 'png' | 'jpg';
  sizes?: string[];
  lazy?: boolean;
  priority?: boolean;
}

class ImageOptimizer {
  private static cache = new Map<string, HTMLImageElement>();
  private static loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  // Preload critical images
  static preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src)!);
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Batch preload multiple images
  static preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => this.preloadImage(url)));
  }

  // Generate responsive image sizes
  static generateSizes(breakpoints: { size: string; width: string }[]): string {
    return breakpoints
      .map(bp => `(max-width: ${bp.size}) ${bp.width}`)
      .join(', ');
  }

  // Calculate optimal image dimensions based on viewport
  static getOptimalDimensions(originalWidth: number, originalHeight: number, maxWidth: number): { width: number; height: number } {
    const aspectRatio = originalHeight / originalWidth;
    const width = Math.min(originalWidth, maxWidth);
    const height = Math.round(width * aspectRatio);
    
    return { width, height };
  }

  // Progressive image loading with blur placeholder
  static createBlurPlaceholder(src: string, width: number, height: number): string {
    // In a production environment, you'd generate actual blur placeholders
    // For now, return a simple data URL with the aspect ratio
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a simple gradient placeholder
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL('image/jpeg', 0.1);
  }

  // Intersection Observer for lazy loading
  static createLazyLoadObserver(callback: (entries: IntersectionObserverEntry[]) => void): IntersectionObserver {
    return new IntersectionObserver(callback, {
      rootMargin: '50px', // Start loading 50px before entering viewport
      threshold: 0.01
    });
  }

  // WebP support detection
  static supportsWebP(): Promise<boolean> {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = () => resolve(webP.height === 2);
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // AVIF support detection
  static supportsAVIF(): Promise<boolean> {
    return new Promise(resolve => {
      const avif = new Image();
      avif.onload = avif.onerror = () => resolve(avif.height === 2);
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
    });
  }

  // Get best image format based on browser support
  static async getBestFormat(originalSrc: string): Promise<string> {
    const supportsWebP = await this.supportsWebP();
    const supportsAVIF = await this.supportsAVIF();

    if (supportsAVIF && originalSrc.includes('.webp')) {
      // In a real implementation, you'd have AVIF versions
      return originalSrc;
    } else if (supportsWebP && (originalSrc.includes('.jpg') || originalSrc.includes('.png'))) {
      // Convert to webp version if available
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    return originalSrc;
  }

  // Performance monitoring
  static measureImageLoadTime(src: string): Promise<{ src: string; loadTime: number; size?: number }> {
    const startTime = performance.now();
    
    return this.preloadImage(src).then(img => {
      const loadTime = performance.now() - startTime;
      
      // Try to get file size if available
      let size: number | undefined;
      if ('transferSize' in performance.getEntriesByName(src)[0] || {}) {
        const entry = performance.getEntriesByName(src)[0] as PerformanceResourceTiming;
        size = entry.transferSize;
      }
      
      return { src, loadTime, size };
    });
  }

  // Clear cache to free memory
  static clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  // Get cache stats
  static getCacheStats(): { cached: number; loading: number } {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size
    };
  }
}

export default ImageOptimizer;

// Preload critical images on app start
export const preloadCriticalImages = () => {
  // Add your most critical images here
  const criticalImages: string[] = [
    // Add hero images, logo, etc.
  ];
  
  ImageOptimizer.preloadImages(criticalImages).catch(console.warn);
};

// Responsive image breakpoints
export const RESPONSIVE_BREAKPOINTS = {
  mobile: { size: '640px', width: '300px' },
  tablet: { size: '1024px', width: '500px' },
  desktop: { size: '1280px', width: '800px' },
  large: { size: '1536px', width: '1000px' }
};

// Common image sizes for different components
export const IMAGE_SIZES = {
  productCard: ImageOptimizer.generateSizes([
    RESPONSIVE_BREAKPOINTS.mobile,
    RESPONSIVE_BREAKPOINTS.tablet,
    RESPONSIVE_BREAKPOINTS.desktop
  ]),
  hero: '100vw',
  productDetail: ImageOptimizer.generateSizes([
    { size: '768px', width: '90vw' },
    { size: '1024px', width: '50vw' },
    { size: '1280px', width: '600px' }
  ])
};