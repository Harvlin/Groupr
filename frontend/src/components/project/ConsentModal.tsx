import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ButtonPrimaryHero, ButtonGlassUtility } from '@/components/ui';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useToast } from '@/hooks/useToast';
import { api } from '@/services/api';

interface ConsentModalProps {
  onClose: (accepted: boolean) => void;
}

export function ConsentModal({ onClose }: ConsentModalProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { addToast } = useToast();
  const trapRef = useFocusTrap(true);

  // Prevent scroll on body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAccept = async () => {
    await api.submitConsent(projectId ?? '', true);
    addToast('Tracking is now active for you in this project.', 'success');
    onClose(true);
  };

  const handleDecline = async () => {
    await api.submitConsent(projectId ?? '', false);
    onClose(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(14,15,12,0.5)' }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        className="w-full max-w-md rounded-card border border-border-hairline bg-white p-10"
      >
        <h2 id="consent-title" className="font-display text-3xl text-text-primary">
          Before we start tracking
        </h2>

        <p className="mt-4 text-base text-text-secondary">
          This project uses Truth Layer to automatically track contributions from connected
          sources (e.g. Google Docs, GitHub). This helps your team get fair credit for the
          work each person does.
        </p>

        <p className="mt-3 text-sm text-text-secondary">
          Truth Layer only reads activity data from the specific sources your team connected —
          not your broader Google Drive, GitHub account, or any other files.
        </p>

        {/* What we track */}
        <div className="mt-4 rounded-hairline border border-border-hairline/30 bg-surface-muted p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">What we track</p>
          <ul className="space-y-1 text-sm text-text-secondary">
            {[
              'Edit activity in connected Google Docs/Slides/Sheets',
              'Commit history in connected GitHub repositories',
              'Timestamps and session patterns (not content details)',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-accent-positive">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What we don't track */}
        <div className="mt-3 rounded-hairline border border-border-hairline/30 bg-surface-muted p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">What we DON&apos;T track</p>
          <ul className="space-y-1 text-sm text-text-secondary">
            {[
              "Any documents you didn't explicitly add to this project",
              'Your messages, emails, or other personal data',
              'Anything outside connected sources',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-accent-warning">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-sm text-accent-blue hover:underline focus-visible:outline-2 focus-visible:outline-accent-lime"
        >
          Read our full privacy policy →
        </a>

        <div className="mt-6 space-y-3">
          <ButtonPrimaryHero onClick={handleAccept} className="w-full">
            I understand and consent
          </ButtonPrimaryHero>
          <ButtonGlassUtility onClick={handleDecline} className="w-full">
            Decline tracking
          </ButtonGlassUtility>
        </div>
      </div>
    </div>
  );
}
