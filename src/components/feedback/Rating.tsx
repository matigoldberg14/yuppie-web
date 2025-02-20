// /Users/Mati/Desktop/yuppie-web/src/components/feedback/Rating.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';
import { createReview } from '../../services/api';
import {
  hasSubmittedReviewToday,
  recordReviewSubmission,
} from '../../utils/reviewLimiter';

interface Props {
  // Este es el ID numérico del restaurante (en cadena) usado para las llamadas a la API
  restaurantId: string;
  // Este es el identificador estable (documentId) usado para el bloqueo y registro en localStorage
  restaurantDocumentId: string;
  nextUrl: string;
  linkMaps: string;
}

const ratingOptions = [
  { rating: 1, emoji: '😠', label: 'Muy insatisfecho', color: 'bg-red-500' },
  { rating: 2, emoji: '🙁', label: 'Insatisfecho', color: 'bg-orange-500' },
  { rating: 3, emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
  { rating: 4, emoji: '🙂', label: 'Satisfecho', color: 'bg-lime-500' },
  { rating: 5, emoji: '😍', label: 'Muy satisfecho', color: 'bg-green-500' },
] as const;

export function RatingForm({
  restaurantId,
  restaurantDocumentId,
  nextUrl,
  linkMaps,
}: Props) {
  const numericRestaurantId = parseInt(restaurantId, 10);
  if (isNaN(numericRestaurantId)) {
    console.error(`restaurantId ("${restaurantId}") no es un número válido.`);
  }

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const { toast } = useToast();

  // Verificar al montar si ya se envió una review para este restaurante (usando el identificador estable)
  useEffect(() => {
    if (restaurantDocumentId && hasSubmittedReviewToday(restaurantDocumentId)) {
      setAlreadySubmitted(true);
      toast({
        variant: 'destructive',
        title: 'Ya has opinado hoy',
        description:
          'Ya has enviado tu calificación para este restaurante. ¡Gracias por compartir tu opinión!',
        duration: 5000,
      });
    }
  }, [restaurantDocumentId, toast]);

  const handleRatingHover = (rating: number) => {
    if (!isSubmitting && !alreadySubmitted) {
      setSelectedRating(rating);
    }
  };

  const handleRatingSelect = async (rating: number) => {
    if (isSubmitting || alreadySubmitted) return;
    try {
      setIsSubmitting(true);

      // Guardar la calificación y el identificador estable en localStorage
      localStorage.setItem('yuppie_rating', rating.toString());
      localStorage.setItem('yuppie_restaurant', restaurantDocumentId);

      if (rating === 5) {
        localStorage.setItem('yuppie_improvement', 'Otra');

        toast({
          title: '¡Gracias!',
          description: '¿Nos dejarías un comentario en Google?',
          duration: 2000,
        });

        if (isNaN(numericRestaurantId)) {
          throw new Error('ID de restaurante inválido');
        }
        // Para 5 estrellas usamos el ID numérico que ya tenemos
        const reviewData = {
          restaurantId: numericRestaurantId,
          calification: 5,
          typeImprovement: 'Otra',
          email: 'prefirio-no-dar-su-email@nodiosuemail.com',
          comment: 'Google Review: 5 estrellas. Review enviada a Google!',
          googleSent: true,
        };

        console.log('Iniciando createReview con datos:', reviewData);
        await createReview(reviewData);

        // Registrar la submission en el historial para bloquear futuros envíos en el mismo día
        recordReviewSubmission(restaurantDocumentId);

        setTimeout(() => {
          window.location.href = linkMaps;
        }, 2000);
      } else {
        // Para calificaciones menores a 5
        // No registramos la submission todavía, lo haremos al finalizar todo el proceso
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
  };

  // Si ya se envió la review, mostramos un mensaje amigable en lugar de las opciones de calificación
  if (alreadySubmitted) {
    return (
      <div className="w-full max-w-md flex flex-col items-center gap-4 p-8 bg-white/10 rounded-lg">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-medium text-white text-center"
        >
          ¡Gracias por compartir tu opinión hoy!
        </motion.h2>
        <p className="text-white text-center">
          Ya has enviado tu calificación para este restaurante. Por favor,
          vuelve mañana para compartir otra experiencia.
        </p>
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
              transition={{ type: 'spring', stiffness: 300 }}
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
