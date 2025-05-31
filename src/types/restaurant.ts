import type { Employee } from './employee';

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
  linkMaps: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  zone?: string;
  ingresos?: number;
  clientes?: number;
  satisfaccion?: number;
  ocupacion?: number;
  socialNetwork?: string;
  employees?: Employee[];
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
    slug: data.slug,
    employees: data.employees || [],
  };
}
