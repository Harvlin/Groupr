package com.truthlayer.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 320) String email,
        @NotBlank @Size(min = 8, max = 128) String password,
        String role,
        @Size(max = 160) String school,
        @Size(max = 80) String grade
    ) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record AuthResponse(
        String token,
        UUID id,
        String name,
        String email,
        String role,
        String school,
        String grade,
        String avatarInitials,
        Instant createdAt
    ) {}
}
