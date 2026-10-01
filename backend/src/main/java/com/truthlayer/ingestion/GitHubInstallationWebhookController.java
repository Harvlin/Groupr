package com.truthlayer.ingestion;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/webhooks/github")
public class GitHubInstallationWebhookController {
    private final GitHubSignatureVerifier verifier;
    private final GitHubInstallationWebhookService service;
    public GitHubInstallationWebhookController(GitHubSignatureVerifier verifier, GitHubInstallationWebhookService service) { this.verifier = verifier; this.service = service; }

    @PostMapping("/installations")
    public ResponseEntity<Map<String, Object>> receive(
        @RequestHeader("X-GitHub-Delivery") String deliveryId,
        @RequestHeader("X-GitHub-Event") String eventType,
        @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature,
        @RequestBody String payload) {
        if (!verifier.verify(signature, payload)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid webhook signature"));
        var processed = service.process(deliveryId, eventType, payload);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("accepted", true, "duplicate", !processed));
    }
}
