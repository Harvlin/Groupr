package com.truthlayer.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "google_oauth_states")
public class GoogleOAuthStateEntity {
    @Id private UUID id;
    @Column(name = "state_hash", nullable = false, unique = true) private String stateHash;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "external_id", nullable = false) private String externalId;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(name = "consumed_at") private Instant consumedAt;
    protected GoogleOAuthStateEntity() {}
    public GoogleOAuthStateEntity(String stateHash, UUID userId, UUID projectId, String externalId, Instant expiresAt) { this.id = UUID.randomUUID(); this.stateHash = stateHash; this.userId = userId; this.projectId = projectId; this.externalId = externalId; this.expiresAt = expiresAt; }
    public UUID getUserId() { return userId; }
    public UUID getProjectId() { return projectId; }
    public String getExternalId() { return externalId; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean consumed() { return consumedAt != null; }
    public void consume() { consumedAt = Instant.now(); }
}