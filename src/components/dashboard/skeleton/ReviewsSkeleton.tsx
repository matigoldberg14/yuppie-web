import { SkeletonLoader } from '@/components/common/SkeletonLoader';

export default function ReviewsSkeleton() {
  return (
    <div className='w-full flex flex-col gap-4 md:gap-8'>
      <div className='w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8'>
        <SkeletonLoader className='h-10 w-full' />
        <div className='flex items-center gap-8 w-full md:w-auto'>
          <SkeletonLoader className='h-10 w-32' />
          <SkeletonLoader className='h-10 w-32' />
        </div>
      </div>
      <div className='max-h-[calc(100dvh-20.5rem)] border-t border-white/20 pt-4 md:max-h-[calc(100dvh-14rem)] overflow-y-scroll overflow-x-hidden scrollbar-hide md:px-4 flex flex-col gap-4'>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className='flex flex-col gap-4 p-4 rounded-lg bg-white/5'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <SkeletonLoader className='h-12 w-12 rounded-full' />
                <div className='flex flex-col gap-2'>
                  <SkeletonLoader className='h-4 w-32' />
                  <SkeletonLoader className='h-3 w-24' />
                </div>
              </div>
              <SkeletonLoader className='h-6 w-20' />
            </div>
            <SkeletonLoader className='h-4 w-full' />
            <SkeletonLoader className='h-4 w-3/4' />
            <div className='flex items-center gap-4 mt-2'>
              <SkeletonLoader className='h-8 w-24' />
              <SkeletonLoader className='h-8 w-24' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
