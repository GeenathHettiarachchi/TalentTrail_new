package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.ProjectDTO;
import com.internsystem.internmanagement.dto.RepoAnalyticsDTO;
import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.service.AuthenticationService;
import com.internsystem.internmanagement.service.AuthorizationService;
import com.internsystem.internmanagement.service.ProjectService;
import com.internsystem.internmanagement.service.RepoAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private RepoAnalyticsService repoAnalyticsService;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private AuthorizationService authorizationService;

    @GetMapping
    public List<ProjectDTO> getAll() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> create(@RequestBody ProjectDTO dto, 
                                           @RequestHeader("Authorization") String authHeader) {
        Optional<AuthUser> currentUser = authenticationService.getCurrentUser(authHeader);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Only admins can create projects (or you can modify this logic as needed)
        if (currentUser.get().getRole() != AuthUser.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(projectService.createProject(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> update(@PathVariable Long id, 
                                           @RequestBody ProjectDTO dto,
                                           @RequestHeader("Authorization") String authHeader) {
        Optional<AuthUser> currentUser = authenticationService.getCurrentUser(authHeader);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!authorizationService.canEditProject(currentUser.get(), id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                     @RequestHeader("Authorization") String authHeader) {
        Optional<AuthUser> currentUser = authenticationService.getCurrentUser(authHeader);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!authorizationService.canEditProject(currentUser.get(), id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        projectService.deleteProject(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/repo-analytics")
    public ResponseEntity<RepoAnalyticsDTO> getRepoAnalytics(@PathVariable Long id) {
        RepoAnalyticsDTO dto = repoAnalyticsService.getAnalyticsForProject(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/permissions")
    public ResponseEntity<Boolean> canEdit(@PathVariable Long id,
                                         @RequestHeader("Authorization") String authHeader) {
        Optional<AuthUser> currentUser = authenticationService.getCurrentUser(authHeader);
        if (currentUser.isEmpty()) {
            return ResponseEntity.ok(false);
        }

        boolean canEdit = authorizationService.canEditProject(currentUser.get(), id);
        return ResponseEntity.ok(canEdit);
    }
}