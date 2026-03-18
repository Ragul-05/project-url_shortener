package com.example.backend.dto;

import java.util.List;

public record AnalyticsInsightsResponse(
        long totalUrls,
        long activeUrls,
        long expiredUrls,
        long highRiskUrls,
        String topCategory,
        String clickTrend,
        List<PopularUrlInsightResponse> popularUrls
) {
}
