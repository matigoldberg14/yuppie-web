// src/types/restaurant.ts
// Necesitamos alinear las definiciones de tipos para evitar incompatibilidades

export interface Location {
  street: string; // Requerido
  number: string; // Requerido
  city: string; // Requerido
  state: string; // Requerido
  country: string; // Requerido
  postalCode: string; // Requerido
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Para el tipo Restaurant
export interface Restaurant {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  taps: string;
  linkMaps: string; // Requerido
  owner: {
    firstName: string;
    lastName: string;
  };
  location?: Location; // Opcional, pero cuando existe debe tener todos los campos
  coordinates?: Coordinates;
  // Campos adicionales para métricas
  ingresos?: number;
  clientes?: number;
  satisfaccion?: number;
  ocupacion?: number;
  socialNetwork?: string;
}

// Para el tipo RestaurantData usado en componentes
export interface RestaurantData {
  id: number;
  documentId: string;
  name: string;
  taps: string;
  owner: {
    firstName: string;
    lastName: string;
  };
  linkMaps?: string; // Opcional
  location?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Función para convertir RestaurantData a Restaurant
export function convertToRestaurant(data: RestaurantData): Restaurant {
  // Asegurar valores por defecto para los campos requeridos
  return {
    id: data.id,
    documentId: data.documentId,
    name: data.name,
    taps: data.taps || '0',
    linkMaps: data.linkMaps || '',
    owner: {
      firstName: data.owner?.firstName || '',
      lastName: data.owner?.lastName || '',
    },
    // Convertir location solo si todos los campos requeridos están presentes
    location:
      data.location &&
      data.location.street &&
      data.location.number &&
      data.location.city &&
      data.location.state &&
      data.location.country &&
      data.location.postalCode
        ? {
            street: data.location.street,
            number: data.location.number,
            city: data.location.city,
            state: data.location.state,
            country: data.location.country,
            postalCode: data.location.postalCode,
          }
        : undefined,
    // Coordenadas
    coordinates: data.coordinates,
  };
}
