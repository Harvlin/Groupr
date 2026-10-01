package com.truthlayer.classification;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassificationRepository extends JpaRepository<ClassificationEntity, UUID> {
}
