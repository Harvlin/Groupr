package com.truthlayer.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.truthlayer.contribution.ContributionEventEntity;
import com.truthlayer.contribution.ContributionEventRepository;
import com.truthlayer.source.ConnectedSourceEntity;
import com.truthlayer.source.ConnectedSourceRepository;
import com.truthlayer.source.SourceProvider;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GitHubCommitBackfillService {
    private final ConnectedSourceRepository sources;
    private final ContributionEventRepository events;
    private final ObjectMapper objectMapper;
    private final RestClient github;
    private final GitHubAppTokenService appTokens;

    public GitHubCommitBackfillService(ConnectedSourceRepository sources, ContributionEventRepository events, ObjectMapper objectMapper, RestClient.Builder builder, GitHubAppTokenService appTokens) {
        this.sources = sources; this.events = events; this.objectMapper = objectMapper;
        this.github = builder.baseUrl("https://api.github.com").defaultHeader("Accept", "application/vnd.github+json").build(); this.appTokens = appTokens;
    }

    @Transactional
    public int backfill(UUID sourceId) {
        var source = sources.findById(sourceId).orElseThrow(() -> new IllegalArgumentException("Source not found"));
        if (source.getProvider() != SourceProvider.GITHUB_REPO) throw new IllegalArgumentException("Source is not a GitHub repository");
        var enriched = 0;
        for (var event : events.findByProjectIdOrderByTimestampAsc(source.getProjectId())) {
            if (!sourceId.equals(event.getSourceId())) continue;
            var detail = fetchCommit(source, event.getProviderEventId());
            if (detail == null) continue;
            var additions = detail.path("stats").path("additions").asInt(0);
            var deletions = detail.path("stats").path("deletions").asInt(0);
            var unique = 0;
            var files = new ArrayList<String>();
            for (var file : detail.path("files")) {
                files.add(file.path("filename").asText("unknown"));
                var patch = file.path("patch").asText("");
                unique += meaningfulLines(patch);
            }
            event.setMetrics(additions + deletions, Math.max(unique, additions), event.getCategory(), event.getTimeBucket(), event.isPossiblyAiGenerated(), event.isFlaggedDuplicate());
            event.setDiffEvidence("github://commit/" + event.getProviderEventId(), String.join(", ", files));
            enriched++;
        }
        return enriched;
    }

    private JsonNode fetchCommit(ConnectedSourceEntity source, String sha) {
        try {
            var request = github.get().uri("/repos/{repo}/commits/{sha}", repositoryPath(source.getExternalId()), sha);
            if (source.getInstallationId() != null) request = request.header("Authorization", "Bearer " + appTokens.createInstallationToken(source.getInstallationId()).value());
            return request.retrieve().body(JsonNode.class);
        } catch (RuntimeException exception) {
            return null;
        }
    }

    private String repositoryPath(String externalId) {
        var value = externalId.trim().replace("https://github.com/", "").replace("http://github.com/", "");
        if (value.endsWith(".git")) value = value.substring(0, value.length() - 4);
        return value.replaceAll("^/+|/+$", "");
    }

    private int meaningfulLines(String patch) {
        var count = 0;
        for (var line : patch.split("\\R")) {
            if ((line.startsWith("+") || line.startsWith("-")) && !line.startsWith("+++") && !line.startsWith("---") && !line.trim().isEmpty()) count++;
        }
        return count;
    }
}
