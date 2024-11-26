import { useState } from 'react';
import { createReview } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';

type Props = {
  restaurantId: string;
  nextUrl: string;
  linkMaps: string;
};

const ratingOptions = [
  { rating: 1, emoji: '😠', label: 'Muy insatisfecho', color: 'bg-red-500' },
  { rating: 2, emoji: '🙁', label: 'Insatisfecho', color: 'bg-orange-500' },
  { rating: 3, emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
  { rating: 4, emoji: '🙂', label: 'Satisfecho', color: 'bg-lime-500' },
  { rating: 5, emoji: '😍', label: 'Muy satisfecho', color: 'bg-green-500' },
] as const;

export function RatingForm({ restaurantId, nextUrl, linkMaps }: Props) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingHover = (rating: number) => {
    if (!isSubmitting) {
      setSelectedRating(rating);
    }
  };

  const handleRatingSelect = async (rating: number) => {
    try {
      setIsSubmitting(true);

      if (rating === 5) {
        // Para calificación 5, creamos la review simplificada y redirigimos a Google
        await createReview({
          restaurantId,
          calification: rating,
          googleSent: true,
        });

        // Animación de éxito antes de redireccionar
        toast({
          title: '¡Gracias por tu calificación!',
          description: 'Te estamos redirigiendo a Google para tu reseña...',
          duration: 2000,
        });

        setTimeout(() => {
          window.location.href = linkMaps;
        }, 2000);
      } else {
        // Para otras calificaciones, guardamos el rating y continuamos el flujo
        localStorage.setItem('yuppie_rating', rating.toString());
        localStorage.setItem('yuppie_restaurant', restaurantId);

        toast({
          title: 'Calificación registrada',
          description: 'Cuéntanos más sobre tu experiencia...',
          duration: 1500,
        });

        setTimeout(() => {
          window.location.href = nextUrl;
        }, 1500);
      }
    } catch (error) {
      console.error('Error al procesar calificación:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Hubo un problema al procesar tu calificación. Por favor, intenta nuevamente.',
      });
      setIsSubmitting(false);
    }
  };

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

              {/* Tooltip */}
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

              {/* Indicator dot */}
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
