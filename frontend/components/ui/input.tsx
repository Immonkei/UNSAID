import * as React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3.5 py-2 text-xs sm:text-sm text-neutral-100 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:border-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
