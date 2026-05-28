'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell, Search, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/auth-api';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = 'Overview', subtitle }: HeaderProps) {
  const { toggleSidebar } = useAppStore();
  const { user, clearAuth } = useAuthStore();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="h-14 flex items-center gap-4 px-6 
      border-b border-black/[0.06] dark:border-white/[0.06] 
      bg-white/80 dark:bg-[#0F0F0F]/80 
      backdrop-blur-sm sticky top-0 z-10">

      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="text-black/40 dark:text-white/40 hover:text-black/80 dark:hover:text-white/80 transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Title */}
      <div className="flex-1">
        <h1 className="text-black dark:text-white font-semibold text-sm">{title}</h1>
        {subtitle && <p className="text-black/40 dark:text-white/40 text-xs">{subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg 
          bg-black/[0.04] dark:bg-white/[0.04]
          hover:bg-black/[0.08] dark:hover:bg-white/[0.08] 
          text-black/40 dark:text-white/40 
          hover:text-black/70 dark:hover:text-white/70 
          transition-all text-xs">
          <Search size={14} />
          <span className="hidden md:block">Search...</span>
          <kbd className="hidden md:block text-[10px] bg-black/[0.06] dark:bg-white/[0.08] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg
          hover:bg-black/[0.06] dark:hover:bg-white/[0.06] 
          text-black/40 dark:text-white/40 
          hover:text-black/80 dark:hover:text-white/80 
          transition-all relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FAD4C0]" />
        </button>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              hover:bg-black/[0.06] dark:hover:bg-white/[0.06]
              text-black/40 dark:text-white/40
              hover:text-black/80 dark:hover:text-white/80
              transition-all"
            title="Toggle theme"
          >
            <Sun size={16} className="hidden dark:block" />
            <Moon size={16} className="block dark:hidden" />
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-8 h-8 flex items-center justify-center rounded-lg
            hover:bg-red-50 dark:hover:bg-red-500/10
            text-black/30 dark:text-white/30
            hover:text-red-500 dark:hover:text-red-400
            transition-all"
          title="Logout"
        >
          <LogOut size={16} />
        </button>

      </div>
    </header>
  );
}