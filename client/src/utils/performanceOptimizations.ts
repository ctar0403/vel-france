// Performance optimization utilities
export const optimizeImages = () => {
  // Convert images to WebP where supported
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  })();

  return { supportsWebP };
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.href = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
  
  // Preload critical CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'preload';
  cssLink.as = 'style';
  cssLink.href = '/critical.css';
  document.head.appendChild(cssLink);
};

// Defer non-critical JavaScript
export const deferNonCriticalJS = () => {
  const scripts = document.querySelectorAll('script[data-defer]');
  scripts.forEach(script => {
    if (script instanceof HTMLScriptElement) {
      script.defer = true;
    }
  });
};

// Optimize third-party scripts
export const optimizeThirdPartyScripts = () => {
  // Load analytics only after page is interactive
  if (document.readyState === 'complete') {
    loadAnalytics();
  } else {
    window.addEventListener('load', loadAnalytics);
  }
};

const loadAnalytics = () => {
  // Defer analytics to idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Load analytics here
    });
  } else {
    setTimeout(() => {
      // Fallback for older browsers
    }, 2000);
  }
};

// Reduce JavaScript bundle size
export const treeShakeUnusedCode = () => {
  // This would be handled by build tools, but we can implement runtime checks
  const isProductionBuild = process.env.NODE_ENV === 'production';
  
  if (isProductionBuild) {
    // Remove console.log statements in production
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }
};

// Performance monitoring
export const monitorPerformance = () => {
  if ('PerformanceObserver' in window) {
    // Monitor Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Monitor First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
      });
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
  }
};