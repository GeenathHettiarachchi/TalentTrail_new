package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.ProjectTeamDTO;
import com.internsystem.internmanagement.entity.ProjectTeam;

public class ProjectTeamMapper {

    public static ProjectTeamDTO toDTO(ProjectTeam entity) {
        ProjectTeamDTO dto = new ProjectTeamDTO();
        dto.setId(entity.getId());
        if (entity.getProject() != null) {
            dto.setProjectId(entity.getProject().getProjectId());
            dto.setProjectName(entity.getProject().getProjectName());
        }
        if (entity.getTeam() != null) {
            dto.setTeamId(entity.getTeam().getTeamId());
            dto.setTeamName(entity.getTeam().getTeamName());
        }
        return dto;
    }
}
