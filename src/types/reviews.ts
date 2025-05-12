// src/types/reviews.ts

// Tipo para los empleados asociados a reseñas
export interface ReviewEmployee {
  documentId: string;
  firstName: string;
  lastName: string;
  position: string;
}

export type RatingValue = 1 | 2 | 3 | 4 | 5;

export type ImprovementValue =
  | 'atencion'
  | 'comidas'
  | 'bebidas'
  | 'ambiente'
  | 'otra';

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

// Tipo para las reseñas
export interface Review {
  id: number;
  documentId: string;
  calification: number;
  typeImprovement: string;
  comment: string;
  email: string;
  googleSent: boolean;
  date: string;
  createdAt: string;
  couponCode?: string;
  couponUsed?: boolean;
  employee?: ReviewEmployee;
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
