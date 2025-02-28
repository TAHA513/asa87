interface CacheItem<T> {
  value: T;
  expiry: number;
}

export class Cache {
  private store: Map<string, CacheItem<any>> = new Map();

  set<T>(key: string, value: T, ttlSeconds: number) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.store.set(key, { value, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.store.clear();
  }
}
