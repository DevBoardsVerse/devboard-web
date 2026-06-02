'use client';

import { useState } from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeleteOrganization } from '@/lib/queries';
import { toast } from '@/components/ui/toaster';

interface Props {
  open: boolean;
  onClose: () => void;
  org: { id: string; name: string } | null;
}

export function DeleteOrgModal({ open, onClose, org }: Props) {
  const [confirmText, setConfirmText] = useState('');
  const { mutateAsync, isPending } = useDeleteOrganization();

  if (!open || !org) return null;

  const isConfirmed = confirmText === org.name;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    try {
      await mutateAsync(org.id);
      toast({ title: 'Organization deleted', description: `${org.name} has been deleted.` });
      setConfirmText('');
      onClose();
    } catch (err: any) {
      toast({
        title: 'Failed to delete',
        description: err.response?.data?.message ?? 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md bg-white dark:bg-[#141414] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <h2 className="text-black dark:text-white font-semibold text-base">
                Delete Organization
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                text-black/40 dark:text-white/40
                hover:text-black/80 dark:hover:text-white/80
                hover:bg-black/[0.06] dark:hover:bg-white/[0.06]
                transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

            {/* Warning box */}
            <div className="flex gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-400 space-y-1">
                <p className="font-semibold">This action cannot be undone.</p>
                <p className="text-red-600/80 dark:text-red-400/80">
                  This will permanently delete <span className="font-semibold">{org.name}</span> and all its projects, tasks, members, and activity logs.
                </p>
              </div>
            </div>

            {/* Confirm input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                Type <span className="text-black dark:text-white font-bold normal-case tracking-normal">{org.name}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={org.name}
                autoFocus
                className={cn(
                  'w-full px-3 py-2.5 rounded-xl text-sm transition-all',
                  'bg-black/[0.04] dark:bg-white/[0.04]',
                  'border border-black/[0.08] dark:border-white/[0.08]',
                  'text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20',
                  'focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400/50',
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setConfirmText(''); onClose(); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  bg-black/[0.04] dark:bg-white/[0.04]
                  hover:bg-black/[0.08] dark:hover:bg-white/[0.08]
                  text-black/70 dark:text-white/70
                  border border-black/[0.06] dark:border-white/[0.06]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isConfirmed || isPending}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  'bg-red-500 text-white hover:bg-red-600',
                  'flex items-center justify-center gap-2',
                  (!isConfirmed || isPending) && 'opacity-40 cursor-not-allowed',
                )}
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Delete Organization
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}