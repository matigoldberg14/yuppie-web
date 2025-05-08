// src/lib/hooks/useMetrics.ts
import { useState, useEffect } from 'react';
import { getOptimizedRestaurantMetrics } from '../../services/optimizedMetrics';
import type { MetricsData, TimeFilter } from '../../types/metrics';

export function useMetrics(restaurantId: string, timeFilter: TimeFilter) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const metrics = await getOptimizedRestaurantMetrics(
          restaurantId,
          timeFilter
        );

        if (mounted) {
          setData(metrics);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [restaurantId, timeFilter]);

  return { data, loading, error };
}
