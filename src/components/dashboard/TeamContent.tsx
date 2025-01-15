// src/components/dashboard/TeamContent.tsx

import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import {
  getRestaurantByFirebaseUID,
  getEmployeesByRestaurant,
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from '../../services/api';
import { Plus, User, Trash, Edit2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { AddEmployeeForm } from './AddEmployeeForm';
import { useToast } from '../ui/use-toast';

interface Schedule {
  id: string;
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
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { toast } = useToast();

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
    scheduleIds: string[];
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

      toast({
        title: 'Éxito',
        description: 'Empleado agregado correctamente',
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo agregar el empleado',
      });
      throw error;
    }
  };

  const handleEditEmployee = async (data: {
    firstName: string;
    lastName: string;
    position: string;
    photo: File | null;
    scheduleIds: string[];
  }) => {
    try {
      if (!editingEmployee) return;

      await updateEmployee(editingEmployee.documentId, {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        scheduleIds: data.scheduleIds,
        photo: data.photo,
      });

      // Actualizar la lista de empleados
      if (restaurantId) {
        const updatedEmployees = await getEmployeesByRestaurant(restaurantId);
        setEmployees(updatedEmployees);
      }

      setEditingEmployee(null);
      toast({
        title: 'Éxito',
        description: 'Empleado actualizado correctamente',
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el empleado',
      });
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      return;
    }

    try {
      await deleteEmployee(employeeId);

      // Actualizar la lista de empleados después de eliminar
      setEmployees(employees.filter((emp) => emp.documentId !== employeeId));

      toast({
        title: 'Éxito',
        description: 'Empleado eliminado correctamente',
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el empleado',
      });
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
              <div className="flex items-center justify-between">
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
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingEmployee(employee)}
                    className="text-blue-400 hover:text-blue-500 hover:bg-blue-400/10"
                  >
                    <Edit2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEmployee(employee.documentId)}
                    className="text-red-400 hover:text-red-500 hover:bg-red-400/10"
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
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

      {/* Formulario para agregar/editar empleado */}
      {restaurantId && (
        <AddEmployeeForm
          isOpen={isAddingEmployee || !!editingEmployee}
          onClose={() => {
            setIsAddingEmployee(false);
            setEditingEmployee(null);
          }}
          onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
          restaurantId={restaurantId}
          initialData={editingEmployee || undefined}
        />
      )}
    </div>
  );
}
