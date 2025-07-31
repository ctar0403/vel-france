// Image optimization utilities

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  blur?: boolean;
}

// Generate optimized image URLs (placeholder for actual CDN integration)
export const getOptimizedImageUrl = (
  originalUrl: string, 
  options: ImageOptimizationOptions = {}
): string => {
  if (!originalUrl || originalUrl.includes('/placeholder')) {
    return originalUrl;
  }

  // For future CDN integration, you would build query parameters here
  // Example: return `${originalUrl}?w=${width}&h=${height}&q=${quality}&f=${format}`;
  
  return originalUrl;
};

// Generate responsive image srcSet
export const generateSrcSet = (originalUrl: string, widths: number[]): string => {
  if (!originalUrl || originalUrl.includes('/placeholder')) {
    return originalUrl;
  }

  return widths
    .map(width => `${getOptimizedImageUrl(originalUrl, { width })} ${width}w`)
    .join(', ');
};

// Convert image to WebP format if supported
export const getWebPUrl = (originalUrl: string): string => {
  if (!originalUrl || originalUrl.includes('/placeholder')) {
    return originalUrl;
  }

  // Check if browser supports WebP
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  })();

  if (supportsWebP) {
    // In a real implementation, you'd convert or request WebP version
    return originalUrl;
  }

  return originalUrl;
};

// Preload critical images
export const preloadImage = (src: string, crossOrigin?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    if (crossOrigin) link.crossOrigin = crossOrigin;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));

    document.head.appendChild(link);
  });
};

// Lazy load images with Intersection Observer
export const createImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px 0px',
    threshold: 0.01,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
};

// Get optimal image dimensions based on device
export const getOptimalImageSize = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 800
): { width: number; height: number } => {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const targetWidth = Math.min(maxWidth * devicePixelRatio, originalWidth);
  const aspectRatio = originalHeight / originalWidth;
  
  return {
    width: Math.round(targetWidth),
    height: Math.round(targetWidth * aspectRatio),
  };
};