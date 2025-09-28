package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.service.ModuleImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = "*")
public class ModuleImportController {

    @Autowired
    private ModuleImportService moduleImportService;

    @PostMapping("/import/{projectId}")
    public ResponseEntity<?> importModulesAndFunctions(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            String filename = file.getOriginalFilename();
            if (filename == null || (!filename.toLowerCase().endsWith(".csv") && 
                                  !filename.toLowerCase().endsWith(".xlsx") && 
                                  !filename.toLowerCase().endsWith(".xls"))) {
                return ResponseEntity.badRequest().body("Invalid file format. Only CSV and Excel files are supported.");
            }

            ModuleImportService.ModuleImportResult result = moduleImportService.importModulesAndFunctions(file, projectId);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Import failed: " + e.getMessage());
        }
    }

    @GetMapping("/export/csv/{projectId}")
    public ResponseEntity<String> exportModulesAndFunctionsCsv(@PathVariable Long projectId) {
        try {
            String csvData = moduleImportService.exportModulesAndFunctions(projectId);
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "modules_functions_project_" + projectId + "_" + timestamp + ".csv";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", filename);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Export failed: " + e.getMessage());
        }
    }

    @GetMapping("/export/excel/{projectId}")
    public ResponseEntity<byte[]> exportModulesAndFunctionsExcel(@PathVariable Long projectId) {
        try {
            byte[] excelData = moduleImportService.exportModulesAndFunctionsAsExcel(projectId);
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "modules_functions_project_" + projectId + "_" + timestamp + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(excelData);
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/template/csv")
    public ResponseEntity<String> downloadCsvTemplate() {
        try {
            String csvTemplate = "module_name,module_description,module_owner_intern_code,module_status,function_name,function_description,function_developer_intern_code,function_status\n" +
                               "Authentication,Enables a user to log in to the system,1234,NOT_STARTED,Admin Login,Enables an admin to login via credentials,1234,PENDING\n" +
                               "Authentication,Enables a user to log in to the system,1234,NOT_STARTED,Intern Login via Google,Enables an intern to login via Google OAuth,1235,IN_DEVELOPMENT\n" +
                               "Bulk Data IO,Enables an admin to import data in bulks,1236,IN_PROGRESS,Import Bulk Data,Enables admin to import data of all Project Managers (and others),1236,IN_DEVELOPMENT\n" +
                               "Bulk Data IO,Enables an admin to import data in bulks,1236,IN_PROGRESS,Export Data,Enables admin to export data,1236,PENDING";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "module_template.csv");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(csvTemplate);
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Template download failed: " + e.getMessage());
        }
    }
}
