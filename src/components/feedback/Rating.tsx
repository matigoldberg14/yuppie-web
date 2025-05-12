// src/components/feedback/Rating.tsx
import { useState, useEffect, useCallback, memo } from 'react';
import { useToast } from '../ui/use-toast';
import {
  createReview,
  getRestaurantNumericId,
  getEmployeeNumericId,
  checkIfEmailHasFiveStarReview,
} from '../../services/api';
import { hasSubmittedReviewToday } from '../../utils/reviewLimiter';

interface Props {
  onClick: (rating: number) => void;
}

// Static array that won't re-render - use web-safe emoji Unicode code points
const ratingOptions = [
  { rating: 1, emoji: '😠', label: 'Muy insatisfecho', color: 'bg-red-500' },
  { rating: 2, emoji: '🙁', label: 'Insatisfecho', color: 'bg-orange-500' },
  { rating: 3, emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
  { rating: 4, emoji: '🙂', label: 'Satisfecho', color: 'bg-lime-500' },
  { rating: 5, emoji: '😁', label: 'Muy satisfecho', color: 'bg-green-500' },
] as const;

// Optimize component for better performance on mobile
export function RatingForm({ onClick }: Props) {}
{
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [emojisLoaded, setEmojisLoaded] = useState(false);
  const { toast } = useToast();

  // Preload emojis
  useEffect(() => {
    // Create a hidden div to preload emojis and ensure they're ready before display
    const preloadEmojis = () => {
      const preloadDiv = document.createElement('div');
      preloadDiv.style.position = 'absolute';
      preloadDiv.style.opacity = '0';
      preloadDiv.style.pointerEvents = 'none';
      preloadDiv.style.width = '0';
      preloadDiv.style.height = '0';
      preloadDiv.style.overflow = 'hidden';

      // Add all emojis with explicit font-size to ensure proper loading
      ratingOptions.forEach((option) => {
        const span = document.createElement('span');
        span.style.fontSize = '40px'; // Match the size you'll display
        span.textContent = option.emoji;
        preloadDiv.appendChild(span);
      });

      document.body.appendChild(preloadDiv);

      // Set a timeout to ensure emojis have time to load
      setTimeout(() => {
        setEmojisLoaded(true);
        document.body.removeChild(preloadDiv);
      }, 300);
    };

    preloadEmojis();
  }, []);

  useEffect(() => {
    // Handle employee ID in localStorage
    if (!employeeDocumentId) {
      localStorage.removeItem('yuppie_employee');
    } else {
      localStorage.setItem('yuppie_employee', employeeDocumentId);
    }
  }, [employeeDocumentId]);

  // Check for previous submissions
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
        setIsLoaded(true);
      }
    };

    // Use requestAnimationFrame instead of requestIdleCallback for better compatibility
    requestAnimationFrame(() => {
      checkSubmission();
    });
  }, [restaurantDocumentId, toast]);

  // Precargar datos para optimizar el tiempo de carga
  useEffect(() => {
    if (!restaurantDocumentId) return;

    const preloadData = async () => {
      try {
        // Intentar obtener el ID del restaurante en paralelo
        getRestaurantNumericId(restaurantDocumentId).catch((err: Error) => {
          console.error('Error precargando ID de restaurante:', err);
        });

        // Si hay ID de empleado, también precargarlo
        if (employeeDocumentId) {
          getEmployeeNumericId(employeeDocumentId).catch((err: Error) => {
            console.error('Error precargando ID de empleado:', err);
          });
        }

        // También podemos precargar la verificación de email si existe
        const savedEmail = localStorage.getItem('yuppie_email');
        if (savedEmail) {
          checkIfEmailHasFiveStarReview(restaurantDocumentId, savedEmail).catch(
            (err: Error) => {
              console.error('Error precargando verificación de email:', err);
            }
          );
        }
      } catch (error) {
        console.error('Error en precarga de datos:', error);
      }
    };

    // Usar requestIdleCallback si está disponible, de lo contrario setTimeout
    if (typeof window !== 'undefined') {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => preloadData());
      } else {
        setTimeout(preloadData, 100);
      }
    }
  }, [restaurantDocumentId, employeeDocumentId]);

  const handleRatingHover = useCallback(
    (rating: number) => {
      if (!isSubmitting && !alreadySubmitted) {
        setSelectedRating(rating);
      }
    },
    [isSubmitting, alreadySubmitted]
  );

  // Function to create reviews
  const createReviewWithData = async (
    rating: number,
    restaurantRealId: number,
    employeeRealId?: number,
    email: string = 'prefirio-no-dar-su-email@nodiosuemail.com'
  ) => {
    console.log(`=== INICIO createReviewWithData ===`);
    console.log(
      `📊 Datos: restaurante=${restaurantRealId}, rating=${rating}, email=${email}${
        employeeRealId ? `, empleado=${employeeRealId}` : ', sin empleado'
      }`
    );

    const reviewData: any = {
      restaurantId: restaurantRealId,
      calification: rating,
      typeImprovement: 'Otra',
      email: email,
      comment: 'Google Review: 5 estrellas. Review enviada a Google!',
      googleSent: true,
    };

    if (employeeRealId) {
      reviewData.employeeId = employeeRealId;
    }

    console.log(`📤 Enviando datos a API:`, JSON.stringify(reviewData));

    try {
      const result = await createReview(reviewData);
      console.log(`✅ Review creada exitosamente:`, result);
      return true;
    } catch (apiError) {
      console.error(`❌ Error en createReview:`, apiError);
      throw apiError;
    } finally {
      console.log(`=== FIN createReviewWithData ===`);
    }
  };

  // Main handler function
  const handleRatingSelect = useCallback(
    async (rating: number) => {
      if (isSubmitting || alreadySubmitted) return;

      try {
        setIsSubmitting(true);
        // Store in localStorage (quick sync operation)
        localStorage.setItem('yuppie_rating', rating.toString());
        localStorage.setItem('yuppie_restaurant', restaurantDocumentId);

        // For 5-star ratings only, we'll decide if redirect to Google or follow Yuppie flow
        if (rating === 5) {
          localStorage.setItem('yuppie_improvement', 'Otra');

          try {
            // VERIFICACIÓN CRUCIAL - Si ya existe una review de 5 estrellas previa para este restaurante
            // Usamos una flag específica para reviews de 5 estrellas
            const hasFiveStarReviewFlag = localStorage.getItem(
              `review_google_5stars_${restaurantDocumentId}`
            );

            if (hasFiveStarReviewFlag === 'true') {
              toast({
                title: '¡Gracias!',
                description:
                  'Por favor completa algunos detalles más sobre tu experiencia',
                duration: 2000,
              });

              // Si estamos usando nuevo formato, usar nextUrl tal como viene
              if (useNewUrlFormat) {
                console.log(`🔀 Redirigiendo a URL amigable: ${nextUrl}`);
                window.location.href = nextUrl;
                return;
              }

              // Redirigir al flujo de Yuppie con formato antiguo
              if (employeeDocumentId) {
                const fullNextUrl = `${nextUrl}${
                  nextUrl.includes('?') ? '&' : '?'
                }employee=${employeeDocumentId}`;
                console.log(`🔀 Redirigiendo a: ${fullNextUrl}`);
                window.location.href = fullNextUrl;
              } else {
                console.log(`🔀 Redirigiendo a: ${nextUrl}`);
                window.location.href = nextUrl;
              }
              return; // CRUCIAL: Terminar la ejecución aquí
            }

            // Si llegamos aquí, es porque NO hay reviews de 5 estrellas previas, continuamos el flujo normal
            console.log(
              `✅ NO HAY REVIEWS DE 5 ESTRELLAS PREVIAS - Continuando flujo a Google Maps`
            );

            toast({
              title: '¡Gracias!',
              description: '¿Nos dejarías un comentario en Google?',
              duration: 2000,
            });

            // Usamos el email guardado si existe (probablemente de una review de 1-4 estrellas)
            const savedEmail = localStorage.getItem('yuppie_email');
            console.log(
              `📧 Verificando email guardado: ${
                savedEmail || 'NO HAY EMAIL GUARDADO'
              }`
            );

            // Usamos el email guardado o el genérico si no hay uno guardado
            const reviewEmail =
              savedEmail || 'prefirio-no-dar-su-email@nodiosuemail.com';

            // El resto del proceso para crear la review y redireccionar a Google
            console.log(
              `🏪 Buscando ID para restaurante: ${restaurantDocumentId}`
            );
            const realRestaurantId = await getRestaurantNumericId(
              restaurantDocumentId
            );

            if (realRestaurantId) {
              // Crear la review con el email correspondiente
              try {
                console.log(
                  `📝 Creando review en API con email: ${reviewEmail}`
                );
                await createReviewWithData(
                  5,
                  realRestaurantId,
                  employeeDocumentId,
                  reviewEmail
                );
              } catch (error) {
                console.error('Error creando review:', error);
                if (employeeRealId) {
                  await createReviewWithData(
                    5,
                    realRestaurantId,
                    undefined,
                    reviewEmail
                  );
                }
              }

              // IMPORTANTE: Guardar una bandera ESPECÍFICA para reviews de 5 estrellas
              try {
                localStorage.setItem(
                  `review_google_5stars_${restaurantDocumentId}`,
                  'true'
                );
                console.log(
                  `🔒 Marcando restaurante ${restaurantDocumentId} como ya revisado con 5 estrellas`
                );
              } catch (storageErr) {
                console.error(
                  'Error guardando estado en localStorage:',
                  storageErr
                );
              }

              // Redirect to Google Maps
              console.log(`🔀 Redirigiendo a Google Maps: ${linkMaps}`);
              setTimeout(() => {
                window.location.href = linkMaps;
              }, 200);
            }
          } catch (error) {
            console.error('❌ Error en flujo de 5 estrellas:', error);
            setIsSubmitting(false);

            // En caso de error, vamos al flujo seguro de Yuppie
            if (useNewUrlFormat) {
              window.location.href = nextUrl;
            } else if (employeeDocumentId) {
              window.location.href = `${nextUrl}${
                nextUrl.includes('?') ? '&' : '?'
              }employee=${employeeDocumentId}`;
            } else {
              window.location.href = nextUrl;
            }
          }
        } else {
          // Para ratings menos de 5 - Redirigir a siguiente página
          if (useNewUrlFormat) {
            // Usar nextUrl tal como está para formato nuevo
            window.location.href = nextUrl;
          } else if (employeeDocumentId) {
            // Formato antiguo con parámetros
            const fullNextUrl = `${nextUrl}${
              nextUrl.includes('?') ? '&' : '?'
            }employee=${employeeDocumentId}`;
            window.location.href = fullNextUrl;
          } else {
            // Formato antiguo sin parámetros adicionales
            window.location.href = nextUrl;
          }
        }
      } catch (error) {
        console.error('Error processing rating:', error);
        setIsSubmitting(false);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [
      isSubmitting,
      alreadySubmitted,
      restaurantDocumentId,
      employeeDocumentId,
      toast,
      linkMaps,
      nextUrl,
      useNewUrlFormat,
      restaurantSlug,
    ]
  );

  // If already submitted, show fallback
  if (alreadySubmitted) {
    return (
      <div className='w-full text-center py-4'>
        <p className='text-white text-opacity-80'>
          Ya has enviado tu valoración. Gracias.
        </p>
      </div>
    );
  }

  // Show loading state
  if (!isLoaded || !emojisLoaded) {
    return (
      <div className='w-full max-w-md flex flex-col items-center gap-8'>
        <h2 className='text-2xl font-medium text-white text-center'>
          ¿Qué tan satisfecho quedaste con el servicio?
        </h2>
        <div className='flex justify-between w-full px-4'>
          {ratingOptions.map(({ rating, emoji }) => (
            <div key={rating} className='flex flex-col items-center opacity-70'>
              <span className='text-4xl'>{emoji}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md flex flex-col items-center gap-8'>
      <h2 className='text-2xl font-medium text-white text-center'>
        ¿Qué tan satisfecho quedaste con el servicio?
      </h2>

      <div className='flex justify-between w-full px-4 relative'>
        {ratingOptions.map(({ rating, emoji, label, color }) => (
          <button
            key={rating}
            onClick={onClick}
            onMouseEnter={() => handleRatingHover(rating)}
            onTouchStart={() => handleRatingHover(rating)}
            onFocus={() => handleRatingHover(rating)}
            disabled={isSubmitting}
            className={`relative group flex flex-col items-center ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label={label}
          >
            {/* Use a simpler approach for the emoji display */}
            <span className='text-4xl transform transition-transform duration-200 group-hover:scale-110'>
              {emoji}
            </span>
          </button>
        ))}
      </div>

      {isSubmitting && (
        <div className='text-center text-white/80'>
          Procesando tu calificación...
        </div>
      )}
    </div>
  );
}

// Export memoized version for better performance
export const MemoizedRatingForm = memo(RatingForm);
