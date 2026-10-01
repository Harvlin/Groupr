package com.truthlayer.scoring;

import com.truthlayer.project.ProjectDtos;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class ScoringDtos {
    private ScoringDtos() {}

    public record Rationale(String content_share, String temporal_note, String session_note, List<String> flags, String confidence_reason) {}
    public record ScoreResponse(UUID id, UUID projectId, UUID userId, double rawScore, double finalPercentage, String confidenceLevel, Rationale rationale, Double manualOverridePercentage, String overrideReason, Instant computedAt) {}
    public record CategoryBreakdown(String category, double value, double percentage) {}
    public record EventResponse(UUID id, UUID projectId, UUID sourceId, String userId, String externalUserRef, Instant timestamp, String eventType, int charDeltaRaw, int uniqueContentDelta, String category, String timeBucket, boolean possiblyAiGenerated, boolean flaggedDuplicate, String fileOrSection) {}
    public record DashboardResponse(ProjectDtos.ProjectResponse project, List<ProjectDtos.MemberResponse> members, ScoreResponse score, List<CategoryBreakdown> categoryBreakdown, Map<String, Double> bucketBreakdown, int sessionCount, double teamAverage, boolean hasPendingDispute) {}
    public record TeacherReportResponse(ProjectDtos.ProjectResponse project, List<ScoreResponse> scores, List<ProjectDtos.MemberResponse> members, List<EventResponse> events, List<Object> disputes) {}
    public record OverrideRequest(double percentage, String reason) {}
    public record AuditResponse(UUID id, UUID projectId, String action, UUID actorId, String entityType, UUID entityId, String beforeJson, String afterJson, Instant createdAt) {}
}
