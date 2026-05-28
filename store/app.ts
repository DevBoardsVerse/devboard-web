import { create } from 'zustand';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
}

interface AppState {
  activeOrgId: string | null;
  activeProjectId: string | null;
  sidebarOpen: boolean;
  setActiveOrg: (orgId: string | null) => void;
  setActiveProject: (projectId: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeOrgId: null,
  activeProjectId: null,
  sidebarOpen: true,
  setActiveOrg: (orgId) => set({ activeOrgId: orgId, activeProjectId: null }),
  setActiveProject: (projectId) => set({ activeProjectId: projectId }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));