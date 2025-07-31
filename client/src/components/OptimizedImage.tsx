import { memo, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Generate a tiny blur placeholder as base64
const generateBlurPlaceholder = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL('image/jpeg', 0.1);
};

const OptimizedImage = memo(({
  src,
  alt,
  className,
  width = 400,
  height = 400,
  priority = false,
  placeholder,
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Generate placeholder if none provided
  const blurPlaceholder = placeholder || generateBlurPlaceholder(20, 20);

  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: '100px' // Start loading 100px before visible
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [priority, isInView]);

  useEffect(() => {
    if (!isInView || !src) return;

    // Try WebP first, fallback to original
    const webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(webpSrc);
      setIsLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      // Fallback to original format
      const originalImg = new Image();
      originalImg.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      originalImg.onerror = () => {
        setHasError(true);
        onError?.();
      };
      originalImg.src = src;
    };
    
    img.src = webpSrc;
  }, [isInView, src, onLoad, onError]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div 
      ref={imgRef} 
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {/* Blur placeholder */}
      <img
        src={blurPlaceholder}
        alt=""
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />
      
      {/* Main image */}
      {(isInView || priority) && (
        <img
          src={hasError ? blurPlaceholder : currentSrc || src}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          width={width}
          height={height}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };