import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Download, AlertCircle } from 'lucide-react';
import { useProject } from '@/hooks/useProject';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { TeacherReportSkeleton } from '@/components/Skeleton';
import {
  ButtonPrimaryHero,
  ButtonGlassUtility,
  StatusBadge,
  CardForestPanel,
} from '@/components/ui';
import { PageContainer } from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { getInitials } from '@/components/ui/Avatar';
import { Link } from 'react-router-dom';
import type {
  ContributionScore,
  ProjectMember,
  TeacherReportData,
} from '@/types';

function MemberRow({
  score,
  member,
  isExpanded,
  onToggle,
}: {
  score: ContributionScore;
  member?: ProjectMember;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasOverride = score.manualOverridePercentage !== undefined;

  return (
    <div className="border-b border-black/5 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-black/[0.02]"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted font-semibold text-text-primary">
            {member ? getInitials(member.user.name) : '?'}
          </div>
          <div>
            <p className="font-semibold text-text-primary">
              {member?.user.name ?? 'Unknown member'}
            </p>
            <p className="text-xs text-text-tertiary">
              {member?.user.email ?? score.userId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-2xl font-bold text-text-primary">
              {hasOverride ? score.manualOverridePercentage : score.finalPercentage}%
            </p>
            {hasOverride && (
              <p className="text-xs text-text-tertiary line-through">
                System: {score.finalPercentage}%
              </p>
            )}
          </div>
          <StatusBadge level={score.confidenceLevel} />
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={20} className="text-text-tertiary" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.8, 0.05, 0.2, 0.95] }}
            className="overflow-hidden"
          >
            <CardForestPanel className="mx-6 mb-6 rounded-card p-6">
              <h4 className="font-display text-lg text-accent-lime" style={{ lineHeight: 0.95 }}>
                Rationale for {member?.user.name ?? 'this member'}
              </h4>
              <ul className="mt-4 space-y-3">
                <li className="text-sm text-accent-lime/90">
                  {score.rationale.content_share}
                </li>
                <li className="text-sm text-accent-lime/90">
                  {score.rationale.temporal_note}
                </li>
                <li className="text-sm text-accent-lime/90">
                  {score.rationale.session_note}
                </li>
                {score.rationale.flags.map((flag, i) => (
                  <li key={i} className="text-sm text-accent-lime/90">
                    ⚠ {flag}
                  </li>
                ))}
                <li className="text-sm font-semibold text-accent-lime">
                  {score.rationale.confidence_reason}
                </li>
              </ul>
              {hasOverride && (
                <div className="mt-5 rounded-control bg-accent-lime/10 p-4">
                  <p className="text-sm font-semibold text-accent-lime">
                    Manual override applied
                  </p>
                  <p className="text-sm text-accent-lime/90">
                    {score.overrideReason}
                  </p>
                </div>
              )}
            </CardForestPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TeacherReportPage() {
  const [data, setData] = useState<TeacherReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [overrideUserId, setOverrideUserId] = useState<string | null>(null);
  const [overrideValue, setOverrideValue] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const { addToast } = useToast();
  const { project } = useProject();
  useDocumentTitle('Teacher Report');

  const isFinalized = project?.status === 'completed';

  const handleExport = async () => {
    if (!project?.id) return;
    try {
      const blob = await api.downloadTeacherReportPdf(project.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-report.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      addToast('PDF report downloaded.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to export report.', 'error');
    }
  };

  useEffect(() => {
    api.getTeacherReport().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  const handleOverrideSubmit = async (scoreId: string) => {
    const percentage = parseFloat(overrideValue);
    if (!percentage || !overrideReason) return;
    await api.overrideScore(scoreId, percentage, overrideReason);
    setOverrideUserId(null);
    setOverrideValue('');
    setOverrideReason('');
    const refreshed = await api.getTeacherReport();
    setData(refreshed);
    addToast('Score override applied. The report has been updated.', 'success');
  };

  if (loading || !data) {
    return <TeacherReportSkeleton />;
  }

  const hasLowConfidence = data.scores.some((s) => s.confidenceLevel === 'low');

  return (
    <PageContainer width="wide">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
              Teacher report
            </p>
            <h1
              className="mt-1 font-display text-3xl text-text-primary md:text-4xl"
              style={{ lineHeight: 0.9 }}
            >
              {data.project.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to={`/projects/${project?.id}/ai-disclosure`} className="text-sm font-semibold text-accent-blue hover:underline">
              View AI Disclosure →
            </Link>
            <ButtonPrimaryHero onClick={handleExport}>
              <Download size={16} />
              Export report
            </ButtonPrimaryHero>
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
                Scores are locked. Manual overrides and dispute reviews are disabled.
              </p>
            </div>
          </motion.div>
        )}

        {hasLowConfidence && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-card bg-accent-warning/10 p-4"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-accent-warning" />
            <div>
              <p className="font-semibold text-text-primary">Low confidence data</p>
              <p className="text-sm text-text-secondary">
                At least one score is based on incomplete data. Consider manual
                confirmation before grading.
              </p>
            </div>
          </motion.div>
        )}

        <div className="overflow-hidden rounded-card bg-white border border-hairline">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
            <h2 className="font-display text-lg text-text-primary" style={{ lineHeight: 0.95 }}>
              Member scores
            </h2>
            <span className="text-xs text-text-tertiary">
              {data.scores.length} members
            </span>
          </div>

          {data.scores.map((score) => {
            const member = data.members.find((m) => m.userId === score.userId);
            return (
              <MemberRow
                key={score.id}
                score={score}
                member={member}
                isExpanded={expandedId === score.id}
                onToggle={() =>
                  setExpandedId(expandedId === score.id ? null : score.id)
                }
              />
            );
          })}
        </div>

        {overrideUserId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-card bg-white border border-hairline p-6"
          >
            <h3 className="font-display text-lg text-text-primary" style={{ lineHeight: 0.95 }}>
              Manual override
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  New percentage
                </label>
                <input
                  type="number"
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  className="w-full rounded-control border border-black/10 bg-white px-4 py-2 text-text-primary outline-none focus:border-accent-lime"
                  placeholder="e.g. 25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  Reason (required)
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full rounded-control border border-black/10 bg-white px-4 py-2 text-text-primary outline-none focus:border-accent-lime"
                  placeholder="Why are you overriding?"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <ButtonGlassUtility onClick={() => setOverrideUserId(null)}>
                Cancel
              </ButtonGlassUtility>
              <ButtonPrimaryHero
                onClick={() => {
                  const score = data.scores.find((s) => s.userId === overrideUserId);
                  if (score) handleOverrideSubmit(score.id);
                }}
                disabled={isFinalized}
              >
                Apply override
              </ButtonPrimaryHero>
            </div>
          </motion.div>
        )}

        <div className="mt-10">
          <h2 className="font-display text-2xl text-text-primary" style={{ lineHeight: 0.95 }}>
            Open disputes
          </h2>
          {data.disputes.length === 0 ? (
            <p className="mt-3 text-text-secondary">No open disputes.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {data.disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="rounded-card bg-white border border-hairline p-5"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-text-primary">
                      {getInitials(dispute.user.name)}
                    </div>
                    <p className="font-semibold text-text-primary">
                      {dispute.user.name}
                    </p>
                    <span className="rounded-control bg-accent-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-warning">
                      {dispute.status}
                    </span>
                  </div>
                  <p className="text-text-secondary body-dense">{dispute.reason}</p>
                  <div className="mt-4 flex justify-end">
                    <ButtonGlassUtility
                      onClick={() => {
                        const score = data.scores.find((s) => s.userId === dispute.userId);
                        if (score) {
                          setOverrideUserId(dispute.userId);
                          setOverrideValue(score.finalPercentage.toString());
                        }
                      }}
                      disabled={isFinalized}
                    >
                      {isFinalized ? 'Locked' : 'Review & override'}
                    </ButtonGlassUtility>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </PageContainer>
  );
}
