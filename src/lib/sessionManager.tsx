// src/lib/sessionManager.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { auth } from './firebase';

// Implementación de securePersist utilizando localStorage para persistencia
const securePersist = {
  get(key: string) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
};

interface SessionData {
  userId: string;
  lastActivity: number;
  deviceId: string;
}

interface SessionContextType {
  isValidSession: boolean;
  endSession: () => Promise<void>;
}

interface SessionProviderProps {
  children: ReactNode;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export class SessionManager {
  private static _instance: SessionManager | null = null;

  public static getInstance(): SessionManager {
    if (!SessionManager._instance) {
      SessionManager._instance = new SessionManager();
    }
    return SessionManager._instance;
  }

  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
  private readonly SESSION_KEY = 'secure_session';
  private activityTimer?: number;

  private constructor() {
    this.setupActivityMonitoring();
  }

  private generateDeviceId(): string {
    return `${navigator.userAgent}-${screen.width}x${
      screen.height
    }-${new Date().getTime()}`;
  }

  private setupActivityMonitoring(): void {
    // Monitorear actividad del usuario
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach((event) => {
      window.addEventListener(event, () => this.updateLastActivity());
    });
    // Verificar sesión periódicamente
    setInterval(() => this.checkSession(), 60000);
  }

  async initSession(): Promise<void> {
    const user = auth?.currentUser;
    if (!user) return;

    const sessionData: SessionData = {
      userId: user.uid,
      lastActivity: Date.now(),
      deviceId: this.generateDeviceId(),
    };

    securePersist.set(this.SESSION_KEY, sessionData);
    this.startActivityTimer();
  }

  private startActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    this.activityTimer = window.setTimeout(() => {
      this.endSession();
    }, this.SESSION_TIMEOUT);
  }

  private updateLastActivity(): void {
    const session: SessionData | null = securePersist.get(this.SESSION_KEY);
    if (!session) return;

    session.lastActivity = Date.now();
    securePersist.set(this.SESSION_KEY, session);
    this.startActivityTimer();
  }

  private async checkSession(): Promise<void> {
    const session: SessionData | null = securePersist.get(this.SESSION_KEY);
    if (!session) return;

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;

    if (timeSinceLastActivity > this.SESSION_TIMEOUT) {
      await this.endSession();
    }
  }

  async endSession(): Promise<void> {
    try {
      await auth?.signOut();
      securePersist.remove(this.SESSION_KEY);
      if (this.activityTimer) {
        clearTimeout(this.activityTimer);
      }
      window.location.href = '/login';
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  isValidSession(): boolean {
    const session: SessionData | null = securePersist.get(this.SESSION_KEY);
    if (!session) return false;

    const currentDeviceId = this.generateDeviceId();
    const timeSinceLastActivity = Date.now() - session.lastActivity;

    return (
      session.userId === auth?.currentUser?.uid &&
      session.deviceId === currentDeviceId &&
      timeSinceLastActivity < this.SESSION_TIMEOUT
    );
  }
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const [isValidSession, setIsValidSession] = useState(false);
  const sessionManager = SessionManager.getInstance();

  useEffect(() => {
    const checkSession = () => {
      setIsValidSession(sessionManager.isValidSession());
    };

    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [sessionManager]);

  return (
    <SessionContext.Provider
      value={{
        isValidSession,
        endSession: () => sessionManager.endSession(),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
