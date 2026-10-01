package com.truthlayer.source;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SourceCredentialRepository extends JpaRepository<SourceCredentialEntity, UUID> {
}