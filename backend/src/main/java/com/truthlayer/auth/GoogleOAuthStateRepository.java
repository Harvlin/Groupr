package com.truthlayer.auth;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleOAuthStateRepository extends JpaRepository<GoogleOAuthStateEntity, UUID> {
    Optional<GoogleOAuthStateEntity> findByStateHash(String stateHash);
}