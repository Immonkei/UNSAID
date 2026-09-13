import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-400',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-neutral-100 text-neutral-950 hover:bg-neutral-200',
        secondary:
          'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800',
        destructive:
          'border-rose-900/60 bg-rose-950/50 text-rose-300',
        outline: 'border-neutral-800 text-neutral-400',
        success: 'border-emerald-900/60 bg-emerald-950/50 text-emerald-300',
        warning: 'border-amber-900/60 bg-amber-950/50 text-amber-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
