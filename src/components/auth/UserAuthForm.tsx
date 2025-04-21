// src/components/auth/UserAuthForm.tsx
import React, { useState } from 'react';
import { useUserAuth } from '../../lib/UserAuthContext';

export function UserAuthForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle, error } = useUserAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      // Error ya manejado en el contexto
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error ya manejado en el contexto
    }
  };

  return (
    <div className="w-full max-w-md p-6 card">
      <h2 className="text-xl font-bold text-white text-center mb-6">
        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-blue-900 font-medium rounded-lg transition-colors hover:bg-blue-100"
        >
          {loading
            ? 'Procesando...'
            : isLogin
            ? 'Iniciar sesión'
            : 'Crear cuenta'}
        </button>
      </form>

      <div className="my-4 flex items-center">
        <div className="flex-1 border-t border-white/10"></div>
        <p className="mx-4 text-white/60">o</p>
        <div className="flex-1 border-t border-white/10"></div>
      </div>

      <button
        onClick={handleGoogleAuth}
        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
            fill="#ffffff"
          />
        </svg>
        Continuar con Google
      </button>

      <p className="mt-4 text-center text-white/60">
        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="ml-2 text-white hover:underline"
        >
          {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
      </p>
    </div>
  );
}
