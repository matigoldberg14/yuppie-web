// src/components/dashboard/RestaurantValidator.tsx
import React, { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { getOwnerRestaurants } from '../../services/api';
import {
  getSelectedRestaurant,
  setSelectedRestaurant,
} from '../../lib/restaurantStore';
import type { Restaurant } from '../../lib/restaurantStore';

const RestaurantValidator: React.FC = () => {
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateRestaurant = async () => {
      if (!auth?.currentUser?.uid) {
        setIsValidating(false);
        return;
      }

      try {
        // Obtener restaurantes del usuario
        const ownerRestaurants = await getOwnerRestaurants(
          auth.currentUser.uid
        );

        // Si no hay restaurantes, no hay nada que hacer
        if (ownerRestaurants.length === 0) {
          setIsValidating(false);
          return;
        }

        // Obtener restaurante seleccionado actualmente
        const currentSelected = getSelectedRestaurant();

        // Si solo hay un restaurante, seleccionarlo automáticamente
        if (ownerRestaurants.length === 1) {
          setSelectedRestaurant(ownerRestaurants[0]);
          setIsValidating(false);
          return;
        }

        // Si hay más de un restaurante pero ninguno seleccionado, redirigir
        if (!currentSelected) {
          window.location.href = '/dashboard/restaurants';
          return;
        }

        // Verificar que el restaurante seleccionado pertenezca al usuario
        const isValid = ownerRestaurants.some(
          (r: Restaurant) => r.documentId === currentSelected.documentId
        );

        if (!isValid) {
          // Si no es válido, redirigir a selección
          window.location.href = '/dashboard/restaurants';
          return;
        }

        setIsValidating(false);
      } catch (error) {
        console.error('Error validating restaurant:', error);
        setIsValidating(false);
      }
    };

    validateRestaurant();
  }, []);

  if (isValidating) {
    return <div className="text-white">Verificando restaurante...</div>;
  }

  return null;
};

export default RestaurantValidator;
