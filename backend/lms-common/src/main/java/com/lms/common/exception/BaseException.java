package com.lms.common.exception;

// custom runtime exception with response status code
public class BaseException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    
    private final int statusCode; // renamed slightly

    public BaseException(String msg, int code) {
        super(msg);
        this.statusCode = code;
    }

    public int getStatus() {
        return statusCode; // keep getStatus so external code calling it doesn't break if they depend on it
    }
}
