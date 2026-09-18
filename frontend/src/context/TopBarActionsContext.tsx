/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface TopBarAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'glass';
  icon?: React.ReactNode;
}

interface TopBarActionsContextValue {
  actions: TopBarAction[];
  setActions: (actions: TopBarAction[]) => void;
  clearActions: () => void;
}

export const TopBarActionsContext = createContext<TopBarActionsContextValue | null>(null);

export function TopBarActionsProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActionsState] = useState<TopBarAction[]>([]);

  const setActions = useCallback((next: TopBarAction[]) => {
    setActionsState(next);
  }, []);

  const clearActions = useCallback(() => {
    setActionsState([]);
  }, []);

  const value = useMemo(
    () => ({ actions, setActions, clearActions }),
    [actions, setActions, clearActions]
  );

  return (
    <TopBarActionsContext.Provider value={value}>
      {children}
    </TopBarActionsContext.Provider>
  );
}

export function useTopBarActions() {
  const ctx = useContext(TopBarActionsContext);
  if (!ctx) throw new Error('useTopBarActions must be used within TopBarActionsProvider');
  return ctx;
}
