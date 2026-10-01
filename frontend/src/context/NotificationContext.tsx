/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { api } from '@/services/api';
import { backendEnabled } from '@/services/httpClient';
import type { Notification, NotificationContextValue } from '@/types';

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch notifications when we have a token (i.e. the user is logged in).
    // Without this guard, the context fires an authenticated request on every
    // page load — including the login page — which returns a 401.
    const hasToken = !!localStorage.getItem('truth_layer_access_token');
    if (backendEnabled && !hasToken) {
      setIsLoading(false);
      return;
    }

    api.getNotifications().then((data) => {
      // Load persisted read states
      const saved = localStorage.getItem('tl-read-notifications');
      const readSet = saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();

      const merged = data.map((n) =>
        readSet.has(n.id) ? { ...n, isRead: true } : n
      );
      setNotifications(merged);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      const readIds = next.filter((n) => n.isRead).map((n) => n.id);
      localStorage.setItem('tl-read-notifications', JSON.stringify(readIds));
      return next;
    });
    api.markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, isRead: true }));
      const readIds = next.filter((n) => n.isRead).map((n) => n.id);
      localStorage.setItem('tl-read-notifications', JSON.stringify(readIds));
      return next;
    });
    api.markAllNotificationsRead();
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, markRead, markAllRead, isLoading }),
    [notifications, unreadCount, markRead, markAllRead, isLoading]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
