// src/components/dashboard/AnalyticsContent.tsx
import React, { useState, useEffect } from 'react';
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  CalendarIcon,
  ChevronDown,
  Download,
  TrendingUp,
  TrendingDown,
  Star,
  MessageSquare,
  Users,
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AnalyticsContent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth?.currentUser?.uid) return;

        const restaurantData = await getRestaurantByFirebaseUID(
          auth.currentUser.uid
        );
        if (!restaurantData) throw new Error('No restaurant found');

        const [metricsData, historyData] = await Promise.all([
          getRestaurantMetrics(restaurantData.documentId, timeFilter),
          getMetricsHistory(restaurantData.documentId, timeFilter),
        ]);

        // Calcular el índice de respuestas (reviews/taps)
        const responseRate =
          restaurantData.taps > 0
            ? (metricsData.totalReviews / parseInt(restaurantData.taps)) * 100
            : 0;

        setMetrics({
          ...metricsData,
          responseRate, // Sobreescribimos responseRate con nuestro cálculo basado en taps
        });
        setHistory(historyData);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFilter]);

  if (loading || !metrics || !history) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-white">Cargando análisis...</div>
      </div>
    );
  }

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
        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">
              Total de reseñas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.totalReviews}
            </div>
            <p className="text-xs text-white/60">
              {metrics.trends.volumeTrend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400 inline mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400 inline mr-1" />
              )}
              {Math.abs(metrics.trends.volumeTrend).toFixed(1)}% vs período
              anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">
              Rating promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.averageRating.toFixed(1)}
            </div>
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
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">
              Tasa de respuesta
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
          <CardHeader className="pb-2">
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución de reseñas */}
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Evolución de reseñas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={history.dates.map((date: string, i: number) => ({
                    date,
                    reviews: history.reviews[i],
                    rating: history.ratings[i],
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reviews"
                    stroke="#4318FF"
                    strokeWidth={2}
                    name="Reseñas"
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#00C49F"
                    strokeWidth={2}
                    name="Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribución de calificaciones */}
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">
              Distribución de calificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.ratingsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="rating" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" name="Cantidad">
                    {metrics.ratingsDistribution.map(
                      (_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tipos de mejora */}
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Tipos de mejora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.reviewsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) =>
                      `${type} (${percentage.toFixed(0)}%)`
                    }
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {metrics.reviewsByType.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Análisis por día de la semana */}
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Análisis por día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(metrics.weekdayAnalysis).map(
                    ([day, data]) => ({
                      day,
                      count: data.count,
                      rating: data.averageRating,
                    })
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="day" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" name="Cantidad" fill="#4318FF" />
                  <Bar dataKey="rating" name="Rating" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
