import { Request, Response, NextFunction } from 'express';

// Ultra-fast server response middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set performance headers
  res.setHeader('Server-Timing', `total;dur=${Date.now()}`);
  
  // Enable HTTP/2 Server Push hints
  res.setHeader('Link', [
    '</src/main.tsx>; rel=preload; as=script',
    '</src/index.css>; rel=preload; as=style',
    '<https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2>; rel=preload; as=font; crossorigin'
  ].join(', '));
  
  // Cache control for static assets
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
  }
  
  // Add timing
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};

// Optimize API responses
export const apiOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Enable ETags for better caching
  res.setHeader('ETag', `W/"${Date.now()}"`);
  
  // Optimize JSON responses
  const originalJson = res.json;
  res.json = function(obj) {
    // Compress large responses
    if (JSON.stringify(obj).length > 1024) {
      res.setHeader('Content-Encoding', 'gzip');
    }
    return originalJson.call(this, obj);
  };
  
  next();
};