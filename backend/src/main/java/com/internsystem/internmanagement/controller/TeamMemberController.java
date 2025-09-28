package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.TeamMemberDTO;
import com.internsystem.internmanagement.service.TeamMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-members")
@CrossOrigin(origins = "*")
public class TeamMemberController {

    @Autowired
    private TeamMemberService teamMemberService;

    @GetMapping
    public List<TeamMemberDTO> getAll() {
        return teamMemberService.getAllTeamMembers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamMemberDTO> getById(@PathVariable Long id) {
        return teamMemberService.getTeamMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TeamMemberDTO assign(@RequestParam Long teamId, @RequestParam Long internId) {
        return teamMemberService.assignInternToTeam(teamId, internId);
    }

    @DeleteMapping("/{id}")
    public void remove(@PathVariable Long id) {
        teamMemberService.removeTeamMember(id);
    }
}
