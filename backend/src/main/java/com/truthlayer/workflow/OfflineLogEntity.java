package com.truthlayer.workflow;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "offline_logs")
public class OfflineLogEntity {
    @Id private UUID id;
    @Column(name = "project_id", nullable = false) private UUID projectId;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(nullable = false) private String description;
    @Column(nullable = false) private double hours;
    @Column(name = "date_value", nullable = false) private LocalDate date;
    @Column(nullable = false) private String category;
    @Column(nullable = false) private String status;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    protected OfflineLogEntity() {}
    public OfflineLogEntity(UUID projectId, UUID userId, String description, double hours, LocalDate date, String category) { this.id = UUID.randomUUID(); this.projectId = projectId; this.userId = userId; this.description = description; this.hours = hours; this.date = date; this.category = category; this.status = "UNVERIFIED"; this.createdAt = Instant.now(); }
    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public UUID getUserId() { return userId; }
    public String getDescription() { return description; }
    public double getHours() { return hours; }
    public LocalDate getDate() { return date; }
    public String getCategory() { return category; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public void corroborate() { status = "CORROBORATED"; }
    public void dispute() { status = "DISPUTED"; }
}
