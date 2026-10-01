package com.truthlayer.workflow;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class NotificationEntity {
    @Id private UUID id;
    @Column(name = "recipient_id", nullable = false) private UUID recipientId;
    @Column(name = "project_id") private UUID projectId;
    @Column(nullable = false) private String type;
    @Column(name = "project_name") private String projectName;
    @Column(nullable = false) private String message;
    @Column(name = "action_label") private String actionLabel;
    @Column(name = "action_route") private String actionRoute;
    @Column(name = "is_read", nullable = false) private boolean read;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    protected NotificationEntity() {}
    public NotificationEntity(UUID recipientId, UUID projectId, String type, String projectName, String message, String actionLabel, String actionRoute) { this.id = UUID.randomUUID(); this.recipientId = recipientId; this.projectId = projectId; this.type = type; this.projectName = projectName; this.message = message; this.actionLabel = actionLabel; this.actionRoute = actionRoute; this.createdAt = Instant.now(); }
    public UUID getId() { return id; }
    public UUID getRecipientId() { return recipientId; }
    public UUID getProjectId() { return projectId; }
    public String getType() { return type; }
    public String getProjectName() { return projectName; }
    public String getMessage() { return message; }
    public String getActionLabel() { return actionLabel; }
    public String getActionRoute() { return actionRoute; }
    public boolean isRead() { return read; }
    public Instant getCreatedAt() { return createdAt; }
    public void markRead() { read = true; }
}
