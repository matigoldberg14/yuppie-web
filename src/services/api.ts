// src/services/api.ts
interface Restaurant {
  id: number;
  documentId: string;
  name: string;
  taps: string;
  linkMaps: string;
  cover?: {
    id: number;
    name: string;
    url: string;
    formats: {
      small: {
        url: string;
      };
      thumbnail: {
        url: string;
      };
    };
  };
}

interface Review {
  restaurantId: string;
  calification: number;
  typeImprovement?: string | null;
  email?: string | null;
  comment?: string | null;
  googleSent?: boolean;
  date?: string;
}

interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      total: number;
    };
  };
}

export const API_CONFIG = {
  baseUrl: import.meta.env.PUBLIC_API_URL || 'http://localhost:1337/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

const handleError = (error: unknown) => {
  console.error('API Error:', error);
  throw error instanceof Error ? error : new Error('Unknown error occurred');
};

const withRetry = async <T>(
  fn: () => Promise<T>,
  attempts: number = API_CONFIG.retryAttempts
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    await new Promise((resolve) => setTimeout(resolve, API_CONFIG.retryDelay));
    return withRetry(fn, attempts - 1);
  }
};

// Cliente base mejorado
const apiClient = {
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const response = await withRetry(async () => {
        const res = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error?.message || 'API Error');
        }

        return res.json();
      });

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};

// Funciones mejoradas
export async function getAllRestaurants() {
  try {
    return await apiClient.fetch<ApiResponse<Restaurant[]>>(
      '/restaurants?populate=*'
    );
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return { data: [], meta: { pagination: { total: 0 } } };
  }
}

export async function getRestaurant(documentId: string) {
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/restaurants/${documentId}?populate=*`
    );
    if (!response.ok) {
      throw new Error('No se encontró el restaurante');
    }
    const restaurantData = await response.json();
    return restaurantData.data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

export async function createReview(reviewData: Review) {
  try {
    if (!reviewData.restaurantId) {
      throw new Error('El ID del restaurante es requerido');
    }

    if (isNaN(parseInt(reviewData.restaurantId))) {
      throw new Error('El ID del restaurante debe ser un número');
    }

    const formattedData = {
      data: {
        restaurant: parseInt(reviewData.restaurantId),
        calification: reviewData.calification,
        googleSent: reviewData.googleSent,
        typeImprovement: reviewData.typeImprovement,
        email: reviewData.email,
        comment: reviewData.comment,
        date: new Date().toISOString().split('T')[0],
      },
    };

    console.log('Sending to Strapi:', JSON.stringify(formattedData, null, 2));

    return await apiClient.fetch<ApiResponse<Review>>('/reviews', {
      method: 'POST',
      body: JSON.stringify(formattedData),
    });
  } catch (error) {
    console.error('Error details:', error);
    throw error;
  }
}

export async function incrementTaps(documentId: string) {
  console.log('=== INICIO INCREMENT TAPS ===');
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/restaurants/${documentId}`
    );
    const restaurantData = await response.json();

    console.log('Datos obtenidos del restaurante:', restaurantData);

    const currentTaps = parseInt(restaurantData.data.taps || '0');
    const newTaps = currentTaps + 1;

    console.log('Taps actuales:', currentTaps);
    console.log('Nuevos taps:', newTaps);

    const updateResponse = await fetch(
      `${API_CONFIG.baseUrl}/restaurants/${documentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            taps: newTaps.toString(),
          },
        }),
      }
    );

    console.log('Respuesta de actualización:', await updateResponse.json());
    console.log('=== FIN INCREMENT TAPS ===');
  } catch (error) {
    console.error('Error incrementando taps:', error);
    throw error;
  }
}

export type { ApiError, ApiResponse, Restaurant, Review };
