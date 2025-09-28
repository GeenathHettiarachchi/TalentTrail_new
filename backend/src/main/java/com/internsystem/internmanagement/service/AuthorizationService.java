package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.Project;
import com.internsystem.internmanagement.entity.Team;
import com.internsystem.internmanagement.repository.ProjectRepository;
import com.internsystem.internmanagement.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthorizationService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamRepository teamRepository;

    /**
     * Check if a user can edit a specific project
     */
    public boolean canEditProject(AuthUser user, Long projectId) {
        System.out.println("AuthorizationService.canEditProject: user=" + user.getId() + ", projectId=" + projectId);
        
        if (user.getRole() == AuthUser.Role.ADMIN) {
            System.out.println("User is ADMIN, returning true");
            return true;
        }

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            System.out.println("Project not found, returning false");
            return false;
        }

        Project project = projectOpt.get();
        System.out.println("Project found: " + project.getProjectName());
        System.out.println("Project manager AuthUser: " + (project.getProjectManagerAuthUser() != null ? project.getProjectManagerAuthUser().getId() : "null"));
        
        boolean canEdit = project.getProjectManagerAuthUser() != null && 
               project.getProjectManagerAuthUser().getId().equals(user.getId());
        System.out.println("Can edit result: " + canEdit);
        return canEdit;
    }

    /**
     * Check if a user can edit a specific team
     */
    public boolean canEditTeam(AuthUser user, Long teamId) {
        System.out.println("AuthorizationService.canEditTeam: user=" + user.getId() + ", teamId=" + teamId);
        
        if (user.getRole() == AuthUser.Role.ADMIN) {
            System.out.println("User is ADMIN, returning true");
            return true;
        }

        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty()) {
            System.out.println("Team not found, returning false");
            return false;
        }

        Team team = teamOpt.get();
        System.out.println("Team found: " + team.getTeamName());
        System.out.println("Team leader AuthUser: " + (team.getTeamLeaderAuthUser() != null ? team.getTeamLeaderAuthUser().getId() : "null"));
        
        boolean canEdit = team.getTeamLeaderAuthUser() != null && 
               team.getTeamLeaderAuthUser().getId().equals(user.getId());
        System.out.println("Can edit result: " + canEdit);
        return canEdit;
    }

    /**
     * Check if a user is a project manager for any project
     */
    public boolean isProjectManager(AuthUser user) {
        if (user.getRole() == AuthUser.Role.ADMIN) {
            return true;
        }
        return projectRepository.existsByProjectManagerAuthUser(user);
    }

    /**
     * Check if a user is a team leader for any team
     */
    public boolean isTeamLeader(AuthUser user) {
        if (user.getRole() == AuthUser.Role.ADMIN) {
            return true;
        }
        return teamRepository.existsByTeamLeaderAuthUser(user);
    }
}
