package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.TeamMemberDTO;
import com.internsystem.internmanagement.entity.TeamMember;

public class TeamMemberMapper {

    public static TeamMemberDTO toDTO(TeamMember entity) {
        TeamMemberDTO dto = new TeamMemberDTO();
        dto.setId(entity.getId());
        if (entity.getTeam() != null) {
            dto.setTeamId(entity.getTeam().getTeamId());
            dto.setTeamName(entity.getTeam().getTeamName());
        }
        if (entity.getIntern() != null) {
            dto.setInternId(entity.getIntern().getInternId());
            dto.setInternName(entity.getIntern().getName());
        }
        return dto;
    }
}
