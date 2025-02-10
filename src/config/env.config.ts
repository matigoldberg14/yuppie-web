// src/config/env.config.ts

import { z } from 'zod';

const envSchema = z.object({
  PUBLIC_API_URL: z.string().url(),
  FIREBASE_API_KEY: z.string().min(1),
  FIREBASE_AUTH_DOMAIN: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  EMAILJS_SERVICE_ID: z.string().min(1),
  EMAILJS_TEMPLATE_ID: z.string().min(1),
  EMAILJS_USER_ID: z.string().min(1),
  API_RATE_LIMIT: z.string().transform(Number).default('100'),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().optional(),
});

// Validate environment variables at startup
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment configuration:', error);
    process.exit(1);
  }
};

export const env = validateEnv();

// Secure configuration object
export const secureConfig = {
  api: {
    baseUrl: env.PUBLIC_API_URL,
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    rateLimit: env.API_RATE_LIMIT,
  },
  auth: {
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
  security: {
    bcryptRounds: 12,
    jwtExpiresIn: '1h',
    refreshTokenExpiresIn: '7d',
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
};
