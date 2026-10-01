package com.truthlayer.scoring;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ScoringController {
    private final ScoringService service;
    public ScoringController(ScoringService service) { this.service = service; }

    @GetMapping("/projects/{projectId}/dashboard")
    public ScoringDtos.DashboardResponse dashboard(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.dashboard(userId(jwt), projectId); }
    @GetMapping("/projects/{projectId}/scores")
    public Object scores(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.latest(userId(jwt), projectId); }
    @GetMapping("/projects/{projectId}/scores/{userId}/audit")
    public Object audit(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @PathVariable UUID userId) { return service.audit(userId(jwt), projectId, userId); }
    @PostMapping("/projects/{projectId}/scores/recalculate")
    public Object recalculate(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.calculate(userId(jwt), projectId); }
    @GetMapping("/projects/{projectId}/teacher-report")
    public ScoringDtos.TeacherReportResponse teacherReport(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.teacherReport(userId(jwt), projectId); }
    @PostMapping("/scores/{scoreId}/override")
    public ScoringDtos.ScoreResponse override(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID scoreId, @Valid @RequestBody ScoringDtos.OverrideRequest request) { return service.override(userId(jwt), scoreId, request); }

    private UUID userId(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }
}
