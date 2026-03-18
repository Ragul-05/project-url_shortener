package com.example.backend.exception;

public class InactiveUrlException extends RuntimeException {

    public InactiveUrlException(String message) {
        super(message);
    }
}
