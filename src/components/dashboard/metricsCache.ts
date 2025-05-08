// src/components/dashboard/metricsCache.ts
export const metricsCache = new Map();
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const getCachedMetrics = (key: string) => {
  const cached = metricsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const setCachedMetrics = (key: string, data: any) => {
  metricsCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};
