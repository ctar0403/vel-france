// Advanced Resource Optimization Utilities for 100/100 PageSpeed Score

export interface ResourceHint {
  rel: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch';
  href: string;
  as?: string;
  type?: string;
  crossOrigin?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  media?: string;
}

class ResourceOptimizer {
  private static instance: ResourceOptimizer;
  private preloadedResources = new Set<string>();
  private prefetchedResources = new Set<string>();

  static getInstance(): ResourceOptimizer {
    if (!ResourceOptimizer.instance) {
      ResourceOptimizer.instance = new ResourceOptimizer();
    }
    return ResourceOptimizer.instance;
  }

  // Add resource hints to document head
  addResourceHint(hint: ResourceHint): void {
    const key = `${hint.rel}-${hint.href}`;
    
    if (hint.rel === 'preload' && this.preloadedResources.has(key)) return;
    if (hint.rel === 'prefetch' && this.prefetchedResources.has(key)) return;

    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    
    if (hint.as) link.setAttribute('as', hint.as);
    if (hint.type) link.setAttribute('type', hint.type);
    if (hint.crossOrigin) link.setAttribute('crossorigin', hint.crossOrigin);
    if (hint.fetchPriority) link.setAttribute('fetchpriority', hint.fetchPriority);
    if (hint.media) link.setAttribute('media', hint.media);

    document.head.appendChild(link);

    if (hint.rel === 'preload') this.preloadedResources.add(key);
    if (hint.rel === 'prefetch') this.prefetchedResources.add(key);
  }

  // Preload critical LCP images
  preloadLCPImages(): void {
    const lcpImages = [
      {
        desktop: '/assets/4_1754504202405-BpCLEn9R.webp',
        mobile: '/assets/discount_1754505093401_mobile-Bi8CSbwf.webp'
      }
    ];

    lcpImages.forEach(({ desktop, mobile }) => {
      // Desktop LCP image
      this.addResourceHint({
        rel: 'preload',
        href: desktop,
        as: 'image',
        fetchPriority: 'high',
        media: '(min-width: 769px)'
      });

      // Mobile LCP image
      this.addResourceHint({
        rel: 'preload',
        href: mobile,
        as: 'image',
        fetchPriority: 'high',
        media: '(max-width: 768px)'
      });
    });
  }

  // Preload critical fonts
  preloadCriticalFonts(): void {
    const fonts = [
      '/assets/alk-sanet_1754502110450.ttf'
    ];

    fonts.forEach(fontUrl => {
      this.addResourceHint({
        rel: 'preload',
        href: fontUrl,
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
        fetchPriority: 'high'
      });
    });
  }

  // Preconnect to external domains
  preconnectToDomains(): void {
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://webstatic.bog.ge'
    ];

    domains.forEach(domain => {
      this.addResourceHint({
        rel: 'preconnect',
        href: domain,
        crossOrigin: 'anonymous'
      });
    });
  }

  // Prefetch next-page resources
  prefetchNextPageResources(): void {
    const nextPageResources = [
      '/api/products',
      '/api/cart',
      '/catalogue'
    ];

    nextPageResources.forEach(resource => {
      this.addResourceHint({
        rel: 'prefetch',
        href: resource,
        as: 'fetch',
        crossOrigin: 'same-origin'
      });
    });
  }

  // Initialize all optimizations
  initialize(): void {
    // Critical path optimizations
    this.preloadLCPImages();
    this.preloadCriticalFonts();
    this.preconnectToDomains();

    // Progressive enhancement
    requestIdleCallback(() => {
      this.prefetchNextPageResources();
    }, { timeout: 2000 });
  }
}

// CSS Loading Optimization
class CSSOptimizer {
  private static loadedCSS = new Set<string>();

  // Load CSS asynchronously without blocking
  static async loadCSS(href: string, media = 'all'): Promise<void> {
    if (this.loadedCSS.has(href)) return;

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.media = 'only x'; // Temporarily disable

      const activate = () => {
        if (link.addEventListener) {
          link.removeEventListener('load', activate);
          link.removeEventListener('error', activate);
        }
        link.media = media;
        link.rel = 'stylesheet';
        this.loadedCSS.add(href);
        resolve();
      };

      if (link.addEventListener) {
        link.addEventListener('load', activate);
        link.addEventListener('error', () => {
          reject(new Error(`Failed to load CSS: ${href}`));
        });
      } else {
        link.onload = activate;
        link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
      }

      // Fallback timeout
      setTimeout(activate, 100);

      document.head.appendChild(link);
    });
  }

  // Inline critical CSS for immediate rendering
  static inlineCriticalCSS(css: string): void {
    const style = document.createElement('style');
    style.setAttribute('data-critical', 'true');
    style.textContent = css;
    document.head.insertBefore(style, document.head.firstChild);
  }
}

// JavaScript Loading Optimization
class JSOptimizer {
  private static loadedScripts = new Set<string>();

  // Load JavaScript modules asynchronously
  static async loadScript(src: string, type: 'module' | 'script' = 'script'): Promise<void> {
    if (this.loadedScripts.has(src)) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      if (type === 'module') {
        script.type = 'module';
      }

      script.onload = () => {
        this.loadedScripts.add(src);
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  // Load scripts with priority
  static loadScriptWithPriority(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (priority === 'high') {
      return this.loadScript(src);
    } else {
      return new Promise(resolve => {
        requestIdleCallback(() => {
          this.loadScript(src).then(resolve);
        }, { timeout: 5000 });
      });
    }
  }
}

// Font Optimization
class FontOptimizer {
  // Optimize font loading with display swap
  static optimizeFontLoading(): void {
    const fontCSS = `
      @font-face {
        font-family: 'AlkSanet';
        src: url('/assets/alk-sanet_1754502110450.ttf') format('truetype');
        font-display: swap;
        font-weight: normal;
        font-style: normal;
      }
      
      /* Apply font-display: swap to all fonts */
      * {
        font-display: swap !important;
      }
    `;

    const style = document.createElement('style');
    style.textContent = fontCSS;
    document.head.appendChild(style);
  }

  // Preload font variants based on usage
  static preloadFontVariants(): void {
    const optimizer = ResourceOptimizer.getInstance();
    
    // Preload only essential font weights
    const fontVariants = [
      { weight: 400, style: 'normal' },
      { weight: 600, style: 'normal' },
      { weight: 700, style: 'normal' }
    ];

    fontVariants.forEach(variant => {
      optimizer.addResourceHint({
        rel: 'preload',
        href: `/assets/alk-sanet_1754502110450.ttf`,
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous'
      });
    });
  }
}

// Image Optimization
class ImageOptimizer {
  // Generate WebP/AVIF fallbacks
  static generateResponsivePicture(src: string, alt: string, sizes: string = '100vw'): string {
    const baseUrl = src.replace(/\.[^/.]+$/, '');
    
    return `
      <picture>
        <source srcset="${baseUrl}.avif" type="image/avif">
        <source srcset="${baseUrl}.webp" type="image/webp">
        <img src="${src}" alt="${alt}" sizes="${sizes}" loading="lazy" decoding="async">
      </picture>
    `;
  }

  // Lazy load images with intersection observer
  static setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px'
      });

      // Observe all lazy images
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

// Bundle all optimizations
export const initializeAllOptimizations = (): void => {
  const resourceOptimizer = ResourceOptimizer.getInstance();
  
  // Initialize resource optimizations
  resourceOptimizer.initialize();
  
  // Initialize font optimizations
  FontOptimizer.optimizeFontLoading();
  FontOptimizer.preloadFontVariants();
  
  // Initialize image optimizations
  ImageOptimizer.setupLazyLoading();
  
  console.log('All resource optimizations initialized');
};

// Export singleton instances and utilities
export const resourceOptimizer = ResourceOptimizer.getInstance();
export { CSSOptimizer, JSOptimizer, FontOptimizer, ImageOptimizer };