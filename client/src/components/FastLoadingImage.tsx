import { memo, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FastLoadingImageProps {
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

// Ultra-fast loading image component optimized for Core Web Vitals
const FastLoadingImage = memo(({
  src,
  alt,
  className,
  priority = false,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError
}: FastLoadingImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading non-priority images
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Preload priority images immediately
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
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
      <div 
        ref={imgRef}
        className={cn("bg-gray-200 flex items-center justify-center", className)}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          width={width}
          height={height}
          sizes={sizes}
          style={{
            contentVisibility: priority ? 'visible' : 'auto',
            containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
          }}
        />
      )}
    </div>
  );
});

FastLoadingImage.displayName = 'FastLoadingImage';

export { FastLoadingImage };