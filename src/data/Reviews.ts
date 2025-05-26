import type {
  CommentCategory,
  CommentOption,
  ImprovementOption,
  RatingOption,
} from '@/types/reviews';
import { useTranslations } from '../i18n/config';
import type { SupportedLang } from '../i18n/config';

export const getRatingOptions = (lang: SupportedLang): RatingOption[] => {
  const t = useTranslations(lang);
  return [
    { rating: 1, label: t('reviews.rating.veryDissatisfied') },
    { rating: 2, label: t('reviews.rating.dissatisfied') },
    { rating: 3, label: t('reviews.rating.neutral') },
    { rating: 4, label: t('reviews.rating.satisfied') },
    {
      rating: 5,
      label: t('reviews.rating.verySatisfied'),
    },
  ];
};

export const getImprovementOptions = (
  lang: SupportedLang
): ImprovementOption[] => {
  const t = useTranslations(lang);
  return [
    { id: 'service', label: t('reviews.improvements.service'), icon: '🤝' },
    { id: 'food', label: t('reviews.improvements.food'), icon: '🍽️' },
    { id: 'drinks', label: t('reviews.improvements.drinks'), icon: '🥤' },
    {
      id: 'atmosphere',
      label: t('reviews.improvements.atmosphere'),
      icon: '🎵',
    },
    { id: 'other', label: t('reviews.improvements.other'), icon: '✨' },
  ];
};

export const getCommentOptions = (
  lang: SupportedLang
): Record<CommentCategory, CommentOption[]> => {
  const t = useTranslations(lang);
  return {
    drinks: [
      {
        id: 'temperature',
        icon: '🌡️',
        label: t('reviews.comments.temperature'),
      },
      { id: 'variety', icon: '🥤', label: t('reviews.comments.variety') },
      { id: 'price', icon: '💵', label: t('reviews.comments.price') },
      { id: 'quality', icon: '🍸', label: t('reviews.comments.quality') },
      { id: 'other', icon: '✨', label: t('reviews.comments.other') },
    ],
    food: [
      {
        id: 'temperature',
        icon: '🌡️',
        label: t('reviews.comments.temperature'),
      },
      { id: 'taste', icon: '🤷‍♂️', label: t('reviews.comments.taste') },
      { id: 'portion', icon: '🍽️', label: t('reviews.comments.portion') },
      {
        id: 'presentation',
        icon: '🍛',
        label: t('reviews.comments.presentation'),
      },
      { id: 'other', icon: '✨', label: t('reviews.comments.other') },
    ],
    service: [
      {
        id: 'waitingTime',
        icon: '⌛️',
        label: t('reviews.comments.waitingTime'),
      },
      { id: 'kindness', icon: '👩‍💼', label: t('reviews.comments.kindness') },
      { id: 'order', icon: '📝', label: t('reviews.comments.order') },
      {
        id: 'availability',
        icon: '🤵‍♂️',
        label: t('reviews.comments.availability'),
      },
      { id: 'other', icon: '✨', label: t('reviews.comments.other') },
    ],
    atmosphere: [
      { id: 'noise', icon: '🔊', label: t('reviews.comments.noise') },
      {
        id: 'temperature',
        icon: '🌡️',
        label: t('reviews.comments.temperature'),
      },
      {
        id: 'cleanliness',
        icon: '🧹',
        label: t('reviews.comments.cleanliness'),
      },
      { id: 'comfort', icon: '🪑', label: t('reviews.comments.comfort') },
      { id: 'other', icon: '✨', label: t('reviews.comments.other') },
    ],
  };
};
