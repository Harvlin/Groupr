package com.truthlayer.task;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public final class TaskDtos {
    private TaskDtos() {}
    public record CreateRequest(@NotBlank String title, String description, UUID assignedToMemberId, Instant dueDate, boolean fromCoachSuggestion) {}
    public record StatusRequest(String status) {}
    public record Response(UUID id, UUID projectId, String title, String description, UUID assignedToMemberId, String status, UUID createdByMemberId, Instant createdAt, Instant dueDate, boolean fromCoachSuggestion) {}
}
