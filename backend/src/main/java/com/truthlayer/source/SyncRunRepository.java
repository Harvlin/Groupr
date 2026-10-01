package com.truthlayer.source;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyncRunRepository extends JpaRepository<SyncRunEntity, UUID> {
    List<SyncRunEntity> findBySourceIdOrderByStartedAtDesc(UUID sourceId);
}
