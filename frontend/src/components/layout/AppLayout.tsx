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
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <AppSidebar
          mode={mode}
          isMobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <TopBar mode={mode} onMobileMenuOpen={() => setMobileOpen(true)} />
          <main
            id="main-content"
            style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', backgroundColor: '#ecf9f9', minHeight: 0 }}
          >
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </TopBarActionsProvider>
  );
}
