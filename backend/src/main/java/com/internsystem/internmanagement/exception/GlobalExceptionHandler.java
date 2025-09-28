package com.internsystem.internmanagement.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("error", "Not Found");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(404).body(error);
    }

    @ExceptionHandler(ExistingResourceException.class)
    public ResponseEntity<Map<String, Object>> handleExistingResource(ExistingResourceException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("error", "Bad Request");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(400).body(error);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("error", "Bad Request");
        
        String message = "A resource with this identifier already exists";
        String causeMessage = ex.getMessage();
        
        // Parse the constraint violation message to provide more specific feedback
        if (causeMessage != null) {
            if (causeMessage.contains("intern_code")) {
                message = "An intern with this intern code already exists";
            } else if (causeMessage.contains("team_name")) {
                message = "A team with this name already exists";
            } else if (causeMessage.contains("project_name")) {
                message = "A project with this name already exists";
            } else if (causeMessage.contains("email")) {
                message = "An intern with this email already exists";
            }
        }
        
        error.put("message", message);
        return ResponseEntity.status(400).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("error", "Internal Server Error");
        error.put("message", "An unexpected error occurred");
        return ResponseEntity.status(500).body(error);
    }
}
