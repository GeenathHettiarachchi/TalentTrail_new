package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.entity.Team;
import com.internsystem.internmanagement.dto.TeamDTO;

public class TeamMapper {

    public static TeamDTO toDTO(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setTeamId(team.getTeamId());
        dto.setTeamName(team.getTeamName());
        if (team.getTeamLeader() != null) {
            dto.setTeamLeaderId(team.getTeamLeader().getInternId());
            dto.setTeamLeaderName(team.getTeamLeader().getName());
        }
        if (team.getTeamLeaderAuthUser() != null) {
            dto.setTeamLeaderAuthId(team.getTeamLeaderAuthUser().getId());
        }
        return dto;
    }

    public static Team toEntity(TeamDTO dto, Intern leader) {
        Team team = new Team();
        team.setTeamId(dto.getTeamId());
        team.setTeamName(dto.getTeamName());
        team.setTeamLeader(leader);
        return team;
    }

    public static Team toEntity(TeamDTO dto, Intern leader, AuthUser leaderAuthUser) {
        Team team = toEntity(dto, leader);
        team.setTeamLeaderAuthUser(leaderAuthUser);
        return team;
    }
}
