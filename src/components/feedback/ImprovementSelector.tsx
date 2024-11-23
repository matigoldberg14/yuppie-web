const improvementOptions = [
  { id: 'Atención', label: 'Atención', icon: '🔔' },
  { id: 'Comidas', label: 'Comidas', icon: '🍽' },
  { id: 'Bebidas', label: 'Bebidas', icon: '☕️🍷' },
  { id: 'Ambiente', label: 'Ambiente', icon: '🎵' },
  { id: 'Otra', label: 'Otra', icon: '⏰' },
] as const;

type Props = {
  restaurantId: string;
  nextUrl: string;
};

export function ImprovementSelector({ restaurantId, nextUrl }: Props) {
  const handleSelect = (improvement: string) => {
    // Guardar la selección para usarla en el siguiente paso
    localStorage.setItem('yuppie_improvement', improvement);
    window.location.href = nextUrl;
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <h2 className="text-xl text-center text-white font-medium mb-4">
        ¿En qué podríamos mejorar?
      </h2>

      <div className="flex flex-col gap-2">
        {improvementOptions.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            className="w-full p-4 rounded-lg flex items-center gap-3 bg-primary-dark hover:bg-primary-light transition-colors text-white"
          >
            <span role="img" aria-label={label}>
              {icon}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
