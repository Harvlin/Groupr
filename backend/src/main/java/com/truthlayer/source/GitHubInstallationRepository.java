package com.truthlayer.source;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GitHubInstallationRepository extends JpaRepository<GitHubInstallationEntity, UUID> {
    Optional<GitHubInstallationEntity> findByInstallationId(long installationId);
    Optional<GitHubInstallationEntity> findByInstallationIdAndProjectId(long installationId, UUID projectId);
    Optional<GitHubInstallationEntity> findTopByProjectIdOrderByCreatedAtDesc(UUID projectId);
}
