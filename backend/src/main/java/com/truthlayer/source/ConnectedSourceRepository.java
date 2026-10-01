package com.truthlayer.source;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConnectedSourceRepository extends JpaRepository<ConnectedSourceEntity, UUID> {
    List<ConnectedSourceEntity> findByProjectIdAndStatusNot(UUID projectId, SourceStatus status);
    Optional<ConnectedSourceEntity> findByProjectIdAndProviderAndExternalId(UUID projectId, SourceProvider provider, String externalId);
}
