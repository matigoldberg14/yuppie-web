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

export interface CreateReviewInput {
  restaurantId: number;
  calification: number;
  typeImprovement: string;
  email: string;
  comment: string;
  googleSent: boolean;
}

interface RestaurantData {
  id: number;
  documentId: string;
  name: string;
  owner: {
    firstName: string;
    lastName: string;
  };
}

interface Review {
  restaurantId: number;
  documentId: string;
  calification: number;
  typeImprovement: string;
  comment: string;
  email: string;
  googleSent: boolean;
  date: string;
  createdAt: string;
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
  baseUrl: import.meta.env.PUBLIC_API_URL,
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

    // Obtener el restaurante usando el filtro por documentId
    const response0 = await fetch(
      `${API_CONFIG.baseUrl}/restaurants?filters[documentId][$eq]=${documentId}&populate=*`
    );
    if (!response0.ok) {
      console.error(
        'Error obteniendo restaurante (sin filtro):',
        await response0.text()
      );
      return null;
    }
    const json0 = await response0.json();
    if (!json0.data || json0.data.length === 0) {
      throw new Error('Restaurant not found in incrementTaps');
    }
    const restaurant = json0.data[0];
    console.log('Restaurant obtenido:', restaurant);

    // Leer taps actual del objeto obtenido
    const currentTaps = parseInt(restaurant.taps || '0');
    const newTaps = currentTaps + 1;
    console.log('Actualizando taps de:', currentTaps, 'a:', newTaps);

    // Actualizar taps usando el documentId en la URL (ya que funciona en tu entorno)
    const updateResponse = await fetch(
      `${API_CONFIG.baseUrl}/restaurants/${documentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: { taps: newTaps.toString() },
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

    // Devolver el objeto actualizado
    return result;
  } catch (error) {
    console.error('Error en incrementTaps:', error);
    throw error;
  }
}

// src/services/api.ts
export async function createReview(
  reviewData: CreateReviewInput
): Promise<ApiResponse<Review>> {
  try {
    const formattedData = {
      data: {
        restaurant: reviewData.restaurantId,
        calification: reviewData.calification,
        typeImprovement: reviewData.typeImprovement,
        email: reviewData.email,
        comment: reviewData.comment,
        googleSent: reviewData.googleSent,
        date: new Date().toISOString(),
      },
    };

    const response = await fetch(`${API_CONFIG.baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Aquí está el cambio clave
      throw new Error(
        data.error?.message || data.message || 'No se pudo crear la review'
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al crear la review');
  }
}

export async function getRestaurant(documentId: string) {
  try {
    // En modo development, no se aplica el filtro publishedAt
    const publishedFilter =
      import.meta.env.MODE === 'development'
        ? ''
        : '&filters[publishedAt][$notNull]=true';

    const url = `${API_CONFIG.baseUrl}/restaurants?filters[documentId][$eq]=${documentId}${publishedFilter}&populate=*`;
    console.log('getRestaurant -> URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      console.error('getRestaurant -> response not ok:', response.status);
      return null;
    }
    const json = await response.json();

    if (!json.data || json.data.length === 0) {
      console.error(
        `getRestaurant -> No se encontró restaurante con documentId: ${documentId}`
      );
      return null;
    }
    // Devuelve directamente el primer restaurante
    return json.data[0];
  } catch (error) {
    console.error(`Error fetching restaurant ${documentId}:`, error);
    return null;
  }
}

// src/services/api.ts
interface Owner {
  firstName: string;
  lastName: string;
  email: string;
}

interface Restaurant {
  id: number;
  documentId: string;
  name: string;
  firebaseUID: string;
  owner: Owner;
}

export async function getRestaurantByFirebaseUID(firebaseUID: string) {
  try {
    // Validar si tenemos la URL base
    const baseUrl = import.meta.env.PUBLIC_API_URL;

    // Asegurarnos que tenemos un firebaseUID
    if (!firebaseUID) {
      console.error('No firebaseUID provided');
      return null;
    }

    // Imprimir la URL completa para debug
    const url = `${baseUrl}/restaurants?filters[firebaseUID][$eq]=${firebaseUID}&populate=owner`;
    console.log('Requesting URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (!result.data || result.data.length === 0) {
      throw new Error('No restaurant found');
    }
    const restaurantData = result.data[0];
    return {
      id: restaurantData.id,
      documentId: restaurantData.documentId,
      name: restaurantData.name,
      taps: restaurantData.taps || '0',
      owner: {
        firstName: restaurantData.owner.name || '',
        lastName: restaurantData.owner.lastName || '',
      },
    };
  } catch (error) {
    console.error('Error in getRestaurantByFirebaseUID:', error);
    return null;
  }
}

export async function getRestaurantReviews(restaurantId: string) {
  try {
    const response = await fetch(
      `${
        import.meta.env.PUBLIC_API_URL
      }/reviews?filters[restaurant][documentId][$eq]=${restaurantId}&populate=*&sort[0]=createdAt:desc`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    return data.map((review: any) => ({
      id: review.id,
      documentId: review.documentId,
      calification: review.calification,
      typeImprovement: review.typeImprovement,
      comment: review.comment,
      email: review.email,
      googleSent: review.googleSent,
      date: review.date,
      createdAt: review.createdAt,
      couponCode: review.couponCode, // Nuevo campo
      couponUsed: review.couponUsed, // Nuevo campo
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

// Añadir interfaces
interface Employee {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  position: string;
  active: boolean;
  photo?: {
    url: string;
    formats: {
      thumbnail: {
        url: string;
      };
    };
  };
  schedules: Schedule[];
}

interface Schedule {
  id: number;
  documentId: string;
  day:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';
  startTime: string;
  endTime: string;
}

// Añadir funciones para empleados
export async function getEmployeesByRestaurant(restaurantId: string) {
  try {
    const response = await fetch(
      `${
        import.meta.env.PUBLIC_API_URL
      }/employees?filters[restaurant][documentId][$eq]=${restaurantId}&populate=*`
    );

    if (!response.ok) {
      throw new Error('Error fetching employees');
    }

    const { data } = await response.json();
    return data.map((employee: any) => ({
      id: employee.id,
      documentId: employee.documentId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      active: employee.active,
      photo: employee.photo,
      schedules: employee.schedules,
    }));
  } catch (error) {
    console.error('Error in getEmployeesByRestaurant:', error);
    return [];
  }
}

interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  position: string;
  photo: File | null;
  scheduleIds: string[];
  restaurantId: string;
}

interface UpdateEmployeeData {
  firstName: string;
  lastName: string;
  position: string;
  scheduleIds: string[];
  photo: File | null;
}

export async function createEmployee(employeeData: CreateEmployeeInput) {
  try {
    // Primero creamos el empleado
    const response = await fetch(
      `${import.meta.env.PUBLIC_API_URL}/employees`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            position: employeeData.position,
            active: true,
            restaurant: employeeData.restaurantId,
            schedules: employeeData.scheduleIds,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error creating employee');
    }

    const result = await response.json();

    // Si hay una foto, la subimos
    if (employeeData.photo) {
      const photoFormData = new FormData();
      photoFormData.append('files', employeeData.photo);
      photoFormData.append('ref', 'api::employee.employee');
      photoFormData.append('refId', result.data.id);
      photoFormData.append('field', 'photo');

      const uploadResponse = await fetch(
        `${import.meta.env.PUBLIC_API_URL}/upload`,
        {
          method: 'POST',
          body: photoFormData,
        }
      );

      if (!uploadResponse.ok) {
        console.error('Error uploading photo');
      }
    }

    return result;
  } catch (error) {
    console.error('Error in createEmployee:', error);
    throw error;
  }
}

export async function deleteEmployee(documentId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${import.meta.env.PUBLIC_API_URL}/employees/${documentId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error deleting employee');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteEmployee:', error);
    throw error;
  }
}

export async function updateEmployee(
  documentId: string,
  employeeData: UpdateEmployeeData
): Promise<boolean> {
  try {
    // Actualizar solo los datos básicos del empleado
    const response = await fetch(
      `${import.meta.env.PUBLIC_API_URL}/employees/${documentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            position: employeeData.position,
            schedules: employeeData.scheduleIds,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error actualizando empleado:', errorText);
      throw new Error('Error updating employee');
    }

    return true;
  } catch (error) {
    console.error('Error in updateEmployee:', error);
    throw error;
  }
}

export async function updateReview(
  reviewDocumentId: string,
  data: any
): Promise<any> {
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/reviews/${reviewDocumentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error updating review: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updateReview:', error);
    throw error;
  }
}

// Función para obtener el ID numérico de Strapi usando el documentId.
export async function getRestaurantNumericId(
  documentId: string
): Promise<number | null> {
  try {
    const url = `${API_CONFIG.baseUrl}/restaurants?filters[documentId][$eq]=${documentId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error fetching restaurant numeric id');
    }
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].id; // Aquí se obtiene el ID numérico interno
    }
    return null;
  } catch (error) {
    console.error('Error in getRestaurantNumericId:', error);
    return null;
  }
}

export type { ApiError, ApiResponse, Restaurant, Review };
