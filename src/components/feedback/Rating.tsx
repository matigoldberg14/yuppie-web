import { useState } from 'react';

type Props = {
  restaurantId: string;
  nextUrl: string;
  linkMaps: string; // Agregamos el prop para el link
};

export function RatingForm({ restaurantId, nextUrl, linkMaps }: Props) {
  const handleRatingSelect = (rating: number) => {
    localStorage.setItem('yuppie_rating', rating.toString());
    localStorage.setItem('yuppie_restaurant', restaurantId);

    // Si la valoración es 5, redirigimos a Google Maps
    if (rating === 5) {
      window.location.href = linkMaps;
    } else {
      // Si no, continuamos con el flujo normal
      window.location.href = nextUrl;
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
