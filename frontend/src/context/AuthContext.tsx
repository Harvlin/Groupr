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

  /** Build an AuthUser from the raw backend AuthResponse shape */
  function buildAuthUser(raw: any, roleOverride?: 'student' | 'teacher'): AuthUser {
    const name: string = raw.name ?? raw.displayName ?? '';
    const role: 'student' | 'teacher' = roleOverride ?? (raw.role === 'teacher' ? 'teacher' : 'student');
    // Derive initials client-side as a fallback in case the backend omits them
    const avatarInitials: string =
      raw.avatarInitials ||
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase() ||
      '?';
    return {
      id: raw.id,
      name,
      email: raw.email,
      role,
      school: raw.school ?? null,
      grade: raw.grade ?? null,
      avatarInitials,
      createdAt: raw.createdAt ?? new Date().toISOString(),
    };
  }

  const login = useCallback(
    async (email: string, password: string) => {
      const raw = await api.login(email, password);
      const authUser = buildAuthUser(raw);
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
      const raw = await api.register(name, email, password, role);
      // Pass the intended role as override since the backend echoes the stored role
      // and a brand-new account might not have school/grade yet
      const authUser = buildAuthUser(raw, role);
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
