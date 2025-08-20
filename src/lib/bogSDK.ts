// Dynamic BOG SDK loader to reduce render-blocking resources
let bogSDKLoaded = false;
let bogSDKPromise: Promise<void> | null = null;

export function loadBOGSDK(): Promise<void> {
  if (bogSDKLoaded) {
    return Promise.resolve();
  }
  
  if (bogSDKPromise) {
    return bogSDKPromise;
  }
  
  bogSDKPromise = new Promise((resolve, reject) => {
    // Check if BOG SDK is already loaded
    if (window.BOG && window.BOG.Calculator) {
      bogSDKLoaded = true;
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://webstatic.bog.ge/bog-sdk/bog-sdk.js?version=2&client_id=10001216';
    script.async = true;
    
    script.onload = () => {
      bogSDKLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      bogSDKPromise = null; // Reset promise so we can retry
      reject(new Error('Failed to load BOG SDK'));
    };
    
    document.head.appendChild(script);
  });
  
  return bogSDKPromise;
}

// Check if BOG SDK is available
export function isBOGSDKAvailable(): boolean {
  return !!(window.BOG && window.BOG.Calculator);
}

// Preload BOG SDK when user shows intent (like hovering over payment buttons)
export function preloadBOGSDK(): void {
  if (!bogSDKLoaded && !bogSDKPromise) {
    loadBOGSDK().catch(() => {
      // Silently handle preload failures
    });
  }
}