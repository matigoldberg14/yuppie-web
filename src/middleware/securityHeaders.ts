// src/middleware/securityHeaders.ts
export const securityHeaders = {
  // Prevenir XSS
  'X-XSS-Protection': '1; mode=block',

  // Prevenir Clickjacking
  'X-Frame-Options': 'DENY',

  // Prevenir MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Control de política de contenido
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `connect-src 'self' ${
      import.meta.env.PUBLIC_API_URL
    } https://identitytoolkit.googleapis.com`,
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Habilitar HSTS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // Feature Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
