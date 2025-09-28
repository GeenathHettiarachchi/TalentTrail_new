package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.dto.TeamDTO;
import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.mapper.TeamMapper;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.entity.Team;
import com.internsystem.internmanagement.entity.TeamMember;
import com.internsystem.internmanagement.exception.ExistingResourceException;
import com.internsystem.internmanagement.exception.ResourceNotFoundException;
import com.internsystem.internmanagement.repository.InternRepository;
import com.internsystem.internmanagement.repository.TeamRepository;
import com.internsystem.internmanagement.repository.TeamMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;
    
    @Autowired
    private InternAuthUserLinkService internAuthUserLinkService;

    public List<TeamDTO> getAllTeams() {
        return teamRepository.findAll()
                .stream()
                .map(TeamMapper::toDTO)
                .collect(Collectors.toList());
    }

    public TeamDTO createTeam(TeamDTO dto) {
        // Check if team name already exists
        if (teamRepository.findByTeamName(dto.getTeamName()).isPresent()) {
            throw new ExistingResourceException("A team with name '" + dto.getTeamName() + "' already exists");
        }
        
        Intern leader = internRepository.findById(dto.getTeamLeaderId())
                .orElseThrow(() -> new ResourceNotFoundException("Team Leader not found with ID: " + dto.getTeamLeaderId()));
        
        // Find corresponding AuthUser
        Optional<AuthUser> leaderAuthUserOpt = internAuthUserLinkService.findAuthUserForIntern(leader);
        if (leaderAuthUserOpt.isEmpty()) {
            throw new ResourceNotFoundException("No AuthUser found for the specified team leader");
        }
        AuthUser leaderAuthUser = leaderAuthUserOpt.get();
        
        Team team = TeamMapper.toEntity(dto, leader, leaderAuthUser);
        Team saved = teamRepository.save(team);
        
        // Automatically add the team leader as a team member if not already a member
        boolean isLeaderAlreadyMember = teamMemberRepository.existsByTeamTeamIdAndInternInternId(
            saved.getTeamId(), leader.getInternId()
        );
        
        if (!isLeaderAlreadyMember) {
            TeamMember leaderMember = new TeamMember();
            leaderMember.setTeam(saved);
            leaderMember.setIntern(leader);
            teamMemberRepository.save(leaderMember);
        }
        
        return TeamMapper.toDTO(saved);
    }

    public Optional<TeamDTO> getTeamById(Long id) {
        return teamRepository.findById(id).map(TeamMapper::toDTO);
    }

    public TeamDTO updateTeam(Long id, TeamDTO dto) {
        Team existing = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));
        
        // Check if trying to update team name to one that already exists (for a different team)
        if (!existing.getTeamName().equals(dto.getTeamName())) {
            Optional<Team> existingTeam = teamRepository.findByTeamName(dto.getTeamName());
            if (existingTeam.isPresent() && !existingTeam.get().getTeamId().equals(id)) {
                throw new ExistingResourceException("A team with name '" + dto.getTeamName() + "' already exists");
            }
        }
        
        Intern leader = internRepository.findById(dto.getTeamLeaderId())
                .orElseThrow(() -> new ResourceNotFoundException("Team Leader not found with ID: " + dto.getTeamLeaderId()));

        // Find corresponding AuthUser
        Optional<AuthUser> leaderAuthUserOpt = internAuthUserLinkService.findAuthUserForIntern(leader);
        if (leaderAuthUserOpt.isEmpty()) {
            throw new ResourceNotFoundException("No AuthUser found for the specified team leader");
        }
        AuthUser leaderAuthUser = leaderAuthUserOpt.get();

        // If the team leader has changed, update team membership
        if (!existing.getTeamLeader().getInternId().equals(dto.getTeamLeaderId())) {
            // Add new leader as team member if not already a member
            boolean isNewLeaderMember = teamMemberRepository.existsByTeamTeamIdAndInternInternId(id, dto.getTeamLeaderId());
            if (!isNewLeaderMember) {
                TeamMember newLeaderMember = new TeamMember();
                newLeaderMember.setTeam(existing);
                newLeaderMember.setIntern(leader);
                teamMemberRepository.save(newLeaderMember);
            }
        }

        existing.setTeamName(dto.getTeamName());
        existing.setTeamLeader(leader);
        existing.setTeamLeaderAuthUser(leaderAuthUser);

        return TeamMapper.toDTO(teamRepository.save(existing));
    }

    @Transactional
    public void deleteTeam(Long id) {
        if (!teamRepository.existsById(id)) {
            throw new ResourceNotFoundException("Team not found with ID: " + id);
        }
        
        // First delete all team members for this team
        teamMemberRepository.deleteByTeamTeamId(id);
        
        // Then delete the team
        teamRepository.deleteById(id);
    }
}
