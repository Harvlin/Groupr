package com.truthlayer.workflow;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorroborationRequestRepository extends JpaRepository<CorroborationRequestEntity, UUID> {
    List<CorroborationRequestEntity> findByLogIdIn(List<UUID> logIds);
}
