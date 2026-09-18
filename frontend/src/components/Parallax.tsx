import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
  'aria-hidden'?: boolean | 'true' | 'false';
}

export function Parallax({
  children,
  className,
  speed = 0.5,
  direction = 'up',
  'aria-hidden': ariaHidden,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const multiplier = direction === 'up' ? -1 : 1;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 100 * speed * multiplier]
  );

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={cn(className)}
      aria-hidden={ariaHidden}
    >
      {children}
    </motion.div>
  );
}
