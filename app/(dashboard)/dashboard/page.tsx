'use client';

import { useAppStore } from '@/store/app';
import { useOrganization, useProjects, useOrgMembers, useOrgActivity, useTasks } from '@/lib/queries';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import {
  FolderKanban,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDot,
  TrendingUp,
  Zap,
  Plus,
  ArrowRight,
  Calendar,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────

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
    TASK_CREATED: 'created a task',
    TASK_UPDATED: 'updated a task',
    TASK_STATUS_CHANGED: 'changed task status',
    TASK_ASSIGNED: 'assigned a task',
    TASK_DELETED: 'deleted a task',
    MEMBER_INVITED: 'invited a member',
    MEMBER_ROLE_CHANGED: 'updated member role',
    MEMBER_REMOVED: 'removed a member',
  };
  return map[action] ?? action.toLowerCase().replace(/_/g, ' ');
}

const STATUS_CONFIG = {
  todo:        { label: 'To Do',       color: 'text-black/60 dark:text-white/60',     bg: 'bg-black/[0.06] dark:bg-white/[0.06]',       icon: CircleDot },
  in_progress: { label: 'In Progress', color: 'text-[#80A1C1]',   bg: 'bg-[#80A1C1]/10',       icon: Clock },
  in_review:   { label: 'In Review',   color: 'text-[#FAD4C0]',   bg: 'bg-[#FAD4C0]/10',       icon: AlertCircle },
  done:        { label: 'Done',         color: 'text-[#16A34A]',   bg: 'bg-[#16A34A]/10',       icon: CheckCircle2 },
};

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'text-red-400',        dot: 'bg-red-400' },
  high:   { label: 'High',   color: 'text-[#FAD4C0]',     dot: 'bg-[#FAD4C0]' },
  medium: { label: 'Medium', color: 'text-[#D97706]',     dot: 'bg-[#D97706]' },
  low:    { label: 'Low',    color: 'text-black/40 dark:text-white/40',       dot: 'bg-white/30' },
};

// ─── Skeleton ─────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg bg-black/[0.05] dark:bg-white/[0.05] animate-pulse', className)} />
  );
}

// ─── Stat Card ────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, accent, sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  sub?: string;
}) {
  return (
    <div className={cn(
      'relative rounded-2xl p-5 border overflow-hidden flex flex-col gap-3',
      'bg-white dark:bg-[#141414] border-black/[0.07] dark:border-white/[0.07] hover:border-black/[0.12] dark:border-white/[0.12] transition-all group'
    )}>
      {/* Accent glow */}
      <div className={cn('absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity', accent)} />

      <div className="flex items-start justify-between">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', accent + '/10')}>
          <Icon size={18} className={cn('', accent.replace('bg-', 'text-'))} />
        </div>
      </div>

      <div>
        <p className="text-3xl font-bold text-black dark:text-white tracking-tight">{value}</p>
        <p className="text-black/50 dark:text-white/50 text-sm mt-0.5">{label}</p>
        {sub && <p className="text-black/30 dark:text-white/30 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────

function EmptyOrg() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[#FAD4C0]/10 border border-[#FAD4C0]/20 flex items-center justify-center">
        <FolderKanban size={28} className="text-[#FAD4C0]/60" />
      </div>
      <div className="text-center">
        <h3 className="text-black dark:text-white font-semibold text-lg">No organization selected</h3>
        <p className="text-black/40 dark:text-white/40 text-sm mt-1">Select or create an organization from the sidebar to get started.</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAD4C0] text-[#0F0F0F] font-semibold text-sm hover:bg-[#FAD4C0]/90 transition-colors">
        <Plus size={16} />
        Create organization
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeOrgId, activeProjectId, setActiveProject } = useAppStore();

  const { data: org } = useOrganization(activeOrgId);
  const { data: projects = [], isLoading: projectsLoading } = useProjects(activeOrgId);
  const { data: members = [], isLoading: membersLoading } = useOrgMembers(activeOrgId);
  const { data: activity = [], isLoading: activityLoading } = useOrgActivity(activeOrgId);
  const { data: taskData } = useTasks(activeOrgId, activeProjectId ?? projects[0]?.id ?? null);

  const tasks = taskData?.tasks ?? [];

  // Task status counts
  const statusCounts = {
    todo:        tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    in_review:   tasks.filter((t) => t.status === 'in_review').length,
    done:        tasks.filter((t) => t.status === 'done').length,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (!activeOrgId) return <EmptyOrg />;

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">

      {/* ── Welcome ─────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-black/40 dark:text-white/40 text-sm font-medium mb-1">{greeting},</h2>
            <h1 className="text-black dark:text-white text-3xl font-bold tracking-tight">
              {user?.firstName} {user?.lastName}
              <span className="text-[#FAD4C0]">.</span>
            </h1>
            {org && (
              <p className="text-black/40 dark:text-white/40 text-sm mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />
                {org.name} workspace
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-[#FAD4C0] text-[#0F0F0F] font-semibold text-sm hover:bg-[#FAD4C0]/90 transition-colors">
              <Plus size={16} />
              New Task
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-black/[0.06] dark:bg-white/[0.06] text-black/70 dark:text-white/70 font-medium text-sm hover:bg-black/[0.10] dark:bg-white/[0.10] transition-colors border border-black/[0.08] dark:border-white/[0.08]">
              <FolderKanban size={16} />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Projects"
          value={projectsLoading ? '—' : projects.length}
          icon={FolderKanban}
          accent="bg-[#80A1C1]"
          sub="Active workspaces"
        />
        <StatCard
          label="Members"
          value={membersLoading ? '—' : members.length}
          icon={Users}
          accent="bg-[#FAD4C0]"
          sub="In this org"
        />
        <StatCard
          label="Open Tasks"
          value={tasks.length > 0 ? statusCounts.todo + statusCounts.in_progress : '—'}
          icon={Zap}
          accent="bg-[#D97706]"
          sub={tasks.length > 0 ? `${statusCounts.in_progress} in progress` : 'Select a project'}
        />
        <StatCard
          label="Completed"
          value={tasks.length > 0 ? statusCounts.done : '—'}
          icon={TrendingUp}
          accent="bg-[#16A34A]"
          sub={tasks.length > 0 ? `${tasks.length} total tasks` : '—'}
        />
      </div>

      {/* ── Main Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Projects list — 2 cols */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.07] dark:border-white/[0.07] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-black dark:text-white font-semibold text-base">Projects</h3>
            <button className="text-xs text-black/40 dark:text-white/40 hover:text-[#FAD4C0] flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </button>
          </div>

          {projectsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <FolderKanban size={32} className="text-black/15 dark:text-white/15" />
              <p className="text-black/30 dark:text-white/30 text-sm">No projects yet</p>
              <button className="text-xs text-[#FAD4C0]/70 hover:text-[#FAD4C0] flex items-center gap-1 transition-colors">
                <Plus size={12} /> Create first project
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project, i) => {
                const colors = [
                  'bg-[#80A1C1]/15 border-[#80A1C1]/20 text-[#80A1C1]',
                  'bg-[#FAD4C0]/15 border-[#FAD4C0]/20 text-[#FAD4C0]',
                  'bg-[#16A34A]/10 border-[#16A34A]/20 text-[#16A34A]',
                  'bg-[#D97706]/10 border-[#D97706]/20 text-[#D97706]',
                  'bg-purple-500/10 border-purple-500/20 text-purple-400',
                ];
                const colorClass = colors[i % colors.length];

                return (
                  <button
                    key={project.id}
                    onClick={() => setActiveProject(project.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group',
                      activeProjectId === project.id
                        ? 'bg-black/[0.06] dark:bg-white/[0.06] border-black/[0.12] dark:border-white/[0.12]'
                        : 'bg-transparent border-black/[0.05] dark:border-white/[0.05] hover:bg-black/[0.04] dark:bg-white/[0.04] hover:border-black/[0.08] dark:border-white/[0.08]'
                    )}
                  >
                    <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-bold flex-shrink-0', colorClass)}>
                      {project.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-black/85 dark:text-white/85 text-sm font-medium truncate">{project.name}</p>
                      <p className="text-black/30 dark:text-white/30 text-xs truncate mt-0.5">
                        {project.description ?? 'No description'}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-black/20 dark:text-white/20 group-hover:text-black/50 dark:text-white/50 transition-colors flex-shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Members — 1 col */}
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.07] dark:border-white/[0.07] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-black dark:text-white font-semibold text-base">Members</h3>
            <span className="text-xs text-black/30 dark:text-white/30 bg-black/[0.06] dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
              {members.length}
            </span>
          </div>

          {membersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <Users size={28} className="text-black/15 dark:text-white/15" />
              <p className="text-black/30 dark:text-white/30 text-sm">No members yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.slice(0, 6).map((member) => {
                const roleColors: Record<string, string> = {
                  owner:  'bg-[#FAD4C0]/15 text-[#FAD4C0] border-[#FAD4C0]/20',
                  admin:  'bg-[#80A1C1]/15 text-[#80A1C1] border-[#80A1C1]/20',
                  member: 'bg-black/[0.06] dark:bg-white/[0.06] text-black/50 dark:text-white/50 border-black/[0.08] dark:border-white/[0.08]',
                  viewer: 'bg-black/[0.04] dark:bg-white/[0.04] text-black/30 dark:text-white/30 border-black/[0.06] dark:border-white/[0.06]',
                };

                return (
                  <div key={member.id} className="flex items-center gap-3 py-1.5 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FAD4C0]/30 to-[#80A1C1]/30 border border-black/10 dark:border-white/10 flex items-center justify-center text-xs font-bold text-black/80 dark:text-white/80 flex-shrink-0">
                      {member.user?.firstName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-black/80 dark:text-white/80 text-xs font-medium truncate">
                        {member.user?.firstName} {member.user?.lastName}
                      </p>
                      <p className="text-black/30 dark:text-white/30 text-[11px] truncate">{member.user?.email}</p>
                    </div>
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0',
                      roleColors[member.role] ?? roleColors.member
                    )}>
                      {member.role}
                    </span>
                  </div>
                );
              })}
              {members.length > 6 && (
                <button className="w-full text-xs text-black/30 dark:text-white/30 hover:text-[#FAD4C0]/70 transition-colors pt-1 text-center">
                  +{members.length - 6} more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Status Breakdown */}
        {tasks.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.07] dark:border-white/[0.07] p-5">
            <h3 className="text-black dark:text-white font-semibold text-base mb-4">Task Status</h3>
            <div className="space-y-3">
              {(Object.entries(statusCounts) as [keyof typeof STATUS_CONFIG, number][]).map(([status, count]) => {
                const cfg = STATUS_CONFIG[status];
                const Icon = cfg.icon;
                const pct = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={cfg.color} />
                        <span className="text-black/60 dark:text-white/60 text-xs">{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-black/80 dark:text-white/80 text-xs font-semibold">{count}</span>
                        <span className="text-black/30 dark:text-white/30 text-[11px]">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.05] overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', cfg.bg.replace('bg-', 'bg-').replace('/10', ''))}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: status === 'done' ? '#16A34A'
                            : status === 'in_progress' ? '#80A1C1'
                            : status === 'in_review' ? '#FAD4C0'
                            : 'rgba(255,255,255,0.15)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity Feed — spans 2 cols if task status shown, else 2 cols */}
        <div className={cn(
          'rounded-2xl bg-white dark:bg-[#141414] border border-black/[0.07] dark:border-white/[0.07] p-5',
          tasks.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-black dark:text-white font-semibold text-base">Recent Activity</h3>
            <Activity size={16} className="text-black/25 dark:text-white/25" />
          </div>

          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <Activity size={28} className="text-black/15 dark:text-white/15" />
              <p className="text-black/30 dark:text-white/30 text-sm">No activity yet</p>
              <p className="text-black/20 dark:text-white/20 text-xs">Actions in this org will appear here</p>
            </div>
          ) : (
            <div className="space-y-0">
              {activity.slice(0, 8).map((log, i) => (
                <div
                  key={log.id}
                  className={cn(
                    'flex gap-3 py-3',
                    i < activity.slice(0, 8).length - 1 && 'border-b border-black/[0.04] dark:border-white/[0.04]'
                  )}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FAD4C0]/20 to-[#80A1C1]/20 border border-black/10 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-black/60 dark:text-white/60 flex-shrink-0 mt-0.5">
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
                      {log.metadata?.from && log.metadata?.to && (
                        <span className="text-black/40 dark:text-white/40">
                          {' '}({log.metadata.from} → {log.metadata.to})
                        </span>
                      )}
                    </p>
                    <p className="text-black/25 dark:text-white/25 text-[11px] mt-0.5 flex items-center gap-1">
                      <Calendar size={10} />
                      {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}