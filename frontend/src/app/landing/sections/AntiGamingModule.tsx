import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { ButtonPrimaryHero } from '@/components/ui';
import { MagneticButton } from '@/components/MagneticButton';
import { SplitText } from '@/components/SplitText';

function AnimatedBar({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="w-16 text-xs font-medium text-text-secondary">{label}</span>
      <div className="flex-1 overflow-hidden rounded-r-full bg-text-tertiary/10">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: value } : { width: 0 }}
          transition={{
            duration: 1,
            delay,
            ease: [0.8, 0.05, 0.2, 0.95],
          }}
          className="h-4 rounded-r-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-right text-xs font-bold text-text-primary">
        {value}
      </span>
    </div>
  );
}

function NormalizationDiagram() {
  return (
    <div className="w-full space-y-6 rounded-card bg-white p-6 shadow-hairline-light">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Raw count (gameable)
        </p>
        <div className="space-y-3">
          <AnimatedBar label="Ava" value="45%" color="#D1D5DB" delay={0} />
          <AnimatedBar label="Marcus" value="85%" color="#9FE870" delay={0.15} />
        </div>
        <p className="mt-3 text-[11px] text-text-tertiary">
          Marcus pasted a large block once. Raw count says he did 66% of the work.
        </p>
      </div>

      <div className="h-px bg-border-hairline/10" />

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          After Truth Layer normalization
        </p>
        <div className="space-y-3">
          <AnimatedBar label="Ava" value="70%" color="#9FE870" delay={0.3} />
          <AnimatedBar label="Marcus" value="20%" color="#D1D5DB" delay={0.45} />
        </div>
        <p className="mt-3 text-[11px] text-text-tertiary">
          Pasted/duplicate content is de-weighted; steady contribution wins.
        </p>
      </div>
    </div>
  );
}

const antiGamingPoints = [
  {
    title: 'Unique content delta',
    body: 'Formatting-only changes and copy-pasted blocks are filtered out before anything is scored.',
  },
  {
    title: 'Time distribution',
    body: 'A single last-minute dump is weighted lower than the same amount of work spread across the project.',
  },
  {
    title: 'Session diversity',
    body: 'Multiple distinct work sessions signal genuine engagement more than one giant commit.',
  },
];

export function AntiGamingModule() {
  const navigate = useNavigate();

  return (
    <section className="bg-surface-muted py-20 lg:py-section-lg">
      <div className="container-content">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <AnimatedSection direction="left">
            <NormalizationDiagram />
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.1}>
            <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
              Anti-gaming layer
            </p>
            <h2
              className="mt-3 font-display text-4xl text-text-primary md:text-5xl lg:text-headline-md"
              style={{ lineHeight: 0.85 }}
            >
              <SplitText delay={0.1}>Built to resist the obvious cheats.</SplitText>
            </h2>
            <p className="mt-5 text-text-secondary body-dense">
              Raw character counts reward copy-pasting and last-minute cramming.
              Truth Layer normalizes contribution across three signals so the
              score reflects real effort, not gaming skill.
            </p>

            <div className="mt-8 space-y-6">
              {antiGamingPoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.2 + index * 0.1,
                    duration: 0.6,
                    ease: [0.8, 0.05, 0.2, 0.95],
                  }}
                  className="flex gap-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-lime text-surface-forest">
                    <Check size={16} />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-text-primary" style={{ lineHeight: 0.95 }}>
                      {index + 1}. {point.title}
                    </h4>
                    <p className="mt-1 text-sm text-text-secondary">{point.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10">
              <MagneticButton>
                <ButtonPrimaryHero onClick={() => navigate('/teacher-report')}>
                  See a sample teacher report
                </ButtonPrimaryHero>
              </MagneticButton>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
