package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {
    List<ProjectTeam> findByProjectProjectId(Long projectId);
    List<ProjectTeam> findByTeamTeamId(Long teamId);
    Optional<ProjectTeam> findByProjectProjectIdAndTeamTeamId(Long projectId, Long teamId);
    void deleteByProjectProjectId(Long projectId);
    void deleteByTeamTeamId(Long teamId);
}
