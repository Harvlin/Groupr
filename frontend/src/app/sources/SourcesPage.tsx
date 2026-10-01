import { useEffect, useState } from 'react';
import { FileText, Github, Check, Clock, AlertCircle, Link2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProject } from '@/hooks/useProject';
import {
  CardFeatureMedia,
  ButtonPrimaryHero,
  ButtonGlassUtility,
} from '@/components/ui';
import { api } from '@/services/api';
import { PageContainer } from '@/components/layout/PageContainer';
import type { ConnectedSource } from '@/types';

const sourceIcons = {
  google_docs: FileText,
  github_repo: Github,
};

const sourceLabels = {
  google_docs: 'Google Docs',
  github_repo: 'GitHub Repository',
};

type SyncStatus = 'idle' | 'syncing' | 'synced';

export function SourcesPage() {
  const [sources, setSources] = useState<ConnectedSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState<'google_docs' | 'github_repo'>('google_docs');
  const [newId, setNewId] = useState('');
  const [syncStatus, setSyncStatus] = useState<Record<string, SyncStatus>>({});
  const [githubConnecting, setGithubConnecting] = useState(false);
  const { addToast } = useToast();
  const { project, refetch } = useProject();
  useDocumentTitle('Connected Sources');

  const isFinalized = project?.status === 'completed';

  useEffect(() => {
    api.getSources().then((result) => {
      setSources(result);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('github') === 'connected') {
      addToast('GitHub App connected. Select a repository to begin tracking.', 'success');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [addToast]);

  const handleGithubAppConnect = async () => {
    if (!project?.id || isFinalized) return;
    setGithubConnecting(true);
    try {
      const authorizationUrl = await api.getGithubInstallUrl(project.id);
      window.location.assign(authorizationUrl);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to start GitHub connection.', 'error');
      setGithubConnecting(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFinalized || !newId.trim()) return;
    const created = await api.connectSource(newType, newId.trim());
    setSources((prev) => [...prev, created]);
    setNewId('');
    refetch(); // update ProjectContext so SetupGuideCard reflects new sourceCount (fix 4.9)
    addToast(
      `Connected ${newType === 'google_docs' ? 'Google Doc' : 'GitHub repo'}. Waiting for team consent.`,
      'success'
    );
  };

  const handleSync = async (sourceId: string) => {
    if (isFinalized) return;
    setSyncStatus((prev) => ({ ...prev, [sourceId]: 'syncing' }));
    await api.syncSource(sourceId);
    setSyncStatus((prev) => ({ ...prev, [sourceId]: 'synced' }));
    setTimeout(() => {
      setSyncStatus((prev) => ({ ...prev, [sourceId]: 'idle' }));
    }, 2000);
  };

  return (
    <PageContainer width="wide">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
            Data sources
          </p>
          <h1
            className="mt-1 font-display text-3xl text-text-primary md:text-4xl"
            style={{ lineHeight: 0.9 }}
          >
            {project?.name ?? 'Connected sources'}
          </h1>
        </div>

        {isFinalized && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-card bg-surface-forest p-4"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-accent-lime" />
            <div>
              <p className="font-semibold text-accent-lime">Project finalised</p>
              <p className="text-sm text-accent-lime/80">
                Sources are locked. No new connections or syncs can be made.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="h-32 animate-pulse rounded-card bg-white border border-hairline" />
            ) : sources.length === 0 ? (
              <CardFeatureMedia className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-text-tertiary">
                  <Link2 size={28} />
                </div>
                <h3 className="font-display text-xl text-text-primary" style={{ lineHeight: 0.95 }}>
                  No sources connected
                </h3>
                <p className="mt-2 max-w-sm text-text-secondary">
                  Connect your first Google Doc or GitHub repo to start analyzing
                  contribution automatically.
                </p>
              </CardFeatureMedia>
            ) : (
              sources.map((source) => {
                const Icon = sourceIcons[source.sourceType];
                return (
                  <CardFeatureMedia
                    key={source.id}
                    className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-primary">
                        <Icon size={22} />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {sourceLabels[source.sourceType]}
                        </p>
                        <p className="text-sm text-text-tertiary">
                          {source.externalId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {source.consentConfirmed ? (
                        <span className="inline-flex items-center gap-1 rounded-control bg-accent-positive/10 px-3 py-1 text-xs font-semibold text-accent-positive">
                          <Check size={12} />
                          Consent given
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-control bg-accent-warning/10 px-3 py-1 text-xs font-semibold text-accent-warning">
                          <Clock size={12} />
                          Awaiting consent
                        </span>
                      )}
                      <ButtonGlassUtility
                        onClick={() => handleSync(source.id)}
                        disabled={isFinalized || syncStatus[source.id] === 'syncing'}
                      >
                        {syncStatus[source.id] === 'syncing' ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : syncStatus[source.id] === 'synced' ? (
                          <Check size={16} />
                        ) : (
                          <RefreshCw size={16} />
                        )}
                        <span className="ml-2">
                          {syncStatus[source.id] === 'syncing'
                            ? 'Syncing…'
                            : syncStatus[source.id] === 'synced'
                            ? 'Synced'
                            : 'Sync'}
                        </span>
                      </ButtonGlassUtility>
                    </div>
                  </CardFeatureMedia>
                );
              })
            )}
          </div>

          <CardFeatureMedia className="h-fit">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              Connect a source
            </span>
            <p className="mt-2 text-sm text-text-secondary">
              Every team member must consent before ingestion begins.
            </p>
            <form onSubmit={handleConnect} className="mt-5 space-y-4">
              <ButtonGlassUtility
                type="button"
                className="w-full justify-center"
                onClick={handleGithubAppConnect}
                disabled={isFinalized || githubConnecting}
              >
                <Github size={16} />
                <span className="ml-2">{githubConnecting ? 'Opening GitHub…' : 'Install GitHub App'}</span>
              </ButtonGlassUtility>

              <div className="border-t border-black/10 pt-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  Source type
                </label>
                <select
                  value={newType}
                  onChange={(e) =>
                    setNewType(e.target.value as 'google_docs' | 'github_repo')
                  }
                  disabled={isFinalized}
                  className="w-full rounded-control border border-black/10 bg-white px-4 py-2 text-text-primary outline-none focus:border-accent-lime disabled:bg-surface-muted disabled:text-text-tertiary"
                >
                  <option value="google_docs">Google Docs</option>
                  <option value="github_repo">GitHub Repository</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  Document ID or repo name
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  disabled={isFinalized}
                  placeholder={
                    newType === 'google_docs'
                      ? 'e.g. 1xGroupResearchDoc123'
                      : 'e.g. owner/repo-name'
                  }
                  className="w-full rounded-control border border-black/10 bg-white px-4 py-2 text-text-primary outline-none focus:border-accent-lime disabled:bg-surface-muted disabled:text-text-tertiary"
                />
              </div>
              <ButtonPrimaryHero type="submit" className="w-full" disabled={isFinalized}>
                Connect source
              </ButtonPrimaryHero>
              </div>
            </form>

            <div className="mt-5 flex items-start gap-2 rounded-control bg-surface-muted p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-text-tertiary" />
              <p className="text-xs text-text-tertiary">
                We only read revision history — never content outside the connected
                sources.
              </p>
            </div>
          </CardFeatureMedia>
        </div>
    </PageContainer>
  );
}
