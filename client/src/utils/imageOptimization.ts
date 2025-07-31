// Image optimization utilities for ultra-fast loading
export const optimizeImageForPerformance = (src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
}) => {
  // For now, return original source
  // In production, you could implement:
  // - WebP/AVIF conversion
  // - Image resizing/optimization
  // - CDN integration
  return src;
};

export const preloadCriticalImages = (imageUrls: string[]) => {
  imageUrls.forEach((url, index) => {
    if (index < 4) { // Only preload first 4 images
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      if (index === 0) {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
    }
  });
};

export const getImageDimensions = (src: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
};