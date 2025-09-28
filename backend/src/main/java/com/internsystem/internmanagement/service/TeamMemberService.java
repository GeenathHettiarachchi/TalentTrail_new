package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.dto.TeamMemberDTO;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.entity.Team;
import com.internsystem.internmanagement.entity.TeamMember;
import com.internsystem.internmanagement.mapper.TeamMemberMapper;
import com.internsystem.internmanagement.repository.InternRepository;
import com.internsystem.internmanagement.repository.TeamMemberRepository;
import com.internsystem.internmanagement.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeamMemberService {

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private InternRepository internRepository;

    public List<TeamMemberDTO> getAllTeamMembers() {
        return teamMemberRepository.findAll()
                .stream()
                .map(TeamMemberMapper::toDTO)
                .collect(Collectors.toList());
    }

    public TeamMemberDTO assignInternToTeam(Long teamId, Long internId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found"));

        // Check if intern is already a member of this specific team
        if (teamMemberRepository.existsByTeamTeamIdAndInternInternId(teamId, internId)) {
            throw new RuntimeException("Intern is already a member of this team");
        }

        TeamMember teamMember = new TeamMember();
        teamMember.setTeam(team);
        teamMember.setIntern(intern);

        TeamMember saved = teamMemberRepository.save(teamMember);
        return TeamMemberMapper.toDTO(saved);
    }

    public void removeTeamMember(Long id) {
        teamMemberRepository.deleteById(id);
    }

    public Optional<TeamMemberDTO> getTeamMemberById(Long id) {
        return teamMemberRepository.findById(id).map(TeamMemberMapper::toDTO);
    }
}