import type {
  ConnectedSource,
  ContributionEvent,
  ContributionScore,
  DashboardData,
  Dispute,
  OfflineLog,
  Project,
  ProjectMember,
  ProjectSummary,
  CoachSuggestion,
  TeacherReportData,
  User,
  Notification,
  Invitation,
  MemberConsent,
  ProjectTask,
  CorroborationRequest,
  CollusionFlag,
  ScoreAuditEntry,
  ContributionHistoryEntry,
  TeacherProjectSummary,
} from '@/types';

const currentUserId = 'u-1';

export const users: User[] = [
  {
    id: 'u-1',
    name: 'Ava Mitchell',
    email: 'ava.mitchell@university.edu',
    avatarUrl: 'https://i.pravatar.cc/150?u=u-1',
  },
  {
    id: 'u-2',
    name: 'Daniel Okonkwo',
    email: 'daniel.okonkwo@university.edu',
    avatarUrl: 'https://i.pravatar.cc/150?u=u-2',
  },
  {
    id: 'u-3',
    name: 'Sofia Lindgren',
    email: 'sofia.lindgren@university.edu',
    avatarUrl: 'https://i.pravatar.cc/150?u=u-3',
  },
  {
    id: 'u-4',
    name: 'Marcus Chen',
    email: 'marcus.chen@university.edu',
    avatarUrl: 'https://i.pravatar.cc/150?u=u-4',
  },
];

export const project: Project = {
  id: 'project1',
  name: 'CSC Innovation Award — Group Contribution Study',
  subject: 'Computer Science',
  description: 'Building a tool to objectively verify group-work contribution.',
  createdBy: 'u-1',
  createdAt: '2026-08-15T09:00:00Z',
  deadline: '2026-09-23T23:59:00Z',
  status: 'active',
};

export const members: ProjectMember[] = users.map((user, index) => ({
  id: `pm-${index + 1}`,
  projectId: project.id,
  userId: user.id,
  role: index === 0 ? 'leader' : 'member',
  joinedAt: project.createdAt,
  user,
}));

export const sources: ConnectedSource[] = [
  {
    id: 's-1',
    projectId: project.id,
    sourceType: 'google_docs',
    externalId: '1xGroupResearchDoc123',
    connectedBy: 'u-1',
    consentConfirmed: true,
    connectedAt: '2026-08-16T10:00:00Z',
    lastSyncedAt: '2026-09-15T14:32:00Z',
  },
  {
    id: 's-2',
    projectId: project.id,
    sourceType: 'github_repo',
    externalId: 'truthlayer/demo-group-project',
    connectedBy: 'u-2',
    consentConfirmed: true,
    connectedAt: '2026-08-17T11:30:00Z',
    lastSyncedAt: '2026-09-15T14:30:00Z',
  },
  {
    id: 's-3',
    projectId: project.id,
    sourceType: 'google_docs',
    externalId: '1xSlidesDraftPending',
    connectedBy: 'u-3',
    consentConfirmed: false,
    connectedAt: '2026-09-14T09:00:00Z',
    lastSyncedAt: undefined,
  },
];

export const categoryBreakdownFor = (
  userId: string
): Record<string, number> => {
  const maps: Record<string, Record<string, number>> = {
    'u-1': { core_writing: 1450, research: 920, editing: 640, coordination: 480 },
    'u-2': { coding: 2100, research: 300, coordination: 150 },
    'u-3': { design: 680, core_writing: 220, editing: 180 },
    'u-4': { coordination: 340, core_writing: 120 },
  };
  return maps[userId] ?? {};
};

export const scores: ContributionScore[] = [
  {
    id: 'cs-1',
    projectId: project.id,
    userId: 'u-1',
    rawScore: 0.88,
    finalPercentage: 42,
    confidenceLevel: 'high',
    rationale: {
      content_share:
        '42% of the project\'s total unique content came from your contribution.',
      temporal_note:
        'Your contribution was spread across all 3 project time phases — consistent throughout the work period.',
      session_note: '12 separate edit sessions recorded.',
      flags: [],
      confidence_reason: 'Complete data from 2 sources (Google Docs + GitHub).',
    },
    computedAt: '2026-09-12T18:00:00Z',
    overrideHistory: [],
  },
  {
    id: 'cs-2',
    projectId: project.id,
    userId: 'u-2',
    rawScore: 0.61,
    finalPercentage: 29,
    confidenceLevel: 'high',
    rationale: {
      content_share:
        '29% of the project\'s total unique content came from your contribution.',
      temporal_note:
        'Your contribution was concentrated in the middle and late phases.',
      session_note: '8 separate edit sessions recorded.',
      flags: [],
      confidence_reason: 'Complete data from 2 sources (Google Docs + GitHub).',
    },
    computedAt: '2026-09-12T18:00:00Z',
    overrideHistory: [],
  },
  {
    id: 'cs-3',
    projectId: project.id,
    userId: 'u-3',
    rawScore: 0.36,
    finalPercentage: 17,
    confidenceLevel: 'medium',
    rationale: {
      content_share:
        '17% of the project\'s total unique content came from your contribution.',
      temporal_note: 'Most contributions appeared in the late phase.',
      session_note: '4 separate edit sessions recorded.',
      flags: [
        '1 contribution was detected as very similar to a teammate\'s draft and was counted only partially.',
      ],
      confidence_reason:
        'Limited session diversity for this member; data is present but uneven.',
    },
    computedAt: '2026-09-12T18:00:00Z',
    overrideHistory: [],
  },
  {
    id: 'cs-4',
    projectId: project.id,
    userId: 'u-4',
    rawScore: 0.25,
    finalPercentage: 12,
    confidenceLevel: 'low',
    rationale: {
      content_share:
        '12% of the project\'s total unique content came from your contribution.',
      temporal_note: 'All contributions occurred in the final 48 hours.',
      session_note: '2 separate edit sessions recorded.',
      flags: [
        'Large block of text added in the final hour was de-duplicated because it closely matched existing content.',
      ],
      confidence_reason:
        'Low session count and compressed timeline; offline contribution may not be captured.',
    },
    computedAt: '2026-09-12T18:00:00Z',
    overrideHistory: [
      {
        id: 'or-1',
        scoreId: 'cs-4',
        previousPercentage: 12,
        newPercentage: 20,
        reason:
          'Student provided evidence of offline coordination and research support not captured by connected sources.',
        createdAt: '2026-09-13T11:00:00Z',
      },
    ],
  },
];

export const dashboardData: DashboardData = {
  project,
  members,
  score: scores[0],
  categoryBreakdown: [
    { category: 'core_writing', value: 1450, percentage: 35 },
    { category: 'research', value: 920, percentage: 22 },
    { category: 'editing', value: 640, percentage: 16 },
    { category: 'coordination', value: 480, percentage: 12 },
    { category: 'coding', value: 520, percentage: 12 },
    { category: 'design', value: 140, percentage: 3 },
  ],
  bucketBreakdown: {
    early: 1120,
    middle: 1840,
    late: 1190,
  },
  sessionCount: 12,
  teamAverage: 25,
  hasPendingDispute: true,
};

export const events: ContributionEvent[] = [
  {
    id: 'e-1',
    projectId: project.id,
    sourceId: 's-1',
    userId: 'u-1',
    externalUserRef: 'ava.mitchell@university.edu',
    timestamp: '2026-08-18T14:23:00Z',
    eventType: 'doc_edit',
    rawDiff: '+ Added initial problem framing and user-study notes',
    charDeltaRaw: 1240,
    uniqueContentDelta: 1180,
    category: 'research',
    timeBucket: 'early',
    possiblyAiGenerated: false,
    flaggedDuplicate: false,
    fileOrSection: 'Problem Statement',
  },
  {
    id: 'e-2',
    projectId: project.id,
    sourceId: 's-2',
    userId: 'u-2',
    externalUserRef: 'daniel.okonkwo@university.edu',
    timestamp: '2026-08-20T09:45:00Z',
    eventType: 'commit',
    rawDiff: '+ Scaffolded ingestion service + GitHub connector',
    charDeltaRaw: 3400,
    uniqueContentDelta: 3100,
    category: 'coding',
    timeBucket: 'early',
    possiblyAiGenerated: false,
    flaggedDuplicate: false,
    fileOrSection: 'backend/connectors/GitHubClient.java',
  },
  {
    id: 'e-3',
    projectId: project.id,
    sourceId: 's-1',
    userId: 'u-1',
    externalUserRef: 'ava.mitchell@university.edu',
    timestamp: '2026-08-25T16:10:00Z',
    eventType: 'doc_edit',
    rawDiff: '+ Expanded PRD sections 1–4; added user personas',
    charDeltaRaw: 2100,
    uniqueContentDelta: 1980,
    category: 'core_writing',
    timeBucket: 'middle',
    possiblyAiGenerated: false,
    flaggedDuplicate: false,
    fileOrSection: 'truth-layer-prd.md',
  },
  {
    id: 'e-4',
    projectId: project.id,
    sourceId: 's-1',
    userId: 'u-3',
    externalUserRef: 'sofia.lindgren@university.edu',
    timestamp: '2026-09-05T21:30:00Z',
    eventType: 'doc_edit',
    rawDiff: '+ Drafted design system section; pasted reference notes',
    charDeltaRaw: 1800,
    uniqueContentDelta: 720,
    category: 'design',
    timeBucket: 'late',
    possiblyAiGenerated: true,
    flaggedDuplicate: true,
    fileOrSection: 'wise-design.md',
    aiFlagType: 'bulk_paste_detected',
  },
  {
    id: 'e-5',
    projectId: project.id,
    sourceId: 's-2',
    userId: 'u-4',
    externalUserRef: 'marcus.chen@university.edu',
    timestamp: '2026-09-18T22:15:00Z',
    eventType: 'commit',
    rawDiff: '+ Added README and deployment notes',
    charDeltaRaw: 900,
    uniqueContentDelta: 340,
    category: 'coordination',
    timeBucket: 'late',
    possiblyAiGenerated: false,
    flaggedDuplicate: true,
    fileOrSection: 'README.md',
  },
  {
    id: 'e-6',
    projectId: project.id,
    sourceId: 's-1',
    userId: 'u-3',
    externalUserRef: 'sofia.lindgren@university.edu',
    timestamp: '2026-09-18T23:00:00Z',
    eventType: 'doc_edit',
    rawDiff: '+ Added conclusion drafted externally; tone differs from prior sections',
    charDeltaRaw: 2400,
    uniqueContentDelta: 900,
    category: 'core_writing',
    timeBucket: 'late',
    possiblyAiGenerated: true,
    flaggedDuplicate: false,
    fileOrSection: 'truth-layer-prd.md',
    aiFlagType: 'style_shift_detected',
  },
];

export const disputes: Dispute[] = [
  {
    id: 'd-1',
    projectId: project.id,
    userId: 'u-4',
    user: users[3],
    reason:
      'I coordinated most of the offline user interviews and shared notes in a private channel. Those contributions are not reflected in the connected documents.',
    status: 'open',
    createdAt: '2026-09-13T10:00:00Z',
  },
];

export const teacherReportData: TeacherReportData = {
  project,
  scores,
  members,
  events,
  disputes,
};

export const sessionUser = {
  id: currentUserId,
  name: 'Ava Mitchell',
  email: 'ava.mitchell@university.edu',
  role: 'student' as const,
};

export const mockProjects: ProjectSummary[] = [
  {
    id: 'project1',
    name: 'CSC Innovation Award — Group Contribution Study',
    subject: 'Computer Science',
    deadline: '2026-09-23',
    status: 'active',
    memberCount: 4,
    sourceCount: 3,
    userContributionShare: 42,
    members,
  },
  {
    id: 'project2',
    name: 'History Essay — Colonialism',
    subject: 'History',
    deadline: '2026-09-20',
    status: 'active',
    memberCount: 3,
    sourceCount: 1,
    userContributionShare: 51,
    members: members.slice(0, 3),
  },
  {
    id: 'project3',
    name: 'Biology Lab Report',
    subject: 'Biology',
    deadline: '2026-08-30',
    status: 'completed',
    memberCount: 4,
    sourceCount: 2,
    userContributionShare: 29,
    members,
  },
];

export const mockCoachSuggestions: CoachSuggestion[] = [
  {
    id: 'cs1',
    memberId: 'pm-4',
    memberName: 'Marcus Chen',
    currentScore: 12,
    dominantCategory: 'Coordination',
    gapCategory: 'Core writing',
    specificTask: 'the discussion and conclusion',
    daysRemaining: 8,
  },
  {
    id: 'cs2',
    memberId: 'pm-3',
    memberName: 'Sofia Lindgren',
    currentScore: 17,
    dominantCategory: 'Design',
    gapCategory: 'Research',
    specificTask: 'literature review and citations',
    daysRemaining: 8,
  },
  {
    id: 'cs3',
    memberId: 'pm-1',
    memberName: 'Ava Mitchell',
    currentScore: 42,
    dominantCategory: 'Core writing',
    gapCategory: 'Coordination',
    specificTask: 'final submission checklist',
    daysRemaining: 8,
  },
];

export const mockOfflineLogs: OfflineLog[] = [
  {
    id: 'ol1',
    userId: 'u-1',
    projectId: project.id,
    description:
      'Led the 2-hour planning meeting on Wednesday to finalise argument structure for section 3.',
    hours: 2,
    date: '2026-09-10',
    category: 'Meeting',
    corroboratedBy: ['u-2', 'u-3'],
    status: 'corroborated',
    createdAt: '2026-09-10T20:00:00Z',
  },
  {
    id: 'ol2',
    userId: 'u-1',
    projectId: project.id,
    description:
      'Whiteboard session — drew out the data flow diagram used in the methodology section.',
    hours: 1.5,
    date: '2026-09-08',
    category: 'Brainstorming',
    corroboratedBy: [],
    status: 'unverified',
    createdAt: '2026-09-08T17:00:00Z',
  },
];

// ─── Auth (current user) ──────────────────────────────────────────────────────
export const mockCurrentUser = {
  id: 'u-1',
  name: 'Ava Mitchell',
  email: 'ava.mitchell@university.edu',
  role: 'student' as const,
  school: 'SMA Negeri 1 Jakarta',
  grade: 'Grade 12',
  avatarInitials: 'AM',
  createdAt: '2026-09-01T08:00:00Z',
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    type: 'invitation',
    projectId: 'project4',
    projectName: 'Chemistry Lab Report',
    message: 'Sinta Maulida invited you to join Chemistry Lab Report.',
    actionLabel: 'View invitation',
    actionRoute: '/invite/token-abc123',
    isRead: false,
    createdAt: '2026-09-14T10:30:00Z',
  },
  {
    id: 'notif2',
    type: 'corroboration_request',
    projectId: 'project1',
    projectName: 'CSC Innovation Award — Group Contribution Study',
    message: 'Daniel Okonkwo is asking you to confirm their meeting contribution.',
    actionLabel: 'Review request',
    actionRoute: '/projects/project1/offline-log?review=corr1',
    isRead: false,
    createdAt: '2026-09-13T15:45:00Z',
  },
  {
    id: 'notif3',
    type: 'early_warning',
    projectId: 'project1',
    projectName: 'CSC Innovation Award — Group Contribution Study',
    message: 'Contribution imbalance detected — Coach Mode has suggestions.',
    actionLabel: 'Open Coach Mode',
    actionRoute: '/projects/project1/coach',
    isRead: true,
    createdAt: '2026-09-12T09:00:00Z',
  },
  {
    id: 'notif4',
    type: 'dispute_resolved',
    projectId: 'project3',
    projectName: 'Biology Lab Report',
    message: 'Your dispute was reviewed. Your teacher left a note.',
    actionLabel: 'See result',
    actionRoute: '/projects/project3/disputes',
    isRead: true,
    createdAt: '2026-09-10T14:00:00Z',
  },
];

// ─── Invitations ──────────────────────────────────────────────────────────────
export const mockInvitations: Invitation[] = [
  {
    id: 'inv1',
    token: 'token-abc123',
    projectId: 'project4',
    projectName: 'Chemistry Lab Report',
    invitedByName: 'Sinta Maulida',
    invitedByAvatarInitials: 'SM',
    invitedEmail: 'ava.mitchell@university.edu',
    role: 'member',
    status: 'pending',
    expiresAt: '2026-09-21T10:30:00Z',
    createdAt: '2026-09-14T10:30:00Z',
  },
];

// ─── Member consent ───────────────────────────────────────────────────────────
export const mockMemberConsents: MemberConsent[] = [
  { memberId: 'pm-1', memberName: 'Ava Mitchell', memberAvatarInitials: 'AM', status: 'accepted', consentedAt: '2026-09-02T09:00:00Z' },
  { memberId: 'pm-2', memberName: 'Daniel Okonkwo', memberAvatarInitials: 'DO', status: 'accepted', consentedAt: '2026-09-02T11:30:00Z' },
  { memberId: 'pm-3', memberName: 'Sofia Lindgren', memberAvatarInitials: 'SL', status: 'pending' },
  { memberId: 'pm-4', memberName: 'Marcus Chen', memberAvatarInitials: 'MC', status: 'pending' },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const mockTasks: ProjectTask[] = [
  {
    id: 'task1',
    projectId: 'project1',
    title: 'Write conclusion section',
    assignedToMemberId: 'pm-2',
    assignedToMemberName: 'Daniel Okonkwo',
    status: 'open',
    createdByMemberId: 'pm-1',
    createdAt: '2026-09-12T10:00:00Z',
    dueDate: '2026-09-28',
    fromCoachSuggestion: true,
  },
  {
    id: 'task2',
    projectId: 'project1',
    title: 'Design slide layout and figures',
    assignedToMemberId: 'pm-3',
    assignedToMemberName: 'Sofia Lindgren',
    status: 'in_progress',
    createdByMemberId: 'pm-1',
    createdAt: '2026-09-11T08:00:00Z',
    dueDate: '2026-09-25',
    fromCoachSuggestion: true,
  },
  {
    id: 'task3',
    projectId: 'project1',
    title: 'Compile literature review citations',
    assignedToMemberId: 'pm-4',
    assignedToMemberName: 'Marcus Chen',
    status: 'open',
    createdByMemberId: 'pm-1',
    createdAt: '2026-09-13T14:00:00Z',
    fromCoachSuggestion: false,
  },
  {
    id: 'task4',
    projectId: 'project1',
    title: 'Write introduction and abstract',
    assignedToMemberId: 'pm-1',
    assignedToMemberName: 'Ava Mitchell',
    status: 'done',
    createdByMemberId: 'pm-1',
    createdAt: '2026-09-05T09:00:00Z',
    dueDate: '2026-09-15',
    fromCoachSuggestion: false,
  },
];

// ─── Corroboration requests ───────────────────────────────────────────────────
export const mockCorroborationRequests: CorroborationRequest[] = [
  {
    id: 'corr1',
    logId: 'ol3',
    requestingMemberId: 'pm-2',
    requestingMemberName: 'Daniel Okonkwo',
    targetMemberId: 'pm-1',
    description: 'We had a 1-hour discussion about the data architecture on Monday evening.',
    hours: 1,
    date: '2026-09-13',
    status: 'pending',
  },
];

// ─── Extended coach suggestions ───────────────────────────────────────────────
export const mockCoachSuggestionsExtended: CoachSuggestion[] = [
  {
    id: 'cs1',
    memberId: 'pm-4',
    memberName: 'Marcus Chen',
    memberAvatarInitials: 'MC',
    currentScore: 12,
    dominantCategory: 'Coordination',
    gapCategory: 'Core writing',
    specificTask: 'the discussion and conclusion',
    daysRemaining: 8,
    isDismissed: false,
    isDiscussed: false,
  },
  {
    id: 'cs2',
    memberId: 'pm-3',
    memberName: 'Sofia Lindgren',
    memberAvatarInitials: 'SL',
    currentScore: 17,
    dominantCategory: 'Design',
    gapCategory: 'Research',
    specificTask: 'literature review and citations',
    daysRemaining: 8,
    isDismissed: false,
    isDiscussed: false,
  },
  {
    id: 'cs3',
    memberId: 'pm-1',
    memberName: 'Ava Mitchell',
    memberAvatarInitials: 'AM',
    currentScore: 42,
    dominantCategory: 'Core writing',
    gapCategory: 'Coordination',
    specificTask: 'final submission checklist',
    daysRemaining: 8,
    isDismissed: false,
    isDiscussed: false,
  },
];

// ─── Collusion flags ──────────────────────────────────────────────────────────
export const mockCollusionFlags: CollusionFlag[] = [
  {
    id: 'cf1',
    projectId: 'project1',
    memberAId: 'pm-2',
    memberAName: 'Daniel Okonkwo',
    memberBId: 'pm-3',
    memberBName: 'Sofia Lindgren',
    styleScore: 0.81,
    temporalScore: 0.76,
    combinedScore: 0.79,
    flaggedAt: '2026-09-12T06:00:00Z',
    reviewRequired: true,
  },
];

// ─── Score audit log ──────────────────────────────────────────────────────────
export const mockScoreAuditLog: ScoreAuditEntry[] = [
  {
    id: 'sa1',
    memberId: 'pm-1',
    projectId: 'project1',
    previousScore: 38,
    newScore: 42,
    trigger: '4 new edits across 2 active sessions shifted the relative distribution.',
    changedAt: '2026-09-14T09:23:00Z',
  },
  {
    id: 'sa2',
    memberId: 'pm-1',
    projectId: 'project1',
    previousScore: 31,
    newScore: 38,
    trigger: '3 new edits from Daniel Okonkwo and Sofia Lindgren shifted the relative distribution.',
    changedAt: '2026-09-12T16:45:00Z',
  },
];

// ─── Contribution history ─────────────────────────────────────────────────────
export const mockContributionHistory: ContributionHistoryEntry[] = [
  { projectId: 'project3', projectName: 'Biology Lab Report', subject: 'Biology', deadline: '2026-08-30', finalScore: 29, rank: 3, teamSize: 4, status: 'finalised' },
  { projectId: 'project1', projectName: 'CSC Innovation Award', subject: 'Computer Science', deadline: '2026-09-23', finalScore: 42, rank: 1, teamSize: 4, status: 'active' },
  { projectId: 'project2', projectName: 'History Essay — Colonialism', subject: 'History', deadline: '2026-09-20', finalScore: 51, rank: 1, teamSize: 3, status: 'active' },
];

// ─── Teacher: all supervised projects ─────────────────────────────────────────
export const mockTeacherProjects: TeacherProjectSummary[] = [
  {
    projectId: 'project1',
    projectName: 'CSC Innovation Award — Group Contribution Study',
    subject: 'Computer Science',
    deadline: '2026-09-23',
    teamSize: 4,
    status: 'active',
    hasImbalance: true,
    hasOpenDisputes: true,
    hasCollusionFlags: true,
    pendingConsentCount: 2,
  },
  {
    projectId: 'project2',
    projectName: 'History Essay — Colonialism',
    subject: 'History',
    deadline: '2026-09-20',
    teamSize: 3,
    status: 'active',
    hasImbalance: false,
    hasOpenDisputes: false,
    hasCollusionFlags: false,
    pendingConsentCount: 0,
  },
  {
    projectId: 'project3',
    projectName: 'Biology Lab Report',
    subject: 'Biology',
    deadline: '2026-08-30',
    teamSize: 4,
    status: 'finalised',
    hasImbalance: false,
    hasOpenDisputes: false,
    hasCollusionFlags: false,
    pendingConsentCount: 0,
  },
];

