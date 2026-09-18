import * as React from 'react';
import { cn } from '@/lib/utils';

// ─── Shared Card component ─────────────────────────────────────────────────────
// This is the single source of truth for card styling.
// Every card in the app MUST use this component — never raw <div> with ad-hoc classes.
// This guarantees the hairline border can never be silently dropped by an unrelated edit.

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  children: React.ReactNode;
}

export function Card({
  padding = 'md',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  const paddingClass = { sm: 'p-4', md: 'p-6', lg: 'p-8' }[padding];
  return (
    <div
      className={cn(
        'bg-white rounded-card border border-hairline',
        paddingClass,
        interactive &&
          'transition-all duration-150 ease hover:border-text-tertiary hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Legacy named exports (keep backward-compatible) ──────────────────────────
// CardFeatureMedia — white card with hairline border (was: shadow-hairline-light, no border)
const CardFeatureMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-card bg-white border border-hairline p-10 max-md:p-7',
      className
    )}
    {...props}
  />
));
CardFeatureMedia.displayName = 'CardFeatureMedia';

// CardForestPanel — dark forest background card
const CardForestPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('bg-surface-forest text-accent-lime rounded-card border border-surface-forest', className)}
    {...props}
  />
));
CardForestPanel.displayName = 'CardForestPanel';

export { CardFeatureMedia, CardForestPanel };
