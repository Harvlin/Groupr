import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ButtonPrimaryHero, CardFeatureMedia } from '@/components/ui';
import { SplitText } from '@/components/SplitText';
import { MagneticButton } from '@/components/MagneticButton';
import { Parallax } from '@/components/Parallax';

const demoMembers = [
  { name: 'Ava', score: 42, color: '#9FE870' },
  { name: 'Daniel', score: 29, color: '#ECF9F9' },
  { name: 'Sofia', score: 17, color: '#ECF9F9' },
  { name: 'Marcus', score: 12, color: '#ECF9F9' },
];

function AnimatedBar({
  score,
  color,
  delay,
}: {
  score: number;
  color: string;
  delay: number;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="relative w-full rounded-t-full bg-surface-muted" style={{ height: '120px' }}>
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: `${score * 2.2}%` }}
          viewport={{ once: true }}
          transition={{
            duration: 1,
            delay,
            ease: [0.8, 0.05, 0.2, 0.95],
          }}
          className="absolute bottom-0 w-full rounded-t-full"
          style={{ backgroundColor: color, maxHeight: '100%' }}
        />
      </div>
      <span className="text-xs font-semibold text-text-primary">{score}%</span>
    </div>
  );
}

function DemoWidget() {
  return (
    <CardFeatureMedia className="relative w-full max-w-md overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Live demo
          </p>
          <h3 className="mt-1 text-lg font-bold text-text-primary">
            Contribution breakdown
          </h3>
        </div>
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="rounded-control bg-surface-forest px-3 py-1 text-xs font-semibold text-accent-lime"
        >
          Objective
        </motion.span>
      </div>

      <div className="flex items-end justify-between gap-3 px-2">
        {demoMembers.map((member, index) => (
          <AnimatedBar
            key={member.name}
            score={member.score}
            color={member.color}
            delay={0.4 + index * 0.1}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {demoMembers.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + index * 0.08, duration: 0.4 }}
            className="flex items-center justify-between rounded-control bg-surface-muted px-3 py-2"
          >
            <span className="text-xs font-medium text-text-secondary">
              {member.name}
            </span>
            <span className="text-xs font-bold text-text-primary">
              {member.score}%
            </span>
          </motion.div>
        ))}
      </div>

      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-lime/30" aria-hidden="true" />
    </CardFeatureMedia>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-surface-hero pt-32 pb-20 lg:pt-44 lg:pb-32"
    >
      <motion.div
        style={{ y, opacity }}
        className="container-content"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <h1
              className="font-display text-5xl text-text-primary md:text-7xl lg:text-display-lg max-w-4xl"
              style={{ lineHeight: 0.85 }}
            >
              <SplitText delay={0.1}>Contribution, finally visible.</SplitText>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: [0.8, 0.05, 0.2, 0.95] }}
              className="mt-6 max-w-lg text-lg text-text-secondary md:text-body-md"
            >
              Stop guessing who did the work. Truth Layer turns Google Docs
              edits and GitHub commits into objective, anti-gamed contribution
              scores — so every team member gets fair credit.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7, ease: [0.8, 0.05, 0.2, 0.95] }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <MagneticButton>
                <ButtonPrimaryHero
                  onClick={() => navigate('/projects')}
                  className="h-12 px-6 text-base"
                >
                  Try it free for your team
                </ButtonPrimaryHero>
              </MagneticButton>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <MagneticButton>
                  <ButtonPrimaryHero className="h-12 px-6 text-base bg-white text-text-primary hover:bg-white/80">
                    See how it works
                  </ButtonPrimaryHero>
                </MagneticButton>
              </a>
            </motion.div>
          </div>

          <Parallax speed={0.3} direction="down" className="flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 60, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 1,
                delay: 0.3,
                ease: [0.8, 0.05, 0.2, 0.95],
              }}
              style={{ perspective: 1000 }}
            >
              <DemoWidget />
            </motion.div>
          </Parallax>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
    </section>
  );
}
