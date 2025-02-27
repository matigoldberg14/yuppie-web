// /Users/Mati/Desktop/yuppie-web/src/utils/reviewLimiter.ts

interface ReviewRecord {
  restaurantId: string;
  date: string; // formato YYYY-MM-DD
}

// Clave única para almacenar el historial de reviews
const REVIEW_HISTORY_KEY = 'yuppie_review_history';

/**
 * Verifica si ya se ha enviado una review para este restaurante hoy
 */
export const hasSubmittedReviewToday = (restaurantId: string): boolean => {
  try {
    if (!restaurantId) {
      console.warn(
        '[WARN] Se llamó a hasSubmittedReviewToday con restaurantId vacío'
      );
      return false;
    }

    // Si estamos en la página de agradecimiento, no verificamos (ya enviamos)
    if (window.location.pathname === '/thanks') {
      console.log(
        '[INFO] En página de agradecimiento, no verificamos envíos previos'
      );
      return false;
    }

    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Verificar si existe historial de reviews
    const storedRecordsJson = localStorage.getItem(REVIEW_HISTORY_KEY);
    if (!storedRecordsJson) {
      console.log('[DEBUG] No hay registros previos de reviews');
      return false;
    }

    // Intentamos parsear los registros almacenados
    let storedRecords: ReviewRecord[] = [];
    try {
      storedRecords = JSON.parse(storedRecordsJson);

      // Validación para evitar errores con datos corruptos
      if (!Array.isArray(storedRecords)) {
        console.warn('[WARN] Formato inválido de registros, reiniciando');
        localStorage.removeItem(REVIEW_HISTORY_KEY);
        return false;
      }
    } catch (parseError) {
      console.error(
        '[ERROR] Error al parsear historial de reviews:',
        parseError
      );
      localStorage.removeItem(REVIEW_HISTORY_KEY);
      return false;
    }

    // Filtramos los registros para el día de hoy
    const todayRecords = storedRecords.filter(
      (record) => record.date === today
    );

    // Verificamos si hay alguna coincidencia exacta con el restaurantId
    const hasSentReview = todayRecords.some(
      (record) => record.restaurantId === restaurantId
    );

    console.log(
      `[INFO] ¿Ya enviaste review para restaurante ${restaurantId}? ${hasSentReview}`
    );
    return hasSentReview;
  } catch (error) {
    console.error('[ERROR] Error verificando historial:', error);
    return false; // En caso de error, permitimos enviar para no bloquear al usuario
  }
};

/**
 * Registra que se ha enviado una review para este restaurante hoy
 */
export const recordReviewSubmission = (restaurantId: string): void => {
  try {
    if (!restaurantId) {
      console.error('[ERROR] No se puede registrar un restaurantId vacío');
      return;
    }

    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Obtener el historial actual o iniciar uno nuevo
    const storedRecordsJson = localStorage.getItem(REVIEW_HISTORY_KEY);
    let storedRecords: ReviewRecord[] = [];

    if (storedRecordsJson) {
      try {
        const parsed = JSON.parse(storedRecordsJson);
        if (Array.isArray(parsed)) {
          storedRecords = parsed;
        } else {
          console.warn('[WARN] Formato inválido de historial, reiniciando');
        }
      } catch (parseError) {
        console.warn(
          '[WARN] Error al parsear historial existente, reiniciando'
        );
      }
    }

    // Limpiar registros antiguos (conservar solo últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    storedRecords = storedRecords.filter(
      (record) => record.date >= sevenDaysAgoStr
    );

    // Verificar si ya existe un registro para este restaurante hoy
    const existingIndex = storedRecords.findIndex(
      (record) => record.restaurantId === restaurantId && record.date === today
    );

    // Si ya existe, no agregamos un duplicado
    if (existingIndex === -1) {
      // Agregar el nuevo registro
      const newRecord: ReviewRecord = {
        restaurantId,
        date: today,
      };

      storedRecords.push(newRecord);
      console.log('[INFO] Nuevo registro de review guardado:', newRecord);
    } else {
      console.log('[INFO] Ya existe un registro para este restaurante hoy');
    }

    // Guardar el historial actualizado
    try {
      localStorage.setItem(REVIEW_HISTORY_KEY, JSON.stringify(storedRecords));
      console.log('[INFO] Historial de reviews actualizado correctamente');
    } catch (storageError) {
      console.error(
        '[ERROR] Error al guardar historial en localStorage:',
        storageError
      );

      // Intento de recuperación en caso de error de almacenamiento
      try {
        // Reducir el tamaño eliminando registros más antiguos
        const reducedRecords = storedRecords.slice(-10); // Mantener solo los 10 más recientes
        localStorage.setItem(
          REVIEW_HISTORY_KEY,
          JSON.stringify(reducedRecords)
        );
      } catch (retryError) {
        // Si aún falla, limpiar completamente
        localStorage.removeItem(REVIEW_HISTORY_KEY);
      }
    }

    // Actualizar flag para la página de agradecimiento
    localStorage.setItem('last_review_restaurant', restaurantId);
  } catch (error) {
    console.error('[ERROR] Error registrando submission:', error);
  }
};
