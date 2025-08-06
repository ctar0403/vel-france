// Image optimization utilities for responsive delivery

export interface ImageSizeConfig {
  mobile: { width: number; height: number };
  tablet: { width: number; height: number };
  desktop: { width: number; height: number };
}

// Predefined size configurations for different image types
export const IMAGE_SIZE_CONFIGS = {
  // Hero banner images
  heroBanner: {
    mobile: { width: 480, height: 360 },
    tablet: { width: 768, height: 576 },
    desktop: { width: 1200, height: 900 }
  },
  // Product thumbnails
  productThumbnail: {
    mobile: { width: 120, height: 80 },
    tablet: { width: 160, height: 107 },
    desktop: { width: 200, height: 133 }
  },
  // Product cards
  productCard: {
    mobile: { width: 160, height: 120 },
    tablet: { width: 200, height: 150 },
    desktop: { width: 240, height: 180 }
  },
  // Brand logos
  brandLogo: {
    mobile: { width: 60, height: 40 },
    tablet: { width: 80, height: 53 },
    desktop: { width: 100, height: 67 }
  },
  // Flag icons
  flagIcon: {
    mobile: { width: 28, height: 28 },
    tablet: { width: 28, height: 28 },
    desktop: { width: 28, height: 28 }
  }
} as const;

export type ImageType = keyof typeof IMAGE_SIZE_CONFIGS;

// Generate srcSet for responsive images
export const generateSrcSet = (originalSrc: string, imageType: ImageType): string => {
  const config = IMAGE_SIZE_CONFIGS[imageType];
  
  // For now, return original src since we can't dynamically resize
  // In production, this would generate multiple sizes
  return originalSrc;
};

// Get optimal size based on current viewport
export const getOptimalImageSize = (imageType: ImageType): { width: number; height: number } => {
  const config = IMAGE_SIZE_CONFIGS[imageType];
  
  // Use matchMedia to avoid forced reflows
  if (typeof window === 'undefined') return config.desktop;
  
  if (window.matchMedia('(max-width: 639px)').matches) {
    return config.mobile;
  } else if (window.matchMedia('(max-width: 1023px)').matches) {
    return config.tablet;
  } else {
    return config.desktop;
  }
};

// Generate sizes attribute for responsive images
export const generateSizesAttribute = (imageType: ImageType): string => {
  const config = IMAGE_SIZE_CONFIGS[imageType];
  
  return `
    (max-width: 639px) ${config.mobile.width}px,
    (max-width: 1023px) ${config.tablet.width}px,
    ${config.desktop.width}px
  `.replace(/\s+/g, ' ').trim();
};

// Preload critical images with proper sizing
export const preloadOptimizedImage = (src: string, imageType: ImageType, priority: boolean = false) => {
  const optimalSize = getOptimalImageSize(imageType);
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  
  // Add media query for responsive preloading
  const config = IMAGE_SIZE_CONFIGS[imageType];
  if (window.matchMedia('(max-width: 639px)').matches) {
    link.media = '(max-width: 639px)';
  } else if (window.matchMedia('(max-width: 1023px)').matches) {
    link.media = '(max-width: 1023px)';
  }
  
  if (priority) {
    link.fetchPriority = 'high';
  }
  
  document.head.appendChild(link);
};

// Image compression quality based on usage
export const getCompressionQuality = (imageType: ImageType): number => {
  switch (imageType) {
    case 'heroBanner':
      return 85; // High quality for hero images
    case 'productCard':
    case 'productThumbnail':
      return 75; // Medium quality for product images
    case 'brandLogo':
    case 'flagIcon':
      return 90; // High quality for logos/icons
    default:
      return 75;
  }
};

// Lazy loading configuration based on image type
export const getLazyLoadingConfig = (imageType: ImageType) => {
  const configs = {
    heroBanner: {
      rootMargin: '50px', // Load hero images earlier
      threshold: 0.1
    },
    productCard: {
      rootMargin: '100px', // Standard loading
      threshold: 0.1
    },
    productThumbnail: {
      rootMargin: '150px', // Load thumbnails a bit later
      threshold: 0.05
    },
    brandLogo: {
      rootMargin: '200px', // Load logos when needed
      threshold: 0.05
    },
    flagIcon: {
      rootMargin: '0px', // Load flags immediately when visible
      threshold: 0.1
    }
  };
  
  return configs[imageType] || configs.productCard;
};