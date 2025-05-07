// src/lib/UserAuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

interface UserAuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  error: null,
});

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth
      ? onAuthStateChanged(auth, (currentUser) => {
          console.log(
            'UserAuthContext: Estado de autenticación cambió',
            currentUser?.email
          );
          setUser(currentUser);
          setLoading(false);
        })
      : () => {};

    return () => unsubscribe();
  }, []);

  // Efecto para manejar la redirección después del inicio de sesión
  useEffect(() => {
    // Verificar si hay una URL de retorno en localStorage cuando el usuario inicia sesión
    if (user && !loading) {
      const returnUrl = localStorage.getItem('auth_return_url');
      if (returnUrl) {
        console.log('Redirigiendo después de autenticación a:', returnUrl);
        localStorage.removeItem('auth_return_url');
        window.location.href = returnUrl;
      }
    }
  }, [user, loading]);

  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    try {
      if (!auth) throw new Error('Firebase no está inicializado');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      // Usar any para evitar problemas de tipado
      console.error('Error al iniciar sesión:', err);
      setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      throw err;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    setError(null);
    try {
      if (!auth) throw new Error('Firebase no está inicializado');
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      // Usar any para evitar problemas de tipado
      console.error('Error al registrar usuario:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está en uso. Intenta iniciar sesión.');
      } else {
        setError('No se pudo crear la cuenta. Intenta con otro email.');
      }
      throw err;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    console.log('A. Inicio de loginWithGoogle en contexto');
    setError(null);
    try {
      console.log('B. Verificando si auth está disponible en contexto...');
      if (!auth) {
        console.error('C. ERROR: Firebase no está inicializado en contexto');
        throw new Error('Firebase no está inicializado');
      }
      console.log('C. Auth está disponible en contexto:', !!auth);

      console.log('D. Creando proveedor de Google...');
      const provider = new GoogleAuthProvider();
      console.log('E. Configurando parámetros del proveedor...');
      // Forzar selección de cuenta
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      console.log('F. Iniciando signInWithPopup...');
      try {
        const result = await signInWithPopup(auth, provider);
        console.log(
          'G. signInWithPopup completado exitosamente',
          result.user?.email
        );
      } catch (popupError) {
        console.error('G. ERROR en signInWithPopup:', popupError);
        // Usar tipado seguro para acceder a propiedades
        const firebaseError = popupError as {
          code?: string;
          message?: string;
          stack?: string;
        };
        console.error('Código de error:', firebaseError.code);
        console.error('Mensaje de error:', firebaseError.message);
        console.error('Stack trace:', firebaseError.stack);
        throw popupError;
      }

      console.log('H. Login con Google completado exitosamente en contexto');
    } catch (err) {
      console.error('ERROR GENERAL en loginWithGoogle del contexto:', err);
      // Evitar JSON.stringify que puede causar errores circulares
      if (err instanceof Error) {
        console.error('Error message:', err.message);
      }
      setError('Error al iniciar sesión con Google. Intenta nuevamente.');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (!auth) throw new Error('Firebase no está inicializado');
      await signOut(auth);
    } catch (err: any) {
      // Usar any para evitar problemas de tipado
      console.error('Error al cerrar sesión:', err);
      setError('Error al cerrar sesión');
      throw err;
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        error,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export const useUserAuth = () => useContext(UserAuthContext);
