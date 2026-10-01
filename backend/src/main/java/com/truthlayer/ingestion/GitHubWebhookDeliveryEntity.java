package com.truthlayer.ingestion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "github_webhook_deliveries")
public class GitHubWebhookDeliveryEntity {
    @Id private UUID id;
    @Column(name = "delivery_id", nullable = false, unique = true) private String deliveryId;
    @Column(name = "event_type", nullable = false) private String eventType;
    @Column(name = "received_at", nullable = false) private Instant receivedAt;
    protected GitHubWebhookDeliveryEntity() {}
    public GitHubWebhookDeliveryEntity(String deliveryId, String eventType) { this.id = UUID.randomUUID(); this.deliveryId = deliveryId; this.eventType = eventType; this.receivedAt = Instant.now(); }
}
