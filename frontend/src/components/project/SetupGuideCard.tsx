import { useProject } from '@/hooks/useProject';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';
import type { ProjectExtended, MemberConsent } from '@/types';

interface Step {
  label: string;
  done: boolean;
  cta?: { label: string; href: string };
}

export function SetupGuideCard() {
  const { project, members, memberConsents } = useProject();
  const { isAuthenticated } = useAuth();
  const [allDone, setAllDone] = useState(false);
  const projectId = project?.id ?? '';
  const storageKey = `setupGuide_dismissed_${projectId}`;
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });
  // Read consents directly from ProjectContext — no independent fetch needed (fix 4.4)
  const consents: MemberConsent[] = memberConsents;
  const sourceCount = (project as ProjectExtended | null)?.sourceCount ?? 0;
  const memberCount = members.length;

  const allConsented = members.length > 0 && consents.length === members.length && consents.every(c => c.status === 'accepted');

  const steps: Step[] = [
    { label: 'Account created', done: isAuthenticated },
    { label: 'Project joined', done: !!project },
    {
      label: 'Connect a source',
      done: sourceCount > 0,
      cta: { label: 'Connect now →', href: `/projects/${projectId}/sources` },
    },
    {
      // Treat as done once any teammates have joined beyond the creator
      label: `Teammates joined (${Math.max(0, memberCount - 1)} of 3)`,
      done: memberCount >= 2,
      cta: { label: 'Invite →', href: `/projects/${projectId}/settings#members` },
    },
    {
      label: 'All members consented',
      done: allConsented,
      cta: { label: 'View consent status →', href: `/projects/${projectId}/sources` },
    },
    {
      label: 'Tracking active',
      done: sourceCount > 0,
    },
  ];

  const allComplete = steps.every((s) => s.done);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(storageKey, 'true');
  }, [storageKey]);

  useEffect(() => {
    if (allComplete) {
      const timer = setTimeout(() => setAllDone(true), 200);
      const dismiss = setTimeout(handleDismiss, 5500);
      return () => {
        clearTimeout(timer);
        clearTimeout(dismiss);
      };
    }
  }, [allComplete, projectId, handleDismiss]);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        'mb-6 rounded-card border border-border-hairline bg-white p-6 transition-opacity duration-500',
        dismissed && 'opacity-0'
      )}
    >
      <h2 className="mb-4 text-sm font-semibold text-text-secondary">Project setup</h2>
      {allDone ? (
        <div className="flex items-center gap-2 text-accent-positive">
          <CheckCircle size={20} />
          <span className="text-sm font-medium text-text-primary">
            You&apos;re all set. Groupr is actively tracking contributions.
          </span>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {step.done ? (
                  <CheckCircle size={18} className="shrink-0 text-accent-lime" />
                ) : (
                  <Circle size={18} className="shrink-0 text-border-hairline" />
                )}
                <span
                  className={cn(
                    'text-sm',
                    step.done ? 'text-text-secondary line-through' : 'font-medium text-text-primary'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!step.done && step.cta && (
                <Link
                  to={step.cta.href}
                  className="shrink-0 text-sm text-accent-blue hover:underline focus-visible:outline-2 focus-visible:outline-accent-lime"
                >
                  {step.cta.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
