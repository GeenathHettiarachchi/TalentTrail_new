package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.ProjectDocDTO;
import com.internsystem.internmanagement.entity.DocType;
import com.internsystem.internmanagement.entity.ProjectDoc;
import com.internsystem.internmanagement.service.ProjectDocService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectDocController {
    
    private final ProjectDocService projectDocService;
    
    @GetMapping("/api/projects/{projectId}/documents")
    public ResponseEntity<List<ProjectDocDTO>> getProjectDocuments(@PathVariable Long projectId) {
        try {
            List<ProjectDocDTO> documents = projectDocService.getProjectDocuments(projectId);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/api/projects/{projectId}/documents/{docType}")
    public ResponseEntity<ProjectDocDTO> getProjectDocument(
            @PathVariable Long projectId,
            @PathVariable DocType docType) {
        try {
            Optional<ProjectDocDTO> document = projectDocService.getProjectDocument(projectId, docType);
            return document.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Simple download endpoint without projectId validation
    @GetMapping("/api/documents/download/{documentId}")
    public ResponseEntity<byte[]> downloadDocumentSimple(@PathVariable Long documentId) {
        try {
            Optional<ProjectDoc> documentOpt = projectDocService.getDocument(documentId);
            if (documentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectDoc document = documentOpt.get();
            
            HttpHeaders headers = new HttpHeaders();
            
            // Set content type based on file type
            String contentType = document.getFileType();
            if (contentType != null) {
                headers.setContentType(MediaType.parseMediaType(contentType));
            } else {
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }
            
            // Set filename for download
            String filename = document.getFileName();
            if (filename != null) {
                headers.setContentDispositionFormData("attachment", filename);
            } else {
                headers.setContentDispositionFormData("attachment", document.getDocType() + "_document");
            }
            
            // Set content length
            headers.setContentLength(document.getDoc().length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document.getDoc());
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/api/projects/{projectId}/documents/download/{documentId}")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long projectId,
            @PathVariable Long documentId) {
        try {
            Optional<ProjectDoc> documentOpt = projectDocService.getDocument(documentId);
            if (documentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectDoc document = documentOpt.get();
            
            // Verify the document belongs to the project
            if (!document.getProject().getProjectId().equals(projectId)) {
                return ResponseEntity.notFound().build();
            }
            
            HttpHeaders headers = new HttpHeaders();
            
            // Set content type based on file type
            String contentType = document.getFileType();
            if (contentType != null) {
                headers.setContentType(MediaType.parseMediaType(contentType));
            } else {
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }
            
            // Set filename for download
            String filename = document.getFileName();
            if (filename != null) {
                headers.setContentDispositionFormData("attachment", filename);
            } else {
                headers.setContentDispositionFormData("attachment", document.getDocType() + "_document");
            }
            
            // Set content length
            headers.setContentLength(document.getDoc().length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document.getDoc());
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/api/projects/{projectId}/documents/{docType}")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long projectId,
            @PathVariable DocType docType,
            @RequestParam("file") MultipartFile file) {
        try {
            ProjectDocDTO savedDocument = projectDocService.uploadDocument(projectId, docType, file);
            return ResponseEntity.ok(savedDocument);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process file"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/api/projects/{projectId}/documents/{docType}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long projectId,
            @PathVariable DocType docType) {
        try {
            projectDocService.deleteDocument(projectId, docType);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
