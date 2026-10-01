import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CardFeatureMedia, CardForestPanel } from '@/components/ui';
import { PageContainer } from '@/components/layout/PageContainer';

const sections = [
  {
    title: '1. The service',
    body: 'Truth Layer provides evidence-based contribution tracking for collaborative projects. It collects activity from sources that a project member or authorized project administrator explicitly connects and presents contribution estimates, evidence, confidence levels, and review history.',
  },
  {
    title: '2. Eligibility and accounts',
    body: 'You must provide accurate account information and keep your credentials secure. If you use Truth Layer on behalf of a school, university, organization, or team, you confirm that you are authorized to connect the project and its approved sources. You are responsible for activity performed through your account.',
  },
  {
    title: '3. Consent and connected sources',
    body: 'You may connect only documents, repositories, or other sources that you are authorized to access. Team members must be given the consent controls described in the product. Disconnecting a source stops future ingestion, but existing records may be retained for the stated dispute, audit, and legal-retention periods.',
  },
  {
    title: '4. Scores are decision support',
    body: 'Truth Layer scores are estimates based on observable activity. They are not proof of intent, effort, authorship, academic misconduct, or the absence of unrecorded work. Teachers, institutions, and project leaders remain responsible for human review and final decisions. Do not use a score as the sole basis for grading, discipline, employment, or other high-impact decisions.',
  },
  {
    title: '5. Acceptable use',
    body: 'You may not use the service to access sources without authorization, monitor people outside an explicitly connected project, upload malicious content, interfere with provider APIs, evade consent controls, reverse engineer the service, or use the service in a way that violates applicable law or institutional policy.',
  },
  {
    title: '6. AI-assisted features',
    body: 'Some features may use an AI provider to categorize contribution events or identify review signals. AI output may be incomplete, incorrect, or biased. It is advisory, must be shown with appropriate confidence information, and must not be treated as an independent finding of misconduct or authorship.',
  },
  {
    title: '7. Third-party services',
    body: 'The service may integrate with Google, GitHub, hosting providers, storage providers, email services, and AI providers. Those services have their own terms and privacy policies. Their availability, API behavior, permissions, and rate limits may affect Truth Layer features.',
  },
  {
    title: '8. Availability and changes',
    body: 'Truth Layer may change, suspend, or discontinue features, including integrations, to maintain security, comply with provider requirements, or improve the service. We do not guarantee uninterrupted availability, complete source history, or error-free scores.',
  },
  {
    title: '9. Intellectual property and content',
    body: 'You retain rights to content you connect or submit. You grant Truth Layer the limited permission needed to process that content for source synchronization, contribution analysis, reporting, security, and support. Truth Layer and its interfaces remain the property of their respective owners.',
  },
  {
    title: '10. Disputes and review',
    body: 'The service may provide a dispute workflow, but it does not replace institutional appeal, academic-integrity, employment, or legal procedures. Project administrators must provide a fair review process appropriate to the context in which the service is used.',
  },
  {
    title: '11. Disclaimer and limitation of liability',
    body: 'To the maximum extent permitted by law, the service is provided as available and without guarantees about accuracy, completeness, fitness for a particular purpose, or uninterrupted operation. This draft does not establish liability terms for a particular jurisdiction and must be reviewed by qualified counsel before commercial or institutional use.',
  },
  {
    title: '12. Contact and governing terms',
    body: 'Questions about these terms should be sent to the service operator through the contact address published with the deployment. Before launch, the operator should replace the placeholders in this document with the legal entity name, contact address, effective date, governing law, dispute venue, and any required regional consumer terms.',
  },
];

export function TermsOfServicePage() {
  useDocumentTitle('Terms of Service');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <PageContainer width="narrow">
      <div className="mb-6">
        {isAuthenticated ? (
          <button onClick={() => navigate(-1)} className="text-sm font-semibold text-accent-blue hover:underline">
            ← Back
          </button>
        ) : (
          <Link to="/login" className="text-sm font-semibold text-accent-blue hover:underline">
            ← Back to Login
          </Link>
        )}
      </div>

      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">Legal</p>
        <h1 className="mt-1 font-display text-3xl text-text-primary md:text-4xl" style={{ lineHeight: 0.9 }}>
          Terms of service
        </h1>
        <p className="mt-3 text-text-secondary body-dense">
          Draft effective date: October 2, 2026. These terms describe the intended use of Truth Layer and require legal review before production launch.
        </p>
      </div>

      <CardForestPanel className="mb-8 rounded-card p-7">
        <h2 className="font-display text-2xl text-accent-lime" style={{ lineHeight: 0.9 }}>Important notice</h2>
        <p className="mt-4 text-accent-lime/90 body-dense">
          Truth Layer is a decision-support tool. It does not determine who deserves a grade, whether misconduct occurred, or whether work was performed outside connected sources.
        </p>
      </CardForestPanel>

      <div className="space-y-5">
        {sections.map((section) => (
          <CardFeatureMedia key={section.title} className="p-7">
            <h2 className="font-display text-xl text-text-primary" style={{ lineHeight: 0.95 }}>{section.title}</h2>
            <p className="mt-3 text-text-secondary body-dense">{section.body}</p>
          </CardFeatureMedia>
        ))}
      </div>
    </PageContainer>
  );
}
