// Reemplaza completamente el archivo Rating.tsx
import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';
import {
  createReview,
  getRestaurantNumericId,
  getEmployeeNumericId,
} from '../../services/api';
import {
  hasSubmittedReviewToday,
  recordReviewSubmission,
} from '../../utils/reviewLimiter';

interface Props {
  restaurantId: string;
  restaurantDocumentId: string;
  nextUrl: string;
  linkMaps: string;
  employeeDocumentId?: string;
}

// Memoized para evitar re-renders
const ratingOptions = [
  { rating: 1, emoji: '😠', label: 'Muy insatisfecho', color: 'bg-red-500' },
  { rating: 2, emoji: '🙁', label: 'Insatisfecho', color: 'bg-orange-500' },
  { rating: 3, emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
  { rating: 4, emoji: '🙂', label: 'Satisfecho', color: 'bg-lime-500' },
  { rating: 5, emoji: '😁', label: 'Muy satisfecho', color: 'bg-green-500' },
] as const;

// Componente optimizado con lazy loading de animaciones
export function RatingForm({
  restaurantId,
  restaurantDocumentId,
  nextUrl,
  linkMaps,
  employeeDocumentId,
}: Props) {
  // Parseamos el ID una sola vez
  const numericRestaurantId = parseInt(restaurantId, 10);

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  console.log('RatingForm inicializado con:', {
    restaurantId,
    numericRestaurantId,
    restaurantDocumentId,
    employeeDocumentId,
    nextUrl,
    linkMaps,
  });

  // Verificación de review enviada optimizada
  useEffect(() => {
    if (!restaurantDocumentId) return;

    const checkSubmission = () => {
      try {
        const hasSubmitted = hasSubmittedReviewToday(restaurantDocumentId);
        if (hasSubmitted) {
          setAlreadySubmitted(true);
          toast({
            variant: 'destructive',
            title: 'Ya has opinado hoy',
            description:
              'Ya has enviado tu calificación para este restaurante. ¡Gracias por compartir tu opinión!',
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error verificando estado de review:', error);
      } finally {
        // Marcamos como cargado incluso si hay error
        setIsLoaded(true);
      }
    };

    // Usar requestIdleCallback o setTimeout para no bloquear el render
    if (window.requestIdleCallback) {
      window.requestIdleCallback(checkSubmission);
    } else {
      setTimeout(checkSubmission, 100);
    }
  }, [restaurantDocumentId, toast]);

  // Memoized functions para evitar recreaciones
  const handleRatingHover = useCallback(
    (rating: number) => {
      if (!isSubmitting && !alreadySubmitted) {
        setSelectedRating(rating);
      }
    },
    [isSubmitting, alreadySubmitted]
  );

  // Función central para crear reseñas
  const createReviewWithData = async (
    rating: number,
    restaurantRealId: number,
    employeeRealId?: number
  ) => {
    console.log(
      `Creando reseña con: restaurante=${restaurantRealId}, rating=${rating}${
        employeeRealId ? `, empleado=${employeeRealId}` : ''
      }`
    );

    // Crear objeto de reseña
    const reviewData: any = {
      restaurantId: restaurantRealId,
      calification: rating,
      typeImprovement: 'Otra',
      email: 'prefirio-no-dar-su-email@nodiosuemail.com',
      comment: 'Google Review: 5 estrellas. Review enviada a Google!',
      googleSent: true,
    };

    // Añadir empleado si existe
    if (employeeRealId) {
      reviewData.employeeId = employeeRealId;
      console.log('Añadiendo employeeId:', employeeRealId);
    }

    try {
      const result = await createReview(reviewData);
      console.log('Review creada exitosamente:', result);
      return true;
    } catch (apiError) {
      console.error('Error en createReview:', apiError);
      throw apiError;
    }
  };

  // FUNCIÓN PRINCIPAL
  const handleRatingSelect = useCallback(
    async (rating: number) => {
      if (isSubmitting || alreadySubmitted) return;

      try {
        setIsSubmitting(true);
        console.log(`===== Procesando calificación: ${rating} =====`);

        // Guardar en localStorage (operación síncrona rápida)
        localStorage.setItem('yuppie_rating', rating.toString());
        localStorage.setItem('yuppie_restaurant', restaurantDocumentId);

        // Guardar empleado si existe
        if (employeeDocumentId) {
          localStorage.setItem('yuppie_employee', employeeDocumentId);
          console.log(
            `Guardado empleado en localStorage: ${employeeDocumentId}`
          );
        }

        if (rating === 5) {
          localStorage.setItem('yuppie_improvement', 'Otra');

          toast({
            title: '¡Gracias!',
            description: '¿Nos dejarías un comentario en Google?',
            duration: 2000,
          });

          // CRUCIAL: Obtenemos el ID real del restaurante y empleado (si existe) en Strapi
          try {
            // Obtener ID del restaurante
            console.log(
              `Obteniendo ID numerico real para restaurante documentId: ${restaurantDocumentId}`
            );
            const realRestaurantId = await getRestaurantNumericId(
              restaurantDocumentId
            );

            if (realRestaurantId) {
              console.log(
                `ID numérico real del restaurante obtenido: ${realRestaurantId} (era ${numericRestaurantId})`
              );

              // Obtener ID del empleado (si existe)
              let employeeRealId;
              if (employeeDocumentId) {
                try {
                  console.log(
                    `Obteniendo ID numerico real para empleado documentId: ${employeeDocumentId}`
                  );
                  employeeRealId = await getEmployeeNumericId(
                    employeeDocumentId
                  );
                  console.log(
                    `ID numérico real del empleado obtenido: ${employeeRealId}`
                  );
                } catch (empError) {
                  console.error('Error obteniendo ID del empleado:', empError);
                }
              }

              // Registrar submission para mejor UX
              recordReviewSubmission(restaurantDocumentId);
              console.log('Review registrada en localStorage');

              // Enviar reseña con IDs correctos
              try {
                await createReviewWithData(
                  5,
                  realRestaurantId,
                  employeeRealId || undefined
                );
              } catch (error) {
                console.error(
                  'Error al crear reseña, intentando sin empleado:',
                  error
                );

                // Si falla con empleado, intentar sin él
                if (employeeRealId) {
                  await createReviewWithData(5, realRestaurantId);
                }
              }
            } else {
              console.error('No se pudo obtener el ID real del restaurante');
            }
          } catch (idError) {
            console.error('Error obteniendo IDs reales:', idError);
          }

          // Redirigir a Google Maps después de procesar todo
          console.log(`Redirigiendo a Google Maps: ${linkMaps}`);
          setTimeout(() => {
            window.location.href = linkMaps;
          }, 2000); // Incrementado a 2 segundos para dar más tiempo
        } else {
          // Para calificaciones menores a 5 - Redirección inmediata
          console.log(`Redirigiendo a: ${nextUrl}`);
          window.location.href = nextUrl;
        }
      } catch (error) {
        console.error('Error procesando calificación:', error);
        setIsSubmitting(false);
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    },
    [
      isSubmitting,
      alreadySubmitted,
      restaurantId,
      restaurantDocumentId,
      numericRestaurantId,
      employeeDocumentId,
      toast,
      linkMaps,
      nextUrl,
    ]
  );

  // Si ya se envió la review o no se ha cargado aún, mostrar fallback
  if (alreadySubmitted) {
    // Mostrar toast pero no redireccionar automáticamente
    // porque podría interferir con la redirección a Google Maps
    return (
      <div className="w-full text-center py-4">
        <p className="text-white text-opacity-80">
          Ya has enviado tu valoración. Gracias.
        </p>
      </div>
    );
  }

  // Fallback mientras carga, para evitar saltos bruscos de layout
  if (!isLoaded) {
    return (
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <h2 className="text-2xl font-medium text-white text-center">
          ¿Qué tan satisfecho quedaste con el servicio?
        </h2>
        <div className="flex justify-between w-full px-4">
          {ratingOptions.map(({ rating, emoji }) => (
            <div key={rating} className="flex flex-col items-center opacity-70">
              <span className="text-4xl">{emoji}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-medium text-white text-center"
      >
        ¿Qué tan satisfecho quedaste con el servicio?
      </motion.h2>

      <div className="flex justify-between w-full px-4 relative">
        <AnimatePresence>
          {ratingOptions.map(({ rating, emoji, label, color }) => (
            <motion.button
              key={rating}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                // Staggered animations para cargar progresivamente
                delay: 0.05 * (rating - 1),
              }}
              onClick={() => handleRatingSelect(rating)}
              onMouseEnter={() => handleRatingHover(rating)}
              onFocus={() => handleRatingHover(rating)}
              disabled={isSubmitting}
              className={`relative group flex flex-col items-center ${
                isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              aria-label={label}
            >
              <span className="text-4xl transform transition-transform duration-200 group-hover:scale-110">
                {emoji}
              </span>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: selectedRating === rating ? 1 : 0,
                  y: selectedRating === rating ? 0 : 10,
                }}
                className={`absolute -bottom-12 px-3 py-1 rounded-full text-sm text-white ${color}`}
              >
                {label}
              </motion.div>

              <motion.div
                initial={false}
                animate={{
                  scale: selectedRating === rating ? 1 : 0,
                  opacity: selectedRating === rating ? 1 : 0,
                }}
                className={`absolute -bottom-2 w-2 h-2 rounded-full ${color}`}
              />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/80"
        >
          Procesando tu calificación...
        </motion.div>
      )}
    </div>
  );
}

// Exportar versión memoizada para evitar re-renders innecesarios
export const MemoizedRatingForm = memo(RatingForm);
