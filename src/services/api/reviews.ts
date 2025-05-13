import type {
  ApiResponse,
  CreateReviewInput,
  ErrorResponse,
  Review,
} from '@/types/api';
import { API_CONFIG } from '../api';

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
