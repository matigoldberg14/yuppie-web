// TODO: traer variables de entorno desde un config y manejar errores

import type { Restaurant } from '@/types/restaurant';
import { apiClient } from '../api';

// Buscar restaurante por slug
export async function getRestaurantBySlug(restaurantSlug: string) {
  try {
    const url = `/restaurants?filters[slug][$eq]=${restaurantSlug}&populate=*`;
    const { data: restaurantsData } = await apiClient.fetch<{
      data: Restaurant[];
    }>(url);
    if (!restaurantsData || !Array.isArray(restaurantsData)) {
      console.error('Estructura de datos inesperada:', restaurantsData);
      return null;
    }
    return restaurantsData[0] as Restaurant;
  } catch (error) {
    console.error('Error buscando restaurante:', error);
    return null;
  }
}
