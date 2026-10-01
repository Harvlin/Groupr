import {
  dashboardData,
  teacherReportData,
  project,
  members,
  sources,
  disputes,
  sessionUser,
  mockProjects,
  mockOfflineLogs,
  users,
  mockNotifications,
  mockInvitations,
  mockMemberConsents,
  mockTasks,
  mockCorroborationRequests,
  mockCoachSuggestionsExtended,
  mockCollusionFlags,
  mockScoreAuditLog,
  mockContributionHistory,
  mockTeacherProjects,
} from '@/data/mock';
import type {
  DashboardData,
  TeacherReportData,
  Project,
  ProjectMember,
  ConnectedSource,
  Dispute,
  ProjectSummary,
  CoachSuggestion,
  OfflineLog,
  SessionUser,
  User,
  ContributionScore,
  Notification,
  Invitation,
  MemberConsent,
  ProjectTask,
  TaskStatus,
  CorroborationRequest,
  CollusionFlag,
  ScoreAuditEntry,
  ContributionHistoryEntry,
  TeacherProjectSummary,
  ProjectSettings,
} from '@/types';
import { apiRequest, backendEnabled, setAccessToken } from '@/services/httpClient';

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function currentProjectId(): string {
  const match = window.location.pathname.match(/\/projects\/([^/]+)/);
  return match?.[1] ?? 'project1';
}

function mapBackendProject(value: any): Project {
  return { ...value, status: String(value.status).toLowerCase() as Project['status'] };
}

function mapBackendMember(value: any, projectId: string): ProjectMember {
  return {
    id: value.id,
    projectId,
    userId: value.userId,
    role: String(value.role).toLowerCase() as ProjectMember['role'],
    joinedAt: value.joinedAt,
    user: { id: value.userId, name: value.name, email: value.email },
  };
}

function mapBackendScore(value: any): ContributionScore {
  return { ...value, confidenceLevel: String(value.confidenceLevel).toLowerCase() as ContributionScore['confidenceLevel'] };
}

let currentSessionUser: SessionUser | null = null;

export const api = {
  // ─── Dashboard & Reports ────────────────────────────────────────────────────
  async getDashboard(): Promise<DashboardData> {
    if (backendEnabled) {
      const response = await apiRequest<any>(`/api/v1/projects/${currentProjectId()}/dashboard`);
      return {
        project: mapBackendProject(response.project),
        members: response.members.map((member: any) => mapBackendMember(member, response.project.id)),
        score: mapBackendScore(response.score),
        categoryBreakdown: response.categoryBreakdown,
        bucketBreakdown: response.bucketBreakdown,
        sessionCount: response.sessionCount,
        teamAverage: response.teamAverage,
        hasPendingDispute: response.hasPendingDispute,
      };
    }
    return delay(dashboardData, 400);
  },

  async getTeacherReport(): Promise<TeacherReportData> {
    if (backendEnabled) {
      const response = await apiRequest<any>(`/api/v1/projects/${currentProjectId()}/teacher-report`);
      return {
        project: mapBackendProject(response.project),
        members: response.members.map((member: any) => mapBackendMember(member, response.project.id)),
        scores: response.scores.map(mapBackendScore),
        events: response.events,
        disputes: response.disputes ?? [],
      };
    }
    return delay(teacherReportData, 500);
  },

  // ─── Projects ───────────────────────────────────────────────────────────────
  async getProject(): Promise<Project> {
    if (backendEnabled) {
      return mapBackendProject(await apiRequest<any>(`/api/v1/projects/${currentProjectId()}`));
    }
    return delay(project, 200);
  },

  async getProjects(): Promise<ProjectSummary[]> {
    if (backendEnabled) {
      const projects = await apiRequest<Array<{
        id: string;
        name: string;
        subject?: string;
        deadline?: string;
        status: ProjectSummary['status'];
        memberCount: number;
        sourceCount: number;
      }>>('/api/v1/projects');
      return projects.map((item) => ({
        ...item,
        status: item.status.toLowerCase() as ProjectSummary['status'],
        userContributionShare: 0,
        members: [],
      }));
    }
    return delay(mockProjects, 400);
  },

  async createProject(data: Partial<ProjectSummary>): Promise<ProjectSummary> {
    if (backendEnabled) {
      const project = await apiRequest<{
        id: string;
        name: string;
        subject?: string;
        deadline?: string;
        status: ProjectSummary['status'];
        memberCount: number;
        sourceCount: number;
      }>('/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify({ name: data.name ?? 'Untitled project', subject: data.subject, deadline: data.deadline }),
      });
      return {
        ...project,
        status: project.status.toLowerCase() as ProjectSummary['status'],
        userContributionShare: 0,
        members: [],
      };
    }
    const newProject: ProjectSummary = {
      id: `project${Date.now()}`,
      name: data.name ?? 'Untitled project',
      subject: data.subject,
      deadline: data.deadline,
      status: 'active',
      memberCount: 1,
      sourceCount: 0,
      userContributionShare: 0,
      members: data.members ?? [],
    };
    mockProjects.unshift(newProject);
    return delay(newProject, 500);
  },

  async updateProjectSettings(_projectId: string, settings: Partial<ProjectSettings>): Promise<Partial<ProjectSettings>> {
    return delay(settings, 400);
  },

  async archiveProject(projectId: string): Promise<{ projectId: string; status: string }> {
    return delay({ projectId, status: 'archived' }, 300);
  },

  async finaliseProject(projectId: string): Promise<{ projectId: string; status: string }> {
    // Mutate the mock arrays so subsequent reads from api.getProjects() / api.getProject() reflect the new status
    const summary = mockProjects.find((p) => p.id === projectId);
    if (summary) summary.status = 'finalised';
    if (project.id === projectId) (project as { status: string }).status = 'finalised';
    return delay({ projectId, status: 'finalised' }, 600);
  },

  async getProjectByCode(code: string): Promise<ProjectSummary> {
    const found = mockProjects.find((p) => (p as ProjectSummary & { projectCode?: string }).projectCode === code);
    if (!found) throw new Error('Project not found');
    return delay(found, 500);
  },

  // ─── Members ────────────────────────────────────────────────────────────────
  async getMembers(): Promise<ProjectMember[]> {
    if (backendEnabled) {
      const response = await apiRequest<any[]>(`/api/v1/projects/${currentProjectId()}/members`);
      return response.map((member) => mapBackendMember(member, currentProjectId()));
    }
    return delay(members, 200);
  },

  async removeMember(projectId: string, memberId: string): Promise<{ projectId: string; memberId: string; removed: boolean }> {
    return delay({ projectId, memberId, removed: true }, 400);
  },

  async updateMemberRole(_projectId: string, memberId: string, role: 'member' | 'leader'): Promise<{ memberId: string; role: string }> {
    return delay({ memberId, role }, 300);
  },

  async transferOwnership(projectId: string, newOwnerId: string): Promise<{ projectId: string; newOwnerId: string }> {
    return delay({ projectId, newOwnerId }, 400);
  },

  async getMemberConsents(_projectId: string): Promise<MemberConsent[]> {
    if (backendEnabled) {
      const response = await apiRequest<Array<{ userId: string; memberName: string; memberAvatarInitials: string; status: MemberConsent['status'] }>>(`/api/v1/projects/${_projectId}/consents`);
      return response.map((consent) => ({ memberName: consent.memberName, memberAvatarInitials: consent.memberAvatarInitials, status: consent.status, memberId: consent.userId }));
    }
    return delay(mockMemberConsents, 300);
  },

  async submitConsent(_projectId: string, accepted: boolean): Promise<{ accepted: boolean }> {
    if (backendEnabled) {
      const connected = await this.getSources();
      const source = connected[0];
      if (source) await apiRequest(`/api/v1/projects/${_projectId}/consents`, { method: 'POST', body: JSON.stringify({ sourceId: source.id, status: accepted ? 'accepted' : 'declined' }) });
      return { accepted };
    }
    return delay({ accepted }, 500);
  },

  // ─── Sources ────────────────────────────────────────────────────────────────
  async getSources(): Promise<ConnectedSource[]> {
    if (backendEnabled) {
      const response = await apiRequest<Array<{
        id: string;
        projectId: string;
        sourceType: ConnectedSource['sourceType'];
        externalId: string;
        connectedBy: string;
        consentConfirmed: boolean;
        connectedAt: string;
        lastSyncedAt?: string;
      }>>(`/api/v1/projects/${currentProjectId()}/sources`);
      return response.map((source) => ({ ...source, sourceType: source.sourceType === 'github_repo' ? 'github_repo' : 'google_docs' }));
    }
    return delay(sources, 300);
  },

  async getGithubInstallUrl(projectId: string): Promise<string> {
    if (!backendEnabled) return '#';
    const response = await apiRequest<{ authorizationUrl: string }>(`/api/v1/auth/oauth/github/start?projectId=${encodeURIComponent(projectId)}`);
    return response.authorizationUrl;
  },

  async connectSource(
    _sourceType: 'google_docs' | 'github_repo',
    _externalId: string
  ): Promise<ConnectedSource> {
    if (backendEnabled) {
      const endpoint = _sourceType === 'github_repo' ? 'github' : 'google';
      const response = await apiRequest<ConnectedSource>(`/api/v1/projects/${currentProjectId()}/sources/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ externalId: _externalId }),
      });
      return response;
    }
    const newSource: ConnectedSource = {
      id: `s-${Date.now()}`,
      projectId: project.id,
      sourceType: _sourceType,
      externalId: _externalId,
      connectedBy: 'current-user',
      consentConfirmed: false,
      connectedAt: new Date().toISOString(),
      lastSyncedAt: undefined,
    };
    sources.push(newSource);
    return delay(newSource, 600);
  },

  async syncSource(sourceId: string): Promise<ConnectedSource | null> {
    if (backendEnabled) {
      await apiRequest(`/api/v1/sources/${sourceId}/sync`, { method: 'POST' });
      const connectedSources = await this.getSources();
      return connectedSources.find((source) => source.id === sourceId) ?? null;
    }
    const source = sources.find((s) => s.id === sourceId);
    if (!source) return delay(null, 400);
    source.lastSyncedAt = new Date().toISOString();
    return delay(source, 1200);
  },

  // ─── Invitations ────────────────────────────────────────────────────────────
  async sendInvitation(_projectId: string, email: string, role: 'member' | 'leader'): Promise<{ id: string; token: string; email: string; role: string; status: string }> {
    return delay({ id: `inv${Date.now()}`, token: `token-${Date.now()}`, email, role, status: 'pending' }, 600);
  },

  async getInvitationByToken(token: string): Promise<Invitation> {
    if (token === 'already_member') throw { reason: 'already_member' };
    if (token === 'token_used') throw { reason: 'token_used' };
    if (token === 'project_full') throw { reason: 'project_full' };
    if (token === 'expired') throw { reason: 'expired' };

    const found = mockInvitations.find((i) => i.token === token);
    if (!found) throw { reason: 'expired' };
    return delay(found, 400);
  },

  async acceptInvitation(token: string): Promise<{ token: string; status: string }> {
    if (token === 'already_member') throw { reason: 'already_member' };
    if (token === 'token_used') throw { reason: 'token_used' };
    if (token === 'project_full') throw { reason: 'project_full' };
    if (token === 'expired') throw { reason: 'expired' };

    return delay({ token, status: 'accepted' }, 700);
  },

  async declineInvitation(token: string): Promise<{ token: string; status: string }> {
    return delay({ token, status: 'declined' }, 400);
  },

  async joinByCode(code: string): Promise<ProjectSummary> {
    const found = mockProjects.find((p) => (p as ProjectSummary & { projectCode?: string }).projectCode === code);
    if (!found) throw new Error('Invalid project code');
    return delay(found, 600);
  },

  // ─── Notifications ──────────────────────────────────────────────────────────
  async getNotifications(): Promise<Notification[]> {
    if (backendEnabled) return apiRequest<Notification[]>('/api/v1/notifications');
    return delay(mockNotifications, 300);
  },

  async markNotificationRead(notifId: string): Promise<{ notifId: string; isRead: boolean }> {
    if (backendEnabled) {
      await apiRequest(`/api/v1/notifications/${notifId}/read`, { method: 'PATCH' });
      return { notifId, isRead: true };
    }
    const notif = mockNotifications.find((n) => n.id === notifId);
    if (notif) notif.isRead = true;
    return delay({ notifId, isRead: true }, 200);
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    if (backendEnabled) {
      await apiRequest('/api/v1/notifications/read-all', { method: 'POST' });
      return { success: true };
    }
    mockNotifications.forEach((n) => { n.isRead = true; });
    return delay({ success: true }, 300);
  },

  // ─── Coach Mode ─────────────────────────────────────────────────────────────
  async getCoachSuggestions(_projectId: string): Promise<CoachSuggestion[]> {
    return delay(mockCoachSuggestionsExtended, 300);
  },

  // ─── Tasks ──────────────────────────────────────────────────────────────────
  async getTasks(_projectId: string): Promise<ProjectTask[]> {
    if (backendEnabled) return apiRequest<ProjectTask[]>(`/api/v1/projects/${_projectId}/tasks`);
    return delay(mockTasks, 300);
  },

  async createTask(task: Omit<ProjectTask, 'id' | 'createdAt'>): Promise<ProjectTask> {
    if (backendEnabled) return apiRequest<ProjectTask>(`/api/v1/projects/${task.projectId}/tasks`, { method: 'POST', body: JSON.stringify({ title: task.title, assignedToMemberId: task.assignedToMemberId, dueDate: task.dueDate, fromCoachSuggestion: task.fromCoachSuggestion }) });
    const newTask: ProjectTask = { id: `task${Date.now()}`, createdAt: new Date().toISOString(), ...task };
    mockTasks.unshift(newTask);
    return delay(newTask, 400);
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<{ taskId: string; status: TaskStatus }> {
    if (backendEnabled) {
      await apiRequest(`/api/v1/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      return { taskId, status };
    }
    const task = mockTasks.find((t) => t.id === taskId);
    if (task) task.status = status;
    return delay({ taskId, status }, 300);
  },

  async deleteTask(taskId: string): Promise<{ taskId: string; deleted: boolean }> {
    if (backendEnabled) {
      await apiRequest(`/api/v1/tasks/${taskId}`, { method: 'DELETE' });
      return { taskId, deleted: true };
    }
    const idx = mockTasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) mockTasks.splice(idx, 1);
    return delay({ taskId, deleted: true }, 300);
  },

  // ─── Offline logs ────────────────────────────────────────────────────────────
  async getOfflineLogs(_projectId: string): Promise<OfflineLog[]> {
    if (backendEnabled) return apiRequest<OfflineLog[]>(`/api/v1/projects/${_projectId}/offline-logs`);
    return delay(mockOfflineLogs, 300);
  },

  async submitOfflineLog(
    log: Omit<OfflineLog, 'id' | 'status'>
  ): Promise<OfflineLog> {
    if (backendEnabled) return apiRequest<OfflineLog>(`/api/v1/projects/${log.projectId}/offline-logs`, { method: 'POST', body: JSON.stringify({ description: log.description, hours: log.hours, date: log.date, category: log.category }) });
    const newLog: OfflineLog = {
      id: `ol${Date.now()}`,
      ...log,
      status:
        log.corroboratedBy.length > 0 ? 'corroborated' : 'unverified',
    };
    mockOfflineLogs.unshift(newLog);
    return delay(newLog, 600);
  },

  async deleteOfflineLog(logId: string): Promise<void> {
    if (backendEnabled) {
      await apiRequest(`/api/v1/offline-logs/${logId}`, { method: 'DELETE' });
      return;
    }
    const index = mockOfflineLogs.findIndex((l) => l.id === logId);
    if (index !== -1) mockOfflineLogs.splice(index, 1);
    return delay(undefined, 300);
  },

  // ─── Corroboration ──────────────────────────────────────────────────────────
  async getCorroborationRequests(_projectId: string): Promise<CorroborationRequest[]> {
    if (backendEnabled) return apiRequest<CorroborationRequest[]>(`/api/v1/projects/${_projectId}/corroboration-requests`);
    return delay(mockCorroborationRequests, 300);
  },

  async respondCorroboration(requestId: string, confirmed: boolean): Promise<{ requestId: string; status: string }> {
    if (backendEnabled) {
      const response = await apiRequest<{ status: string }>(`/api/v1/corroboration-requests/${requestId}`, { method: 'PATCH', body: JSON.stringify({ confirmed }) });
      return { requestId, status: response.status };
    }
    const req = mockCorroborationRequests.find((r) => r.id === requestId);
    if (req) req.status = confirmed ? 'confirmed' : 'declined';
    return delay({ requestId, status: confirmed ? 'confirmed' : 'declined' }, 400);
  },

  // ─── Disputes ───────────────────────────────────────────────────────────────
  async getDisputes(_projectId: string): Promise<Dispute[]> {
    if (backendEnabled) return apiRequest<Dispute[]>(`/api/v1/projects/${_projectId}/disputes`);
    // Returns from the same underlying array as getTeacherReport, ensuring consistency
    return delay(disputes, 300);
  },

  async submitDispute(reason: string): Promise<Dispute> {
    if (backendEnabled) return apiRequest<Dispute>(`/api/v1/projects/${currentProjectId()}/disputes`, { method: 'POST', body: JSON.stringify({ reason }) });
    const newDispute: Dispute = {
      id: `d-${Date.now()}`,
      projectId: project.id,
      userId: 'current-user',
      user: {
        id: 'current-user',
        name: 'You',
        email: 'you@university.edu',
      },
      reason,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    disputes.push(newDispute);
    return delay(newDispute, 500);
  },

  async resolveDispute(
    disputeId: string,
    resolution: string,
    status: 'open' | 'resolved'
  ): Promise<Dispute | null> {
    if (backendEnabled) return apiRequest<Dispute>(`/api/v1/disputes/${disputeId}`, { method: 'PATCH', body: JSON.stringify({ resolution, status }) });
    const dispute = disputes.find((d) => d.id === disputeId);
    if (!dispute) return delay(null, 200);
    dispute.status = status;
    dispute.resolution = resolution;
    dispute.resolvedAt = new Date().toISOString();
    return delay(dispute, 300);
  },

  // ─── Score audit log ────────────────────────────────────────────────────────
  async getScoreAuditLog(projectId: string, memberId: string): Promise<ScoreAuditEntry[]> {
    const filtered = mockScoreAuditLog.filter((e) => e.memberId === memberId && e.projectId === projectId);
    return delay(filtered, 300);
  },

  // ─── Contribution history ────────────────────────────────────────────────────
  async getContributionHistory(_userId: string): Promise<ContributionHistoryEntry[]> {
    return delay(mockContributionHistory, 400);
  },

  // ─── Teacher ────────────────────────────────────────────────────────────────
  async getTeacherProjects(): Promise<TeacherProjectSummary[]> {
    return delay(mockTeacherProjects, 400);
  },

  async getCollusionFlags(_projectId: string): Promise<CollusionFlag[]> {
    return delay(mockCollusionFlags, 300);
  },

  // ─── Score override ─────────────────────────────────────────────────────────
  async overrideScore(
    scoreId: string,
    percentage: number,
    reason: string
  ): Promise<void> {
    if (backendEnabled) {
      await apiRequest(`/api/v1/scores/${scoreId}/override`, {
        method: 'POST',
        body: JSON.stringify({ percentage, reason }),
      });
      return;
    }
    const score = teacherReportData.scores.find((s) => s.id === scoreId);
    if (score) {
      const previous = score.manualOverridePercentage ?? score.finalPercentage;
      score.manualOverridePercentage = percentage;
      score.overrideReason = reason;
      if (!score.overrideHistory) score.overrideHistory = [];
      score.overrideHistory.push({
        id: `or-${Date.now()}`,
        scoreId,
        previousPercentage: previous,
        newPercentage: percentage,
        reason,
        createdAt: new Date().toISOString(),
      });
    }
    return delay(undefined, 400);
  },

  async updateScoresForOverride(_score: ContributionScore): Promise<void> {
    return delay(undefined, 200);
  },

  // ─── Auth ───────────────────────────────────────────────────────────────────
  async login(_email: string, _password: string): Promise<SessionUser> {
    if (backendEnabled) {
      const response = await apiRequest<{
        token: string;
        id: string;
        name: string;
        email: string;
        role: 'student' | 'teacher';
      }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: _email, password: _password }),
      });
      setAccessToken(response.token);
      currentSessionUser = { id: response.id, name: response.name, email: response.email, role: response.role };
      return currentSessionUser;
    }
    currentSessionUser = sessionUser;
    return delay(sessionUser, 800);
  },

  async register(
    name: string,
    email: string,
    _password: string,
    role: 'student' | 'teacher'
  ): Promise<SessionUser> {
    if (backendEnabled) {
      const response = await apiRequest<{
        token: string;
        id: string;
        name: string;
        email: string;
        role: 'student' | 'teacher';
      }>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password: _password, role }),
      });
      setAccessToken(response.token);
      currentSessionUser = { id: response.id, name: response.name, email: response.email, role: response.role };
      return currentSessionUser;
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
    };
    users.push(newUser);
    currentSessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role,
    };
    return delay(currentSessionUser, 800);
  },

  async getCurrentUser(): Promise<SessionUser | null> {
    return delay(currentSessionUser, 100);
  },

  setCurrentUser(user: SessionUser | null) {
    currentSessionUser = user;
    if (!user) setAccessToken(null);
  },
};

