package com.internsystem.internmanagement.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class InternDTO {
    private Long internId;
    private String internCode;
    private String name;
    private String email;
    private String institute;
    private LocalDate trainingStartDate;
    private LocalDate trainingEndDate;
}
