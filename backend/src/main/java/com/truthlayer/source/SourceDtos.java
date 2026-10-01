package com.truthlayer.source;

import com.truthlayer.membership.MemberConsentEntity;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public final class SourceDtos {
    private SourceDtos() {}
    public record ConnectRequest(@NotBlank String externalId) {}
    public record SourceResponse(UUID id, UUID projectId, String sourceType, String externalId, UUID connectedBy, boolean consentConfirmed, String status, Instant connectedAt, Instant lastSyncedAt) {}
    public record SyncResponse(UUID id, UUID sourceId, String status, Instant startedAt, Instant completedAt, String errorCode) {}
    public record ConsentRequest(UUID sourceId, MemberConsentEntity.Status status) {}
    public record ConsentResponse(UUID id, UUID projectId, UUID userId, UUID sourceId, String memberName, String memberAvatarInitials, String status, Instant consentedAt, Instant revokedAt) {}
}
