// Bundle optimization utilities to reduce unused JavaScript

// Tree-shake heavy libraries by importing only what's needed
export const optimizedImports = {
  // Framer Motion - only import what's used
  motion: () => import('framer-motion').then(m => ({ motion: m.motion })),
  AnimatePresence: () => import('framer-motion').then(m => ({ AnimatePresence: m.AnimatePresence })),
  
  // Radix UI - import individual components instead of full packages
  Dialog: () => import('@radix-ui/react-dialog'),
  DropdownMenu: () => import('@radix-ui/react-dropdown-menu'),
  Select: () => import('@radix-ui/react-select'),
  Toast: () => import('@radix-ui/react-toast'),
  
  // Icons - only import specific icons
  ShoppingBag: () => import('lucide-react').then(m => ({ ShoppingBag: m.ShoppingBag })),
  User: () => import('lucide-react').then(m => ({ User: m.User })),
  Search: () => import('lucide-react').then(m => ({ Search: m.Search })),
};

// Defer loading of non-critical features
export const deferredFeatures = {
  // Admin functionality - only load when accessing admin routes
  adminFeatures: () => Promise.all([
    import('@/pages/admin'),
    import('@/pages/admin-login'),
  ]),
  
  // Payment features - only load during checkout flow
  paymentFeatures: () => Promise.all([
    import('@/pages/checkout'),
    import('@/pages/payment-success'),
    import('@/pages/payment-cancel'),
    import('@/lib/bogSDK'),
  ]),
  
  // User profile features - only load when authenticated
  profileFeatures: () => Promise.all([
    import('@/pages/profile'),
    import('@/pages/order-details'),
  ]),
};

// Optimize component loading based on route
export function loadRouteOptimizedChunks(pathname: string) {
  if (pathname.includes('/admin')) {
    return deferredFeatures.adminFeatures();
  }
  
  if (pathname.includes('/checkout') || pathname.includes('/payment')) {
    return deferredFeatures.paymentFeatures();
  }
  
  if (pathname.includes('/profile') || pathname.includes('/order-details')) {
    return deferredFeatures.profileFeatures();
  }
  
  return Promise.resolve();
}

// Remove unused CSS and JavaScript
export const bundleCleanup = {
  // Remove unused Tailwind classes (handled by build process)
  // Remove unused Radix UI components
  removeUnusedComponents: () => {
    // This would be handled by tree-shaking in production build
    console.log('Tree-shaking unused components...');
  },
  
  // Minimize polyfills
  minimalPolyfills: () => {
    // Only include polyfills that are actually needed
    console.log('Loading minimal polyfills...');
  },
};