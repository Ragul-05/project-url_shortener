package com.example.backend.dto;

import java.util.List;

public record UrlMetadataResponse(
        Long urlId,
        String shortCode,
        String shortUrl,
        String originalUrl,
        String category,
        int riskScore,
        List<String> tags
) {
}
