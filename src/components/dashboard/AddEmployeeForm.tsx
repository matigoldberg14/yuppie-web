// /Users/Mati/Desktop/yuppie-web/src/components/dashboard/AddEmployeeForm.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../ui/use-toast';
import { EmployeeSchedule } from './EmployeeSchedule';
import type { DaySchedule, TimeBlock } from './EmployeeSchedule';

// Convertir el nuevo formato de horario al formato esperado por la API
interface WorkSchedule {
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
    schedules: WorkSchedule[];
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
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const { toast } = useToast();

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

      // Convertir schedules del formato API al formato de componente
      if (initialData.schedules && initialData.schedules.length > 0) {
        const newSchedule: DaySchedule = {};

        // Inicializar todos los días
        [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ].forEach((day) => {
          newSchedule[day] = [];
        });

        // Añadir bloques existentes
        initialData.schedules.forEach((schedule) => {
          if (newSchedule[schedule.day]) {
            newSchedule[schedule.day].push({
              id: Math.random().toString(36).substring(2, 11),
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            });
          }
        });

        setSchedule(newSchedule);
      } else {
        // Inicializar schedule vacío
        const emptySchedule: DaySchedule = {};
        [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ].forEach((day) => {
          emptySchedule[day] = [];
        });
        setSchedule(emptySchedule);
      }
    } else {
      // Reset form al abrir nuevo
      setFirstName('');
      setLastName('');
      setPosition('');
      setPhoto(null);
      setPhotoPreview(null);

      // Inicializar schedule vacío
      const emptySchedule: DaySchedule = {};
      [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ].forEach((day) => {
        emptySchedule[day] = [];
      });
      setSchedule(emptySchedule);
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

  // Función para validar los horarios
  const validateSchedules = (): boolean => {
    // Verificar que al menos un día tenga horario
    const hasAnySchedule = Object.values(schedule).some(
      (blocks) => blocks.length > 0
    );
    if (!hasAnySchedule) {
      toast({
        title: 'Horario requerido',
        description: 'El empleado debe tener al menos un horario asignado',
        variant: 'destructive',
      });
      return false;
    }

    // Verificar superposiciones o errores en cada día
    for (const [day, blocks] of Object.entries(schedule)) {
      // Verificar que no haya superposiciones
      for (let i = 0; i < blocks.length; i++) {
        const blockA = blocks[i];

        // Verificar que la hora de fin sea posterior a la de inicio
        if (blockA.startTime >= blockA.endTime) {
          toast({
            title: 'Horario inválido',
            description: `En ${day}: La hora de fin debe ser posterior a la de inicio`,
            variant: 'destructive',
          });
          return false;
        }

        // Verificar superposiciones entre bloques
        for (let j = i + 1; j < blocks.length; j++) {
          const blockB = blocks[j];

          if (
            (blockA.startTime < blockB.endTime &&
              blockA.endTime > blockB.startTime) ||
            (blockB.startTime < blockA.endTime &&
              blockB.endTime > blockA.startTime)
          ) {
            toast({
              title: 'Horarios superpuestos',
              description: `Hay horarios superpuestos el día ${day}`,
              variant: 'destructive',
            });
            return false;
          }
        }
      }
    }

    return true;
  };

  // Validar y enviar el formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos básicos
    if (!firstName.trim() || !lastName.trim() || !position.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    // Validar horarios
    if (!validateSchedules()) {
      return;
    }

    // Convertir del formato de componente al formato API
    const apiSchedules: WorkSchedule[] = [];

    Object.entries(schedule).forEach(([day, timeBlocks]) => {
      timeBlocks.forEach((block) => {
        apiSchedules.push({
          day,
          startTime: block.startTime,
          endTime: block.endTime,
        });
      });
    });

    // Enviar datos
    onSubmit({
      firstName,
      lastName,
      position,
      photo,
      schedules: apiSchedules,
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>
          {initialData ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna izquierda: Información básica */}
            <div className="space-y-6">
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

              {/* Nombre y apellido */}
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
            </div>

            {/* Columnas derecha: Horarios (ocupa 2/3) */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-white font-medium">
                  Horarios de trabajo
                </Label>
                <div className="text-sm text-white/60">
                  Añade horarios para cada día de la semana
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <EmployeeSchedule schedule={schedule} onChange={setSchedule} />
              </div>
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
