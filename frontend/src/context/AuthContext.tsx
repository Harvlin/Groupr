/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { api } from '@/services/api';
import type { AuthContextValue, AuthUser } from '@/types';

const STORAGE_KEY = 'truth_layer_user';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setCurrentUser(parsed);
        // Cast to any to bypass type mismatch between AuthUser and SessionUser if api.setCurrentUser expects SessionUser
        api.setCurrentUser(parsed as any);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setInitialising(false);
  }, []);

  const persist = useCallback((user: AuthUser | null) => {
    setCurrentUser(user);
    api.setCurrentUser(user as any);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      // In real app, api.login returns AuthUser. Here we might need to cast
      const user = await api.login(email, password) as unknown as AuthUser;
      
      // Temporary mock mapping if the mock user doesn't have all AuthUser fields
      const authUser: AuthUser = {
        ...user,
        role: user.role === 'teacher' ? 'teacher' : 'student',
        school: (user as any).school || 'Default School',
        grade: (user as any).grade || 'Grade 12',
        avatarInitials: (user as any).avatarInitials || user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
        createdAt: (user as any).createdAt || new Date().toISOString()
      };
      
      persist(authUser);
      return authUser;
    },
    [persist]
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: 'student' | 'teacher'
    ) => {
      const user = await api.register(name, email, password, role) as unknown as AuthUser;
      
      const authUser: AuthUser = {
        ...user,
        role,
        school: 'Default School',
        grade: 'Grade 12',
        avatarInitials: name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
        createdAt: new Date().toISOString()
      };
      
      persist(authUser);
      return authUser;
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading: initialising,
      login,
      register,
      logout,
    }),
    [currentUser, initialising, login, register, logout]
  );

  if (initialising) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-forest border-t-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
