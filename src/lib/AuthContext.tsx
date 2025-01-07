// src/lib/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Suscribirse a los cambios de autenticación
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      console.log('Estado de auth actualizado:', user?.email);
      setState({
        user,
        loading: false,
      });
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
