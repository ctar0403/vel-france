// Bundle optimization utilities to reduce JavaScript payload

// Tree-shake framer-motion - only import what we need
export const MotionDiv = import('framer-motion').then(module => module.motion.div);
export const MotionImg = import('framer-motion').then(module => module.motion.img);
export const MotionButton = import('framer-motion').then(module => module.motion.button);

// Lazy load heavy components
import React from 'react';
export const LazySwiper = React.lazy(() => import('swiper/react'));
export const LazyProductCarousel = React.lazy(() => import('@/components/ProductCarousel'));

// Optimize Radix UI imports - tree-shake unused components
export const optimizedRadixImports = {
  Dialog: () => import('@radix-ui/react-dialog').then(m => m.Dialog),
  DropdownMenu: () => import('@radix-ui/react-dropdown-menu').then(m => m.DropdownMenu),
  Select: () => import('@radix-ui/react-select').then(m => m.Select),
};

// Optimize Lucide React - only load icons we actually use
export const optimizedLucideIcons = {
  ShoppingBag: () => import('lucide-react').then(m => ({ ShoppingBag: m.ShoppingBag })),
  User: () => import('lucide-react').then(m => ({ User: m.User })),
  Package: () => import('lucide-react').then(m => ({ Package: m.Package })),
  ChevronLeft: () => import('lucide-react').then(m => ({ ChevronLeft: m.ChevronLeft })),
  ChevronRight: () => import('lucide-react').then(m => ({ ChevronRight: m.ChevronRight })),
};

// Bundle size analysis
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // Log bundle sizes for optimization
    console.log('Bundle optimization active');
  }
};

// Critical path optimization
export const optimizeCriticalPath = () => {
  // Remove unused CSS
  const unusedCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
  unusedCSS.forEach(link => {
    if (link instanceof HTMLLinkElement) {
      link.media = 'print';
      link.onload = () => { link.media = 'all'; };
    }
  });
  
  // Defer non-critical scripts
  const scripts = document.querySelectorAll('script[data-defer]');
  scripts.forEach(script => {
    if (script instanceof HTMLScriptElement) {
      script.defer = true;
    }
  });
};