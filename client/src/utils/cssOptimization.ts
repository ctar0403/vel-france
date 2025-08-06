// CSS Optimization utilities to reduce render-blocking resources

export const loadNonCriticalCSS = (href: string, media = 'all') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  link.onload = () => {
    link.rel = 'stylesheet';
    link.media = media;
  };
  document.head.appendChild(link);
};

export const preloadResource = (href: string, as: string, type?: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
};

export const deferCSS = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print';
  link.onload = () => {
    link.media = 'all';
  };
  document.head.appendChild(link);
};

// Optimize font loading with font-display: swap
export const optimizeFontLoading = () => {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'AlkSanet';
      src: url('/assets/alk-sanet_1754502110450.ttf') format('truetype');
      font-display: swap;
      font-weight: normal;
      font-style: normal;
    }
    
    /* Ensure font-display: swap for all fonts */
    * {
      font-display: swap !important;
    }
  `;
  document.head.appendChild(style);
};

// Preload critical images for LCP optimization with proper sizing hints
export const preloadCriticalImages = () => {
  const criticalImages = [
    // Hero banner - first slide only for faster LCP
    { href: '/src/assets/4_1754504202405.webp', media: '(min-width: 640px)', priority: 'high' },
    { href: '/src/assets/discount_1754505093401_mobile.webp', media: '(max-width: 639px)', priority: 'high' },
    // Logo - always visible
    { href: '/src/assets/Your%20paragraph%20text%20(4)_1753542106373.webp', priority: 'high' },
    // Flag icons - small but visible immediately
    { href: '/src/assets/197380_1754501720841.png', priority: 'low' },
    { href: '/src/assets/United-kingdom_flag_icon_round.svg_1754501741206.png', priority: 'low' }
  ];

  criticalImages.forEach(({ href, media, priority }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = href;
    if (media) link.media = media;
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }
    document.head.appendChild(link);
  });

  // Add resource hints for image domains
  const resourceHints = [
    'https://c49faf85-37be-48eb-af28-0889dcc91f60-00-wdfi0w2idbxm.worf.replit.dev'
  ];

  resourceHints.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Initialize all CSS optimizations
export const initCSSOptimizations = () => {
  // Run optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeFontLoading();
      preloadCriticalImages();
    });
  } else {
    optimizeFontLoading();
    preloadCriticalImages();
  }
};