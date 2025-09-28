package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.TestCaseDTO;
import com.internsystem.internmanagement.service.TestCaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-cases")
@CrossOrigin(origins = "*")
public class TestCaseController {

    @Autowired
    private TestCaseService testCaseService;

    @GetMapping
    public List<TestCaseDTO> getAll() {
        return testCaseService.getAllTestCases();
    }

    @GetMapping("/function/{functionId}")
    public List<TestCaseDTO> getByFunctionId(@PathVariable Long functionId) {
        return testCaseService.getTestCasesByFunctionId(functionId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestCaseDTO> getById(@PathVariable Long id) {
        return testCaseService.getTestCaseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TestCaseDTO create(@RequestBody TestCaseDTO dto) {
        return testCaseService.createTestCase(dto);
    }

    @PutMapping("/{id}")
    public TestCaseDTO update(@PathVariable Long id, @RequestBody TestCaseDTO dto) {
        return testCaseService.updateTestCase(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        testCaseService.deleteTestCase(id);
    }
}