// src/components/dashboard/RestaurantsOverview.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { getOwnerRestaurants } from '../../services/api';
import { RestaurantDetail } from './RestaurantDetail';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';
import {
  Building2,
  MapPin,
  Star,
  Users,
  TrendingUp,
  ShoppingBag,
  Search,
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

export interface Restaurant {
  id: number;
  documentId: string;
  name: string;
  taps: string;
  owner: {
    firstName: string;
    lastName: string;
  };
  ingresos?: number;
  clientes?: number;
  satisfaccion?: number;
  ocupacion?: number;
}

// Función para obtener una ciudad hardcodeada para un restaurante
const getCiudad = (restaurantId: number) => {
  const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
  return cities[restaurantId % cities.length];
};

export function RestaurantsOverview() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'compare'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para manejar la selección de restaurantes
  const [currentRestaurant, setCurrentRestaurantState] =
    useState<Restaurant | null>(null);
  const [compareRestaurants, setCompareRestaurantsState] = useState<
    Restaurant[]
  >([]);

  // Filtrar restaurantes basados en la búsqueda
  const filteredRestaurants = searchTerm
    ? restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCiudad(restaurant.id)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
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
    // Ahora obtenemos el usuario fuera del hook
    const fetchRestaurants = async () => {
      try {
        // Añadimos más logs para depuración
        console.log('Iniciando fetchRestaurants');

        const uid = auth?.currentUser?.uid;
        console.log('UID del usuario:', uid);

        if (!uid) {
          console.warn('No se encontró UID de usuario');
          setLoading(false);
          return;
        }

        console.log('Llamando a getOwnerRestaurants con UID:', uid);
        const data = await getOwnerRestaurants(uid);
        console.log('Datos recibidos de getOwnerRestaurants:', data);

        if (!data || data.length === 0) {
          console.warn('No se encontraron restaurantes para el usuario');
          setRestaurants([]);
          setLoading(false);
          return;
        }

        // Enhance restaurant data with sample metrics if they don't exist
        const enhancedData = data.map((restaurant: Restaurant) => {
          console.log('Procesando restaurante:', restaurant);
          return {
            ...restaurant,
            ingresos:
              restaurant.ingresos || Math.floor(Math.random() * 100000) + 50000,
            clientes:
              restaurant.clientes || Math.floor(Math.random() * 3000) + 1000,
            satisfaccion:
              restaurant.satisfaccion || (Math.random() * 2 + 3).toFixed(1),
            ocupacion:
              restaurant.ocupacion || Math.floor(Math.random() * 30) + 60,
          };
        });

        console.log('Datos mejorados:', enhancedData);
        setRestaurants(enhancedData);
        setRestaurantsList(enhancedData);

        // Si no hay restaurante seleccionado y tenemos datos, seleccionar el primero
        const currentSelected = getSelectedRestaurant();
        console.log('Restaurante actualmente seleccionado:', currentSelected);

        if (!currentSelected && enhancedData.length > 0) {
          console.log('Seleccionando primer restaurante:', enhancedData[0]);
          setSelectedRestaurant(enhancedData[0]);
          setCurrentRestaurantState(enhancedData[0]);
        }
      } catch (err) {
        console.error('Error en fetchRestaurants:', err);
        setError('Error al obtener los restaurantes');
      } finally {
        setLoading(false);
      }
    };

    // Asegurarnos de que el usuario esté autenticado antes de cargar
    const checkAuthAndFetch = () => {
      if (auth?.currentUser) {
        console.log('Usuario autenticado, cargando restaurantes');
        fetchRestaurants();
      } else {
        console.log('Usuario no autenticado, esperando...');
        // Podríamos añadir más lógica aquí si es necesario, por ejemplo una redirección
        // Por ahora solo establecemos que no hay carga
        setLoading(false);
      }
    };

    // Intentamos cargar inmediatamente, pero también nos suscribimos a cambios de auth
    checkAuthAndFetch();

    // Suscribirse a cambios en el estado de autenticación
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

  // Manejar selección de restaurante
  const handleSelectRestaurant = (restaurant: Restaurant) => {
    console.log('Seleccionando restaurante:', restaurant);
    setSelectedRestaurant(restaurant);
  };

  // Manejar toggle para comparación
  const handleToggleCompare = (restaurant: Restaurant) => {
    console.log('Toggle comparación para:', restaurant);
    toggleCompare(restaurant);
  };

  if (loading)
    return <div className="text-white">Cargando restaurantes...</div>;

  if (error) return <div className="text-red-500">{error}</div>;

  if (restaurants.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Mis Restaurantes</h1>
        <p className="text-white">
          No se encontraron restaurantes para este usuario. (UID:{' '}
          {auth?.currentUser?.uid || 'No autenticado'})
        </p>
        <div className="mt-4">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Mis Restaurantes
          </h1>
          <p className="text-white/60">
            Gestiona y compara el rendimiento de tus locales
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
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
          <div className="mb-4 max-w-md">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
              <Input
                placeholder="Buscar restaurante..."
                className="pl-8 bg-white/5 border-white/10 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex justify-between items-start">
                    <div>
                      {restaurant.name}
                      <div className="text-sm font-normal text-white/60 flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />{' '}
                        {getCiudad(restaurant.id)}
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
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex flex-col items-center p-2 bg-white/5 rounded-md">
                      <TrendingUp className="h-4 w-4 mb-1 text-green-400" />
                      <div className="text-xs text-white/60">Ingresos</div>
                      <div className="font-medium text-white">
                        ${restaurant.ingresos?.toLocaleString() ?? 'N/A'}
                      </div>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-white/5 rounded-md">
                      <Users className="h-4 w-4 mb-1 text-blue-400" />
                      <div className="text-xs text-white/60">Clientes</div>
                      <div className="font-medium text-white">
                        {restaurant.clientes?.toLocaleString() ?? 'N/A'}
                      </div>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-white/5 rounded-md">
                      <Star className="h-4 w-4 mb-1 text-yellow-400" />
                      <div className="text-xs text-white/60">Satisfacción</div>
                      <div className="font-medium text-white">
                        {restaurant.satisfaccion ?? 'N/A'}
                      </div>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-white/5 rounded-md">
                      <ShoppingBag className="h-4 w-4 mb-1 text-purple-400" />
                      <div className="text-xs text-white/60">Ocupación</div>
                      <div className="font-medium text-white">
                        {restaurant.ocupacion
                          ? `${restaurant.ocupacion}%`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-white hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCompare(restaurant);
                      }}
                    >
                      {compareRestaurants.some(
                        (r: Restaurant) =>
                          r.documentId === restaurant.documentId
                      )
                        ? '✓ Añadido a comparación'
                        : '+ Añadir a comparación'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {currentRestaurant && (
            <RestaurantDetail restaurant={currentRestaurant} />
          )}
        </>
      )}

      {activeTab === 'compare' && (
        <AdvancedComparison restaurants={restaurants} />
      )}
    </div>
  );
}
