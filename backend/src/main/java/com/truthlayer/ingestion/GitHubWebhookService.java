package com.truthlayer.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.truthlayer.contribution.ContributionEventEntity;
import com.truthlayer.contribution.ContributionEventRepository;
import com.truthlayer.source.ConnectedSourceEntity;
import com.truthlayer.source.ConnectedSourceRepository;
import com.truthlayer.source.SourceProvider;
import com.truthlayer.user.UserRepository;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GitHubWebhookService {
    private final ConnectedSourceRepository sources;
    private final RawSourceEventRepository rawEvents;
    private final ContributionEventRepository events;
    private final UserRepository users;
    private final ObjectMapper objectMapper;

    public GitHubWebhookService(ConnectedSourceRepository sources, RawSourceEventRepository rawEvents, ContributionEventRepository events, UserRepository users, ObjectMapper objectMapper) {
        this.sources = sources; this.rawEvents = rawEvents; this.events = events; this.users = users; this.objectMapper = objectMapper;
    }

    @Transactional
    public boolean process(UUID sourceId, String deliveryId, String eventType, String payload) {
        var source = sources.findById(sourceId).orElseThrow(() -> new IllegalArgumentException("Source not found"));
        if (source.getProvider() != SourceProvider.GITHUB_REPO) throw new IllegalArgumentException("Source is not a GitHub repository");
        if (rawEvents.existsBySourceIdAndProviderEventId(sourceId, deliveryId)) return false;
        rawEvents.save(new RawSourceEventEntity(sourceId, deliveryId, eventType, null, sha256(payload)));
        if ("push".equals(eventType)) processPush(source, deliveryId, payload);
        return true;
    }

    private void processPush(ConnectedSourceEntity source, String deliveryId, String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            var commits = root.path("commits");
            for (var commit : commits) {
                var sha = commit.path("id").asText();
                if (sha.isBlank() || events.existsBySourceIdAndProviderEventId(source.getId(), sha)) continue;
                var author = commit.path("author");
                var email = author.path("email").asText(null);
                var externalRef = author.path("username").asText(author.path("name").asText("unknown"));
                var userId = email == null ? null : users.findByEmailIgnoreCase(email).map(user -> user.getId()).orElse(null);
                var timestamp = parseTimestamp(commit.path("timestamp").asText(null));
                events.save(new ContributionEventEntity(source.getProjectId(), source.getId(), userId, externalRef, timestamp, "COMMIT", sha));
            }
        } catch (Exception exception) {
            throw new IllegalArgumentException("GitHub payload could not be normalized", exception);
        }
    }

    private Instant parseTimestamp(String value) {
        try { return value == null ? Instant.now() : Instant.parse(value); }
        catch (Exception ignored) { return Instant.now(); }
    }

    private String sha256(String payload) {
        try { return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8))); }
        catch (Exception exception) { throw new IllegalStateException("SHA-256 is unavailable", exception); }
    }
}
