package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.dto.InternCategoryDTO;
import com.internsystem.internmanagement.entity.InternCategory;
import com.internsystem.internmanagement.service.InternCategoryService;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class InternCategoryController {

    @Autowired
    private InternCategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<InternCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<?> getCategoryById(@PathVariable Integer categoryId) {
        try {
            InternCategoryDTO categoryDTO = categoryService.getCategoryById(categoryId);
            return ResponseEntity.ok(categoryDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<InternCategory> createCategory(@RequestBody Map<String, String> payload) {
        String categoryName = payload.get("categoryName");
        return ResponseEntity.ok(categoryService.createCategory(categoryName));
    }

    @PutMapping("/{categoryId}/assign-lead/{internId}")
    public ResponseEntity<InternCategory> assignLead(
            @PathVariable Integer categoryId,
            @PathVariable Long internId) {
        return ResponseEntity.ok(categoryService.assignLead(categoryId, internId));
    }

    @PutMapping("/{categoryId}/assign-intern/{internId}")
    public ResponseEntity<Intern> assignInternToCategory(
            @PathVariable Integer categoryId,
            @PathVariable Long internId) {
        return ResponseEntity.ok(categoryService.assignInternToCategory(internId, categoryId));
    }
}