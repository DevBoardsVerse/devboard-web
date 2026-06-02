'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app';
import { useOrgActivity } from '@/lib/queries';
import { cn } from '@/lib/utils';
import {
  Activity, Calendar, CheckCircle2, Clock,
  AlertCircle, CircleDot, UserPlus, UserMinus,
  Shield, Paperclip, Loader2, FolderKanban,
} from 'lucide-react';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  task_created:        { label: 'created a task',      icon: CircleDot,    color: 'text-[#80A1C1]',  bg: 'bg-[#80A1C1]/10' },
  task_updated:        { label: 'updated a task',      icon: Clock,        color: 'text-[#D97706]',  bg: 'bg-[#D97706]/10' },
  task_status_changed: { label: 'changed task status', icon: AlertCircle,  color: 'text-[#FAD4C0]',  bg: 'bg-[#FAD4C0]/10' },
  task_assigned:       { label: 'assigned a task',     icon: CheckCircle2, color: 'text-[#16A34A]',  bg: 'bg-[#16A34A]/10' },
  task_deleted:        { label: 'deleted a task',      icon: CircleDot,    color: 'text-red-400',    bg: 'bg-red-400/10' },
  member_invited:      { label: 'invited a member',    icon: UserPlus,     color: 'text-[#80A1C1]',  bg: 'bg-[#80A1C1]/10' },
  member_role_changed: { label: 'updated member role', icon: Shield,       color: 'text-[#D97706]',  bg: 'bg-[#D97706]/10' },
  member_removed:      { label: 'removed a member',    icon: UserMinus,    color: 'text-red-400',    bg: 'bg-red-400/10' },
  project_created:     { label: 'created a project',   icon: FolderKanban, color: 'text-[#16A34A]',  bg: 'bg-[#16A34A]/10' },
  project_updated:     { label: 'updated a project',   icon: FolderKanban, color: 'text-[#D97706]',  bg: 'bg-[#D97706]/10' },
  project_deleted:     { label: 'deleted a project',   icon: FolderKanban, color: 'text-red-400',    bg: 'bg-red-400/10' },
};

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] ?? {
    label: action.toLowerCase().replace(/_/g, ' '),
    icon: Activity,
    color: 'text-black/40 dark:text-white/40',
    bg: 'bg-black/[0.06] dark:bg-white/[0.06]',
  };
}

function MetadataChip({ metadata, action }: { metadata?: Record<string, any>; action: string }) {
  if (!metadata) return null;

  if (action === 'task_status_changed' && metadata.from && metadata.to) {
    return (
      <span className="text-[11px] text-black/40 dark:text-white/40">
        {metadata.from} → {metadata.to}
      </span>
    );
  }
  if (metadata.title) {
    return (
      <span className="text-[11px] text-[#FAD4C0]/70 truncate max-w-[200px]">
        "{metadata.title}"
      </span>
    );
  }
  if (action === 'member_role_changed' && metadata.from && metadata.to) {
    return (
      <span className="text-[11px] text-black/40 dark:text-white/40">
        {metadata.from} → {metadata.to}
      </span>
    );
  }
  return null;
}

  export default function ActivityPage() {
    const { activeOrgId } = useAppStore();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const { data, isLoading } = useOrgActivity(activeOrgId, page, limit, category);
    const logs = data?.logs ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

  const handleCategoryChange = (val: string | undefined) => {
    setCategory(val);
    setPage(1);
  };

  const handleLimitChange = (val: number) => {
    setLimit(val);
    setPage(1);
  };

  if (!activeOrgId) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
        <Activity size={32} className="text-black/15 dark:text-white/15" />
        <p className="text-black/40 dark:text-white/40 text-sm">Select an organization to view activity.</p>
      </div>
    );
  }

  // Group activity by date
    const grouped = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    const date = new Date(log.createdAt).toLocaleDateString('en', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-black dark:text-white font-bold text-2xl">Activity</h1>
        <p className="text-black/40 dark:text-white/40 text-sm mt-0.5">
          Everything happening in this organization
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {[
            { value: undefined, label: 'All' },
            { value: 'tasks',    label: 'Tasks' },
            { value: 'members',  label: 'Members' },
            { value: 'projects', label: 'Projects' },
        ].map((f) => (
            <button
            key={f.label}
            onClick={() => handleCategoryChange(f.value)}
            className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                category === f.value
                ? 'bg-[#FAD4C0]/10 border-[#FAD4C0]/40 text-[#FAD4C0]'
                : 'bg-transparent border-black/[0.08] dark:border-white/[0.08] text-black/40 dark:text-white/40 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
            )}
            >
            {f.label}
            </button>
        ))}
      </div>

      {/* Rows per page selector */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-black/40 dark:text-white/40">Rows per page:</span>
        <div className="flex items-center gap-1">
          {[5, 10, 15, 20].map((limitOption) => (
            <button
              key={limitOption}
              onClick={() => handleLimitChange(limitOption)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                limit === limitOption
                  ? 'bg-[#FAD4C0]/10 border-[#FAD4C0]/40 text-[#FAD4C0]'
                  : 'bg-transparent border-black/[0.08] dark:border-white/[0.08] text-black/40 dark:text-white/40 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
              )}
            >
              {limitOption}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={22} className="animate-spin text-black/20 dark:text-white/20" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Activity size={32} className="text-black/15 dark:text-white/15" />
          <p className="text-black/30 dark:text-white/30 text-sm">No activity yet</p>
          <p className="text-black/20 dark:text-white/20 text-xs">Actions in this org will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, logs]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <Calendar size={13} className="text-black/25 dark:text-white/25" />
                <span className="text-xs font-semibold text-black/30 dark:text-white/30 uppercase tracking-wider">
                  {date}
                </span>
                <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
              </div>

              {/* Log entries */}
              <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#141414] overflow-hidden">
                {logs.map((log, i) => {
                  const cfg = getActionConfig(log.action);
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={log.id}
                      className={cn(
                        'flex items-start gap-4 px-5 py-4',
                        'hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors',
                        i < logs.length - 1 && 'border-b border-black/[0.04] dark:border-white/[0.04]'
                      )}
                    >
                      {/* Action icon */}
                      <div className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                        cfg.bg
                      )}>
                        <Icon size={14} className={cfg.color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Avatar */}
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FAD4C0]/30 to-[#80A1C1]/30 border border-black/10 dark:border-white/10 flex items-center justify-center text-[9px] font-bold text-black/60 dark:text-white/60 flex-shrink-0">
                            {log.actor?.firstName?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="text-black/85 dark:text-white/85 text-sm font-medium">
                            {log.actor?.firstName} {log.actor?.lastName}
                          </span>
                          <span className="text-black/45 dark:text-white/45 text-sm">
                            {cfg.label}
                          </span>
                          <MetadataChip metadata={log.metadata} action={log.action} />
                        </div>
                        <p className="text-black/25 dark:text-white/25 text-[11px] mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          {timeAgo(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-black/[0.05] dark:border-white/[0.05]">
          <p className="text-xs text-black/40 dark:text-white/40">
            Page <span className="font-semibold text-black/60 dark:text-white/60">{page}</span> of <span className="font-semibold text-black/60 dark:text-white/60">{totalPages}</span> · <span className="font-semibold text-black/60 dark:text-white/60">{total}</span> total items
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-black/[0.08] dark:border-white/[0.08] text-black/50 dark:text-white/50 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-black/[0.08] dark:border-white/[0.08] text-black/50 dark:text-white/50 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}
</div>
  );
}