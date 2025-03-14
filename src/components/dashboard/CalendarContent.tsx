// src/components/dashboard/CalendarContent.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { auth } from '../../lib/firebase';
import {
  getRestaurantByFirebaseUID,
  getRestaurantReviews,
} from '../../services/api';
import { getSelectedRestaurant } from '../../lib/restaurantStore';

export function CalendarContent() {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  // Estado para el restaurante seleccionado
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    getSelectedRestaurant()
  );

  useEffect(() => {
    const handleRestaurantChange = (e: CustomEvent) => {
      console.log(
        'CalendarContent: restaurantChange event received:',
        e.detail
      );
      setSelectedRestaurant(e.detail);
    };
    window.addEventListener(
      'restaurantChange',
      handleRestaurantChange as EventListener
    );
    return () => {
      window.removeEventListener(
        'restaurantChange',
        handleRestaurantChange as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!auth?.currentUser?.uid) {
        console.log('No hay usuario autenticado');
        setLoadingReviews(false);
        return;
      }
      try {
        const restaurantData = selectedRestaurant
          ? selectedRestaurant
          : await getRestaurantByFirebaseUID(auth.currentUser.uid);
        if (!restaurantData) throw new Error('No se encontró el restaurante');
        const reviewsData = await getRestaurantReviews(
          restaurantData.documentId
        );
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [selectedRestaurant]);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const monthName = displayDate.toLocaleString('es-ES', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const calendarCells = [];
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const getEventCountForDay = (day: number) => {
    // Usamos eventos de muestra (sampleEvents) o si tienes eventos reales, utilízalos
    return 0;
  };

  const getReviewCountForDay = (day: number) => {
    const cellDate = new Date(year, month, day);
    return reviews.filter((review) => {
      const reviewDate = new Date(review.createdAt);
      return (
        reviewDate.getFullYear() === cellDate.getFullYear() &&
        reviewDate.getMonth() === cellDate.getMonth() &&
        reviewDate.getDate() === cellDate.getDate()
      );
    }).length;
  };

  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Calendario</h1>
        {/*        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo evento
        </Button> */}
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-7 gap-1">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-center text-white/60">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
              {calendarCells.map((cell, index) => {
                if (cell === null) {
                  return <div key={index} className="aspect-square p-2"></div>;
                }
                const eventCount = getEventCountForDay(cell);
                const reviewCount = getReviewCountForDay(cell);
                return (
                  <div
                    key={index}
                    className="relative aspect-square p-2 border border-white/10 rounded-lg text-white hover:bg-white/5 cursor-pointer"
                  >
                    <div className="text-center">{cell}</div>
                    {eventCount > 0 && (
                      <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                        {eventCount}
                      </span>
                    )}
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
        {/*         <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-white/60 text-center py-8">
                Sin eventos próximos.
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
