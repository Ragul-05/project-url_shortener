package com.example.backend.dto;

import java.time.LocalDateTime;

public record UrlDashboardItemResponse(
        Long id,
        String originalUrl,
        String shortCode,
        String shortUrl,
        boolean isActive,
        long clickCount,
        LocalDateTime expiryDate,
        LocalDateTime createdAt
) {
}
