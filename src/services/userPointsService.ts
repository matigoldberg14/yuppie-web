// src/services/userPointsService.ts
import { verifyOrCreateUser } from './userService'; // Añade esta importación
import { API_CONFIG } from './api';
import { auth } from '../lib/firebase';

export interface UserPoints {
  id: number;
  restaurant: {
    id: number;
    name: string;
    documentId: string;
  };
  points: number;
  level: string;
  streak: number;
  lastVisitDate: string;
  transactions: PointsTransaction[];
}

export interface PointsTransaction {
  id: number;
  amount: number;
  type: 'earned' | 'spent' | 'expired';
  source: string;
  description: string;
  createdAt: string;
  expiresAt: string;
}

// Obtener puntos del usuario para un restaurante específico o todos
export async function getUserPoints(
  restaurantId?: string
): Promise<UserPoints[]> {
  try {
    if (!auth?.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const idToken = await auth.currentUser.getIdToken();
    let endpoint = '/user-points';

    if (restaurantId) {
      endpoint += `?filters[restaurant][documentId][$eq]=${restaurantId}`;
    }

    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error obteniendo puntos');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error en getUserPoints:', error);
    return [];
  }
}

// Añadir puntos por una reseña
export async function addPointsForReview(
  restaurantId: string,
  rating: number,
  isGoogleReview: boolean = false,
  isImprovementPoints: boolean = false,
  isProcessComplete: boolean = false
): Promise<{ success: boolean; points?: number; message?: string }> {
  try {
    if (!auth?.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    // Verificar o crear el usuario en Strapi primero
    try {
      await verifyOrCreateUser();
    } catch (err) {
      console.error('Error verificando usuario antes de asignar puntos:', err);
      // Continuar de todos modos
    }

    const idToken = await auth.currentUser.getIdToken();

    // Calcular la fecha de expiración (3 meses después)
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setMonth(now.getMonth() + 3);

    console.log('=== INICIO addPointsForReview ===');
    console.log(
      'URL completa para añadir puntos:',
      `${API_CONFIG.baseUrl}/add-review-points`
    );
    console.log(
      'Datos que se envían:',
      JSON.stringify({
        restaurantId,
        rating,
        isGoogleReview,
        isImprovementPoints,
        isProcessComplete,
        expiresAt: expirationDate.toISOString(),
      })
    );

    console.log('Token (primeros 20 chars):', idToken.substring(0, 20) + '...');

    const response = await fetch(`${API_CONFIG.baseUrl}/add-review-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        restaurantId,
        rating,
        isGoogleReview,
        isImprovementPoints,
        isProcessComplete,
        expiresAt: expirationDate.toISOString(),
      }),
    });

    // Log completo de la respuesta
    console.log('Respuesta del servidor:', response.status);
    const result = await response.json();
    console.log('Datos de la respuesta:', result);

    if (!response.ok) {
      return {
        success: false,
        message: result.error?.message || 'Error al asignar puntos',
      };
    }

    return {
      success: true,
      points: result.pointsAwarded || 0,
      message: result.message || 'Puntos añadidos correctamente',
    };
    console.log('=== FIN addPointsForReview ===');
  } catch (error) {
    console.error('Error en addPointsForReview:', error);
    return {
      success: false,
      message: 'Error inesperado al asignar puntos',
    };
  }
}

// Verificar ticket y asignar puntos
export async function verifyTicket(
  ticketImage: File,
  restaurantId: string
): Promise<{ success: boolean; points?: number; message?: string }> {
  try {
    if (!auth?.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const idToken = await auth.currentUser.getIdToken();
    const formData = new FormData();
    formData.append('ticketImage', ticketImage);
    formData.append('restaurantId', restaurantId);

    const response = await fetch(`${API_CONFIG.baseUrl}/verify-ticket`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error?.message || 'Error al procesar el ticket',
      };
    }

    return {
      success: true,
      points: result.pointsAwarded,
      message: result.message || 'Ticket verificado correctamente',
    };
  } catch (error) {
    console.error('Error en verifyTicket:', error);
    return {
      success: false,
      message: 'Error inesperado al procesar el ticket',
    };
  }
}

// Obtener recompensas disponibles para un restaurante
export async function getAvailableRewards(
  restaurantId: string
): Promise<any[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/rewards?filters[restaurant][documentId][$eq]=${restaurantId}&filters[active][$eq]=true`
    );

    if (!response.ok) {
      throw new Error('Error obteniendo recompensas');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error en getAvailableRewards:', error);
    return [];
  }
}

// Canjear puntos por una recompensa
export async function redeemReward(
  rewardId: number
): Promise<{ success: boolean; message: string }> {
  try {
    if (!auth?.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const idToken = await auth.currentUser.getIdToken();

    const response = await fetch(`${API_CONFIG.baseUrl}/redeem-reward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ rewardId }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error?.message || 'Error al canjear recompensa',
      };
    }

    return {
      success: true,
      message: result.message || 'Recompensa canjeada correctamente',
    };
  } catch (error) {
    console.error('Error en redeemReward:', error);
    return {
      success: false,
      message: 'Error inesperado al canjear recompensa',
    };
  }
}
