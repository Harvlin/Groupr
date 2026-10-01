import { cn } from '@/lib/utils';
import type { ConfidenceLevel } from '@/types';

interface StatusBadgeProps {
  level: ConfidenceLevel;
  label?: string;
  className?: string;
}

const styles: Record<ConfidenceLevel, string> = {
  high: 'border border-accent-positive text-accent-positive bg-transparent',
  medium: 'border border-accent-medium text-accent-medium bg-transparent',
  low: 'border border-accent-warning text-accent-warning bg-transparent',
};

const defaultLabels: Record<ConfidenceLevel, string> = {
  high: 'Confidence: High',
  medium: 'Confidence: Medium',
  low: 'Confidence: Low',
};

export function StatusBadge({ level, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium',
        styles[level],
        className
      )}
    >
      {label ?? defaultLabels[level]}
    </span>
  );
}
