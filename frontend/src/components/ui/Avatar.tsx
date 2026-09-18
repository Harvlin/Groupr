/* eslint-disable react-refresh/only-export-components */
import { getMemberColor } from '@/utils/memberColors';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  initials: string;
  /** Uses getMemberColor palette when provided. Falls back to accent-lime. */
  colorIndex?: number;
  size?: 24 | 32 | 36 | 48 | 56 | 80;
  title?: string;
  className?: string;
}

const SIZE_CLASSES: Record<number, string> = {
  24: 'h-6 w-6 text-[10px]',
  32: 'h-8 w-8 text-xs',
  36: 'h-9 w-9 text-xs',
  48: 'h-12 w-12 text-sm',
  56: 'h-14 w-14 text-base',
  80: 'h-20 w-20 text-xl',
};

export function Avatar({ initials, colorIndex, size = 36, title, className }: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES[36];
  const bgColor = colorIndex !== undefined ? getMemberColor(colorIndex) : '#9FE870';
  // Use dark text on lime/gold, white on blue/coral
  const textColor = bgColor === '#0097C7' || bgColor === '#E85D75' ? '#ffffff' : '#0E0F0C';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-display font-black leading-none select-none',
        sizeClass,
        className
      )}
      style={{ backgroundColor: bgColor, color: textColor }}
      title={title}
      aria-label={title}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}

/** Derive initials from a full name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
