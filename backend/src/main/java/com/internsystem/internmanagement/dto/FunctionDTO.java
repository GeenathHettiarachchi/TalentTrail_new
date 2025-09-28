package com.internsystem.internmanagement.dto;

import com.internsystem.internmanagement.entity.FunctionStatus;
import lombok.Data;

@Data
public class FunctionDTO {
    private Long functionId;
    private String functionName;
    private String description;
    private Long moduleId;
    private String moduleName;
    private Long developerInternId;
    private String developerInternName;
    private FunctionStatus status;
}