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

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let currentSessionUser: SessionUser | null = null;

export const api = {
  // ─── Dashboard & Reports ────────────────────────────────────────────────────
  async getDashboard(): Promise<DashboardData> {
    return delay(dashboardData, 400);
  },

  async getTeacherReport(): Promise<TeacherReportData> {
    return delay(teacherReportData, 500);
  },

  // ─── Projects ───────────────────────────────────────────────────────────────
  async getProject(): Promise<Project> {
    return delay(project, 200);
  },

  async getProjects(): Promise<ProjectSummary[]> {
    return delay(mockProjects, 400);
  },

  async createProject(data: Partial<ProjectSummary>): Promise<ProjectSummary> {
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
    return delay(mockMemberConsents, 300);
  },

  async submitConsent(_projectId: string, accepted: boolean): Promise<{ accepted: boolean }> {
    return delay({ accepted }, 500);
  },

  // ─── Sources ────────────────────────────────────────────────────────────────
  async getSources(): Promise<ConnectedSource[]> {
    return delay(sources, 300);
  },

  async connectSource(
    _sourceType: 'google_docs' | 'github_repo',
    _externalId: string
  ): Promise<ConnectedSource> {
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
    return delay(mockNotifications, 300);
  },

  async markNotificationRead(notifId: string): Promise<{ notifId: string; isRead: boolean }> {
    const notif = mockNotifications.find((n) => n.id === notifId);
    if (notif) notif.isRead = true;
    return delay({ notifId, isRead: true }, 200);
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    mockNotifications.forEach((n) => { n.isRead = true; });
    return delay({ success: true }, 300);
  },

  // ─── Coach Mode ─────────────────────────────────────────────────────────────
  async getCoachSuggestions(_projectId: string): Promise<CoachSuggestion[]> {
    return delay(mockCoachSuggestionsExtended, 300);
  },

  // ─── Tasks ──────────────────────────────────────────────────────────────────
  async getTasks(_projectId: string): Promise<ProjectTask[]> {
    return delay(mockTasks, 300);
  },

  async createTask(task: Omit<ProjectTask, 'id' | 'createdAt'>): Promise<ProjectTask> {
    const newTask: ProjectTask = { id: `task${Date.now()}`, createdAt: new Date().toISOString(), ...task };
    mockTasks.unshift(newTask);
    return delay(newTask, 400);
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<{ taskId: string; status: TaskStatus }> {
    const task = mockTasks.find((t) => t.id === taskId);
    if (task) task.status = status;
    return delay({ taskId, status }, 300);
  },

  async deleteTask(taskId: string): Promise<{ taskId: string; deleted: boolean }> {
    const idx = mockTasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) mockTasks.splice(idx, 1);
    return delay({ taskId, deleted: true }, 300);
  },

  // ─── Offline logs ────────────────────────────────────────────────────────────
  async getOfflineLogs(_projectId: string): Promise<OfflineLog[]> {
    return delay(mockOfflineLogs, 300);
  },

  async submitOfflineLog(
    log: Omit<OfflineLog, 'id' | 'status'>
  ): Promise<OfflineLog> {
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
    const index = mockOfflineLogs.findIndex((l) => l.id === logId);
    if (index !== -1) mockOfflineLogs.splice(index, 1);
    return delay(undefined, 300);
  },

  // ─── Corroboration ──────────────────────────────────────────────────────────
  async getCorroborationRequests(_projectId: string): Promise<CorroborationRequest[]> {
    return delay(mockCorroborationRequests, 300);
  },

  async respondCorroboration(requestId: string, confirmed: boolean): Promise<{ requestId: string; status: string }> {
    const req = mockCorroborationRequests.find((r) => r.id === requestId);
    if (req) req.status = confirmed ? 'confirmed' : 'declined';
    return delay({ requestId, status: confirmed ? 'confirmed' : 'declined' }, 400);
  },

  // ─── Disputes ───────────────────────────────────────────────────────────────
  async getDisputes(_projectId: string): Promise<Dispute[]> {
    // Returns from the same underlying array as getTeacherReport, ensuring consistency
    return delay(disputes, 300);
  },

  async submitDispute(reason: string): Promise<Dispute> {
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
    currentSessionUser = sessionUser;
    return delay(sessionUser, 800);
  },

  async register(
    name: string,
    email: string,
    _password: string,
    role: 'student' | 'teacher'
  ): Promise<SessionUser> {
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
  },
};

