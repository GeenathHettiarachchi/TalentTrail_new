package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectName(String projectName);
    boolean existsByProjectManagerAuthUser(AuthUser projectManagerAuthUser);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.repoHost IS NULL OR p.repoName IS NULL OR p.repoAccessToken IS NULL")
    Long countProjectsMissingRepositoryInfo();
}