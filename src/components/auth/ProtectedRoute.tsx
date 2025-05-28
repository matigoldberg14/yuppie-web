// src/components/auth/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!auth) {
      window.location.href = '/login';
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = '/login';
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => unsubscribe();
  }, []);

  return isAuthenticated ? <>{children}</> : null;
}
