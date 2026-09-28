import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Flag, MessageSquareWarning } from 'lucide-react';
import { api } from '@/services/api';
import { ButtonNavCta } from '@/components/ui';
import { Skeleton } from '@/components/Skeleton';
import type { TeacherProjectSummary } from '@/types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'active' | 'issues' | 'finalised';
type SortType = 'deadline_asc' | 'deadline_desc' | 'name' | 'issues';

function ProjectRow({ project }: { project: TeacherProjectSummary }) {
  const navigate = useNavigate();
  const daysLeft = differenceInDays(parseISO(project.deadline), new Date());
  const deadlineUrgent = daysLeft <= 3 && project.status === 'active';

  return (
    <div className="rounded-card border border-border-hairline bg-white p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">{project.projectName}</h2>
            <span className="rounded-hairline border border-border-hairline/40 px-2 py-0.5 text-xs text-text-secondary">{project.subject}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className={cn('text-sm flex items-center gap-1', deadlineUrgent ? 'text-accent-warning font-medium' : 'text-text-tertiary')}>
              Due {format(parseISO(project.deadline), 'd MMM yyyy')}
              {deadlineUrgent && <AlertTriangle size={14} aria-hidden="true" />}
            </span>
            <span className="text-sm text-text-tertiary">{project.teamSize} members</span>
          </div>
        </div>

        {/* Right — alerts + actions */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-wrap justify-end gap-2">
            {project.hasImbalance && (
              <span className="flex items-center gap-1.5 rounded-control border border-accent-warning px-3 py-1 text-xs font-medium text-accent-warning">
                <AlertTriangle size={14} aria-hidden="true" />
                Imbalance
              </span>
            )}
            {project.hasOpenDisputes && (
              <span className="flex items-center gap-1.5 rounded-control border border-accent-warning px-3 py-1 text-xs font-medium text-accent-warning">
                <MessageSquareWarning size={14} aria-hidden="true" />
                Dispute(s)
              </span>
            )}
            {project.hasCollusionFlags && (
              <span className="flex items-center gap-1.5 rounded-control border border-accent-warning px-3 py-1 text-xs font-medium text-accent-warning">
                <Flag size={14} aria-hidden="true" />
                Review flagged
              </span>
            )}
            {project.pendingConsentCount > 0 && (
              <span className="rounded-control border border-border-hairline px-3 py-1 text-xs text-text-secondary">{project.pendingConsentCount} pending consent</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ButtonNavCta size="default" onClick={() => navigate(`/projects/${project.projectId}/teacher-report`)}>
              Open report
            </ButtonNavCta>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboardPage() {
  const [projects, setProjects] = useState<TeacherProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('deadline_asc');

  useEffect(() => {
    api.getTeacherProjects().then(setProjects).finally(() => setLoading(false));
  }, []);

  const filtered = projects
    .filter(p => {
      if (filter === 'active') return p.status === 'active';
      if (filter === 'finalised') return p.status === 'finalised';
      if (filter === 'issues') return p.hasImbalance || p.hasOpenDisputes || p.hasCollusionFlags;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'deadline_asc') return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
      if (sort === 'deadline_desc') return parseISO(b.deadline).getTime() - parseISO(a.deadline).getTime();
      if (sort === 'name') return a.projectName.localeCompare(b.projectName);
      if (sort === 'issues') {
        const aScore = [a.hasImbalance, a.hasOpenDisputes, a.hasCollusionFlags].filter(Boolean).length;
        const bScore = [b.hasImbalance, b.hasOpenDisputes, b.hasCollusionFlags].filter(Boolean).length;
        return bScore - aScore;
      }
      return 0;
    });

  const activeCount = projects.filter(p => p.status === 'active').length;
  const totalStudents = projects.reduce((acc, p) => acc + p.teamSize, 0);

  const FILTERS: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Has issues', value: 'issues' },
    { label: 'Finalised', value: 'finalised' },
  ];

  return (
    <div>
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-5xl text-text-primary">Supervised projects</h1>
          <p className="mt-2 text-base text-text-secondary">
            {activeCount} active project{activeCount !== 1 ? 's' : ''} · {totalStudents} total students
          </p>
        </div>

        {/* Filter / sort bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'rounded-control px-4 py-1.5 text-sm font-medium transition-colors',
                  filter === f.value
                    ? 'bg-accent-lime text-text-primary'
                    : 'border border-border-hairline text-text-secondary hover:bg-surface-muted'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortType)}
            className="rounded-control border border-border-hairline bg-white px-3 py-1.5 text-sm text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime"
          >
            <option value="deadline_asc">Deadline (soonest)</option>
            <option value="deadline_desc">Deadline (latest)</option>
            <option value="name">Name A–Z</option>
            <option value="issues">Issues first</option>
          </select>
        </div>

        {/* Projects list */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-text-tertiary">
              <rect x="8" y="16" width="48" height="36" rx="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 24h48M20 16V8M44 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M22 36h20M22 42h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-text-primary">No supervised projects yet</h2>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              Create a project and assign it to a student team, or ask students to add you when creating theirs.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(p => (
              <ProjectRow key={p.projectId} project={p} />
            ))}
          </div>
        )}

        <div className="mt-12 border-t border-border-hairline/20 pt-6">
          <Link to="/projects" className="text-sm text-accent-blue hover:underline">← Back to your student projects</Link>
        </div>
      </main>
    </div>
  );
}
