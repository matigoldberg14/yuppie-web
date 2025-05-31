import { useRef, useEffect, type ReactNode } from 'react';

interface ClickOutsideProps {
  children: ReactNode;
  onClickOutside: () => void;
  className?: string;
  isOpen?: boolean;
}

export default function ClickOutside({
  children,
  onClickOutside,
  className = '',
  isOpen = false,
}: ClickOutsideProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      onClickOutside();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [onClickOutside, isOpen]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
