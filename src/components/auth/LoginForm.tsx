// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

interface LoginFormProps {
  lang: SupportedLang;
}

export function LoginForm({ lang }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations(lang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!auth) {
        throw new Error(t('auth.firebaseNotInitialized'));
      }

      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = `/${lang}/dashboard`;
    } catch (err) {
      console.error('Error en login:', err);
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-md p-8 card'>
      <h1 className='text-2xl font-bold text-white text-center mb-8'>
        {t('auth.login')}
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
            placeholder={t('auth.email')}
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
            placeholder={t('auth.password')}
            required
            className='w-full bg-white/5 border-white/10'
            disabled={loading}
          />
        </div>

        <Button type='submit' disabled={loading} className='w-full'>
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </Button>
      </div>
    </form>
  );
}
