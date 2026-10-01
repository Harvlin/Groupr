package com.truthlayer.source;

import com.truthlayer.membership.MemberConsentEntity;
import com.truthlayer.ingestion.GitHubCommitBackfillService;
import com.truthlayer.ingestion.GoogleDocsSyncService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class SourceController {
    private final SourceService service;
    private final GitHubCommitBackfillService githubBackfill;
    private final GoogleDocsSyncService googleSync;
    public SourceController(SourceService service, GitHubCommitBackfillService githubBackfill, GoogleDocsSyncService googleSync) { this.service = service; this.githubBackfill = githubBackfill; this.googleSync = googleSync; }

    @GetMapping("/projects/{projectId}/sources")
    public Object list(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.list(userId(jwt), projectId); }
    @PostMapping("/projects/{projectId}/sources/google")
    @ResponseStatus(HttpStatus.CREATED)
    public SourceDtos.SourceResponse google(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @Valid @RequestBody SourceDtos.ConnectRequest request) { return service.connect(userId(jwt), projectId, SourceProvider.GOOGLE_DOCS, request); }
    @PostMapping("/projects/{projectId}/sources/github")
    @ResponseStatus(HttpStatus.CREATED)
    public SourceDtos.SourceResponse github(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @Valid @RequestBody SourceDtos.ConnectRequest request) { return service.connect(userId(jwt), projectId, SourceProvider.GITHUB_REPO, request); }
    @DeleteMapping("/sources/{sourceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disconnect(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sourceId) { service.disconnect(userId(jwt), sourceId); }
    @PostMapping("/sources/{sourceId}/sync")
    public SourceDtos.SyncResponse sync(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sourceId) { return service.sync(userId(jwt), sourceId); }
    @GetMapping("/sources/{sourceId}/sync-runs")
    public Object syncRuns(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sourceId) { return service.syncRuns(userId(jwt), sourceId); }
    @PostMapping("/sources/{sourceId}/github-backfill")
    public java.util.Map<String, Integer> githubBackfill(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sourceId) { service.syncRuns(userId(jwt), sourceId); return java.util.Map.of("enrichedEvents", githubBackfill.backfill(sourceId)); }
    @PostMapping("/sources/{sourceId}/google-sync")
    public java.util.Map<String, Integer> googleSync(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sourceId) { service.syncRuns(userId(jwt), sourceId); return java.util.Map.of("createdEvents", googleSync.sync(sourceId)); }
    @GetMapping("/projects/{projectId}/consents")
    public Object consents(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.listConsents(userId(jwt), projectId); }
    @PostMapping("/projects/{projectId}/consents")
    public SourceDtos.ConsentResponse consent(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @RequestBody SourceDtos.ConsentRequest request) { return service.updateConsent(userId(jwt), projectId, request); }

    private UUID userId(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }
}
