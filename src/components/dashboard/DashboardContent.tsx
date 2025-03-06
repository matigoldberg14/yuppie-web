// src/components/dashboard/DashboardContent.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { getRestaurantReviews } from '../../services/api';
import { Star, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/Button';
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
} from 'recharts';
import { getSelectedRestaurant } from '../../lib/restaurantStore';

interface Stats {
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  taps: number;
  ratingData: Array<{ rating: number; count: number }>;
  timelineData: Array<{ date: string; reviews: number }>;
}

export function DashboardContent() {
  const [currentRestaurant, setCurrentRestaurant] = useState(
    getSelectedRestaurant()
  );
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    averageRating: 0,
    responseRate: 0,
    taps: 0,
    ratingData: [],
    timelineData: [],
  });
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en el restaurante seleccionado
  useEffect(() => {
    const handleRestaurantChange = (e: CustomEvent) => {
      setCurrentRestaurant(e.detail);
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

  const handleChartClick = () => {
    window.location.href = '/dashboard/analytics';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentRestaurant) {
          setLoading(false);
          return;
        }

        const restaurant = currentRestaurant;
        const reviews = await getRestaurantReviews(restaurant.documentId);
        const totalReviews = reviews.length;

        const ratingDistribution = reviews.reduce(
          (acc: Record<number, number>, review: any) => {
            acc[review.calification] = (acc[review.calification] || 0) + 1;
            return acc;
          },
          {}
        );

        const reviewsByDate = reviews.reduce(
          (acc: Record<string, number>, review: any) => {
            const date = new Date(review.createdAt).toLocaleDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          },
          {}
        );

        const ratingData = Object.entries(ratingDistribution).map(
          ([rating, count]) => ({
            rating: Number(rating),
            count: Number(count),
          })
        );

        const timelineData = Object.entries(reviewsByDate).map(
          ([date, count]) => ({
            date,
            reviews: Number(count),
          })
        );

        const averageRating =
          totalReviews > 0
            ? reviews.reduce((acc: number, r: any) => acc + r.calification, 0) /
              totalReviews
            : 0;

        const currentTaps = parseInt(restaurant.taps);
        const currentResponseRate =
          currentTaps > 0 ? (totalReviews / currentTaps) * 100 : 0;

        setStats({
          totalReviews,
          averageRating,
          responseRate: currentResponseRate,
          taps: currentTaps,
          ratingData,
          timelineData,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentRestaurant]);

  if (loading) {
    return <div className="animate-pulse text-white">Cargando datos...</div>;
  }

  if (!currentRestaurant) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold text-white mb-4">
          No hay restaurante seleccionado
        </h2>
        <p className="text-white/60 mb-6">
          Por favor, selecciona un restaurante para ver su dashboard
        </p>
        <Button
          variant="primary"
          onClick={() => (window.location.href = '/dashboard/restaurants')}
        >
          Ir a seleccionar restaurante
        </Button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          ¡Bienvenido {currentRestaurant.owner.firstName}{' '}
          {currentRestaurant.owner.lastName}!
        </h1>
        <p className="text-white/60">Restaurante: {currentRestaurant.name}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Total Reseñas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalReviews}
            </div>
            <Progress value={stats.totalReviews} max={1000} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">
              Rating Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= stats.averageRating
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
              Tasa de Respuesta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.responseRate.toFixed(1)}%
            </div>
            <Progress value={stats.responseRate} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Total Taps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.taps}</div>
            <Progress value={stats.taps} max={1000} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="bg-white/10 border-0 cursor-pointer hover:bg-white/20 transition-colors"
          onClick={handleChartClick}
        >
          <CardHeader>
            <CardTitle className="text-white">Evolución de reseñas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.timelineData}>
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
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-white/10 border-0 cursor-pointer hover:bg-white/20 transition-colors"
          onClick={handleChartClick}
        >
          <CardHeader>
            <CardTitle className="text-white">
              Distribución de calificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ratingData}>
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
                  <Bar dataKey="count" name="Cantidad" fill="#4318FF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
