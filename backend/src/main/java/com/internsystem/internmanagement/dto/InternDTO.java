package com.internsystem.internmanagement.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class InternDTO {
    private Long internId;
    private String internCode;
    private String name;
    private String email;
    private String institute;
    private LocalDate trainingStartDate;
    private LocalDate trainingEndDate;
    
    // NEW FIELDS
    private String fieldOfSpecialization;
    private List<String> skills;
    private String workingBranch;
    private String degree;
    private String role;
    private List<String> languagesAndFrameworks;
    private List<String> projects;
}