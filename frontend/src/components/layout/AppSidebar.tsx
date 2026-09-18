import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Compass,
  ListChecks,
  Link2,
  MessageSquareWarning,
  ShieldCheck,
  Settings,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  User,
  GraduationCap,
  LogOut,
  X,
} from 'lucide-react';
import { Avatar, getInitials } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useOptionalProject } from '@/hooks/useProject';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface AppSidebarProps {
  mode: 'global' | 'project';
  onMobileOpenChange?: (open: boolean) => void;
  isMobileOpen?: boolean;
}

// ─── Nav item component ───────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        to={item.href}
        aria-current={isActive ? 'page' : undefined}
        title={collapsed ? item.label : undefined}
        className={cn(
          'group flex h-11 w-full items-center gap-3 rounded-control px-4 text-body-md font-medium transition-colors duration-micro',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-accent-lime text-text-primary'
            : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent-lime focus-visible:outline-offset-2'
        )}
      >
        <Icon size={20} className="shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    </li>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

const COLLAPSED_KEY = 'sidebar_collapsed';

export function AppSidebar({ mode, isMobileOpen, onMobileOpenChange }: AppSidebarProps) {
  const location = useLocation();
  const { projectId } = useParams<{ projectId?: string }>();
  const { currentUser, logout } = useAuth();
  const { notifications } = useNotifications();
  const projectContext = useOptionalProject();
  const project = projectContext?.project;
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch { /* ignore */ }
  }, [collapsed]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!isMobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileOpenChange?.(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isMobileOpen, onMobileOpenChange]);

  // Build nav items based on mode
  const globalItems: NavItem[] = [
    { label: 'Projects', href: '/projects', icon: FolderOpen },
    { label: 'Profile', href: '/profile', icon: User },
    ...(currentUser?.role === 'teacher'
      ? [{ label: 'Teacher view', href: '/teacher', icon: GraduationCap }]
      : []),
  ];

  const projectItems: NavItem[] = projectId
    ? [
        { label: 'Dashboard', href: `/projects/${projectId}/dashboard`, icon: LayoutDashboard },
        { label: 'Team', href: `/projects/${projectId}/team`, icon: Users },
        { label: 'Coach', href: `/projects/${projectId}/coach`, icon: Compass },
        { label: 'Tasks', href: `/projects/${projectId}/tasks`, icon: ListChecks },
        { label: 'Sources', href: `/projects/${projectId}/sources`, icon: Link2 },
        { label: 'Disputes', href: `/projects/${projectId}/disputes`, icon: MessageSquareWarning },
        { label: 'AI Disclosure', href: `/projects/${projectId}/ai-disclosure`, icon: ShieldCheck },
      ]
    : [];

  const navItems = mode === 'global' ? globalItems : projectItems;
  const settingsHref = projectId ? `/projects/${projectId}/settings` : '/profile';

  // Active check: match path end segment or full path
  function isActive(href: string) {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  }

  const initials = getInitials(currentUser?.name ?? 'U');
  const isTeacher = currentUser?.role === 'teacher';

  // ─── Sidebar content ───────────────────────────────────────────────────────

  const sidebarContent = (
    <div
      className={cn(
        'flex h-full flex-col border-r border-black/[0.06] bg-white transition-[width] duration-standard',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
      )}
    >
      {/* Header */}
      <div className="relative flex h-16 shrink-0 items-center border-b border-black/[0.06] px-4">
        {!collapsed && (
          <Link
            to={mode === 'global' ? '/projects' : `/projects/${projectId}/dashboard`}
            className="font-display text-[20px] font-black tracking-tight text-text-primary"
          >
            Truth Layer
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className={cn(
            'absolute right-3 flex h-6 w-6 items-center justify-center rounded-control text-text-tertiary transition-colors duration-micro hover:bg-surface-muted hover:text-text-primary',
            collapsed && 'right-auto left-1/2 -translate-x-1/2'
          )}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav body */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4">
        {/* Project mode: back link + project name */}
        {mode === 'project' && !collapsed && (
          <div className="mb-4">
            <Link
              to="/projects"
              className="flex items-center gap-1.5 text-body-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <ChevronLeft size={14} />
              All projects
            </Link>
            {project && (
              <p className="mt-3 mb-1 truncate px-1 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                {project.name}
              </p>
            )}
          </div>
        )}

        {/* Main nav items */}
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </ul>

        {/* Settings (project mode only) */}
        {mode === 'project' && (
          <>
            <div className="my-4 h-px bg-black/[0.06]" />
            <ul className="flex flex-col gap-1">
              <SidebarNavItem
                item={{ label: 'Settings', href: settingsHref, icon: Settings }}
                isActive={isActive(settingsHref)}
                collapsed={collapsed}
              />
            </ul>
          </>
        )}
      </nav>

      {/* Footer: avatar + user info + notification bell */}
      <div
        className={cn(
          'relative shrink-0 border-t border-black/[0.06] px-3 py-3',
          collapsed && 'flex flex-col items-center gap-2'
        )}
        ref={dropdownRef}
      >
        {/* Notification bell (collapsed: standalone; expanded: inline) */}
        {collapsed ? (
          <button
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-warning text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        ) : null}

        {/* User row */}
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          aria-label="User menu"
          aria-expanded={dropdownOpen}
          className={cn(
            'flex w-full items-center gap-3 rounded-control p-2 text-left transition-colors hover:bg-surface-muted',
            collapsed && 'justify-center'
          )}
        >
          <Avatar initials={initials} size={32} colorIndex={0} title={currentUser?.name} />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-semibold text-text-primary leading-tight">
                  {currentUser?.name ?? 'User'}
                </p>
                <p className="text-label-sm text-text-tertiary capitalize">{currentUser?.role ?? 'student'}</p>
              </div>
              {/* Notification bell inline */}
              <button
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-text-tertiary transition-colors hover:bg-black/[0.04] hover:text-text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-warning text-[8px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <ChevronDown size={14} className="shrink-0 text-text-tertiary" />
            </>
          )}
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {dropdownOpen && !collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-3 right-3 mb-1 rounded-card border border-black/[0.06] bg-white py-1 shadow-hairline"
            >
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                <User size={16} />
                View profile
              </Link>
              {isTeacher && (
                <Link
                  to="/teacher"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                >
                  <GraduationCap size={16} />
                  Teacher dashboard
                </Link>
              )}
              <div className="my-1 h-px bg-black/[0.06]" />
              <button
                onClick={() => { logout(); setDropdownOpen(false); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-body-sm text-text-secondary transition-colors hover:bg-surface-muted hover:text-accent-warning"
              >
                <LogOut size={16} />
                Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // ─── Mobile drawer ─────────────────────────────────────────────────────────

  return (
    <>
      {/* Desktop */}
      <div
        className={cn(
          'hidden md:block shrink-0 transition-[width] duration-standard',
          collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
        )}
        style={{ height: '100vh' }}
      >
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-text-primary/50 md:hidden"
              onClick={() => onMobileOpenChange?.(false)}
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed inset-y-0 left-0 z-50 w-sidebar md:hidden"
            >
              {/* Close button */}
              <button
                onClick={() => onMobileOpenChange?.(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-control text-text-tertiary hover:bg-surface-muted"
              >
                <X size={20} />
              </button>
              {/* Full sidebar content (never collapsed on mobile) */}
              <div className="flex h-full flex-col border-r border-black/[0.06] bg-white">
                <div className="flex h-16 shrink-0 items-center border-b border-black/[0.06] px-4">
                  <span className="font-display text-[20px] font-black tracking-tight text-text-primary">
                    Truth Layer
                  </span>
                </div>
                <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4">
                  {mode === 'project' && (
                    <div className="mb-4">
                      <Link
                        to="/projects"
                        onClick={() => onMobileOpenChange?.(false)}
                        className="flex items-center gap-1.5 text-body-sm text-text-secondary"
                      >
                        <ChevronLeft size={14} />
                        All projects
                      </Link>
                      {project && (
                        <p className="mt-3 mb-1 truncate px-1 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                          {project.name}
                        </p>
                      )}
                    </div>
                  )}
                  <ul className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          aria-current={isActive(item.href) ? 'page' : undefined}
                          onClick={() => onMobileOpenChange?.(false)}
                          className={cn(
                            'flex h-11 w-full items-center gap-3 rounded-control px-4 text-body-md font-medium transition-colors duration-micro',
                            isActive(item.href)
                              ? 'bg-accent-lime text-text-primary'
                              : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                          )}
                        >
                          <item.icon size={20} className="shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {mode === 'project' && (
                    <>
                      <div className="my-4 h-px bg-black/[0.06]" />
                      <ul>
                        <li>
                          <Link
                            to={settingsHref}
                            onClick={() => onMobileOpenChange?.(false)}
                            className={cn(
                              'flex h-11 w-full items-center gap-3 rounded-control px-4 text-body-md font-medium transition-colors',
                              isActive(settingsHref)
                                ? 'bg-accent-lime text-text-primary'
                                : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                            )}
                          >
                            <Settings size={20} />
                            Settings
                          </Link>
                        </li>
                      </ul>
                    </>
                  )}
                </nav>
                <div className="border-t border-black/[0.06] px-3 py-3">
                  <div className="flex items-center gap-3 rounded-control p-2">
                    <Avatar initials={initials} size={32} colorIndex={0} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-semibold text-text-primary">
                        {currentUser?.name ?? 'User'}
                      </p>
                      <p className="text-label-sm text-text-tertiary capitalize">{currentUser?.role ?? 'student'}</p>
                    </div>
                    <button
                      onClick={() => { logout(); onMobileOpenChange?.(false); }}
                      aria-label="Log out"
                      className="flex h-9 w-9 items-center justify-center rounded-control text-text-tertiary hover:bg-surface-muted"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
