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

  const fetchNotifications = useCallback(async () => {
    const hasToken = !!localStorage.getItem('truth_layer_access_token');
    if (backendEnabled && !hasToken) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getNotifications();
      let readSet = new Set<string>();
      try {
        const saved = localStorage.getItem('tl-read-notifications');
        if (saved) readSet = new Set(JSON.parse(saved));
      } catch {
        // Ignore localStorage errors
      }

      const merged = data.map((n) =>
        readSet.has(n.id) ? { ...n, isRead: true } : n
      );
      setNotifications(merged);
    } catch {
      // Ignore API errors for background polling
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      const readIds = next.filter((n) => n.isRead).map((n) => n.id);
      try {
        localStorage.setItem('tl-read-notifications', JSON.stringify(readIds));
      } catch {
        // ignore
      }
      return next;
    });
    api.markNotificationRead(id).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, isRead: true }));
      const readIds = next.map((n) => n.id);
      try {
        localStorage.setItem('tl-read-notifications', JSON.stringify(readIds));
      } catch {
        // ignore
      }
      return next;
    });
    api.markAllNotificationsRead().catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, markRead, markAllRead, isLoading, refetch: fetchNotifications }),
    [notifications, unreadCount, markRead, markAllRead, isLoading, fetchNotifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
