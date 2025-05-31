import { ratingOptions } from '@/data/Reviews';
import type { RatingValue } from '@/types/reviews';
import {
  BsEmojiAngryFill,
  BsFillEmojiFrownFill,
  BsEmojiNeutralFill,
  BsEmojiSmileFill,
  BsEmojiGrinFill,
} from 'react-icons/bs';

interface Props {
  onClick: (rating: RatingValue) => void;
}

export default function RatingForm({ onClick }: Props) {
  return (
    <div className='w-full max-w-md flex flex-col items-center gap-8'>
      <h2 className='text-2xl font-medium text-white text-center'>
        ¿Qué tan satisfecho quedaste con el servicio?
      </h2>

      <div className='flex justify-between w-full px-4 relative'>
        {ratingOptions.map(({ rating, icon, label }) => (
          <button
            key={rating}
            onClick={() => onClick(rating as RatingValue)}
            className='relative group flex flex-col items-center cursor-pointer'
            aria-label={label}
          >
            {/* Use a simpler approach for the emoji display */}
            <span className='text-4xl transform transition-transform duration-200 group-hover:scale-110'>
              {rating === 1 && <BsEmojiAngryFill color='var(--rating-1)' />}
              {rating === 2 && <BsFillEmojiFrownFill color='var(--rating-2)' />}
              {rating === 3 && <BsEmojiNeutralFill color='var(--rating-3)' />}
              {rating === 4 && <BsEmojiSmileFill color='var(--rating-4)' />}
              {rating === 5 && <BsEmojiGrinFill color='var(--rating-5)' />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
