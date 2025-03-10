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

      // Call the original method
      return originalJson.call(this, body);
    };

    next();
  };
};

// Function to invalidate all cache entries in a group
export const invalidateCacheGroup = (group: string): void => {
  const keys = cacheGroups.get(group);
  if (keys) {
    cache.del(Array.from(keys));
    cacheGroups.delete(group);
  }
};

// Function to invalidate a specific cache entry
export const invalidateCache = (url: string, queryParams: Record<string, any> = {}): void => {
  const key = `${url}:${JSON.stringify(queryParams)}`;
  cache.del(key);

  // Also remove from any groups
  for (const [group, keys] of cacheGroups.entries()) {
    if (keys.has(key)) {
      keys.delete(key);
      if (keys.size === 0) {
        cacheGroups.delete(group);
      }
    }
  }
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