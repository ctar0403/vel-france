// Database optimization middleware and utilities

import { db } from '../db';

// Connection pool optimization for PostgreSQL
export async function optimizeDatabase() {
  try {
    // Set session-level parameters for better query performance (Neon compatible)
    await db.execute(`SET work_mem = '8MB';`);
    await db.execute(`SET random_page_cost = 1.1;`);
    await db.execute(`SET effective_cache_size = '128MB';`);
    
    console.log('Database session optimized for performance');
  } catch (error) {
    console.warn('Database optimization failed:', error);
  }
}

// Query performance monitoring
export function createQueryMonitor() {
  return (query: string, startTime: number) => {
    const duration = Date.now() - startTime;
    
    if (duration > 100) { // Log slow queries (>100ms)
      console.warn(`Slow query detected (${duration}ms):`, query.substring(0, 100));
    }
    
    if (process.env.NODE_ENV === 'development' && duration > 50) {
      console.log(`Query took ${duration}ms:`, query.substring(0, 50));
    }
  };
}

// Batch operations for better performance
export class BatchOperations {
  private static readonly BATCH_SIZE = 100;
  
  static async batchInsert<T>(
    table: any,
    items: T[],
    batchSize: number = BatchOperations.BATCH_SIZE
  ): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await db.insert(table).values(batch);
    }
  }
  
  static async batchUpdate<T>(
    table: any,
    updates: Array<{ id: string; data: Partial<T> }>,
    batchSize: number = BatchOperations.BATCH_SIZE
  ): Promise<void> {
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      // Execute batch updates in parallel
      await Promise.all(
        batch.map(({ id, data }) =>
          db.update(table).set(data).where(table.id.eq(id))
        )
      );
    }
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  responseTime?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    await db.execute('SELECT 1');
    const responseTime = Date.now() - startTime;
    
    return {
      isHealthy: true,
      responseTime
    };
  } catch (error) {
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Index recommendations for common queries
export const suggestedIndexes = [
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_at ON products(created_at DESC);',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products(category);',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_brand ON products(brand);',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id ON orders(user_id);',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);',
];

// Apply performance indexes
export async function createPerformanceIndexes() {
  try {
    for (const indexSql of suggestedIndexes) {
      try {
        await db.execute(indexSql);
        console.log('Applied index:', indexSql.split(' ')[5]); // Extract index name
      } catch (error) {
        // Index might already exist, continue
        console.log('Index already exists or failed:', indexSql.split(' ')[5]);
      }
    }
    console.log('Performance indexes applied');
  } catch (error) {
    console.warn('Failed to apply some performance indexes:', error);
  }
}