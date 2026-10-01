package com.truthlayer.auth;

import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/oauth/google")
public class GoogleOAuthController {
    private final GoogleOAuthService service;
    public GoogleOAuthController(GoogleOAuthService service) { this.service = service; }
    @GetMapping("/start")
    public Map<String, String> start(@AuthenticationPrincipal Jwt jwt, @RequestParam UUID projectId, @RequestParam String externalId) { return Map.of("authorizationUrl", service.start(UUID.fromString(jwt.getSubject()), projectId, externalId)); }
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(@RequestParam String state, @RequestParam String code) { var projectId = service.callback(state, code); return ResponseEntity.status(302).header(HttpHeaders.LOCATION, service.frontendRedirect(projectId)).build(); }
}
