package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByProjectProjectId(Long projectId);
    Optional<Module> findByModuleNameAndProjectProjectId(String moduleName, Long projectId);
}