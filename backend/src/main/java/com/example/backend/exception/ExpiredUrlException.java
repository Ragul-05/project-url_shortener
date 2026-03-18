package com.example.backend.exception;

public class ExpiredUrlException extends RuntimeException {

    public ExpiredUrlException(String message) {
        super(message);
    }
}
