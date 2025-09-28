package com.internsystem.internmanagement.dto;

import com.internsystem.internmanagement.entity.AuthUser;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserDTO user;
    
    @Data
    @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String email;
        private String name;
        private AuthUser.Role role;
        private String traineeId;
    }
}
