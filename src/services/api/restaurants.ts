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

export async function getRestaurantsByOwner(firebaseUID: string) {
  try {
    const baseUrl = import.meta.env.PUBLIC_API_URL;
    if (!firebaseUID) {
      console.error('No se proporcionó firebaseUID');
      return [];
    }

    const url = `${baseUrl}/restaurants?filters[firebaseUID][$eq]=${firebaseUID}&populate=*`;

    // TODO: Add a token for security
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en getOwnerRestaurants:', errorText);
      throw new Error(`HTTP error! estado: ${response.status}`);
    }

    const result = await response.json();

    if (!result.data) {
      console.error('La respuesta de la API no contiene campo "data":', result);
      return [];
    }

    const { data: restaurantsData } = result;

    return restaurantsData as Restaurant[];
  } catch (error) {
    console.error('Error en getOwnerRestaurants:', error);
    return [];
  }
}
