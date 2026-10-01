package com.truthlayer.project;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class ProjectEntity {
    @Id
    private UUID id;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(length = 160)
    private String subject;

    @Column
    private String description;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column
    private Instant deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "finalized_at")
    private Instant finalizedAt;

    protected ProjectEntity() {
    }

    public ProjectEntity(String name, String subject, String description, UUID createdBy, Instant deadline) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.subject = subject;
        this.description = description;
        this.createdBy = createdBy;
        this.deadline = deadline;
        this.status = ProjectStatus.SETUP;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getSubject() { return subject; }
    public String getDescription() { return description; }
    public UUID getCreatedBy() { return createdBy; }
    public Instant getDeadline() { return deadline; }
    public ProjectStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getFinalizedAt() { return finalizedAt; }

    public void update(String name, String subject, String description, Instant deadline) {
        this.name = name;
        this.subject = subject;
        this.description = description;
        this.deadline = deadline;
    }

    public void archive() {
        this.status = ProjectStatus.ARCHIVED;
    }

    public void finalizeProject() {
        this.status = ProjectStatus.FINALISED;
        this.finalizedAt = Instant.now();
    }
}
