'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Activity,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Building2,
  LogOut,
  X,
  Trash2,
  Trash2Icon,
  Kanban,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { useOrganizations, useProjects } from '@/lib/queries';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/auth-api';
import { CreateOrgModal } from '@/components/modals/CreateOrgModal';
import { DeleteOrgModal } from '../modals/DeleteOrgModal';
import { useOrgMembers } from '@/lib/queries';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeOrgId, activeProjectId, sidebarOpen, setActiveOrg, setActiveProject, setSidebarOpen } = useAppStore();
  const { user, clearAuth } = useAuthStore();

  const { data: members = [] } = useOrgMembers(activeOrgId);
    
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);

  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const { data: orgs = [], isLoading: orgsLoading } = useOrganizations();
  const { data: projects = [], isLoading: projectsLoading } = useProjects(activeOrgId);

  const isOwner = members.some(
    (m) => m.userId === user?.id && m.role === 'owner'
  );
  const activeOrg = orgs.find((o) => o.id === activeOrgId);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    clearAuth();
    router.push('/login');
  };

  const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/board', icon: Kanban, label: 'Board' },
  { href: '/dashboard/members', icon: Users, label: 'Members' },
  { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-20 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      <aside className="fixed left-0 top-0 h-full w-64 z-30 flex flex-col
        bg-white dark:bg-[#0F0F0F] border-r border-black/[0.06] dark:border-white/[0.06] lg:relative lg:z-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FAD4C0] flex items-center justify-center">
              <span className="text-[#0F0F0F] text-xs font-bold">D</span>
            </div>
            <span className="text-black dark:text-white font-semibold text-sm tracking-tight">DevBoard</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-black/40 dark:text-white/40 hover:text-black/80 dark:hover:text-white/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Org Switcher */}
        <div className="px-3 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
              bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.07] dark:hover:bg-white/[0.07] transition-colors text-left group"
          >
            <div className="w-6 h-6 rounded-md bg-[#FAD4C0]/20 border border-[#FAD4C0]/30 flex items-center justify-center flex-shrink-0">
              <Building2 size={12} className="text-[#FAD4C0]" />
            </div>
            <span className="text-black/80 dark:text-white/80 text-sm flex-1 truncate font-medium">
              {activeOrg?.name ?? 'Select organization'}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                'text-black/40 dark:text-white/40 transition-transform flex-shrink-0',
                orgDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {orgDropdownOpen && (
            <div className="mt-1 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#161616] overflow-hidden">
              {orgsLoading ? (
                <div className="px-3 py-2 text-xs text-black/30 dark:text-white/30">Loading...</div>
              ) : orgs.length === 0 ? (
                <div className="px-3 py-2 text-xs text-black/30 dark:text-white/30">No organizations yet</div>
              ) : (
                orgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setActiveOrg(org.id);
                      setOrgDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                      activeOrgId === org.id
                        ? 'bg-[#FAD4C0]/10 text-[#FAD4C0]'
                        : 'text-black/60 dark:text-white/60 hover:text-black/90 dark:hover:text-white/90 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    )}
                  >
                    <div className="w-5 h-5 rounded bg-[#FAD4C0]/20 flex items-center justify-center text-[10px] font-bold text-[#FAD4C0]">
                      {org.name[0]?.toUpperCase()}
                    </div>
                    <span className="truncate">{org.name}</span>
                  </button>
                ))
              )}
              {/* Delete org — owner only */}
              {isOwner && activeOrgId && (
                <button
                  onClick={() => {
                    setDeleteOrgOpen(true);
                    setOrgDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs
                    text-red-400 hover:text-red-500
                    hover:bg-red-50 dark:hover:bg-red-500/10
                    transition-colors border-t border-black/[0.06] dark:border-white/[0.06]"
                >
                  <Trash2Icon size={12} />
                  Delete organization
                </button>
              )}
              <button
                onClick={() => {
                  setCreateOrgOpen(true);
                  setOrgDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs
                  text-black/40 dark:text-white/40
                  hover:text-[#FAD4C0] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]
                  transition-colors border-t border-black/[0.06] dark:border-white/[0.06]"
              >
                <Plus size={12} />
                New organization
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                  active
                    ? 'bg-[#FAD4C0]/12 text-[#FAD4C0] font-medium'
                    : 'text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}

          {/* Projects section */}
          {activeOrgId && (
            <div className="pt-3">
              <button
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold
                  text-black/30 dark:text-white/30 hover:text-black/50 dark:hover:text-white/50 uppercase tracking-widest transition-colors"
              >
                <ChevronRight
                  size={12}
                  className={cn('transition-transform', projectsExpanded && 'rotate-90')}
                />
                Projects
                <span className="ml-auto text-[10px] bg-black/[0.06] dark:bg-white/[0.06] px-1.5 py-0.5 rounded-full">
                  {projects.length}
                </span>
              </button>

              {projectsExpanded && (
                <div className="mt-1 space-y-0.5">
                  {projectsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-8 mx-3 rounded-md bg-black/[0.03] dark:bg-white/[0.03] animate-pulse" />
                    ))
                  ) : projects.length === 0 ? (
                    <p className="px-6 py-2 text-xs text-black/25 dark:text-white/25">No projects yet</p>
                  ) : (
                    projects.map((project) => {
                      const active = activeProjectId === project.id;
                      return (
                        <button
                          key={project.id}
                          onClick={() => {
                            setActiveProject(project.id);
                            router.push('/dashboard/board');
                          }}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left',
                            active
                              ? 'bg-[#80A1C1]/15 text-[#80A1C1]'
                              : 'text-black/45 dark:text-white/45 hover:text-black/75 dark:hover:text-white/75 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                          )}
                        >
                          <FolderKanban size={14} className="flex-shrink-0" />
                          <span className="truncate">{project.name}</span>
                        </button>
                      );
                    })
                  )}
                  <button
                    onClick={() => setCreateProjectOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                      text-black/30 dark:text-white/30
                      hover:text-[#80A1C1] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]
                      transition-colors"
                  >
                    <Plus size={12} />
                    New project
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors group">
            <div className="w-7 h-7 rounded-full bg-[#FAD4C0]/20 border border-[#FAD4C0]/30 flex items-center justify-center text-xs font-bold text-[#FAD4C0] flex-shrink-0">
              {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-black/80 dark:text-white/80 text-xs font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-black/30 dark:text-white/30 text-[11px] truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-black/25 dark:text-white/25 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
      <CreateOrgModal
        open={createOrgOpen}
        onClose={() => setCreateOrgOpen(false)}
      />
      <DeleteOrgModal
        open={deleteOrgOpen}
        onClose={() => setDeleteOrgOpen(false)}
        org={activeOrg ?? null}
      />
      <CreateProjectModal
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
      />
    </>
  );
}