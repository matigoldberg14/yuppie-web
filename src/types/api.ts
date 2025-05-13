import type { Employee } from './employee';
import type { Restaurant } from './restaurant';

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

export interface CreateReviewInput {
  restaurant: string;
  employee: string;
  calification: number;
  typeImprovement: string;
  email: string;
  comment: string;
  googleSent: boolean;
  date: string;
}

export interface ErrorResponse {
  error: true;
  message: string;
}
