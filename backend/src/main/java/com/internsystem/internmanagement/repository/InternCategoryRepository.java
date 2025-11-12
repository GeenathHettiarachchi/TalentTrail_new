package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.InternCategory;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternCategoryRepository extends JpaRepository<InternCategory, Integer> {
    Optional<InternCategory> findByCategoryName(String categoryName);
}