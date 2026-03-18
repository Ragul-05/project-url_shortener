package com.example.backend.util;

import com.example.backend.exception.InvalidUrlException;

public final class CustomShortCodeValidator {

    private static final String SHORT_CODE_PATTERN = "^[a-zA-Z0-9-]{3,32}$";

    private CustomShortCodeValidator() {
    }

    public static void validate(String customCode) {
        if (customCode == null || customCode.isBlank()) {
            return;
        }

        if (!customCode.matches(SHORT_CODE_PATTERN)) {
            throw new InvalidUrlException("customCode must be 3-32 characters and contain only letters, numbers, or hyphens.");
        }
    }
}
