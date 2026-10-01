package com.truthlayer.audit;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreAuditEntryRepository extends JpaRepository<ScoreAuditEntryEntity, UUID> {
    List<ScoreAuditEntryEntity> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
    List<ScoreAuditEntryEntity> findByEntityIdOrderByCreatedAtDesc(UUID entityId);
}
