// src/utils/reviewLimiter.ts - Versión mínima
import { checkEmailReviewStatus } from '../services/api';

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
export const recordReviewSubmission = (restaurantId: string): void => {
  console.warn('Esta función está obsoleta, ya no es necesaria');
};

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
