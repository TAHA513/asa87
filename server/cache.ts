import { createClient } from '@neondatabase/serverless';
import { db } from "./db";

class CacheManager {
  private cache: Map<string, { value: string; expiry: number }>;

  constructor() {
    this.cache = new Map();
  }

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });

    // Clean up expired items periodically
    if (this.cache.size > 1000) {
      this.cleanup();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const caching = new CacheManager();