import { useState } from 'react';
import { Button } from '../Button';

const improvementOptions = [
  { id: 'atencion', label: 'Atención', icon: '🔔' },
  { id: 'comidas', label: 'Comidas', icon: '🍽' },
  { id: 'bebidas', label: 'Bebidas', icon: '☕️🍷' },
  { id: 'ambiente', label: 'Ambiente', icon: '🎵' },
  { id: 'otra', label: 'Otra', icon: '⏰' },
] as const;

type ImprovementOption = (typeof improvementOptions)[number]['id'];

type Props = {
  restaurantId: string;
  nextUrl: string;
};

export function ImprovementSelector({ restaurantId, nextUrl }: Props) {
  const [selected, setSelected] = useState<ImprovementOption[]>([]);

  const handleSubmit = () => {
    localStorage.setItem('yuppie_improvements', JSON.stringify(selected));
    window.location.href = nextUrl;
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <h2 className="text-xl text-center mb-4">¿En qué podríamos mejorar?</h2>

      <div className="flex flex-col gap-2">
        {improvementOptions.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => {
              setSelected(
                selected.includes(id)
                  ? selected.filter((item) => item !== id)
                  : [...selected, id]
              );
            }}
            className={`
              w-full p-4 rounded-lg flex items-center gap-3
              ${selected.includes(id) ? 'bg-white/20' : 'bg-white/5'}
              hover:bg-white/10 transition-all
            `}
          >
            <span role="img" aria-label={label}>
              {icon}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <Button onClick={handleSubmit} fullWidth disabled={selected.length === 0}>
        Continuar
      </Button>
    </div>
  );
}
