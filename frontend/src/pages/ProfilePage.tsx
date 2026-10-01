import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ButtonPrimaryHero, ButtonGlassUtility } from '@/components/ui';
import { getInitials } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import type { ContributionHistoryEntry } from '@/types';
import { cn } from '@/lib/utils';



interface EditProfileModalProps {
  name: string;
  school: string;
  grade: string;
  onSave: (data: { name: string; school: string; grade: string }) => void;
  onClose: () => void;
}

function EditProfileModal({ name, school, grade, onSave, onClose }: EditProfileModalProps) {
  const [form, setForm] = useState({ name, school, grade });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(14,15,12,0.5)' }}>
      <div role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="w-full max-w-sm rounded-card border border-border-hairline bg-white p-8">
        <h2 id="edit-profile-title" className="mb-6 text-xl font-semibold text-text-primary">Edit profile</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="edit-name">Full name</label>
            <input id="edit-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-control border border-border-hairline px-4 py-2.5 text-sm text-text-primary focus:border-accent-lime focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="edit-school">School name</label>
            <input id="edit-school" value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
              className="w-full rounded-control border border-border-hairline px-4 py-2.5 text-sm text-text-primary focus:border-accent-lime focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="edit-grade">Grade / Year</label>
            <select id="edit-grade" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
              className="w-full rounded-control border border-border-hairline px-4 py-2.5 text-sm text-text-primary focus:outline-none">
              {['Grade 10','Grade 11','Grade 12','University Year 1','University Year 2','Teacher'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <ButtonPrimaryHero onClick={() => onSave(form)} className="w-full">Save changes</ButtonPrimaryHero>
          <ButtonGlassUtility onClick={onClose} className="w-full">Cancel</ButtonGlassUtility>
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ entry }: { entry: ContributionHistoryEntry }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/projects/${entry.projectId}/dashboard`)}
      className="flex cursor-pointer flex-col gap-1 border-b border-border-hairline/20 py-4 hover:bg-surface-muted/50 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-medium text-text-primary">{entry.projectName}</span>
          <span className="rounded-hairline border border-border-hairline/40 px-2 py-0.5 text-xs text-text-secondary">{entry.subject}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className={cn('rounded-control px-2 py-0.5 text-xs font-semibold', entry.status === 'finalised' ? 'bg-surface-forest text-accent-lime' : 'bg-accent-positive/10 text-accent-positive')}>
            {entry.status === 'finalised' ? 'Finalised' : 'Active'}
          </span>
          <span className="text-xs text-text-tertiary">Due {entry.deadline}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-display text-xl font-black text-text-primary">{entry.finalScore}%</div>
          <div className="text-xs text-text-secondary">Rank {entry.rank} of {entry.teamSize}</div>
        </div>
        <span className="text-sm text-accent-blue">View →</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [history, setHistory] = useState<ContributionHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [profile, setProfile] = useState({
    name: currentUser?.name ?? '',
    school: currentUser?.school ?? '',
    grade: currentUser?.grade ?? '',
  });

  // Sync profile state when currentUser hydrates from localStorage after refresh
  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        name: prev.name || currentUser.name,
        school: prev.school || currentUser.school || '',
        grade: prev.grade || currentUser.grade || '',
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    api.getContributionHistory(currentUser.id)
      .then(setHistory)
      .finally(() => setHistoryLoading(false));
  }, [currentUser]);

  const handleSave = (data: { name: string; school: string; grade: string }) => {
    setProfile(data);
    setEditOpen(false);
    addToast('Profile updated.', 'success');
  };

  const handleDownload = async () => {
    setDownloading(true);
    await new Promise(r => setTimeout(r, 800));
    setDownloading(false);
    addToast('Summary ready — in a real app, this would download a PDF.', 'success');
  };

  const initials = getInitials(profile.name || currentUser?.name || 'U');

  return (
    <PageContainer width="medium">
      {/* Profile card */}
      <div className="mb-8 rounded-card border border-border-hairline bg-white p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent-lime font-display text-4xl font-black text-text-primary">
          {initials}
        </div>
        <h1 className="mt-4 font-display text-4xl text-text-primary">{profile.name || currentUser?.name}</h1>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {profile.school && (
            <span className="rounded-hairline border border-border-hairline/40 px-2.5 py-1 text-sm text-text-secondary">{profile.school}</span>
          )}
          {profile.grade && (
            <span className="rounded-hairline border border-border-hairline/40 px-2.5 py-1 text-sm text-text-secondary">{profile.grade}</span>
          )}
        </div>
        <div className="mt-3 flex justify-center">
          <span className={cn('rounded-control px-3 py-1 text-xs font-semibold', currentUser?.role === 'teacher' ? 'bg-surface-forest text-accent-lime' : 'bg-accent-positive/10 text-accent-positive')}>
            {currentUser?.role === 'teacher' ? 'Teacher' : 'Student'}
          </span>
        </div>
        <ButtonGlassUtility onClick={() => setEditOpen(true)} className="mt-6">Edit profile</ButtonGlassUtility>
      </div>

      {/* Contribution history (students only) */}
      {currentUser?.role !== 'teacher' && (
        <section className="mb-8">
          <h2 className="mb-4 text-base font-semibold text-text-secondary">Your project history</h2>
          {historyLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : history.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-tertiary">No completed projects yet.</p>
          ) : (
            <div className="rounded-card border border-border-hairline bg-white px-6">
              {history.map(e => <HistoryRow key={e.projectId} entry={e} />)}
            </div>
          )}
        </section>
      )}

      {/* Export */}
      {currentUser?.role !== 'teacher' && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-text-secondary">Export your contribution summary</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Download a one-page summary of your contribution record across all Groupr projects. Useful for portfolios or applications.
          </p>
          <ButtonPrimaryHero onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Preparing…' : 'Download summary'}
          </ButtonPrimaryHero>
        </section>
      )}

      {editOpen && (
        <EditProfileModal
          name={profile.name}
          school={profile.school}
          grade={profile.grade}
          onSave={handleSave}
          onClose={() => setEditOpen(false)}
        />
      )}
    </PageContainer>
  );
}
