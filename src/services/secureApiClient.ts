// src/services/secureApiClient.ts

import { secureConfig } from '../config/env.config';
import { getAuth } from 'firebase/auth';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class SecureApiClient {
  private static instance: SecureApiClient;
  private token: string | null = null;
  private tokenExpiryTime: number = 0;

  private constructor() {}

  static getInstance(): SecureApiClient {
    if (!SecureApiClient.instance) {
      SecureApiClient.instance = new SecureApiClient();
    }
    return SecureApiClient.instance;
  }

  private async getAuthToken(): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new ApiError(401, 'No authenticated user');
    }

    if (this.token && Date.now() < this.tokenExpiryTime) {
      return this.token;
    }

    try {
      const token = await user.getIdToken(true);
      this.token = token;
      this.tokenExpiryTime = Date.now() + 55 * 60 * 1000; // 55 minutes
      return token;
    } catch (error) {
      throw new ApiError(401, 'Failed to get auth token');
    }
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      secureConfig.api.timeout
    );

    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${secureConfig.api.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          response.status,
          error.message || 'API request failed'
        );
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Secure methods for specific operations
  async verifyCoupon(
    couponCode: string,
    restaurantId: string
  ): Promise<boolean> {
    try {
      const response = await this.fetch<{ valid: boolean }>('/coupons/verify', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode, restaurantId }),
      });
      return response.valid;
    } catch (error) {
      console.error('Error verifying coupon:', error);
      return false;
    }
  }

  async createCoupon(restaurantId: string, discount: number): Promise<string> {
    const response = await this.fetch<{ code: string }>('/coupons/create', {
      method: 'POST',
      body: JSON.stringify({
        restaurantId,
        discount,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }),
    });
    return response.code;
  }
}

export const secureApiClient = SecureApiClient.getInstance();
