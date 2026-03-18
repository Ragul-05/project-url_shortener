package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;

public record ToggleUrlStatusRequest(
        @NotNull(message = "isActive is required")
        Boolean isActive
) {
}
