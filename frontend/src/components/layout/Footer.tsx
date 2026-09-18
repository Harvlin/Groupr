import { Link } from 'react-router-dom';
import { Github, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedSection } from '@/components/AnimatedSection';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Projects', href: '/projects' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'GitHub Repo', href: '#', external: true },
      { label: 'Devpost', href: '#', external: true },
      { label: 'Projects', href: '/projects' },
    ],
  },
  {
    title: 'Team',
    links: [
      { label: 'Contact', href: 'mailto:team@truthlayer.dev' },
      { label: 'Twitter / X', href: '#', external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-black/5">
      <div className="container-content py-16 lg:py-20">
        <AnimatedSection>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link
                to="/"
                className="font-display text-3xl text-text-primary"
                style={{ lineHeight: 0.9 }}
              >
                Truth Layer
              </Link>
              <p className="mt-4 max-w-sm text-text-secondary body-dense">
                Objective contribution verification for group work. Built for
                students, teachers, and teams who care about fairness.
              </p>
            </div>

            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="mb-4 text-sm font-semibold text-text-primary">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
                        >
                          {link.label}
                          <ExternalLink size={12} />
                        </a>
                      ) : link.href.startsWith('mailto') ? (
                        <a
                          href={link.href}
                          className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-black/5 pt-8 lg:flex-row lg:items-center">
            <p className="max-w-2xl font-legal text-xs leading-relaxed text-text-tertiary">
              Truth Layer processes only documents and repositories explicitly
              connected by your team. Raw content is retained only for the minimum
              period required to compute scores and resolve disputes, then
              purged. This is a hackathon demo; do not use it for grading real
              students without institutional review.
            </p>
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <Github size={18} />
              Source
            </motion.a>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}
