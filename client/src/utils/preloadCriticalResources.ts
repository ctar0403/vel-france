// Preload absolutely critical resources for sub-1s FCP
export const preloadCriticalResources = () => {
  // 1. Preload hero image (LCP element) immediately
  const heroImg = document.createElement('link');
  heroImg.rel = 'preload';
  heroImg.as = 'image';
  heroImg.href = '/attached_assets/11_1753734243609.png';
  heroImg.setAttribute('fetchpriority', 'high');
  document.head.appendChild(heroImg);
  
  // 2. Preload critical API data
  const apiPreload = document.createElement('link');
  apiPreload.rel = 'preload';
  apiPreload.as = 'fetch';
  apiPreload.href = '/api/products';
  apiPreload.crossOrigin = 'anonymous';
  document.head.appendChild(apiPreload);
  
  // 3. Preload first brand logo
  const brandImg = document.createElement('link');
  brandImg.rel = 'preload';
  brandImg.as = 'image';
  brandImg.href = '/attached_assets/1_1753788502251.png';
  document.head.appendChild(brandImg);
  
  console.log('✅ Critical resources preloaded for ultra-fast loading');
};

// Call immediately when script loads
if (typeof window !== 'undefined') {
  preloadCriticalResources();
}