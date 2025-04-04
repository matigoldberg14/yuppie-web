// src/components/dashboard/AddEmployeeForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../ui/use-toast';
import { EmployeeSchedule } from './EmployeeSchedule';
import type { DaySchedule } from './EmployeeSchedule';

// Tipo para el índice dinámico
type DayMap = {
  [key: string]: any[];
};

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
    schedules: WorkSchedule[];
  }) => Promise<void>;
  restaurantId: string;
  initialData?: {
    documentId: string;
    firstName: string;
    lastName: string;
    position: string;
    schedules: WorkSchedule[];
  };
}

export default function AddEmployeeForm({
  isOpen,
  onClose,
  onSubmit,
  restaurantId,
  initialData,
}: AddEmployeeFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Usar un ref para controlar si ya inicializamos los datos
  const initialized = useRef(false);
  const prevOpenState = useRef(isOpen);

  // Este useEffect solo se ejecuta cuando el diálogo se abre o cambia initialData
  useEffect(() => {
    // Solo inicializar si:
    // 1. El diálogo está abierto
    // 2. O bien, no hemos inicializado, o bien, el estado de apertura ha cambiado
    if (isOpen && (!initialized.current || prevOpenState.current !== isOpen)) {
      if (initialData) {
        setFirstName(initialData.firstName || '');
        setLastName(initialData.lastName || '');
        setPosition(initialData.position || '');

        // Inicialización de horarios
        if (initialData.schedules && initialData.schedules.length > 0) {
          const newSchedule: DayMap = {};

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

          initialData.schedules.forEach((sch) => {
            if (newSchedule[sch.day]) {
              newSchedule[sch.day].push({
                id: Math.random().toString(36).substring(2, 11),
                startTime: sch.startTime,
                endTime: sch.endTime,
              });
            }
          });

          setSchedule(newSchedule as DaySchedule);
        } else {
          // Horarios vacíos
          const emptySchedule: DayMap = {};
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
          setSchedule(emptySchedule as DaySchedule);
        }
      } else {
        // Sin datos iniciales, crear estado vacío
        setFirstName('');
        setLastName('');
        setPosition('');

        const emptySchedule: DayMap = {};
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
        setSchedule(emptySchedule as DaySchedule);
      }

      initialized.current = true;
    }

    // Actualizar el estado anterior
    prevOpenState.current = isOpen;

    // Cuando el diálogo se cierra, reiniciar el flag para la próxima apertura
    if (!isOpen) {
      initialized.current = false;
    }
  }, [isOpen, initialData]);

  const validateSchedules = (): boolean => {
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
    for (const [day, blocks] of Object.entries(schedule)) {
      for (let i = 0; i < blocks.length; i++) {
        const blockA = blocks[i];
        if (blockA.startTime >= blockA.endTime) {
          toast({
            title: 'Horario inválido',
            description: `En ${day}: La hora de fin debe ser posterior a la de inicio`,
            variant: 'destructive',
          });
          return false;
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !position.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }
    if (!validateSchedules()) return;
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
    try {
      setIsSubmitting(true);
      await onSubmit({
        firstName,
        lastName,
        position,
        schedules: apiSchedules,
      });
    } catch (err) {
      // Error handling in onSubmit
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    <User className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Input con botón para limpiar */}
              <div>
                <Label htmlFor="firstName" className="text-white">
                  Nombre *
                </Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white pr-10"
                    required
                  />
                  {firstName && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => setFirstName('')}
                      aria-label="Borrar nombre"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Input con botón para limpiar */}
              <div>
                <Label htmlFor="lastName" className="text-white">
                  Apellido *
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white pr-10"
                    required
                  />
                  {lastName && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => setLastName('')}
                      aria-label="Borrar apellido"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Input con botón para limpiar */}
              <div>
                <Label htmlFor="position" className="text-white">
                  Cargo *
                </Label>
                <div className="relative">
                  <Input
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="bg-white/10 border-white/20 text-white pr-10"
                    required
                  />
                  {position && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => setPosition('')}
                      aria-label="Borrar cargo"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
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
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white border-white/20 hover:bg-white/10"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-white text-black hover:bg-white/90"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Enviando...'
                : initialData
                ? 'Guardar Cambios'
                : 'Agregar Empleado'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
