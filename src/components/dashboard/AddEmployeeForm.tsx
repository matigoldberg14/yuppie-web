// src/components/dashboard/AddEmployeeForm.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../ui/use-toast';
import { EmployeeSchedule } from './EmployeeSchedule';
import type { DaySchedule } from './EmployeeSchedule';

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

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName || '');
      setLastName(initialData.lastName || '');
      setPosition(initialData.position || '');
      if (initialData.schedules && initialData.schedules.length > 0) {
        const newSchedule: DaySchedule = {};
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
        setSchedule(newSchedule);
      } else {
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
      setFirstName('');
      setLastName('');
      setPosition('');
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
