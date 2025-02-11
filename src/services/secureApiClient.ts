// src/services/secureApiClient.ts
import { auth } from '../lib/firebase';
import type { Auth } from 'firebase/auth';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class SecureApiClient {
  private static instance: SecureApiClient;
  private baseUrl: string;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  private constructor() {
    this.baseUrl =
      import.meta.env.PUBLIC_API_URL ||
      'https://yuppieb-production.up.railway.app/api';
  }

  static getInstance(): SecureApiClient {
    if (!SecureApiClient.instance) {
      SecureApiClient.instance = new SecureApiClient();
    }
    return SecureApiClient.instance;
  }

  private async getToken(): Promise<string> {
    if (!auth) {
      throw new ApiError(401, 'Firebase no está inicializado');
    }

    const currentUser = (auth as Auth).currentUser;
    if (!currentUser) {
      throw new ApiError(401, 'No autenticado');
    }

    try {
      return await currentUser.getIdToken(true);
    } catch (error) {
      console.error('Error getting token:', error);
      throw new ApiError(401, 'Error obteniendo token');
    }
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(url, options);

      if (response.status === 502 && this.retryCount < this.maxRetries) {
        this.retryCount++;
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * this.retryCount)
        );
        return this.fetchWithRetry(url, options);
      }

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          response.status,
          error.error?.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      this.retryCount = 0;
      return data.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error de conexión');
    }
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const token = await this.getToken();

      return await this.fetchWithRetry(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error de conexión');
    }
  }

  // Métodos específicos con manejo de errores mejorado
  async getRestaurantByFirebaseUID(uid: string) {
    try {
      const data = await this.fetch(
        `/restaurants?filters[firebaseUID][$eq]=${uid}&populate=owner`
      );
      if (!data) throw new ApiError(404, 'Restaurante no encontrado');
      return data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  }

  async getRestaurantReviews(documentId: string) {
    try {
      const data = await this.fetch(
        `/reviews?filters[restaurant][documentId][$eq]=${documentId}&populate=*&sort[0]=createdAt:desc`
      );
      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  async updateReview(documentId: string, data: any) {
    return this.fetch(`/reviews/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }
}

export const secureApiClient = SecureApiClient.getInstance();
