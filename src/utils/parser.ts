// TODO: Refactorizar y rechequear

/**
 * Normaliza el nombre del restaurante para que sea compatible con la URL
 * @param name Nombre del restaurante
 * @returns Nombre del restaurante en formato de URL
 */
export function normalizeRestaurantName(name: string): string {
  return name
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\-]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Genera una URL amigable para un restaurante
 * @param restaurantName Nombre del restaurante
 * @param options Opciones adicionales (empleado, acción)
 * @returns URL amigable
 */
export function getFriendlyUrl(
  restaurantName: string,
  options?: {
    employeeId?: number;
    action?: 'rating' | 'improvement' | 'comment';
  }
): string {
  // Si no hay nombre de restaurante, devolver URL vacía
  if (!restaurantName) return '';

  // Convertir nombre a formato de URL
  const slug = normalizeRestaurantName(restaurantName);
  let url = `/${slug}`;

  // Añadir parámetros si existen
  const params = new URLSearchParams();

  if (options?.employeeId) {
    params.append('e', options.employeeId.toString());
  }

  if (options?.action && options.action !== 'rating') {
    params.append('a', options.action);
  }

  // Añadir query string si hay parámetros
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
}
