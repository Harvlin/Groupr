package com.truthlayer.scoring;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.truthlayer.audit.ScoreAuditEntryEntity;
import com.truthlayer.audit.ScoreAuditEntryRepository;
import com.truthlayer.contribution.ContributionEventEntity;
import com.truthlayer.contribution.ContributionEventRepository;
import com.truthlayer.membership.ProjectMemberEntity;
import com.truthlayer.membership.ProjectMemberRepository;
import com.truthlayer.project.ProjectDtos;
import com.truthlayer.project.ProjectEntity;
import com.truthlayer.project.ProjectService;
import com.truthlayer.user.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScoringService {
    private static final String ALGORITHM_VERSION = "normalization-v1";
    private final ProjectService projects;
    private final com.truthlayer.project.ProjectRepository projectRepository;
    private final ProjectMemberRepository members;
    private final ContributionEventRepository events;
    private final ScoreCalculationRepository calculations;
    private final ContributionScoreRepository scores;
    private final ScoreOverrideRepository overrides;
    private final ScoreAuditEntryRepository audit;
    private final UserRepository users;
    private final ObjectMapper objectMapper;

    public ScoringService(ProjectService projects, com.truthlayer.project.ProjectRepository projectRepository, ProjectMemberRepository members,
                          ContributionEventRepository events, ScoreCalculationRepository calculations, ContributionScoreRepository scores,
                          ScoreOverrideRepository overrides, ScoreAuditEntryRepository audit, UserRepository users, ObjectMapper objectMapper) {
        this.projects = projects; this.projectRepository = projectRepository; this.members = members; this.events = events;
        this.calculations = calculations; this.scores = scores; this.overrides = overrides; this.audit = audit; this.users = users; this.objectMapper = objectMapper;
    }

    @Transactional
    public List<ScoringDtos.ScoreResponse> calculate(UUID actorId, UUID projectId) {
        projects.get(actorId, projectId);
        var project = projectRepository.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project not found"));
        var previous = calculations.findTopByProjectIdOrderByCalculationVersionDesc(projectId).map(ScoreCalculationEntity::getCalculationVersion).orElse(0);
        var calculation = calculations.save(new ScoreCalculationEntity(projectId, previous + 1, ALGORITHM_VERSION));
        try {
            var memberRows = members.findByProjectIdAndLeftAtIsNull(projectId);
            var allEvents = events.findByProjectIdOrderByTimestampAsc(projectId);
            var eventsByUser = allEvents.stream().filter(event -> event.getUserId() != null).collect(Collectors.groupingBy(ContributionEventEntity::getUserId));
            var rawByUser = new LinkedHashMap<UUID, Double>();
            for (var member : memberRows) rawByUser.put(member.getUserId(), rawByUser.getOrDefault(member.getUserId(), 0d));
            for (var event : allEvents) {
                if (event.getUserId() == null) continue;
                var value = event.getUniqueContentDelta() > 0 ? event.getUniqueContentDelta() : event.getCharDeltaRaw() * 0.25;
                if (event.isFlaggedDuplicate()) value *= 0.2;
                if ("LATE".equals(event.getTimeBucket())) value *= 0.7;
                if (event.isPossiblyAiGenerated()) value *= 0.8;
                var adjustedValue = Math.max(0, value);
                rawByUser.computeIfPresent(event.getUserId(), (key, current) -> current + adjustedValue);
            }
            var total = rawByUser.values().stream().mapToDouble(Double::doubleValue).sum();
            var createdScores = new ArrayList<ContributionScoreEntity>();
            for (var member : memberRows) {
                var userEvents = eventsByUser.getOrDefault(member.getUserId(), List.of());
                var raw = rawByUser.getOrDefault(member.getUserId(), 0d);
                var percentage = total == 0 ? 0 : round(raw / total * 100);
                var rationale = rationale(member, userEvents, raw, total, project);
                var score = new ContributionScoreEntity(calculation.getId(), projectId, member.getUserId(), round(raw), percentage, confidence(userEvents, allEvents), json(rationale));
                createdScores.add(score);
            }
            scores.saveAll(createdScores);
            calculation.succeed();
            return createdScores.stream().map(this::scoreResponse).toList();
        } catch (RuntimeException exception) {
            calculation.fail();
            throw exception;
        }
    }

    @Transactional
    public List<ScoringDtos.ScoreResponse> latest(UUID actorId, UUID projectId) {
        projects.get(actorId, projectId);
        var calculation = calculations.findTopByProjectIdOrderByCalculationVersionDesc(projectId);
        if (calculation.isEmpty() || calculation.get().getStatus() != ScoreCalculationEntity.Status.SUCCEEDED) return calculate(actorId, projectId);
        return scores.findByCalculationIdOrderByFinalPercentageDesc(calculation.get().getId()).stream().map(this::scoreResponse).toList();
    }

    @Transactional
    public ScoringDtos.DashboardResponse dashboard(UUID actorId, UUID projectId) {
        var project = projects.get(actorId, projectId);
        var scoreList = latest(actorId, projectId);
        var current = scoreList.stream().filter(score -> score.userId().equals(actorId)).findFirst().orElseGet(() -> zeroScore(projectId, actorId));
        var allEvents = events.findByProjectIdOrderByTimestampAsc(projectId);
        var ownEvents = allEvents.stream().filter(event -> actorId.equals(event.getUserId())).toList();
        var categoryTotals = ownEvents.stream().filter(event -> event.getCategory() != null).collect(Collectors.groupingBy(ContributionEventEntity::getCategory, Collectors.summingDouble(this::eventValue)));
        var categoryTotal = categoryTotals.values().stream().mapToDouble(Double::doubleValue).sum();
        var categories = categoryTotals.entrySet().stream().map(entry -> new ScoringDtos.CategoryBreakdown(entry.getKey(), round(entry.getValue()), categoryTotal == 0 ? 0 : round(entry.getValue() / categoryTotal * 100))).toList();
        var bucketBreakdown = new LinkedHashMap<String, Double>();
        bucketBreakdown.put("early", round(ownEvents.stream().filter(event -> "EARLY".equals(event.getTimeBucket())).mapToDouble(this::eventValue).sum()));
        bucketBreakdown.put("middle", round(ownEvents.stream().filter(event -> "MIDDLE".equals(event.getTimeBucket())).mapToDouble(this::eventValue).sum()));
        bucketBreakdown.put("late", round(ownEvents.stream().filter(event -> "LATE".equals(event.getTimeBucket())).mapToDouble(this::eventValue).sum()));
        var teamAverage = scoreList.stream().mapToDouble(ScoringDtos.ScoreResponse::finalPercentage).average().orElse(0);
        return new ScoringDtos.DashboardResponse(project, projects.listMembers(actorId, projectId), current, categories, bucketBreakdown, sessionCount(ownEvents), round(teamAverage), false);
    }

    @Transactional
    public ScoringDtos.TeacherReportResponse teacherReport(UUID actorId, UUID projectId) {
        var project = projects.get(actorId, projectId);
        var scores = latest(actorId, projectId);
        var eventResponses = events.findByProjectIdOrderByTimestampAsc(projectId).stream().map(this::eventResponse).toList();
        return new ScoringDtos.TeacherReportResponse(project, scores, projects.listMembers(actorId, projectId), eventResponses, List.of());
    }

    @Transactional
    public ScoringDtos.ScoreResponse override(UUID actorId, UUID scoreId, ScoringDtos.OverrideRequest request) {
        if (request.reason() == null || request.reason().isBlank()) throw new IllegalArgumentException("Override reason is required");
        if (request.percentage() < 0 || request.percentage() > 100) throw new IllegalArgumentException("Percentage must be between 0 and 100");
        var score = scores.findById(scoreId).orElseThrow(() -> new IllegalArgumentException("Score not found"));
        projects.get(actorId, score.getProjectId());
        var teacher = users.findById(actorId).orElseThrow();
        if (!"TEACHER".equals(teacher.getRole().name())) throw new SecurityException("Only teachers can override scores");
        var previous = score.getFinalPercentage();
        score.override(request.percentage(), request.reason());
        scores.save(score);
        overrides.save(new ScoreOverrideEntity(score.getId(), actorId, previous, request.percentage(), request.reason()));
        audit.save(new ScoreAuditEntryEntity(score.getProjectId(), "SCORE_OVERRIDE", actorId, "CONTRIBUTION_SCORE", score.getId(), "{\"percentage\":" + previous + "}", "{\"percentage\":" + request.percentage() + "}"));
        return scoreResponse(score);
    }

    @Transactional(readOnly = true)
    public List<ScoringDtos.AuditResponse> audit(UUID actorId, UUID projectId, UUID memberId) {
        projects.get(actorId, projectId);
        var score = scores.findTopByProjectIdAndUserIdOrderByComputedAtDesc(projectId, memberId).orElseThrow(() -> new IllegalArgumentException("Score not found"));
        return audit.findByEntityIdOrderByCreatedAtDesc(score.getId()).stream().map(entry -> new ScoringDtos.AuditResponse(entry.getId(), entry.getProjectId(), entry.getAction(), entry.getActorId(), entry.getEntityType(), entry.getEntityId(), entry.getBeforeJson(), entry.getAfterJson(), entry.getCreatedAt())).toList();
    }

    private ScoringDtos.ScoreResponse zeroScore(UUID projectId, UUID userId) { return new ScoringDtos.ScoreResponse(UUID.randomUUID(), projectId, userId, 0, 0, "low", new ScoringDtos.Rationale("No observed events", "No timeline evidence", "No sessions recorded", List.of(), "No source activity has been observed yet"), null, null, Instant.now()); }
    private double eventValue(ContributionEventEntity event) { return event.getUniqueContentDelta() > 0 ? event.getUniqueContentDelta() : event.getCharDeltaRaw() * 0.25; }
    private int sessionCount(List<ContributionEventEntity> values) { var sorted = values.stream().map(ContributionEventEntity::getTimestamp).sorted().toList(); var sessions = 0; Instant previous = null; for (var current : sorted) { if (previous == null || Duration.between(previous, current).toMinutes() > 120) sessions++; previous = current; } return sessions; }
    private ConfidenceLevel confidence(List<ContributionEventEntity> userEvents, List<ContributionEventEntity> allEvents) { if (userEvents.size() >= 8 && allEvents.stream().allMatch(event -> event.getUserId() != null)) return ConfidenceLevel.HIGH; if (!userEvents.isEmpty()) return ConfidenceLevel.MEDIUM; return ConfidenceLevel.LOW; }
    private ScoringDtos.Rationale rationale(ProjectMemberEntity member, List<ContributionEventEntity> values, double raw, double total, ProjectEntity project) { var late = values.stream().filter(event -> "LATE".equals(event.getTimeBucket())).count(); var flags = new ArrayList<String>(); if (late > 0) flags.add("Late activity is weighted lower"); if (values.stream().anyMatch(ContributionEventEntity::isFlaggedDuplicate)) flags.add("Duplicate activity was discounted"); return new ScoringDtos.Rationale(round(raw / Math.max(total, 1) * 100) + "% of normalized team activity", late > values.size() / 2 ? "Most observed activity was late in the project" : "Activity was not predominantly late", sessionCount(values) + " distinct work session(s)", flags, values.isEmpty() ? "No source events were mapped to this member" : "Confidence reflects observed event volume and actor mapping"); }
    private ScoringDtos.EventResponse eventResponse(ContributionEventEntity event) { return new ScoringDtos.EventResponse(event.getId(), event.getProjectId(), event.getSourceId(), event.getUserId() == null ? "" : event.getUserId().toString(), event.getExternalUserRef(), event.getTimestamp(), event.getEventType().toLowerCase(), event.getCharDeltaRaw(), event.getUniqueContentDelta(), event.getCategory(), event.getTimeBucket().toLowerCase(), event.isPossiblyAiGenerated(), event.isFlaggedDuplicate(), event.getFileOrSection()); }
    private ScoringDtos.ScoreResponse scoreResponse(ContributionScoreEntity score) { return new ScoringDtos.ScoreResponse(score.getId(), score.getProjectId(), score.getUserId(), score.getRawScore(), score.getFinalPercentage(), score.getConfidenceLevel().name().toLowerCase(), rationale(score.getRationale()), score.getManualOverridePercentage(), score.getOverrideReason(), score.getComputedAt()); }
    private ScoringDtos.Rationale rationale(String value) { try { return objectMapper.readValue(value, ScoringDtos.Rationale.class); } catch (JsonProcessingException exception) { return new ScoringDtos.Rationale("Unavailable", "Unavailable", "Unavailable", List.of(), "Unavailable"); } }
    private String json(ScoringDtos.Rationale value) { try { return objectMapper.writeValueAsString(value); } catch (JsonProcessingException exception) { throw new IllegalStateException("Rationale serialization failed", exception); } }
    private double round(double value) { return Math.round(value * 10.0) / 10.0; }
}
