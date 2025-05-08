// src/components/dashboard/RestaurantsOverviewWrapper.tsx
import React, { useEffect } from 'react';
import { RestaurantsOverview } from './RestaurantsOverview';
import {
  getRestaurantsList,
  setRestaurantsList,
  setSelectedRestaurant,
} from '../../lib/restaurantStore';
import { auth } from '../../lib/firebase';
import { getOwnerRestaurants } from '../../services/api';

export default function RestaurantsOverviewWrapper() {
  useEffect(() => {
    const initPage = async () => {
      if (auth?.currentUser?.uid) {
        const ownerRestaurants = await getOwnerRestaurants(
          auth.currentUser.uid
        );

        // Si solo hay un restaurante, redirigir directamente al dashboard
        if (ownerRestaurants.length === 1) {
          // Asegúrate de que esté seleccionado
          setSelectedRestaurant(ownerRestaurants[0]);

          // Redirigir al dashboard principal
          window.location.href = '/dashboard';
          return;
        }

        // Guardar lista para la página de selección
        setRestaurantsList(ownerRestaurants);
      }
    };

    initPage();
  }, []);

  return <RestaurantsOverview />;
}
