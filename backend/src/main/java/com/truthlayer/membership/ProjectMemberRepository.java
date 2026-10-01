package com.truthlayer.membership;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMemberEntity, UUID> {
    List<ProjectMemberEntity> findByProjectIdAndLeftAtIsNull(UUID projectId);
    Optional<ProjectMemberEntity> findByProjectIdAndUserIdAndLeftAtIsNull(UUID projectId, UUID userId);
    boolean existsByProjectIdAndUserIdAndLeftAtIsNull(UUID projectId, UUID userId);
}
