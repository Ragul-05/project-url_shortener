package com.example.backend.util;

import java.security.SecureRandom;

public final class ShortCodeGenerator {

    private static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int DEFAULT_CODE_LENGTH = 6;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private ShortCodeGenerator() {
    }

    public static String generate() {
        return generate(DEFAULT_CODE_LENGTH);
    }

    public static String generate(int length) {
        StringBuilder shortCode = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            int randomIndex = SECURE_RANDOM.nextInt(BASE62.length());
            shortCode.append(BASE62.charAt(randomIndex));
        }
        return shortCode.toString();
    }
}
