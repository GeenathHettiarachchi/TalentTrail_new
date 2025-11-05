package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.service.ExcelService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/excel")
@CrossOrigin(origins = "*")
public class ExcelController {

    private final ExcelService excelService;

    public ExcelController(ExcelService excelService) {
        this.excelService = excelService;
    }

    @GetMapping("/resource-types")
    public List<String> getResourceTypes() {
        return excelService.getResourceTypes();
    }
}
