// src/utils/csrf.ts
export class CSRFProtection {
  private static instance: CSRFProtection;
  private token: string | null = null;

  private constructor() {
    this.generateToken();
  }

  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  private generateToken(): void {
    // Generar token aleatorio
    const random = new Uint8Array(32);
    crypto.getRandomValues(random);
    this.token = btoa(String.fromCharCode(...random));

    // Almacenar en cookie segura
    document.cookie = `XSRF-TOKEN=${this.token}; Secure; SameSite=Strict; Path=/`;
  }

  getToken(): string {
    if (!this.token) {
      this.generateToken();
    }
    return this.token!;
  }

  // Añadir token a las peticiones
  addTokenToHeaders(headers: Headers): Headers {
    headers.append('X-XSRF-TOKEN', this.getToken());
    return headers;
  }

  // Validar token en respuestas
  validateResponse(response: Response): boolean {
    const serverToken = response.headers.get('X-XSRF-TOKEN');
    return serverToken === this.token;
  }
}

// Ejemplo de uso en servicios API
export const apiClient = {
  fetch: async (url: string, options: RequestInit = {}) => {
    const csrf = CSRFProtection.getInstance();
    const headers = new Headers(options.headers);
    csrf.addTokenToHeaders(headers);

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Importante para CSRF
    });

    if (!csrf.validateResponse(response)) {
      throw new Error('CSRF token validation failed');
    }

    return response;
  },
};
