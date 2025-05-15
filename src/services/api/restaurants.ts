// TODO: traer variables de entorno desde un config y manejar errores

import type { Restaurant } from '@/types/restaurant';

// Buscar restaurante por slug
export async function getRestaurantBySlug(restaurantSlug: string) {
  try {
    const url = `${
      import.meta.env.PUBLIC_API_URL
    }/restaurants?filters[slug][$eq]=${restaurantSlug}&populate=*`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Error en respuesta API:', response.status);
      return null;
    }

    const { data: restaurantsData } = await response.json();

    // Validar estructura de datos
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
