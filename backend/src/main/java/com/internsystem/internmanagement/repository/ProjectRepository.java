package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.dto.InternProjectView;
import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectName(String projectName);
    boolean existsByProjectManagerAuthUser(AuthUser projectManagerAuthUser);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.repoHost IS NULL OR p.repoName IS NULL OR p.repoAccessToken IS NULL")
    Long countProjectsMissingRepositoryInfo();

    @Query(value = "SELECT tm.intern_id AS internId, p.project_name AS projectName " +
                   "FROM projects p " +
                   "JOIN project_teams pt ON p.project_id = pt.project_id " +
                   "JOIN team_members tm ON pt.team_id = tm.team_id " +
                   "WHERE tm.intern_id IN :internIds",
           nativeQuery = true)
    List<InternProjectView> findProjectsForInterns(@Param("internIds") List<Long> internIds);
}