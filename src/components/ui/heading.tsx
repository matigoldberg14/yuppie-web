// src/components/ui/heading.tsx
import * as React from 'react';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  className?: string;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    { as: Component = 'h1', size = '4xl', className = '', children, ...props },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={`font-bold tracking-tight ${
          size === '7xl'
            ? 'text-5xl md:text-7xl'
            : size === '6xl'
            ? 'text-4xl md:text-6xl'
            : size === '5xl'
            ? 'text-3xl md:text-5xl'
            : size === '4xl'
            ? 'text-2xl md:text-4xl'
            : size === '3xl'
            ? 'text-xl md:text-3xl'
            : size === '2xl'
            ? 'text-lg md:text-2xl'
            : 'text-base md:text-xl'
        } ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';
