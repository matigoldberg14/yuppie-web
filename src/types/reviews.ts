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

export type ImprovementValue =
  | 'service'
  | 'food'
  | 'drinks'
  | 'atmosphere'
  | 'other';

// Nuevo: ids válidos para subopciones
export type CommentOptionId =
  | 'portionSize'
  | 'temperature'
  | 'taste'
  | 'presentation'
  | 'variety'
  | 'musicLoud'
  | 'lighting'
  | 'cleanliness'
  | 'comfort'
  | 'friendliness'
  | 'speed'
  | 'attention'
  | 'orderAccuracy'
  | 'price'
  | 'quality'
  | 'portion'
  | 'waitingTime'
  | 'kindness'
  | 'order'
  | 'availability'
  | 'noise'
  | 'other';

export type CommentValue = CommentOptionId;

export type CommentCategory = 'service' | 'food' | 'drinks' | 'atmosphere';

export interface RatingOption {
  rating: RatingValue;
  label: string;
}

export interface CommentOption {
  id: CommentOptionId;
  icon: string;
  label: string;
}

export interface ImprovementOption {
  id: ImprovementValue;
  icon: string;
  label: string;
}

export interface Review {
  id: number;
  documentId: string;
  googleSent: boolean;
  typeImprovement: CommentCategory;
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
