// Request deduplication utility to prevent duplicate API calls

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest>();
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly REQUEST_TIMEOUT = 30 * 1000; // 30 seconds

  // Get unique key for request
  private getRequestKey(method: string, url: string, body?: any): string {
    const bodyHash = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyHash}`;
  }

  // Check if cache is still valid
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  // Clean up expired cache entries
  private cleanupCache(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    this.cache.forEach(({ timestamp }, key) => {
      if (now - timestamp > this.CACHE_TTL) {
        entriesToDelete.push(key);
      }
    });
    
    entriesToDelete.forEach(key => this.cache.delete(key));
  }

  // Clean up expired pending requests
  private cleanupPendingRequests(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    this.pendingRequests.forEach(({ timestamp }, key) => {
      if (now - timestamp > this.REQUEST_TIMEOUT) {
        entriesToDelete.push(key);
      }
    });
    
    entriesToDelete.forEach(key => this.pendingRequests.delete(key));
  }

  // Deduplicated fetch request
  async fetch(method: string, url: string, options?: RequestInit): Promise<any> {
    const requestKey = this.getRequestKey(method, url, options?.body);
    
    // Clean up expired entries
    this.cleanupCache();
    this.cleanupPendingRequests();

    // Check cache first for GET requests
    if (method === 'GET') {
      const cached = this.cache.get(requestKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(requestKey);
    if (pending) {
      return pending.promise;
    }

    // Create new request
    const promise = this.createRequest(method, url, options);
    this.pendingRequests.set(requestKey, {
      promise,
      timestamp: Date.now()
    });

    try {
      const result = await promise;
      
      // Cache successful GET requests
      if (method === 'GET') {
        this.cache.set(requestKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  private async createRequest(method: string, url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Clear all cache and pending requests
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Get cache statistics
  getStats(): { cacheSize: number; pendingCount: number } {
    return {
      cacheSize: this.cache.size,
      pendingCount: this.pendingRequests.size
    };
  }
}

export const requestDeduplicator = new RequestDeduplicator();