// hooks/useTaskEvents.ts
// Subscribes to real-time task events from the WebSocket and
// patches the local tasks array in place — no full refetch needed.
//
// Usage in board/page.tsx:
//   useTaskEvents(tasks, setTasks);

'use client';

import { useEffect } from 'react';
import { socket } from '@/lib/socket';

type Task = any; // matches the loose typing already used in board/page.tsx

export function useTaskEvents(
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
) {
  useEffect(() => {
    // ── task.created ─────────────────────────────────────────
    // Payload: full Task object
    const onTaskCreated = (task: Task) => {
      setTasks((prev) => {
        // Avoid duplicates if optimistic update already added it
        if (prev.some((t) => t.id === task.id)) return prev;
        return [...prev, task];
      });
    };

    // ── task.updated ─────────────────────────────────────────
    // Payload: full Task object (after save)
    const onTaskUpdated = (updated: Task) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
      );
    };

    // ── task.assigned ─────────────────────────────────────────
    // Payload: { taskId, assigneeId }
    // NOTE: assigneeId can be null (unassign). The full assignee object
    // isn't included here, so we patch the id and clear the object.
    // The board shows firstName from task.assignee — the next full
    // refetch (React Query stale time) will fill it in properly.
    const onTaskAssigned = ({
      taskId,
      assigneeId,
    }: {
      taskId: string;
      assigneeId: string | null;
    }) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                assigneeId,
                // Clear the nested object so UI shows "Unassigned" immediately
                // rather than stale data until the next refetch
                assignee: assigneeId ? t.assignee : null,
              }
            : t,
        ),
      );
    };

    // ── task.deleted ─────────────────────────────────────────
    // Payload: { taskId }
    const onTaskDeleted = ({ taskId }: { taskId: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    };

    socket.on('task.created', onTaskCreated);
    socket.on('task.updated', onTaskUpdated);
    socket.on('task.assigned', onTaskAssigned);
    socket.on('task.deleted', onTaskDeleted);

    return () => {
      socket.off('task.created', onTaskCreated);
      socket.off('task.updated', onTaskUpdated);
      socket.off('task.assigned', onTaskAssigned);
      socket.off('task.deleted', onTaskDeleted);
    };
  }, []); // empty deps — setTasks is stable (Zustand/useState setter)
}