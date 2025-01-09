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

// Nueva interfaz para el formulario
export interface EmployeeFormInput {
  firstName: string;
  lastName: string;
  position: string;
  photo: File | null;
  scheduleIds: number[];
}
