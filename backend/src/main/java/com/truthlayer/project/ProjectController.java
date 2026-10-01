package com.truthlayer.project;

import jakarta.validation.Valid;
import java.util.UUID;
import com.truthlayer.membership.MembershipRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ProjectController {
    private final ProjectService service;

    public ProjectController(ProjectService service) { this.service = service; }

    @GetMapping("/projects")
    public Object list(@AuthenticationPrincipal Jwt jwt) { return service.list(userId(jwt)); }

    @PostMapping("/projects")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDtos.ProjectResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProjectDtos.CreateRequest request) {
        return service.create(userId(jwt), request);
    }

    @GetMapping("/projects/{projectId}")
    public ProjectDtos.ProjectResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.get(userId(jwt), projectId); }

    @PatchMapping("/projects/{projectId}")
    public ProjectDtos.ProjectResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @Valid @RequestBody ProjectDtos.UpdateRequest request) {
        return service.update(userId(jwt), projectId, request);
    }

    @PostMapping("/projects/{projectId}/archive")
    public ProjectDtos.ProjectResponse archive(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.archive(userId(jwt), projectId); }

    @PostMapping("/projects/{projectId}/finalize")
    public ProjectDtos.ProjectResponse finalizeProject(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.finalizeProject(userId(jwt), projectId); }

    @GetMapping("/projects/{projectId}/members")
    public Object members(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.listMembers(userId(jwt), projectId); }

    @PostMapping("/projects/{projectId}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDtos.InviteResponse invite(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @Valid @RequestBody ProjectDtos.InviteRequest request) {
        return service.invite(userId(jwt), projectId, request);
    }

    @GetMapping("/projects/{projectId}/settings")
    public ProjectSettingsDtos.Response settings(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return service.getSettings(userId(jwt), projectId); }

    @PatchMapping("/projects/{projectId}/settings")
    public ProjectSettingsDtos.Response updateSettings(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @Valid @RequestBody ProjectSettingsDtos.UpdateRequest request) {
        return service.updateSettings(userId(jwt), projectId, request);
    }

    @PatchMapping("/projects/{projectId}/members/{memberId}")
    public void updateMember(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @PathVariable UUID memberId, @RequestBody java.util.Map<String, String> body) {
        service.updateMember(userId(jwt), projectId, memberId, MembershipRole.valueOf(body.getOrDefault("role", "MEMBER").toUpperCase()));
    }

    @DeleteMapping("/projects/{projectId}/members/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @PathVariable UUID memberId) { service.removeMember(userId(jwt), projectId, memberId); }

    @GetMapping("/invitations/{token}")
    public ProjectDtos.InviteResponse invitation(@PathVariable String token) { return service.getInvitation(token); }

    @PostMapping("/invitations/{token}/decline")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void decline(@PathVariable String token) { service.declineInvitation(token); }

    @PostMapping("/invitations/{token}/accept")
    public ProjectDtos.ProjectResponse accept(@AuthenticationPrincipal Jwt jwt, @PathVariable String token) { return service.acceptInvite(userId(jwt), token); }

    private UUID userId(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }
}
