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
import { checkEmailReviewStatus } from '../../services/api';

interface Props {
  restaurantId: string;
  restaurantDocumentId: string;
  nextUrl: string;
  linkMaps: string;
  employeeDocumentId?: string;
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
export function RatingForm({
  restaurantId,
  restaurantDocumentId,
  nextUrl,
  linkMaps,
  employeeDocumentId,
}: Props) {
  // Parse the ID once
  const numericRestaurantId = parseInt(restaurantId, 10);

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
    employeeRealId?: number
  ) => {
    console.log(
      `Creando reseña con: restaurante=${restaurantRealId}, rating=${rating}${
        employeeRealId ? `, empleado=${employeeRealId}` : ''
      }`
    );

    const reviewData: any = {
      restaurantId: restaurantRealId,
      calification: rating,
      typeImprovement: 'Otra',
      email: 'prefirio-no-dar-su-email@nodiosuemail.com',
      comment: 'Google Review: 5 estrellas. Review enviada a Google!',
      googleSent: true,
    };

    if (employeeRealId) {
      reviewData.employeeId = employeeRealId;
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

  // Main handler function
  const handleRatingSelect = useCallback(
    async (rating: number) => {
      if (isSubmitting || alreadySubmitted) return;

      try {
        setIsSubmitting(true);
        console.log(`===== Processing rating: ${rating} =====`);

        // Store in localStorage (quick sync operation)
        localStorage.setItem('yuppie_rating', rating.toString());
        localStorage.setItem('yuppie_restaurant', restaurantDocumentId);

        // For 5-star ratings only, we'll automatically submit to Google
        if (rating === 5) {
          localStorage.setItem('yuppie_improvement', 'Otra');

          toast({
            title: '¡Gracias!',
            description: '¿Nos dejarías un comentario en Google?',
            duration: 2000,
          });

          try {
            // Get restaurant ID
            console.log(
              `Getting real numeric ID for restaurant documentId: ${restaurantDocumentId}`
            );
            const realRestaurantId = await getRestaurantNumericId(
              restaurantDocumentId
            );

            if (realRestaurantId) {
              console.log(
                `Real restaurant numeric ID obtained: ${realRestaurantId} (was ${numericRestaurantId})`
              );

              // Get employee ID (if exists)
              let employeeRealId;
              if (employeeDocumentId) {
                try {
                  console.log(
                    `Getting real numeric ID for employee documentId: ${employeeDocumentId}`
                  );
                  employeeRealId = await getEmployeeNumericId(
                    employeeDocumentId
                  );
                  console.log(
                    `Real employee numeric ID obtained: ${employeeRealId}`
                  );
                } catch (empError) {
                  console.error('Error getting employee ID:', empError);
                }
              }

              // For 5-star ratings, use a default positive email
              const reviewEmail = 'prefirio-no-dar-su-email@nodiosuemail.com';

              // Check if this email has already submitted a review
              const emailStatus = await checkEmailReviewStatus(
                restaurantDocumentId,
                reviewEmail
              );

              if (emailStatus.hasReviewed) {
                console.log(
                  'This email already submitted a review in the last 24 hours.'
                );
              }

              // Send review with correct IDs
              try {
                await createReviewWithData(
                  5,
                  realRestaurantId,
                  employeeRealId || undefined
                );
              } catch (error) {
                console.error(
                  'Error creating review, trying without employee:',
                  error
                );

                // If it fails with employee, try without it
                if (employeeRealId) {
                  await createReviewWithData(5, realRestaurantId);
                }
              }
            } else {
              console.error('Could not get real restaurant ID');
            }
          } catch (idError) {
            console.error('Error getting real IDs:', idError);
          }

          // Redirect to Google Maps after processing everything
          console.log(`Redirecting to Google Maps: ${linkMaps}`);
          setTimeout(() => {
            window.location.href = linkMaps;
          }, 2000);
        } else {
          // For ratings less than 5 - Redirect to next page
          if (employeeDocumentId) {
            const fullNextUrl = `${nextUrl}${
              nextUrl.includes('?') ? '&' : '?'
            }employee=${employeeDocumentId}`;
            window.location.href = fullNextUrl;
          } else {
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
      restaurantId,
      restaurantDocumentId,
      numericRestaurantId,
      employeeDocumentId,
      toast,
      linkMaps,
      nextUrl,
    ]
  );

  // If already submitted, show fallback
  if (alreadySubmitted) {
    return (
      <div className="w-full text-center py-4">
        <p className="text-white text-opacity-80">
          Ya has enviado tu valoración. Gracias.
        </p>
      </div>
    );
  }

  // Show loading state
  if (!isLoaded || !emojisLoaded) {
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
      <h2 className="text-2xl font-medium text-white text-center">
        ¿Qué tan satisfecho quedaste con el servicio?
      </h2>

      <div className="flex justify-between w-full px-4 relative">
        {ratingOptions.map(({ rating, emoji, label, color }) => (
          <button
            key={rating}
            onClick={() => handleRatingSelect(rating)}
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
            <span className="text-4xl transform transition-transform duration-200 group-hover:scale-110">
              {emoji}
            </span>

            {/* Only show label when selected to improve performance */}
            {selectedRating === rating && (
              <div
                className={`absolute -bottom-12 px-3 py-1 rounded-full text-sm text-white ${color} opacity-100`}
              >
                {label}
              </div>
            )}

            {/* Indicator dot when selected */}
            {selectedRating === rating && (
              <div
                className={`absolute -bottom-2 w-2 h-2 rounded-full ${color} opacity-100`}
              />
            )}
          </button>
        ))}
      </div>

      {isSubmitting && (
        <div className="text-center text-white/80">
          Procesando tu calificación...
        </div>
      )}
    </div>
  );
}

// Export memoized version for better performance
export const MemoizedRatingForm = memo(RatingForm);
