// src/components/dashboard/CalendarContent.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

// Simulación de eventos/notificaciones
const sampleEvents = [
  {
    id: 1,
    title: 'Responder reseñas pendientes',
    date: new Date(2025, 1, 15), // 15 de febrero de 2025
    type: 'notification',
  },
  {
    id: 2,
    title: 'Reunión de equipo',
    date: new Date(2025, 1, 17), // 17 de febrero de 2025
    type: 'notification',
  },
  {
    id: 3,
    title: 'Análisis mensual',
    date: new Date(2025, 1, 20), // 20 de febrero de 2025
    type: 'notification',
  },
  {
    id: 4,
    title: 'Notificación extra',
    date: new Date(2025, 2, 5), // 5 de marzo de 2025 (para probar navegación)
    type: 'notification',
  },
];

export function CalendarContent() {
  // Estado que guarda la fecha del mes a mostrar (se inicializa con la fecha actual)
  const [displayDate, setDisplayDate] = useState(new Date());

  // Extraer año y mes (0-indexado) del estado
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  // Nombre del mes en español (por ejemplo, "febrero")
  const monthName = displayDate.toLocaleString('es-ES', { month: 'long' });

  // Calcular la cantidad de días del mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calcular el día de la semana (0 = domingo, 1 = lunes, etc.) del primer día del mes
  const startDay = new Date(year, month, 1).getDay();

  // Para construir la cuadrícula del calendario:
  // 1. Agregamos celdas en blanco hasta el primer día (startDay).
  // 2. Luego agregamos los días del 1 al daysInMonth.
  const calendarCells = [];
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  // Función que cuenta cuántos eventos ocurren en un día dado
  const getNotificationCountForDay = (day: number) => {
    const cellDate = new Date(year, month, day);
    return sampleEvents.filter((event) => {
      const eventDate = event.date;
      return (
        eventDate.getFullYear() === cellDate.getFullYear() &&
        eventDate.getMonth() === cellDate.getMonth() &&
        eventDate.getDate() === cellDate.getDate()
      );
    }).length;
  };

  // Cambiar al mes anterior
  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  // Cambiar al mes siguiente
  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="p-6">
      {/* Encabezado del calendario */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Calendario</h1>
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo evento
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta del calendario principal */}
        <Card className="lg:col-span-2 bg-white/10 border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white capitalize">{`${monthName} ${year}`}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Cabecera de días de la semana */}
            <div className="grid grid-cols-7 gap-1">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-center text-white/60">
                  {day}
                </div>
              ))}
            </div>
            {/* Cuadrícula del calendario */}
            <div className="grid grid-cols-7 gap-1 mt-2">
              {calendarCells.map((cell, index) => {
                if (cell === null) {
                  // Celdas en blanco para alinear el primer día
                  return <div key={index} className="aspect-square p-2"></div>;
                }
                const notificationCount = getNotificationCountForDay(cell);
                return (
                  <div
                    key={index}
                    className="relative aspect-square p-2 border border-white/10 rounded-lg text-white hover:bg-white/5 cursor-pointer"
                  >
                    {/* Número del día */}
                    <div className="text-center">{cell}</div>
                    {/* Badge con la cantidad de notificaciones (si es mayor a 0) */}
                    {notificationCount > 0 && (
                      <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta de "Próximos eventos" */}
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleEvents
                .filter((event) => event.date >= new Date())
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
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
