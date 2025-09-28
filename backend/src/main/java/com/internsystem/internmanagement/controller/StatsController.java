package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:3000")
public class StatsController {

    @Autowired
    private StatsService statsService;

    @GetMapping("/active-interns")
    public ResponseEntity<Map<String, Object>> getActiveInternsCount() {
        Map<String, Object> response = new HashMap<>();
        response.put("count", statsService.getActiveInternsFromApi());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending-repository-info")
    public ResponseEntity<Map<String, Object>> getPendingRepositoryInfoCount() {
        Map<String, Object> response = new HashMap<>();
        response.put("count", statsService.getPendingRepositoryInfoCount());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> response = new HashMap<>();
        response.put("activeInterns", statsService.getActiveInternsFromApi());
        response.put("pendingRepositoryInfo", statsService.getPendingRepositoryInfoCount());
        return ResponseEntity.ok(response);
    }
}
