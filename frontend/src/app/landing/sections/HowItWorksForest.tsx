import { motion } from 'framer-motion';
import { CardForestPanel } from '@/components/ui';
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from '@/components/AnimatedSection';
import { SplitText } from '@/components/SplitText';
import { Link2, BrainCircuit, FileBarChart } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Link2,
    title: 'Connect your sources',
    body: 'Link the Google Doc, GitHub repo, or file your team is already using. Every member consents before data is analyzed.',
  },
  {
    number: '02',
    icon: BrainCircuit,
    title: 'Normalize & classify',
    body: 'We extract every edit, remove duplicates and formatting noise, spread work across time, and classify contribution type with AI.',
  },
  {
    number: '03',
    icon: FileBarChart,
    title: 'Review the report',
    body: 'Students get a real-time dashboard. Teachers get an exportable, rationale-backed report — and a path to dispute or override.',
  },
];

export function HowItWorksForest() {
  return (
    <section id="how-it-works" className="bg-surface-forest py-20 lg:py-section-lg">
      <div className="container-content">
        <AnimatedSection className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-lime/70">
            How it works
          </p>
          <h2
            className="mt-3 font-display text-4xl text-accent-lime md:text-5xl lg:text-headline-md"
            style={{ lineHeight: 0.85 }}
          >
            <SplitText delay={0.1}>From activity to insight in three steps.</SplitText>
          </h2>
        </AnimatedSection>

        <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.15}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.number}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="h-full"
                >
                  <CardForestPanel className="flex h-full flex-col rounded-none p-8 shadow-hairline transition-shadow duration-350 hover:shadow-hairline-light">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="font-display text-3xl text-accent-lime/40">
                        {step.number}
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-lime text-surface-forest"
                      >
                        <Icon size={20} />
                      </motion.div>
                    </div>
                    <h3
                      className="font-display text-2xl text-accent-lime"
                      style={{ lineHeight: 0.9 }}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-3 text-accent-lime/80 body-dense">{step.body}</p>
                  </CardForestPanel>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
