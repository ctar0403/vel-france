import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  priority = false,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E",
  onLoad,
  onError 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Convert to WebP if browser supports it
  const getOptimizedSrc = (originalSrc: string) => {
    // For development, return original src
    // In production, you could implement WebP conversion
    return originalSrc;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  useEffect(() => {
    if (priority && imgRef.current) {
      // Preload high priority images
      const img = new Image();
      img.src = getOptimizedSrc(src);
      img.onload = handleLoad;
      img.onerror = handleError;
    }
  }, [src, priority]);

  if (hasError) {
    return (
      <div className={cn("bg-gray-100 flex items-center justify-center", className)}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder while loading */}
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={getOptimizedSrc(src)}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </div>
  );
}