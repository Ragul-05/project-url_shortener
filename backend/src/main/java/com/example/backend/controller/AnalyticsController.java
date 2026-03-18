package com.example.backend.controller;

import com.example.backend.dto.AnalyticsInsightsResponse;
import com.example.backend.response.ApiResponse;
import com.example.backend.service.UrlMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AnalyticsController {

    private final UrlMetadataService urlMetadataService;

    @GetMapping("/api/analytics/insights")
    public ResponseEntity<ApiResponse<AnalyticsInsightsResponse>> getInsights() {
        AnalyticsInsightsResponse response = urlMetadataService.getInsights();
        return ResponseEntity.ok(ApiResponse.success("Insights fetched successfully", response));
    }
}
