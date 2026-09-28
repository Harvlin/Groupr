import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
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
import { ConsentModal } from '@/components/project/ConsentModal';
import { getMemberColor } from '@/utils/memberColors';
import type { DashboardData } from '@/types';

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { project, currentMember, disputes } = useProject();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle('Dashboard');

  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    const state = location.state as any;
    if (state?.needsConsent) {
      setShowConsentModal(true);
      window.history.replaceState({}, '', location.pathname);
    } else {
      // Fallback heuristic
      if (project?.id) {
        const hasSeen = localStorage.getItem(`tl-consent-seen-${project.id}`);
        if (!hasSeen) {
          setShowConsentModal(true);
        }
      }
    }
  }, [location.state, location.pathname, project?.id]);

  const handleConsentClose = () => {
    setShowConsentModal(false);
    if (project?.id) {
      localStorage.setItem(`tl-consent-seen-${project.id}`, '1');
    }
  };

  useEffect(() => {
    api.getDashboard().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  const { maxScore, otherShare } = useMemo(() => {
    if (!data) return { maxScore: 1, otherShare: 0 };
    const othersCount = data.members.length - 1;
    const share = othersCount > 0 ? (100 - data.score.finalPercentage) / othersCount : 0;
    return {
      maxScore: Math.max(data.score.finalPercentage, share, 1),
      otherShare: share
    };
  }, [data]);

  const [aiDisclosureDismissed, setAiDisclosureDismissed] = useState(false);
  // TODO: Replace with actual check for AI-flagged events in project data
  const hasAiFlags = data ? data.score.rationale.flags.length > 0 : false;

  const bucketTotal = useMemo(
    () => data ? Object.values(data.bucketBreakdown).reduce((a, b) => a + b, 0) : 0,
    [data]
  );
  const showLateWarning = data ? data.bucketBreakdown.late > bucketTotal / 2 : false;

  // Derived from context disputes — reactive across all pages (fixes 2.7, 3.10, 4.11)
  const showDisputePill = disputes.some(
    (d) => d.status === 'open' && d.userId === currentMember?.userId
  );

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

        {hasAiFlags && !aiDisclosureDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start justify-between gap-3 rounded-card bg-surface-muted p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-text-secondary" />
              <div>
                <p className="font-semibold text-text-primary">AI usage detected</p>
                <p className="text-sm text-text-secondary">
                  Some contributions have been flagged as possibly AI-generated.
                  <button onClick={() => navigate(`/projects/${project?.id}/ai-disclosure`)} className="ml-2 font-semibold text-accent-blue hover:underline">
                    View disclosure →
                  </button>
                </p>
              </div>
            </div>
            <button onClick={() => setAiDisclosureDismissed(true)} className="text-text-tertiary hover:text-text-primary">
              <span className="sr-only">Dismiss</span>
              ×
            </button>
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
                    Score last updated · {formatDistanceToNow(new Date(data.score.computedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {data.score.finalPercentage === 0 && data.project.sourceCount === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-6">
                  <p className="mb-4 text-sm text-text-secondary px-4">
                    No score yet — connect a source to start tracking your contribution.
                  </p>
                  <ButtonPrimaryHero onClick={() => navigate(`/projects/${project?.id}/sources`)}>
                    Connect a source
                  </ButtonPrimaryHero>
                </div>
              ) : (
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
              )}
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
                {data.members.map((member, index) => {
                  const isCurrent = currentMember?.user.id === member.userId;
                  const percentage = isCurrent ? data.score.finalPercentage : otherShare;
                  const width = `${(percentage / maxScore) * 100}%`;
                  const color = getMemberColor(index);
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
                            isCurrent ? '' : 'opacity-60'
                          }`}
                          style={{ width, backgroundColor: color }}
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
      {showConsentModal && <ConsentModal onClose={handleConsentClose} />}
    </PageContainer>
  );
}
