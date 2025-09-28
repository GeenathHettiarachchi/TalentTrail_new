package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.Function;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FunctionRepository extends JpaRepository<Function, Long> {
    List<Function> findByModuleModuleId(Long moduleId);
    Optional<Function> findByFunctionNameAndModuleModuleId(String functionName, Long moduleId);
}