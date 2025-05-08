// src/lib/security/tokenManager.ts
import { auth } from '../firebase';

class TokenManager {
  private static instance: TokenManager;
  private tokenRefreshTimer?: NodeJS.Timeout;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async getToken(): Promise<string | null> {
    try {
      const user = auth?.currentUser;
      if (!user) return null;
      return await user.getIdToken(true);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  startTokenRefresh() {
    // Refresh token every 30 minutes
    this.tokenRefreshTimer = setInterval(async () => {
      await this.getToken();
    }, 30 * 60 * 1000);
  }

  stopTokenRefresh() {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
    }
  }
}

export const tokenManager = TokenManager.getInstance();
