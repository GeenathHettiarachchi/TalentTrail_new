package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.service.BulkImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/bulk-import")
@CrossOrigin(origins = "*")
public class BulkImportController {

    @Autowired
    private BulkImportService bulkImportService;

    @PostMapping("/upload")
    public ResponseEntity<BulkImportService.BulkImportResult> uploadBulkData(
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            BulkImportService.BulkImportResult result = new BulkImportService.BulkImportResult();
            result.addError(0, "No file uploaded");
            return ResponseEntity.badRequest().body(result);
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || 
            (!filename.toLowerCase().endsWith(".csv") && !filename.toLowerCase().endsWith(".xlsx"))) {
            BulkImportService.BulkImportResult result = new BulkImportService.BulkImportResult();
            result.addError(0, "Only CSV and Excel (.xlsx) files are supported");
            return ResponseEntity.badRequest().body(result);
        }
        
        try {
            BulkImportService.BulkImportResult result = bulkImportService.importBulkData(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            BulkImportService.BulkImportResult result = new BulkImportService.BulkImportResult();
            result.addError(0, "Upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportData() {
        try {
            String csvContent = bulkImportService.exportBulkData();
            
            // Create temporary file
            Path tempPath = Files.createTempFile("intern-data-export", ".csv");
            Files.write(tempPath, csvContent.getBytes());
            
            Resource resource = new org.springframework.core.io.FileSystemResource(tempPath.toFile());
            
            // Generate filename with current date
            String today = java.time.LocalDate.now().toString();
            String filename = "intern-data-export-" + today + ".csv";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(resource);
                    
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/excel")
    public ResponseEntity<Resource> exportDataAsExcel() {
        try {
            byte[] excelContent = bulkImportService.exportBulkDataAsExcel();
            
            // Create temporary file
            Path tempPath = Files.createTempFile("intern-data-export", ".xlsx");
            Files.write(tempPath, excelContent);
            
            Resource resource = new org.springframework.core.io.FileSystemResource(tempPath.toFile());
            
            // Generate filename with current date
            String today = java.time.LocalDate.now().toString();
            String filename = "intern-data-export-" + today + ".xlsx";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(resource);
                    
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
