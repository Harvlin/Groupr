package com.truthlayer.ingestion;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RawSourceEventRepository extends JpaRepository<RawSourceEventEntity, UUID> {
    boolean existsBySourceIdAndProviderEventId(UUID sourceId, String providerEventId);
}
