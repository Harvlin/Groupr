package com.truthlayer.classification;

import com.truthlayer.contribution.ContributionEventEntity;
import org.springframework.stereotype.Component;

@Component
public class DisabledAiClassifier implements AiClassifier {
    @Override
    public ClassificationResult classify(ContributionEventEntity event) {
        return new ClassificationResult(null, 0, java.util.List.of(), "AI classification is not configured", "disabled", "none", "none");
    }
}
