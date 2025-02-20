// /Users/Mati/Desktop/yuppie-web/src/utils/reviewLimiter.ts

interface ReviewRecord {
  restaurantId: string;
  date: string; // formato YYYY-MM-DD
}

export const hasSubmittedReviewToday = (restaurantId: string): boolean => {
  try {
    if (!restaurantId) {
      console.warn(
        '[WARN] Se llamó a hasSubmittedReviewToday con restaurantId vacío'
      );
      return false;
    }

    // Obtenemos la fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const storedRecordsJson = localStorage.getItem('yuppie_review_history');
    if (!storedRecordsJson) {
      console.log('[DEBUG] No hay registros previos');
      return false;
    }

    const storedRecords: ReviewRecord[] = JSON.parse(storedRecordsJson);
    console.log('[DEBUG] Registros en localStorage:', storedRecords);

    // Filtramos los registros para el día de hoy
    const todayRecords = storedRecords.filter(
      (record) => record.date === today
    );
    console.log('[DEBUG] Registros de hoy:', todayRecords);

    // Verificamos si hay alguna coincidencia exacta con el restaurantId
    const hasSentReview = todayRecords.some(
      (record) => record.restaurantId === restaurantId
    );

    console.log(
      `[DEBUG] ¿Ya enviaste review para restaurante ${restaurantId}?`,
      hasSentReview
    );
    return hasSentReview;
  } catch (error) {
    console.error('[ERROR] Error verificando historial:', error);
    return false;
  }
};

export const recordReviewSubmission = (restaurantId: string): void => {
  try {
    if (!restaurantId) {
      console.error('[ERROR] No se puede registrar un restaurantId vacío');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const storedRecordsJson = localStorage.getItem('yuppie_review_history');
    let storedRecords: ReviewRecord[] = storedRecordsJson
      ? JSON.parse(storedRecordsJson)
      : [];

    // Limpiamos registros antiguos (mantenemos solo registros de los últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    storedRecords = storedRecords.filter(
      (record) => record.date >= sevenDaysAgoStr
    );

    // Agregamos el nuevo registro
    const newRecord: ReviewRecord = {
      restaurantId,
      date: today,
    };

    storedRecords.push(newRecord);
    localStorage.setItem(
      'yuppie_review_history',
      JSON.stringify(storedRecords)
    );
    console.log('[DEBUG] Registro guardado:', newRecord);
    console.log('[DEBUG] Registros actualizados:', storedRecords);
  } catch (error) {
    console.error('[ERROR] Error guardando registro:', error);
  }
};
