package com.truthlayer.workflow;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class WorkflowController {
    private final WorkflowService service;
    public WorkflowController(WorkflowService service) { this.service = service; }
    @GetMapping("/projects/{projectId}/offline-logs") public Object logs(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.listLogs(userId(jwt), projectId); }
    @PostMapping("/projects/{projectId}/offline-logs") @ResponseStatus(HttpStatus.CREATED) public WorkflowDtos.OfflineResponse createLog(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @Valid @RequestBody WorkflowDtos.OfflineCreateRequest request) { return service.createLog(userId(jwt), projectId, request); }
    @DeleteMapping("/offline-logs/{logId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteLog(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID logId) { service.deleteLog(userId(jwt), logId); }
    @GetMapping("/projects/{projectId}/corroboration-requests") public Object corroborations(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.listCorroborations(userId(jwt), projectId); }
    @PatchMapping("/corroboration-requests/{requestId}") public WorkflowDtos.CorroborationResponse respond(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID requestId, @RequestBody java.util.Map<String, Boolean> body) { return service.respond(userId(jwt), requestId, Boolean.TRUE.equals(body.get("confirmed"))); }
    @GetMapping("/projects/{projectId}/disputes") public Object disputes(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.listDisputes(userId(jwt), projectId); }
    @PostMapping("/projects/{projectId}/disputes") @ResponseStatus(HttpStatus.CREATED) public WorkflowDtos.DisputeResponse createDispute(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @Valid @RequestBody WorkflowDtos.DisputeCreateRequest request) { return service.createDispute(userId(jwt), projectId, request); }
    @PatchMapping("/disputes/{disputeId}") public WorkflowDtos.DisputeResponse resolveDispute(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID disputeId, @Valid @RequestBody WorkflowDtos.DisputeResolveRequest request) { return service.resolveDispute(userId(jwt), disputeId, request); }
    @GetMapping("/notifications") public Object notifications(@AuthenticationPrincipal Jwt jwt) { return service.notifications(userId(jwt)); }
    @PatchMapping("/notifications/{notificationId}/read") @ResponseStatus(HttpStatus.NO_CONTENT) public void read(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID notificationId) { service.markNotificationRead(userId(jwt), notificationId); }
    @PostMapping("/notifications/read-all") @ResponseStatus(HttpStatus.NO_CONTENT) public void readAll(@AuthenticationPrincipal Jwt jwt) { service.markAllRead(userId(jwt)); }
    private UUID userId(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }
}
