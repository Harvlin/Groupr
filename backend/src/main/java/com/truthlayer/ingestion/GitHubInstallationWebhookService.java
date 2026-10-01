package com.truthlayer.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.truthlayer.source.GitHubInstallationEntity;
import com.truthlayer.source.GitHubInstallationRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GitHubInstallationWebhookService {
    private final GitHubWebhookDeliveryRepository deliveries;
    private final GitHubInstallationRepository installations;
    private final ObjectMapper mapper;

    public GitHubInstallationWebhookService(GitHubWebhookDeliveryRepository deliveries, GitHubInstallationRepository installations, ObjectMapper mapper) { this.deliveries = deliveries; this.installations = installations; this.mapper = mapper; }

    @Transactional
    public boolean process(String deliveryId, String eventType, String payload) {
        if (deliveries.existsByDeliveryId(deliveryId)) return false;
        deliveries.save(new GitHubWebhookDeliveryEntity(deliveryId, eventType));
        try {
            var root = mapper.readTree(payload);
            var installation = root.path("installation");
            var installationId = installation.path("id").asLong(0);
            if (installationId > 0) {
                installations.findByInstallationId(installationId).ifPresent(value -> update(value, root.path("action" ).asText("")));
            }
            return true;
        } catch (Exception exception) {
            throw new IllegalArgumentException("GitHub installation payload could not be processed", exception);
        }
    }

    private void update(GitHubInstallationEntity installation, String action) {
        if ("suspend".equalsIgnoreCase(action)) installation.suspend();
        if ("unsuspend".equalsIgnoreCase(action) || "created".equalsIgnoreCase(action)) installation.activate();
        if ("deleted".equalsIgnoreCase(action)) installation.delete();
    }
}
