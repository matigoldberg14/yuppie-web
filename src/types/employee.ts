// src/types/employee.ts
export interface Schedule {
  id: number;
  documentId: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface Employee {
  id: number;
  documentId: string;
  eid: string;
  firstName: string;
  lastName: string;
  position: string;
  active: boolean;
  photo?: {
    url: string;
    formats: {
      thumbnail: {
        url: string;
      };
    };
  };
  schedules: Schedule[];
}

// Nueva interfaz para el formulario!
export interface EmployeeFormInput {
  firstName: string;
  lastName: string;
  position: string;
  photo: File | null;
  scheduleIds: number[];
}

interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  position: string;
  photo: File | null;
  scheduleIds: string[]; // aquí son strings
  restaurantId: string;
}

// src/types/employee.ts

// Tipo para horarios de empleados
export interface EmployeeSchedule {
  id: number | string;
  documentId: string;
  day:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';
  startTime: string;
  endTime: string;
}

// Tipo para foto de empleado
export interface EmployeePhoto {
  url: string;
  formats: {
    thumbnail: {
      url: string;
    };
  };
}

// Tipo para el formulario de creación/edición de empleados
export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  position: string;
  photo?: File | null;
  schedules: {
    id?: string;
    day: string;
    startTime: string;
    endTime: string;
  }[];
}
