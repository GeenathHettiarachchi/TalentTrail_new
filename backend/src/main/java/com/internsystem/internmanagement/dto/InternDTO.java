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
    private String mobileNumber;
    private List<String> skills;   // This will catch "tools" or "resourceType"
    private List<String> projects;
}
