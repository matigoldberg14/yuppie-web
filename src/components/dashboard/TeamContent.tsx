// src/components/dashboard/TeamContent.tsx

import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import {
  getRestaurantByFirebaseUID,
  getEmployeesByRestaurant,
  createEmployee,
} from '../../services/api';
import { Plus, User } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { AddEmployeeForm } from './AddEmployeeForm';

// En TeamContent.tsx, actualiza la interfaz Employee
interface Schedule {
  id: number;
  documentId: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface Employee {
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

export function TeamContent() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!auth?.currentUser?.uid) {
          console.log('No hay usuario autenticado');
          return;
        }

        const restaurantData = await getRestaurantByFirebaseUID(
          auth.currentUser.uid
        );

        if (!restaurantData) {
          throw new Error('No se encontró el restaurante');
        }

        setRestaurantId(restaurantData.documentId);

        const employeesData = await getEmployeesByRestaurant(
          restaurantData.documentId
        );
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAddEmployee = async (data: {
    firstName: string;
    lastName: string;
    position: string;
    photo: File | null;
    scheduleIds: number[];
  }) => {
    try {
      if (!restaurantId) throw new Error('No restaurant ID');

      await createEmployee({
        ...data,
        restaurantId,
      });

      // Vuelve a cargar la lista de empleados
      const updatedEmployees = await getEmployeesByRestaurant(restaurantId);
      setEmployees(updatedEmployees);
      setIsAddingEmployee(false);
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-white">Cargando equipo...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Equipo</h1>
        <Button
          onClick={() => setIsAddingEmployee(true)}
          className="bg-white text-black hover:bg-white/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar miembro
        </Button>
      </div>

      {/* Lista de Empleados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <Card key={employee.documentId} className="bg-white/10 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  {employee.photo ? (
                    <img
                      src={`http://localhost:1337${employee.photo.formats.thumbnail.url}`}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-sm text-white/60">{employee.position}</p>
                </div>
              </div>

              {/* Horarios */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-white mb-2">
                  Horarios:
                </h4>
                <div className="space-y-1">
                  {employee.schedules.map((schedule) => (
                    <div
                      key={schedule.documentId}
                      className="text-sm text-white/60"
                    >
                      {schedule.day.charAt(0).toUpperCase() +
                        schedule.day.slice(1)}
                      : {schedule.startTime.slice(0, 5)} -{' '}
                      {schedule.endTime.slice(0, 5)}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulario para agregar empleado */}
      {restaurantId && (
        <AddEmployeeForm
          isOpen={isAddingEmployee}
          onClose={() => setIsAddingEmployee(false)}
          onSubmit={handleAddEmployee}
          restaurantId={restaurantId}
        />
      )}
    </div>
  );
}
