import { Play } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

function DashboardMockup() {
  return (
    <svg
      viewBox="0 0 800 520"
      className="h-auto w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="800" height="520" rx="20" fill="#FFFFFF" />

      <rect x="24" y="20" width="140" height="16" rx="4" fill="#0E0F0C" />
      <circle cx="712" cy="28" r="10" fill="#ECF9F9" />
      <circle cx="742" cy="28" r="10" fill="#ECF9F9" />
      <circle cx="772" cy="28" r="10" fill="#ECF9F9" />

      <rect x="24" y="64" width="360" height="200" rx="16" fill="#FFFFFF" stroke="#101008" strokeOpacity="0.08" />
      <text x="44" y="100" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="#0E0F0C">
        Your contribution
      </text>
      <text x="44" y="150" fontFamily="Archivo Black, Inter Tight, sans-serif" fontSize="56" fontWeight="900" fill="#0E0F0C">
        42%
      </text>
      <rect x="44" y="172" width="84" height="26" rx="13" fill="#008026" />
      <text x="58" y="190" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" fill="#FFFFFF">
        High confidence
      </text>
      <rect x="44" y="220" width="140" height="8" rx="4" fill="#ECF9F9" />
      <rect x="44" y="220" width="95" height="8" rx="4" fill="#9FE870" />

      <rect x="408" y="64" width="368" height="200" rx="16" fill="#FFFFFF" stroke="#101008" strokeOpacity="0.08" />
      <text x="428" y="100" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="#0E0F0C">
        Category breakdown
      </text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="428" y={124 + i * 32} width="16" height="16" rx="4" fill={i === 0 ? '#9FE870' : '#ECF9F9'} />
          <rect x="452" y={128 + i * 32} width={i === 0 ? 120 : 80} height="8" rx="4" fill="#454745" fillOpacity="0.2" />
        </g>
      ))}

      <rect x="24" y="284" width="752" height="212" rx="16" fill="#FFFFFF" stroke="#101008" strokeOpacity="0.08" />
      <text x="44" y="320" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="#0E0F0C">
        Contribution timeline
      </text>
      <rect x="44" y="348" width="712" height="48" rx="8" fill="#ECF9F9" />
      <rect x="44" y="348" width="260" height="48" rx="8" fill="#9FE870" />
      <rect x="44" y="348" width="520" height="48" rx="8" fill="#163300" fillOpacity="0.08" />
      <rect x="44" y="412" width="712" height="56" rx="8" fill="#ECF9F9" />
    </svg>
  );
}

export function MediaBand() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section ref={ref} className="relative bg-white py-20 lg:py-32">
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.8, 0.05, 0.2, 0.95] }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
            Inside the app
          </p>
          <h2
            className="mx-auto mt-3 max-w-2xl font-display text-4xl text-text-primary md:text-5xl lg:text-headline-md"
            style={{ lineHeight: 0.85 }}
          >
            One dashboard. Full transparency.
          </h2>
        </motion.div>

        <motion.div
          style={{ y, scale }}
          className="mt-12"
        >
          <div className="relative overflow-hidden rounded-card bg-surface-muted p-2 lg:p-4">
            <div className="relative overflow-hidden rounded-[24px] bg-white shadow-hairline">
              <DashboardMockup />

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface-forest text-accent-lime transition-colors hover:bg-[#0D1F00]"
                aria-label="Play demo video"
              >
                <Play size={28} fill="currentColor" />
              </motion.button>
            </div>

            <p className="mt-5 text-center text-sm text-text-tertiary">
              The student dashboard: one score, full rationale, zero black boxes.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
