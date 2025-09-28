package com.internsystem.internmanagement.dto;

import lombok.Data;

@Data
public class TeamDTO {
    private Long teamId;
    private String teamName;
    private Long teamLeaderId;
    private String teamLeaderName;
    private Long teamLeaderAuthId;
}
