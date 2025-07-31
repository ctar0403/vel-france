import { memo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Ultra-optimized image component for critical performance
const OptimizedImage = memo(({
  src,
  alt,
  className,
  priority = false,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Preload critical images immediately
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={cn("bg-gray-200 flex items-center justify-center", className)}>
        <span className="text-gray-400 text-sm">Failed to load</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "transition-opacity duration-150",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      width={width}
      height={height}
      sizes={sizes}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };