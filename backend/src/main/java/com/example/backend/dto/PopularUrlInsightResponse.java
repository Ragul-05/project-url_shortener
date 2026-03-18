package com.example.backend.dto;

public record PopularUrlInsightResponse(
        Long urlId,
        String shortCode,
        String shortUrl,
        long totalClicks,
        String category
) {
}
