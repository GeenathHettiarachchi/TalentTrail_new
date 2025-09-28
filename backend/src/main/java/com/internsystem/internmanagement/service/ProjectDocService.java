package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.dto.ProjectDocDTO;
import com.internsystem.internmanagement.entity.DocType;
import com.internsystem.internmanagement.entity.Project;
import com.internsystem.internmanagement.entity.ProjectDoc;
import com.internsystem.internmanagement.mapper.ProjectDocMapper;
import com.internsystem.internmanagement.repository.ProjectDocRepository;
import com.internsystem.internmanagement.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectDocService {
    
    private final ProjectDocRepository projectDocRepository;
    private final ProjectRepository projectRepository;
    private final ProjectDocMapper projectDocMapper;
    
    private static final List<String> ALLOWED_FILE_TYPES = Arrays.asList(
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg"
    );
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    public List<ProjectDocDTO> getProjectDocuments(Long projectId) {
        List<ProjectDoc> documents = projectDocRepository.findByProjectProjectId(projectId);
        return documents.stream()
                .map(projectDocMapper::toDTO)
                .toList();
    }
    
    public Optional<ProjectDocDTO> getProjectDocument(Long projectId, DocType docType) {
        Optional<ProjectDoc> document = projectDocRepository.findByProjectProjectIdAndDocType(projectId, docType);
        return document.map(projectDocMapper::toDTO);
    }
    
    public byte[] getDocumentFile(Long documentId) {
        Optional<ProjectDoc> document = projectDocRepository.findById(documentId);
        return document.map(ProjectDoc::getDoc).orElse(null);
    }
    
    public Optional<ProjectDoc> getDocument(Long documentId) {
        return projectDocRepository.findById(documentId);
    }
    
    @Transactional
    public ProjectDocDTO uploadDocument(Long projectId, DocType docType, MultipartFile file) throws IOException {
        // Validate file
        validateFile(file);
        
        // Get project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        // Check if document already exists and delete it
        Optional<ProjectDoc> existingDoc = projectDocRepository.findByProjectProjectIdAndDocType(projectId, docType);
        existingDoc.ifPresent(projectDocRepository::delete);
        
        // Create new document
        ProjectDoc projectDoc = new ProjectDoc();
        projectDoc.setProject(project);
        projectDoc.setDocType(docType);
        projectDoc.setFileName(file.getOriginalFilename());
        projectDoc.setFileType(file.getContentType());
        projectDoc.setFileSize(file.getSize());
        projectDoc.setDoc(file.getBytes());
        
        ProjectDoc savedDoc = projectDocRepository.save(projectDoc);
        return projectDocMapper.toDTO(savedDoc);
    }
    
    @Transactional
    public void deleteDocument(Long projectId, DocType docType) {
        Optional<ProjectDoc> document = projectDocRepository.findByProjectProjectIdAndDocType(projectId, docType);
        document.ifPresent(projectDocRepository::delete);
    }
    
    @Transactional
    public void deleteDocument(Long documentId) {
        projectDocRepository.deleteById(documentId);
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit of 10MB");
        }
        
        if (!ALLOWED_FILE_TYPES.contains(file.getContentType())) {
            throw new RuntimeException("File type not allowed. Only PDF, PNG, JPG, and JPEG files are accepted");
        }
    }
}
