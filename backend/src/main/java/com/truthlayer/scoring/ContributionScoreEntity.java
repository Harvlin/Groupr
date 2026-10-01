package com.truthlayer.scoring;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "contribution_scores")
public class ContributionScoreEntity {
    @Id private UUID id;
    @Column(name = "calculation_id", nullable = false) private UUID calculationId;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "raw_score", nullable = false) private double rawScore;
    @Column(name = "final_percentage", nullable = false) private double finalPercentage;
    @Enumerated(EnumType.STRING) @Column(name = "confidence_level", nullable = false, length = 16) private ConfidenceLevel confidenceLevel;
    @JdbcTypeCode(SqlTypes.JSON) @Column(nullable = false, columnDefinition = "jsonb") private String rationale;
    @Column(name = "manual_override_percentage") private Double manualOverridePercentage;
    @Column(name = "override_reason") private String overrideReason;
    @Column(name = "computed_at", nullable = false) private Instant computedAt;
    protected ContributionScoreEntity() {}
    public ContributionScoreEntity(UUID calculationId, UUID projectId, UUID userId, double rawScore, double finalPercentage, ConfidenceLevel confidenceLevel, String rationale) { this.id = UUID.randomUUID(); this.calculationId = calculationId; this.projectId = projectId; this.userId = userId; this.rawScore = rawScore; this.finalPercentage = finalPercentage; this.confidenceLevel = confidenceLevel; this.rationale = rationale; this.computedAt = Instant.now(); }
    public UUID getId() { return id; }
    public UUID getCalculationId() { return calculationId; }
    public UUID getProjectId() { return projectId; }
    public UUID getUserId() { return userId; }
    public double getRawScore() { return rawScore; }
    public double getFinalPercentage() { return finalPercentage; }
    public ConfidenceLevel getConfidenceLevel() { return confidenceLevel; }
    public String getRationale() { return rationale; }
    public Double getManualOverridePercentage() { return manualOverridePercentage; }
    public String getOverrideReason() { return overrideReason; }
    public Instant getComputedAt() { return computedAt; }
    public void override(double percentage, String reason) { this.manualOverridePercentage = percentage; this.overrideReason = reason; this.finalPercentage = percentage; }
}
