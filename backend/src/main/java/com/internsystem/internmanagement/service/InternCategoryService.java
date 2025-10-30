package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.entity.InternCategory;
import com.internsystem.internmanagement.repository.InternCategoryRepository;
import com.internsystem.internmanagement.repository.InternRepository;
import com.internsystem.internmanagement.dto.InternCategoryDTO;
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

    // Get category by ID and return as DTO
    public InternCategoryDTO getCategoryById(Integer categoryId) {
        InternCategory category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + categoryId));

        return toDto(category);
    }

    // Get all categories
    public List<InternCategoryDTO> getAllCategories() {
    return categoryRepository.findAll()
        .stream()
        .map(this::toDto)
        .collect(java.util.stream.Collectors.toList());
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

    private InternCategoryDTO toDto(InternCategory category) {
        if (category == null) {
            return null;
        }

        InternCategoryDTO dto = new InternCategoryDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());

        if (category.getLeadIntern() != null) {
            dto.setLeadInternId(category.getLeadIntern().getInternId());
        }

        return dto;
    }
}