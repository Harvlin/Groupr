import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { useProject } from '@/hooks/useProject';
import { useToast } from '@/hooks/useToast';
import { ButtonNavCta } from '@/components/ui';
import { Skeleton } from '@/components/Skeleton';
import type { ProjectTask, TaskStatus, ProjectMember } from '@/types';
import { cn } from '@/lib/utils';
import { isBefore, parseISO, startOfToday } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'done', label: 'Done' },
];

function TaskCard({
  task,
  onMove,
  onDelete,
}: {
  task: ProjectTask;
  onMove: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overdue = task.dueDate && task.status !== 'done' && isBefore(parseISO(task.dueDate), startOfToday());

  return (
    <div className="group relative rounded-card border border-border-hairline bg-white p-4">
      {/* Delete button */}
      <button
        onClick={() => setConfirmDelete(true)}
        aria-label="Delete task"
        className="absolute right-3 top-3 hidden text-text-tertiary transition-colors hover:text-accent-warning group-hover:block focus-visible:block"
      >
        <Trash2 size={14} />
      </button>

      <p className="pr-6 text-sm font-medium text-text-primary">{task.title}</p>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-lime font-display text-[10px] font-black text-text-primary">
          {(task.assignedToMemberName ?? 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
        </div>
        <span className="text-xs text-text-secondary">{task.assignedToMemberName ?? 'Unassigned'}</span>
      </div>

      {task.dueDate && (
        <span className={cn(
          'mt-2 inline-block rounded-hairline border px-1.5 py-0.5 text-xs',
          overdue ? 'border-accent-warning text-accent-warning' : 'border-border-hairline/40 text-text-tertiary'
        )}>
          {overdue ? 'Overdue · ' : ''}{task.dueDate}
        </span>
      )}

      {task.fromCoachSuggestion && (
        <span className="ml-2 mt-2 inline-block rounded-hairline border border-accent-lime px-1.5 py-0.5 text-[11px] text-accent-lime">
          From Coach
        </span>
      )}

      {/* Status actions */}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-border-hairline/20 pt-2">
        {task.status === 'open' && (
          <button onClick={() => onMove(task.id, 'in_progress')} className="text-xs text-accent-blue hover:underline">Start</button>
        )}
        {task.status === 'in_progress' && (
          <>
            <button onClick={() => onMove(task.id, 'done')} className="text-xs text-accent-positive hover:underline">Mark done</button>
            <button onClick={() => onMove(task.id, 'open')} className="text-xs text-text-tertiary hover:underline">Pause</button>
          </>
        )}
        {task.status === 'done' && (
          <button onClick={() => onMove(task.id, 'open')} className="text-xs text-text-tertiary hover:underline">Reopen</button>
        )}
      </div>

      {confirmDelete && (
        <div className="mt-2 border-t border-border-hairline/20 pt-2 text-xs">
          <span className="text-text-secondary">Delete this task? </span>
          <button onClick={() => { onDelete(task.id); setConfirmDelete(false); }} className="font-medium text-accent-warning hover:underline">Delete</button>
          <span className="text-text-tertiary"> · </span>
          <button onClick={() => setConfirmDelete(false)} className="text-text-tertiary hover:underline">Cancel</button>
        </div>
      )}
    </div>
  );
}

interface AddTaskFormProps {
  members: ProjectMember[];
  projectId: string;
  currentMemberId: string;
  onAdd: (task: ProjectTask) => void;
  onCancel: () => void;
}

function AddTaskForm({ members, projectId, currentMemberId, onAdd, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(members[0]?.id ?? '');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const member = members.find(m => m.id === assignedTo);
      const newTask = await api.createTask({
        projectId,
        title: title.trim(),
        assignedToMemberId: assignedTo,
        assignedToMemberName: member?.user.name ?? 'Unknown',
        status: 'open',
        createdByMemberId: currentMemberId,
        dueDate: dueDate || undefined,
        fromCoachSuggestion: false,
      });
      onAdd(newTask);
    } catch {
      // error silently discarded — caller can show toast if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-3 rounded-card border border-border-hairline bg-surface-muted p-4">
      <label className="sr-only" htmlFor="new-task-title">Task title</label>
      <input
        id="new-task-title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title"
        className="w-full rounded-control border border-border-hairline bg-white px-3 py-2 text-sm text-text-primary focus:border-accent-lime focus:outline-none"
        autoFocus
      />
      <div className="mt-2 flex gap-2">
        <select
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
          className="flex-1 rounded-control border border-border-hairline bg-white px-3 py-2 text-sm text-text-primary focus:outline-none"
        >
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.user.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="rounded-control border border-border-hairline bg-white px-3 py-2 text-sm text-text-primary focus:outline-none"
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <ButtonNavCta onClick={handleSubmit} disabled={!title.trim() || loading}>
          {loading ? 'Adding…' : 'Add task'}
        </ButtonNavCta>
        <button onClick={onCancel} className="text-sm text-text-tertiary hover:underline">Cancel</button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { members, currentMember } = useProject();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.getTasks(projectId).then(setTasks).finally(() => setLoading(false));
  }, [projectId]);

  const handleMove = useCallback(async (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    await api.updateTaskStatus(id, status);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await api.deleteTask(id);
    addToast('Task deleted.', 'info');
  }, [addToast]);

  const handleAdd = useCallback((task: ProjectTask) => {
    setTasks(prev => [task, ...prev]);
    setShowForm(false);
  }, []);

  const openCount = tasks.filter(t => t.status === 'open').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <PageContainer width="wide">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-text-primary">Tasks</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {openCount} open · {inProgressCount} in progress · {doneCount} done
          </p>
        </div>
        <ButtonNavCta onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Add task
        </ButtonNavCta>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1,2,3].map(col => (
            <div key={col} className="space-y-3">
              <Skeleton className="h-6 w-24" />
              {[1,2].map(i => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-secondary">{col.label}</span>
                  <span className="rounded-hairline border border-border-hairline/40 px-1.5 py-0.5 text-xs text-text-tertiary">{colTasks.length}</span>
                </div>

                {/* Add form in open column */}
                {col.key === 'open' && showForm && (
                  <AddTaskForm
                    members={members}
                    projectId={projectId ?? ''}
                    currentMemberId={currentMember?.id ?? ''}
                    onAdd={handleAdd}
                    onCancel={() => setShowForm(false)}
                  />
                )}

                <div className="space-y-3">
                  {colTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onMove={handleMove}
                      onDelete={handleDelete}
                    />
                  ))}
                  {colTasks.length === 0 && !showForm && (
                    <div className="rounded-card border border-dashed border-border-hairline/40 py-8 text-center">
                      <p className="text-xs text-text-tertiary">No tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
