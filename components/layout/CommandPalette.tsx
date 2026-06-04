'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/app';
import { cn } from '@/lib/utils';
import { Search, FolderKanban, CheckSquare, ArrowRight, X } from 'lucide-react';
import type { Task, OrgMember } from '@/lib/queries';
import type { Project } from '@/store/app';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeOrgId, setActiveProject } = useAppStore();

  // Pull data straight from React Query cache — zero API calls
  const projects: Project[] = queryClient.getQueryData(['projects', activeOrgId]) ?? [];
  const taskCache = queryClient.getQueriesData<{ tasks: Task[] }>({ queryKey: ['tasks', activeOrgId] });
  const allTasks: Task[] = taskCache.flatMap(([, data]) => data?.tasks ?? []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matchedProjects = projects
      .filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({ type: 'project' as const, id: p.id, label: p.name, sub: p.description ?? 'Project', data: p }));

    const matchedTasks = allTasks
      .filter(t => t.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map(t => ({ type: 'task' as const, id: t.id, label: t.title, sub: t.status.replace('_', ' '), data: t }));

    return [...matchedProjects, ...matchedTasks];
  }, [query, projects, allTasks]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, selectedIndex]);

  // Reset selected index when results change
  useEffect(() => { setSelectedIndex(0); }, [results]);

  const handleSelect = (result: typeof results[0]) => {
    if (result.type === 'project') {
      setActiveProject(result.id);
      router.push('/dashboard/board');
    } else {
      // For tasks, navigate to the board with that project active
      const task = result.data as Task;
      setActiveProject(task.projectId);
      router.push('/dashboard/board');
    }
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl overflow-hidden">

          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <Search size={16} className="text-black/30 dark:text-white/30 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search projects and tasks..."
              className="flex-1 bg-transparent text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 transition-colors">
                <X size={14} />
              </button>
            )}
            <kbd className="text-[10px] bg-black/[0.06] dark:bg-white/[0.08] px-1.5 py-0.5 rounded font-mono text-black/30 dark:text-white/30">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto">
            {query.trim() === '' ? (
              <div className="px-4 py-8 text-center">
                <p className="text-black/25 dark:text-white/25 text-sm">Type to search projects and tasks</p>
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-black/25 dark:text-white/25 text-sm">No results for "{query}"</p>
              </div>
            ) : (
              <div className="py-1.5">
                {results.map((result, i) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      selectedIndex === i
                        ? 'bg-black/[0.04] dark:bg-white/[0.04]'
                        : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                      result.type === 'project'
                        ? 'bg-[#80A1C1]/10 text-[#80A1C1]'
                        : 'bg-[#FAD4C0]/10 text-[#FAD4C0]'
                    )}>
                      {result.type === 'project'
                        ? <FolderKanban size={13} />
                        : <CheckSquare size={13} />
                      }
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-black/85 dark:text-white/85 text-sm font-medium truncate">{result.label}</p>
                      <p className="text-black/35 dark:text-white/35 text-xs capitalize truncate">{result.sub}</p>
                    </div>

                    <ArrowRight size={13} className="text-black/20 dark:text-white/20 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-black/[0.05] dark:border-white/[0.05] flex items-center gap-3">
            <span className="text-[10px] text-black/25 dark:text-white/25 flex items-center gap-1">
              <kbd className="bg-black/[0.06] dark:bg-white/[0.06] px-1 rounded font-mono">↑↓</kbd> navigate
            </span>
            <span className="text-[10px] text-black/25 dark:text-white/25 flex items-center gap-1">
              <kbd className="bg-black/[0.06] dark:bg-white/[0.06] px-1 rounded font-mono">↵</kbd> select
            </span>
          </div>
        </div>
      </div>
    </>
  );
}