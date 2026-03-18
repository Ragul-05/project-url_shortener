package com.example.backend.service;

import com.example.backend.dto.AnalyticsInsightsResponse;
import com.example.backend.dto.AiUrlAnalysis;
import com.example.backend.dto.PopularUrlInsightResponse;
import com.example.backend.dto.UrlMetadataResponse;
import com.example.backend.entity.AnalyticsSummary;
import com.example.backend.entity.Url;
import com.example.backend.entity.UrlClick;
import com.example.backend.entity.UrlMetadata;
import com.example.backend.repository.UrlMetadataRepository;
import com.example.backend.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UrlMetadataService {

    private final UrlMetadataRepository urlMetadataRepository;
    private final UrlRepository urlRepository;
    private final GeminiAiService geminiAiService;

    @Value("${app.base-url}")
    private String baseUrl;

    @Transactional
    public UrlMetadata ensureMetadata(Url url) {
        UrlMetadata existing = url.getMetadata();
        if (existing != null) {
            return existing;
        }

        UrlMetadata metadata = buildMetadata(url);
        metadata.setUrl(url);
        url.setMetadata(metadata);
        return urlMetadataRepository.save(metadata);
    }

    @Transactional
    public List<UrlMetadataResponse> getUrlsByCategory(String category) {
        backfillMissingMetadata();
        return urlMetadataRepository.findAllByCategoryIgnoreCase(category)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AnalyticsInsightsResponse getInsights() {
        List<Url> urls = urlRepository.findAll();
        urls.forEach(this::ensureMetadata);
        long totalUrls = urls.size();
        long activeUrls = urls.stream().filter(Url::isActive).count();
        long expiredUrls = urls.stream()
                .filter(url -> url.getExpiryDate() != null && LocalDateTime.now().isAfter(url.getExpiryDate()))
                .count();
        long highRiskUrls = urls.stream()
                .map(Url::getMetadata)
                .filter(metadata -> metadata != null && metadata.getRiskScore() >= 70)
                .count();

        String topCategory = urls.stream()
                .map(Url::getMetadata)
                .filter(metadata -> metadata != null && metadata.getCategory() != null)
                .collect(Collectors.groupingBy(UrlMetadata::getCategory, Collectors.counting()))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("uncategorized");

        String clickTrend = deriveClickTrend(urls);

        List<PopularUrlInsightResponse> popularUrls = urls.stream()
                .sorted(Comparator.comparingLong(this::resolveTotalClicks).reversed())
                .limit(5)
                .map(url -> new PopularUrlInsightResponse(
                        url.getId(),
                        url.getShortCode(),
                        baseUrl + "/" + url.getShortCode(),
                        resolveTotalClicks(url),
                        url.getMetadata() == null ? "uncategorized" : url.getMetadata().getCategory()
                ))
                .toList();

        return new AnalyticsInsightsResponse(
                totalUrls,
                activeUrls,
                expiredUrls,
                highRiskUrls,
                topCategory,
                clickTrend,
                popularUrls
        );
    }

    @Transactional
    public void backfillMissingMetadata() {
        urlRepository.findAll().stream()
                .filter(url -> url.getMetadata() == null)
                .forEach(this::ensureMetadata);
    }

    private UrlMetadata buildMetadata(Url url) {
        AiUrlAnalysis aiUrlAnalysis = geminiAiService.analyzeUrl(url.getOriginalUrl());
        UrlMetadata metadata = new UrlMetadata();
        metadata.setCategory(aiUrlAnalysis.category());
        metadata.setRiskScore(aiUrlAnalysis.riskScore());
        metadata.setTags(String.join(",", aiUrlAnalysis.tags()));
        return metadata;
    }

    private UrlMetadataResponse toResponse(UrlMetadata metadata) {
        Url url = metadata.getUrl();
        return new UrlMetadataResponse(
                url.getId(),
                url.getShortCode(),
                baseUrl + "/" + url.getShortCode(),
                url.getOriginalUrl(),
                metadata.getCategory(),
                metadata.getRiskScore(),
                parseTags(metadata.getTags())
        );
    }

    private String deriveClickTrend(List<Url> urls) {
        Map<LocalDate, Long> dailyTotals = new LinkedHashMap<>();

        for (Url url : urls) {
            for (UrlClick click : url.getClicks()) {
                LocalDate date = click.getClickedAt().toLocalDate();
                dailyTotals.merge(date, 1L, Long::sum);
            }
        }

        if (dailyTotals.isEmpty()) {
            return "No click trend available yet";
        }

        List<Map.Entry<LocalDate, Long>> ordered = dailyTotals.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .toList();

        if (ordered.size() == 1) {
            return "Traffic started recently and is still building";
        }

        long previous = ordered.get(ordered.size() - 2).getValue();
        long current = ordered.get(ordered.size() - 1).getValue();

        if (current > previous) {
            return "Traffic is trending up";
        }
        if (current < previous) {
            return "Traffic is trending down";
        }
        return "Traffic is stable";
    }

    private long resolveTotalClicks(Url url) {
        AnalyticsSummary analyticsSummary = url.getAnalyticsSummary();
        return analyticsSummary == null ? 0L : analyticsSummary.getTotalClicks();
    }

    private List<String> parseTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .toList();
    }
}
