package com.truthlayer.workflow;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisputeRepository extends JpaRepository<DisputeEntity, UUID> {
    List<DisputeEntity> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
}
