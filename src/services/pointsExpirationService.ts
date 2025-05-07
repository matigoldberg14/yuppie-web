// src/services/pointsExpirationService.ts
import { API_CONFIG } from './api';
import { auth } from '../lib/firebase';

/**
 * Verifica los puntos que están por expirar o ya han expirado para el usuario actual
 * @returns Información sobre puntos expirados y por expirar
 */
export async function checkExpiringPoints(): Promise<{
  expiredPoints: number;
  soonToExpirePoints: number;
  nextExpirationDate: string | null;
}> {
  try {
    if (!auth?.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const idToken = await auth.currentUser.getIdToken();

    const response = await fetch(
      `${API_CONFIG.baseUrl}/points/expiration-check`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error verificando puntos por expirar');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en checkExpiringPoints:', error);
    return {
      expiredPoints: 0,
      soonToExpirePoints: 0,
      nextExpirationDate: null,
    };
  }
}

/**
 * Retorna la lista de transacciones que expirarán pronto (en los próximos 15 días)
 */
export async function getSoonToExpireTransactions(): Promise<any[]> {
  try {
    if (!auth?.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const idToken = await auth.currentUser.getIdToken();

    const response = await fetch(
      `${API_CONFIG.baseUrl}/points/soon-to-expire`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error obteniendo transacciones por expirar');
    }

    const data = await response.json();
    return data.transactions || [];
  } catch (error) {
    console.error('Error en getSoonToExpireTransactions:', error);
    return [];
  }
}

/**
 * Calcula la fecha de vencimiento a partir de una fecha de creación
 * (3 meses después de la fecha de creación)
 */
export function calculateExpirationDate(creationDate: Date): Date {
  const expirationDate = new Date(creationDate);
  expirationDate.setMonth(expirationDate.getMonth() + 3);
  return expirationDate;
}

/**
 * Formatea una fecha como string en formato local
 */
export function formatExpirationDate(date: Date | string): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Formatear la fecha en formato local (día/mes/año)
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
