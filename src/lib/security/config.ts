// src/lib/security/config.ts
import { API_CONFIG } from '../../services/api';

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 100,
  WINDOW_MS: 60000, // 1 minute
  BLOCK_DURATION: 3600000, // 1 hour
};

// Security headers
export const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `connect-src 'self' ${API_CONFIG.baseUrl} https://identitytoolkit.googleapis.com https://*.firebaseapp.com`,
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
