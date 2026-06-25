package com.lms.common.util;

import java.io.Serializable;

// Generic wrapper for API responses so frontend gets uniform structure
public class ApiResponse<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private boolean success;
    private String message;
    private T data;
    private long timestamp;

    public ApiResponse() {
        this.timestamp = System.currentTimeMillis();
    }

    public ApiResponse(boolean ok, String msg, T d) {
        this.success = ok;
        this.message = msg;
        this.data = d;
        this.timestamp = System.currentTimeMillis();
    }

    public static <T> ApiResponse<T> success(String msg, T d) {
        return new ApiResponse<>(true, msg, d);
    }

    public static <T> ApiResponse<T> error(String msg) {
        // payload is null on failure
        return new ApiResponse<>(false, msg, null);
    }

    // Boilerplate getters and setters
    public boolean isSuccess() { 
        return success; 
    }
    public void setSuccess(boolean success) { 
        this.success = success; 
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() {
        return data;
    }
    public void setData(T data) {
        this.data = data;
    }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long t) { this.timestamp = t; }
}
