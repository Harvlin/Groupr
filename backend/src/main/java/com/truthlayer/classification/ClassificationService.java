package com.truthlayer.classification;

import com.truthlayer.contribution.ContributionEventEntity;
import com.truthlayer.contribution.ContributionEventRepository;
import com.truthlayer.project.ProjectService;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClassificationService {
    private final ProjectService projects;
    private final ContributionEventRepository events;
    private final ClassificationRepository classifications;
    private final AiClassifier classifier;
    public ClassificationService(ProjectService projects, ContributionEventRepository events, ClassificationRepository classifications, AiClassifier classifier) { this.projects = projects; this.events = events; this.classifications = classifications; this.classifier = classifier; }
    @Transactional
    public int classifyProject(UUID userId, UUID projectId) { projects.get(userId, projectId); var count = 0; for (var event : events.findByProjectIdOrderByTimestampAsc(projectId)) { var result = classifier.classify(event); event.setMetrics(event.getCharDeltaRaw(), event.getUniqueContentDelta(), result.category(), event.getTimeBucket(), result.flags().contains("ai_generated_content"), result.flags().contains("bulk_paste_detected")); classifications.save(new ClassificationEntity(event.getId(), result)); count++; } return count; }
}
