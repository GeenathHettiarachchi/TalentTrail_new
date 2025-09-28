package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.repository.AuthUserRepository;
import com.internsystem.internmanagement.repository.InternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class InternAuthUserLinkService {

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private AuthUserRepository authUserRepository;

    /**
     * Find AuthUser associated with an Intern by matching email or traineeId
     */
    public Optional<AuthUser> findAuthUserForIntern(Intern intern) {
        if (intern == null) {
            return Optional.empty();
        }

        // First try to match by email if intern has email
        if (intern.getEmail() != null && !intern.getEmail().isEmpty()) {
            Optional<AuthUser> authUserOpt = authUserRepository.findByEmail(intern.getEmail());
            if (authUserOpt.isPresent()) {
                return authUserOpt;
            }
        }

        // If no email match, try to match by traineeId with intern code
        // This assumes traineeId in AuthUser corresponds to internCode in Intern
        if (intern.getInternCode() != null) {
            return authUserRepository.findAll().stream()
                    .filter(authUser -> intern.getInternCode().equals(authUser.getTraineeId()))
                    .findFirst();
        }

        return Optional.empty();
    }

    /**
     * Find AuthUser by intern ID
     */
    public Optional<AuthUser> findAuthUserByInternId(Long internId) {
        Optional<Intern> internOpt = internRepository.findById(internId);
        if (internOpt.isEmpty()) {
            return Optional.empty();
        }
        
        return findAuthUserForIntern(internOpt.get());
    }
}
