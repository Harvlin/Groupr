import { useState } from 'react';
import { Link, useLocation, Outlet, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Compass,
  Link2,
  MessageSquareWarning,
  Bot,
  Shield,
  Menu,
  X,
  ChevronLeft,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useProject } from '@/hooks/useProject';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const appLinks = [
  { label: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { label: 'Team', href: 'team', icon: Users },
  { label: 'Coach', href: 'coach', icon: Compass },
  { label: 'Tasks', href: 'tasks', icon: ClipboardList },
  { label: 'Sources', href: 'sources', icon: Link2 },
  { label: 'Disputes', href: 'disputes', icon: MessageSquareWarning },
  { label: 'AI Disclosure', href: 'ai-disclosure', icon: Bot },
];

export function AppShell({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const { projectId } = useParams<{ projectId?: string }>();
  const { project, isLoading } = useProject();
  const { currentUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isProjectArea = location.pathname.startsWith('/projects/');
  if (!isProjectArea) return <Outlet />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-muted">
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-sm">
          <div className="container-content flex h-16 items-center">
            <div className="h-4 w-32 animate-pulse rounded bg-black/10" />
          </div>
        </header>
        <main className="container-content py-10">
          <div className="h-96 animate-pulse rounded-card bg-white" />
        </main>
      </div>
    );
  }

  const pathSegment = location.pathname.split('/').pop() ?? 'dashboard';
  const initials = currentUser
    ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : '??';

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-sm">
        <div className="container-content flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/projects"
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary md:flex"
            >
              <ChevronLeft size={16} />
              Projects
            </Link>

            <Link
              to={projectId ? `/projects/${projectId}/dashboard` : '/projects'}
              className="flex min-w-0 items-center"
            >
              <span
                className="font-display text-xl tracking-tight text-text-primary"
                style={{ lineHeight: 0.9 }}
              >
                Groupr
              </span>
            </Link>

            {project && (
              <>
                <span className="hidden text-text-tertiary md:block">/</span>
                <span className="hidden max-w-[12rem] truncate text-sm font-medium text-text-secondary md:block">
                  {project.name}
                </span>
              </>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {appLinks.map((link) => {
              const Icon = link.icon;
              const active = pathSegment === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'group relative flex items-center gap-2 rounded-control px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-surface-forest text-accent-lime'
                      : 'text-text-secondary hover:bg-black/[0.04] hover:text-text-primary'
                  )}
                >
                  <Icon size={16} />
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-accent-lime" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="hidden items-center gap-2 md:flex">
            <NotificationBell />
            <Link
              to={projectId ? `/projects/${projectId}/settings` : '/projects'}
              aria-label="Project settings"
              className="flex h-9 w-9 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent-lime"
            >
              <Settings size={18} />
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-lime font-display text-sm font-black text-text-primary">
              {initials}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="text-text-primary md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle app menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.8, 0.05, 0.2, 0.95] }}
              className="overflow-hidden border-t border-black/5 bg-white px-6 md:hidden"
            >
              <div className="flex flex-col gap-1 py-4">
                {appLinks.map((link) => {
                  const Icon = link.icon;
                  const active = pathSegment === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-control px-3 py-3 text-sm font-medium',
                        active
                          ? 'border-l-[3px] border-accent-lime bg-surface-forest text-accent-lime'
                          : 'text-text-secondary hover:bg-surface-muted'
                      )}
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="my-2 h-px bg-black/5" />

                <Link
                  to={projectId ? `/projects/${projectId}/settings` : '/projects'}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-control px-3 py-3 text-sm font-medium text-text-secondary hover:bg-surface-muted"
                >
                  <Settings size={18} />
                  Settings
                </Link>

                <Link
                  to="/privacy"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-control px-3 py-3 text-sm font-medium text-text-secondary hover:bg-surface-muted"
                >
                  <Shield size={18} />
                  Privacy
                </Link>

                <Link
                  to="/projects"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-control px-3 py-3 text-sm font-medium text-text-secondary hover:bg-surface-muted"
                >
                  <ChevronLeft size={18} />
                  All projects
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="main-content" className="min-h-[calc(100vh-64px)]">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
