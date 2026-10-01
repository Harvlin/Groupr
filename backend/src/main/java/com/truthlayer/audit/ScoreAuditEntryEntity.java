package com.truthlayer.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "score_audit_entries")
public class ScoreAuditEntryEntity {
    @Id private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(nullable = false, length = 80) private String action;
    @Column(name = "actor_id") private UUID actorId;
    @Column(name = "entity_type", nullable = false, length = 80) private String entityType;
    @Column(name = "entity_id", nullable = false) private UUID entityId;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "before_json", columnDefinition = "jsonb") private String beforeJson;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "after_json", columnDefinition = "jsonb") private String afterJson;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    protected ScoreAuditEntryEntity() {}
    public ScoreAuditEntryEntity(UUID projectId, String action, UUID actorId, String entityType, UUID entityId, String beforeJson, String afterJson) { this.id = UUID.randomUUID(); this.projectId = projectId; this.action = action; this.actorId = actorId; this.entityType = entityType; this.entityId = entityId; this.beforeJson = beforeJson; this.afterJson = afterJson; this.createdAt = Instant.now(); }
    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public String getAction() { return action; }
    public UUID getActorId() { return actorId; }
    public String getEntityType() { return entityType; }
    public UUID getEntityId() { return entityId; }
    public String getBeforeJson() { return beforeJson; }
    public String getAfterJson() { return afterJson; }
    public Instant getCreatedAt() { return createdAt; }
}
