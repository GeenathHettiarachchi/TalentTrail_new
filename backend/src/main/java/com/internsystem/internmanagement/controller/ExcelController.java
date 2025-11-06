package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.service.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExcelController {

    private final ExcelService excelService;

    @GetMapping("/devops-resources")
    public ResponseEntity<List<String>> getDevOpsResources() {
        return ResponseEntity.ok(excelService.getDevOpsResourceTypes());
    }

    @GetMapping("/qa-resources")
    public ResponseEntity<List<String>> getQAResources() {
        return ResponseEntity.ok(excelService.getQAResourceTypes());
    }

    @GetMapping("/webdev-resources")
    public ResponseEntity<List<String>> getWebDevResources() {
        return ResponseEntity.ok(excelService.getWebDevResourceTypes());
    }
}
