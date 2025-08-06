// Critical resource loader to optimize request chains and reduce latency

interface CriticalResource {
  url: string;
  type: 'api' | 'static';
  priority: 'high' | 'medium' | 'low';
  cache?: boolean;
}

class CriticalResourceManager {
  private cache = new Map<string, any>();
  private pendingRequests = new Map<string, Promise<any>>();
  
  // Preload critical API endpoints in parallel
  async preloadCriticalResources(): Promise<void> {
    const criticalResources: CriticalResource[] = [
      { url: '/api/translations', type: 'api', priority: 'high', cache: true },
      { url: '/api/products', type: 'api', priority: 'high', cache: true },
      { url: '/api/cart', type: 'api', priority: 'medium', cache: false },
      { url: '/api/user', type: 'api', priority: 'medium', cache: false }
    ];

    // Load high priority resources first in parallel
    const highPriorityPromises = criticalResources
      .filter(resource => resource.priority === 'high')
      .map(resource => this.loadResource(resource));

    await Promise.allSettled(highPriorityPromises);

    // Then load medium priority resources
    const mediumPriorityPromises = criticalResources
      .filter(resource => resource.priority === 'medium')
      .map(resource => this.loadResource(resource));

    await Promise.allSettled(mediumPriorityPromises);
  }

  // Load individual resource with caching and deduplication
  private async loadResource(resource: CriticalResource): Promise<any> {
    // Check cache first
    if (resource.cache && this.cache.has(resource.url)) {
      return this.cache.get(resource.url);
    }

    // Check if request is already pending to avoid duplicates
    if (this.pendingRequests.has(resource.url)) {
      return this.pendingRequests.get(resource.url);
    }

    // Create new request
    const request = this.fetchResource(resource);
    this.pendingRequests.set(resource.url, request);

    try {
      const result = await request;
      
      // Cache if enabled
      if (resource.cache) {
        this.cache.set(resource.url, result);
      }

      return result;
    } finally {
      this.pendingRequests.delete(resource.url);
    }
  }

  private async fetchResource(resource: CriticalResource): Promise<any> {
    const response = await fetch(resource.url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': resource.cache ? 'max-age=300' : 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load ${resource.url}: ${response.status}`);
    }

    return response.json();
  }

  // Get cached resource if available
  getCachedResource(url: string): any | null {
    return this.cache.get(url) || null;
  }

  // Prefetch next page resources
  prefetchPageResources(route: string): void {
    const routeResources: Record<string, string[]> = {
      '/catalogue': ['/api/products'],
      '/cart': ['/api/cart'],
      '/profile': ['/api/user', '/api/orders'],
      '/admin': ['/api/products', '/api/orders', '/api/translations']
    };

    const resources = routeResources[route];
    if (resources) {
      resources.forEach(url => {
        if (!this.cache.has(url) && !this.pendingRequests.has(url)) {
          this.loadResource({ url, type: 'api', priority: 'low', cache: true });
        }
      });
    }
  }
}

export const criticalResourceManager = new CriticalResourceManager();

// Initialize critical resource loading as early as possible
export const initializeCriticalResources = (): Promise<void> => {
  return criticalResourceManager.preloadCriticalResources();
};