package com.truthlayer.workflow;

import com.truthlayer.membership.ProjectMemberRepository;
import com.truthlayer.project.ProjectService;
import com.truthlayer.user.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkflowService {
    private final ProjectService projects;
    private final OfflineLogRepository logs;
    private final CorroborationRequestRepository corroborations;
    private final DisputeRepository disputes;
    private final NotificationRepository notifications;
    private final ProjectMemberRepository members;
    private final UserRepository users;

    public WorkflowService(ProjectService projects, OfflineLogRepository logs, CorroborationRequestRepository corroborations, DisputeRepository disputes, NotificationRepository notifications, ProjectMemberRepository members, UserRepository users) {
        this.projects = projects; this.logs = logs; this.corroborations = corroborations; this.disputes = disputes; this.notifications = notifications; this.members = members; this.users = users;
    }

    @Transactional(readOnly = true)
    public List<WorkflowDtos.OfflineResponse> listLogs(UUID userId, UUID projectId) { projects.get(userId, projectId); return logs.findByProjectIdOrderByDateDesc(projectId).stream().map(this::offline).toList(); }
    @Transactional
    public WorkflowDtos.OfflineResponse createLog(UUID userId, UUID projectId, WorkflowDtos.OfflineCreateRequest request) { projects.get(userId, projectId); if (request.date() == null || request.date().isAfter(LocalDate.now())) throw new IllegalArgumentException("Offline work date must not be in the future"); return offline(logs.save(new OfflineLogEntity(projectId, userId, request.description(), request.hours(), request.date(), request.category()))); }
    @Transactional
    public void deleteLog(UUID userId, UUID logId) { var log = logs.findById(logId).orElseThrow(() -> new IllegalArgumentException("Offline log not found")); projects.get(userId, log.getProjectId()); if (!log.getUserId().equals(userId)) throw new SecurityException("Only the log owner can delete it"); logs.delete(log); }
    @Transactional(readOnly = true)
    public List<WorkflowDtos.CorroborationResponse> listCorroborations(UUID userId, UUID projectId) { projects.get(userId, projectId); var ids = logs.findByProjectIdOrderByDateDesc(projectId).stream().map(OfflineLogEntity::getId).toList(); return corroborations.findByLogIdIn(ids).stream().map(this::corroboration).toList(); }
    @Transactional
    public WorkflowDtos.CorroborationResponse respond(UUID userId, UUID requestId, boolean confirmed) { var request = corroborations.findById(requestId).orElseThrow(() -> new IllegalArgumentException("Corroboration request not found")); if (!members.findById(request.getTargetMemberId()).map(member -> member.getUserId().equals(userId)).orElse(false)) throw new SecurityException("Only the target member can respond"); request.respond(confirmed); if (confirmed) logs.findById(request.getLogId()).ifPresent(OfflineLogEntity::corroborate); return corroboration(request); }
    @Transactional(readOnly = true)
    public List<WorkflowDtos.DisputeResponse> listDisputes(UUID userId, UUID projectId) { projects.get(userId, projectId); return disputes.findByProjectIdOrderByCreatedAtDesc(projectId).stream().map(this::dispute).toList(); }
    @Transactional
    public WorkflowDtos.DisputeResponse createDispute(UUID userId, UUID projectId, WorkflowDtos.DisputeCreateRequest request) { projects.get(userId, projectId); return dispute(disputes.save(new DisputeEntity(projectId, userId, request.reason()))); }
    @Transactional
    public WorkflowDtos.DisputeResponse resolveDispute(UUID userId, UUID disputeId, WorkflowDtos.DisputeResolveRequest request) { var dispute = disputes.findById(disputeId).orElseThrow(() -> new IllegalArgumentException("Dispute not found")); projects.get(userId, dispute.getProjectId()); if (!users.findById(userId).map(user -> "TEACHER".equals(user.getRole().name())).orElse(false)) throw new SecurityException("Only teachers can resolve disputes"); dispute.resolve(request.resolution()); return dispute(disputes.save(dispute)); }
    @Transactional(readOnly = true)
    public List<WorkflowDtos.NotificationResponse> notifications(UUID userId) { return notifications.findByRecipientIdOrderByCreatedAtDesc(userId).stream().map(this::notification).toList(); }
    @Transactional public void markNotificationRead(UUID userId, UUID notificationId) { var notification = notifications.findById(notificationId).orElseThrow(() -> new IllegalArgumentException("Notification not found")); if (!notificationRecipient(notification, userId)) throw new SecurityException("Notification does not belong to this user"); notification.markRead(); }
    @Transactional public void markAllRead(UUID userId) { notifications.findByRecipientIdOrderByCreatedAtDesc(userId).forEach(NotificationEntity::markRead); }

    private boolean notificationRecipient(NotificationEntity notification, UUID userId) { return notification.getRecipientId().equals(userId); }
    private WorkflowDtos.OfflineResponse offline(OfflineLogEntity log) { var confirmed = corroborations.findByLogIdIn(List.of(log.getId())).stream().filter(value -> "CONFIRMED".equals(value.getStatus())).map(value -> value.getTargetMemberId().toString()).toList(); return new WorkflowDtos.OfflineResponse(log.getId(), log.getUserId(), log.getProjectId(), log.getDescription(), log.getHours(), log.getDate(), log.getCategory(), confirmed, log.getStatus().toLowerCase(), log.getCreatedAt()); }
    private WorkflowDtos.CorroborationResponse corroboration(CorroborationRequestEntity value) { return new WorkflowDtos.CorroborationResponse(value.getId(), value.getLogId(), value.getRequestingMemberId(), value.getTargetMemberId(), value.getDescription(), value.getHours(), value.getDate(), value.getStatus().toLowerCase()); }
    private WorkflowDtos.DisputeResponse dispute(DisputeEntity value) { return new WorkflowDtos.DisputeResponse(value.getId(), value.getProjectId(), value.getUserId(), value.getReason(), value.getStatus().toLowerCase(), value.getResolution(), value.getCreatedAt(), value.getResolvedAt()); }
    private WorkflowDtos.NotificationResponse notification(NotificationEntity value) { return new WorkflowDtos.NotificationResponse(value.getId(), value.getType().toLowerCase(), value.getProjectId(), value.getProjectName(), value.getMessage(), value.getActionLabel(), value.getActionRoute(), value.isRead(), value.getCreatedAt()); }
}
