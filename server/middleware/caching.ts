
import { Request, Response, NextFunction } from 'express';

// Simple in-memory cache
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

export function cacheMiddleware(ttl = CACHE_TTL) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create a cache key from the URL
    const cacheKey = req.originalUrl;
    
    // Check if we have a valid cache entry
    const cacheEntry = cache.get(cacheKey);
    if (cacheEntry && (Date.now() - cacheEntry.timestamp) < ttl) {
      return res.json(cacheEntry.data);
    }
    
    // Store the original json method
    const originalJson = res.json;
    
    // Override json method to cache the response
    res.json = function(data) {
      // Store in cache
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      // Call the original method
      return originalJson.call(this, data);
    };
    
    next();
  };
}

// Periodically clean up expired cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60000); // Clean up every minute
