// src/middleware/auth.ts
import { defineMiddleware } from 'astro/middleware';
import { auth } from '../lib/firebase';
import type { Auth } from 'firebase/auth';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/api/reviews',
  '/api/employees',
  '/api/metrics',
];

// Rate limiting para intentos de login
const loginAttempts = new Map<
  string,
  {
    count: number;
    timestamp: number;
  }
>();

const isProtectedRoute = (pathname: string) =>
  PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

export default defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // Si no es ruta protegida, continuar
  if (!isProtectedRoute(url.pathname)) {
    return next();
  }

  try {
    // Verificar autenticación
    const currentUser = (auth as Auth).currentUser;
    if (!currentUser) {
      const returnPath = encodeURIComponent(url.pathname);
      return Response.redirect(
        `${url.origin}/login?returnTo=${returnPath}`,
        302
      );
    }

    // Verificar token
    const token = await currentUser.getIdToken();
    if (!token) {
      throw new Error('Token no disponible');
    }

    // Verificar si el token está próximo a expirar (5 minutos)
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = decodedToken.exp * 1000;

    if (Date.now() + 5 * 60 * 1000 >= expirationTime) {
      // Token próximo a expirar, forzar refresh
      await currentUser.getIdToken(true);
    }

    // Almacenar información del usuario en context.locals
    context.locals.user = {
      uid: currentUser.uid,
      email: currentUser.email,
    };

    return next();
  } catch (error) {
    console.error('Error de autenticación:', error);

    // Registrar intento fallido
    const clientIP =
      context.request.headers.get('x-forwarded-for') || 'unknown';
    const attempt = loginAttempts.get(clientIP) || {
      count: 0,
      timestamp: Date.now(),
    };

    // Si han pasado más de 15 minutos, resetear contador
    if (Date.now() - attempt.timestamp > 15 * 60 * 1000) {
      attempt.count = 1;
      attempt.timestamp = Date.now();
    } else {
      attempt.count++;
    }

    loginAttempts.set(clientIP, attempt);

    // Si excede intentos, bloquear temporalmente
    if (attempt.count >= 5) {
      context.cookies.set(
        'auth_error',
        'Demasiados intentos. Por favor, espere 15 minutos.'
      );
      return Response.redirect(`${url.origin}/login`, 302);
    }

    // Redirección normal por fallo de autenticación
    const returnPath = encodeURIComponent(url.pathname);
    return Response.redirect(`${url.origin}/login?returnTo=${returnPath}`, 302);
  }
});
