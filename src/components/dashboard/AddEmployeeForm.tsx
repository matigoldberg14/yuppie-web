// src/components/dashboard/AddEmployeeForm.tsx
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Dialog, DialogContent } from '../ui/dialog'; // <-- viene de tu archivo modificado
import { X } from 'lucide-react';

interface AddEmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    position: string;
    schedules: {
      day: string;
      startTime: string;
      endTime: string;
    }[];
  }) => void;
}

// Ejemplo de días
const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function AddEmployeeForm({
  isOpen,
  onClose,
  onSubmit,
}: AddEmployeeFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [schedules, setSchedules] = useState([
    { day: 'monday', startTime: '09:00', endTime: '17:00' },
  ]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ firstName, lastName, position, schedules });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Agregar nuevo miembro</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <Input
              placeholder="Cargo"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            {schedules.map((schedule, index) => (
              <div key={index} className="space-y-2">
                <select
                  value={schedule.day}
                  onChange={(e) =>
                    setSchedules((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, day: e.target.value } : s
                      )
                    )
                  }
                  className="w-full p-2 rounded border"
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) =>
                      setSchedules((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, startTime: e.target.value } : s
                        )
                      )
                    }
                    required
                  />
                  <Input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) =>
                      setSchedules((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, endTime: e.target.value } : s
                        )
                      )
                    }
                    required
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={() =>
                setSchedules((prev) => [
                  ...prev,
                  { day: 'monday', startTime: '09:00', endTime: '17:00' },
                ])
              }
              variant="secondary"
              className="w-full"
            >
              Agregar horario
            </Button>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
