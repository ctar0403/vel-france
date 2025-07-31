import compression from 'compression';
import { Request, Response } from 'express';

// Custom compression configuration for optimal performance
export const compressionMiddleware = compression({
  // Compression level (1-9, 6 is default, 9 is max compression)
  level: 6,
  
  // Minimum response size to compress (in bytes)
  threshold: 1024,
  
  // Filter function to determine what to compress
  filter: (req: Request, res: Response) => {
    // Don't compress if explicitly disabled
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression filter function for default behavior
    return compression.filter(req, res);
  },
});

// Brotli compression for modern browsers (better than gzip)
export const brotliCompressionMiddleware = (req: Request, res: Response, next: () => void) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('br')) {
    // Browser supports Brotli - this would be handled by reverse proxy in production
    // For development, we'll stick with gzip via the compression middleware
  }
  
  next();
};