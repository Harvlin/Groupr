package com.truthlayer.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import io.jsonwebtoken.Jwts;
import java.security.PrivateKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GitHubAppTokenService {
    private final long appId;
    private final String privateKeyPem;
    private final RestClient github;
    private final Map<Long, InstallationToken> tokenCache = new ConcurrentHashMap<>();

    public GitHubAppTokenService(@Value("${truthlayer.github.app-id:0}") long appId, @Value("${truthlayer.github.private-key:}") String privateKeyPem, RestClient.Builder builder) {
        this.appId = appId;
        this.privateKeyPem = privateKeyPem;
        this.github = builder.baseUrl("https://api.github.com").defaultHeader("Accept", "application/vnd.github+json").build();
    }

    public InstallationToken createInstallationToken(long installationId) {
        var cached = tokenCache.get(installationId);
        if (cached != null && cached.expiresAtInstant().isAfter(Instant.now().plusSeconds(60))) return cached;
        if (appId <= 0) throw new IllegalStateException("GitHub App ID is not configured");
        PrivateKey key = GitHubPrivateKeyParser.parse(privateKeyPem);
        var now = Instant.now();
        var appJwt = Jwts.builder().issuer(Long.toString(appId)).issuedAt(Date.from(now.minusSeconds(30))).expiration(Date.from(now.plusSeconds(540))).signWith(key, Jwts.SIG.RS256).compact();
        JsonNode response = github.post().uri("/app/installations/{installationId}/access_tokens", installationId).header("Authorization", "Bearer " + appJwt).header("Accept", "application/vnd.github+json").retrieve().body(JsonNode.class);
        if (response == null || response.path("token").asText().isBlank()) throw new IllegalStateException("GitHub did not return an installation token");
        var expiresAt = response.path("expires_at").asText(null);
        var token = new InstallationToken(response.path("token").asText(), expiresAt);
        tokenCache.put(installationId, token);
        return token;
    }

    public record InstallationToken(String value, String expiresAt) {
        Instant expiresAtInstant() { try { return expiresAt == null ? Instant.EPOCH : Instant.parse(expiresAt); } catch (Exception ignored) { return Instant.EPOCH; } }
    }
}
