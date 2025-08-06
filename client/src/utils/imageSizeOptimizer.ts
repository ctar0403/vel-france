// Advanced image size optimization utility to reduce payload sizes

interface OptimizedImageSizes {
  mobile: string;
  tablet: string;
  desktop: string;
}

// Map of problematic images from performance report with optimized alternatives
export const IMAGE_SIZE_OPTIMIZATIONS: Record<string, OptimizedImageSizes> = {
  // UK Flag icon: 2048x2048 → 28x28 (95 KiB savings)
  'United-kingdom_flag_icon_round.svg_1754501741206.png': {
    mobile: '28x28',
    tablet: '28x28', 
    desktop: '28x28'
  },
  
  // Georgian Flag icon: 512x512 → 28x28 (14.3 KiB savings)
  '197380_1754501720841.png': {
    mobile: '28x28',
    tablet: '28x28',
    desktop: '28x28'
  },
  
  // Mobile banner images: 800x600 → responsive sizes
  'Mobile-2_1754051370154.webp': {
    mobile: '412x309',
    tablet: '600x450',
    desktop: '800x600'
  },
  
  'discount_1754505093401.webp': {
    mobile: '412x309', 
    tablet: '600x450',
    desktop: '800x600'
  },
  
  'Mobile-3_1754051370154.webp': {
    mobile: '412x309',
    tablet: '600x450', 
    desktop: '800x600'
  },
  
  // Product thumbnails: 300x200 → 80x53 for thumbnails
  '7_1753788502255.webp': {
    mobile: '80x53',
    tablet: '120x80',
    desktop: '160x107'
  },
  
  '10_1753788502256.webp': {
    mobile: '80x53',
    tablet: '120x80', 
    desktop: '160x107'
  },
  
  '5_1753788502254.webp': {
    mobile: '80x53',
    tablet: '120x80',
    desktop: '160x107'
  },
  
  // Logo optimization: 500x200 → responsive sizes
  'Your paragraph text (4)_1753542106373.webp': {
    mobile: '120x48',
    tablet: '160x64', 
    desktop: '200x80'
  }
};

// Generate responsive sizes attribute for optimized images
export const getOptimizedSizes = (imageName: string): string => {
  const optimization = IMAGE_SIZE_OPTIMIZATIONS[imageName];
  if (!optimization) {
    return '(max-width: 640px) 160px, (max-width: 1024px) 240px, 320px';
  }

  const mobileWidth = optimization.mobile.split('x')[0];
  const tabletWidth = optimization.tablet.split('x')[0];
  const desktopWidth = optimization.desktop.split('x')[0];

  return `(max-width: 640px) ${mobileWidth}px, (max-width: 1024px) ${tabletWidth}px, ${desktopWidth}px`;
};

// Get optimal dimensions for current viewport
export const getOptimalDimensions = (imageName: string): { width: number; height: number } => {
  const optimization = IMAGE_SIZE_OPTIMIZATIONS[imageName];
  
  if (!optimization) {
    return { width: 300, height: 200 }; // Default fallback
  }

  // Use matchMedia to determine optimal size without forced reflows
  if (typeof window !== 'undefined') {
    if (window.matchMedia('(max-width: 640px)').matches) {
      const [width, height] = optimization.mobile.split('x').map(Number);
      return { width, height };
    } else if (window.matchMedia('(max-width: 1024px)').matches) {
      const [width, height] = optimization.tablet.split('x').map(Number);
      return { width, height };
    } else {
      const [width, height] = optimization.desktop.split('x').map(Number);
      return { width, height };
    }
  }

  // Server-side fallback to desktop
  const [width, height] = optimization.desktop.split('x').map(Number);
  return { width, height };
};

// Calculate potential savings based on optimization
export const calculateSavings = (imageName: string, originalSize: number): number => {
  const optimization = IMAGE_SIZE_OPTIMIZATIONS[imageName];
  if (!optimization) return 0;

  // Rough calculation based on dimension reduction
  const originalDimensions = getOriginalDimensions(imageName);
  const optimizedDimensions = getOptimalDimensions(imageName);
  
  const originalPixels = originalDimensions.width * originalDimensions.height;
  const optimizedPixels = optimizedDimensions.width * optimizedDimensions.height;
  
  const compressionRatio = optimizedPixels / originalPixels;
  return Math.round(originalSize * (1 - compressionRatio));
};

// Get original dimensions for known problematic images
const getOriginalDimensions = (imageName: string): { width: number; height: number } => {
  const originalSizes: Record<string, { width: number; height: number }> = {
    'United-kingdom_flag_icon_round.svg_1754501741206.png': { width: 2048, height: 2048 },
    '197380_1754501720841.png': { width: 512, height: 512 },
    'Mobile-2_1754051370154.webp': { width: 800, height: 600 },
    'discount_1754505093401.webp': { width: 800, height: 600 },
    'Mobile-3_1754051370154.webp': { width: 800, height: 600 },
    '7_1753788502255.webp': { width: 300, height: 200 },
    '10_1753788502256.webp': { width: 300, height: 200 },
    '5_1753788502254.webp': { width: 300, height: 200 },
    'Your paragraph text (4)_1753542106373.webp': { width: 500, height: 200 }
  };
  
  return originalSizes[imageName] || { width: 300, height: 200 };
};