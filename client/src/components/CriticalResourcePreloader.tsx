import { useEffect } from 'react';

// Preload critical resources for ultra-fast loading
export const CriticalResourcePreloader = () => {
  useEffect(() => {
    // Preload first banner image (LCP element)
    const heroImage = new Image();
    heroImage.src = '/attached_assets/11_1753734243609.png';
    heroImage.fetchPriority = 'high';
    heroImage.loading = 'eager';
    
    // Preload critical API endpoints
    const preloadAPI = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        await fetch('/api/products', {
          signal: controller.signal,
          headers: { 'X-Preload': 'true' }
        });
        
        clearTimeout(timeoutId);
      } catch (error) {
        // Silently fail - this is just preloading
      }
    };
    
    // Preload in idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadAPI);
    } else {
      setTimeout(preloadAPI, 100);
    }
    
    // Optimize third-party scripts
    const optimizeScripts = () => {
      // Defer BOG scripts until after LCP
      const bogScript = document.querySelector('script[src*="bog-calculator"]');
      if (bogScript && bogScript instanceof HTMLScriptElement) {
        bogScript.defer = true;
      }
    };
    
    optimizeScripts();
  }, []);

  return null;
};