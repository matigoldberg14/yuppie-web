// src/services/email.ts
import { API_CONFIG } from './api';

export async function sendCouponEmail(params: {
  email: string;
  discount: number;
  couponCode: string;
  restaurantName: string;
}) {
  const response = await fetch(`${API_CONFIG.baseUrl}/email/send-coupon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Error enviando email');
  }

  return response.json();
}
