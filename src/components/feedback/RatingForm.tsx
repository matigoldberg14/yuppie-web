import { getRatingOptions } from '@/data/Reviews';
import type { RatingValue } from '@/types/reviews';
import { useTranslations } from '../../i18n/config';
import type { SupportedLang } from '../../i18n/config';

import {
  BsEmojiAngryFill,
  BsFillEmojiFrownFill,
  BsEmojiNeutralFill,
  BsEmojiSmileFill,
  BsEmojiGrinFill,
} from 'react-icons/bs';

interface Props {
  onClick: (rating: RatingValue) => void;
  lang: SupportedLang;
}

export default function RatingForm({ onClick, lang }: Props) {
  const t = useTranslations(lang);

  return (
    <div className='w-full max-w-md flex flex-col items-center gap-8'>
      <h2 className='text-2xl font-medium text-white text-center'>
        {t('feedback.ratingQuestion')}
      </h2>

      <div className='flex justify-between w-full px-4 relative'>
        {getRatingOptions(lang).map(({ rating, label }) => (
          <button
            key={rating}
            onClick={() => onClick(rating as RatingValue)}
            className='relative group flex flex-col items-center cursor-pointer'
            aria-label={label}
          >
            {/* Use a simpler approach for the emoji display */}
            <span className='text-4xl transform transition-transform duration-200 group-hover:scale-110'>
              {rating === 1 && <BsEmojiAngryFill color='#ff5454' />}
              {rating === 2 && <BsFillEmojiFrownFill color='#ff7c54' />}
              {rating === 3 && <BsEmojiNeutralFill color='#FFD700' />}
              {rating === 4 && <BsEmojiSmileFill color='#CDDC39' />}
              {rating === 5 && <BsEmojiGrinFill color='#4CAF50' />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
