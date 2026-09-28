import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { api } from '@/services/api';
import { useProject } from '@/hooks/useProject';
import { useToast } from '@/hooks/useToast';
import { ButtonPrimaryHero, ButtonGlassUtility, ButtonNavCta } from '@/components/ui';
import { Skeleton } from '@/components/Skeleton';
import type { ProjectExtended } from '@/types';
import { cn } from '@/lib/utils';

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="border-b border-border-hairline/20 py-8 last:border-0">
      <h2 className="mb-4 text-base font-semibold text-text-secondary">{title}</h2>
      {children}
    </section>
  );
}

function InputField({ label, id, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-text-primary">{label}</label>
      <input id={id} {...props}
        className="w-full rounded-control border border-border-hairline px-4 py-2.5 text-sm text-text-primary focus:border-accent-lime focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime" />
    </div>
  );
}

export default function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, members, memberConsents, isLoading: isProjectLoading } = useProject();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: project?.name ?? '',
    subject: (project as ProjectExtended | null)?.subject ?? '',
    deadline: project?.deadline ?? '',
    description: (project as ProjectExtended | null)?.description ?? '',
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const consents = memberConsents;
  const consentLoading = isProjectLoading;
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [allowOfflineLog, setAllowOfflineLog] = useState(true);
  const [warnThreshold, setWarnThreshold] = useState(20);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [sentResend, setSentResend] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        subject: (project as ProjectExtended).subject ?? '',
        deadline: project.deadline ?? '',
        description: (project as ProjectExtended).description ?? '',
      });
    }
  }, [project]);

  // Consents are now fetched centrally in ProjectContext (fix 4.4)

  const updateForm = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await api.updateProjectSettings(projectId ?? '', form);
    setSaving(false);
    setDirty(false);
    addToast('Settings saved.', 'success');
  };

  const handleInvite = async () => {
    if (!inviteEmail.includes('@')) return;
    setInviting(true);
    await api.sendInvitation(projectId ?? '', inviteEmail, 'member');
    setInviting(false);
    setInviteEmail('');
    addToast(`Invitation sent to ${inviteEmail}.`, 'success');
  };

  const handleResend = (memberId: string) => {
    setSentResend(prev => new Set(prev).add(memberId));
    setTimeout(() => setSentResend(prev => { const s = new Set(prev); s.delete(memberId); return s; }), 2000);
  };

  const handleArchive = async () => {
    await api.archiveProject(projectId ?? '');
    navigate('/projects');
    addToast('Project archived.', 'info');
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== project?.name) return;
    addToast('Project deleted.', 'info');
    navigate('/projects');
  };

  if (!project) return (
    <PageContainer width="wide">
      <Skeleton className="h-8 w-64 mb-6" />
      <Skeleton className="h-96 w-full" />
    </PageContainer>
  );
  return (
    <PageContainer width="narrow">
      <h1 className="mb-8 font-display text-3xl text-text-primary">Project settings</h1>

      {/* Section 1: General */}
      <Section title="General">
        <div className="space-y-4">
          <InputField label="Project name" id="proj-name" value={form.name} onChange={e => updateForm('name', e.target.value)} />
          <InputField label="Subject" id="proj-subject" value={form.subject} onChange={e => updateForm('subject', e.target.value)} placeholder="e.g. Biology" />
          <InputField label="Deadline" id="proj-deadline" type="date" value={form.deadline} onChange={e => updateForm('deadline', e.target.value)} />
          <div>
            <label htmlFor="proj-desc" className="mb-1 block text-sm font-medium text-text-primary">Description (optional)</label>
            <textarea id="proj-desc" value={form.description} onChange={e => updateForm('description', e.target.value)} rows={3}
              className="w-full rounded-card border border-border-hairline px-4 py-2.5 text-sm text-text-primary focus:border-accent-lime focus:outline-none"
              placeholder="What is this project about?" />
          </div>
          <ButtonPrimaryHero onClick={handleSave} disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </ButtonPrimaryHero>
        </div>
      </Section>

      {/* Section 2: Members */}
      <Section title="Team members" id="members">
        <div className="mb-4 divide-y divide-border-hairline/20 rounded-card border border-border-hairline bg-white overflow-hidden">
          {members.map((member, idx) => {
            const isYou = idx === 0;
            return (
              <div key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-lime font-display text-sm font-black text-text-primary">
                    {member.user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-primary">{member.user.name}</span>
                    {isYou && <span className="ml-2 rounded-hairline border border-border-hairline/40 px-1.5 py-0.5 text-xs text-text-tertiary">You</span>}
                  </div>
                  <span className={cn(
                    'rounded-hairline px-2 py-0.5 text-xs font-medium',
                    member.role === 'leader' ? 'bg-surface-forest text-accent-lime' : 'border border-border-hairline/40 text-text-secondary'
                  )}>
                    {member.role === 'leader' ? 'Leader' : 'Member'}
                  </span>
                </div>
                {!isYou && (
                  <div className="flex items-center gap-2">
                    <ButtonGlassUtility size="sm" onClick={() => addToast(`Role updated.`, 'success')}>
                      {member.role === 'leader' ? 'Set as Member' : 'Set as Leader'}
                    </ButtonGlassUtility>
                    <button onClick={() => addToast(`${member.user.name} removed.`, 'info')} className="text-xs text-accent-warning hover:underline">Remove</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Invite */}
        <div className="flex gap-2">
          <input
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="teammate@school.edu"
            aria-label="Invite by email"
            className="flex-1 rounded-control border border-border-hairline px-4 py-2.5 text-sm text-text-primary focus:border-accent-lime focus:outline-none"
          />
          <ButtonNavCta onClick={handleInvite} disabled={inviting || !inviteEmail.includes('@')}>
            {inviting ? 'Sending…' : 'Invite'}
          </ButtonNavCta>
        </div>
      </Section>

      {/* Section 3: Consent status */}
      <Section title="Source tracking consent">
        {consentLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <div className="mb-3 divide-y divide-border-hairline/20 rounded-card border border-border-hairline bg-white overflow-hidden">
              {consents.map(c => (
                <div key={c.memberId} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-lime font-display text-xs font-black text-text-primary">
                      {c.memberAvatarInitials}
                    </div>
                    <span className="text-sm text-text-primary">{c.memberName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'rounded-control px-3 py-1 text-xs font-semibold',
                      c.status === 'accepted' ? 'bg-accent-positive text-white' :
                      c.status === 'declined' ? 'bg-accent-warning text-white' :
                      'border border-border-hairline text-text-secondary'
                    )}>
                      {c.status === 'accepted' ? 'Accepted' : c.status === 'declined' ? 'Declined' : 'Pending'}
                    </span>
                    {c.status === 'pending' && (
                      <ButtonGlassUtility size="sm" onClick={() => handleResend(c.memberId)}>
                        {sentResend.has(c.memberId) ? '✓ Sent' : 'Re-send'}
                      </ButtonGlassUtility>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-secondary">
              Members must consent before their activity is tracked. Pending members haven't accepted yet — you can re-send the invitation.
            </p>
          </>
        )}
      </Section>

      {/* Section 4: Tracking settings */}
      <Section title="Tracking settings">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Allow offline contribution logs</p>
              <p className="text-xs text-text-tertiary">Team members can log offline contributions</p>
            </div>
            <button
              onClick={() => setAllowOfflineLog(v => !v)}
              aria-label="Toggle offline log"
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-accent-lime',
                allowOfflineLog ? 'bg-accent-lime' : 'bg-border-hairline/40'
              )}
            >
              <span className={cn(
                'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                allowOfflineLog ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </button>
          </div>
          <div>
            <label htmlFor="warn-threshold" className="mb-1 block text-sm font-medium text-text-primary">
              Auto-warn threshold
            </label>
            <div className="flex items-center gap-3">
              <input
                id="warn-threshold"
                type="number"
                min={5} max={40} step={5}
                value={warnThreshold}
                onChange={e => setWarnThreshold(Number(e.target.value))}
                className="w-24 rounded-control border border-border-hairline px-3 py-2 text-sm text-text-primary focus:border-accent-lime focus:outline-none"
              />
              <span className="text-sm text-text-secondary">%</span>
            </div>
            <p className="mt-1 text-xs text-text-tertiary">Currently: warn if contribution &lt; {warnThreshold}%</p>
          </div>
        </div>
      </Section>

      {/* Section 5: Danger zone */}
      <Section title="">
        <div className="rounded-card border border-accent-warning/30 p-5">
          <h2 className="mb-4 text-base font-semibold text-accent-warning">Danger zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Archive project</p>
                <p className="text-xs text-text-tertiary">Hidden from main list, not deleted</p>
              </div>
              {!archiveConfirm ? (
                <ButtonGlassUtility onClick={() => setArchiveConfirm(true)} className="text-accent-warning">Archive</ButtonGlassUtility>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text-secondary">Archive &ldquo;{project.name}&rdquo;?</span>
                  <button onClick={handleArchive} className="font-medium text-accent-warning hover:underline">Archive</button>
                  <button onClick={() => setArchiveConfirm(false)} className="text-text-tertiary hover:underline">Cancel</button>
                </div>
              )}
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Delete project</p>
                <p className="text-xs text-text-tertiary mb-2">This cannot be undone</p>
                {deleteConfirm && (
                  <div>
                    <label htmlFor="delete-confirm" className="mb-1 block text-xs text-text-secondary">
                      Type &ldquo;{project.name}&rdquo; to confirm
                    </label>
                    <input
                      id="delete-confirm"
                      value={deleteConfirmName}
                      onChange={e => setDeleteConfirmName(e.target.value)}
                      className="w-full rounded-control border border-border-hairline px-3 py-2 text-sm text-text-primary focus:border-accent-lime focus:outline-none"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleDelete}
                        disabled={deleteConfirmName !== project.name}
                        className="text-sm font-medium text-accent-warning disabled:opacity-40 hover:underline"
                      >
                        Confirm delete
                      </button>
                      <button onClick={() => { setDeleteConfirm(false); setDeleteConfirmName(''); }} className="text-sm text-text-tertiary hover:underline">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              {!deleteConfirm && (
                <button onClick={() => setDeleteConfirm(true)} className="shrink-0 text-sm text-accent-warning hover:underline">Delete project</button>
              )}
            </div>
          </div>
        </div>
      </Section>
    </PageContainer>
  );
}
