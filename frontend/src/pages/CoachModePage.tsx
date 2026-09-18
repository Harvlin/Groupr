import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProject } from '@/hooks/useProject';
import {
  ButtonGlassUtility,
  CardFeatureMedia,
  CardForestPanel,
} from '@/components/ui';
import { Skeleton } from '@/components/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { getSuggestionCopy } from '@/utils/coachSuggestionCopy';
import type { CoachSuggestion } from '@/types';


function daysUntil(from: Date, to: Date) {
  return Math.max(
    0,
    Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  );
}

function discussedKey(id: string) {
  return `tl-coach-discussed-${id}`;
}

export function CoachModePage() {
  useDocumentTitle('Coach Mode');
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useProject();

  const [suggestions, setSuggestions] = useState<CoachSuggestion[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [discussedIds, setDiscussedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const ids = new Set<string>();
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('tl-coach-discussed-')) {
        ids.add(key.replace('tl-coach-discussed-', ''));
      }
    }
    return ids;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    api
      .getCoachSuggestions(projectId)
      .then(setSuggestions)
      .finally(() => setLoading(false));
  }, [projectId]);

  const daysRemaining = useMemo(() => {
    if (!project?.deadline) return null;
    const deadline = new Date(project.deadline);
    if (Number.isNaN(deadline.getTime())) return null;
    return daysUntil(new Date(), deadline);
  }, [project]);

  const visibleSuggestions = suggestions.filter((s) => !dismissedIds.has(s.id));
  const allDismissed = suggestions.length > 0 && visibleSuggestions.length === 0;

  const handleDiscussed = (id: string) => {
    sessionStorage.setItem(discussedKey(id), '1');
    setDiscussedIds((prev) => new Set([...prev, id]));
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  return (
    <PageContainer width="narrow">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-text-primary"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 2L12 5M12 19L12 22M2 12L5 12M19 12L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 7L14.5 12H9.5L12 7Z"
            fill="currentColor"
          />
        </svg>
        <h1
          className="font-display text-4xl text-text-primary"
          style={{ lineHeight: 0.9 }}
        >
          Coach Mode
        </h1>
      </div>

      <p className="font-body text-lg text-text-secondary">
        Suggestions to help your team finish strong.
      </p>

      {daysRemaining !== null && (
        <div className="mt-4">
          <span
            className={`inline-flex items-center rounded-control border border-border-hairline px-3 py-1 font-body text-[13px] ${
              daysRemaining <= 5 ? 'text-accent-warning' : 'text-text-secondary'
            }`}
          >
            {daysRemaining} day{daysRemaining === 1 ? '' : 's'} until deadline
          </span>
        </div>
      )}

      {/* Suggestions */}
      <div className="mt-8 space-y-5">
        {loading ? (
          <>
            <Skeleton className="h-56 rounded-card" />
            <Skeleton className="h-56 rounded-card" />
            <Skeleton className="h-56 rounded-card" />
          </>
        ) : (
          <AnimatePresence initial={false}>
            {visibleSuggestions.map((suggestion) => {
              const isDiscussed = discussedIds.has(suggestion.id);
              return (
                <motion.div
                  key={suggestion.id}
                  layout
                  initial={{ opacity: 0, height: 'auto' }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, ease: [0.8, 0.05, 0.2, 0.95] }}
                >
                  <CardFeatureMedia
                    className={`p-7 transition-colors md:p-7 ${
                      isDiscussed ? 'border-l-4 border-accent-lime' : ''
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-lime font-semibold text-text-primary">
                        {suggestion.memberName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span className="font-body text-base font-semibold text-text-primary">
                        {suggestion.memberName}
                      </span>
                      <span className="rounded-control bg-surface-muted px-2 py-0.5 text-xs font-bold text-text-primary">
                        {suggestion.currentScore}%
                      </span>
                    </div>

                    {/* Suggestion text */}
                    <p className="mt-4 font-body text-base text-text-primary">
                      {getSuggestionCopy({
                        name: suggestion.memberName,
                        score: suggestion.currentScore,
                        dominantCategory: suggestion.dominantCategory,
                        gapCategory: suggestion.gapCategory,
                        specificTask: suggestion.specificTask,
                        days: suggestion.daysRemaining,
                      })}
                    </p>

                    {/* Gap tag */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-hairline border border-black/10 px-2 py-1 font-body text-xs text-text-secondary">
                        Gap: {suggestion.gapCategory}
                      </span>
                    </div>

                    {/* Action row */}
                    <div className="mt-5 flex items-center gap-4">
                      {isDiscussed ? (
                        <span className="inline-flex h-8 items-center rounded-control bg-accent-lime/15 px-3 font-body text-xs font-semibold text-text-primary">
                          ✓ Marked as discussed
                        </span>
                      ) : (
                        <ButtonGlassUtility
                          size="sm"
                          onClick={() => handleDiscussed(suggestion.id)}
                        >
                          Mark as discussed
                        </ButtonGlassUtility>
                      )}

                      <button
                        onClick={() => handleDismiss(suggestion.id)}
                        className="font-body text-[13px] text-text-tertiary transition-colors hover:text-text-secondary"
                      >
                        Dismiss
                      </button>
                    </div>
                  </CardFeatureMedia>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && allDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-lime">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 13L9 17L19 7"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-4 max-w-md font-body text-base text-text-secondary">
              You're all caught up. Keep an eye on the Team Overview as the
              deadline approaches.
            </p>
            <Link
              to={`/projects/${projectId}/team`}
              className="mt-4 font-body text-sm font-semibold text-accent-blue hover:underline"
            >
              Back to Team Overview →
            </Link>
          </motion.div>
        )}
      </div>

      {/* Anti-gaming insight panel */}
      <CardForestPanel className="mt-10 rounded-card p-8 md:p-10">
        <h2
          className="font-display text-2xl text-accent-lime"
          style={{ lineHeight: 0.95 }}
        >
          Why these suggestions?
        </h2>
        <p className="mt-4 max-w-2xl font-body text-base text-white/80">
          Truth Layer weights contributions by when they happened, not just how
          much happened. Work clustered at the very end of a project scores
          lower than steady contribution across the full timeline. We also look
          at unique content delta — repeated or pasted material doesn't count as
          heavily as original work. These suggestions highlight team members who
          could re-balance the project before the deadline.
        </p>
      </CardForestPanel>

      {/* Manual contribution log prompt */}
      <CardFeatureMedia className="mt-6 bg-surface-muted p-7 shadow-none md:p-8">
        <p className="font-body text-sm text-text-secondary">
          Working offline? Log contributions that happened outside connected
          sources — meetings, whiteboard sessions, verbal task coordination.
        </p>
        <Link
          to={`/projects/${projectId}/offline-log`}
          className="mt-3 inline-block font-body text-sm font-semibold text-accent-blue hover:underline"
        >
          Log offline contribution →
        </Link>
      </CardFeatureMedia>
    </PageContainer>
  );
}
