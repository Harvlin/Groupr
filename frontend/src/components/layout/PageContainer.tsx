import { cn } from '@/lib/utils';

const MAX_WIDTHS = {
  narrow: '680px',
  medium: '900px',
  wide: '1200px',
  full: 'none',
} as const;

export interface PageContainerProps {
  width?: keyof typeof MAX_WIDTHS;
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared content width wrapper. All app pages must use this instead of ad-hoc max-w-* classes.
 *
 * Width assignments:
 *   narrow  (680px)  — Coach Mode, Offline Log
 *   medium  (900px)  — Dashboard, Settings, Profile, Sources, Disputes, AI Disclosure
 *   wide    (1200px) — Projects, Team Overview, Teacher Report, Teacher Dashboard, Tasks
 *   full    (none)   — pages needing full available width (use sparingly)
 */
export function PageContainer({ width = 'medium', children, className }: PageContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-6 md:px-10 py-10', className)}
      style={{ maxWidth: MAX_WIDTHS[width] }}
    >
      {children}
    </div>
  );
}
