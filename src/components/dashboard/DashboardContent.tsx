// src/components/dashboard/DashboardContent.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
// NO importamos getRestaurantReviews, lo implementaremos directamente
import { Star, Building2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/Button';
import { useToast } from '../ui/use-toast';
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
import { setSelectedRestaurant } from '../../lib/restaurantStore';
import { metricsCache } from '../dashboard/metricsCache';
import { MetricsCacheManager } from '../../lib/cache/metricsCacheManager';
import { apiClient } from '../../services/api';

interface Stats {
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  taps: number;
  ratingData: Array<{ rating: number; count: number }>;
  timelineData: Array<{ date: string; reviews: number }>;
}

async function fetchRestaurantData(restaurantId: string) {
  try {
    const apiUrl = `/restaurants/${restaurantId}?populate=employees`;
    console.log(`Solicitando datos frescos del restaurante a: ${apiUrl}`);
    const result = await apiClient.fetch<{ data: any }>(apiUrl);
    console.log(
      'Datos del restaurante recibidos:',
      JSON.stringify(result.data, null, 2)
    );
    return result.data;
  } catch (error) {
    console.error('Error al obtener datos del restaurante:', error);
    throw error;
  }
}

// Implementación directa para obtener reseñas sin pasar por la función que podría tener caché
async function fetchReviewsDirectly(
  restaurantId: string,
  forceRefresh = false
) {
  try {
    const nonce = forceRefresh ? `&_=${Date.now()}` : '';
    const apiUrl = `/reviews?filters[restaurant][documentId][$eq]=${restaurantId}&populate=*&sort[0]=createdAt:desc${nonce}`;
    console.log(`Solicitando directamente a: ${apiUrl}`);
    const result = await apiClient.fetch<{ data: any[] }>(apiUrl);
    const reviews = result.data.map((review: any) => ({
      id: review.id,
      documentId: review.documentId,
      calification: review.calification,
      typeImprovement: review.typeImprovement,
      comment: review.comment,
      email: review.email,
      googleSent: review.googleSent,
      date: review.date,
      createdAt: review.createdAt,
      couponCode: review.couponCode,
      couponUsed: review.couponUsed,
      employee: review.employee
        ? {
            id: review.employee.id,
            documentId: review.employee.documentId,
            firstName: review.employee.firstName,
            lastName: review.employee.lastName,
            position: review.employee.position,
          }
        : undefined,
    }));
    return reviews;
  } catch (error) {
    console.error('Error al obtener reseñas directamente:', error);
    throw error;
  }
}

//traerme los emplados de un retaurant
async function fetchEmployeesByRestaurant(restaurantDocumentId: string) {
  try {
    const apiUrl = `/employees?filters[restaurant][documentId][$eq]=${restaurantDocumentId}`;
    console.log(`Solicitando empleados del restaurante a: ${apiUrl}`);
    const result = await apiClient.fetch<{ data: any[] }>(apiUrl);
    console.log('Empleados recibidos:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error al obtener empleados del restaurante:', error);
    throw error;
  }
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
  const { toast } = useToast();

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

  // Función para limpiar la caché
  const clearAllCaches = () => {
    // Limpiar todos los cachés posibles
    try {
      // 1. Limpiar metricsCache
      metricsCache.clear();
      console.log('Cache simple limpiado completamente');

      // 2. Limpiar cualquier valor en localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes('metric') ||
            key.includes('review') ||
            key.includes('cache'))
        ) {
          localStorage.removeItem(key);
          console.log(`Limpiando localStorage: ${key}`);
        }
      }

      // 3. Intentar reiniciar la instancia del MetricsCacheManager
      try {
        // @ts-ignore - Forzar reinicio del singleton (hack)
        MetricsCacheManager.instance = null;
        console.log('Cache manager reiniciado');
      } catch (e) {
        console.warn('No se pudo reiniciar cache manager', e);
      }
    } catch (error) {
      console.error('Error al limpiar caches:', error);
    }
  };

  // Función para actualizar datos
  const handleRefreshData = async () => {
    console.log('Entrando a handleRefreshData', currentRestaurant);
    if (!currentRestaurant || loading) return;

    setLoading(true);
    try {
      toast({
        title: 'Actualizando datos',
        description: 'Obteniendo información fresca del servidor...',
      });

      // Limpiar caches locales
      clearAllCaches();

      // Obtener datos frescos del restaurante
      const freshRestaurant = await fetchRestaurantData(
        currentRestaurant.documentId
      );

      // Combina la información actual con la nueva para no perder datos (como owner)
      const updatedRestaurant = { ...currentRestaurant, ...freshRestaurant };

      // Actualiza el estado local
      setCurrentRestaurant(updatedRestaurant);

      // Actualiza la fuente de persistencia (por ejemplo, localStorage)
      setSelectedRestaurant(updatedRestaurant);

      // Despacha un evento para que otros componentes se actualicen
      window.dispatchEvent(
        new CustomEvent('restaurantChange', { detail: updatedRestaurant })
      );

      // Obtiene reseñas actualizadas
      console.log(`Solicitando datos frescos para ${updatedRestaurant.name}`);
      const reviews = await fetchReviewsDirectly(
        updatedRestaurant.documentId,
        true
      );
      console.log(
        `Obtenidas ${reviews.length} reseñas frescas (solicitud directa)`
      );

      const empleados = await fetchEmployeesByRestaurant(
        updatedRestaurant.documentId
      );
      console.log('Empleados del restaurante:', empleados);

      // la suma de toods
      const totalTapsEmpleados = empleados.reduce((acc: number, emp: any) => {
        if (typeof emp.taps === 'number') {
          return acc + emp.taps;
        }
        return acc;
      }, 0);

      // Sumar los taps de los empleados + los del restaurante
      const tapsRestaurante = parseInt(updatedRestaurant.taps) || 0;
      const currentTaps = totalTapsEmpleados + tapsRestaurante;
      const currentResponseRate =
        currentTaps > 0 ? (reviews.length / currentTaps) * 100 : 0;

      // Procesa las reseñas y actualiza los stats
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

      setStats({
        totalReviews,
        averageRating,
        responseRate: currentResponseRate,
        taps: currentTaps,
        ratingData,
        timelineData,
      });

      toast({
        title: 'Datos actualizados',
        description: `Se han cargado ${totalReviews} reseñas del servidor`,
      });
    } catch (error) {
      console.error('Error actualizando datos:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron obtener datos frescos del servidor',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      if (!currentRestaurant) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log(`Cargando datos para ${currentRestaurant.name}`);
        // Usar FALSE aquí para la carga inicial (no forzar refresh)
        const reviews = await fetchReviewsDirectly(
          currentRestaurant.documentId,
          false
        );
        console.log(`Obtenidas ${reviews.length} reseñas`);

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

        const currentTaps = parseInt(currentRestaurant.taps);
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
      <header className="mb-6 flex justify-between items-center">
        <div>
          {currentRestaurant && currentRestaurant.owner ? (
            <h1 className="text-2xl font-bold text-white">
              ¡Bienvenido {currentRestaurant.owner.firstName}{' '}
              {currentRestaurant.owner.lastName}!
            </h1>
          ) : (
            <h1 className="text-2xl font-bold text-white">¡Bienvenido!</h1>
          )}
          <p className="text-white/60">Restaurante: {currentRestaurant.name}</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleRefreshData}
          className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full"></div>
              <span>Actualizando...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Actualizar datos</span>
            </>
          )}
        </Button>
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
