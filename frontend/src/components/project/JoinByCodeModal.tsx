import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, KeyRound, Users, AlertTriangle } from 'lucide-react';
import { api } from '@/services/api';
import { ButtonPrimaryHero } from '@/components/ui';
import type { ProjectSummary } from '@/types';

interface JoinByCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinByCodeModal({ isOpen, onClose }: JoinByCodeModalProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<ProjectSummary | null>(null);
  const [error, setError] = useState('');
  const [isLooking, setIsLooking] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setPreview(null);
      setError('');
      setIsJoining(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Debounced lookup
  const lookup = useCallback(async (value: string) => {
    if (value.length < 3) {
      setPreview(null);
      setError('');
      return;
    }
    setIsLooking(true);
    setError('');
    try {
      const result = await api.getProjectByCode(value);
      setPreview(result);
    } catch {
      setPreview(null);
      setError('No project found with this code. Double-check with your teammate.');
    } finally {
      setIsLooking(false);
    }
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setCode(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => lookup(val), 500);
  };

  const handleJoin = async () => {
    if (!preview) return;
    setIsJoining(true);
    try {
      const project = await api.joinByCode(code);
      onClose();
      navigate(`/projects/${project.id}/dashboard`);
    } catch {
      setError('Failed to join. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-code-title"
            className="w-full max-w-sm rounded-card border border-black/[0.06] bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-primary">
                <KeyRound size={20} />
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-control text-text-tertiary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              id="join-code-title"
              className="text-display-sm text-text-primary"
            >
              Join a project
            </h2>
            <p className="mt-2 text-body-sm text-text-secondary">
              Enter the project code shared by your teacher or teammate.
            </p>

            {/* Code input */}
            <div className="mt-6">
              <label
                htmlFor="project-code"
                className="mb-2 block text-body-sm font-semibold text-text-primary"
              >
                Project code
              </label>
              <input
                id="project-code"
                ref={inputRef}
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="e.g. TL-4829"
                maxLength={12}
                className="w-full rounded-control border border-black/10 bg-white px-4 py-3 text-body-md tracking-widest text-text-primary placeholder:tracking-normal placeholder:text-text-tertiary focus:border-accent-lime focus:outline-none focus:ring-2 focus:ring-accent-lime/20"
                autoComplete="off"
              />
              {isLooking && (
                <p className="mt-2 text-label-sm text-text-tertiary">Looking up code…</p>
              )}
              {error && (
                <div className="mt-2 flex items-start gap-2 text-body-sm text-accent-warning">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Preview card */}
            {preview && (
              <div className="mt-4 rounded-card border border-accent-lime/30 bg-surface-muted p-4">
                <p className="text-body-md font-semibold text-text-primary">{preview.name}</p>
                {(preview as any).subject && (
                  <span className="mt-1 inline-block rounded-hairline border border-black/10 px-2 py-0.5 text-label-sm text-text-tertiary">
                    {(preview as any).subject}
                  </span>
                )}
                <div className="mt-2 flex items-center gap-1.5 text-body-sm text-text-secondary">
                  <Users size={14} />
                  <span>{preview.memberCount} member{preview.memberCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3">
              <ButtonPrimaryHero
                onClick={handleJoin}
                disabled={!preview || isJoining}
                className="w-full"
              >
                {isJoining ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-forest border-t-transparent" />
                    Joining…
                  </span>
                ) : (
                  'Join project'
                )}
              </ButtonPrimaryHero>
              <button
                onClick={onClose}
                className="text-center text-body-sm text-text-tertiary transition-colors hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
