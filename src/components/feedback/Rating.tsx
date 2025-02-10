// src/components/feedback/Rating.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';

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

  useEffect(() => {
    // Verificar si ya se hizo una review
    const lastReviewTime = localStorage.getItem(`last_review_${restaurantId}`);
    if (lastReviewTime) {
      const timeDiff = Date.now() - new Date(lastReviewTime).getTime();
      const hoursLeft = Math.ceil(
        (24 * 60 * 60 * 1000 - timeDiff) / (1000 * 60 * 60)
      );

      if (timeDiff < 24 * 60 * 60 * 1000) {
        toast({
          variant: 'destructive',
          title: 'Espera 24 horas',
          description: `Podrás enviar otra review en ${hoursLeft} horas.`,
        });

        // Redirigir después de mostrar el mensaje
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    }
  }, [restaurantId, toast]);

  const handleRatingSelect = async (rating: number) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      localStorage.setItem('yuppie_rating', rating.toString());
      localStorage.setItem('yuppie_restaurant', restaurantId);
      localStorage.setItem(
        `last_review_${restaurantId}`,
        new Date().toISOString()
      );

      if (rating === 5 && linkMaps) {
        window.location.href = linkMaps;
      } else {
        window.location.href = nextUrl;
      }
    } catch (error) {
      console.error('Error procesando calificación:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error inesperado',
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
          {ratingOptions.map((option) => (
            <motion.button
              key={option.rating}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={() => handleRatingSelect(option.rating)}
              disabled={isSubmitting}
              className={`relative group flex flex-col items-center ${
                isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              aria-label={option.label}
            >
              <span className="text-4xl transform transition-transform duration-200 group-hover:scale-110">
                {option.emoji}
              </span>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: selectedRating === option.rating ? 1 : 0,
                  y: selectedRating === option.rating ? 0 : 10,
                }}
                className={`absolute -bottom-12 px-3 py-1 rounded-full text-sm text-white ${option.color}`}
              >
                {option.label}
              </motion.div>
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
