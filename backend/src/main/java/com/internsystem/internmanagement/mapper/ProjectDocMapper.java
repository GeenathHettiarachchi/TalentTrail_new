package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.ProjectDocDTO;
import com.internsystem.internmanagement.entity.ProjectDoc;
import org.springframework.stereotype.Component;

@Component
public class ProjectDocMapper {
    
    public ProjectDocDTO toDTO(ProjectDoc projectDoc) {
        if (projectDoc == null) {
            return null;
        }
        
        ProjectDocDTO dto = new ProjectDocDTO();
        dto.setId(projectDoc.getId());
        dto.setProjectId(projectDoc.getProject().getProjectId());
        dto.setDocType(projectDoc.getDocType());
        dto.setFileName(projectDoc.getFileName());
        dto.setFileType(projectDoc.getFileType());
        dto.setFileSize(projectDoc.getFileSize());
        dto.setCreatedAt(projectDoc.getCreatedAt());
        dto.setUpdatedAt(projectDoc.getUpdatedAt());
        
        return dto;
    }
}
