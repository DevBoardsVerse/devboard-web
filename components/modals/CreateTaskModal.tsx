'use client';

import { useState } from 'react';
import { X, CheckSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateTask } from '@/lib/queries';
import { useAppStore } from '@/store/app';
import { useOrgMembers } from '@/lib/queries';
import { toast } from '@/components/ui/toaster';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultStatus?: string;
}

const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: 'text-white/50 dark:text-white/50 bg-black/[0.06] dark:bg-white/[0.06]' },
  { value: 'medium', label: 'Medium', color: 'text-[#D97706] bg-[#D97706]/10' },
  { value: 'high',   label: 'High',   color: 'text-[#FAD4C0] bg-[#FAD4C0]/10' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400 bg-red-400/10' },
];

const STATUSES = [
  { value: 'todo',        label: 'To Do',       color: 'text-black/60 dark:text-white/60' },
  { value: 'in_progress', label: 'In Progress', color: 'text-[#80A1C1]' },
  { value: 'in_review',   label: 'In Review',   color: 'text-[#FAD4C0]' },
  { value: 'done',        label: 'Done',         color: 'text-[#16A34A]' },
];

export function CreateTaskModal({ open, onClose, defaultStatus }: Props) {
  const { activeOrgId, activeProjectId } = useAppStore();
  const { mutateAsync, isPending } = useCreateTask(activeOrgId, activeProjectId);
  const { data: members = [] } = useOrgMembers(activeOrgId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState(defaultStatus ?? 'todo');
  const [assigneeId, setAssigneeId] = useState('');

  // Sync status when defaultStatus changes (e.g. clicking + in a column)
  if (defaultStatus && defaultStatus !== status && !title) {
    setStatus(defaultStatus);
  }

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!activeOrgId || !activeProjectId) {
      toast({
        title: 'No project selected',
        description: 'Please select an organization and project before creating a task.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        assigneeId: assigneeId || undefined,
      });
      toast({ title: 'Task created!', description: title });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setAssigneeId('');
      onClose();
    } catch (err: any) {
      toast({
        title: 'Failed to create task',
        description: err.response?.data?.message ?? 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg bg-white dark:bg-[#141414] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAD4C0]/20 border border-[#FAD4C0]/30 flex items-center justify-center">
                <CheckSquare size={16} className="text-[#FAD4C0]" />
              </div>
              <h2 className="text-black dark:text-white font-semibold text-base">New Task</h2>
            </div>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fix login bug"
                autoFocus
                required
                className={cn(
                  'w-full px-3 py-2.5 rounded-xl text-sm transition-all',
                  'bg-black/[0.04] dark:bg-white/[0.04]',
                  'border border-black/[0.08] dark:border-white/[0.08]',
                  'text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-[#FAD4C0]/40 focus:border-[#FAD4C0]/50',
                )}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                Description <span className="text-black/30 dark:text-white/30 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={3}
                className={cn(
                  'w-full px-3 py-2.5 rounded-xl text-sm transition-all resize-none',
                  'bg-black/[0.04] dark:bg-white/[0.04]',
                  'border border-black/[0.08] dark:border-white/[0.08]',
                  'text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-[#FAD4C0]/40 focus:border-[#FAD4C0]/50',
                )}
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                Status
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className={cn(
                      'px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border text-center',
                      status === s.value
                        ? cn(s.color, 'bg-black/[0.06] dark:bg-white/[0.06] border-current')
                        : 'text-black/40 dark:text-white/40 bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.06] dark:hover:bg-white/[0.06]'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority + Assignee row */}
            <div className="grid grid-cols-2 gap-3">

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={cn(
                        'px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                        priority === p.value
                          ? cn(p.color, 'border-current')
                          : 'text-black/40 dark:text-white/40 bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.06] dark:hover:bg-white/[0.06]'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  Assignee <span className="text-black/30 dark:text-white/30 font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-xl text-sm transition-all',
                    'bg-black/[0.04] dark:bg-white/[0.04]',
                    'border border-black/[0.08] dark:border-white/[0.08]',
                    'text-black dark:text-white',
                    'focus:outline-none focus:ring-2 focus:ring-[#FAD4C0]/40 focus:border-[#FAD4C0]/50',
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
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  bg-black/[0.04] dark:bg-white/[0.04]
                  hover:bg-black/[0.08] dark:hover:bg-white/[0.08]
                  text-black/70 dark:text-white/70
                  border border-black/[0.06] dark:border-white/[0.06]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !title.trim()}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  'bg-[#FAD4C0] text-[#0F0F0F] hover:bg-[#FAD4C0]/90',
                  'flex items-center justify-center gap-2',
                  (isPending || !title.trim()) && 'opacity-50 cursor-not-allowed',
                )}
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}