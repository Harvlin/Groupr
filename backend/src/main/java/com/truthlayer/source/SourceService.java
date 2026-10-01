package com.truthlayer.source;

import com.truthlayer.membership.MemberConsentEntity;
import com.truthlayer.membership.MemberConsentRepository;
import com.truthlayer.membership.ProjectMemberRepository;
import com.truthlayer.contribution.ContributionEventRepository;
import com.truthlayer.ingestion.RawSourceEventRepository;
import com.truthlayer.ingestion.GoogleDocsSyncService;
import com.truthlayer.project.ProjectService;
import com.truthlayer.user.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SourceService {
    private final ConnectedSourceRepository sources;
    private final SyncRunRepository syncRuns;
    private final MemberConsentRepository consents;
    private final ProjectMemberRepository members;
    private final ProjectService projects;
    private final UserRepository users;
    private final ContributionEventRepository events;
    private final RawSourceEventRepository rawEvents;
    private final GitHubInstallationRepository githubInstallations;
    private final GoogleDocsSyncService googleDocs;

    public SourceService(ConnectedSourceRepository sources, SyncRunRepository syncRuns, MemberConsentRepository consents,
                         ProjectMemberRepository members, ProjectService projects, UserRepository users,
                         ContributionEventRepository events, RawSourceEventRepository rawEvents, GitHubInstallationRepository githubInstallations, GoogleDocsSyncService googleDocs) {
        this.sources = sources; this.syncRuns = syncRuns; this.consents = consents; this.members = members;
        this.projects = projects; this.users = users; this.events = events; this.rawEvents = rawEvents; this.githubInstallations = githubInstallations; this.googleDocs = googleDocs;
    }

    @Transactional(readOnly = true)
    public List<SourceDtos.SourceResponse> list(UUID userId, UUID projectId) {
        projects.get(userId, projectId);
        return sources.findByProjectIdAndStatusNot(projectId, SourceStatus.DISCONNECTED).stream().map(this::sourceResponse).toList();
    }

    @Transactional
    public SourceDtos.SourceResponse connect(UUID userId, UUID projectId, SourceProvider provider, SourceDtos.ConnectRequest request) {
        projects.get(userId, projectId);
        var existing = sources.findByProjectIdAndProviderAndExternalId(projectId, provider, request.externalId().trim());
        var source = existing.orElseGet(() -> sources.save(new ConnectedSourceEntity(projectId, provider, request.externalId().trim(), userId)));
        if (provider == SourceProvider.GITHUB_REPO) githubInstallations.findTopByProjectIdOrderByCreatedAtDesc(projectId).ifPresent(installation -> source.attachInstallation(installation.getInstallationId()));
        return sourceResponse(source);
    }

    @Transactional
    public void disconnect(UUID userId, UUID sourceId) {
        var source = source(userId, sourceId);
        var manager = source.getConnectedBy().equals(userId) || users.findById(userId).map(user -> user.getRole().name().equals("TEACHER")).orElse(false);
        if (!manager) throw new SecurityException("Only the source owner or a teacher can disconnect a source");
        source.disconnect();
    }

    @Transactional
    public SourceDtos.SyncResponse sync(UUID userId, UUID sourceId) {
        var source = source(userId, sourceId);
        if (!source.isConsentConfirmed()) throw new IllegalArgumentException("Source consent is required before syncing");
        source.startSync();
        var run = syncRuns.save(new SyncRunEntity(source.getId(), source.getSyncCursor()));
        run.start();
        if (source.getProvider() == SourceProvider.GOOGLE_DOCS) googleDocs.sync(source.getId());
        run.succeed(source.getSyncCursor());
        source.completeSync(source.getSyncCursor());
        return syncResponse(run);
    }

    @Transactional(readOnly = true)
    public List<SourceDtos.SyncResponse> syncRuns(UUID userId, UUID sourceId) {
        source(userId, sourceId);
        return syncRuns.findBySourceIdOrderByStartedAtDesc(sourceId).stream().map(this::syncResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SourceDtos.ConsentResponse> listConsents(UUID userId, UUID projectId) {
        projects.get(userId, projectId);
        return consents.findByProjectId(projectId).stream().map(this::consentResponse).toList();
    }

    @Transactional
    public SourceDtos.ConsentResponse updateConsent(UUID userId, UUID projectId, SourceDtos.ConsentRequest request) {
        if (!members.existsByProjectIdAndUserIdAndLeftAtIsNull(projectId, userId)) throw new SecurityException("You are not a member of this project");
        if (request.sourceId() == null) throw new IllegalArgumentException("sourceId is required");
        var source = sources.findById(request.sourceId()).orElseThrow(() -> new IllegalArgumentException("Source not found"));
        if (!source.getProjectId().equals(projectId)) throw new IllegalArgumentException("Source does not belong to this project");
        var consent = consents.findByProjectIdAndUserIdAndSourceId(projectId, userId, request.sourceId())
            .orElseGet(() -> new MemberConsentEntity(projectId, userId, request.sourceId(), MemberConsentEntity.Status.PENDING));
        if (request.status() == MemberConsentEntity.Status.ACCEPTED) { consent.accept(); source.confirmConsent(); }
        else if (request.status() == MemberConsentEntity.Status.DECLINED) consent.decline();
        return consentResponse(consents.save(consent));
    }

    private ConnectedSourceEntity source(UUID userId, UUID sourceId) {
        var source = sources.findById(sourceId).orElseThrow(() -> new IllegalArgumentException("Source not found"));
        projects.get(userId, source.getProjectId());
        return source;
    }

    private SourceDtos.SourceResponse sourceResponse(ConnectedSourceEntity source) {
        return new SourceDtos.SourceResponse(source.getId(), source.getProjectId(), source.getProvider().name().toLowerCase(), source.getExternalId(), source.getConnectedBy(), source.isConsentConfirmed(), source.getStatus().name().toLowerCase(), source.getConnectedAt(), source.getLastSyncedAt());
    }

    private SourceDtos.SyncResponse syncResponse(SyncRunEntity run) { return new SourceDtos.SyncResponse(run.getId(), run.getSourceId(), run.getStatus().name().toLowerCase(), run.getStartedAt(), run.getCompletedAt(), run.getErrorCode()); }
    private SourceDtos.ConsentResponse consentResponse(MemberConsentEntity consent) { var user = users.findById(consent.getUserId()).orElseThrow(); var name = user.getDisplayName(); var parts = name.trim().split("\\s+"); var initials = parts[0].substring(0, 1) + (parts.length > 1 ? parts[1].substring(0, 1) : ""); return new SourceDtos.ConsentResponse(consent.getId(), consent.getProjectId(), consent.getUserId(), consent.getSourceId(), name, initials.toUpperCase(), consent.getStatus().name().toLowerCase(), consent.getConsentedAt(), consent.getRevokedAt()); }
}
