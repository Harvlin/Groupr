import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Eye, Lock } from 'lucide-react';
import { CardFeatureMedia, Button } from '@/components/ui';
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from '@/components/AnimatedSection';
import { SplitText } from '@/components/SplitText';

const features = [
  {
    icon: ShieldCheck,
    title: 'Objective',
    body: 'Scores come from real document edits and code commits — not self-reports that can be gamed.',
    checklist: 'Anti-gaming normalization built in',
    cta: 'How scoring works',
  },
  {
    icon: Eye,
    title: 'Transparent',
    body: 'Every percentage includes a human-readable rationale and a confidence level, so the number is never a mystery.',
    checklist: 'Evidence trail for every score',
    cta: 'See a sample report',
  },
  {
    icon: Lock,
    title: 'Privacy-first',
    body: 'Truth Layer only analyzes documents and repos your team explicitly connects. Nothing else.',
    checklist: 'Consent required from every member',
    cta: 'Read privacy policy',
  },
];

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const springConfig = { stiffness: 150, damping: 15 };
  const rotateX = useSpring(
    useTransform(y, prefersReducedMotion ? [0, 0] : [-0.5, 0.5], [8, -8]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(x, prefersReducedMotion ? [0, 0] : [-0.5, 0.5], [-8, 8]),
    springConfig
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

export function FeatureTriptych() {
  return (
    <section id="features" className="bg-white py-20 lg:py-section-lg">
      <div className="container-content">
        <AnimatedSection className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
            Why Truth Layer
          </p>
          <h2
            className="mt-3 font-display text-4xl text-text-primary md:text-5xl lg:text-headline-md"
            style={{ lineHeight: 0.85 }}
          >
            <SplitText delay={0.1}>Fair credit starts with fair data.</SplitText>
          </h2>
        </AnimatedSection>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" style={{ perspective: 1000 }}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.title}>
                <TiltCard>
                  <CardFeatureMedia className="flex h-full flex-col transition-shadow duration-350 hover:shadow-hairline">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="mb-6 flex h-12 w-12 items-center justify-center rounded-control bg-accent-lime text-surface-forest"
                    >
                      <Icon size={24} />
                    </motion.div>
                    <h3 className="font-display text-2xl text-text-primary" style={{ lineHeight: 0.9 }}>
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-text-secondary body-dense">
                      {feature.body}
                    </p>
                    <div className="mt-6 flex items-start gap-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="mt-0.5 shrink-0"
                      >
                        <circle cx="10" cy="10" r="10" fill="#9FE870" />
                        <path
                          d="M6 10L9 13L14 7"
                          stroke="#163300"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm font-medium text-text-primary underline decoration-accent-lime decoration-2 underline-offset-4">
                        {feature.checklist}
                      </span>
                    </div>
                    <div className="mt-auto pt-8">
                      <Button variant="outline" className="w-full justify-start transition-colors hover:bg-surface-muted">
                        {feature.cta}
                      </Button>
                    </div>
                  </CardFeatureMedia>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
