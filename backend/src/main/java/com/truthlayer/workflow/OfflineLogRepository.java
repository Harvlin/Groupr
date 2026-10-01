package com.truthlayer.workflow;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfflineLogRepository extends JpaRepository<OfflineLogEntity, UUID> {
    List<OfflineLogEntity> findByProjectIdOrderByDateDesc(UUID projectId);
}
