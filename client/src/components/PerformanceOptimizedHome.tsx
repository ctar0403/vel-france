import React, { memo, useEffect } from 'react';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { CriticalCSS } from '@/components/CriticalCSS';

// Critical performance optimizations for home page
const PerformanceOptimizedHome = memo(() => {
  // Preload critical hero images
  const heroImages = [
    '/assets/1_1753538704078.png', // First banner image
  ];
  
  useImagePreloader(heroImages, true);

  useEffect(() => {
    // Performance optimizations
    const optimizations = async () => {
      // Preload critical resources
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);

      // Defer non-critical JavaScript
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Load non-critical scripts here
        });
      }
    };

    optimizations();
  }, []);

  return (
    <>
      <CriticalCSS />
      {/* Rest of home page content will be loaded */}
    </>
  );
});

PerformanceOptimizedHome.displayName = 'PerformanceOptimizedHome';

export default PerformanceOptimizedHome;