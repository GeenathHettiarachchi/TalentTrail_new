package com.internsystem.internmanagement.dto;

import com.internsystem.internmanagement.entity.TestCaseStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TestCaseDTO {
    private Long testCaseId;
    private String testCaseName;
    private String description;
    private String expectedOutput;
    private String actualOutput;
    private TestCaseStatus status;
    private Long functionId;
    private String functionName;
    private Long createdByInternId;
    private String createdByInternName;
    private Long executedByInternId;
    private String executedByInternName;
    private LocalDate executionDate;
    private Boolean isAutomated;
    private String remarks;
}