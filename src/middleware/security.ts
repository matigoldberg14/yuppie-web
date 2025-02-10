// src/middleware/security.ts

import { rateLimit } from 'express-rate-limit';
import { getAuth } from 'firebase-admin/auth';
import helmet from 'helmet';
import cors from 'cors';
import { secureConfig } from '../config/env.config';

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: secureConfig.api.rateLimit,
  message: 'Demasiadas peticiones desde esta IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de autenticación
export const authenticateRequest = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Verificación de propiedad del restaurante
export const verifyRestaurantOwnership = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user.uid;

    const response = await fetch(
      `${process.env.PUBLIC_API_URL}/restaurants?filters[firebaseUID][$eq]=${userId}&filters[id][$eq]=${restaurantId}`
    );

    if (!response.ok) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    next();
  } catch (error) {
    console.error('Error de verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Headers de seguridad
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.PUBLIC_API_URL || ''],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

// Configuración de CORS
export const corsOptions: cors.CorsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? ([process.env.FRONTEND_URL].filter(Boolean) as string[])
      : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
};
