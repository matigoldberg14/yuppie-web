import { useState } from 'react';
import { Button } from '../Button';

const emojis = [
  { rating: 1, emoji: '😠', label: 'Muy insatisfecho' },
  { rating: 2, emoji: '🙁', label: 'Insatisfecho' },
  { rating: 3, emoji: '😐', label: 'Neutral' },
  { rating: 4, emoji: '🙂', label: 'Satisfecho' },
  { rating: 5, emoji: '😍', label: 'Muy satisfecho' },
] as const;

type Props = {
  restaurantId: string;
  nextUrl: string;
};

// Cambiamos el nombre del componente a RatingForm
export function RatingForm({ restaurantId, nextUrl }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!selected) return;
    localStorage.setItem('yuppie_rating', selected.toString());
    localStorage.setItem('yuppie_restaurant', restaurantId);
    window.location.href = nextUrl;
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      <h2 className="text-xl text-center">
        ¿Qué tan satisfecho quedaste con el servicio?
      </h2>

      <div className="flex justify-between w-full px-4">
        {emojis.map(({ rating, emoji, label }) => (
          <button
            key={rating}
            onClick={() => setSelected(rating)}
            className={`text-4xl transition-all ${
              selected === rating ? 'transform scale-125' : 'opacity-70'
            }`}
            aria-label={label}
          >
            {emoji}
          </button>
        ))}
      </div>

      {selected && (
        <Button onClick={handleSubmit} fullWidth>
          Continuar
        </Button>
      )}
    </div>
  );
}
