package com.internsystem.internmanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TraineeValidationService {

    // Always use this endpoint for trainee validation
    private final String traineeApiUrl = "https://prohub.slt.com.lk/ProhubTrainees/api/MainApi/AllRequestTraineesByEmail";

    // Use secret code from environment variable
    @Value("${trainee.api.secret:verysecurekey}")
    private String secretKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public TraineeValidationService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public TraineeValidationResult validateTraineeEmail(String email) {
        try {
            // FIX: Send both traineeEmail and secretKey
            String requestBody = String.format("{\"traineeEmail\":\"%s\",\"secretKey\":\"%s\"}", email, secretKey);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(traineeApiUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return parseResponse(response.getBody());
            } else {
                return new TraineeValidationResult(false, null, null);
            }
        } catch (Exception e) {
            System.err.println("Error validating trainee email: " + e.getMessage());
            return new TraineeValidationResult(false, null, null);
        }
    }

    private TraineeValidationResult parseResponse(String responseBody) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            
            // Support both old and new API response formats
            JsonNode traineesArray = null;
            
            // Check if response is new format (direct array)
            if (rootNode.isArray()) {
                traineesArray = rootNode;
            } else {
                // Check for old format (dataBundle wrapper)
                JsonNode dataBundle = rootNode.get("dataBundle");
                if (dataBundle != null && dataBundle.isArray()) {
                    traineesArray = dataBundle;
                }
            }

            if (traineesArray != null && traineesArray.isArray() && traineesArray.size() > 0) {
                // Valid trainee found
                JsonNode traineeData = traineesArray.get(0);
                String traineeId = extractField(traineeData, "internCode", "Trainee_ID");
                String traineeName = extractField(traineeData, "name", "Trainee_Name");

                return new TraineeValidationResult(true, traineeId, traineeName);
            } else {
                // No trainee found (empty array)
                return new TraineeValidationResult(false, null, null);
            }

        } catch (Exception e) {
            System.err.println("Error parsing trainee API response: " + e.getMessage());
            return new TraineeValidationResult(false, null, null);
        }
    }
    
    /**
     * Extract field value from JSON node, supporting both new and old field names
     */
    private String extractField(JsonNode node, String newFieldName, String oldFieldName) {
        if (node.has(newFieldName)) {
            return node.get(newFieldName).asText();
        } else if (node.has(oldFieldName)) {
            return node.get(oldFieldName).asText();
        }
        return null;
    }

    public static class TraineeValidationResult {
        private final boolean valid;
        private final String traineeId;
        private final String traineeName;

        public TraineeValidationResult(boolean valid, String traineeId, String traineeName) {
            this.valid = valid;
            this.traineeId = traineeId;
            this.traineeName = traineeName;
        }

        public boolean isValid() {
            return valid;
        }

        public String getTraineeId() {
            return traineeId;
        }

        public String getTraineeName() {
            return traineeName;
        }
    }
}
