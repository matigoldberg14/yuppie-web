// src/components/dashboard/AnalyticsContent.tsx
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { auth } from '../../lib/firebase';
import { getRestaurantByFirebaseUID } from '../../services/api';
import {
  getRestaurantMetrics,
  getMetricsHistory,
} from '../../services/metrics';
import type { MetricsData, TimeFilter } from '../../types/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/progress';
import { Download, TrendingUp, TrendingDown, Star } from 'lucide-react';
import {
  MetricsLineChart,
  MetricsBarChart,
  MetricsPieChart,
} from './charts/ChartComponents';
import { getCachedMetrics, setCachedMetrics } from './metricsCache';
import { getSelectedRestaurant } from '../../lib/restaurantStore';

const MetricCard = React.memo(({ title, value, trend, icon }: any) => (
  <Card className="bg-white/10 border-0">
    <CardHeader className="pb-2">
      <CardTitle className="text-white text-sm">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
      {trend !== undefined && (
        <p className="text-xs text-white/60">
          {trend === 0 ? (
            'Primer período - No hay datos anteriores para comparar'
          ) : (
            <>
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400 inline mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400 inline mr-1" />
              )}
              {Math.abs(trend).toFixed(1)}% vs período anterior
            </>
          )}
        </p>
      )}
      {icon}
    </CardContent>
  </Card>
));

const LoadingState = () => (
  <div className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-white/10 rounded" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-[400px] bg-white/10 rounded" />
      ))}
    </div>
  </div>
);

export function AnalyticsContent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para el restaurante seleccionado
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    getSelectedRestaurant()
  );

  useEffect(() => {
    const handleRestaurantChange = (e: CustomEvent) => {
      console.log(
        'AnalyticsContent: restaurantChange event received:',
        e.detail
      );
      setSelectedRestaurant(e.detail);
    };
    window.addEventListener(
      'restaurantChange',
      handleRestaurantChange as EventListener
    );
    return () => {
      window.removeEventListener(
        'restaurantChange',
        handleRestaurantChange as EventListener
      );
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (!auth?.currentUser?.uid) return;

        // Intentar obtener datos del caché
        const cacheKey = `${auth.currentUser.uid}_${timeFilter}`;
        const cachedData = getCachedMetrics(cacheKey);

        if (cachedData) {
          setMetrics(cachedData.metrics);
          setHistory(cachedData.history);
          setLoading(false);
          return;
        }

        // Usar el restaurante seleccionado si existe; de lo contrario, obtenerlo por UID
        const restaurantData = selectedRestaurant
          ? selectedRestaurant
          : await getRestaurantByFirebaseUID(auth.currentUser.uid);

        if (!restaurantData) throw new Error('No restaurant found');

        const [metricsData, historyData] = await Promise.all([
          getRestaurantMetrics(restaurantData.documentId, timeFilter),
          getMetricsHistory(restaurantData.documentId, timeFilter),
        ]);

        const responseRate =
          restaurantData.taps > 0
            ? (metricsData.totalReviews / parseInt(restaurantData.taps)) * 100
            : 0;

        const updatedMetrics = {
          ...metricsData,
          responseRate,
        };

        if (isMounted) {
          setMetrics(updatedMetrics);
          setHistory(historyData);
          setCachedMetrics(cacheKey, {
            metrics: updatedMetrics,
            history: historyData,
          });
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : 'Error loading data'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [timeFilter, selectedRestaurant]);

  const processedHistoryData = useMemo(() => {
    if (!history?.dates) return [];
    return history.dates.map((date: string, i: number) => ({
      date,
      reviews: history.reviews[i],
      rating: history.ratings[i],
    }));
  }, [history]);

  if (loading) return <LoadingState />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!metrics || !history) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex gap-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="bg-white/10 text-white border-0 rounded-lg px-4 py-2"
          >
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="year">Último año</option>
          </select>
          <Button variant="ghost" className="text-white">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </header>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total de reseñas"
          value={metrics.totalReviews}
          trend={metrics.trends.volumeTrend}
        />
        <MetricCard
          title="Rating promedio"
          value={metrics.averageRating.toFixed(1)}
          icon={
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(metrics.averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
          }
        />
        <MetricCard
          title="Tasa de respuesta"
          value={`${metrics.responseRate.toFixed(1)}%`}
          icon={<Progress value={metrics.responseRate} className="h-2" />}
        />
        <MetricCard
          title="Envíos a Google"
          value={`${metrics.googleSentRate.toFixed(1)}%`}
          icon={<Progress value={metrics.googleSentRate} className="h-2" />}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Evolución de reseñas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Suspense
                fallback={<div className="animate-pulse h-full bg-white/10" />}
              >
                <MetricsLineChart data={processedHistoryData} />
              </Suspense>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">
              Distribución de calificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Suspense
                fallback={<div className="animate-pulse h-full bg-white/10" />}
              >
                <MetricsBarChart data={metrics.ratingsDistribution} />
              </Suspense>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Tipos de mejora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Suspense
                fallback={<div className="animate-pulse h-full bg-white/10" />}
              >
                <MetricsPieChart data={metrics.reviewsByType} />
              </Suspense>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Análisis por día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Suspense
                fallback={<div className="animate-pulse h-full bg-white/10" />}
              >
                <MetricsBarChart
                  data={Object.entries(metrics.weekdayAnalysis).map(
                    ([day, data]) => ({
                      day,
                      count: data.count,
                      rating: data.averageRating,
                    })
                  )}
                />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
