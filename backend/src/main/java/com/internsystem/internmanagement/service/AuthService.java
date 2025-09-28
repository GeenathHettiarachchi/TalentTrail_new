package com.internsystem.internmanagement.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.internsystem.internmanagement.dto.AuthResponse;
import com.internsystem.internmanagement.dto.LoginRequest;
import com.internsystem.internmanagement.dto.GoogleLoginRequest;
import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.repository.AuthUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthUserRepository authUserRepository;
    private final JwtService jwtService;
    private final GoogleOAuthService googleOAuthService;
    
    public AuthResponse login(LoginRequest loginRequest) {
        Optional<AuthUser> userOpt = authUserRepository.findByEmail(loginRequest.getEmail());
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }
        
        AuthUser user = userOpt.get();
        
        // Only allow admins to login with credentials
        if (!user.getRole().equals(AuthUser.Role.ADMIN)) {
            throw new RuntimeException("Only administrators can login with credentials. Please use Google login.");
        }
        
        // For this demo, we're using plain text passwords
        // In production, you should use password hashing
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtService.generateToken(user);
        
        AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole(),
            user.getTraineeId()
        );
        
        return new AuthResponse(token, userDTO);
    }
    
    public AuthResponse googleLogin(GoogleLoginRequest googleLoginRequest) {
        GoogleIdToken.Payload payload = googleOAuthService.verifyGoogleToken(googleLoginRequest.getIdToken());
        
        if (payload == null) {
            throw new RuntimeException("Invalid Google token");
        }
        
        String email = payload.getEmail();
        
        // Validate trainee email against external API
        TraineeValidationService.TraineeValidationResult validationResult = 
            googleOAuthService.validateTraineeEmail(email);
        
        if (!validationResult.isValid()) {
            throw new RuntimeException("Email not authorized. Only pre-registered trainees can login with Google.");
        }
        
        // Check if user exists in database
        Optional<AuthUser> userOpt = authUserRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            // Create new intern user for Google login with trainee data
            AuthUser newUser = new AuthUser();
            newUser.setEmail(email);
            newUser.setName(validationResult.getTraineeName()); // Use name from API
            newUser.setRole(AuthUser.Role.INTERN);
            newUser.setPassword(""); // No password for Google login users
            newUser.setTraineeId(validationResult.getTraineeId()); // Store trainee ID
            
            userOpt = Optional.of(authUserRepository.save(newUser));
        } else {
            // Update existing user with latest trainee data, but preserve role if it's higher than INTERN
            AuthUser existingUser = userOpt.get();
            existingUser.setName(validationResult.getTraineeName());
            existingUser.setTraineeId(validationResult.getTraineeId());
            
        // Always set role to INTERN for Google login users (admins use credential login)
        existingUser.setRole(AuthUser.Role.INTERN);
        
        userOpt = Optional.of(authUserRepository.save(existingUser));
    }
    
    AuthUser user = userOpt.get();
    
    // Only allow interns to login with Google (admins use credential login)
    if (!user.getRole().equals(AuthUser.Role.INTERN)) {
        throw new RuntimeException("Only interns can login with Google. Please use credential login.");
    }        String token = jwtService.generateToken(user);
        
        AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole(),
            user.getTraineeId()
        );
        
        return new AuthResponse(token, userDTO);
    }
}
