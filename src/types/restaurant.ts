export interface Location {
  street: string;
  number: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

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
    email: string; // Email del dueño del restaurante
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

export function convertToRestaurant(data: Restaurant): Restaurant {
  return {
    id: data.id,
    documentId: data.documentId,
    name: data.name,
    taps: data.taps || '0',
    linkMaps: data.linkMaps || '',
    owner: {
      firstName: data.owner?.firstName || '',
      lastName: data.owner?.lastName || '',
      email: '',
    },
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
    coordinates: data.coordinates,
    slug: data.slug,
  };
}
