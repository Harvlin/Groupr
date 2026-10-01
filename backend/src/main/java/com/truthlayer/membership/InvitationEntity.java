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
@Table(name = "project_invitations")
public class InvitationEntity {
    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false, length = 320)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MembershipRole role;

    @Column(name = "token_hash", nullable = false, unique = true, length = 128)
    private String tokenHash;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected InvitationEntity() {
    }

    public InvitationEntity(UUID projectId, String email, MembershipRole role, String tokenHash, Instant expiresAt) {
        this.id = UUID.randomUUID();
        this.projectId = projectId;
        this.email = email;
        this.role = role;
        this.tokenHash = tokenHash;
        this.status = "PENDING";
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public String getEmail() { return email; }
    public MembershipRole getRole() { return role; }
    public String getStatus() { return status; }
    public Instant getExpiresAt() { return expiresAt; }

    public void accept() { this.status = "ACCEPTED"; }
    public void decline() { this.status = "DECLINED"; }
    public void expire() { this.status = "EXPIRED"; }
}
