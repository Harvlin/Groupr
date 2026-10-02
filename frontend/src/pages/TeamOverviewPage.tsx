import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Avatar, getInitials } from '@/components/ui/Avatar';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProject } from '@/hooks/useProject';
import {
  ButtonGlassUtility,
  Card,
  CardFeatureMedia,
  StatusBadge,
} from '@/components/ui';
import { TeacherReportSkeleton } from '@/components/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import type {
  ContributionCategory,
  ContributionScore,
  TeacherReportData,
} from '@/types';
import { getMemberColor } from '@/utils/memberColors';

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

const weeklyActivityMap: Record<string, { weeklyActivity: number[]; hasLateSpike: boolean }> = {
  'u-1': { weeklyActivity: [120, 340, 280, 410, 390, 180], hasLateSpike: false },
  'u-2': { weeklyActivity: [0, 80, 160, 200, 520, 890], hasLateSpike: true },
  'u-3': { weeklyActivity: [200, 180, 220, 160, 140, 120], hasLateSpike: false },
  'u-4': { weeklyActivity: [40, 60, 20, 80, 100, 60], hasLateSpike: false },
};

const weeklyChartLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

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
  const { project, members, scores, isLoading: projectLoading } = useProject();
  const navigate = useNavigate();
  useDocumentTitle('Team overview');

  const [reportData, setReportData] = useState<TeacherReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const { dismissed, dismiss } = useDismissedWarning(projectId);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([api.getTeacherReport(projectId), api.getCoachSuggestions(projectId)])
      .then(([report]) => {
        setReportData(report);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const memberColors = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach((m, i) => {
      map[m.userId] = getMemberColor(i);
    });
    return map;
  }, [members]);

  const scoresByUser = useMemo(() => {
    const map: Record<string, ContributionScore> = {};
    scores.forEach((s) => {
      map[s.userId] = s;
    });
    return map;
  }, [scores]);

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
    const stats: Record<string, { category: ContributionCategory; total: number; percentage: number }[]> = {};
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

  const topContributor = orderedMembers[0];
  const mostAtRisk = orderedMembers[orderedMembers.length - 1];
  const distributionGap =
    Math.max(...orderedMembers.map((member) => scoresByUser[member.userId]?.finalPercentage ?? 0)) -
    Math.min(...orderedMembers.map((member) => scoresByUser[member.userId]?.finalPercentage ?? 0));

  const weeklyChartData = useMemo(
    () =>
      weeklyChartLabels.map((week, weekIndex) => {
        const row: Record<string, string | number> = { week };

        orderedMembers.forEach((member) => {
          row[member.userId] = weeklyActivityMap[member.userId]?.weeklyActivity[weekIndex] ?? 0;
        });

        return row;
      }),
    [orderedMembers]
  );

  const weeklyChartConfig = useMemo(
    () =>
      orderedMembers.reduce<Record<string, { label: string; color: string }>>((acc, member, index) => {
        acc[member.userId] = {
          label: member.user.name,
          color: getMemberColor(index),
        };
        return acc;
      }, {}),
    [orderedMembers]
  );

  if (projectLoading || loading || !project) {
    return <TeacherReportSkeleton />;
  }

  return (
    <PageContainer width="wide">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="font-display text-3xl text-text-primary" style={{ lineHeight: 0.9 }}>
          {project.name}
        </h1>
        {project.deadline && (
          <span className="inline-flex w-fit items-center rounded-control border border-black/10 px-3 py-1 text-sm text-text-secondary">
            Due {formatDateLabel(project.deadline)}
          </span>
        )}
      </div>

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
              Contribution imbalance detected — {warningInfo.member.user.name} has contributed less than 15% with {warningInfo.daysRemaining} day{warningInfo.daysRemaining === 1 ? '' : 's'} remaining. Coach Mode has suggestions.
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

      <CardFeatureMedia className="mb-6 p-8 md:p-10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
          Team contributions
        </span>
        <p className="mt-1 text-sm text-text-tertiary">Score last updated · 3 min ago</p>

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
                  {score && <StatusBadge level={score.confidenceLevel} className="shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </CardFeatureMedia>

      <CardFeatureMedia className="mt-5 p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Activity over time
          </span>
          <span className="text-xs text-text-tertiary">Last 6 weeks</span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyChartData} margin={{ top: 10, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke="#dfe5e2" strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#6a6c6a', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={38}
                tick={{ fill: '#6a6c6a', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: '#dfe5e2', strokeDasharray: '4 4' }}
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #dfe5e2',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(16, 16, 8, 0.08)',
                }}
                formatter={(value: number | string) => [`${value} pts`, 'Activity']}
                labelFormatter={(label) => `Week ${label}`}
              />

              {orderedMembers.map((member, index) => {
                const color = weeklyChartConfig[member.userId]?.color ?? getMemberColor(index);

                return (
                  <Line
                    key={member.userId}
                    type="monotone"
                    dataKey={member.userId}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: color }}
                    activeDot={{ r: 5 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {orderedMembers.map((member, index) => {
            const color = weeklyChartConfig[member.userId]?.color ?? getMemberColor(index);

            return (
              <div key={member.userId} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-text-secondary">{member.user.name}</span>
              </div>
            );
          })}
        </div>
      </CardFeatureMedia>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card padding="md">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Top contributor
          </span>
          <div className="mt-2 flex items-center gap-2">
            <Avatar initials={getInitials(topContributor?.user.name ?? 'A')}
              colorIndex={0}
              size={32}
            />
            <div>
              <p className="text-body-md font-semibold text-text-primary">{topContributor?.user.name}</p>
              <p className="text-body-sm text-text-tertiary">{scoresByUser[topContributor.userId]?.finalPercentage ?? 0}% of project</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Most at-risk
          </span>
          <div className="mt-2 flex items-center gap-2">
            <Avatar initials={getInitials(mostAtRisk?.user.name ?? 'A')} colorIndex={orderedMembers.length - 1} size={32} />
            <div>
              <p className="text-body-md font-semibold text-text-primary">{mostAtRisk?.user.name}</p>
              <p className="text-body-sm text-accent-warning">
                {scoresByUser[mostAtRisk.userId]?.finalPercentage ?? 0}% · below threshold
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Distribution gap
          </span>
          <div className="mt-2">
            <p className="font-display text-[36px] leading-none text-text-primary">
              {distributionGap}
              <span className="text-[20px]">pp</span>
            </p>
            <p className="text-body-sm text-text-tertiary">between highest and lowest</p>
          </div>
        </Card>
      </div>

      <CardFeatureMedia className="mt-5 p-8 md:p-10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
          What everyone worked on
        </span>
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[560px] rounded-card border border-hairline bg-white">
            <div className="grid grid-cols-[180px_repeat(5,minmax(0,1fr))] border-b border-black/5 px-4 py-3 text-xs font-semibold text-text-secondary">
              <span>Member</span>
              {CATEGORY_COLUMNS.map((column) => (
                <span key={column.label} className="text-center">{column.label}</span>
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
                      className={`flex items-center justify-center gap-2 px-4 py-3 ${
                        stat.percentage > 0 ? 'bg-transparent' : 'bg-surface-muted/30'
                      }`}
                    >
                      {stat.percentage > 0 ? (
                        <>
                          <div
                            className="h-4 w-4 shrink-0 rounded-sm"
                            style={{ backgroundColor: color, opacity: Math.max(0.1, stat.percentage / 100) }}
                          />
                          <span className="text-sm text-text-primary">{stat.percentage}%</span>
                        </>
                      ) : (
                        <div className="h-full w-full" />
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </CardFeatureMedia>
    </PageContainer>
  );
}

