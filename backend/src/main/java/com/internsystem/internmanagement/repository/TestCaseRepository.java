package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByFunctionFunctionId(Long functionId);
}