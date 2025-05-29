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
  apiKey: import.meta.env.PUBLIC_STRAPI_API_KEY,
} as const;

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

export const apiClient = {
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
            Authorization: `Bearer ${API_CONFIG.apiKey}`,
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
    if (!firebaseUID) {
      console.error('No firebaseUID provided');
      return null;
    }
    const url = `/restaurants?filters[firebaseUID][$eq]=${firebaseUID}&populate=owner`;
    console.log('Requesting URL:', url);
    const result = await apiClient.fetch<ApiResponse<any[]>>(url);
    if (!result.data || result.data.length === 0) {
      throw new Error('No restaurant found');
    }
    // Selecciona el primer restaurante encontrado
    const restaurantData = result.data[0];
    return {
      id: restaurantData.id,
      documentId: restaurantData.documentId,
      name: restaurantData.name,
      taps: restaurantData.taps || '0',
      owner: {
        firstName: restaurantData.owner?.name || '',
        lastName: restaurantData.owner?.lastName || '',
      },
    };
  } catch (error) {
    console.error('Error in getRestaurantByFirebaseUID:', error);
    return null;
  }
}

export async function getRestaurantReviews(restaurantId: string) {
  try {
    const { data } = await apiClient.fetch<ApiResponse<any[]>>(
      `/reviews?filters[restaurant][documentId][$eq]=${restaurantId}&populate=*&sort[0]=createdAt:desc`
    );
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
      couponCode: review.couponCode,
      couponUsed: review.couponUsed,
      employee: review.employee
        ? {
            id: review.employee.id,
            documentId: review.employee.documentId,
            firstName: review.employee.firstName,
            lastName: review.employee.lastName,
            position: review.employee.position,
          }
        : undefined,
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
    const { data } = await apiClient.fetch<ApiResponse<any[]>>(
      `/employees?filters[restaurant][documentId][$eq]=${restaurantId}&populate=*`
    );
    return data.map((employee: any) => ({
      id: employee.id,
      documentId: employee.documentId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      active: employee.active,
      photo: employee.photo,
      schedules: employee.schedules,
      taps:
        typeof employee.taps === 'number'
          ? employee.taps
          : Number(employee.taps) || 0,
    }));
  } catch (error) {
    console.error('Error in getEmployeesByRestaurant:', error);
    return [];
  }
}

// /Users/Mati/Desktop/yuppie-web/src/services/api.ts
// Añadir o actualizar estas funciones en tu archivo api.ts

interface WorkSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  position: string;
  photo: File | null;
  schedules: WorkSchedule[];
  restaurantId: string;
}

interface UpdateEmployeeData {
  firstName: string;
  lastName: string;
  position: string;
  schedules: WorkSchedule[];
  photo: File | null;
}

// Función para convertir formato de hora HH:mm a HH:mm:ss.SSS
function formatTimeForStrapi(time: string): string {
  if (!time) return '';
  // Si ya tiene el formato completo, devolverlo como está
  if (/^\d{2}:\d{2}:\d{2}\.\d{3}$/.test(time)) {
    return time;
  }
  // Si solo tiene horas y minutos, añadir segundos y milisegundos
  if (/^\d{2}:\d{2}$/.test(time)) {
    return `${time}:00.000`;
  }
  // Si tiene horas, minutos y segundos, añadir milisegundos
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return `${time}.000`;
  }
  // Si no coincide con ningún formato conocido, devolver vacío
  console.error('Formato de hora no reconocido:', time);
  return '';
}

export async function createEmployee(employeeData: CreateEmployeeInput) {
  try {
    console.log('Creando empleado con datos:', {
      ...employeeData,
      photo: employeeData.photo ? 'Archivo presente' : 'Sin foto',
      schedulesCount: employeeData.schedules.length,
    });

    // Paso 1: Obtener el ID numérico del restaurante
    console.log(
      `Obteniendo ID numérico para restaurante: ${employeeData.restaurantId}`
    );
    const restaurantData = await apiClient.fetch<ApiResponse<any[]>>(
      `/restaurants?filters[documentId][$eq]=${employeeData.restaurantId}`
    );

    if (!restaurantData.data || restaurantData.data.length === 0) {
      throw new Error('Restaurante no encontrado');
    }

    const restaurantNumericId = restaurantData.data[0].id;
    console.log(`ID numérico del restaurante obtenido: ${restaurantNumericId}`);

    // Paso 2: Formatear correctamente los horarios
    const formattedSchedules = employeeData.schedules.map((schedule) => ({
      day: schedule.day,
      startTime: formatTimeForStrapi(schedule.startTime),
      endTime: formatTimeForStrapi(schedule.endTime),
    }));

    // Paso 3: Crear el empleado con las relaciones a los horarios
    const employeePayload = {
      data: {
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        position: employeeData.position,
        active: true,
        restaurant: { id: restaurantNumericId },
        schedules: formattedSchedules,
      },
    };

    console.log(
      'Payload para Strapi:',
      JSON.stringify(employeePayload, null, 2)
    );

    const result = await apiClient.fetch<ApiResponse<any>>('/employees', {
      method: 'POST',
      body: JSON.stringify(employeePayload),
    });

    console.log('Empleado creado:', result);

    // Subir foto si existe
    if (employeeData.photo && result.data && result.data.id) {
      console.log('Subiendo foto para empleado:', result.data.id);
      const photoFormData = new FormData();
      photoFormData.append('files', employeeData.photo);
      photoFormData.append('ref', 'api::employee.employee');
      photoFormData.append('refId', result.data.id);
      photoFormData.append('field', 'photo');

      const uploadResponse = await fetch(`${API_CONFIG.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_CONFIG.apiKey}`,
        },
        body: photoFormData,
      });

      if (!uploadResponse.ok) {
        console.error('Error al subir la foto');
      }
    }

    return result;
  } catch (error) {
    console.error('Error en createEmployee:', error);
    throw error;
  }
}

// También necesitamos actualizar la función updateEmployee para usar el mismo formato
export async function updateEmployee(
  documentId: string,
  employeeData: UpdateEmployeeData
): Promise<boolean> {
  try {
    console.log('Actualizando empleado:', documentId);
    console.log('Datos:', {
      ...employeeData,
      photo: employeeData.photo ? 'Archivo presente' : 'Sin foto',
      schedulesCount: employeeData.schedules.length,
    });

    // Formatear correctamente los horarios
    const formattedSchedules = employeeData.schedules.map((schedule) => ({
      day: schedule.day,
      startTime: formatTimeForStrapi(schedule.startTime),
      endTime: formatTimeForStrapi(schedule.endTime),
    }));

    // Actualizar datos del empleado incluyendo horarios
    await apiClient.fetch<ApiResponse<any>>(`/employees/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          position: employeeData.position,
          schedules: formattedSchedules,
        },
      }),
    });

    console.log('Empleado actualizado correctamente');

    // Si hay una nueva foto, subirla
    if (employeeData.photo) {
      console.log('Subiendo nueva foto para el empleado');

      // Primero, obtener el ID numérico del empleado
      const employeeDataResult = await apiClient.fetch<ApiResponse<any[]>>(
        `/employees?filters[documentId][$eq]=${documentId}`
      );

      if (!employeeDataResult.data || employeeDataResult.data.length === 0) {
        console.error('No se encontró el empleado');
        return true;
      }

      const employeeId = employeeDataResult.data[0].id;

      // Subir la foto
      const photoFormData = new FormData();
      photoFormData.append('files', employeeData.photo);
      photoFormData.append('ref', 'api::employee.employee');
      photoFormData.append('refId', employeeId.toString());
      photoFormData.append('field', 'photo');

      const uploadResponse = await fetch(`${API_CONFIG.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_CONFIG.apiKey}`,
        },
        body: photoFormData,
      });

      if (!uploadResponse.ok) {
        console.error('Error al subir la foto');
      } else {
        console.log('Foto actualizada correctamente');
      }
    }

    return true;
  } catch (error) {
    console.error('Error en updateEmployee:', error);
    throw error;
  }
}

export async function deleteEmployee(documentId: string): Promise<boolean> {
  try {
    await apiClient.fetch<ApiResponse<any>>(`/employees/${documentId}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error in deleteEmployee:', error);
    throw error;
  }
}

export async function updateReview(
  reviewDocumentId: string,
  data: any
): Promise<any> {
  try {
    return await apiClient.fetch<ApiResponse<any>>(
      `/reviews/${reviewDocumentId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ data }),
      }
    );
  } catch (error) {
    console.error('Error in updateReview:', error);
    throw error;
  }
}

// Función para obtener todos los restaurantes de un owner dado su firebaseUID
export async function getOwnerRestaurants(firebaseUID: string) {
  try {
    if (!firebaseUID) {
      console.error('No se proporcionó firebaseUID');
      return [];
    }

    const url = `/restaurants?filters[firebaseUID][$eq]=${firebaseUID}&populate=*`;
    console.log('Solicitando restaurantes desde:', url);

    const result = await apiClient.fetch<ApiResponse<any[]>>(url);
    console.log('Resultado completo:', result);

    if (!result.data) {
      console.error('La respuesta de la API no contiene campo "data":', result);
      return [];
    }

    if (result.data.length === 0) {
      console.log('No se encontraron restaurantes para este usuario');
      return [];
    }

    // Mapeamos los datos para asegurarnos que tengan la estructura correcta
    const restaurants = result.data.map((restaurantData: any) => {
      const id = restaurantData.id || 0;
      const documentId =
        restaurantData.documentId || restaurantData.id?.toString() || 'unknown';
      const name = restaurantData.name || 'Restaurante sin nombre';
      const taps = restaurantData.taps || '0';

      const owner = {
        firstName: restaurantData.owner?.name || '',
        lastName: restaurantData.owner?.lastName || '',
      };

      const coordinates = {
        latitude:
          restaurantData.latitude !== null
            ? Number(restaurantData.latitude)
            : -34.603722,
        longitude:
          restaurantData.longitude !== null
            ? Number(restaurantData.longitude)
            : -58.381592,
      };

      const location = {
        street: restaurantData.address || '',
        number: '',
        city: restaurantData.city || '',
        state: restaurantData.state || '',
        country: restaurantData.country || '',
        postalCode: restaurantData.postalCode || '',
      };

      return {
        id,
        documentId,
        name,
        taps,
        owner,
        location,
        coordinates,
        linkMaps: restaurantData.linkMaps || '',
        firebaseUID: restaurantData.firebaseUID || '',
      };
    });

    console.log('Total de restaurantes procesados:', restaurants.length);
    return restaurants;
  } catch (error) {
    console.error('Error en getOwnerRestaurants:', error);
    return [];
  }
}

export async function updateRestaurantCoordinates(
  documentId: string,
  coordinates: { latitude: number; longitude: number }
): Promise<boolean> {
  try {
    await apiClient.fetch<ApiResponse<any>>(`/restaurants/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          coordinates: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          },
        },
      }),
    });
    return true;
  } catch (error) {
    console.error('Error in updateRestaurantCoordinates:', error);
    throw error;
  }
}

export type { ApiError, ApiResponse, Restaurant, Review };
