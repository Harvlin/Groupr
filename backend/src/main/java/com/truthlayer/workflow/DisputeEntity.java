package com.truthlayer.workflow;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "disputes")
public class DisputeEntity {
    @Id private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(nullable = false) private String reason;
    @Column(nullable = false) private String status;
    @Column private String resolution;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "resolved_at") private Instant resolvedAt;
    protected DisputeEntity() {}
    public DisputeEntity(UUID projectId, UUID userId, String reason) { this.id = UUID.randomUUID(); this.projectId = projectId; this.userId = userId; this.reason = reason; this.status = "OPEN"; this.createdAt = Instant.now(); }
    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public UUID getUserId() { return userId; }
    public String getReason() { return reason; }
    public String getStatus() { return status; }
    public String getResolution() { return resolution; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void resolve(String resolution) { this.status = "RESOLVED"; this.resolution = resolution; this.resolvedAt = Instant.now(); }
}
