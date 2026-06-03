// hooks/useSocket.ts
// Manages the socket connection lifecycle.
// - Connects when accessToken is available
// - Joins the org room when activeOrgId changes
// - Disconnects / leaves room on cleanup
// Call this ONCE at the dashboard layout level.

'use client';

import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const activeOrgId = useAppStore((s) => s.activeOrgId);

  // ── Connect / disconnect when auth changes ──────────────────
  useEffect(() => {
    if (!accessToken) {
      if (socket.connected) socket.disconnect();
      return;
    }

    // Attach token before connecting — backend reads handshake.auth.token
    socket.auth = { token: accessToken };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      console.log('[socket] connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[socket] connect error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, [accessToken]);

  // ── Join / leave org room when activeOrgId changes ──────────
  useEffect(() => {
    if (!activeOrgId || !socket.connected) return;

    const joinRoom = () => {
      socket.emit('join-org', { orgId: activeOrgId });
    };

    // If already connected, join immediately
    // If not yet connected, wait for the connect event
    if (socket.connected) {
      joinRoom();
    } else {
      socket.once('connect', joinRoom);
    }

    socket.on('joined-org', ({ orgId }: { orgId: string }) => {
      console.log('[socket] joined org room:', orgId);
    });

    socket.on('error', (err: { message: string }) => {
      console.warn('[socket] server error:', err.message);
    });

    return () => {
      // Leave the room when org changes or component unmounts
      socket.emit('leave-org', { orgId: activeOrgId });
      socket.off('joined-org');
      socket.off('error');
      socket.off('connect', joinRoom);
    };
  }, [activeOrgId, socket.connected]); // re-run when connected state changes
}