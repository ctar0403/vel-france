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

  // Simplified image loading - remove unnecessary srcSet for better performance
  const generateSrcSet = (originalSrc: string) => {
    // Simply return the source for faster loading
    return originalSrc;
  };

  // Optimize image loading - no complex calculations for better performance
  const getOptimalSize = () => {
    return src; // Direct return for fastest loading
  };

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
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
        alt={alt}
        loading={priority ? 'eager' : loading}
        width={width}
        height={height}
        className={`
          transition-opacity duration-200 w-full h-full object-cover
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
      
      {/* Error state - retry button */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <button 
            onClick={() => {
              setHasError(false);
              setIsLoaded(false);
              // Force reload the image
              const timestamp = new Date().getTime();
              setCurrentSrc(`${src}?t=${timestamp}`);
            }}
            className="text-gray-600 text-sm hover:text-gray-800 transition-colors"
          >
            Image unavailable - Click to retry
          </button>
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
          // Load immediately when intersecting for faster response
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Load image 200px before it comes into view for smoother experience
        threshold: 0.01, // Trigger as soon as any part is visible
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