import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { ButtonPrimaryHero } from '@/components/ui/DesignButtons';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { getInitials } from '@/components/ui/Avatar';

const GRADES = [
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'University Year 1',
  'University Year 2',
  'Teacher',
];

const STEP_TITLES = ['Profile setup', 'Create or join project', 'Invite teammates'];

interface InviteMember {
  id: string;
  email: string;
  role: 'member' | 'leader';
  isSelf?: boolean;
}

export function OnboardingPage() {
  useDocumentTitle('Set up your account');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [projectName, setProjectName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [members, setMembers] = useState<InviteMember[]>([
    {
      id: 'self',
      email: currentUser?.email ?? '',
      role: 'leader',
      isSelf: true,
    },
  ]);
  const [finishError, setFinishError] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const inviteToken = (location.state as any)?.inviteToken;


  const handleStep1Continue = () => {
    if (inviteToken) {
      navigate(`/invite/${inviteToken}`, { replace: true });
    } else {
      setStep(2);
    }
  };

  const canContinueStep2 =
    mode === 'create'
      ? projectName.trim()
      : mode === 'join'
        ? projectCode.trim()
        : false;

  const handleStep2Continue = async () => {
    if (!canContinueStep2) return;
    if (mode === 'create') {
      setStep(3);
    } else {
      setJoining(true);
      setJoinError('');
      try {
        await api.joinByCode(projectCode.trim());
        navigate('/projects');
      } catch {
        setJoinError('Invalid project code — please check and try again.');
        setJoining(false);
      }
    }
  };

  const handleAddMember = () => {
    const email = inviteEmail.trim();
    if (!email.includes('@')) return;
    if (members.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
      setInviteEmail('');
      return;
    }
    setMembers((prev) => [
      ...prev,
      { id: `invite-${Date.now()}`, email, role: 'member' },
    ]);
    setInviteEmail('');
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleRoleChange = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        role: m.id === id ? 'leader' : 'member',
      }))
    );
  };

  const handleFinish = async () => {
    setFinishError('');
    try {
      const created = await api.createProject({ name: projectName, deadline });

      // Send invitations to all non-self members added in step 3
      const guests = members.filter((m) => !m.isSelf);
      if (guests.length > 0) {
        await Promise.allSettled(
          guests.map((m) =>
            api.sendInvitation(created.id, m.email, m.role)
          )
        );
      }

      navigate('/projects');
    } catch {
      setFinishError('Could not create project. Please try again.');
    }
  };

  const headline =
    step === 1
      ? 'Set up your profile'
      : step === 2
        ? 'Create or join a project'
        : 'Invite your teammates';

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-12 font-body">
      <div className="w-full max-w-lg">
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                i === step
                  ? 'bg-accent-lime'
                  : 'border border-black/20 bg-white'
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-[13px] text-text-tertiary">
          Step {step} of 3 — {STEP_TITLES[step - 1]}
        </p>

        <h1 className="mt-8 text-center font-display text-3xl text-text-primary">
          {headline}
        </h1>

        {step === 1 && (
          <div className="mt-8 space-y-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent-lime font-display text-2xl text-surface-forest">
                {getInitials(currentUser?.name ?? '')}
              </div>
              <div className="w-full space-y-4">
                <div>
                  <label
                    htmlFor="school"
                    className="block text-sm font-medium text-text-primary"
                  >
                    School name
                  </label>
                  <input
                    id="school"
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. SMA Negeri 1 Jakarta"
                    className="mt-1.5 block w-full rounded-control border border-black/10 bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="grade"
                    className="block text-sm font-medium text-text-primary"
                  >
                    Grade / year
                  </label>
                  <select
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="mt-1.5 block w-full rounded-control border border-black/10 bg-white px-4 py-2.5 text-sm text-text-primary focus:border-accent-lime focus:outline-none"
                  >
                    <option value="">Select your grade or year</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <ButtonPrimaryHero
              type="button"
              className="w-full"
              onClick={handleStep1Continue}
            >
              Continue
            </ButtonPrimaryHero>

            <div className="text-center">
              <button
                type="button"
                onClick={handleStep1Continue}
                className="text-sm text-text-tertiary underline-offset-2 hover:text-text-secondary hover:underline"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-5">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={cn(
                'flex w-full items-start gap-4 rounded-card p-4 text-left shadow-hairline transition-colors hover:bg-surface-muted',
                mode === 'create' && 'border-l-[3px] border-accent-lime'
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-lime/20 text-surface-forest">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">
                  Create a new project
                </p>
                <p className="mt-0.5 text-sm text-text-secondary">
                  You'll invite teammates after.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('join')}
              className={cn(
                'flex w-full items-start gap-4 rounded-card p-4 text-left shadow-hairline transition-colors hover:bg-surface-muted',
                mode === 'join' && 'border-l-[3px] border-accent-lime'
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">
                  Join an existing project
                </p>
                <p className="mt-0.5 text-sm text-text-secondary">
                  Enter a project code from your team leader.
                </p>
              </div>
            </button>

            {mode === 'create' && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium text-text-primary"
                  >
                    Project name
                  </label>
                  <input
                    id="projectName"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Biology Research Project"
                    className="mt-1.5 block w-full rounded-control border border-black/10 bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium text-text-primary"
                  >
                    Deadline
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1.5 block w-full rounded-control border border-black/10 bg-white px-4 py-2.5 text-sm text-text-primary focus:border-accent-lime focus:outline-none"
                  />
                </div>
              </div>
            )}

            {mode === 'join' && (
              <div>
                <label
                  htmlFor="projectCode"
                  className="block text-sm font-medium text-text-primary"
                >
                  Project code
                </label>
                <input
                  id="projectCode"
                  type="text"
                  value={projectCode}
                  onChange={(e) => {
                    setProjectCode(e.target.value);
                    setJoinError('');
                  }}
                  placeholder="e.g. BIO-2026"
                  className="mt-1.5 block w-full rounded-control border border-black/10 bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none"
                />
                {joinError && (
                  <p className="mt-2 text-sm font-medium text-accent-warning">{joinError}</p>
                )}
              </div>
            )}

            <ButtonPrimaryHero
              type="button"
              className="w-full"
              disabled={!canContinueStep2 || joining}
              onClick={handleStep2Continue}
            >
              {joining ? 'Joining…' : 'Continue'}
            </ButtonPrimaryHero>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
            >
              ← Back
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 space-y-5">
            <p className="text-center text-base text-text-secondary">
              They'll get a link to join your project.
            </p>

            {members.length < 4 && (
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                  placeholder=" teammate@school.edu"
                  className="flex-1 rounded-control border border-black/10 bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none"
                />
                <ButtonPrimaryHero
                  type="button"
                  className="px-5"
                  onClick={handleAddMember}
                >
                  Add
                </ButtonPrimaryHero>
              </div>
            )}

            {members.length >= 4 && (
              <p className="text-center text-[13px] text-text-tertiary">
                Maximum 4 members per project.
              </p>
            )}

            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-white px-4 py-3 shadow-hairline"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm text-text-primary">
                      {member.email}
                    </span>
                    {member.isSelf && (
                      <span className="rounded-control bg-accent-lime/20 px-2 py-0.5 text-xs font-medium text-surface-forest">
                        You
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex rounded-control bg-black/[0.03] p-0.5">
                      <button
                        type="button"
                        onClick={() => handleRoleChange(member.id)}
                        className={cn(
                          'rounded-control px-2.5 py-1 text-xs font-medium transition-colors',
                          member.role === 'member'
                            ? 'bg-white text-text-secondary shadow-hairline'
                            : 'text-text-secondary hover:text-text-primary'
                        )}
                      >
                        Member
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleChange(member.id)}
                        className={cn(
                          'rounded-control px-2.5 py-1 text-xs font-medium transition-colors',
                          member.role === 'leader'
                            ? 'bg-accent-lime text-surface-forest'
                            : 'text-text-secondary hover:text-text-primary'
                        )}
                      >
                        Leader
                      </button>
                    </div>

                    {!member.isSelf && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-text-tertiary hover:text-accent-warning"
                        aria-label="Remove teammate"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {finishError && (
              <div className="rounded-card border border-accent-warning bg-accent-warning/10 px-4 py-3 text-sm text-accent-warning">
                {finishError}
              </div>
            )}

            <ButtonPrimaryHero
              type="button"
              className="w-full"
              onClick={handleFinish}
            >
              Finish setup
            </ButtonPrimaryHero>

            <div className="text-center">
              <Link
                to="/projects"
                className="text-sm text-text-tertiary underline-offset-2 hover:text-text-secondary hover:underline"
              >
                I'll invite them later
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
