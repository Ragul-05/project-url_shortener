package com.example.backend.dto;

import java.time.LocalDateTime;

public record ShortenUrlResponse(
        Long id,
        String shortCode,
        String shortUrl,
        boolean isActive,
        LocalDateTime expiryDate,
        LocalDateTime createdAt
) {
}
