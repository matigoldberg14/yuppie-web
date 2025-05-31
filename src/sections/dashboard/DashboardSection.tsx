import { useState, useEffect } from 'react';
import { Progress } from '../../components/ui/progress';
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
  Cell,
} from 'recharts';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import MetricCard from '../../components/dashboard/cards/MetricCard';
import DashboardSkeleton from '../../components/dashboard/skeleton/DashboardSkeleton';
import GraphCard from '../../components/dashboard/cards/GraphCard';
import { formatDateToSpanishLocale } from '@/utils/date';

interface Stats {
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  taps: number;
  ratingData: Array<{ rating: number; count: number }>;
  timelineData: Array<{ date: string; reviews: number }>;
}

export default function DashboardContent() {
  const { selectedRestaurant, isLoading, reviews } = useRestaurantStore();

  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    averageRating: 0,
    responseRate: 0,
    taps: 0,
    ratingData: [],
    timelineData: [],
  });

  const [loading, setLoading] = useState(true);

  const handleChartClick = () => {
    window.location.href = '/dashboard/analytics';
  };

  // Update stats when reviews change
  useEffect(() => {
    if (!selectedRestaurant) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
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
          const date = formatDateToSpanishLocale(review.createdAt);
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

      const currentTaps = parseInt(selectedRestaurant.taps);
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
      console.error('Error processing dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant, reviews]);

  if (isLoading || loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <MetricCard label='Total Reseñas' value={stats.totalReviews} />
        <MetricCard
          label='Rating Promedio'
          value={stats.averageRating}
          isRating
        />
        <MetricCard
          label='Tasa de Respuesta'
          value={stats.responseRate}
          isPercentage
        />
        <MetricCard label='Total Taps' value={stats.taps} />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <GraphCard
          title='Evolución de reseñas'
          graph={
            <LineChart data={stats.timelineData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#ffffff20' />
              <XAxis dataKey='date' stroke='#ffffff60' />
              <YAxis stroke='#ffffff60' />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type='monotone'
                dataKey='reviews'
                stroke='var(--green)'
                strokeWidth={2}
                name='Reseñas'
                dot={{
                  fill: 'var(--blue-dark)',
                  stroke: 'var(--green)',
                  r: 2,
                }}
                activeDot={{
                  fill: 'var(--blue-dark)',
                  stroke: 'var(--green)',
                  r: 4,
                }}
              />
            </LineChart>
          }
        />

        <GraphCard
          title='Distribución de calificaciones'
          graph={
            <BarChart data={stats.ratingData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#ffffff20' />
              <XAxis dataKey='rating' stroke='#ffffff60' />
              <YAxis stroke='#ffffff60' />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey='count' name='Cantidad' fill='var(--green)'>
                {stats.ratingData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`var(--rating-${entry.rating})`}
                  />
                ))}
              </Bar>
            </BarChart>
          }
        />
      </div>
    </div>
  );
}
