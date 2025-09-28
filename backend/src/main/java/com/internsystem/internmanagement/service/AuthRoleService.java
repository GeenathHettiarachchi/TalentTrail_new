package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.repository.AuthUserRepository;
import com.internsystem.internmanagement.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthRoleService {
    
    private final AuthUserRepository authUserRepository;
    private final InternRepository internRepository;
    
    /**
     * Creates an AuthUser record for an intern if it doesn't exist
     * All new users are created as INTERN role
     */
    @Transactional
    public void ensureAuthUserExists(Long internId) {
        Optional<Intern> internOpt = internRepository.findById(internId);
        if (internOpt.isEmpty()) {
            log.warn("Intern with ID {} not found when trying to ensure AuthUser exists", internId);
            return;
        }
        
        Intern intern = internOpt.get();
        
        if (intern.getEmail() == null || intern.getEmail().isEmpty()) {
            log.warn("Intern {} (ID: {}) has no email, cannot create AuthUser", intern.getName(), internId);
            return;
        }
        
        Optional<AuthUser> authUserOpt = authUserRepository.findByEmail(intern.getEmail());
        
        if (authUserOpt.isEmpty()) {
            // Create new AuthUser record for this intern
            AuthUser newAuthUser = new AuthUser();
            newAuthUser.setEmail(intern.getEmail());
            newAuthUser.setName(intern.getName());
            newAuthUser.setRole(AuthUser.Role.INTERN);
            newAuthUser.setPassword(""); // No password for Google login users
            newAuthUser.setTraineeId(intern.getInternCode()); // Use intern code as trainee ID
            
            authUserRepository.save(newAuthUser);
            log.info("Created new AuthUser record for intern {} (ID: {})", intern.getName(), internId);
        } else {
            log.debug("AuthUser already exists for intern {} (ID: {})", intern.getName(), internId);
        }
    }
    
    /**
     * Creates an AuthUser record for an intern by intern code if it doesn't exist
     */
    @Transactional
    public void ensureAuthUserExistsByCode(String internCode) {
        Optional<Intern> internOpt = internRepository.findByInternCode(internCode);
        if (internOpt.isPresent()) {
            ensureAuthUserExists(internOpt.get().getInternId());
        } else {
            log.warn("Intern with code '{}' not found when trying to ensure AuthUser exists", internCode);
        }
    }
}
