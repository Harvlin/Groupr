package com.truthlayer.classification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.truthlayer.contribution.ContributionEventEntity;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@ConditionalOnProperty(name = "truthlayer.ai.provider", havingValue = "anthropic")
public class AnthropicClassifier implements AiClassifier {
    private final RestClient client;
    private final ObjectMapper mapper;
    private final String model;
    public AnthropicClassifier(ObjectMapper mapper, RestClient.Builder builder, @Value("${truthlayer.ai.api-key}") String apiKey, @Value("${truthlayer.ai.model:claude-3-5-haiku-latest}") String model) { this.mapper = mapper; this.model = model; this.client = builder.baseUrl("https://api.anthropic.com").defaultHeader("x-api-key", apiKey).defaultHeader("anthropic-version", "2023-06-01").build(); }
    @Override public ClassificationResult classify(ContributionEventEntity event) {
        var prompt = "Classify this contribution event as one category: research, core_writing, editing, design, coding, coordination. Return JSON only with category, confidence, flags, rationale. Event type=" + event.getEventType() + ", external actor=" + event.getExternalUserRef() + ", file=" + event.getFileOrSection();
        var body = java.util.Map.of("model", model, "max_tokens", 300, "messages", List.of(java.util.Map.of("role", "user", "content", prompt)));
        try { var response = client.post().uri("/v1/messages").body(body).retrieve().body(JsonNode.class); var text = response == null ? "{}" : response.path("content").path(0).path("text").asText("{}"); var parsed = mapper.readTree(text); return new ClassificationResult(parsed.path("category").asText(null), parsed.path("confidence").asDouble(0), mapper.convertValue(parsed.path("flags"), mapper.getTypeFactory().constructCollectionType(List.class, String.class)), parsed.path("rationale").asText(""), "anthropic", model, "classification-v1"); } catch (Exception exception) { return new ClassificationResult(null, 0, List.of(), "AI classification failed safely: " + exception.getClass().getSimpleName(), "anthropic", model, "classification-v1"); }
    }
}
