package com.example.backend.controller;

import com.example.backend.dto.ShortenUrlRequest;
import com.example.backend.dto.ShortenUrlResponse;
import com.example.backend.dto.ToggleUrlStatusRequest;
import com.example.backend.dto.UrlAnalyticsResponse;
import com.example.backend.dto.UrlDashboardItemResponse;
import com.example.backend.dto.UrlMetadataResponse;
import com.example.backend.response.ApiResponse;
import com.example.backend.service.UrlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;

    @PostMapping("/api/shorten")
    public ResponseEntity<ApiResponse<ShortenUrlResponse>> shortenUrl(@Valid @RequestBody ShortenUrlRequest request) {
        ShortenUrlResponse response = urlService.shortenUrl(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Short URL created successfully", response));
    }

    @GetMapping("/api/urls")
    public ResponseEntity<ApiResponse<List<UrlDashboardItemResponse>>> getAllUrls() {
        List<UrlDashboardItemResponse> response = urlService.getAllUrls();
        return ResponseEntity.ok(ApiResponse.success("URLs fetched successfully", response));
    }

    @PatchMapping("/api/urls/{id}/status")
    public ResponseEntity<ApiResponse<UrlDashboardItemResponse>> toggleUrlStatus(
            @PathVariable Long id,
            @Valid @RequestBody ToggleUrlStatusRequest request
    ) {
        UrlDashboardItemResponse response = urlService.toggleUrlStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("URL status updated successfully", response));
    }

    @GetMapping("/api/urls/{id}/analytics")
    public ResponseEntity<ApiResponse<UrlAnalyticsResponse>> getAnalytics(@PathVariable Long id) {
        UrlAnalyticsResponse response = urlService.getAnalytics(id);
        return ResponseEntity.ok(ApiResponse.success("URL analytics fetched successfully", response));
    }

    @GetMapping("/api/urls/category/{type}")
    public ResponseEntity<ApiResponse<List<UrlMetadataResponse>>> getUrlsByCategory(@PathVariable String type) {
        List<UrlMetadataResponse> response = urlService.getUrlsByCategory(type);
        return ResponseEntity.ok(ApiResponse.success("Categorized URLs fetched successfully", response));
    }

    @DeleteMapping("/api/urls/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUrl(@PathVariable Long id) {
        urlService.deleteUrl(id);
        return ResponseEntity.ok(ApiResponse.success("URL deleted successfully", null));
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirectToOriginalUrl(@PathVariable String shortCode) {
        String originalUrl = urlService.getOriginalUrl(shortCode);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, URI.create(originalUrl).toString())
                .build();
    }
}
