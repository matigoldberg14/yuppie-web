import type { CommentValue, ImprovementValue } from '@/types/reviews';

interface Props {
  comment: string;
  customComment: string;
  showCustomComment: boolean;
  improvement: ImprovementValue;
  minLength: number;
  maxLength: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClick: (comment: CommentValue) => void;
}

type ImprovementCategory = Exclude<ImprovementValue, 'Otra'>;

const improvementOptions: Record<
  ImprovementCategory,
  { id: CommentValue; icon: string; label: string }[]
> = {
  Bebidas: [
    { id: 'temperatura', icon: '🌡️', label: 'Temperatura inadecuada' },
    { id: 'variedad', icon: '🥤', label: 'Poca variedad' },
    { id: 'precio', icon: '💵', label: 'Precio elevado' },
    { id: 'calidad', icon: '🍸', label: 'Calidad de las bebidas' },
    { id: 'otro', icon: '✨', label: 'Otro' },
  ],
  Comidas: [
    { id: 'temperatura', icon: '🌡️', label: 'Temperatura inadecuada' },
    { id: 'sabor', icon: '🤷‍♂️', label: 'Sabor no cumplió expectativas' },
    { id: 'porcion', icon: '🍽️', label: 'Tamaño de las porciones' },
    { id: 'presentacion', icon: '🍛', label: 'Presentación del plato' },
    { id: 'otro', icon: '✨', label: 'Otro' },
  ],
  Atención: [
    { id: 'tiempo', icon: '⌛️', label: 'Tiempo de espera muy largo' },
    { id: 'amabilidad', icon: '👩‍💼', label: 'Falta de amabilidad del personal' },
    { id: 'pedido', icon: '📝', label: 'Errores en el pedido' },
    {
      id: 'disponibilidad',
      icon: '🤵‍♂️',
      label: 'Poca disponibilidad del personal',
    },
    { id: 'otro', icon: '✨', label: 'Otro' },
  ],
  Ambiente: [
    { id: 'ruido', icon: '🔊', label: 'Nivel de ruido elevado' },
    { id: 'temperatura', icon: '🌡️', label: 'Temperatura del local' },
    { id: 'limpieza', icon: '🧹', label: 'Limpieza del local' },
    { id: 'comodidad', icon: '🪑', label: 'Comodidad del mobiliario' },
    { id: 'otro', icon: '✨', label: 'Otro' },
  ],
};

// TODO: Manage min 10 chars
export default function CommentForm({
  comment,
  customComment,
  improvement,
  onChange,
  showCustomComment,
  onClick,
  minLength,
  maxLength,
}: Props) {
  return (
    <div className='w-full max-w-md flex flex-col items-center gap-3'>
      {showCustomComment ? (
        <div className='w-full flex flex-col gap-2 items-end'>
          <textarea
            name='customComment'
            id='customComment'
            onChange={onChange}
            value={customComment}
            minLength={minLength}
            maxLength={maxLength}
            placeholder={`Cuéntanos tu experiencia (mínimo ${minLength} caracteres)`}
            className='w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400 resize-none h-40 transition-all duration-200 focus:ring-2 focus:ring-white/20 focus:outline-none'
          />
          <span
            className={`text-sm ${
              customComment.length === 500 ? 'text-red-400' : 'text-gray-400'
            }`}
          >
            {customComment.length}/500
          </span>
        </div>
      ) : (
        improvementOptions[improvement as ImprovementCategory]?.map(
          ({ id, icon, label }) => {
            return (
              <button
                key={id}
                className={`w-full p-4 rounded-lg flex text-start items-start gap-3  transition-colors  ${
                  comment === id
                    ? 'bg-white text-primary-dark'
                    : 'bg-white/5 text-white'
                }`}
                onClick={() => onClick(id as CommentValue)}
              >
                <span className='text-xl' role='img' aria-label={label}>
                  {icon}
                </span>
                {label}
              </button>
            );
          }
        )
      )}
    </div>
  );
}
