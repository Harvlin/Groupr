import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { ButtonPrimaryHero, ButtonGlassUtility } from '@/components/ui';
import { Skeleton } from '@/components/Skeleton';
import type { Invitation } from '@/types';

function AvatarCircle({ initials, size = 48 }: { initials: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-accent-lime font-display font-black text-text-primary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

function ErrorState({ reason }: { reason: string }) {
  let title = 'This invitation has expired';
  let desc = 'Ask your team leader to send a new invitation.';
  
  if (reason === 'already_member') {
    title = 'You are already a member';
    desc = 'You have already joined this project.';
  } else if (reason === 'token_used') {
    title = 'Invitation already used';
    desc = 'This invitation link has already been claimed by someone else.';
  } else if (reason === 'project_full') {
    title = 'Project is full';
    desc = 'This project has reached the maximum number of members.';
  }

  return (
    <div className="flex flex-col items-center text-center">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-text-tertiary">
        <path d="M16 32h8M40 32h8M24 24l-4-4-4 4M44 24l4-4 4 4M24 40l-4 4-4-4M44 40l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <rect x="20" y="28" width="24" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
      </svg>
      <h1 className="mt-4 text-xl font-semibold text-text-primary">{title}</h1>
      <p className="mt-2 text-base text-text-secondary">{desc}</p>
      <Link to="/projects" className="mt-6 inline-flex h-10 items-center rounded-control bg-accent-lime px-6 font-semibold text-text-primary hover:bg-[#80E142]">
        Go to your projects
      </Link>
    </div>
  );
}

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    if (!token) { setErrorReason('expired'); setLoading(false); return; }
    api.getInvitationByToken(token)
      .then(setInvitation)
      .catch((err) => setErrorReason(err?.reason || 'expired'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!token || !invitation) return;
    setAccepting(true);
    try {
      await api.acceptInvitation(token);
      navigate(`/projects/${invitation.projectId}/dashboard`, { state: { needsConsent: true } });
    } catch (err: any) {
      setErrorReason(err?.reason || 'expired');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    setDeclining(true);
    await api.declineInvitation(token);
    navigate('/projects');
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-card border border-border-hairline bg-white p-10">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : errorReason || !invitation ? (
            <ErrorState reason={errorReason || 'expired'} />
          ) : (
            <>
              {/* Wordmark */}
              <Link to="/" className="mb-6 block font-display text-xl text-text-primary">
                Truth Layer
              </Link>

              {/* Inviter */}
              <div className="mb-4 flex flex-col items-center text-center">
                <AvatarCircle initials={invitation.invitedByAvatarInitials} size={56} />
                <p className="mt-3 text-lg font-semibold text-text-primary">
                  {invitation.invitedByName} invited you to join
                </p>
                <p className="mt-1 font-display text-3xl text-text-primary">{invitation.projectName}</p>

                {/* Role chip */}
                <span className={`mt-3 inline-flex items-center rounded-control px-3 py-1 text-xs font-semibold ${invitation.role === 'leader' ? 'bg-accent-positive text-white' : 'border border-border-hairline text-text-secondary'}`}>
                  Role: {invitation.role === 'leader' ? 'Leader' : 'Member'}
                </span>
              </div>

              {isAuthenticated && currentUser ? (
                <>
                  {/* Logged in user chip */}
                  <div className="mb-3 flex items-center gap-2 rounded-hairline bg-surface-muted px-3 py-2">
                    <AvatarCircle initials={currentUser.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()} size={28} />
                    <span className="text-sm text-text-secondary">Joining as <strong>{currentUser.name}</strong></span>
                  </div>

                  {/* Expiry */}
                  <p className="mb-6 text-xs text-text-tertiary">
                    This invitation expires {new Date(invitation.expiresAt).toLocaleDateString()}.
                  </p>

                  <div className="space-y-3">
                    <ButtonPrimaryHero onClick={handleAccept} disabled={accepting} className="w-full">
                      {accepting ? 'Joining…' : 'Accept and join'}
                    </ButtonPrimaryHero>
                    <ButtonGlassUtility onClick={handleDecline} disabled={declining} className="w-full">
                      {declining ? 'Declining…' : 'Decline'}
                    </ButtonGlassUtility>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-6 text-sm text-text-secondary">
                    Sign in or create an account to join this project.
                  </p>
                  <div className="space-y-3">
                    <ButtonPrimaryHero
                      onClick={() => navigate('/login', { state: { inviteToken: token } })}
                      className="w-full"
                    >
                      Sign in to join
                    </ButtonPrimaryHero>
                    <ButtonGlassUtility
                      onClick={() => navigate('/register', { state: { inviteToken: token } })}
                      className="w-full"
                    >
                      Create an account
                    </ButtonGlassUtility>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
