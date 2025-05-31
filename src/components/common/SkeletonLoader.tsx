interface Props {
  className?: string;
}

export function SkeletonLoader({ className }: Props) {
  return (
    <span className={`${className} bg-white/20 rounded-lg animate-pulse `} />
  );
}
