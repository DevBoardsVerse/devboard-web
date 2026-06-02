'use client';

import { useState } from 'react';
import { X, Building2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateOrganization } from '@/lib/queries';
import { useAppStore } from '@/store/app';
import { toast } from '@/components/ui/toaster';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateOrgModal({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutateAsync, isPending } = useCreateOrganization();
  const { setActiveOrg } = useAppStore();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const org = await mutateAsync({ name: name.trim(), description: description.trim() || undefined });
      setActiveOrg(org.id);
      toast({ title: 'Organization created!', description: `${org.name} is ready.` });
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      toast({
        title: 'Failed to create organization',
        description: err.response?.data?.message ?? 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md bg-white dark:bg-[#141414] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAD4C0]/20 border border-[#FAD4C0]/30 flex items-center justify-center">
                <Building2 size={16} className="text-[#FAD4C0]" />
              </div>
              <h2 className="text-black dark:text-white font-semibold text-base">
                New Organization
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                Organization Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                Description <span className="text-black/30 dark:text-white/30 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this organization do?"
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
                disabled={isPending || !name.trim()}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  'bg-[#FAD4C0] text-[#0F0F0F]',
                  'hover:bg-[#FAD4C0]/90',
                  'flex items-center justify-center gap-2',
                  (isPending || !name.trim()) && 'opacity-50 cursor-not-allowed',
                )}
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Create Organization
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}