import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'invitation': return '✉';
    case 'early_warning': return '⚠';
    case 'corroboration_request': return '✋';
    case 'dispute_resolved': return '⚖';
    default: return '•';
  }
}

function getTypeColor(type: NotificationType) {
  switch (type) {
    case 'invitation': return 'text-accent-lime';
    case 'early_warning': return 'text-accent-warning';
    default: return 'text-accent-blue';
  }
}

function NotificationRow({ notif, onClose }: { notif: Notification; onClose: () => void }) {
  const { markRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = () => {
    markRead(notif.id);
    onClose();
    if (notif.actionRoute) navigate(notif.actionRoute);
  };

  const timeAgo = formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true });

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex w-full items-start gap-3 border-b border-border-hairline/20 px-4 py-3 text-left transition-colors hover:bg-surface-muted',
        !notif.isRead && 'bg-white'
      )}
    >
      {!notif.isRead && (
        <span className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent-lime" />
      )}
      <span className={cn('mt-0.5 shrink-0 text-base', getTypeColor(notif.type))}>
        {getTypeIcon(notif.type)}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm text-text-primary leading-snug', !notif.isRead ? 'font-medium' : 'font-normal')}>
          {notif.message}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-hairline border border-border-hairline/30 px-1.5 py-0.5 text-xs text-text-tertiary">
            {notif.projectName}
          </span>
          <span className="text-xs text-text-tertiary">{timeAgo}</span>
        </div>
      </div>
    </button>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayCount = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications — ${unreadCount} unread`}
        className="relative flex h-9 w-9 items-center justify-center rounded-control bg-black/[0.07] text-text-primary transition-colors hover:bg-black/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lime"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-lime text-[10px] font-bold text-text-primary leading-none">
            {displayCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-card border border-border-hairline bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-hairline/20 px-4 py-3">
            <span className="text-sm font-semibold text-text-primary">Notifications</span>
            <button
              onClick={() => markAllRead()}
              className="text-xs text-accent-blue hover:underline focus-visible:outline-2 focus-visible:outline-accent-lime"
            >
              Mark all read
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Bell size={36} className="text-text-tertiary" />
                <p className="mt-2 text-sm text-text-secondary">You&apos;re all caught up</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationRow key={n.id} notif={n} onClose={() => setOpen(false)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
