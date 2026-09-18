import { useLocation, useParams, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTopBarActions } from '@/context/TopBarActionsContext';
import { cn } from '@/lib/utils';

const PAGE_NAMES: Record<string, string> = {
  dashboard: 'Dashboard',
  team: 'Team',
  coach: 'Coach',
  tasks: 'Tasks',
  sources: 'Sources',
  disputes: 'Disputes',
  'ai-disclosure': 'AI Disclosure',
  'offline-log': 'Offline Log',
  'teacher-report': 'Teacher Report',
  settings: 'Settings',
  projects: 'Projects',
  profile: 'Profile',
  teacher: 'Teacher view',
};

interface TopBarProps {
  mode: 'global' | 'project';
  onMobileMenuOpen: () => void;
}

export function TopBar({ mode, onMobileMenuOpen }: TopBarProps) {
  const location = useLocation();
  const { projectId } = useParams<{ projectId?: string }>();
  const { actions } = useTopBarActions();

  // Build breadcrumb segments
  const segments = location.pathname.split('/').filter(Boolean);
  const currentSegment = segments[segments.length - 1] ?? '';
  const currentPageName = PAGE_NAMES[currentSegment] ?? currentSegment;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/[0.06] bg-white px-4 md:px-6">
      {/* Left: hamburger (mobile) + breadcrumb (desktop) */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary md:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Desktop breadcrumb */}
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-body-sm">
          {mode === 'project' && projectId ? (
            <>
              <Link
                to="/projects"
                className="text-text-tertiary transition-colors hover:text-accent-blue"
              >
                Projects
              </Link>
              <span className="text-text-tertiary">/</span>
              <span className="font-semibold text-text-primary">{currentPageName}</span>
            </>
          ) : (
            <span className="font-semibold text-text-primary">{currentPageName}</span>
          )}
        </nav>
      </div>

      {/* Right: page-specific actions */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={cn(
                'inline-flex items-center gap-2 rounded-control px-4 py-2 text-body-sm font-medium transition-colors duration-micro',
                action.variant === 'primary'
                  ? 'bg-surface-forest text-accent-lime hover:bg-surface-forest/90'
                  : 'border border-black/10 bg-white text-text-primary hover:bg-surface-muted'
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
