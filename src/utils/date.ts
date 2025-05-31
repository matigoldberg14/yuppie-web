/**
 * Formats a date string or Date object to Spanish locale format (DD/MM/YYYY)
 * @param date - The date to format (string or Date object)
 * @returns The formatted date string in DD/MM/YYYY format
 */
export function formatDateToSpanishLocale(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
