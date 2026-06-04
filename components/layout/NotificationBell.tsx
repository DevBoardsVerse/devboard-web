'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Activity, X } from 'lucide-react';
import { socket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import type { ActivityLog } from '@/lib/queries';

const MAX_NOTIFICATIONS = 20;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    task_created:        'created a task',
    task_updated:        'updated a task',
    task_status_changed: 'changed task status',
    task_assigned:       'assigned a task',
    task_deleted:        'deleted a task',
    member_invited:      'invited a member',
    member_role_changed: 'updated member role',
    member_removed:      'removed a member',
    project_created:     'created a project',
  };
  return map[action] ?? action.toLowerCase().replace(/_/g, ' ');
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<ActivityLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Listen to activity.new from WebSocket
  useEffect(() => {
    const handler = (log: ActivityLog) => {
      setNotifications(prev => [log, ...prev].slice(0, MAX_NOTIFICATIONS));
      if (!open) setUnreadCount(c => c + 1);
    };
    socket.on('activity.new', handler);
    return () => { socket.off('activity.new', handler); };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(o => !o);
    setUnreadCount(0); // mark all read on open
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="w-8 h-8 flex items-center justify-center rounded-lg
          hover:bg-black/[0.06] dark:hover:bg-white/[0.06]
          text-black/40 dark:text-white/40
          hover:text-black/80 dark:hover:text-white/80
          transition-all relative"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-[#FAD4C0] text-[#0F0F0F] text-[9px] font-bold flex items-center justify-center px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {unreadCount === 0 && notifications.length === 0 && (
          // Static dot when no notifications — visual placeholder only
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
            <div className="flex items-center gap-2">
              <p className="text-black/85 dark:text-white/85 text-sm font-semibold">Notifications</p>
              {notifications.length > 0 && (
                <span className="text-[10px] bg-black/[0.06] dark:bg-white/[0.06] text-black/40 dark:text-white/40 px-1.5 py-0.5 rounded-full font-medium">
                  {notifications.length}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] text-black/30 dark:text-white/30 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <X size={11} /> Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <Activity size={24} className="text-black/15 dark:text-white/15" />
                <p className="text-black/25 dark:text-white/25 text-xs">No notifications yet</p>
                <p className="text-black/15 dark:text-white/15 text-[11px]">Activity will appear here in real-time</p>
              </div>
            ) : (
              notifications.map((log, i) => (
                <div
                  key={log.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 transition-colors',
                    'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]',
                    i < notifications.length - 1 && 'border-b border-black/[0.04] dark:border-white/[0.04]'
                  )}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FAD4C0]/30 to-[#80A1C1]/30 border border-black/10 dark:border-white/10 flex items-center justify-center text-[9px] font-bold text-black/60 dark:text-white/60 flex-shrink-0 mt-0.5">
                    {log.actor?.firstName?.[0]?.toUpperCase() ?? '?'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-black/70 dark:text-white/70 text-xs leading-relaxed">
                      <span className="text-black/90 dark:text-white/90 font-medium">
                        {log.actor?.firstName} {log.actor?.lastName}
                      </span>
                      {' '}{actionLabel(log.action)}
                      {log.metadata?.title && (
                        <span className="text-[#FAD4C0]/80"> "{log.metadata.title}"</span>
                      )}
                    </p>
                    <p className="text-black/25 dark:text-white/25 text-[10px] mt-0.5">{timeAgo(log.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}