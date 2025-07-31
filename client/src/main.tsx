import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import { injectCriticalCSS, preloadCriticalResources, optimizeFonts } from '@/utils/criticalCss';

// Critical performance optimizations
const optimizeForFCP = () => {
  // Remove skeleton and mark app as loaded
  const skeleton = document.querySelector('.initial-skeleton');
  if (skeleton) {
    skeleton.remove();
  }
  document.body.classList.add('app-loaded');

  // Production optimizations
  if (import.meta.env.PROD) {
    console.log = console.warn = console.debug = () => {};
  }
};

// Dynamic import for main app to enable code splitting
const loadApp = async () => {
  const { default: App } = await import('./App');
  const root = createRoot(document.getElementById('root')!);
  
  // Only use StrictMode in development for performance
  if (import.meta.env.DEV) {
    root.render(<StrictMode><App /></StrictMode>);
  } else {
    root.render(<App />);
  }
  
  optimizeForFCP();
};

// Enhanced critical resource preloading
const enhancedPreloading = () => {
  preloadCriticalResources();
  optimizeFonts();
  injectCriticalCSS();
};

// Initialize app with performance optimizations
const initializeApp = async () => {
  // Start critical optimizations immediately
  enhancedPreloading();
  
  // Load app
  await loadApp();
  
  // Register service worker for caching (production only)
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }
};

// Start initialization
initializeApp();