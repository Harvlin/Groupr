import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, MessageSquareWarning, AlertCircle } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeleton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProject } from '@/hooks/useProject';
import {
  CardFeatureMedia,
  ButtonPrimaryHero,
  ButtonGlassUtility,
  StatusBadge,
} from '@/components/ui';
import { CategoryChart } from '@/components/charts/CategoryChart';
import { BucketTimeline } from '@/components/charts/BucketTimeline';
import { PageContainer } from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { scores } from '@/data/mock';
import type { DashboardData } from '@/types';

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { project, currentMember } = useProject();
  const navigate = useNavigate();
  useDocumentTitle('Dashboard');

  useEffect(() => {
    api.getDashboard().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  const maxScore = useMemo(
    () => Math.max(...scores.map((s) => s.finalPercentage), 1),
    []
  );

  const bucketTotal = useMemo(
    () => data ? Object.values(data.bucketBreakdown).reduce((a, b) => a + b, 0) : 0,
    [data]
  );
  const showLateWarning = data ? data.bucketBreakdown.late > bucketTotal / 2 : false;

  const showDisputePill =
    data?.project.id === 'project1' && currentMember?.user.id === 'u-4';

  const isFinalized = project?.status === 'completed';

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <PageContainer width="wide">
      <div className="py-8 lg:py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
              Student dashboard
            </p>
            <h1
              className="mt-1 font-display text-3xl text-text-primary md:text-4xl"
              style={{ lineHeight: 0.9 }}
            >
              {project?.name ?? data.project.name}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <ButtonGlassUtility
                disabled={isFinalized}
                onClick={() =>
                  !isFinalized && navigate(`/projects/${project?.id}/disputes`)
                }
              >
                <MessageSquareWarning size={16} />
                File a dispute
              </ButtonGlassUtility>
              <ButtonPrimaryHero
                disabled={isFinalized}
                onClick={() =>
                  !isFinalized && navigate(`/projects/${project?.id}/sources`)
                }
              >
                Connect source
              </ButtonPrimaryHero>
            </div>
            {showDisputePill && (
              <span className="rounded-control border border-accent-warning px-3 py-1 text-xs font-semibold text-accent-warning">
                Dispute pending
              </span>
            )}
          </div>
        </div>

        {isFinalized && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-card bg-surface-forest p-4"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-accent-lime" />
            <div>
              <p className="font-semibold text-accent-lime">Project finalised</p>
              <p className="text-sm text-accent-lime/80">
                This project is complete. Scores are locked and sources can no longer be connected.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.8, 0.05, 0.2, 0.95] }}
            className="lg:col-span-1"
          >
            <CardFeatureMedia className="flex h-full flex-col items-center text-center">
              <div className="mb-4 flex w-full items-start justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Your contribution
                </span>
                <div className="flex flex-col items-end">
                  <StatusBadge level={data.score.confidenceLevel} />
                  <p className="mt-1 text-xs text-text-tertiary">
                    Score last updated · 4 min ago
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center py-6">
                <span
                  className="font-display text-data-numeral text-text-primary"
                  style={{ lineHeight: 0.9 }}
                >
                  {data.score.finalPercentage}%
                </span>
                <p className="mt-2 text-sm text-text-secondary">
                  of the project
                </p>
              </div>
              <div className="w-full rounded-control bg-surface-muted px-4 py-3">
                <p className="text-sm text-text-secondary">
                  Team average:{' '}
                  <span className="font-bold text-text-primary">
                    {data.teamAverage}%
                  </span>
                </p>
              </div>
            </CardFeatureMedia>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.8, 0.05, 0.2, 0.95] }}
            className="lg:col-span-1"
          >
            <CardFeatureMedia className="flex h-full flex-col">
              <h2 className="text-sm font-semibold text-text-secondary">
                Your score vs team
              </h2>
              <div className="mt-4 flex flex-1 flex-col justify-center gap-3">
                {data.members.map((member) => {
                  const memberScore = scores.find((s) => s.userId === member.userId);
                  const width = memberScore
                    ? `${(memberScore.finalPercentage / maxScore) * 100}%`
                    : '0%';
                  const isCurrent = currentMember?.user.id === member.userId;
                  return (
                    <button
                      key={member.userId}
                      onClick={() => navigate(`/projects/${project?.id}/team`)}
                      className="group flex w-full items-center gap-3 text-left"
                    >
                      <span className="w-24 truncate text-xs text-text-secondary">
                        {member.user.name}
                      </span>
                      <div className="flex-1 rounded-control bg-surface-muted">
                        <div
                          className={`h-2 rounded-control transition-all duration-500 ${
                            isCurrent ? 'bg-accent-lime' : 'bg-surface-muted'
                          }`}
                          style={{ width }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardFeatureMedia>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.8, 0.05, 0.2, 0.95] }}
            className="lg:col-span-2"
          >
            <CardFeatureMedia className="h-full">
              <h2 className="font-display text-xl text-text-primary" style={{ lineHeight: 0.95 }}>
                Rationale
              </h2>
              <ul className="mt-5 space-y-4">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent-lime" />
                  <p className="text-text-secondary body-dense">
                    {data.score.rationale.content_share}
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent-lime" />
                  <p className="text-text-secondary body-dense">
                    {data.score.rationale.temporal_note}
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent-lime" />
                  <p className="text-text-secondary body-dense">
                    {data.score.rationale.session_note}
                  </p>
                </li>
                {data.score.rationale.flags.length > 0 && (
                  <li className="flex gap-3 rounded-card bg-accent-warning/10 p-4">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent-warning" />
                    <p className="text-sm text-text-primary">
                      {data.score.rationale.flags.join(' ')}
                    </p>
                  </li>
                )}
              </ul>
            </CardFeatureMedia>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.8, 0.05, 0.2, 0.95] }}
          >
            <CardFeatureMedia className="h-full">
              <h2 className="font-display text-xl text-text-primary" style={{ lineHeight: 0.95 }}>
                Category breakdown
              </h2>
              <div className="mt-6">
                <CategoryChart data={data.categoryBreakdown} />
              </div>
            </CardFeatureMedia>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.8, 0.05, 0.2, 0.95] }}
          >
            <CardFeatureMedia className="h-full">
              <h2 className="font-display text-xl text-text-primary" style={{ lineHeight: 0.95 }}>
                Timeline
              </h2>
              <div className="mt-6">
                <BucketTimeline buckets={data.bucketBreakdown} />
              </div>
              {showLateWarning && (
                <p className="mt-4 text-xs text-accent-warning">
                  High late-phase activity carries reduced weight in the anti-gaming engine.
                </p>
              )}
            </CardFeatureMedia>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.8, 0.05, 0.2, 0.95] }}
          >
            <CardFeatureMedia className="flex h-full flex-col justify-between">
              <div>
                <h2 className="font-display text-xl text-text-primary" style={{ lineHeight: 0.95 }}>
                  Activity
                </h2>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-primary">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">
                        {data.sessionCount}
                      </p>
                      <p className="text-xs text-text-tertiary">Active sessions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-primary">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">
                        {data.members.length}
                      </p>
                      <p className="text-xs text-text-tertiary">Team members</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-xs text-text-tertiary">
                {data.score.rationale.confidence_reason}
              </p>
            </CardFeatureMedia>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}
