package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.TeamDTO;
import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.service.AuthenticationService;
import com.internsystem.internmanagement.service.AuthorizationService;
import com.internsystem.internmanagement.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private AuthorizationService authorizationService;

    @GetMapping
    public List<TeamDTO> getAllTeams() {
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getById(@PathVariable Long id) {
        return teamService.getTeamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TeamDTO> create(@RequestBody TeamDTO dto,
                                        @RequestHeader("Authorization") String authHeader) {
        Optional<AuthUser> currentUser = authenticationService.getCurrentUser(authHeader);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Only admins can create teams (or you can modify this logic as needed)
        if (currentUser.get().getRole() != AuthUser.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(teamService.createTeam(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamDTO> update(@PathVariable Long id, 
                                        @RequestBody TeamDTO dto,
                                        @RequestHeader("Authorization") String authHeader) {
        Optional<AuthUser> currentUser = authenticationService.getCurrentUser(authHeader);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!authorizationService.canEditTeam(currentUser.get(), id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(teamService.updateTeam(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                     @RequestHeader("Authorization") String authHeader) {
        Optional<AuthUser> currentUser = authenticationService.getCurrentUser(authHeader);
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!authorizationService.canEditTeam(currentUser.get(), id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        teamService.deleteTeam(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/permissions")
    public ResponseEntity<Boolean> canEdit(@PathVariable Long id,
                                         @RequestHeader("Authorization") String authHeader) {
        Optional<AuthUser> currentUser = authenticationService.getCurrentUser(authHeader);
        if (currentUser.isEmpty()) {
            return ResponseEntity.ok(false);
        }

        boolean canEdit = authorizationService.canEditTeam(currentUser.get(), id);
        return ResponseEntity.ok(canEdit);
    }
}
