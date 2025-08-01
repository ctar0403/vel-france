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
        this.batchRequest(url, () => requestFn(url));
      }
    });
  }
}

export const batchManager = new BatchRequestManager();

// Preload critical API endpoints
export function preloadCriticalData() {
  const criticalEndpoints = ['/api/products', '/api/cart'];
  
  batchManager.preloadRequests(criticalEndpoints, async (url) => {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) return null;
    return response.json();
  });
}