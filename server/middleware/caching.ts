import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Create more efficient cache with automatic memory management
const cache = new NodeCache({ 
  stdTTL: 30, // 30 seconds default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  maxKeys: 1000, // Limit maximum cache entries
  useClones: false // For better performance with large objects
});

// Cache groups for bulk invalidation
const cacheGroups = new Map<string, Set<string>>();

// Middleware creator with improved options
export const cacheMiddleware = (options: {
  duration?: number,  // Cache duration in milliseconds
  group?: string,     // Optional group for bulk invalidation
  condition?: (req: Request) => boolean // Optional condition to determine if response should be cached
} = {}) => {
  const { 
    duration = 30000,
    group = '',
    condition = () => true
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests or when condition is not met
    if (req.method !== 'GET' || !condition(req)) {
      return next();
    }

    // Create a unique cache key based on URL and query params
    const key = `${req.originalUrl}:${JSON.stringify(req.query)}`;

    // Check if we have a valid cached response
    const cachedData = cache.get(key);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Store the original res.json method
    const originalJson = res.json;

    // Override the res.json method
    res.json = function(body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Only cache successful responses
        const ttl = Math.floor(duration / 1000); // Convert to seconds for NodeCache
        cache.set(key, body, ttl);

        // Add to cache group if specified
        if (group) {
          if (!cacheGroups.has(group)) {
            cacheGroups.set(group, new Set());
          }
          cacheGroups.get(group)?.add(key);
        }
      }

      // Call the original json method
      return originalJson.call(this, body);
    };

    next();
  };
};

// Helper function to invalidate a specific cache group
export const invalidateCache = (group: string) => {
  const keys = cacheGroups.get(group);
  if (keys) {
    keys.forEach(key => cache.del(key));
    keys.clear();
  }
};

// Helper function to invalidate a specific cache key
export const invalidateCacheKey = (keyPattern: string) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(keyPattern));
  matchingKeys.forEach(key => cache.del(key));
};

// Helper to clear the entire cache
export const clearCache = () => {
  cache.flushAll();
  cacheGroups.clear();
};

// Get cache statistics for monitoring
export const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    groups: Array.from(cacheGroups.keys()),
    memoryUsage: process.memoryUsage().heapUsed
  };
};