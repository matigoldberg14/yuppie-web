// src/middleware/auth.ts
import { defineMiddleware } from 'astro/middleware';
import { auth } from '../lib/firebase';
import type { Auth } from 'firebase/auth';
import { getAuth } from 'firebase-admin/auth';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/api/reviews',
  '/api/employees',
  '/api/metrics',
];

const isProtectedRoute = (url: string) =>
  PROTECTED_ROUTES.some((route) => url.includes(route));

const loginAttempts = new Map<
  string,
  {
    attempts: number;
    lastAttempt: number;
  }
>();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

export const authMiddleware = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  if (!isProtectedRoute(url.pathname)) {
    return next();
  }

  try {
    const clientIP =
      context.request.headers.get('x-forwarded-for') || 'unknown';
    const attemptInfo = loginAttempts.get(clientIP);

    if (attemptInfo) {
      const timeSinceLastAttempt = Date.now() - attemptInfo.lastAttempt;
      if (
        attemptInfo.attempts >= MAX_LOGIN_ATTEMPTS &&
        timeSinceLastAttempt < LOCKOUT_DURATION
      ) {
        context.cookies.set(
          'error',
          'Demasiados intentos fallidos. Por favor, espere unos minutos.'
        );
        return context.redirect('/login');
      }
      if (timeSinceLastAttempt >= LOCKOUT_DURATION) {
        loginAttempts.delete(clientIP);
      }
    }

    const currentUser = (auth as Auth).currentUser;
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const token = await currentUser.getIdToken();
    const decodedToken = await getAuth().verifyIdToken(token);

    if (Date.now() >= decodedToken.exp * 1000) {
      throw new Error('Sesión expirada');
    }

    // Limpiar intentos fallidos si la autenticación es exitosa
    loginAttempts.delete(clientIP);

    // Modificar el request con la información del usuario
    context.locals.user = {
      uid: currentUser.uid,
      email: currentUser.email,
    };

    return next();
  } catch (error) {
    console.error('Error de autenticación:', error);

    const clientIP =
      context.request.headers.get('x-forwarded-for') || 'unknown';
    const currentAttempts = loginAttempts.get(clientIP);

    loginAttempts.set(clientIP, {
      attempts: (currentAttempts?.attempts || 0) + 1,
      lastAttempt: Date.now(),
    });

    // Guardar la URL actual para redireccionar después del login
    const returnPath = encodeURIComponent(url.pathname);
    return context.redirect(`/login?returnTo=${returnPath}`);
  }
});
