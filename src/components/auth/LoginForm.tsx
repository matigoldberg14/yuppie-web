// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!auth) {
        throw new Error('Firebase no está inicializado');
      }

      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Error en login:', err);
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-md p-8 card'>
      <h1 className='text-2xl font-bold text-white text-center mb-8'>
        Iniciar Sesión
      </h1>

      {error && (
        <div className='mb-6 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm'>
          {error}
        </div>
      )}

      <div className='space-y-6'>
        <div>
          <Input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Email'
            required
            className='w-full bg-white/5 border-white/10'
            disabled={loading}
          />
        </div>

        <div>
          <Input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Contraseña'
            required
            className='w-full bg-white/5 border-white/10'
            disabled={loading}
          />
        </div>

        <Button type='submit' disabled={loading} className='w-full'>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </div>
    </form>
  );
}
