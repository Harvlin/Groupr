package com.truthlayer.contribution;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContributionEventRepository extends JpaRepository<ContributionEventEntity, UUID> {
    List<ContributionEventEntity> findByProjectIdOrderByTimestampAsc(UUID projectId);
    boolean existsBySourceIdAndProviderEventId(UUID sourceId, String providerEventId);
    java.util.Optional<ContributionEventEntity> findBySourceIdAndProviderEventId(UUID sourceId, String providerEventId);
}
