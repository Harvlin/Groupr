package com.truthlayer.scoring;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "score_calculations")
public class ScoreCalculationEntity {
    public enum Status { RUNNING, SUCCEEDED, FAILED }
    @Id private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "calculation_version", nullable = false) private int calculationVersion;
    @Column(name = "algorithm_version", nullable = false, length = 64) private String algorithmVersion;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status;
    @Column(name = "started_at", nullable = false) private Instant startedAt;
    @Column(name = "completed_at") private Instant completedAt;
    protected ScoreCalculationEntity() {}
    public ScoreCalculationEntity(UUID projectId, int version, String algorithmVersion) { this.id = UUID.randomUUID(); this.projectId = projectId; this.calculationVersion = version; this.algorithmVersion = algorithmVersion; this.status = Status.RUNNING; this.startedAt = Instant.now(); }
    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public int getCalculationVersion() { return calculationVersion; }
    public Status getStatus() { return status; }
    public void succeed() { status = Status.SUCCEEDED; completedAt = Instant.now(); }
    public void fail() { status = Status.FAILED; completedAt = Instant.now(); }
}
