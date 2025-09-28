package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.DocType;
import com.internsystem.internmanagement.entity.ProjectDoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectDocRepository extends JpaRepository<ProjectDoc, Long> {
    
    List<ProjectDoc> findByProjectProjectId(Long projectId);
    
    Optional<ProjectDoc> findByProjectProjectIdAndDocType(Long projectId, DocType docType);
    
    void deleteByProjectProjectIdAndDocType(Long projectId, DocType docType);
    
    boolean existsByProjectProjectIdAndDocType(Long projectId, DocType docType);
}
