// src/utils/validation.ts
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidComment = (comment: string): boolean => {
  return comment.trim().length >= 10; // Mínimo 10 caracteres
};

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateReviewData = ({
  email,
  comment,
  typeImprovement,
  calification,
}: {
  email: string;
  comment: string;
  typeImprovement: string | null; // Cambiar de undefined a null
  calification: number;
}) => {
  const errors: string[] = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Por favor, ingresa un email válido');
  }

  if (!comment || !isValidComment(comment)) {
    errors.push('El comentario debe tener al menos 10 caracteres');
  }

  if (calification < 1 || calification > 5) {
    errors.push('La calificación debe estar entre 1 y 5');
  }

  if (calification < 5 && !typeImprovement) {
    errors.push('Por favor, selecciona qué podemos mejorar');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('\n'));
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
