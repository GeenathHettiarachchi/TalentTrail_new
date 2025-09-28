package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.TestCaseDTO;
import com.internsystem.internmanagement.entity.TestCase;
import com.internsystem.internmanagement.entity.Function;
import com.internsystem.internmanagement.entity.Intern;

public class TestCaseMapper {

    public static TestCaseDTO toDTO(TestCase testCase) {
        TestCaseDTO dto = new TestCaseDTO();
        dto.setTestCaseId(testCase.getTestCaseId());
        dto.setTestCaseName(testCase.getTestCaseName());
        dto.setDescription(testCase.getDescription());
        dto.setExpectedOutput(testCase.getExpectedOutput());
        dto.setActualOutput(testCase.getActualOutput());
        dto.setStatus(testCase.getStatus());
        if (testCase.getFunction() != null) {
            dto.setFunctionId(testCase.getFunction().getFunctionId());
            dto.setFunctionName(testCase.getFunction().getFunctionName());
        }
        if (testCase.getCreatedByIntern() != null) {
            dto.setCreatedByInternId(testCase.getCreatedByIntern().getInternId());
            dto.setCreatedByInternName(testCase.getCreatedByIntern().getName());
        }
        if (testCase.getExecutedByIntern() != null) {
            dto.setExecutedByInternId(testCase.getExecutedByIntern().getInternId());
            dto.setExecutedByInternName(testCase.getExecutedByIntern().getName());
        }
        dto.setExecutionDate(testCase.getExecutionDate());
        dto.setIsAutomated(testCase.getIsAutomated());
        dto.setRemarks(testCase.getRemarks());
        return dto;
    }

    public static TestCase toEntity(TestCaseDTO dto, Function function, Intern createdBy, Intern executedBy) {
        TestCase testCase = new TestCase();
        testCase.setTestCaseId(dto.getTestCaseId());
        testCase.setTestCaseName(dto.getTestCaseName());
        testCase.setDescription(dto.getDescription());
        testCase.setExpectedOutput(dto.getExpectedOutput());
        testCase.setActualOutput(dto.getActualOutput());
        testCase.setStatus(dto.getStatus());
        testCase.setFunction(function);
        testCase.setCreatedByIntern(createdBy);
        testCase.setExecutedByIntern(executedBy);
        testCase.setExecutionDate(dto.getExecutionDate());
        testCase.setIsAutomated(dto.getIsAutomated());
        testCase.setRemarks(dto.getRemarks());
        return testCase;
    }
}