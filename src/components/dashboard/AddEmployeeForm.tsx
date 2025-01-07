// src/components/dashboard/AddEmployeeForm.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Dialog, DialogContent } from '../ui/dialog';
import { X, Upload, User, Plus, Trash } from 'lucide-react';
import { useToast } from '../ui/use-toast';

interface AddEmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    position: string;
    photo: File | null;
    scheduleIds: number[];
  }) => void;
  restaurantId: string;
}

interface Schedule {
  id: number;
  documentId: string;
  day: string;
  startTime: string;
  endTime: string;
}

export function AddEmployeeForm({
  isOpen,
  onClose,
  onSubmit,
  restaurantId,
}: AddEmployeeFormProps) {
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    position: '',
    photo: null as File | null,
    selectedSchedules: [] as number[],
  });
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Cargar horarios disponibles
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch('http://localhost:1337/api/schedules');
        const data = await response.json();
        setAvailableSchedules(data.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los horarios disponibles',
        });
      }
    };

    if (isOpen) {
      fetchSchedules();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormState((prev) => ({
        ...prev,
        photo: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScheduleToggle = (scheduleId: number) => {
    setFormState((prev) => ({
      ...prev,
      selectedSchedules: prev.selectedSchedules.includes(scheduleId)
        ? prev.selectedSchedules.filter((id) => id !== scheduleId)
        : [...prev.selectedSchedules, scheduleId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formState.selectedSchedules.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debe seleccionar al menos un horario',
      });
      return;
    }

    try {
      await onSubmit({
        firstName: formState.firstName,
        lastName: formState.lastName,
        position: formState.position,
        photo: formState.photo,
        scheduleIds: formState.selectedSchedules,
      });

      handleClose();
      toast({
        title: 'Éxito',
        description: 'Empleado agregado correctamente',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo agregar el empleado',
      });
    }
  };

  const handleClose = () => {
    setFormState({
      firstName: '',
      lastName: '',
      position: '',
      photo: null,
      selectedSchedules: [],
    });
    setPhotoPreview(null);
    onClose();
  };

  // Agrupar horarios por día
  const schedulesByDay = availableSchedules.reduce((acc, schedule) => {
    const day = schedule.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Agregar nuevo miembro</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <label className="cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="flex items-center gap-2 text-sm text-white/60 hover:text-white">
                <Upload className="w-4 h-4" />
                Subir foto
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <Input
              name="firstName"
              placeholder="Nombre"
              value={formState.firstName}
              onChange={handleInputChange}
              className="bg-gray-800 text-white border-gray-700"
              required
            />
            <Input
              name="lastName"
              placeholder="Apellido"
              value={formState.lastName}
              onChange={handleInputChange}
              className="bg-gray-800 text-white border-gray-700"
              required
            />
            <Input
              name="position"
              placeholder="Cargo"
              value={formState.position}
              onChange={handleInputChange}
              className="bg-gray-800 text-white border-gray-700"
              required
            />
          </div>

          {/* Schedules Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">
              Seleccionar horarios:
            </h3>
            {Object.entries(schedulesByDay).map(([day, schedules]) => (
              <div key={day} className="space-y-2">
                <h4 className="text-sm font-medium text-white/80 capitalize">
                  {day}
                </h4>
                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <label
                      key={schedule.id}
                      className="flex items-center p-3 rounded bg-gray-800 hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formState.selectedSchedules.includes(
                          schedule.id
                        )}
                        onChange={() => handleScheduleToggle(schedule.id)}
                        className="mr-3"
                      />
                      <span>
                        {schedule.startTime.slice(0, 5)} -{' '}
                        {schedule.endTime.slice(0, 5)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" onClick={handleClose} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
