package com.truthlayer.scoring;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreCalculationRepository extends JpaRepository<ScoreCalculationEntity, UUID> {
    Optional<ScoreCalculationEntity> findTopByProjectIdOrderByCalculationVersionDesc(UUID projectId);
}
