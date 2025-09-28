package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.AuthResponse;
import com.internsystem.internmanagement.dto.LoginRequest;
import com.internsystem.internmanagement.dto.GoogleLoginRequest;
import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.service.AuthService;
import com.internsystem.internmanagement.service.JwtService;
import com.internsystem.internmanagement.repository.AuthUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthUserRepository authUserRepository;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("Login attempt for email: " + loginRequest.getEmail());
            AuthResponse response = authService.login(loginRequest);
            System.out.println("Login successful for: " + loginRequest.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("Login failed for: " + loginRequest.getEmail() + " - " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/google-login")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest googleLoginRequest) {
        try {
            System.out.println("Google login attempt");
            AuthResponse response = authService.googleLogin(googleLoginRequest);
            System.out.println("Google login successful");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("Google login failed: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/validate")
    public ResponseEntity<AuthResponse.UserDTO> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                if (jwtService.validateToken(token)) {
                    String email = jwtService.getEmailFromToken(token);
                    Optional<AuthUser> userOpt = authUserRepository.findByEmail(email);
                    
                    if (userOpt.isPresent()) {
                        AuthUser user = userOpt.get();
                        AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO(
                            user.getId(),
                            user.getEmail(),
                            user.getName(),
                            user.getRole(),
                            user.getTraineeId()
                        );
                        return ResponseEntity.ok(userDTO);
                    }
                }
            }
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
