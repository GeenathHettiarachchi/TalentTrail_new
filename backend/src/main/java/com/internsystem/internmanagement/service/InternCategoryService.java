package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.entity.InternCategory;
import com.internsystem.internmanagement.repository.InternCategoryRepository;
import com.internsystem.internmanagement.repository.InternRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InternCategoryService {

    @Autowired
    private InternCategoryRepository categoryRepository;

    @Autowired
    private InternRepository internRepository;

    // Get all categories
    public List<InternCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Create a new category
    @Transactional
    public InternCategory createCategory(String categoryName) {
        InternCategory newCategory = new InternCategory();
        newCategory.setCategoryName(categoryName);
        return categoryRepository.save(newCategory);
    }

    // Assign an existing intern as a lead for a category
    @Transactional
    public InternCategory assignLead(Integer categoryId, Long internId) {
        InternCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + categoryId));

        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new EntityNotFoundException("Intern not found with ID: " + internId));

        category.setLeadIntern(intern);
        return categoryRepository.save(category);
    }

    // Assign an intern to a category
    @Transactional
    public Intern assignInternToCategory(Long internId, Integer categoryId) {
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new EntityNotFoundException("Intern not found with ID: " + internId));

        InternCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + categoryId));

        intern.setCategory(category);
        return internRepository.save(intern);
    }
}