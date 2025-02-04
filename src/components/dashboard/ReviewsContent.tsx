// src/components/dashboard/ReviewsContent.tsx

import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import {
  getRestaurantByFirebaseUID,
  getRestaurantReviews,
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
}

export function ReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  // Mapa para guardar el cupón enviado por review (key = review.id, value = cupón)
  const [sentCoupons, setSentCoupons] = useState<{ [key: number]: string }>({});
  // Almacena el nombre del restaurante (para incluirlo en el email)
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!auth?.currentUser?.uid) {
          console.log('No hay usuario autenticado');
          return;
        }

        // Obtener los datos del restaurante basado en el usuario de Firebase
        const restaurantData = await getRestaurantByFirebaseUID(
          auth.currentUser.uid
        );
        if (!restaurantData) {
          throw new Error('No se encontró el restaurante');
        }
        // Se asume que restaurantData tiene la propiedad "name"
        setRestaurantName(restaurantData.name || 'Yuppie');

        // Obtener las reviews del restaurante (filtradas por su documentId)
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

  // Función para enviar el cupón de descuento
  const handleSendCoupon = (review: Review) => {
    // Solicitar al usuario el porcentaje de descuento mediante prompt
    const discountStr = window.prompt(
      'Ingrese el porcentaje de descuento (entre 10 y 100):'
    );
    if (!discountStr) return; // Si se cancela el prompt, no se hace nada

    const discount = parseInt(discountStr, 10);
    if (isNaN(discount) || discount < 10 || discount > 100) {
      alert('El valor debe ser un número entre 10 y 100.');
      return;
    }

    // Generar un cupón aleatorio de 10 caracteres
    const couponCode = generateCouponCode(10);

    // Preparar los parámetros que se enviarán al template de EmailJS
    const templateParams = {
      to_email: review.email, // Se usará en el campo {{to_email}} del template
      discount_percentage: discount, // Se usará en {{discount_percentage}}
      coupon_code: couponCode, // Se usará en {{coupon_code}}
      restaurant: restaurantName, // Se usará en el "from name": Yuppie {{restaurant}}
      reply_to: 'contacto@tuempresa.com', // Se usará en {{reply_to}}
    };

    emailjs
      .send(
        'service_kovjo5m', // El Service ID
        'template_em90fox', // El Template ID
        templateParams,
        '3wONTqDb8Fwtqf1P0' // La Public Key (User ID)
      )
      .then(
        (result) => {
          console.log('Email enviado correctamente', result.text);
          alert('Cupón enviado exitosamente.');
          // Guardar el cupón enviado para esta review y evitar reenvíos
          setSentCoupons((prev) => ({ ...prev, [review.id]: couponCode }));
        },
        (error) => {
          console.error('Error enviando cupón', error);
          alert('Error enviando el cupón.');
        }
      );
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
              {/* Si ya se envió un cupón para esta review, se muestra el código; de lo contrario, se muestra el botón */}
              {sentCoupons[review.id] ? (
                <div className="bg-green-600 text-white text-center py-2 rounded">
                  Cupón de descuento: <strong>{sentCoupons[review.id]}</strong>
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
