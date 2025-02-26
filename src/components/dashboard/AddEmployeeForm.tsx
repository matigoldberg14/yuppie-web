// /Users/Mati/Desktop/yuppie-web/src/components/dashboard/AddEmployeeForm.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, Upload, X, Plus, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../ui/use-toast';

// Nuevo tipo para los horarios
interface WorkSchedule {
  id?: string; // Para compatibilidad con edición
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
    schedules: WorkSchedule[]; // Cambiado de scheduleIds a schedules
  }) => void;
  restaurantId: string;
  initialData?: {
    documentId: string;
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
    schedules: WorkSchedule[];
  };
}

export function AddEmployeeForm({
  isOpen,
  onClose,
  onSubmit,
  restaurantId,
  initialData,
}: AddEmployeeFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const { toast } = useToast();

  // Días de la semana para el selector
  const weekdays = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' },
  ];

  // Cargar datos iniciales si estamos editando
  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName || '');
      setLastName(initialData.lastName || '');
      setPosition(initialData.position || '');

      if (initialData.photo?.url) {
        setPhotoPreview(
          `${import.meta.env.PUBLIC_API_URL}${
            initialData.photo.formats.thumbnail.url
          }`
        );
      }

      if (initialData.schedules && initialData.schedules.length > 0) {
        setSchedules(initialData.schedules);
      } else {
        // Inicializar con horario por defecto
        setSchedules([{ day: 'monday', startTime: '09:00', endTime: '17:00' }]);
      }
    } else {
      // Reset form al abrir nuevo
      setFirstName('');
      setLastName('');
      setPosition('');
      setPhoto(null);
      setPhotoPreview(null);
      // Inicializar con horario por defecto
      setSchedules([{ day: 'monday', startTime: '09:00', endTime: '17:00' }]);
    }
  }, [initialData, isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPhoto(selectedFile);

      // Mostrar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  // Añadir un nuevo horario
  const addSchedule = () => {
    setSchedules([
      ...schedules,
      { day: 'monday', startTime: '09:00', endTime: '17:00' },
    ]);
  };

  // Actualizar un horario existente
  const updateSchedule = (
    index: number,
    field: keyof WorkSchedule,
    value: string
  ) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
    setSchedules(updatedSchedules);
  };

  // Eliminar un horario
  const removeSchedule = (index: number) => {
    if (schedules.length > 1) {
      const updatedSchedules = schedules.filter((_, i) => i !== index);
      setSchedules(updatedSchedules);
    } else {
      toast({
        title: 'No se puede eliminar',
        description: 'Debe haber al menos un horario',
        variant: 'destructive',
      });
    }
  };

  // Validar y enviar el formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación
    if (!firstName.trim() || !lastName.trim() || !position.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    // Validar que no haya horarios duplicados o inválidos
    for (const schedule of schedules) {
      if (!schedule.day || !schedule.startTime || !schedule.endTime) {
        toast({
          title: 'Horario incompleto',
          description: 'Por favor completa todos los campos de horario',
          variant: 'destructive',
        });
        return;
      }

      // Validar que la hora de fin sea posterior a la de inicio
      if (schedule.startTime >= schedule.endTime) {
        toast({
          title: 'Horario inválido',
          description: 'La hora de fin debe ser posterior a la de inicio',
          variant: 'destructive',
        });
        return;
      }
    }

    // Enviar datos
    onSubmit({
      firstName,
      lastName,
      position,
      photo,
      schedules,
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>
          {initialData ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de perfil */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>

              <div className="absolute bottom-0 right-0 flex gap-1">
                <label className="cursor-pointer bg-white text-black rounded-full p-1 h-8 w-8 flex items-center justify-center">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>

                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="bg-red-500 text-white rounded-full p-1 h-8 w-8 flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Información personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-white">
                Nombre *
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="text-white">
                Apellido *
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="position" className="text-white">
              Cargo *
            </Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              required
            />
          </div>

          {/* Horarios */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-white font-medium">Horarios</Label>
              <Button
                type="button"
                variant="ghost"
                onClick={addSchedule}
                className="text-white border-white/20 hover:bg-white/10 h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar horario
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {schedules.map((schedule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center bg-white/5 p-3 rounded-lg"
                >
                  {/* Selector de día */}
                  <select
                    value={schedule.day}
                    onChange={(e) =>
                      updateSchedule(index, 'day', e.target.value)
                    }
                    className="bg-white/10 border-white/20 text-white rounded-md p-2 text-sm"
                  >
                    {weekdays.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>

                  {/* Hora de inicio */}
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) =>
                      updateSchedule(index, 'startTime', e.target.value)
                    }
                    className="bg-white/10 border-white/20 text-white rounded-md p-2 text-sm"
                  />

                  {/* Hora de fin */}
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) =>
                      updateSchedule(index, 'endTime', e.target.value)
                    }
                    className="bg-white/10 border-white/20 text-white rounded-md p-2 text-sm"
                  />

                  {/* Botón eliminar */}
                  <button
                    type="button"
                    onClick={() => removeSchedule(index)}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-400/10 rounded-full"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-white text-black hover:bg-white/90"
            >
              {initialData ? 'Guardar Cambios' : 'Agregar Empleado'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
