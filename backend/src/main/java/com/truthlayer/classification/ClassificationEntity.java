package com.truthlayer.classification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "event_classifications")
public class ClassificationEntity {
    @Id private UUID id;
    @Column(name = "event_id", nullable = false) private UUID eventId;
    @Column(nullable = false) private String provider;
    @Column(name = "model_name", nullable = false) private String modelName;
    @Column(name = "prompt_version", nullable = false) private String promptVersion;
    @Column private String category;
    @Column private Double confidence;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb") private String flags;
    @Column private String rationale;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    protected ClassificationEntity() {}
    public ClassificationEntity(UUID eventId, AiClassifier.ClassificationResult result) { this.id = UUID.randomUUID(); this.eventId = eventId; this.provider = result.provider(); this.modelName = result.model(); this.promptVersion = result.promptVersion(); this.category = result.category(); this.confidence = result.confidence(); this.flags = result.flags().stream().map(value -> "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"").collect(java.util.stream.Collectors.joining(",", "[", "]")); this.rationale = result.rationale(); this.createdAt = Instant.now(); }
}
