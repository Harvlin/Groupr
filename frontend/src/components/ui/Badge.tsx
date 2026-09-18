import { cn } from '@/lib/utils';
import type { ConfidenceLevel } from '@/types';

interface StatusBadgeProps {
  level: ConfidenceLevel;
  label?: string;
  className?: string;
}

const styles: Record<ConfidenceLevel, string> = {
  high: 'bg-accent-positive text-white',
  medium: 'bg-[#B8860B] text-white',
  low: 'bg-accent-warning text-white',
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
        'inline-flex items-center rounded-control px-3 py-1 text-xs font-semibold',
        styles[level],
        className
      )}
    >
      {label ?? defaultLabels[level]}
    </span>
  );
}
