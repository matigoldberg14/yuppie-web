// Definición de tipos al inicio del archivo
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

const API_CONFIG = {
  baseUrl: import.meta.env.PUBLIC_API_URL || 'http://localhost:1337/api',
  timeout: 10000, // 10 segundos
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo
} as const;

const handleApiError = (error: unknown): never => {
  if (error instanceof Response) {
    throw new Error(`HTTP error! status: ${error.status}`);
  }
  throw error;
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
  if (!documentId) {
    throw new Error('Document ID is required');
  }

  console.log('Buscando restaurante con documentId:', documentId);

  try {
    const response = await apiClient.fetch<ApiResponse<Restaurant>>(
      `/restaurants/${documentId}`
    );
    return response.data;
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
  try {
    // 1. Obtener el restaurante actual por documentId
    const restaurantData = await apiClient.fetch<ApiResponse<Restaurant>>(
      `/restaurants/${documentId}`
    );

    if (!restaurantData.data) {
      throw new Error('No se encontró el restaurante');
    }

    // 2. Incrementar taps
    const currentTaps = parseInt(restaurantData.data.taps || '0');
    const newTaps = currentTaps + 1;

    console.log('Actualizando taps a:', newTaps);

    // 3. Actualizar el restaurante
    const updateResult = await apiClient.fetch<ApiResponse<Restaurant>>(
      `/restaurants/${documentId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          data: {
            taps: newTaps.toString(),
          },
        }),
      }
    );

    console.log('Taps actualizado correctamente:', updateResult);
    return updateResult;
  } catch (error) {
    console.error('Error incrementando taps:', error);
    throw error;
  }
}

export type { ApiError, ApiResponse, Restaurant, Review };
