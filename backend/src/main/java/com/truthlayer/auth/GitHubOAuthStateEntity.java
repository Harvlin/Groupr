package com.truthlayer.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "github_oauth_states")
public class GitHubOAuthStateEntity {
    @Id private UUID id;
    @Column(name = "state_hash", nullable = false, unique = true, length = 128) private String stateHash;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(name = "consumed_at") private Instant consumedAt;

    protected GitHubOAuthStateEntity() {}
    public GitHubOAuthStateEntity(String stateHash, UUID userId, UUID projectId, Instant expiresAt) { this.id = UUID.randomUUID(); this.stateHash = stateHash; this.userId = userId; this.projectId = projectId; this.expiresAt = expiresAt; }
    public UUID getUserId() { return userId; }
    public UUID getProjectId() { return projectId; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isConsumed() { return consumedAt != null; }
    public void consume() { consumedAt = Instant.now(); }
}
