// src/components/dashboard/DashboardContent.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import {
  getRestaurantByFirebaseUID,
  getRestaurantReviews,
} from '../../services/api';
import { Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Progress } from '../ui/progress';
import type {
  RestaurantData,
  RestaurantStats,
  Review,
} from '../../types/dashboard';

export function DashboardContent() {
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(
    null
  );
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth?.currentUser?.uid) return;

        const restaurant = await getRestaurantByFirebaseUID(
          auth.currentUser.uid
        );
        if (!restaurant) throw new Error('No restaurant found');

        setRestaurantData(restaurant as RestaurantData);

        const reviews = await getRestaurantReviews(restaurant.documentId);
        const totalReviews = reviews.length;

        const averageRating =
          totalReviews > 0
            ? reviews.reduce(
                (acc: number, r: Review) => acc + r.calification,
                0
              ) / totalReviews
            : 0;

        const restaurantTaps = parseInt(restaurant.taps || '0');
        const responseRate =
          restaurantTaps > 0 ? (totalReviews / restaurantTaps) * 100 : 0;

        setStats({
          totalReviews,
          averageRating,
          responseRate,
          taps: restaurantTaps,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !restaurantData || !stats) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-white">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          ¡Bienvenido {restaurantData.owner.firstName}{' '}
          {restaurantData.owner.lastName}!
        </h1>
        <p className="text-white/60">Restaurante: {restaurantData.name}</p>
      </header>

      {/* Stats */}
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
    </div>
  );
}
