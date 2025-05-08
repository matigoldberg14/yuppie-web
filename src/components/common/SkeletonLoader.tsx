// src/components/common/SkeletonLoader.tsx
export function SkeletonLoader() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 bg-white/10 rounded w-3/4 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/10 rounded animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-96 bg-white/10 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}
