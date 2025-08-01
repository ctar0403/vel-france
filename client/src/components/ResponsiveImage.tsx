import { useState, useEffect } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function ResponsiveImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  sizes,
  priority = false,
  width,
  height,
}: ResponsiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate responsive image URLs for different sizes
  const generateSrcSet = (originalSrc: string) => {
    // For now, we'll use the same image but we could implement server-side resizing
    // or use a service like Cloudinary/ImageKit in the future
    const baseSrc = originalSrc;
    
    // Generate different sizes - we'll use CSS to scale for now
    // In a production environment, you'd want actual different sized images
    return `${baseSrc} 1x, ${baseSrc} 2x`;
  };

  // Optimize image loading based on viewport size
  const getOptimalSize = () => {
    if (typeof window === 'undefined') return src;
    
    const viewportWidth = window.innerWidth;
    
    // For mobile/small screens, use smaller images
    if (viewportWidth < 640) {
      // Mobile optimization - could serve smaller images here
      return src;
    } else if (viewportWidth < 1024) {
      // Tablet optimization
      return src;
    } else {
      // Desktop
      return src;
    }
  };

  useEffect(() => {
    setCurrentSrc(getOptimalSize());
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Determine appropriate sizes attribute
  const defaultSizes = sizes || `
    (max-width: 640px) 160px,
    (max-width: 1024px) 240px,
    320px
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={currentSrc}
        srcSet={generateSrcSet(currentSrc)}
        sizes={defaultSizes}
        alt={alt}
        loading={priority ? 'eager' : loading}
        width={width}
        height={height}
        className={`
          transition-opacity duration-300 w-full h-full object-cover
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${hasError ? 'bg-gray-200' : ''}
        `}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-sm">Image unavailable</div>
        </div>
      )}
    </div>
  );
}

// Higher-order component for lazy loading with intersection observer
export function LazyImage(props: ResponsiveImageProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [imgRef, setImgRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!imgRef || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Load image 50px before it comes into view
      }
    );

    observer.observe(imgRef);

    return () => observer.disconnect();
  }, [imgRef, shouldLoad]);

  if (!shouldLoad) {
    return (
      <div
        ref={setImgRef}
        className={`bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse ${props.className}`}
        style={{
          aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : '1',
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return <ResponsiveImage {...props} />;
}