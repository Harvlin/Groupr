import { FileText, Github, Presentation, Table2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const integrations = [
  { name: 'Google Docs', icon: FileText, available: true },
  { name: 'GitHub', icon: Github, available: true },
  { name: 'Google Slides', icon: Presentation, available: false },
  { name: 'Google Sheets', icon: Table2, available: false },
  { name: 'Notion', icon: Table2, available: false },
  { name: 'GitLab', icon: Github, available: false },
];

function IntegrationChip({
  item,
}: {
  item: (typeof integrations)[number];
}) {
  const Icon = item.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="group flex cursor-default items-center gap-3 rounded-control border border-black/10 bg-white px-5 py-3 transition-colors hover:border-surface-forest hover:bg-white"
    >
      <Icon
        size={20}
        className="text-text-primary transition-transform duration-300 group-hover:scale-110"
      />
      <span className="whitespace-nowrap text-sm font-semibold text-text-primary">
        {item.name}
      </span>
      {!item.available && (
        <span className="rounded-control bg-black/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-primary transition-colors group-hover:bg-accent-lime group-hover:text-surface-forest">
          Soon
        </span>
      )}
    </motion.div>
  );
}

export function IntegrationRail() {
  const duplicated = [...integrations, ...integrations, ...integrations, ...integrations];

  return (
    <section className="bg-surface-hero py-12">
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-between"
        >
          <p className="text-sm font-semibold text-text-primary/70">
            Works with the tools your team already uses
          </p>
          <span className="flex items-center gap-1 text-sm font-semibold text-text-primary">
            More soon <ArrowRight size={16} />
          </span>
        </motion.div>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-surface-hero to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-surface-hero to-transparent" />

        <motion.div
          className="flex w-max gap-4"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 35,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {duplicated.map((item, index) => (
            <IntegrationChip key={`${item.name}-${index}`} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
