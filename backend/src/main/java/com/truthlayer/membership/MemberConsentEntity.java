package com.truthlayer.membership;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "member_consents")
public class MemberConsentEntity {
    public enum Status { PENDING, ACCEPTED, DECLINED }
    @Id private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "source_id") private UUID sourceId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status;
    @Column(name = "consented_at") private Instant consentedAt;
    @Column(name = "revoked_at") private Instant revokedAt;
    protected MemberConsentEntity() {}
    public MemberConsentEntity(UUID projectId, UUID userId, UUID sourceId, Status status) { this.id = UUID.randomUUID(); this.projectId = projectId; this.userId = userId; this.sourceId = sourceId; this.status = status; if (status == Status.ACCEPTED) this.consentedAt = Instant.now(); }
    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public UUID getUserId() { return userId; }
    public UUID getSourceId() { return sourceId; }
    public Status getStatus() { return status; }
    public Instant getConsentedAt() { return consentedAt; }
    public Instant getRevokedAt() { return revokedAt; }
    public void accept() { status = Status.ACCEPTED; consentedAt = Instant.now(); revokedAt = null; }
    public void decline() { status = Status.DECLINED; revokedAt = Instant.now(); }
}
