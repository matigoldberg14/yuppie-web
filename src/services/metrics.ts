// src/services/metrics.ts
import { API_CONFIG } from './api';
import type { Review, Employee } from '../types/api';
import type { MetricsData, TimeFilter } from '../types/metrics';

function getDateRangeForFilter(
  timeFilter: TimeFilter,
  startDate?: Date,
  endDate?: Date
): { start: Date; end: Date } {
  const end = endDate || new Date();
  let start = new Date();

  switch (timeFilter) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    case 'custom':
      if (startDate) {
        start = startDate;
      }
      break;
  }

  return { start, end };
}

export async function getEmployeeMetrics(
  employeeId: number,
  timeFilter: TimeFilter,
  customStart?: Date,
  customEnd?: Date
) {
  const { start, end } = getDateRangeForFilter(
    timeFilter,
    customStart,
    customEnd
  );

  const response = await fetch(
    `${
      API_CONFIG.baseUrl
    }/reviews?filters[employee][id][$eq]=${employeeId}&filters[createdAt][$gte]=${start.toISOString()}&filters[createdAt][$lte]=${end.toISOString()}&populate=*`
  );

  if (!response.ok) {
    throw new Error('Error fetching employee metrics');
  }

  const data = await response.json();
  const reviews = data.data;

  return {
    totalReviews: reviews.length,
    averageRating:
      reviews.length > 0
        ? reviews.reduce((acc: number, r: Review) => acc + r.calification, 0) /
          reviews.length
        : 0,
    responseRate:
      (reviews.filter((r: Review) => r.comment?.trim().length > 0).length /
        reviews.length) *
      100,
  };
}

export async function getRestaurantMetrics(
  restaurantId: string,
  timeFilter: TimeFilter = 'month',
  startDate?: Date,
  endDate?: Date
): Promise<MetricsData> {
  try {
    const { start, end } = getDateRangeForFilter(
      timeFilter,
      startDate,
      endDate
    );

    // Obtener datos del restaurante
    const restaurantResponse = await fetch(
      `${API_CONFIG.baseUrl}/restaurants/${restaurantId}?populate=*`
    );

    if (!restaurantResponse.ok) {
      throw new Error('Error fetching restaurant data');
    }

    const restaurantData = await restaurantResponse.json();

    // Obtener reseñas del período actual
    const currentReviewsResponse = await fetch(
      `${
        API_CONFIG.baseUrl
      }/reviews?filters[restaurant][documentId][$eq]=${restaurantId}&filters[createdAt][$gte]=${start.toISOString()}&filters[createdAt][$lte]=${end.toISOString()}&populate=*`
    );

    if (!currentReviewsResponse.ok) {
      throw new Error('Error fetching current reviews');
    }

    const currentReviewsData = await currentReviewsResponse.json();
    const currentReviews = currentReviewsData.data;

    // Obtener reseñas del período anterior para comparación
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - getDaysDifference(start, end));

    const prevReviewsResponse = await fetch(
      `${
        API_CONFIG.baseUrl
      }/reviews?filters[restaurant][documentId][$eq]=${restaurantId}&filters[createdAt][$gte]=${prevStart.toISOString()}&filters[createdAt][$lt]=${start.toISOString()}&populate=*`
    );

    if (!prevReviewsResponse.ok) {
      throw new Error('Error fetching previous reviews');
    }

    const prevReviewsData = await prevReviewsResponse.json();
    const prevReviews = prevReviewsData.data;

    // Calcular métricas
    const totalReviews = currentReviews.length;
    const averageRating = calculateAverageRating(currentReviews);
    const prevAverageRating = calculateAverageRating(prevReviews);

    const typeStats = calculateTypeStats(currentReviews);
    const ratingStats = calculateRatingStats(currentReviews);
    const weekdayStats = calculateWeekdayStats(currentReviews);
    const timeOfDayStats = calculateTimeOfDayStats(currentReviews);

    // Calcular tendencias
    const trends = {
      ratingTrend: calculateTrend(averageRating, prevAverageRating),
      volumeTrend: calculateTrend(totalReviews, prevReviews.length),
      responseTimeTrend: 0, // TODO: Implementar cuando tengamos timestamps de respuesta
    };

    return {
      totalReviews,
      averageRating,
      totalTaps: parseInt(restaurantData.data.taps || '0'),
      responseRate: calculateResponseRate(currentReviews),
      reviewsByType: typeStats,
      ratingsDistribution: ratingStats,
      recentReviews: currentReviews.slice(0, 5),
      googleSentRate: calculateGoogleSentRate(currentReviews),
      employeePerformance: [], // TODO: Implementar cuando tengamos empleados asociados
      timeOfDayAnalysis: timeOfDayStats,
      weekdayAnalysis: weekdayStats,
      trends,
    };
  } catch (error) {
    console.error('Error in getRestaurantMetrics:', error);
    throw error;
  }
}

function getDaysDifference(start: Date, end: Date) {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
}

function calculateAverageRating(reviews: Review[]) {
  return reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.calification, 0) /
        reviews.length
    : 0;
}

function calculateResponseRate(reviews: Review[]) {
  return reviews.length > 0
    ? (reviews.filter((review) => review.comment?.trim().length > 0).length /
        reviews.length) *
        100
    : 0;
}

function calculateGoogleSentRate(reviews: Review[]) {
  return reviews.length > 0
    ? (reviews.filter((review) => review.googleSent).length / reviews.length) *
        100
    : 0;
}

function calculateTrend(current: number, previous: number) {
  return previous > 0 ? ((current - previous) / previous) * 100 : 0;
}

function calculateTypeStats(reviews: Review[]) {
  const typeCount: Record<string, number> = {};
  reviews.forEach((review) => {
    if (review.typeImprovement) {
      typeCount[review.typeImprovement] =
        (typeCount[review.typeImprovement] || 0) + 1;
    }
  });

  return Object.entries(typeCount).map(([type, count]) => ({
    type,
    count,
    percentage: (count / reviews.length) * 100,
  }));
}

function calculateRatingStats(reviews: Review[]) {
  const ratingCount: Record<number, number> = {};
  reviews.forEach((review) => {
    ratingCount[review.calification] =
      (ratingCount[review.calification] || 0) + 1;
  });

  return Object.entries(ratingCount).map(([rating, count]) => ({
    rating: parseInt(rating),
    count,
    percentage: (count / reviews.length) * 100,
  }));
}

function calculateWeekdayStats(reviews: Review[]) {
  const stats: Record<string, { count: number; total: number }> = {};
  reviews.forEach((review) => {
    const day = new Date(review.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
    });
    if (!stats[day]) {
      stats[day] = { count: 0, total: 0 };
    }
    stats[day].count++;
    stats[day].total += review.calification;
  });

  return Object.entries(stats).reduce(
    (acc, [day, data]) => ({
      ...acc,
      [day]: {
        count: data.count,
        averageRating: data.total / data.count,
      },
    }),
    {}
  );
}

function calculateTimeOfDayStats(reviews: Review[]) {
  const stats = {
    morning: 0,
    afternoon: 0,
    evening: 0,
  };

  reviews.forEach((review) => {
    const hour = new Date(review.createdAt).getHours();
    if (hour >= 5 && hour < 12) stats.morning++;
    else if (hour >= 12 && hour < 18) stats.afternoon++;
    else stats.evening++;
  });

  return stats;
}

export async function getMetricsHistory(
  restaurantId: string,
  timeFilter: TimeFilter,
  startDate?: Date,
  endDate?: Date
) {
  const { start, end } = getDateRangeForFilter(timeFilter, startDate, endDate);

  const response = await fetch(
    `${
      API_CONFIG.baseUrl
    }/reviews?filters[restaurant][documentId][$eq]=${restaurantId}&filters[createdAt][$gte]=${start.toISOString()}&filters[createdAt][$lte]=${end.toISOString()}&sort=createdAt:ASC&populate=*`
  );

  if (!response.ok) {
    throw new Error('Error fetching metrics history');
  }

  const data = await response.json();
  const reviews = data.data;

  // Agrupar por fecha
  const groupedByDate = reviews.reduce((acc: any, review: any) => {
    const date = review.createdAt.split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        reviews: 0,
        ratingsSum: 0,
        googleSent: 0,
      };
    }
    acc[date].reviews++;
    acc[date].ratingsSum += review.calification;
    if (review.googleSent) acc[date].googleSent++;
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort();

  return {
    dates,
    ratings: dates.map(
      (date) => groupedByDate[date].ratingsSum / groupedByDate[date].reviews
    ),
    reviews: dates.map((date) => groupedByDate[date].reviews),
    googleSent: dates.map((date) => groupedByDate[date].googleSent),
  };
}
