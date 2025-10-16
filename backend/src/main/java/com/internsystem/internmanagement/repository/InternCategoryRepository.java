package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.InternCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternCategoryRepository extends JpaRepository<InternCategory, Integer> {
}