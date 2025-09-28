package com.internsystem.internmanagement.dto;

import com.internsystem.internmanagement.entity.ProjectStatus;
import com.internsystem.internmanagement.entity.RepoHost;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectDTO {
    private Long projectId;
    private String projectName;
    private String description;
    private LocalDate startDate;
    private LocalDate targetDate;
    private ProjectStatus status;
    private Long projectManagerId;
    private String projectManagerName;
    private Long projectManagerAuthId;
    private List<Long> assignedTeamIds;
    private List<String> assignedTeamNames;
    private RepoHost repoHost;
    private String repoName;
    private String repoAccessToken;
    
    // For backward compatibility (deprecated fields)
    @Deprecated
    private Long assignedTeamId;
    @Deprecated
    private String assignedTeamName;
}