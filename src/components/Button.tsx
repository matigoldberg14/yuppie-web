// src/ui/Button.tsx
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({
  children,
  fullWidth = false,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        py-3 px-6 rounded-full transition-all
        ${
          variant === 'primary'
            ? 'bg-white text-black hover:bg-gray-100'
            : 'border-2 border-white text-white hover:bg-white/10'
        }
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
