// src/utils/reviewLimiter.ts - Versión mínima
import { checkEmailReviewStatus } from '../services/api';

// src/utils/reviewLimiter.ts

// Asegurarnos que el marcado de reseñas enviadas sea consistente
export function recordReviewSubmission(restaurantId: string): void {
  try {
    const now = new Date().toISOString();
    const key = `yuppie_review_${restaurantId}`;
    localStorage.setItem(key, now);
    console.log(`Review submission recorded for restaurant ${restaurantId}`);

    // También guardar un identificador para reseñas de Google específicamente
    localStorage.setItem(`yuppie_google_review_${restaurantId}`, now);
  } catch (e) {
    console.error('Error recording review submission:', e);
  }
}

// Añadir un método específico para verificar si ya envió una reseña a Google
export function hasSubmittedGoogleReviewToday(restaurantId: string): boolean {
  try {
    const key = `yuppie_google_review_${restaurantId}`;
    const lastSubmission = localStorage.getItem(key);

    if (!lastSubmission) return false;

    const lastDate = new Date(lastSubmission);
    const now = new Date();

    // Verificar si la última reseña fue enviada en las últimas 24 horas
    const hoursDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  } catch (e) {
    console.error('Error checking Google review status:', e);
    return false;
  }
}

/**
 * Funciones de compatibilidad para mantener el código existente funcionando
 * mientras migramos al nuevo enfoque.
 */

// Función mantenida por retrocompatibilidad
export const hasSubmittedReviewToday = (restaurantId: string): boolean => {
  console.warn(
    'Esta función está obsoleta, usar checkEmailReviewStatus directamente'
  );
  return false;
};

// Función mantenida por retrocompatibilidad
/*
export const recordReviewSubmission = (restaurantId: string): void => {
  console.warn('Esta función está obsoleta, ya no es necesaria');
};
*/
/**
 * Comprueba si un email ya ha enviado una opinión para un restaurante en las últimas 24 horas
 * Esta es la única función que debe usarse en la implementación nueva
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
    console.error('Error verificando estado de opinión:', error);
    return false; // En caso de error, permitir el envío
  }
};
