import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImagePerformanceOptimizer } from '@/utils/performance';

interface AdvancedResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: 'high' | 'low';
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export const AdvancedResponsiveImage: React.FC<AdvancedResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = 'low',
  className = '',
  placeholder,
  onLoad,
  onError,
  sizes = '100vw',
  quality = 75,
  format = 'webp',
  loading = 'lazy',
  fetchPriority = 'auto'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const imageOptimizer = ImagePerformanceOptimizer.getInstance();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before element enters viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Generate optimized sources
  const generateSources = useCallback((baseSrc: string): React.ReactElement[] => {
    const sources: React.ReactElement[] = [];
    const breakpoints = [
      { maxWidth: 480, width: 480 },
      { maxWidth: 768, width: 768 },
      { maxWidth: 1024, width: 1024 },
      { maxWidth: 1200, width: 1200 }
    ];

    // WebP sources for modern browsers
    if (format === 'webp' || format === 'avif') {
      breakpoints.forEach(({ maxWidth, width: imgWidth }) => {
        const optimizedSrc = optimizeImageUrl(baseSrc, imgWidth, quality, format);
        sources.push(
          <source
            key={`${format}-${maxWidth}`}
            media={`(max-width: ${maxWidth}px)`}
            srcSet={optimizedSrc}
            type={`image/${format}`}
          />
        );
      });
    }

    // Fallback JPEG sources
    breakpoints.forEach(({ maxWidth, width: imgWidth }) => {
      const fallbackSrc = optimizeImageUrl(baseSrc, imgWidth, quality, 'jpg');
      sources.push(
        <source
          key={`jpg-${maxWidth}`}
          media={`(max-width: ${maxWidth}px)`}
          srcSet={fallbackSrc}
          type="image/jpeg"
        />
      );
    });

    return sources;
  }, [format, quality]);

  // Optimize image URL with responsive parameters
  const optimizeImageUrl = (url: string, targetWidth: number, targetQuality: number, targetFormat: string) => {
    // If it's already an optimized asset, return as is
    if (url.includes('/assets/') || url.includes('.webp') || url.includes('-')) {
      return url;
    }

    // For dynamic optimization (if backend supports it)
    const params = new URLSearchParams({
      w: targetWidth.toString(),
      q: targetQuality.toString(),
      f: targetFormat
    });

    return `${url}?${params.toString()}`;
  };

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Preload image if high priority
  useEffect(() => {
    if (priority === 'high' && isInView) {
      imageOptimizer.preloadImage(src, priority).catch(() => {
        setHasError(true);
      });
    }
  }, [src, priority, isInView, imageOptimizer]);

  // Calculate aspect ratio for container
  const aspectRatio = width && height ? (height / width) * 100 : undefined;

  // Base styles for container
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    ...(aspectRatio && {
      paddingBottom: `${aspectRatio}%`,
      height: 0
    })
  };

  // Image styles
  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: aspectRatio ? '100%' : 'auto',
    position: aspectRatio ? 'absolute' : 'relative',
    top: 0,
    left: 0,
    objectFit: 'cover',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
    willChange: 'opacity',
    transform: 'translateZ(0)', // Force GPU acceleration
  };

  // Placeholder styles
  const placeholderStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e5e5',
    backgroundImage: placeholder ? `url(${placeholder})` : 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: placeholder ? 'cover' : '200% 100%',
    backgroundPosition: 'center',
    animation: !placeholder ? 'loading 1.5s infinite' : 'none',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
  };

  if (hasError) {
    return (
      <div 
        className={className} 
        style={containerStyles}
        aria-label={`Failed to load image: ${alt}`}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#666',
          fontSize: '14px',
          padding: '1rem'
        }}>
          Image not available
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={containerStyles}>
      {/* Placeholder */}
      <div style={placeholderStyles} />
      
      {/* Image with responsive sources */}
      {isInView && (
        <picture>
          {generateSources(src)}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            style={imageStyles}
            onLoad={handleLoad}
            onError={handleError}
            loading={loading}
            fetchPriority={fetchPriority}
            decoding={priority === 'high' ? 'sync' : 'async'}
            sizes={sizes}
            width={width}
            height={height}
          />
        </picture>
      )}
    </div>
  );
};

// CSS for loading animation (inject into document)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

export default AdvancedResponsiveImage;