// src/components/dashboard/RestaurantDetail.tsx
import React, { useState, useEffect } from 'react';
import { getRestaurantMetrics } from '../../services/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Star } from 'lucide-react';
import type { MetricsData } from '../../types/metrics';

interface Restaurant {
  id: number;
  documentId: string;
  name: string;
  taps: string;
  owner: {
    firstName: string;
    lastName: string;
  };
}

interface ExtendedMetricsData extends MetricsData {
  responseRate: number;
}

interface RestaurantDetailProps {
  restaurant: Restaurant;
  timeFilter?: 'today' | 'week' | 'month' | 'year';
}

export function RestaurantDetail({
  restaurant,
  timeFilter = 'month',
}: RestaurantDetailProps) {
  const [metrics, setMetrics] = useState<ExtendedMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const metricsData = await getRestaurantMetrics(
          restaurant.documentId,
          timeFilter
        );
        const totalReviews = metricsData.totalReviews;
        const restaurantTaps = parseInt(restaurant.taps);
        const responseRate =
          restaurantTaps > 0 ? (totalReviews / restaurantTaps) * 100 : 0;
        const updatedMetrics: ExtendedMetricsData = {
          ...metricsData,
          responseRate,
        };
        if (isMounted) {
          setMetrics(updatedMetrics);
        }
      } catch (err) {
        console.error('Error obteniendo métricas del restaurante:', err);
        if (isMounted) {
          setError('Error cargando las métricas');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMetrics();
    return () => {
      isMounted = false;
    };
  }, [restaurant.documentId, restaurant.taps, timeFilter]);

  if (loading)
    return (
      <div className="text-white">
        Cargando detalles de {restaurant.name}...
      </div>
    );
  if (error) return <div className="text-red-500">{error}</div>;
  if (!metrics) return null;

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold text-white">
        Detalles - {restaurant.name}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white text-sm">Total Reseñas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.totalReviews}
            </div>
            <Progress value={metrics.totalReviews} max={1000} className="h-2" />
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              Rating Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.averageRating.toFixed(1)}
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= metrics.averageRating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              Tasa de Respuesta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.responseRate.toFixed(1)}%
            </div>
            <Progress value={metrics.responseRate} className="h-2" />
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              Envíos a Google
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.googleSentRate.toFixed(1)}%
            </div>
            <Progress value={metrics.googleSentRate} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
