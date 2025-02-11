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

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const token = await this.getToken();

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
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
          error.error?.message || 'Error en la petición'
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión');
    }
  }

  // Métodos específicos
  async getRestaurantByFirebaseUID(uid: string) {
    return this.fetch(
      `/restaurants?filters[firebaseUID][$eq]=${uid}&populate=owner`
    );
  }

  async getRestaurantReviews(documentId: string) {
    return this.fetch(
      `/reviews?filters[restaurant][documentId][$eq]=${documentId}&populate=*&sort[0]=createdAt:desc`
    );
  }

  async updateReview(documentId: string, data: any) {
    return this.fetch(`/reviews/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }
}

export const secureApiClient = SecureApiClient.getInstance();
