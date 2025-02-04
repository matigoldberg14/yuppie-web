// src/components/dashboard/CalendarContent.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

// Datos simulados para próximos eventos (por ejemplo, notificaciones)
const sampleEvents = [
  {
    id: 1,
    title: 'Responder reseñas pendientes',
    date: new Date(2025, 1, 15), // 15 de febrero de 2025
    type: 'event',
  },
  {
    id: 2,
    title: 'Reunión de equipo',
    date: new Date(2025, 1, 17), // 17 de febrero de 2025
    type: 'event',
  },
  {
    id: 3,
    title: 'Análisis mensual',
    date: new Date(2025, 1, 20), // 20 de febrero de 2025
    type: 'event',
  },
  {
    id: 4,
    title: 'Evento extra',
    date: new Date(2025, 2, 5), // 5 de marzo de 2025 (para probar navegación)
    type: 'event',
  },
];

// Datos simulados para reviews (reseñas)
const sampleReviews = [
  { id: 1, title: 'Review A', date: new Date(2025, 1, 15) },
  { id: 2, title: 'Review B', date: new Date(2025, 1, 15) },
  { id: 3, title: 'Review C', date: new Date(2025, 1, 18) },
  { id: 4, title: 'Review D', date: new Date(2025, 1, 20) },
  { id: 5, title: 'Review E', date: new Date(2025, 1, 20) },
];

export function CalendarContent() {
  // Estado que guarda la fecha del mes a mostrar (inicialmente la fecha actual)
  const [displayDate, setDisplayDate] = useState(new Date());

  // Extraer año y mes (mes es 0-indexado)
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const monthName = displayDate.toLocaleString('es-ES', { month: 'long' });

  // Cantidad de días del mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Determinar en qué día de la semana inicia el mes (0 = domingo, 1 = lunes, …)
  const startDay = new Date(year, month, 1).getDay();

  // Construir un arreglo para la cuadrícula:
  // Se agregan celdas en blanco hasta el primer día, luego los números del 1 al daysInMonth.
  const calendarCells = [];
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  // Función para contar eventos en un día determinado
  const getEventCountForDay = (day: number) => {
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

  // Función para contar reviews en un día determinado
  const getReviewCountForDay = (day: number) => {
    const cellDate = new Date(year, month, day);
    return sampleReviews.filter((review) => {
      const reviewDate = review.date;
      return (
        reviewDate.getFullYear() === cellDate.getFullYear() &&
        reviewDate.getMonth() === cellDate.getMonth() &&
        reviewDate.getDate() === cellDate.getDate()
      );
    }).length;
  };

  // Navegar al mes anterior
  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  // Navegar al mes siguiente
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
        {/* Tarjeta principal del calendario */}
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
            {/* Cabecera con los días de la semana */}
            <div className="grid grid-cols-7 gap-1">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-center text-white/60">
                  {day}
                </div>
              ))}
            </div>
            {/* Cuadrícula de días */}
            <div className="grid grid-cols-7 gap-1 mt-2">
              {calendarCells.map((cell, index) => {
                if (cell === null) {
                  // Celda vacía para alinear el primer día
                  return <div key={index} className="aspect-square p-2"></div>;
                }
                const eventCount = getEventCountForDay(cell);
                const reviewCount = getReviewCountForDay(cell);
                return (
                  <div
                    key={index}
                    className="relative aspect-square p-2 border border-white/10 rounded-lg text-white hover:bg-white/5 cursor-pointer"
                  >
                    {/* Número del día */}
                    <div className="text-center">{cell}</div>
                    {/* Badge para eventos (top-right, azul) */}
                    {eventCount > 0 && (
                      <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                        {eventCount}
                      </span>
                    )}
                    {/* Badge para reviews (top-left, rojo) */}
                    {reviewCount > 0 && (
                      <span className="absolute top-1 left-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                        {reviewCount}
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
