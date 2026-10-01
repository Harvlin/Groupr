package com.truthlayer.ingestion;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/webhooks/github")
public class GitHubWebhookController {
    private final GitHubSignatureVerifier verifier;
    private final GitHubWebhookService service;
    public GitHubWebhookController(GitHubSignatureVerifier verifier, GitHubWebhookService service) { this.verifier = verifier; this.service = service; }

    @PostMapping("/{sourceId}")
    public ResponseEntity<?> receive(@PathVariable UUID sourceId,
                                     @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature,
                                     @RequestHeader(value = "X-GitHub-Delivery") String deliveryId,
                                     @RequestHeader(value = "X-GitHub-Event") String eventType,
                                     @RequestBody String payload) {
        if (!verifier.verify(signature, payload)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("error", "Invalid webhook signature"));
        var processed = service.process(sourceId, deliveryId, eventType, payload);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(java.util.Map.of("accepted", true, "duplicate", !processed));
    }
}
