'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { useOrgMembers, useUpdateMemberRole, useRemoveMember } from '@/lib/queries';
import { InviteMemberModal } from '@/components/modals/InviteMemberModal';
import { cn } from '@/lib/utils';
import {
  Users, UserPlus, MoreHorizontal, Crown,
  Shield, Eye, UserCircle, Loader2, Trash2,
} from 'lucide-react';
import { toast } from '@/components/ui/toaster';

const ROLE_CONFIG = {
  owner:  { label: 'Owner',  icon: Crown,       color: 'text-[#FAD4C0]',  bg: 'bg-[#FAD4C0]/10',  border: 'border-[#FAD4C0]/20' },
  admin:  { label: 'Admin',  icon: Shield,      color: 'text-[#80A1C1]',  bg: 'bg-[#80A1C1]/10',  border: 'border-[#80A1C1]/20' },
  member: { label: 'Member', icon: UserCircle,  color: 'text-black/50 dark:text-white/50', bg: 'bg-black/[0.06] dark:bg-white/[0.06]', border: 'border-black/[0.08] dark:border-white/[0.08]' },
  viewer: { label: 'Viewer', icon: Eye,         color: 'text-black/35 dark:text-white/35', bg: 'bg-black/[0.04] dark:bg-white/[0.04]', border: 'border-black/[0.06] dark:border-white/[0.06]' },
};

const getRolesForMember = (memberRole: string, isOwner: boolean) => {
  const all = ['admin', 'member', 'viewer'];
  if (isOwner) return all.filter(r => r !== memberRole);
  return ['member', 'viewer'].filter(r => r !== memberRole);
};

export default function MembersPage() {
  const { activeOrgId } = useAppStore();
  const { user } = useAuthStore();
  const { data: members = [], isLoading } = useOrgMembers(activeOrgId);
  const { mutate: updateRole } = useUpdateMemberRole(activeOrgId);
  const { mutate: removeMember } = useRemoveMember(activeOrgId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const currentUserMember = members.find(m => m.userId === user?.id);
  const canManage = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin';
  const isCurrentUserOwner = currentUserMember?.role === 'owner';

  const handleRoleChange = (userId: string, role: string) => {
    updateRole({ userId, role }, {
      onSuccess: () => toast({ title: 'Role updated' }),
      onError: (err: any) => toast({
        title: 'Failed to update role',
        description: err.response?.data?.message ?? 'Something went wrong',
        variant: 'destructive',
      }),
    });
    setOpenMenuId(null);
  };

  const handleRemove = (userId: string, name: string) => {
    removeMember(userId, {
      onSuccess: () => toast({ title: `${name} removed` }),
      onError: (err: any) => toast({
        title: 'Failed to remove member',
        description: err.response?.data?.message ?? 'Something went wrong',
        variant: 'destructive',
      }),
    });
    setOpenMenuId(null);
  };

  if (!activeOrgId) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
        <Users size={32} className="text-black/15 dark:text-white/15" />
        <p className="text-black/40 dark:text-white/40 text-sm">Select an organization to view members.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-black dark:text-white font-bold text-2xl">Members</h1>
          <p className="text-black/40 dark:text-white/40 text-sm mt-0.5">
            {members.length} member{members.length !== 1 ? 's' : ''} in this organization
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#80A1C1] text-white font-semibold text-sm hover:bg-[#80A1C1]/90 transition-colors"
          >
            <UserPlus size={16} />
            Invite
          </button>
        )}
      </div>

      {/* Members list */}
      <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#141414]">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={22} className="animate-spin text-black/20 dark:text-white/20" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Users size={28} className="text-black/15 dark:text-white/15" />
            <p className="text-black/30 dark:text-white/30 text-sm">No members yet</p>
          </div>
        ) : (
          members.map((member, i) => {
            const cfg = ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.member;
            const RoleIcon = cfg.icon;
            const isMe = member.userId === user?.id;
            const isOwner = member.role === 'owner';

            return (
              <div
                key={member.id}
                className={cn(
                  'flex items-center gap-4 px-5 py-4 transition-colors',
                  'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]',
                  i < members.length - 1 && 'border-b border-black/[0.05] dark:border-white/[0.05]'
                )}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FAD4C0]/30 to-[#80A1C1]/30 border border-black/10 dark:border-white/10 flex items-center justify-center text-sm font-bold text-black/70 dark:text-white/70 flex-shrink-0">
                  {member.user?.firstName?.[0]?.toUpperCase() ?? '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-black/85 dark:text-white/85 text-sm font-medium truncate">
                      {member.user?.firstName} {member.user?.lastName}
                    </p>
                    {isMe && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.05] text-black/30 dark:text-white/30">
                        you
                      </span>
                    )}
                  </div>
                  <p className="text-black/35 dark:text-white/35 text-xs truncate">{member.user?.email}</p>
                </div>

                {/* Role badge */}
                <span className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border',
                  cfg.color, cfg.bg, cfg.border
                )}>
                  <RoleIcon size={11} />
                  {cfg.label}
                </span>

                {/* Actions menu — only for non-owners, non-self, if canManage */}
                {canManage && !isOwner && !isMe && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-black/30 dark:text-white/30 hover:text-black/70 dark:hover:text-white/70 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-all"
                    >
                      <MoreHorizontal size={15} />
                    </button>

                    {openMenuId === member.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-[#1E1E1E] rounded-xl border border-black/[0.08] dark:border-white/[0.08] shadow-lg overflow-hidden">
                          <div className="px-3 py-2 text-[10px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-wider border-b border-black/[0.05] dark:border-white/[0.05]">
                            Change role
                          </div>
                          {getRolesForMember(member.role, isCurrentUserOwner).map(r => {
                            const rc = ROLE_CONFIG[r as keyof typeof ROLE_CONFIG];
                            const RIcon = rc.icon;
                            return (
                              <button
                                key={r}
                                onClick={() => handleRoleChange(member.userId, r)}
                                className={cn(
                                  'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left',
                                  'text-black/60 dark:text-white/60 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]',
                                  rc.color
                                )}
                              >
                                <RIcon size={12} />
                                {rc.label}
                              </button>
                            );
                          })}
                          {(isCurrentUserOwner || member.role !== 'admin') && (
                            <div className="border-t border-black/[0.05] dark:border-white/[0.05]">
                              <button
                                onClick={() => handleRemove(member.userId, member.user?.firstName ?? 'Member')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={12} />
                                Remove member
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        orgId={activeOrgId}
      />
    </div>
  );
}