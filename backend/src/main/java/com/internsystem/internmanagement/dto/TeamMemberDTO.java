package com.internsystem.internmanagement.dto;

import lombok.Data;

@Data
public class TeamMemberDTO {
    private Long id;
    private Long teamId;
    private String teamName;
    private Long internId;
    private String internName;
}
