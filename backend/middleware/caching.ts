// Server-side caching middleware for performance optimization

interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
}

class MemoryCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  private options: CacheOptions;

  constructor(options: CacheOptions = { ttl: 300000, maxSize: 100 }) {
    this.options = options;
  }

  set(key: string, data: any, ttl?: number): void {
    const expireTime = Date.now() + (ttl || this.options.ttl);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { data, expires: expireTime });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Create cache instances for different data types
export const productCache = new MemoryCache({ ttl: 300000, maxSize: 50 }); // 5 minutes
export const userCache = new MemoryCache({ ttl: 120000, maxSize: 200 }); // 2 minutes
export const cartCache = new MemoryCache({ ttl: 60000, maxSize: 500 }); // 1 minute

// Cache middleware factory
export function createCacheMiddleware(cache: MemoryCache, keyGenerator: (req: any) => string) {
  return (req: any, res: any, next: any) => {
    const cacheKey = keyGenerator(req);
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }
    
    // Store original res.json
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Cache the response
      cache.set(cacheKey, data);
      res.setHeader('X-Cache', 'MISS');
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
}

// Clear cache utility
export function clearCacheByPattern(cache: MemoryCache, pattern: string): void {
  const keysToDelete: string[] = [];
  
  const cacheMap = cache['cache'] as Map<string, any>;
  for (const key of cacheMap.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => cacheMap.delete(key));
}