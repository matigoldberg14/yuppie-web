import type {
  CommentCategory,
  CommentOption,
  ImprovementOption,
  RatingOption,
} from '@/types/reviews';

export const ratingOptions: RatingOption[] = [
  { rating: 1, icon: '😠', label: 'Muy insatisfecho' },
  { rating: 2, icon: '🙁', label: 'Insatisfecho' },
  { rating: 3, icon: '😐', label: 'Neutral' },
  { rating: 4, icon: '🙂', label: 'Satisfecho' },
  {
    rating: 5,
    icon: '😁',
    label: 'Muy satisfecho',
  },
];

export const improvementOptions: ImprovementOption[] = [
  { id: 'Atención', label: 'Atención', icon: '🤝' },
  { id: 'Comidas', label: 'Comidas', icon: '🍽️' },
  { id: 'Bebidas', label: 'Bebidas', icon: '🥤' },
  { id: 'Ambiente', label: 'Ambiente', icon: '🎵' },
  { id: 'Otra', label: 'Otra', icon: '✨' },
];

export const commentOptions: Record<CommentCategory, CommentOption[]> = {
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
