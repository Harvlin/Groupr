package com.truthlayer.task;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class TaskEntity {
    public enum Status { OPEN, IN_PROGRESS, DONE }
    @Id private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(nullable = false, length = 240) private String title;
    @Column private String description;
    @Column(name = "assigned_to_member_id") private UUID assignedToMemberId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status;
    @Column(name = "created_by_member_id") private UUID createdByMemberId;
    @Column(name = "due_date") private Instant dueDate;
    @Column(name = "from_coach_suggestion", nullable = false) private boolean fromCoachSuggestion;
    @Column(nullable = false, length = 40) private String source;
    @Column(name = "external_id") private String externalId;
    @Column(name = "external_url") private String externalUrl;
    @Column(name = "external_status") private String externalStatus;
    @Column(name = "external_updated_at") private Instant externalUpdatedAt;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    protected TaskEntity() {}
    public TaskEntity(UUID projectId, String title, String description, UUID assignedToMemberId, UUID createdByMemberId, Instant dueDate, boolean fromCoachSuggestion) { this.id = UUID.randomUUID(); this.projectId = projectId; this.title = title; this.description = description; this.assignedToMemberId = assignedToMemberId; this.createdByMemberId = createdByMemberId; this.dueDate = dueDate; this.fromCoachSuggestion = fromCoachSuggestion; this.status = Status.OPEN; this.source = "TRUTH_LAYER"; this.createdAt = Instant.now(); }
    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public UUID getAssignedToMemberId() { return assignedToMemberId; }
    public Status getStatus() { return status; }
    public UUID getCreatedByMemberId() { return createdByMemberId; }
    public Instant getDueDate() { return dueDate; }
    public boolean isFromCoachSuggestion() { return fromCoachSuggestion; }
    public Instant getCreatedAt() { return createdAt; }
    public void updateStatus(Status status) { this.status = status; }
}
