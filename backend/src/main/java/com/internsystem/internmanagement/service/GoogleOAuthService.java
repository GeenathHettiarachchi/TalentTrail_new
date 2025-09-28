package com.internsystem.internmanagement.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Collections;
import java.util.Map;

@Service
public class GoogleOAuthService {
    
    @Value("${google.oauth.client.id}")
    private String clientId;
    
    @Autowired
    private TraineeValidationService traineeValidationService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        try {
            // Try to verify as a real Google ID token first
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();
            
            GoogleIdToken token = verifier.verify(idToken);
            if (token != null) {
                return token.getPayload();
            }
            
            // If that fails, try to decode as our custom base64 encoded JSON
            try {
                String decodedJson = new String(Base64.getDecoder().decode(idToken));
                @SuppressWarnings("unchecked")
                Map<String, Object> userInfo = objectMapper.readValue(decodedJson, Map.class);
                
                // Create a mock payload
                GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
                payload.setEmail((String) userInfo.get("email"));
                payload.set("name", userInfo.get("name"));
                
                return payload;
            } catch (Exception e) {
                System.err.println("Error decoding custom token: " + e.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("Error verifying Google token: " + e.getMessage());
        }
        return null;
    }
    
    public TraineeValidationService.TraineeValidationResult validateTraineeEmail(String email) {
        // First check if it's a Gmail address
        if (email == null || !email.endsWith("@gmail.com")) {
            return new TraineeValidationService.TraineeValidationResult(false, null, null);
        }
        
        // Then validate against the external API
        return traineeValidationService.validateTraineeEmail(email);
    }
}
