import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProject } from '@/hooks/useProject';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ButtonPrimaryHero, CardFeatureMedia } from '@/components/ui';
import { api } from '@/services/api';
import { PageContainer } from '@/components/layout/PageContainer';
import type { OfflineLog } from '@/types';

const OFFLINE_CATEGORIES = [
  'Meeting',
  'Brainstorming',
  'Research (offline)',
  'Writing (offline)',
  'Design (offline)',
  'Other',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string) {
  const date = new Date(iso + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function OfflineLogPage() {
  useDocumentTitle('Log Offline Contribution');
  const { projectId } = useParams<{ projectId: string }>();
  const { project, members } = useProject();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [logs, setLogs] = useState<OfflineLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const [description, setDescription] = useState('');
  const [hours, setHours] = useState<string>('1');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [category, setCategory] = useState<string>(OFFLINE_CATEGORIES[0]);
  const [corroboratedBy, setCorroboratedBy] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const canSubmit = description.trim().length > 0 && parseFloat(hours) > 0;

  useEffect(() => {
    if (!projectId) return;
    setLogsLoading(true);
    api
      .getOfflineLogs(projectId)
      .then(setLogs)
      .finally(() => setLogsLoading(false));
  }, [projectId]);

  const corroborationOptions = useMemo(() => {
    return members.filter((m) => !currentUser || m.userId !== currentUser.id);
  }, [members, currentUser]);

  const myLogs = useMemo(() => {
    if (!currentUser) return [];
    return logs
      .filter((log) => log.userId === currentUser.id)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [logs, currentUser]);

  const handleToggleCorroborator = (userId: string) => {
    setCorroboratedBy((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !currentUser || !project || !projectId) return;

    setSubmitting(true);
    try {
      await api.submitOfflineLog({
        userId: currentUser.id,
        projectId: project.id,
        description: description.trim(),
        hours: parseFloat(hours),
        date,
        category,
        corroboratedBy,
      });
      addToast('Offline contribution logged.', 'success');
      setDescription('');
      setHours('1');
      setCorroboratedBy([]);
      api.getOfflineLogs(projectId).then(setLogs);
    } catch {
      addToast('Could not log contribution. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (logId: string) => {
    try {
      await api.deleteOfflineLog(logId);
      addToast('Entry removed.', 'success');
      setConfirmingDeleteId(null);
      if (projectId) {
        api.getOfflineLogs(projectId).then(setLogs);
      }
    } catch {
      addToast('Could not remove entry. Please try again.', 'error');
    }
  };

  if (!currentUser || !project) {
    return null;
  }

  return (
    <PageContainer width="narrow">
      {/* Header */}
      <h1
        className="font-display text-3xl text-text-primary"
        style={{ lineHeight: 0.9 }}
      >
        Log Offline Contribution
      </h1>

      {/* Disclaimer */}
      <div className="mt-6 flex items-start gap-3 rounded-hairline border-l-2 border-border-hairline bg-surface-muted p-4">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="mt-0.5 shrink-0 text-text-tertiary"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 7V13M12 16V17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p className="font-body text-[13px] text-text-secondary">
          Offline contributions are self-reported and unverified. They carry
          limited weight in scoring and are always marked as such in reports.
        </p>
      </div>

      {/* Form */}
      <CardFeatureMedia className="mt-6 p-7 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block font-body text-sm font-medium text-text-secondary"
            >
              What did you work on?
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the offline work you did — e.g., 'Led a team meeting to finalize the methodology section.'"
              className="w-full resize-none rounded-card border border-black/10 bg-background px-4 py-3 font-body text-sm text-text-primary outline-none focus:border-accent-lime"
            />
          </div>

          <div>
            <label
              htmlFor="hours"
              className="mb-1.5 block font-body text-sm font-medium text-text-secondary"
            >
              Estimated hours
            </label>
            <div className="flex items-center gap-3">
              <input
                id="hours"
                type="number"
                min={0.5}
                max={8}
                step={0.5}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-32 rounded-control border border-black/10 bg-background px-4 py-2.5 font-body text-sm text-text-primary outline-none focus:border-accent-lime"
              />
              <span className="font-body text-sm text-text-secondary">hours</span>
            </div>
            <p className="mt-1.5 font-body text-xs text-text-tertiary">
              This affects your score by at most ±15%, regardless of how many
              hours you claim.
            </p>
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-1.5 block font-body text-sm font-medium text-text-secondary"
            >
              When did this happen?
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-control border border-black/10 bg-background px-4 py-2.5 font-body text-sm text-text-primary outline-none focus:border-accent-lime"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block font-body text-sm font-medium text-text-secondary"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-control border border-black/10 bg-background px-4 py-2.5 font-body text-sm text-text-primary outline-none focus:border-accent-lime"
            >
              {OFFLINE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-2 block font-body text-sm font-medium text-text-secondary">
              Corroboration (optional)
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {corroborationOptions.map((member) => {
                const checked = corroboratedBy.includes(member.userId);
                return (
                  <label
                    key={member.userId}
                    className="flex cursor-pointer items-center gap-3 rounded-hairline border border-black/10 bg-surface-muted/50 p-2 transition-colors hover:bg-surface-muted"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCorroborator(member.userId)}
                      className="sr-only"
                    />
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-lime text-xs font-semibold text-text-primary">
                      {getInitials(member.user.name)}
                    </div>
                    <span className="flex-1 font-body text-sm text-text-primary">
                      {member.user.name}
                    </span>
                    <span
                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded-hairline border ${
                        checked
                          ? 'border-accent-positive bg-accent-positive text-white'
                          : 'border-black/20 bg-white'
                      }`}
                      aria-hidden="true"
                    >
                      {checked && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 13L9 17L19 7"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-1.5 font-body text-xs text-text-tertiary">
              Members you select will see a confirmation request in their
              dashboard.
            </p>
          </div>

          <ButtonPrimaryHero
            type="submit"
            className="w-full"
            disabled={!canSubmit || submitting}
          >
            Log contribution
          </ButtonPrimaryHero>
        </form>
      </CardFeatureMedia>

      {/* Logged entries */}
      <div className="mt-10">
        <h2 className="font-body text-base font-semibold text-text-secondary">
          Your logged contributions
        </h2>

        {logsLoading ? (
          <p className="mt-4 text-center font-body text-sm text-text-tertiary">
            Loading…
          </p>
        ) : myLogs.length === 0 ? (
          <p className="mt-4 text-center font-body text-sm text-text-tertiary">
            No offline contributions logged yet.
          </p>
        ) : (
          <div className="mt-4 rounded-card border border-black/10 bg-white">
            {myLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              const isConfirming = confirmingDeleteId === log.id;
              const confirmedCount = log.corroboratedBy.length;
              const statusLabel =
                confirmedCount > 0
                  ? `Confirmed by ${confirmedCount}`
                  : 'Unverified';

              return (
                <div
                  key={log.id}
                  className="border-b border-black/10 last:border-b-0"
                >
                  <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-hairline bg-surface-muted px-2 py-0.5 font-body text-xs text-text-secondary">
                          {formatDate(log.date)}
                        </span>
                        <span className="rounded-control border border-black/10 px-2 py-0.5 font-body text-xs text-text-primary">
                          {log.category}
                        </span>
                        <span className="rounded-control bg-accent-lime/15 px-2 py-0.5 font-body text-xs font-semibold text-text-primary">
                          {log.hours}h
                        </span>
                      </div>
                      <p
                        onClick={() =>
                          setExpandedId((id) => (id === log.id ? null : log.id))
                        }
                        className={`mt-2 cursor-pointer font-body text-sm text-text-primary transition-all ${
                          isExpanded ? '' : 'line-clamp-1'
                        }`}
                      >
                        {log.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <span
                        className={`rounded-control border px-2 py-0.5 font-body text-xs font-semibold ${
                          confirmedCount > 0
                            ? 'border-accent-positive text-accent-positive'
                            : 'border-accent-warning text-accent-warning'
                        }`}
                      >
                        {statusLabel}
                      </span>

                      <button
                        onClick={() => setConfirmingDeleteId(log.id)}
                        className="text-text-tertiary transition-colors hover:text-accent-warning"
                        aria-label="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isConfirming && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-surface-muted/50"
                      >
                        <div className="flex items-center justify-between gap-3 px-4 py-3 md:flex-row">
                          <p className="font-body text-sm text-text-secondary">
                            Remove this entry? This can't be undone.
                          </p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="font-body text-sm font-semibold text-accent-warning hover:underline"
                            >
                              Yes, remove
                            </button>
                            <button
                              onClick={() => setConfirmingDeleteId(null)}
                              className="font-body text-sm text-text-tertiary hover:text-text-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link
          to={`/projects/${projectId}/coach`}
          className="font-body text-sm font-semibold text-accent-blue hover:underline"
        >
          ← Back to Coach Mode
        </Link>
      </div>
    </PageContainer>
  );
}
