package com.truthlayer.classification;

import java.util.Map;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects")
public class ClassificationController {
    private final ClassificationService service;
    public ClassificationController(ClassificationService service) { this.service = service; }
    @PostMapping("/{projectId}/classify")
    public Map<String, Integer> classify(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return Map.of("classifiedEvents", service.classifyProject(UUID.fromString(jwt.getSubject()), projectId)); }
}
