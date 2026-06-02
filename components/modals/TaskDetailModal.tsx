'use client';

import { useState } from 'react';
import { X, CircleDot, Clock, AlertCircle, CheckCircle2, Loader2, User, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateTask, useDeleteTask, useOrgMembers } from '@/lib/queries';
import { toast } from '@/components/ui/toaster';

interface Props {
  task: any;
  orgId: string;
  projectId: string;
  onClose: () => void;
}

const STATUSES = [
  { value: 'todo',        label: 'To Do',       icon: CircleDot,    color: 'text-black/60 dark:text-white/60',  bg: 'bg-black/[0.06] dark:bg-white/[0.06]',   border: 'border-black/20 dark:border-white/20' },
  { value: 'in_progress', label: 'In Progress', icon: Clock,         color: 'text-[#80A1C1]',                   bg: 'bg-[#80A1C1]/10',                         border: 'border-[#80A1C1]/40' },
  { value: 'in_review',   label: 'In Review',   icon: AlertCircle,   color: 'text-[#FAD4C0]',                   bg: 'bg-[#FAD4C0]/10',                         border: 'border-[#FAD4C0]/40' },
  { value: 'done',        label: 'Done',         icon: CheckCircle2,  color: 'text-[#16A34A]',                   bg: 'bg-[#16A34A]/10',                         border: 'border-[#16A34A]/40' },
];

const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: 'text-black/40 dark:text-white/40', bg: 'bg-black/[0.06] dark:bg-white/[0.06]',  border: 'border-black/20 dark:border-white/20',  dot: 'bg-black/30 dark:bg-white/30' },
  { value: 'medium', label: 'Medium', color: 'text-[#D97706]',                  bg: 'bg-[#D97706]/10',                        border: 'border-[#D97706]/40',                   dot: 'bg-[#D97706]' },
  { value: 'high',   label: 'High',   color: 'text-[#FAD4C0]',                  bg: 'bg-[#FAD4C0]/10',                        border: 'border-[#FAD4C0]/40',                   dot: 'bg-[#FAD4C0]' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400',                    bg: 'bg-red-400/10',                          border: 'border-red-400/40',                     dot: 'bg-red-400' },
];

export function TaskDetailModal({ task, orgId, projectId, onClose }: Props) {
  const { mutate: updateTask, isPending: updating } = useUpdateTask(orgId, projectId);
  const { mutate: deleteTask, isPending: deleting } = useDeleteTask(orgId, projectId);
  const { data: members = [] } = useOrgMembers(orgId);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? '');

  const handleSave = () => {
    if (!title.trim()) return;
    updateTask(
      {
        taskId: task.id,
        dto: {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Task updated' });
        },
        onError: (err: any) => {
          toast({
            title: 'Update failed',
            description: err.response?.data?.message ?? 'Something went wrong',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority);
  };

  const handleDelete = () => {
    deleteTask(task.id, {
      onSuccess: () => {
        toast({ title: 'Task deleted' });
        onClose();
      },
    });
  };

  const currentStatus = STATUSES.find(s => s.value === status) ?? STATUSES[0];
  const StatusIcon = currentStatus.icon;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-2xl bg-white dark:bg-[#141414] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl pointer-events-auto max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2">
              <StatusIcon size={16} className={currentStatus.color} />
              <span className={cn('text-xs font-semibold', currentStatus.color)}>{currentStatus.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-7 h-7 flex items-center justify-center rounded-lg
                  text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Delete task"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg
                  text-black/40 dark:text-white/40
                  hover:text-black/80 dark:hover:text-white/80
                  hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body — scrollable */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(
                  'w-full text-xl font-bold bg-transparent outline-none transition-all',
                  'text-black dark:text-white',
                  'border-b border-transparent focus:border-black/[0.10] dark:focus:border-white/[0.10]',
                  'pb-1',
                )}
                placeholder="Task title"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => {
                  const SIcon = s.icon;
                  return (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                        status === s.value
                          ? cn(s.color, s.bg, s.border)
                          : 'text-black/40 dark:text-white/40 bg-transparent border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                      )}
                    >
                      <SIcon size={12} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => handlePriorityChange(p.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                      priority === p.value
                        ? cn(p.color, p.bg, p.border)
                        : 'text-black/40 dark:text-white/40 bg-transparent border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full', p.dot)} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm transition-all',
                  'bg-black/[0.04] dark:bg-white/[0.04]',
                  'border border-black/[0.08] dark:border-white/[0.08]',
                  'text-black dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-[#FAD4C0]/40',
                )}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.firstName} {m.user?.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={4}
                className={cn(
                  'w-full px-3 py-2.5 rounded-xl text-sm transition-all resize-none',
                  'bg-black/[0.04] dark:bg-white/[0.04]',
                  'border border-black/[0.08] dark:border-white/[0.08]',
                  'text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-[#FAD4C0]/40 focus:border-[#FAD4C0]/50',
                )}
              />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-[11px] text-black/30 dark:text-white/30 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar size={11} />
                Created {new Date(task.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              {task.assignee && (
                <div className="flex items-center gap-1.5">
                  <User size={11} />
                  {task.assignee.firstName} {task.assignee.lastName}
                </div>
              )}
            </div>
          </div>

          {/* Footer — save button only shown when title/description changed */}
          <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.06] flex-shrink-0 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setTitle(task.title);
                setDescription(task.description ?? '');
                setStatus(task.status);
                setPriority(task.priority);
                setAssigneeId(task.assigneeId ?? '');
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium
                text-black/50 dark:text-white/50
                hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={updating || !title.trim()}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                'bg-[#FAD4C0] text-[#0F0F0F] hover:bg-[#FAD4C0]/90',
                (updating || !title.trim()) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {updating && <Loader2 size={13} className="animate-spin" />}
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}