// src/components/dashboard/AddEmployeeForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { X, Upload, User } from 'lucide-react';
import { toast } from 'sonner';

interface Schedule {
  id: string;
  documentId: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface AddEmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    position: string;
    photo: File | null;
    scheduleIds: string[];
  }) => void;
  restaurantId: string;
  initialData?: {
    firstName: string;
    lastName: string;
    position: string;
    photo?: {
      url: string;
      formats: {
        thumbnail: {
          url: string;
        };
      };
    };
    schedules: Array<{
      id: string;
      documentId: string;
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
}

export function AddEmployeeForm({
  isOpen,
  onClose,
  onSubmit,
  restaurantId,
  initialData,
}: AddEmployeeFormProps) {
  const [formState, setFormState] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    position: initialData?.position || '',
    photo: null as File | null,
    selectedSchedules:
      initialData?.schedules.map((s) => s.documentId) || ([] as string[]),
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialData?.photo
      ? `https://yuppieb-production.up.railway.app/${initialData.photo.formats.thumbnail.url}`
      : null
  );
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar horarios disponibles
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(
          'https://yuppieb-production.up.railway.app//api/schedules'
        );
        const data = await response.json();
        setAvailableSchedules(data.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast.error('No se pudieron cargar los horarios disponibles');
      }
    };

    if (isOpen) {
      fetchSchedules();
    }
  }, [isOpen]);

  // Efecto para actualizar el formulario cuando cambian los datos iniciales
  useEffect(() => {
    if (initialData) {
      setFormState({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        position: initialData.position,
        photo: null,
        selectedSchedules: initialData.schedules.map((s) => s.documentId),
      });
      if (initialData.photo) {
        setPhotoPreview(
          `https://yuppieb-production.up.railway.app/${initialData.photo.formats.thumbnail.url}`
        );
      }
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor seleccione una imagen válida');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }

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

  const handleScheduleToggle = (scheduleId: string) => {
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
      toast.error('Debe seleccionar al menos un horario');
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
      toast.success(
        initialData
          ? 'Empleado actualizado correctamente'
          : 'Empleado agregado correctamente',
        {
          description: 'Los cambios han sido guardados',
        }
      );
    } catch (error) {
      toast.error(
        initialData
          ? 'No se pudo actualizar el empleado'
          : 'No se pudo agregar el empleado',
        {
          description:
            error instanceof Error ? error.message : 'Error desconocido',
        }
      );
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
          <DialogTitle>
            {initialData ? 'Editar empleado' : 'Agregar nuevo miembro'}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center cursor-pointer hover:opacity-90"
              onClick={handlePhotoClick} // Cambiado aquí
            >
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={handlePhotoClick}
              className="text-sm text-white/60 hover:text-white flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Subir foto
            </Button>
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
                          schedule.documentId
                        )}
                        onChange={() =>
                          handleScheduleToggle(schedule.documentId)
                        }
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
            <Button type="submit">
              {initialData ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
