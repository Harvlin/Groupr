import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { TopBarActionsProvider } from '@/context/TopBarActionsContext';

export interface AppLayoutProps {
  mode: 'global' | 'project';
  children?: React.ReactNode;
}

/**
 * Root layout wrapper used by all protected routes.
 * Composes AppSidebar + TopBar + scrollable content area.
 *
 * Usage in routes:
 *   <AppLayout mode="global"> → /projects, /profile, /teacher
 *   <AppLayout mode="project"> → /projects/:id/* (must be inside ProjectProvider)
 */
export function AppLayout({ mode, children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TopBarActionsProvider>
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Sidebar */}
        <AppSidebar
          mode={mode}
          isMobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />

        {/* Content column */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar mode={mode} onMobileMenuOpen={() => setMobileOpen(true)} />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto bg-white"
          >
            <div className="py-8 lg:py-10">
              {children ?? <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </TopBarActionsProvider>
  );
}
