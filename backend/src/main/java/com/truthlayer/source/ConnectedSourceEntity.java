package com.truthlayer.source;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "connected_sources")
public class ConnectedSourceEntity {
    @Id private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 32) private SourceProvider provider;
    @Column(name = "external_id", nullable = false, length = 500) private String externalId;
    @Column(name = "connected_by", nullable = false) private UUID connectedBy;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private SourceStatus status;
    @Column(name = "consent_confirmed", nullable = false) private boolean consentConfirmed;
    @Column(name = "connected_at", nullable = false) private Instant connectedAt;
    @Column(name = "last_synced_at") private Instant lastSyncedAt;
    @Column(name = "sync_cursor", length = 500) private String syncCursor;
    @Column(name = "installation_id") private Long installationId;

    protected ConnectedSourceEntity() {}

    public ConnectedSourceEntity(UUID projectId, SourceProvider provider, String externalId, UUID connectedBy) {
        this.id = UUID.randomUUID();
        this.projectId = projectId;
        this.provider = provider;
        this.externalId = externalId;
        this.connectedBy = connectedBy;
        this.status = SourceStatus.CONNECTED;
        this.connectedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public SourceProvider getProvider() { return provider; }
    public String getExternalId() { return externalId; }
    public UUID getConnectedBy() { return connectedBy; }
    public SourceStatus getStatus() { return status; }
    public boolean isConsentConfirmed() { return consentConfirmed; }
    public Instant getConnectedAt() { return connectedAt; }
    public Instant getLastSyncedAt() { return lastSyncedAt; }
    public String getSyncCursor() { return syncCursor; }
    public Long getInstallationId() { return installationId; }
    public void attachInstallation(long installationId) { this.installationId = installationId; }
    public void confirmConsent() { this.consentConfirmed = true; }
    public void disconnect() { this.status = SourceStatus.DISCONNECTED; }
    public void startSync() { this.status = SourceStatus.SYNCING; }
    public void completeSync(String cursor) { this.status = SourceStatus.CONNECTED; this.lastSyncedAt = Instant.now(); this.syncCursor = cursor; }
    public void failSync() { this.status = SourceStatus.ERROR; }
}
