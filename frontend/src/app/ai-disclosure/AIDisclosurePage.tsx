import { useEffect, useState } from 'react';
import { Bot, AlertTriangle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  CardFeatureMedia,
  CardForestPanel,
  ButtonPrimaryHero,
} from '@/components/ui';
import { api } from '@/services/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/Skeleton';
import type { ContributionEvent } from '@/types';

const categoryLabels = {
  research: 'Research',
  core_writing: 'Core writing',
  editing: 'Editing',
  design: 'Design',
  coding: 'Coding',
  coordination: 'Coordination',
};

export function AIDisclosurePage() {
  const [events, setEvents] = useState<ContributionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  useDocumentTitle('AI Disclosure');

  useEffect(() => {
    api.getTeacherReport().then((data) => {
      setEvents(data.events.filter((e) => e.possiblyAiGenerated));
      setLoading(false);
    });
  }, []);

  const copyDraft = () => {
    const text = `${events.length} contribution${events.length === 1 ? '' : 's'} from this project matched heuristic patterns that sometimes correlate with AI-assisted writing.`;
    navigator.clipboard.writeText(text).then(() => {
      addToast('Disclosure draft copied to clipboard.', 'success');
    });
  };

  return (
    <PageContainer width="wide">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
            AI disclosure
          </p>
          <h1
            className="mt-1 font-display text-3xl text-text-primary md:text-4xl"
            style={{ lineHeight: 0.9 }}
          >
            Draft AI disclosure
          </h1>
          <p className="mt-3 text-text-secondary body-dense">
            A heuristic recap of contributions that may have been AI-assisted. This is a
            draft for transparency, not an accusation.
          </p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-card bg-accent-warning/10 p-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-accent-warning"
          />
          <p className="text-sm text-text-secondary">
            AI detection is unreliable. The flags below are based on simple heuristics
            (single large additions, no prior iteration, highly structured language).
            Treat them as conversation starters, not evidence.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <CardFeatureMedia key={i} className="p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="mt-1 h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </CardFeatureMedia>
                ))}
              </div>
            ) : events.length === 0 ? (
              <CardFeatureMedia>
                <p className="text-text-secondary">
                  No contributions were flagged by the heuristic. This does not prove
                  zero AI use — only that no event matched the simple patterns we check.
                </p>
              </CardFeatureMedia>
            ) : (
              events.map((event) => (
                <CardFeatureMedia key={event.id}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-primary">
                      <Bot size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">
                        {event.externalUserRef}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {new Date(event.timestamp).toLocaleString()} ·{' '}
                        {event.fileOrSection}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary">{event.rawDiff}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-control bg-surface-muted px-3 py-1 text-xs font-semibold text-text-primary">
                      {event.category ? categoryLabels[event.category] : 'Uncategorized'}
                    </span>
                    <span className="rounded-control bg-accent-warning/10 px-3 py-1 text-xs font-semibold text-accent-warning">
                      Flagged as possibly AI-generated
                    </span>
                  </div>
                </CardFeatureMedia>
              ))
            )}
          </div>

          <div className="space-y-4">
            <CardForestPanel className="rounded-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-lime text-surface-forest">
                <FileText size={24} />
              </div>
              <h3
                className="font-display text-xl text-accent-lime"
                style={{ lineHeight: 0.95 }}
              >
                Disclosure summary
              </h3>
              <p className="mt-3 text-sm text-accent-lime/90">
                {events.length} contribution{events.length === 1 ? '' : 's'} from this
                project matched heuristic patterns that sometimes correlate with
                AI-assisted writing. The team should review these events and decide
                what to disclose on the Devpost submission.
              </p>
              <ButtonPrimaryHero onClick={copyDraft} className="mt-6 w-full bg-accent-lime text-surface-forest hover:bg-[#80E142]">
                Copy draft
              </ButtonPrimaryHero>
            </CardForestPanel>
          </div>
        </div>
    </PageContainer>
  );
}
