// src/utils/reviewLimiter.ts

// Añadir la interfaz faltante
interface ReviewRecord {
  restaurantId: string;
  timestamp: number;
}

export const hasSubmittedReviewToday = (restaurantId: string): boolean => {
  try {
    console.log(`[DEBUG] Verificando restaurantId: ${restaurantId}`);

    const storedRecordsJson = localStorage.getItem('yuppie_review_history');
    console.log(`[DEBUG] Datos en localStorage: ${storedRecordsJson}`);

    if (!storedRecordsJson) {
      console.log('[DEBUG] No hay registros previos');
      return false;
    }

    const storedRecords: ReviewRecord[] = JSON.parse(storedRecordsJson);
    console.log(`[DEBUG] Registros parseados:`, storedRecords);

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    console.log(`[DEBUG] Tiempo límite: ${new Date(oneDayAgo).toISOString()}`);

    const validRecords = storedRecords.filter(
      (record) => record.timestamp > oneDayAgo
    );
    console.log(`[DEBUG] Registros válidos:`, validRecords);

    const hasSentReview = validRecords.some(
      (record) => record.restaurantId === restaurantId
    );
    console.log(`[DEBUG] ¿Ha enviado review? ${hasSentReview}`);

    localStorage.setItem('yuppie_review_history', JSON.stringify(validRecords));
    return hasSentReview;
  } catch (error) {
    console.error('[ERROR] Error verificando historial:', error);
    return false;
  }
};

export const recordReviewSubmission = (restaurantId: string): void => {
  try {
    console.log(
      `[DEBUG] Registrando submission para restaurante: ${restaurantId}`
    );

    const storedRecordsJson = localStorage.getItem('yuppie_review_history');
    const storedRecords: ReviewRecord[] = storedRecordsJson
      ? JSON.parse(storedRecordsJson)
      : [];

    console.log(`[DEBUG] Registros actuales:`, storedRecords);

    const newRecord: ReviewRecord = {
      restaurantId,
      timestamp: Date.now(),
    };

    const updatedRecords = [...storedRecords, newRecord];
    localStorage.setItem(
      'yuppie_review_history',
      JSON.stringify(updatedRecords)
    );

    console.log(`[DEBUG] Registros actualizados:`, updatedRecords);
  } catch (error) {
    console.error('[ERROR] Error guardando registro:', error);
  }
};
