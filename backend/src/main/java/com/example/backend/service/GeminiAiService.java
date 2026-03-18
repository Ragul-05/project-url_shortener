package com.example.backend.service;

import com.example.backend.dto.AiUrlAnalysis;
import com.example.backend.exception.AiIntegrationException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiAiService {

    private final RestClient.Builder restClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.gemini.api-url}")
    private String apiUrl;

    @Value("${app.ai.gemini.model}")
    private String model;

    @Value("${app.ai.gemini.api-key}")
    private String apiKey;

    public AiUrlAnalysis analyzeUrl(String originalUrl) {
        if (!StringUtils.hasText(apiKey)) {
            throw new AiIntegrationException("Gemini API key is missing. Configure app.ai.gemini.api-key.");
        }

        RestClient restClient = restClientBuilder.build();
        String prompt = buildPrompt(originalUrl);

        Map<String, Object> payload = Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(
                                Map.of(
                                        "text",
                                        "You classify URLs for a URL shortener. Return only strict JSON with keys category, riskScore, and tags."
                                )
                        )
                ),
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0,
                        "responseMimeType", "application/json"
                )
        );

        try {
            JsonNode response = restClient.post()
                    .uri(apiUrl.formatted(model))
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(JsonNode.class);

            return extractAnalysis(response);
        } catch (AiIntegrationException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new AiIntegrationException("Gemini API request failed.", exception);
        }
    }

    private AiUrlAnalysis extractAnalysis(JsonNode response) {
        JsonNode textNode = response.path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text");

        if (textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new AiIntegrationException("Gemini API returned an empty analysis response.");
        }

        try {
            JsonNode analysisNode = objectMapper.readTree(textNode.asText());
            String category = analysisNode.path("category").asText("general");
            int riskScore = Math.max(0, Math.min(100, analysisNode.path("riskScore").asInt(0)));

            List<String> tags = new ArrayList<>();
            JsonNode tagsNode = analysisNode.path("tags");
            if (tagsNode.isArray()) {
                for (JsonNode tagNode : tagsNode) {
                    String tag = tagNode.asText().trim();
                    if (!tag.isBlank()) {
                        tags.add(tag);
                    }
                }
            }

            if (tags.isEmpty()) {
                tags.add(category);
            }

            return new AiUrlAnalysis(category, riskScore, tags.stream().distinct().toList());
        } catch (Exception exception) {
            throw new AiIntegrationException("Unable to parse Gemini analysis response.", exception);
        }
    }

    private String buildPrompt(String originalUrl) {
        return """
                Analyze this URL for a URL shortener platform.
                URL: %s

                Return JSON only in this exact structure:
                {
                  "category": "one short category like e-commerce, social, education, documentation, content, finance, general",
                  "riskScore": 0,
                  "tags": ["tag1", "tag2", "tag3"]
                }

                Rules:
                - riskScore must be an integer from 0 to 100
                - tags must be short lowercase labels
                - no explanation text
                - no markdown
                """.formatted(originalUrl);
    }
}
