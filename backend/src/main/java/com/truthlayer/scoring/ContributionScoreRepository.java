package com.truthlayer.scoring;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContributionScoreRepository extends JpaRepository<ContributionScoreEntity, UUID> {
    List<ContributionScoreEntity> findByProjectIdOrderByFinalPercentageDesc(UUID projectId);
    List<ContributionScoreEntity> findByCalculationIdOrderByFinalPercentageDesc(UUID calculationId);
    Optional<ContributionScoreEntity> findByCalculationIdAndUserId(UUID calculationId, UUID userId);
    Optional<ContributionScoreEntity> findTopByProjectIdAndUserIdOrderByComputedAtDesc(UUID projectId, UUID userId);
    Optional<ContributionScoreEntity> findByIdAndProjectId(UUID id, UUID projectId);
}
