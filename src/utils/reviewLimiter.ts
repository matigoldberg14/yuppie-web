// /Users/Mati/Desktop/yuppie-web/src/utils/reviewLimiter.ts
// src/utils/reviewLimiter.ts
import { checkEmailReviewStatus } from '../services/api';

/**
 * Check if a user has already submitted a review for this restaurant in the last 24 hours.
 * This is a legacy function that now uses the API-based approach.
 *
 * @param restaurantId The restaurant's document ID
 * @returns Always returns false to allow the application flow to continue
 */
export const hasSubmittedReviewToday = (restaurantId: string): boolean => {
  // This function now returns false to allow the application flow to continue
  // The actual check is performed by checkEmailReviewStatus in the components
  console.log(
    '[INFO] Legacy function hasSubmittedReviewToday called, now using API-based approach'
  );
  return false;
};

/**
 * Legacy function that used to record a review submission in localStorage.
 * Now it just cleans up any remaining localStorage entries.
 *
 * @param restaurantId The restaurant's document ID
 */
export const recordReviewSubmission = (restaurantId: string): void => {
  // Clean up any remaining entries that might be used by the old approach
  try {
    const keysToClean = ['yuppie_review_history', 'redirecting_from_comment'];

    keysToClean.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Error removing ${key}:`, e);
      }
    });

    console.log('[INFO] Cleaned up legacy localStorage entries');
  } catch (error) {
    console.error('[ERROR] Error in cleanup:', error);
  }
};

/**
 * Async wrapper around checkEmailReviewStatus for components that need to check
 * if a user has already submitted a review.
 *
 * @param restaurantDocumentId The restaurant's document ID
 * @param email The user's email
 * @returns True if the user has already submitted a review in the last 24 hours
 */
export const hasSubmittedReviewWithEmail = async (
  restaurantDocumentId: string,
  email: string
): Promise<boolean> => {
  if (!restaurantDocumentId || !email) {
    return false;
  }

  try {
    const result = await checkEmailReviewStatus(restaurantDocumentId, email);
    return result.hasReviewed;
  } catch (error) {
    console.error('Error checking review status:', error);
    return false; // Fail open approach
  }
};
