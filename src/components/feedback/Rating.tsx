// src/components/feedback/Rating.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';
import { createReview } from '../../services/api';

interface Props {
  restaurantId: string;
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
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      localStorage.setItem('yuppie_rating', rating.toString());
      localStorage.setItem('yuppie_restaurant', restaurantId);

      if (rating === 5) {
        // Guardar el tipo de mejora predeterminado para la review de Google
        localStorage.setItem('yuppie_improvement', 'Otra');

        toast({
          title: '¡Gracias!',
          description:
            'Se ha creado tu review de 5 estrellas y será enviada a Google.',
          duration: 2000,
        });

        // Crear la review en Strapi con el prefijo en el comentario
        const reviewData = {
          restaurantId: parseInt(restaurantId, 10),
          calification: 5,
          typeImprovement: 'Otra',
          email: 'prefirio-no-dar-su-email@nodiosuemail.com',
          comment: 'Google Review: 5 estrellas. Review enviada a Google!',
          googleSent: true,
        };

        await createReview(reviewData);

        setTimeout(() => {
          window.location.href = linkMaps;
        }, 2000);
      } else {
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
