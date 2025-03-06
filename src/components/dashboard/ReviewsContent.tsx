// src/components/dashboard/ReviewsContent.tsx

import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import {
  getRestaurantByFirebaseUID,
  getRestaurantReviews,
  updateReview,
} from '../../services/api';
import { Star, Download, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge'; // Importamos Badge para mostrar el empleado
import emailjs from '@emailjs/browser';
import * as XLSX from 'xlsx';
import { formatDateBuenosAires } from '../../utils/formatDate';
import process from 'process/browser';
import { getSelectedRestaurant } from '../../lib/restaurantStore';

interface Employee {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  position: string;
}

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
  couponCode?: string;
  couponUsed?: boolean;
  employee?: Employee; // Agregamos el empleado asociado
}

export function ReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  // Estado para guardar cupones enviados (aunque la info viene de Strapi)
  const [sentCoupons, setSentCoupons] = useState<{ [key: number]: string }>({});
  // Almacenar el nombre del restaurante (para enviar en el email)
  const [restaurantName, setRestaurantName] = useState('');

  // Función para exportar a Excel
  const handleExportToExcel = () => {
    // Preparar los datos para el Excel
    const exportData = reviews.map((review) => ({
      Fecha: formatDateBuenosAires(review.createdAt),
      Email: review.email,
      Calificación: review.calification,
      'Tipo de Mejora': review.typeImprovement,
      Comentario: review.comment,
      'Enviado a Google': review.googleSent ? 'Sí' : 'No',
      'Código de Cupón': review.couponCode || 'No enviado',
      'Cupón Usado': review.couponUsed ? 'Sí' : 'No',
      'ID de Review': review.documentId,
      Empleado: review.employee
        ? `${review.employee.firstName} ${review.employee.lastName}`
        : 'No asignado',
    }));

    // Crear el libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Ajustar el ancho de las columnas
    const columnWidths = [
      { wch: 12 }, // Fecha
      { wch: 30 }, // Email
      { wch: 12 }, // Calificación
      { wch: 15 }, // Tipo de Mejora
      { wch: 50 }, // Comentario
      { wch: 15 }, // Enviado a Google
      { wch: 15 }, // Código de Cupón
      { wch: 12 }, // Cupón Usado
      { wch: 20 }, // ID de Review
      { wch: 25 }, // Empleado
    ];
    ws['!cols'] = columnWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Reseñas');

    // Generar el archivo y descargarlo
    const fileName = `reseñas_${restaurantName}_${
      new Date().toISOString().split('T')[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Inicializar EmailJS
  useEffect(() => {
    emailjs.init(import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY);
  }, []);

  const [selectedRestaurant, setSelectedRestaurant] = useState(
    getSelectedRestaurant()
  );

  useEffect(() => {
    const handleRestaurantChange = (e: CustomEvent) => {
      console.log(
        'Cambio de restaurante detectado en ReviewsContent:',
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

  // Modifica el useEffect de carga de reseñas para usar el restaurante seleccionado
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        // Usar el restaurante seleccionado si existe, si no, obtenerlo por UID
        let restaurantData;

        if (selectedRestaurant) {
          restaurantData = selectedRestaurant;
          console.log('Usando restaurante seleccionado:', restaurantData);
        } else if (auth?.currentUser?.uid) {
          console.log('Obteniendo restaurante por UID:', auth.currentUser.uid);
          restaurantData = await getRestaurantByFirebaseUID(
            auth.currentUser.uid
          );
          if (!restaurantData) {
            throw new Error('No se encontró el restaurante');
          }
        } else {
          console.log('No hay usuario autenticado ni restaurante seleccionado');
          setLoading(false);
          return;
        }

        setRestaurantName(restaurantData.name || 'Yuppie');

        // Obtener reseñas con información de empleados
        console.log('Obteniendo reseñas para:', restaurantData.documentId);
        const reviewsData = await getRestaurantReviews(
          restaurantData.documentId
        );
        console.log('Reviews data:', reviewsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [selectedRestaurant]);

  // Función para generar un cupón aleatorio de 10 caracteres alfanuméricos
  const generateCouponCode = (length: number): string => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  // Función para enviar el cupón y actualizar Strapi
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
      reply_to: 'info@yuppiecx.com.ar.com.ar',
    };

    emailjs
      .send(
        import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
        import.meta.env.PUBLIC_EMAILJS_COUPON_TEMPLATE_ID,
        templateParams,
        import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY
      )
      .then(
        async (result) => {
          console.log('Email enviado correctamente', result.text);
          alert('Cupón enviado exitosamente.');
          try {
            await updateReview(review.documentId, {
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

  const handleMarkCouponUsed = (review: Review) => {
    const confirmation = window.confirm(
      '¿Está seguro de que desea marcar este cupón como usado? Esta acción no se puede revertir.'
    );
    if (!confirmation) return;

    updateReview(review.documentId, { couponUsed: true })
      .then(() => {
        alert('El cupón se ha marcado como usado.');
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
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white">
                    {review.email ===
                    'prefirio-no-dar-su-email@nodiosuemail.com'
                      ? '-'
                      : review.email}
                  </CardTitle>

                  {/* Badge para mostrar el empleado asociado */}
                  {review.employee && (
                    <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
                      <User className="h-3 w-3 mr-1" />
                      {review.employee.firstName} {review.employee.lastName}
                    </Badge>
                  )}
                </div>

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
              <div className="mb-4 max-h-24 overflow-auto break-words">
                <p className="text-white">{review.comment}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {review.typeImprovement && (
                    <span className="text-sm bg-white/10 text-white px-2 py-1 rounded-full">
                      {review.typeImprovement}
                    </span>
                  )}
                </div>
              </div>

              {/* Resto del código de cupones */}
              {review.email !== 'prefirio-no-dar-su-email@nodiosuemail.com' &&
                (review.couponCode ? (
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
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
