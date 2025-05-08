// src/lib/security/validation.ts
export const sanitizeInput = (input: string, maxLength = 500): string => {
  if (!input) return '';

  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s-.,!?@]/g, '') // Allow only safe characters
    .trim()
    .slice(0, maxLength);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validateFileUpload = (file: File): boolean => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  return file.size <= MAX_SIZE && ALLOWED_TYPES.includes(file.type);
};
