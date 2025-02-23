// src/lib/cache/metricsCacheManager.ts
import type { MetricsData, TimeFilter } from '../../types/metrics';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  filter: TimeFilter;
}

export class MetricsCacheManager {
  private static instance: MetricsCacheManager;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Limpiar caché antiguo periódicamente
    setInterval(() => this.cleanOldCache(), this.CACHE_DURATION);
  }

  static getInstance(): MetricsCacheManager {
    if (!MetricsCacheManager.instance) {
      MetricsCacheManager.instance = new MetricsCacheManager();
    }
    return MetricsCacheManager.instance;
  }

  getCached<T>(key: string, filter: TimeFilter): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.CACHE_DURATION;
    const filterChanged = entry.filter !== filter;

    if (isExpired || filterChanged) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  setCache<T>(key: string, data: T, filter: TimeFilter): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      filter,
    });
  }

  private cleanOldCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}
