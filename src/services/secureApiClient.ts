// src/services/secureApiClient.ts
import { auth } from '../lib/firebase';
import type { Restaurant, Review, ApiResponse } from '../types/api';
import { RestaurantSchema, ReviewSchema } from '../types/api';
import { z } from 'zod';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class SecureApiClient {
  private static instance: SecureApiClient;
  private baseUrl: string;
  private abortControllers: Map<string, AbortController>;

  private constructor() {
    this.baseUrl =
      import.meta.env.PUBLIC_API_URL ||
      'https://yuppieb-production.up.railway.app/api';
    this.abortControllers = new Map();
  }

  static getInstance(): SecureApiClient {
    if (!SecureApiClient.instance) {
      SecureApiClient.instance = new SecureApiClient();
    }
    return SecureApiClient.instance;
  }

  private async getHeaders(): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (!auth) {
      throw new ApiError(401, 'Firebase auth no está inicializado');
    }

    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private createAbortController(endpoint: string): AbortController {
    if (this.abortControllers.has(endpoint)) {
      this.abortControllers.get(endpoint)?.abort();
    }
    const controller = new AbortController();
    this.abortControllers.set(endpoint, controller);
    return controller;
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = this.createAbortController(endpoint);
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: { ...Object.fromEntries(headers), ...options.headers },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }

      const data = await response.json();
      return data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Error de conexión');
    } finally {
      clearTimeout(timeoutId);
      this.abortControllers.delete(endpoint);
    }
  }

  async getRestaurantByFirebaseUID(uid: string): Promise<Restaurant> {
    const data = await this.fetch<ApiResponse<Restaurant>>(
      `/restaurants?filters[firebaseUID][$eq]=${uid}&populate=owner`
    );
    return RestaurantSchema.parse(data);
  }

  async getRestaurantReviews(documentId: string): Promise<Review[]> {
    const data = await this.fetch<ApiResponse<Review[]>>(
      `/reviews?filters[restaurant][documentId][$eq]=${documentId}&populate=*&sort[0]=createdAt:desc`
    );
    return z.array(ReviewSchema).parse(data);
  }

  async updateReview(
    documentId: string,
    data: Partial<Review>
  ): Promise<Review> {
    const response = await this.fetch<ApiResponse<Review>>(
      `/reviews/${documentId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ data }),
      }
    );
    return ReviewSchema.parse(response);
  }
}

export const secureApiClient = SecureApiClient.getInstance();
