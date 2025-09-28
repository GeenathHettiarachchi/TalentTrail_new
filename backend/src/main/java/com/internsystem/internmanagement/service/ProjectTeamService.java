package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.dto.ProjectTeamDTO;
import com.internsystem.internmanagement.entity.Project;
import com.internsystem.internmanagement.entity.ProjectTeam;
import com.internsystem.internmanagement.entity.Team;
import com.internsystem.internmanagement.exception.ExistingResourceException;
import com.internsystem.internmanagement.exception.ResourceNotFoundException;
import com.internsystem.internmanagement.mapper.ProjectTeamMapper;
import com.internsystem.internmanagement.repository.ProjectRepository;
import com.internsystem.internmanagement.repository.ProjectTeamRepository;
import com.internsystem.internmanagement.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectTeamService {

    @Autowired
    private ProjectTeamRepository projectTeamRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamRepository teamRepository;

    public List<ProjectTeamDTO> getAllProjectTeams() {
        return projectTeamRepository.findAll()
                .stream()
                .map(ProjectTeamMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectTeamDTO> getTeamsByProjectId(Long projectId) {
        return projectTeamRepository.findByProjectProjectId(projectId)
                .stream()
                .map(ProjectTeamMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectTeamDTO> getProjectsByTeamId(Long teamId) {
        return projectTeamRepository.findByTeamTeamId(teamId)
                .stream()
                .map(ProjectTeamMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectTeamDTO assignTeamToProject(Long projectId, Long teamId) {
        // Check if project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Check if team exists
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        // Check if assignment already exists
        Optional<ProjectTeam> existing = projectTeamRepository.findByProjectProjectIdAndTeamTeamId(projectId, teamId);
        if (existing.isPresent()) {
            throw new ExistingResourceException("Team is already assigned to this project");
        }

        // Create new assignment
        ProjectTeam projectTeam = new ProjectTeam();
        projectTeam.setProject(project);
        projectTeam.setTeam(team);

        ProjectTeam saved = projectTeamRepository.save(projectTeam);
        return ProjectTeamMapper.toDTO(saved);
    }

    @Transactional
    public void removeTeamFromProject(Long projectTeamId) {
        if (!projectTeamRepository.existsById(projectTeamId)) {
            throw new ResourceNotFoundException("Project team assignment not found with ID: " + projectTeamId);
        }
        projectTeamRepository.deleteById(projectTeamId);
    }

    @Transactional
    public void removeTeamFromProject(Long projectId, Long teamId) {
        ProjectTeam projectTeam = projectTeamRepository.findByProjectProjectIdAndTeamTeamId(projectId, teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Project team assignment not found"));
        projectTeamRepository.delete(projectTeam);
    }

    @Transactional
    public void removeAllTeamsFromProject(Long projectId) {
        projectTeamRepository.deleteByProjectProjectId(projectId);
    }

    @Transactional
    public void removeAllProjectsFromTeam(Long teamId) {
        projectTeamRepository.deleteByTeamTeamId(teamId);
    }
}
