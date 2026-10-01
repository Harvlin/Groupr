package com.truthlayer.classification;

import com.truthlayer.contribution.ContributionEventEntity;

public interface AiClassifier {
    ClassificationResult classify(ContributionEventEntity event);
    record ClassificationResult(String category, double confidence, java.util.List<String> flags, String rationale, String provider, String model, String promptVersion) {}
}
