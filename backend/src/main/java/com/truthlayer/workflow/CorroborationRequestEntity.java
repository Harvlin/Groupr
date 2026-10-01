package com.truthlayer.workflow;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "corroboration_requests")
public class CorroborationRequestEntity {
    @Id private UUID id;
    @Column(name = "log_id", nullable = false) private UUID logId;
    @Column(name = "requesting_member_id", nullable = false) private UUID requestingMemberId;
    @Column(name = "target_member_id", nullable = false) private UUID targetMemberId;
    @Column(nullable = false) private String description;
    @Column(nullable = false) private double hours;
    @Column(name = "date_value", nullable = false) private LocalDate date;
    @Column(nullable = false) private String status;
    @Column(name = "responded_at") private Instant respondedAt;
    protected CorroborationRequestEntity() {}
    public CorroborationRequestEntity(UUID logId, UUID requester, UUID target, String description, double hours, LocalDate date) { this.id = UUID.randomUUID(); this.logId = logId; this.requestingMemberId = requester; this.targetMemberId = target; this.description = description; this.hours = hours; this.date = date; this.status = "PENDING"; }
    public UUID getId() { return id; }
    public UUID getLogId() { return logId; }
    public UUID getRequestingMemberId() { return requestingMemberId; }
    public UUID getTargetMemberId() { return targetMemberId; }
    public String getDescription() { return description; }
    public double getHours() { return hours; }
    public LocalDate getDate() { return date; }
    public String getStatus() { return status; }
    public void respond(boolean confirmed) { status = confirmed ? "CONFIRMED" : "DECLINED"; respondedAt = Instant.now(); }
}
