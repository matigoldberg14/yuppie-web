// src/lib/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
    user: null,
    loading: true,
    token: null,
  });

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setState({
          user,
          loading: false,
          token,
        });
      } else {
        setState({
          user: null,
          loading: false,
          token: null,
        });
      }
    });

    return () => unsubscribe?.();
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {state.loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Cargando...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
