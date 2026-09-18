import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ButtonPrimaryHero } from '@/components/ui';
import { MagneticButton } from '@/components/MagneticButton';
import { SplitText } from '@/components/SplitText';
import { Parallax } from '@/components/Parallax';

export function LandingCTA() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-surface-hero py-24 lg:py-32">
      <Parallax speed={0.2} className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute -left-20 top-20 h-[300px] w-[300px] rounded-full bg-white/40 blur-3xl" />
        <div className="absolute -right-20 bottom-20 h-[300px] w-[300px] rounded-full bg-white/40 blur-3xl" />
      </Parallax>

      <div className="container-content relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.8, 0.05, 0.2, 0.95] }}
        >
          <h2
            className="mx-auto max-w-3xl font-display text-4xl text-text-primary md:text-5xl lg:text-headline-md"
            style={{ lineHeight: 0.85 }}
          >
            <SplitText delay={0.1}>Ready to make contribution visible?</SplitText>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-text-secondary">
            Join the teams proving that fair grading starts with fair data.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton>
              <ButtonPrimaryHero
                onClick={() => navigate('/projects')}
                className="h-12 px-8 text-base"
              >
                Try it free for your team
              </ButtonPrimaryHero>
            </MagneticButton>
            <a href="mailto:team@truthlayer.dev">
              <ButtonPrimaryHero className="h-12 bg-white px-8 text-base text-text-primary hover:bg-white/80">
                Contact us
              </ButtonPrimaryHero>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
