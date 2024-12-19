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
  restaurantId: string | number;
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

export async function incrementTaps(documentId: string) {
  try {
    console.log('Incrementando taps para documentId:', documentId);

    // 1. Obtener el restaurante actual
    const response = await fetch(
      `${API_CONFIG.baseUrl}/restaurants/${documentId}`
    );

    if (!response.ok) {
      console.error('Error obteniendo restaurante:', await response.text());
      return null;
    }

    const data = await response.json();
    console.log('Datos del restaurante obtenido:', data);

    // 2. Actualizar los taps
    const currentTaps = parseInt(data.data.taps || '0');
    const newTaps = currentTaps + 1;

    console.log('Actualizando taps de:', currentTaps, 'a:', newTaps);

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

    if (!updateResponse.ok) {
      throw new Error(
        `Error actualizando taps: ${await updateResponse.text()}`
      );
    }

    const result = await updateResponse.json();
    console.log('Resultado de la actualización:', result);

    return result;
  } catch (error) {
    console.error('Error en incrementTaps:', error);
    throw error;
  }
}

export async function createReview(reviewData: Review) {
  try {
    const formattedData = {
      data: {
        restaurant: reviewData.restaurantId, // documentId del restaurante
        calification: reviewData.calification,
        typeImprovement: reviewData.typeImprovement || null,
        email: reviewData.email || null,
        comment: reviewData.comment || null,
        googleSent: reviewData.googleSent || false,
        date: new Date().toISOString().split('T')[0],
      },
    };

    const reviewResponse = await fetch(`${API_CONFIG.baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    if (!reviewResponse.ok) {
      throw new Error('Failed to create review');
    }

    return await reviewResponse.json();
  } catch (error) {
    console.error('Error in createReview:', error);
    throw error;
  }
}

export async function getRestaurant(documentId: string) {
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/restaurants/${documentId}?populate=*`
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

export type { ApiError, ApiResponse, Restaurant, Review };
