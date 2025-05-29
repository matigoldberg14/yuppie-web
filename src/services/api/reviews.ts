import type {
  ApiResponse,
  CreateReviewInput,
  ErrorResponse,
} from '@/types/api';
import { API_CONFIG, apiClient } from '../api';
import type { Review } from '@/types/reviews';

export async function createReview(
  reviewData: CreateReviewInput
): Promise<ApiResponse<Review> | ErrorResponse> {
  try {
    reviewData.date = new Date().toISOString();
    const result = await apiClient.fetch<ApiResponse<Review>>('/reviews', {
      method: 'POST',
      body: JSON.stringify({ data: reviewData }),
    });
    return result;
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
    const url = `/reviews?filters[restaurant][documentId][$eq]=${restaurant}&filters[employee][documentId][$eq]=${employee}&filters[email][$eq]=${email}`;
    const { data: reviewsData } = await apiClient.fetch<{ data: Review[] }>(
      url
    );
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
