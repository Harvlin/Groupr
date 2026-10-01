package com.truthlayer.source;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sync_runs")
public class SyncRunEntity {
    public enum Status { QUEUED, RUNNING, SUCCEEDED, FAILED }
    @Id private UUID id;
    @Column(name = "source_id", nullable = false) private UUID sourceId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status;
    @Column(name = "started_at") private Instant startedAt;
    @Column(name = "completed_at") private Instant completedAt;
    @Column(name = "cursor_before", length = 500) private String cursorBefore;
    @Column(name = "cursor_after", length = 500) private String cursorAfter;
    @Column(name = "error_code", length = 120) private String errorCode;
    @Column(name = "retry_count", nullable = false) private int retryCount;
    protected SyncRunEntity() {}
    public SyncRunEntity(UUID sourceId, String cursorBefore) { this.id = UUID.randomUUID(); this.sourceId = sourceId; this.status = Status.QUEUED; this.cursorBefore = cursorBefore; }
    public UUID getId() { return id; }
    public UUID getSourceId() { return sourceId; }
    public Status getStatus() { return status; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public String getCursorBefore() { return cursorBefore; }
    public String getCursorAfter() { return cursorAfter; }
    public String getErrorCode() { return errorCode; }
    public int getRetryCount() { return retryCount; }
    public void start() { status = Status.RUNNING; startedAt = Instant.now(); }
    public void succeed(String cursor) { status = Status.SUCCEEDED; cursorAfter = cursor; completedAt = Instant.now(); }
    public void fail(String error) { status = Status.FAILED; errorCode = error; completedAt = Instant.now(); }
}
