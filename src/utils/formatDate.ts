// src/utils/formatDate.ts

/**
 * Convierte una fecha ISO a la zona horaria de Buenos Aires (America/Argentina/Buenos_Aires)
 * y la formatea incluyendo día, mes, año, hora, minutos y segundos.
 */
export const formatDateBuenosAires = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};
