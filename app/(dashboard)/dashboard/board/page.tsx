'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app';
import { useTasks, useUpdateTask, useDeleteTask } from '@/lib/queries';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { TaskDetailModal } from '@/components/modals/TaskDetailModal';
import { cn } from '@/lib/utils';
import {
  Plus, CircleDot, Clock, AlertCircle,
  CheckCircle2, MoreHorizontal, Trash2,
  Flag, User, Loader2,
} from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';

// ─── Config ──────────────────────────────────────────────────

const COLUMNS = [
  {
    status: 'todo',
    label: 'To Do',
    icon: CircleDot,
    color: 'text-black/50 dark:text-white/50',
    bg: 'bg-black/[0.04] dark:bg-white/[0.04]',
    border: 'border-black/[0.06] dark:border-white/[0.06]',
    dot: 'bg-black/30 dark:bg-white/30',
    headerBg: 'bg-black/[0.03] dark:bg-white/[0.03]',
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    icon: Clock,
    color: 'text-[#80A1C1]',
    bg: 'bg-[#80A1C1]/[0.06]',
    border: 'border-[#80A1C1]/20',
    dot: 'bg-[#80A1C1]',
    headerBg: 'bg-[#80A1C1]/[0.04]',
  },
  {
    status: 'in_review',
    label: 'In Review',
    icon: AlertCircle,
    color: 'text-[#FAD4C0]',
    bg: 'bg-[#FAD4C0]/[0.06]',
    border: 'border-[#FAD4C0]/20',
    dot: 'bg-[#FAD4C0]',
    headerBg: 'bg-[#FAD4C0]/[0.04]',
  },
  {
    status: 'done',
    label: 'Done',
    icon: CheckCircle2,
    color: 'text-[#16A34A]',
    bg: 'bg-[#16A34A]/[0.06]',
    border: 'border-[#16A34A]/20',
    dot: 'bg-[#16A34A]',
    headerBg: 'bg-[#16A34A]/[0.04]',
  },
];

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'text-red-400',      bg: 'bg-red-400/10',        dot: 'bg-red-400' },
  high:   { label: 'High',   color: 'text-[#FAD4C0]',   bg: 'bg-[#FAD4C0]/10',     dot: 'bg-[#FAD4C0]' },
  medium: { label: 'Medium', color: 'text-[#D97706]',   bg: 'bg-[#D97706]/10',     dot: 'bg-[#D97706]' },
  low:    { label: 'Low',    color: 'text-black/40 dark:text-white/40', bg: 'bg-black/[0.06] dark:bg-white/[0.06]', dot: 'bg-black/30 dark:bg-white/30' },
};

// ─── Task Card ────────────────────────────────────────────────

function TaskCard({
  task,
  orgId,
  projectId,
  index,
  onStatusChange,
  onOpenDetail,
}: {
  task: any;
  orgId: string;
  projectId: string;
  index: number;
  onStatusChange: (taskId: string, status: string) => void;
  onOpenDetail: (task: any) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { mutate: deleteTask, isPending: deleting } = useDeleteTask(orgId, projectId);
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
    setMenuOpen(false);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => !menuOpen && onOpenDetail(task)}
          className={cn(
            'group relative rounded-xl p-3.5 border transition-all cursor-pointer select-none',
            'bg-white dark:bg-[#1A1A1A]',
            'border-black/[0.07] dark:border-white/[0.07]',
            'hover:border-black/[0.14] dark:hover:border-white/[0.14]',
            snapshot.isDragging
              ? 'shadow-lg scale-[1.02] border-[#FAD4C0]/40 rotate-1'
              : 'hover:shadow-sm dark:hover:shadow-none',
          )}
        >
          {/* Priority badge + menu */}
          <div className="flex items-center justify-between mb-2.5">
            <span className={cn(
              'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full',
              priority.color, priority.bg
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', priority.dot)} />
              {priority.label}
            </span>

            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg
                  opacity-0 group-hover:opacity-100 transition-all
                  text-black/40 dark:text-white/40
                  hover:text-black/80 dark:hover:text-white/80
                  hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"
              >
                <MoreHorizontal size={14} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                  <div className="absolute right-0 top-7 z-20 w-40 bg-white dark:bg-[#1E1E1E] rounded-xl border border-black/[0.08] dark:border-white/[0.08] shadow-lg overflow-hidden">
                    <div className="px-3 py-2 text-[10px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-wider border-b border-black/[0.05] dark:border-white/[0.05]">
                      Move to
                    </div>
                    {COLUMNS.filter(c => c.status !== task.status).map(col => (
                      <button
                        key={col.status}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(task.id, col.status);
                          setMenuOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left',
                          'text-black/60 dark:text-white/60 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]',
                          col.color
                        )}
                      >
                        <col.icon size={12} />
                        {col.label}
                      </button>
                    ))}
                    <div className="border-t border-black/[0.05] dark:border-white/[0.05]">
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs
                          text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Delete task
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <p className={cn(
            'text-sm font-medium leading-snug mb-3',
            'text-black/85 dark:text-white/85',
            task.status === 'done' && 'line-through text-black/40 dark:text-white/40'
          )}>
            {task.title}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {task.assignee ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FAD4C0]/40 to-[#80A1C1]/40 border border-black/10 dark:border-white/10 flex items-center justify-center text-[9px] font-bold text-black/60 dark:text-white/60">
                  {task.assignee?.firstName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-[11px] text-black/40 dark:text-white/40">
                  {task.assignee?.firstName}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-black/25 dark:text-white/25">
                <User size={11} />
                Unassigned
              </div>
            )}
            <span className="text-[10px] text-black/25 dark:text-white/25">
              {new Date(task.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ─── Column ───────────────────────────────────────────────────

function Column({
  col,
  tasks,
  orgId,
  projectId,
  onAddTask,
  onStatusChange,
  onOpenDetail,
}: {
  col: typeof COLUMNS[0];
  tasks: any[];
  orgId: string;
  projectId: string;
  onAddTask: () => void;
  onStatusChange: (taskId: string, status: string) => void;
  onOpenDetail: (task: any) => void;
}) {
  const Icon = col.icon;

  return (
    <div className="flex flex-col min-w-[280px] w-[280px]">
      {/* Column header */}
      <div className={cn(
        'flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 border',
        col.headerBg, col.border
      )}>
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', col.dot)} />
          <span className={cn('text-sm font-semibold', col.color)}>{col.label}</span>
          <span className={cn(
            'text-[11px] font-bold px-1.5 py-0.5 rounded-full',
            col.bg, col.color
          )}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className={cn(
            'w-6 h-6 flex items-center justify-center rounded-lg transition-all',
            'hover:bg-black/[0.08] dark:hover:bg-white/[0.08]',
            col.color
          )}
          title="Add task"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={col.status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex flex-col gap-2.5 flex-1 min-h-[120px] rounded-xl transition-colors p-1 -m-1',
              snapshot.isDraggingOver && 'bg-black/[0.02] dark:bg-white/[0.02]'
            )}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver ? (
              <button
                onClick={onAddTask}
                className={cn(
                  'w-full py-8 rounded-xl border-2 border-dashed transition-all',
                  'border-black/[0.08] dark:border-white/[0.08]',
                  'text-black/25 dark:text-white/25 text-xs',
                  'hover:border-black/[0.15] dark:hover:border-white/[0.15]',
                  'hover:text-black/40 dark:hover:text-white/40',
                )}
              >
                + Add task
              </button>
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  orgId={orgId}
                  projectId={projectId}
                  index={index}
                  onStatusChange={onStatusChange}
                  onOpenDetail={onOpenDetail}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ─── Board Page ───────────────────────────────────────────────

export default function BoardPage() {
  const { activeOrgId, activeProjectId } = useAppStore();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<string | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const { data: taskData, isLoading } = useTasks(activeOrgId, activeProjectId, 1, 100);
  const { mutate: updateTask } = useUpdateTask(activeOrgId, activeProjectId);

  // Local tasks state — source of truth for the board UI.
  // Synced from server data but updated synchronously on drag so
  // @hello-pangea/dnd never sees stale positions and snap-back doesn't occur.
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    setTasks(taskData?.tasks ?? []);
  }, [taskData]);

  const handleStatusChange = (taskId: string, status: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    updateTask({ taskId, dto: { status } });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    const newStatus = destination.droppableId;
    const task = tasks.find(t => t.id === draggableId);
    if (!task || task.status === newStatus) return;

    // Update local state synchronously — card moves immediately with no snap-back
    setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));
    updateTask({ taskId: draggableId, dto: { status: newStatus } });
  };

  const handleAddTaskInColumn = (status: string) => {
    setCreateTaskStatus(status);
    setCreateTaskOpen(true);
  };

  if (!activeOrgId || !activeProjectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
        <Flag size={32} className="text-black/15 dark:text-white/15" />
        <div className="text-center">
          <h3 className="text-black dark:text-white font-semibold">No project selected</h3>
          <p className="text-black/40 dark:text-white/40 text-sm mt-1">
            Select a project from the sidebar to view the board.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* Board header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div>
          <h2 className="text-black dark:text-white font-bold text-xl">Task Board</h2>
          <p className="text-black/40 dark:text-white/40 text-sm mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => { setCreateTaskStatus(undefined); setCreateTaskOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
            bg-[#FAD4C0] text-[#0F0F0F] font-semibold text-sm
            hover:bg-[#FAD4C0]/90 transition-colors"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Kanban columns */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 size={24} className="animate-spin text-black/20 dark:text-white/20" />
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 px-6 py-5 overflow-x-auto flex-1 items-start">
            {COLUMNS.map(col => (
              <Column
                key={col.status}
                col={col}
                tasks={tasks.filter(t => t.status === col.status)}
                orgId={activeOrgId}
                projectId={activeProjectId}
                onAddTask={() => handleAddTaskInColumn(col.status)}
                onStatusChange={handleStatusChange}
                onOpenDetail={setSelectedTask}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => { setCreateTaskOpen(false); setCreateTaskStatus(undefined); }}
        defaultStatus={createTaskStatus}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          orgId={activeOrgId}
          projectId={activeProjectId}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}