package com.truthlayer.project;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProjectRepository extends JpaRepository<ProjectEntity, UUID> {
    @Query("select p from ProjectEntity p where p.createdBy = :userId or exists (select m.id from ProjectMemberEntity m where m.projectId = p.id and m.userId = :userId and m.leftAt is null) order by p.createdAt desc")
    List<ProjectEntity> findVisibleTo(UUID userId);
}
