import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ButtonNavCta } from '@/components/ui';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Product', href: '/#features' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Privacy', href: '/privacy' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      setHidden(currentY > lastScrollY && currentY > 100);
      setLastScrollY(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.35, ease: [0.8, 0.05, 0.2, 0.95] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-350 ease-wise',
        scrolled || !isLanding
          ? 'bg-white/95 backdrop-blur-sm border-b border-black/5'
          : 'bg-transparent'
      )}
    >
      <nav className="container-content flex h-20 items-center justify-between">
        <Link
          to="/"
          className="font-display text-2xl tracking-tight text-text-primary"
          style={{ lineHeight: 0.9 }}
        >
          Truth Layer
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="group relative text-sm font-medium text-text-primary transition-colors hover:text-text-secondary"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-text-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <Link to="/projects">
            <ButtonNavCta>Try it free</ButtonNavCta>
          </Link>
        </div>

        <button
          className="text-text-primary md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.8, 0.05, 0.2, 0.95] }}
            className="overflow-hidden border-b border-black/10 bg-white px-6 md:hidden"
          >
            <div className="flex flex-col gap-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/projects" onClick={() => setIsOpen(false)}>
                <ButtonNavCta className="w-full">Try it free</ButtonNavCta>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
