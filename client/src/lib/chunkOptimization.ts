// Chunk optimization utilities for reducing bundle size

// Dynamically import heavy libraries only when needed
export const loadFramerMotion = () => import('framer-motion');
export const loadReactSpring = () => import('@react-spring/web');

// Preload critical chunks for better performance
export function preloadCriticalChunks() {
  // Preload admin chunks when user navigates to admin routes
  if (window.location.pathname.includes('/admin')) {
    import('@/pages/admin');
    import('@/pages/admin-login');
  }
  
  // Preload payment chunks when user navigates to checkout
  if (window.location.pathname.includes('/checkout') || window.location.pathname.includes('/cart')) {
    import('@/pages/checkout');
    import('@/pages/payment-success');
    import('@/pages/payment-cancel');
  }
}

// Lazy load heavy UI components
export const loadHeavyComponents = {
  ProductCarousel: () => import('@/components/ProductCarousel'),
  HeroSlider: () => import('@/components/HeroSlider'),
  CartSidebar: () => import('@/components/CartSidebar'),
};

// Initialize chunk preloading on route changes
export function initializeChunkPreloading() {
  // Only run on client side
  if (typeof window === 'undefined') return () => {};
  
  // Listen for route changes to preload relevant chunks
  let currentPath = window.location.pathname;
  
  // Use a simpler approach with popstate and pushstate events
  const handleRouteChange = () => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      preloadCriticalChunks();
    }
  };
  
  window.addEventListener('popstate', handleRouteChange);
  
  // Override pushState and replaceState to catch programmatic navigation
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    setTimeout(handleRouteChange, 0);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    setTimeout(handleRouteChange, 0);
  };
  
  // Initial preload
  preloadCriticalChunks();
  
  return () => {
    window.removeEventListener('popstate', handleRouteChange);
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };
}