package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.dto.TestCaseDTO;
import com.internsystem.internmanagement.entity.TestCase;
import com.internsystem.internmanagement.entity.Function;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.mapper.TestCaseMapper;
import com.internsystem.internmanagement.repository.TestCaseRepository;
import com.internsystem.internmanagement.repository.FunctionRepository;
import com.internsystem.internmanagement.repository.InternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TestCaseService {

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private FunctionRepository functionRepository;

    @Autowired
    private InternRepository internRepository;

    public List<TestCaseDTO> getAllTestCases() {
        return testCaseRepository.findAll()
                .stream()
                .map(TestCaseMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<TestCaseDTO> getTestCasesByFunctionId(Long functionId) {
        return testCaseRepository.findByFunctionFunctionId(functionId)
                .stream()
                .map(TestCaseMapper::toDTO)
                .collect(Collectors.toList());
    }

    public TestCaseDTO createTestCase(TestCaseDTO dto) {
        Function function = functionRepository.findById(dto.getFunctionId())
                .orElseThrow(() -> new RuntimeException("Function not found"));
        Intern createdBy = null;
        if (dto.getCreatedByInternId() != null) {
            createdBy = internRepository.findById(dto.getCreatedByInternId())
                    .orElseThrow(() -> new RuntimeException("Created By Intern not found"));
        }
        Intern executedBy = null;
        if (dto.getExecutedByInternId() != null) {
            executedBy = internRepository.findById(dto.getExecutedByInternId())
                    .orElseThrow(() -> new RuntimeException("Executed By Intern not found"));
        }
        TestCase testCase = TestCaseMapper.toEntity(dto, function, createdBy, executedBy);
        TestCase saved = testCaseRepository.save(testCase);
        return TestCaseMapper.toDTO(saved);
    }

    public Optional<TestCaseDTO> getTestCaseById(Long id) {
        return testCaseRepository.findById(id).map(TestCaseMapper::toDTO);
    }

    public TestCaseDTO updateTestCase(Long id, TestCaseDTO dto) {
        TestCase testCase = testCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test Case not found"));
        Function function = functionRepository.findById(dto.getFunctionId())
                .orElseThrow(() -> new RuntimeException("Function not found"));
        Intern createdBy = null;
        if (dto.getCreatedByInternId() != null) {
            createdBy = internRepository.findById(dto.getCreatedByInternId())
                    .orElseThrow(() -> new RuntimeException("Created By Intern not found"));
        }
        Intern executedBy = null;
        if (dto.getExecutedByInternId() != null) {
            executedBy = internRepository.findById(dto.getExecutedByInternId())
                    .orElseThrow(() -> new RuntimeException("Executed By Intern not found"));
        }
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
        TestCase saved = testCaseRepository.save(testCase);
        return TestCaseMapper.toDTO(saved);
    }

    public void deleteTestCase(Long id) {
        testCaseRepository.deleteById(id);
    }
}