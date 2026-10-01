package com.truthlayer.contribution;

import com.truthlayer.project.ProjectService;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects")
public class EventController {
    private final ProjectService projects;
    private final ContributionEventRepository events;

    public EventController(ProjectService projects, ContributionEventRepository events) {
        this.projects = projects;
        this.events = events;
    }

    @GetMapping("/{projectId}/events")
    public Object list(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) {
        projects.get(UUID.fromString(jwt.getSubject()), projectId);
        return events.findByProjectIdOrderByTimestampAsc(projectId);
    }
}
