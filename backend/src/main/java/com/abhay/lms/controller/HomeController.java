package com.abhay.lms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "LMS Backend API is running successfully.");
        response.put("healthCheck", "/api/status");
        return ResponseEntity.ok(response);
    }
}
