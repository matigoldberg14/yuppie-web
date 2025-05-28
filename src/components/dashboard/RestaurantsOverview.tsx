import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import {
  getRestaurantReviews,
  getEmployeesByRestaurant,
} from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';
import type { Review } from '../../types/reviews';
import type { Restaurant } from '@/types/restaurant';
import type { Employee } from '../../types/employee';
import {
  Building2,
  MapPin,
  Star,
  Users,
  MessageSquare,
  Zap,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Input } from '../ui/input';
import AdvancedComparison from './AdvancedComparison';
import {
  getSelectedRestaurant,
  setSelectedRestaurant,
  getCompareRestaurants,
  toggleCompareRestaurant as toggleCompare,
  setRestaurantsList,
} from '../../lib/restaurantStore';
import { useToast } from '../ui/use-toast';
import { getRestaurantsByOwner } from '@/services/api/restaurants';
import { convertToRestaurant } from '@/types/restaurant';

// Interfaz para las métricas calculadas
interface RestaurantMetric {
  totalReviews: number;
  averageRating: number;
  conversionRate: number;
  employeeCount: number;
}

export function RestaurantsOverview() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'compare'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantMetrics, setRestaurantMetrics] = useState<
    Record<string, RestaurantMetric>
  >({});
  const { toast } = useToast();

  // Estados para manejar la selección de restaurantes
  const [currentRestaurant, setCurrentRestaurantState] =
    useState<Restaurant | null>(null);
  const [compareRestaurants, setCompareRestaurantsState] = useState<
    Restaurant[]
  >([]);

  // Obtener ciudad desde datos reales o usar función de respaldo para compatibilidad
  const getCiudad = (restaurant: Restaurant): string => {
    return restaurant.location?.city || 'Ciudad no disponible';
  };

  // Filtrar restaurantes basados en la búsqueda
  const filteredRestaurants = searchTerm
    ? restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCiudad(restaurant).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : restaurants;

  // Cargar estado inicial y escuchar por cambios
  useEffect(() => {
    // Cargar el estado inicial
    setCurrentRestaurantState(getSelectedRestaurant());
    setCompareRestaurantsState(getCompareRestaurants());

    // Escuchar cambios en el estado
    const handleSelectedChange = (e: CustomEvent) => {
      setCurrentRestaurantState(e.detail);
    };

    const handleCompareChange = (e: CustomEvent) => {
      setCompareRestaurantsState(e.detail);
    };

    window.addEventListener(
      'restaurantChange',
      handleSelectedChange as EventListener
    );
    window.addEventListener(
      'compareRestaurantsChange',
      handleCompareChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'restaurantChange',
        handleSelectedChange as EventListener
      );
      window.removeEventListener(
        'compareRestaurantsChange',
        handleCompareChange as EventListener
      );
    };
  }, []);

  // Cargar datos de restaurantes
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log('Iniciando fetchRestaurants');

        const uid = auth?.currentUser?.uid;
        console.log('UID del usuario:', uid);

        if (!uid) {
          console.warn('No se encontró UID de usuario');
          setLoading(false);
          return;
        }

        const data = await getRestaurantsByOwner(uid);

        if (!data || data.length === 0) {
          console.warn('No se encontraron restaurantes para el usuario');
          setRestaurants([]);
          setLoading(false);
          return;
        }
        // Convertir los datos recibidos al formato esperado por el componente
        const formattedData: Restaurant[] = data.map(
          (restaurant: Restaurant) => ({
            id: restaurant.id,
            documentId: restaurant.documentId,
            name: restaurant.name,
            taps: restaurant.taps,
            owner: restaurant.owner,
            linkMaps: restaurant.linkMaps || '',
            // Mapear la ubicación correctamente
            location: restaurant.location,
            coordinates: restaurant.coordinates,
            slug: restaurant.slug,
          })
        );

        setRestaurants(formattedData);

        // Convertir los datos para el store
        const convertedData = formattedData.map(convertToRestaurant);
        setRestaurantsList(convertedData);

        // Si no hay restaurante seleccionado y tenemos datos, seleccionar el primero
        const currentSelected = getSelectedRestaurant();
        console.log('Restaurante actualmente seleccionado:', currentSelected);

        if (!currentSelected && formattedData.length > 0) {
          console.log('Seleccionando primer restaurante:', formattedData[0]);
          setSelectedRestaurant(convertToRestaurant(formattedData[0]));
          setCurrentRestaurantState(formattedData[0]);
        }

        // Cargar métricas para todos los restaurantes
        await loadRestaurantMetrics(formattedData);
      } catch (err) {
        console.error('Error en fetchRestaurants:', err);
        setError('Error al obtener los restaurantes');
      } finally {
        setLoading(false);
      }
    };

    const checkAuthAndFetch = () => {
      if (auth?.currentUser) {
        console.log('Usuario autenticado, cargando restaurantes');
        fetchRestaurants();
      } else {
        console.log('Usuario no autenticado, esperando...');
        setLoading(false);
      }
    };

    checkAuthAndFetch();

    const unsubscribe = auth?.onAuthStateChanged((user) => {
      console.log(
        'Estado de autenticación cambiado:',
        user ? 'Usuario autenticado' : 'No autenticado'
      );
      if (user) {
        fetchRestaurants();
      } else {
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Cargar métricas para los restaurantes
  const loadRestaurantMetrics = async (restaurants: Restaurant[]) => {
    setMetricsLoading(true);
    const metrics: Record<string, RestaurantMetric> = {};

    try {
      for (const restaurant of restaurants) {
        // Obtener reseñas reales
        const reviews: Review[] = await getRestaurantReviews(
          restaurant.documentId
        );

        // Obtener empleados reales
        const employees: Employee[] = await getEmployeesByRestaurant(
          restaurant.documentId
        );

        // Calcular métricas reales
        const totalReviews = reviews.length;
        const totalRating = reviews.reduce(
          (sum: number, review: Review) => sum + review.calification,
          0
        );
        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
        const totalTaps = parseInt(restaurant.taps || '0');
        const conversionRate =
          totalTaps > 0 ? (totalReviews / totalTaps) * 100 : 0;
        const employeeCount = employees.length;

        metrics[restaurant.documentId] = {
          totalReviews,
          averageRating,
          conversionRate,
          employeeCount,
        };
      }

      setRestaurantMetrics(metrics);
    } catch (error) {
      console.error('Error cargando métricas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las métricas de los restaurantes',
        variant: 'destructive',
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  // Manejar selección de restaurante
  const handleSelectRestaurant = (restaurant: Restaurant) => {
    console.log('Seleccionando restaurante:', restaurant);

    // Siempre establecer el restaurante seleccionado
    setSelectedRestaurant(convertToRestaurant(restaurant));

    // Si no hay restaurantes en la lista de comparación, agregar este
    const compareList = getCompareRestaurants();
    if (compareList.length === 0) {
      toggleCompare(convertToRestaurant(restaurant));
    }
  };

  // Manejar toggle para comparación
  const handleToggleCompare = (restaurant: Restaurant) => {
    console.log('Toggle comparación para:', restaurant);

    // Obtener la lista actual
    const currentSelected = getCompareRestaurants();

    // Si el restaurante ya está en la lista y no es el único, quitarlo
    if (currentSelected.some((r) => r.id === restaurant.id)) {
      if (currentSelected.length > 1) {
        toggleCompare(convertToRestaurant(restaurant));
      } else {
        toast({
          title: 'Acción no permitida',
          description: 'Debe mantener al menos un restaurante para comparación',
          variant: 'destructive',
        });
      }
    } else {
      // Si no está en la lista, agregarlo
      toggleCompare(convertToRestaurant(restaurant));
    }
  };

  if (loading)
    return <div className='text-white'>Cargando restaurantes...</div>;

  if (error) return <div className='text-red-500'>{error}</div>;

  if (restaurants.length === 0) {
    return (
      <div className='p-6'>
        <h1 className='text-2xl font-bold text-white mb-4'>Mis Restaurantes</h1>
        <p className='text-white'>
          No se encontraron restaurantes para este usuario. (UID:{' '}
          {auth?.currentUser?.uid || 'No autenticado'})
        </p>
        <div className='mt-4'>
          <Button variant='primary' onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white flex items-center gap-2'>
            <Building2 className='h-8 w-8' />
            Mis Restaurantes
          </h1>
          <p className='text-white/60'>
            Gestiona y compara el rendimiento de tus locales
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex gap-2'>
          <Button
            variant={activeTab === 'list' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('list')}
          >
            Listado
          </Button>
          <Button
            variant={activeTab === 'compare' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('compare')}
          >
            Comparación
          </Button>
        </div>
      </div>

      {activeTab === 'list' && (
        <>
          <div className='mb-4 max-w-md'>
            <div className='relative'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-white/50' />
              <Input
                placeholder='Buscar restaurante...'
                className='pl-8 bg-white/5 border-white/10 text-white'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.documentId}
                className={`bg-white/10 border-0 cursor-pointer hover:bg-white/20 transition-colors ${
                  currentRestaurant?.documentId === restaurant.documentId
                    ? 'border-2 border-blue-500'
                    : ''
                }`}
                onClick={() => handleSelectRestaurant(restaurant)}
              >
                <CardHeader className='pb-2'>
                  <CardTitle className='text-white flex justify-between items-start'>
                    <div>
                      {restaurant.name}
                      <div className='text-sm font-normal text-white/60 flex items-center mt-1'>
                        <MapPin className='w-4 h-4 mr-1' />
                        {getCiudad(restaurant)}
                      </div>
                    </div>
                    <Badge
                      className={
                        currentRestaurant?.documentId === restaurant.documentId
                          ? 'bg-blue-500'
                          : 'bg-white/20'
                      }
                    >
                      {currentRestaurant?.documentId === restaurant.documentId
                        ? 'Principal'
                        : 'Seleccionar'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 gap-2 mt-2'>
                    <div className='flex flex-col items-center p-2 bg-white/5 rounded-md'>
                      <MessageSquare className='h-4 w-4 mb-1 text-blue-400' />
                      <div className='text-xs text-white/60'>Total Reseñas</div>
                      {metricsLoading ? (
                        <div className='h-5 flex items-center'>
                          <RefreshCw className='h-3 w-3 text-white/50 animate-spin' />
                        </div>
                      ) : (
                        <div className='font-medium text-white'>
                          {restaurantMetrics[restaurant.documentId]
                            ?.totalReviews || 0}
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col items-center p-2 bg-white/5 rounded-md'>
                      <Star className='h-4 w-4 mb-1 text-yellow-400' />
                      <div className='text-xs text-white/60'>
                        Rating Promedio
                      </div>
                      {metricsLoading ? (
                        <div className='h-5 flex items-center justify-center'>
                          <RefreshCw className='h-3 w-3 text-white/50 animate-spin' />
                        </div>
                      ) : (
                        <div className='font-medium text-white'>
                          {restaurantMetrics[restaurant.documentId]
                            ? restaurantMetrics[
                                restaurant.documentId
                              ].averageRating.toFixed(1)
                            : '0'}
                          /5
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col items-center p-2 bg-white/5 rounded-md'>
                      <Zap className='h-4 w-4 mb-1 text-amber-400' />
                      <div className='text-xs text-white/60'>
                        Tasa de Conversión
                      </div>
                      {metricsLoading ? (
                        <div className='h-5 flex items-center'>
                          <RefreshCw className='h-3 w-3 text-white/50 animate-spin' />
                        </div>
                      ) : (
                        <div className='font-medium text-white'>
                          {restaurantMetrics[restaurant.documentId]
                            ? restaurantMetrics[
                                restaurant.documentId
                              ].conversionRate.toFixed(1)
                            : '0'}
                          %
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col items-center p-2 bg-white/5 rounded-md'>
                      <Users className='h-4 w-4 mb-1 text-purple-400' />
                      <div className='text-xs text-white/60'>Equipo</div>
                      {metricsLoading ? (
                        <div className='h-5 flex items-center'>
                          <RefreshCw className='h-3 w-3 text-white/50 animate-spin' />
                        </div>
                      ) : (
                        <div className='font-medium text-white'>
                          {restaurantMetrics[restaurant.documentId]
                            ?.employeeCount || 0}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='mt-4'>
                    <div className='text-center text-white/60 text-xs py-2'>
                      Utiliza la vista de comparación para analizar múltiples
                      locales
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'compare' && (
        <AdvancedComparison
          restaurants={restaurants.map(convertToRestaurant)}
        />
      )}
    </div>
  );
}
