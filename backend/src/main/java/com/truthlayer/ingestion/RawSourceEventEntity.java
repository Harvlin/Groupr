package com.truthlayer.ingestion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "raw_source_events")
public class RawSourceEventEntity {
    @Id private UUID id;
    @Column(name = "source_id", nullable = false) private UUID sourceId;
    @Column(name = "provider_event_id", nullable = false, length = 255) private String providerEventId;
    @Column(name = "event_type", nullable = false, length = 120) private String eventType;
    @Column(name = "payload_location") private String payloadLocation;
    @Column(name = "payload_hash", nullable = false, length = 128) private String payloadHash;
    @Column(name = "received_at", nullable = false) private Instant receivedAt;
    protected RawSourceEventEntity() {}
    public RawSourceEventEntity(UUID sourceId, String providerEventId, String eventType, String payloadLocation, String payloadHash) { this.id = UUID.randomUUID(); this.sourceId = sourceId; this.providerEventId = providerEventId; this.eventType = eventType; this.payloadLocation = payloadLocation; this.payloadHash = payloadHash; this.receivedAt = Instant.now(); }
    public UUID getId() { return id; }
    public UUID getSourceId() { return sourceId; }
    public String getProviderEventId() { return providerEventId; }
}
