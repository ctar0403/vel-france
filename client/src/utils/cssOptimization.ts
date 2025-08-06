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

// Preload critical images for LCP optimization
export const preloadCriticalImages = () => {
  const images = [
    { href: '/src/assets/Desktop-1_1754051373226.webp', media: '(min-width: 769px)' },
    { href: '/src/assets/Mobile-1_1754051370153.webp', media: '(max-width: 768px)' }
  ];

  images.forEach(({ href, media }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = href;
    link.media = media;
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