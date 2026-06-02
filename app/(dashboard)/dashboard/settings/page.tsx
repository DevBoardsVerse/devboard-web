'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { useOrganization, useUpdateOrganization, useDeleteOrganization, useOrgMembers } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { Settings, Loader2, Trash2, Save, Building2, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { activeOrgId, setActiveOrg } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: org, isLoading } = useOrganization(activeOrgId);
  const { data: members = [] } = useOrgMembers(activeOrgId);
  const { mutate: updateOrg, isPending: updating } = useUpdateOrganization(activeOrgId);
  const { mutate: deleteOrg, isPending: deleting } = useDeleteOrganization();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [orgLoaded, setOrgLoaded] = useState(false);

  // Populate form once org loads
  if (org && !orgLoaded) {
    setName(org.name);
    setDescription((org as any).description ?? '');
    setOrgLoaded(true);
  }

  const currentMember = members.find(m => m.userId === user?.id);
  const isOwner = currentMember?.role === 'owner';
  const isAdmin = currentMember?.role === 'admin' || isOwner;

  const handleSave = () => {
    if (!name.trim()) return;
    updateOrg(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => toast({ title: 'Organization updated' }),
        onError: (err: any) => toast({
          title: 'Update failed',
          description: err.response?.data?.message ?? 'Something went wrong',
          variant: 'destructive',
        }),
      }
    );
  };

  const handleDelete = () => {
    if (!activeOrgId) return;
    deleteOrg(activeOrgId, {
      onSuccess: () => {
        toast({ title: 'Organization deleted' });
        setActiveOrg(null);
        router.push('/dashboard');
      },
      onError: (err: any) => toast({
        title: 'Delete failed',
        description: err.response?.data?.message ?? 'Something went wrong',
        variant: 'destructive',
      }),
    });
  };

  if (!activeOrgId) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
        <Settings size={32} className="text-black/15 dark:text-white/15" />
        <p className="text-black/40 dark:text-white/40 text-sm">Select an organization to view settings.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 size={22} className="animate-spin text-black/20 dark:text-white/20" />
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-black dark:text-white font-bold text-2xl">Settings</h1>
        <p className="text-black/40 dark:text-white/40 text-sm mt-0.5">
          Manage your organization settings
        </p>
      </div>

      {/* General settings */}
      <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#141414] overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-[#FAD4C0]/15 border border-[#FAD4C0]/20 flex items-center justify-center">
            <Building2 size={15} className="text-[#FAD4C0]" />
          </div>
          <h2 className="text-black dark:text-white font-semibold text-sm">General</h2>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wider">
              Organization name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isAdmin}
              className={cn(
                'w-full px-3 py-2.5 rounded-xl text-sm transition-all',
                'bg-black/[0.04] dark:bg-white/[0.04]',
                'border border-black/[0.08] dark:border-white/[0.08]',
                'text-black dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-[#FAD4C0]/40 focus:border-[#FAD4C0]/50',
                !isAdmin && 'opacity-50 cursor-not-allowed'
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
              disabled={!isAdmin}
              rows={3}
              placeholder="What is this organization for?"
              className={cn(
                'w-full px-3 py-2.5 rounded-xl text-sm transition-all resize-none',
                'bg-black/[0.04] dark:bg-white/[0.04]',
                'border border-black/[0.08] dark:border-white/[0.08]',
                'text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30',
                'focus:outline-none focus:ring-2 focus:ring-[#FAD4C0]/40 focus:border-[#FAD4C0]/50',
                !isAdmin && 'opacity-50 cursor-not-allowed'
              )}
            />
          </div>

          {isAdmin && (
            <button
              onClick={handleSave}
              disabled={updating || !name.trim()}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                'bg-[#FAD4C0] text-[#0F0F0F] hover:bg-[#FAD4C0]/90',
                (updating || !name.trim()) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {updating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save changes
            </button>
          )}
        </div>
      </div>

      {/* Org info */}
      <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#141414] overflow-hidden">
        <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-black dark:text-white font-semibold text-sm">Organization info</h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          {[
            { label: 'Organization ID', value: activeOrgId },
            { label: 'Your role', value: currentMember?.role ?? '—' },
            { label: 'Members', value: `${members.length} member${members.length !== 1 ? 's' : ''}` },
            { label: 'Created', value: org ? new Date((org as any).createdAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <span className="text-xs text-black/40 dark:text-white/40">{label}</span>
              <span className="text-xs font-medium text-black/70 dark:text-white/70 font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone — owner only */}
      {isOwner && (
        <div className="rounded-2xl border border-red-500/20 bg-white dark:bg-[#141414] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-red-500/10">
            <AlertTriangle size={15} className="text-red-400" />
            <h2 className="text-red-400 font-semibold text-sm">Danger zone</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div>
              <p className="text-sm text-black/70 dark:text-white/70 font-medium">Delete organization</p>
              <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">
                This will permanently delete the organization, all projects, tasks, and members. Type the org name to confirm.
              </p>
            </div>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={`Type "${org?.name}" to confirm`}
              className={cn(
                'w-full px-3 py-2.5 rounded-xl text-sm transition-all',
                'bg-black/[0.04] dark:bg-white/[0.04]',
                'border border-red-500/20',
                'text-black dark:text-white placeholder:text-black/25 dark:placeholder:text-white/25',
                'focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40',
              )}
            />
            <button
              onClick={handleDelete}
              disabled={deleting || deleteConfirm !== org?.name}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                'bg-red-500 text-white hover:bg-red-600',
                (deleting || deleteConfirm !== org?.name) && 'opacity-40 cursor-not-allowed'
              )}
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete organization
            </button>
          </div>
        </div>
      )}
    </div>
  );
}