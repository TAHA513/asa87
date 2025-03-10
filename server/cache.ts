import { createClient } from '@neondatabase/serverless';
import { db } from "./db";

const CACHE_TTL = 10 * 60; // 10 minutes cache for better performance
const CACHE_SIZE_LIMIT = 1000; // Limit cache size to prevent memory issues

// Simple LRU cache implementation
class LRUCache {
  private cache: Map<string, { value: any; timestamp: number }>;
  private maxSize: number;

  constructor(maxSize = CACHE_SIZE_LIMIT) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item is expired
    if (Date.now() - item.timestamp > CACHE_TTL * 1000) {
      this.cache.delete(key);
      return null;
    }

    // Move to front (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  set(key: string, value: any): void {
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(keyPattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (keyPattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const globalCache = new LRUCache();