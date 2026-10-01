package com.truthlayer.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.truthlayer.project.ProjectService;
import com.truthlayer.source.GitHubInstallationEntity;
import com.truthlayer.source.GitHubInstallationRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GitHubOAuthService {
    private final GitHubOAuthStateRepository states;
    private final GitHubInstallationRepository installations;
    private final ProjectService projects;
    private final String appSlug;
    private final String callbackUrl;
    private final SecureRandom random = new SecureRandom();

    public GitHubOAuthService(GitHubOAuthStateRepository states, GitHubInstallationRepository installations, ProjectService projects,
                              @Value("${truthlayer.github.app-slug:}") String appSlug,
                              @Value("${truthlayer.github.setup-callback-url:http://localhost:8080/api/v1/auth/oauth/github/callback}") String callbackUrl) {
        this.states = states; this.installations = installations; this.projects = projects; this.appSlug = appSlug; this.callbackUrl = callbackUrl;
    }

    @Transactional
    public String start(UUID userId, UUID projectId) {
        projects.get(userId, projectId);
        if (appSlug.isBlank()) throw new IllegalStateException("GitHub App slug is not configured");
        var state = randomState();
        states.save(new GitHubOAuthStateEntity(hash(state), userId, projectId, Instant.now().plus(10, ChronoUnit.MINUTES)));
        return UriComponentsBuilder.fromUriString("https://github.com/apps/" + appSlug + "/installations/new")
            .queryParam("state", state).queryParam("redirect_uri", callbackUrl).build().toUriString();
    }

    @Transactional
    public InstallationResult callback(String state, long installationId, String setupAction, JsonNode installationPayload) {
        if (state == null || state.isBlank()) throw new IllegalArgumentException("Missing GitHub OAuth state");
        var savedState = states.findByStateHash(hash(state)).orElseThrow(() -> new IllegalArgumentException("Invalid or expired GitHub OAuth state"));
        if (savedState.isConsumed() || savedState.getExpiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("Invalid or expired GitHub OAuth state");
        savedState.consume();
        var account = installationPayload == null ? null : installationPayload.path("account");
        var accountId = account == null || account.path("id").isMissingNode() ? null : account.path("id").asLong();
        var accountLogin = account == null ? null : account.path("login").asText(null);
        var installation = installations.findByInstallationId(installationId).orElseGet(() -> new GitHubInstallationEntity(installationId, savedState.getProjectId(), savedState.getUserId(), accountId, accountLogin));
        if (account != null) installation.updateAccount(accountId, accountLogin);
        installations.save(installation);
        return new InstallationResult("connected".equalsIgnoreCase(setupAction) || "install".equalsIgnoreCase(setupAction), savedState.getProjectId());
    }

    private String randomState() { var bytes = new byte[32]; random.nextBytes(bytes); return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes); }
    private String hash(String value) { try { return Base64.getUrlEncoder().withoutPadding().encodeToString(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); } catch (Exception exception) { throw new IllegalStateException("SHA-256 is unavailable", exception); } }
    public record InstallationResult(boolean installed, UUID projectId) {}
}
