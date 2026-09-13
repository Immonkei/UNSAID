import * as React from 'react';
import { cn } from '../../lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[120px] w-full rounded-2xl border border-neutral-800 bg-neutral-950/80 px-4 py-3.5 text-sm sm:text-base text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:border-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-serif resize-none leading-relaxed',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
