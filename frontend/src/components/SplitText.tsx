import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export function SplitText({
  children,
  className,
  delay = 0,
  stagger = 0.03,
  as: Tag = 'span',
}: SplitTextProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <Tag className={cn(className)}>{children}</Tag>;
  }

  const words = children.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay * i },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: '1.2em',
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.8, 0.05, 0.2, 0.95],
      },
    },
  };

  return (
    <Tag className={cn('inline-block overflow-hidden', className)}>
      <motion.span
        className="inline-flex flex-wrap"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="mr-[0.25em] inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              style={{ transformOrigin: 'center bottom' }}
              variants={child}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
