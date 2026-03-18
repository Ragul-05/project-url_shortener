package com.example.backend.dto;

import java.util.List;

public record AiUrlAnalysis(
        String category,
        int riskScore,
        List<String> tags
) {
}
