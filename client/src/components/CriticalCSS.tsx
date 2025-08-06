import React, { useEffect } from 'react';

// Critical CSS component for above-the-fold optimization
export const CriticalCSS: React.FC = () => {
  useEffect(() => {
    // Inject critical CSS immediately
    const criticalStyles = `
      /* Critical above-the-fold styles for immediate rendering */
      .header-container {
        position: relative;
        z-index: 50;
        background: white;
        border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        contain: layout style paint;
      }

      .nav-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        max-width: 1200px;
        margin: 0 auto;
        contain: layout;
      }

      .hero-banner {
        position: relative;
        height: 60vh;
        min-height: 400px;
        max-height: 700px;
        overflow: hidden;
        background: linear-gradient(135deg, #faf7f0, #f5e6e8);
        contain: layout style paint;
        will-change: transform;
      }

      .hero-image-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }

      .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        will-change: transform;
        transform: translate3d(0, 0, 0);
        backface-visibility: hidden;
      }

      .hero-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 2;
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        contain: layout style;
      }

      .hero-title {
        font-size: clamp(2rem, 5vw, 4rem);
        font-weight: 700;
        margin-bottom: 1rem;
        line-height: 1.2;
      }

      .hero-subtitle {
        font-size: clamp(1rem, 2.5vw, 1.5rem);
        font-weight: 400;
        opacity: 0.9;
        margin-bottom: 2rem;
      }

      .hero-cta {
        background: linear-gradient(135deg, #d4af37, #b8860b);
        color: white;
        padding: 1rem 2rem;
        border: none;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
        transform: translateZ(0);
      }

      .hero-cta:hover {
        transform: translateY(-2px) translateZ(0);
        box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
      }

      /* Loading skeleton for better perceived performance */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
      }

      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Mobile optimizations */
      @media (max-width: 768px) {
        .hero-banner {
          height: 50vh;
          min-height: 300px;
        }

        .nav-container {
          padding: 0.75rem;
        }

        .hero-title {
          font-size: clamp(1.5rem, 6vw, 2.5rem);
        }

        .hero-subtitle {
          font-size: clamp(0.875rem, 3vw, 1.125rem);
        }

        .hero-cta {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
        }
      }

      /* GPU acceleration for smooth animations */
      .animated-element {
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
      }

      /* Prevent layout shifts during font loading */
      .font-loading {
        font-display: swap;
        font-synthesis: none;
        text-rendering: optimizeSpeed;
      }

      /* Content visibility for performance */
      .below-fold {
        content-visibility: auto;
        contain-intrinsic-size: 300px;
      }

      /* Optimize image rendering */
      .optimized-image {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        transform: translateZ(0);
      }
    `;

    // Create and inject critical CSS
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-critical', 'true');
    styleElement.textContent = criticalStyles;
    
    // Insert at the beginning of head for highest priority
    document.head.insertBefore(styleElement, document.head.firstChild);

    // Cleanup function
    return () => {
      const criticalStyleElement = document.querySelector('style[data-critical="true"]');
      if (criticalStyleElement) {
        criticalStyleElement.remove();
      }
    };
  }, []);

  return null; // This component only injects CSS
};

export default CriticalCSS;