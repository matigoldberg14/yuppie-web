import { useState } from 'react';
import { createReview } from '../../services/api';

type Props = {
  restaurantId: string;
  nextUrl: string;
  linkMaps: string;
};

export function RatingForm({ restaurantId, nextUrl, linkMaps }: Props) {
  const handleRatingSelect = async (rating: number) => {
    try {
      if (rating === 5) {
        // Para calificación 5, creamos la review simplificada y redirigimos a Google
        await createReview({
          restaurantId,
          calification: rating,
          googleSent: true,
        });
        window.location.href = linkMaps;
      } else {
        // Para otras calificaciones, guardamos el rating y continuamos el flujo
        localStorage.setItem('yuppie_rating', rating.toString());
        localStorage.setItem('yuppie_restaurant', restaurantId);
        window.location.href = nextUrl;
      }
    } catch (error) {
      console.error('Error al procesar calificación:', error);
      alert(
        'Hubo un error al procesar tu calificación. Por favor, intenta nuevamente.'
      );
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      <h2 className="text-xl font-medium text-white text-center">
        ¿Qué tan satisfecho quedaste con el servicio?
      </h2>

      <div className="flex justify-between w-full px-4">
        {[
          { rating: 1, emoji: '😠', label: 'Muy insatisfecho' },
          { rating: 2, emoji: '🙁', label: 'Insatisfecho' },
          { rating: 3, emoji: '😐', label: 'Neutral' },
          { rating: 4, emoji: '🙂', label: 'Satisfecho' },
          { rating: 5, emoji: '😍', label: 'Muy satisfecho' },
        ].map(({ rating, emoji, label }) => (
          <button
            key={rating}
            onClick={() => handleRatingSelect(rating)}
            className="text-4xl transition-all hover:scale-110 focus:scale-125 focus:outline-none"
            aria-label={label}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
