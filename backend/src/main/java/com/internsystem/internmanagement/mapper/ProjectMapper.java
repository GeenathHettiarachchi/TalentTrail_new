package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.ProjectDTO;
import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.Project;
import com.internsystem.internmanagement.entity.Intern;

import java.util.List;

public class ProjectMapper {

    public static ProjectDTO toDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setProjectId(project.getProjectId());
        dto.setProjectName(project.getProjectName());
        dto.setDescription(project.getDescription());
        dto.setStartDate(project.getStartDate());
        dto.setTargetDate(project.getTargetDate());
        dto.setStatus(project.getStatus());
        dto.setRepoHost(project.getRepoHost());
        dto.setRepoName(project.getRepoName());
        dto.setRepoAccessToken(project.getRepoAccessToken());
        if (project.getProjectManager() != null) {
            dto.setProjectManagerId(project.getProjectManager().getInternId());
            dto.setProjectManagerName(project.getProjectManager().getName());
        }
        if (project.getProjectManagerAuthUser() != null) {
            dto.setProjectManagerAuthId(project.getProjectManagerAuthUser().getId());
        }
        return dto;
    }
    
    @SuppressWarnings("deprecation")
    public static ProjectDTO toDTOWithTeams(Project project, List<Long> teamIds, List<String> teamNames) {
        ProjectDTO dto = toDTO(project);
        dto.setAssignedTeamIds(teamIds);
        dto.setAssignedTeamNames(teamNames);
        
        // For backward compatibility - set first team as the main team
        if (teamIds != null && !teamIds.isEmpty()) {
            dto.setAssignedTeamId(teamIds.get(0));
        }
        if (teamNames != null && !teamNames.isEmpty()) {
            dto.setAssignedTeamName(teamNames.get(0));
        }
        
        return dto;
    }

    public static Project toEntity(ProjectDTO dto, Intern manager) {
        Project project = new Project();
        project.setProjectId(dto.getProjectId());
        project.setProjectName(dto.getProjectName());
        project.setDescription(dto.getDescription());
        project.setStartDate(dto.getStartDate());
        project.setTargetDate(dto.getTargetDate());
        project.setStatus(dto.getStatus());
        project.setProjectManager(manager);
        project.setRepoHost(dto.getRepoHost());
        project.setRepoName(dto.getRepoName());
        project.setRepoAccessToken(dto.getRepoAccessToken());
        return project;
    }

    public static Project toEntity(ProjectDTO dto, Intern manager, AuthUser managerAuthUser) {
        Project project = toEntity(dto, manager);
        project.setProjectManagerAuthUser(managerAuthUser);
        return project;
    }
}