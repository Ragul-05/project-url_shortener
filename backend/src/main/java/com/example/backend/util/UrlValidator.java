package com.example.backend.util;

import com.example.backend.exception.InvalidUrlException;

import java.net.URI;
import java.net.URISyntaxException;

public final class UrlValidator {

    private UrlValidator() {
    }

    public static void validateHttpUrl(String rawUrl) {
        try {
            URI uri = new URI(rawUrl);
            String scheme = uri.getScheme();
            String host = uri.getHost();

            if (scheme == null || host == null) {
                throw new InvalidUrlException("Please provide a valid absolute URL.");
            }

            if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
                throw new InvalidUrlException("Only http and https URLs are allowed.");
            }
        } catch (URISyntaxException exception) {
            throw new InvalidUrlException("Please provide a valid URL.");
        }
    }
}
