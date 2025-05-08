// src/components/ui/label.tsx
import * as React from 'react';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-sm font-medium text-white/60 ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = 'Label';

export { Label };
