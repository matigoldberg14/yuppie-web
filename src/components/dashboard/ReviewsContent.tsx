// src/components/dashboard/ReviewsContent.tsx

import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import {
  getRestaurantByFirebaseUID,
  getRestaurantReviews,
  updateReview, // Asegúrate de importar la función updateReview
} from '../../services/api';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import emailjs from '@emailjs/browser';

interface Review {
  id: number;
  documentId: string;
  calification: number;
  typeImprovement: string;
  comment: string;
  email: string;
  googleSent: boolean;
  date: string;
  createdAt: string;
  couponCode?: string; // Campo nuevo
  couponUsed?: boolean; // Campo nuevo
}

export function ReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  // Estado local para guardar los cupones enviados (si se quiere, se puede usar directamente review.couponCode)
  const [sentCoupons, setSentCoupons] = useState<{ [key: number]: string }>({});
  // Almacenar el nombre del restaurante (para enviar en el email)
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!auth?.currentUser?.uid) {
          console.log('No hay usuario autenticado');
          return;
        }

        // Obtener el restaurante del usuario
        const restaurantData = await getRestaurantByFirebaseUID(
          auth.currentUser.uid
        );
        if (!restaurantData) {
          throw new Error('No se encontró el restaurante');
        }
        setRestaurantName(restaurantData.name || 'Yuppie');

        // Obtener las reviews del restaurante
        const reviewsData = await getRestaurantReviews(
          restaurantData.documentId
        );
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Función para generar un cupón aleatorio de 10 dígitos alfanuméricos
  const generateCouponCode = (length: number): string => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  // Función para enviar el cupón de descuento y actualizar Strapi
  const handleSendCoupon = (review: Review) => {
    const discountStr = window.prompt(
      'Ingrese el porcentaje de descuento (entre 10 y 100):'
    );
    if (!discountStr) return;
    const discount = parseInt(discountStr, 10);
    if (isNaN(discount) || discount < 10 || discount > 100) {
      alert('El valor debe ser un número entre 10 y 100.');
      return;
    }

    const couponCode = generateCouponCode(10);

    const templateParams = {
      to_email: review.email,
      discount_percentage: discount,
      coupon_code: couponCode,
      restaurant: restaurantName,
      reply_to: 'contacto@tuempresa.com',
    };

    emailjs
      .send(
        'service_kovjo5m',
        'template_discount_coupon',
        templateParams,
        '3wONTqDb8Fwtqf1P0'
      )
      .then(
        async (result) => {
          console.log('Email enviado correctamente', result.text);
          alert('Cupón enviado exitosamente.');
          // Usa review.id para actualizar en Strapi
          try {
            await updateReview(review.id, {
              couponCode: couponCode,
              couponUsed: false,
            });
            setSentCoupons((prev) => ({ ...prev, [review.id]: couponCode }));
            setReviews((prevReviews) =>
              prevReviews.map((r) =>
                r.id === review.id ? { ...r, couponCode, couponUsed: false } : r
              )
            );
          } catch (updateError) {
            console.error(
              'Error actualizando la review con el cupón:',
              updateError
            );
          }
        },
        (error) => {
          console.error('Error enviando cupón', error);
          alert('Error enviando el cupón.');
        }
      );
  };

  // Función para marcar el cupón como usado
  const handleMarkCouponUsed = (review: Review) => {
    const confirmation = window.confirm(
      '¿Está seguro de que desea marcar este cupón como usado? Esta acción no se puede revertir.'
    );
    if (!confirmation) return;

    // Usa review.id en lugar de review.documentId
    updateReview(review.id, { couponUsed: true })
      .then(() => {
        alert('El cupón se ha marcado como usado.');
        // Actualizar la review localmente
        setReviews((prevReviews) =>
          prevReviews.map((r) =>
            r.id === review.id ? { ...r, couponUsed: true } : r
          )
        );
      })
      .catch((error) => {
        console.error('Error marcando el cupón como usado:', error);
        alert('Error al actualizar el estado del cupón.');
      });
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
      <h1 className="text-2xl font-bold text-white mb-6">Reseñas</h1>
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
              {/* Si ya se envió un cupón para esta review */}
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
