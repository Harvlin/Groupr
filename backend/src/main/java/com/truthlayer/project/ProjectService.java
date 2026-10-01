package com.truthlayer.project;

import com.truthlayer.membership.InvitationEntity;
import com.truthlayer.membership.InvitationRepository;
import com.truthlayer.membership.MembershipRole;
import com.truthlayer.membership.ProjectMemberEntity;
import com.truthlayer.membership.ProjectMemberRepository;
import com.truthlayer.user.UserEntity;
import com.truthlayer.user.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {
    private final ProjectRepository projects;
    private final ProjectMemberRepository members;
    private final UserRepository users;
    private final InvitationRepository invitations;
    private final ProjectSettingsRepository settings;

    public ProjectService(ProjectRepository projects, ProjectMemberRepository members, UserRepository users, InvitationRepository invitations, ProjectSettingsRepository settings) {
        this.projects = projects;
        this.members = members;
        this.users = users;
        this.invitations = invitations;
        this.settings = settings;
    }

    @Transactional(readOnly = true)
    public List<ProjectDtos.ProjectResponse> list(UUID userId) {
        return projects.findVisibleTo(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ProjectDtos.ProjectResponse create(UUID userId, ProjectDtos.CreateRequest request) {
        var project = projects.save(new ProjectEntity(request.name().trim(), request.subject(), request.description(), userId, request.deadline()));
        members.save(new ProjectMemberEntity(project.getId(), userId, MembershipRole.LEADER));
        settings.save(new ProjectSettingsEntity(project.getId()));
        return toResponse(project);
    }

    @Transactional(readOnly = true)
    public ProjectDtos.ProjectResponse get(UUID userId, UUID projectId) {
        var project = requireVisible(userId, projectId);
        return toResponse(project);
    }

    @Transactional
    public ProjectDtos.ProjectResponse update(UUID userId, UUID projectId, ProjectDtos.UpdateRequest request) {
        var project = requireManager(userId, projectId);
        project.update(request.name().trim(), request.subject(), request.description(), request.deadline());
        return toResponse(projects.save(project));
    }

    @Transactional
    public ProjectDtos.ProjectResponse archive(UUID userId, UUID projectId) {
        var project = requireManager(userId, projectId);
        project.archive();
        return toResponse(projects.save(project));
    }

    @Transactional
    public ProjectDtos.ProjectResponse finalizeProject(UUID userId, UUID projectId) {
        var project = requireManager(userId, projectId);
        project.finalizeProject();
        return toResponse(projects.save(project));
    }

    @Transactional(readOnly = true)
    public List<ProjectDtos.MemberResponse> listMembers(UUID userId, UUID projectId) {
        requireVisible(userId, projectId);
        return members.findByProjectIdAndLeftAtIsNull(projectId).stream().map(member -> {
            var user = users.findById(member.getUserId()).orElseThrow();
            return new ProjectDtos.MemberResponse(member.getId(), user.getId(), user.getDisplayName(), user.getEmail(), member.getRole(), member.getJoinedAt());
        }).toList();
    }

    @Transactional
    public void updateMember(UUID userId, UUID projectId, UUID memberId, MembershipRole role) {
        requireManager(userId, projectId);
        var member = members.findById(memberId).orElseThrow(() -> new IllegalArgumentException("Member not found"));
        if (!member.getProjectId().equals(projectId) || member.getLeftAt() != null) throw new IllegalArgumentException("Member not found");
        member.changeRole(role);
    }

    @Transactional
    public void removeMember(UUID userId, UUID projectId, UUID memberId) {
        requireManager(userId, projectId);
        var member = members.findById(memberId).orElseThrow(() -> new IllegalArgumentException("Member not found"));
        if (!member.getProjectId().equals(projectId) || member.getUserId().equals(userId)) throw new IllegalArgumentException("Member cannot be removed");
        member.leave();
    }

    @Transactional(readOnly = true)
    public ProjectSettingsDtos.Response getSettings(UUID userId, UUID projectId) {
        requireVisible(userId, projectId);
        var value = settings.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project settings not found"));
        return settingsResponse(value);
    }

    @Transactional
    public ProjectSettingsDtos.Response updateSettings(UUID userId, UUID projectId, ProjectSettingsDtos.UpdateRequest request) {
        requireManager(userId, projectId);
        var value = settings.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project settings not found"));
        ProjectSettingsEntity.Distribution distribution;
        try {
            distribution = ProjectSettingsEntity.Distribution.valueOf(request.expectedDistribution().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("expectedDistribution must be equal or custom");
        }
        value.update(distribution, request.customDistribution(), request.language(), request.allowOfflineLog(), request.autoWarnThreshold());
        return settingsResponse(settings.save(value));
    }

    @Transactional(readOnly = true)
    public ProjectDtos.InviteResponse getInvitation(String token) {
        var invitation = invitations.findByTokenHash(hash(token)).orElseThrow(() -> new IllegalArgumentException("Invitation not found or expired"));
        if (!"PENDING".equals(invitation.getStatus()) || invitation.getExpiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("Invitation is no longer valid");
        return new ProjectDtos.InviteResponse(invitation.getId(), invitation.getProjectId(), invitation.getEmail(), invitation.getRole(), null, invitation.getExpiresAt(), invitation.getStatus().toLowerCase());
    }

    @Transactional
    public void declineInvitation(String token) {
        var invitation = invitations.findByTokenHash(hash(token)).orElseThrow(() -> new IllegalArgumentException("Invitation not found or expired"));
        if (!"PENDING".equals(invitation.getStatus())) throw new IllegalArgumentException("Invitation is no longer pending");
        invitation.decline();
    }

    @Transactional
    public ProjectDtos.InviteResponse invite(UUID userId, UUID projectId, ProjectDtos.InviteRequest request) {
        requireManager(userId, projectId);
        var email = request.email().trim().toLowerCase();
        var token = randomToken();
        var invitation = invitations.save(new InvitationEntity(projectId, email,
            request.role() == null ? MembershipRole.MEMBER : request.role(), hash(token), Instant.now().plus(7, ChronoUnit.DAYS)));
        return new ProjectDtos.InviteResponse(invitation.getId(), projectId, email, invitation.getRole(), token, invitation.getExpiresAt(), invitation.getStatus().toLowerCase());
    }

    @Transactional
    public ProjectDtos.ProjectResponse acceptInvite(UUID userId, String token) {
        var invitation = invitations.findByTokenHash(hash(token)).orElseThrow(() -> new IllegalArgumentException("Invitation not found or expired"));
        if (!"PENDING".equals(invitation.getStatus()) || invitation.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Invitation is no longer valid");
        }
        var user = users.findById(userId).orElseThrow();
        if (!user.getEmail().equalsIgnoreCase(invitation.getEmail())) throw new SecurityException("Invitation email does not match the signed-in user");
        if (!members.existsByProjectIdAndUserIdAndLeftAtIsNull(invitation.getProjectId(), userId)) {
            members.save(new ProjectMemberEntity(invitation.getProjectId(), userId, invitation.getRole()));
        }
        invitation.accept();
        return get(userId, invitation.getProjectId());
    }

    private ProjectEntity requireVisible(UUID userId, UUID projectId) {
        var project = projects.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (!project.getCreatedBy().equals(userId) && !members.existsByProjectIdAndUserIdAndLeftAtIsNull(projectId, userId)) {
            throw new SecurityException("You do not have access to this project");
        }
        return project;
    }

    private ProjectEntity requireManager(UUID userId, UUID projectId) {
        var project = requireVisible(userId, projectId);
        var owner = project.getCreatedBy().equals(userId);
        var leader = members.findByProjectIdAndUserIdAndLeftAtIsNull(projectId, userId)
            .map(member -> member.getRole() == MembershipRole.LEADER).orElse(false);
        var teacher = users.findById(userId).map(user -> user.getRole().name().equals("TEACHER")).orElse(false);
        if (!owner && !leader && !teacher) throw new SecurityException("Only a project leader or teacher can perform this action");
        return project;
    }

    private ProjectDtos.ProjectResponse toResponse(ProjectEntity project) {
        return new ProjectDtos.ProjectResponse(project.getId(), project.getName(), project.getSubject(), project.getDescription(), project.getCreatedBy(), project.getCreatedAt(), project.getDeadline(), project.getStatus(), members.findByProjectIdAndLeftAtIsNull(project.getId()).size(), 0);
    }

    private ProjectSettingsDtos.Response settingsResponse(ProjectSettingsEntity value) {
        return new ProjectSettingsDtos.Response(value.getProjectId(), value.getExpectedDistribution().name().toLowerCase(), value.getCustomDistribution(), value.getLanguage(), value.isAllowOfflineLog(), value.getAutoWarnThreshold());
    }

    private String randomToken() {
        var bytes = new byte[32];
        ThreadLocalRandom.current().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            var digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
