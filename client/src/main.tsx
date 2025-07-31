import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/index.css';

// Performance optimizations
const enablePerformanceOptimizations = () => {
  // Remove loading indicator
  const loadingElement = document.querySelector('.app-loading');
  if (loadingElement) {
    loadingElement.remove();
  }

  // Enable strict mode only in development
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    // Production optimizations
    console.log = () => {}; // Remove console.log in production
    console.debug = () => {}; // Remove console.debug in production
  }
};

// Initialize app
const root = ReactDOM.createRoot(document.getElementById('root')!);

if (import.meta.env.DEV) {
  // Development mode with StrictMode for debugging
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Production mode without StrictMode for performance
  root.render(<App />);
}

// Apply performance optimizations after render
enablePerformanceOptimizations();

// Register service worker in production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}