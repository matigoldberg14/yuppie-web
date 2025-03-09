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

        // Si solo hay un restaurante, seleccionarlo automáticamente
        if (ownerRestaurants.length === 1) {
          // Importante: hacer esto de manera inmediata para evitar parpadeos
          setSelectedRestaurant(ownerRestaurants[0]);
          console.log(
            'RestaurantValidator: Auto-seleccionado restaurante único:',
            ownerRestaurants[0].name
          );
          setIsValidating(false);
          return;
        }

        // Si hay múltiples restaurantes, verificar la selección
        const currentSelected = getSelectedRestaurant();

        // Si no hay seleccionado y hay múltiples, redirigir
        if (!currentSelected) {
          console.log(
            'RestaurantValidator: Múltiples restaurantes sin selección, redirigiendo...'
          );
          window.location.href = '/dashboard/restaurants';
          return;
        }

        // Verificar que el restaurante seleccionado pertenezca al usuario
        const isValid = ownerRestaurants.some(
          (r: Restaurant) => r.documentId === currentSelected.documentId
        );

        if (!isValid) {
          console.log(
            'RestaurantValidator: Restaurante seleccionado no válido, redirigiendo...'
          );
          window.location.href = '/dashboard/restaurants';
          return;
        }

        console.log(
          'RestaurantValidator: Restaurante válido:',
          currentSelected.name
        );
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
