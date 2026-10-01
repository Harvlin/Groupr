package com.truthlayer.workflow;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class WorkflowDtos {
    private WorkflowDtos() {}
    public record OfflineCreateRequest(@NotBlank String description, @Positive double hours, LocalDate date, @NotBlank String category) {}
    public record OfflineResponse(UUID id, UUID userId, UUID projectId, String description, double hours, LocalDate date, String category, List<String> corroboratedBy, String status, Instant createdAt) {}
    public record CorroborationResponse(UUID id, UUID logId, UUID requestingMemberId, UUID targetMemberId, String description, double hours, LocalDate date, String status) {}
    public record DisputeCreateRequest(@NotBlank String reason) {}
    public record DisputeResolveRequest(@NotBlank String resolution, String status) {}
    public record DisputeResponse(UUID id, UUID projectId, UUID userId, String reason, String status, String resolution, Instant createdAt, Instant resolvedAt) {}
    public record NotificationResponse(UUID id, String type, UUID projectId, String projectName, String message, String actionLabel, String actionRoute, boolean isRead, Instant createdAt) {}
}
