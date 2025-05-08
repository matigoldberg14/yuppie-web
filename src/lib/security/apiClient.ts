// src/lib/security/apiClient.ts
import { API_CONFIG } from '../../services/api';
import { tokenManager } from './tokenManager';
import { rateLimiter } from './rateLimit';

class SecureAPIClient {
  private static instance: SecureAPIClient;

  private constructor() {}

  static getInstance(): SecureAPIClient {
    if (!SecureAPIClient.instance) {
      SecureAPIClient.instance = new SecureAPIClient();
    }
    return SecureAPIClient.instance;
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const clientIP = await this.getClientIP();

    if (!rateLimiter.checkLimit(clientIP)) {
      throw new Error('Rate limit exceeded');
    }

    const token = await tokenManager.getToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API Error');
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async getClientIP(): Promise<string> {
    // Implementar obtención de IP del cliente de forma segura
    return 'client-ip';
  }
}

export const secureAPIClient = SecureAPIClient.getInstance();
