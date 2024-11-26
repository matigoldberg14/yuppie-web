// src/components/auth/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import { userStore } from '../../stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, isAdmin } = useStore(userStore);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (requireAdmin && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, requireAdmin, navigate]);

  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
