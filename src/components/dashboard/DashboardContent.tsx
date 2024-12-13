// src/components/dashboard/DashboardContent.tsx
import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { getRestaurantMetrics } from '../../services/metrics';
import type { MetricsData } from '../../services/metrics';

export function DashboardContent() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          window.location.href = '/login';
          return;
        }

        // Obtener el restaurante del usuario
        const response = await fetch(
          `${
            import.meta.env.PUBLIC_API_URL
          }/restaurants?filters[firebaseUID][$eq]=${user.uid}`
        );
        const { data } = await response.json();

        if (!data?.[0]?.id) {
          throw new Error('No se encontró el restaurante');
        }

        const metricsData = await getRestaurantMetrics(
          data[0].id.toString(),
          'month'
        );
        setMetrics(metricsData);
      } catch (err) {
        setError('Error al cargar las métricas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  if (!metrics) return <div>No hay datos disponibles</div>;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Métricas principales */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Total Reviews</h3>
          <p className="text-3xl font-bold">{metrics.totalReviews}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Rating Promedio</h3>
          <p className="text-3xl font-bold">
            {metrics.averageRating.toFixed(1)}
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Total Taps</h3>
          <p className="text-3xl font-bold">{metrics.totalTaps}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Tasa de Respuesta</h3>
          <p className="text-3xl font-bold">
            {metrics.responseRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Reviews recientes */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Reviews Recientes</h2>
        <div className="space-y-4">
          {metrics.recentReviews.map((review) => (
            <div key={review.id} className="bg-white/10 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">
                  {new Date(review.date).toLocaleDateString()}
                </span>
                <span>{'⭐'.repeat(review.calification)}</span>
              </div>
              {review.comment && (
                <p className="text-gray-200">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
