// src/services/metrics.ts
import { API_CONFIG } from './api';
import type { Review, Restaurant } from '../types/api';

export type TimeFilter = 'today' | 'week' | 'month' | 'year';

export interface MetricsData {
  totalReviews: number;
  averageRating: number;
  totalTaps: number;
  responseRate: number;
  reviewsByType: {
    type: string;
    count: number;
  }[];
  ratingsDistribution: {
    rating: number;
    count: number;
  }[];
  recentReviews: Review[];
  googleSentRate: number;
}

function getDateRangeFilter(timeFilter: TimeFilter): string {
  const now = new Date();
  const startDate = new Date();

  switch (timeFilter) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return `filters[createdAt][$gte]=${startDate.toISOString()}`;
}

async function fetchRestaurantData(restaurantId: string): Promise<Restaurant> {
  const response = await fetch(
    `${API_CONFIG.baseUrl}/restaurants/${restaurantId}?populate=*`
  );

  if (!response.ok) {
    throw new Error('Error fetching restaurant data');
  }

  const { data } = await response.json();
  return data;
}

async function fetchReviews(
  restaurantId: string,
  timeFilter: TimeFilter
): Promise<Review[]> {
  const dateFilter = getDateRangeFilter(timeFilter);
  const response = await fetch(
    `${API_CONFIG.baseUrl}/reviews?filters[restaurant][id][$eq]=${restaurantId}&${dateFilter}&populate=*&sort[0]=createdAt:desc`
  );

  if (!response.ok) {
    throw new Error('Error fetching reviews');
  }

  const { data } = await response.json();
  return data;
}

export async function getRestaurantMetrics(
  restaurantId: string,
  timeFilter: TimeFilter
): Promise<MetricsData> {
  try {
    const [restaurant, reviews] = await Promise.all([
      fetchRestaurantData(restaurantId),
      fetchReviews(restaurantId, timeFilter),
    ]);

    const totalReviews = reviews.length;

    // Calcular promedio de calificaciones
    const totalCalification = reviews.reduce(
      (sum, review) => sum + review.calification,
      0
    );
    const averageRating =
      totalReviews > 0 ? totalCalification / totalReviews : 0;

    // Calcular reviews por tipo
    const typeCount: Record<string, number> = {};
    reviews.forEach((review) => {
      if (review.typeImprovement) {
        typeCount[review.typeImprovement] =
          (typeCount[review.typeImprovement] || 0) + 1;
      }
    });

    const reviewsByType = Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
    }));

    // Calcular distribución de calificaciones
    const ratingsDistribution = Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1;
      const count = reviews.filter((r) => r.calification === rating).length;
      return { rating, count };
    });

    // Calcular tasa de respuesta (reviews con comentarios)
    const reviewsWithComments = reviews.filter(
      (r) => r.comment?.trim().length > 0
    ).length;
    const responseRate =
      totalReviews > 0 ? (reviewsWithComments / totalReviews) * 100 : 0;

    // Calcular tasa de envío a Google
    const googleSentCount = reviews.filter((r) => r.googleSent).length;
    const googleSentRate =
      totalReviews > 0 ? (googleSentCount / totalReviews) * 100 : 0;

    // Obtener las reviews más recientes
    const recentReviews = reviews.slice(0, 5);

    return {
      totalReviews,
      averageRating,
      totalTaps: parseInt(restaurant.taps || '0'),
      responseRate,
      reviewsByType,
      ratingsDistribution,
      recentReviews,
      googleSentRate,
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
}

// Función para obtener el histórico de métricas (para gráficos)
export async function getMetricsHistory(
  restaurantId: string,
  timeFilter: TimeFilter
): Promise<{
  dates: string[];
  ratings: number[];
  reviews: number[];
}> {
  const reviews = await fetchReviews(restaurantId, timeFilter);

  // Agrupar por fecha
  const groupedByDate = reviews.reduce(
    (acc: Record<string, { sum: number; count: number }>, review) => {
      // Usar date en lugar de createdAt si ese es el campo correcto en tu API
      const date = new Date(review.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { sum: 0, count: 0 };
      }
      acc[date].sum += review.calification;
      acc[date].count += 1;
      return acc;
    },
    {}
  );

  // Ordenar por fecha
  const sortedDates = Object.keys(groupedByDate).sort();

  return {
    dates: sortedDates,
    ratings: sortedDates.map(
      (date) => groupedByDate[date].sum / groupedByDate[date].count
    ),
    reviews: sortedDates.map((date) => groupedByDate[date].count),
  };
}
