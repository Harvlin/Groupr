package com.truthlayer.source;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "source_credentials")
public class SourceCredentialEntity {
    @Id @Column(name = "source_id") private UUID sourceId;
    @Column(name = "encrypted_access_token") private String encryptedAccessToken;
    @Column(name = "encrypted_refresh_token") private String encryptedRefreshToken;
    @Column private String scopes;
    @Column(name = "expires_at") private Instant expiresAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    protected SourceCredentialEntity() {}
    public SourceCredentialEntity(UUID sourceId, String accessToken, String refreshToken, String scopes, Instant expiresAt) { this.sourceId = sourceId; this.encryptedAccessToken = accessToken; this.encryptedRefreshToken = refreshToken; this.scopes = scopes; this.expiresAt = expiresAt; this.updatedAt = Instant.now(); }
    public UUID getSourceId() { return sourceId; }
    public String getEncryptedAccessToken() { return encryptedAccessToken; }
    public String getEncryptedRefreshToken() { return encryptedRefreshToken; }
    public Instant getExpiresAt() { return expiresAt; }
}
