package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record ShortenUrlRequest(
        @NotBlank(message = "originalUrl is required")
        String originalUrl,
        String customCode,
        LocalDateTime expiryDate
) {
}
