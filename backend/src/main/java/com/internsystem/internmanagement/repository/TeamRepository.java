package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByTeamName(String teamName);
    boolean existsByTeamLeaderAuthUser(AuthUser teamLeaderAuthUser);
}
