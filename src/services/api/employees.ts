import { API_CONFIG } from '../api';
import type { Employee } from '@/types';
export async function findEmployeeById(
  employeeId: string,
  restaurantId: string
) {
  try {
    const url = `${API_CONFIG.baseUrl}/employees?filters[_id][$eq]=${employeeId}&filters[restaurant][documentId][$eq]=${restaurantId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Error obteniendo empleado');
    }

    const { data: employeeData } = await response.json();
    if (employeeData && employeeData.length > 0) {
      return employeeData[0] as Employee;
    }
    return null;
  } catch (error) {
    console.error('Error en findEmployeeById:', error);
    return null;
  }
}
