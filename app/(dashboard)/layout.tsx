'use client';

import { useEffect, useRef, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAppStore } from '@/store/app';
import { useOrganizations } from '@/lib/queries';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useSocket();
  const router = useRouter();
  const { accessToken, setAuth, clearAuth } = useAuthStore();
  const { activeOrgId, setActiveOrg } = useAppStore();
  const attempted = useRef(false);
  const [ready, setReady] = useState(!!accessToken); // true immediately if already logged in

  // Silent refresh on hard reload
  useEffect(() => {
    if (accessToken) {
      setReady(true);
      return;
    }
    if (attempted.current) return;
    attempted.current = true;

    api.post('/auth/refresh', {}, { withCredentials: true })
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const token = payload.accessToken ?? payload.access_token ?? payload.token;
        if (!token) throw new Error('No token');
        setAuth(token, payload.user);
        setReady(true);
      })
      .catch(() => {
        clearAuth();
        router.replace('/login');
      });
  }, []);

  // Don't render anything (and don't fire queries) until auth is confirmed
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0F0F0F]">
        <div className="w-6 h-6 rounded-full border-2 border-[#FAD4C0]/30 border-t-[#FAD4C0] animate-spin" />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}

// Separated so queries only mount after ready=true
function DashboardShell({ children }: { children: React.ReactNode }) {
  const { activeOrgId, setActiveOrg } = useAppStore();
  const { data: orgs = [] } = useOrganizations();

  useEffect(() => {
    if (!activeOrgId && orgs.length > 0) {
      setActiveOrg(orgs[0].id);
    }
  }, [orgs, activeOrgId, setActiveOrg]);

  return (
    <div className="flex h-screen bg-white dark:bg-[#0F0F0F] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}