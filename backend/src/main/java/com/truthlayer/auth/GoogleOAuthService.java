package com.truthlayer.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.truthlayer.common.TokenEncryptionService;
import com.truthlayer.project.ProjectService;
import com.truthlayer.source.ConnectedSourceEntity;
import com.truthlayer.source.ConnectedSourceRepository;
import com.truthlayer.source.SourceCredentialEntity;
import com.truthlayer.source.SourceCredentialRepository;
import com.truthlayer.source.SourceProvider;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GoogleOAuthService {
    private final GoogleOAuthStateRepository states;
    private final ProjectService projects;
    private final ConnectedSourceRepository sources;
    private final SourceCredentialRepository credentials;
    private final TokenEncryptionService encryption;
    private final RestClient google;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final String frontendOrigin;
    private final SecureRandom random = new SecureRandom();

    public GoogleOAuthService(GoogleOAuthStateRepository states, ProjectService projects, ConnectedSourceRepository sources, SourceCredentialRepository credentials, TokenEncryptionService encryption, RestClient.Builder builder, @Value("${truthlayer.google.client-id:}") String clientId, @Value("${truthlayer.google.client-secret:}") String clientSecret, @Value("${truthlayer.google.redirect-uri:http://localhost:8080/api/v1/auth/oauth/google/callback}") String redirectUri, @Value("${truthlayer.cors.allowed-origin}") String frontendOrigin) { this.states = states; this.projects = projects; this.sources = sources; this.credentials = credentials; this.encryption = encryption; this.google = builder.baseUrl("https://accounts.google.com").build(); this.clientId = clientId; this.clientSecret = clientSecret; this.redirectUri = redirectUri; this.frontendOrigin = frontendOrigin; }

    @Transactional
    public String start(UUID userId, UUID projectId, String externalId) {
        projects.get(userId, projectId);
        if (clientId.isBlank() || clientSecret.isBlank()) throw new IllegalStateException("Google OAuth credentials are not configured");
        var state = randomState(); states.save(new GoogleOAuthStateEntity(hash(state), userId, projectId, externalId.trim(), Instant.now().plus(10, ChronoUnit.MINUTES)));
        return UriComponentsBuilder.fromUriString("https://accounts.google.com/o/oauth2/v2/auth").queryParam("client_id", clientId).queryParam("redirect_uri", redirectUri).queryParam("response_type", "code").queryParam("access_type", "offline").queryParam("prompt", "consent").queryParam("scope", "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.activity.readonly").queryParam("state", state).build().toUriString();
    }

    @Transactional
    public UUID callback(String state, String code) {
        var saved = states.findByStateHash(hash(state)).orElseThrow(() -> new IllegalArgumentException("Invalid or expired Google OAuth state"));
        if (saved.consumed() || saved.getExpiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("Invalid or expired Google OAuth state");
        saved.consume();
        var form = new LinkedMultiValueMap<String, String>(); form.add("code", code); form.add("client_id", clientId); form.add("client_secret", clientSecret); form.add("redirect_uri", redirectUri); form.add("grant_type", "authorization_code");
        var token = google.post().uri("/token").contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form).retrieve().body(JsonNode.class);
        if (token == null || token.path("access_token").asText().isBlank()) throw new IllegalArgumentException("Google did not return an access token");
        var source = sources.findByProjectIdAndProviderAndExternalId(saved.getProjectId(), SourceProvider.GOOGLE_DOCS, saved.getExternalId()).orElseGet(() -> sources.save(new ConnectedSourceEntity(saved.getProjectId(), SourceProvider.GOOGLE_DOCS, saved.getExternalId(), saved.getUserId())));
        var expires = Instant.now().plusSeconds(token.path("expires_in").asLong(3600));
        credentials.save(new SourceCredentialEntity(source.getId(), encryption.encrypt(token.path("access_token").asText()), token.has("refresh_token") ? encryption.encrypt(token.path("refresh_token").asText()) : null, token.path("scope").asText(""), expires));
        return saved.getProjectId();
    }

    public String frontendRedirect(UUID projectId) { return UriComponentsBuilder.fromUriString(frontendOrigin).path("/projects/{projectId}/sources").queryParam("google", "connected").buildAndExpand(projectId).toUriString(); }
    private String randomState() { var bytes = new byte[32]; random.nextBytes(bytes); return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes); }
    private String hash(String value) { try { return Base64.getUrlEncoder().withoutPadding().encodeToString(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); } catch (Exception exception) { throw new IllegalStateException(exception); } }
}
