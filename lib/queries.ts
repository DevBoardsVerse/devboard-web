import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Organization, Project } from '@/store/app';

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

export function useOrgActivity(orgId: string | null) {
  return useQuery<ActivityLog[]>({
    queryKey: ['activity', orgId],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}/activity`);
      return res.data.data ?? res.data;
    },
    enabled: !!orgId,
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

export function useTasks(orgId: string | null, projectId: string | null) {
  return useQuery<{ tasks: Task[]; total: number }>({
    queryKey: ['tasks', orgId, projectId],
    queryFn: async () => {
      const res = await api.get(
        `/organizations/${orgId}/projects/${projectId}/tasks`
      );
      return res.data.data ?? res.data;
    },
    enabled: !!orgId && !!projectId,
  });
}