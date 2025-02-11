// src/components/dashboard/ReviewsContent.tsx
import type { Review } from '../../types/api';
import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { secureApiClient } from '../../services/secureApiClient';
import { Star, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import emailjs from '@emailjs/browser';
import * as XLSX from 'xlsx';
import { useToast } from '../ui/use-toast';

export function ReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!auth?.currentUser?.uid) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No hay usuario autenticado',
          });
          return;
        }

        const restaurantData = await secureApiClient.getRestaurantByFirebaseUID(
          auth.currentUser.uid
        );

        setRestaurantName(restaurantData.name);
        const reviewsData = await secureApiClient.getRestaurantReviews(
          restaurantData.documentId
        );
        setReviews(reviewsData);
      } catch (error: unknown) {
        console.error('Error fetching reviews:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Error desconocido',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [toast]);

  const generateCouponCode = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  };

  const handleSendCoupon = async (review: Review) => {
    try {
      const discountStr = window.prompt(
        'Ingrese el porcentaje de descuento (entre 10 y 100):'
      );
      if (!discountStr) return;

      const discount = parseInt(discountStr, 10);
      if (isNaN(discount) || discount < 10 || discount > 100) {
        throw new Error('El valor debe ser un número entre 10 y 100.');
      }

      const couponCode = generateCouponCode(10);

      await emailjs.send(
        'service_kovjo5m',
        'template_em90fox',
        {
          to_email: review.email,
          discount_percentage: discount,
          coupon_code: couponCode,
          restaurant: restaurantName,
          reply_to: 'contacto@tuempresa.com',
        },
        '3wONTqDb8Fwtqf1P0'
      );

      const updatedReview = await secureApiClient.updateReview(
        review.documentId,
        {
          couponCode,
          couponUsed: false,
        }
      );

      setReviews((prevReviews) =>
        prevReviews.map((r) => (r.id === review.id ? updatedReview : r))
      );

      toast({
        title: 'Éxito',
        description: 'Cupón enviado correctamente',
      });
    } catch (error: unknown) {
      console.error('Error enviando cupón:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error enviando cupón',
      });
    }
  };

  const handleMarkCouponUsed = async (review: Review) => {
    try {
      const confirmation = window.confirm(
        '¿Está seguro de que desea marcar este cupón como usado? Esta acción no se puede revertir.'
      );
      if (!confirmation) return;

      const updatedReview = await secureApiClient.updateReview(
        review.documentId,
        {
          couponUsed: true,
        }
      );

      setReviews((prevReviews) =>
        prevReviews.map((r) => (r.id === review.id ? updatedReview : r))
      );

      toast({
        title: 'Éxito',
        description: 'Cupón marcado como usado',
      });
    } catch (error: unknown) {
      console.error('Error marcando cupón como usado:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo marcar el cupón como usado',
      });
    }
  };

  const handleExportToExcel = () => {
    try {
      const exportData = reviews.map((review) => ({
        Fecha: new Date(review.createdAt).toLocaleDateString(),
        Email: review.email,
        Calificación: review.calification,
        'Tipo de Mejora': review.typeImprovement,
        Comentario: review.comment,
        'Enviado a Google': review.googleSent ? 'Sí' : 'No',
        'Código de Cupón': review.couponCode || 'No enviado',
        'Cupón Usado': review.couponUsed ? 'Sí' : 'No',
        'ID de Review': review.documentId,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      ws['!cols'] = [
        { wch: 12 },
        { wch: 30 },
        { wch: 12 },
        { wch: 15 },
        { wch: 50 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Reseñas');

      const fileName = `reseñas_${restaurantName}_${
        new Date().toISOString().split('T')[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar el archivo',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-white">Cargando reseñas...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-8">
        <div className="text-white">No hay reseñas disponibles.</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Reseñas</h1>
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={handleExportToExcel}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-white/10 border-0">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-white">{review.email}</CardTitle>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.calification
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-white/60">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-white">{review.comment}</p>
                {review.typeImprovement && (
                  <div className="mt-2">
                    <span className="text-sm bg-white/10 text-white px-2 py-1 rounded-full">
                      {review.typeImprovement}
                    </span>
                  </div>
                )}
              </div>
              {review.couponCode ? (
                <div className="space-y-2">
                  <div className="bg-green-600 text-white text-center py-2 rounded">
                    Cupón de descuento: <strong>{review.couponCode}</strong>
                  </div>
                  {!review.couponUsed ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleMarkCouponUsed(review)}
                    >
                      Marcar como usado
                    </Button>
                  ) : (
                    <div className="text-sm text-white/60 text-center">
                      Cupón usado
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => handleSendCoupon(review)}
                >
                  Enviar cupón de descuento
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
