package com.internsystem.internmanagement.dto;

import lombok.Data;

@Data
public class ProjectTeamDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long teamId;
    private String teamName;
}
