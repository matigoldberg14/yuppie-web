// src/services/optimizedMetrics.ts
import { MetricsCacheManager } from '../lib/cache/metricsCacheManager';
import * as metrics from './metrics';
import type { MetricsData, TimeFilter } from '../types/metrics';

const cacheManager = MetricsCacheManager.getInstance();

export async function getOptimizedRestaurantMetrics(
  restaurantId: string,
  timeFilter: TimeFilter
): Promise<MetricsData> {
  const cacheKey = `metrics_${restaurantId}_${timeFilter}`;
  const cachedData = cacheManager.getCached<MetricsData>(cacheKey, timeFilter);

  if (cachedData) {
    return cachedData;
  }

  const data = await metrics.getRestaurantMetrics(restaurantId, timeFilter);
  cacheManager.setCache(cacheKey, data, timeFilter);
  return data;
}
