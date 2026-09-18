import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-body font-semibold text-sm transition-colors duration-350 ease-wise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'h-10 px-4 bg-accent-lime text-surface-forest hover:bg-[#80E142] focus-visible:ring-accent-lime',
        glass:
          'h-10 px-4 bg-black/[0.07] text-text-primary hover:bg-black/[0.12] focus-visible:ring-text-secondary',
        'nav-cta':
          'h-8 px-3 bg-surface-forest text-accent-lime border border-surface-forest hover:bg-[#0D1F00] focus-visible:ring-surface-forest',
        'nav-large':
          'h-[72px] px-6 bg-surface-forest text-accent-lime border border-surface-forest hover:bg-[#0D1F00] focus-visible:ring-surface-forest text-lg',
        outline:
          'h-10 px-4 bg-transparent border border-border-hairline text-text-primary hover:bg-black/[0.04]',
        ghost: 'h-10 px-4 text-text-primary hover:bg-black/[0.04]',
      },
      size: {
        default: '',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export type ButtonPropsBase = VariantProps<typeof buttonVariants>;
