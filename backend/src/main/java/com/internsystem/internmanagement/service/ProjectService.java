package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.dto.ProjectDTO;
import com.internsystem.internmanagement.dto.ProjectTeamDTO;
import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.entity.Project;
import com.internsystem.internmanagement.exception.ExistingResourceException;
import com.internsystem.internmanagement.exception.ResourceNotFoundException;
import com.internsystem.internmanagement.mapper.ProjectMapper;
import com.internsystem.internmanagement.repository.InternRepository;
import com.internsystem.internmanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private ProjectTeamService projectTeamService;
    
    @Autowired
    private InternAuthUserLinkService internAuthUserLinkService;

    public List<ProjectDTO> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        return projects.stream()
                .map(this::convertToFullDTO)
                .collect(Collectors.toList());
    }

    private ProjectDTO convertToFullDTO(Project project) {
        // Get assigned teams for this project
        List<ProjectTeamDTO> projectTeams = projectTeamService.getTeamsByProjectId(project.getProjectId());
        List<Long> teamIds = projectTeams.stream().map(ProjectTeamDTO::getTeamId).collect(Collectors.toList());
        List<String> teamNames = projectTeams.stream().map(ProjectTeamDTO::getTeamName).collect(Collectors.toList());
        
        return ProjectMapper.toDTOWithTeams(project, teamIds, teamNames);
    }

    @Transactional
    @SuppressWarnings("deprecation")
    public ProjectDTO createProject(ProjectDTO dto) {
        // Check if project name already exists
        if (projectRepository.findByProjectName(dto.getProjectName()).isPresent()) {
            throw new ExistingResourceException("A project with name '" + dto.getProjectName() + "' already exists");
        }
        
        // Get project manager if specified
        Intern manager = null;
        AuthUser managerAuthUser = null;
        if (dto.getProjectManagerId() != null) {
            manager = internRepository.findById(dto.getProjectManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project Manager not found with ID: " + dto.getProjectManagerId()));
            
            // Find corresponding AuthUser
            Optional<AuthUser> authUserOpt = internAuthUserLinkService.findAuthUserForIntern(manager);
            if (authUserOpt.isEmpty()) {
                throw new ResourceNotFoundException("No AuthUser found for the specified project manager");
            }
            managerAuthUser = authUserOpt.get();
        }
        
        // Create project
        Project project = ProjectMapper.toEntity(dto, manager, managerAuthUser);
        Project saved = projectRepository.save(project);
        
        // Assign teams if specified
        if (dto.getAssignedTeamIds() != null && !dto.getAssignedTeamIds().isEmpty()) {
            for (Long teamId : dto.getAssignedTeamIds()) {
                projectTeamService.assignTeamToProject(saved.getProjectId(), teamId);
            }
        }
        // Handle backward compatibility with single team assignment
        else if (dto.getAssignedTeamId() != null) {
            projectTeamService.assignTeamToProject(saved.getProjectId(), dto.getAssignedTeamId());
        }
        
        return convertToFullDTO(saved);
    }

    public Optional<ProjectDTO> getProjectById(Long id) {
        return projectRepository.findById(id).map(this::convertToFullDTO);
    }

    @Transactional
    @SuppressWarnings("deprecation")
    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
        
        // Check if trying to update project name to one that already exists (for a different project)
        if (!project.getProjectName().equals(dto.getProjectName())) {
            Optional<Project> existingProject = projectRepository.findByProjectName(dto.getProjectName());
            if (existingProject.isPresent() && !existingProject.get().getProjectId().equals(id)) {
                throw new ExistingResourceException("A project with name '" + dto.getProjectName() + "' already exists");
            }
        }

        // Get project manager if specified
        Intern manager = null;
        AuthUser managerAuthUser = null;
        if (dto.getProjectManagerId() != null) {
            manager = internRepository.findById(dto.getProjectManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project Manager not found with ID: " + dto.getProjectManagerId()));
            
            // Find corresponding AuthUser
            Optional<AuthUser> authUserOpt = internAuthUserLinkService.findAuthUserForIntern(manager);
            if (authUserOpt.isEmpty()) {
                throw new ResourceNotFoundException("No AuthUser found for the specified project manager");
            }
            managerAuthUser = authUserOpt.get();
        }

        // Update project fields
        project.setProjectName(dto.getProjectName());
        project.setDescription(dto.getDescription());
        project.setStartDate(dto.getStartDate());
        project.setTargetDate(dto.getTargetDate());
        project.setStatus(dto.getStatus());
        project.setProjectManager(manager);
        project.setProjectManagerAuthUser(managerAuthUser);
        project.setRepoHost(dto.getRepoHost());
        project.setRepoName(dto.getRepoName());
        project.setRepoAccessToken(dto.getRepoAccessToken());

        Project saved = projectRepository.save(project);
        
        // Update team assignments
        if (dto.getAssignedTeamIds() != null) {
            // Remove all existing team assignments
            projectTeamService.removeAllTeamsFromProject(id);
            
            // Add new team assignments
            for (Long teamId : dto.getAssignedTeamIds()) {
                projectTeamService.assignTeamToProject(saved.getProjectId(), teamId);
            }
        }
        // Handle backward compatibility with single team assignment
        else if (dto.getAssignedTeamId() != null) {
            // Remove all existing team assignments
            projectTeamService.removeAllTeamsFromProject(id);
            // Add new single team assignment
            projectTeamService.assignTeamToProject(saved.getProjectId(), dto.getAssignedTeamId());
        }

        return convertToFullDTO(saved);
    }

    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with ID: " + id);
        }
        
        // Remove all team assignments first
        projectTeamService.removeAllTeamsFromProject(id);
        
        // Delete the project
        projectRepository.deleteById(id);
    }
}