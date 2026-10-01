package com.truthlayer.scoring;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "score_overrides")
public class ScoreOverrideEntity {
    @Id private UUID id;
    @Column(name = "score_id", nullable = false) private UUID scoreId;
    @Column(name = "teacher_id", nullable = false) private UUID teacherId;
    @Column(name = "previous_percentage", nullable = false) private double previousPercentage;
    @Column(name = "new_percentage", nullable = false) private double newPercentage;
    @Column(nullable = false) private String reason;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    protected ScoreOverrideEntity() {}
    public ScoreOverrideEntity(UUID scoreId, UUID teacherId, double previousPercentage, double newPercentage, String reason) { this.id = UUID.randomUUID(); this.scoreId = scoreId; this.teacherId = teacherId; this.previousPercentage = previousPercentage; this.newPercentage = newPercentage; this.reason = reason; this.createdAt = Instant.now(); }
}
