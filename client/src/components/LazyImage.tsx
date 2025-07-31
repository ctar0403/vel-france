import { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  fetchPriority?: 'high' | 'low' | 'auto';
}

const LazyImage = memo(({ 
  src, 
  alt, 
  className, 
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E",
  onLoad,
  onError,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  width,
  height,
  fetchPriority = priority ? 'high' : 'auto'
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Priority images load immediately
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Convert to WebP if supported
  const getOptimizedSrc = (originalSrc: string) => {
    // Check WebP support
    const canvas = document.createElement('canvas');
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
    
    // For production, you'd convert images to WebP or use a CDN
    // For now, return original src
    return originalSrc;
  };

  useEffect(() => {
    if (priority) return; // Skip intersection observer for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Increased rootMargin for faster loading
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={cn("overflow-hidden", className)}>
      {!isInView ? (
        <img
          src={placeholder}
          alt=""
          className="w-full h-full object-cover opacity-30"
          aria-hidden="true"
        />
      ) : (
        <>
          {!isLoaded && !hasError && (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-30 absolute inset-0"
              aria-hidden="true"
            />
          )}
          <img
            src={hasError ? placeholder : getOptimizedSrc(src)}
            alt={alt}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200", // Reduced transition time
              isLoaded || hasError ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            sizes={sizes}
            width={width}
            height={height}

          />
        </>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export { LazyImage };