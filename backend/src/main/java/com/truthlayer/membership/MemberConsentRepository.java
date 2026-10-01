package com.truthlayer.membership;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberConsentRepository extends JpaRepository<MemberConsentEntity, UUID> {
    List<MemberConsentEntity> findByProjectId(UUID projectId);
    Optional<MemberConsentEntity> findByProjectIdAndUserIdAndSourceId(UUID projectId, UUID userId, UUID sourceId);
}
