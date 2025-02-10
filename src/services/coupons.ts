// src/services/coupons.ts
import { API_CONFIG } from './api';
import * as crypto from 'crypto';

interface Coupon {
  id: string;
  code: string;
  restaurantId: string;
  reviewId: string;
  discount: number;
  expiresAt: Date;
  usedAt?: Date;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
}

export async function generateCoupon(
  reviewId: string,
  restaurantId: string,
  discount: number
): Promise<Coupon | null> {
  try {
    // Verificar token de autenticación
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No autorizado');

    // Generar código seguro
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();

    const response = await fetch(`${API_CONFIG.baseUrl}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          code,
          restaurantId,
          reviewId,
          discount,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          maxUses: 1,
          currentUses: 0,
          isActive: true,
        },
      }),
    });

    if (!response.ok) throw new Error('Error generando cupón');
    return await response.json();
  } catch (error) {
    console.error('Error en generateCoupon:', error);
    return null;
  }
}

export async function verifyCoupon(
  code: string,
  restaurantId: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/coupons/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        restaurantId,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
