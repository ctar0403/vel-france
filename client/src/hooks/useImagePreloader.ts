import { useEffect } from 'react';

// Preload critical images for faster LCP
export const useImagePreloader = (imageSources: string[], priority = false) => {
  useEffect(() => {
    if (!imageSources.length) return;

    const preloadImages = imageSources.map(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if (priority) {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
      return link;
    });

    return () => {
      preloadImages.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [imageSources, priority]);
};

// Preload hero/banner images immediately
export const preloadHeroImages = (heroImages: string[]) => {
  heroImages.forEach(src => {
    const img = new Image();
    img.fetchPriority = 'high';
    img.loading = 'eager';
    img.src = src;
  });
};