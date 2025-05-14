import type { ImprovementValue } from '@/types/reviews';

interface Props {
  onClick: (improvement: ImprovementValue) => void;
}

const improvementOptions = [
  { id: 'Atención', label: 'Atención', icon: '🤝' },
  { id: 'Comidas', label: 'Comidas', icon: '🍽️' },
  { id: 'Bebidas', label: 'Bebidas', icon: '🥤' },
  { id: 'Ambiente', label: 'Ambiente', icon: '🎵' },
  { id: 'Otra', label: 'Otra', icon: '✨' },
];

export default function ImprovementForm({ onClick }: Props) {
  return (
    <div className='w-full max-w-md flex flex-col items-center gap-3'>
      {improvementOptions.map(({ id, label, icon }) => (
        <button
          key={id}
          className='w-full p-4 rounded-lg flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors text-white'
          onClick={() => onClick(id as ImprovementValue)}
        >
          <span className='text-xl' role='img' aria-label={label}>
            {icon}
          </span>
          {label}
        </button>
      ))}
    </div>
  );
}
