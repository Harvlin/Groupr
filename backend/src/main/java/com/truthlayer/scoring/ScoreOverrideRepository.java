package com.truthlayer.scoring;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreOverrideRepository extends JpaRepository<ScoreOverrideEntity, UUID> {
}
