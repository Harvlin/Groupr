package com.truthlayer.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/oauth/github")
public class GitHubOAuthController {
    private final GitHubOAuthService service;
    private final ObjectMapper mapper;
    private final String frontendOrigin;
    public GitHubOAuthController(GitHubOAuthService service, ObjectMapper mapper, @Value("${truthlayer.cors.allowed-origin}") String frontendOrigin) { this.service = service; this.mapper = mapper; this.frontendOrigin = frontendOrigin; }

    @GetMapping("/start")
    public Map<String, String> start(@AuthenticationPrincipal Jwt jwt, @RequestParam UUID projectId) {
        return Map.of("authorizationUrl", service.start(UUID.fromString(jwt.getSubject()), projectId));
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> callback(@RequestParam String state, @RequestParam(name = "installation_id") long installationId,
                                        @RequestParam(name = "setup_action", defaultValue = "install") String setupAction,
                                        @RequestParam(name = "account_id", required = false) Long accountId,
                                        @RequestParam(name = "account_login", required = false) String accountLogin) {
        var installation = mapper.createObjectNode();
        var account = installation.putObject("account");
        if (accountId != null) account.put("id", accountId);
        if (accountLogin != null) account.put("login", accountLogin);
        var result = service.callback(state, installationId, setupAction, installation);
        var location = org.springframework.web.util.UriComponentsBuilder.fromUriString(frontendOrigin)
            .path("/projects/{projectId}/sources")
            .queryParam("github", result.installed() ? "connected" : "received")
            .buildAndExpand(result.projectId())
            .toUri();
        return ResponseEntity.status(302).header(HttpHeaders.LOCATION, location.toString()).build();
    }
}
