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
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MetricCard = React.memo(({ title, value, trend, icon }: any) => (
  <Card className='bg-white/10 border-0'>
    <CardHeader className='pb-2'>
      <CardTitle className='text-white text-sm'>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className='text-2xl font-bold text-white'>{value}</div>
      {trend !== undefined && (
        <p className='text-xs text-white/60'>
          {trend === 0 ? (
            'Primer período - No hay datos anteriores para comparar'
          ) : (
            <>
              {trend >= 0 ? (
                <TrendingUp className='h-4 w-4 text-green-400 inline mr-1' />
              ) : (
                <TrendingDown className='h-4 w-4 text-red-400 inline mr-1' />
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
  <div className='p-6'>
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse'>
      {[...Array(4)].map((_, i) => (
        <div key={i} className='h-32 bg-white/10 rounded' />
      ))}
    </div>
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
      {[...Array(4)].map((_, i) => (
        <div key={i} className='h-[400px] bg-white/10 rounded' />
      ))}
    </div>
  </div>
);

interface Props {
  lang: SupportedLang;
}

export function AnalyticsContent({ lang }: Props) {
  const t = useTranslations(lang);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para el restaurante seleccionado
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    getSelectedRestaurant()
  );

  // Escuchar el evento "restaurantChange" para actualizar el restaurante seleccionado
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
        // Generar clave de caché que incluya el documentId del restaurante seleccionado
        const cacheKey = `${auth.currentUser.uid}_${
          selectedRestaurant?.documentId || 'default'
        }_${timeFilter}`;
        const cachedData = getCachedMetrics(cacheKey);
        if (cachedData) {
          setMetrics(cachedData.metrics);
          setHistory(cachedData.history);
          setLoading(false);
          return;
        }
        // Usar el restaurante seleccionado si existe; de lo contrario, obtenerlo
        const restaurantData = selectedRestaurant
          ? selectedRestaurant
          : await getRestaurantByFirebaseUID(auth.currentUser.uid);
        if (!restaurantData) throw new Error(t('error.noRestaurantFound'));
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
            error instanceof Error ? error.message : t('error.loadingData')
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
  }, [timeFilter, selectedRestaurant, t]);

  const processedHistoryData = useMemo(() => {
    if (!history?.dates) return [];
    return history.dates.map((date: string, i: number) => ({
      date,
      reviews: history.reviews[i],
      rating: history.ratings[i],
    }));
  }, [history]);

  if (loading) return <LoadingState />;
  if (error) return <div className='p-6 text-red-500'>{error}</div>;
  if (!metrics || !history) return null;

  return (
    <div className='p-6'>
      {/* Header */}
      <header className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-white'>
          {t('analytics.title')}
        </h1>
        <div className='flex gap-2'>
          <div className='relative'>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className='bg-white/10 text-white border-0 rounded-lg px-4 py-2 pr-10 appearance-none'
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
              }}
            >
              <option
                value='today'
                style={{ backgroundColor: 'white', color: '#1e1e1e' }}
              >
                {t('analytics.timeFilters.today')}
              </option>
              <option
                value='week'
                style={{ backgroundColor: 'white', color: '#1e1e1e' }}
              >
                {t('analytics.timeFilters.lastWeek')}
              </option>
              <option
                value='month'
                style={{ backgroundColor: 'white', color: '#1e1e1e' }}
              >
                {t('analytics.timeFilters.lastMonth')}
              </option>
              <option
                value='year'
                style={{ backgroundColor: 'white', color: '#1e1e1e' }}
              >
                {t('analytics.timeFilters.lastYear')}
              </option>
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center mr-2 text-white'>
              <svg
                className='fill-current h-4 w-4'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
              >
                <path d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
              </svg>
            </div>
          </div>

          <Button variant='ghost' className='flex items-center text-white'>
            <Download className='mr-2 h-4 w-4' />
            {t('analytics.export')}
          </Button>
        </div>
      </header>

      {/* Métricas principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <MetricCard
          title={t('analytics.metrics.totalReviews')}
          value={metrics.totalReviews}
          trend={metrics.trends.volumeTrend}
        />
        <MetricCard
          title={t('analytics.metrics.averageRating')}
          value={metrics.averageRating.toFixed(1)}
          icon={
            <div className='flex items-center'>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(metrics.averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
          }
        />
        <MetricCard
          title={t('analytics.metrics.responseRate')}
          value={`${metrics.responseRate.toFixed(1)}%`}
          trend={metrics.trends.responseRateTrend}
        />
        <MetricCard
          title={t('analytics.metrics.totalTaps')}
          value={metrics.totalTaps}
          trend={metrics.trends.tapsTrend}
        />
      </div>

      {/* Gráficos */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-white/10 border-0'>
          <CardHeader>
            <CardTitle className='text-white'>
              {t('analytics.charts.reviewsEvolution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <MetricsLineChart data={processedHistoryData} />
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white/10 border-0'>
          <CardHeader>
            <CardTitle className='text-white'>
              {t('analytics.charts.ratingDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <MetricsBarChart data={metrics.ratingDistribution} />
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white/10 border-0'>
          <CardHeader>
            <CardTitle className='text-white'>
              {t('analytics.charts.improvementTypes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <MetricsPieChart data={metrics.improvementTypes} />
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white/10 border-0'>
          <CardHeader>
            <CardTitle className='text-white'>
              {t('analytics.charts.responseTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <MetricsLineChart data={metrics.responseTimeData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
