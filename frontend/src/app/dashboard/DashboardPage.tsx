import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, MessageSquareWarning, AlertCircle, Link2 } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeleton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProject } from '@/hooks/useProject';
import {
  Card,
  ButtonPrimaryHero,
  ButtonGlassUtility,
  StatusBadge,
} from '@/components/ui';
import { PageContainer } from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { ConsentModal } from '@/components/project/ConsentModal';
import { getMemberColor } from '@/utils/memberColors';
import type { DashboardData } from '@/types';

const categoryLabelMap: Record<string, string> = {
  core_writing: 'Core writing',
  research: 'Research',
  editing: 'Editing',
  coordination: 'Coordination',
  coding: 'Coding',
  design: 'Design',
};

function getTimelineSummary(phases: Array<{ label: string; value: number }>): string {
  const values = phases.map((phase) => phase.value);
  const max = Math.max(...values);
  const maxPhase = phases.find((phase) => phase.value === max);
  const min = Math.min(...values);

  if (phases[2].value > phases[0].value * 1.5) {
    return 'Most activity concentrated in the late phase.';
  }

  if (max - min < phases[0].value * 0.3) {
    return 'Work distributed evenly across all phases.';
  }

  return `Highest activity in the ${maxPhase?.label.toLowerCase()} phase.`;
}

function StatRow({ icon: Icon, value, label }: { icon: typeof Clock; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-primary">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[22px] font-bold leading-none text-text-primary">{value}</p>
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
          {label}
        </p>
      </div>
    </div>
  );
}

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
    } else if (project?.id) {
      const hasSeen = localStorage.getItem(`tl-consent-seen-${project.id}`);
      if (!hasSeen) {
        setShowConsentModal(true);
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
      otherShare: share,
    };
  }, [data]);

  const [aiDisclosureDismissed, setAiDisclosureDismissed] = useState(false);
  const hasAiFlags = data ? data.score.rationale.flags.length > 0 : false;
  const bucketTotal = useMemo(
    () => (data ? Object.values(data.bucketBreakdown).reduce((a, b) => a + b, 0) : 0),
    [data]
  );
  const showLateWarning = data ? data.bucketBreakdown.late > bucketTotal / 2 : false;

  const showDisputePill = disputes.some(
    (d) => d.status === 'open' && d.userId === currentMember?.userId
  );

  const isFinalized = project?.status === 'completed';

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const phases = [
    { label: 'Early', value: data.bucketBreakdown.early },
    { label: 'Middle', value: data.bucketBreakdown.middle },
    { label: 'Late', value: data.bucketBreakdown.late },
  ];
  const timelineSummary = getTimelineSummary(phases);
  const maxPhaseValue = Math.max(...phases.map((phase) => phase.value));

  return (
    <PageContainer width="medium" className="px-8 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 items-center justify-end gap-3 md:justify-end">
          <div className="flex items-center gap-3">
            <ButtonGlassUtility
              disabled={isFinalized}
              onClick={() => !isFinalized && navigate(`/projects/${project?.id}/disputes`)}
            >
              <MessageSquareWarning size={16} />
              File a dispute
            </ButtonGlassUtility>
            <ButtonPrimaryHero
              disabled={isFinalized}
              onClick={() => !isFinalized && navigate(`/projects/${project?.id}/sources`)}
            >
              Connect source
            </ButtonPrimaryHero>
          </div>
        </div>
      </div>

      {showDisputePill && (
        <div className="mb-6 flex justify-end">
          <span className="rounded-full border border-accent-warning px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-accent-warning">
            Dispute pending
          </span>
        </div>
      )}

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
                <button
                  onClick={() => navigate(`/projects/${project?.id}/ai-disclosure`)}
                  className="ml-2 font-semibold text-accent-blue hover:underline"
                >
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

      <div className="flex items-stretch gap-5">
        <motion.div className="flex-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg" className="flex h-full flex-col">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                  Your contribution
                </span>
                <StatusBadge level={data.score.confidenceLevel} />
              </div>

              <div>
                <span className="font-display text-[72px] leading-none text-text-primary">
                  {data.score.finalPercentage}%
                </span>
                <span className="mt-1 block text-body-sm text-text-tertiary">of the project</span>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-hairline pt-3">
                <span className="text-body-sm text-text-tertiary">Updated 3 min ago</span>
                <span className="text-body-sm text-text-secondary font-medium">
                  Team avg: {data.teamAverage}%
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div className="flex-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card padding="lg" className="flex h-full flex-col justify-between">
            <span className="mb-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              Your score vs team
            </span>

            <div className="space-y-3">
              {data.members.map((member, index) => {
                const isCurrent = currentMember?.user.id === member.userId;
                const percentage = isCurrent ? data.score.finalPercentage : otherShare;
                const barWidth = `${(Math.max((percentage / maxScore) * 100, 0))}%`;
                const color = getMemberColor(index);

                return (
                  <div key={member.userId} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-body-sm text-text-secondary">
                      {member.user.name}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: barWidth,
                          backgroundColor: color,
                          opacity: isCurrent ? 1 : 0.65,
                        }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-body-sm font-semibold text-text-primary">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card padding="md" className="mt-5">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Rationale
          </span>
          <ul className="space-y-2">
            {[data.score.rationale.content_share, data.score.rationale.temporal_note, data.score.rationale.session_note].map(
              (point, index) => (
                <li key={index} className="flex gap-2.5 text-body-md text-text-secondary">
                  <span className="mt-1 shrink-0 text-accent-lime">●</span>
                  <span>{point}</span>
                </li>
              )
            )}
          </ul>
        </Card>
      </motion.div>

      <div className="mt-5 flex gap-5">
        <motion.div className="flex-[3]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card padding="md" className="h-full">
            <span className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              Category breakdown
            </span>

            <div className="space-y-3">
              {data.categoryBreakdown.map((category) => (
                <div key={category.category} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-body-sm text-text-secondary">
                    {categoryLabelMap[category.category] ?? category.category}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-accent-lime" style={{ width: `${category.percentage}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-body-sm font-semibold text-text-primary">
                    {category.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div className="flex-[2]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card padding="md" className="flex h-full flex-col gap-5">
            <div>
              <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                Timeline
              </span>
              <div className="flex h-16 items-end gap-2">
                {phases.map((phase) => (
                  <div key={phase.label} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-surface-forest"
                      style={{ height: `${(phase.value / maxPhaseValue) * 64}px` }}
                    />
                    <span className="text-[10px] text-text-tertiary">{phase.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-body-sm text-text-tertiary">{timelineSummary}</p>
            </div>

            <div className="border-t border-hairline" />

            <div>
              <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                Activity
              </span>
              <div className="space-y-3">
                <StatRow icon={Clock} value={String(data.sessionCount)} label="Active sessions" />
                <StatRow icon={Users} value={String(data.members.length)} label="Team members" />
                <StatRow icon={Link2} value="2" label="Sources connected" />
              </div>
            </div>

            {showLateWarning && (
              <p className="text-xs text-accent-warning">
                High late-phase activity carries reduced weight in the anti-gaming engine.
              </p>
            )}
          </Card>
        </motion.div>
      </div>

      {showConsentModal && <ConsentModal onClose={handleConsentClose} />}
    </PageContainer>
  );
}
