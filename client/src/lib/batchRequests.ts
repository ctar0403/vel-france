// Batch API requests to reduce network waterfall
export class BatchRequestManager {
  private requestQueue: Map<string, Promise<any>> = new Map();
  private batchTimer: number | null = null;
  private readonly BATCH_DELAY = 10; // 10ms delay to batch requests

  public async batchRequest<T>(url: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already in progress
    if (this.requestQueue.has(url)) {
      return this.requestQueue.get(url) as Promise<T>;
    }

    // Create the request promise
    const requestPromise = requestFn().finally(() => {
      // Clean up after request completes
      this.requestQueue.delete(url);
    });

    // Store the promise
    this.requestQueue.set(url, requestPromise);

    return requestPromise;
  }

  public preloadRequests(urls: string[], requestFn: (url: string) => Promise<any>) {
    // Start multiple requests in parallel without waiting
    urls.forEach(url => {
      if (!this.requestQueue.has(url)) {
        this.batchRequest(url, () => requestFn(url)).catch(() => {
          // Silently handle preload failures to avoid blocking the app
        });
      }
    });
  }
}

export const batchManager = new BatchRequestManager();

// Preload critical API endpoints - only products, skip auth-dependent endpoints  
export function preloadCriticalData() {
  // Only preload non-auth endpoints to avoid authentication loops
  const criticalEndpoints = ['/api/products'];
  
  batchManager.preloadRequests(criticalEndpoints, async (url) => {
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.log('Preload failed for:', url);
      return null;
    }
  });
}