// Crear este componente en src/components/auth/GoogleAuthButton.tsx
import React, { useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  label?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  label = 'Continuar con Google',
}) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    console.log('GoogleAuthButton: Inicio del proceso de login');

    if (loading) {
      console.log(
        'GoogleAuthButton: Ya hay un proceso de login en curso, ignorando clic'
      );
      return;
    }

    setLoading(true);

    try {
      console.log('GoogleAuthButton: Verificando disponibilidad de auth');
      if (!auth) {
        throw new Error('Firebase no está inicializado');
      }

      console.log('GoogleAuthButton: Creando provider de Google');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      // Guardar URL de retorno antes de iniciar el popup
      const currentUrl = window.location.href;
      localStorage.setItem('auth_return_url', currentUrl);

      console.log('GoogleAuthButton: Llamando a signInWithPopup');
      const result = await signInWithPopup(auth, provider);
      console.log('GoogleAuthButton: Login exitoso', result.user?.email);

      if (result.user) {
        try {
          // Importar y llamar a la función
          const { verifyOrCreateUser } = await import(
            '../../services/userService'
          );
          await verifyOrCreateUser();
          console.log('Usuario verificado en Strapi después del login');
        } catch (verifyError) {
          console.error('Error al verificar usuario en Strapi:', verifyError);
          // No bloquear el flujo si falla
        }
      }
      if (onSuccess) {
        console.log('GoogleAuthButton: Llamando callback de éxito');
        onSuccess();
        // Guardar un flag en localStorage para saber que acabamos de autenticar
        localStorage.setItem('just_authenticated', 'true');
        localStorage.setItem('auth_user_email', result.user?.email || '');
        window.location.href = window.location.href;
      }

      // FORZAR RECARGA DE LA PÁGINA DESPUÉS DE LOGIN EXITOSO
      console.log('GoogleAuthButton: Recargando página para aplicar sesión...');
      window.location.reload();
    } catch (error) {
      // Resto del código de manejo de errores...
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded flex items-center justify-center"
      type="button"
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Procesando...
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
};
