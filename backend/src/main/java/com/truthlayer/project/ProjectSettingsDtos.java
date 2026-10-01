package com.truthlayer.project;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public final class ProjectSettingsDtos {
    private ProjectSettingsDtos() {}

    public record Response(UUID projectId, String expectedDistribution, String customDistribution, String language, boolean allowOfflineLog, int autoWarnThreshold) {}

    public record UpdateRequest(String expectedDistribution, String customDistribution, @NotBlank String language, boolean allowOfflineLog, @Min(0) @Max(100) int autoWarnThreshold) {}
}
