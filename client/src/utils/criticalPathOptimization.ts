// Critical path optimization for sub-1s FCP
export const optimizeCriticalRenderingPath = () => {
  // 1. Inline critical CSS to prevent render-blocking
  const criticalCSS = `
    body { margin: 0; font-family: 'Roboto', sans-serif; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .text-navy { color: #1e3a8a; }
    .text-gold { color: #d97706; }
    .bg-gradient-primary { background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.insertBefore(style, document.head.firstChild);
  
  // 2. Preload critical fonts inline
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.as = 'font';
  fontPreload.href = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2';
  fontPreload.crossOrigin = 'anonymous';
  document.head.appendChild(fontPreload);
  
  // 3. Optimize initial viewport
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width,initial-scale=1,minimum-scale=1');
  }
  
  console.log('✅ Critical rendering path optimized');
};

export const prefetchCriticalResources = () => {
  const resources = [
    '/api/products',
    '/attached_assets/11_1753734243609.png', // Hero image
    '/attached_assets/1_1753788502251.png'   // First brand logo
  ];
  
  resources.forEach((url, index) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    if (index === 0) {
      link.setAttribute('fetchpriority', 'high');
    }
    document.head.appendChild(link);
  });
  
  console.log('✅ Critical resources prefetched');
};

export const enablePerformanceObserver = () => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', Math.round(entry.startTime));
        }
        if (entry.name === 'largest-contentful-paint') {
          console.log('LCP:', Math.round(entry.startTime));
        }
      }
    });
    
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
  }
};