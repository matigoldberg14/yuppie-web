// src/components/ui/input.tsx
import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`
          flex h-11 w-full rounded-lg border bg-transparent px-3 py-2 text-sm
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
