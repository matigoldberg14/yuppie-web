// src/components/auth/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  lang: SupportedLang;
}

export function ProtectedRoute({ children, lang }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations(lang);

  useEffect(() => {
    if (!auth) {
      window.location.href = `/${lang}/login`;
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = `/${lang}/login`;
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [lang]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-white text-xl'>{t('auth.verifying')}</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
