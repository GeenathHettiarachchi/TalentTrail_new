package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.ProjectTeamDTO;
import com.internsystem.internmanagement.service.ProjectTeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project-teams")
@CrossOrigin(origins = "*")
public class ProjectTeamController {

    @Autowired
    private ProjectTeamService projectTeamService;

    @GetMapping
    public List<ProjectTeamDTO> getAllProjectTeams() {
        return projectTeamService.getAllProjectTeams();
    }

    @GetMapping("/project/{projectId}")
    public List<ProjectTeamDTO> getTeamsByProjectId(@PathVariable Long projectId) {
        return projectTeamService.getTeamsByProjectId(projectId);
    }

    @GetMapping("/team/{teamId}")
    public List<ProjectTeamDTO> getProjectsByTeamId(@PathVariable Long teamId) {
        return projectTeamService.getProjectsByTeamId(teamId);
    }

    @PostMapping
    public ResponseEntity<ProjectTeamDTO> assignTeamToProject(
            @RequestParam Long projectId, 
            @RequestParam Long teamId) {
        ProjectTeamDTO result = projectTeamService.assignTeamToProject(projectId, teamId);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeTeamFromProject(@PathVariable Long id) {
        projectTeamService.removeTeamFromProject(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/project/{projectId}/team/{teamId}")
    public ResponseEntity<Void> removeSpecificTeamFromProject(
            @PathVariable Long projectId, 
            @PathVariable Long teamId) {
        projectTeamService.removeTeamFromProject(projectId, teamId);
        return ResponseEntity.ok().build();
    }
}
