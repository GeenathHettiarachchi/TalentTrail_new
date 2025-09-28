package com.internsystem.internmanagement.dto;

import com.internsystem.internmanagement.entity.ModuleStatus;
import lombok.Data;

@Data
public class ModuleDTO {
    private Long moduleId;
    private String moduleName;
    private String description;
    private Long projectId;
    private String projectName;
    private Long ownerInternId;
    private String ownerInternName;
    private ModuleStatus status;
}