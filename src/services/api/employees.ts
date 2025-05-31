import type { Employee } from '@/types/employee';

export async function getEmployeeByEid(
  employeeId: string,
  restaurantId: string
): Promise<Employee | null> {
  try {
    const url = `${
      import.meta.env.PUBLIC_API_URL
    }/employees?filters[eid][$eq]=${employeeId}&filters[restaurant][documentId][$eq]=${restaurantId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Error al obtener el empleado');
    }
    const { data: employeeData } = await response.json();
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
    const url = `${import.meta.env.PUBLIC_API_URL}/employees/${
      employee.documentId
    }`;

    const updateResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          taps: ((employee.taps || 0) + 1).toString(),
        },
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Error al actualizar los taps del empleado');
    }

    return await updateResponse.json();
  } catch (error) {
    console.error('Error en incrementTaps:', error);
    return null;
  }
}

export async function getEmployeesByRestaurant(restaurantId: string) {
  try {
    const url = `${
      import.meta.env.PUBLIC_API_URL
    }/employees?filters[restaurant][documentId][$eq]=${restaurantId}&populate=*`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Error fetching employees');
    }

    const { data: employeesData } = await response.json();

    if (!employeesData || employeesData.length === 0) {
      return [];
    }

    return employeesData as Employee[];
  } catch (error) {
    console.error('Error in getEmployeesByRestaurant:', error);
    return [];
  }
}
