// src/utils/exportData.ts
// Importamos xlsx aquí en lugar de asumir que está disponible globalmente
import * as XLSX from 'xlsx';

interface ExportOptions {
  filename: string;
  sheetName?: string;
}

/**
 * Función para exportar datos a Excel
 * @param data Array de datos a exportar
 * @param headers Array de encabezados
 * @param options Opciones adicionales
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  headers: Array<{ key: keyof T; label: string }>,
  options: ExportOptions
): void {
  try {
    // Crear un arreglo para la fila de encabezados
    const headerRow = headers.map((h) => h.label);

    // Crear arreglo de arreglos con los datos
    const rows = data.map((item) =>
      headers.map((header) => {
        const value = item[header.key];
        // Formatear los valores según sea necesario
        if (typeof value === 'number') {
          // Verificar si es un porcentaje
          if (
            header.key.toString().toLowerCase().includes('rate') ||
            header.key.toString().toLowerCase().includes('percent')
          ) {
            return `${value.toFixed(1)}%`;
          }
          // Si es un rating
          if (header.key.toString().toLowerCase().includes('rating')) {
            return value.toFixed(1);
          }
          // Número entero
          if (Number.isInteger(value)) {
            return value.toString();
          }
          // Número decimal genérico
          return value.toFixed(2);
        }
        // Si es una fecha - cambiamos esto para evitar problemas de tipado
        if (
          value &&
          typeof value === 'object' &&
          'toLocaleDateString' in value
        ) {
          return (value as Date).toLocaleDateString();
        }
        // Valores string o null/undefined
        return value?.toString() || '';
      })
    );

    // Combinar encabezados y filas
    const allRows = [headerRow, ...rows];

    // Crear libro y hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Configurar ancho de columnas automáticamente
    const colWidths = headerRow.map((header) => ({
      wch:
        Math.max(
          header.length,
          ...rows.map((row) => {
            const idx = headerRow.indexOf(header);
            return (row[idx]?.toString() || '').length;
          })
        ) + 2, // Añadir un poco de espacio extra
    }));

    ws['!cols'] = colWidths;

    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Datos');

    // Generar el archivo y descargarlo
    const filename = `${options.filename}.xlsx`;
    XLSX.writeFile(wb, filename);

    return;
  } catch (error) {
    console.error('Error exportando datos a Excel:', error);
    throw new Error('No se pudieron exportar los datos a Excel');
  }
}

/**
 * Función para exportar datos específicos del dashboard de restaurantes
 */
export function exportRestaurantComparison(
  restaurants: Array<{
    id: number;
    documentId: string;
    name: string;
    location?: { city?: string } | null;
  }>,
  metrics: Record<string, any>,
  selectedIds: number[]
): void {
  // Filtrar restaurantes seleccionados
  const selectedRestaurants = restaurants.filter((r) =>
    selectedIds.includes(r.id)
  );

  type ExportDataType = {
    name: string;
    location: string;
    totalReviews: number;
    averageRating: number;
    conversionRate: number;
    positivePercent: number;
    employeeCount: number;
    reviewsByDay: number;
    reviewsByWeek: number;
    reviewsByMonth: number;
  };

  // Preparar datos para exportar
  const exportData: ExportDataType[] = selectedRestaurants.map((restaurant) => {
    const metric = metrics[restaurant.documentId] || {};
    const location = restaurant.location?.city || getCiudad(restaurant.id);

    return {
      name: restaurant.name,
      location,
      totalReviews: metric.totalReviews || 0,
      averageRating: metric.averageRating || 0,
      conversionRate: metric.conversionRate || 0,
      positivePercent: metric.positiveReviewsPercent || 0,
      employeeCount: metric.employeeCount || 0,
      reviewsByDay: metric.reviewsByPeriod?.day || 0,
      reviewsByWeek: metric.reviewsByPeriod?.week || 0,
      reviewsByMonth: metric.reviewsByPeriod?.month || 0,
    };
  });

  // Definir cabeceras con el tipado correcto
  const headers: Array<{ key: keyof ExportDataType; label: string }> = [
    { key: 'name', label: 'Restaurante' },
    { key: 'location', label: 'Ubicación' },
    { key: 'totalReviews', label: 'Total Reseñas' },
    { key: 'averageRating', label: 'Rating Promedio' },
    { key: 'conversionRate', label: 'Tasa de Conversión' },
    { key: 'positivePercent', label: 'Reseñas Positivas' },
    { key: 'employeeCount', label: 'Número de Empleados' },
    { key: 'reviewsByDay', label: 'Reseñas (Día)' },
    { key: 'reviewsByWeek', label: 'Reseñas (Semana)' },
    { key: 'reviewsByMonth', label: 'Reseñas (Mes)' },
  ];

  // Exportar a Excel
  exportToExcel(exportData, headers, {
    filename: `comparativa_restaurantes_${new Date()
      .toLocaleDateString()
      .replace(/\//g, '-')}`,
    sheetName: 'Comparativa',
  });
}

// Función auxiliar getCiudad para compatibilidad con código existente
function getCiudad(restaurantId: number): string {
  const cities = ['CABA', 'CABA', 'CABA', 'CABA', 'CABA'];
  return cities[restaurantId % cities.length];
}
