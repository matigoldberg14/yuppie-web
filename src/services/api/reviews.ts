import type {
  ApiResponse,
  CreateReviewInput,
  ErrorResponse,
} from '@/types/api';
import { API_CONFIG } from '../api';
import type { Review } from '@/types/reviews';

export async function createReview(
  reviewData: CreateReviewInput
): Promise<ApiResponse<Review> | ErrorResponse> {
  try {
    reviewData.date = new Date().toISOString();

    const response = await fetch(`${API_CONFIG.baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: reviewData }),
    });

    if (!response.ok) {
      throw new Error('Error al crear la review');
    }

    return response.json();
  } catch (error) {
    return {
      error: true,
      message: error as string,
    };
  }
}

export async function existsReviewWithEmail(
  restaurant: string,
  employee: string,
  email: string
): Promise<Boolean | ErrorResponse> {
  try {
    const url = `${
      import.meta.env.PUBLIC_API_URL
    }/reviews?filters[restaurant][documentId][$eq]=${restaurant}&filters[employee][documentId][$eq]=${employee}&filters[email][$eq]=${email}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Error al buscar la review');
    }

    const { data: reviewsData } = await response.json();
    const today = new Date().toISOString().split('T')[0];

    return reviewsData.some(
      (review: Review) => review.date.split('T')[0] === today
    );
  } catch (error) {
    return {
      error: true,
      message: error as string,
    };
  }
}

export async function getRestaurantReviews(restaurantId: string) {
  try {
    const url = `${
      import.meta.env.PUBLIC_API_URL
    }/reviews?filters[restaurant][documentId][$eq]=${restaurantId}&populate=*&sort[0]=createdAt:asc`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.data) {
      console.error('La respuesta de la API no contiene campo "data":', result);
      return [];
    }

    const { data: reviewsData } = result;

    return reviewsData as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}
