package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.repository.AuthUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticationService {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthUserRepository authUserRepository;

    /**
     * Extract AuthUser from JWT token in Authorization header
     */
    public Optional<AuthUser> getCurrentUser(String authHeader) {
        System.out.println("AuthenticationService.getCurrentUser: authHeader=" + (authHeader != null ? authHeader.substring(0, Math.min(authHeader.length(), 20)) + "..." : "null"));
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Invalid auth header format");
            return Optional.empty();
        }

        String token = authHeader.substring(7);
        if (!jwtService.validateToken(token)) {
            System.out.println("Invalid token");
            return Optional.empty();
        }

        String email = jwtService.getEmailFromToken(token);
        System.out.println("Email from token: " + email);
        
        Optional<AuthUser> userOpt = authUserRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            System.out.println("Found AuthUser: id=" + userOpt.get().getId() + ", email=" + userOpt.get().getEmail());
        } else {
            System.out.println("No AuthUser found for email: " + email);
        }
        
        return userOpt;
    }
}
