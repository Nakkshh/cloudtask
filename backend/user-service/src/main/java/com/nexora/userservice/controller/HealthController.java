package com.nexora.userservice.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "https://nexora-prod.vercel.app"})
public class HealthController {
    
    private final LocalDateTime startTime = LocalDateTime.now();
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> healthStatus = new HashMap<>();
        healthStatus.put("status", "UP");
        healthStatus.put("service", "Nexora Backend");
        healthStatus.put("timestamp", LocalDateTime.now());
        healthStatus.put("uptime", "Server started at: " + startTime);
        return ResponseEntity.ok(healthStatus);
    }
    
    // Simple text endpoint for UptimeRobot (faster response)
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}