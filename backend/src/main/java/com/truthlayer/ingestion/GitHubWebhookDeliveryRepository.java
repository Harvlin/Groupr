package com.truthlayer.ingestion;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GitHubWebhookDeliveryRepository extends JpaRepository<GitHubWebhookDeliveryEntity, UUID> {
    boolean existsByDeliveryId(String deliveryId);
}
