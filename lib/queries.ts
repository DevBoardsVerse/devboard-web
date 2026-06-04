import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore, type Organization, type Project } from '@/store/app';

// ── Organizations ─────────────────────────────────────────────

export function useOrganizations() {
  return useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await api.get('/organizations');
      return res.data.data ?? res.data;
    },
  });
}

export function useOrganization(orgId: string | null) {
  return useQuery<Organization>({
    queryKey: ['organizations', orgId],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}`);
      return res.data.data ?? res.data;
    },
    enabled: !!orgId,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { name: string; description?: string }) => {
      const res = await api.post('/organizations', dto);
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const { activeOrgId, setActiveOrg } = useAppStore();

  return useMutation({
    mutationFn: async (orgId: string) => {
      await api.delete(`/organizations/${orgId}`);
    },
    onSuccess: (_, deletedOrgId) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      // if deleted org was active, clear it
      if (activeOrgId === deletedOrgId) {
        setActiveOrg(null);
      }
    },
  });
}

export function useUpdateOrganization(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { name: string; description?: string }) => {
      const res = await api.patch(`/organizations/${orgId}`, dto);
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId] });
    },
  });
}

// ── Projects ──────────────────────────────────────────────────

export function useProjects(orgId: string | null) {
  return useQuery<Project[]>({
    queryKey: ['projects', orgId],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}/projects`);
      return res.data.data ?? res.data;
    },
    enabled: !!orgId,
  });
}

export function useCreateProject(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { name: string; description?: string }) => {
      const res = await api.post(`/organizations/${orgId}/projects`, dto);
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', orgId] });
    },
  });
}

export function useDeleteProject(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      await api.delete(`/organizations/${orgId}/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', orgId] });
    },
  });
}

// ── Members ───────────────────────────────────────────────────

export interface OrgMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function useOrgMembers(orgId: string | null) {
  return useQuery<OrgMember[]>({
    queryKey: ['members', orgId],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}/members`);
      return res.data.data ?? res.data;
    },
    enabled: !!orgId,
  });
}

export function useInviteMember(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { email: string; role?: string }) => {
      const res = await api.post(`/organizations/${orgId}/members/invite`, dto);
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgId] });
    },
  });
}

export function useUpdateMemberRole(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await api.patch(`/organizations/${orgId}/members/${userId}/role`, { role });
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgId] });
    },
  });
}

export function useRemoveMember(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/organizations/${orgId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgId] });
    },
  });
}

// ── Activity ──────────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  organizationId: string;
  actorId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  actor?: {
    firstName: string;
    lastName: string;
  };
}

export function useOrgActivity(
  orgId: string | null,
  page = 1,
  limit = 20,
  category?: string,
) {
  return useQuery<{ logs: ActivityLog[]; total: number; page: number; limit: number }>({
    queryKey: ['activity', orgId, page, limit, category],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}/activity`, {
        params: { page, limit, ...(category ? { category } : {}) },
      });
      const raw = res.data.data ?? res.data;
      // Handle both array (old) and paginated object (new)
      if (Array.isArray(raw)) {
        return { logs: raw, total: raw.length, page: 1, limit: raw.length };
      }
      return raw;
    },
    enabled: !!orgId,
     staleTime: 30_000, // treat data as fresh for 30s — prevents refetch on tab focus
  });
}

// ── Tasks (summary counts) ────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  createdById: string;
  projectId: string;
  createdAt: string;
}

  export function useTasks(
    orgId: string | null,
    projectId: string | null,
    page = 1,
    limit = 20,
  ) {
    return useQuery<{ tasks: Task[]; total: number }>({
      queryKey: ['tasks', orgId, projectId, page, limit],
      queryFn: async () => {
        const res = await api.get(
          `/organizations/${orgId}/projects/${projectId}/tasks`,
          { params: { page, limit } }
        );
        return res.data.data ?? res.data;
      },
      enabled: !!orgId && !!projectId,
    });
  }

export function useCreateTask(orgId: string | null, projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
    title: string;
    description?: string;
    priority: string;
    status?: string;   // ← add this line
    assigneeId?: string;
  })=> {
      if (!orgId || !projectId) {
        throw new Error('No organization or project selected');
      }
      const res = await api.post(
        `/organizations/${orgId}/projects/${projectId}/tasks`,
        dto
      );
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', orgId, projectId] });
    },
  });
}

export function useUpdateTask(orgId: string | null, projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, dto }: {
      taskId: string;
      dto: { status?: string; priority?: string; title?: string; description?: string };
    }) => {
      const res = await api.patch(
        `/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`,
        dto
      );
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', orgId, projectId] });
    },
  });
}

export function useDeleteTask(orgId: string | null, projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(
        `/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', orgId, projectId] });
    },
  });
}