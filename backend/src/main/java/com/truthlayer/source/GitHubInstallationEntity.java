package com.truthlayer.source;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "github_installations")
public class GitHubInstallationEntity {
    @Id private UUID id;
    @Column(name = "installation_id", nullable = false, unique = true) private long installationId;
    @Column(name = "project_id") private UUID projectId;
    @Column(name = "connected_by", nullable = false) private UUID connectedBy;
    @Column(name = "account_id") private Long accountId;
    @Column(name = "account_login") private String accountLogin;
    @Column(nullable = false) private String status;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected GitHubInstallationEntity() {}

    public GitHubInstallationEntity(long installationId, UUID projectId, UUID connectedBy, Long accountId, String accountLogin) {
        this.id = UUID.randomUUID();
        this.installationId = installationId;
        this.projectId = projectId;
        this.connectedBy = connectedBy;
        this.accountId = accountId;
        this.accountLogin = accountLogin;
        this.status = "ACTIVE";
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public UUID getId() { return id; }
    public long getInstallationId() { return installationId; }
    public UUID getProjectId() { return projectId; }
    public UUID getConnectedBy() { return connectedBy; }
    public String getStatus() { return status; }
    public void updateAccount(Long id, String login) { this.accountId = id; this.accountLogin = login; this.status = "ACTIVE"; this.updatedAt = Instant.now(); }
    public void activate() { this.status = "ACTIVE"; this.updatedAt = Instant.now(); }
    public void suspend() { this.status = "SUSPENDED"; this.updatedAt = Instant.now(); }
    public void delete() { this.status = "DELETED"; this.updatedAt = Instant.now(); }
}
