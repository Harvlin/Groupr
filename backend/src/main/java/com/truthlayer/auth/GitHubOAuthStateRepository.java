package com.truthlayer.auth;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GitHubOAuthStateRepository extends JpaRepository<GitHubOAuthStateEntity, UUID> {
    Optional<GitHubOAuthStateEntity> findByStateHash(String stateHash);
}
