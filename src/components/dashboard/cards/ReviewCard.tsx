import type { Review } from '@/types/reviews';
import { MdOutlineMailOutline } from 'react-icons/md';
import { TbStarFilled } from 'react-icons/tb';
import { formatDateToSpanishLocale } from '../../../utils/date';
import { FcGoogle } from 'react-icons/fc';
import Chip from '../common/Chip';
import { RiUserLine } from 'react-icons/ri';

interface Props {
  review: Review;
  className?: string;
}

export default function ReviewCard({ className, review }: Props) {
  return (
    <div
      className={`${className} flex flex-col p-4 gap-4 bg-white/10 hover:bg-white/20 transition-colors rounded-lg`}
    >
      <div className='w-full flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <MdOutlineMailOutline className='h-4 w-4' />
          {review.email === 'prefirio-no-dar-su-email@nodiosuemail.com'
            ? '-'
            : review.email}
          <Chip
            label={review.typeImprovement}
            backgroundColor='bg-green'
            className='text-sm'
          />
        </div>
        <span className='flex items-center gap-2 text-base font-bold'>
          {review.calification}
          <TbStarFilled className='h-4 w-4' color='var(--yellow-star)' />
        </span>
      </div>
      <span className='flex items-center gap-2'>
        {review.googleSent && <FcGoogle className='h-4 w-4' />}
        {review.comment}
      </span>
      <div
        className={`flex items-center ${
          review.employee ? 'justify-between' : 'justify-end'
        }`}
      >
        {review.employee && (
          // TODO: onClick opens employee profile modal
          <Chip
            label={`${review.employee?.firstName} ${review.employee?.lastName}`}
            backgroundColor='bg-primary-dark'
            color='text-white'
            className='text-sm cursor-pointer'
            icon={<RiUserLine className='h-3 w-3' />}
          />
        )}
        <span className='text-white/75'>
          {formatDateToSpanishLocale(review.createdAt)}
        </span>
      </div>
    </div>
  );
}
