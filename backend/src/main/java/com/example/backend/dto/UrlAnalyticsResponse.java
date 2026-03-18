package com.example.backend.dto;

import java.time.LocalDateTime;

public record UrlAnalyticsResponse(
        Long urlId,
        String shortCode,
        String shortUrl,
        long totalClicks,
        LocalDateTime lastClickedAt,
        boolean isActive,
        LocalDateTime expiryDate,
        LocalDateTime createdAt
) {
}
