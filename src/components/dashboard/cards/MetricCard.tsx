import { TbStar, TbStarFilled, TbStarHalfFilled } from 'react-icons/tb';

interface Props {
  label: string;
  value: number;
  isRating?: boolean;
  isPercentage?: boolean;
}

export default function MetricCard({
  label,
  value,
  isRating = false,
  isPercentage = false,
}: Props) {
  const formattedValue = Number.isInteger(value) ? value : value.toFixed(2);

  const renderStars = () => {
    const totalStars = 5;
    const filledStars = Math.floor(value);
    const hasHalfStar = !Number.isInteger(value);
    const emptyStars = totalStars - filledStars - (hasHalfStar ? 1 : 0);

    return (
      <div className='flex items-center gap-1'>
        {Array.from({ length: filledStars }).map((_, index) => (
          <TbStarFilled
            key={`filled-${index}`}
            color='var(--yellow-star)'
            className='w-4 h-4'
          />
        ))}

        {/* Half star if needed */}
        {hasHalfStar && (
          <TbStarHalfFilled color='var(--yellow-star)' className='w-4 h-4' />
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <TbStar
            key={`empty-${index}`}
            className='w-4 h-4'
            color='var(--yellow-star)'
          />
        ))}
      </div>
    );
  };

  return (
    <div className='bg-white/10 hover:bg-white/20 transition-colors p-4 text-left rounded-lg flex flex-col gap-2 items-start justify-center'>
      <h3 className='text-base'>{label}</h3>
      <p className='text-base font-bold'>
        {formattedValue}
        {isPercentage ? '%' : ''}
      </p>
      {isRating ? (
        renderStars()
      ) : (
        <span className='w-full h-1 bg-white rounded-full relative overflow-hidden'>
          {isPercentage ? (
            <span
              className='h-full bg-primary-dark rounded-full absolute left-0 top-0'
              style={{ width: `${value}%` }}
            />
          ) : (
            <span className='w-full h-full bg-primary-dark rounded-full absolute left-0 top-0' />
          )}
        </span>
      )}
    </div>
  );
}
