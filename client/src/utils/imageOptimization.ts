// Image optimization utilities for performance
export const getOptimizedImageSrc = (
  src: string, 
  width?: number, 
  format: 'webp' | 'avif' | 'auto' = 'auto'
): string => {
  if (!src) return src;
  
  // For production, implement actual image optimization
  // This would typically involve a CDN or image service
  const baseUrl = src;
  
  // Add width parameter for responsive images
  if (width) {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('w', width.toString());
    if (format !== 'auto') {
      url.searchParams.set('f', format);
    }
    return url.toString();
  }
  
  return baseUrl;
};

export const generateImageSrcSet = (src: string, sizes: number[]): string => {
  return sizes
    .map(size => `${getOptimizedImageSrc(src, size)} ${size}w`)
    .join(', ');
};

export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
};

// Preload critical images
export const preloadImage = (src: string, priority: 'high' | 'low' = 'high') => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  if (priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
};