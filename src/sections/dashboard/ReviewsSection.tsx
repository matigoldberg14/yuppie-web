import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { getRestaurantByFirebaseUID, updateReview } from '../../services/api';
import { Star, Download, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge'; // Importamos Badge para mostrar el empleado
import emailjs from '@emailjs/browser';
import * as XLSX from 'xlsx';
import { formatDateBuenosAires } from '../../utils/formatDate';
import { getSelectedRestaurant } from '../../lib/restaurantStore';
import { getRestaurantReviews } from '@/services/api/reviews';
import type { Review } from '@/types/reviews';
import Input from '../../components/ui/new/Input';
import { IoSearch } from 'react-icons/io5';
import Button from '../../components/ui/new/Button';
import { BiSortAlt2 } from 'react-icons/bi';
import { LuListFilter } from 'react-icons/lu';
import ReviewCard from '../../components/dashboard/cards/ReviewCard';

export function ReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  // Estado para guardar cupones enviados (aunque la info viene de Strapi)
  const [sentCoupons, setSentCoupons] = useState<{ [key: number]: string }>({});
  // Almacenar el nombre del restaurante (para enviar en el email)
  const [restaurantName, setRestaurantName] = useState('');
  const [search, setSearch] = useState('');

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
      reply_to: 'info@yuppiecx.com.ar',
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
      <div className='p-8'>
        <div className='animate-pulse text-white'>Cargando reseñas...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className='p-8'>
        <div className='text-white'>No hay reseñas disponibles.</div>
      </div>
    );
  }

  return (
    <div className='w-full flex flex-col gap-4 md:gap-8'>
      <div className='w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8'>
        <Input
          placeholder='Buscar reseña'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<IoSearch className='h-4 w-4' />}
          className='w-full'
        />
        <div className='flex items-center gap-8 w-full md:w-auto'>
          <Button
            label='Ordenar'
            onClick={() => {}}
            icon={<BiSortAlt2 className='h-4 w-4' />}
            className='w-full md:w-auto'
          />
          <Button
            label='Filtrar'
            onClick={() => {}}
            icon={<LuListFilter className='h-4 w-4' />}
            className='w-full md:w-auto'
          />
        </div>
      </div>
      <div className='max-h-[calc(100dvh-20.5rem)] border-t border-white/20 pt-4 md:max-h-[calc(100dvh-14rem)] overflow-y-scroll overflow-x-hidden scrollbar-hide md:px-4 flex flex-col gap-4'>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
