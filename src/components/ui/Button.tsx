// src/components/ui/Button.tsx
import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function Button({
  children,
  fullWidth = false,
  variant = 'primary',
  size = 'default',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        transition-all
        ${
          variant === 'primary'
            ? 'bg-white text-black hover:bg-gray-100'
            : variant === 'secondary'
            ? 'border-2 border-white text-white hover:bg-white/10'
            : 'text-white hover:bg-white/10' // variant ghost
        }
        ${size === 'icon' ? 'h-10 w-10 p-0' : 'py-3 px-6 rounded-full'}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}