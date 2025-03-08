// src/types/index.ts
export interface Schedule {
  id: number;
  documentId: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
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
  createdAt: string;
}
export interface Employee {
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

export interface Restaurant {
  id: number;
  documentId: string;
  name: string;
  taps: string;
  linkMaps: string;
  owner: {
    firstName: string;
    lastName: string;
  };
  employees?: Employee[];
  reviews?: Review[];
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface EmployeeFormInput {
  firstName: string;
  lastName: string;
  position: string;
  photo: File | null;
  scheduleIds: number[];
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
