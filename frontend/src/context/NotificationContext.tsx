/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { api } from '@/services/api';
import type { Notification, NotificationContextValue } from '@/types';

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getNotifications().then((data) => {
      setNotifications(data);
      setIsLoading(false);
    });
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    api.markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
