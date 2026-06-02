'use client';

import { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInviteMember } from '@/lib/queries';
import { toast } from '@/components/ui/toaster';

interface Props {
  open: boolean;
  onClose: () => void;
  orgId: string;
}

const ROLES = [
  { value: 'member', label: 'Member', desc: 'Can view and manage tasks' },
  { value: 'admin',  label: 'Admin',  desc: 'Can manage members and projects' },
  { value: 'viewer', label: 'Viewer', desc: 'Read-only access' },
];

export function InviteMemberModal({ open, onClose, orgId }: Props) {
  const { mutateAsync, isPending } = useInviteMember(orgId);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await mutateAsync({ email: email.trim(), role });
      toast({ title: 'Invite sent!', description: `${email} has been added as ${role}` });
      setEmail('');
      setRole('member');
      onClose();
    } catch (err: any) {
      toast({
        title: 'Invite failed',
        description: err.response?.data?.message ?? 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md bg-white dark:bg-[#141414] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#80A1C1]/20 border border-[#80A1C1]/30 flex items-center justify-center">
                <UserPlus size={16} className="text-[#80A1C1]" />
              </div>
              <h2 className="text-black dark:text-white font-semibold text-base">Invite Member</h2>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-black/40 dark:text-white/40 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-all">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                autoFocus
                required
                className={cn(
                  'w-full px-3 py-2.5 rounded-xl text-sm transition-all',
                  'bg-black/[0.04] dark:bg-white/[0.04]',
                  'border border-black/[0.08] dark:border-white/[0.08]',
                  'text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-[#80A1C1]/40 focus:border-[#80A1C1]/50',
                )}
              />
              <p className="text-[11px] text-black/30 dark:text-white/30">
                They must already have a DevBoard account.
              </p>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
                Role
              </label>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all',
                      role === r.value
                        ? 'bg-[#80A1C1]/10 border-[#80A1C1]/40 text-[#80A1C1]'
                        : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] text-black/60 dark:text-white/60 hover:bg-black/[0.06] dark:hover:bg-white/[0.06]'
                    )}
                  >
                    <span className="text-sm font-medium">{r.label}</span>
                    <span className="text-xs opacity-60">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-black/70 dark:text-white/70 border border-black/[0.06] dark:border-white/[0.06]">
                Cancel
              </button>
              <button type="submit" disabled={isPending || !email.trim()}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  'bg-[#80A1C1] text-white hover:bg-[#80A1C1]/90',
                  'flex items-center justify-center gap-2',
                  (isPending || !email.trim()) && 'opacity-50 cursor-not-allowed'
                )}>
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Send Invite
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}