// src/types/reviews.ts

import type { Employee } from './employee';
import type { Restaurant } from './restaurant';

// Tipo para los empleados asociados a reseñas
export interface ReviewEmployee {
  documentId: string;
  firstName: string;
  lastName: string;
  position: string;
}

export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface RatingOption {
  rating: RatingValue;
  icon: string;
  label: string;
}

export type ImprovementValue =
  | 'Atención'
  | 'Comidas'
  | 'Bebidas'
  | 'Ambiente'
  | 'Otra';

export interface ImprovementOption {
  id: ImprovementValue;
  icon: string;
  label: string;
}

export type CommentCategory = Exclude<ImprovementValue, 'Otra'>;

export type CommentValue =
  | 'temperatura'
  | 'variedad'
  | 'precio'
  | 'calidad'
  | 'otro'
  | 'sabor'
  | 'porcion'
  | 'presentacion'
  | 'tiempo'
  | 'amabilidad'
  | 'pedido'
  | 'disponibilidad'
  | 'ruido'
  | 'limpieza'
  | 'comodidad';

export interface CommentOption {
  id: CommentValue;
  icon: string;
  label: string;
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
  couponCode?: string;
  couponUsed?: boolean;
}

// Tipo para la respuesta de la API al crear reseñas
export interface CreateReviewResponse {
  data: Review;
  meta: any;
}

// Tipo para estadísticas de reseñas
export interface ReviewStats {
  totalCount: number;
  averageRating: number;
  distributionByRating: Record<number, number>;
  topCategories: {
    category: string;
    count: number;
  }[];
}
