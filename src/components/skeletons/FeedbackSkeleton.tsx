// src/components/skeletons/FeedbackSkeleton.tsx
import React from 'react';

export function RatingSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="h-8 bg-white/10 rounded w-3/4 mx-auto mb-8" />
      <div className="flex justify-between items-center gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-16 h-16 rounded-full bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export function ImprovementSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="h-8 bg-white/10 rounded w-3/4 mx-auto mb-8" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-white/10 rounded w-full" />
        ))}
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="h-8 bg-white/10 rounded w-3/4 mx-auto mb-8" />
      <div className="h-40 bg-white/10 rounded mb-4" />
      <div className="h-12 bg-white/10 rounded mb-4" />
      <div className="h-12 bg-white/10 rounded" />
    </div>
  );
}
