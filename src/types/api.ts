// src/types/api.ts
export interface Restaurant {
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
  employees?: Employee[];
  reviews?: Review[];
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  active: boolean;
  photo?: {
    id: number;
    url: string;
    formats: {
      thumbnail: {
        url: string;
      };
    };
  };
  restaurant: Restaurant;
  schedules: Schedule[];
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Schedule {
  id: number;
  day: WeekDay;
  startTime: string; // formato "HH:mm:ss.SSS"
  endTime: string;
  employee: Employee;
}

export interface Review {
  id: number;
  documentId: string;
  googleSent: boolean;
  typeImprovement: 'Atención' | 'Comidas' | 'Bebidas' | 'Ambiente' | 'Otra';
  email: string;
  date: string;
  comment: string;
  calification: number;
  restaurant: Restaurant;
  employee?: Employee;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
