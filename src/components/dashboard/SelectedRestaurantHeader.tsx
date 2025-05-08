// src/components/dashboard/SelectedRestaurantHeader.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';
import { Building2, MapPin, ExternalLink } from 'lucide-react';
import { getSelectedRestaurant } from '../../lib/restaurantStore';
import { auth } from '../../lib/firebase';
import { getOwnerRestaurants } from '../../services/api';

// Function to get a hardcoded city for a restaurant
const getCiudad = (restaurantId: number) => {
  const cities = ['CABA', 'CABA', 'CABA', 'CABA', 'CABA'];
  return cities[restaurantId % cities.length];
};

const SelectedRestaurantHeader: React.FC = () => {
  const [currentRestaurant, setCurrentRestaurant] = useState(
    getSelectedRestaurant()
  );
  const [loading, setLoading] = useState(true);
  const [hasMultipleRestaurants, setHasMultipleRestaurants] = useState(false);

  // Verificar al inicio si el usuario tiene un solo restaurante
  useEffect(() => {
    const checkSingleRestaurant = async () => {
      if (auth?.currentUser?.uid) {
        const ownerRestaurants = await getOwnerRestaurants(
          auth.currentUser.uid
        );

        // Si tiene un solo restaurante, no deberíamos mostrar mensaje de error
        setHasMultipleRestaurants(ownerRestaurants.length > 1);

        // Si no hay restaurante seleccionado pero solo tiene uno, seleccionarlo automáticamente
        if (!currentRestaurant && ownerRestaurants.length === 1) {
          setCurrentRestaurant(ownerRestaurants[0]);
        }

        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    checkSingleRestaurant();
  }, [currentRestaurant]);

  // Listen for changes in localStorage or custom events
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentRestaurant(getSelectedRestaurant());
    };

    const handleRestaurantChange = (e: CustomEvent) => {
      setCurrentRestaurant(e.detail);
    };

    // Listen for custom event
    window.addEventListener(
      'restaurantChange',
      handleRestaurantChange as EventListener
    );

    // Also check for localStorage changes (though this won't catch all cases in all browsers)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(
        'restaurantChange',
        handleRestaurantChange as EventListener
      );
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="mb-6 p-4">Cargando información del restaurante...</div>
    );
  }

  // Solo mostrar el mensaje de error si tiene múltiples restaurantes y ninguno seleccionado
  if (!currentRestaurant && hasMultipleRestaurants) {
    return (
      <Card className="mb-6 border-yellow-500">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-yellow-600">
                No hay restaurante seleccionado
              </h3>
              <p className="text-sm text-muted-foreground">
                Selecciona un restaurante para ver sus datos
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = '/dashboard/restaurants')}
            >
              Ir a seleccionar <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no hay restaurante seleccionado y tiene un solo restaurante,
  // no mostramos nada para evitar parpadeos mientras se selecciona automáticamente
  if (!currentRestaurant) {
    return null;
  }

  return (
    <Card className="mb-6 bg-white/10 border-0">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-white" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-white">
                  {currentRestaurant.name}
                </h3>
                <Badge className="bg-blue-500">Restaurante Principal</Badge>
              </div>
              <p className="text-sm text-white/70 flex items-center">
                <MapPin className="mr-1 h-3 w-3" />{' '}
                {getCiudad(currentRestaurant.id)}
              </p>
            </div>
          </div>
          {hasMultipleRestaurants && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-white hover:bg-white/10"
              onClick={() => (window.location.href = '/dashboard/restaurants')}
            >
              Cambiar Restaurante <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedRestaurantHeader;
