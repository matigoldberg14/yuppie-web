// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { login } from '../../lib/firebase';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Usar window.location para navegación
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Error de login:', err);
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      setLoading(false);
    }
  };
  return (
    <div className="bg-white/10 p-8 rounded-lg backdrop-blur-lg w-full max-w-md">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">
        Iniciar Sesión
      </h1>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-white/5 text-white border border-white/10"
            required
          />
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full p-3 rounded-lg bg-white/5 text-white border border-white/10"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}
