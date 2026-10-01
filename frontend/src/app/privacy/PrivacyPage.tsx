import { Shield, Clock, Trash2, Users } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer } from '@/components/layout/PageContainer';
import { CardFeatureMedia, CardForestPanel } from '@/components/ui';

const privacyPoints = [
  {
    icon: Users,
    title: 'Explicit consent',
    body: 'A source is not analyzed until every registered project member has agreed. One dissenting member stops ingestion.',
  },
  {
    icon: Shield,
    title: 'Only connected sources',
    body: 'Truth Layer reads revision history only from documents and repositories your team explicitly connects. We do not scrape drives, chats, or personal files.',
  },
  {
    icon: Clock,
    title: 'Limited retention',
    body: 'Raw diffs are kept long enough to compute scores and resolve disputes — typically 30 days after project completion — then automatically purged.',
  },
  {
    icon: Trash2,
    title: 'Right to deletion',
    body: 'Project owners can disconnect a source at any time. Disconnection purges associated raw content from active storage.',
  },
];

export function PrivacyPage() {
  useDocumentTitle('Data & Privacy');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <PageContainer width="narrow">
        <div className="mb-6">
          {isAuthenticated ? (
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-semibold text-accent-blue hover:underline"
            >
              ← Back
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-accent-blue hover:underline"
            >
              ← Back to Login
            </Link>
          )}
        </div>
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
            Privacy
          </p>
          <h1
            className="mt-1 font-display text-3xl text-text-primary md:text-4xl"
            style={{ lineHeight: 0.9 }}
          >
            Data & privacy
          </h1>
          <p className="mt-3 text-text-secondary body-dense">
            Truth Layer is designed to give teams insight without surveillance. Here is
            exactly what we store, how long we keep it, and who can see it.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {privacyPoints.map((point) => {
            const Icon = point.icon;
            return (
              <CardFeatureMedia key={point.title}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-control bg-accent-lime text-surface-forest">
                  <Icon size={24} />
                </div>
                <h3
                  className="font-display text-xl text-text-primary"
                  style={{ lineHeight: 0.95 }}
                >
                  {point.title}
                </h3>
                <p className="mt-2 text-text-secondary body-dense">{point.body}</p>
              </CardFeatureMedia>
            );
          })}
        </div>

        <CardForestPanel className="mt-10 rounded-card p-8">
          <h2
            className="font-display text-2xl text-accent-lime"
            style={{ lineHeight: 0.9 }}
          >
            What we store
          </h2>
          <ul className="mt-5 space-y-3 text-accent-lime/90">
            <li>
              <strong>Metadata:</strong> Project names, member roles, source IDs, and
              consent status.
            </li>
            <li>
              <strong>Revision events:</strong> Timestamps, author identifiers, file
              paths, and raw diffs for score computation.
            </li>
            <li>
              <strong>Scores & rationale:</strong> Final percentages, confidence
              levels, and the human-readable breakdown.
            </li>
            <li>
              <strong>Disputes:</strong> Free-text reasons submitted by students and
              any teacher override notes.
            </li>
          </ul>
        </CardForestPanel>

        <div className="mt-6 space-y-5">
          <CardFeatureMedia className="p-7">
            <h2 className="font-display text-xl text-text-primary" style={{ lineHeight: 0.95 }}>
              How we use data
            </h2>
            <p className="mt-3 text-text-secondary body-dense">
              We use account, project, consent, source, event, score, dispute, and audit data to provide the service, synchronize explicitly connected sources, calculate contribution estimates, protect the service, respond to support requests, and comply with legal obligations. We do not sell student data or use connected project content for advertising.
            </p>
          </CardFeatureMedia>

          <CardFeatureMedia className="p-7">
            <h2 className="font-display text-xl text-text-primary" style={{ lineHeight: 0.95 }}>
              Third-party processors
            </h2>
            <p className="mt-3 text-text-secondary body-dense">
              Depending on the deployment, Truth Layer may process data through Google, GitHub, Railway, Vercel, PostgreSQL hosting, object storage, email providers, and optional AI providers. Each integration receives only the permissions and data needed for its enabled feature and remains subject to its own privacy terms.
            </p>
          </CardFeatureMedia>

          <CardFeatureMedia className="p-7">
            <h2 className="font-display text-xl text-text-primary" style={{ lineHeight: 0.95 }}>
              Your choices and requests
            </h2>
            <p className="mt-3 text-text-secondary body-dense">
              You may disconnect a source, revoke consent, request correction, request deletion, or ask how a score was produced through the project administrator or service contact. Some records may be retained when needed for security, dispute resolution, audit integrity, or legal obligations.
            </p>
          </CardFeatureMedia>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-text-tertiary">
          This is a product privacy-policy draft for the hackathon deployment. Replace the operator name, contact address, retention periods, regional rights, subprocessors, and effective date after legal review.
        </p>
    </PageContainer>
  );
}
