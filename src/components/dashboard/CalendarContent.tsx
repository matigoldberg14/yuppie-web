// src/components/dashboard/CalendarContent.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const events = [
  {
    id: 1,
    title: 'Responder reseñas pendientes',
    date: new Date(2024, 2, 15),
    type: 'task',
  },
  {
    id: 2,
    title: 'Reunión de equipo',
    date: new Date(2024, 2, 17),
    type: 'meeting',
  },
  {
    id: 3,
    title: 'Análisis mensual',
    date: new Date(2024, 2, 20),
    type: 'report',
  },
];

export function CalendarContent() {
  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Calendario</h1>
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo evento
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/10 border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Marzo 2024</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-white">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Header de días */}
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-center text-white/60">
                  {day}
                </div>
              ))}
              {/* Grid de días (ejemplo simplificado) */}
              {Array.from({ length: 31 }, (_, i) => (
                <div
                  key={i}
                  className="aspect-square p-2 border border-white/10 rounded-lg text-white hover:bg-white/5 cursor-pointer"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      event.type === 'task'
                        ? 'bg-blue-400'
                        : event.type === 'meeting'
                        ? 'bg-green-400'
                        : 'bg-yellow-400'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {event.title}
                    </p>
                    <p className="text-xs text-white/60">
                      {event.date.toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-white">
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
