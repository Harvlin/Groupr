import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProject } from '@/hooks/useProject';
import {
  ButtonGlassUtility,
  CardFeatureMedia,
  StatusBadge,
} from '@/components/ui';
import { TeacherReportSkeleton } from '@/components/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import type {
  ContributionCategory,
  ContributionScore,
  ContributionEvent,
  ProjectMember,
  TeacherReportData,
} from '@/types';

const MEMBER_COLORS = ['#9FE870', '#0097C7', '#B8860B', '#FF8C69'];

const CATEGORY_COLUMNS: {
  key: ContributionCategory[];
  label: string;
}[] = [
  { key: ['core_writing', 'editing'], label: 'Writing' },
  { key: ['research'], label: 'Research' },
  { key: ['design'], label: 'Design' },
  { key: ['coordination'], label: 'Coordination' },
  { key: ['coding'], label: 'Coding' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDateLabel(iso: string | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

function useDismissedWarning(projectId: string | undefined) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined' || !projectId) return false;
    return sessionStorage.getItem(`tl-team-warning-dismissed-${projectId}`) === '1';
  });

  const dismiss = () => {
    if (typeof window === 'undefined' || !projectId) return;
    sessionStorage.setItem(`tl-team-warning-dismissed-${projectId}`, '1');
    setDismissed(true);
  };

  return { dismissed, dismiss };
}

export function TeamOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, members, isLoading: projectLoading } = useProject();
  const navigate = useNavigate();
  useDocumentTitle('Team overview');

  const [reportData, setReportData] = useState<TeacherReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const { dismissed, dismiss } = useDismissedWarning(projectId);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([api.getTeacherReport(), api.getCoachSuggestions(projectId)])
      .then(([report]) => {
        setReportData(report);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const memberColors = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach((m, i) => {
      map[m.userId] = MEMBER_COLORS[i % MEMBER_COLORS.length];
    });
    return map;
  }, [members]);

  const scoresByUser = useMemo(() => {
    const map: Record<string, ContributionScore> = {};
    reportData?.scores.forEach((s) => {
      map[s.userId] = s;
    });
    return map;
  }, [reportData]);

  const orderedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const sa = scoresByUser[a.userId]?.finalPercentage ?? 0;
      const sb = scoresByUser[b.userId]?.finalPercentage ?? 0;
      return sb - sa;
    });
  }, [members, scoresByUser]);

  const deadlineElapsed = useMemo(() => {
    if (!project?.createdAt || !project?.deadline) return null;
    const created = new Date(project.createdAt);
    const deadline = new Date(project.deadline);
    const now = new Date();
    if (Number.isNaN(created.getTime()) || Number.isNaN(deadline.getTime())) return null;
    const total = deadline.getTime() - created.getTime();
    if (total <= 0) return null;
    const elapsed = now.getTime() - created.getTime();
    return { elapsed: Math.max(0, elapsed), total, deadline };
  }, [project]);

  const warningInfo = useMemo(() => {
    if (!deadlineElapsed || deadlineElapsed.elapsed / deadlineElapsed.total <= 0.5) return null;
    const daysRemaining = daysBetween(new Date(), deadlineElapsed.deadline);
    for (const member of members) {
      const score = scoresByUser[member.userId];
      if (score && score.finalPercentage < 15) {
        return { member, daysRemaining };
      }
    }
    return null;
  }, [deadlineElapsed, members, scoresByUser]);

  const categoryStats = useMemo(() => {
    if (!reportData?.events) return {};
    const stats: Record<
      string,
      { category: ContributionCategory; total: number; percentage: number }[]
    > = {};
    members.forEach((m) => {
      const userEvents = reportData.events.filter((e) => e.userId === m.userId && e.category);
      const totals: Partial<Record<ContributionCategory, number>> = {};
      let sum = 0;
      userEvents.forEach((e) => {
        const value = e.uniqueContentDelta ?? 1;
        const cat = e.category as ContributionCategory;
        totals[cat] = (totals[cat] ?? 0) + value;
        sum += value;
      });
      stats[m.userId] = CATEGORY_COLUMNS.map(({ key }) => {
        const catTotal = key.reduce((acc, k) => acc + (totals[k] ?? 0), 0);
        const percentage = sum > 0 ? Math.round((catTotal / sum) * 100) : 0;
        return { category: key[0], total: catTotal, percentage };
      });
    });
    return stats;
  }, [reportData, members]);

  if (projectLoading || loading || !project) {
    return <TeacherReportSkeleton />;
  }

  return (
    <PageContainer width="wide">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1
          className="font-display text-3xl text-text-primary"
          style={{ lineHeight: 0.9 }}
        >
          {project.name}
        </h1>
        {project.deadline && (
          <span className="inline-flex w-fit items-center rounded-control border border-black/10 px-3 py-1 text-sm text-text-secondary">
            Due {formatDateLabel(project.deadline)}
          </span>
        )}
      </div>

      {/* Early warning banner */}
      {warningInfo && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-3 rounded-hairline border-l-[3px] border-accent-warning bg-accent-warning/10 p-4"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="mt-0.5 shrink-0 text-accent-warning"
            aria-hidden="true"
          >
            <path
              d="M12 5.5L3.5 19.5H20.5L12 5.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 10V14M12 16V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-accent-warning">
              Contribution imbalance detected — {warningInfo.member.user.name} has contributed
              less than 15% with {warningInfo.daysRemaining} day
              {warningInfo.daysRemaining === 1 ? '' : 's'} remaining. Coach Mode has suggestions.
            </p>
          </div>
          <button
            onClick={() => navigate(`/projects/${projectId}/coach`)}
            className="shrink-0 text-sm font-semibold text-accent-blue hover:underline"
          >
            View Coach Mode →
          </button>
          <ButtonGlassUtility
            onClick={dismiss}
            className="ml-2 h-8 w-8 shrink-0 p-0 text-text-secondary"
            aria-label="Dismiss warning"
          >
            ×
          </ButtonGlassUtility>
        </motion.div>
      )}

      {/* Team contribution overview */}
      <CardFeatureMedia className="mb-6 p-8 md:p-10">
        <h2 className="font-body text-base font-semibold text-text-secondary">
          Team contributions
        </h2>
        <p className="mt-1 font-body text-sm text-text-tertiary">
          Last updated 4 minutes ago
        </p>

        <div className="mt-6 space-y-5">
          {orderedMembers.map((member) => {
            const score = scoresByUser[member.userId];
            const pct = score?.finalPercentage ?? 0;
            const color = memberColors[member.userId];
            return (
              <button
                key={member.userId}
                onClick={() => navigate(`/projects/${projectId}/dashboard?member=${member.userId}`)}
                className="flex w-full flex-col gap-3 rounded-hairline p-2 text-left transition-colors hover:bg-black/[0.02] md:flex-row md:items-center md:gap-4"
              >
                <div className="flex items-center gap-3 md:w-48">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-text-primary"
                    style={{ backgroundColor: color }}
                  >
                    {getInitials(member.user.name)}
                  </div>
                  <span className="font-body text-base font-medium text-text-primary">
                    {member.user.name}
                  </span>
                </div>

                <div className="flex flex-1 items-center gap-4">
                  <div className="h-[10px] flex-1 overflow-hidden rounded-control bg-surface-muted">
                    <div
                      className="h-full rounded-control"
                      style={{
                        width: `${Math.min(100, Math.max(0, pct))}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right font-body text-sm font-bold text-text-primary">
                    {pct}%
                  </span>
                  {score && (
                    <StatusBadge level={score.confidenceLevel} className="shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardFeatureMedia>

      {/* Category breakdown matrix */}
      <CardFeatureMedia className="mb-6 p-8 md:p-10">
        <h2 className="mb-4 font-body text-base font-semibold text-text-secondary">
          What everyone worked on
        </h2>
        <div className="overflow-x-auto">
          <div className="min-w-[560px] rounded-none border border-black/10 bg-white">
            {/* Header row */}
            <div className="grid grid-cols-[180px_repeat(5,minmax(0,1fr))] border-b border-black/5 px-4 py-3 text-xs font-semibold text-text-secondary">
              <span>Member</span>
              {CATEGORY_COLUMNS.map((c) => (
                <span key={c.label} className="text-center">
                  {c.label}
                </span>
              ))}
            </div>

            {orderedMembers.map((member, idx) => {
              const stats = categoryStats[member.userId] ?? [];
              const color = memberColors[member.userId];
              return (
                <div
                  key={member.userId}
                  className={`grid grid-cols-[180px_repeat(5,minmax(0,1fr))] items-center border-b border-black/5 px-4 py-3 last:border-b-0 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-surface-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-text-primary"
                      style={{ backgroundColor: color }}
                    >
                      {getInitials(member.user.name)}
                    </div>
                    <span className="truncate text-sm font-medium text-text-primary">
                      {member.user.name}
                    </span>
                  </div>
                  {stats.map((stat) => (
                    <div
                      key={stat.category}
                      className="flex items-center justify-center gap-2"
                    >
                      {stat.percentage > 0 ? (
                        <>
                          <div
                            className="h-4 w-4 shrink-0"
                            style={{
                              backgroundColor: color,
                              opacity: Math.max(0.1, stat.percentage / 100),
                            }}
                          />
                          <span className="text-sm text-text-primary">
                            {stat.percentage}%
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-text-tertiary">—</span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </CardFeatureMedia>

      {/* Activity timeline */}
      <CardFeatureMedia className="mb-6 p-8 md:p-10">
        <h2 className="mb-4 font-body text-base font-semibold text-text-secondary">
          Activity over time
        </h2>
        <ActivityTimeline
          events={reportData?.events ?? []}
          members={orderedMembers}
          memberColors={memberColors}
        />
      </CardFeatureMedia>

      {/* Individual member cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {orderedMembers.map((member) => {
          const score = scoresByUser[member.userId];
          const stats = categoryStats[member.userId] ?? [];
          const topCategories = [...stats]
            .filter((s) => s.percentage > 0)
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 3);
          const hasDispute = reportData?.disputes.some(
            (d) => d.userId === member.userId && d.status === 'open'
          );
          const color = memberColors[member.userId];
          const pct = score?.manualOverridePercentage ?? score?.finalPercentage ?? 0;

          return (
            <motion.button
              key={member.userId}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/projects/${projectId}/dashboard?member=${member.userId}`)}
              className="text-left"
            >
              <CardFeatureMedia className="h-full p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full font-semibold text-text-primary"
                      style={{ backgroundColor: color }}
                    >
                      {getInitials(member.user.name)}
                    </div>
                    <div>
                      <p className="font-body text-base font-semibold text-text-primary">
                        {member.user.name}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-control px-2 py-0.5 text-xs font-semibold ${
                          member.role === 'leader'
                            ? 'bg-accent-lime text-text-primary'
                            : 'border border-black/10 text-text-secondary'
                        }`}
                      >
                        {member.role === 'leader' ? 'Leader' : 'Member'}
                      </span>
                    </div>
                  </div>
                  {hasDispute && (
                    <span className="rounded-control bg-accent-warning/10 px-2 py-0.5 text-xs font-semibold text-accent-warning">
                      dispute pending
                    </span>
                  )}
                </div>

                <div className="mt-6 flex items-end gap-4">
                  <span
                    className="font-display text-3xl text-text-primary"
                    style={{ lineHeight: 0.9 }}
                  >
                    {pct}%
                  </span>
                  {score && <StatusBadge level={score.confidenceLevel} />}
                </div>

                {topCategories.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {topCategories.map((cat) => (
                      <span
                        key={cat.category}
                        className="rounded-control border border-black/10 px-2 py-1 text-xs text-text-primary"
                      >
                        {CATEGORY_COLUMNS.find((c) => c.key.includes(cat.category))?.label ??
                          cat.category}
                      </span>
                    ))}
                  </div>
                )}
              </CardFeatureMedia>
            </motion.button>
          );
        })}
      </div>
    </PageContainer>
  );
}

function ActivityTimeline({
  events,
  members,
  memberColors,
}: {
  events: ContributionEvent[];
  members: ProjectMember[];
  memberColors: Record<string, string>;
}) {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const buckets = useMemo(() => {
    const list: { start: Date; end: Date; label: string }[] = [];
    for (let i = 4; i >= 0; i--) {
      const start = new Date(now.getTime() - (i + 1) * weekMs);
      const end = new Date(now.getTime() - i * weekMs);
      list.push({
        start,
        end,
        label: i === 0 ? 'This week' : `${i}w ago`,
      });
    }
    return list;
  }, [now.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

  const data = useMemo(() => {
    const series = members.map((m) => {
      const values = buckets.map(() => 0);
      let total = 0;
      events
        .filter((e) => e.userId === m.userId)
        .forEach((e) => {
          const t = new Date(e.timestamp).getTime();
          buckets.forEach((b, i) => {
            if (t >= b.start.getTime() && t < b.end.getTime()) {
              values[i] += e.uniqueContentDelta ?? 1;
              total += e.uniqueContentDelta ?? 1;
            }
          });
        });
      const max = Math.max(...values, 1);
      return { member: m, values, max, total, spike: values[values.length - 1] / (total || 1) > 0.5 };
    });

    const globalMax = Math.max(...series.flatMap((s) => s.values), 1);
    return series.map((s) => ({
      ...s,
      normalized: s.values.map((v) => (globalMax > 0 ? v / globalMax : 0)),
    }));
  }, [events, members, buckets]);

  const width = 100;
  const height = 100;
  const padX = 8;
  const padY = 8;
  const graphH = height - padY * 2;
  const graphW = width - padX * 2;

  const pointsFor = (normalized: number[]) => {
    return normalized.map((v, i) => {
      const x = padX + (i / (normalized.length - 1)) * graphW;
      const y = height - padY - v * graphH;
      return [x, y] as [number, number];
    });
  };

  const buildSmoothPath = (points: [number, number][]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      const cpx1 = x0 + (x1 - x0) / 2;
      const cpy1 = y0;
      const cpx2 = x0 + (x1 - x0) / 2;
      const cpy2 = y1;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x1} ${y1}`;
    }
    return d;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[320px]">
        <div className="relative rounded-none border border-black/10 bg-white p-4">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-[100px] w-full"
          >
            {/* baseline */}
            <line
              x1={padX}
              y1={height - padY}
              x2={width - padX}
              y2={height - padY}
              stroke="currentColor"
              className="text-black/5"
              strokeWidth={1}
            />
            {data.map(({ member, normalized, spike }) => {
              const points = pointsFor(normalized);
              const isDimmed = hoveredMember !== null && hoveredMember !== member.userId;
              return (
                <g
                  key={member.userId}
                  opacity={isDimmed ? 0.2 : 1}
                  onMouseEnter={() => setHoveredMember(member.userId)}
                  onMouseLeave={() => setHoveredMember(null)}
                >
                  <path
                    d={buildSmoothPath(points)}
                    fill="none"
                    stroke={memberColors[member.userId]}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {points.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={2} fill={memberColors[member.userId]} />
                  ))}
                  {spike && (
                    <g>
                      <circle
                        cx={points[points.length - 1][0]}
                        cy={points[points.length - 1][1]}
                        r={4}
                        className="fill-accent-warning"
                      />
                      <title>Late-phase spike — lower weighted by anti-gaming engine</title>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="mt-2 grid grid-cols-5 gap-1 text-center text-xs text-text-tertiary">
            {buckets.map((b) => (
              <span key={b.label}>{b.label}</span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {members.map((m) => (
              <button
                key={m.userId}
                type="button"
                className="flex items-center gap-1.5 text-xs text-text-secondary transition-opacity hover:opacity-80"
                onMouseEnter={() => setHoveredMember(m.userId)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: memberColors[m.userId] }}
                />
                {m.user.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
