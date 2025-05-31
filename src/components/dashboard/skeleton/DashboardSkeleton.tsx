import { SkeletonLoader } from '@/components/common/SkeletonLoader';

export default function DashboardSkeleton() {
  return (
    <div>
      {/* Metric Cards Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className='bg-primary-light p-4 text-left rounded-lg flex flex-col gap-2 items-start justify-center'
          >
            <SkeletonLoader className='h-4 w-24' />
            <SkeletonLoader className='h-8 w-16' />
            <SkeletonLoader className='h-1 w-full' />
          </div>
        ))}
      </div>

      {/* Chart Cards Skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Review Evolution Chart */}
        <div className='bg-white/10 border-0 rounded-lg p-6 cursor-pointer hover:bg-white/20 transition-colors'>
          <SkeletonLoader className='h-6 w-48 mb-4' />
          <div className='h-[300px]'>
            <SkeletonLoader className='h-full w-full' />
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div className='bg-white/10 border-0 rounded-lg p-6 cursor-pointer hover:bg-white/20 transition-colors'>
          <SkeletonLoader className='h-6 w-64 mb-4' />
          <div className='h-[300px]'>
            <SkeletonLoader className='h-full w-full' />
          </div>
        </div>
      </div>
    </div>
  );
}
