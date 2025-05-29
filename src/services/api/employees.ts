import type { Employee } from '@/types/employee';
import { apiClient } from '../api';

export async function getEmployeeByEid(
  employeeId: string,
  restaurantId: string
): Promise<Employee | null> {
  try {
    const url = `/employees?filters[eid][$eq]=${employeeId}&filters[restaurant][documentId][$eq]=${restaurantId}`;
    const { data: employeeData } = await apiClient.fetch<{ data: Employee[] }>(
      url
    );
    if (!employeeData || employeeData.length === 0) {
      return null;
    }
    return employeeData[0] as Employee;
  } catch (error) {
    console.error('Error en getEmployeeByEid:', error);
    return null;
  }
}

export async function incrementTapsForEmployee(employee: Employee) {
  try {
    const url = `/employees/${employee.documentId}`;
    const result = await apiClient.fetch<{ data: Employee }>(url, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          taps: ((employee.taps || 0) + 1).toString(),
        },
      }),
    });
    return result;
  } catch (error) {
    console.error('Error en incrementTaps:', error);
    return null;
  }
}
