package com.example.backend.service;

import com.example.backend.dto.ShortenUrlRequest;
import com.example.backend.dto.ShortenUrlResponse;
import com.example.backend.dto.ToggleUrlStatusRequest;
import com.example.backend.dto.UrlAnalyticsResponse;
import com.example.backend.dto.UrlDashboardItemResponse;
import com.example.backend.dto.UrlMetadataResponse;
import com.example.backend.entity.AnalyticsSummary;
import com.example.backend.entity.Url;
import com.example.backend.entity.UrlClick;
import com.example.backend.exception.ExpiredUrlException;
import com.example.backend.exception.InactiveUrlException;
import com.example.backend.exception.InvalidUrlException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.AnalyticsSummaryRepository;
import com.example.backend.repository.UrlClickRepository;
import com.example.backend.repository.UrlRepository;
import com.example.backend.util.CustomShortCodeValidator;
import com.example.backend.util.ShortCodeGenerator;
import com.example.backend.util.UrlValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UrlService {

    private static final int MAX_GENERATION_ATTEMPTS = 10;

    private final UrlRepository urlRepository;
    private final UrlClickRepository urlClickRepository;
    private final AnalyticsSummaryRepository analyticsSummaryRepository;
    private final UrlMetadataService urlMetadataService;

    @Value("${app.base-url}")
    private String baseUrl;

    @Transactional
    public ShortenUrlResponse shortenUrl(ShortenUrlRequest request) {
        UrlValidator.validateHttpUrl(request.originalUrl());
        CustomShortCodeValidator.validate(request.customCode());
        validateExpiryDate(request.expiryDate());

        String shortCode = resolveShortCode(request.customCode());
        Url url = new Url();
        url.setOriginalUrl(request.originalUrl());
        url.setShortCode(shortCode);
        url.setExpiryDate(request.expiryDate());

        AnalyticsSummary analyticsSummary = new AnalyticsSummary();
        analyticsSummary.setUrl(url);
        url.setAnalyticsSummary(analyticsSummary);

        Url savedUrl = urlRepository.save(url);
        urlMetadataService.ensureMetadata(savedUrl);
        return new ShortenUrlResponse(
                savedUrl.getId(),
                savedUrl.getShortCode(),
                baseUrl + "/" + savedUrl.getShortCode(),
                savedUrl.isActive(),
                savedUrl.getExpiryDate(),
                savedUrl.getCreatedAt()
        );
    }

    @Transactional
    public String getOriginalUrl(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("Short URL not found for code: " + shortCode));

        if (!url.isActive()) {
            throw new InactiveUrlException("Short URL is disabled for code: " + shortCode);
        }

        if (url.getExpiryDate() != null && LocalDateTime.now().isAfter(url.getExpiryDate())) {
            throw new ExpiredUrlException("Short URL has expired for code: " + shortCode);
        }

        UrlClick urlClick = new UrlClick();
        urlClick.setUrl(url);
        urlClickRepository.save(urlClick);

        AnalyticsSummary analyticsSummary = url.getAnalyticsSummary();
        if (analyticsSummary == null) {
            analyticsSummary = new AnalyticsSummary();
            analyticsSummary.setUrl(url);
            analyticsSummary.setTotalClicks(0L);
            url.setAnalyticsSummary(analyticsSummary);
        }
        analyticsSummary.setTotalClicks(analyticsSummary.getTotalClicks() + 1);
        analyticsSummary.setLastClickedAt(LocalDateTime.now());
        analyticsSummaryRepository.save(analyticsSummary);

        return url.getOriginalUrl();
    }

    @Transactional(readOnly = true)
    public List<UrlDashboardItemResponse> getAllUrls() {
        return urlRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(url -> new UrlDashboardItemResponse(
                        url.getId(),
                        url.getOriginalUrl(),
                        url.getShortCode(),
                        baseUrl + "/" + url.getShortCode(),
                        url.isActive(),
                        resolveTotalClicks(url),
                        url.getExpiryDate(),
                        url.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public UrlDashboardItemResponse toggleUrlStatus(Long id, ToggleUrlStatusRequest request) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found for id: " + id));

        url.setActive(request.isActive());
        Url updatedUrl = urlRepository.save(url);

        return new UrlDashboardItemResponse(
                updatedUrl.getId(),
                updatedUrl.getOriginalUrl(),
                updatedUrl.getShortCode(),
                baseUrl + "/" + updatedUrl.getShortCode(),
                updatedUrl.isActive(),
                resolveTotalClicks(updatedUrl),
                updatedUrl.getExpiryDate(),
                updatedUrl.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public UrlAnalyticsResponse getAnalytics(Long id) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found for id: " + id));

        AnalyticsSummary analyticsSummary = url.getAnalyticsSummary();
        long totalClicks = analyticsSummary == null ? 0L : analyticsSummary.getTotalClicks();
        LocalDateTime lastClickedAt = analyticsSummary == null ? null : analyticsSummary.getLastClickedAt();

        return new UrlAnalyticsResponse(
                url.getId(),
                url.getShortCode(),
                baseUrl + "/" + url.getShortCode(),
                totalClicks,
                lastClickedAt,
                url.isActive(),
                url.getExpiryDate(),
                url.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<UrlMetadataResponse> getUrlsByCategory(String category) {
        return urlMetadataService.getUrlsByCategory(category);
    }

    @Transactional
    public void deleteUrl(Long id) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found for id: " + id));
        urlRepository.delete(url);
    }

    private String resolveShortCode(String customCode) {
        if (customCode != null && !customCode.isBlank()) {
            if (urlRepository.existsByShortCode(customCode)) {
                throw new InvalidUrlException("customCode is already in use. Please choose another one.");
            }
            return customCode;
        }

        return generateUniqueShortCode();
    }

    private long resolveTotalClicks(Url url) {
        AnalyticsSummary analyticsSummary = url.getAnalyticsSummary();
        return analyticsSummary == null ? 0L : analyticsSummary.getTotalClicks();
    }

    private void validateExpiryDate(LocalDateTime expiryDate) {
        if (expiryDate != null && expiryDate.isBefore(LocalDateTime.now())) {
            throw new InvalidUrlException("expiryDate must be in the future.");
        }
    }

    private String generateUniqueShortCode() {
        for (int attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
            String candidate = ShortCodeGenerator.generate();
            if (!urlRepository.existsByShortCode(candidate)) {
                return candidate;
            }
        }

        throw new IllegalStateException("Unable to generate a unique short code. Please try again.");
    }
}
