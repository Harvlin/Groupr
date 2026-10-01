package com.truthlayer.project;

import com.truthlayer.membership.MembershipRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class ProjectDtos {
    private ProjectDtos() {}

    public record CreateRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 160) String subject,
        String description,
        Instant deadline
    ) {}

    public record UpdateRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 160) String subject,
        String description,
        Instant deadline
    ) {}

    public record ProjectResponse(
        UUID id,
        String name,
        String subject,
        String description,
        UUID createdBy,
        Instant createdAt,
        Instant deadline,
        ProjectStatus status,
        int memberCount,
        int sourceCount
    ) {}

    public record MemberResponse(
        UUID id,
        UUID userId,
        String name,
        String email,
        MembershipRole role,
        Instant joinedAt
    ) {}

    public record InviteRequest(@jakarta.validation.constraints.Email String email, MembershipRole role) {}

    public record InviteResponse(UUID id, UUID projectId, String email, MembershipRole role, String token, Instant expiresAt, String status) {}
}
