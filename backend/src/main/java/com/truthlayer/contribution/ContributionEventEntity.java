package com.truthlayer.contribution;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "contribution_events")
public class ContributionEventEntity {
    @Id private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "source_id", nullable = false) private UUID sourceId;
    @Column(name = "user_id") private UUID userId;
    @Column(name = "external_user_ref", nullable = false, length = 255) private String externalUserRef;
    @Column(name = "timestamp_at", nullable = false) private Instant timestamp;
    @Column(name = "event_type", nullable = false, length = 32) private String eventType;
    @Column(name = "raw_diff_location") private String rawDiffLocation;
    @Column(name = "char_delta_raw", nullable = false) private int charDeltaRaw;
    @Column(name = "unique_content_delta", nullable = false) private int uniqueContentDelta;
    @Column(length = 32) private String category;
    @Column(name = "time_bucket", nullable = false, length = 16) private String timeBucket;
    @Column(name = "possibly_ai_generated", nullable = false) private boolean possiblyAiGenerated;
    @Column(name = "flagged_duplicate", nullable = false) private boolean flaggedDuplicate;
    @Column(name = "file_or_section", length = 500) private String fileOrSection;
    @Column(name = "provider_event_id", nullable = false, length = 255) private String providerEventId;
    protected ContributionEventEntity() {}
    public ContributionEventEntity(UUID projectId, UUID sourceId, UUID userId, String externalUserRef, Instant timestamp, String eventType, String providerEventId) { this.id = UUID.randomUUID(); this.projectId = projectId; this.sourceId = sourceId; this.userId = userId; this.externalUserRef = externalUserRef; this.timestamp = timestamp; this.eventType = eventType; this.providerEventId = providerEventId; this.timeBucket = "MIDDLE"; }
    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public UUID getSourceId() { return sourceId; }
    public UUID getUserId() { return userId; }
    public String getExternalUserRef() { return externalUserRef; }
    public Instant getTimestamp() { return timestamp; }
    public String getEventType() { return eventType; }
    public String getProviderEventId() { return providerEventId; }
    public int getCharDeltaRaw() { return charDeltaRaw; }
    public int getUniqueContentDelta() { return uniqueContentDelta; }
    public String getCategory() { return category; }
    public String getTimeBucket() { return timeBucket; }
    public boolean isPossiblyAiGenerated() { return possiblyAiGenerated; }
    public boolean isFlaggedDuplicate() { return flaggedDuplicate; }
    public String getFileOrSection() { return fileOrSection; }

    public void setMetrics(int charDeltaRaw, int uniqueContentDelta, String category, String timeBucket, boolean possiblyAiGenerated, boolean flaggedDuplicate) {
        this.charDeltaRaw = Math.max(0, charDeltaRaw);
        this.uniqueContentDelta = Math.max(0, uniqueContentDelta);
        this.category = category;
        this.timeBucket = timeBucket;
        this.possiblyAiGenerated = possiblyAiGenerated;
        this.flaggedDuplicate = flaggedDuplicate;
    }

    public void setDiffEvidence(String rawDiffLocation, String fileOrSection) {
        this.rawDiffLocation = rawDiffLocation;
        this.fileOrSection = fileOrSection;
    }
}
