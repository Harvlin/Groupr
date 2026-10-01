export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type ContributionCategory =
  | 'research'
  | 'core_writing'
  | 'editing'
  | 'design'
  | 'coding'
  | 'coordination';

export type TimeBucket = 'early' | 'middle' | 'late';

export type SourceType = 'google_docs' | 'github_repo';

export type ProjectStatus = 'setup' | 'active' | 'completed' | 'finalised' | 'archived';

export type DisputeStatus = 'open' | 'resolved';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface Project {
  id: string;
  name: string;
  subject?: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  deadline?: string;
  status: ProjectStatus;
  sourceCount?: number;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'member' | 'leader';
  joinedAt: string;
  user: User;
}

export interface ConnectedSource {
  id: string;
  projectId: string;
  sourceType: SourceType;
  externalId: string;
  connectedBy: string;
  consentConfirmed: boolean;
  connectedAt: string;
  lastSyncedAt?: string;
}

export interface ContributionEvent {
  id: string;
  projectId: string;
  sourceId: string;
  userId: string;
  externalUserRef: string;
  timestamp: string;
  eventType: 'doc_edit' | 'commit' | 'comment';
  rawDiff?: string;
  charDeltaRaw: number;
  uniqueContentDelta: number;
  category?: ContributionCategory;
  timeBucket: TimeBucket;
  possiblyAiGenerated: boolean;
  flaggedDuplicate: boolean;
  fileOrSection?: string;
  aiFlagType?: AiFlagType;
}

export type AiFlagType =
  | 'ai_generated_content'
  | 'bulk_paste_detected'
  | 'style_shift_detected';

export interface Rationale {
  content_share: string;
  temporal_note: string;
  session_note: string;
  flags: string[];
  confidence_reason: string;
}

export interface ContributionScore {
  id: string;
  projectId: string;
  userId: string;
  rawScore: number;
  finalPercentage: number;
  confidenceLevel: ConfidenceLevel;
  rationale: Rationale;
  manualOverridePercentage?: number;
  overrideReason?: string;
  overrideHistory?: OverrideRecord[];
  computedAt: string;
}

export interface OverrideRecord {
  id: string;
  scoreId: string;
  previousPercentage: number;
  newPercentage: number;
  reason: string;
  createdAt: string;
}

export interface CategoryBreakdown {
  category: ContributionCategory;
  value: number;
  percentage: number;
}

export interface Dispute {
  id: string;
  projectId: string;
  userId: string;
  user: User;
  reason: string;
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DashboardData {
  project: Project;
  members: ProjectMember[];
  score: ContributionScore;
  categoryBreakdown: CategoryBreakdown[];
  bucketBreakdown: Record<TimeBucket, number>;
  sessionCount: number;
  teamAverage: number;
  hasPendingDispute?: boolean;
}

export interface TeacherReportData {
  project: Project;
  scores: ContributionScore[];
  members: ProjectMember[];
  events: ContributionEvent[];
  disputes: Dispute[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  subject?: string;
  deadline?: string;
  status: ProjectStatus;
  memberCount: number;
  sourceCount: number;
  userContributionShare: number;
  members: ProjectMember[];
}

export interface CoachSuggestion {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatarInitials?: string;
  currentScore: number;
  dominantCategory: string;
  gapCategory: string;
  specificTask: string;
  daysRemaining: number;
  isDismissed?: boolean;
  isDiscussed?: boolean;
}

export interface OfflineLog {
  id: string;
  userId: string;
  projectId: string;
  description: string;
  hours: number;
  date: string;
  category: string;
  corroboratedBy: string[];
  status: 'unverified' | 'corroborated' | 'disputed';
  createdAt?: string;
}

export interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'teacher'
  ) => Promise<AuthUser>;
  logout: () => void;
}

export interface ProjectContextValue {
  project: Project | null;
  members: ProjectMember[];
  currentMember: ProjectMember | null;
  tasks: ProjectTask[];
  scores: ContributionScore[];
  disputes: Dispute[];
  memberConsents: MemberConsent[];
  isLoading: boolean;
  refetch: () => void;
  updateTask: (taskId: string, status: TaskStatus) => void;
}

// ─── Auth ───────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'teacher';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school: string | null;
  grade: string | null;
  avatarInitials: string;
  createdAt: string;
}

// ─── Notifications ──────────────────────────────────────────────────────────
export type NotificationType =
  | 'invitation'
  | 'corroboration_request'
  | 'early_warning'
  | 'dispute_resolved'
  | 'project_finalised'
  | 'member_joined';

export interface Notification {
  id: string;
  type: NotificationType;
  projectId: string;
  projectName: string;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Invitations ────────────────────────────────────────────────────────────
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Invitation {
  id: string;
  token: string;
  projectId: string;
  projectName: string;
  invitedByName: string;
  invitedByAvatarInitials: string;
  invitedEmail: string;
  role: 'member' | 'leader';
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

// ─── Project settings ────────────────────────────────────────────────────────
export interface ProjectSettings {
  projectId: string;
  name: string;
  subject: string;
  deadline: string;
  description?: string;
  expectedDistribution: 'equal' | 'custom';
  customDistribution?: Record<string, number>;
  language: 'en' | 'id';
  allowOfflineLog: boolean;
  autoWarnThreshold: number;
}

// ─── Consent ─────────────────────────────────────────────────────────────────
export type ConsentStatus = 'pending' | 'accepted' | 'declined';

export interface MemberConsent {
  memberId: string;
  memberName: string;
  memberAvatarInitials: string;
  status: ConsentStatus;
  consentedAt?: string;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export type TaskStatus = 'open' | 'in_progress' | 'done';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  assignedToMemberId: string;
  assignedToMemberName: string;
  status: TaskStatus;
  createdByMemberId: string;
  createdAt: string;
  dueDate?: string;
  fromCoachSuggestion: boolean;
}

// ─── Offline logs ─────────────────────────────────────────────────────────────
export type OfflineLogCategory =
  | 'Meeting'
  | 'Brainstorming'
  | 'Research'
  | 'Writing'
  | 'Design'
  | 'Other';

export type OfflineLogStatus = 'unverified' | 'corroborated' | 'disputed';

// ─── Corroboration requests ───────────────────────────────────────────────────
export interface CorroborationRequest {
  id: string;
  logId: string;
  requestingMemberId: string;
  requestingMemberName: string;
  targetMemberId: string;
  description: string;
  hours: number;
  date: string;
  status: 'pending' | 'confirmed' | 'declined';
}

// ─── Collusion flags ──────────────────────────────────────────────────────────
export interface CollusionFlag {
  id: string;
  projectId: string;
  memberAId: string;
  memberAName: string;
  memberBId: string;
  memberBName: string;
  styleScore: number;
  temporalScore: number;
  combinedScore: number;
  flaggedAt: string;
  reviewRequired: boolean;
}

// ─── Score audit log ──────────────────────────────────────────────────────────
export interface ScoreAuditEntry {
  id: string;
  memberId: string;
  projectId: string;
  previousScore: number;
  newScore: number;
  trigger: string;
  changedAt: string;
}

// ─── Contribution history ─────────────────────────────────────────────────────
export interface ContributionHistoryEntry {
  projectId: string;
  projectName: string;
  subject: string;
  deadline: string;
  finalScore: number;
  rank: number;
  teamSize: number;
  status: 'active' | 'finalised';
}

// ─── Projects (extended) ──────────────────────────────────────────────────────
export interface ProjectExtended extends Project {
  subject?: string;
  description?: string;
  status: 'setup' | 'active' | 'finalised' | 'archived';
  userContributionShare?: number;
  sourceCount?: number;
  createdByRole?: UserRole;
  projectCode: string;
  settings?: ProjectSettings;
  collusionFlags?: CollusionFlag[];
  scoreAuditLog?: ScoreAuditEntry[];
  memberCount?: number;
}

// ─── Guru dashboard ───────────────────────────────────────────────────────────
export interface TeacherProjectSummary {
  projectId: string;
  projectName: string;
  subject: string;
  deadline: string;
  teamSize: number;
  status: 'setup' | 'active' | 'finalised';
  hasImbalance: boolean;
  hasOpenDisputes: boolean;
  hasCollusionFlags: boolean;
  pendingConsentCount: number;
}

// ─── Notification Context ─────────────────────────────────────────────────────
export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  isLoading: boolean;
}
