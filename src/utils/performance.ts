// src/utils/performance.ts
export class Cache {
  private static instance: Cache;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

export const appCache = Cache.getInstance();

// Función para precarga de datos
export async function preloadData(restaurantId: string) {
  try {
    const promises = [
      import('../components/feedback/Rating'),
      import('../components/feedback/ImprovementSelector'),
      import('../components/feedback/CommentForm'),
    ];

    await Promise.all(promises);
  } catch (error) {
    console.error('Error preloading components:', error);
  }
}
