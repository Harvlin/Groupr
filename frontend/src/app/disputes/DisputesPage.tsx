import { useEffect, useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProject } from '@/hooks/useProject';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  CardFeatureMedia,
  ButtonPrimaryHero,
} from '@/components/ui';
import { PageContainer } from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { getInitials } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/Skeleton';
import type { Dispute } from '@/types';


export function DisputesPage() {
  const [localDisputes, setLocalDisputes] = useState<Dispute[] | null>(null);
  const [reason, setReason] = useState('');
  const { addToast } = useToast();
  const { project, disputes: contextDisputes, isLoading, refetch } = useProject();
  useDocumentTitle('Disputes');

  const isFinalized = project?.status === 'completed';

  // Seed local state from context once loaded; local state handles optimistic adds
  useEffect(() => {
    if (!isLoading && localDisputes === null) {
      setLocalDisputes(contextDisputes);
    }
  }, [isLoading, contextDisputes, localDisputes]);

  const disputes = localDisputes ?? contextDisputes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFinalized || !reason.trim()) return;
    const newDispute = await api.submitDispute(reason.trim());
    setLocalDisputes((prev) => [newDispute, ...(prev ?? [])]);
    setReason('');
    refetch(); // sync dispute state back to context
    addToast('Dispute submitted successfully. Your teacher will review it.', 'success');
  };

  return (
    <PageContainer width="wide">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
            Disputes
          </p>
          <h1
            className="mt-1 font-display text-3xl text-text-primary md:text-4xl"
            style={{ lineHeight: 0.9 }}
          >
            File a dispute
          </h1>
          <p className="mt-3 text-text-secondary body-dense">
            If your score doesn't match your contribution, explain why. Your teacher
            will see your reason alongside the raw data that produced the score.
          </p>
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
                Disputes are closed for this project.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <CardFeatureMedia>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              Submit a new dispute
            </span>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  Why do you believe your score is inaccurate?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={5}
                  disabled={isFinalized}
                  className="w-full resize-none rounded-card border border-black/10 bg-white px-4 py-3 text-text-primary outline-none focus:border-accent-lime disabled:bg-surface-muted disabled:text-text-tertiary"
                  placeholder="e.g. I conducted user interviews offline and shared notes in our private Slack channel."
                />
              </div>
              <ButtonPrimaryHero type="submit" className="w-full" disabled={isFinalized}>
                <Send size={16} />
                Submit dispute
              </ButtonPrimaryHero>
            </form>
          </CardFeatureMedia>

          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              Your disputes
            </span>
            {isLoading ? (
              <div className="mt-4 space-y-4">
                {[1, 2].map((i) => (
                  <CardFeatureMedia key={i} className="p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mt-3 h-3 w-24" />
                  </CardFeatureMedia>
                ))}
              </div>
            ) : disputes.length === 0 ? (
              <p className="mt-4 text-text-secondary">No disputes filed yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {disputes.map((dispute) => (
                  <CardFeatureMedia key={dispute.id} className="p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-text-primary">
                        {getInitials(dispute.user.name)}
                      </div>
                      <p className="font-semibold text-text-primary">
                        {dispute.user.name}
                      </p>
                      <span
                        className={`rounded-control px-2 py-0.5 text-[10px] font-bold uppercase ${
                          dispute.status === 'open'
                            ? 'bg-accent-warning/10 text-accent-warning'
                            : 'bg-accent-positive/10 text-accent-positive'
                        }`}
                      >
                        {dispute.status}
                      </span>
                    </div>
                    <p className="text-text-secondary body-dense">{dispute.reason}</p>
                    <p className="mt-3 text-xs text-text-tertiary">
                      Filed {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </CardFeatureMedia>
                ))}
              </div>
            )}
          </div>
        </div>
    </PageContainer>
  );
}
