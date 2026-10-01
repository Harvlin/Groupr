package com.truthlayer.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.truthlayer.contribution.ContributionEventEntity;
import com.truthlayer.contribution.ContributionEventRepository;
import com.truthlayer.source.ConnectedSourceEntity;
import com.truthlayer.source.ConnectedSourceRepository;
import com.truthlayer.source.SourceProvider;
import com.truthlayer.source.SourceCredentialRepository;
import com.truthlayer.common.TokenEncryptionService;
import com.truthlayer.user.UserRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoogleDocsSyncService {
    private final ConnectedSourceRepository sources;
    private final RawSourceEventRepository rawEvents;
    private final ContributionEventRepository events;
    private final UserRepository users;
    private final ObjectMapper objectMapper;
    private final RestClient google;
    private final SourceCredentialRepository credentials;
    private final TokenEncryptionService encryption;

    public GoogleDocsSyncService(ConnectedSourceRepository sources, RawSourceEventRepository rawEvents, ContributionEventRepository events, UserRepository users, ObjectMapper objectMapper, RestClient.Builder builder, SourceCredentialRepository credentials, TokenEncryptionService encryption) {
        this.sources = sources; this.rawEvents = rawEvents; this.events = events; this.users = users; this.objectMapper = objectMapper; this.credentials = credentials; this.encryption = encryption;
        this.google = builder.baseUrl("https://www.googleapis.com").defaultHeader("Accept", "application/json").build();
    }

    @Transactional
    public int sync(UUID sourceId) {
        var source = sources.findById(sourceId).orElseThrow(() -> new IllegalArgumentException("Source not found"));
        if (source.getProvider() != SourceProvider.GOOGLE_DOCS) throw new IllegalArgumentException("Source is not a Google document");
        var credential = credentials.findById(sourceId).orElseThrow(() -> new IllegalArgumentException("Google OAuth consent is required before syncing"));
        var accessToken = encryption.decrypt(credential.getEncryptedAccessToken());
        var response = google.get().uri(uri -> uri.path("/drive/v3/files/{fileId}/revisions").queryParam("fields", "revisions(id,modifiedTime,lastModifyingUser)").build(source.getExternalId())).header("Authorization", "Bearer " + accessToken).retrieve().body(JsonNode.class);
        var created = 0;
        for (var revision : response == null ? objectMapper.createArrayNode() : response.path("revisions")) {
            var revisionId = revision.path("id").asText();
            var providerEventId = "revision:" + revisionId;
            if (revisionId.isBlank() || rawEvents.existsBySourceIdAndProviderEventId(sourceId, providerEventId)) continue;
            var actor = revision.path("lastModifyingUser");
            var email = actor.path("emailAddress").asText(null);
            var externalRef = actor.path("displayName").asText(email == null ? "unknown" : email);
            var userId = email == null ? null : users.findByEmailIgnoreCase(email).map(value -> value.getId()).orElse(null);
            rawEvents.save(new RawSourceEventEntity(sourceId, providerEventId, "drive_revision", null, providerEventId));
            var event = new ContributionEventEntity(source.getProjectId(), sourceId, userId, externalRef, parseTime(revision.path("modifiedTime").asText(null)), "DOC_EDIT", providerEventId);
            event.setDiffEvidence("google-drive://revision/" + revisionId, source.getExternalId());
            events.save(event);
            created++;
        }
        return created;
    }

    private Instant parseTime(String value) { try { return value == null ? Instant.now() : Instant.parse(value); } catch (Exception ignored) { return Instant.now(); } }
}
