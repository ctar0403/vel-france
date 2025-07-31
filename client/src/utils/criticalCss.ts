// Critical CSS utilities for above-the-fold content

export const injectCriticalCSS = () => {
  const criticalStyles = `
    /* Critical performance CSS */
    .font-playfair { font-family: 'Playfair Display', serif; }
    .font-roboto { font-family: 'Roboto', sans-serif; }
    .text-navy { color: #2d3748; }
    .text-gold { color: #d4af37; }
    .bg-gold { background-color: #d4af37; }
    .bg-cream { background-color: #f7fafc; }
    .bg-pastel-pink { background-color: #fdf2f8; }
    
    /* Critical layout */
    .container { max-width: 1200px; margin: 0 auto; }
    .aspect-square { aspect-ratio: 1/1; }
    
    /* Animation optimizations */
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
    
    /* Performance optimizations */
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    img {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
    
    /* Mobile optimizations */
    @media (max-width: 768px) {
      .container { padding: 0 1rem; }
      .text-4xl { font-size: 2rem; }
      .text-6xl { font-size: 3rem; }
    }
  `;

  const style = document.createElement('style');
  style.innerHTML = criticalStyles;
  document.head.appendChild(style);
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const resources = [
    { href: '/api/products', as: 'fetch', type: 'application/json' },
    { href: '/api/cart', as: 'fetch', type: 'application/json' },
  ];

  resources.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  });
};

// Optimize fonts loading
export const optimizeFonts = () => {
  // Preload critical font variations
  const fontPreloads = [
    'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
    'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDYbtXK-F2qO0isEw.woff2'
  ];

  fontPreloads.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

export default {
  injectCriticalCSS,
  preloadCriticalResources,
  optimizeFonts
};