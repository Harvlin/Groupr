import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderOpen, LayoutGrid, List, Plus, X } from 'lucide-react';
import { format, isBefore, parseISO, startOfToday } from 'date-fns';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Skeleton } from '@/components/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar, getInitials } from '@/components/ui/Avatar';
import { getMemberColor } from '@/utils/memberColors';
import { ButtonPrimaryHero, ButtonGlassUtility, ButtonNavCta } from '@/components/ui';
import { JoinByCodeModal } from '@/components/project/JoinByCodeModal';
import { cn } from '@/lib/utils';
import type { ProjectSummary, ProjectMember } from '@/types';

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDeadline(date?: string) {
  if (!date) return null;
  const parsed = parseISO(date);
  const overdue = isBefore(parsed, startOfToday());
  return { label: overdue ? 'Overdue' : `Due ${format(parsed, 'd MMM')}`, overdue };
}

function getStatusMeta(project: ProjectSummary) {
  if (project.sourceCount === 0) return { label: 'No sources', cls: 'bg-accent-warning/10 text-accent-warning' };
  if (project.status === 'completed' || project.status === 'finalised') return { label: 'Finalised', cls: 'bg-surface-forest text-accent-lime' };
  if (project.status === 'archived') return { label: 'Archived', cls: 'bg-surface-muted text-text-secondary' };
  if (project.status === 'setup') return { label: 'Setup', cls: 'bg-surface-muted text-text-tertiary border border-black/10' };
  return { label: 'Active', cls: 'bg-accent-positive/10 text-accent-positive' };
}

type FilterKey = 'all' | 'active' | 'finalised' | 'setup';

function matchesFilter(project: ProjectSummary, filter: FilterKey) {
  if (filter === 'all') return true;
  if (filter === 'finalised') return project.status === 'completed' || project.status === 'finalised';
  if (filter === 'setup') return project.status === 'setup';
  return project.status === 'active';
}

// ─── Segmented contribution bar ───────────────────────────────────────────────

function ContributionBar({ project, currentUserId }: { project: ProjectSummary; currentUserId?: string }) {
  const segments = useMemo(() => {
    const { members } = project;
    if (!members.length) return [];
    const currentIdx = currentUserId ? members.findIndex((m) => m.userId === currentUserId) : -1;
    const userShare = project.userContributionShare ?? 0;

    if (currentIdx === -1) {
      const share = 100 / members.length;
      return members.map((m, i) => ({ id: m.id, name: m.user.name, share, color: getMemberColor(i) }));
    }

    const othersCount = members.length - 1;
    const otherShare = othersCount > 0 ? (100 - userShare) / othersCount : 0;
    return members.map((m, i) => ({
      id: m.id,
      name: m.user.name,
      share: i === currentIdx ? userShare : otherShare,
      color: getMemberColor(i),
    }));
  }, [project, currentUserId]);

  const yourShare = project.userContributionShare ?? 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-label-sm text-text-tertiary">Your share</span>
        <span className="text-body-sm font-bold text-text-primary">{yourShare}%</span>
      </div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        {segments.map(({ id, share, color, name }) => (
          <div key={id} className="h-full" style={{ width: `${share}%`, backgroundColor: color }} title={`${name}: ${Math.round(share)}%`} />
        ))}
      </div>
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ project }: { project: ProjectSummary }) {
  const { label, cls } = getStatusMeta(project);
  return (
    <span className={cn('inline-flex items-center rounded-control px-2.5 py-1 text-label-sm font-semibold', cls)}>
      {label}
    </span>
  );
}

// ─── Avatar stack ─────────────────────────────────────────────────────────────

function MemberStack({ members }: { members: ProjectMember[] }) {
  const visible = members.slice(0, 4);
  const extra = members.length - visible.length;
  return (
    <div className="flex items-center -space-x-2">
      {visible.map((m, i) => (
        <div key={m.id} className="ring-2 ring-white rounded-full">
          <Avatar initials={getInitials(m.user.name)} size={24} colorIndex={i} title={m.user.name} />
        </div>
      ))}
      {extra > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-[10px] font-bold text-text-secondary ring-2 ring-white">
          +{extra}
        </div>
      )}
    </div>
  );
}

// ─── Project card (grid view) ─────────────────────────────────────────────────

function ProjectCard({ project, currentUserId, isNew, onClick }: {
  project: ProjectSummary;
  currentUserId?: string;
  isNew: boolean;
  onClick: () => void;
}) {
  const deadline = formatDeadline(project.deadline);
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full rounded-card border border-black/[0.08] bg-white p-6 text-left transition-all duration-micro hover:-translate-y-0.5 hover:border-text-tertiary hover:shadow-hairline',
        isNew && 'border-l-4 border-accent-lime'
      )}
    >
      {/* Row 1: name + status */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-body-lg font-semibold text-text-primary line-clamp-1">{project.name}</h3>
        <StatusPill project={project} />
      </div>

      {/* Subject */}
      {(project as any).subject && (
        <p className="mt-1.5 text-body-sm text-text-tertiary">{(project as any).subject}</p>
      )}

      {/* Row 3: avatars + deadline on same line */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <MemberStack members={project.members} />
        {deadline && (
          <span className={cn(
            'inline-flex items-center rounded-control px-2.5 py-1 text-label-sm font-semibold',
            deadline.overdue ? 'bg-accent-warning/10 text-accent-warning' : 'bg-surface-muted text-text-secondary'
          )}>
            {deadline.label}
          </span>
        )}
      </div>

      {/* Contribution bar */}
      <div className="mt-4">
        <ContributionBar project={project} currentUserId={currentUserId} />
      </div>

      {/* Source + sync info */}
      <div className="mt-4 flex items-center gap-1.5 text-label-sm text-text-tertiary">
        <span>{project.sourceCount} source{project.sourceCount !== 1 ? 's' : ''} connected</span>
      </div>
    </button>
  );
}

// ─── Compact list row (list view) ─────────────────────────────────────────────

function ProjectRow({ project, onClick }: {
  project: ProjectSummary;
  onClick: () => void;
}) {
  const deadline = formatDeadline(project.deadline);
  const yourShare = project.userContributionShare ?? 0;
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 border-b border-black/[0.06] px-5 py-0 text-left transition-colors duration-micro hover:bg-surface-muted"
      style={{ minHeight: 56 }}
    >
      {/* Avatars + name */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <MemberStack members={project.members} />
        <span className="truncate text-body-md font-medium text-text-primary">{project.name}</span>
      </div>

      {/* Subject */}
      {(project as any).subject && (
        <span className="hidden rounded-hairline border border-black/10 px-2 py-0.5 text-label-sm text-text-tertiary sm:inline">
          {(project as any).subject}
        </span>
      )}

      {/* Mini bar */}
      <div className="hidden w-24 md:block">
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          {project.members.map((m, i) => {
            const share = project.members.length > 0 ? 100 / project.members.length : 0;
            return <div key={m.id} className="h-full" style={{ width: `${share}%`, backgroundColor: getMemberColor(i) }} />;
          })}
        </div>
      </div>

      {/* Your share */}
      <span className="w-10 text-right text-body-sm font-bold text-text-primary">{yourShare}%</span>

      {/* Deadline */}
      {deadline ? (
        <span className={cn('hidden w-20 text-right text-body-sm lg:block', deadline.overdue ? 'text-accent-warning' : 'text-text-secondary')}>
          {deadline.label}
        </span>
      ) : <span className="hidden w-20 lg:block" />}

      {/* Status */}
      <div className="hidden w-20 justify-end sm:flex">
        <StatusPill project={project} />
      </div>
    </button>
  );
}

// ─── New project modal ────────────────────────────────────────────────────────

function NewProjectModal({ isOpen, onClose, onCreate }: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; subject: string; deadline: string; description: string }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) { setName(''); setSubject(''); setDeadline(''); setDescription(''); setIsSubmitting(false); }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try { await onCreate({ name: name.trim(), subject: subject.trim(), deadline, description: description.trim() }); }
    finally { setIsSubmitting(false); }
  };

  const inputCls = 'w-full rounded-control border border-black/10 bg-white px-4 py-2.5 text-body-md text-text-primary placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none focus:ring-2 focus:ring-accent-lime/20';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.2 }}
            role="dialog" aria-modal="true" aria-labelledby="new-project-title"
            className="w-full max-w-md rounded-card border border-black/[0.06] bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id="new-project-title" className="text-display-sm text-text-primary">New project</h2>
              <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-control text-text-tertiary hover:bg-surface-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="p-name" className="mb-2 block text-body-sm font-semibold text-text-primary">
                  Project name <span className="text-accent-warning">*</span>
                </label>
                <input id="p-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Biology Group Report" className={inputCls} required />
              </div>
              <div>
                <label htmlFor="p-subject" className="mb-2 block text-body-sm font-semibold text-text-primary">Subject / topic</label>
                <input id="p-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Biology, History, Software Engineering" className={inputCls} />
              </div>
              <div>
                <label htmlFor="p-deadline" className="mb-2 block text-body-sm font-semibold text-text-primary">Deadline</label>
                <input id="p-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="p-desc" className="mb-2 block text-body-sm font-semibold text-text-primary">Description</label>
                <textarea id="p-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" className="w-full resize-none rounded-card border border-black/10 bg-white px-4 py-3 text-body-md text-text-primary placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none" />
              </div>
              <ButtonPrimaryHero type="submit" className="mt-1 w-full" disabled={!name.trim() || isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create project'}
              </ButtonPrimaryHero>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'finalised', label: 'Finalised' },
  { key: 'setup', label: 'Setup' },
];

const VIEW_KEY = 'projects_view';

export function ProjectsPage() {
  useDocumentTitle('Your projects');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterKey>('all');
  const [view, setView] = useState<'grid' | 'list'>(() => {
    try { return (localStorage.getItem(VIEW_KEY) as 'grid' | 'list') ?? 'grid'; }
    catch { return 'grid'; }
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    try { const data = await api.getProjects(); setProjects(data); }
    catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    try { localStorage.setItem(VIEW_KEY, view); } catch { /* ignore */ }
  }, [view]);

  const handleCreate = async (data: { name: string; subject: string; deadline: string; description: string }) => {
    const created = await api.createProject(data);
    setProjects((prev) => [created, ...prev]);
    setNewIds((prev) => { const s = new Set(prev); s.add(created.id); return s; });
    setIsNewOpen(false);
    setTimeout(() => setNewIds((prev) => { const s = new Set(prev); s.delete(created.id); return s; }), 3000);
  };

  const filtered = projects.filter((p) => matchesFilter(p, filter));

  // Stats
  const active = projects.filter((p) => p.status === 'active').length;
  const finalised = projects.filter((p) => p.status === 'completed' || p.status === 'finalised').length;
  const setup = projects.filter((p) => p.status === 'setup').length;

  const isTeacher = currentUser?.role === 'teacher';

  return (
    <PageContainer width="wide">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg font-display text-text-primary">Your projects</h1>
          <p className="mt-2 text-body-md text-text-secondary">
            {projects.length} project{projects.length !== 1 ? 's' : ''} · {active} active · {finalised} finalised
            {setup > 0 && ` · ${setup} awaiting setup`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ButtonGlassUtility onClick={() => setIsJoinOpen(true)}>
            Join with a code
          </ButtonGlassUtility>
          <ButtonNavCta onClick={() => setIsNewOpen(true)}>
            <Plus size={16} />
            New project
          </ButtonNavCta>
        </div>
      </div>

      {/* ── Teacher strip ───────────────────────────────────────────────────── */}
      {isTeacher && (
        <div className="mb-6 flex items-center justify-between rounded-card bg-surface-forest px-5 py-4">
          <p className="text-body-sm font-semibold text-accent-lime">
            You supervise projects as a teacher
          </p>
          <a href="/teacher" className="text-body-sm font-medium text-accent-lime/80 transition-colors hover:text-accent-lime">
            Open teacher dashboard →
          </a>
        </div>
      )}

      {/* ── Filters + view toggle ────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-control px-3 py-1.5 text-body-sm font-medium transition-colors duration-micro',
                filter === f.key
                  ? 'bg-text-primary text-white'
                  : 'border border-black/10 text-text-secondary hover:bg-surface-muted hover:text-text-primary'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView('grid')}
            aria-label="Grid view"
            className={cn('flex h-8 w-8 items-center justify-center rounded-control transition-colors', view === 'grid' ? 'bg-text-primary text-white' : 'text-text-tertiary hover:bg-surface-muted')}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView('list')}
            aria-label="List view"
            className={cn('flex h-8 w-8 items-center justify-center rounded-control transition-colors', view === 'list' ? 'bg-text-primary text-white' : 'text-text-tertiary hover:bg-surface-muted')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className={view === 'grid' ? 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-2'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={view === 'grid' ? 'h-52' : 'h-14'} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderOpen className="mb-4 h-16 w-16 text-text-tertiary/50" />
          <h2 className="text-display-sm text-text-primary">
            {filter === 'all' ? 'No projects yet' : `No ${filter} projects`}
          </h2>
          <p className="mt-2 max-w-sm text-body-md text-text-secondary">
            {filter === 'all'
              ? 'Create your first project or join one with a code from your teacher.'
              : 'Try a different filter or create a new project.'}
          </p>
          <div className="mt-6 flex gap-3">
            <ButtonGlassUtility onClick={() => setIsJoinOpen(true)}>Join with a code</ButtonGlassUtility>
            <ButtonPrimaryHero onClick={() => setIsNewOpen(true)}>Create a project</ButtonPrimaryHero>
          </div>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={currentUser?.id}
              isNew={newIds.has(project.id)}
              onClick={() => navigate(`/projects/${project.id}/dashboard`)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-black/[0.06] bg-white">
          {filtered.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}/dashboard`)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <NewProjectModal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} onCreate={handleCreate} />
      <JoinByCodeModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </PageContainer>
  );
}
