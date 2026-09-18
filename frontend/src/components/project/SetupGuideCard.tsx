import { useProject } from '@/hooks/useProject';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { ProjectExtended } from '@/types';

interface Step {
  label: string;
  done: boolean;
  cta?: { label: string; href: string };
}

export function SetupGuideCard() {
  const { project, members } = useProject();
  const { isAuthenticated } = useAuth();
  const [allDone, setAllDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const sourceCount = (project as ProjectExtended | null)?.sourceCount ?? 0;
  const memberCount = members.length;
  const projectId = project?.id ?? '';

  const steps: Step[] = [
    { label: 'Account created', done: isAuthenticated },
    { label: 'Project joined', done: !!project },
    {
      label: 'Connect a source',
      done: sourceCount > 0,
      cta: { label: 'Connect now →', href: `/projects/${projectId}/sources` },
    },
    {
      label: `All members joined (${memberCount}/4)`,
      done: memberCount >= 4,
      cta: { label: 'Invite →', href: `/projects/${projectId}/settings#members` },
    },
    {
      label: 'All members consented',
      done: false,
      cta: { label: 'View consent status →', href: `/projects/${projectId}/sources` },
    },
    {
      label: 'Tracking active',
      done: false,
    },
  ];

  const allComplete = steps.every((s) => s.done);

  useEffect(() => {
    if (allComplete) {
      const timer = setTimeout(() => setAllDone(true), 200);
      const dismiss = setTimeout(() => setDismissed(true), 5500);
      return () => {
        clearTimeout(timer);
        clearTimeout(dismiss);
      };
    }
  }, [allComplete]);

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
            You&apos;re all set. Truth Layer is actively tracking contributions.
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
