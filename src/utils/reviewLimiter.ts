// src/utils/reviewLimiter.ts
interface ReviewRecord {
  restaurantId: string;
  timestamp: number;
}

/**
 * Verifica si un usuario ya ha enviado una review para un restaurante
 * específico en las últimas 24 horas basándose en localStorage
 */
export const hasSubmittedReviewToday = (restaurantId: string): boolean => {
  try {
    // Obtener registros existentes
    const storedRecordsJson = localStorage.getItem('yuppie_review_history');
    if (!storedRecordsJson) return false;

    const storedRecords: ReviewRecord[] = JSON.parse(storedRecordsJson);

    // Calcular timestamp de hace 24 horas
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Filtrar registros antiguos y buscar coincidencia de restaurante
    const validRecords = storedRecords.filter(
      (record) => record.timestamp > oneDayAgo
    );
    const hasSentReview = validRecords.some(
      (record) => record.restaurantId === restaurantId
    );

    // Limpiar registros antiguos
    localStorage.setItem('yuppie_review_history', JSON.stringify(validRecords));

    return hasSentReview;
  } catch (error) {
    console.error('Error verificando historial de reviews:', error);
    return false; // En caso de error, permitimos continuar
  }
};

/**
 * Registra una nueva review en localStorage
 */
export const recordReviewSubmission = (restaurantId: string): void => {
  try {
    // Obtener registros existentes o crear array vacío
    const storedRecordsJson = localStorage.getItem('yuppie_review_history');
    const storedRecords: ReviewRecord[] = storedRecordsJson
      ? JSON.parse(storedRecordsJson)
      : [];

    // Añadir nuevo registro
    const newRecord: ReviewRecord = {
      restaurantId,
      timestamp: Date.now(),
    };

    // Guardar registros actualizados
    localStorage.setItem(
      'yuppie_review_history',
      JSON.stringify([...storedRecords, newRecord])
    );
  } catch (error) {
    console.error('Error guardando registro de review:', error);
  }
};
